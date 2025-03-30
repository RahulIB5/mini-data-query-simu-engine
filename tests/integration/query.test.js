const request = require('supertest');
const app = require('../../server');
const { setupDatabase, clearDatabase } = require('../../src/models/mockDatabase');

describe('Query API', () => {
  let authToken;
  
  beforeAll(async () => {
    await setupDatabase();
    
    // Register and login to get auth token
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'queryuser',
        password: 'password123'
      });
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'queryuser',
        password: 'password123'
      });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/query', () => {
    it('should process a valid sales query', async () => {
      const res = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'Show me sales from last month'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('queryType');
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('metadata');
    });

    it('should process a valid inventory query', async () => {
      const res = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'How many laptops do we have in stock?'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('queryType');
      expect(res.body).toHaveProperty('data');
    });

    it('should fail with invalid query', async () => {
      const res = await request(app)
        .post('/api/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'This is not a valid query format'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/query')
        .send({
          query: 'Show me sales from last month'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/explain', () => {
    it('should explain a valid query', async () => {
      const res = await request(app)
        .post('/api/explain')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'What is the revenue in February?'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('explanation');
      expect(res.body.explanation).toHaveProperty('originalQuery');
      expect(res.body.explanation).toHaveProperty('sqlQuery');
    });

    it('should fail with invalid query', async () => {
      const res = await request(app)
        .post('/api/explain')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'This is not a valid query format'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/validate', () => {
    it('should validate a valid query', async () => {
      const res = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'How many laptops do we have in stock?'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('validation');
      expect(res.body.validation).toHaveProperty('valid', true);
    });

    it('should identify an invalid query', async () => {
      const res = await request(app)
        .post('/api/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'What is the meaning of life?'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('validation');
      expect(res.body.validation).toHaveProperty('valid', false);
    });
  });

  describe('GET /api/schema', () => {
    it('should return database schema information', async () => {
      const res = await request(app)
        .get('/api/schema')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('schemas');
      expect(res.body.schemas).toHaveProperty('products');
      expect(res.body.schemas).toHaveProperty('sales');
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/schema');
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});