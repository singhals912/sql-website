const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixNumericOverflowIssues() {
  console.log('🔧 FIXING NUMERIC OVERFLOW ISSUES');
  console.log('=' .repeat(50));
  
  try {
    // Get problems with large numbers that cause overflow
    const problematicProblems = [
      'Walmart Supply Chain Efficiency Analytics',
      'Crédit Agricole Agricultural Finance Analytics', 
      'Goldman Sachs Prime Brokerage Analytics',
      'HSBC Trade Finance Analytics',
      'Morgan Stanley Institutional Securities Analytics',
      'Standard Chartered Emerging Markets Analytics',
      'UBS Wealth Management Analytics'
    ];
    
    for (const title of problematicProblems) {
      console.log(`🔧 Fixing: ${title}`);
      
      const problem = await pool.query(`
        SELECT p.id, ps.setup_sql, ps.solution_sql 
        FROM problems p 
        JOIN problem_schemas ps ON p.id = ps.problem_id 
        WHERE p.title = $1 AND p.is_active = true
      `, [title]);
      
      if (problem.rows.length === 0) {
        console.log(`   ⚠️  Problem not found: ${title}`);
        continue;
      }
      
      let setupSql = problem.rows[0].setup_sql;
      let solutionSql = problem.rows[0].solution_sql;
      
      // Fix numeric overflow by reducing large numbers to manageable sizes
      // Replace numbers > 10 billion with smaller equivalents
      setupSql = setupSql.replace(/(\d{11,})/g, (match) => {
        const num = parseInt(match);
        const reduced = Math.floor(num / 1000000); // Reduce by factor of 1M
        return reduced.toString();
      });
      
      // Also handle decimal numbers in case there are any
      setupSql = setupSql.replace(/(\d{8,})\.(\d+)/g, (match, whole, decimal) => {
        const num = parseInt(whole);
        if (num > 100000000) { // > 100M
          const reduced = Math.floor(num / 1000); // Reduce by factor of 1K
          return `${reduced}.${decimal}`;
        }
        return match;
      });
      
      // Update the problem schema
      await pool.query(`
        UPDATE problem_schemas 
        SET setup_sql = $1 
        WHERE problem_id = $2
      `, [setupSql, problem.rows[0].id]);
      
      console.log(`   ✅ Fixed numeric values in ${title}`);
    }
    
    console.log('\\n🎉 All numeric overflow issues have been addressed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixNumericOverflowIssues().catch(console.error);