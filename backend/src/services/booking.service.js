import { BookingModel } from '../models/Booking.model.js'
import { AvailabilityModel } from '../models/Availability.model.js'
import { ServiceModel } from '../models/Service.model.js'

export const BookingService = {
  create: async ({ service_id, seeker_id, availability_id }) => {
    // Check service exists
    const service = await ServiceModel.findById(service_id)
    if (!service) throw new Error('Service not found')
    if (service.provider_id === seeker_id) throw new Error('Cannot book your own service')

    // Check availability
    const availability = await AvailabilityModel.findByService(service_id)
    const slot = availability.find((a) => a.id === availability_id)
    if (!slot) throw new Error('Selected time slot unavailable')

    // Mark availability booked
    await AvailabilityModel.markBooked(availability_id)

    // Create booking
    return BookingModel.create({ service_id, seeker_id, availability_id })
  },

  getByUser: async (user_id) => {
    return BookingModel.findByUser(user_id)
  },

  updateStatus: async (booking_id, new_status, user) => {
    const booking = await BookingModel.findById(booking_id)
    if (!booking) throw new Error('Booking not found')

    // Only provider or seeker can update certain statuses
    const allowed =
      user.id === booking.seeker_id ||
      user.id === booking.provider_id ||
      user.role_id === 1 // admin role
    if (!allowed) throw new Error('Unauthorized')

    return BookingModel.updateStatus(booking_id, new_status)
  }
}
