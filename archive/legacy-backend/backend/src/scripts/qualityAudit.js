const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function auditAllProblems() {
  console.log('🔍 COMPREHENSIVE QUALITY AUDIT - ALL 100 PROBLEMS');
  console.log('=' .repeat(70));
  
  try {
    const problems = await pool.query(`
      SELECT 
        p.numeric_id, 
        p.title, 
        p.difficulty,
        p.description,
        ps.setup_sql,
        ps.solution_sql,
        ps.explanation
      FROM problems p 
      JOIN problem_schemas ps ON p.id = ps.problem_id 
      WHERE p.is_active = true 
      ORDER BY p.numeric_id ASC
    `);
    
    console.log(`📊 Auditing ${problems.rows.length} problems...\n`);
    
    let totalIssues = 0;
    const criticalProblems = [];
    const issues = {
      incompleteDescription: [],
      invalidSQL: [],
      emptyData: [],
      formatErrors: [],
      validationErrors: []
    };
    
    for (const problem of problems.rows) {
      console.log(`\n#${problem.numeric_id.toString().padStart(3, '0')} - ${problem.title}`);
      let problemIssues = 0;
      
      // 1. Check Description Quality
      if (problem.description.length < 100) {
        issues.incompleteDescription.push(problem.numeric_id);
        console.log('   ❌ Description too short');
        problemIssues++;
      }
      
      if (!problem.description.includes('Business Context') && 
          !problem.description.includes('Scenario') && 
          !problem.description.includes('Problem')) {
        issues.incompleteDescription.push(problem.numeric_id);
        console.log('   ❌ Missing business context structure');
        problemIssues++;
      }
      
      // 2. Check SQL Setup Quality
      try {
        await pool.query('BEGIN');
        await pool.query(problem.setup_sql);
        
        // Check if setup creates any data
        const tables = await pool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name NOT IN ('problems', 'problem_schemas', 'categories')
        `);
        
        if (tables.rows.length === 0) {
          issues.invalidSQL.push(problem.numeric_id);
          console.log('   ❌ Setup SQL creates no tables');
          problemIssues++;
        } else {
          // Check if tables have data
          for (const table of tables.rows) {
            const dataCheck = await pool.query(`SELECT COUNT(*) FROM ${table.table_name}`);
            if (parseInt(dataCheck.rows[0].count) === 0) {
              issues.emptyData.push(problem.numeric_id);
              console.log(`   ❌ Table ${table.table_name} has no data`);
              problemIssues++;
            }
          }
        }
        
        await pool.query('ROLLBACK');
      } catch (setupError) {
        issues.invalidSQL.push(problem.numeric_id);
        console.log(`   ❌ Setup SQL error: ${setupError.message}`);
        problemIssues++;
        await pool.query('ROLLBACK');
      }
      
      // 3. Check Solution SQL
      try {
        await pool.query('BEGIN');
        await pool.query(problem.setup_sql);
        const solutionResult = await pool.query(problem.solution_sql);
        
        if (!solutionResult.rows || solutionResult.rows.length === 0) {
          issues.validationErrors.push(problem.numeric_id);
          console.log('   ⚠️  Solution returns no results');
          problemIssues++;
        }
        
        await pool.query('ROLLBACK');
      } catch (solutionError) {
        issues.validationErrors.push(problem.numeric_id);
        console.log(`   ❌ Solution SQL error: ${solutionError.message}`);
        problemIssues++;
        await pool.query('ROLLBACK');
      }
      
      // 4. Check for common formatting issues
      if (problem.setup_sql.includes('DECIMAL(15,2'), 
          problem.setup_sql.includes('DECIMAL(12,2'), 
          problem.setup_sql.includes('2) ()')) {
        issues.formatErrors.push(problem.numeric_id);
        console.log('   ❌ SQL formatting errors detected');
        problemIssues++;
      }
      
      if (problemIssues === 0) {
        console.log('   ✅ No issues found');
      } else {
        totalIssues += problemIssues;
        if (problemIssues >= 3) {
          criticalProblems.push(problem.numeric_id);
        }
      }
    }
    
    // Summary Report
    console.log('\n' + '=' .repeat(70));
    console.log('📋 QUALITY AUDIT SUMMARY');
    console.log('=' .repeat(70));
    
    console.log(`🔍 TOTAL ISSUES FOUND: ${totalIssues}`);
    console.log(`🚨 CRITICAL PROBLEMS: ${criticalProblems.length} (3+ issues each)`);
    
    if (criticalProblems.length > 0) {
      console.log(`   Critical: ${criticalProblems.map(id => `#${id.toString().padStart(3, '0')}`).join(', ')}`);
    }
    
    console.log(`\n📊 ISSUE BREAKDOWN:`);
    console.log(`   Incomplete Descriptions: ${[...new Set(issues.incompleteDescription)].length} problems`);
    console.log(`   Invalid SQL: ${[...new Set(issues.invalidSQL)].length} problems`);
    console.log(`   Empty Data: ${[...new Set(issues.emptyData)].length} problems`);
    console.log(`   Format Errors: ${[...new Set(issues.formatErrors)].length} problems`);
    console.log(`   Validation Errors: ${[...new Set(issues.validationErrors)].length} problems`);
    
    // Priority Fix List
    if (totalIssues > 0) {
      console.log(`\n🎯 PRIORITY FIX LIST (worst first):`);
      
      // Create priority list based on issue count
      const problemIssueCount = {};
      Object.values(issues).forEach(issueList => {
        issueList.forEach(problemId => {
          problemIssueCount[problemId] = (problemIssueCount[problemId] || 0) + 1;
        });
      });
      
      const sortedByIssues = Object.entries(problemIssueCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20); // Top 20 worst problems
      
      sortedByIssues.forEach(([problemId, issueCount], index) => {
        console.log(`   ${(index + 1).toString().padStart(2, '0')}. Problem #${problemId.padStart(3, '0')} (${issueCount} issues)`);
      });
    }
    
    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    if (totalIssues > 50) {
      console.log('   🚨 CRITICAL: Major quality overhaul needed');
      console.log('   📝 Recommend: Systematic rewrite of worst problems');
    } else if (totalIssues > 20) {
      console.log('   ⚠️  MODERATE: Focused fixes needed on problem areas');
      console.log('   🔧 Recommend: Batch fix critical problems first');  
    } else {
      console.log('   ✅ MINOR: Small fixes needed');
      console.log('   🎯 Recommend: Individual problem fixes');
    }
    
  } catch (error) {
    console.error('❌ Audit error:', error.message);
  } finally {
    await pool.end();
  }
}

auditAllProblems().catch(console.error);