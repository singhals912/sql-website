const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/quick-fix/problem-schemas - Create missing schema table
router.post('/problem-schemas', async (req, res) => {
    try {
        console.log('Creating problem_schemas table...');
        
        // Create problem_schemas table if it doesn't exist
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
        
        console.log('✅ problem_schemas table created');
        
        // Add basic schemas for existing problems
        const problems = await pool.query('SELECT id, title FROM problems LIMIT 5');
        
        for (const problem of problems.rows) {
            await pool.query(`
                INSERT INTO problem_schemas (problem_id, sql_dialect, schema_sql, sample_data)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
            `, [
                problem.id,
                'postgresql',
                `-- Schema for ${problem.title}
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    manager_id INTEGER
);`,
                `-- Sample data for ${problem.title}
INSERT INTO employees VALUES 
(1, 'John Smith', 'Engineering', 75000, '2020-01-15'),
(2, 'Jane Doe', 'Marketing', 65000, '2019-06-01'),
(3, 'Bob Johnson', 'Sales', 55000, '2021-03-10');

INSERT INTO departments VALUES
(1, 'Engineering', 1),
(2, 'Marketing', 2),
(3, 'Sales', 3);`
            ]);
        }
        
        const schemaCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        res.json({
            success: true,
            message: 'Problem schemas table created and populated',
            schemas_created: parseInt(schemaCount.rows[0].count)
        });
        
    } catch (error) {
        console.error('Error creating schemas:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;