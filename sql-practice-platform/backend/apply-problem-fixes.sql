-- SQL Script to Fix Problems 1-10
-- Apply these updates to fix the major issues identified

-- Problem 2: ABN AMRO Corporate Banking - Simplify description to match solution
UPDATE problems 
SET description = '**Business Context:** ABN AMRO''s corporate banking division needs to assess credit risk across industry sectors to maintain regulatory compliance.

**Scenario:** You''re a credit risk analyst evaluating corporate lending portfolios. The risk committee needs to identify high-risk industry sectors for enhanced monitoring.

**Problem:** Find industry sectors with average risk scores above 5.0 to focus monitoring efforts.

**Expected Output:** Industries with high average risk scores (>5.0), ordered by risk score descending.'
WHERE numeric_id = 2;

-- Problem 3: AIG Insurance Claims - Rewrite to match premium filtering reality  
UPDATE problems 
SET description = '**Business Context:** AIG''s underwriting team needs to identify high-value insurance policies that require additional scrutiny and risk assessment.

**Scenario:** You''re an insurance analyst reviewing policy portfolios. The underwriting team needs to focus on high-premium policies for enhanced review processes.

**Problem:** Find insurance policies with annual premiums exceeding $50,000 that warrant detailed risk assessment.

**Expected Output:** High-premium policies with calculated risk scores, ordered by premium amount descending.'
WHERE numeric_id = 3;

-- Problem 4: AT&T Customer Service - Simplify description and solution
UPDATE problems 
SET description = '**Business Context:** AT&T''s customer service department analyzes call patterns to optimize staffing and improve service quality metrics.

**Scenario:** You''re analyzing customer service performance across different service categories to identify areas needing improvement.

**Problem:** Calculate resolution statistics by service category, including total calls, average duration, and resolution rates.

**Expected Output:** Service categories with resolution metrics, ordered by resolution rate descending.'
WHERE numeric_id = 4;

-- Update Problem 4 schema to use correct table name and simpler structure
UPDATE problem_schemas 
SET setup_sql = 'CREATE TABLE service_calls (
    call_id INT PRIMARY KEY,
    service_category VARCHAR(50),
    call_duration_minutes INT,
    resolution_status VARCHAR(20),
    customer_satisfaction INT
);
INSERT INTO service_calls VALUES
(1, ''Technical Support'', 15, ''Resolved'', 4),
(2, ''Billing'', 8, ''Resolved'', 5),
(3, ''Technical Support'', 25, ''Escalated'', 3),
(4, ''Billing'', 12, ''Resolved'', 4),
(5, ''Account Services'', 10, ''Resolved'', 5),
(6, ''Technical Support'', 18, ''Resolved'', 4),
(7, ''Billing'', 6, ''Resolved'', 5),
(8, ''Account Services'', 14, ''Resolved'', 4);',
solution_sql = 'SELECT 
    service_category,
    COUNT(*) as total_calls,
    ROUND(AVG(call_duration_minutes), 2) as avg_duration,
    ROUND((COUNT(CASE WHEN resolution_status = ''Resolved'' THEN 1 END) * 100.0 / COUNT(*)), 2) as resolution_rate
FROM service_calls
GROUP BY service_category
ORDER BY resolution_rate DESC;',
expected_output = '[{"service_category":"Billing","total_calls":"3","avg_duration":"8.67","resolution_rate":"100.00"},{"service_category":"Account Services","total_calls":"2","avg_duration":"12.00","resolution_rate":"100.00"},{"service_category":"Technical Support","total_calls":"3","avg_duration":"19.33","resolution_rate":"66.67"}]'
WHERE problem_id = 4;

-- Problem 9: American Express - Align description with utilization analysis
UPDATE problems 
SET description = '**Business Context:** American Express analyzes credit portfolio performance across customer segments to optimize risk management and credit offerings.

**Scenario:** You''re a credit analyst studying credit utilization patterns across different customer segments to understand borrowing behaviors and risk levels.

**Problem:** Calculate credit utilization metrics by customer segment, including account counts, average credit limits, and utilization rates.

**Expected Output:** Customer segments with utilization metrics, ordered by utilization rate descending.'
WHERE numeric_id = 9;

-- Verify the fixes worked
SELECT numeric_id, title, LEFT(description, 100) as description_preview 
FROM problems 
WHERE numeric_id IN (2, 3, 4, 9)
ORDER BY numeric_id;