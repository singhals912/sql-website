const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Fix Problem 36: Digital Marketing Campaign Performance - Add Schema
router.post('/fix-schema-36', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 36: Digital Marketing...');
        
        const setupSql = `-- Digital Marketing Campaign Database
CREATE TABLE marketing_channels (
    channel_id INTEGER PRIMARY KEY,
    channel_type VARCHAR(50),
    platform_name VARCHAR(100)
);

CREATE TABLE campaigns (
    campaign_id INTEGER PRIMARY KEY,
    channel_id INTEGER REFERENCES marketing_channels(channel_id),
    campaign_name VARCHAR(200),
    objective VARCHAR(100),
    start_date DATE,
    end_date DATE
);

CREATE TABLE campaign_results (
    result_id INTEGER PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(campaign_id),
    date DATE,
    impressions INTEGER,
    clicks INTEGER,
    conversions INTEGER,
    cost DECIMAL(10,2),
    revenue DECIMAL(10,2)
);

-- Sample marketing data
INSERT INTO marketing_channels VALUES
(1, 'Direct', 'Email Marketing'),
(2, 'Professional', 'LinkedIn Ads'),
(3, 'Social', 'Facebook Ads'),
(4, 'Search', 'Google Ads');

INSERT INTO campaigns VALUES
(1, 1, 'Customer Retention - Email', 'Retention', '2024-01-01', '2024-12-31'),
(2, 2, 'B2B Lead Gen - LinkedIn', 'Lead Generation', '2024-01-01', '2024-12-31'),
(3, 3, 'Brand Awareness - Facebook', 'Brand Awareness', '2024-01-01', '2024-12-31'),
(4, 4, 'Product Launch - Google', 'Sales', '2024-01-01', '2024-12-31');

INSERT INTO campaign_results VALUES
(1, 1, '2024-06-01', 31500, 2520, 504, 525.00, 25200.00),
(2, 2, '2024-06-01', 17700, 885, 88, 1950.00, 44000.00),
(3, 3, '2024-06-01', 125000, 3750, 150, 2800.00, 12000.00),
(4, 4, '2024-06-01', 89000, 4450, 267, 3200.00, 16020.00);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 36');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 36 schema and sample data added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 36:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 36', details: error.message });
    }
});

// Fix Problem 38: LinkedIn Professional Network Analytics - Add Schema
router.post('/fix-schema-38', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 38: LinkedIn...');
        
        const setupSql = `-- LinkedIn Professional Network Database
CREATE TABLE linkedin_industries (
    industry_id INTEGER PRIMARY KEY,
    industry_name VARCHAR(100),
    monthly_engagement_score DECIMAL(5,2),
    active_professionals INTEGER,
    premium_conversion_rate DECIMAL(6,5),
    avg_session_duration_minutes DECIMAL(6,2),
    content_interactions_per_user DECIMAL(8,2)
);

-- Sample LinkedIn industry data
INSERT INTO linkedin_industries VALUES
(1, 'Financial Services', 82.1, 400000, 0.092, 45.5, 28.3),
(2, 'Technology', 78.5, 500000, 0.085, 52.2, 31.7),
(3, 'Healthcare', 76.8, 300000, 0.073, 41.8, 24.9),
(4, 'Manufacturing', 72.3, 250000, 0.065, 38.2, 22.1),
(5, 'Legal Services', 79.2, 150000, 0.078, 48.3, 26.8);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 38');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 38 schema and sample data added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 38:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 38', details: error.message });
    }
});

// Fix Problem 44: Netflix Content Strategy Analytics - Add Schema
router.post('/fix-schema-44', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 44: Netflix...');
        
        const setupSql = `-- Netflix Content Analytics Database
CREATE TABLE netflix_content_analytics (
    content_id INTEGER PRIMARY KEY,
    content_genre VARCHAR(50),
    content_type VARCHAR(30),
    production_budget DECIMAL(12,2),
    viewer_engagement_score DECIMAL(5,2),
    subscriber_acquisition INTEGER,
    subscriber_retention_rate DECIMAL(4,3),
    content_hours_watched DECIMAL(12,2),
    release_date DATE,
    content_rating VARCHAR(10)
);

-- Sample Netflix content data
INSERT INTO netflix_content_analytics VALUES
(1, 'Thriller', 'Series', 35000000, 87.2, 125000, 0.89, 32500000, '2024-01-15', 'TV-MA'),
(2, 'Thriller', 'Series', 42000000, 89.5, 150000, 0.91, 38200000, '2024-02-20', 'TV-14'),
(3, 'Thriller', 'Series', 28000000, 85.8, 110000, 0.87, 28900000, '2024-03-10', 'TV-MA'),
(4, 'Thriller', 'Series', 38000000, 86.3, 100000, 0.88, 26200000, '2024-04-05', 'TV-14'),
(5, 'Documentary', 'Film', 18000000, 82.8, 80000, 0.92, 15800000, '2024-01-30', 'PG'),
(6, 'Documentary', 'Film', 22000000, 84.5, 75000, 0.93, 18200000, '2024-02-15', 'PG-13'),
(7, 'Documentary', 'Film', 15000000, 81.2, 60000, 0.91, 12500000, '2024-03-20', 'PG'),
(8, 'Documentary', 'Film', 19000000, 82.9, 70000, 0.92, 16800000, '2024-04-10', 'PG'),
(9, 'Documentary', 'Film', 16000000, 83.1, 65000, 0.94, 14200000, '2024-05-05', 'PG-13'),
(10, 'Documentary', 'Film', 21000000, 84.8, 85000, 0.93, 19500000, '2024-06-01', 'PG');`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 44');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 44 schema and sample data added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 44:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 44', details: error.message });
    }
});

// Fix Problem 50: Renaissance Technologies - Add Schema
router.post('/fix-schema-50', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 50: Renaissance Technologies...');
        
        const setupSql = `-- Renaissance Technologies Strategy Performance Database
CREATE TABLE renaissance_strategies (
    strategy_id INTEGER,
    strategy_name VARCHAR(100),
    asset_class VARCHAR(50),
    trade_date DATE,
    daily_return DECIMAL(10,8),
    drawdown DECIMAL(8,6),
    portfolio_value DECIMAL(15,2)
);

-- Sample Renaissance Technologies strategy data (1260 trading days of data)
INSERT INTO renaissance_strategies VALUES
-- Medallion Statistical Arbitrage (Equity) - High Sharpe, Low Drawdown
(1, 'Medallion Statistical Arbitrage', 'Equity', '2021-01-01', 0.00142, 0.012, 1000000000),
(1, 'Medallion Statistical Arbitrage', 'Equity', '2021-01-04', 0.00156, 0.008, 1001560000),
(1, 'Medallion Statistical Arbitrage', 'Equity', '2021-01-05', 0.00134, 0.015, 1003117440),
(1, 'Medallion Statistical Arbitrage', 'Equity', '2021-01-06', 0.00148, 0.011, 1004561327),
(1, 'Medallion Statistical Arbitrage', 'Equity', '2021-01-07', 0.00152, 0.009, 1006089159),
-- Quantitative Momentum (Fixed Income) - Good Sharpe, Low Drawdown  
(2, 'Quantitative Momentum', 'Fixed Income', '2021-01-01', 0.00115, 0.018, 800000000),
(2, 'Quantitative Momentum', 'Fixed Income', '2021-01-04', 0.00098, 0.022, 800920000),
(2, 'Quantitative Momentum', 'Fixed Income', '2021-01-05', 0.00108, 0.025, 801784840),
(2, 'Quantitative Momentum', 'Fixed Income', '2021-01-06', 0.00124, 0.019, 802650442),
(2, 'Quantitative Momentum', 'Fixed Income', '2021-01-07', 0.00119, 0.023, 803623749),
-- Mean Reversion Alpha (Commodities) - Meets criteria
(3, 'Mean Reversion Alpha', 'Commodities', '2021-01-01', 0.00088, 0.028, 600000000),
(3, 'Mean Reversion Alpha', 'Commodities', '2021-01-04', 0.00076, 0.032, 600528000),
(3, 'Mean Reversion Alpha', 'Commodities', '2021-01-05', 0.00082, 0.035, 601084136),
(3, 'Mean Reversion Alpha', 'Commodities', '2021-01-06', 0.00094, 0.031, 601577355),
(3, 'Mean Reversion Alpha', 'Commodities', '2021-01-07', 0.00089, 0.033, 602112997),
-- Low Performance Strategy (should be filtered out)
(4, 'Basic Arbitrage', 'Equity', '2021-01-01', 0.00045, 0.095, 500000000),
(4, 'Basic Arbitrage', 'Equity', '2021-01-04', 0.00038, 0.108, 500225000),
(4, 'Basic Arbitrage', 'Equity', '2021-01-05', 0.00052, 0.112, 500415100);

-- Note: In a real scenario, this table would have 1260+ rows per strategy for proper Sharpe ratio calculation`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 50');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 50 schema and sample data added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 50:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 50', details: error.message });
    }
});

// Batch fix all schemas
router.post('/fix-all-schemas', async (req, res) => {
    try {
        console.log('🚨 BATCH FIXING all problem schemas...');
        
        const fixes = [
            { endpoint: '/fix-schema-36', name: 'Digital Marketing' },
            { endpoint: '/fix-schema-38', name: 'LinkedIn Analytics' },
            { endpoint: '/fix-schema-44', name: 'Netflix Content' },
            { endpoint: '/fix-schema-50', name: 'Renaissance Technologies' }
        ];
        
        const results = [];
        
        for (const fix of fixes) {
            try {
                const response = await fetch(`http://localhost:5001/api/fix-schemas${fix.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
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
        
        console.log('✅ BATCH SCHEMA FIX COMPLETED');
        
        res.json({
            success: true,
            message: 'Batch schema fix completed',
            results: results,
            summary: {
                total_problems: fixes.length,
                fixed: results.filter(r => r.status === 'FIXED').length,
                failed: results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length
            }
        });
        
    } catch (error) {
        console.error('❌ Error in batch schema fix:', error);
        res.status(500).json({ error: 'Batch schema fix failed', details: error.message });
    }
});

module.exports = router;