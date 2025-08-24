const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function validateProblem(problemId) {
  console.log(`\n🔍 TESTING PROBLEM #${problemId}`);
  console.log('='.repeat(50));
  
  try {
    // 1. Get problem and schema data
    const problemQuery = `
      SELECT p.*, ps.setup_sql, ps.solution_sql, ps.expected_output
      FROM problems p
      JOIN problem_schemas ps ON p.id = ps.problem_id
      WHERE p.numeric_id = $1
    `;
    
    const problemResult = await pool.query(problemQuery, [problemId]);
    
    if (problemResult.rows.length === 0) {
      console.log(`❌ Problem #${problemId} not found in database`);
      return { problemId, status: 'missing', error: 'Problem not found' };
    }
    
    const problem = problemResult.rows[0];
    console.log(`📋 Title: ${problem.title}`);
    console.log(`📊 Difficulty: ${problem.difficulty}`);
    
    // 2. Test setup SQL
    console.log(`\n🔧 Testing setup SQL...`);
    try {
      await pool.query('BEGIN');
      await pool.query(problem.setup_sql);
      console.log(`✅ Setup SQL executed successfully`);
      
      // 3. Test solution SQL
      console.log(`\n💡 Testing solution SQL...`);
      const solutionResult = await pool.query(problem.solution_sql);
      console.log(`✅ Solution SQL executed successfully`);
      console.log(`📊 Solution returned ${solutionResult.rows.length} rows`);
      
      // Display solution results
      if (solutionResult.rows.length > 0) {
        console.log(`📋 Solution Results:`);
        solutionResult.rows.forEach((row, index) => {
          console.log(`   ${index + 1}: ${JSON.stringify(row)}`);
        });
      } else {
        console.log(`⚠️  Solution returned no rows - this may be intentional or indicate insufficient test data`);
      }
      
      // 4. Compare with expected output if available
      if (problem.expected_output) {
        try {
          const expectedData = JSON.parse(problem.expected_output);
          const actualData = solutionResult.rows;
          
          if (JSON.stringify(expectedData) === JSON.stringify(actualData)) {
            console.log(`✅ Solution matches expected output perfectly`);
          } else {
            console.log(`⚠️  Solution differs from expected output`);
            console.log(`   Expected: ${JSON.stringify(expectedData)}`);
            console.log(`   Actual:   ${JSON.stringify(actualData)}`);
          }
        } catch (e) {
          console.log(`⚠️  Could not parse expected output for comparison`);
        }
      }
      
      await pool.query('ROLLBACK');
      
      return { 
        problemId, 
        status: 'success', 
        title: problem.title,
        difficulty: problem.difficulty,
        resultCount: solutionResult.rows.length,
        hasExpectedOutput: !!problem.expected_output
      };
      
    } catch (setupError) {
      await pool.query('ROLLBACK');
      console.log(`❌ Setup/Solution Error: ${setupError.message}`);
      return { 
        problemId, 
        status: 'error', 
        error: setupError.message,
        title: problem.title,
        difficulty: problem.difficulty
      };
    }
    
  } catch (error) {
    console.log(`❌ Database Error: ${error.message}`);
    return { problemId, status: 'db_error', error: error.message };
  }
}

async function validateAllProblems() {
  console.log('🚀 SYSTEMATIC PROBLEM VALIDATION');
  console.log('=====================================');
  console.log('Testing all problems from 1 to 91...\n');
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  let missingCount = 0;
  let noResultsCount = 0;
  
  for (let i = 1; i <= 91; i++) {
    const result = await validateProblem(i);
    results.push(result);
    
    if (result.status === 'success') {
      successCount++;
      if (result.resultCount === 0) {
        noResultsCount++;
      }
    } else if (result.status === 'error') {
      errorCount++;
    } else if (result.status === 'missing') {
      missingCount++;
    }
    
    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('=====================');
  console.log(`✅ Successful: ${successCount}/91`);
  console.log(`❌ Errors: ${errorCount}/91`);
  console.log(`❓ Missing: ${missingCount}/91`);
  console.log(`⚠️  No Results: ${noResultsCount}/91`);
  
  // List problems with issues
  const problemsWithIssues = results.filter(r => 
    r.status !== 'success' || (r.status === 'success' && r.resultCount === 0)
  );
  
  if (problemsWithIssues.length > 0) {
    console.log('\n🔧 PROBLEMS NEEDING ATTENTION:');
    problemsWithIssues.forEach(p => {
      console.log(`#${p.problemId}: ${p.title || 'Unknown'} - ${p.status}${p.resultCount === 0 ? ' (no results)' : ''}${p.error ? ` - ${p.error}` : ''}`);
    });
  }
  
  return results;
}

// Run if called directly
if (require.main === module) {
  validateAllProblems()
    .then(() => {
      console.log('\n✅ Validation complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}

module.exports = { validateProblem, validateAllProblems };