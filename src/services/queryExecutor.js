// src/services/queryExecutor.js
const { parseQuery } = require('./queryParser');
const db = require('../models/mockDatabase');

/**
 * Execute a natural language query against the database
 * @param {string} nlQuery - Natural language query
 * @returns {Promise} - Promise that resolves to query results
 */
const executeQuery = async (nlQuery) => {
  try {
    // Parse the natural language query
    const parsedQuery = parseQuery(nlQuery);
    
    // Check if the query was parsed successfully
    if (parsedQuery.error) {
      return {
        success: false,
        error: parsedQuery.error,
        message: 'Unable to understand the query. Please try a different phrasing.'
      };
    }
    
    // Execute the SQL query
    const results = await db.executeQuery(parsedQuery.sql);
    
    // Return the results along with metadata
    return {
      success: true,
      queryType: parsedQuery.queryType,
      data: results,
      metadata: {
        resultCount: results.length,
        query: parsedQuery.sql.replace(/\s+/g, ' ').trim(),
        explanation: parsedQuery.explanation
      }
    };
  } catch (error) {
    console.error('Error executing query:', error);
    return {
      success: false,
      error: 'Database execution error',
      message: error.message
    };
  }
};

/**
 * Generate a simulated analysis of the query results
 * @param {string} nlQuery - Natural language query
 * @returns {Promise} - Promise that resolves to analysis results
 */
const generateAnalysis = async (nlQuery) => {
  try {
    // Execute the query first
    const queryResult = await executeQuery(nlQuery);
    
    // Check if query execution was successful
    if (!queryResult.success) {
      return queryResult;
    }
    
    // Generate analysis based on query type
    const analysis = {
      summary: `Analysis of ${queryResult.data.length} results:`,
      insights: [],
      visualization: null
    };
    
    switch (queryResult.queryType) {
      case 'sales_report':
        // Add insights for sales reports
        if (queryResult.data.length > 0) {
          const totalSales = queryResult.data.reduce((sum, item) => sum + item.total_amount, 0);
          const totalItems = queryResult.data.reduce((sum, item) => sum + item.quantity, 0);
          const avgOrderValue = totalSales / queryResult.data.length;
          
          analysis.insights = [
            `Total sales: $${totalSales.toFixed(2)}`,
            `Total items sold: ${totalItems}`,
            `Average order value: $${avgOrderValue.toFixed(2)}`,
            `Most recent sale: ${queryResult.data[0].sale_date}`
          ];
          
          analysis.visualization = {
            type: 'bar',
            title: 'Sales by Product',
            labels: queryResult.data.map(item => item.product_name),
            data: queryResult.data.map(item => item.total_amount)
          };
        }
        break;
        
      case 'inventory_check':
        // Add insights for inventory checks
        if (queryResult.data.length > 0) {
          const totalItems = queryResult.data.reduce((sum, item) => sum + item.inventory, 0);
          const lowStock = queryResult.data.filter(item => item.inventory < 10);
          
          analysis.insights = [
            `Total inventory: ${totalItems} items`,
            `Categories represented: ${new Set(queryResult.data.map(item => item.category)).size}`,
            `Low stock items (< 10): ${lowStock.length}`,
            `Average price: $${(queryResult.data.reduce((sum, item) => sum + item.price, 0) / queryResult.data.length).toFixed(2)}`
          ];
          
          analysis.visualization = {
            type: 'pie',
            title: 'Inventory by Category',
            labels: Array.from(new Set(queryResult.data.map(item => item.category))),
            data: Array.from(new Set(queryResult.data.map(item => item.category))).map(category => {
              return queryResult.data
                .filter(item => item.category === category)
                .reduce((sum, item) => sum + item.inventory, 0);
            })
          };
        }
        break;
        
      case 'top_products':
        // Add insights for top products
        if (queryResult.data.length > 0) {
          const totalSold = queryResult.data.reduce((sum, item) => sum + item.total_quantity_sold, 0);
          const totalRevenue = queryResult.data.reduce((sum, item) => sum + item.total_revenue, 0);
          
          analysis.insights = [
            `Top product: ${queryResult.data[0].name}`,
            `Total quantity sold: ${totalSold} items`,
            `Total revenue: $${totalRevenue.toFixed(2)}`,
            `Top product accounts for ${((queryResult.data[0].total_quantity_sold / totalSold) * 100).toFixed(2)}% of sales`
          ];
          
          analysis.visualization = {
            type: 'bar',
            title: 'Top Products by Quantity Sold',
            labels: queryResult.data.map(item => item.name),
            data: queryResult.data.map(item => item.total_quantity_sold)
          };
        }
        break;
        
      case 'revenue_report':
        // Add insights for revenue reports
        if (queryResult.data.length > 0) {
          analysis.insights = [
            `Total revenue: $${queryResult.data[0].total_revenue.toFixed(2)}`,
            `Number of transactions: ${queryResult.data[0].transaction_count}`,
            `Items sold: ${queryResult.data[0].items_sold}`,
            `Average revenue per transaction: $${(queryResult.data[0].total_revenue / queryResult.data[0].transaction_count).toFixed(2)}`
          ];
          
          analysis.visualization = {
            type: 'number',
            title: 'Revenue Overview',
            value: `$${queryResult.data[0].total_revenue.toFixed(2)}`
          };
        }
        break;
        
      case 'customer_list':
        // Add insights for customer lists
        if (queryResult.data.length > 0) {
          // Sort customers by join date
          const sortedCustomers = [...queryResult.data].sort((a, b) => 
            new Date(a.joined_date) - new Date(b.joined_date)
          );
          
          analysis.insights = [
            `Total customers: ${queryResult.data.length}`,
            `Most recent customer: ${sortedCustomers[sortedCustomers.length - 1].name}`,
            `First customer: ${sortedCustomers[0].name}`,
            `Customer acquisition timespan: ${Math.round((new Date(sortedCustomers[sortedCustomers.length - 1].joined_date) - new Date(sortedCustomers[0].joined_date)) / (1000 * 60 * 60 * 24))} days`
          ];
          
          analysis.visualization = {
            type: 'line',
            title: 'Customer Growth',
            labels: ['Initial', 'Current'],
            data: [1, queryResult.data.length]
          };
        }
        break;
        
      default:
        // Default analysis for unspecified query types
        analysis.insights = [
          `Query returned ${queryResult.data.length} results`
        ];
        break;
    }
    
    return {
      ...queryResult,
      analysis
    };
  } catch (error) {
    console.error('Error generating analysis:', error);
    return {
      success: false,
      error: 'Analysis error',
      message: error.message
    };
  }
};

module.exports = {
  executeQuery,
  generateAnalysis
};