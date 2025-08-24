const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/emergency-fix/restore-basic-functionality
router.post('/restore-basic-functionality', async (req, res) => {
    try {
        console.log('🚨 Starting emergency fix to restore basic functionality...');
        
        // First check what tables exist
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        const existingTables = tablesResult.rows.map(row => row.table_name);
        console.log('📋 Existing tables:', existingTables);
        
        // Check if problems table exists and has data
        if (existingTables.includes('problems')) {
            const problemCount = await pool.query('SELECT COUNT(*) FROM problems');
            console.log(`📝 Problems table has ${problemCount.rows[0].count} records`);
        } else {
            console.log('❌ Problems table does not exist!');
        }
        
        // Check if categories table exists and has data  
        if (existingTables.includes('categories')) {
            const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
            console.log(`📂 Categories table has ${categoryCount.rows[0].count} records`);
        } else {
            console.log('❌ Categories table does not exist!');
        }
        
        // Check problem_schemas table
        if (existingTables.includes('problem_schemas')) {
            const schemaCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
            console.log(`🗂️ Problem_schemas table has ${schemaCount.rows[0].count} records`);
        } else {
            console.log('❌ Problem_schemas table does not exist!');
        }
        
        // Test a simple problem query to see what's failing
        let testResult = null;
        try {
            testResult = await pool.query(`
                SELECT p.id, p.title, p.slug, p.difficulty, p.numeric_id
                FROM problems p
                WHERE p.is_active = true
                LIMIT 5
            `);
            console.log(`✅ Basic problems query works: ${testResult.rows.length} results`);
        } catch (queryError) {
            console.log('❌ Basic problems query failed:', queryError.message);
        }
        
        // Try the JOIN query that might be failing
        try {
            const joinResult = await pool.query(`
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM problems p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = true
                LIMIT 3
            `);
            console.log(`✅ JOIN query works: ${joinResult.rows.length} results`);
        } catch (joinError) {
            console.log('❌ JOIN query failed:', joinError.message);
        }
        
        res.json({
            success: true,
            message: 'Emergency diagnostic completed',
            tables: existingTables,
            diagnostics: {
                problemsTableExists: existingTables.includes('problems'),
                categoriesTableExists: existingTables.includes('categories'),
                schemasTableExists: existingTables.includes('problem_schemas'),
                basicQueryWorks: testResult ? testResult.rows.length > 0 : false
            }
        });
        
    } catch (error) {
        console.error('❌ Emergency fix failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/emergency-fix/add-sample-problem
router.post('/add-sample-problem', async (req, res) => {
    try {
        console.log('🔧 Adding a sample problem to test functionality...');
        
        // Add a simple test problem to verify the system works
        const sampleProblem = {
            id: '00000000-0000-0000-0000-000000000001',
            title: 'Test Problem - Emergency Fix',
            slug: 'test-emergency-problem',
            description: 'This is a test problem to verify system functionality.',
            difficulty: 'easy',
            category_id: null,
            is_premium: false,
            is_active: true,
            numeric_id: 999,
            tags: null,
            hints: null
        };
        
        // Insert sample problem
        await pool.query(`
            INSERT INTO problems (
                id, title, slug, description, difficulty, category_id,
                is_premium, is_active, numeric_id, tags, hints, created_at,
                total_submissions, total_accepted, acceptance_rate
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, 0, 0, '0.00')
            ON CONFLICT (id) DO NOTHING
        `, [
            sampleProblem.id, sampleProblem.title, sampleProblem.slug,
            sampleProblem.description, sampleProblem.difficulty, sampleProblem.category_id,
            sampleProblem.is_premium, sampleProblem.is_active, sampleProblem.numeric_id,
            sampleProblem.tags, sampleProblem.hints
        ]);
        
        // Add a simple schema for this problem
        await pool.query(`
            INSERT INTO problem_schemas (
                problem_id, sql_dialect, setup_sql, expected_output
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
        `, [
            sampleProblem.id,
            'postgresql',
            `CREATE TABLE test_table (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                value INTEGER
            );
            
            INSERT INTO test_table (name, value) VALUES
            ('Test 1', 100),
            ('Test 2', 200),
            ('Test 3', 300);`,
            JSON.stringify([
                {"name": "Test 1", "value": "100"},
                {"name": "Test 2", "value": "200"},
                {"name": "Test 3", "value": "300"}
            ])
        ]);
        
        console.log('✅ Sample problem added successfully');
        
        res.json({
            success: true,
            message: 'Sample problem added successfully',
            problemId: sampleProblem.id
        });
        
    } catch (error) {
        console.error('❌ Failed to add sample problem:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;