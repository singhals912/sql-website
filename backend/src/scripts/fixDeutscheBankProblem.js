const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixDeutscheBankProblem() {
  try {
    // Get the problem ID first
    const problemResult = await pool.query('SELECT id FROM problems WHERE title = $1', ['Deutsche Bank Derivatives Risk Assessment']);
    
    if (problemResult.rows.length === 0) {
      console.log('❌ Deutsche Bank problem not found');
      return;
    }
    
    const problemId = problemResult.rows[0].id;
    console.log(`Found problem ID: ${problemId}`);
    
    const fixedSolutionSql = `WITH book_risk_metrics AS (
        SELECT 
            b.book_id,
            b.book_name,
            b.asset_class,
            b.book_value,
            SUM(p.market_value) as total_market_value,
            AVG(p.daily_pnl) as avg_daily_pnl,
            STDDEV(p.daily_pnl) as pnl_volatility,
            COUNT(p.position_id) as position_count,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY p.daily_pnl) as var_95
        FROM db_trading_books b
        JOIN db_positions p ON b.book_id = p.book_id
        GROUP BY b.book_id, b.book_name, b.asset_class, b.book_value
    ),
    risk_concentration AS (
        SELECT 
            *,
            ABS(var_95) / book_value as var_concentration,
            ABS(var_95) / total_market_value as market_var_ratio
        FROM book_risk_metrics
    )
    SELECT 
        book_name,
        asset_class,
        ROUND(CAST(book_value / 1000000 AS NUMERIC), 0) as book_value_millions,
        ROUND(CAST(ABS(var_95) / 1000 AS NUMERIC), 0) as var_95_thousands,
        ROUND(CAST(var_concentration * 100 AS NUMERIC), 3) as var_concentration_percent,
        ROUND(CAST(market_var_ratio * 100 AS NUMERIC), 3) as market_var_ratio_percent,
        position_count
    FROM risk_concentration
    WHERE var_concentration > 0.05
    ORDER BY var_concentration DESC;`;

    await pool.query('UPDATE problem_schemas SET solution_sql = $1 WHERE problem_id = $2', [fixedSolutionSql, problemId]);
    
    console.log('✅ Fixed Deutsche Bank problem ROUND function issue');
    
    // Test the fixed solution
    console.log('🧪 Testing the fixed solution...');
    const ValidationService = require('../services/validationService');
    const validationService = new ValidationService();
    
    // Get the setup SQL
    const schemaResult = await pool.query('SELECT setup_sql FROM problem_schemas WHERE problem_id = $1', [problemId]);
    const setupSql = schemaResult.rows[0].setup_sql;
    
    // Setup environment and test
    await validationService.setupProblemEnvironment(setupSql);
    const testResult = await validationService.executionPool.query(fixedSolutionSql);
    console.log(`✅ Fixed solution works! Returned ${testResult.rows.length} rows`);
    
  } catch (error) {
    console.error('❌ Error fixing Deutsche Bank problem:', error.message);
  } finally {
    await pool.end();
  }
}

fixDeutscheBankProblem().catch(console.error);