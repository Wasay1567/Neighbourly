const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user with profile
  static async create({ email, password, phone, role = 'seeker', firstName, lastName, bio, otp_code, otp_expires_at }) {
    return transaction(async (client) => {
      // Hash password
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 12));
      
      // Insert user with OTP and 'pending' status
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, phone, role, status, otp_code, otp_expires_at)
         VALUES ($1, $2, $3, $4, 'pending_verification', $5, $6)
         RETURNING id, email, phone, role, status, created_at`,
        [email, passwordHash, phone, role, otp_code, otp_expires_at]
      );
      
      const user = userResult.rows[0];
      
      // Insert profile
      await client.query(
        `INSERT INTO user_profiles (user_id, first_name, last_name, bio, display_name)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, firstName, lastName, bio, `${firstName} ${lastName}`]
      );
      
      // Initialize reputation
      await client.query(
        `INSERT INTO user_reputation (user_id) VALUES ($1)`,
        [user.id]
      );
      
      return user;
    });
  }

  // Find user by email with profile
  static async findByEmail(email) {
    const result = await query(
      `SELECT 
        u.id, u.email, u.phone, u.role, u.status, 
        u.password_hash, u.email_verified, u.created_at,
        u.otp_code, u.otp_expires_at, -- Added these two lines
        up.first_name, up.last_name, up.display_name, 
        up.avatar_url, up.bio, up.verification_status,
        ur.average_rating, ur.total_reviews, ur.reliability_score
       FROM users u
       INNER JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_reputation ur ON u.id = ur.user_id
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email]
    );
    
    return result.rows[0];
  }

  static async updateOTP(userId, otp, expiresAt) {
  const sql = `
    UPDATE users 
    SET otp_code = $2, otp_expires_at = $3 
    WHERE id = $1
  `;
  // Use 'query' (which is imported), not 'db.query'
  return await query(sql, [userId, otp, expiresAt]);
}

  static async clearOTPAndVerify(userId) {
  return query(
    `UPDATE users 
     SET otp_code = NULL, 
         otp_expires_at = NULL, 
         email_verified = TRUE, -- Matches your column name 'email_verified'
         status = 'active' 
     WHERE id = $1`,
    [userId]
  );
}

  // Find user by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        u.id, u.email, u.phone, u.role, u.status,
        u.email_verified, u.created_at,
        up.first_name, up.last_name, up.display_name,
        up.avatar_url, up.bio, up.verification_status,
        ur.average_rating, ur.total_reviews, ur.reliability_score
       FROM users u
       INNER JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_reputation ur ON u.id = ur.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id]
    );
    
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update last login
  static async updateLastLogin(userId) {
    await query(
      `UPDATE users 
       SET last_login_at = CURRENT_TIMESTAMP, 
           failed_login_attempts = 0, 
           locked_until = NULL
       WHERE id = $1`,
      [userId]
    );
  }

  // Update user profile
  static async updateProfile(userId, { firstName, lastName, bio, avatarUrl }) {
    const result = await query(
      `UPDATE user_profiles 
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           bio = COALESCE($4, bio),
           avatar_url = COALESCE($5, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [userId, firstName, lastName, bio, avatarUrl]
    );
    
    return result.rows[0];
  }

  // Check if user has permission
  static async hasPermission(userId, permissionName) {
    const result = await query(
      `SELECT EXISTS (
        SELECT 1 FROM users u
        INNER JOIN role_permissions rp ON u.role = rp.role
        INNER JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = $1 AND p.name = $2
        UNION
        SELECT 1 FROM user_permission_overrides upo
        INNER JOIN permissions p ON upo.permission_id = p.id
        WHERE upo.user_id = $1 AND p.name = $2 
          AND upo.is_granted = true
          AND (upo.expires_at IS NULL OR upo.expires_at > CURRENT_TIMESTAMP)
      ) as has_perm`,
      [userId, permissionName]
    );
    
    return result.rows[0].has_perm;
  }
}

module.exports = User;