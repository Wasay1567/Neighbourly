const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const serviceRoutes = require('./services');
const bookingRoutes = require('./bookings');
const transactionRoutes = require('./transactions');
const disputeRoutes = require('./disputes');
const reviewRoutes = require('./reviews');
const locationRoutes = require('./locations');

// Mount routes
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/transactions', transactionRoutes);
router.use('/disputes', disputeRoutes);
router.use('/reviews', reviewRoutes);
router.use('/locations', locationRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Neighbourly API v1 - Stage 2',
    version: '1.0.0',
    stage: 2,
    endpoints: {
      auth: '/api/v1/auth',
      services: '/api/v1/services',
      bookings: '/api/v1/bookings',
      transactions: '/api/v1/transactions',
      disputes: '/api/v1/disputes',
      reviews: '/api/v1/reviews',
      locations: '/api/v1/locations'
    },
    features: {
      geospatial: 'H3 radius-based search',
      auth: 'JWT with RBAC',
      payments: 'Demo payment system',
      disputes: 'Regional moderation',
      reviews: 'Smart reputation algorithm',
      locations: 'Cities, neighborhoods, categories'
    }
  });
});

module.exports = router;