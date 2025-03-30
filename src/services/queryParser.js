// src/services/queryParser.js

/**
 * Convert natural language query to SQL query
 * @param {string} nlQuery - Natural language query
 * @returns {Object} - Object containing SQL query and metadata
 */
const parseQuery = (nlQuery) => {
    // Convert query to lowercase for easier pattern matching
    const query = nlQuery.toLowerCase();
    
    // Define patterns for different types of queries
    const patterns = [
      // Sales queries
      {
        pattern: /sales (in|from) (.*)/i,
        handler: (matches) => {
          const timePeriod = matches[2].trim();
          let whereClause = '';
          
          // Parse time period
          if (timePeriod.includes('last month')) {
            whereClause = "WHERE sale_date >= date('now', '-1 month')";
          } else if (timePeriod.includes('last year')) {
            whereClause = "WHERE sale_date >= date('now', '-1 year')";
          } else if (timePeriod.includes('january') || timePeriod.includes('jan')) {
            whereClause = "WHERE sale_date LIKE '2025-01-%'";
          } else if (timePeriod.includes('february') || timePeriod.includes('feb')) {
            whereClause = "WHERE sale_date LIKE '2025-02-%'";
          } else if (timePeriod.includes('march') || timePeriod.includes('mar')) {
            whereClause = "WHERE sale_date LIKE '2025-03-%'";
          } else {
            whereClause = ''; // Default to all sales
          }
          
          return {
            sql: `
              SELECT 
                p.name as product_name, 
                s.quantity, 
                s.total_amount, 
                s.sale_date 
              FROM sales s
              JOIN products p ON s.product_id = p.id
              ${whereClause}
              ORDER BY s.sale_date DESC
            `,
            queryType: 'sales_report',
            parameters: { timePeriod },
            explanation: `This query retrieves sales information for ${timePeriod}, including product name, quantity sold, total amount, and sale date.`
          };
        }
      },
      // Product inventory queries
      {
        pattern: /(how many|inventory|stock) (of )?(.*) (do we have|available|in stock)/i,
        handler: (matches) => {
          const product = matches[3].trim();
          let whereClause = '';
          
          if (product !== 'products') {
            whereClause = `WHERE name LIKE '%${product}%'`;
          }
          
          return {
            sql: `
              SELECT 
                name, 
                category, 
                inventory,
                price
              FROM products
              ${whereClause}
              ORDER BY inventory DESC
            `,
            queryType: 'inventory_check',
            parameters: { product },
            explanation: `This query checks the current inventory levels for products${product !== 'products' ? ` related to "${product}"` : ''}, including product name, category, and available quantity.`
          };
        }
      },
      // Product inventory queries more flexible
      {
        pattern: /(how many|inventory|stock) (?:of )?(.*)/i,
        handler: (matches) => {
          const product = matches[2].trim();  // Changed to matches[2]
          let whereClause = '';
      
          if (product !== 'products' && product !== '') {  // Added check for empty product
            whereClause = `WHERE name LIKE '%${product}%'`;
          }
      
          return {
            sql: `
              SELECT 
                name, 
                category, 
                inventory,
                price
              FROM products
              ${whereClause}
              ORDER BY inventory DESC
            `,
            queryType: 'inventory_check',
            parameters: { product },
            explanation: `This query checks the current inventory levels for products${product !== 'products' ? ` related to "${product}"` : ''}, including product name, category, and available quantity.`
          };
        }
      },      
      // Top products queries
      {
        pattern: /(what are|show me|list) (the )?top (\d+) (products|selling products)/i,
        handler: (matches) => {
          const limit = parseInt(matches[3]) || 5;
          
          return {
            sql: `
              SELECT 
                p.name, 
                SUM(s.quantity) as total_quantity_sold,
                SUM(s.total_amount) as total_revenue
              FROM sales s
              JOIN products p ON s.product_id = p.id
              GROUP BY s.product_id
              ORDER BY total_quantity_sold DESC
              LIMIT ${limit}
            `,
            queryType: 'top_products',
            parameters: { limit },
            explanation: `This query identifies the top ${limit} selling products based on quantity sold, showing product name, total quantity sold, and total revenue generated.`
          };
        }
      },
      // Revenue queries
      {
        pattern: /(what is|show me|calculate) (the )?(revenue|total revenue|sales) (in|from|for) (.*)/i,
        handler: (matches) => {
          const timePeriod = matches[5].trim();
          let whereClause = '';
          
          // Parse time period
          if (timePeriod.includes('last month')) {
            whereClause = "WHERE sale_date >= date('now', '-1 month')";
          } else if (timePeriod.includes('last year')) {
            whereClause = "WHERE sale_date >= date('now', '-1 year')";
          } else if (timePeriod.includes('january') || timePeriod.includes('jan')) {
            whereClause = "WHERE sale_date LIKE '2025-01-%'";
          } else if (timePeriod.includes('february') || timePeriod.includes('feb')) {
            whereClause = "WHERE sale_date LIKE '2025-02-%'";
          } else if (timePeriod.includes('march') || timePeriod.includes('mar')) {
            whereClause = "WHERE sale_date LIKE '2025-03-%'";
          } else {
            whereClause = ''; // Default to all sales
          }
          
          return {
            sql: `
              SELECT 
                SUM(total_amount) as total_revenue,
                COUNT(*) as transaction_count,
                SUM(quantity) as items_sold
              FROM sales
              ${whereClause}
            `,
            queryType: 'revenue_report',
            parameters: { timePeriod },
            explanation: `This query calculates the total revenue for ${timePeriod}, along with the number of transactions and total items sold.`
          };
        }
      },
      // Customer queries
      {
        pattern: /(who are|show me|list) (the )?(customers|clients) (from|in) (.*)/i,
        handler: (matches) => {
          const location = matches[5].trim();
          
          return {
            sql: `
              SELECT 
                name, 
                email, 
                location, 
                joined_date
              FROM customers
              WHERE location LIKE '%${location}%'
              ORDER BY joined_date DESC
            `,
            queryType: 'customer_list',
            parameters: { location },
            explanation: `This query retrieves a list of customers from ${location}, showing their name, email, location, and when they joined.`
          };
        }
      },
      // Generic fallback
      {
        pattern: /(.*)/i,
        handler: (matches) => {
          return {
            sql: `
              SELECT 
                'Cannot parse query' as message, 
                'Please try a different query' as suggestion
            `,
            queryType: 'unrecognized',
            parameters: {},
            explanation: 'The natural language query could not be interpreted. Please try rephrasing your question.',
            error: 'Unrecognized query pattern'
          };
        }
      }
    ];
    
    // Try to match the query with patterns
    for (const { pattern, handler } of patterns) {
      const matches = query.match(pattern);
      if (matches) {
        return handler(matches);
      }
    }
    
    // Default fallback
    return {
      sql: `SELECT 'Unsupported query' as message`,
      queryType: 'error',
      parameters: {},
      explanation: 'The query could not be processed.',
      error: 'Failed to parse query'
    };
  };
  
  /**
   * Explain how a natural language query would be translated
   * @param {string} nlQuery - Natural language query
   * @returns {Object} - Explanation of the query translation
   */
  const explainQuery = (nlQuery) => {
    const parsedQuery = parseQuery(nlQuery);
    
    return {
      originalQuery: nlQuery,
      interpretedAs: parsedQuery.queryType,
      parameters: parsedQuery.parameters,
      explanation: parsedQuery.explanation,
      sqlQuery: parsedQuery.sql.replace(/\s+/g, ' ').trim()
    };
  };
  
  /**
   * Validate if a query can be processed
   * @param {string} nlQuery - Natural language query
   * @returns {Object} - Validation result
   */
  const validateQuery = (nlQuery) => {
    const parsedQuery = parseQuery(nlQuery);
    
    const isValid = parsedQuery.queryType !== 'unrecognized' && 
                    parsedQuery.queryType !== 'error';
    
    return {
      valid: isValid,
      queryType: parsedQuery.queryType,
      supportedFeatures: isValid ? Object.keys(parsedQuery.parameters) : [],
      feedback: isValid ? 
        'This query can be processed.' : 
        'This query cannot be processed. Please try a different format or topic.'
    };
  };
  
  module.exports = {
    parseQuery,
    explainQuery,
    validateQuery
  };