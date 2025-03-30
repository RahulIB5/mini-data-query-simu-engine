// src/models/mockDatabase.js
const db = require('../config/db');

/**
 * Execute SQL query and return results
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the SQL query
 * @returns {Promise} - Promise that resolves to query results
 */
const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Database error:', err.message);
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

/**
 * Get a single row from the database
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the SQL query
 * @returns {Promise} - Promise that resolves to a single row
 */
const getSingleRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

/**
 * Execute an SQL query that modifies data
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters for the SQL query
 * @returns {Promise} - Promise that resolves to the result of the operation
 */
const executeRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Database error:', err.message);
        reject(err);
        return;
      }
      resolve({
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });
};

/**
 * Get available tables in the database
 * @returns {Promise} - Promise that resolves to a list of tables
 */
const getTables = () => {
  return executeQuery("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
};

/**
 * Get schema information for a specific table
 * @param {string} tableName - Name of the table
 * @returns {Promise} - Promise that resolves to table schema
 */
const getTableSchema = (tableName) => {
  return executeQuery(`PRAGMA table_info(${tableName})`);
};

/**
 * Get schema information for all tables
 * @returns {Promise} - Promise that resolves to a schema map
 */
const getAllSchemas = async () => {
  const tables = await getTables();
  const schemas = {};
  
  for (const table of tables) {
    schemas[table.name] = await getTableSchema(table.name);
  }
  
  return schemas;
};

module.exports = {
  executeQuery,
  getSingleRow,
  executeRun,
  getTables,
  getTableSchema,
  getAllSchemas
};