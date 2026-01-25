const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewsController');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Public routes - view reviews
router.get('/provider/:providerId', asyncHandler(reviewController.getProviderReviews));
router.get('/:id', asyncHandler(reviewController.getReview));

// Protected routes
router.use(authenticate);

// Create review (seeker only)
router.post('/', asyncHandler(reviewController.createReview));

// Add response to review (provider only)
router.post('/:id/response', asyncHandler(reviewController.addResponse));

// Flag review
router.post('/:id/flag', asyncHandler(reviewController.flagReview));

module.exports = router;