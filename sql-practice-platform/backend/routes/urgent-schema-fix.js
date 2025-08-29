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
        
        // Update the schema using UPSERT to handle both UPDATE and INSERT
        const result = await pool.query(`
            INSERT INTO problem_schemas (problem_id, setup_sql) 
            VALUES ($2, $1)
            ON CONFLICT (problem_id) DO UPDATE SET setup_sql = EXCLUDED.setup_sql
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

// Fix Problem 62: Uber Market Analytics
router.post('/fix-62-uber-upsert', async (req, res) => {
    try {
        console.log('🚨 URGENT: Fixing Problem 62 Uber schema with UPSERT...');
        
        const setupSql = `-- Uber Market Analytics Database
CREATE TABLE uber_rides (
    ride_id INTEGER,
    market_name VARCHAR(50),
    service_type VARCHAR(30),
    ride_distance_km DECIMAL(8,2),
    ride_duration_minutes INTEGER,
    ride_revenue DECIMAL(8,2),
    driver_earnings DECIMAL(8,2),
    surge_multiplier DECIMAL(4,2),
    ride_date DATE
);

-- Sample Uber ride data
INSERT INTO uber_rides VALUES
(1, 'San Francisco', 'UberX', 8.5, 25, 18.50, 13.88, 1.2, '2024-06-01'),
(2, 'San Francisco', 'UberPool', 12.2, 35, 12.80, 9.60, 1.0, '2024-06-01'),
(3, 'New York', 'UberBlack', 6.8, 20, 24.00, 18.00, 1.5, '2024-06-01'),
(4, 'New York', 'UberX', 15.3, 42, 22.50, 16.88, 1.3, '2024-06-01'),
(5, 'Los Angeles', 'UberX', 18.7, 38, 16.20, 12.15, 1.1, '2024-06-01'),
(6, 'San Francisco', 'UberBlack', 4.2, 15, 19.50, 14.63, 1.0, '2024-06-01');`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 62');
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem 62 not found' });
        }
        const problemId = problemResult.rows[0].id;
        
        // Use UPSERT to handle both UPDATE and INSERT
        const result = await pool.query(`
            INSERT INTO problem_schemas (problem_id, setup_sql) 
            VALUES ($2, $1)
            ON CONFLICT (problem_id) DO UPDATE SET setup_sql = EXCLUDED.setup_sql
        `, [setupSql, problemId]);
        
        console.log(`Upserted ${result.rowCount} schema records for Problem 62`);
        
        res.json({
            success: true,
            message: 'Problem 62 (Uber) schema updated successfully with UPSERT',
            rowsAffected: result.rowCount
        });
        
    } catch (error) {
        console.error('❌ Error fixing Problem 62:', error);
        res.status(500).json({ 
            error: 'Failed to fix Problem 62', 
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

// Apply ALL problems 61-70 schemas
router.post('/apply-all-schemas-61-70', async (req, res) => {
    try {
        console.log('🚨 APPLYING ALL SCHEMAS 61-70...');
        
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
                problemId: 62,
                name: 'Uber Market Analytics',
                setupSql: `-- Uber Market Analytics Database
CREATE TABLE uber_rides (
    ride_id INTEGER,
    market_name VARCHAR(50),
    service_type VARCHAR(30),
    ride_distance_km DECIMAL(8,2),
    ride_duration_minutes INTEGER,
    ride_revenue DECIMAL(8,2),
    driver_earnings DECIMAL(8,2),
    surge_multiplier DECIMAL(4,2),
    ride_date DATE
);

-- Sample Uber ride data
INSERT INTO uber_rides VALUES
(1, 'San Francisco', 'UberX', 8.5, 25, 18.50, 13.88, 1.2, '2024-06-01'),
(2, 'San Francisco', 'UberPool', 12.2, 35, 12.80, 9.60, 1.0, '2024-06-01'),
(3, 'New York', 'UberBlack', 6.8, 20, 24.00, 18.00, 1.5, '2024-06-01'),
(4, 'New York', 'UberX', 15.3, 42, 22.50, 16.88, 1.3, '2024-06-01'),
(5, 'Los Angeles', 'UberX', 18.7, 38, 16.20, 12.15, 1.1, '2024-06-01'),
(6, 'San Francisco', 'UberBlack', 4.2, 15, 19.50, 14.63, 1.0, '2024-06-01');`
            },
            {
                problemId: 63,
                name: 'Tesla Energy Storage',
                setupSql: `-- Tesla Energy Storage Analytics Database
CREATE TABLE tesla_energy_storage (
    installation_id INTEGER,
    project_type VARCHAR(50),
    location VARCHAR(50),
    battery_capacity_mwh DECIMAL(8,2),
    energy_discharged_mwh DECIMAL(8,2),
    grid_revenue DECIMAL(10,2),
    efficiency_rating DECIMAL(4,2),
    installation_date DATE,
    grid_stability_score DECIMAL(4,2)
);

-- Sample Tesla energy storage data
INSERT INTO tesla_energy_storage VALUES
(1, 'Utility Scale', 'California', 129.6, 118.2, 285000, 95.8, '2023-03-15', 9.2),
(2, 'Commercial', 'Texas', 25.4, 23.1, 58500, 94.2, '2023-05-20', 8.9),
(3, 'Utility Scale', 'Australia', 194.5, 180.8, 420000, 96.1, '2023-01-10', 9.5),
(4, 'Commercial', 'New York', 15.8, 14.5, 35200, 93.8, '2023-07-08', 8.7),
(5, 'Residential', 'Florida', 2.1, 1.9, 4800, 92.5, '2023-09-12', 8.4),
(6, 'Utility Scale', 'Nevada', 165.2, 152.4, 380000, 95.3, '2023-02-28', 9.1);`
            },
            {
                problemId: 64,
                name: 'Airbnb Host Revenue',
                setupSql: `-- Airbnb Host Revenue Analytics Database
CREATE TABLE airbnb_hosts (
    host_id INTEGER,
    property_type VARCHAR(50),
    neighborhood VARCHAR(50),
    listing_count INTEGER,
    avg_nightly_rate DECIMAL(8,2),
    occupancy_rate DECIMAL(5,2),
    monthly_revenue DECIMAL(10,2),
    guest_rating DECIMAL(3,2),
    superhost_status BOOLEAN
);

-- Sample Airbnb host data
INSERT INTO airbnb_hosts VALUES
(1, 'Entire Apartment', 'Manhattan', 3, 245.00, 0.85, 18750, 4.8, true),
(2, 'Private Room', 'Brooklyn', 2, 125.00, 0.78, 5850, 4.6, false),
(3, 'Entire House', 'Los Angeles', 1, 320.00, 0.72, 6912, 4.9, true),
(4, 'Entire Apartment', 'San Francisco', 2, 280.00, 0.80, 13440, 4.7, true),
(5, 'Private Room', 'Miami', 1, 95.00, 0.68, 1938, 4.4, false),
(6, 'Entire House', 'Austin', 1, 185.00, 0.75, 4162.5, 4.8, false);`
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