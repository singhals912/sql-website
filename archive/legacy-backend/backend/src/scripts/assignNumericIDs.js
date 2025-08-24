const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function assignNumericIDs() {
  console.log('🔢 ASSIGNING NUMERIC IDs TO ALL 100 PROBLEMS');
  console.log('=' .repeat(60));
  
  try {
    // First, add numeric_id column if it doesn't exist
    await pool.query(`
      ALTER TABLE problems 
      ADD COLUMN IF NOT EXISTS numeric_id INTEGER;
    `);
    
    // Get all problems ordered by difficulty and title for consistent numbering
    const problems = await pool.query(`
      SELECT id, title, difficulty 
      FROM problems 
      WHERE is_active = true 
      ORDER BY 
        CASE difficulty 
          WHEN 'easy' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'hard' THEN 3 
        END,
        title ASC
    `);
    
    console.log(`📊 Found ${problems.rows.length} problems to assign IDs...\n`);
    
    // Assign numeric IDs sequentially
    for (let i = 0; i < problems.rows.length; i++) {
      const problem = problems.rows[i];
      const numericId = i + 1;
      
      await pool.query(
        'UPDATE problems SET numeric_id = $1 WHERE id = $2',
        [numericId, problem.id]
      );
      
      console.log(`${numericId.toString().padStart(3, '0')}. [${problem.difficulty.toUpperCase()}] ${problem.title}`);
    }
    
    console.log(`\n✅ Successfully assigned numeric IDs 1-${problems.rows.length}`);
    
    // Create a comprehensive reference list
    console.log('\n' + '=' .repeat(60));
    console.log('📋 COMPLETE PROBLEM REFERENCE LIST');
    console.log('=' .repeat(60));
    
    const organizedProblems = await pool.query(`
      SELECT numeric_id, title, difficulty, slug
      FROM problems 
      WHERE is_active = true 
      ORDER BY numeric_id ASC
    `);
    
    let easyCount = 0, mediumCount = 0, hardCount = 0;
    
    organizedProblems.rows.forEach(problem => {
      const badge = problem.difficulty === 'easy' ? '🟢' : 
                   problem.difficulty === 'medium' ? '🟡' : '🔴';
      
      console.log(`${problem.numeric_id.toString().padStart(3, '0')}. ${badge} [${problem.difficulty.toUpperCase()}] ${problem.title}`);
      
      if (problem.difficulty === 'easy') easyCount++;
      else if (problem.difficulty === 'medium') mediumCount++;
      else hardCount++;
    });
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 DISTRIBUTION SUMMARY:');
    console.log(`🟢 Easy: ${easyCount} problems (IDs: 1-${easyCount})`);
    console.log(`🟡 Medium: ${mediumCount} problems (IDs: ${easyCount + 1}-${easyCount + mediumCount})`);
    console.log(`🔴 Hard: ${hardCount} problems (IDs: ${easyCount + mediumCount + 1}-${easyCount + mediumCount + hardCount})`);
    console.log(`📊 TOTAL: ${easyCount + mediumCount + hardCount}/100 problems`);
    
    console.log('\n💡 USAGE INSTRUCTIONS:');
    console.log('   • Reference any problem by its numeric ID (001-100)');
    console.log('   • Example: "Fix problem #025" or "Check problem 025"');
    console.log('   • IDs are sorted by difficulty then alphabetically');
    console.log('   • 🟢 = Easy, 🟡 = Medium, 🔴 = Hard');
    
    console.log('\n✅ All problems now have numeric IDs for easy reference!');
    
  } catch (error) {
    console.error('❌ Error assigning numeric IDs:', error.message);
  } finally {
    await pool.end();
  }
}

assignNumericIDs().catch(console.error);