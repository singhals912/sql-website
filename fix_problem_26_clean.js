// Fix Problem 26 with clean data
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

async function fixProblem26() {
    const problemId = 26;
    
    try {
        console.log('🔧 Fixing Problem #26 with clean data');
        
        // Get solution SQL
        const solutionResult = await mainPool.query(`
            SELECT ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        const solutionSql = solutionResult.rows[0].solution_sql;
        console.log('Solution SQL:', solutionSql.substring(0, 100) + '...');
        
        // Setup clean environment with ONLY original data (first 5 rows)
        await sandboxPool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
        
        const cleanSetupSql = `
            CREATE TABLE fidelity_portfolio_optimization (
                asset_id INT PRIMARY KEY,
                asset_class VARCHAR(50),
                portfolio_allocation DECIMAL(8,4),
                annual_return_rate DECIMAL(8,6),
                volatility DECIMAL(8,6),
                sharpe_ratio DECIMAL(6,4),
                risk_score DECIMAL(6,4),
                benchmark_return DECIMAL(8,6),
                portfolio_date DATE
            );
            
            INSERT INTO fidelity_portfolio_optimization VALUES
            (1, 'US Large Cap Equities', 0.3500, 0.1050, 0.1650, 0.6364, 12.5000, 0.0925, '2024-01-15'),
            (2, 'International Equities', 0.2500, 0.0875, 0.1825, 0.4795, 16.2500, 0.0785, '2024-01-15'),
            (3, 'Fixed Income', 0.2000, 0.0425, 0.0650, 0.6538, 8.7500, 0.0385, '2024-01-16'),
            (4, 'REITs', 0.1000, 0.0950, 0.2250, 0.4222, 18.5000, 0.0825, '2024-01-16'),
            (5, 'Private Equity', 0.1500, 0.1250, 0.2850, 0.4386, 22.8000, 0.1050, '2024-01-17');
        `;
        
        await sandboxPool.query(cleanSetupSql);
        console.log('✅ Clean environment setup complete');
        
        // Execute solution with clean data
        const result = await sandboxPool.query(solutionSql);
        const rows = result.rows;
        
        console.log(`✅ Solution executed: ${rows.length} rows returned`);
        console.log('Clean results:', JSON.stringify(rows, null, 2));
        
        // Convert all values to strings for consistent comparison
        const stringRows = rows.map(row => {
            const stringRow = {};
            for (const [key, value] of Object.entries(row)) {
                stringRow[key] = value !== null ? String(value) : null;
            }
            return stringRow;
        });
        
        // Update expected output with clean results
        await mainPool.query(`
            UPDATE problem_schemas 
            SET expected_output = $1::jsonb
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [JSON.stringify(stringRows), problemId]);
        
        console.log('✅ Expected output updated with clean data');
        
        // Also update the setup SQL to only include clean data
        await mainPool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [cleanSetupSql, problemId]);
        
        console.log('✅ Setup SQL cleaned - removed contaminated test data');
        
        console.log('\n🎉 Problem #26 fixed with clean data!');
        console.log(`Expected ${stringRows.length} rows instead of 9`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

fixProblem26();