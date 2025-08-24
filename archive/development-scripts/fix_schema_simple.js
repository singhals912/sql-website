#!/usr/bin/env node
/**
 * Simple Schema Data Fix - Manually fix Problem #2 first as example
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sql_practice',
  user: 'postgres',
  password: 'password'
});

async function fixProblem2() {
  console.log('🔧 Fixing Problem #2 - ABN AMRO Corporate Banking Risk Analytics\n');
  
  try {
    // Create expanded setup SQL for problem #2 with 25 rows
    const expandedSetupSQL = `
      CREATE TABLE corporate_risk_profiles (
          profile_id INT PRIMARY KEY,
          client_industry VARCHAR(50),
          risk_score DECIMAL(4,2),
          exposure_millions DECIMAL(8,2),
          probability_default DECIMAL(5,4)
      );
      INSERT INTO corporate_risk_profiles VALUES
      (1, 'Oil & Gas', 7.5, 125.50, 0.0350),
      (2, 'Technology', 4.2, 85.25, 0.0120),
      (3, 'Manufacturing', 6.8, 220.75, 0.0280),
      (4, 'Real Estate', 8.2, 180.90, 0.0420),
      (5, 'Healthcare', 3.5, 95.80, 0.0080),
      (6, 'Oil & Gas_1', 7.6, 135.50, 0.0360),
      (7, 'Technology_1', 4.3, 95.25, 0.0130),
      (8, 'Manufacturing_1', 6.9, 230.75, 0.0290),
      (9, 'Real Estate_1', 8.3, 190.90, 0.0430),
      (10, 'Healthcare_1', 3.6, 105.80, 0.0090),
      (11, 'Oil & Gas_2', 7.7, 145.50, 0.0370),
      (12, 'Technology_2', 4.4, 105.25, 0.0140),
      (13, 'Manufacturing_2', 7.0, 240.75, 0.0300),
      (14, 'Real Estate_2', 8.4, 200.90, 0.0440),
      (15, 'Healthcare_2', 3.7, 115.80, 0.0100),
      (16, 'Oil & Gas_3', 7.8, 155.50, 0.0380),
      (17, 'Technology_3', 4.5, 115.25, 0.0150),
      (18, 'Manufacturing_3', 7.1, 250.75, 0.0310),
      (19, 'Real Estate_3', 8.5, 210.90, 0.0450),
      (20, 'Healthcare_3', 3.8, 125.80, 0.0110),
      (21, 'Financial_Services', 6.2, 175.40, 0.0250),
      (22, 'Retail', 5.8, 90.15, 0.0220),
      (23, 'Telecommunications', 4.9, 155.60, 0.0180),
      (24, 'Energy', 7.9, 165.80, 0.0390),
      (25, 'Automotive', 6.5, 145.25, 0.0270);`;

    // Update the database
    const result = await pool.query(`
      UPDATE problem_schemas 
      SET setup_sql = $1
      WHERE problem_id = (
        SELECT id FROM problems WHERE numeric_id = 2
      ) AND sql_dialect = 'postgresql'
    `, [expandedSetupSQL]);

    console.log(`✅ Updated ${result.rowCount} schema(s) for Problem #2`);
    
    // Verify the update
    const verification = await pool.query(`
      SELECT LENGTH(setup_sql) as length, 
             (setup_sql LIKE '%profile_id%25%') as has_25_rows
      FROM problem_schemas ps
      JOIN problems p ON ps.problem_id = p.id
      WHERE p.numeric_id = 2 AND ps.sql_dialect = 'postgresql'
    `);
    
    if (verification.rows.length > 0) {
      const row = verification.rows[0];
      console.log(`📊 Setup SQL length: ${row.length} characters`);
      console.log(`🎯 Contains 25 rows: ${row.has_25_rows ? 'YES' : 'NO'}`);
    }
    
    console.log('\n🎉 Problem #2 schema permanently fixed!');
    console.log('💪 Now when you navigate to Problem #2, it will have 25 rows!');
    
  } catch (error) {
    console.error('💥 Failed to fix Problem #2:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixProblem2()
  .then(() => {
    console.log('\n✅ Schema fix completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  });