require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger');
const db = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./utils/errors');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// Request ID middleware
app.use((req, res, next) => {
  req.id = require('uuid').v4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Request timing
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.http('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
    });
  });
  next();
});

// ============================================================================
// HEALTH CHECK ROUTES
// ============================================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as time, version() as version');
    res.status(200).json({
      status: 'ok',
      database: {
        connected: true,
        time: result.rows[0].time,
        version: result.rows[0].version.split(' ')[1],
      },
    });
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      database: {
        connected: false,
        error: error.message,
      },
    });
  }
});

app.get('/health/pool', (req, res) => {
  const stats = db.getPoolStats();
  res.status(200).json({
    status: 'ok',
    pool: stats,
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use(API_PREFIX, routes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

let server;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }

    // Start reputation cron job (runs every hour)
    const reputationCron = require('./services/reputationCron');
    reputationCron.start(60); // Update every 60 minutes
    logger.info('Reputation cron job started');

    // Start listening
    server = app.listen(PORT, HOST, () => {
      logger.info('Server started successfully', {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        apiPrefix: API_PREFIX,
      });
      
      logger.info('Available endpoints:', {
        health: `http://${HOST}:${PORT}/health`,
        api: `http://${HOST}:${PORT}${API_PREFIX}`,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  // Stop reputation cron
  const reputationCron = require('./services/reputationCron');
  reputationCron.stop();
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        await db.closePool();
        logger.info('Database pool closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
      }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    reason,
    promise,
  });
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;