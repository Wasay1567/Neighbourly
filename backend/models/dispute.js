const { query, transaction } = require('../config/database');

class Dispute {
  // Create dispute
  static async create({ bookingId, raisedBy, againstUserId, category, description, evidence }) {
    return transaction(async (client) => {
      // Verify user is part of the booking
      const bookingResult = await client.query(
        `SELECT seeker_id, provider_id FROM bookings WHERE id = $1`,
        [bookingId]
      );
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingResult.rows[0];
      const isParticipant = booking.seeker_id === raisedBy || booking.provider_id === raisedBy;
      
      if (!isParticipant) {
        throw new Error('Not authorized to create dispute for this booking');
      }
      
      // Check if dispute already exists for this booking
      const existingDispute = await client.query(
        `SELECT id FROM disputes WHERE booking_id = $1 AND status NOT IN ('resolved', 'closed')`,
        [bookingId]
      );
      
      if (existingDispute.rows.length > 0) {
        throw new Error('An active dispute already exists for this booking');
      }
      
      // Create dispute
      const result = await client.query(
        `INSERT INTO disputes 
         (booking_id, raised_by, against_user_id, category, description, evidence, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'open')
         RETURNING *`,
        [bookingId, raisedBy, againstUserId, category, description, 
         evidence ? JSON.stringify(evidence) : null]
      );
      
      return result.rows[0];
    });
  }

  // Get dispute by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        d.*,
        b.booking_reference,
        b.scheduled_start,
        b.scheduled_end,
        sl.title as service_title,
        sl.h3_index as service_h3_index,
        a.neighborhood_id,
        raiser.first_name || ' ' || raiser.last_name as raised_by_name,
        against.first_name || ' ' || against.last_name as against_user_name,
        mod.first_name || ' ' || mod.last_name as moderator_name
       FROM disputes d
       INNER JOIN bookings b ON d.booking_id = b.id
       INNER JOIN service_listings sl ON b.service_id = sl.id
       INNER JOIN addresses a ON sl.address_id = a.id
       INNER JOIN users u1 ON d.raised_by = u1.id
       INNER JOIN user_profiles raiser ON u1.id = raiser.user_id
       INNER JOIN users u2 ON d.against_user_id = u2.id
       INNER JOIN user_profiles against ON u2.id = against.user_id
       LEFT JOIN users u3 ON d.assigned_moderator_id = u3.id
       LEFT JOIN user_profiles mod ON u3.id = mod.user_id
       WHERE d.id = $1`,
      [id]
    );
    
    return result.rows[0];
  }

  // Get disputes by user (as participant)
  static async findByUser(userId, options = {}) {
    const { status, limit = 20, offset = 0 } = options;
    
    let queryText = `
      SELECT 
        d.id, d.category, d.status, d.created_at,
        b.booking_reference,
        sl.title as service_title,
        CASE 
          WHEN d.raised_by = $1 THEN against.first_name || ' ' || against.last_name
          ELSE raiser.first_name || ' ' || raiser.last_name
        END as other_party_name,
        CASE 
          WHEN d.raised_by = $1 THEN 'raised_by_me'
          ELSE 'raised_against_me'
        END as dispute_role
      FROM disputes d
      INNER JOIN bookings b ON d.booking_id = b.id
      INNER JOIN service_listings sl ON b.service_id = sl.id
      INNER JOIN users u1 ON d.raised_by = u1.id
      INNER JOIN user_profiles raiser ON u1.id = raiser.user_id
      INNER JOIN users u2 ON d.against_user_id = u2.id
      INNER JOIN user_profiles against ON u2.id = against.user_id
      WHERE (d.raised_by = $1 OR d.against_user_id = $1)
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (status) {
      queryText += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    queryText += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Get disputes in region (for moderators)
  static async findByRegion(neighborhoodIds, options = {}) {
    const { status, limit = 50, offset = 0 } = options;
    
    let queryText = `
      SELECT 
        d.id, d.category, d.status, d.created_at, d.assigned_moderator_id,
        b.booking_reference,
        sl.title as service_title,
        a.neighborhood_id,
        n.name as neighborhood_name,
        raiser.first_name || ' ' || raiser.last_name as raised_by_name,
        against.first_name || ' ' || against.last_name as against_user_name
      FROM disputes d
      INNER JOIN bookings b ON d.booking_id = b.id
      INNER JOIN service_listings sl ON b.service_id = sl.id
      INNER JOIN addresses a ON sl.address_id = a.id
      INNER JOIN neighborhoods n ON a.neighborhood_id = n.id
      INNER JOIN users u1 ON d.raised_by = u1.id
      INNER JOIN user_profiles raiser ON u1.id = raiser.user_id
      INNER JOIN users u2 ON d.against_user_id = u2.id
      INNER JOIN user_profiles against ON u2.id = against.user_id
      WHERE a.neighborhood_id = ANY($1)
    `;
    
    const params = [neighborhoodIds];
    let paramIndex = 2;
    
    if (status) {
      queryText += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    queryText += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Assign moderator
  static async assignModerator(disputeId, moderatorId) {
    const result = await query(
      `UPDATE disputes 
       SET assigned_moderator_id = $2,
           status = 'under_review',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'open'
       RETURNING *`,
      [disputeId, moderatorId]
    );
    
    return result.rows[0];
  }

  // Resolve dispute
  static async resolve(disputeId, moderatorId, resolution) {
    const result = await query(
      `UPDATE disputes 
       SET status = 'resolved',
           resolution = $3,
           resolved_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND assigned_moderator_id = $2
       RETURNING *`,
      [disputeId, moderatorId, resolution]
    );
    
    return result.rows[0];
  }

  // Close dispute
  static async close(disputeId, moderatorId) {
    const result = await query(
      `UPDATE disputes 
       SET status = 'closed',
           resolved_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND assigned_moderator_id = $2
       RETURNING *`,
      [disputeId, moderatorId]
    );
    
    return result.rows[0];
  }
}

module.exports = Dispute;