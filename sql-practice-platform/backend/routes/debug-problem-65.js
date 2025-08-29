const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Debug endpoint to see exactly what Problem 65 returns
router.get('/problem-65-debug', async (req, res) => {
    try {
        console.log('🔍 DEBUGGING Problem 65...');
        
        // Check what the problems API actually returns for Problem 65
        const problemQuery = `
            SELECT 
                p.*,
                ps.id as schema_id,
                ps.setup_sql,
                ps.sql_dialect,
                LENGTH(ps.setup_sql) as setup_sql_length,
                ps.setup_sql IS NOT NULL as has_setup_sql
            FROM problems p
            LEFT JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = 65
            ORDER BY 
                CASE WHEN ps.sql_dialect = 'postgresql' THEN 1 ELSE 2 END,
                ps.id
        `;
        
        const result = await pool.query(problemQuery);
        
        const debugInfo = {
            totalRecords: result.rows.length,
            problem: result.rows[0] || null,
            allSchemas: result.rows.map(row => ({
                schema_id: row.schema_id,
                sql_dialect: row.sql_dialect,
                has_setup_sql: row.has_setup_sql,
                setup_sql_length: row.setup_sql_length,
                setup_sql_preview: row.setup_sql ? row.setup_sql.substring(0, 100) + '...' : null
            }))
        };
        
        console.log('Problem 65 debug info:', debugInfo);
        
        res.json({
            success: true,
            message: 'Problem 65 debug information',
            debug: debugInfo,
            rawApiResponse: result.rows[0] || null
        });
        
    } catch (error) {
        console.error('❌ Error debugging Problem 65:', error);
        res.status(500).json({ 
            error: 'Debug failed', 
            details: error.message 
        });
    }
});

module.exports = router;