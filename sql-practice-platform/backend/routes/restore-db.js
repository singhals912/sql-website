const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/restore-db/full - Restore complete database schema and data
router.post('/full', async (req, res) => {
    try {
        console.log('🚀 Starting full database restoration...');
        
        // Create categories table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created categories table');
        
        // Create problems table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
                category_id UUID REFERENCES categories(id),
                is_premium BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                numeric_id INTEGER UNIQUE,
                tags JSONB,
                hints JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_submissions INTEGER DEFAULT 0,
                total_accepted INTEGER DEFAULT 0,
                acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
                search_vector tsvector
            )
        `);
        console.log('✅ Created problems table');
        
        // Create problem_schemas table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problem_schemas (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
                sql_dialect VARCHAR(20) NOT NULL DEFAULT 'postgresql',
                schema_sql TEXT,
                sample_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created problem_schemas table');
        
        res.json({
            success: true,
            message: 'Database schema restored successfully'
        });
        
    } catch (error) {
        console.error('❌ Database restoration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;