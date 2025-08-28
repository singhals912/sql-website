const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Debug endpoint to inspect schema table and fix issues
router.post('/inspect-schemas', async (req, res) => {
    try {
        console.log('🔍 Inspecting problem_schemas table...');
        
        // Check if table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'problem_schemas'
            )
        `);
        
        if (!tableExists.rows[0].exists) {
            console.log('❌ problem_schemas table does not exist');
            return res.json({
                error: 'problem_schemas table does not exist',
                recommendation: 'Create the table first'
            });
        }
        
        // Get table structure
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'problem_schemas'
            ORDER BY ordinal_position
        `);
        
        // Count total schemas
        const totalCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        // Check specific advanced problems
        const advancedProblems = [37, 42, 43, 50, 60, 61];
        const schemaChecks = [];
        
        for (const numericId of advancedProblems) {
            const problemQuery = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [numericId]);
            if (problemQuery.rows.length > 0) {
                const problemId = problemQuery.rows[0].id;
                const schemaQuery = await pool.query('SELECT * FROM problem_schemas WHERE problem_id = $1', [problemId]);
                schemaChecks.push({
                    numeric_id: numericId,
                    problem_id: problemId,
                    has_schema: schemaQuery.rows.length > 0,
                    schema_data: schemaQuery.rows[0] || null
                });
            }
        }
        
        res.json({
            success: true,
            table_exists: true,
            table_structure: structure.rows,
            total_schemas: parseInt(totalCount.rows[0].count),
            advanced_problems_check: schemaChecks
        });
        
    } catch (error) {
        console.error('❌ Error inspecting schemas:', error);
        res.status(500).json({
            error: 'Failed to inspect schemas',
            details: error.message
        });
    }
});

// Force create schema entries for advanced problems
router.post('/force-create-schemas', async (req, res) => {
    try {
        console.log('🔧 Force creating schema entries for advanced problems...');
        
        const advancedProblems = [
            {
                numeric_id: 50,
                solution_sql: `-- Calculate Sharpe ratios, Information Ratios, and max drawdown for Renaissance strategies
WITH strategy_metrics AS (
    SELECT 
        strategy_id,
        strategy_name,
        asset_class,
        AVG(daily_return) as avg_return,
        STDDEV(daily_return) as volatility,
        COUNT(*) as trading_days,
        -- Calculate Sharpe Ratio (assuming 2% risk-free rate)
        (AVG(daily_return) - 0.02/252) / NULLIF(STDDEV(daily_return), 0) * SQRT(252) as sharpe_ratio,
        -- Calculate maximum drawdown
        MAX(drawdown) as max_drawdown
    FROM renaissance_strategies
    GROUP BY strategy_id, strategy_name, asset_class
    HAVING COUNT(*) >= 252 -- At least 1 year of data
),
performance_filter AS (
    SELECT *
    FROM strategy_metrics
    WHERE sharpe_ratio > 2.0 
    AND max_drawdown < 0.08 -- Less than 8% drawdown
)
SELECT 
    strategy_name,
    asset_class,
    ROUND(sharpe_ratio, 3) as sharpe_ratio,
    ROUND(avg_return * 252, 4) as annualized_return,
    ROUND(volatility * SQRT(252), 4) as annualized_volatility,
    ROUND(max_drawdown * 100, 2) as max_drawdown_pct,
    trading_days
FROM performance_filter
ORDER BY sharpe_ratio DESC;`,
                expected_output: `[{"strategy_name":"Medallion Statistical Arbitrage","asset_class":"Equity","sharpe_ratio":"3.245","annualized_return":"0.3580","annualized_volatility":"0.1102","max_drawdown_pct":"5.20","trading_days":"1260"},{"strategy_name":"Quantitative Momentum","asset_class":"Fixed Income","sharpe_ratio":"2.876","annualized_return":"0.2890","annualized_volatility":"0.1005","max_drawdown_pct":"6.80","trading_days":"1260"},{"strategy_name":"Mean Reversion Alpha","asset_class":"Commodities","sharpe_ratio":"2.455","annualized_return":"0.2220","annualized_volatility":"0.0904","max_drawdown_pct":"7.10","trading_days":"1260"}]`
            },
            // Add other advanced problems as needed
        ];
        
        const results = [];
        
        for (const problem of advancedProblems) {
            try {
                // Get problem ID
                const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [problem.numeric_id]);
                if (problemResult.rows.length === 0) {
                    results.push({
                        numeric_id: problem.numeric_id,
                        status: 'FAILED',
                        reason: 'Problem not found'
                    });
                    continue;
                }
                
                const problemId = problemResult.rows[0].id;
                
                // Delete any existing schema
                await pool.query('DELETE FROM problem_schemas WHERE problem_id = $1', [problemId]);
                
                // Insert new schema
                await pool.query(`
                    INSERT INTO problem_schemas (
                        problem_id, schema_name, solution_sql, expected_output, 
                        setup_sql, teardown_sql, sample_data, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                `, [problemId, 'default', problem.solution_sql, problem.expected_output, '', '', '']);
                
                results.push({
                    numeric_id: problem.numeric_id,
                    problem_id: problemId,
                    status: 'SUCCESS'
                });
                
            } catch (error) {
                results.push({
                    numeric_id: problem.numeric_id,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            message: 'Force schema creation completed',
            results: results
        });
        
    } catch (error) {
        console.error('❌ Error force creating schemas:', error);
        res.status(500).json({
            error: 'Failed to force create schemas',
            details: error.message
        });
    }
});

module.exports = router;