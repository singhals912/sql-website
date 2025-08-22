const request = require('supertest');
const app = require('../../src/server');

describe('SQL API Integration Tests', () => {
  describe('POST /api/sql/execute', () => {
    describe('Valid queries', () => {
      test('should execute simple SELECT query', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT 1 as test_column',
            dialect: 'postgresql'
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          columns: ['test_column'],
          rows: [[1]],
          rowCount: 1,
          dialect: 'postgresql'
        });

        expect(response.body).toHaveProperty('executionTime');
        expect(response.body.executionTime).toMatch(/\d+ms/);
      });

      test('should execute query with multiple columns', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT customer_id, first_name FROM customers LIMIT 2',
            dialect: 'postgresql'
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          columns: ['customer_id', 'first_name'],
          rowCount: 2,
          dialect: 'postgresql'
        });

        expect(response.body.rows).toHaveLength(2);
        expect(response.body.rows[0]).toHaveLength(2);
      });

      test('should execute MySQL queries via translation', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT customer_id, first_name FROM customers LIMIT 2',
            dialect: 'mysql'
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          columns: ['customer_id', 'first_name'],
          dialect: 'mysql'
        });
      });

      test('should handle empty result sets', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT * FROM customers WHERE customer_id = -999',
            dialect: 'postgresql'
          })
          .expect(200);

        expect(response.body).toMatchObject({
          success: true,
          rows: [],
          rowCount: 0
        });
      });
    });

    describe('Security validation', () => {
      test('should block DROP statements', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'DROP TABLE customers',
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Query validation failed',
          details: ['Dangerous keyword detected: DROP'],
          riskLevel: 'critical'
        });
      });

      test('should block DELETE statements', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'DELETE FROM customers WHERE customer_id = 1',
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Query validation failed',
          details: ['Dangerous keyword detected: DELETE'],
          riskLevel: 'critical'
        });
      });

      test('should block INSERT statements', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: "INSERT INTO customers VALUES (999, 'Test', 'User')",
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Query validation failed',
          details: ['Dangerous keyword detected: INSERT'],
          riskLevel: 'critical'
        });
      });

      test('should block multiple statements', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT * FROM customers; SELECT * FROM orders;',
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Query validation failed',
          details: ['Multiple statements not allowed'],
          riskLevel: 'high'
        });
      });

      test('should block UNION injection attempts', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT customer_id FROM customers UNION SELECT 1',
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Query validation failed',
          riskLevel: 'high'
        });
      });
    });

    describe('Input validation', () => {
      test('should reject missing query', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed',
          details: ['SQL query is required']
        });
      });

      test('should reject non-string query', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 123,
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed',
          details: ['SQL query must be a string']
        });
      });

      test('should reject queries that are too long', async () => {
        const longQuery = 'SELECT * FROM customers WHERE ' + 'customer_id = 1 AND '.repeat(500) + "first_name = 'test'";
        
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: longQuery,
            dialect: 'postgresql'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed',
          details: ['SQL query too long (maximum 10,000 characters)']
        });
      });

      test('should reject invalid dialect', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT 1',
            dialect: 'oracle'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed',
          details: ['Invalid dialect. Allowed: postgresql, mysql']
        });
      });
    });

    describe('Rate limiting', () => {
      test('should allow requests within rate limit', async () => {
        // Make several requests quickly
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(
            request(app)
              .post('/api/sql/execute')
              .send({
                query: `SELECT ${i} as test_number`,
                dialect: 'postgresql'
              })
          );
        }

        const responses = await Promise.all(promises);
        
        // All requests should succeed
        responses.forEach((response, index) => {
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        });
      });

      test('should include rate limit headers', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT 1',
            dialect: 'postgresql'
          })
          .expect(200);

        expect(response.headers).toHaveProperty('ratelimit-limit');
        expect(response.headers).toHaveProperty('ratelimit-remaining');
        expect(response.headers).toHaveProperty('ratelimit-reset');
      });
    });

    describe('Problem validation', () => {
      test('should handle problemId parameter', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT customer_id FROM customers LIMIT 1',
            dialect: 'postgresql',
            problemId: 1
          })
          .expect(200);

        expect(response.body).toHaveProperty('validation');
        // validation will be null unless there's actual problem data in test DB
      });

      test('should validate problemId format', async () => {
        const response = await request(app)
          .post('/api/sql/execute')
          .send({
            query: 'SELECT 1',
            dialect: 'postgresql',
            problemId: 'invalid-id'
          })
          .expect(400);

        expect(response.body).toMatchObject({
          success: false,
          error: 'Validation failed'
        });
      });
    });
  });

  describe('GET /api/sql/problems', () => {
    test('should return problems list', async () => {
      const response = await request(app)
        .get('/api/sql/problems')
        .expect(200);

      expect(response.body).toHaveProperty('problems');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.problems)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/sql/problems')
        .expect(200);

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });

    test('should handle filtering by difficulty', async () => {
      const response = await request(app)
        .get('/api/sql/problems?difficulty=easy')
        .expect(200);

      expect(response.body).toHaveProperty('problems');
      expect(response.body).toHaveProperty('total');
    });

    test('should reject invalid difficulty', async () => {
      const response = await request(app)
        .get('/api/sql/problems?difficulty=invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed'
      });
    });
  });

  describe('GET /api/sql/problems/:id', () => {
    test('should handle numeric problem IDs', async () => {
      const response = await request(app)
        .get('/api/sql/problems/1')
        .expect((res) => {
          // Should either return 200 with problem data or 404 if problem doesn't exist
          expect([200, 404]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('problem');
        expect(response.body).toHaveProperty('schema');
      }
    });

    test('should reject invalid problem IDs', async () => {
      const response = await request(app)
        .get('/api/sql/problems/invalid-id')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid problem ID'
      });
    });

    test('should include rate limit headers', async () => {
      const response = await request(app)
        .get('/api/sql/problems/1');

      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'OK',
        service: 'sql-practice-backend'
      });

      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });
});