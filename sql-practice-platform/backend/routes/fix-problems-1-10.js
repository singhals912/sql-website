const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Fix the first 10 problems with identified issues
router.post('/fix-problems-1-10', async (req, res) => {
    try {
        console.log('🔧 Fixing problems 1-10...');
        
        // Problem 2: ABN AMRO Corporate Banking - Complete rewrite to match description
        await pool.query(`
            UPDATE problems 
            SET description = $1,
                solution_sql = $2
            WHERE numeric_id = 2
        `, [
            `**Business Context:** ABN AMRO's corporate banking division needs to assess credit risk across industry sectors to maintain regulatory compliance.

**Scenario:** You're a credit risk analyst evaluating corporate lending portfolios. The risk committee needs to identify high-risk industry sectors for enhanced monitoring.

**Problem:** Find industry sectors with average risk scores above 5.0 to focus monitoring efforts.

**Expected Output:** Industries with high average risk scores (>5.0), ordered by risk score descending.`,
            `SELECT 
    client_industry, 
    ROUND(AVG(risk_score), 2) as avg_risk_score
FROM corporate_risk_profiles 
GROUP BY client_industry 
HAVING AVG(risk_score) > 5.0 
ORDER BY avg_risk_score DESC;`
        ]);
        
        // Update Problem 2 schema to match the simpler problem
        await pool.query(`
            UPDATE problem_schemas 
            SET expected_output = $1,
                solution_sql = $2
            WHERE problem_id = 2
        `, [
            `[{"client_industry":"Real Estate_3","avg_risk_score":"8.50"},{"client_industry":"Real Estate_2","avg_risk_score":"8.40"},{"client_industry":"Real Estate_1","avg_risk_score":"8.30"},{"client_industry":"Real Estate","avg_risk_score":"8.20"},{"client_industry":"Energy","avg_risk_score":"7.90"}]`,
            `SELECT 
    client_industry, 
    ROUND(AVG(risk_score), 2) as avg_risk_score
FROM corporate_risk_profiles 
GROUP BY client_industry 
HAVING AVG(risk_score) > 5.0 
ORDER BY avg_risk_score DESC;`
        ]);
        
        // Problem 3: AIG Insurance Claims - Complete rewrite for fraud detection
        await pool.query(`
            UPDATE problems 
            SET description = $1,
                solution_sql = $2
            WHERE numeric_id = 3
        `, [
            `**Business Context:** AIG's fraud detection team needs to identify high-risk insurance policies that may indicate potential fraud.

**Scenario:** You're an insurance analyst identifying policies that warrant fraud investigation based on premium amounts.

**Problem:** Find policies with annual premiums exceeding $50,000 as they require enhanced scrutiny.

**Expected Output:** High-premium policies with risk scores, ordered by premium descending.`,
            `SELECT 
    policy_id,
    policyholder_name,
    annual_premium,
    ROUND(annual_premium / 1000, 2) as risk_score
FROM aig_policies 
WHERE annual_premium > 50000
ORDER BY annual_premium DESC
LIMIT 10;`
        ]);

        // Problem 4: AT&T Customer Service - Simplify to match basic aggregation
        await pool.query(`
            UPDATE problems 
            SET description = $1,
                solution_sql = $2
            WHERE numeric_id = 4
        `, [
            `**Business Context:** AT&T's customer service department analyzes call patterns to optimize staffing and service quality.

**Scenario:** You're analyzing customer service metrics to understand resolution rates across different service categories.

**Problem:** Calculate resolution statistics by service category to identify areas needing improvement.

**Expected Output:** Service categories with resolution metrics, ordered by resolution rate.`,
            `SELECT 
    service_category,
    COUNT(*) as total_calls,
    AVG(call_duration_minutes) as avg_duration,
    (COUNT(CASE WHEN resolution_status = 'Resolved' THEN 1 END) * 100.0 / COUNT(*)) as resolution_rate
FROM service_calls
GROUP BY service_category
ORDER BY resolution_rate DESC;`
        ]);

        // Update Problem 4 schema
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1,
                expected_output = $2,
                solution_sql = $3
            WHERE problem_id = 4
        `, [
            `CREATE TABLE service_calls (
    call_id INT PRIMARY KEY,
    service_category VARCHAR(50),
    call_duration_minutes INT,
    resolution_status VARCHAR(20),
    customer_satisfaction INT
);
INSERT INTO service_calls VALUES
(1, 'Technical Support', 15, 'Resolved', 4),
(2, 'Billing', 8, 'Resolved', 5),
(3, 'Technical Support', 25, 'Escalated', 3),
(4, 'Billing', 12, 'Resolved', 4),
(5, 'Account Services', 10, 'Resolved', 5),
(6, 'Technical Support', 18, 'Resolved', 4),
(7, 'Billing', 6, 'Resolved', 5),
(8, 'Account Services', 14, 'Resolved', 4);`,
            `[{"service_category":"Billing","total_calls":"3","avg_duration":"8.67","resolution_rate":"100.00"},{"service_category":"Account Services","total_calls":"2","avg_duration":"12.00","resolution_rate":"100.00"},{"service_category":"Technical Support","total_calls":"3","avg_duration":"19.33","resolution_rate":"66.67"}]`,
            `SELECT 
    service_category,
    COUNT(*) as total_calls,
    ROUND(AVG(call_duration_minutes), 2) as avg_duration,
    ROUND((COUNT(CASE WHEN resolution_status = 'Resolved' THEN 1 END) * 100.0 / COUNT(*)), 2) as resolution_rate
FROM service_calls
GROUP BY service_category
ORDER BY resolution_rate DESC;`
        ]);

        // Problem 9: American Express - Fix to match description about utilization analysis
        await pool.query(`
            UPDATE problems 
            SET description = $1,
                solution_sql = $2
            WHERE numeric_id = 9
        `, [
            `**Business Context:** American Express analyzes credit portfolio performance across customer segments to optimize credit risk management.

**Scenario:** You're a credit analyst studying credit utilization patterns across different customer segments to identify risk levels.

**Problem:** Calculate credit utilization rates by customer segment to understand borrowing patterns.

**Expected Output:** Customer segments with utilization metrics, ordered by utilization rate descending.`,
            `SELECT 
    customer_segment,
    COUNT(*) as account_count,
    ROUND(AVG(credit_limit), 2) as avg_credit_limit,
    ROUND(AVG(current_balance / credit_limit * 100), 2) as utilization_rate
FROM amex_credit_portfolio 
GROUP BY customer_segment 
ORDER BY utilization_rate DESC;`
        ]);

        console.log('✅ Problems 2, 3, 4, and 9 have been fixed');
        
        res.json({ 
            success: true, 
            message: 'Fixed problems 2, 3, 4, and 9',
            fixed_problems: [2, 3, 4, 9]
        });
        
    } catch (error) {
        console.error('❌ Error fixing problems:', error);
        res.status(500).json({ error: 'Failed to fix problems', details: error.message });
    }
});

module.exports = router;