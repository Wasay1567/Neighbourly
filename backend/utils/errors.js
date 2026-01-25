// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  const logger = require('./logger');
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log error
  logger.error('Error occurred', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.url,
    method: req.method,
    user: req.user?.id
  });
  
  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err.message,
      stack: err.stack,
      details: err
    });
  }
  
  // Production error response
  if (err.isOperational) {
    // Operational error - send to client
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }
  
  // Programming error - don't leak details
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong'
  });
};

module.exports = { AppError, errorHandler };