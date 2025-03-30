const request = require('supertest');
const app = require('../../server');
const { setupDatabase, clearDatabase } = require('../../src/models/mockDatabase');

describe('Authentication API', () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail when username already exists', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123'
        });
      
      // Try to register the same username again
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // password missing
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'loginuser',
          password: 'password123'
        });
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });

    it('should fail with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });
});