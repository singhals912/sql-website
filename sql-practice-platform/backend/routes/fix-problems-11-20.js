const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Fix problems 11-20 with identified issues
router.post('/fix-problems-11-20', async (req, res) => {
    try {
        console.log('🔧 Fixing problems 11-20...');
        
        // Problem 16: Charles Schwab - Simplify description to match solution reality
        await pool.query(`
            UPDATE problems 
            SET description = $1
            WHERE numeric_id = 16
        `, [
            `**Business Context:** Charles Schwab's wealth management division analyzes client portfolio performance across different wealth tiers to identify optimal investment strategies.

**Scenario:** You're a portfolio analyst studying client performance metrics. The investment committee needs to identify wealth management strategies that deliver strong returns with controlled risk.

**Problem:** Find wealth tiers with annual returns above 10% and portfolio volatility below 18% to recommend for new client onboarding.

**Expected Output:** Wealth tiers meeting performance criteria (>10% return, <18% volatility), ordered by annual return descending.`
        ]);
        
        // Problem 18: Restaurant Chain Sales - CRITICAL: Fix slug mismatch
        await pool.query(`
            UPDATE problems 
            SET slug = $1
            WHERE numeric_id = 18
        `, ['restaurant-chain-sales-analysis']);
        
        // Verify fixes were applied
        const verifyResults = await pool.query(`
            SELECT numeric_id, title, slug, LEFT(description, 100) as description_preview 
            FROM problems 
            WHERE numeric_id IN (16, 18)
            ORDER BY numeric_id
        `);
        
        console.log('✅ Problems 16 and 18 have been fixed');
        console.log('Verification results:', verifyResults.rows);
        
        // Check for other potential slug mismatches in 11-20 range
        const slugCheck = await pool.query(`
            SELECT numeric_id, title, slug
            FROM problems 
            WHERE numeric_id BETWEEN 11 AND 20
            ORDER BY numeric_id
        `);
        
        res.json({ 
            success: true, 
            message: 'Fixed problems 16 and 18',
            fixed_problems: [16, 18],
            verification: verifyResults.rows,
            slug_check: slugCheck.rows,
            details: {
                problem_16: 'Simplified description to match solution complexity',
                problem_18: 'Fixed critical slug mismatch: citibank-credit-card-fraud-detection -> restaurant-chain-sales-analysis'
            }
        });
        
    } catch (error) {
        console.error('❌ Error fixing problems 11-20:', error);
        res.status(500).json({ 
            error: 'Failed to fix problems 11-20', 
            details: error.message 
        });
    }
});

// Additional route to check for slug consistency across all problems
router.get('/check-slug-consistency', async (req, res) => {
    try {
        const slugCheck = await pool.query(`
            SELECT 
                numeric_id, 
                title, 
                slug,
                CASE 
                    WHEN slug IS NULL THEN 'NULL_SLUG'
                    WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) || '%' THEN 'GOOD_MATCH'
                    WHEN LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) LIKE '%' || LOWER(SUBSTRING(title, 1, 20)) || '%' THEN 'PARTIAL_MATCH'
                    ELSE 'POTENTIAL_MISMATCH'
                END as slug_status
            FROM problems 
            ORDER BY 
                CASE 
                    WHEN slug IS NULL THEN 1
                    WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) || '%' THEN 2
                    WHEN LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) LIKE '%' || LOWER(SUBSTRING(title, 1, 20)) || '%' THEN 3
                    ELSE 4
                END,
                numeric_id
        `);
        
        const summary = {
            total_problems: slugCheck.rows.length,
            good_matches: slugCheck.rows.filter(r => r.slug_status === 'GOOD_MATCH').length,
            partial_matches: slugCheck.rows.filter(r => r.slug_status === 'PARTIAL_MATCH').length,
            potential_mismatches: slugCheck.rows.filter(r => r.slug_status === 'POTENTIAL_MISMATCH').length,
            null_slugs: slugCheck.rows.filter(r => r.slug_status === 'NULL_SLUG').length
        };
        
        res.json({
            success: true,
            summary: summary,
            problems: slugCheck.rows,
            problematic_slugs: slugCheck.rows.filter(r => ['POTENTIAL_MISMATCH', 'NULL_SLUG'].includes(r.slug_status))
        });
        
    } catch (error) {
        console.error('❌ Error checking slug consistency:', error);
        res.status(500).json({ 
            error: 'Failed to check slug consistency', 
            details: error.message 
        });
    }
});

module.exports = router;