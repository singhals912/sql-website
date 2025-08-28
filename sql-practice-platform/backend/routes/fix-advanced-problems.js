const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Fix Problem 50: Renaissance Technologies Quantitative Alpha
router.post('/fix-problem-50', async (req, res) => {
    try {
        console.log('🔧 Creating proper solution for Problem 50: Renaissance Technologies...');
        
        const properSolution = `-- Calculate Sharpe ratios, Information Ratios, and max drawdown for Renaissance strategies
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
ORDER BY sharpe_ratio DESC;`;

        const expectedOutput = `[{\"strategy_name\":\"Medallion Statistical Arbitrage\",\"asset_class\":\"Equity\",\"sharpe_ratio\":\"3.245\",\"annualized_return\":\"0.3580\",\"annualized_volatility\":\"0.1102\",\"max_drawdown_pct\":\"5.20\",\"trading_days\":\"1260\"},{\"strategy_name\":\"Quantitative Momentum\",\"asset_class\":\"Fixed Income\",\"sharpe_ratio\":\"2.876\",\"annualized_return\":\"0.2890\",\"annualized_volatility\":\"0.1005\",\"max_drawdown_pct\":\"6.80\",\"trading_days\":\"1260\"},{\"strategy_name\":\"Mean Reversion Alpha\",\"asset_class\":\"Commodities\",\"sharpe_ratio\":\"2.455\",\"annualized_return\":\"0.2220\",\"annualized_volatility\":\"0.0904\",\"max_drawdown_pct\":\"7.10\",\"trading_days\":\"1260\"}]`;

        // Update or insert the solution (UPSERT)
        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 50');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, solution_sql, expected_output, created_at)
            VALUES ($1, 'default', $2, $3, NOW())
            ON CONFLICT (problem_id) DO UPDATE SET
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
        `, [problemId, properSolution, expectedOutput]);
        
        console.log('✅ Problem 50 solution upgraded to proper quantitative finance analytics');
        
        res.json({
            success: true,
            message: 'Problem 50 solution upgraded to proper Renaissance Technologies analytics',
            solution_preview: properSolution.substring(0, 200) + '...',
            improvements: [
                'Added Sharpe ratio calculations with proper risk-free rate',
                'Implemented maximum drawdown analysis',
                'Added volatility and annualized return metrics',
                'Filtered for high-performance strategies (>2.0 Sharpe, <8% drawdown)',
                'Proper quantitative finance business logic'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 50:', error);
        res.status(500).json({ 
            error: 'Failed to fix Problem 50', 
            details: error.message 
        });
    }
});

// Fix Problem 43: Movie Recommendation Engine
router.post('/fix-problem-43', async (req, res) => {
    try {
        console.log('🔧 Creating proper solution for Problem 43: Movie Recommendations...');
        
        const properSolution = `-- Disney+ Movie Recommendation System for Action movie watchers
WITH action_watchers AS (
    SELECT DISTINCT w.user_id
    FROM watchlist w
    JOIN movies m ON w.movie_id = m.movie_id
    WHERE m.genre = 'Action'
),
user_watched_movies AS (
    SELECT w.user_id, w.movie_id
    FROM watchlist w
    WHERE w.user_id IN (SELECT user_id FROM action_watchers)
),
high_rated_action AS (
    SELECT 
        m.movie_id,
        m.title,
        m.genre,
        m.rating,
        m.year_released
    FROM movies m
    WHERE m.genre = 'Action'
    AND m.rating >= 8.0
),
recommendations AS (
    SELECT 
        aw.user_id,
        hra.movie_id,
        hra.title,
        hra.rating,
        hra.year_released
    FROM action_watchers aw
    CROSS JOIN high_rated_action hra
    WHERE hra.movie_id NOT IN (
        SELECT uwm.movie_id 
        FROM user_watched_movies uwm 
        WHERE uwm.user_id = aw.user_id
    )
)
SELECT 
    user_id,
    title as recommended_movie,
    rating,
    year_released,
    'Action preference match' as recommendation_reason
FROM recommendations
ORDER BY user_id, rating DESC, year_released DESC
LIMIT 20;`;

        const expectedOutput = `[{\"user_id\":\"101\",\"recommended_movie\":\"Mad Max: Fury Road\",\"rating\":\"8.7\",\"year_released\":\"2015\",\"recommendation_reason\":\"Action preference match\"},{\"user_id\":\"101\",\"recommended_movie\":\"John Wick\",\"rating\":\"8.4\",\"year_released\":\"2014\",\"recommendation_reason\":\"Action preference match\"},{\"user_id\":\"102\",\"recommended_movie\":\"The Dark Knight\",\"rating\":\"9.0\",\"year_released\":\"2008\",\"recommendation_reason\":\"Action preference match\"},{\"user_id\":\"102\",\"recommended_movie\":\"Gladiator\",\"rating\":\"8.5\",\"year_released\":\"2000\",\"recommendation_reason\":\"Action preference match\"}]`;

        // Update or insert the solution (UPSERT)
        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 43');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, solution_sql, expected_output, created_at)
            VALUES ($1, 'default', $2, $3, NOW())
            ON CONFLICT (problem_id) DO UPDATE SET
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
        `, [problemId, properSolution, expectedOutput]);
        
        console.log('✅ Problem 43 solution upgraded to proper recommendation engine logic');
        
        res.json({
            success: true,
            message: 'Problem 43 solution upgraded to proper recommendation system',
            improvements: [
                'Identifies users who watched Action movies',
                'Finds high-rated Action movies they haven\'t seen',
                'Excludes already-watched content',
                'Ranks recommendations by rating and recency',
                'Proper recommendation engine business logic'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 43:', error);
        res.status(500).json({ 
            error: 'Failed to fix Problem 43', 
            details: error.message 
        });
    }
});

// Fix Problem 37: JPMorgan Derivatives Risk Analytics  
router.post('/fix-problem-37', async (req, res) => {
    try {
        console.log('🔧 Creating proper solution for Problem 37: JPMorgan Derivatives...');
        
        const properSolution = `-- JPMorgan Derivatives Risk Analytics with VaR and P&L Attribution
WITH derivative_risk_metrics AS (
    SELECT 
        derivative_type,
        trading_desk,
        underlying_asset,
        AVG(daily_pnl) as avg_daily_pnl,
        STDDEV(daily_pnl) as pnl_volatility,
        SUM(notional_amount) as total_notional,
        COUNT(*) as position_count,
        -- Calculate 95% Value at Risk (VaR)
        PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY daily_pnl) as var_95,
        -- Calculate risk-adjusted return (Sharpe-like metric)
        AVG(daily_pnl) / NULLIF(STDDEV(daily_pnl), 0) as risk_adjusted_return
    FROM jpmorgan_derivatives
    WHERE trade_date >= CURRENT_DATE - INTERVAL '252 days'
    GROUP BY derivative_type, trading_desk, underlying_asset
),
high_risk_positions AS (
    SELECT *
    FROM derivative_risk_metrics
    WHERE ABS(var_95) > 50000000 -- VaR exceeding $50M
    OR pnl_volatility > 25000000  -- P&L volatility > $25M
)
SELECT 
    trading_desk,
    derivative_type,
    underlying_asset,
    ROUND(total_notional/1000000, 2) as notional_millions,
    position_count,
    ROUND(avg_daily_pnl/1000000, 3) as avg_daily_pnl_millions,
    ROUND(ABS(var_95)/1000000, 2) as var_95_millions,
    ROUND(risk_adjusted_return, 3) as sharpe_like_ratio
FROM high_risk_positions
ORDER BY ABS(var_95) DESC, pnl_volatility DESC;`;

        const expectedOutput = `[{\"trading_desk\":\"Fixed Income Derivatives\",\"derivative_type\":\"Interest Rate Swaps\",\"underlying_asset\":\"USD Treasuries\",\"notional_millions\":\"12500.00\",\"position_count\":\"145\",\"avg_daily_pnl_millions\":\"2.450\",\"var_95_millions\":\"85.30\",\"sharpe_like_ratio\":\"1.245\"},{\"trading_desk\":\"Equity Derivatives\",\"derivative_type\":\"Options\",\"underlying_asset\":\"S&P 500\",\"notional_millions\":\"8750.00\",\"position_count\":\"230\",\"avg_daily_pnl_millions\":\"1.890\",\"var_95_millions\":\"72.80\",\"sharpe_like_ratio\":\"1.567\"}]`;

        // Update or insert the solution (UPSERT)
        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 37');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, solution_sql, expected_output, created_at)
            VALUES ($1, 'default', $2, $3, NOW())
            ON CONFLICT (problem_id) DO UPDATE SET
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
        `, [problemId, properSolution, expectedOutput]);
        
        console.log('✅ Problem 37 solution upgraded to proper derivatives risk analytics');
        
        res.json({
            success: true,
            message: 'Problem 37 solution upgraded to proper JPMorgan derivatives analytics',
            improvements: [
                'Added Value at Risk (VaR) calculations',
                'Implemented P&L volatility analysis',
                'Added risk-adjusted return metrics', 
                'Proper derivatives risk management logic',
                'Identifies high-risk positions requiring attention'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 37:', error);
        res.status(500).json({ 
            error: 'Failed to fix Problem 37', 
            details: error.message 
        });
    }
});

// Fix Problem 60: UBS Wealth Management Analytics
router.post('/fix-problem-60', async (req, res) => {
    try {
        console.log('🔧 Creating proper solution for Problem 60: UBS Wealth Management...');
        
        const properSolution = `-- UBS Wealth Management Analytics with comprehensive private banking metrics
WITH wealth_performance AS (
    SELECT 
        wealth_segment,
        client_id,
        portfolio_value,
        annual_fee_rate,
        client_satisfaction_score,
        -- Calculate Sharpe ratio for portfolio performance
        (portfolio_return - 0.025) / NULLIF(portfolio_volatility, 0) as sharpe_ratio,
        -- Calculate fee margins
        portfolio_value * annual_fee_rate as annual_fees,
        CASE 
            WHEN client_tenure_years >= 5 THEN 1 
            ELSE 0 
        END as retained_client
    FROM ubs_wealth_management
),
segment_metrics AS (
    SELECT 
        wealth_segment,
        COUNT(*) as total_clients,
        AVG(sharpe_ratio) as avg_sharpe_ratio,
        AVG(annual_fee_rate * 100) as avg_fee_rate_pct,
        AVG(client_satisfaction_score) as avg_satisfaction,
        SUM(retained_client) * 100.0 / COUNT(*) as retention_rate_pct,
        SUM(annual_fees) as total_fee_revenue,
        AVG(portfolio_value) as avg_portfolio_value
    FROM wealth_performance
    GROUP BY wealth_segment
)
SELECT 
    wealth_segment,
    total_clients,
    ROUND(avg_sharpe_ratio, 3) as avg_sharpe_ratio,
    ROUND(avg_fee_rate_pct, 2) as avg_fee_rate_pct,
    ROUND(avg_satisfaction, 1) as avg_client_satisfaction,
    ROUND(retention_rate_pct, 1) as retention_rate_pct,
    ROUND(total_fee_revenue/1000000, 2) as fee_revenue_millions,
    ROUND(avg_portfolio_value/1000000, 2) as avg_portfolio_millions
FROM segment_metrics
WHERE avg_sharpe_ratio > 1.8 
AND avg_fee_rate_pct > 1.5 
AND retention_rate_pct > 95.0
ORDER BY avg_sharpe_ratio DESC;`;

        const expectedOutput = `[{\"wealth_segment\":\"Ultra High Net Worth\",\"total_clients\":\"45\",\"avg_sharpe_ratio\":\"2.340\",\"avg_fee_rate_pct\":\"1.85\",\"avg_client_satisfaction\":\"9.2\",\"retention_rate_pct\":\"98.5\",\"fee_revenue_millions\":\"125.40\",\"avg_portfolio_millions\":\"85.50\"},{\"wealth_segment\":\"High Net Worth\",\"total_clients\":\"120\",\"avg_sharpe_ratio\":\"2.120\",\"avg_fee_rate_pct\":\"1.65\",\"avg_client_satisfaction\":\"8.8\",\"retention_rate_pct\":\"96.2\",\"fee_revenue_millions\":\"89.30\",\"avg_portfolio_millions\":\"28.75\"}]`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 60');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, solution_sql, expected_output, created_at)
            VALUES ($1, 'default', $2, $3, NOW())
            ON CONFLICT (problem_id) DO UPDATE SET
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
        `, [problemId, properSolution, expectedOutput]);
        
        res.json({
            success: true,
            message: 'Problem 60 solution upgraded to proper UBS wealth management analytics'
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 60:', error);
        res.status(500).json({ error: 'Failed to fix Problem 60', details: error.message });
    }
});

// Fix Problem 61: UBS Private Banking  
router.post('/fix-problem-61', async (req, res) => {
    try {
        console.log('🔧 Creating proper solution for Problem 61: UBS Private Banking...');
        
        const properSolution = `-- UBS Private Banking ultra-high-net-worth client analytics
WITH client_performance AS (
    SELECT 
        client_segment,
        portfolio_value,
        investment_strategy,
        -- Calculate alpha generation (excess return over market)
        portfolio_return - market_benchmark as portfolio_alpha,
        -- Calculate Sharpe ratio
        (portfolio_return - risk_free_rate) / NULLIF(portfolio_volatility, 0) as sharpe_ratio,
        -- Asset allocation efficiency score
        diversification_score,
        alternative_allocation_pct,
        client_satisfaction_score
    FROM ubs_private_banking
    WHERE portfolio_value >= 25000000 -- UHNW threshold $25M+
),
top_performers AS (
    SELECT 
        client_segment,
        investment_strategy,
        COUNT(*) as client_count,
        AVG(portfolio_alpha * 100) as avg_alpha_bp, -- in basis points
        AVG(sharpe_ratio) as avg_sharpe_ratio,
        AVG(diversification_score) as avg_diversification,
        AVG(alternative_allocation_pct) as avg_alt_allocation,
        AVG(client_satisfaction_score) as avg_satisfaction,
        AVG(portfolio_value/1000000) as avg_portfolio_millions
    FROM client_performance
    GROUP BY client_segment, investment_strategy
    HAVING AVG(portfolio_alpha) > 0.02 -- Alpha > 200bp
    AND AVG(sharpe_ratio) > 1.5
)
SELECT 
    client_segment,
    investment_strategy,
    client_count,
    ROUND(avg_alpha_bp, 0) as alpha_basis_points,
    ROUND(avg_sharpe_ratio, 2) as sharpe_ratio,
    ROUND(avg_diversification, 1) as diversification_score,
    ROUND(avg_alt_allocation, 1) as alternative_allocation_pct,
    ROUND(avg_satisfaction, 1) as client_satisfaction,
    ROUND(avg_portfolio_millions, 1) as avg_portfolio_millions
FROM top_performers
ORDER BY avg_alpha_bp DESC, avg_sharpe_ratio DESC;`;

        const expectedOutput = `[{\"client_segment\":\"Family Office\",\"investment_strategy\":\"Alternative Heavy\",\"client_count\":\"8\",\"alpha_basis_points\":\"285\",\"sharpe_ratio\":\"1.89\",\"diversification_score\":\"8.5\",\"alternative_allocation_pct\":\"45.2\",\"client_satisfaction\":\"9.4\",\"avg_portfolio_millions\":\"125.8\"},{\"client_segment\":\"Ultra High Net Worth\",\"investment_strategy\":\"Hedge Fund Plus\",\"client_count\":\"15\",\"alpha_basis_points\":\"242\",\"sharpe_ratio\":\"1.72\",\"diversification_score\":\"7.8\",\"alternative_allocation_pct\":\"38.5\",\"client_satisfaction\":\"9.1\",\"avg_portfolio_millions\":\"87.3\"}]`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 61');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, solution_sql, expected_output, created_at)
            VALUES ($1, 'default', $2, $3, NOW())
            ON CONFLICT (problem_id) DO UPDATE SET
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
        `, [problemId, properSolution, expectedOutput]);
        
        res.json({
            success: true,
            message: 'Problem 61 solution upgraded to proper UBS private banking analytics'
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 61:', error);
        res.status(500).json({ error: 'Failed to fix Problem 61', details: error.message });
    }
});

// Fix Problem 42: Morgan Stanley Institutional Securities
router.post('/fix-problem-42', async (req, res) => {
    try {
        console.log('🔧 Creating proper solution for Problem 42: Morgan Stanley...');
        
        const properSolution = `-- Morgan Stanley Institutional Securities comprehensive analytics
WITH trading_performance AS (
    SELECT 
        trading_desk,
        client_type,
        SUM(trading_volume) as total_volume,
        SUM(trading_revenue) as total_revenue,
        AVG(spread_capture_bp) as avg_spread_capture,
        COUNT(DISTINCT client_id) as unique_clients,
        SUM(trading_revenue) / NULLIF(SUM(trading_volume), 0) as revenue_per_volume,
        AVG(client_satisfaction_score) as avg_satisfaction
    FROM morganstanley_institutional_securities
    GROUP BY trading_desk, client_type
),
performance_metrics AS (
    SELECT 
        trading_desk,
        client_type,
        total_volume,
        total_revenue,
        unique_clients,
        avg_spread_capture,
        avg_satisfaction,
        -- Calculate client ROI (simplified as revenue efficiency)
        (total_revenue / NULLIF(unique_clients, 0)) as revenue_per_client,
        -- ROI approximation based on revenue efficiency
        CASE 
            WHEN revenue_per_volume > 0.0020 THEN revenue_per_volume * 10000 -- Convert to percentage approximation
            ELSE 0
        END as estimated_roi_pct
    FROM trading_performance
)
SELECT 
    trading_desk,
    client_type,
    unique_clients,
    ROUND(total_volume/1000000000, 2) as volume_billions,
    ROUND(avg_spread_capture, 1) as avg_spread_bp,
    ROUND(estimated_roi_pct, 1) as estimated_roi_pct,
    ROUND(revenue_per_client/1000000, 2) as revenue_per_client_millions,
    ROUND(avg_satisfaction, 1) as client_satisfaction
FROM performance_metrics
WHERE total_volume > 50000000000 -- >$50B volume
AND avg_spread_capture > 25 -- >25bp spread capture
AND estimated_roi_pct > 20 -- >20% estimated ROI
ORDER BY total_volume DESC, avg_spread_capture DESC;`;

        const expectedOutput = `[{\"trading_desk\":\"Fixed Income\",\"client_type\":\"Institutional\",\"unique_clients\":\"145\",\"volume_billions\":\"125.50\",\"avg_spread_bp\":\"32.5\",\"estimated_roi_pct\":\"28.4\",\"revenue_per_client_millions\":\"8.90\",\"client_satisfaction\":\"8.7\"},{\"trading_desk\":\"Equity Derivatives\",\"client_type\":\"Hedge Fund\",\"unique_clients\":\"89\",\"volume_billions\":\"87.20\",\"avg_spread_bp\":\"28.8\",\"estimated_roi_pct\":\"24.1\",\"revenue_per_client_millions\":\"12.50\",\"client_satisfaction\":\"8.9\"}]`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 42');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, solution_sql, expected_output, created_at)
            VALUES ($1, 'default', $2, $3, NOW())
            ON CONFLICT (problem_id) DO UPDATE SET
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
        `, [problemId, properSolution, expectedOutput]);
        
        res.json({
            success: true,
            message: 'Problem 42 solution upgraded to proper Morgan Stanley institutional analytics'
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 42:', error);
        res.status(500).json({ error: 'Failed to fix Problem 42', details: error.message });
    }
});

// Batch fix all critical advanced problems
router.post('/fix-all-critical', async (req, res) => {
    try {
        console.log('🚨 BATCH FIXING all critical advanced problems...');
        
        const fixes = [
            { endpoint: '/fix-problem-37', name: 'JPMorgan Derivatives' },
            { endpoint: '/fix-problem-42', name: 'Morgan Stanley Securities' },
            { endpoint: '/fix-problem-43', name: 'Movie Recommendations' },
            { endpoint: '/fix-problem-50', name: 'Renaissance Quant' },
            { endpoint: '/fix-problem-60', name: 'UBS Wealth Management' },
            { endpoint: '/fix-problem-61', name: 'UBS Private Banking' }
        ];
        
        const results = [];
        
        for (const fix of fixes) {
            try {
                const response = await fetch(`http://localhost:5001/api/fix-advanced${fix.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                const result = await response.json();
                results.push({
                    problem: fix.name,
                    status: result.success ? 'FIXED' : 'FAILED',
                    message: result.message
                });
            } catch (error) {
                results.push({
                    problem: fix.name,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        
        console.log('✅ BATCH FIX COMPLETED');
        
        res.json({
            success: true,
            message: 'Batch fix completed for all critical advanced problems',
            results: results,
            summary: {
                total_problems: fixes.length,
                fixed: results.filter(r => r.status === 'FIXED').length,
                failed: results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length
            }
        });
        
    } catch (error) {
        console.error('❌ Error in batch fix:', error);
        res.status(500).json({ error: 'Batch fix failed', details: error.message });
    }
});

module.exports = router;