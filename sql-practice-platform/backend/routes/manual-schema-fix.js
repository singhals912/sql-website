const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/manual-schema-fix/add-abn-amro - Add schema for ABN AMRO problem
router.post('/add-abn-amro', async (req, res) => {
    try {
        console.log('🚀 Adding schema data for ABN AMRO problem...');
        
        // Find the ABN AMRO problem
        const problemResult = await pool.query(
            "SELECT id FROM problems WHERE slug = 'abn-amro-risk-management-system'"
        );
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'ABN AMRO problem not found' });
        }
        
        const problemId = problemResult.rows[0].id;
        
        // Add comprehensive schema data
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

        const solutionSql = `SELECT 
    client_industry,
    risk_score as avg_risk,
    raroc_percentage
FROM corporate_risk_profiles 
WHERE probability_default > 0.03 
    AND loss_given_default > 0.40 
    AND raroc_percentage > 15.0
ORDER BY raroc_percentage DESC
LIMIT 3;`;

        // Insert or update the schema using new column structure
        await pool.query(`
            INSERT INTO problem_schemas (
                problem_id, sql_dialect, schema_sql, expected_output, 
                solution_sql, explanation
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING
        `, [
            problemId,
            'postgresql',
            setupSql,
            JSON.stringify(expectedOutput),
            solutionSql,
            'Advanced credit risk analysis combining probability of default, loss given default, and risk-adjusted return on capital metrics.'
        ]);
        
        console.log('✅ Schema data added for ABN AMRO problem');
        
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