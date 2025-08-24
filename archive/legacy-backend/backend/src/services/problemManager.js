const { Pool } = require('pg');
const ValidationService = require('./validationService');

class ProblemManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    this.validationService = new ValidationService();
  }

  /**
   * Add a new problem with automatic validation setup
   */
  async addProblem({
    title,
    slug,
    description,
    difficulty,
    category,
    setupSql,
    solutionSql,
    explanation = '',
    tags = [],
    constraints = null,
    hints = []
  }) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Get or create category
      const categoryId = await this.getOrCreateCategory(category, client);
      
      // 2. Insert problem
      const problemResult = await client.query(`
        INSERT INTO problems (
          title, slug, description, difficulty, category_id, 
          tags, is_premium, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, false, true)
        RETURNING id
      `, [title, slug, description, difficulty, categoryId, tags]);
      
      const problemId = problemResult.rows[0].id;
      
      // 3. Generate expected output automatically by executing solution directly
      console.log('🔄 Generating expected output for new problem...');
      
      // Setup environment temporarily to generate expected output
      await this.validationService.setupProblemEnvironment(setupSql);
      
      // Execute solution directly to get expected output
      const solutionResult = await this.validationService.executionPool.query(solutionSql);
      const expectedOutput = this.validationService.normalizeQueryResult(solutionResult);
      
      // 4. Insert problem schema
      await client.query(`
        INSERT INTO problem_schemas (
          problem_id, sql_dialect, setup_sql, solution_sql, 
          expected_output, explanation, constraints, hints
        ) VALUES ($1, 'postgresql', $2, $3, $4::jsonb, $5, $6, $7::jsonb)
      `, [
        problemId, 
        setupSql, 
        solutionSql, 
        JSON.stringify(expectedOutput),
        explanation,
        constraints,
        hints
      ]);
      
      // 5. Test the problem immediately
      const testResult = await this.validationService.validateSolution(
        solutionSql, problemId
      );
      
      if (!testResult.isCorrect) {
        throw new Error(`Problem validation failed: ${testResult.message}`);
      }
      
      await client.query('COMMIT');
      
      console.log(`✅ Problem "${title}" added successfully with ID: ${problemId}`);
      
      return {
        success: true,
        problemId,
        message: 'Problem added and validated successfully'
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error adding problem:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a problem and re-validate
   */
  async updateProblem(problemId, updates) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update problem metadata if provided
      if (updates.title || updates.description || updates.difficulty || updates.tags) {
        const setParts = [];
        const values = [];
        let paramCount = 1;
        
        if (updates.title) {
          setParts.push(`title = $${paramCount++}`);
          values.push(updates.title);
        }
        
        if (updates.description) {
          setParts.push(`description = $${paramCount++}`);
          values.push(updates.description);
        }
        
        if (updates.difficulty) {
          setParts.push(`difficulty = $${paramCount++}`);
          values.push(updates.difficulty);
        }
        
        if (updates.tags) {
          setParts.push(`tags = $${paramCount++}`);
          values.push(updates.tags);
        }
        
        values.push(problemId); // for WHERE clause
        
        await client.query(`
          UPDATE problems 
          SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
        `, values);
      }
      
      // Update problem schema if provided
      if (updates.setupSql || updates.solutionSql || updates.explanation) {
        const setParts = [];
        const values = [];
        let paramCount = 1;
        
        if (updates.setupSql) {
          setParts.push(`setup_sql = $${paramCount++}`);
          values.push(updates.setupSql);
        }
        
        if (updates.solutionSql) {
          setParts.push(`solution_sql = $${paramCount++}`);
          values.push(updates.solutionSql);
        }
        
        if (updates.explanation) {
          setParts.push(`explanation = $${paramCount++}`);
          values.push(updates.explanation);
        }
        
        // If solution changed, regenerate expected output
        if (updates.setupSql || updates.solutionSql) {
          const setupSql = updates.setupSql || 
            (await client.query('SELECT setup_sql FROM problem_schemas WHERE problem_id = $1', [problemId])).rows[0].setup_sql;
          
          const solutionSql = updates.solutionSql ||
            (await client.query('SELECT solution_sql FROM problem_schemas WHERE problem_id = $1', [problemId])).rows[0].solution_sql;
          
          // Generate new expected output
          await this.validationService.setupProblemEnvironment(setupSql);
          const expectedOutput = await this.validationService.generateExpectedOutput(problemId);
          
          setParts.push(`expected_output = $${paramCount++}::jsonb`);
          values.push(JSON.stringify(expectedOutput));
          
          // Test the updated problem
          const testResult = await this.validationService.validateSolution(solutionSql, problemId);
          
          if (!testResult.isCorrect) {
            throw new Error(`Updated problem validation failed: ${testResult.message}`);
          }
        }
        
        values.push(problemId); // for WHERE clause
        
        await client.query(`
          UPDATE problem_schemas 
          SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE problem_id = $${paramCount}
        `, values);
      }
      
      await client.query('COMMIT');
      
      console.log(`✅ Problem ${problemId} updated successfully`);
      
      return {
        success: true,
        message: 'Problem updated and re-validated successfully'
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error updating problem:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Bulk import problems from a structured format
   */
  async bulkImportProblems(problems) {
    console.log(`📦 Starting bulk import of ${problems.length} problems...`);
    
    const results = [];
    
    for (const [index, problem] of problems.entries()) {
      try {
        console.log(`Processing ${index + 1}/${problems.length}: ${problem.title}`);
        
        const result = await this.addProblem(problem);
        results.push({ ...result, title: problem.title });
        
      } catch (error) {
        console.error(`❌ Failed to import "${problem.title}":`, error.message);
        results.push({
          success: false,
          title: problem.title,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`📊 Bulk import complete: ${successCount} successful, ${failureCount} failed`);
    
    return {
      success: failureCount === 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    };
  }

  /**
   * Get or create category
   */
  async getOrCreateCategory(categoryName, client) {
    // Check if category exists
    const existing = await client.query(
      'SELECT id FROM categories WHERE name = $1',
      [categoryName]
    );
    
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    
    // Create new category
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
    const result = await client.query(`
      INSERT INTO categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [categoryName, slug, `Problems related to ${categoryName}`]);
    
    return result.rows[0].id;
  }

  /**
   * Test a specific problem
   */
  async testProblem(problemId) {
    try {
      const schemaQuery = await this.pool.query(`
        SELECT solution_sql FROM problem_schemas 
        WHERE problem_id = $1 AND sql_dialect = 'postgresql'
      `, [problemId]);
      
      if (schemaQuery.rows.length === 0) {
        throw new Error('Problem not found');
      }
      
      const { solution_sql } = schemaQuery.rows[0];
      
      const result = await this.validationService.validateSolution(solution_sql, problemId);
      
      return {
        problemId,
        status: result.isCorrect ? 'PASS' : 'FAIL',
        message: result.message,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        problemId,
        status: 'ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get problem statistics
   */
  async getStatistics() {
    const stats = await this.pool.query(`
      SELECT 
        COUNT(*) as total_problems,
        COUNT(*) FILTER (WHERE difficulty = 'easy') as easy_count,
        COUNT(*) FILTER (WHERE difficulty = 'medium') as medium_count,
        COUNT(*) FILTER (WHERE difficulty = 'hard') as hard_count,
        COUNT(*) FILTER (WHERE is_premium = true) as premium_count,
        COUNT(*) FILTER (WHERE is_active = true) as active_count
      FROM problems
    `);
    
    const categoryStats = await this.pool.query(`
      SELECT c.name as category, COUNT(p.id) as problem_count
      FROM categories c
      LEFT JOIN problems p ON c.id = p.category_id AND p.is_active = true
      GROUP BY c.id, c.name
      ORDER BY problem_count DESC
    `);
    
    return {
      overview: stats.rows[0],
      byCategory: categoryStats.rows
    };
  }
}

module.exports = ProblemManager;