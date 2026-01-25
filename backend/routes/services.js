const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Public routes
router.get('/nearby', asyncHandler(serviceController.getNearbyServices));
router.get('/search', asyncHandler(serviceController.searchServices));
router.get('/:id', asyncHandler(serviceController.getService));

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/', authorize('provider', 'admin'), asyncHandler(serviceController.createService));
router.get('/my/services', authorize('provider', 'admin'), asyncHandler(serviceController.getMyServices));
router.patch('/:id', authorize('provider', 'admin'), asyncHandler(serviceController.updateService));
router.delete('/:id', authorize('provider', 'admin'), asyncHandler(serviceController.deleteService));

module.exports = router;