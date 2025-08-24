const pool = require('./config/database');
require('dotenv').config();

// Function to convert PostgreSQL schema to MySQL
function convertToMySQL(sql) {
    let converted = sql;
    
    // Convert data types
    converted = converted.replace(/SERIAL/gi, 'INT AUTO_INCREMENT');
    converted = converted.replace(/BIGSERIAL/gi, 'BIGINT AUTO_INCREMENT');
    converted = converted.replace(/TEXT/gi, 'TEXT');
    converted = converted.replace(/BOOLEAN/gi, 'TINYINT(1)');
    converted = converted.replace(/TIMESTAMP/gi, 'DATETIME');
    converted = converted.replace(/JSONB/gi, 'JSON');
    
    // Convert boolean values
    converted = converted.replace(/\btrue\b/gi, '1');
    converted = converted.replace(/\bfalse\b/gi, '0');
    
    return converted;
}

async function extractMySQLSchema() {
    let mysqlSchema = `-- ============================================\n`;
    mysqlSchema += `-- COMPREHENSIVE SQL PRACTICE PLATFORM SCHEMA\n`;
    mysqlSchema += `-- Generated: ${new Date().toISOString()}\n`;
    mysqlSchema += `-- All tables required for SQL Practice Problems\n`;
    mysqlSchema += `-- ============================================\n\n`;

    try {
        const schemasQuery = `
            SELECT ps.id, ps.problem_id, ps.sql_dialect, ps.setup_sql, ps.solution_sql,
                   p.title, p.slug, p.is_active as problem_active
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            WHERE ps.sql_dialect = 'postgresql'
            ORDER BY p.title
        `;

        const schemasResult = await pool.query(schemasQuery);
        const schemas = schemasResult.rows;

        console.log(`Extracting schemas from ${schemas.length} problems...`);

        for (const schema of schemas) {
            const setupSql = schema.setup_sql || '';
            
            if (setupSql.trim().length > 0) {
                mysqlSchema += `-- ============================================\n`;
                mysqlSchema += `-- Problem: ${schema.title}\n`;
                mysqlSchema += `-- Slug: ${schema.slug}\n`;
                mysqlSchema += `-- ============================================\n`;
                
                const convertedSql = convertToMySQL(setupSql);
                mysqlSchema += `${convertedSql}\n\n`;
            }
        }

        console.log('Schema extraction complete!');
        console.log(mysqlSchema);

    } catch (error) {
        console.error('Error extracting schema:', error);
    } finally {
        await pool.end();
    }
}

extractMySQLSchema();