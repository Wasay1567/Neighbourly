const { query, transaction } = require('../config/database');

class Review {
  // Create review (only seeker can review after completed booking)
  static async create({ bookingId, reviewerId, revieweeId, rating, title, comment, isAnonymous = false }) {
    return transaction(async (client) => {
      // Verify booking is completed
      const bookingResult = await client.query(
        `SELECT seeker_id, provider_id, status FROM bookings WHERE id = $1`,
        [bookingId]
      );
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingResult.rows[0];
      
      // Only seeker can review the provider
      if (booking.seeker_id !== reviewerId) {
        throw new Error('Only the service seeker can leave a review');
      }
      
      // Booking must be completed
      if (booking.status !== 'completed') {
        throw new Error('Can only review completed bookings');
      }
      
      // Check if review already exists
      const existingReview = await client.query(
        `SELECT id FROM reviews WHERE booking_id = $1`,
        [bookingId]
      );
      
      if (existingReview.rows.length > 0) {
        throw new Error('Review already exists for this booking');
      }
      
      // Create review
      const reviewResult = await client.query(
        `INSERT INTO reviews 
         (booking_id, reviewer_id, reviewee_id, rating, title, comment, is_anonymous)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [bookingId, reviewerId, revieweeId, rating, title, comment, isAnonymous]
      );
      
      // Update user reputation
      await this.updateUserReputation(client, revieweeId);
      
      return reviewResult.rows[0];
    });
  }

  // Update user reputation based on reviews
  static async updateUserReputation(client, userId) {
    // Calculate average rating and total reviews
    const stats = await client.query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews
       FROM reviews
       WHERE reviewee_id = $1`,
      [userId]
    );
    
    const { total_reviews, average_rating, positive_reviews } = stats.rows[0];
    
    // Calculate reliability score (weighted by recency and consistency)
    const reliabilityResult = await client.query(
      `SELECT 
        AVG(rating) as recent_avg,
        STDDEV(rating) as rating_stddev
       FROM (
         SELECT rating 
         FROM reviews 
         WHERE reviewee_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10
       ) recent_reviews`,
      [userId]
    );
    
    const { recent_avg, rating_stddev } = reliabilityResult.rows[0];
    
    // Custom reliability algorithm:
    // - Recent performance (40%)
    // - Overall average (30%)
    // - Consistency (30% - lower stddev is better)
    const recentScore = (recent_avg || average_rating || 0) * 20; // 0-100
    const overallScore = (average_rating || 0) * 20; // 0-100
    const consistencyScore = Math.max(0, 100 - ((rating_stddev || 0) * 30)); // 0-100
    
    const reliabilityScore = (
      (recentScore * 0.4) +
      (overallScore * 0.3) +
      (consistencyScore * 0.3)
    ).toFixed(2);
    
    // Get booking stats
    const bookingStats = await client.query(
      `SELECT 
        COUNT(CASE WHEN provider_id = $1 THEN 1 END) as total_bookings_as_provider,
        COUNT(CASE WHEN provider_id = $1 AND status = 'completed' THEN 1 END) as completed_bookings_as_provider,
        COUNT(CASE WHEN provider_id = $1 AND status = 'cancelled' THEN 1 END) as cancelled_bookings
       FROM bookings
       WHERE provider_id = $1 OR seeker_id = $1`,
      [userId]
    );
    
    const { total_bookings_as_provider, completed_bookings_as_provider, cancelled_bookings } = bookingStats.rows[0];
    
    // Calculate cancellation rate
    const cancellationRate = total_bookings_as_provider > 0 
      ? ((cancelled_bookings / total_bookings_as_provider) * 100).toFixed(2)
      : 0;
    
    // Update user_reputation table
    await client.query(
      `UPDATE user_reputation 
       SET total_reviews = $2,
           average_rating = $3,
           total_bookings_as_provider = $4,
           completed_bookings_as_provider = $5,
           cancellation_rate = $6,
           reliability_score = $7,
           last_active_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId, total_reviews, average_rating, total_bookings_as_provider, 
       completed_bookings_as_provider, cancellationRate, reliabilityScore]
    );
  }

  // Get reviews for a provider
  static async findByProvider(providerId, options = {}) {
    const { limit = 5, offset = 0 } = options;
    
    const result = await query(
      `SELECT 
        r.id, r.rating, r.title, r.comment, r.created_at,
        r.response, r.response_at, r.is_anonymous,
        CASE 
          WHEN r.is_anonymous THEN 'Anonymous User'
          ELSE reviewer.first_name || ' ' || reviewer.last_name
        END as reviewer_name,
        CASE 
          WHEN r.is_anonymous THEN NULL
          ELSE reviewer.avatar_url
        END as reviewer_avatar,
        b.booking_reference,
        sl.title as service_title
       FROM reviews r
       INNER JOIN bookings b ON r.booking_id = b.id
       INNER JOIN service_listings sl ON b.service_id = sl.id
       INNER JOIN users u ON r.reviewer_id = u.id
       INNER JOIN user_profiles reviewer ON u.id = reviewer.user_id
       WHERE r.reviewee_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [providerId, limit, offset]
    );
    
    return result.rows;
  }

  // Get review by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        r.*,
        reviewer.first_name || ' ' || reviewer.last_name as reviewer_name,
        reviewer.avatar_url as reviewer_avatar,
        reviewee.first_name || ' ' || reviewee.last_name as reviewee_name,
        b.booking_reference,
        sl.title as service_title
       FROM reviews r
       INNER JOIN bookings b ON r.booking_id = b.id
       INNER JOIN service_listings sl ON b.service_id = sl.id
       INNER JOIN users u1 ON r.reviewer_id = u1.id
       INNER JOIN user_profiles reviewer ON u1.id = reviewer.user_id
       INNER JOIN users u2 ON r.reviewee_id = u2.id
       INNER JOIN user_profiles reviewee ON u2.id = reviewee.user_id
       WHERE r.id = $1`,
      [id]
    );
    
    return result.rows[0];
  }

  // Add response to review (provider can respond)
  static async addResponse(reviewId, providerId, response) {
    const result = await query(
      `UPDATE reviews 
       SET response = $3,
           response_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND reviewee_id = $2 AND response IS NULL
       RETURNING *`,
      [reviewId, providerId, response]
    );
    
    return result.rows[0];
  }

  // Flag review
  static async flag(reviewId, reason) {
    const result = await query(
      `UPDATE reviews 
       SET is_flagged = true,
           flagged_reason = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [reviewId, reason]
    );
    
    return result.rows[0];
  }

  // Get rating statistics
  static async getRatingStats(providerId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews
       WHERE reviewee_id = $1`,
      [providerId]
    );
    
    return result.rows[0];
  }
}

module.exports = Review;