const ValidationService = require('../services/validationService');
const ProgressService = require('../services/progressService');
const PerformanceService = require('../services/performanceService');
const ErrorAnalysisService = require('../services/errorAnalysisService');
const QueryHistoryService = require('../services/queryHistoryService');
const SQLSecurityValidator = require('../security/sqlSecurityValidator');
const { Pool } = require('pg');

// Initialize services
const validationService = new ValidationService();
const securityValidator = new SQLSecurityValidator();

// PostgreSQL connection for main database
const mainPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Execution environments
const executionPools = {
  postgresql: new Pool({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'password',
    database: 'sandbox'
  }),
  sqlite: null  // We'll add this later
};

// MySQL to PostgreSQL translation function
function translateMySQLToPostgreSQL(mysqlQuery) {
  console.log(`🔄 Translating MySQL query: ${mysqlQuery}`);
  
  const translatedQuery = mysqlQuery
    // MySQL AUTO_INCREMENT to PostgreSQL SERIAL
    .replace(/AUTO_INCREMENT/gi, 'SERIAL')
    
    // MySQL INT AUTO_INCREMENT to PostgreSQL SERIAL
    .replace(/INT\s+AUTO_INCREMENT/gi, 'SERIAL')
    
    // MySQL TINYINT to PostgreSQL SMALLINT
    .replace(/TINYINT/gi, 'SMALLINT')
    
    // MySQL TEXT to PostgreSQL TEXT (already compatible)
    
    // MySQL DATETIME to PostgreSQL TIMESTAMP
    .replace(/DATETIME/gi, 'TIMESTAMP')
    
    // MySQL backticks to PostgreSQL double quotes (for identifiers)
    .replace(/`([^`]+)`/g, '"$1"')
    
    // MySQL SHOW TABLES equivalent
    .replace(/SHOW\s+TABLES/gi, "SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    
    // MySQL DESCRIBE table equivalent
    .replace(/DESCRIBE\s+(\w+)/gi, "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '$1'")
    
    // MySQL NOW() to PostgreSQL NOW()
    .replace(/NOW\(\)/gi, 'NOW()')
    
    // MySQL CONCAT to PostgreSQL || operator (improved handling)
    .replace(/CONCAT\(([^)]+)\)/gi, (match, args) => {
      // Better parsing that respects quotes and nested parentheses
      const argList = [];
      let current = '';
      let inQuotes = false;
      let quoteChar = '';
      let parenDepth = 0;
      
      for (let i = 0; i < args.length; i++) {
        const char = args[i];
        
        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          quoteChar = char;
          current += char;
        } else if (char === quoteChar && inQuotes) {
          inQuotes = false;
          current += char;
        } else if (char === '(' && !inQuotes) {
          parenDepth++;
          current += char;
        } else if (char === ')' && !inQuotes) {
          parenDepth--;
          current += char;
        } else if (char === ',' && !inQuotes && parenDepth === 0) {
          argList.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      if (current.trim()) argList.push(current.trim());
      
      return argList.join(' || ');
    });
  
  console.log(`🔄 Translated to PostgreSQL: ${translatedQuery}`);
  return translatedQuery;
}

// Test connection on startup (non-blocking)
setTimeout(() => {
  // Test PostgreSQL connection
  executionPools.postgresql.connect()
    .then(client => {
      console.log('✅ Connected to PostgreSQL executor');
      client.release();
    })
    .catch(err => {
      console.error('❌ Failed to connect to PostgreSQL executor:', err.message);
    });
}, 1000);

async function executeSQL(req, res) {
  const { query, dialect = 'postgresql', problemId } = req.body;
  const userIP = req.ip || req.connection.remoteAddress;
  
  const startTime = Date.now();

  if (!query) {
    return res.status(400).json({ 
      success: false,
      error: 'SQL query is required',
      executionTime: '0ms',
      dialect 
    });
  }

  // Enhanced security validation
  const securityResult = securityValidator.validateQuery(query, userIP);
  
  if (!securityResult.isValid) {
    // Log security violation for monitoring
    console.warn(`🚨 Security violation from ${userIP}:`, {
      riskLevel: securityResult.riskLevel,
      violations: securityResult.violations,
      sanitizedQuery: securityValidator.sanitizeForLogging(query),
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      sessionId: req.headers['x-session-id']
    });

    const executionTime = Date.now() - startTime;
    return res.status(400).json({
      success: false,
      error: 'Query validation failed',
      details: securityResult.violations,
      riskLevel: securityResult.riskLevel,
      executionTime: `${executionTime}ms`,
      dialect
    });
  }

  // Log successful validation for monitoring (in production, use proper logging)
  if (securityResult.riskLevel !== 'low') {
    console.info(`⚠️  Query with elevated risk (${securityResult.riskLevel}) from ${userIP}:`, {
      sanitizedQuery: securityValidator.sanitizeForLogging(query),
      violations: securityResult.violations
    });
  }

  try {
    let result;
    const executionTime = Date.now() - startTime;
    
    if (dialect === 'postgresql') {
      // Use execution pool for PostgreSQL
      const pool = executionPools.postgresql;
      result = await pool.query(query);
    } else if (dialect === 'mysql') {
      // Translate MySQL query to PostgreSQL and execute
      const translatedQuery = translateMySQLToPostgreSQL(query);
      const pool = executionPools.postgresql;
      result = await pool.query(translatedQuery);
    } else {
      return res.status(400).json({ 
        error: `${dialect} execution not yet supported` 
      });
    }
    
    const finalExecutionTime = Date.now() - startTime;
    let validation = null;
    
    // Record performance metrics
    const performanceMetrics = {
      sessionId: req.headers['x-session-id'] || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user?.userId || null,
      problemId: problemId || null,
      query: query,
      dialect: dialect,
      executionTime: finalExecutionTime,
      success: true,
      errorMessage: null,
      rowCount: result.rowCount || result.rows?.length || 0,
      planningTime: 0, // PostgreSQL specific - we can extract this later
      actualTime: finalExecutionTime,
      memoryUsage: process.memoryUsage().heapUsed // Approximate
    };
    
    // Record performance and history asynchronously (don't block response)
    setImmediate(async () => {
      try {
        await PerformanceService.recordQueryExecution(performanceMetrics);
      } catch (perfError) {
        console.error('Performance tracking error:', perfError);
      }

      try {
        await QueryHistoryService.saveToHistory({
          userId: performanceMetrics.userId,
          sessionId: performanceMetrics.sessionId,
          problemId: performanceMetrics.problemId,
          problemNumericId: problemId ? parseInt(problemId) : null,
          queryText: query,
          dialect: dialect,
          executionTime: finalExecutionTime,
          wasSuccessful: true,
          rowCount: result.rowCount || result.rows?.length || 0,
          errorMessage: null
        });
      } catch (historyError) {
        console.error('Query history tracking error:', historyError);
      }
    });
    
    // If this is for a specific problem, validate using the new system
    if (problemId) {
      try {
        console.log(`🔍 Validating solution for problem: ${problemId} with dialect: ${dialect}`);
        
        // Convert numeric ID to UUID if needed
        let actualProblemId = problemId;
        const isNumeric = /^\d+$/.test(problemId.toString());
        
        if (isNumeric) {
          const idQuery = `SELECT id FROM problems WHERE numeric_id = $1`;
          const idResult = await mainPool.query(idQuery, [parseInt(problemId)]);
          if (idResult.rows.length > 0) {
            actualProblemId = idResult.rows[0].id;
          }
        }
        
        validation = await validationService.validateSolution(query, actualProblemId, dialect);
        console.log(`✅ Validation result: ${validation.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        console.log(`📝 Message: ${validation.message}`);
          
          // Track progress automatically
          try {
            const sessionId = req.headers['x-session-id'] || 
                             req.query.sessionId || 
                             req.body.sessionId ||
                             'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Initialize session if needed
            await ProgressService.initializeSession(
              sessionId, 
              req.ip, 
              req.get('User-Agent')
            );
            
            // Record the attempt
            await ProgressService.recordAttempt(
              sessionId,
              actualProblemId,
              parseInt(problemId),
              query,
              validation.isCorrect,
              finalExecutionTime,
              null, // no error message for successful executions
              false, // hint used (we'd need to track this separately)
              false  // solution viewed (we'd need to track this separately)
            );
            
            console.log(`📊 Progress tracked for session: ${sessionId}`);
          } catch (progressError) {
            console.error('❌ Progress tracking error:', progressError.message);
            // Don't fail the request if progress tracking fails
          }
          
        } catch (validationError) {
          console.error('❌ Validation error:', validationError.message);
          validation = {
            isCorrect: false,
            message: `Unable to validate solution: ${validationError.message}`
          };
          
          // Track failed attempts too
          try {
            const sessionId = req.headers['x-session-id'] || 
                             req.query.sessionId || 
                             req.body.sessionId ||
                             'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            await ProgressService.initializeSession(sessionId, req.ip, req.get('User-Agent'));
            
            // Convert numeric ID to UUID if needed for progress tracking
            let trackingProblemId = problemId;
            const isNumeric = /^\d+$/.test(problemId.toString());
            if (isNumeric) {
              const idQuery = `SELECT id FROM problems WHERE numeric_id = $1`;
              const idResult = await mainPool.query(idQuery, [parseInt(problemId)]);
              if (idResult.rows.length > 0) {
                trackingProblemId = idResult.rows[0].id;
              }
            }
            
            await ProgressService.recordAttempt(
              sessionId,
              trackingProblemId,
              parseInt(problemId),
              query,
              false, // validation failed
              finalExecutionTime,
              validationError.message,
              false,
              false
            );
          } catch (progressError) {
            console.error('❌ Progress tracking error for failed attempt:', progressError.message);
          }
        }
      }
      
    // Format response (both MySQL and PostgreSQL now return same format since MySQL is translated)
    const columns = result.fields.map(field => field.name);
    const rows = result.rows.map(row => Object.values(row));
    
    return res.json({
      success: true,
      columns,
      rows,
      rowCount: result.rowCount,
      executionTime: `${finalExecutionTime}ms`,
      dialect,
      validation
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Get available schema context for better error messages
    let schemaContext = {};
    try {
      const tablesResult = await executionPools.postgresql.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `);
      schemaContext.availableTables = tablesResult.rows.map(row => row.table_name);
      
      if (schemaContext.availableTables.length > 0) {
        const columnsResult = await executionPools.postgresql.query(`
          SELECT column_name FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = ANY($1)
        `, [schemaContext.availableTables]);
        schemaContext.availableColumns = columnsResult.rows.map(row => row.column_name);
      }
    } catch (schemaError) {
      console.error('Error getting schema context:', schemaError);
    }
    
    // Analyze the error for enhanced messaging
    const errorAnalysis = ErrorAnalysisService.analyzeError(error.message, query, schemaContext);
    
    // Record failed query performance metrics
    const failedMetrics = {
      sessionId: req.headers['x-session-id'] || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user?.userId || null,
      problemId: problemId || null,
      query: query,
      dialect: dialect,
      executionTime: executionTime,
      success: false,
      errorMessage: error.message,
      rowCount: 0,
      planningTime: 0,
      actualTime: executionTime,
      memoryUsage: process.memoryUsage().heapUsed
    };
    
    // Record failed performance and history asynchronously
    setImmediate(async () => {
      try {
        await PerformanceService.recordQueryExecution(failedMetrics);
      } catch (perfError) {
        console.error('Failed query performance tracking error:', perfError);
      }

      try {
        await QueryHistoryService.saveToHistory({
          userId: failedMetrics.userId,
          sessionId: failedMetrics.sessionId,
          problemId: failedMetrics.problemId,
          problemNumericId: problemId ? parseInt(problemId) : null,
          queryText: query,
          dialect: dialect,
          executionTime: executionTime,
          wasSuccessful: false,
          rowCount: 0,
          errorMessage: error.message
        });
      } catch (historyError) {
        console.error('Failed query history tracking error:', historyError);
      }
    });
    
    return res.status(400).json({
      success: false,
      error: errorAnalysis.enhancedMessage,
      originalError: error.message,
      errorAnalysis: {
        type: errorAnalysis.errorType,
        severity: errorAnalysis.severity,
        suggestions: errorAnalysis.suggestions,
        examples: errorAnalysis.examples,
        performanceHints: errorAnalysis.performanceHints,
        quickFixes: errorAnalysis.quickFixes,
        learningSuggestions: ErrorAnalysisService.generateLearningSuggestions(errorAnalysis.errorType)
      },
      executionTime: `${executionTime}ms`,
      dialect
    });
  }
}

async function getProblems(req, res) {
  try {
    const { difficulty, category, company } = req.query;
    
    let query = `
      SELECT p.id, p.numeric_id, p.title, p.slug, p.difficulty, p.is_premium,
             c.name as category, p.total_submissions, p.total_accepted,
             CASE 
               WHEN p.total_submissions > 0 
               THEN ROUND((p.total_accepted::decimal / p.total_submissions) * 100, 1)
               ELSE 0 
             END as acceptance_rate,
             SPLIT_PART(p.title, ' ', 1) as company
      FROM problems p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (difficulty && difficulty !== 'all') {
      query += ` AND p.difficulty = $${paramCount}`;
      queryParams.push(difficulty);
      paramCount++;
    }
    
    if (category && category !== 'all') {
      query += ` AND c.name = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }
    
    if (company && company !== 'all') {
      query += ` AND SPLIT_PART(p.title, ' ', 1) = $${paramCount}`;
      queryParams.push(company);
      paramCount++;
    }
    
    query += ' ORDER BY p.numeric_id ASC';
    
    const result = await mainPool.query(query, queryParams);
    
    res.json({
      problems: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
}

async function getProblem(req, res) {
  try {
    const { id } = req.params;
    
    // Check if id is numeric (numeric_id) or UUID (id)
    const isNumeric = /^\d+$/.test(id);
    
    let problemQuery, schemaQuery, problemParams;
    
    if (isNumeric) {
      // Use numeric_id for lookup
      problemQuery = `
        SELECT p.*, c.name as category_name
        FROM problems p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.numeric_id = $1 AND p.is_active = true
      `;
      problemParams = [parseInt(id)];
    } else {
      // Use UUID for lookup
      problemQuery = `
        SELECT p.*, c.name as category_name
        FROM problems p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1 AND p.is_active = true
      `;
      problemParams = [id];
    }
    
    const problemResult = await mainPool.query(problemQuery, problemParams);
    
    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const problem = problemResult.rows[0];
    
    // Get schema using the actual UUID from the problem
    schemaQuery = `
      SELECT * FROM problem_schemas 
      WHERE problem_id = $1 AND sql_dialect = 'postgresql'
    `;
    
    const schemaResult = await mainPool.query(schemaQuery, [problem.id]);
    
    const schema = schemaResult.rows[0];
    
    res.json({
      problem,
      schema
    });
    
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
}

async function setupProblemEnvironment(req, res) {
  try {
    const { problemId } = req.params;
    
    // Check if problemId is numeric (numeric_id) or UUID (id)
    const isNumeric = /^\d+$/.test(problemId);
    
    let schemaQuery;
    let schemaParams;
    
    if (isNumeric) {
      // Use numeric_id to find the actual UUID
      schemaQuery = `
        SELECT ps.setup_sql, ps.sql_dialect 
        FROM problem_schemas ps
        JOIN problems p ON ps.problem_id = p.id
        WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
      `;
      schemaParams = [parseInt(problemId)];
    } else {
      // Use UUID directly
      schemaQuery = `
        SELECT setup_sql, sql_dialect 
        FROM problem_schemas 
        WHERE problem_id = $1 AND sql_dialect = 'postgresql'
      `;
      schemaParams = [problemId];
    }
    
    const result = await mainPool.query(schemaQuery, schemaParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem schema not found' });
    }
    
    const { setup_sql } = result.rows[0];
    
    // Use validation service for consistent environment setup
    await validationService.setupProblemEnvironment(setup_sql);
    
    res.json({ 
      success: true, 
      message: 'Problem environment set up successfully' 
    });
    
  } catch (error) {
    console.error('Error setting up problem environment:', error);
    res.status(500).json({ error: 'Failed to set up problem environment: ' + error.message });
  }
}

// Set up default environment on startup (non-blocking)
setTimeout(async () => {
  try {
    const defaultSetup = `
      CREATE TABLE customers (
          customer_id INT PRIMARY KEY,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          email VARCHAR(100),
          city VARCHAR(50),
          country VARCHAR(50)
      );
      
      CREATE TABLE orders (
          order_id INT PRIMARY KEY,
          customer_id INT,
          order_date DATE,
          total_amount DECIMAL(10,2)
      );
      
      INSERT INTO customers VALUES 
      (1, 'John', 'Doe', 'john@email.com', 'New York', 'USA'),
      (2, 'Jane', 'Smith', 'jane@email.com', 'London', 'UK'),
      (3, 'Bob', 'Johnson', 'bob@email.com', 'Toronto', 'Canada');
      
      INSERT INTO orders VALUES 
      (101, 1, '2023-01-15', 250.00),
      (102, 2, '2023-01-16', 180.50),
      (103, 1, '2023-01-20', 320.75);
    `;
    
    await validationService.setupProblemEnvironment(defaultSetup);
    console.log('✅ Default practice environment set up');
  } catch (error) {
    console.error('❌ Error setting up default environment:', error);
  }
}, 2000);

async function getCompanies(req, res) {
  try {
    const query = `
      SELECT 
        SPLIT_PART(title, ' ', 1) as company,
        COUNT(*) as problem_count
      FROM problems 
      WHERE is_active = true
      GROUP BY SPLIT_PART(title, ' ', 1)
      ORDER BY company ASC
    `;
    
    const result = await mainPool.query(query);
    
    res.json({
      companies: result.rows.map(row => ({
        name: row.company,
        count: parseInt(row.problem_count),
        display: `${row.company} (${row.problem_count})`
      }))
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
}

module.exports = {
  executeSQL,
  getProblems,
  getProblem,
  setupProblemEnvironment,
  getCompanies,
  validationService
};