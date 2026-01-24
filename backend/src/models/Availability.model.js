import { db } from '../config/db.js'

export const AvailabilityModel = {
  create: async ({ service_id, start_time, end_time }) => {
    const result = await db.run(
      `INSERT INTO service_availability (service_id, start_time, end_time)
       VALUES (?, ?, ?)`,
      [service_id, start_time, end_time]
    )
    return { id: result.lastID, service_id, start_time, end_time }
  },

  findByService: async (service_id) => {
    return db.all(
      'SELECT * FROM service_availability WHERE service_id = ? AND is_booked = 0',
      [service_id]
    )
  },

  markBooked: async (availability_id) => {
    await db.run('UPDATE service_availability SET is_booked = 1 WHERE id = ?', [availability_id])
  }
}
