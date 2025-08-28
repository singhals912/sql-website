const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// URGENT: Fix schemas for problems 61-70 one by one
router.post('/fix-65-vanguard', async (req, res) => {
    try {
        console.log('🚨 URGENT: Fixing Problem 65 Vanguard schema...');
        
        const setupSql = `-- Vanguard Index Fund Performance Database
CREATE TABLE vanguard_index_funds (
    fund_symbol VARCHAR(10),
    fund_name VARCHAR(100),
    benchmark_index VARCHAR(100),
    trade_date DATE,
    fund_nav DECIMAL(10,4),
    benchmark_value DECIMAL(10,4),
    tracking_error_bp DECIMAL(6,2),
    fund_aum_billions DECIMAL(8,2),
    expense_ratio_bp DECIMAL(6,2)
);

-- Sample Vanguard fund data  
INSERT INTO vanguard_index_funds VALUES
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-01-01', 245.82, 245.95, 8.5, 1250.5, 3.0),
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-02-01', 251.34, 251.41, 7.2, 1260.8, 3.0),
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-03-01', 248.67, 248.80, 9.1, 1245.2, 3.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-01-01', 28.45, 28.52, 12.8, 580.3, 11.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-02-01', 29.12, 29.18, 11.4, 585.7, 11.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-03-01', 28.89, 28.96, 13.2, 582.1, 11.0);`;

        // First get the problem ID
        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 65');
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem 65 not found' });
        }
        const problemId = problemResult.rows[0].id;
        
        // Update the schema
        const result = await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2 AND sql_dialect = 'postgresql'
        `, [setupSql, problemId]);
        
        console.log(`Updated ${result.rowCount} schema records for Problem 65`);
        
        res.json({
            success: true,
            message: 'Problem 65 (Vanguard) schema updated successfully',
            rowsUpdated: result.rowCount
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 65:', error);
        res.status(500).json({ 
            error: 'Failed to fix Problem 65', 
            details: error.message 
        });
    }
});

// Fix Problem 61: UBS Private Banking
router.post('/fix-61-ubs', async (req, res) => {
    try {
        console.log('🚨 URGENT: Fixing Problem 61 UBS schema...');
        
        const setupSql = `-- UBS Private Banking Database
CREATE TABLE ubs_private_banking (
    client_id INTEGER,
    client_segment VARCHAR(50),
    portfolio_value DECIMAL(15,2),
    investment_strategy VARCHAR(100),
    portfolio_return DECIMAL(6,4),
    market_benchmark DECIMAL(6,4),
    risk_free_rate DECIMAL(5,4),
    portfolio_volatility DECIMAL(6,4),
    diversification_score DECIMAL(4,2),
    alternative_allocation_pct DECIMAL(5,2),
    client_satisfaction_score DECIMAL(3,2)
);

-- Sample UBS Private Banking data
INSERT INTO ubs_private_banking VALUES
(1, 'Ultra High Net Worth', 85000000, 'Alternative Investments', 0.1250, 0.0850, 0.0200, 0.0920, 9.2, 35.5, 9.5),
(2, 'Ultra High Net Worth', 120000000, 'Growth Equity', 0.1180, 0.0850, 0.0200, 0.0850, 8.8, 28.0, 9.1),
(3, 'Family Office', 250000000, 'Diversified Alpha', 0.1320, 0.0850, 0.0200, 0.0780, 9.5, 42.0, 9.8),
(4, 'Ultra High Net Worth', 75000000, 'Private Equity Focus', 0.1410, 0.0850, 0.0200, 0.0950, 8.9, 45.0, 9.3),
(5, 'Family Office', 180000000, 'Hedge Fund Platform', 0.1380, 0.0850, 0.0200, 0.0820, 9.1, 38.5, 9.6),
(6, 'Ultra High Net Worth', 95000000, 'ESG Impact', 0.1150, 0.0850, 0.0200, 0.0880, 8.7, 25.0, 8.9);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 61');
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem 61 not found' });
        }
        const problemId = problemResult.rows[0].id;
        
        const result = await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2 AND sql_dialect = 'postgresql'
        `, [setupSql, problemId]);
        
        console.log(`Updated ${result.rowCount} schema records for Problem 61`);
        
        res.json({
            success: true,
            message: 'Problem 61 (UBS Private Banking) schema updated successfully',
            rowsUpdated: result.rowCount
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 61:', error);
        res.status(500).json({ 
            error: 'Failed to fix Problem 61', 
            details: error.message 
        });
    }
});

// Apply ALL critical fixes at once
router.post('/apply-all-urgent-fixes', async (req, res) => {
    try {
        console.log('🚨 APPLYING ALL URGENT SCHEMA FIXES...');
        
        const fixes = [
            {
                problemId: 61,
                name: 'UBS Private Banking',
                setupSql: `-- UBS Private Banking Database
CREATE TABLE ubs_private_banking (
    client_id INTEGER,
    client_segment VARCHAR(50),
    portfolio_value DECIMAL(15,2),
    investment_strategy VARCHAR(100),
    portfolio_return DECIMAL(6,4),
    market_benchmark DECIMAL(6,4),
    risk_free_rate DECIMAL(5,4),
    portfolio_volatility DECIMAL(6,4),
    diversification_score DECIMAL(4,2),
    alternative_allocation_pct DECIMAL(5,2),
    client_satisfaction_score DECIMAL(3,2)
);

-- Sample UBS Private Banking data
INSERT INTO ubs_private_banking VALUES
(1, 'Ultra High Net Worth', 85000000, 'Alternative Investments', 0.1250, 0.0850, 0.0200, 0.0920, 9.2, 35.5, 9.5),
(2, 'Ultra High Net Worth', 120000000, 'Growth Equity', 0.1180, 0.0850, 0.0200, 0.0850, 8.8, 28.0, 9.1),
(3, 'Family Office', 250000000, 'Diversified Alpha', 0.1320, 0.0850, 0.0200, 0.0780, 9.5, 42.0, 9.8),
(4, 'Ultra High Net Worth', 75000000, 'Private Equity Focus', 0.1410, 0.0850, 0.0200, 0.0950, 8.9, 45.0, 9.3),
(5, 'Family Office', 180000000, 'Hedge Fund Platform', 0.1380, 0.0850, 0.0200, 0.0820, 9.1, 38.5, 9.6),
(6, 'Ultra High Net Worth', 95000000, 'ESG Impact', 0.1150, 0.0850, 0.0200, 0.0880, 8.7, 25.0, 8.9);`
            },
            {
                problemId: 65,
                name: 'Vanguard Index Funds',
                setupSql: `-- Vanguard Index Fund Performance Database
CREATE TABLE vanguard_index_funds (
    fund_symbol VARCHAR(10),
    fund_name VARCHAR(100),
    benchmark_index VARCHAR(100),
    trade_date DATE,
    fund_nav DECIMAL(10,4),
    benchmark_value DECIMAL(10,4),
    tracking_error_bp DECIMAL(6,2),
    fund_aum_billions DECIMAL(8,2),
    expense_ratio_bp DECIMAL(6,2)
);

-- Sample Vanguard fund data  
INSERT INTO vanguard_index_funds VALUES
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-01-01', 245.82, 245.95, 8.5, 1250.5, 3.0),
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-02-01', 251.34, 251.41, 7.2, 1260.8, 3.0),
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-03-01', 248.67, 248.80, 9.1, 1245.2, 3.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-01-01', 28.45, 28.52, 12.8, 580.3, 11.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-02-01', 29.12, 29.18, 11.4, 585.7, 11.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-03-01', 28.89, 28.96, 13.2, 582.1, 11.0);`
            }
        ];
        
        let results = [];
        
        for (const fix of fixes) {
            try {
                const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [fix.problemId]);
                if (problemResult.rows.length === 0) {
                    results.push({
                        problem: fix.name,
                        status: 'ERROR',
                        error: `Problem ${fix.problemId} not found`
                    });
                    continue;
                }
                
                const problemId = problemResult.rows[0].id;
                const result = await pool.query(`
                    UPDATE problem_schemas 
                    SET setup_sql = $1
                    WHERE problem_id = $2 AND sql_dialect = 'postgresql'
                `, [fix.setupSql, problemId]);
                
                results.push({
                    problem: fix.name,
                    status: 'FIXED',
                    rowsUpdated: result.rowCount
                });
                
            } catch (error) {
                results.push({
                    problem: fix.name,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        
        res.json({
            success: true,
            message: 'Urgent schema fixes applied',
            results: results
        });
        
    } catch (error) {
        console.error('❌ Error in urgent fixes:', error);
        res.status(500).json({ 
            error: 'Failed to apply urgent fixes', 
            details: error.message 
        });
    }
});

module.exports = router;