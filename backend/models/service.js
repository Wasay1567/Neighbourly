const { query, transaction } = require('../config/database');
const h3Service = require('../services/h3Service');
const slugify = require('slugify');
const redis= require('../config/redis');
class Service {
  // Create service with address
  static async create({ 
    providerId, categoryId, title, description, shortDescription,
    priceAmount, priceUnit, serviceRadiusKm, durationMinutes,
    streetAddress, cityId, neighborhoodId, postalCode, latitude, longitude 
  }) {
    return transaction(async (client) => {
      // Generate H3 index
      const h3Index = h3Service.latLngToH3(latitude, longitude);
      
      // Create address
      const addressResult = await client.query(
        `INSERT INTO addresses 
         (user_id, street_address, city_id, neighborhood_id, postal_code, 
          latitude, longitude, h3_index, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
         RETURNING id`,
        [providerId, streetAddress, cityId, neighborhoodId, postalCode, 
         latitude, longitude, h3Index]
      );
      
      const addressId = addressResult.rows[0].id;
      
      // Generate slug
      const slug = slugify(title, { lower: true, strict: true }) + '-' + Date.now();
      
      // Create service
      const serviceResult = await client.query(
        `INSERT INTO service_listings 
         (provider_id, category_id, title, slug, description, short_description,
          price_amount, price_unit, address_id, h3_index, service_radius_km,
          duration_minutes, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', CURRENT_TIMESTAMP)
         RETURNING *`,
        [providerId, categoryId, title, slug, description, shortDescription,
         priceAmount, priceUnit, addressId, h3Index, serviceRadiusKm, durationMinutes]
      );
      
      return serviceResult.rows[0];
    });
  }

  // Find services within radius using H3
  static async findNearby(latitude, longitude, radiusKm = 5, options = {}) {
    const { 
      categoryId, minPrice, maxPrice, minRating, verified,
      sortBy = 'distance', sortOrder = 'ASC',
      limit = 20, offset = 0 
    } = options;
    
    // Get H3 cells within radius
    const h3Cells = h3Service.getCellsWithinRadius(latitude, longitude, radiusKm);
    
    let queryText = `
      SELECT 
        sl.id, sl.title, sl.slug, sl.short_description,
        sl.price_amount, sl.price_unit, sl.service_radius_km,
        sl.booking_count, sl.view_count,
        a.latitude, a.longitude, a.h3_index,
        n.id as neighborhood_id, n.name as neighborhood_name,
        c.name as city_name,
        sc.name as category_name,
        up.first_name || ' ' || up.last_name as provider_name,
        up.avatar_url as provider_avatar,
        up.verification_status as provider_verification,
        ur.average_rating as provider_rating,
        ur.total_reviews as provider_total_reviews,
        ur.reliability_score as provider_reliability,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(a.latitude)) *
            cos(radians(a.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(a.latitude))
          )
        ) AS distance_km
      FROM service_listings sl
      INNER JOIN addresses a ON sl.address_id = a.id
      LEFT JOIN neighborhoods n ON a.neighborhood_id = n.id
      LEFT JOIN cities c ON a.city_id = c.id
      INNER JOIN service_categories sc ON sl.category_id = sc.id
      INNER JOIN users u ON sl.provider_id = u.id
      INNER JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_reputation ur ON u.id = ur.user_id
      WHERE sl.h3_index = ANY($3)
        AND sl.status = 'active'
        AND sl.deleted_at IS NULL
        AND u.status = 'active'
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(a.latitude)) *
            cos(radians(a.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(a.latitude))
          )
        ) <= $4
    `;
    
    const params = [latitude, longitude, h3Cells, radiusKm];
    let paramIndex = 5;
    
    // Add filters
    if (categoryId) {
      queryText += ` AND sl.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    
    if (minPrice !== undefined) {
      queryText += ` AND sl.price_amount >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }
    
    if (maxPrice !== undefined) {
      queryText += ` AND sl.price_amount <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }
    
    if (minRating !== undefined) {
      queryText += ` AND ur.average_rating >= $${paramIndex}`;
      params.push(minRating);
      paramIndex++;
    }
    
    if (verified) {
      queryText += ` AND up.verification_status = 'verified'`;
    }
    
    // Sorting
    const validSortFields = {
      distance: 'distance_km',
      price: 'sl.price_amount',
      rating: 'ur.average_rating',
      popular: 'sl.booking_count',
      recent: 'sl.published_at'
    };
    
    const sortField = validSortFields[sortBy] || 'distance_km';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    queryText += ` ORDER BY ${sortField} ${order}`;
    
    // Add secondary sort for ties
    if (sortBy !== 'distance') {
      queryText += `, distance_km ASC`;
    }
    queryText += `, ur.average_rating DESC NULLS LAST`;
    
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Find service by ID
  static async findById(id) {
    const result = await query(
      `SELECT 
        sl.*,
        a.street_address, a.latitude, a.longitude, a.h3_index,
        c.name as city_name, n.name as neighborhood_name,
        sc.name as category_name,
        up.first_name || ' ' || up.last_name as provider_name,
        up.avatar_url as provider_avatar,
        ur.average_rating as provider_rating,
        ur.total_reviews as provider_reviews
       FROM service_listings sl
       INNER JOIN addresses a ON sl.address_id = a.id
       LEFT JOIN cities c ON a.city_id = c.id
       LEFT JOIN neighborhoods n ON a.neighborhood_id = n.id
       INNER JOIN service_categories sc ON sl.category_id = sc.id
       INNER JOIN users u ON sl.provider_id = u.id
       INNER JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN user_reputation ur ON u.id = ur.user_id
       WHERE sl.id = $1 AND sl.deleted_at IS NULL`,
      [id]
    );
    
    return result.rows[0];
  }

  // Search services by text
  static async search(searchTerm, options = {}) {
    const { categoryId, limit = 20, offset = 0 } = options;
    
    let queryText = `
      SELECT 
        sl.id, sl.title, sl.slug, sl.short_description,
        sl.price_amount, sl.price_unit,
        sc.name as category_name,
        up.first_name || ' ' || up.last_name as provider_name,
        ts_rank(
          to_tsvector('english', sl.title || ' ' || sl.description),
          plainto_tsquery('english', $1)
        ) AS relevance
      FROM service_listings sl
      INNER JOIN service_categories sc ON sl.category_id = sc.id
      INNER JOIN users u ON sl.provider_id = u.id
      INNER JOIN user_profiles up ON u.id = up.user_id
      WHERE to_tsvector('english', sl.title || ' ' || sl.description)
        @@ plainto_tsquery('english', $1)
        AND sl.status = 'active'
        AND sl.deleted_at IS NULL
    `;
    
    const params = [searchTerm];
    
    if (categoryId) {
      queryText += ` AND sl.category_id = $2`;
      params.push(categoryId);
    }
    
    queryText += ` ORDER BY relevance DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Update service
  static async update(id, providerId, updates) {
    const fields = [];
    const params = [id, providerId];
    let paramIndex = 3;
    
    const allowedFields = ['title', 'description', 'short_description', 
                          'price_amount', 'price_unit', 'service_radius_km', 
                          'duration_minutes', 'status'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    
    const result = await query(
      `UPDATE service_listings 
       SET ${fields.join(', ')}
       WHERE id = $1 AND provider_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      params
    );
    
    return result.rows[0];
  }

  // Increment view count
  static async incrementViews(id) {
    await query(
      `UPDATE service_listings 
       SET view_count = view_count + 1 
       WHERE id = $1`,
      [id]
    );
  }

  // Get services by provider
  static async findByProvider(providerId, options = {}) {
    const { status, limit = 20, offset = 0 } = options;
    
    let queryText = `
      SELECT 
        sl.id, sl.title, sl.slug, sl.status,
        sl.price_amount, sl.booking_count, sl.view_count,
        sl.created_at, sl.published_at,
        sc.name as category_name
      FROM service_listings sl
      INNER JOIN service_categories sc ON sl.category_id = sc.id
      WHERE sl.provider_id = $1 AND sl.deleted_at IS NULL
    `;
    
    const params = [providerId];
    
    if (status) {
      queryText += ` AND sl.status = $2`;
      params.push(status);
    }
    
    queryText += ` ORDER BY sl.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await query(queryText, params);
    return result.rows;
  }

  // Delete (soft delete)
  static async delete(id, providerId) {
    const result = await query(
      `UPDATE service_listings 
       SET deleted_at = CURRENT_TIMESTAMP, status = 'archived'
       WHERE id = $1 AND provider_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [id, providerId]
    );
    
    return result.rows[0];
  }
}

module.exports = Service;