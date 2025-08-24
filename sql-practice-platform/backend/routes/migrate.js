const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// POST /api/migrate/init - Initialize database with schema and sample data
router.post('/init', async (req, res) => {
    try {
        console.log('🚀 Starting database migration...');
        
        // First, check if database already has data
        const countResult = await pool.query('SELECT COUNT(*) FROM problems');
        const problemCount = parseInt(countResult.rows[0].count);
        
        if (problemCount > 0) {
            return res.json({
                success: true,
                message: `Database already initialized with ${problemCount} problems`,
                problemCount
            });
        }
        
        console.log('📋 Database is empty, starting migration...');
        
        // Read and execute schema if needed
        try {
            const schemaPath = path.join(__dirname, '../../../database/init.sql');
            if (fs.existsSync(schemaPath)) {
                const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
                await pool.query(schemaSQL);
                console.log('✅ Schema initialized');
            }
        } catch (err) {
            console.log('Schema already exists or error:', err.message);
        }
        
        // Apply migrations
        try {
            const migrationPath = path.join(__dirname, '../../../database/migrations/001_add_missing_critical_tables.sql');
            if (fs.existsSync(migrationPath)) {
                const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
                await pool.query(migrationSQL);
                console.log('✅ Migrations applied');
            }
        } catch (err) {
            console.log('Migration error (might be already applied):', err.message);
        }
        
        // Add sample data if needed
        try {
            const sampleDataPath = path.join(__dirname, '../../../database/sample_problems.sql');
            if (fs.existsSync(sampleDataPath)) {
                const sampleSQL = fs.readFileSync(sampleDataPath, 'utf8');
                await pool.query(sampleSQL);
                console.log('✅ Sample data loaded');
            }
        } catch (err) {
            console.log('Sample data error:', err.message);
        }
        
        // Final count check
        const finalCountResult = await pool.query('SELECT COUNT(*) FROM problems');
        const finalProblemCount = parseInt(finalCountResult.rows[0].count);
        
        console.log(`🎉 Migration completed! Database has ${finalProblemCount} problems`);
        
        res.json({
            success: true,
            message: `Database migration completed successfully`,
            problemCount: finalProblemCount
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/migrate/status - Check database status
router.get('/status', async (req, res) => {
    try {
        const problems = await pool.query('SELECT COUNT(*) FROM problems');
        const categories = await pool.query('SELECT COUNT(*) FROM categories');
        const users = await pool.query('SELECT COUNT(*) FROM users');
        
        res.json({
            success: true,
            counts: {
                problems: parseInt(problems.rows[0].count),
                categories: parseInt(categories.rows[0].count), 
                users: parseInt(users.rows[0].count)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;