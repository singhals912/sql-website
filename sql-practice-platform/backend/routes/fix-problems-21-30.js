const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// URGENT: Fix critical slug mismatches in problems 21-30
router.post('/fix-problems-21-30', async (req, res) => {
    try {
        console.log('🚨 URGENT: Fixing critical slug mismatches in problems 21-30...');
        
        const slugFixes = [
            { id: 21, slug: 'credit-suisse-investment-banking-ma' },
            { id: 22, slug: 'credit-suisse-private-banking-analytics' },
            { id: 23, slug: 'deutsche-bank-credit-risk-analytics' },
            { id: 24, slug: 'online-learning-platform-analytics' },
            { id: 27, slug: 'manufacturing-quality-control-analysis' },
            { id: 28, slug: 'goldman-sachs-algorithmic-trading-performance' },
            { id: 29, slug: 'goldman-sachs-prime-brokerage-analytics' },
            { id: 30, slug: 'hospital-patient-care-analytics' }
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
            WHERE numeric_id BETWEEN 21 AND 30
            ORDER BY numeric_id
        `);
        
        console.log(`✅ Fixed ${fixedCount} out of ${slugFixes.length} slug mismatches`);
        
        res.json({
            success: true,
            message: `Critical slug mismatch fixes applied`,
            fixed_count: fixedCount,
            total_attempted: slugFixes.length,
            fix_details: results,
            verification: verification.rows,
            critical_issues_resolved: [
                'Problem 21: ing-group-risk → credit-suisse-investment-banking-ma',
                'Problem 22: barclays-risk → credit-suisse-private-banking-analytics',
                'Problem 23: credit-suisse-risk → deutsche-bank-credit-risk-analytics',
                'Problem 24: disney-revenue → online-learning-platform-analytics',
                'Problem 27: ford-vehicle → manufacturing-quality-control-analysis',
                'Problem 28: berkshire-hathaway → goldman-sachs-algorithmic-trading-performance',
                'Problem 29: danske-bank-risk → goldman-sachs-prime-brokerage-analytics',
                'Problem 30: google-ad-revenue → hospital-patient-care-analytics'
            ]
        });
        
    } catch (error) {
        console.error('❌ Error fixing problems 21-30 slugs:', error);
        res.status(500).json({ 
            error: 'Failed to fix slug mismatches', 
            details: error.message 
        });
    }
});

// Generate redirect rules for SEO preservation
router.get('/generate-redirect-rules-21-30', async (req, res) => {
    try {
        const oldSlugs = {
            21: 'ing-group-risk-management-system',
            22: 'barclays-risk-management-system',
            23: 'credit-suisse-risk-management-system', 
            24: 'disney-revenue-analysis',
            27: 'ford-vehicle-sales-performance',
            28: 'berkshire-hathaway-insurance-float-optimization',
            29: 'danske-bank-risk-management-system',
            30: 'google-ad-revenue-by-platform'
        };
        
        const currentSlugs = await pool.query(`
            SELECT numeric_id, slug 
            FROM problems 
            WHERE numeric_id IN (21, 22, 23, 24, 27, 28, 29, 30)
            ORDER BY numeric_id
        `);
        
        const redirectRules = currentSlugs.rows.map(row => {
            const oldSlug = oldSlugs[row.numeric_id];
            return {
                old_url: `/problems/${oldSlug}`,
                new_url: `/problems/${row.slug}`,
                rule: `Redirect 301 /problems/${oldSlug} /problems/${row.slug}`
            };
        });
        
        res.json({
            success: true,
            redirect_rules: redirectRules,
            apache_rules: redirectRules.map(r => r.rule),
            nginx_rules: redirectRules.map(r => 
                `location /problems/${r.old_url.split('/').pop()} { return 301 /problems/${r.new_url.split('/').pop()}; }`
            )
        });
        
    } catch (error) {
        console.error('❌ Error generating redirect rules:', error);
        res.status(500).json({ 
            error: 'Failed to generate redirect rules', 
            details: error.message 
        });
    }
});

// Comprehensive slug audit for all problems
router.get('/audit-all-slugs', async (req, res) => {
    try {
        const auditResults = await pool.query(`
            SELECT 
                numeric_id,
                title,
                slug,
                CASE 
                    WHEN slug IS NULL THEN 'NULL_SLUG'
                    WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) || '%' THEN 'GOOD_MATCH'
                    WHEN LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) LIKE '%' || LOWER(SUBSTRING(title, 1, 30)) || '%' THEN 'PARTIAL_MATCH'
                    ELSE 'MISMATCH'
                END as match_status,
                LENGTH(title) - LENGTH(REPLACE(LOWER(title), LOWER(SUBSTRING(REPLACE(REPLACE(slug, '-', ' '), '_', ' '), 1, 20)), '')) as similarity_score
            FROM problems 
            ORDER BY 
                CASE 
                    WHEN slug IS NULL THEN 1
                    WHEN LOWER(title) LIKE '%' || LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) || '%' THEN 4
                    WHEN LOWER(REPLACE(REPLACE(slug, '-', ' '), '_', ' ')) LIKE '%' || LOWER(SUBSTRING(title, 1, 30)) || '%' THEN 3
                    ELSE 2
                END,
                numeric_id
        `);
        
        const summary = {
            total_problems: auditResults.rows.length,
            good_matches: auditResults.rows.filter(r => r.match_status === 'GOOD_MATCH').length,
            partial_matches: auditResults.rows.filter(r => r.match_status === 'PARTIAL_MATCH').length,
            mismatches: auditResults.rows.filter(r => r.match_status === 'MISMATCH').length,
            null_slugs: auditResults.rows.filter(r => r.match_status === 'NULL_SLUG').length,
            health_score: Math.round(
                (auditResults.rows.filter(r => ['GOOD_MATCH', 'PARTIAL_MATCH'].includes(r.match_status)).length / 
                 auditResults.rows.length) * 100
            )
        };
        
        res.json({
            success: true,
            summary: summary,
            all_problems: auditResults.rows,
            critical_issues: auditResults.rows.filter(r => ['MISMATCH', 'NULL_SLUG'].includes(r.match_status)),
            recommendations: summary.health_score < 80 ? 
                ['Immediate slug cleanup needed', 'Implement automated slug validation', 'Create slug generation standards'] :
                ['Maintain current slug quality', 'Monitor for future inconsistencies']
        });
        
    } catch (error) {
        console.error('❌ Error auditing slugs:', error);
        res.status(500).json({ 
            error: 'Failed to audit slugs', 
            details: error.message 
        });
    }
});

module.exports = router;