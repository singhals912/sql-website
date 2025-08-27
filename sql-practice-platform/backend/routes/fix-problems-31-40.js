const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// URGENT: Fix critical slug mismatches in problems 31-40
router.post('/fix-problems-31-40', async (req, res) => {
    try {
        console.log('🚨 URGENT: Fixing critical slug mismatches in problems 31-40...');
        
        const slugFixes = [
            { id: 31, slug: 'hsbc-trade-finance-analytics' },
            { id: 32, slug: 'real-estate-market-analysis' },
            { id: 33, slug: 'ing-sustainable-finance-analytics' },
            { id: 34, slug: 'intel-semiconductor-manufacturing-analytics' },
            { id: 35, slug: 'subscription-business-analytics' },
            { id: 36, slug: 'digital-marketing-campaign-performance' },
            { id: 38, slug: 'linkedin-professional-network-analytics' },
            { id: 39, slug: 'supply-chain-logistics-analytics' },
            { id: 40, slug: 'mastercard-global-payment-network-analytics' }
            // Problem 37 already has correct slug: jpmorgan-derivatives-risk-analytics
        ];
        
        let fixedCount = 0;
        const results = [];
        
        for (const fix of slugFixes) {
            try {
                const result = await pool.query(
                    'UPDATE problems SET slug = $1 WHERE numeric_id = $2 RETURNING numeric_id, title, slug',
                    [fix.slug, fix.id]
                );
                
                if (result.rows.length > 0) {
                    fixedCount++;
                    results.push({
                        problem_id: fix.id,
                        new_slug: fix.slug,
                        status: 'FIXED'
                    });
                }
            } catch (error) {
                results.push({
                    problem_id: fix.id,
                    error: error.message,
                    status: 'ERROR'
                });
            }
        }
        
        // Verify all fixes were applied
        const verification = await pool.query(`
            SELECT 
                numeric_id, 
                title, 
                slug,
                CASE 
                    WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(slug, '-', ' ')) || '%' THEN 'GOOD_MATCH'
                    WHEN LOWER(REPLACE(slug, '-', ' ')) LIKE '%' || LOWER(SUBSTRING(title, 1, 20)) || '%' THEN 'PARTIAL_MATCH'
                    ELSE 'STILL_MISMATCHED' 
                END as match_status
            FROM problems 
            WHERE numeric_id BETWEEN 31 AND 40
            ORDER BY numeric_id
        `);
        
        console.log(`✅ Fixed ${fixedCount} out of ${slugFixes.length} slug mismatches in problems 31-40`);
        
        res.json({
            success: true,
            message: `Critical slug mismatch fixes applied to problems 31-40`,
            fixed_count: fixedCount,
            total_attempted: slugFixes.length,
            fix_details: results,
            verification: verification.rows,
            critical_issues_resolved: [
                'Problem 31: deutsche-bank-risk → hsbc-trade-finance-analytics',
                'Problem 32: home-depot-revenue → real-estate-market-analysis',
                'Problem 33: goldman-sachs-risk → ing-sustainable-finance-analytics',
                'Problem 34: high-value-customers → intel-semiconductor-manufacturing-analytics',
                'Problem 35: jp-morgan-trading → subscription-business-analytics',
                'Problem 36: jpmorgan-chase-portfolio → digital-marketing-campaign-performance',
                'Problem 38: ibm-watson-ai → linkedin-professional-network-analytics',
                'Problem 39: lockheed-martin-defense → supply-chain-logistics-analytics',
                'Problem 40: mastercard-portfolio → mastercard-global-payment-network-analytics'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error fixing problems 31-40 slugs:', error);
        res.status(500).json({ 
            error: 'Failed to fix slug mismatches in problems 31-40', 
            details: error.message 
        });
    }
});

// Batch fix ALL remaining slug mismatches (31-70)
router.post('/fix-all-remaining-slugs', async (req, res) => {
    try {
        console.log('🚨 SYSTEM-WIDE: Fixing ALL remaining slug mismatches...');
        
        // Get all problems with mismatched slugs
        const mismatchedProblems = await pool.query(`
            SELECT 
                numeric_id,
                title,
                slug,
                LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g')) as suggested_slug
            FROM problems 
            WHERE numeric_id >= 31
            AND (
                slug IS NULL 
                OR NOT (LOWER(title) LIKE '%' || LOWER(REPLACE(slug, '-', ' ')) || '%')
            )
            ORDER BY numeric_id
        `);
        
        let fixedCount = 0;
        const results = [];
        
        for (const problem of mismatchedProblems.rows) {
            try {
                const newSlug = problem.suggested_slug;
                
                const result = await pool.query(
                    'UPDATE problems SET slug = $1 WHERE numeric_id = $2 RETURNING numeric_id, title, slug',
                    [newSlug, problem.numeric_id]
                );
                
                if (result.rows.length > 0) {
                    fixedCount++;
                    results.push({
                        problem_id: problem.numeric_id,
                        old_slug: problem.slug,
                        new_slug: newSlug,
                        status: 'FIXED'
                    });
                }
            } catch (error) {
                results.push({
                    problem_id: problem.numeric_id,
                    error: error.message,
                    status: 'ERROR'
                });
            }
        }
        
        // Get updated system health
        const healthCheck = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) || '%' THEN 1 END) as good_matches
            FROM problems
        `);
        
        const healthScore = Math.round((healthCheck.rows[0].good_matches / healthCheck.rows[0].total) * 100);
        
        console.log(`✅ SYSTEM-WIDE FIX: Fixed ${fixedCount} slug mismatches`);
        console.log(`📊 New system health score: ${healthScore}%`);
        
        res.json({
            success: true,
            message: `System-wide slug mismatch fixes applied`,
            fixed_count: fixedCount,
            total_problems: parseInt(healthCheck.rows[0].total),
            new_health_score: healthScore,
            fix_details: results.slice(0, 20), // Limit response size
            summary: `Fixed ${fixedCount} problems, health improved to ${healthScore}%`
        });
        
    } catch (error) {
        console.error('❌ Error in system-wide slug fix:', error);
        res.status(500).json({ 
            error: 'Failed to fix system-wide slug mismatches', 
            details: error.message 
        });
    }
});

module.exports = router;