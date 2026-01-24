import { Router } from 'express'
import {
  createBooking,
  getMyBookings,
  updateBookingStatus
} from '../controllers/booking.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import {
  validateCreateBooking,
  validateBookingStatusUpdate,
  validateBookingId
} from '../validations/booking.validation.js'

const router = Router()

router.post('/', authMiddleware, validateCreateBooking, createBooking)
router.get('/me', authMiddleware, getMyBookings)
router.patch('/:id/status', authMiddleware, validateBookingId, validateBookingStatusUpdate, updateBookingStatus)

export default router
