const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Railway database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function importToRailway() {
    try {
        console.log('🚀 Starting direct Railway import...');
        
        // Read the export file
        const exportFile = path.join(__dirname, 'problems-export-2025-08-25.json');
        if (!fs.existsSync(exportFile)) {
            throw new Error('Export file not found: problems-export-2025-08-25.json');
        }
        
        const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        console.log(`📁 Found export with ${exportData.totalProblems} problems and ${exportData.totalCategories} categories`);
        
        // Test connection
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful:', result.rows[0].now);
        
        // Clear existing data
        await pool.query('TRUNCATE problem_schemas, problems, categories RESTART IDENTITY CASCADE');
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
        
        // Insert problems
        let problemsInserted = 0;
        for (const problem of exportData.problems) {
            try {
                await pool.query(`
                    INSERT INTO problems (
                        id, title, slug, description, difficulty, 
                        category_id, is_premium, is_active, numeric_id,
                        tags, hints, created_at, total_submissions, 
                        total_accepted, acceptance_rate, solution_sql, expected_output
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
                    JSON.stringify(problem.tags || []),
                    JSON.stringify(problem.hints || []),
                    problem.created_at || new Date(),
                    problem.total_submissions || 0,
                    problem.total_accepted || 0,
                    problem.acceptance_rate || '0.00',
                    problem.solution_sql || '',
                    problem.expected_output || '[]'
                ]);
                problemsInserted++;
                
                if (problemsInserted % 10 === 0) {
                    console.log(`📝 Processed ${problemsInserted} problems...`);
                }
            } catch (err) {
                console.log(`Problem ${problem.title} error:`, err.message);
            }
        }
        console.log(`✅ Inserted ${problemsInserted} problems`);
        
        // Insert problem schemas
        let schemasInserted = 0;
        for (const schema of exportData.schemas) {
            try {
                await pool.query(`
                    INSERT INTO problem_schemas (
                        problem_id, schema_name, setup_sql, teardown_sql, 
                        sample_data, expected_output, solution_sql, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                    schema.problem_id,
                    schema.schema_name || 'default',
                    schema.setup_sql || '',
                    schema.teardown_sql || '',
                    schema.sample_data || '',
                    schema.expected_output || '[]',
                    schema.solution_sql || '',
                    schema.created_at || new Date()
                ]);
                schemasInserted++;
                
                if (schemasInserted % 20 === 0) {
                    console.log(`🗂️  Processed ${schemasInserted} schemas...`);
                }
            } catch (err) {
                console.log(`Schema for problem ${schema.problem_id} error:`, err.message);
            }
        }
        console.log(`✅ Inserted ${schemasInserted} schemas`);
        
        // Reset sequences
        await pool.query('SELECT setval(\'problems_id_seq\', (SELECT MAX(id) FROM problems))');
        await pool.query('SELECT setval(\'categories_id_seq\', (SELECT MAX(id) FROM categories))');
        
        // Final verification
        const finalProblems = await pool.query('SELECT COUNT(*) FROM problems');
        const finalCategories = await pool.query('SELECT COUNT(*) FROM categories');
        const finalSchemas = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        console.log('🎉 Direct Railway import completed successfully!');
        console.log(`   - Categories: ${finalCategories.rows[0].count}`);
        console.log(`   - Problems: ${finalProblems.rows[0].count}`);
        console.log(`   - Schemas: ${finalSchemas.rows[0].count}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Direct import failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the import
importToRailway();