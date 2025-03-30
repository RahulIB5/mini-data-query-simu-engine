// src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate user tokens
 */
const authenticate = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token. Authentication failed.'
    });
  }
};

module.exports = { authenticate };