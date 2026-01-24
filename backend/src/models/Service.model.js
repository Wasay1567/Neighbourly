import { db } from '../config/db.js'

export const ServiceModel = {
  create: async ({ provider_id, title, description, category, price_per_hour }) => {
    const result = await db.run(
      `INSERT INTO services (provider_id, title, description, category, price_per_hour)
       VALUES (?, ?, ?, ?, ?)`,
      [provider_id, title, description, category, price_per_hour]
    )
    return { id: result.lastID, provider_id, title, description, category, price_per_hour }
  },

  findById: async (id) => {
    return db.get('SELECT * FROM services WHERE id = ?', [id])
  },

  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM services WHERE is_active = 1'
    const params = []

    if (filters.category) {
      query += ' AND category = ?'
      params.push(filters.category)
    }

    if (filters.provider_id) {
      query += ' AND provider_id = ?'
      params.push(filters.provider_id)
    }

    return db.all(query, params)
  },

  deactivate: async (id) => {
    await db.run('UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id])
  }
}
