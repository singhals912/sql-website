const express = require('express');
const router = express.Router();
const pool = require('../db/config');

// EMERGENCY FIX: Problem 70 Wells Fargo Schema Alignment
router.post('/fix-problem-70-schema', async (req, res) => {
    console.log('🚨 EMERGENCY: Fixing Problem 70 Wells Fargo schema mismatch...');
    
    try {
        const wellsFargoSetupSql = `-- Wells Fargo Mortgage Risk Assessment Database
CREATE TABLE mortgage_applications (
    loan_id VARCHAR(15) PRIMARY KEY,
    borrower_credit_score INTEGER,
    debt_to_income_ratio DECIMAL(5,2),
    loan_to_value_ratio DECIMAL(5,2),
    employment_history_years INTEGER,
    loan_amount DECIMAL(10,2),
    default_flag INTEGER
);

CREATE TABLE risk_assessment (
    loan_id VARCHAR(15),
    risk_score DECIMAL(6,3),
    risk_decile INTEGER,
    default_probability DECIMAL(5,3),
    expected_loss DECIMAL(10,2),
    FOREIGN KEY (loan_id) REFERENCES mortgage_applications(loan_id)
);

INSERT INTO mortgage_applications VALUES
('WF_MTG_001', 720, 28.5, 85.0, 8, 450000.00, 0),
('WF_MTG_002', 680, 35.2, 92.5, 4, 380000.00, 1),
('WF_MTG_003', 750, 22.1, 78.0, 12, 620000.00, 0),
('WF_MTG_004', 640, 42.8, 95.0, 2, 320000.00, 1),
('WF_MTG_005', 780, 18.5, 72.5, 15, 850000.00, 0);

INSERT INTO risk_assessment VALUES
('WF_MTG_001', 65.250, 3, 0.025, 11250.00),
('WF_MTG_002', 78.900, 8, 0.095, 36100.00),
('WF_MTG_003', 45.100, 1, 0.012, 7440.00),
('WF_MTG_004', 89.750, 10, 0.125, 40000.00),
('WF_MTG_005', 32.800, 1, 0.008, 6800.00);`;

        const wellsFargoSolutionSql = `SELECT 
    ra.risk_decile,
    COUNT(ma.loan_id) as borrower_count,
    ROUND(AVG(ra.risk_score), 2) as avg_risk_score,
    ROUND(AVG(ra.default_probability * 100), 2) as default_rate_pct,
    ROUND(AVG(ra.expected_loss), 2) as avg_expected_loss
FROM mortgage_applications ma
JOIN risk_assessment ra ON ma.loan_id = ra.loan_id
WHERE ra.default_probability > 0.08
GROUP BY ra.risk_decile
ORDER BY ra.risk_decile;`;

        const wellsFargoExpectedOutput = `[{"risk_decile":"8","borrower_count":"1","avg_risk_score":"78.90","default_rate_pct":"9.50","avg_expected_loss":"36100.00"},{"risk_decile":"10","borrower_count":"1","avg_risk_score":"89.75","default_rate_pct":"12.50","avg_expected_loss":"40000.00"}]`;

        // Update problem_schemas table for Problem 70
        const updateQuery = `
            UPDATE problem_schemas 
            SET 
                setup_sql = $1,
                solution_sql = $2,
                expected_output = $3,
                created_at = NOW()
            WHERE problem_id = 70
        `;
        
        const result = await pool.query(updateQuery, [
            wellsFargoSetupSql,
            wellsFargoSolutionSql, 
            wellsFargoExpectedOutput
        ]);

        if (result.rowCount > 0) {
            console.log('✅ Problem 70 Wells Fargo schema successfully aligned with mortgage risk context');
            
            res.json({
                success: true,
                message: "EMERGENCY FIX COMPLETE: Problem 70 Wells Fargo schema aligned",
                problemId: 70,
                title: "Wells Fargo Mortgage Risk Assessment",
                status: "SCHEMA_ALIGNED",
                changes: {
                    schema_updated: true,
                    context_matches_schema: true,
                    zoom_schema_removed: true,
                    mortgage_schema_added: true
                },
                verification: "Schema now matches Wells Fargo mortgage risk assessment context"
            });
        } else {
            throw new Error('No rows updated - problem_schemas entry for Problem 70 not found');
        }

    } catch (error) {
        console.error('❌ Emergency fix failed:', error);
        res.status(500).json({
            success: false,
            message: "Emergency fix failed",
            error: error.message
        });
    }
});

module.exports = router;