const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// POST /api/migrate-direct/all - Direct migration of all problems
router.post('/all', async (req, res) => {
    try {
        console.log('🚀 Starting direct migration of all problems...');
        
        // Read the exported data
        const exportFile = path.join(__dirname, '../problems-export-2025-08-24.json');
        if (!fs.existsSync(exportFile)) {
            throw new Error('Export file not found. Please export problems first.');
        }
        
        const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        console.log(`📁 Found ${exportData.totalProblems} problems and ${exportData.totalCategories} categories`);
        
        // Clear existing data
        await pool.query('DELETE FROM problems');
        await pool.query('DELETE FROM categories');
        console.log('🗑️ Cleared existing data');
        
        // Insert categories
        let categoriesInserted = 0;
        for (const category of exportData.categories) {
            try {
                await pool.query(
                    'INSERT INTO categories (id, name, slug, description, created_at) VALUES ($1, $2, $3, $4, $5)',
                    [category.id, category.name, category.slug, category.description || '', category.created_at || new Date()]
                );
                categoriesInserted++;
            } catch (err) {
                console.log(`Category ${category.name} error:`, err.message);
            }
        }
        console.log(`✅ Inserted ${categoriesInserted} categories`);
        
        // Clear and recreate problem_schemas table
        try {
            await pool.query('DROP TABLE IF EXISTS problem_schemas CASCADE');
            await pool.query(`
                CREATE TABLE problem_schemas (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
                    sql_dialect VARCHAR(20) NOT NULL DEFAULT 'postgresql',
                    setup_sql TEXT,
                    expected_output JSONB,
                    solution_sql TEXT,
                    explanation TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Created problem_schemas table');
        } catch (err) {
            console.log('Schema table creation error:', err.message);
        }
        
        // Insert problems
        let problemsInserted = 0;
        let errors = 0;
        
        for (const problem of exportData.problems) {
            try {
                await pool.query(`
                    INSERT INTO problems (
                        id, title, slug, description, difficulty, 
                        category_id, is_premium, is_active, numeric_id,
                        tags, hints, created_at, total_submissions, 
                        total_accepted, acceptance_rate
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [
                    problem.id,
                    problem.title,
                    problem.slug, 
                    problem.description || 'Problem description will be available soon.',
                    problem.difficulty,
                    problem.category_id,
                    problem.is_premium || false,
                    problem.is_active !== false,
                    problem.numeric_id,
                    problem.tags ? JSON.stringify(problem.tags) : null,
                    problem.hints ? JSON.stringify(problem.hints) : null,
                    problem.created_at || new Date(),
                    problem.total_submissions || 0,
                    problem.total_accepted || 0,
                    problem.acceptance_rate || '0.00'
                ]);
                problemsInserted++;
                
                if (problemsInserted % 10 === 0) {
                    console.log(`📝 Processed ${problemsInserted} problems...`);
                }
            } catch (err) {
                console.log(`Problem ${problem.title} error:`, err.message);
                errors++;
            }
        }
        
        console.log(`✅ Problems migration completed! Inserted ${problemsInserted} problems, ${errors} errors`);
        
        // Insert problem schemas (database schemas, sample data, expected output)
        let schemasInserted = 0;
        let schemaErrors = 0;
        
        if (exportData.problem_schemas && exportData.problem_schemas.length > 0) {
            console.log(`📝 Starting schema migration for ${exportData.problem_schemas.length} schemas...`);
            
            for (const schema of exportData.problem_schemas) {
                try {
                    await pool.query(`
                        INSERT INTO problem_schemas (
                            problem_id, sql_dialect, setup_sql, expected_output,
                            solution_sql, explanation, created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        schema.problem_id,
                        schema.sql_dialect || 'postgresql',
                        schema.setup_sql,
                        schema.expected_output,
                        schema.solution_sql,
                        schema.explanation,
                        schema.created_at || new Date()
                    ]);
                    schemasInserted++;
                    
                    if (schemasInserted % 20 === 0) {
                        console.log(`📋 Processed ${schemasInserted} schemas...`);
                    }
                } catch (err) {
                    console.log(`Schema for ${schema.problem_title} error:`, err.message);
                    schemaErrors++;
                }
            }
            
            console.log(`✅ Schemas migration completed! Inserted ${schemasInserted} schemas, ${schemaErrors} errors`);
        }
        
        // Final counts
        const problemCount = await pool.query('SELECT COUNT(*) FROM problems');
        const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
        const schemaCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        res.json({
            success: true,
            message: 'Direct migration completed with full schemas',
            counts: {
                categories: parseInt(categoryCount.rows[0].count),
                problems: parseInt(problemCount.rows[0].count),
                schemas: parseInt(schemaCount.rows[0].count)
            },
            inserted: {
                problems: problemsInserted,
                schemas: schemasInserted
            },
            errors: {
                problems: errors,
                schemas: schemaErrors
            }
        });
        
    } catch (error) {
        console.error('❌ Direct migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;