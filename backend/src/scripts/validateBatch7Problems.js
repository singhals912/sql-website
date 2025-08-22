const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ValidationService = require('../services/validationService');
const validationService = new ValidationService();

async function validateBatch7Problems() {
  console.log('🧪 VALIDATING BATCH 7 PROBLEMS');
  console.log('=' .repeat(40));
  
  try {
    // Get the 7 most recently added problems (Batch 7)
    const problemsResult = await pool.query(`
      SELECT p.id, p.title, p.difficulty, ps.setup_sql, ps.solution_sql
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.is_active = true 
      ORDER BY p.id DESC 
      LIMIT 7
    `);
    
    const problems = problemsResult.rows;
    console.log(`Testing ${problems.length} newest problems from Batch 7\n`);
    
    let passedCount = 0;
    let failedCount = 0;
    
    for (const [index, problem] of problems.entries()) {
      console.log(`${index + 1}. Testing ${problem.difficulty.toUpperCase()}: ${problem.title}`);
      
      try {
        // Test 1: Setup SQL execution
        await validationService.setupProblemEnvironment(problem.setup_sql);
        console.log('   ✅ Setup SQL works');
        
        // Test 2: Solution SQL execution  
        const solutionResult = await validationService.executionPool.query(problem.solution_sql);
        console.log(`   ✅ Solution works (${solutionResult.rows.length} rows)`);
        
        // Test 3: Validation system test
        const validation = await validationService.validateSolution(
          problem.solution_sql, 
          problem.id, 
          'postgresql'
        );
        
        if (validation.isCorrect) {
          console.log('   ✅ Validation passed');
          passedCount++;
        } else {
          console.log(`   ❌ Validation failed: ${validation.message}`);
          failedCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failedCount++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('=' .repeat(40));
    console.log(`✅ PASSED: ${passedCount}/${problems.length} problems`);
    console.log(`❌ FAILED: ${failedCount}/${problems.length} problems`);
    console.log(`Success Rate: ${Math.round((passedCount / problems.length) * 100)}%`);
    
    if (passedCount === problems.length) {
      console.log('\n🎉 ALL BATCH 7 PROBLEMS VALIDATED SUCCESSFULLY!');
      console.log('🚀 Ready to proceed with Batch 8!');
    } else {
      console.log('\n⚠️  Some problems need attention before proceeding');
    }
    
  } catch (error) {
    console.error('❌ Validation script error:', error.message);
  } finally {
    await pool.end();
  }
}

validateBatch7Problems().catch(console.error);