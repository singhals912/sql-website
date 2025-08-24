const { Pool } = require('pg');
const fs = require('fs');

// Local database connection
const localPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sql_practice',
    user: 'postgres',
    password: 'sql_practice_secure_2024!',
});

async function exportProblems() {
    try {
        console.log('🚀 Exporting problems from local database...');
        
        // Export problems with categories
        const problemsResult = await localPool.query(`
            SELECT 
                p.*,
                c.name as category_name,
                c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.numeric_id
        `);
        
        // Export categories
        const categoriesResult = await localPool.query(`
            SELECT * FROM categories ORDER BY name
        `);
        
        // Export problem schemas (contains setup_sql, expected_output, solution_sql)
        const schemasResult = await localPool.query(`
            SELECT 
                ps.*,
                p.title as problem_title,
                p.slug as problem_slug
            FROM problem_schemas ps
            LEFT JOIN problems p ON ps.problem_id = p.id
            ORDER BY p.numeric_id, ps.sql_dialect
        `);
        
        const exportData = {
            categories: categoriesResult.rows,
            problems: problemsResult.rows,
            problem_schemas: schemasResult.rows,
            exportedAt: new Date().toISOString(),
            totalProblems: problemsResult.rows.length,
            totalCategories: categoriesResult.rows.length,
            totalSchemas: schemasResult.rows.length
        };
        
        // Write to file
        const filename = `problems-export-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
        
        console.log(`✅ Export completed!`);
        console.log(`   - ${exportData.totalCategories} categories exported`);
        console.log(`   - ${exportData.totalProblems} problems exported`);
        console.log(`   - ${exportData.totalSchemas} problem schemas exported`);
        console.log(`   - Saved to: ${filename}`);
        
        // Show sample
        console.log('\n📋 Sample problems:');
        exportData.problems.slice(0, 3).forEach(p => {
            console.log(`- ${p.title} (${p.difficulty}) - ${p.category_name || 'No category'}`);
        });
        
    } catch (error) {
        console.error('❌ Export failed:', error);
    } finally {
        await localPool.end();
    }
}

exportProblems();