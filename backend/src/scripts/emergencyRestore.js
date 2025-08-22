const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function emergencyRestore() {
  console.log('🚨 EMERGENCY RECOVERY: Restoring all lost problems');
  console.log('=' .repeat(60));
  
  try {
    // First, create a backup of current state (even if empty)
    const backupResult = await pool.query(`
      CREATE TABLE IF NOT EXISTS problems_backup_${Date.now()} AS 
      SELECT * FROM problems;
    `);
    console.log('✅ Created backup table');
    
    // Check current count
    const currentCount = await pool.query('SELECT COUNT(*) as count FROM problems');
    console.log(`📊 Current problems in DB: ${currentCount.rows[0].count}`);
    
    // List of all batch scripts to run in order
    const batchScripts = [
      'simpleAdd.js',
      'add5More.js', 
      'addProblems_Batch6.js',
      'addProblems_Batch7.js',
      'addProblems_Batch8.js'
    ];
    
    console.log('🔄 Running batch scripts to restore problems...\n');
    
    let totalRestored = 0;
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    for (const script of batchScripts) {
      try {
        console.log(`▶️  Running ${script}...`);
        
        const { stdout, stderr } = await execAsync(`node ${script}`, {
          cwd: '/Users/ss/Downloads/Code/Vibe_coding/SQL_practice_website/backend/src/scripts'
        });
        
        if (stderr) {
          console.log(`⚠️  Warnings in ${script}:`, stderr);
        }
        
        // Count lines with "Successfully added" to track progress
        const successLines = stdout.split('\n').filter(line => 
          line.includes('✅ Successfully added') || line.includes('Added:')
        ).length;
        
        if (successLines > 0) {
          totalRestored += successLines;
          console.log(`✅ ${script}: Added problems successfully`);
        } else {
          console.log(`⚠️  ${script}: May have encountered issues`);
        }
        
      } catch (error) {
        console.error(`❌ Error running ${script}:`, error.message);
        console.log('🔄 Continuing with next script...\n');
      }
    }
    
    // Final verification
    const finalCount = await pool.query('SELECT COUNT(*) as count FROM problems');
    const finalProblemsCount = parseInt(finalCount.rows[0].count);
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 RECOVERY SUMMARY:`);
    console.log(`   Before: ${currentCount.rows[0].count} problems`);
    console.log(`   After:  ${finalProblemsCount} problems`);
    console.log(`   Restored: ${finalProblemsCount - parseInt(currentCount.rows[0].count)} problems`);
    
    // Distribution check
    const distribution = await pool.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM problems 
      WHERE is_active = true 
      GROUP BY difficulty 
      ORDER BY difficulty
    `);
    
    console.log('\n📈 DIFFICULTY DISTRIBUTION:');
    distribution.rows.forEach(row => {
      console.log(`   ${row.difficulty.toUpperCase()}: ${row.count}`);
    });
    
    if (finalProblemsCount >= 60) {
      console.log('\n🎉 RECOVERY SUCCESSFUL!');
      console.log('✅ Your problems have been restored!');
      
      // Test API endpoint
      console.log('\n🔍 Testing API connectivity...');
      try {
        const testQuery = await pool.query('SELECT id, title FROM problems LIMIT 3');
        console.log(`✅ Database queries working - Found ${testQuery.rows.length} sample problems`);
        testQuery.rows.forEach(row => {
          console.log(`   - ${row.title}`);
        });
      } catch (apiError) {
        console.error('❌ Database query test failed:', apiError.message);
      }
      
    } else {
      console.log('\n⚠️  PARTIAL RECOVERY');
      console.log(`Only restored ${finalProblemsCount} problems (expected 60+)`);
      console.log('Some batch scripts may have failed - manual review needed');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in recovery process:', error.message);
    console.log('\n🆘 MANUAL INTERVENTION REQUIRED');
    console.log('Database may be in inconsistent state');
  } finally {
    await pool.end();
  }
}

// Run recovery if this script is executed directly
if (require.main === module) {
  emergencyRestore().catch(console.error);
}

module.exports = { emergencyRestore };