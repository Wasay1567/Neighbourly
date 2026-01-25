const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Public routes
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getMe));
router.patch('/profile', authenticate, asyncHandler(authController.updateProfile));

module.exports = router;