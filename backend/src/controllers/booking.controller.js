import { BookingService } from '../services/booking.service.js'
import { success } from '../utils/response.js'

export const createBooking = async (req, res, next) => {
  try {
    const booking = await BookingService.create({
      seeker_id: req.user.id,
      ...req.body
    })
    success(res, booking, 'Booking requested', 201)
  } catch (err) {
    next(err)
  }
}

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BookingService.getByUser(req.user.id)
    success(res, bookings)
  } catch (err) {
    next(err)
  }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const booking = await BookingService.updateStatus(
      req.params.id,
      status,
      req.user
    )
    success(res, booking, 'Booking status updated')
  } catch (err) {
    next(err)
  }
}
