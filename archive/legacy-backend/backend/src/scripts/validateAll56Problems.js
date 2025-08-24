const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ValidationService = require('../services/validationService');
const validationService = new ValidationService();

async function validateAll56Problems() {
  console.log('🧪 COMPREHENSIVE VALIDATION OF ALL 56 PROBLEMS');
  console.log('=' .repeat(60));
  
  try {
    // Get all problems
    const problemsResult = await pool.query(`
      SELECT p.id, p.title, p.difficulty, c.name as category_name,
             ps.setup_sql, ps.solution_sql, ps.explanation
      FROM problems p 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.is_active = true AND ps.sql_dialect = 'postgresql'
      ORDER BY 
        CASE p.difficulty 
          WHEN 'easy' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'hard' THEN 3 
        END, p.title
    `);
    
    const problems = problemsResult.rows;
    console.log(`Found ${problems.length} problems to validate\n`);
    
    let passedCount = 0;
    let failedCount = 0;
    let totalCount = 0;
    const failedProblems = [];
    
    // Test each problem
    for (const problem of problems) {
      totalCount++;
      console.log(`\n${totalCount}. Testing ${problem.difficulty.toUpperCase()}: ${problem.title}`);
      console.log(`   Category: ${problem.category_name}`);
      
      try {
        // Test 1: Setup SQL execution
        console.log('   📝 Testing setup SQL...');
        await validationService.setupProblemEnvironment(problem.setup_sql);
        console.log('   ✅ Setup SQL executed successfully');
        
        // Test 2: Solution SQL execution  
        console.log('   🔍 Testing solution SQL...');
        const solutionResult = await validationService.executionPool.query(problem.solution_sql);
        console.log(`   ✅ Solution executed successfully (${solutionResult.rows.length} rows)`);
        
        // Test 3: Validation system test
        console.log('   🎯 Testing validation system...');
        const validation = await validationService.validateSolution(
          problem.solution_sql, 
          problem.id, 
          'postgresql'
        );
        
        if (validation.isCorrect) {
          console.log('   ✅ Validation passed - solution is correct');
          passedCount++;
        } else {
          console.log(`   ❌ Validation failed: ${validation.message}`);
          failedCount++;
          failedProblems.push({
            title: problem.title,
            difficulty: problem.difficulty,
            error: validation.message
          });
        }
        
        // Test 4: Schema parsing test (for frontend)
        console.log('   🏗️  Testing schema parsing...');
        const tableRegex = /CREATE TABLE (\w+)/gi;
        const tables = [];
        let match;
        while ((match = tableRegex.exec(problem.setup_sql)) !== null) {
          tables.push(match[1]);
        }
        
        if (tables.length > 0) {
          console.log(`   ✅ Schema parsing successful (${tables.length} tables: ${tables.join(', ')})`);
        } else {
          console.log('   ⚠️  No tables found in schema');
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        failedCount++;
        failedProblems.push({
          title: problem.title,
          difficulty: problem.difficulty,
          error: error.message
        });
      }
    }
    
    // Final results summary
    console.log('\n' + '=' .repeat(60));
    console.log('🏆 VALIDATION RESULTS SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Problems: ${totalCount}`);
    console.log(`✅ Passed: ${passedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`Success Rate: ${Math.round((passedCount / totalCount) * 100)}%`);
    
    // Distribution breakdown
    const distributionResult = await pool.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM problems 
      WHERE is_active = true 
      GROUP BY difficulty 
      ORDER BY 
        CASE difficulty 
          WHEN 'easy' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'hard' THEN 3 
        END
    `);
    
    console.log('\n📊 CURRENT DISTRIBUTION:');
    distributionResult.rows.forEach(row => {
      console.log(`${row.difficulty.toUpperCase()}: ${row.count} problems`);
    });
    
    const total = distributionResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log(`TOTAL: ${total} problems`);
    console.log(`REMAINING: ${100 - total} problems needed`);
    
    // Failed problems details
    if (failedProblems.length > 0) {
      console.log('\n❌ FAILED PROBLEMS:');
      failedProblems.forEach((problem, index) => {
        console.log(`${index + 1}. ${problem.difficulty.toUpperCase()}: ${problem.title}`);
        console.log(`   Error: ${problem.error}`);
      });
    } else {
      console.log('\n🎉 ALL PROBLEMS PASSED VALIDATION!');
      console.log('✅ Ready to proceed with creating the final 44 problems!');
    }
    
    console.log('\n' + '=' .repeat(60));
    
    // Test a few random problems in frontend format
    console.log('🖥️  FRONTEND FORMAT TESTING:');
    console.log('Testing schema parsing for frontend display...\n');
    
    const sampleProblems = problems.slice(0, 3);
    for (const problem of sampleProblems) {
      console.log(`Testing: ${problem.title}`);
      
      // Parse CREATE TABLE statements
      const createTableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
      const tables = [];
      let match;
      
      while ((match = createTableRegex.exec(problem.setup_sql)) !== null) {
        const tableName = match[1];
        const columnsText = match[2];
        
        const columns = columnsText
          .split(',')
          .map(col => col.trim())
          .filter(col => col.length > 0)
          .map(col => {
            const parts = col.split(' ');
            const name = parts[0];
            const type = parts.slice(1).join(' ').toUpperCase().replace(/,/g, '');
            return { name, type };
          });
        
        tables.push({ name: tableName, columns });
      }
      
      console.log(`  Tables found: ${tables.length}`);
      tables.forEach(table => {
        console.log(`    - ${table.name}: ${table.columns.length} columns`);
      });
      console.log('  ✅ Frontend schema parsing works\n');
    }
    
  } catch (error) {
    console.error('❌ Validation script error:', error);
  } finally {
    await pool.end();
    console.log('🏁 Validation complete!');
  }
}

validateAll56Problems().catch(console.error);