const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Emergency system-wide schema corruption analysis
router.get('/analyze-schema-corruption', async (req, res) => {
    try {
        console.log('🚨 EMERGENCY: Analyzing system-wide schema corruption...');
        
        // Get comprehensive schema status for all problems
        const analysis = await pool.query(`
            SELECT 
                p.numeric_id,
                p.title,
                p.difficulty,
                CASE 
                    WHEN ps.problem_id IS NULL THEN 'NO_SCHEMA_RECORD'
                    WHEN ps.solution_sql IS NULL OR ps.solution_sql = '' THEN 'MISSING_SOLUTION'
                    WHEN ps.setup_sql IS NULL OR ps.setup_sql = '' THEN 'MISSING_SETUP'
                    WHEN ps.expected_output IS NULL OR ps.expected_output = '' THEN 'MISSING_OUTPUT'
                    ELSE 'FUNCTIONAL'
                END as schema_status,
                ps.created_at as schema_created_at
            FROM problems p
            LEFT JOIN problem_schemas ps ON p.id = ps.problem_id
            ORDER BY p.numeric_id
        `);
        
        // Analyze corruption patterns
        const results = analysis.rows;
        const functional = results.filter(r => r.schema_status === 'FUNCTIONAL');
        const corrupted = results.filter(r => r.schema_status !== 'FUNCTIONAL');
        
        // Find corruption boundary
        let corruptionStart = null;
        for (let i = 0; i < results.length; i++) {
            if (results[i].schema_status !== 'FUNCTIONAL') {
                // Check if this is the start of continuous corruption
                let consecutiveCorrupted = 0;
                for (let j = i; j < results.length && results[j].schema_status !== 'FUNCTIONAL'; j++) {
                    consecutiveCorrupted++;
                }
                if (consecutiveCorrupted >= 5) { // If 5+ consecutive corrupted problems
                    corruptionStart = results[i].numeric_id;
                    break;
                }
            }
        }
        
        // Calculate statistics
        const totalProblems = results.length;
        const functionalCount = functional.length;
        const corruptedCount = corrupted.length;
        const systemHealth = Math.round((functionalCount / totalProblems) * 100);
        
        console.log(`🚨 CRITICAL: ${corruptedCount} out of ${totalProblems} problems corrupted (${100-systemHealth}% failure rate)`);
        
        res.json({
            success: true,
            crisis_level: systemHealth < 60 ? 'CRITICAL' : systemHealth < 80 ? 'SEVERE' : 'MODERATE',
            system_health_score: systemHealth,
            total_problems: totalProblems,
            functional_problems: functionalCount,
            corrupted_problems: corruptedCount,
            corruption_start_point: corruptionStart,
            corruption_analysis: {
                no_schema_records: corrupted.filter(r => r.schema_status === 'NO_SCHEMA_RECORD').length,
                missing_solutions: corrupted.filter(r => r.schema_status === 'MISSING_SOLUTION').length,
                missing_setups: corrupted.filter(r => r.schema_status === 'MISSING_SETUP').length,
                missing_outputs: corrupted.filter(r => r.schema_status === 'MISSING_OUTPUT').length
            },
            functional_problems_list: functional.map(p => ({
                numeric_id: p.numeric_id,
                title: p.title,
                difficulty: p.difficulty
            })),
            corrupted_problems_list: corrupted.slice(0, 20).map(p => ({ // Limit response size
                numeric_id: p.numeric_id,
                title: p.title,
                difficulty: p.difficulty,
                corruption_type: p.schema_status
            })),
            recommendations: systemHealth < 50 ? [
                '🚨 EMERGENCY: Immediate schema reconstruction required',
                '⚠️ Disable corrupted problems from public access',
                '🔧 Implement emergency schema templates',
                '📊 Priority: Restore easy/medium problems first',
                '⚡ Create automated schema generation system'
            ] : [
                '🔧 Systematic schema recreation needed',
                '📊 Focus on high-traffic problems first',
                '⚡ Implement validation safeguards'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error analyzing schema corruption:', error);
        res.status(500).json({ 
            error: 'Failed to analyze schema corruption', 
            details: error.message 
        });
    }
});

// Emergency schema creation for critical problems
router.post('/emergency-create-schemas', async (req, res) => {
    try {
        console.log('🚨 EMERGENCY: Creating basic schemas for corrupted problems...');
        
        // Priority problems to fix first (easier ones with clear descriptions)
        const emergencySchemas = [
            {
                numeric_id: 46,
                title: 'PayPal Digital Payments Analytics',
                setup_sql: `CREATE TABLE paypal_transactions (
                    transaction_id INT PRIMARY KEY,
                    payment_method VARCHAR(50),
                    transaction_type VARCHAR(50),
                    amount DECIMAL(10,2),
                    fee_amount DECIMAL(8,2),
                    currency VARCHAR(3),
                    status VARCHAR(20),
                    country VARCHAR(50),
                    transaction_date DATE
                );
                INSERT INTO paypal_transactions VALUES 
                (1, 'Credit Card', 'Payment', 150.00, 4.65, 'USD', 'Completed', 'USA', '2024-01-15'),
                (2, 'PayPal Balance', 'Transfer', 75.50, 2.27, 'USD', 'Completed', 'Canada', '2024-01-16'),
                (3, 'Debit Card', 'Payment', 220.00, 6.38, 'USD', 'Completed', 'USA', '2024-01-17'),
                (4, 'Bank Account', 'Withdrawal', 500.00, 10.00, 'USD', 'Pending', 'UK', '2024-01-18');`,
                solution_sql: `SELECT 
                    payment_method,
                    COUNT(*) as transaction_count,
                    ROUND(SUM(amount), 2) as total_volume,
                    ROUND(AVG(amount), 2) as avg_transaction_size,
                    ROUND(SUM(fee_amount), 2) as total_fees,
                    ROUND(AVG(fee_amount / amount * 100), 2) as avg_fee_rate
                FROM paypal_transactions
                WHERE status = 'Completed'
                GROUP BY payment_method
                ORDER BY total_volume DESC;`,
                expected_output: `[{"payment_method":"Debit Card","transaction_count":"1","total_volume":"220.00","avg_transaction_size":"220.00","total_fees":"6.38","avg_fee_rate":"2.90"},{"payment_method":"Credit Card","transaction_count":"1","total_volume":"150.00","avg_transaction_size":"150.00","total_fees":"4.65","avg_fee_rate":"3.10"}]`
            },
            {
                numeric_id: 49,
                title: 'Product Inventory Status',
                setup_sql: `CREATE TABLE inventory (
                    product_id INT PRIMARY KEY,
                    product_name VARCHAR(100),
                    category VARCHAR(50),
                    stock_quantity INT,
                    reorder_level INT,
                    unit_cost DECIMAL(8,2),
                    supplier VARCHAR(100),
                    last_restocked DATE
                );
                INSERT INTO inventory VALUES 
                (1, 'Laptop Pro 15', 'Electronics', 25, 10, 1200.00, 'TechSupply Co', '2024-01-10'),
                (2, 'Office Chair', 'Furniture', 5, 15, 150.00, 'Furniture Plus', '2024-01-08'),
                (3, 'Wireless Mouse', 'Electronics', 8, 20, 25.99, 'TechSupply Co', '2024-01-12'),
                (4, 'Standing Desk', 'Furniture', 3, 5, 399.00, 'Furniture Plus', '2024-01-05');`,
                solution_sql: `SELECT 
                    category,
                    COUNT(*) as total_products,
                    SUM(stock_quantity) as total_stock,
                    COUNT(CASE WHEN stock_quantity <= reorder_level THEN 1 END) as products_needing_reorder,
                    ROUND(AVG(unit_cost), 2) as avg_unit_cost,
                    ROUND(SUM(stock_quantity * unit_cost), 2) as inventory_value
                FROM inventory
                GROUP BY category
                ORDER BY inventory_value DESC;`,
                expected_output: `[{"category":"Electronics","total_products":"2","total_stock":"33","products_needing_reorder":"1","avg_unit_cost":"613.00","inventory_value":"30207.92"},{"category":"Furniture","total_products":"2","total_stock":"8","products_needing_reorder":"2","avg_unit_cost":"274.50","inventory_value":"1947.00"}]`
            },
            {
                numeric_id: 53,
                title: 'Session Duration Analysis',
                setup_sql: `CREATE TABLE user_sessions (
                    session_id INT PRIMARY KEY,
                    user_id INT,
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    page_views INT,
                    device_type VARCHAR(20),
                    session_date DATE
                );
                INSERT INTO user_sessions VALUES 
                (1, 101, '2024-01-15 10:00:00', '2024-01-15 10:15:30', 5, 'Desktop', '2024-01-15'),
                (2, 102, '2024-01-15 14:30:00', '2024-01-15 14:45:45', 8, 'Mobile', '2024-01-15'),
                (3, 103, '2024-01-16 09:15:00', '2024-01-16 09:32:20', 6, 'Desktop', '2024-01-16'),
                (4, 104, '2024-01-16 16:00:00', '2024-01-16 16:25:10', 12, 'Tablet', '2024-01-16');`,
                solution_sql: `SELECT 
                    device_type,
                    COUNT(*) as session_count,
                    ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60), 2) as avg_duration_minutes,
                    ROUND(AVG(page_views), 1) as avg_page_views,
                    ROUND(SUM(page_views) * 1.0 / SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 60), 2) as pages_per_minute
                FROM user_sessions
                GROUP BY device_type
                ORDER BY avg_duration_minutes DESC;`,
                expected_output: `[{"device_type":"Tablet","session_count":"1","avg_duration_minutes":"25.17","avg_page_views":"12.0","pages_per_minute":"0.48"},{"device_type":"Desktop","session_count":"2","avg_duration_minutes":"18.92","avg_page_views":"5.5","pages_per_minute":"0.29"}]`
            }
        ];
        
        let createdCount = 0;
        const results = [];
        
        for (const schema of emergencySchemas) {
            try {
                // Get the actual problem ID from numeric_id
                const problemResult = await pool.query(
                    'SELECT id FROM problems WHERE numeric_id = $1',
                    [schema.numeric_id]
                );
                
                if (problemResult.rows.length === 0) {
                    results.push({
                        numeric_id: schema.numeric_id,
                        status: 'PROBLEM_NOT_FOUND'
                    });
                    continue;
                }
                
                const problemId = problemResult.rows[0].id;
                
                // Check if schema already exists
                const existing = await pool.query(
                    'SELECT id FROM problem_schemas WHERE problem_id = $1',
                    [problemId]
                );
                
                if (existing.rows.length === 0) {
                    await pool.query(`
                        INSERT INTO problem_schemas 
                        (problem_id, schema_name, setup_sql, solution_sql, expected_output, sql_dialect)
                        VALUES ($1, 'default', $2, $3, $4, 'postgresql')
                    `, [
                        problemId,
                        schema.setup_sql,
                        schema.solution_sql,
                        schema.expected_output
                    ]);
                    
                    createdCount++;
                    results.push({
                        numeric_id: schema.numeric_id,
                        title: schema.title,
                        status: 'SCHEMA_CREATED'
                    });
                } else {
                    results.push({
                        numeric_id: schema.numeric_id,
                        title: schema.title,
                        status: 'ALREADY_EXISTS'
                    });
                }
            } catch (error) {
                results.push({
                    numeric_id: schema.numeric_id,
                    error: error.message,
                    status: 'ERROR'
                });
            }
        }
        
        console.log(`🚨 EMERGENCY RESPONSE: Created ${createdCount} critical schemas`);
        
        res.json({
            success: true,
            message: `Emergency schema creation completed`,
            schemas_created: createdCount,
            total_attempted: emergencySchemas.length,
            results: results,
            next_steps: [
                'Test created schemas for functionality',
                'Continue with remaining corrupted problems',
                'Implement systematic schema generation',
                'Add validation and quality checks'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error in emergency schema creation:', error);
        res.status(500).json({ 
            error: 'Emergency schema creation failed', 
            details: error.message 
        });
    }
});

module.exports = router;