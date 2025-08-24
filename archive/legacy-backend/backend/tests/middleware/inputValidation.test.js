const { InputValidator } = require('../../src/middleware/inputValidation');

describe('InputValidator Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateSQLRequest', () => {
    test('should pass validation for valid SQL request', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'postgresql',
        problemId: 1
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('should reject request without query', () => {
      mockReq.body = {
        dialect: 'postgresql'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: ['SQL query is required'],
        executionTime: '0ms'
      });
    });

    test('should reject non-string query', () => {
      mockReq.body = {
        query: 123,
        dialect: 'postgresql'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
          details: ['SQL query must be a string']
        })
      );
    });

    test('should reject query that is too long', () => {
      mockReq.body = {
        query: 'SELECT * FROM users WHERE '.repeat(1000),
        dialect: 'postgresql'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
          details: ['SQL query too long (maximum 10,000 characters)']
        })
      );
    });

    test('should reject query that is too short', () => {
      mockReq.body = {
        query: 'SE',
        dialect: 'postgresql'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
          details: ['SQL query too short (minimum 3 characters)']
        })
      );
    });

    test('should reject invalid dialect', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'oracle'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
          details: ['Invalid dialect. Allowed: postgresql, mysql']
        })
      );
    });

    test('should validate UUID problemId', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'postgresql',
        problemId: '123e4567-e89b-12d3-a456-426614174000'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should validate numeric problemId', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'postgresql',
        problemId: 123
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject invalid problemId format', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'postgresql',
        problemId: 'invalid-id'
      };

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should validate session ID format', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'postgresql'
      };
      mockReq.headers['x-session-id'] = 'session_123_abc';

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    test('should reject invalid session ID format', () => {
      mockReq.body = {
        query: 'SELECT * FROM users',
        dialect: 'postgresql'
      };
      mockReq.headers['x-session-id'] = 'invalid@session#id';

      InputValidator.validateSQLRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateProblemRequest', () => {
    test('should pass validation for valid numeric ID', () => {
      mockReq.params = { id: '123' };

      InputValidator.validateProblemRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should pass validation for valid UUID', () => {
      mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      InputValidator.validateProblemRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should reject missing ID', () => {
      mockReq.params = {};

      InputValidator.validateProblemRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject invalid ID format', () => {
      mockReq.params = { id: 'invalid-id' };

      InputValidator.validateProblemRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject numeric ID out of range', () => {
      mockReq.params = { id: '99999' };

      InputValidator.validateProblemRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateProblemsRequest', () => {
    test('should pass validation for valid query parameters', () => {
      mockReq.query = {
        difficulty: 'easy',
        category: 'Basic Queries',
        company: 'Google',
        limit: '10',
        offset: '0'
      };

      InputValidator.validateProblemsRequest(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should reject invalid difficulty', () => {
      mockReq.query = { difficulty: 'invalid' };

      InputValidator.validateProblemsRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject invalid limit', () => {
      mockReq.query = { limit: '9999' };

      InputValidator.validateProblemsRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('should reject negative offset', () => {
      mockReq.query = { offset: '-1' };

      InputValidator.validateProblemsRequest(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('sanitizeHTML', () => {
    test('should remove script tags', () => {
      const html = '<div>Hello <script>alert("xss")</script> World</div>';
      const sanitized = InputValidator.sanitizeHTML(html);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert("xss")');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });

    test('should remove iframe tags', () => {
      const html = '<div>Content <iframe src="evil.com"></iframe> More</div>';
      const sanitized = InputValidator.sanitizeHTML(html);
      
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).toContain('Content');
      expect(sanitized).toContain('More');
    });

    test('should remove javascript: URLs', () => {
      const html = '<a href="javascript:alert(\'xss\')">Link</a>';
      const sanitized = InputValidator.sanitizeHTML(html);
      
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('Link');
    });

    test('should remove event handlers', () => {
      const html = '<div onclick="alert(\'xss\')">Content</div>';
      const sanitized = InputValidator.sanitizeHTML(html);
      
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('Content');
    });

    test('should handle null input', () => {
      expect(InputValidator.sanitizeHTML(null)).toBeNull();
      expect(InputValidator.sanitizeHTML(undefined)).toBeUndefined();
      expect(InputValidator.sanitizeHTML('')).toBe('');
    });
  });

  describe('securityHeaders', () => {
    test('should set security headers', () => {
      mockRes.setHeader = jest.fn();

      InputValidator.securityHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'none'; object-src 'none';"
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});