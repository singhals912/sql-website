const { Pool } = require('pg');
require('dotenv').config();

// Railway database connection
const railwayPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Local database connection
const localPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sql_practice',
    password: 'password',
    port: 5432,
});

async function emergencyRestoreAll() {
    try {
        console.log('🚨 EMERGENCY RESTORE: Fixing Railway database...');
        
        // Check current state
        const currentProblems = await railwayPool.query('SELECT COUNT(*) FROM problems');
        console.log(`❌ Current problems: ${currentProblems.rows[0].count} (should be 70+)`);
        
        // Clear and recreate everything
        console.log('🧹 Clearing Railway database...');
        await railwayPool.query('TRUNCATE problem_schemas, problems, categories RESTART IDENTITY CASCADE');
        
        // Copy categories
        console.log('📂 Copying categories...');
        const categories = await localPool.query('SELECT * FROM categories ORDER BY id');
        for (const cat of categories.rows) {
            await railwayPool.query(
                'INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)',
                [cat.name, cat.slug, cat.description]
            );
        }
        console.log(`✅ Copied ${categories.rows.length} categories`);
        
        // Copy all problems
        console.log('📝 Copying all problems...');
        const problems = await localPool.query(`
            SELECT * FROM problems 
            WHERE is_active = true OR is_active IS NULL 
            ORDER BY numeric_id ASC
        `);
        
        let problemCount = 0;
        for (const problem of problems.rows) {
            await railwayPool.query(`
                INSERT INTO problems (
                    title, description, difficulty, category_id, slug, numeric_id, 
                    is_active, solution_sql, expected_output
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                problem.title,
                problem.description,
                problem.difficulty,
                problem.category_id,
                problem.slug,
                problem.numeric_id,
                true, // ensure all are active
                problem.solution_sql,
                problem.expected_output
            ]);
            problemCount++;
        }
        console.log(`✅ Copied ${problemCount} problems`);
        
        // Copy all schemas
        console.log('🗂️ Copying problem schemas...');
        const schemas = await localPool.query('SELECT * FROM problem_schemas ORDER BY id');
        let schemaCount = 0;
        for (const schema of schemas.rows) {
            await railwayPool.query(`
                INSERT INTO problem_schemas (
                    problem_id, schema_name, setup_sql, teardown_sql, 
                    sample_data, expected_output, solution_sql
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                schema.problem_id,
                schema.schema_name,
                schema.setup_sql,
                schema.teardown_sql,
                schema.sample_data,
                schema.expected_output,
                schema.solution_sql
            ]);
            schemaCount++;
        }
        console.log(`✅ Copied ${schemaCount} schemas`);
        
        // Verify restoration
        const finalProblems = await railwayPool.query('SELECT COUNT(*) FROM problems');
        const finalCategories = await railwayPool.query('SELECT COUNT(*) FROM categories');
        const finalSchemas = await railwayPool.query('SELECT COUNT(*) FROM problem_schemas');
        
        console.log('🎉 RESTORATION COMPLETE!');
        console.log(`   - Categories: ${finalCategories.rows[0].count}`);
        console.log(`   - Problems: ${finalProblems.rows[0].count}`);
        console.log(`   - Schemas: ${finalSchemas.rows[0].count}`);
        
        // Test first few problems
        const testProblems = await railwayPool.query(`
            SELECT id, numeric_id, title FROM problems 
            ORDER BY numeric_id ASC LIMIT 5
        `);
        console.log('📋 First 5 problems:');
        testProblems.rows.forEach(p => {
            console.log(`   ${p.numeric_id}: ${p.title}`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('💥 EMERGENCY RESTORE FAILED:', error);
        process.exit(1);
    } finally {
        await railwayPool.end();
        await localPool.end();
    }
}

emergencyRestoreAll();