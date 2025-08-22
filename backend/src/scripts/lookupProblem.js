const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function lookupProblem(numericId) {
  try {
    const result = await pool.query(`
      SELECT 
        numeric_id, 
        title, 
        difficulty, 
        slug,
        id as uuid,
        (SELECT name FROM categories c WHERE c.id = p.category_id) as category
      FROM problems p 
      WHERE numeric_id = $1 AND is_active = true
    `, [numericId]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Problem #${numericId.toString().padStart(3, '0')} not found`);
      return null;
    }
    
    const problem = result.rows[0];
    
    console.log('🔍 PROBLEM LOOKUP');
    console.log('=' .repeat(50));
    console.log(`ID: #${problem.numeric_id.toString().padStart(3, '0')}`);
    console.log(`Title: ${problem.title}`);
    console.log(`Difficulty: ${problem.difficulty.toUpperCase()}`);
    console.log(`Category: ${problem.category}`);
    console.log(`UUID: ${problem.uuid}`);
    console.log(`Slug: ${problem.slug}`);
    console.log('=' .repeat(50));
    
    return problem;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Command line usage
if (require.main === module) {
  const numericId = parseInt(process.argv[2]);
  
  if (!numericId || numericId < 1 || numericId > 100) {
    console.log('Usage: node lookupProblem.js <numeric_id>');
    console.log('Example: node lookupProblem.js 25');
    console.log('Valid range: 1-100');
    process.exit(1);
  }
  
  lookupProblem(numericId);
}

module.exports = { lookupProblem };