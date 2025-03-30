const queryParser = require('../../src/services/queryParser');

describe('Query Parser Service', () => {
  describe('parseQuery', () => {
    it('should parse a sales query correctly', () => {
      const query = 'Show me sales from last month';
      const result = queryParser.parseQuery(query);
      
      expect(result).toHaveProperty('queryType', 'sales_report');
      expect(result).toHaveProperty('parameters');
      expect(result.parameters).toHaveProperty('timePeriod', 'last month');
    });

    it('should parse an inventory query correctly', () => {
      const query = 'How many laptops do we have in stock?';
      const result = queryParser.parseQuery(query);
      
      expect(result).toHaveProperty('queryType', 'inventory_check');
      expect(result).toHaveProperty('parameters');
      expect(result.parameters).toHaveProperty('product', 'laptops');
    });

    it('should parse a revenue query correctly', () => {
      const query = 'What is our total revenue in March?';
      const result = queryParser.parseQuery(query);
      
      expect(result).toHaveProperty('queryType', 'revenue_report');
      expect(result).toHaveProperty('parameters');
      expect(result.parameters).toHaveProperty('timePeriod', 'March');
    });

    it('should parse a top products query correctly', () => {
      const query = 'What are our top 5 selling products?';
      const result = queryParser.parseQuery(query);
      
      expect(result).toHaveProperty('queryType', 'top_products');
      expect(result).toHaveProperty('parameters');
      expect(result.parameters).toHaveProperty('limit', 5);
    });

    it('should parse a customer query correctly', () => {
      const query = 'Who are our customers in New York?';
      const result = queryParser.parseQuery(query);
      
      expect(result).toHaveProperty('queryType', 'customer_list');
      expect(result).toHaveProperty('parameters');
      expect(result.parameters).toHaveProperty('location', 'New York');
    });

    it('should return unknown for unrecognized queries', () => {
      const query = 'This is not a valid query format';
      const result = queryParser.parseQuery(query);
      
      expect(result).toHaveProperty('queryType', 'unknown');
    });
  });

  describe('generateSqlQuery', () => {
    it('should generate SQL for sales query', () => {
      const parsedQuery = {
        queryType: 'sales_report',
        parameters: {
          timePeriod: 'last month'
        }
      };
      
      const result = queryParser.generateSqlQuery(parsedQuery);
      
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM sales');
      expect(result).toContain('JOIN products');
    });

    it('should generate SQL for inventory query', () => {
      const parsedQuery = {
        queryType: 'inventory_check',
        parameters: {
          product: 'laptops'
        }
      };
      
      const result = queryParser.generateSqlQuery(parsedQuery);
      
      expect(result).toContain('SELECT');
      expect(result).toContain('FROM products');
      expect(result).toContain('WHERE');
      expect(result).toContain('laptops');
    });

    it('should generate SQL for revenue query', () => {
      const parsedQuery = {
        queryType: 'revenue_report',
        parameters: {
          timePeriod: 'March'
        }
      };
      
      const result = queryParser.generateSqlQuery(parsedQuery);
      
      expect(result).toContain('SELECT SUM');
      expect(result).toContain('FROM sales');
      expect(result).toContain('WHERE');
      expect(result).toContain('March');
    });

    it('should return null for unknown query type', () => {
      const parsedQuery = {
        queryType: 'unknown',
        parameters: {}
      };
      
      const result = queryParser.generateSqlQuery(parsedQuery);
      
      expect(result).toBeNull();
    });
  });

  describe('explainQuery', () => {
    it('should provide explanation for sales query', () => {
      const parsedQuery = {
        queryType: 'sales_report',
        parameters: {
          timePeriod: 'last month'
        }
      };
      
      const sql = 'SELECT * FROM sales WHERE date >= date("now", "-1 month")';
      const result = queryParser.explainQuery(parsedQuery, sql);
      
      expect(result).toContain('sales');
      expect(result).toContain('last month');
    });

    it('should provide explanation for inventory query', () => {
      const parsedQuery = {
        queryType: 'inventory_check',
        parameters: {
          product: 'laptops'
        }
      };
      
      const sql = 'SELECT * FROM products WHERE name LIKE "%laptop%"';
      const result = queryParser.explainQuery(parsedQuery, sql);
      
      expect(result).toContain('inventory');
      expect(result).toContain('laptops');
    });
  });
});