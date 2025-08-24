const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/fix-apple-schema/now - Fix Apple App Store schema immediately
router.post('/now', async (req, res) => {
    try {
        console.log('🍎 Fixing Apple App Store Revenue Analytics schema...');
        
        // Find the Apple problem by numeric ID 10
        const problemResult = await pool.query(
            "SELECT id FROM problems WHERE numeric_id = 10"
        );
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Apple App Store problem not found' });
        }
        
        const problemId = problemResult.rows[0].id;
        
        const setupSql = `-- Apple App Store Revenue Analytics Database Schema
CREATE TABLE app_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    total_apps INTEGER,
    avg_rating DECIMAL(3,2)
);

CREATE TABLE app_revenue (
    revenue_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES app_categories(category_id),
    quarter VARCHAR(10),
    revenue_millions DECIMAL(10,2),
    downloads_millions DECIMAL(8,2),
    featured_apps INTEGER
);

-- Sample data for Apple App Store Revenue Analytics
INSERT INTO app_categories (category_id, category_name, total_apps, avg_rating) VALUES
(1, 'Games', 85000, 4.2),
(2, 'Social Networking', 12000, 4.1),
(3, 'Entertainment', 18000, 4.3),
(4, 'Productivity', 22000, 4.4),
(5, 'Health & Fitness', 15000, 4.0),
(6, 'Shopping', 8000, 4.2),
(7, 'Education', 25000, 4.5);

INSERT INTO app_revenue (revenue_id, category_id, quarter, revenue_millions, downloads_millions, featured_apps) VALUES
(1, 1, '2024-Q1', 1250.50, 2800.75, 45),
(2, 2, '2024-Q1', 89.25, 450.20, 12),
(3, 3, '2024-Q1', 156.80, 680.40, 18),
(4, 4, '2024-Q1', 234.60, 520.15, 25),
(5, 5, '2024-Q1', 67.30, 380.90, 8),
(6, 6, '2024-Q1', 178.90, 290.55, 15),
(7, 7, '2024-Q1', 45.20, 420.80, 22);`;

        const expectedOutput = [
            {
                "category_name": "Games",
                "revenue_millions": "1250.50",
                "quarter": "2024-Q1"
            },
            {
                "category_name": "Productivity", 
                "revenue_millions": "234.60",
                "quarter": "2024-Q1"
            },
            {
                "category_name": "Shopping",
                "revenue_millions": "178.90", 
                "quarter": "2024-Q1"
            },
            {
                "category_name": "Entertainment",
                "revenue_millions": "156.80",
                "quarter": "2024-Q1" 
            }
        ];

        // Delete any existing schema for this problem first
        await pool.query(`
            DELETE FROM problem_schemas WHERE problem_id = $1
        `, [problemId]);

        // Insert the new Apple-specific schema
        await pool.query(`
            INSERT INTO problem_schemas (
                problem_id, sql_dialect, setup_sql, expected_output
            ) VALUES ($1, $2, $3, $4)
        `, [
            problemId,
            'postgresql',
            setupSql,
            JSON.stringify(expectedOutput)
        ]);
        
        console.log('✅ Apple App Store schema fixed');
        
        res.json({
            success: true,
            message: 'Apple App Store Revenue Analytics schema fixed with proper app categories and revenue data',
            problemId: problemId
        });
        
    } catch (error) {
        console.error('❌ Apple schema fix failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;