const queryExecutor = require('../../src/services/queryExecutor');
const { setupDatabase, clearDatabase } = require('../../src/models/mockDatabase');

describe('Query Executor Service', () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('executeQuery', () => {
    it('should execute a valid SQL query', async () => {
      const sql = 'SELECT * FROM products LIMIT 5';
      const result = await queryExecutor.executeQuery(sql);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should handle SQL syntax errors', async () => {
      const sql = 'SELECT * FROM nonexistent_table';
      
      await expect(queryExecutor.executeQuery(sql)).rejects.toThrow();
    });
  });

  describe('processQuery', () => {
    it('should process a sales query', async () => {
      const parsedQuery = {
        queryType: 'sales_report',
        parameters: {
          timePeriod: 'last month'
        }
      };
      
      const result = await queryExecutor.processQuery(parsedQuery);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      expect(result.metadata).toHaveProperty('resultCount');
    });

    it('should process an inventory query', async () => {
      const parsedQuery = {
        queryType: 'inventory_check',
        parameters: {
          product: 'laptops'
        }
      };
      
      const result = await queryExecutor.processQuery(parsedQuery);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
    });

    it('should process a revenue query', async () => {
      const parsedQuery = {
        queryType: 'revenue_report',
        parameters: {
          timePeriod: 'March'
        }
      };
      
      const result = await queryExecutor.processQuery(parsedQuery);
      
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('metadata');
      expect(result.data[0]).toHaveProperty('total_revenue');
    });

    it('should reject unknown query types', async () => {
      const parsedQuery = {
        queryType: 'unknown',
        parameters: {}
      };
      
      await expect(queryExecutor.processQuery(parsedQuery)).rejects.toThrow();
    });
  });

  describe('generateInsights', () => {
    it('should generate insights for sales data', () => {
      const data = [
        { product_name: 'Laptop', quantity: 5, total_amount: 6000 },
        { product_name: 'Smartphone', quantity: 10, total_amount: 8000 }
      ];
      
      const queryType = 'sales_report';
      const insights = queryExecutor.generateInsights(data, queryType);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toContain('Total sales');
    });

    it('should generate insights for revenue data', () => {
      const data = [
        { total_revenue: 14000 }
      ];
      
      const queryType = 'revenue_report';
      const insights = queryExecutor.generateInsights(data, queryType);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toContain('Total revenue');
    });

    it('should generate insights for inventory data', () => {
      const data = [
        { name: 'Laptop', inventory: 20 },
        { name: 'Smartphone', inventory: 35 }
      ];
      
      const queryType = 'inventory_check';
      const insights = queryExecutor.generateInsights(data, queryType);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toContain('Total inventory');
    });

    it('should return empty insights for unknown query type', () => {
      const data = [{ test: 'data' }];
      const queryType = 'unknown';
      const insights = queryExecutor.generateInsights(data, queryType);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBe(0);
    });
  });
});