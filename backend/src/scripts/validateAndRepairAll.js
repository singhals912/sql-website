const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function validateAndRepairAll() {
  console.log('🔍 COMPREHENSIVE VALIDATION & REPAIR');
  console.log('Testing ALL 91 problems and fixing any that return unexpected results\n');
  
  let totalTested = 0;
  let totalWorking = 0;
  let totalFixed = 0;
  let totalSkipped = 0;
  
  try {
    // Get all active problems
    const problemsQuery = `
      SELECT p.numeric_id, p.title, ps.setup_sql, ps.solution_sql
      FROM problems p
      JOIN problem_schemas ps ON p.id = ps.problem_id  
      WHERE p.is_active = true
      ORDER BY p.numeric_id ASC
    `;
    
    const problemsResult = await pool.query(problemsQuery);
    console.log(`Found ${problemsResult.rows.length} active problems to test\n`);
    
    for (const problem of problemsResult.rows) {
      totalTested++;
      const shortTitle = problem.title.substring(0, 40) + (problem.title.length > 40 ? '...' : '');
      
      try {
        // Test in isolation
        await pool.query('BEGIN');
        await pool.query('DROP SCHEMA IF EXISTS test_repair CASCADE');
        await pool.query('CREATE SCHEMA test_repair');
        await pool.query('SET search_path TO test_repair');
        
        // Setup problem
        await pool.query(problem.setup_sql);
        
        // Test solution
        const result = await pool.query(problem.solution_sql);
        const rowCount = result.rows.length;
        
        if (rowCount > 0) {
          console.log(`✅ #${problem.numeric_id.toString().padStart(2, '0')}: ${shortTitle} (${rowCount} rows)`);
          totalWorking++;
        } else {
          console.log(`⚠️  #${problem.numeric_id.toString().padStart(2, '0')}: ${shortTitle} (0 rows) - NEEDS REPAIR`);
          
          // Attempt repair by scaling up data values  
          const repairedSql = repairDataValues(problem.setup_sql, problem.solution_sql);
          
          if (repairedSql !== problem.setup_sql) {
            // Test repair
            await pool.query('DROP SCHEMA test_repair CASCADE');
            await pool.query('CREATE SCHEMA test_repair');
            await pool.query('SET search_path TO test_repair');
            await pool.query(repairedSql);
            
            const repairedResult = await pool.query(problem.solution_sql);
            
            if (repairedResult.rows.length > 0) {
              // Apply fix
              await pool.query('ROLLBACK');
              await pool.query(`
                UPDATE problem_schemas 
                SET setup_sql = $1
                WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2)
              `, [repairedSql, problem.numeric_id]);
              
              console.log(`   🔧 REPAIRED! Now returns ${repairedResult.rows.length} rows`);
              totalFixed++;
            } else {
              console.log(`   ❌ Auto-repair failed - manual intervention needed`);
              totalSkipped++;
            }
          } else {
            console.log(`   ⏭️  No repair strategy available - skipping`);
            totalSkipped++;
          }
        }
        
        await pool.query('ROLLBACK');
        
      } catch (error) {
        await pool.query('ROLLBACK');
        console.log(`❌ #${problem.numeric_id.toString().padStart(2, '0')}: ${shortTitle} - ERROR: ${error.message.substring(0, 50)}...`);
        totalSkipped++;
      }
      
      // Progress indicator
      if (totalTested % 10 === 0) {
        console.log(`\n📊 Progress: ${totalTested}/${problemsResult.rows.length} tested\n`);
      }
    }
    
    console.log(`\n🏁 FINAL RESULTS:`);
    console.log(`   📋 Total problems tested: ${totalTested}`);
    console.log(`   ✅ Already working: ${totalWorking} (${Math.round((totalWorking/totalTested)*100)}%)`);  
    console.log(`   🔧 Successfully repaired: ${totalFixed}`);
    console.log(`   ⏭️  Skipped (needs manual fix): ${totalSkipped}`);
    console.log(`   🎯 Final success rate: ${Math.round(((totalWorking + totalFixed)/totalTested)*100)}%`);
    
    if (totalFixed > 0) {
      console.log(`\n✨ ${totalFixed} problems were automatically repaired!`);
      console.log('🔄 Please test the platform now - problems should return results.');
    }
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
  } finally {
    await pool.end();
  }
}

function repairDataValues(setupSql, solutionSql) {
  // Analyze the solution to understand what kind of values are expected
  let repairedSql = setupSql;
  
  // Strategy 1: If solution has HAVING with numeric thresholds, scale up data
  const havingMatches = solutionSql.match(/HAVING[\s\S]*?(\d+)/gi);
  if (havingMatches) {
    const thresholds = havingMatches.map(match => {
      const nums = match.match(/\d+/g);
      return nums ? Math.max(...nums.map(n => parseInt(n))) : 0;
    });
    
    const maxThreshold = Math.max(...thresholds);
    
    if (maxThreshold > 1000) {
      // Scale up monetary values to meet threshold
      repairedSql = repairedSql.replace(/(\d+)\.(\d{2})/g, (match) => {
        const value = parseFloat(match);
        const scaled = value * Math.ceil(maxThreshold / value * 1.5);
        return scaled.toFixed(2);
      });
    }
  }
  
  // Strategy 2: If solution has WHERE with date ranges, ensure date spread  
  if (solutionSql.includes('DATE') || solutionSql.includes('BETWEEN')) {
    // Add more date variety (handled in original data)
  }
  
  // Strategy 3: If solution groups by categories, ensure variety
  if (solutionSql.includes('GROUP BY') && !solutionSql.includes('HAVING')) {
    // Ensure we have enough data variety in grouped columns
    repairedSql = repairedSql.replace(/INSERT INTO[\s\S]*?;/gi, (match) => {
      // Add more rows by duplicating and varying data
      if (match.includes('VALUES') && (match.match(/\(/g) || []).length < 8) {
        // If less than 8 rows, add some variations
        const baseRows = match.substring(match.indexOf('VALUES') + 6, match.length - 1);
        const additionalRows = baseRows + ',' + baseRows.replace(/\d+/g, (num) => {
          const n = parseInt(num);
          return (n < 10) ? n : Math.floor(n * 1.2); // Scale up non-ID numbers  
        });
        return match.replace(baseRows, additionalRows);
      }
      return match;
    });
  }
  
  return repairedSql;
}

if (require.main === module) {
  validateAndRepairAll().catch(console.error);
}