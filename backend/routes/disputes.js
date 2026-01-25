const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// All dispute routes require authentication
router.use(authenticate);

// Create dispute (seeker or provider)
router.post('/', asyncHandler(disputeController.createDispute));

// Get my disputes
router.get('/my', asyncHandler(disputeController.getMyDisputes));

// Get regional disputes (moderators and admins only)
router.get('/regional', 
  authorize('moderator', 'admin'), 
  asyncHandler(disputeController.getRegionalDisputes)
);

// Assign dispute to self (moderators and admins only)
router.post('/:id/assign', 
  authorize('moderator', 'admin'), 
  asyncHandler(disputeController.assignDispute)
);

// Resolve dispute (moderators and admins only)
router.post('/:id/resolve', 
  authorize('moderator', 'admin'), 
  asyncHandler(disputeController.resolveDispute)
);

// Close dispute (moderators and admins only)
router.post('/:id/close', 
  authorize('moderator', 'admin'), 
  asyncHandler(disputeController.closeDispute)
);

// Get specific dispute
router.get('/:id', asyncHandler(disputeController.getDispute));

module.exports = router;