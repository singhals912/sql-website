const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Emergency fix route to populate database
router.post('/emergency-populate', async (req, res) => {
    try {
        console.log('🚀 Emergency database population...');
        
        // Drop and recreate tables
        await pool.query('DROP TABLE IF EXISTS problem_schemas CASCADE');
        await pool.query('DROP TABLE IF EXISTS problems CASCADE');
        await pool.query('DROP TABLE IF EXISTS categories CASCADE');
        
        // Create tables
        await pool.query(`
            CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await pool.query(`
            CREATE TABLE problems (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                difficulty VARCHAR(20) DEFAULT 'Easy',
                category_id INTEGER REFERENCES categories(id),
                slug VARCHAR(255) UNIQUE,
                numeric_id INTEGER UNIQUE,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                solution_sql TEXT,
                expected_output JSONB
            );
        `);
        
        await pool.query(`
            CREATE TABLE problem_schemas (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
                schema_name VARCHAR(100),
                setup_sql TEXT,
                teardown_sql TEXT,
                sample_data TEXT,
                expected_output JSONB,
                solution_sql TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Insert categories
        await pool.query(`INSERT INTO categories (name, slug, description) VALUES 
            ('SQL Basics', 'sql-basics', 'Fundamental SQL concepts'),
            ('Data Analysis', 'data-analysis', 'Business analytics queries'),
            ('Advanced SQL', 'advanced-sql', 'Complex SQL operations')`);
        
        // Insert the Adobe problem with proper expected output
        const result = await pool.query(`
            INSERT INTO problems (title, description, difficulty, category_id, slug, numeric_id, is_active, solution_sql, expected_output)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
        `, [
            'Adobe Creative Cloud Subscription Analytics',
            'Analyze subscription data for Adobe Creative Cloud to identify top customers by total spending. Join customer and order tables to calculate spending metrics.',
            'Easy',
            2, // Data Analysis category
            'adobe-creative-cloud-subscription-analytics',
            5,
            true,
            'SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = \'completed\' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;',
            '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"}]'
        ]);
        
        const problemId = result.rows[0].id;
        
        // Insert schema for the problem
        await pool.query(`
            INSERT INTO problem_schemas (problem_id, schema_name, setup_sql, sample_data, expected_output, solution_sql)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            problemId,
            'ecommerce',
            'CREATE TABLE customers (customer_id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), registration_date DATE); CREATE TABLE orders (order_id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), total_amount DECIMAL(10,2), status VARCHAR(50), order_date DATE);',
            'INSERT INTO customers (customer_id, name, email, registration_date) VALUES (1, \'John Smith\', \'john@example.com\', \'2024-01-15\'), (2, \'Jane Doe\', \'jane@example.com\', \'2024-02-01\'); INSERT INTO orders (order_id, customer_id, total_amount, status, order_date) VALUES (1, 1, 199.99, \'completed\', \'2024-03-01\'), (2, 1, 189.99, \'completed\', \'2024-03-15\'), (3, 2, 149.99, \'completed\', \'2024-03-02\'), (4, 2, 199.50, \'completed\', \'2024-03-20\');',
            '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"}]',
            'SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = \'completed\' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;'
        ]);
        
        res.json({ success: true, message: 'Database populated successfully', problemId });
        
    } catch (error) {
        console.error('Population failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all problems with pagination
router.get('/', async (req, res) => {
    try {
        // First check if tables exist and auto-populate if empty
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'problems'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('🚨 Problems table does not exist, creating and populating...');
            
            // Create tables and populate
            await pool.query(`
                CREATE TABLE categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    slug VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE problems (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    difficulty VARCHAR(20) DEFAULT 'Easy',
                    category_id INTEGER REFERENCES categories(id),
                    slug VARCHAR(255) UNIQUE,
                    numeric_id INTEGER UNIQUE,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    solution_sql TEXT,
                    expected_output JSONB
                );
                
                CREATE TABLE problem_schemas (
                    id SERIAL PRIMARY KEY,
                    problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
                    schema_name VARCHAR(100),
                    setup_sql TEXT,
                    teardown_sql TEXT,
                    sample_data TEXT,
                    expected_output JSONB,
                    solution_sql TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                INSERT INTO categories (name, slug, description) VALUES 
                    ('SQL Basics', 'sql-basics', 'Fundamental SQL concepts'),
                    ('Data Analysis', 'data-analysis', 'Business analytics queries'),
                    ('Advanced SQL', 'advanced-sql', 'Complex SQL operations');
            `);
            
            // Insert test problem
            const result = await pool.query(`
                INSERT INTO problems (title, description, difficulty, category_id, slug, numeric_id, is_active, solution_sql, expected_output)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
            `, [
                'Adobe Creative Cloud Subscription Analytics',
                'Analyze subscription data for Adobe Creative Cloud to identify top customers by total spending.',
                'Easy', 2, 'adobe-creative-cloud-subscription-analytics', 5, true,
                'SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = \'completed\' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;',
                '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"}]'
            ]);
            
            // Insert schema
            await pool.query(`
                INSERT INTO problem_schemas (problem_id, schema_name, setup_sql, sample_data, expected_output, solution_sql)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                result.rows[0].id, 'ecommerce',
                'CREATE TABLE customers (customer_id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), registration_date DATE); CREATE TABLE orders (order_id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), total_amount DECIMAL(10,2), status VARCHAR(50), order_date DATE);',
                'INSERT INTO customers VALUES (1, \'John Smith\', \'john@example.com\', \'2024-01-15\'), (2, \'Jane Doe\', \'jane@example.com\', \'2024-02-01\'); INSERT INTO orders VALUES (1, 1, 199.99, \'completed\', \'2024-03-01\'), (2, 1, 189.99, \'completed\', \'2024-03-15\'), (3, 2, 149.99, \'completed\', \'2024-03-02\'), (4, 2, 199.50, \'completed\', \'2024-03-20\');',
                '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"}]',
                'SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = \'completed\' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;'
            ]);
            
            console.log('✅ Database auto-populated successfully');
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        const difficulty = req.query.difficulty;
        const category = req.query.category;

        let query = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE (p.is_active = true OR p.is_active IS NULL)
        `;
        const queryParams = [];
        let paramIndex = 1;

        if (difficulty) {
            query += ` AND p.difficulty = $${paramIndex}`;
            queryParams.push(difficulty);
            paramIndex++;
        }

        if (category) {
            query += ` AND c.slug = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM problems p';
        if (difficulty || category) {
            countQuery += ' LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true';
            const countParams = [];
            let countParamIndex = 1;
            
            if (difficulty) {
                countQuery += ` AND p.difficulty = $${countParamIndex}`;
                countParams.push(difficulty);
                countParamIndex++;
            }
            
            if (category) {
                countQuery += ` AND c.slug = $${countParamIndex}`;
                countParams.push(category);
            }
            
            const countResult = await pool.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].count);
            
            res.json({
                problems: result.rows,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } else {
            const countResult = await pool.query('SELECT COUNT(*) FROM problems WHERE is_active = true');
            const total = parseInt(countResult.rows[0].count);
            
            res.json({
                problems: result.rows,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        }
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// Get single problem by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const problemQuery = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.slug = $1 AND p.is_active = true
        `;
        
        const problemResult = await pool.query(problemQuery, [slug]);
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const problem = problemResult.rows[0];
        
        // Get problem schemas (if table exists)
        let schemas = [];
        try {
            const schemaQuery = `
                SELECT * FROM problem_schemas 
                WHERE problem_id = $1
                ORDER BY sql_dialect
            `;
            const schemaResult = await pool.query(schemaQuery, [problem.id]);
            schemas = schemaResult.rows;
        } catch (schemaError) {
            console.log('Schema table not found or empty, using empty schemas');
            schemas = [];
        }
        
        res.json({
            ...problem,
            schemas: schemas
        });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

// Get categories
router.get('/categories/list', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, COUNT(p.id) as problem_count
            FROM categories c
            LEFT JOIN problems p ON c.id = p.category_id AND p.is_active = true
            WHERE c.is_active = true
            GROUP BY c.id, c.name, c.description, c.slug, c.icon, c.sort_order
            ORDER BY c.sort_order
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;