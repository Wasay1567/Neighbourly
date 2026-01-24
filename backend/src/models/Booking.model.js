import { db } from '../config/db.js'

export const BookingModel = {
  create: async ({ service_id, seeker_id, availability_id, status = 'requested' }) => {
    const result = await db.run(
      `INSERT INTO bookings (service_id, seeker_id, availability_id, status)
       VALUES (?, ?, ?, ?)`,
      [service_id, seeker_id, availability_id, status]
    )

    return { id: result.lastID, service_id, seeker_id, availability_id, status }
  },

  findById: async (id) => {
    return db.get('SELECT * FROM bookings WHERE id = ?', [id])
  },

  findByUser: async (user_id) => {
    return db.all('SELECT * FROM bookings WHERE seeker_id = ?', [user_id])
  },

  updateStatus: async (id, new_status) => {
    const booking = await BookingModel.findById(id)
    if (!booking) throw new Error('Booking not found')

    await db.run('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      new_status,
      id
    ])

    return { ...booking, status: new_status }
  }
}
