import { db } from '../config/db.js'

export const UserModel = {
  create: async ({ full_name, email, password_hash, phone }) => {
    const result = await db.run(
      `INSERT INTO users (full_name, email, password_hash, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, phone || null]
    )
    return { id: result.lastID, full_name, email, phone }
  },

  findByEmail: async (email) => {
    return db.get('SELECT * FROM users WHERE email = ?', [email])
  },

  findById: async (id) => {
    return db.get('SELECT * FROM users WHERE id = ?', [id])
  }
}
