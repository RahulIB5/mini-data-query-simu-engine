const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize database
require('./src/config/db');

// Import routes
const queryRoutes = require('./src/routes/queryRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express app
const app = express();

// Set up middleware
app.use(helmet()); // Set security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP request logger
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api', queryRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Mini Data Query Simulation Engine API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server; // For testing purposes