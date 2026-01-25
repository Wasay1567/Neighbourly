const User = require('../models/users');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { email, password, phone, role, firstName, lastName, bio } = req.body;
    
    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }
    
    // Create user
    const user = await User.create({
      email, password, phone, role, firstName, lastName, bio
    });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Check account status
    if (user.status !== 'active') {
      throw new AppError('Account is not active', 403);
    }
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    // Generate token
    const token = generateToken(user.id);
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, avatarUrl } = req.body;
    
    const updatedProfile = await User.updateProfile(req.user.id, {
      firstName, lastName, bio, avatarUrl
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: updatedProfile }
    });
  } catch (error) {
    next(error);
  }
};