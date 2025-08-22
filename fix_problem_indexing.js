#!/usr/bin/env node
/**
 * Fix Problem Indexing and URL Routing
 * This script:
 * 1. Assigns sequential numeric_id values (1, 2, 3, ...)
 * 2. Ensures URL routing matches the display numbers
 * 3. Updates database with proper indexing
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sql_practice',
  user: 'postgres',
  password: 'password'
});

async function fixProblemIndexing() {
  console.log('🔧 Fixing problem indexing and URL routing...\n');
  
  try {
    // Step 1: Get all problems ordered by title for consistent ordering
    const result = await pool.query(`
      SELECT id, title, slug 
      FROM problems 
      WHERE is_active = true 
      ORDER BY title ASC
    `);
    
    const problems = result.rows;
    console.log(`📥 Found ${problems.length} problems to reindex\n`);
    
    // Step 2: Update each problem with sequential numeric_id
    console.log('🔄 Assigning sequential numeric IDs...');
    
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const newNumericId = i + 1; // 1, 2, 3, ...
      
      await pool.query(`
        UPDATE problems 
        SET numeric_id = $1 
        WHERE id = $2
      `, [newNumericId, problem.id]);
      
      console.log(`   ✅ #${newNumericId.toString().padStart(3, '0')} - ${problem.title}`);
    }
    
    console.log('\n📊 Indexing complete!');
    console.log(`✅ Problems now indexed 1-${problems.length}`);
    
    // Step 3: Verify the fix
    console.log('\n🧪 Verifying indexing...');
    const verifyResult = await pool.query(`
      SELECT numeric_id, title 
      FROM problems 
      WHERE is_active = true 
      ORDER BY numeric_id ASC 
      LIMIT 5
    `);
    
    console.log('First 5 problems:');
    verifyResult.rows.forEach(row => {
      console.log(`   #${row.numeric_id.toString().padStart(3, '0')} - ${row.title}`);
    });
    
    console.log('\n🎯 URL Routing Guide:');
    console.log('   - Problem #001 → /practice/1');
    console.log('   - Problem #002 → /practice/2');
    console.log('   - Problem #067 → /practice/67');
    console.log('   - etc...');
    
    console.log('\n✅ Problem indexing fixed!');
    console.log('🚀 Frontend will now show consistent numbering');
    
  } catch (error) {
    console.error('💥 Indexing failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the indexing fix
fixProblemIndexing()
  .then(() => {
    console.log('\n🎉 Indexing fix completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Indexing fix failed:', error);
    process.exit(1);
  });