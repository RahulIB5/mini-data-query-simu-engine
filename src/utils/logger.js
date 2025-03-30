// src/utils/logger.js

/**
 * Log information messages
 * @param {string} message - Message to log
 * @param {Object} data - Optional data to include
 */
const info = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp}: ${message}`);
    
    if (data) {
      console.log(data);
    }
  };
  
  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  const error = (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp}: ${message}`);
    
    if (error) {
      console.error(error);
    }
  };
  
  /**
   * Log debug messages (only in development)
   * @param {string} message - Debug message
   * @param {Object} data - Optional data to include
   */
  const debug = (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.debug(`[DEBUG] ${timestamp}: ${message}`);
      
      if (data) {
        console.debug(data);
      }
    }
  };
  
  module.exports = {
    info,
    error,
    debug
  };