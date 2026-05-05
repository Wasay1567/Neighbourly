const redis = require('../config/redis');
const { logger } = require('./logger');

/**
 * Get data from cache
 * @param {string} key 
 * @returns {Promise<any|null>}
 */
exports.get = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache Get Error: ${error.message}`);
    return null;
  }
};

/**
 * Set data in cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - TTL in seconds
 */
exports.set = async (key, value, ttl = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), {
      EX: ttl
    });
  } catch (error) {
    logger.error(`Cache Set Error: ${error.message}`);
  }
};

/**
 * Delete key from cache
 * @param {string} key 
 */
exports.del = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error(`Cache Del Error: ${error.message}`);
  }
};
//minor change for labtask 12 ss
/**
 * Delete keys by pattern
 * @param {string} pattern 
 */
exports.invalidateByPattern = async (pattern) => {
  try {
    let cursor = 0;
    do {
      const reply = await redis.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = reply.cursor;
      const keys = reply.keys;
      
      if (keys.length > 0) {
        await redis.del(keys);
      }
    } while (cursor !== 0);
  } catch (error) {
    logger.error(`Cache Invalidation Error: ${error.message}`);
  }
};
