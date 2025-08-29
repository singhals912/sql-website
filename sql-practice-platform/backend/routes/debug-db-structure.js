const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Debug database structure
router.get('/table-structure', async (req, res) => {
    try {
        console.log('🔍 DEBUG: Checking database table structures...');
        
        // Check problem_schemas table structure
        const schemasStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'problem_schemas'
            ORDER BY ordinal_position
        `);
        
        // Check problems table structure
        const problemsStructure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'problems'
            ORDER BY ordinal_position
        `);
        
        // Check sample data from both tables
        const sampleProblems = await pool.query(`
            SELECT id, numeric_id, title 
            FROM problems 
            WHERE numeric_id BETWEEN 61 AND 70 
            LIMIT 3
        `);
        
        const sampleSchemas = await pool.query(`
            SELECT id, problem_id, setup_sql IS NOT NULL as has_setup_sql 
            FROM problem_schemas 
            LIMIT 3
        `);
        
        res.json({
            success: true,
            message: 'Database structure analysis',
            tables: {
                problem_schemas: {
                    structure: schemasStructure.rows,
                    sampleData: sampleSchemas.rows
                },
                problems: {
                    structure: problemsStructure.rows,
                    sampleData: sampleProblems.rows
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Error debugging database structure:', error);
        res.status(500).json({ 
            error: 'Debug failed', 
            details: error.message 
        });
    }
});

module.exports = router;