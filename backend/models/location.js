const { query } = require('../config/database');

class Location {
  // Get all active cities
  static async getCities() {
    const result = await query(
      `SELECT id, name, state_province, country, country_code, timezone
       FROM cities
       WHERE is_active = true
       ORDER BY name ASC`
    );
    
    return result.rows;
  }

  // Get city by ID
  static async getCityById(id) {
    const result = await query(
      `SELECT * FROM cities WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    return result.rows[0];
  }

  // Get neighborhoods by city
  static async getNeighborhoodsByCity(cityId) {
    const result = await query(
      `SELECT 
        n.id, n.name, n.slug, n.description,
        c.name as city_name
       FROM neighborhoods n
       INNER JOIN cities c ON n.city_id = c.id
       WHERE n.city_id = $1 AND n.is_active = true
       ORDER BY n.name ASC`,
      [cityId]
    );
    
    return result.rows;
  }

  // Get neighborhood by ID
  static async getNeighborhoodById(id) {
    const result = await query(
      `SELECT 
        n.*,
        c.name as city_name,
        c.country
       FROM neighborhoods n
       INNER JOIN cities c ON n.city_id = c.id
       WHERE n.id = $1 AND n.is_active = true`,
      [id]
    );
    
    return result.rows[0];
  }

  // Find neighborhood by coordinates
  static async findNeighborhoodByCoordinates(h3Index) {
    const result = await query(
      `SELECT 
        n.id, n.name, n.slug,
        c.id as city_id, c.name as city_name
       FROM neighborhoods n
       INNER JOIN cities c ON n.city_id = c.id
       WHERE $1 = ANY(n.h3_cells)
         AND n.is_active = true
       LIMIT 1`,
      [h3Index]
    );
    
    return result.rows[0];
  }

  // Create city (admin only)
  static async createCity({ name, stateProvince, country, countryCode, timezone }) {
    const result = await query(
      `INSERT INTO cities (name, state_province, country, country_code, timezone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, stateProvince, country, countryCode, timezone]
    );
    
    return result.rows[0];
  }

  // Create neighborhood (admin only)
  static async createNeighborhood({ cityId, name, description, h3Cells, boundaryGeoJson }) {
    const slugify = require('slugify');
    const slug = slugify(name, { lower: true, strict: true });
    
    const result = await query(
      `INSERT INTO neighborhoods 
       (city_id, name, slug, description, h3_cells, boundary_geojson)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cityId, name, slug, description, h3Cells, boundaryGeoJson ? JSON.stringify(boundaryGeoJson) : null]
    );
    
    return result.rows[0];
  }

  // Get all service categories
  static async getCategories() {
    const result = await query(
      `WITH RECURSIVE category_tree AS (
         -- Base case: top-level categories
         SELECT 
           id, parent_id, name, slug, description, 
           icon_url, sort_order, 0 as level,
           ARRAY[name] as path
         FROM service_categories
         WHERE parent_id IS NULL AND is_active = true
         
         UNION ALL
         
         -- Recursive case: subcategories
         SELECT 
           c.id, c.parent_id, c.name, c.slug, c.description,
           c.icon_url, c.sort_order, ct.level + 1,
           ct.path || c.name
         FROM service_categories c
         INNER JOIN category_tree ct ON c.parent_id = ct.id
         WHERE c.is_active = true
       )
       SELECT * FROM category_tree
       ORDER BY level, sort_order, name`
    );
    
    return result.rows;
  }

  // Get category by ID
  static async getCategoryById(id) {
    const result = await query(
      `SELECT * FROM service_categories WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    return result.rows[0];
  }

  // Get subcategories
  static async getSubcategories(parentId) {
    const result = await query(
      `SELECT id, name, slug, description, icon_url
       FROM service_categories
       WHERE parent_id = $1 AND is_active = true
       ORDER BY sort_order, name`,
      [parentId]
    );
    
    return result.rows;
  }

  // Create category (admin only)
  static async createCategory({ parentId, name, description, iconUrl, sortOrder = 0 }) {
    const slugify = require('slugify');
    const slug = slugify(name, { lower: true, strict: true });
    
    const result = await query(
      `INSERT INTO service_categories 
       (parent_id, name, slug, description, icon_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [parentId, name, slug, description, iconUrl, sortOrder]
    );
    
    return result.rows[0];
  }
}

module.exports = Location;