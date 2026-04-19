const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration with best practices
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'neighbourly_db',
  user: process.env.DB_USER || 'neighbourly_user',
  password: process.env.DB_PASSWORD || 'neighbourly_pass_2024',
  
  // Connection pool settings for high concurrency
  max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum pool size
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),  // Minimum pool size
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout after 10 seconds
  maxUses: 7500, // Close connections after 7500 uses (prevents memory leaks)
  
  // Statement timeout (30 seconds)
  statement_timeout: 30000,
  
  // Query timeout (25 seconds)
  query_timeout: 25000,
  
  // SSL configuration: Fixed to prevent crashes in local Docker environments
  // Only enables SSL if NODE_ENV is production AND DB_SSL is explicitly 'true'
  ssl: (process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true') ? {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT,
  } : false,
  
  // Application name for monitoring
  application_name: 'neighbourly_api',
};

// Create connection pool
const pool = new Pool(config);

// Pool error handler
pool.on('error', (err, client) => {
  logger.error('Unexpected database pool error', {
    error: err.message,
    stack: err.stack,
  });
});

// Pool connect event
pool.on('connect', (client) => {
  logger.debug('New database client connected', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });
});

// Pool acquire event
pool.on('acquire', (client) => {
  logger.debug('Client acquired from pool', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });
});

// Pool remove event
pool.on('remove', (client) => {
  logger.debug('Client removed from pool', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    logger.info('Database connection successful', {
      currentTime: result.rows[0].current_time,
      version: result.rows[0].pg_version.split(' ')[1],
    });
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection failed', {
      error: error.message,
      stack: error.stack,
    });
    return false;
  }
};

// Query helper with automatic client management
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Executed query', {
      text: text.substring(0, 100),
      duration,
      rows: result.rowCount,
    });
    
    return result;
  } catch (error) {
    logger.error('Query execution error', {
      text: text.substring(0, 100),
      error: error.message,
      params: params ? params.length : 0,
    });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', {
      error: error.message,
    });
    throw error;
  } finally {
    client.release();
  }
};

// Get pool statistics
const getPoolStats = () => {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database pool closed successfully');
  } catch (error) {
    logger.error('Error closing database pool', {
      error: error.message,
    });
    throw error;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  getPoolStats,
  closePool,
};