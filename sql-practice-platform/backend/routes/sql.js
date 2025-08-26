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
                await pool.query(`
                    INSERT INTO problem_schemas (
                        problem_id, schema_name, setup_sql, teardown_sql, 
                        sample_data, expected_output, solution_sql, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    mappedProblemId, schema.schema_name || 'default',
                    schema.setup_sql || '', schema.teardown_sql || '',
                    schema.sample_data || '', '[]', // Simple empty array
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

module.exports = router;