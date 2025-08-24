const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/add-abn-schema/now - Add ABN AMRO schema with current table structure
router.post('/now', async (req, res) => {
    try {
        console.log('🚀 Adding ABN AMRO schema with current table structure...');
        
        // Find the ABN AMRO problem
        const problemResult = await pool.query(
            "SELECT id FROM problems WHERE slug = 'abn-amro-risk-management-system'"
        );
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'ABN AMRO problem not found' });
        }
        
        const problemId = problemResult.rows[0].id;
        
        const setupSql = `-- Corporate Risk Profiles Database Schema
CREATE TABLE corporate_risk_profiles (
    profile_id SERIAL PRIMARY KEY,
    client_industry VARCHAR(50),
    risk_score DECIMAL(4,2),
    exposure_millions DECIMAL(8,2),
    probability_default DECIMAL(5,4),
    loss_given_default DECIMAL(5,4),
    raroc_percentage DECIMAL(5,2)
);

-- Sample data for ABN AMRO Corporate Banking Risk Analytics
INSERT INTO corporate_risk_profiles VALUES 
(1, 'Oil & Gas', 7.5, 125.50, 0.0350, 0.4200, 16.50),
(2, 'Technology', 4.2, 85.25, 0.0120, 0.3800, 18.75),
(3, 'Manufacturing', 6.8, 220.75, 0.0280, 0.4100, 15.25),
(4, 'Real Estate', 8.3, 180.00, 0.0450, 0.4500, 17.20),
(5, 'Energy', 7.9, 195.25, 0.0380, 0.4300, 16.80),
(6, 'Healthcare', 5.1, 140.60, 0.0180, 0.3500, 19.30),
(7, 'Financial Services', 6.2, 310.40, 0.0250, 0.3900, 14.90);`;

        const expectedOutput = [
            {
                "client_industry": "Healthcare",
                "avg_risk": "5.10",
                "raroc_percentage": "19.30"
            },
            {
                "client_industry": "Technology", 
                "avg_risk": "4.20",
                "raroc_percentage": "18.75"
            },
            {
                "client_industry": "Real Estate",
                "avg_risk": "8.30", 
                "raroc_percentage": "17.20"
            }
        ];

        // Insert using current table structure (setup_sql, expected_output)
        await pool.query(`
            INSERT INTO problem_schemas (
                problem_id, sql_dialect, setup_sql, expected_output
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
        `, [
            problemId,
            'postgresql',
            setupSql,
            JSON.stringify(expectedOutput)
        ]);
        
        console.log('✅ ABN AMRO schema data added');
        
        res.json({
            success: true,
            message: 'ABN AMRO schema data added successfully',
            problemId: problemId
        });
        
    } catch (error) {
        console.error('❌ Schema addition failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;