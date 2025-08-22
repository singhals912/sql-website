const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testProblem96() {
  console.log('🧪 TESTING PROBLEM #096');
  console.log('=' .repeat(50));
  
  try {
    // Get problem details
    const problemQuery = await pool.query(`
      SELECT 
        p.numeric_id, 
        p.title, 
        p.description,
        ps.setup_sql,
        ps.solution_sql,
        ps.explanation
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.numeric_id = 96
    `);
    
    if (problemQuery.rows.length === 0) {
      console.log('❌ Problem #096 not found');
      return;
    }
    
    const problem = problemQuery.rows[0];
    console.log(`📋 Title: ${problem.title}`);
    console.log(`📝 Description length: ${problem.description.length} characters`);
    console.log(`🗂️  Has setup SQL: ${problem.setup_sql ? 'Yes' : 'No'}`);
    console.log(`🔧 Has solution SQL: ${problem.solution_sql ? 'Yes' : 'No'}`);
    
    // Test business context structure
    const hasBusinessContext = problem.description.includes('Business Context');
    const hasScenario = problem.description.includes('Scenario'); 
    const hasProblem = problem.description.includes('Problem');
    const hasExpectedOutput = problem.description.includes('Expected Output');
    
    console.log(`\n📊 DESCRIPTION QUALITY CHECK:`);
    console.log(`   Business Context: ${hasBusinessContext ? '✅' : '❌'}`);
    console.log(`   Scenario: ${hasScenario ? '✅' : '❌'}`);
    console.log(`   Problem Statement: ${hasProblem ? '✅' : '❌'}`);
    console.log(`   Expected Output: ${hasExpectedOutput ? '✅' : '❌'}`);
    
    // Test SQL execution
    if (problem.setup_sql && problem.solution_sql) {
      console.log(`\n🔍 SQL EXECUTION TEST:`);
      try {
        await pool.query('BEGIN');
        console.log('   📁 Running setup SQL...');
        await pool.query(problem.setup_sql);
        console.log('   ✅ Setup successful');
        
        console.log('   🎯 Running solution SQL...');
        const result = await pool.query(problem.solution_sql);
        console.log(`   ✅ Solution successful (${result.rows.length} results)`);
        
        if (result.rows.length > 0) {
          console.log('   📋 Sample result:');
          console.log('   ', JSON.stringify(result.rows[0], null, 2));
        }
        
        await pool.query('ROLLBACK');
        
      } catch (error) {
        console.log(`   ❌ SQL execution failed: ${error.message}`);
        await pool.query('ROLLBACK');
      }
    }
    
    // Overall assessment
    const isQualityProblem = hasBusinessContext && hasScenario && hasProblem && hasExpectedOutput;
    console.log(`\n🎯 OVERALL ASSESSMENT: ${isQualityProblem ? '✅ HIGH QUALITY' : '❌ NEEDS IMPROVEMENT'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await pool.end();
  }
}

testProblem96().catch(console.error);