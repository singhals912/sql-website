const { Pool } = require('pg');
require('dotenv').config();

// Railway database connection
const railwayPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false
    } : false
});

// Local database connection for source data
const localPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sql_practice',
    password: 'password',
    port: 5432,
});

async function restoreRailwayDatabase() {
    try {
        console.log('🚀 Starting Railway database restoration...');
        
        // Step 1: Create tables in Railway if they don't exist
        console.log('📋 Creating tables...');
        await railwayPool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        await railwayPool.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                difficulty VARCHAR(20) DEFAULT 'Easy',
                category_id INTEGER REFERENCES categories(id),
                slug VARCHAR(255) UNIQUE,
                numeric_id INTEGER UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                solution_sql TEXT,
                expected_output JSONB
            );
        `);
        
        await railwayPool.query(`
            CREATE TABLE IF NOT EXISTS problem_schemas (
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
        
        console.log('✅ Tables created successfully');
        
        // Step 2: Clear existing data
        console.log('🧹 Clearing existing data...');
        await railwayPool.query('TRUNCATE problem_schemas, problems, categories RESTART IDENTITY CASCADE');
        
        // Step 3: Copy categories from local database
        console.log('📂 Copying categories...');
        const categories = await localPool.query('SELECT * FROM categories ORDER BY id');
        for (const category of categories.rows) {
            await railwayPool.query(
                'INSERT INTO categories (name, slug, description, created_at) VALUES ($1, $2, $3, $4)',
                [category.name, category.slug, category.description, category.created_at]
            );
        }
        console.log(`✅ Copied ${categories.rows.length} categories`);
        
        // Step 4: Copy problems from local database
        console.log('📝 Copying problems...');
        const problems = await localPool.query('SELECT * FROM problems ORDER BY id');
        for (const problem of problems.rows) {
            await railwayPool.query(`
                INSERT INTO problems (title, description, difficulty, category_id, slug, numeric_id, created_at, solution_sql, expected_output)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                problem.title,
                problem.description,
                problem.difficulty,
                problem.category_id,
                problem.slug,
                problem.numeric_id,
                problem.created_at,
                problem.solution_sql,
                problem.expected_output
            ]);
        }
        console.log(`✅ Copied ${problems.rows.length} problems`);
        
        // Step 5: Copy problem schemas from local database
        console.log('🗂️  Copying problem schemas...');
        const schemas = await localPool.query('SELECT * FROM problem_schemas ORDER BY id');
        for (const schema of schemas.rows) {
            await railwayPool.query(`
                INSERT INTO problem_schemas (problem_id, schema_name, setup_sql, teardown_sql, sample_data, expected_output, solution_sql, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                schema.problem_id,
                schema.schema_name,
                schema.setup_sql,
                schema.teardown_sql,
                schema.sample_data,
                schema.expected_output,
                schema.solution_sql,
                schema.created_at
            ]);
        }
        console.log(`✅ Copied ${schemas.rows.length} problem schemas`);
        
        // Step 6: Verify restoration
        console.log('🔍 Verifying restoration...');
        const railwayCategories = await railwayPool.query('SELECT COUNT(*) FROM categories');
        const railwayProblems = await railwayPool.query('SELECT COUNT(*) FROM problems');
        const railwaySchemas = await railwayPool.query('SELECT COUNT(*) FROM problem_schemas');
        
        console.log(`📊 Railway database now has:`);
        console.log(`   - ${railwayCategories.rows[0].count} categories`);
        console.log(`   - ${railwayProblems.rows[0].count} problems`);
        console.log(`   - ${railwaySchemas.rows[0].count} problem schemas`);
        
        // Step 7: Test problem with expected output
        const testProblem = await railwayPool.query(`
            SELECT p.id, p.title, p.expected_output, ps.expected_output as schema_expected_output
            FROM problems p 
            LEFT JOIN problem_schemas ps ON p.id = ps.problem_id 
            WHERE p.expected_output IS NOT NULL OR ps.expected_output IS NOT NULL
            LIMIT 1
        `);
        
        if (testProblem.rows.length > 0) {
            console.log(`✅ Test problem found with expected output: "${testProblem.rows[0].title}"`);
        } else {
            console.log('⚠️  No problems found with expected output - validation may not work');
        }
        
        console.log('🎉 Railway database restoration completed successfully!');
        
    } catch (error) {
        console.error('💥 Railway database restoration failed:', error);
        throw error;
    } finally {
        await railwayPool.end();
        await localPool.end();
    }
}

// Run the restoration
restoreRailwayDatabase().catch(console.error);