const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// POST /api/restore-original-schemas/all - Restore all original schemas from export
router.post('/all', async (req, res) => {
    try {
        console.log('🔄 Starting restoration of ALL original schemas from export...');
        
        // Read the original export data
        const exportFile = path.join(__dirname, '../problems-export-2025-08-24.json');
        if (!fs.existsSync(exportFile)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Export file not found. Cannot restore original schemas.' 
            });
        }
        
        const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        console.log(`📁 Found export with ${exportData.problem_schemas?.length || 0} original schemas`);
        
        if (!exportData.problem_schemas || exportData.problem_schemas.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No original schemas found in export file.' 
            });
        }
        
        let results = {
            restored: 0,
            skipped: 0,
            errors: []
        };
        
        // First, clear all existing generic schemas to avoid conflicts
        console.log('🧹 Clearing existing generic schemas...');
        await pool.query('DELETE FROM problem_schemas');
        
        // Restore each original schema
        for (const originalSchema of exportData.problem_schemas) {
            try {
                // Only restore PostgreSQL schemas (skip MySQL for now)
                if (originalSchema.sql_dialect !== 'postgresql') {
                    // Convert MySQL schema to PostgreSQL if needed
                    let postgresqlSchema = originalSchema.setup_sql;
                    if (originalSchema.sql_dialect === 'mysql') {
                        // Basic MySQL to PostgreSQL conversion
                        postgresqlSchema = postgresqlSchema
                            .replace(/TINYINT\(1\)/g, 'BOOLEAN')
                            .replace(/INT(?:\(\d+\))?/g, 'INTEGER')
                            .replace(/AUTO_INCREMENT/g, 'SERIAL')
                            .replace(/VARCHAR\((\d+)\)/g, 'VARCHAR($1)')
                            .replace(/TEXT/g, 'TEXT')
                            .replace(/DECIMAL\((\d+),(\d+)\)/g, 'DECIMAL($1,$2)')
                            .replace(/DATE/g, 'DATE')
                            .replace(/TIMESTAMP/g, 'TIMESTAMP');
                    }
                    
                    await pool.query(`
                        INSERT INTO problem_schemas (
                            problem_id, sql_dialect, setup_sql, expected_output, 
                            solution_sql, explanation
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING
                    `, [
                        originalSchema.problem_id,
                        'postgresql', // Always use PostgreSQL for our deployment
                        postgresqlSchema,
                        originalSchema.expected_output,
                        originalSchema.solution_sql,
                        originalSchema.explanation
                    ]);
                } else {
                    // Direct PostgreSQL schema
                    await pool.query(`
                        INSERT INTO problem_schemas (
                            problem_id, sql_dialect, setup_sql, expected_output, 
                            solution_sql, explanation
                        ) VALUES ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT DO NOTHING
                    `, [
                        originalSchema.problem_id,
                        originalSchema.sql_dialect,
                        originalSchema.setup_sql,
                        originalSchema.expected_output,
                        originalSchema.solution_sql,
                        originalSchema.explanation
                    ]);
                }
                
                results.restored++;
                
                if (results.restored % 10 === 0) {
                    console.log(`📝 Restored ${results.restored} original schemas...`);
                }
                
            } catch (err) {
                results.errors.push(`Schema for problem ${originalSchema.problem_id}: ${err.message}`);
                console.error(`❌ Error restoring schema: ${err.message}`);
            }
        }
        
        console.log(`✅ RESTORATION COMPLETE!`);
        console.log(`   - ${results.restored} schemas restored`);
        console.log(`   - ${results.skipped} schemas skipped`);
        console.log(`   - ${results.errors.length} errors`);
        
        // Final verification
        const finalCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        res.json({
            success: true,
            message: `Original schemas restored: ${results.restored} schemas from export`,
            processed: results,
            finalCount: parseInt(finalCount.rows[0].count),
            errors: results.errors.slice(0, 5) // Show only first 5 errors
        });
        
    } catch (error) {
        console.error('❌ Schema restoration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/restore-original-schemas/verify - Verify restoration results
router.post('/verify', async (req, res) => {
    try {
        console.log('🔍 Verifying restored schemas...');
        
        // Check a few key problems that should have specific schemas
        const verificationQueries = [
            { name: 'Social Media', query: "SELECT COUNT(*) FROM problem_schemas ps JOIN problems p ON ps.problem_id = p.id WHERE p.description ILIKE '%social media%'" },
            { name: 'A/B Testing', query: "SELECT COUNT(*) FROM problem_schemas ps JOIN problems p ON ps.problem_id = p.id WHERE p.description ILIKE '%ab test%' OR p.description ILIKE '%a/b test%'" },
            { name: 'Total Problems with Schemas', query: 'SELECT COUNT(DISTINCT problem_id) FROM problem_schemas' },
            { name: 'Total Schema Records', query: 'SELECT COUNT(*) FROM problem_schemas' }
        ];
        
        const results = {};
        for (const check of verificationQueries) {
            const result = await pool.query(check.query);
            results[check.name] = parseInt(result.rows[0].count);
        }
        
        // Get a sample schema to verify content
        const sampleResult = await pool.query(`
            SELECT p.title, ps.setup_sql 
            FROM problem_schemas ps 
            JOIN problems p ON ps.problem_id = p.id 
            WHERE ps.setup_sql IS NOT NULL 
            LIMIT 1
        `);
        
        const sample = sampleResult.rows.length > 0 ? {
            title: sampleResult.rows[0].title,
            schemaPreview: sampleResult.rows[0].setup_sql.substring(0, 200) + '...'
        } : null;
        
        res.json({
            success: true,
            message: 'Schema restoration verification completed',
            verification: results,
            sampleSchema: sample
        });
        
    } catch (error) {
        console.error('❌ Schema verification failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;