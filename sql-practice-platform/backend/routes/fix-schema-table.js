const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/fix-schema-table/update - Add missing columns to problem_schemas table
router.post('/update', async (req, res) => {
    try {
        console.log('🚀 Updating problem_schemas table structure...');
        
        // Add missing columns
        await pool.query(`
            ALTER TABLE problem_schemas 
            ADD COLUMN IF NOT EXISTS schema_sql TEXT,
            ADD COLUMN IF NOT EXISTS expected_output JSONB,
            ADD COLUMN IF NOT EXISTS solution_sql TEXT,
            ADD COLUMN IF NOT EXISTS explanation TEXT
        `);
        console.log('✅ Added missing columns to problem_schemas table');
        
        res.json({
            success: true,
            message: 'problem_schemas table updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Schema table update failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;