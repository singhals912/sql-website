// Debug Problem 26 setup process
const { Pool } = require('pg');

const sandboxPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sandbox',
    password: 'password',
    port: 5433,
});

const mainPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sql_practice',
    password: 'password',
    port: 5432,
});

async function debugProblem26Setup() {
    try {
        console.log('🔍 Debugging Problem #26 setup process');
        
        // Check what's stored in the database
        const dbResult = await mainPool.query(`
            SELECT ps.setup_sql, ps.expected_output
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = 26 AND ps.sql_dialect = 'postgresql'
        `);
        
        const { setup_sql, expected_output } = dbResult.rows[0];
        
        console.log('\\n📋 Database setup SQL (first 200 chars):');
        console.log(setup_sql.substring(0, 200) + '...');
        
        console.log('\\n📊 Expected output:');
        console.log(JSON.stringify(expected_output, null, 2));
        
        // Manually run the setup
        console.log('\\n🔧 Manually running setup...');
        await sandboxPool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
        await sandboxPool.query(setup_sql);
        
        // Check what data is in the table
        const dataCheck = await sandboxPool.query('SELECT * FROM fidelity_portfolio_optimization ORDER BY asset_id');
        console.log(`\\n📊 Table data: ${dataCheck.rows.length} rows`);
        dataCheck.rows.forEach((row, i) => {
            console.log(`  Row ${i+1}: ${row.asset_class} | return: ${row.annual_return_rate} | risk: ${row.risk_score}`);
        });
        
        // Run the solution
        const solutionSql = `SELECT 
            asset_class,
            ROUND(CAST(portfolio_allocation * 100 AS NUMERIC), 2) as allocation_pct,
            ROUND(CAST(annual_return_rate * 100 AS NUMERIC), 2) as annual_return_pct,
            ROUND(CAST(volatility * 100 AS NUMERIC), 2) as volatility_pct,
            ROUND(CAST(sharpe_ratio AS NUMERIC), 4) as sharpe_ratio,
            ROUND(CAST(risk_score AS NUMERIC), 2) as risk_score
        FROM fidelity_portfolio_optimization 
        WHERE annual_return_rate > 0.08 AND risk_score < 15
        ORDER BY annual_return_pct DESC`;
        
        console.log('\\n🔍 Running solution...');
        const solutionResult = await sandboxPool.query(solutionSql);
        console.log(`Solution results: ${solutionResult.rows.length} rows`);
        solutionResult.rows.forEach((row, i) => {
            console.log(`  Result ${i+1}: ${JSON.stringify(row)}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

debugProblem26Setup();