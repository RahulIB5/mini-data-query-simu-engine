// src/middleware/errorHandler.js

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(err.stack);
  
    // Default error status and message
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    // Handle different types of errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: message
      });
    }
  
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Authentication failed.'
      });
    }
  
    // Handle expired JWT
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please log in again.'
      });
    }
  
    // Send error response
    res.status(status).json({
      success: false,
      error: message
    });
  };
  
  module.exports = errorHandler;