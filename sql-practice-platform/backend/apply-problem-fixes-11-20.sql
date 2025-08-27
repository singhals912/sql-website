-- SQL Script to Fix Problems 11-20
-- Apply these updates to fix the issues identified

-- Problem 16: Charles Schwab Wealth Management - Simplify description to match solution
UPDATE problems 
SET description = '**Business Context:** Charles Schwab''s wealth management division analyzes client portfolio performance across different wealth tiers to identify optimal investment strategies.

**Scenario:** You''re a portfolio analyst studying client performance metrics. The investment committee needs to identify wealth management strategies that deliver strong returns with controlled risk.

**Problem:** Find wealth tiers with annual returns above 10% and portfolio volatility below 18% to recommend for new client onboarding.

**Expected Output:** Wealth tiers meeting performance criteria (>10% return, <18% volatility), ordered by annual return descending.'
WHERE numeric_id = 16;

-- Problem 18: Restaurant Chain Sales Analysis - CRITICAL: Fix slug mismatch
UPDATE problems 
SET slug = 'restaurant-chain-sales-analysis'
WHERE numeric_id = 18;

-- Verify the fixes worked
SELECT numeric_id, title, slug, LEFT(description, 100) as description_preview 
FROM problems 
WHERE numeric_id IN (16, 18)
ORDER BY numeric_id;

-- Check for any other slug mismatches in the database
SELECT numeric_id, title, slug,
       CASE 
           WHEN LOWER(title) NOT LIKE '%' || LOWER(REPLACE(slug, '-', '')) || '%' 
           AND LOWER(REPLACE(slug, '-', '')) NOT LIKE '%' || LOWER(REPLACE(title, ' ', '')) || '%'
           THEN 'POTENTIAL_MISMATCH'
           ELSE 'OK'
       END as slug_status
FROM problems 
WHERE numeric_id BETWEEN 11 AND 20
ORDER BY numeric_id;