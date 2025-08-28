const pool = require('../config/database');
require('dotenv').config();

async function investigateDatabase() {
    try {
        console.log('🔍 Investigating database structure...\n');
        
        // Check table structure
        console.log('📊 Database tables:');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        for (const row of tablesResult.rows) {
            console.log(`   - ${row.table_name}`);
        }
        
        // Check problem_schemas table structure
        console.log('\n📊 problem_schemas table structure:');
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'problem_schemas'
            ORDER BY ordinal_position
        `);
        
        for (const row of columnsResult.rows) {
            console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        }
        
        // Sample a few problem schemas to see the actual data structure
        console.log('\n📊 Sample problem schemas (first 3):');
        const sampleResult = await pool.query(`
            SELECT ps.id, ps.problem_id, ps.sql_dialect, 
                   LENGTH(ps.setup_sql) as setup_length,
                   LENGTH(ps.solution_sql) as solution_length,
                   LEFT(ps.setup_sql, 200) as setup_preview,
                   p.title, p.slug
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            LIMIT 3
        `);
        
        for (const row of sampleResult.rows) {
            console.log(`\n🔹 Schema ID: ${row.id}`);
            console.log(`   Problem: ${row.title} (${row.slug})`);
            console.log(`   Dialect: ${row.sql_dialect}`);
            console.log(`   Setup SQL length: ${row.setup_length} chars`);
            console.log(`   Solution SQL length: ${row.solution_length} chars`);
            console.log(`   Setup preview: ${row.setup_preview}...`);
        }
        
        // Check if there are any schemas with actual content
        console.log('\n📊 Schema content analysis:');
        const contentResult = await pool.query(`
            SELECT 
                sql_dialect,
                COUNT(*) as total_count,
                COUNT(CASE WHEN setup_sql IS NOT NULL AND LENGTH(setup_sql) > 0 THEN 1 END) as with_setup,
                COUNT(CASE WHEN solution_sql IS NOT NULL AND LENGTH(solution_sql) > 0 THEN 1 END) as with_solution
            FROM problem_schemas
            GROUP BY sql_dialect
        `);
        
        for (const row of contentResult.rows) {
            console.log(`   ${row.sql_dialect}: ${row.total_count} total, ${row.with_setup} with setup, ${row.with_solution} with solution`);
        }
        
        // Get one complete schema example
        console.log('\n📊 Complete schema example:');
        const exampleResult = await pool.query(`
            SELECT ps.*, p.title
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            WHERE ps.setup_sql IS NOT NULL 
            AND LENGTH(ps.setup_sql) > 0
            LIMIT 1
        `);
        
        if (exampleResult.rows.length > 0) {
            const example = exampleResult.rows[0];
            console.log(`\n🔹 Example from: ${example.title}`);
            console.log(`Setup SQL:\n${example.setup_sql}`);
            console.log(`\nSolution SQL:\n${example.solution_sql}`);
        }
        
    } catch (error) {
        console.error('❌ Error investigating database:', error);
    } finally {
        await pool.end();
    }
}

investigateDatabase();