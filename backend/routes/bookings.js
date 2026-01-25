const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// All booking routes require authentication
router.use(authenticate);

router.post('/', asyncHandler(bookingController.createBooking));
router.get('/', asyncHandler(bookingController.getMyBookings));
router.get('/upcoming', asyncHandler(bookingController.getUpcomingBookings));
router.get('/:id', asyncHandler(bookingController.getBooking));
router.patch('/:id/status', asyncHandler(bookingController.updateBookingStatus));
router.post('/:id/cancel', asyncHandler(bookingController.cancelBooking));

module.exports = router;