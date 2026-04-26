const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Reputation Update Cron Job
 * Runs periodically to update user reputation scores
 * Based on reviews, bookings, cancellations, and response time
 */
class ReputationCron {
  constructor() {
    this.isRunning = false;
    this.interval = null;
  }

  /**
   * Start the cron job
   * @param {number} intervalMinutes - How often to run (default: 60 minutes)
   */
  start(intervalMinutes = 60) {
    if (this.isRunning) {
      logger.warn('Reputation cron is already running');
      return;
    }

    logger.info('Starting reputation cron job', { intervalMinutes });
    
    // Run immediately on start
    this.updateAllReputations();
    
    // Then run periodically
    this.interval = setInterval(() => {
      this.updateAllReputations();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      logger.info('Reputation cron job stopped');
    }
  }

  /**
   * Update reputation for all active users
   */
  async updateAllReputations() {
    try {
      logger.info('Running reputation update job');
      const startTime = Date.now();

      // Get all users with activity
      const usersResult = await query(
        `SELECT DISTINCT u.id 
         FROM users u
         LEFT JOIN bookings b ON (u.id = b.provider_id OR u.id = b.seeker_id)
         LEFT JOIN reviews r ON u.id = r.reviewee_id
         WHERE u.status = 'active' 
           AND u.deleted_at IS NULL
           AND (b.id IS NOT NULL OR r.id IS NOT NULL)`
      );

      const userIds = usersResult.rows.map(row => row.id);
      logger.info(`Updating reputation for ${userIds.length} users`);

      let successCount = 0;
      let errorCount = 0;

      for (const userId of userIds) {
        try {
          await this.updateUserReputation(userId);
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error('Failed to update reputation for user', { 
            userId, 
            error: error.message 
          });
        }
      }

      const duration = Date.now() - startTime;
      logger.info('Reputation update completed', {
        duration: `${duration}ms`,
        totalUsers: userIds.length,
        success: successCount,
        errors: errorCount
      });

    } catch (error) {
      logger.error('Reputation cron job failed', { 
        error: error.message,
        stack: error.stack 
      });
    }
  }

  /**
   * Update reputation for a single user
   * @param {string} userId
   */
  async updateUserReputation(userId) {
    // Get review statistics
    const reviewStats = await query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
        COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );

    const { total_reviews, average_rating, positive_reviews, negative_reviews } = reviewStats.rows[0];

    // Get recent performance (last 10 reviews)
    const recentPerformance = await query(
      `SELECT 
        AVG(rating) as recent_avg,
        STDDEV(rating) as rating_stddev,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 86400 as days_span
       FROM (
         SELECT rating, created_at 
         FROM reviews 
         WHERE reviewee_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10
       ) recent_reviews`,
      [userId]
    );

    const { recent_avg, rating_stddev, days_span } = recentPerformance.rows[0];

    // Get booking statistics
    const bookingStats = await query(
      `SELECT 
        COUNT(CASE WHEN provider_id = $1 THEN 1 END) as total_bookings_as_provider,
        COUNT(CASE WHEN seeker_id = $1 THEN 1 END) as total_bookings_as_seeker,
        COUNT(CASE WHEN provider_id = $1 AND status = 'completed' THEN 1 END) as completed_bookings_as_provider,
        COUNT(CASE WHEN seeker_id = $1 AND status = 'completed' THEN 1 END) as completed_bookings_as_seeker,
        COUNT(CASE WHEN provider_id = $1 AND status = 'cancelled' THEN 1 END) as cancelled_as_provider,
        COUNT(CASE WHEN seeker_id = $1 AND status = 'cancelled' THEN 1 END) as cancelled_as_seeker,
        AVG(CASE 
          WHEN provider_id = $1 AND confirmed_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (confirmed_at - created_at)) / 60 
        END) as avg_response_time_minutes
       FROM bookings
       WHERE provider_id = $1 OR seeker_id = $1`,
      [userId]
    );

    const {
      total_bookings_as_provider,
      total_bookings_as_seeker,
      completed_bookings_as_provider,
      completed_bookings_as_seeker,
      cancelled_as_provider,
      cancelled_as_seeker,
      avg_response_time_minutes
    } = bookingStats.rows[0];

    // Persist response_time_minutes as INTEGER to match schema.
    const responseTimeMinutesForDb =
      avg_response_time_minutes === null || avg_response_time_minutes === undefined
        ? null
        : Math.round(parseFloat(avg_response_time_minutes));

    // Calculate cancellation rate
    const totalAsProvider = parseInt(total_bookings_as_provider) || 0;
    const cancelledAsProvider = parseInt(cancelled_as_provider) || 0;
    const cancellationRate = totalAsProvider > 0
      ? ((cancelledAsProvider / totalAsProvider) * 100).toFixed(2)
      : 0;

    // Calculate completion rate
    const completionRate = totalAsProvider > 0
      ? ((parseInt(completed_bookings_as_provider) / totalAsProvider) * 100).toFixed(2)
      : 0;

    // ============================================================
    // CUSTOM RELIABILITY ALGORITHM
    // ============================================================
    
    // 1. Review Quality Score (40%)
    const avgRating = parseFloat(average_rating) || 0;
    const reviewQualityScore = avgRating * 20; // 0-100 scale
    
    // 2. Recent Performance Score (25%)
    const recentAvg = parseFloat(recent_avg) || avgRating;
    const recentPerformanceScore = recentAvg * 20; // 0-100 scale
    
    // 3. Consistency Score (15%)
    // Lower standard deviation = more consistent = better
    const stdDev = parseFloat(rating_stddev) || 0;
    const consistencyScore = Math.max(0, 100 - (stdDev * 30));
    
    // 4. Completion Rate Score (10%)
    const completionScore = parseFloat(completionRate) || 0;
    
    // 5. Responsiveness Score (10%)
    // Faster response time = better score
    const responseMinutes = parseFloat(avg_response_time_minutes) || 240; // Default 4 hours
    let responsivenessScore = 100;
    if (responseMinutes > 60) responsivenessScore = 80;
    if (responseMinutes > 240) responsivenessScore = 60;
    if (responseMinutes > 720) responsivenessScore = 40;
    if (responseMinutes > 1440) responsivenessScore = 20;
    
    // 6. Experience Bonus (based on total completed bookings)
    const completedCount = parseInt(completed_bookings_as_provider) || 0;
    let experienceBonus = 0;
    if (completedCount >= 5) experienceBonus = 2;
    if (completedCount >= 10) experienceBonus = 5;
    if (completedCount >= 25) experienceBonus = 8;
    if (completedCount >= 50) experienceBonus = 10;
    
    // 7. Penalty for high cancellation rate
    let cancellationPenalty = 0;
    const cancelRate = parseFloat(cancellationRate);
    if (cancelRate > 10) cancellationPenalty = 5;
    if (cancelRate > 20) cancellationPenalty = 10;
    if (cancelRate > 30) cancellationPenalty = 20;
    
    // Calculate final reliability score
    const reliabilityScore = Math.min(100, Math.max(0,
      (reviewQualityScore * 0.40) +
      (recentPerformanceScore * 0.25) +
      (consistencyScore * 0.15) +
      (completionScore * 0.10) +
      (responsivenessScore * 0.10) +
      experienceBonus -
      cancellationPenalty
    )).toFixed(2);

    // Update user_reputation table
    await query(
      `INSERT INTO user_reputation (
        user_id, total_reviews, average_rating,
        total_bookings_as_provider, total_bookings_as_seeker,
        completed_bookings_as_provider, completed_bookings_as_seeker,
        cancellation_rate, response_time_minutes, reliability_score,
        last_active_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_rating = EXCLUDED.average_rating,
        total_bookings_as_provider = EXCLUDED.total_bookings_as_provider,
        total_bookings_as_seeker = EXCLUDED.total_bookings_as_seeker,
        completed_bookings_as_provider = EXCLUDED.completed_bookings_as_provider,
        completed_bookings_as_seeker = EXCLUDED.completed_bookings_as_seeker,
        cancellation_rate = EXCLUDED.cancellation_rate,
        response_time_minutes = EXCLUDED.response_time_minutes,
        reliability_score = EXCLUDED.reliability_score,
        last_active_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP`,
      [
        userId, total_reviews, average_rating,
        total_bookings_as_provider, total_bookings_as_seeker,
        completed_bookings_as_provider, completed_bookings_as_seeker,
        cancellationRate, responseTimeMinutesForDb, reliabilityScore
      ]
    );

    logger.debug('Updated reputation for user', {
      userId,
      reliabilityScore,
      average_rating,
      total_reviews
    });
  }

  /**
   * Force update for a specific user (can be called manually)
   */
  async forceUpdate(userId) {
    logger.info('Force updating reputation for user', { userId });
    await this.updateUserReputation(userId);
  }
}

// Create singleton instance
const reputationCron = new ReputationCron();

module.exports = reputationCron;