const Transaction = require('../models/transactions');
const Booking = require('../models/booking');
const { AppError } = require('../utils/errors');

// Simulate payment (demo only - no real payment gateway)
exports.createPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod = 'demo_card' } = req.body;
    
    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    
    // Only seeker can pay
    if (booking.seeker_id !== req.user.id) {
      throw new AppError('Only the seeker can make payment for this booking', 403);
    }
    
    // Check booking status
    if (booking.status !== 'pending') {
      throw new AppError('Booking is not in pending status', 400);
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      bookingId,
      payerId: booking.seeker_id,
      payeeId: booking.provider_id,
      amount: booking.total_amount,
      paymentMethod
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Get transaction details
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }
    
    // Check authorization
    if (transaction.payer_id !== req.user.id && transaction.payee_id !== req.user.id) {
      throw new AppError('Not authorized to view this transaction', 403);
    }
    
    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Get my transactions
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const transactions = await Transaction.findByUser(req.user.id, {
      type,
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: transactions.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get earnings summary (providers only)
exports.getEarningsSummary = async (req, res, next) => {
  try {
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      throw new AppError('Only providers can view earnings', 403);
    }
    
    const summary = await Transaction.getEarningsSummary(req.user.id);
    
    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};