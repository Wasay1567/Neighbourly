const oracledb = require('oracledb');
const logger = require('../utils/logger');

// Oracle Database configuration using environment variables
// Mirroring the structure and best practices from the PostgreSQL implementation
const config = {
  user: process.env.APP_USER || 'app_user',
  password: process.env.APP_USER_PASSWORD || 'app_pass',
  connectString: process.env.ORACLE_DB_CONNECTION_STRING || 'localhost:1521/XEPDB1',
  
  // Connection pool settings
  poolMin: parseInt(process.env.ORACLE_DB_POOL_MIN || '5', 10),
  poolMax: parseInt(process.env.ORACLE_DB_POOL_MAX || '20', 10),
  poolIncrement: 1,
  poolTimeout: 60, // Close idle connections after 60 seconds
  queueTimeout: 60000, // Wait up to 60 seconds for a connection from the pool
};

// Internal reference to the pool
let pool;

/**
 * Initializes and returns the Oracle connection pool.
 * Uses lazy initialization to ensure it's only created when needed.
 */
const getPool = async () => {
  if (!pool) {
    try {
      pool = await oracledb.createPool(config);
      logger.info('Oracle Connection Pool created successfully');
    } catch (err) {
      logger.error('Failed to create Oracle pool', {
        error: err.message,
        stack: err.stack,
      });
      throw err;
    }
  }
  return pool;
};

/**
 * Test database connection
 * Similar to PG testConnection but uses DUAL for Oracle
 */
const testConnection = async () => {
  let connection;
  try {
    const p = await getPool();
    connection = await p.getConnection();
    const result = await connection.execute('SELECT CURRENT_TIMESTAMP FROM DUAL');
    logger.info('Oracle database connection successful', {
      currentTime: result.rows[0][0],
    });
    return true;
  } catch (error) {
    logger.error('Oracle database connection failed', {
      error: error.message,
      stack: error.stack,
    });
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error('Error closing test connection', { error: err.message });
      }
    }
  }
};

/**
 * Query helper with automatic client management.
 * Mirrors the PG helper structure to maintain compatibility with controllers/models.
 * 
 * @param {string} text - The SQL query
 * @param {Array|Object} params - Bind variables for the query
 * @returns {Object} result - Result object containing { rows, rowCount }
 */
const query = async (text, params = []) => {
  let connection;
  const start = Date.now();
  try {
    const p = await getPool();
    connection = await p.getConnection();
    
    // Use OUT_FORMAT_OBJECT to match PG's row result structure (object keys)
    const result = await connection.execute(text, params, { 
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
      autoCommit: true 
    });
    
    const duration = Date.now() - start;
    logger.debug('Executed Oracle query', {
      text: text.substring(0, 100),
      duration,
      rows: result.rows ? result.rows.length : 0,
    });

    // Mirror PG result structure: { rows, rowCount }
    return {
      rows: result.rows || [],
      rowCount: result.rows ? result.rows.length : 0,
    };
  } catch (error) {
    logger.error('Oracle Query execution error', {
      text: text.substring(0, 100),
      error: error.message,
      params: params ? (Array.isArray(params) ? params.length : Object.keys(params).length) : 0,
    });
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error('Error releasing connection', { error: err.message });
      }
    }
  }
};

/**
 * Transaction helper.
 * Manages connection acquisition, commit, and rollback.
 * 
 * @param {Function} callback - Async function that receives a 'client' with a query method
 */
const transaction = async (callback) => {
  let connection;
  try {
    const p = await getPool();
    connection = await p.getConnection();
    
    // Oracle transactions start on the first DML statement.
    // We provide a client-like object to the callback that uses this specific connection.
    const client = {
      query: async (text, params) => {
        const res = await connection.execute(text, params || [], { 
          outFormat: oracledb.OUT_FORMAT_OBJECT, 
          autoCommit: false 
        });
        return {
          rows: res.rows || [],
          rowCount: res.rows ? res.rows.length : 0
        };
      }
    };

    const result = await callback(client);
    await connection.commit();
    return result;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rbErr) {
        logger.error('Error during transaction rollback', { error: rbErr.message });
      }
    }
    logger.error('Oracle transaction rolled back', { error: error.message });
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        logger.error('Error closing connection in transaction', { error: err.message });
      }
    }
  }
};

/**
 * Get pool statistics
 * Maps Oracle pool properties to the expected format
 */
const getPoolStats = () => {
  if (!pool) return { total: 0, idle: 0, waiting: 0 };
  return {
    total: pool.connectionsOpen,
    active: pool.connectionsInUse,
    idle: pool.connectionsOpen - pool.connectionsInUse,
    waiting: pool.poolQueueCount,
  };
};

/**
 * Graceful shutdown
 * Closes the connection pool
 */
const closePool = async () => {
  if (pool) {
    try {
      await pool.close(0);
      logger.info('Oracle database pool closed successfully');
    } catch (error) {
      logger.error('Error closing Oracle pool', { error: error.message });
      throw error;
    }
  }
};

module.exports = {
  query,
  transaction,
  testConnection,
  getPoolStats,
  closePool,
};
