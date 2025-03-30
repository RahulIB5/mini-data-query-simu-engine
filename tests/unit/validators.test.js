const validators = require('../../src/utils/validators');

describe('Validators', () => {
  describe('validateAuthInput', () => {
    it('should validate valid auth input', () => {
      const input = {
        username: 'testuser',
        password: 'password123'
      };
      
      const result = validators.validateAuthInput(input);
      
      expect(result).toHaveProperty('error', null);
      expect(result).toHaveProperty('value');
      expect(result.value).toEqual(input);
    });

    it('should fail with missing username', () => {
      const input = {
        password: 'password123'
      };
      
      const result = validators.validateAuthInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });

    it('should fail with missing password', () => {
      const input = {
        username: 'testuser'
      };
      
      const result = validators.validateAuthInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });

    it('should fail with empty username', () => {
      const input = {
        username: '',
        password: 'password123'
      };
      
      const result = validators.validateAuthInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });

    it('should fail with short password', () => {
      const input = {
        username: 'testuser',
        password: '123'
      };
      
      const result = validators.validateAuthInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });
  });

  describe('validateQueryInput', () => {
    it('should validate valid query input', () => {
      const input = {
        query: 'Show me sales from last month'
      };
      
      const result = validators.validateQueryInput(input);
      
      expect(result).toHaveProperty('error', null);
      expect(result).toHaveProperty('value');
      expect(result.value).toEqual(input);
    });

    it('should fail with missing query', () => {
      const input = {};
      
      const result = validators.validateQueryInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });

    it('should fail with empty query', () => {
      const input = {
        query: ''
      };
      
      const result = validators.validateQueryInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });

    it('should fail with short query', () => {
      const input = {
        query: 'hi'
      };
      
      const result = validators.validateQueryInput(input);
      
      expect(result).toHaveProperty('error');
      expect(result.error).not.toBeNull();
    });
  });

  describe('validateToken', () => {
    it('should validate a valid JWT token', () => {
      // This is just a mock test since actual token validation would need a real token
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc';
      
      // Mock the JWT verify function
      const originalVerify = validators.verifyToken;
      validators.verifyToken = jest.fn().mockReturnValue({ username: 'testuser' });
      
      const result = validators.validateToken(mockToken);
      
      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('decoded');
      expect(result.decoded).toHaveProperty('username', 'testuser');
      
      // Restore the original function
      validators.verifyToken = originalVerify;
    });

    it('should reject an invalid token', () => {
      const invalidToken = 'invalid.token.string';
      
      const result = validators.validateToken(invalidToken);
      
      expect(result).toHaveProperty('valid', false);
      expect(result).toHaveProperty('message');
    });

    it('should reject a null token', () => {
      const result = validators.validateToken(null);
      
      expect(result).toHaveProperty('valid', false);
      expect(result).toHaveProperty('message');
    });
  });

  describe('sanitizeQuery', () => {
    it('should sanitize a query with SQL injection attempts', () => {
      const dirtyQuery = "Show sales; DROP TABLE users;";
      const cleanQuery = validators.sanitizeQuery(dirtyQuery);
      
      expect(cleanQuery).not.toContain('DROP TABLE');
    });

    it('should sanitize a query with special characters', () => {
      const dirtyQuery = "Show sales WHERE id = '1' OR '1'='1'";
      const cleanQuery = validators.sanitizeQuery(dirtyQuery);
      
      expect(cleanQuery).not.toEqual(dirtyQuery);
    });

    it('should return the same query if already clean', () => {
      const cleanQuery = "Show me sales from last month";
      const result = validators.sanitizeQuery(cleanQuery);
      
      expect(result).toEqual(cleanQuery);
    });
  });
});