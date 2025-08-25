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
        console.log('DEBUG SQL route: Found problem with ID:', problem.id, 'numeric_id:', problem.numeric_id);
        
        // Get problem schemas (if table exists)
        let schemaResult = { rows: [] };
        try {
            const schemaQuery = `
                SELECT * FROM problem_schemas 
                WHERE problem_id = $1
                ORDER BY id
            `;
            schemaResult = await pool.query(schemaQuery, [problem.id]);
            console.log('DEBUG SQL route: Schema query result rows:', schemaResult.rows.length);
            if (schemaResult.rows.length > 0) {
                console.log('DEBUG SQL route: First schema row:', schemaResult.rows[0]);
            }
        } catch (schemaError) {
            console.log('Schema table not found or empty, using empty schemas', schemaError.message);
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
        
        res.json({
            problem: problem,
            schema: transformedSchema,
            schemas: schemaResult.rows
        });
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

module.exports = router;