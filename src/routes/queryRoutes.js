// src/routes/queryRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  processQuery, 
  explainQueryHandler, 
  validateQueryHandler,
  getSchemaInfo
} = require('../controllers/queryController');

// Apply authentication middleware to all routes
router.use(authenticate);

// Process a natural language query
router.post('/query', processQuery);

// Explain how a query would be processed
router.post('/explain', explainQueryHandler);

// Validate if a query can be processed
router.post('/validate', validateQueryHandler);

// Get database schema information
router.get('/schema', getSchemaInfo);

module.exports = router;