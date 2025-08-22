const { Pool } = require('pg');
const mysql = require('mysql2/promise');

class ValidationService {
  constructor() {
    this.mainPool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    // PostgreSQL execution pool
    this.pgPool = new Pool({
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: 'password',
      database: 'sandbox'
    });
    
    // MySQL connection pool
    this.mysqlPool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'sandbox',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000
    });
  }
  
  getExecutionPool(dialect) {
    switch (dialect) {
      case 'mysql':
        return this.mysqlPool;
      case 'postgresql':
      default:
        return this.pgPool;
    }
  }

  /**
   * CORE PRINCIPLE: Generate expected output dynamically from canonical solution
   * This eliminates manual expected output maintenance and ensures consistency
   */
  async generateExpectedOutput(problemId, dialect = 'postgresql') {
    try {
      console.log(`🔄 Generating expected output for problem ${problemId}`);
      
      // 1. Get problem setup and canonical solution
      const problemQuery = `
        SELECT setup_sql, solution_sql, expected_output 
        FROM problem_schemas 
        WHERE problem_id = $1 AND sql_dialect = $2
      `;
      
      const result = await this.mainPool.query(problemQuery, [problemId, dialect]);
      
      if (result.rows.length === 0) {
        throw new Error(`Problem ${problemId} not found for dialect ${dialect}`);
      }
      
      const { setup_sql, solution_sql } = result.rows[0];
      
      // 2. Setup clean environment
      await this.setupProblemEnvironment(setup_sql, dialect);
      
      // 3. Execute canonical solution to get expected output
      const expectedResult = await this.executeQuery(solution_sql, dialect);
      
      // 4. Normalize the output
      const normalizedOutput = this.normalizeQueryResult(expectedResult);
      
      console.log(`✅ Generated ${normalizedOutput.length} expected rows`);
      return normalizedOutput;
      
    } catch (error) {
      console.error(`❌ Error generating expected output:`, error);
      throw error;
    }
  }

  /**
   * Setup problem environment with proper isolation
   */
  async setupProblemEnvironment(setupSql, dialect = 'postgresql') {
    if (dialect === 'mysql') {
      const connection = await this.mysqlPool.getConnection();
      try {
        // MySQL setup - drop and recreate database
        await connection.execute('DROP DATABASE IF EXISTS sandbox');
        await connection.execute('CREATE DATABASE sandbox');
        await connection.execute('USE sandbox');
        
        // Execute setup SQL
        const statements = this.splitSqlStatements(setupSql);
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.execute(statement);
          }
        }
        
        console.log('✅ MySQL problem environment setup complete');
      } finally {
        connection.release();
      }
    } else {
      // PostgreSQL setup
      const client = await this.pgPool.connect();
      try {
        // Clear and recreate schema for isolation
        await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
        
        // Execute setup SQL
        await client.query(setupSql);
        
        console.log('✅ PostgreSQL problem environment setup complete');
      } finally {
        client.release();
      }
    }
  }
  
  /**
   * Split SQL statements for MySQL execution
   */
  splitSqlStatements(sql) {
    return sql.split(';').filter(stmt => stmt.trim().length > 0);
  }
  
  /**
   * Execute query with proper dialect handling
   */
  async executeQuery(query, dialect = 'postgresql') {
    if (dialect === 'mysql') {
      const [rows, fields] = await this.mysqlPool.execute(query);
      return { rows, fields };
    } else {
      return await this.pgPool.query(query);
    }
  }

  /**
   * Normalize query results to handle data types consistently
   */
  normalizeQueryResult(queryResult, dialect = 'postgresql') {
    const rows = dialect === 'mysql' ? queryResult.rows : queryResult.rows;
    
    return rows.map(row => {
      return Object.values(row).map(cell => {
        if (cell === null) return null;
        
        // Handle Date objects
        if (cell instanceof Date) {
          return cell.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        // Handle Decimal/BigInt
        if (typeof cell === 'bigint') {
          return cell.toString();
        }
        
        // Handle Numbers with proper precision
        if (typeof cell === 'number') {
          return Number.isInteger(cell) ? cell.toString() : cell.toFixed(2);
        }
        
        // Handle strings
        return String(cell).trim();
      });
    });
  }

  /**
   * Smart validation with multiple comparison strategies
   */
  async validateSolution(userQuery, problemId, dialect = 'postgresql') {
    try {
      // 1. Generate fresh expected output
      const expectedRows = await this.generateExpectedOutput(problemId, dialect);
      
      // 2. Execute user query
      const userResult = await this.executeQuery(userQuery, dialect);
      const userRows = this.normalizeQueryResult(userResult, dialect);
      
      // 3. Compare with multiple strategies
      return this.compareResults(userRows, expectedRows, userResult.fields);
      
    } catch (error) {
      return {
        isCorrect: false,
        message: `Validation error: ${error.message}`,
        error: true
      };
    }
  }

  /**
   * Multi-strategy result comparison
   */
  compareResults(userRows, expectedRows, userFields = []) {
    console.log('🔍 Comparing results...');
    console.log('👤 User rows:', userRows.length);
    console.log('🎯 Expected rows:', expectedRows.length);
    
    // Strategy 1: Row count check
    if (userRows.length !== expectedRows.length) {
      return {
        isCorrect: false,
        message: `Expected ${expectedRows.length} rows, but got ${userRows.length} rows`
      };
    }
    
    // Strategy 2: Column count check
    if (userRows.length > 0 && userRows[0].length !== expectedRows[0].length) {
      return {
        isCorrect: false,
        message: `Expected ${expectedRows[0].length} columns, but got ${userRows[0].length} columns`
      };
    }
    
    // Strategy 3: Exact match (same order)
    if (this.arraysDeepEqual(userRows, expectedRows)) {
      return {
        isCorrect: true,
        message: 'Correct! Your solution matches the expected output.'
      };
    }
    
    // Strategy 4: Sorted comparison (handles ORDER BY variations)
    const sortedUser = this.sortRows(userRows);
    const sortedExpected = this.sortRows(expectedRows);
    
    if (this.arraysDeepEqual(sortedUser, sortedExpected)) {
      return {
        isCorrect: true,
        message: 'Correct! Your solution matches the expected output.'
      };
    }
    
    // Strategy 5: Set-based comparison (handles column order differences)
    if (this.setsEqual(userRows, expectedRows)) {
      return {
        isCorrect: true,
        message: 'Correct! Your solution matches the expected output (column/row order may differ).'
      };
    }
    
    // Find specific difference for error message
    return this.findSpecificDifference(sortedUser, sortedExpected);
  }

  /**
   * Helper methods for comparison
   */
  arraysDeepEqual(a, b) {
    if (a.length !== b.length) return false;
    
    for (let i = 0; i < a.length; i++) {
      if (a[i].length !== b[i].length) return false;
      
      for (let j = 0; j < a[i].length; j++) {
        if (a[i][j] !== b[i][j]) return false;
      }
    }
    
    return true;
  }

  sortRows(rows) {
    return [...rows].sort((a, b) => {
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] !== b[i]) {
          // Numeric comparison
          const aNum = Number(a[i]);
          const bNum = Number(b[i]);
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          
          // String comparison
          return a[i] < b[i] ? -1 : 1;
        }
      }
      return 0;
    });
  }

  setsEqual(userRows, expectedRows) {
    if (userRows.length !== expectedRows.length) return false;
    
    const userSets = userRows.map(row => new Set(row));
    const expectedSets = expectedRows.map(row => new Set(row));
    
    for (let userSet of userSets) {
      let found = false;
      for (let expectedSet of expectedSets) {
        if (this.setEqual(userSet, expectedSet)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    
    return true;
  }

  setEqual(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (let item of setA) {
      if (!setB.has(item)) return false;
    }
    return true;
  }

  findSpecificDifference(userRows, expectedRows) {
    for (let i = 0; i < Math.min(userRows.length, expectedRows.length); i++) {
      for (let j = 0; j < Math.min(userRows[i].length, expectedRows[i].length); j++) {
        if (userRows[i][j] !== expectedRows[i][j]) {
          return {
            isCorrect: false,
            message: `Row ${i + 1}, column ${j + 1}: expected '${expectedRows[i][j]}', but got '${userRows[i][j]}'`
          };
        }
      }
    }
    
    return {
      isCorrect: false,
      message: 'Results do not match expected output. Please check your query.'
    };
  }

  /**
   * Test all problems for validation consistency
   */
  async testAllProblems() {
    console.log('🧪 Testing all problems for validation consistency...');
    
    const problemsQuery = `
      SELECT ps.problem_id, p.title, ps.solution_sql, ps.sql_dialect
      FROM problem_schemas ps
      JOIN problems p ON ps.problem_id = p.id
      WHERE ps.sql_dialect IN ('postgresql', 'mysql')
    `;
    
    const problems = await this.mainPool.query(problemsQuery);
    const results = [];
    
    for (const problem of problems.rows) {
      try {
        console.log(`Testing: ${problem.title}`);
        
        const validation = await this.validateSolution(
          problem.solution_sql,
          problem.problem_id,
          problem.sql_dialect
        );
        
        results.push({
          problemId: problem.problem_id,
          title: problem.title,
          status: validation.isCorrect ? 'PASS' : 'FAIL',
          message: validation.message
        });
        
      } catch (error) {
        results.push({
          problemId: problem.problem_id,
          title: problem.title,
          status: 'ERROR',
          message: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Auto-update expected outputs for all problems
   */
  async updateAllExpectedOutputs() {
    console.log('🔄 Updating expected outputs for all problems...');
    
    const problemsQuery = `
      SELECT problem_id, solution_sql, sql_dialect
      FROM problem_schemas
      WHERE sql_dialect IN ('postgresql', 'mysql')
    `;
    
    const problems = await this.mainPool.query(problemsQuery);
    
    for (const problem of problems.rows) {
      try {
        const expectedOutput = await this.generateExpectedOutput(problem.problem_id, problem.sql_dialect);
        
        await this.mainPool.query(`
          UPDATE problem_schemas 
          SET expected_output = $1::jsonb,
              updated_at = CURRENT_TIMESTAMP
          WHERE problem_id = $2 AND sql_dialect = $3
        `, [JSON.stringify(expectedOutput), problem.problem_id, problem.sql_dialect]);
        
        console.log(`✅ Updated expected output for problem ${problem.problem_id}`);
        
      } catch (error) {
        console.error(`❌ Failed to update problem ${problem.problem_id}:`, error.message);
      }
    }
  }
}

module.exports = ValidationService;