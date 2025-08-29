const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// URGENT: Fix schemas using actual UUIDs from database
router.post('/fix-uuid-schemas', async (req, res) => {
    try {
        console.log('🚨 URGENT UUID SCHEMA FIX: Using actual problem UUIDs...');
        
        // Get actual UUIDs for problems 61-70
        const problemsResult = await pool.query(`
            SELECT id, numeric_id, title 
            FROM problems 
            WHERE numeric_id BETWEEN 61 AND 70
            ORDER BY numeric_id
        `);
        
        console.log(`Found ${problemsResult.rows.length} problems to fix:`, 
            problemsResult.rows.map(p => `${p.numeric_id}: ${p.title}`));
        
        const results = [];
        
        // Define comprehensive schemas for each problem
        const schemas = {
            62: {
                name: 'Uber Ride-Sharing Market Analytics',
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
            65: {
                name: 'Vanguard Index Fund Performance Analytics',
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
            },
            67: {
                name: 'Visa Global Payment Processing Analytics', 
                setupSql: `-- Visa Payment Processing Analytics Database
CREATE TABLE visa_transactions (
    transaction_id INTEGER,
    merchant_category VARCHAR(50),
    transaction_amount DECIMAL(10,2),
    processing_country VARCHAR(50),
    card_type VARCHAR(30),
    authorization_status VARCHAR(20),
    processing_fee_bp DECIMAL(6,2),
    interchange_rate DECIMAL(5,4),
    fraud_score DECIMAL(4,2),
    transaction_date DATE
);

-- Sample Visa transaction data
INSERT INTO visa_transactions VALUES
(1, 'Grocery', 125.50, 'United States', 'Credit', 'Approved', 175, 0.0195, 1.2, '2024-06-01'),
(2, 'Gas Station', 75.25, 'United States', 'Debit', 'Approved', 85, 0.0105, 0.8, '2024-06-01'),
(3, 'Restaurant', 89.75, 'Canada', 'Credit', 'Approved', 190, 0.0210, 1.5, '2024-06-01'),
(4, 'Online Shopping', 245.99, 'United States', 'Credit', 'Approved', 165, 0.0185, 2.1, '2024-06-01'),
(5, 'ATM Withdrawal', 200.00, 'United Kingdom', 'Debit', 'Approved', 95, 0.0115, 0.5, '2024-06-01'),
(6, 'Hotel', 350.00, 'France', 'Credit', 'Approved', 200, 0.0225, 1.8, '2024-06-01');`
            },
            69: {
                name: 'Wells Fargo Commercial Banking Analytics',
                setupSql: `-- Wells Fargo Commercial Banking Database
CREATE TABLE commercial_loans (
    loan_id INTEGER,
    business_sector VARCHAR(50),
    loan_amount DECIMAL(12,2),
    interest_rate DECIMAL(5,4),
    loan_term_months INTEGER,
    credit_rating VARCHAR(10),
    collateral_value DECIMAL(12,2),
    monthly_payment DECIMAL(10,2),
    default_probability DECIMAL(5,4),
    origination_date DATE
);

-- Sample Wells Fargo commercial loan data
INSERT INTO commercial_loans VALUES
(1, 'Manufacturing', 5000000, 0.0475, 60, 'A+', 6500000, 93542.50, 0.0085, '2024-01-15'),
(2, 'Real Estate', 12000000, 0.0525, 120, 'A', 18000000, 132850.75, 0.0125, '2024-02-01'),
(3, 'Technology', 2500000, 0.0425, 36, 'A+', 3200000, 74285.25, 0.0065, '2024-02-15'),
(4, 'Healthcare', 8500000, 0.0495, 84, 'A-', 12000000, 112475.00, 0.0145, '2024-03-01'),
(5, 'Retail', 3500000, 0.0555, 48, 'BBB+', 4200000, 83925.50, 0.0185, '2024-03-10'),
(6, 'Energy', 15000000, 0.0485, 96, 'A', 22500000, 171850.25, 0.0105, '2024-03-20');`
            }
        };
        
        // Apply fixes using actual UUIDs
        for (const problem of problemsResult.rows) {
            const numericId = problem.numeric_id;
            const uuid = problem.id;
            
            if (schemas[numericId]) {
                try {
                    // First check if schema exists
                    const existingSchema = await pool.query(`
                        SELECT id FROM problem_schemas WHERE problem_id = $1
                    `, [uuid]);
                    
                    if (existingSchema.rows.length > 0) {
                        // UPDATE existing schema
                        const updateResult = await pool.query(`
                            UPDATE problem_schemas 
                            SET setup_sql = $1
                            WHERE problem_id = $2
                        `, [schemas[numericId].setupSql, uuid]);
                        
                        console.log(`✅ UPDATED schema for Problem ${numericId} (${schemas[numericId].name})`);
                        results.push({
                            problemId: numericId,
                            title: schemas[numericId].name,
                            status: 'UPDATED',
                            uuid: uuid,
                            rowsAffected: updateResult.rowCount
                        });
                        
                    } else {
                        // INSERT new schema
                        const insertResult = await pool.query(`
                            INSERT INTO problem_schemas 
                            (problem_id, setup_sql)
                            VALUES ($1, $2)
                        `, [uuid, schemas[numericId].setupSql]);
                        
                        console.log(`✅ INSERTED schema for Problem ${numericId} (${schemas[numericId].name})`);
                        results.push({
                            problemId: numericId,
                            title: schemas[numericId].name,
                            status: 'INSERTED',
                            uuid: uuid,
                            rowsAffected: insertResult.rowCount
                        });
                    }
                    
                } catch (error) {
                    console.error(`❌ Error fixing Problem ${numericId}:`, error.message);
                    results.push({
                        problemId: numericId,
                        title: schemas[numericId].name,
                        status: 'ERROR',
                        uuid: uuid,
                        error: error.message
                    });
                }
            } else {
                results.push({
                    problemId: numericId,
                    title: problem.title,
                    status: 'NO_SCHEMA_DEFINED',
                    uuid: uuid
                });
            }
        }
        
        console.log('🎉 UUID SCHEMA FIX COMPLETED');
        
        res.json({
            success: true,
            message: 'UUID-based schema fix completed for problems 61-70',
            results: results,
            summary: {
                totalProblems: results.length,
                updated: results.filter(r => r.status === 'UPDATED').length,
                inserted: results.filter(r => r.status === 'INSERTED').length,
                errors: results.filter(r => r.status === 'ERROR').length,
                noSchema: results.filter(r => r.status === 'NO_SCHEMA_DEFINED').length
            }
        });
        
    } catch (error) {
        console.error('❌ Error in UUID schema fix:', error);
        res.status(500).json({ 
            error: 'UUID schema fix failed', 
            details: error.message 
        });
    }
});

module.exports = router;