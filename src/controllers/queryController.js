// src/controllers/queryController.js
const { executeQuery, generateAnalysis } = require('../services/queryExecutor');
const { explainQuery, validateQuery } = require('../services/queryParser');

/**
 * Process a natural language query
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid query. Please provide a valid query string.'
      });
    }
    
    // Execute the query
    const result = await executeQuery(query);
    
    // Include analysis if requested
    if (req.query.analyze === 'true') {
      const analysisResult = await generateAnalysis(query);
      return res.json(analysisResult);
    }
    
    return res.json(result);
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

/**
 * Explain how a natural language query would be interpreted
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const explainQueryHandler = async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid query. Please provide a valid query string.'
      });
    }
    
    // Generate explanation
    const explanation = explainQuery(query);
    
    return res.json({
      success: true,
      explanation
    });
  } catch (error) {
    console.error('Error explaining query:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

/**
 * Validate if a query can be processed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateQueryHandler = async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid query. Please provide a valid query string.'
      });
    }
    
    // Validate the query
    const validation = validateQuery(query);
    
    return res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Error validating query:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

/**
 * Get the database schema
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSchemaInfo = async (req, res) => {
  try {
    const db = require('../models/mockDatabase');
    const schemas = await db.getAllSchemas();
    
    return res.json({
      success: true,
      schemas
    });
  } catch (error) {
    console.error('Error getting schema info:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

module.exports = {
  processQuery,
  explainQueryHandler,
  validateQueryHandler,
  getSchemaInfo
};