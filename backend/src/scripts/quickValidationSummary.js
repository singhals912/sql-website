const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function quickValidationSummary() {
  console.log('🔍 QUICK VALIDATION SUMMARY');
  console.log('=' .repeat(50));
  
  try {
    // Sample 10 problems to quickly check validation status
    const sampleProblems = await pool.query(`
      SELECT p.id, p.title, p.difficulty, ps.setup_sql, ps.solution_sql
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.is_active = true 
      ORDER BY RANDOM()
      LIMIT 10
    `);
    
    console.log(`📊 Testing ${sampleProblems.rows.length} random problems...\n`);
    
    let passed = 0, failed = 0;
    const issues = [];
    
    for (const problem of sampleProblems.rows) {
      try {
        // Quick setup test
        await pool.query('BEGIN');
        await pool.query(problem.setup_sql);
        
        // Quick solution test  
        const result = await pool.query(problem.solution_sql);
        
        await pool.query('ROLLBACK');
        
        console.log(`✅ ${problem.difficulty.toUpperCase()}: ${problem.title} - OK`);
        passed++;
        
      } catch (error) {
        await pool.query('ROLLBACK');
        console.log(`❌ ${problem.difficulty.toUpperCase()}: ${problem.title} - ${error.message}`);
        failed++;
        issues.push({
          title: problem.title,
          difficulty: problem.difficulty,
          error: error.message
        });
      }
    }
    
    console.log(`\n📊 SAMPLE RESULTS:`);
    console.log(`   ✅ Passed: ${passed}/10 (${passed*10}%)`);
    console.log(`   ❌ Failed: ${failed}/10 (${failed*10}%)`);
    
    if (issues.length > 0) {
      console.log(`\n⚠️  ISSUES FOUND:`);
      issues.forEach((issue, i) => {
        console.log(`   ${i+1}. ${issue.title}: ${issue.error}`);
      });
    }
    
    // Get total count
    const totalCount = await pool.query('SELECT COUNT(*) as total FROM problems WHERE is_active = true');
    console.log(`\n📈 TOTAL PROBLEMS: ${totalCount.rows[0].total}/100`);
    
    // Estimate overall health
    const estimatedSuccessRate = (passed / 10) * 100;
    console.log(`\n🎯 ESTIMATED PLATFORM HEALTH: ${estimatedSuccessRate}%`);
    
    if (estimatedSuccessRate >= 80) {
      console.log('✅ Platform appears to be in good condition!');
    } else {
      console.log('⚠️  Platform may need attention for some problems');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

quickValidationSummary().catch(console.error);