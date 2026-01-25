const { query, transaction } = require('../config/database');

class Transaction {
  // Create transaction (simulated payment)
  static async create({ bookingId, payerId, payeeId, amount, paymentMethod = 'demo_payment' }) {
    return transaction(async (client) => {
      // Get booking details
      const bookingResult = await client.query(
        'SELECT * FROM bookings WHERE id = $1',
        [bookingId]
      );
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingResult.rows[0];
      
      // Calculate platform fee (10%)
      const platformFee = (amount * 0.10).toFixed(2);
      const netAmount = (amount - platformFee).toFixed(2);
      
      // Create transaction
      const result = await client.query(
        `INSERT INTO transactions 
         (booking_id, payer_id, payee_id, amount, currency, platform_fee, 
          net_amount, status, payment_method, payment_gateway_ref, 
          payment_gateway_response, processed_at)
         VALUES ($1, $2, $3, $4, 'USD', $5, $6, 'completed', $7, $8, $9, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          bookingId, payerId, payeeId, amount, platformFee, netAmount,
          paymentMethod, `DEMO-${Date.now()}`, 
          JSON.stringify({ status: 'success', method: paymentMethod })
        ]
      );
      
      // Update booking status to confirmed (payment received)
      await client.query(
        `UPDATE bookings 
         SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [bookingId]
      );
      
      return result.rows[0];
    });
  }

  // Get transaction by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        t.*,
        b.booking_reference,
        b.scheduled_start,
        b.scheduled_end,
        sl.title as service_title,
        payer.first_name || ' ' || payer.last_name as payer_name,
        payee.first_name || ' ' || payee.last_name as payee_name
       FROM transactions t
       INNER JOIN bookings b ON t.booking_id = b.id
       INNER JOIN service_listings sl ON b.service_id = sl.id
       INNER JOIN users u1 ON t.payer_id = u1.id
       INNER JOIN user_profiles payer ON u1.id = payer.user_id
       INNER JOIN users u2 ON t.payee_id = u2.id
       INNER JOIN user_profiles payee ON u2.id = payee.user_id
       WHERE t.id = $1`,
      [id]
    );
    
    return result.rows[0];
  }

  // Get user transactions
  static async findByUser(userId, options = {}) {
    const { type = 'all', limit = 20, offset = 0 } = options;
    
    let queryText = `
      SELECT 
        t.id, t.amount, t.platform_fee, t.net_amount, t.status,
        t.created_at, t.processed_at,
        b.booking_reference,
        sl.title as service_title,
        CASE 
          WHEN t.payer_id = $1 THEN 'debit'
          ELSE 'credit'
        END as transaction_type,
        CASE 
          WHEN t.payer_id = $1 THEN payee.first_name || ' ' || payee.last_name
          ELSE payer.first_name || ' ' || payer.last_name
        END as other_party_name
      FROM transactions t
      INNER JOIN bookings b ON t.booking_id = b.id
      INNER JOIN service_listings sl ON b.service_id = sl.id
      INNER JOIN users u1 ON t.payer_id = u1.id
      INNER JOIN user_profiles payer ON u1.id = payer.user_id
      INNER JOIN users u2 ON t.payee_id = u2.id
      INNER JOIN user_profiles payee ON u2.id = payee.user_id
      WHERE 1=1
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (type === 'debit') {
      queryText += ` AND t.payer_id = $1`;
    } else if (type === 'credit') {
      queryText += ` AND t.payee_id = $1`;
    } else {
      queryText += ` AND (t.payer_id = $1 OR t.payee_id = $1)`;
    }
    
    queryText += ` ORDER BY t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Get transaction by booking
  static async findByBooking(bookingId) {
    const result = await query(
      `SELECT * FROM transactions WHERE booking_id = $1 ORDER BY created_at DESC`,
      [bookingId]
    );
    
    return result.rows;
  }

  // Refund transaction
  static async refund(id, reason) {
    const result = await query(
      `UPDATE transactions 
       SET status = 'refunded',
           refunded_at = CURRENT_TIMESTAMP,
           refund_reason = $2
       WHERE id = $1 AND status = 'completed'
       RETURNING *`,
      [id, reason]
    );
    
    return result.rows[0];
  }

  // Get earnings summary
  static async getEarningsSummary(providerId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(net_amount), 0) as total_earnings,
        COALESCE(SUM(platform_fee), 0) as total_fees,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END), 0) as confirmed_earnings,
        COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN net_amount ELSE 0 END), 0) as current_month_earnings
       FROM transactions
       WHERE payee_id = $1`,
      [providerId]
    );
    
    return result.rows[0];
  }
}

module.exports = Transaction;