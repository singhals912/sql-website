const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixAllProblemData() {
  console.log('🔧 SYSTEMATIC FIX: Ensuring all problems have adequate data for their queries');
  console.log('This will test each problem and fix any that return 0 rows unexpectedly\n');
  
  let fixedCount = 0;
  let testedCount = 0;
  
  try {
    // Get all active problems with their solutions
    const problemsQuery = `
      SELECT p.numeric_id, p.title, ps.setup_sql, ps.solution_sql
      FROM problems p
      JOIN problem_schemas ps ON p.id = ps.problem_id  
      WHERE p.is_active = true
      ORDER BY p.numeric_id ASC
      LIMIT 20 -- Test first 20 problems to start
    `;
    
    const problemsResult = await pool.query(problemsQuery);
    
    for (const problem of problemsResult.rows) {
      console.log(`🧪 Testing Problem #${problem.numeric_id}: ${problem.title.substring(0, 50)}...`);
      testedCount++;
      
      try {
        // Test the problem in isolation
        await pool.query('BEGIN');
        await pool.query('CREATE SCHEMA IF NOT EXISTS test_schema');
        await pool.query('SET search_path TO test_schema');
        
        // Setup the problem data
        await pool.query(problem.setup_sql);
        
        // Run the solution query  
        const solutionResult = await pool.query(problem.solution_sql);
        
        if (solutionResult.rows.length === 0) {
          console.log(`   ⚠️  Problem returns 0 rows - needs data adjustment`);
          
          // Try to fix by scaling up the data values
          const fixedSetupSql = await scaleUpDataValues(problem.setup_sql);
          
          if (fixedSetupSql !== problem.setup_sql) {
            // Test the fix
            await pool.query('DROP SCHEMA IF EXISTS test_schema CASCADE');
            await pool.query('CREATE SCHEMA test_schema');
            await pool.query('SET search_path TO test_schema');
            await pool.query(fixedSetupSql);
            
            const fixedResult = await pool.query(problem.solution_sql);
            
            if (fixedResult.rows.length > 0) {
              // Apply the fix to the database
              const updateQuery = `
                UPDATE problem_schemas 
                SET setup_sql = $1
                WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2)
              `;
              
              await pool.query('ROLLBACK');
              await pool.query(updateQuery, [fixedSetupSql, problem.numeric_id]);
              
              console.log(`   ✅ Fixed! Now returns ${fixedResult.rows.length} rows`);
              fixedCount++;
            } else {
              console.log(`   ❌ Could not fix automatically`);
            }
          } else {
            console.log(`   ❌ No automatic fix available`);
          }
        } else {
          console.log(`   ✅ Working fine (${solutionResult.rows.length} rows)`);
        }
        
        await pool.query('ROLLBACK');
        
      } catch (error) {
        await pool.query('ROLLBACK');
        console.log(`   ❌ Error testing: ${error.message.substring(0, 60)}...`);
      }
    }
    
    console.log(`\n📊 RESULTS:`);
    console.log(`   🧪 Problems tested: ${testedCount}`);
    console.log(`   ✅ Problems fixed: ${fixedCount}`);
    console.log(`   📈 Success rate: ${Math.round(((testedCount - fixedCount)/testedCount) * 100)}% were already working`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function scaleUpDataValues(setupSql) {
  let fixedSql = setupSql;
  
  // Scale up monetary values that might be too small
  const moneyPatterns = [
    { regex: /(\d+)\.(\d{2})/g, multiplier: 10 }, // Scale decimal values by 10x
    { regex: /\b(\d{1,6})\b/g, multiplier: 5 }     // Scale small integers by 5x
  ];
  
  // Only apply if INSERT statements exist
  if (fixedSql.includes('INSERT INTO')) {
    // Find INSERT VALUES sections and scale numeric values
    fixedSql = fixedSql.replace(/INSERT INTO[\s\S]*?VALUES[\s\S]*?;/gi, (match) => {
      let scaledMatch = match;
      
      // Scale monetary values (format: 123.45)  
      scaledMatch = scaledMatch.replace(/(\d+)\.(\d{2})/g, (num) => {
        const scaled = parseFloat(num) * 10;
        return scaled.toFixed(2);
      });
      
      // Scale small integers (but preserve IDs and dates)
      scaledMatch = scaledMatch.replace(/,\s*(\d{1,6})(?=\s*[,)])/g, (match, num) => {
        // Don't scale obvious IDs (typically 1-1000) or years (2023, 2024)
        const numVal = parseInt(num);
        if (numVal >= 1 && numVal <= 1000) return match; // Skip IDs
        if (numVal >= 2020 && numVal <= 2030) return match; // Skip years
        
        const scaled = Math.floor(numVal * 3); // Scale by 3x
        return match.replace(num, scaled.toString());
      });
      
      return scaledMatch;
    });
  }
  
  return fixedSql;
}

if (require.main === module) {
  fixAllProblemData().catch(console.error);
}