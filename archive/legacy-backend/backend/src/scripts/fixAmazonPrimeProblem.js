const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixAmazonPrimeProblem() {
  try {
    console.log('🔨 Fixing Amazon Prime Video Problem #004...');
    
    // Update the setup SQL for problem 4
    const updateQuery = `
      UPDATE sql_problems 
      SET setup_sql = $1,
          solution_sql = $2
      WHERE numeric_id = 4
    `;
    
    const setupSql = `CREATE TABLE amazon_prime_subscribers (
        subscriber_id INT PRIMARY KEY,
        region VARCHAR(50),
        subscription_type VARCHAR(30),
        monthly_fee DECIMAL(6,2),
        signup_date DATE,
        content_hours_watched INT
    );

    -- Insert test data with sufficient subscribers per region
    -- North America: 1.25M subscribers
    INSERT INTO amazon_prime_subscribers 
    SELECT generate_series(1, 1250000) as subscriber_id,
           'North America' as region,
           'Prime Video' as subscription_type,
           8.99 as monthly_fee,
           CURRENT_DATE - interval '30 days' as signup_date,
           25 as content_hours_watched;

    -- Europe: 750K subscribers  
    INSERT INTO amazon_prime_subscribers 
    SELECT generate_series(1250001, 2000000) as subscriber_id,
           'Europe' as region,
           'Prime Video' as subscription_type,
           5.99 as monthly_fee,
           CURRENT_DATE - interval '45 days' as signup_date,
           18 as content_hours_watched;

    -- Asia Pacific: 1.1M subscribers
    INSERT INTO amazon_prime_subscribers 
    SELECT generate_series(2000001, 3100000) as subscriber_id,
           'Asia Pacific' as region,
           'Prime Video' as subscription_type,
           4.99 as monthly_fee,
           CURRENT_DATE - interval '60 days' as signup_date,
           32 as content_hours_watched;

    -- Latin America: 500K subscribers (below 1M threshold)
    INSERT INTO amazon_prime_subscribers 
    SELECT generate_series(3100001, 3600000) as subscriber_id,
           'Latin America' as region,
           'Prime Video' as subscription_type,
           3.99 as monthly_fee,
           CURRENT_DATE - interval '20 days' as signup_date,
           22 as content_hours_watched;`;

    const solutionSql = `SELECT region, COUNT(*) as total_subscribers
FROM amazon_prime_subscribers 
GROUP BY region 
HAVING COUNT(*) > 1000000 
ORDER BY total_subscribers DESC;`;

    await pool.query(updateQuery, [setupSql, solutionSql]);
    
    console.log('✅ Amazon Prime Video Problem #004 fixed successfully!');
    console.log('   - North America: 1.25M subscribers');
    console.log('   - Europe: 750K subscribers'); 
    console.log('   - Asia Pacific: 1.1M subscribers');
    console.log('   - Latin America: 500K subscribers');
    console.log('   Expected results: North America and Asia Pacific (>1M each)');
    
  } catch (error) {
    console.error('❌ Error fixing Amazon Prime Video problem:', error);
  } finally {
    await pool.end();
  }
}

fixAmazonPrimeProblem();