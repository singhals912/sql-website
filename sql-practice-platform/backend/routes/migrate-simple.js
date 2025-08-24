const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/migrate-simple/init - Initialize database with inline schema
router.post('/init', async (req, res) => {
    try {
        console.log('🚀 Creating basic schema...');
        
        // Create basic schema inline
        await pool.query(`
            -- Enable UUID extension
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            
            -- Categories table
            CREATE TABLE IF NOT EXISTS categories (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                slug VARCHAR(100) UNIQUE NOT NULL,
                icon VARCHAR(50),
                sort_order INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Problems table
            CREATE TABLE IF NOT EXISTS problems (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title VARCHAR(200) NOT NULL,
                slug VARCHAR(200) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
                category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
                is_premium BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                numeric_id INTEGER UNIQUE,
                tags JSONB,
                hints JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                total_submissions INTEGER DEFAULT 0,
                total_accepted INTEGER DEFAULT 0,
                acceptance_rate DECIMAL(5,2) DEFAULT 0.00,
                search_vector tsvector
            );
            
            -- Users table
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                is_active BOOLEAN DEFAULT true,
                is_verified BOOLEAN DEFAULT false,
                subscription_tier VARCHAR(20) DEFAULT 'free',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('✅ Basic schema created');
        
        // Insert sample category
        await pool.query(`
            INSERT INTO categories (name, slug, description) 
            VALUES ('Advanced Topics', 'advanced-topics', 'Complex SQL problems for advanced users')
            ON CONFLICT (slug) DO NOTHING;
        `);
        
        // Insert a sample problem
        await pool.query(`
            INSERT INTO problems (title, slug, description, difficulty, category_id, numeric_id)
            SELECT 
                'Sample SQL Problem',
                'sample-problem', 
                'This is a sample problem to test the system.',
                'easy',
                (SELECT id FROM categories WHERE slug = 'advanced-topics'),
                1
            ON CONFLICT (slug) DO NOTHING;
        `);
        
        console.log('✅ Sample data inserted');
        
        // Check final counts
        const problemsResult = await pool.query('SELECT COUNT(*) FROM problems');
        const categoriesResult = await pool.query('SELECT COUNT(*) FROM categories');
        
        const counts = {
            problems: parseInt(problemsResult.rows[0].count),
            categories: parseInt(categoriesResult.rows[0].count)
        };
        
        console.log('🎉 Migration completed!', counts);
        
        res.json({
            success: true,
            message: 'Database initialized successfully',
            counts
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/migrate-simple/status
router.get('/status', async (req, res) => {
    try {
        const problems = await pool.query('SELECT COUNT(*) FROM problems');
        const categories = await pool.query('SELECT COUNT(*) FROM categories');
        
        res.json({
            success: true,
            counts: {
                problems: parseInt(problems.rows[0].count),
                categories: parseInt(categories.rows[0].count)
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