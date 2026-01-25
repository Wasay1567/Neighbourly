const jwt = require('jsonwebtoken');
const User = require('../models/users');
const { AppError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new AppError('User not found', 401);
    }
    
    if (user.status !== 'active') {
      throw new AppError('Account is not active', 403);
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// Check if user has required role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Not authorized to access this resource', 403));
    }
    
    next();
  };
};

// Check if user has specific permission
exports.checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }
      
      const hasPermission = await User.hasPermission(req.user.id, permissionName);
      
      if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};