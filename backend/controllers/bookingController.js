const Booking = require('../models/booking');
const Service = require('../models/service');
const { AppError } = require('../utils/errors');

// Create booking
exports.createBooking = async (req, res, next) => {
  try {
    const { serviceId, scheduledStart, scheduledEnd, specialInstructions } = req.body;
    
    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    
    // Prevent self-booking
    if (service.provider_id === req.user.id) {
      throw new AppError('Cannot book your own service', 400);
    }
    
    // Calculate total amount (simplified - you can add complex pricing logic)
    const hours = (new Date(scheduledEnd) - new Date(scheduledStart)) / (1000 * 60 * 60);
    const totalAmount = service.price_amount * hours;
    
    // Create booking
    const booking = await Booking.create({
      serviceId,
      seekerId: req.user.id,
      providerId: service.provider_id,
      scheduledStart,
      scheduledEnd,
      totalAmount,
      specialInstructions
    });
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    // Check authorization
    if (booking.seeker_id !== req.user.id && booking.provider_id !== req.user.id) {
      throw new AppError('Not authorized to view this booking', 403);
    }
    
    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get my bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const { role = 'both', status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const bookings = await Booking.findByUser(req.user.id, role, {
      status,
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: bookings.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }
    
    const booking = await Booking.updateStatus(req.params.id, status, req.user.id);
    
    if (!booking) {
      throw new AppError('Booking not found or cannot be updated', 404);
    }
    
    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const booking = await Booking.cancel(req.params.id, req.user.id, reason);
    
    if (!booking) {
      throw new AppError('Booking not found or cannot be cancelled', 404);
    }
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming bookings
exports.getUpcomingBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.getUpcoming(req.user.id, 10);
    
    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    next(error);
  }
};