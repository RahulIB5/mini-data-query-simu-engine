// src/utils/validators.js
const Joi = require('joi');

/**
 * Validate query input
 */
const querySchema = Joi.object({
  query: Joi.string().required().min(3).max(500)
});

/**
 * Validate authentication input
 */
const authSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  password: Joi.string().required().min(6).max(30)
});

/**
 * Middleware to validate request body
 * @param {Object} schema - Joi schema to validate against
 * @returns {Function} - Express middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    next();
  };
};

module.exports = {
  validateBody,
  querySchema,
  authSchema
};