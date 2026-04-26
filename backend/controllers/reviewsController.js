const Review = require('../models/reviews');
const Booking = require('../models/booking');
const { AppError } = require('../utils/errors');

// Create review (seeker only, after completed booking)
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, title, comment, isAnonymous = false } = req.body;
    
    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    const review = await Review.create({
      bookingId,
      reviewerId: req.user.id,
      revieweeId: booking.provider_id,
      rating,
      title,
      comment,
      isAnonymous
    });
    
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// Get reviews for a service
exports.getServiceReviews = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;
    
    const reviews = await Review.findByService(serviceId, {
      limit: parseInt(limit),
      offset
    });
    
    // Get rating statistics
    const stats = await Review.getRatingStatsByService(serviceId);
    
    res.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: reviews.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Backward-compatible provider route: returns reviews for the services owned by the provider
exports.getProviderReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;
    
    const reviews = await Review.findByProvider(providerId, {
      limit: parseInt(limit),
      offset
    });
    
    const stats = await Review.getRatingStats(providerId);
    
    res.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: reviews.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get review details
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    
    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// Add response to review (provider only)
exports.addResponse = async (req, res, next) => {
  try {
    const { response } = req.body;
    
    if (!response || response.trim().length === 0) {
      throw new AppError('Response text is required', 400);
    }
    
    const review = await Review.addResponse(req.params.id, req.user.id, response);
    
    if (!review) {
      throw new AppError('Review not found or already has a response', 404);
    }
    
    res.json({
      success: true,
      message: 'Response added successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// Flag review
exports.flagReview = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      throw new AppError('Reason for flagging is required', 400);
    }
    
    const review = await Review.flag(req.params.id, reason);
    
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    
    res.json({
      success: true,
      message: 'Review flagged for moderation',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};