const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// All transaction routes require authentication
router.use(authenticate);

// Create payment (demo)
router.post('/pay', asyncHandler(transactionController.createPayment));

// Get my transactions
router.get('/', asyncHandler(transactionController.getMyTransactions));

// Get earnings summary (providers only)
router.get('/earnings', 
  authorize('provider', 'admin'), 
  asyncHandler(transactionController.getEarningsSummary)
);

// Get specific transaction
router.get('/:id', asyncHandler(transactionController.getTransaction));

module.exports = router;