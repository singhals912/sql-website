const SQLSecurityValidator = require('../../src/security/sqlSecurityValidator');

describe('SQLSecurityValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SQLSecurityValidator();
  });

  describe('validateQuery', () => {
    describe('Allowed queries', () => {
      test('should allow simple SELECT queries', () => {
        const result = validator.validateQuery('SELECT * FROM users');
        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe('low');
        expect(result.violations).toHaveLength(0);
      });

      test('should allow SELECT with WHERE clause', () => {
        const result = validator.validateQuery('SELECT id, name FROM users WHERE age > 18');
        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe('low');
      });

      test('should allow SELECT with JOINs', () => {
        const result = validator.validateQuery(`
          SELECT u.name, p.title 
          FROM users u 
          JOIN posts p ON u.id = p.user_id
        `);
        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe('low');
      });

      test('should allow WITH (CTE) queries', () => {
        const result = validator.validateQuery(`
          WITH active_users AS (
            SELECT * FROM users WHERE active = true
          )
          SELECT * FROM active_users
        `);
        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe('low');
      });

      test('should allow EXPLAIN queries', () => {
        const result = validator.validateQuery('EXPLAIN SELECT * FROM users');
        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe('low');
      });
    });

    describe('Dangerous keywords', () => {
      const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE'];
      
      dangerousKeywords.forEach(keyword => {
        test(`should block queries with ${keyword}`, () => {
          const result = validator.validateQuery(`SELECT * FROM users; ${keyword} TABLE users;`);
          expect(result.isValid).toBe(false);
          expect(result.riskLevel).toBe('critical');
          expect(result.violations).toContain(`Dangerous keyword detected: ${keyword}`);
        });
      });
    });

    describe('SQL injection patterns', () => {
      test('should detect UNION-based injection', () => {
        const result = validator.validateQuery("SELECT * FROM users WHERE id = 1 UNION SELECT password FROM admin");
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
      });

      test('should detect OR-based injection', () => {
        const result = validator.validateQuery("SELECT * FROM users WHERE name = 'admin' OR '1' = '1'");
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
      });

      test('should detect comment-based injection', () => {
        const result = validator.validateQuery("SELECT * FROM users WHERE id = 1 -- AND password = 'secret'");
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
      });

      test('should detect time-based attacks', () => {
        const result = validator.validateQuery("SELECT * FROM users WHERE id = 1 AND SLEEP(5)");
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
      });
    });

    describe('Multiple statements', () => {
      test('should block multiple statements', () => {
        const result = validator.validateQuery('SELECT * FROM users; SELECT * FROM admin;');
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
        expect(result.violations).toContain('Multiple statements not allowed');
      });
    });

    describe('Query structure validation', () => {
      test('should detect unbalanced parentheses', () => {
        const result = validator.validateQuery('SELECT * FROM users WHERE (id = 1');
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('medium');
        expect(result.violations).toContain('Unbalanced parentheses detected');
      });

      test('should detect unbalanced quotes', () => {
        const result = validator.validateQuery("SELECT * FROM users WHERE name = 'admin");
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('medium');
        expect(result.violations).toContain('Unbalanced quotes detected');
      });

      test('should handle escaped quotes correctly', () => {
        const result = validator.validateQuery("SELECT * FROM users WHERE name = 'O''Reilly'");
        expect(result.isValid).toBe(true);
        expect(result.riskLevel).toBe('low');
      });
    });

    describe('Input validation', () => {
      test('should reject null queries', () => {
        const result = validator.validateQuery(null);
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
        expect(result.violations).toContain('Invalid query format');
      });

      test('should reject non-string queries', () => {
        const result = validator.validateQuery(123);
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
        expect(result.violations).toContain('Invalid query format');
      });

      test('should reject queries that are too short', () => {
        const result = validator.validateQuery('SE');
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('medium');
        expect(result.violations).toContain('Query too short');
      });

      test('should reject queries that are too long', () => {
        const longQuery = 'SELECT * FROM users WHERE ' + 'id = 1 AND '.repeat(1000) + 'name = "test"';
        const result = validator.validateQuery(longQuery);
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
        expect(result.violations).toContain('Query too long (max 10,000 characters)');
      });
    });

    describe('Rate limiting', () => {
      test('should allow queries within rate limit', () => {
        const userIP = '192.168.1.1';
        
        // First few queries should pass
        for (let i = 0; i < 5; i++) {
          const result = validator.validateQuery('SELECT 1', userIP);
          expect(result.isValid).toBe(true);
        }
      });

      test('should block queries exceeding rate limit', () => {
        const userIP = '192.168.1.2';
        
        // Exceed rate limit
        for (let i = 0; i < 35; i++) {
          validator.validateQuery('SELECT 1', userIP);
        }
        
        const result = validator.validateQuery('SELECT 1', userIP);
        expect(result.isValid).toBe(false);
        expect(result.riskLevel).toBe('high');
        expect(result.violations).toContain('Rate limit exceeded');
      });
    });
  });

  describe('Helper methods', () => {
    describe('isParenthesesBalanced', () => {
      test('should return true for balanced parentheses', () => {
        expect(validator.isParenthesesBalanced('(SELECT * FROM users)')).toBe(true);
        expect(validator.isParenthesesBalanced('SELECT COUNT(*) FROM (SELECT * FROM users) u')).toBe(true);
      });

      test('should return false for unbalanced parentheses', () => {
        expect(validator.isParenthesesBalanced('(SELECT * FROM users')).toBe(false);
        expect(validator.isParenthesesBalanced('SELECT * FROM users)')).toBe(false);
      });

      test('should handle parentheses in strings correctly', () => {
        expect(validator.isParenthesesBalanced("SELECT '(test)' FROM users")).toBe(true);
        expect(validator.isParenthesesBalanced('SELECT "(test)" FROM users')).toBe(true);
      });
    });

    describe('isQuotesBalanced', () => {
      test('should return true for balanced quotes', () => {
        expect(validator.isQuotesBalanced("SELECT 'hello' FROM users")).toBe(true);
        expect(validator.isQuotesBalanced('SELECT "hello" FROM users')).toBe(true);
        expect(validator.isQuotesBalanced("SELECT 'hello' FROM users")).toBe(true);
      });

      test('should return false for unbalanced quotes', () => {
        expect(validator.isQuotesBalanced("SELECT 'hello FROM users")).toBe(false);
        expect(validator.isQuotesBalanced('SELECT "hello FROM users')).toBe(false);
      });
    });

    describe('sanitizeForLogging', () => {
      test('should sanitize sensitive data', () => {
        const query = "SELECT * FROM users WHERE password = 'secret123' AND id = 456";
        const sanitized = validator.sanitizeForLogging(query);
        
        expect(sanitized).not.toContain('secret123');
        expect(sanitized).not.toContain('456');
        expect(sanitized).toContain('***');
        expect(sanitized).toContain('NUM');
      });

      test('should limit length', () => {
        const longQuery = 'SELECT * FROM '.repeat(100);
        const sanitized = validator.sanitizeForLogging(longQuery);
        
        expect(sanitized.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('getSecurityReport', () => {
    test('should return security configuration', () => {
      const report = validator.getSecurityReport();
      
      expect(report).toHaveProperty('rateLimitEntries');
      expect(report).toHaveProperty('dangerousKeywords');
      expect(report).toHaveProperty('suspiciousPatterns');
      expect(report).toHaveProperty('maxQueriesPerWindow');
      expect(report).toHaveProperty('rateLimitWindow');
      
      expect(typeof report.rateLimitEntries).toBe('number');
      expect(typeof report.dangerousKeywords).toBe('number');
      expect(typeof report.suspiciousPatterns).toBe('number');
    });
  });
});