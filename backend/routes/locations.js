const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Public routes - location data
router.get('/cities', asyncHandler(locationController.getCities));
router.get('/cities/:id', asyncHandler(locationController.getCity));
router.get('/cities/:cityId/neighborhoods', asyncHandler(locationController.getNeighborhoods));
router.get('/neighborhoods/:id', asyncHandler(locationController.getNeighborhood));
router.get('/neighborhoods/find', asyncHandler(locationController.findNeighborhood));

// Public routes - categories
router.get('/categories', asyncHandler(locationController.getCategories));
router.get('/categories/:id', asyncHandler(locationController.getCategory));

// Admin only routes
router.post('/cities', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(locationController.createCity)
);

router.post('/neighborhoods', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(locationController.createNeighborhood)
);

router.post('/categories', 
  authenticate, 
  authorize('admin'), 
  asyncHandler(locationController.createCategory)
);

module.exports = router;