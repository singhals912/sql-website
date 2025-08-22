const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Fix Adobe data to have realistic values that meet the $1M criteria
const adobeDataFix = {
  setupSql: `CREATE TABLE adobe_subscriptions (
      subscription_id INT PRIMARY KEY,
      plan_name VARCHAR(50),
      monthly_revenue DECIMAL(12,2),
      subscriber_count INT,
      churn_rate DECIMAL(5,2),
      subscription_date DATE
  );
  INSERT INTO adobe_subscriptions VALUES 
  (1, 'Creative Cloud Enterprise', 1250000.75, 25000, 2.5, '2024-01-15'),
  (2, 'Creative Cloud Business', 1480000.25, 32000, 3.2, '2024-01-15'),
  (3, 'Creative Cloud Teams', 890000.60, 18000, 4.1, '2024-01-16'),
  (4, 'Creative Cloud Individual', 2250000.50, 78000, 5.8, '2024-01-16'),
  (5, 'Creative Cloud Student', 425000.80, 85000, 1.2, '2024-01-17'),
  (6, 'Document Cloud Enterprise', 1100000.00, 15000, 2.8, '2024-01-18'),
  (7, 'Experience Cloud', 1850000.25, 8500, 3.5, '2024-01-19'),
  (8, 'Adobe Stock', 750000.90, 42000, 6.2, '2024-01-20');`
};

async function fixAdobeData() {
  console.log('🔧 FIXING ADOBE SUBSCRIPTION DATA');
  console.log('Updating data to have realistic values that meet query criteria\n');
  
  try {
    // Update the Adobe problem schema
    const updateQuery = `
      UPDATE problem_schemas 
      SET setup_sql = $1
      WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = 2 AND is_active = true)
    `;
    
    const result = await pool.query(updateQuery, [adobeDataFix.setupSql]);
    
    if (result.rowCount > 0) {
      // Test the fix
      await pool.query('BEGIN');
      await pool.query('CREATE SCHEMA IF NOT EXISTS test_schema');
      await pool.query('SET search_path TO test_schema');
      await pool.query(adobeDataFix.setupSql);
      
      // Test the solution query
      const solutionQuery = `
        SELECT plan_name, SUM(monthly_revenue) as total_mrr
        FROM adobe_subscriptions 
        GROUP BY plan_name 
        HAVING SUM(monthly_revenue) > 1000000 
        ORDER BY total_mrr DESC
      `;
      
      const testResult = await pool.query(solutionQuery);
      
      await pool.query('ROLLBACK');
      
      console.log(`✅ Adobe data updated successfully!`);
      console.log(`📊 Query now returns ${testResult.rows.length} results (should be >0)`);
      console.log(`💰 Plans meeting >$1M criteria:`);
      testResult.rows.forEach(row => {
        console.log(`   - ${row.plan_name}: $${parseFloat(row.total_mrr).toLocaleString()}`);
      });
      
    } else {
      console.log('❌ Failed to update Adobe problem - problem not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    try { await pool.query('ROLLBACK'); } catch {}
  } finally {
    await pool.end();
  }
}

fixAdobeData().catch(console.error);