const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ValidationService = require('../services/validationService');
const validationService = new ValidationService();

async function validate91Problems() {
  console.log('🧪 COMPREHENSIVE VALIDATION OF ALL 91 ACTIVE PROBLEMS');
  console.log('=' .repeat(70));
  
  try {
    // Get all active problems with their schemas
    const problemsResult = await pool.query(`
      SELECT 
        p.id, p.title, p.difficulty, 
        ps.setup_sql, ps.solution_sql, ps.explanation
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.is_active = true 
      ORDER BY p.difficulty, p.title
    `);
    
    const problems = problemsResult.rows;
    console.log(`📊 Testing ${problems.length} active problems...\n`);
    
    let totalPassed = 0;
    let totalFailed = 0;
    let difficultyStats = { 
      easy: { passed: 0, failed: 0 }, 
      medium: { passed: 0, failed: 0 }, 
      hard: { passed: 0, failed: 0 } 
    };
    const failedProblems = [];
    const warningProblems = [];
    
    for (const [index, problem] of problems.entries()) {
      const problemNum = index + 1;
      const progressPercent = Math.round((problemNum / problems.length) * 100);
      
      console.log(`[${problemNum}/${problems.length}] ${progressPercent}% - ${problem.difficulty.toUpperCase()}: ${problem.title}`);
      
      let testResults = {
        setupSqlValid: false,
        solutionSqlValid: false,
        validationWorks: false,
        hasData: false,
        errors: []
      };
      
      try {
        // Test 1: Setup SQL execution
        console.log('   🔧 Testing setup SQL...');
        await validationService.setupProblemEnvironment(problem.setup_sql);
        testResults.setupSqlValid = true;
        console.log('   ✅ Setup SQL works');
        
        // Test 2: Check if setup creates data
        const dataCheck = await validationService.executionPool.query(`
          SELECT COUNT(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          AND table_name NOT IN ('problems', 'problem_schemas', 'categories')
        `);
        
        if (parseInt(dataCheck.rows[0].table_count) > 0) {
          testResults.hasData = true;
          console.log('   ✅ Setup creates data tables');
        } else {
          testResults.errors.push('Setup SQL does not create any data tables');
          console.log('   ⚠️  No data tables created');
        }
        
        // Test 3: Solution SQL execution
        console.log('   🎯 Testing solution SQL...');
        const solutionResult = await validationService.executionPool.query(problem.solution_sql);
        testResults.solutionSqlValid = true;
        
        if (solutionResult.rows && solutionResult.rows.length > 0) {
          console.log(`   ✅ Solution works (${solutionResult.rows.length} rows returned)`);
        } else {
          testResults.errors.push('Solution SQL returns no results (may be expected)');
          console.log('   ✅ Solution executes (0 rows returned)');
        }
        
        // Test 4: Validation system test
        console.log('   🔍 Testing validation system...');
        const validation = await validationService.validateSolution(
          problem.solution_sql, 
          problem.id, 
          'postgresql'
        );
        
        if (validation.isCorrect) {
          testResults.validationWorks = true;
          console.log('   ✅ Validation system works');
        } else {
          testResults.errors.push(`Validation failed: ${validation.message}`);
          console.log(`   ❌ Validation failed: ${validation.message}`);
        }
        
        // Overall assessment - more lenient criteria
        const criticalTestsPassed = testResults.setupSqlValid && testResults.solutionSqlValid && testResults.validationWorks;
        
        if (criticalTestsPassed) {
          console.log('   🎉 ALL CRITICAL TESTS PASSED');
          totalPassed++;
          difficultyStats[problem.difficulty].passed++;
          
          // Note if there are warnings but still count as passed
          if (!testResults.hasData) {
            warningProblems.push({
              title: problem.title,
              difficulty: problem.difficulty,
              issues: testResults.errors
            });
          }
        } else {
          console.log('   ❌ FAILED');
          totalFailed++;
          difficultyStats[problem.difficulty].failed++;
          failedProblems.push({
            title: problem.title,
            difficulty: problem.difficulty,
            errors: testResults.errors
          });
        }
        
      } catch (error) {
        console.log(`   ❌ CRITICAL ERROR: ${error.message}`);
        totalFailed++;
        difficultyStats[problem.difficulty].failed++;
        failedProblems.push({
          title: problem.title,
          difficulty: problem.difficulty,
          errors: [error.message]
        });
      }
      
      console.log(''); // Empty line for readability
      
      // Progress checkpoint every 20 problems
      if (problemNum % 20 === 0) {
        console.log(`📈 CHECKPOINT: ${problemNum}/${problems.length} complete (${Math.round((totalPassed/problemNum)*100)}% success rate)`);
        console.log('');
      }
    }
    
    // Final Summary Report
    console.log('=' .repeat(70));
    console.log('🏆 FINAL VALIDATION REPORT');
    console.log('=' .repeat(70));
    
    console.log(`📊 OVERALL RESULTS:`);
    console.log(`   ✅ PASSED: ${totalPassed}/${problems.length} (${Math.round((totalPassed/problems.length)*100)}%)`);
    console.log(`   ❌ FAILED: ${totalFailed}/${problems.length} (${Math.round((totalFailed/problems.length)*100)}%)`);
    console.log(`   ⚠️  WARNINGS: ${warningProblems.length}`);
    
    console.log(`\n📈 BY DIFFICULTY:`);
    ['easy', 'medium', 'hard'].forEach(difficulty => {
      const stats = difficultyStats[difficulty];
      const total = stats.passed + stats.failed;
      const successRate = total > 0 ? Math.round((stats.passed/total)*100) : 0;
      console.log(`   ${difficulty.toUpperCase()}: ${stats.passed}/${total} passed (${successRate}%)`);
    });
    
    // Show failures if any
    if (failedProblems.length > 0) {
      console.log(`\n❌ FAILED PROBLEMS (${failedProblems.length}):`);
      failedProblems.forEach((fp, i) => {
        console.log(`   ${i+1}. ${fp.difficulty.toUpperCase()}: ${fp.title}`);
        fp.errors.forEach(error => console.log(`      - ${error}`));
      });
    }
    
    // Show warnings if any
    if (warningProblems.length > 0) {
      console.log(`\n⚠️  PROBLEMS WITH WARNINGS (${warningProblems.length}):`);
      warningProblems.forEach((wp, i) => {
        console.log(`   ${i+1}. ${wp.difficulty.toUpperCase()}: ${wp.title}`);
        wp.issues.forEach(issue => console.log(`      - ${issue}`));
      });
    }
    
    // Final assessment
    const overallSuccessRate = Math.round((totalPassed/problems.length)*100);
    console.log(`\n🎯 QUALITY ASSESSMENT:`);
    
    if (overallSuccessRate >= 95) {
      console.log('   🏆 EXCELLENT! Platform ready for production');
    } else if (overallSuccessRate >= 85) {
      console.log('   ✅ GOOD! Minor issues to address');
    } else if (overallSuccessRate >= 70) {
      console.log('   ⚠️  FAIR! Several issues need attention');
    } else {
      console.log('   ❌ POOR! Major issues require immediate attention');
    }
    
    // Summary for user
    if (overallSuccessRate === 100) {
      console.log(`\n🎉 SUCCESS! All ${problems.length} problems are working perfectly!`);
    } else {
      console.log(`\n📊 STATUS: ${totalPassed}/${problems.length} problems working (${overallSuccessRate}% success rate)`);
    }
    
    console.log('=' .repeat(70));
    
  } catch (error) {
    console.error('❌ VALIDATION SCRIPT ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

validate91Problems().catch(console.error);