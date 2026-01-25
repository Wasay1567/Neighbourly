const Dispute = require('../models/dispute');
const Booking = require('../models/booking');
const { AppError } = require('../utils/errors');

// Create dispute (seeker or provider)
exports.createDispute = async (req, res, next) => {
  try {
    const { bookingId, category, description, evidence } = req.body;
    
    // Get booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    // Determine against whom
    const againstUserId = booking.seeker_id === req.user.id 
      ? booking.provider_id 
      : booking.seeker_id;
    
    const dispute = await Dispute.create({
      bookingId,
      raisedBy: req.user.id,
      againstUserId,
      category,
      description,
      evidence
    });
    
    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

// Get dispute details
exports.getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      throw new AppError('Dispute not found', 404);
    }
    
    // Check authorization
    const canView = 
      dispute.raised_by === req.user.id ||
      dispute.against_user_id === req.user.id ||
      dispute.assigned_moderator_id === req.user.id ||
      req.user.role === 'admin';
    
    if (!canView) {
      throw new AppError('Not authorized to view this dispute', 403);
    }
    
    res.json({
      success: true,
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

// Get my disputes
exports.getMyDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const disputes = await Dispute.findByUser(req.user.id, {
      status,
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: {
        disputes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: disputes.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get regional disputes (moderators only)
exports.getRegionalDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get moderator's assigned neighborhoods (simplified - should come from DB)
    // In real app, store moderator region assignments in a separate table
    const neighborhoodIds = req.query.neighborhoodIds 
      ? req.query.neighborhoodIds.split(',').map(Number)
      : [];
    
    if (neighborhoodIds.length === 0) {
      throw new AppError('No neighborhoods assigned to moderator', 400);
    }
    
    const disputes = await Dispute.findByRegion(neighborhoodIds, {
      status,
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: {
        disputes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: disputes.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Assign dispute to self (moderators)
exports.assignDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.assignModerator(req.params.id, req.user.id);
    
    if (!dispute) {
      throw new AppError('Dispute not found or already assigned', 404);
    }
    
    res.json({
      success: true,
      message: 'Dispute assigned successfully',
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

// Resolve dispute (moderators)
exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    
    if (!resolution) {
      throw new AppError('Resolution text is required', 400);
    }
    
    const dispute = await Dispute.resolve(req.params.id, req.user.id, resolution);
    
    if (!dispute) {
      throw new AppError('Dispute not found or not assigned to you', 404);
    }
    
    res.json({
      success: true,
      message: 'Dispute resolved successfully',
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};

// Close dispute (moderators)
exports.closeDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.close(req.params.id, req.user.id);
    
    if (!dispute) {
      throw new AppError('Dispute not found or not assigned to you', 404);
    }
    
    res.json({
      success: true,
      message: 'Dispute closed successfully',
      data: { dispute }
    });
  } catch (error) {
    next(error);
  }
};