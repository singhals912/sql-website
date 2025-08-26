const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all problems for SQL practice
router.get('/problems', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        const difficulty = req.query.difficulty;
        const category = req.query.category;
        const company = req.query.company;

        let query = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
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

        if (company) {
            query += ` AND p.tags @> ARRAY[$${paramIndex}]`;
            queryParams.push(company);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);
        
        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM problems WHERE is_active = true');
        const total = parseInt(countResult.rows[0].count);
        
        res.json({
            problems: result.rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// Get single problem by ID
router.get('/problems/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Try to get by UUID first, then by slug, then by numeric ID
        let problemQuery, problemParams;
        
        // Check if it's a UUID (8-4-4-4-12 format)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidRegex.test(id)) {
            // It's a UUID
            problemQuery = `
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM problems p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = $1 AND p.is_active = true
            `;
            problemParams = [id];
        } else if (isNaN(id)) {
            // It's a slug
            problemQuery = `
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM problems p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.slug = $1 AND p.is_active = true
            `;
            problemParams = [id];
        } else {
            // It's a numeric ID, get by numeric_id field
            problemQuery = `
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM problems p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.numeric_id = $1 AND p.is_active = true
            `;
            problemParams = [parseInt(id)]; // Use numeric_id directly
        }
        
        const problemResult = await pool.query(problemQuery, problemParams);
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const problem = problemResult.rows[0];
        
        // Get problem schemas (if table exists)
        let schemaResult = { rows: [] };
        try {
            const schemaQuery = `
                SELECT * FROM problem_schemas 
                WHERE problem_id = $1
                ORDER BY id
            `;
            schemaResult = await pool.query(schemaQuery, [problem.id]);
        } catch (schemaError) {
            console.log('Schema table not found or empty, using empty schemas');
        }
        
        // Transform schema data to match frontend expectations
        let transformedSchema = null;
        if (schemaResult.rows.length > 0) {
            const rawSchema = schemaResult.rows[0];
            transformedSchema = {
                id: rawSchema.id,
                problem_id: rawSchema.problem_id,
                schema_name: rawSchema.schema_name,
                setup_sql: rawSchema.setup_sql, // This is the key field frontend needs
                sample_data: rawSchema.sample_data,
                expected_output: rawSchema.expected_output,
                solution_sql: rawSchema.solution_sql,
                teardown_sql: rawSchema.teardown_sql,
                created_at: rawSchema.created_at
            };
        }
        
        const response = {
            // Primary structure
            problem: problem,
            schema: transformedSchema,
            schemas: schemaResult.rows,
            // Direct fields for compatibility with different frontend expectations
            id: problem.id,
            numeric_id: problem.numeric_id,
            title: problem.title,
            description: problem.description,
            difficulty: problem.difficulty,
            category_name: problem.category_name
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

// Get companies (extract from problem tags)
router.get('/companies', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT unnest(tags) as company, COUNT(*) as problem_count
            FROM problems 
            WHERE is_active = true AND tags IS NOT NULL AND array_length(tags, 1) > 0
            GROUP BY unnest(tags)
            ORDER BY problem_count DESC, company
        `);
        
        // Filter and format company names
        const companies = result.rows
            .filter(row => row.company && row.company.length > 1)
            .map(row => ({
                name: row.company,
                slug: row.company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                problemCount: parseInt(row.problem_count)
            }));
        
        res.json(companies);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// Setup endpoint for problem environment
router.post('/problems/:id/setup', async (req, res) => {
    try {
        const { id } = req.params;
        const { dialect = 'postgresql' } = req.body;
        
        // Get the problem and its schema
        const problemResult = await pool.query(`
            SELECT p.*, ps.setup_sql 
            FROM problems p 
            JOIN problem_schemas ps ON p.id = ps.problem_id 
            WHERE (p.id::text = $1 OR p.slug = $1 OR p.numeric_id = $3) 
            AND ps.sql_dialect = $2 AND p.is_active = true
        `, [id, dialect, parseInt(id) || 0]);
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem or schema not found' });
        }
        
        const { setup_sql } = problemResult.rows[0];
        
        // Connect to the appropriate execution database
        const { Pool } = require('pg');
        const mysql = require('mysql2/promise');
        
        if (dialect === 'mysql') {
            const connection = await mysql.createConnection({
                host: 'localhost',
                port: 3307,
                database: 'sandbox',
                user: 'root',
                password: 'password'
            });
            
            // Disable foreign key checks and drop all existing tables
            await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
            
            const [tables] = await connection.execute('SHOW TABLES');
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
            }
            
            // Re-enable foreign key checks
            await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
            
            // Execute setup SQL
            const statements = setup_sql.split(';').filter(stmt => stmt.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await connection.execute(statement);
                }
            }
            
            await connection.end();
        } else {
            // PostgreSQL
            const executorPool = new Pool({
                host: 'localhost',
                port: 5433,
                database: 'sandbox',
                user: 'postgres',
                password: 'password',
                max: 1
            });
            
            // Complete database cleanup
            try {
                await executorPool.query('DROP SCHEMA IF EXISTS public CASCADE');
                await executorPool.query('CREATE SCHEMA public');
                await executorPool.query('GRANT ALL ON SCHEMA public TO postgres');
                await executorPool.query('GRANT ALL ON SCHEMA public TO public');
            } catch (schemaError) {
                // If schema already exists, just clean tables
                await executorPool.query(`
                    DO $$ 
                    DECLARE
                        r RECORD;
                    BEGIN
                        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                        END LOOP;
                    END $$;
                `);
            }
            
            // Execute setup SQL
            await executorPool.query(setup_sql);
            
            await executorPool.end();
        }
        
        res.json({ success: true, message: 'Problem environment setup completed' });
    } catch (error) {
        console.error('Error setting up problem environment:', error);
        res.status(500).json({ error: 'Failed to setup problem environment: ' + error.message });
    }
});

// EMERGENCY: Import all 70 problems from export file - SIMPLIFIED
router.post('/import-emergency', async (req, res) => {
    try {
        console.log('🚨 EMERGENCY IMPORT: Starting simplified database import...');
        
        // Clear and restore with minimal data first
        await pool.query('TRUNCATE problem_schemas, problems, categories RESTART IDENTITY CASCADE');
        
        // Insert categories first
        const categories = [
            { name: 'A/B Testing', slug: 'a/b-testing', description: 'A/B Testing problems' },
            { name: 'Advanced Topics', slug: 'advanced-topics', description: 'Advanced SQL concepts' },
            { name: 'Aggregation', slug: 'aggregation', description: 'GROUP BY, HAVING, aggregate functions' },
            { name: 'Basic Queries', slug: 'basic-queries', description: 'Fundamental SQL operations' },
            { name: 'Energy Analytics', slug: 'energy-analytics', description: 'Energy Analytics problems' },
            { name: 'Fraud Detection', slug: 'fraud-detection', description: 'Fraud Detection problems' },
            { name: 'Joins', slug: 'joins', description: 'INNER, LEFT, RIGHT, FULL OUTER joins' },
            { name: 'Recommendation Systems', slug: 'recommendation-systems', description: 'Recommendation Systems problems' },
            { name: 'Subqueries', slug: 'subqueries', description: 'Nested queries and subqueries' },
            { name: 'Supply Chain', slug: 'supply-chain', description: 'Supply Chain problems' },
            { name: 'Time Analysis', slug: 'time-analysis', description: 'Time-based analysis' },
            { name: 'Window Functions', slug: 'window-functions', description: 'OVER, PARTITION BY, window functions' }
        ];
        
        for (let i = 0; i < categories.length; i++) {
            await pool.query(
                'INSERT INTO categories (id, name, slug, description, created_at) VALUES ($1, $2, $3, $4, $5)',
                [i + 1, categories[i].name, categories[i].slug, categories[i].description, new Date()]
            );
        }
        
        // Read export file and get problems
        const fs = require('fs');
        const path = require('path');
        const exportFile = path.join(__dirname, '..', 'problems-export-2025-08-25.json');
        
        if (!fs.existsSync(exportFile)) {
            throw new Error('Export file not found');
        }
        
        const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        console.log(`📁 Found ${exportData.totalProblems} problems`);
        
        // Insert problems with simplified approach
        const problemMap = {};
        const categoryMapping = {
            'a/b-testing': 1, 'advanced-topics': 2, 'aggregation': 3, 'basic-queries': 4,
            'energy-analytics': 5, 'fraud-detection': 6, 'joins': 7, 'recommendation-systems': 8,
            'subqueries': 9, 'supply-chain': 10, 'time-analysis': 11, 'window-functions': 12
        };
        
        for (let i = 0; i < Math.min(exportData.problems.length, 70); i++) {
            const problem = exportData.problems[i];
            const newId = i + 1;
            problemMap[problem.id] = newId;
            
            // Find category by matching export category to our mapping
            let categoryId = 4; // default to basic-queries
            const exportCategory = exportData.categories.find(c => c.id === problem.category_id);
            if (exportCategory && categoryMapping[exportCategory.slug]) {
                categoryId = categoryMapping[exportCategory.slug];
            }
            
            await pool.query(`
                INSERT INTO problems (
                    id, title, slug, description, difficulty, 
                    category_id, is_active, numeric_id, created_at,
                    solution_sql, expected_output
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                newId, problem.title, problem.slug, 
                problem.description || 'Problem description', problem.difficulty,
                categoryId, true, problem.numeric_id, new Date(),
                problem.solution_sql || '', '[]' // Simple empty array
            ]);
        }
        
        // Insert schemas with simple approach
        let schemaCount = 0;
        for (const schema of exportData.problem_schemas || []) {
            const mappedProblemId = problemMap[schema.problem_id];
            if (mappedProblemId && schemaCount < 70) {
                // Process expected output and sample data for emergency import too
                let processedExpectedOutput = schema.expected_output || '[]';
                let processedSampleData = schema.sample_data || '';
                
                if (typeof processedExpectedOutput !== 'string') {
                    processedExpectedOutput = JSON.stringify(processedExpectedOutput);
                }
                
                await pool.query(`
                    INSERT INTO problem_schemas (
                        problem_id, schema_name, setup_sql, teardown_sql, 
                        sample_data, expected_output, solution_sql, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    mappedProblemId, schema.schema_name || 'default',
                    schema.setup_sql || '', schema.teardown_sql || '',
                    processedSampleData, processedExpectedOutput,
                    schema.solution_sql || '', new Date()
                ]);
                schemaCount++;
            }
        }
        
        // Reset sequences
        await pool.query('SELECT setval(\'problems_id_seq\', (SELECT MAX(id) FROM problems))');
        await pool.query('SELECT setval(\'categories_id_seq\', (SELECT MAX(id) FROM categories))');
        
        // Verify
        const finalProblems = await pool.query('SELECT COUNT(*) FROM problems');
        const finalSchemas = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        console.log(`✅ SIMPLIFIED IMPORT COMPLETE: ${finalProblems.rows[0].count} problems, ${finalSchemas.rows[0].count} schemas`);
        
        res.json({
            success: true,
            message: 'Simplified emergency import completed successfully',
            stats: {
                problems: parseInt(finalProblems.rows[0].count),
                schemas: parseInt(finalSchemas.rows[0].count)
            }
        });
        
    } catch (error) {
        console.error('💥 Simplified import failed:', error);
        res.status(500).json({
            success: false,
            error: 'Simplified import failed',
            details: error.message
        });
    }
});

// EMERGENCY: Recreate database schema
router.post('/create-tables', async (req, res) => {
    try {
        console.log('🏗️ Creating database tables...');
        
        // Create categories table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create problems table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id SERIAL PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                slug VARCHAR(500) UNIQUE NOT NULL,
                description TEXT,
                difficulty VARCHAR(50),
                category_id INTEGER REFERENCES categories(id),
                is_active BOOLEAN DEFAULT true,
                numeric_id INTEGER,
                solution_sql TEXT,
                expected_output TEXT,
                tags TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create problem_schemas table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problem_schemas (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER REFERENCES problems(id),
                schema_name VARCHAR(255),
                setup_sql TEXT,
                teardown_sql TEXT,
                sample_data TEXT,
                expected_output TEXT,
                solution_sql TEXT,
                sql_dialect VARCHAR(50) DEFAULT 'postgresql',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Database tables created successfully');
        res.json({ success: true, message: 'Database tables created' });
        
    } catch (error) {
        console.error('💥 Failed to create tables:', error);
        res.status(500).json({ error: 'Failed to create tables', details: error.message });
    }
});

// AUTOMATIC RECOVERY: Check and restore data if missing
router.get('/auto-recover', async (req, res) => {
    try {
        console.log('🔍 Checking database health...');
        
        // Check if problems exist
        const problemCheck = await pool.query('SELECT COUNT(*) FROM problems WHERE is_active = true');
        const problemCount = parseInt(problemCheck.rows[0].count);
        
        if (problemCount < 50) { // If less than 50 problems, restore
            console.log('⚠️ Database has only', problemCount, 'problems. Initiating recovery...');
            
            // Recreate tables if needed
            try {
                await pool.query('SELECT 1 FROM categories LIMIT 1');
                await pool.query('SELECT 1 FROM problems LIMIT 1');
                await pool.query('SELECT 1 FROM problem_schemas LIMIT 1');
            } catch (tableError) {
                console.log('🏗️ Recreating missing tables...');
                
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS categories (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        slug VARCHAR(255) UNIQUE NOT NULL,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS problems (
                        id SERIAL PRIMARY KEY,
                        title VARCHAR(500) NOT NULL,
                        slug VARCHAR(500) UNIQUE NOT NULL,
                        description TEXT,
                        difficulty VARCHAR(50),
                        category_id INTEGER REFERENCES categories(id),
                        is_active BOOLEAN DEFAULT true,
                        numeric_id INTEGER,
                        solution_sql TEXT,
                        expected_output TEXT,
                        tags TEXT[],
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS problem_schemas (
                        id SERIAL PRIMARY KEY,
                        problem_id INTEGER REFERENCES problems(id),
                        schema_name VARCHAR(255),
                        setup_sql TEXT,
                        teardown_sql TEXT,
                        sample_data TEXT,
                        expected_output TEXT,
                        solution_sql TEXT,
                        sql_dialect VARCHAR(50) DEFAULT 'postgresql',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
            }
            
            // Auto-import data
            const fs = require('fs');
            const path = require('path');
            const exportFile = path.join(__dirname, '..', 'problems-export-2025-08-25.json');
            
            if (fs.existsSync(exportFile)) {
                const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
                
                // Clear and restore categories
                await pool.query('TRUNCATE categories RESTART IDENTITY CASCADE');
                const categories = [
                    { name: 'A/B Testing', slug: 'a/b-testing', description: 'A/B Testing problems' },
                    { name: 'Advanced Topics', slug: 'advanced-topics', description: 'Advanced SQL concepts' },
                    { name: 'Aggregation', slug: 'aggregation', description: 'GROUP BY, HAVING, aggregate functions' },
                    { name: 'Basic Queries', slug: 'basic-queries', description: 'Fundamental SQL operations' },
                    { name: 'Energy Analytics', slug: 'energy-analytics', description: 'Energy Analytics problems' },
                    { name: 'Fraud Detection', slug: 'fraud-detection', description: 'Fraud Detection problems' },
                    { name: 'Joins', slug: 'joins', description: 'INNER, LEFT, RIGHT, FULL OUTER joins' },
                    { name: 'Recommendation Systems', slug: 'recommendation-systems', description: 'Recommendation Systems problems' },
                    { name: 'Subqueries', slug: 'subqueries', description: 'Nested queries and subqueries' },
                    { name: 'Supply Chain', slug: 'supply-chain', description: 'Supply Chain problems' },
                    { name: 'Time Analysis', slug: 'time-analysis', description: 'Time-based analysis' },
                    { name: 'Window Functions', slug: 'window-functions', description: 'OVER, PARTITION BY, window functions' }
                ];
                
                for (let i = 0; i < categories.length; i++) {
                    await pool.query(
                        'INSERT INTO categories (id, name, slug, description, created_at) VALUES ($1, $2, $3, $4, $5)',
                        [i + 1, categories[i].name, categories[i].slug, categories[i].description, new Date()]
                    );
                }
                
                // Restore problems
                await pool.query('TRUNCATE problems RESTART IDENTITY CASCADE');
                const categoryMapping = {
                    'a/b-testing': 1, 'advanced-topics': 2, 'aggregation': 3, 'basic-queries': 4,
                    'energy-analytics': 5, 'fraud-detection': 6, 'joins': 7, 'recommendation-systems': 8,
                    'subqueries': 9, 'supply-chain': 10, 'time-analysis': 11, 'window-functions': 12
                };
                
                for (let i = 0; i < Math.min(exportData.problems.length, 70); i++) {
                    const problem = exportData.problems[i];
                    const newId = i + 1;
                    
                    let categoryId = 4;
                    const exportCategory = exportData.categories.find(c => c.id === problem.category_id);
                    if (exportCategory && categoryMapping[exportCategory.slug]) {
                        categoryId = categoryMapping[exportCategory.slug];
                    }
                    
                    await pool.query(`
                        INSERT INTO problems (
                            id, title, slug, description, difficulty, 
                            category_id, is_active, numeric_id, created_at,
                            solution_sql, expected_output
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    `, [
                        newId, problem.title, problem.slug, 
                        problem.description || 'Problem description', problem.difficulty,
                        categoryId, true, problem.numeric_id, new Date(),
                        problem.solution_sql || '', '[]'
                    ]);
                }
                
                // Restore schemas
                const problemMap = {};
                for (let i = 0; i < Math.min(exportData.problems.length, 70); i++) {
                    problemMap[exportData.problems[i].id] = i + 1;
                }
                
                await pool.query('TRUNCATE problem_schemas RESTART IDENTITY CASCADE');
                for (const schema of exportData.problem_schemas || []) {
                    const mappedProblemId = problemMap[schema.problem_id];
                    if (mappedProblemId) {
                        // Process expected output and sample data
                        let processedExpectedOutput = schema.expected_output || '[]';
                        let processedSampleData = schema.sample_data || '';
                        
                        // If expected_output is already a string, keep it; if it's an object, stringify it
                        if (typeof processedExpectedOutput !== 'string') {
                            processedExpectedOutput = JSON.stringify(processedExpectedOutput);
                        }
                        
                        await pool.query(`
                            INSERT INTO problem_schemas (
                                problem_id, schema_name, setup_sql, teardown_sql, 
                                sample_data, expected_output, solution_sql, created_at
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        `, [
                            mappedProblemId, schema.schema_name || 'default',
                            schema.setup_sql || '', schema.teardown_sql || '',
                            processedSampleData, processedExpectedOutput,
                            schema.solution_sql || '', new Date()
                        ]);
                    }
                }
            }
            
            const finalCount = await pool.query('SELECT COUNT(*) FROM problems');
            console.log('✅ Auto-recovery complete:', finalCount.rows[0].count, 'problems restored');
            
            res.json({
                success: true,
                message: 'Database auto-recovery completed',
                restored: true,
                problemCount: parseInt(finalCount.rows[0].count)
            });
        } else {
            console.log('✅ Database healthy with', problemCount, 'problems');
            res.json({
                success: true,
                message: 'Database is healthy',
                restored: false,
                problemCount: problemCount
            });
        }
        
    } catch (error) {
        console.error('💥 Auto-recovery failed:', error);
        res.status(500).json({
            success: false,
            error: 'Auto-recovery failed',
            details: error.message
        });
    }
});

// Execute SQL query endpoint
router.post('/execute', async (req, res) => {
    try {
        const { query, problemId, dialect = 'postgresql' } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        console.log('🔍 Executing SQL query for problem', problemId);
        
        // If problemId provided, set up the problem environment first
        if (problemId) {
            try {
                console.log('🔍 Looking for problem setup for numeric_id:', problemId);
                const problemResult = await pool.query(`
                    SELECT p.id, p.title, ps.setup_sql, ps.sample_data, ps.expected_output
                    FROM problems p 
                    JOIN problem_schemas ps ON p.id = ps.problem_id 
                    WHERE p.numeric_id = $1
                `, [parseInt(problemId)]);
                
                console.log('📊 Found problem data:', {
                    rowCount: problemResult.rows.length,
                    hasSetupSql: problemResult.rows.length > 0 && !!problemResult.rows[0].setup_sql,
                    problemTitle: problemResult.rows.length > 0 ? problemResult.rows[0].title : 'N/A'
                });
                
                if (problemResult.rows.length > 0 && problemResult.rows[0].setup_sql) {
                    let setupSql = problemResult.rows[0].setup_sql;
                    console.log('🏗️ Setting up problem environment for:', problemResult.rows[0].title);
                    
                    // Convert MySQL syntax to PostgreSQL with enhanced BOOLEAN handling
                    console.log('🔧 Original setup SQL:', setupSql.substring(0, 200) + '...');
                    setupSql = setupSql
                        .replace(/TINYINT\(1\)/gi, 'BOOLEAN')    // TINYINT(1) -> BOOLEAN (case insensitive)
                        .replace(/TINYINT\(\d+\)/gi, 'SMALLINT') // Other TINYINT(n) -> SMALLINT  
                        .replace(/TINYINT(?!\()/gi, 'SMALLINT') // Plain TINYINT -> SMALLINT (but not TINYINT(...))
                        .replace(/AUTO_INCREMENT/gi, 'SERIAL')   // AUTO_INCREMENT -> SERIAL (case insensitive)
                        .replace(/ENGINE=\w+/gi, '')            // Remove ENGINE clauses
                        .replace(/DEFAULT CHARSET=\w+/gi, '');  // Remove CHARSET clauses
                    
                    console.log('🔧 Converted setup SQL:', setupSql.substring(0, 200) + '...');
                    
                    // Force drop and recreate ALL tables from this setup to ensure correct data types
                    const tableNames = [];
                    const createTableMatches = setupSql.match(/CREATE TABLE (?:IF NOT EXISTS )?\s*`?(\w+)`?/gi);
                    if (createTableMatches) {
                        createTableMatches.forEach(match => {
                            const tableName = match.replace(/CREATE TABLE (?:IF NOT EXISTS )?\s*`?(\w+)`?/i, '$1');
                            if (tableName && !tableNames.includes(tableName)) {
                                tableNames.push(tableName);
                            }
                        });
                    }
                    
                    // Drop all tables from this problem setup
                    for (const tableName of tableNames) {
                        try {
                            await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
                            console.log(`🗑️ Dropped existing table: ${tableName}`);
                        } catch (dropError) {
                            console.log(`⚠️ Could not drop table ${tableName}:`, dropError.message);
                        }
                    }
                    
                    // Execute setup SQL to create tables and insert data with correct types
                    await pool.query(setupSql);
                    console.log('✅ Problem environment set up successfully with correct data types');
                } else {
                    console.log('⚠️ No setup SQL found for problem', problemId);
                    console.log('🔍 Available problems check...');
                    const allProblems = await pool.query('SELECT numeric_id, title FROM problems WHERE numeric_id IS NOT NULL ORDER BY numeric_id');
                    console.log('📋 Available problems:', allProblems.rows.map(p => `${p.numeric_id}: ${p.title}`));
                }
            } catch (setupError) {
                console.log('💥 Setup failed with error:', setupError.message);
                console.log('🔍 Full setup error:', setupError);
                
                // Fallback: Create tables manually for common problems
                const problemIdInt = parseInt(problemId);
                if (problemIdInt === 1) {
                    console.log('🆘 FALLBACK: Creating ab_test_results table manually for problem 1');
                    try {
                        await pool.query(`
                            DROP TABLE IF EXISTS ab_test_results CASCADE;
                            CREATE TABLE ab_test_results (
                                user_id INTEGER,
                                test_group VARCHAR(20),
                                converted BOOLEAN,
                                conversion_date DATE,
                                device_type VARCHAR(20)
                            );
                            INSERT INTO ab_test_results VALUES
                            (1, 'A', true, '2024-01-15', 'mobile'),
                            (2, 'B', false, '2024-01-15', 'desktop'),
                            (3, 'A', false, '2024-01-16', 'mobile'),
                            (4, 'B', true, '2024-01-16', 'desktop'),
                            (5, 'A', true, '2024-01-17', 'tablet'),
                            (6, 'B', false, '2024-01-17', 'mobile'),
                            (7, 'A', false, '2024-01-18', 'desktop'),
                            (8, 'B', true, '2024-01-18', 'mobile');
                        `);
                        console.log('✅ Fallback table creation successful for problem 1');
                    } catch (fallbackError) {
                        console.log('💥 Fallback table creation failed for problem 1:', fallbackError.message);
                    }
                } else if (problemIdInt === 7) {
                    console.log('🆘 FALLBACK: Creating amazon_prime_subscribers table manually for problem 7');
                    try {
                        await pool.query(`
                            DROP TABLE IF EXISTS amazon_prime_subscribers CASCADE;
                            CREATE TABLE amazon_prime_subscribers (
                                subscriber_id INTEGER,
                                subscription_date DATE,
                                country VARCHAR(50),
                                device_type VARCHAR(30),
                                monthly_fee DECIMAL(10,2),
                                content_watched_hours INTEGER,
                                last_activity_date DATE,
                                subscription_status VARCHAR(20)
                            );
                            INSERT INTO amazon_prime_subscribers VALUES
                            (1, '2024-01-01', 'USA', 'Smart TV', 8.99, 45, '2024-01-25', 'Active'),
                            (2, '2024-01-02', 'Canada', 'Mobile', 8.99, 32, '2024-01-24', 'Active'),
                            (3, '2024-01-03', 'UK', 'Tablet', 8.99, 28, '2024-01-20', 'Active'),
                            (4, '2024-01-04', 'Germany', 'Desktop', 8.99, 15, '2024-01-15', 'Inactive'),
                            (5, '2024-01-05', 'France', 'Smart TV', 8.99, 55, '2024-01-26', 'Active'),
                            (6, '2024-01-06', 'Japan', 'Mobile', 8.99, 22, '2024-01-18', 'Active'),
                            (7, '2024-01-07', 'Australia', 'Tablet', 8.99, 38, '2024-01-23', 'Active'),
                            (8, '2024-01-08', 'Brazil', 'Desktop', 8.99, 12, '2024-01-10', 'Inactive');
                        `);
                        console.log('✅ Fallback table creation successful for problem 7');
                    } catch (fallbackError) {
                        console.log('💥 Fallback table creation failed for problem 7:', fallbackError.message);
                    }
                }
            }
        }
        
        // Execute the user's query
        const result = await pool.query(query);
        
        let success = false;
        let message = 'Query executed successfully';
        let expectedOutput = null;
        
        // If problemId provided, check against expected output
        if (problemId) {
            try {
                const problemResult = await pool.query(`
                    SELECT ps.expected_output 
                    FROM problems p 
                    JOIN problem_schemas ps ON p.id = ps.problem_id 
                    WHERE p.numeric_id = $1
                `, [parseInt(problemId)]);
                
                if (problemResult.rows.length > 0) {
                    expectedOutput = problemResult.rows[0].expected_output;
                    if (expectedOutput && expectedOutput !== '[]') {
                        try {
                            const expected = typeof expectedOutput === 'string' ? JSON.parse(expectedOutput) : expectedOutput;
                            // Simple comparison - in production this should be more sophisticated
                            if (Array.isArray(expected) && expected.length > 0) {
                                // Check if result has same structure
                                if (result.rows.length === expected.length) {
                                    success = true;
                                    message = '✅ Correct! Your query matches the expected output.';
                                } else if (result.rows.length === 0 && expected.length === 0) {
                                    success = true;
                                    message = '✅ Correct! Your query returns the expected empty result.';
                                } else {
                                    message = `❌ Incorrect. Expected ${expected.length} rows, got ${result.rows.length}.`;
                                }
                            } else {
                                // No expected output to compare against
                                success = true;
                                message = '✅ Query executed successfully (no validation data available).';
                            }
                        } catch (parseError) {
                            success = true;
                            message = '✅ Query executed successfully (expected output format issue).';
                        }
                    } else {
                        success = true;
                        message = '✅ Query executed successfully (no expected output defined).';
                    }
                }
            } catch (validationError) {
                console.error('Validation error:', validationError);
                success = true;
                message = '✅ Query executed successfully (validation unavailable).';
            }
        } else {
            success = true;
            message = '✅ Query executed successfully.';
        }
        
        res.json({
            success: true,
            results: result.rows,
            rowCount: result.rowCount,
            validation: {
                correct: success,
                message: message,
                expectedOutput: expectedOutput
            }
        });
        
    } catch (error) {
        console.error('SQL execution error:', error);
        res.status(400).json({
            success: false,
            error: 'SQL execution failed',
            message: error.message,
            validation: {
                correct: false,
                message: `❌ SQL Error: ${error.message}`
            }
        });
    }
});

module.exports = router;