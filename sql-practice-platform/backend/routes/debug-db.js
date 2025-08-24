const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Debug database structure
router.get('/tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        const tables = {};
        for (const table of result.rows) {
            const columns = await pool.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = $1 AND table_schema = 'public'
                ORDER BY ordinal_position
            `, [table.table_name]);
            
            tables[table.table_name] = columns.rows;
        }
        
        res.json({ tables });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check specific problem data
router.get('/problem/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const problem = await pool.query(
            'SELECT * FROM problems WHERE slug = $1',
            [slug]
        );
        
        let schemas = [];
        try {
            const schemaResult = await pool.query(
                'SELECT * FROM problem_schemas WHERE problem_id = $1',
                [problem.rows[0]?.id]
            );
            schemas = schemaResult.rows;
        } catch (err) {
            // Table might not exist
        }
        
        res.json({
            problem: problem.rows[0] || null,
            schemas: schemas,
            message: problem.rows.length > 0 ? 'Problem found' : 'Problem not found'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;