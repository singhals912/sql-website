-- URGENT: SQL Script to Fix Critical Slug Mismatches in Problems 21-30
-- This fixes systematic database integrity issues

-- Problem 21: Credit Suisse Investment Banking M&A
UPDATE problems 
SET slug = 'credit-suisse-investment-banking-ma'
WHERE numeric_id = 21;

-- Problem 22: Credit Suisse Private Banking Analytics
UPDATE problems 
SET slug = 'credit-suisse-private-banking-analytics'
WHERE numeric_id = 22;

-- Problem 23: Deutsche Bank Credit Risk Analytics  
UPDATE problems 
SET slug = 'deutsche-bank-credit-risk-analytics'
WHERE numeric_id = 23;

-- Problem 24: Online Learning Platform Analytics
UPDATE problems 
SET slug = 'online-learning-platform-analytics'
WHERE numeric_id = 24;

-- Problem 27: Manufacturing Quality Control Analysis
UPDATE problems 
SET slug = 'manufacturing-quality-control-analysis'
WHERE numeric_id = 27;

-- Problem 28: Goldman Sachs Algorithmic Trading Performance
UPDATE problems 
SET slug = 'goldman-sachs-algorithmic-trading-performance'
WHERE numeric_id = 28;

-- Problem 29: Goldman Sachs Prime Brokerage Analytics
UPDATE problems 
SET slug = 'goldman-sachs-prime-brokerage-analytics'  
WHERE numeric_id = 29;

-- Problem 30: Hospital Patient Care Analytics
UPDATE problems 
SET slug = 'hospital-patient-care-analytics'
WHERE numeric_id = 30;

-- Verify all fixes were applied correctly
SELECT 
    numeric_id, 
    title, 
    slug,
    CASE 
        WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(slug, '-', ' ')) || '%' THEN 'FIXED'
        WHEN LOWER(REPLACE(slug, '-', ' ')) LIKE '%' || LOWER(SUBSTRING(title, 1, 20)) || '%' THEN 'PARTIAL_MATCH'
        ELSE 'STILL_MISMATCHED' 
    END as fix_status
FROM problems 
WHERE numeric_id BETWEEN 21 AND 30
ORDER BY numeric_id;

-- Generate redirect mapping for any existing URLs (for SEO preservation)
SELECT 
    'Redirect 301 /problems/' || 
    CASE numeric_id
        WHEN 21 THEN 'ing-group-risk-management-system'
        WHEN 22 THEN 'barclays-risk-management-system'  
        WHEN 23 THEN 'credit-suisse-risk-management-system'
        WHEN 24 THEN 'disney-revenue-analysis'
        WHEN 27 THEN 'ford-vehicle-sales-performance'
        WHEN 28 THEN 'berkshire-hathaway-insurance-float-optimization'
        WHEN 29 THEN 'danske-bank-risk-management-system'
        WHEN 30 THEN 'google-ad-revenue-by-platform'
    END ||
    ' /problems/' || slug as redirect_rule
FROM problems 
WHERE numeric_id IN (21, 22, 23, 24, 27, 28, 29, 30)
ORDER BY numeric_id;