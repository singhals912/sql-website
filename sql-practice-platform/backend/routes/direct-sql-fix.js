const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// DIRECT SQL FIX - No assumptions about table structure
router.post('/apply-direct-fix', async (req, res) => {
    try {
        console.log('🚨 DIRECT SQL FIX: Applying schemas using direct SQL...');
        
        // Problem 62: Uber
        const problem62 = await pool.query(`SELECT id FROM problems WHERE numeric_id = 62`);
        if (problem62.rows.length > 0) {
            const uberSchema = `-- Uber Market Analytics Database
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

INSERT INTO uber_rides VALUES
(1, 'San Francisco', 'UberX', 8.5, 25, 18.50, 13.88, 1.2, '2024-06-01'),
(2, 'San Francisco', 'UberPool', 12.2, 35, 12.80, 9.60, 1.0, '2024-06-01'),
(3, 'New York', 'UberBlack', 6.8, 20, 24.00, 18.00, 1.5, '2024-06-01');`;
            
            await pool.query(`
                INSERT INTO problem_schemas (problem_id, setup_sql) 
                VALUES ($1, $2)
                ON CONFLICT (problem_id) DO UPDATE SET setup_sql = EXCLUDED.setup_sql
            `, [problem62.rows[0].id, uberSchema]);
        }
        
        // Problem 65: Vanguard  
        const problem65 = await pool.query(`SELECT id FROM problems WHERE numeric_id = 65`);
        if (problem65.rows.length > 0) {
            const vanguardSchema = `-- Vanguard Index Fund Performance Database
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

INSERT INTO vanguard_index_funds VALUES
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-01-01', 245.82, 245.95, 8.5, 1250.5, 3.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-01-01', 28.45, 28.52, 12.8, 580.3, 11.0);`;
            
            await pool.query(`
                INSERT INTO problem_schemas (problem_id, setup_sql) 
                VALUES ($1, $2)
                ON CONFLICT (problem_id) DO UPDATE SET setup_sql = EXCLUDED.setup_sql
            `, [problem65.rows[0].id, vanguardSchema]);
        }
        
        console.log('✅ DIRECT SQL FIX COMPLETED');
        
        res.json({
            success: true,
            message: 'Direct SQL fix applied for Problems 62 and 65',
            note: 'Check datasql.pro to verify CREATE TABLE statements now appear'
        });
        
    } catch (error) {
        console.error('❌ Error in direct SQL fix:', error);
        res.status(500).json({ 
            error: 'Direct SQL fix failed', 
            details: error.message 
        });
    }
});

module.exports = router;