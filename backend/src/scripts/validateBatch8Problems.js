const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ValidationService = require('../services/validationService');
const validationService = new ValidationService();

async function validateBatch8Problems() {
  console.log('🧪 VALIDATING BATCH 8 PROBLEMS (Latest 6)');
  console.log('=' .repeat(45));
  
  try {
    // Get the 6 most recently added problems (Batch 8)
    const problemsResult = await pool.query(`
      SELECT p.id, p.title, p.difficulty, ps.setup_sql, ps.solution_sql
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.is_active = true 
      ORDER BY p.id DESC 
      LIMIT 6
    `);
    
    const problems = problemsResult.rows;
    console.log(`Testing ${problems.length} newest problems from Batch 8\n`);
    
    let passedCount = 0;
    let failedCount = 0;
    const failedProblems = [];
    
    for (const [index, problem] of problems.entries()) {
      console.log(`${index + 1}. ${problem.difficulty.toUpperCase()}: ${problem.title}`);
      
      try {
        // Test setup SQL execution
        await validationService.setupProblemEnvironment(problem.setup_sql);
        console.log('   ✅ Setup SQL works');
        
        // Test solution SQL execution  
        const solutionResult = await validationService.executionPool.query(problem.solution_sql);
        console.log(`   ✅ Solution works (${solutionResult.rows.length} rows)`);
        
        // Test validation system
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
          failedProblems.push({ title: problem.title, error: validation.message });
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failedCount++;
        failedProblems.push({ title: problem.title, error: error.message });
      }
      
      console.log('');
    }
    
    console.log('=' .repeat(45));
    console.log(`✅ PASSED: ${passedCount}/${problems.length}`);
    console.log(`❌ FAILED: ${failedCount}/${problems.length}`);
    console.log(`Success Rate: ${Math.round((passedCount / problems.length) * 100)}%`);
    
    if (passedCount === problems.length) {
      console.log('\n🎉 ALL BATCH 8 PROBLEMS VALIDATED!');
      console.log('🏆 Ready for Final Batch 9: 31 remaining problems');
    } else {
      console.log('\n⚠️  Issues found:');
      failedProblems.forEach((fp, i) => {
        console.log(`${i + 1}. ${fp.title}: ${fp.error}`);
      });
    }
    
    // Show progress toward 100
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM problems WHERE is_active = true');
    const current = parseInt(totalResult.rows[0].total);
    console.log(`\n📊 Progress: ${current}/100 problems (${100 - current} remaining)`);
    
  } catch (error) {
    console.error('❌ Validation script error:', error.message);
  } finally {
    await pool.end();
  }
}

validateBatch8Problems().catch(console.error);