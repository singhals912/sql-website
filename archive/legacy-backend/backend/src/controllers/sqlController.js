const { Pool } = require('pg');
const Docker = require('dockerode');

const docker = new Docker();

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
  mysql: null, // MySQL queries will use PostgreSQL pool with translation
  sqlite: null  // We'll add this later
};

// Test connection on startup (non-blocking)
setTimeout(() => {
  executionPools.postgresql.connect()
    .then(client => {
      console.log('✅ Connected to PostgreSQL executor');
      client.release();
    })
    .catch(err => {
      console.error('❌ Failed to connect to PostgreSQL executor:', err.message);
    });

  // MySQL will use PostgreSQL backend with query translation
  console.log('✅ MySQL support enabled via PostgreSQL translation');
}, 1000);

// MySQL to PostgreSQL query translation function
function translateMySQLToPostgreSQL(query) {
  let translatedQuery = query;
  
  // Basic MySQL to PostgreSQL translations
  translatedQuery = translatedQuery
    // MySQL LIMIT syntax
    .replace(/LIMIT\s+(\d+)\s*,\s*(\d+)/gi, 'LIMIT $2 OFFSET $1')
    
    // MySQL AUTO_INCREMENT to PostgreSQL SERIAL
    .replace(/AUTO_INCREMENT/gi, 'SERIAL')
    
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
    
    // MySQL CONCAT to PostgreSQL || operator (basic cases)
    .replace(/CONCAT\(([^)]+)\)/gi, (match, args) => {
      const argList = args.split(',').map(arg => arg.trim());
      return argList.join(' || ');
    });
  
  return translatedQuery;
}

// Helper function to normalize and compare query results
function compareResults(userResult, expectedResult, userColumns = []) {
  console.log('🔍 Comparing results...');
  console.log('👤 User result:', userResult);
  console.log('🎯 Expected result:', expectedResult);
  console.log('📋 User columns:', userColumns);
  
  // Convert both to comparable format
  const normalizeRows = (rows) => {
    return rows.map(row => {
      // Handle both array format and object format
      const values = Array.isArray(row) ? row : Object.values(row);
      return values.map(cell => {
        if (cell === null) return null;
        
        // Handle Date objects by converting to ISO date string (YYYY-MM-DD)
        if (cell instanceof Date) {
          return cell.toISOString().split('T')[0];
        }
        
        // Handle other data types
        return String(cell).trim();
      });
    });
  };

  const userRows = normalizeRows(userResult);
  const expectedRows = normalizeRows(expectedResult);

  console.log('🔧 Normalized user rows:', userRows);
  console.log('🔧 Normalized expected rows:', expectedRows);

  // Check if row counts match
  if (userRows.length !== expectedRows.length) {
    return {
      isCorrect: false,
      message: `Expected ${expectedRows.length} rows, but got ${userRows.length} rows`
    };
  }

  // If no rows, both are empty - that's correct
  if (userRows.length === 0) {
    return {
      isCorrect: true,
      message: 'Correct! Your solution matches the expected output.'
    };
  }

  // Check if column counts match
  if (userRows[0].length !== expectedRows[0].length) {
    return {
      isCorrect: false,
      message: `Expected ${expectedRows[0].length} columns, but got ${userRows[0].length} columns`
    };
  }

  // For SELECT * queries, we need to be flexible about column ordering
  // Try multiple comparison strategies
  
  // Strategy 1: Direct comparison (same order)
  if (arraysEqual(userRows, expectedRows)) {
    return {
      isCorrect: true,
      message: 'Correct! Your solution matches the expected output.'
    };
  }
  
  // Strategy 2: Sort both by all columns and compare
  const sortRows = (rows) => {
    return [...rows].sort((a, b) => {
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          // Handle numeric sorting
          const aNum = Number(a[i]);
          const bNum = Number(b[i]);
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          // String sorting
          return a[i] < b[i] ? -1 : 1;
        }
      }
      return 0;
    });
  };

  const sortedUserRows = sortRows(userRows);
  const sortedExpectedRows = sortRows(expectedRows);
  
  console.log('📊 Sorted user rows:', sortedUserRows);
  console.log('📊 Sorted expected rows:', sortedExpectedRows);

  if (arraysEqual(sortedUserRows, sortedExpectedRows)) {
    return {
      isCorrect: true,
      message: 'Correct! Your solution matches the expected output.'
    };
  }

  // Strategy 3: Check if it's just different column ordering for the same data
  if (userRows.length > 0 && expectedRows.length > 0) {
    // Convert each row to a set of values and compare sets
    const userSets = userRows.map(row => new Set(row));
    const expectedSets = expectedRows.map(row => new Set(row));
    
    // Check if we have the same data, just different column order
    let sameDataDifferentOrder = true;
    for (let i = 0; i < userSets.length && sameDataDifferentOrder; i++) {
      let foundMatch = false;
      for (let j = 0; j < expectedSets.length; j++) {
        if (setsEqual(userSets[i], expectedSets[j])) {
          foundMatch = true;
          break;
        }
      }
      if (!foundMatch) {
        sameDataDifferentOrder = false;
      }
    }
    
    if (sameDataDifferentOrder) {
      return {
        isCorrect: true,
        message: 'Correct! Your solution matches the expected output (column order may differ).'
      };
    }
  }

  // If we get here, find the first difference for a helpful error message
  for (let i = 0; i < Math.min(sortedUserRows.length, sortedExpectedRows.length); i++) {
    for (let j = 0; j < Math.min(sortedUserRows[i].length, sortedExpectedRows[i].length); j++) {
      if (sortedUserRows[i][j] !== sortedExpectedRows[i][j]) {
        return {
          isCorrect: false,
          message: `Row ${i + 1}, column ${j + 1}: expected '${sortedExpectedRows[i][j]}', but got '${sortedUserRows[i][j]}'`
        };
      }
    }
  }

  return {
    isCorrect: false,
    message: 'Results do not match expected output. Please check your query.'
  };
}

// Helper functions for array and set comparison
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Array.isArray(a[i]) || !Array.isArray(b[i])) return false;
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (let item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

async function executeSQL(req, res) {
  const { query, dialect = 'postgresql', problemId } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // Basic SQL injection protection
  const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE'];
  const upperQuery = query.toUpperCase();
  
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return res.status(400).json({ 
        error: `${keyword} operations are not allowed in practice mode` 
      });
    }
  }

  const startTime = Date.now();

  try {
    let result;
    
    if (dialect === 'postgresql') {
      // Use execution pool for PostgreSQL
      const pool = executionPools.postgresql;
      result = await pool.query(query);
      
      const executionTime = Date.now() - startTime;
      
      let validation = null;
      
      // If this is for a specific problem, validate the solution
      if (problemId) {
        try {
          console.log(`🔍 Validating solution for problem: ${problemId}`);
          
          const schemaQuery = `
            SELECT expected_output, solution_sql 
            FROM problem_schemas 
            WHERE problem_id = $1 AND sql_dialect = 'postgresql'
          `;
          
          const schemaResult = await mainPool.query(schemaQuery, [problemId]);
          
          if (schemaResult.rows.length > 0) {
            const { expected_output } = schemaResult.rows[0];
            
            console.log('📋 Raw expected_output:', typeof expected_output, expected_output);
            
            let expectedData;
            try {
              // If it's already an object/array, use it directly
              if (typeof expected_output === 'object') {
                expectedData = expected_output;
              } else {
                // If it's a string, try to parse it
                expectedData = JSON.parse(expected_output);
              }
              
              console.log('📋 Parsed expectedData:', expectedData);
              
              const userRows = result.rows.map(row => Object.values(row));
              const userColumns = result.fields.map(field => field.name);
              console.log('👤 User result rows:', userRows);
              console.log('👤 User columns:', userColumns);
              
              validation = compareResults(userRows, expectedData, userColumns);
            } catch (parseError) {
              console.error('❌ JSON Parse Error:', parseError.message);
              console.error('❌ Problematic data:', expected_output.substring(0, 100));
              
              validation = {
                isCorrect: false,
                message: `Validation data format error. Please contact support.`
              };
            }
            
            console.log(`✅ Validation result: ${validation.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
            console.log(`📝 Message: ${validation.message}`);
          } else {
            console.log(`❌ No schema found for problem ${problemId}`);
          }
        } catch (validationError) {
          console.error('❌ Validation error:', validationError.message);
          console.error('❌ Full error:', validationError);
          validation = {
            isCorrect: false,
            message: `Unable to validate solution - validation system error: ${validationError.message}`
          };
        }
      }
      
      return res.json({
        success: true,
        columns: result.fields.map(field => field.name),
        rows: result.rows.map(row => Object.values(row)),
        rowCount: result.rowCount,
        executionTime: `${executionTime}ms`,
        dialect,
        validation
      });
    } else if (dialect === 'mysql') {
      // Translate MySQL query to PostgreSQL and execute
      const translatedQuery = translateMySQLToPostgreSQL(query);
      console.log(`🔄 MySQL query: ${query}`);
      console.log(`🔄 Translated to PostgreSQL: ${translatedQuery}`);
      
      const pool = executionPools.postgresql; // Use PostgreSQL pool directly for MySQL translation
      
      if (!pool) {
        throw new Error('PostgreSQL connection pool not available for MySQL translation');
      }
      
      result = await pool.query(translatedQuery);
      
      const executionTime = Date.now() - startTime;
      
      let validation = null;
      
      // If this is for a specific problem, validate the solution
      if (problemId) {
        try {
          console.log(`🔍 Validating MySQL solution for problem: ${problemId}`);
          
          const schemaQuery = `
            SELECT expected_output, solution_sql 
            FROM problem_schemas 
            WHERE problem_id = $1 AND sql_dialect = 'mysql'
          `;
          
          const schemaResult = await mainPool.query(schemaQuery, [problemId]);
          
          if (schemaResult.rows.length > 0) {
            const { expected_output } = schemaResult.rows[0];
            
            let expectedData;
            try {
              if (typeof expected_output === 'object') {
                expectedData = expected_output;
              } else {
                expectedData = JSON.parse(expected_output);
              }
              
              const userRows = result.rows.map(row => Object.values(row));
              const userColumns = result.fields.map(field => field.name);
              
              validation = compareResults(userRows, expectedData, userColumns);
            } catch (parseError) {
              validation = {
                isCorrect: false,
                message: `Validation data format error. Please contact support.`
              };
            }
            
            console.log(`✅ MySQL validation result: ${validation.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
          } else {
            console.log(`❌ No MySQL schema found for problem ${problemId}, trying PostgreSQL schema`);
            // Fallback to PostgreSQL schema if MySQL schema doesn't exist
            const pgSchemaQuery = `
              SELECT expected_output, solution_sql 
              FROM problem_schemas 
              WHERE problem_id = $1 AND sql_dialect = 'postgresql'
            `;
            
            const pgSchemaResult = await mainPool.query(pgSchemaQuery, [problemId]);
            if (pgSchemaResult.rows.length > 0) {
              const { expected_output } = pgSchemaResult.rows[0];
              
              let expectedData;
              try {
                if (typeof expected_output === 'object') {
                  expectedData = expected_output;
                } else {
                  expectedData = JSON.parse(expected_output);
                }
                
                const userRows = result.rows.map(row => Object.values(row));
                const userColumns = result.fields.map(field => field.name);
                
                validation = compareResults(userRows, expectedData, userColumns);
              } catch (parseError) {
                validation = {
                  isCorrect: false,
                  message: `Validation data format error. Please contact support.`
                };
              }
            }
          }
        } catch (validationError) {
          console.error('❌ MySQL validation error:', validationError.message);
          validation = {
            isCorrect: false,
            message: `Unable to validate solution - validation system error: ${validationError.message}`
          };
        }
      }
      
      return res.json({
        success: true,
        columns: result.fields.map(field => field.name),
        rows: result.rows.map(row => Object.values(row)),
        rowCount: result.rowCount,
        executionTime: `${executionTime}ms`,
        dialect,
        validation,
        translatedQuery: translatedQuery !== query ? translatedQuery : undefined
      });
    } else {
      return res.status(400).json({ 
        error: `${dialect} execution not yet supported` 
      });
    }

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return res.status(400).json({
      success: false,
      error: error.message,
      executionTime: `${executionTime}ms`,
      dialect
    });
  }
}

async function getProblems(req, res) {
  try {
    const { difficulty, category } = req.query;
    
    let query = `
      SELECT p.id, p.title, p.slug, p.difficulty, p.is_premium,
             c.name as category, p.total_submissions, p.total_accepted,
             CASE 
               WHEN p.total_submissions > 0 
               THEN ROUND((p.total_accepted::decimal / p.total_submissions) * 100, 1)
               ELSE 0 
             END as acceptance_rate
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
    
    query += ' ORDER BY p.id';
    
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
    
    const problemQuery = `
      SELECT p.*, c.name as category_name
      FROM problems p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = true
    `;
    
    const schemaQuery = `
      SELECT * FROM problem_schemas 
      WHERE problem_id = $1 AND sql_dialect = 'postgresql'
    `;
    
    const [problemResult, schemaResult] = await Promise.all([
      mainPool.query(problemQuery, [id]),
      mainPool.query(schemaQuery, [id])
    ]);
    
    if (problemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const problem = problemResult.rows[0];
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
    
    const schemaQuery = `
      SELECT setup_sql, sql_dialect 
      FROM problem_schemas 
      WHERE problem_id = $1 AND sql_dialect = 'postgresql'
    `;
    
    const result = await mainPool.query(schemaQuery, [problemId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Problem schema not found' });
    }
    
    const { setup_sql } = result.rows[0];
    
    // Execute setup SQL in the sandbox environment
    const pool = executionPools.postgresql;
    const client = await pool.connect();
    
    try {
      // Clear any existing tables first  
      await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      
      // Execute the setup SQL
      console.log(`🔧 Setting up environment with SQL: ${setup_sql.substring(0, 100)}...`);
      await client.query(setup_sql);
      
      // Verify the setup worked
      const verifyResult = await client.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'");
      console.log(`✅ Problem environment set up for problem ${problemId} - Created ${verifyResult.rows[0].count} tables`);
      
      res.json({ 
        success: true, 
        message: 'Problem environment set up successfully' 
      });
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error setting up problem environment:', error);
    res.status(500).json({ error: 'Failed to set up problem environment: ' + error.message });
  }
}

// Function to set up default practice environment
async function setupDefaultEnvironment() {
  try {
    const pool = executionPools.postgresql;
    const client = await pool.connect();
    
    try {
      // Clear any existing tables
      await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
      
      // Create default tables
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
      
      await client.query(defaultSetup);
      console.log('✅ Default practice environment set up');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error setting up default environment:', error);
  }
}

// Set up default environment on startup (non-blocking)
setTimeout(() => {
  setupDefaultEnvironment();
}, 2000);

module.exports = {
  executeSQL,
  getProblems,
  getProblem,
  setupProblemEnvironment,
  setupDefaultEnvironment
};