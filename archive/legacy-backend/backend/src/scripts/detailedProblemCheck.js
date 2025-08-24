const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkProblemDetails(problemId) {
  console.log(`🔍 DETAILED ANALYSIS - PROBLEM #${problemId.toString().padStart(3, '0')}`);
  console.log('=' .repeat(70));
  
  try {
    const result = await pool.query(`
      SELECT 
        p.numeric_id, 
        p.title, 
        p.description,
        p.difficulty,
        ps.setup_sql,
        ps.solution_sql,
        ps.explanation
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.numeric_id = $1
    `, [problemId]);
    
    if (result.rows.length === 0) {
      console.log('❌ Problem not found');
      return;
    }
    
    const problem = result.rows[0];
    
    console.log(`📋 BASIC INFO:`);
    console.log(`   Title: ${problem.title}`);
    console.log(`   Difficulty: ${problem.difficulty}`);
    console.log(`   Description Length: ${problem.description.length} characters`);
    
    console.log(`\n📝 DESCRIPTION CONTENT:`);
    console.log(problem.description);
    
    console.log(`\n📊 QUALITY ASSESSMENT:`);
    const hasBusinessContext = problem.description.includes('Business Context');
    const hasScenario = problem.description.includes('Scenario'); 
    const hasProblemSection = problem.description.includes('Problem');
    const hasExpectedOutput = problem.description.includes('Expected Output');
    const hasProperLength = problem.description.length > 200;
    
    console.log(`   Business Context: ${hasBusinessContext ? '✅' : '❌'}`);
    console.log(`   Scenario: ${hasScenario ? '✅' : '❌'}`);
    console.log(`   Problem Statement: ${hasProblemSection ? '✅' : '❌'}`);
    console.log(`   Expected Output: ${hasExpectedOutput ? '✅' : '❌'}`);
    console.log(`   Adequate Length: ${hasProperLength ? '✅' : '❌'}`);
    
    console.log(`\n🗂️  SQL SCHEMA:`);
    if (problem.setup_sql) {
      console.log(problem.setup_sql);
    } else {
      console.log('❌ No setup SQL found');
    }
    
    console.log(`\n🔧 SOLUTION SQL:`);
    if (problem.solution_sql) {
      console.log(problem.solution_sql);
    } else {
      console.log('❌ No solution SQL found');
    }
    
    console.log(`\n📖 EXPLANATION:`);
    if (problem.explanation) {
      console.log(problem.explanation);
    } else {
      console.log('❌ No explanation found');
    }
    
    // Overall assessment
    const qualityIssues = [
      !hasBusinessContext && 'Missing Business Context',
      !hasScenario && 'Missing Scenario', 
      !hasProblemSection && 'Missing Problem Statement',
      !hasExpectedOutput && 'Missing Expected Output',
      !hasProperLength && 'Description too short'
    ].filter(Boolean);
    
    console.log(`\n🎯 OVERALL ASSESSMENT:`);
    if (qualityIssues.length === 0) {
      console.log('✅ HIGH QUALITY - Ready for Fortune 100 interviews');
    } else {
      console.log('❌ NEEDS IMPROVEMENT');
      console.log(`   Issues found: ${qualityIssues.length}`);
      qualityIssues.forEach(issue => console.log(`   • ${issue}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Get problem ID from command line argument
const problemId = process.argv[2] ? parseInt(process.argv[2]) : 48;
checkProblemDetails(problemId).catch(console.error);