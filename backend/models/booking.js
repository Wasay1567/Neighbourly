const { query, transaction } = require('../config/database');
const { AppError } = require('../utils/errors');

class Booking {
  // Create booking
  static async create({ serviceId, seekerId, providerId, scheduledStart, scheduledEnd, totalAmount, specialInstructions }) {
    return transaction(async (client) => {
      // Generate booking reference
      // Generate a booking reference with max 20 chars: 'BK-' (3) + timestamp (10) + '-' (1) + random (6) = 20
      const timestamp = Date.now().toString().slice(-10); // last 10 digits of timestamp
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 chars
      const reference = `BK-${timestamp}-${randomStr}`;
      
      // Check for conflicts
      const conflictCheck = await client.query(
        `SELECT id FROM bookings
         WHERE service_id = $1 
           AND status IN ('pending', 'confirmed', 'in_progress')
           AND (
             (scheduled_start, scheduled_end) OVERLAPS ($2::timestamp, $3::timestamp)
           )`,
        [serviceId, scheduledStart, scheduledEnd]
      );
      
      if (conflictCheck.rows.length > 0) {
        throw new AppError('Time slot not available', 409);
      }
      
      // Create booking
      const result = await client.query(
        `INSERT INTO bookings 
         (service_id, seeker_id, provider_id, booking_reference,
          scheduled_start, scheduled_end, total_amount, special_instructions, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
         RETURNING *`,
        [serviceId, seekerId, providerId, reference, 
         scheduledStart, scheduledEnd, totalAmount, specialInstructions]
      );
      
      return result.rows[0];
    });
  }

  // Find booking by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        b.*,
        sl.title as service_title,
        sp.first_name || ' ' || sp.last_name as provider_name,
        sp.avatar_url as provider_avatar,
        ss.first_name || ' ' || ss.last_name as seeker_name,
        ss.avatar_url as seeker_avatar
       FROM bookings b
       INNER JOIN service_listings sl ON b.service_id = sl.id
       INNER JOIN users pu ON b.provider_id = pu.id
       INNER JOIN user_profiles sp ON pu.id = sp.user_id
       INNER JOIN users su ON b.seeker_id = su.id
       INNER JOIN user_profiles ss ON su.id = ss.user_id
       WHERE b.id = $1`,
      [id]
    );
    
    return result.rows[0];
  }

  // Get user bookings (as seeker or provider)
  static async findByUser(userId, role = 'both', options = {}) {
    const { status, limit = 20, offset = 0 } = options;
    
    let queryText = `
      SELECT 
        b.id, b.booking_reference, b.scheduled_start, b.scheduled_end,
        b.total_amount, b.status, b.created_at,
        sl.title as service_title,
        sl.slug as service_slug,
        CASE 
          WHEN b.seeker_id = $1 THEN sp.first_name || ' ' || sp.last_name
          ELSE ss.first_name || ' ' || ss.last_name
        END as other_party_name,
        CASE 
          WHEN b.seeker_id = $1 THEN sp.avatar_url
          ELSE ss.avatar_url
        END as other_party_avatar,
        CASE 
          WHEN b.seeker_id = $1 THEN 'seeker'
          ELSE 'provider'
        END as user_role
      FROM bookings b
      INNER JOIN service_listings sl ON b.service_id = sl.id
      INNER JOIN users pu ON b.provider_id = pu.id
      INNER JOIN user_profiles sp ON pu.id = sp.user_id
      INNER JOIN users su ON b.seeker_id = su.id
      INNER JOIN user_profiles ss ON su.id = ss.user_id
      WHERE 1=1
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (role === 'seeker') {
      queryText += ` AND b.seeker_id = $1`;
    } else if (role === 'provider') {
      queryText += ` AND b.provider_id = $1`;
    } else {
      queryText += ` AND (b.seeker_id = $1 OR b.provider_id = $1)`;
    }
    
    if (status) {
      queryText += ` AND b.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    queryText += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Update booking status
  static async updateStatus(id, status, userId) {
    const result = await query(
      `UPDATE bookings 
       SET status = $2,
           confirmed_at = CASE WHEN $2 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END,
           completed_at = CASE WHEN $2 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
         AND (seeker_id = $3 OR provider_id = $3)
         AND status != 'completed'
       RETURNING *`,
      [id, status, userId]
    );
    
    return result.rows[0];
  }

  // Cancel booking
  static async cancel(id, userId, reason) {
    const result = await query(
      `UPDATE bookings 
       SET status = 'cancelled',
           cancelled_by = $2,
           cancelled_at = CURRENT_TIMESTAMP,
           cancellation_reason = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 
         AND (seeker_id = $2 OR provider_id = $2)
         AND status IN ('pending', 'confirmed')
       RETURNING *`,
      [id, userId, reason]
    );
    
    return result.rows[0];
  }

  // Get available time slots
  static async getAvailableSlots(serviceId, date) {
    // This is a simplified version - you can expand with actual availability logic
    const result = await query(
      `SELECT 
        sa.day_of_week, sa.start_time, sa.end_time
       FROM service_availability sa
       WHERE sa.service_id = $1 
         AND sa.is_active = true
         AND sa.day_of_week = EXTRACT(DOW FROM $2::date)
       ORDER BY sa.start_time`,
      [serviceId, date]
    );
    
    return result.rows;
  }

  // Check booking conflicts
  static async hasConflict(serviceId, start, end, excludeBookingId = null) {
    let queryText = `
      SELECT COUNT(*) as count
      FROM bookings
      WHERE service_id = $1 
        AND status IN ('pending', 'confirmed', 'in_progress')
        AND (scheduled_start, scheduled_end) OVERLAPS ($2::timestamp, $3::timestamp)
    `;
    
    const params = [serviceId, start, end];
    
    if (excludeBookingId) {
      queryText += ` AND id != $4`;
      params.push(excludeBookingId);
    }
    
    const result = await query(queryText, params);
    return parseInt(result.rows[0].count) > 0;
  }

  // Get upcoming bookings
  static async getUpcoming(userId, limit = 10) {
    const result = await query(
      `SELECT 
        b.id, b.booking_reference, b.scheduled_start, b.scheduled_end,
        b.status, sl.title as service_title,
        CASE 
          WHEN b.seeker_id = $1 THEN 'seeker'
          ELSE 'provider'
        END as role
       FROM bookings b
       INNER JOIN service_listings sl ON b.service_id = sl.id
       WHERE (b.seeker_id = $1 OR b.provider_id = $1)
         AND b.scheduled_start > CURRENT_TIMESTAMP
         AND b.status IN ('pending', 'confirmed')
       ORDER BY b.scheduled_start ASC
       LIMIT $2`,
      [userId, limit]
    );
    
    return result.rows;
  }
}

module.exports = Booking;