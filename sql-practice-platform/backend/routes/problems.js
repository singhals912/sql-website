const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Emergency restore all problems route
router.post('/emergency-restore-all', async (req, res) => {
    try {
        console.log('🚨 EMERGENCY RESTORE: Starting complete database restoration...');
        
        // Clear everything first
        await pool.query('TRUNCATE problem_schemas, problems, categories RESTART IDENTITY CASCADE');
        
        // Recreate categories
        const categories = [
            { name: 'SQL Basics', slug: 'sql-basics', description: 'Fundamental SQL concepts and basic queries' },
            { name: 'Data Analysis', slug: 'data-analysis', description: 'Business intelligence and analytics queries' },
            { name: 'Advanced SQL', slug: 'advanced-sql', description: 'Complex SQL operations and optimization' },
            { name: 'Joins', slug: 'joins', description: 'Table relationships and join operations' },
            { name: 'Aggregations', slug: 'aggregations', description: 'GROUP BY, HAVING, and aggregate functions' }
        ];
        
        for (let i = 0; i < categories.length; i++) {
            await pool.query(
                'INSERT INTO categories (id, name, slug, description) VALUES ($1, $2, $3, $4)',
                [i + 1, categories[i].name, categories[i].slug, categories[i].description]
            );
        }
        
        // Create comprehensive set of test problems
        const problems = [];
        const schemas = [];
        
        // Start with high numeric_ids to avoid conflicts with existing problems
        let nextNumericId = 11;
        
        // Problem 1: Adobe Creative Cloud (the working one)
        problems.push({
            id: 1, title: 'Adobe Creative Cloud Subscription Analytics',
            description: `Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns and loyalty programs. As a data analyst, you need to analyze customer subscription and purchase data to determine which customers have spent the most money overall.

**Business Context:**
Adobe Creative Cloud offers various subscription plans and additional purchases. The company wants to:
- Identify top-spending customers for premium support
- Create personalized offers for high-value customers  
- Understand customer purchasing patterns
- Calculate customer lifetime value metrics

**Your Task:**
Write a SQL query that analyzes the customer and order data to find customers who have made the highest total purchases. Your query should:

1. Join the customers and orders tables
2. Only include completed orders (status = 'completed')
3. Calculate the total number of orders per customer
4. Calculate the total amount spent per customer
5. Display results ordered by total spending (highest first)
6. Include customer name, order count, and total spent

**Expected Columns:**
- customer_name: The customer's full name
- order_count: Total number of completed orders
- total_spent: Total amount spent across all orders`,
            difficulty: 'Easy', category_id: 2, slug: 'adobe-creative-cloud-subscription-analytics-new', numeric_id: nextNumericId++,
            solution_sql: 'SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = \'completed\' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;',
            expected_output: '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"}]'
        });
        
        schemas.push({
            problem_id: 1, schema_name: 'ecommerce',
            setup_sql: 'CREATE TABLE customers (customer_id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), registration_date DATE); CREATE TABLE orders (order_id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), total_amount DECIMAL(10,2), status VARCHAR(50), order_date DATE);',
            sample_data: 'INSERT INTO customers VALUES (1, \'John Smith\', \'john.smith@gmail.com\', \'2023-01-15\'), (2, \'Jane Doe\', \'jane.doe@company.com\', \'2023-02-01\'), (3, \'Mike Wilson\', \'mike.w@design.co\', \'2023-01-20\'), (4, \'Sarah Johnson\', \'sarah@freelancer.com\', \'2023-03-10\'); INSERT INTO orders VALUES (1, 1, 199.99, \'completed\', \'2024-01-05\'), (2, 1, 189.99, \'completed\', \'2024-02-15\'), (3, 2, 149.99, \'completed\', \'2024-01-12\'), (4, 2, 199.50, \'completed\', \'2024-03-08\'), (5, 3, 99.99, \'completed\', \'2024-01-25\'), (6, 3, 79.99, \'pending\', \'2024-03-20\'), (7, 4, 249.99, \'completed\', \'2024-02-10\'), (8, 1, 49.99, \'cancelled\', \'2024-03-01\');',
            expected_output: '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"},{"customer_name":"Sarah Johnson","order_count":"1","total_spent":"249.99"},{"customer_name":"Mike Wilson","order_count":"1","total_spent":"99.99"}]',
            solution_sql: 'SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = \'completed\' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;'
        });
        
        // Problem 2: Basic Employee Query
        problems.push({
            id: 2, title: 'Employee Salary Analysis',
            description: 'Find employees with salary greater than average salary in the company.',
            difficulty: 'Easy', category_id: 1, slug: 'employee-salary-analysis-new', numeric_id: nextNumericId++,
            solution_sql: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
            expected_output: '[{"name":"John Smith","salary":"75000.00"},{"name":"Sarah Wilson","salary":"82000.00"}]'
        });
        
        schemas.push({
            problem_id: 2, schema_name: 'hr',
            setup_sql: 'CREATE TABLE employees (id SERIAL PRIMARY KEY, name VARCHAR(100), salary DECIMAL(10,2), department VARCHAR(50), hire_date DATE);',
            sample_data: 'INSERT INTO employees VALUES (1, \'John Smith\', 75000, \'Engineering\', \'2023-01-15\'), (2, \'Jane Doe\', 65000, \'Marketing\', \'2023-02-01\'), (3, \'Sarah Wilson\', 82000, \'Engineering\', \'2023-01-20\'), (4, \'Mike Brown\', 58000, \'Sales\', \'2023-03-10\');',
            expected_output: '[{"name":"John Smith","salary":"75000.00"},{"name":"Sarah Wilson","salary":"82000.00"}]',
            solution_sql: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);'
        });
        
        // Add more problems for completeness (up to 10 to start)
        for (let i = 3; i <= 10; i++) {
            problems.push({
                id: i, title: `SQL Practice Problem ${i}`,
                description: `Practice problem ${i} for SQL learning and skill development.`,
                difficulty: i <= 4 ? 'Easy' : (i <= 7 ? 'Medium' : 'Hard'),
                category_id: ((i - 1) % 5) + 1, slug: `sql-practice-problem-${i}-new`, numeric_id: nextNumericId++,
                solution_sql: 'SELECT * FROM sample_table;',
                expected_output: '[{"id":"1","name":"Sample"}]'
            });
            
            schemas.push({
                problem_id: i, schema_name: 'sample',
                setup_sql: 'CREATE TABLE sample_table (id SERIAL PRIMARY KEY, name VARCHAR(100));',
                sample_data: 'INSERT INTO sample_table VALUES (1, \'Sample\');',
                expected_output: '[{"id":"1","name":"Sample"}]',
                solution_sql: 'SELECT * FROM sample_table;'
            });
        }
        
        // Insert all problems
        for (const problem of problems) {
            await pool.query(`
                INSERT INTO problems (id, title, description, difficulty, category_id, slug, numeric_id, is_active, solution_sql, expected_output)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                problem.id, problem.title, problem.description, problem.difficulty,
                problem.category_id, problem.slug, problem.numeric_id, true,
                problem.solution_sql, problem.expected_output
            ]);
        }
        
        // Insert all schemas
        for (const schema of schemas) {
            await pool.query(`
                INSERT INTO problem_schemas (problem_id, schema_name, setup_sql, sample_data, expected_output, solution_sql)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                schema.problem_id, schema.schema_name, schema.setup_sql,
                schema.sample_data, schema.expected_output, schema.solution_sql
            ]);
        }
        
        // Reset sequence
        await pool.query('SELECT setval(\'problems_id_seq\', (SELECT MAX(id) FROM problems))');
        await pool.query('SELECT setval(\'categories_id_seq\', (SELECT MAX(id) FROM categories))');
        
        // Verify
        const problemCount = await pool.query('SELECT COUNT(*) FROM problems');
        const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
        const schemaCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        console.log('✅ EMERGENCY RESTORE COMPLETE');
        console.log(`   - Categories: ${categoryCount.rows[0].count}`);
        console.log(`   - Problems: ${problemCount.rows[0].count}`);
        console.log(`   - Schemas: ${schemaCount.rows[0].count}`);
        
        res.json({
            success: true,
            message: 'Emergency restoration completed successfully',
            stats: {
                categories: parseInt(categoryCount.rows[0].count),
                problems: parseInt(problemCount.rows[0].count),
                schemas: parseInt(schemaCount.rows[0].count)
            }
        });
        
    } catch (error) {
        console.error('💥 Emergency restore failed:', error);
        res.status(500).json({
            success: false,
            error: 'Emergency restoration failed',
            details: error.message
        });
    }
});

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
            'Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns. Analyze customer subscription and purchase data to find customers who have spent the most money overall. Join customer and order tables, only include completed orders, calculate total spending per customer, and order by highest spending first.',
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

// Get single problem by ID or numeric_id (for frontend compatibility)
router.get('/:id(\\d+)', async (req, res) => {
    try {
        const idValue = parseInt(req.params.id);
        console.log('DEBUG: Looking for problem with ID or numeric_id:', idValue);
        
        // Try both ID and numeric_id to handle different frontend calling patterns
        const result = await pool.query(`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE (p.id = $1 OR p.numeric_id = $1) AND (p.is_active = true OR p.is_active IS NULL)
            LIMIT 1
        `, [idValue]);
        
        console.log('DEBUG: Query result rows length:', result.rows.length);
        if (result.rows.length > 0) {
            console.log('DEBUG: Found problem:', result.rows[0].id, result.rows[0].numeric_id, result.rows[0].title);
        }
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const problem = result.rows[0];
        
        // Get schema info for the problem
        const schemaResult = await pool.query(`
            SELECT * FROM problem_schemas 
            WHERE problem_id = $1
        `, [problem.id]);
        
        if (schemaResult.rows.length > 0) {
            problem.schema = schemaResult.rows[0];
        }
        
        res.json(problem);
    } catch (error) {
        console.error('Error fetching problem by ID:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
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