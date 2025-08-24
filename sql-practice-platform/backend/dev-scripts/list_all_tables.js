const pool = require('./config/database');
require('dotenv').config();

// Function to extract table names from SQL statements
function extractTableNames(sql) {
    const tableNames = new Set();
    
    // Remove comments
    sql = sql.replace(/--.*$/gm, '');
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Extract table names from CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?)(\w+)\1/gi;
    let match;
    while ((match = createTableRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    // Extract table names from FROM clauses
    const fromRegex = /FROM\s+([`"]?)(\w+)\1/gi;
    while ((match = fromRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    // Extract table names from JOIN clauses
    const joinRegex = /JOIN\s+([`"]?)(\w+)\1/gi;
    while ((match = joinRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    // Extract table names from INSERT INTO statements
    const insertRegex = /INSERT\s+INTO\s+([`"]?)(\w+)\1/gi;
    while ((match = insertRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    return Array.from(tableNames);
}

async function listAllTables() {
    try {
        console.log('🎯 COMPREHENSIVE TABLE LIST FOR MYSQL SANDBOX');
        console.log('===============================================\n');

        const schemasQuery = `
            SELECT ps.setup_sql, ps.solution_sql, p.title
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            WHERE ps.sql_dialect = 'postgresql'
            ORDER BY p.title
        `;

        const schemasResult = await pool.query(schemasQuery);
        const schemas = schemasResult.rows;

        const allTableNames = new Set();
        const tableUsage = new Map();

        for (const schema of schemas) {
            const setupSql = schema.setup_sql || '';
            const solutionSql = schema.solution_sql || '';
            
            const tableNames = extractTableNames(setupSql + ' ' + solutionSql);
            
            for (const tableName of tableNames) {
                allTableNames.add(tableName);
                if (!tableUsage.has(tableName)) {
                    tableUsage.set(tableName, []);
                }
                tableUsage.get(tableName).push(schema.title);
            }
        }

        const sortedTableNames = Array.from(allTableNames).sort();

        console.log(`📊 Total unique tables required: ${sortedTableNames.length}\n`);
        
        console.log('📋 COMPLETE TABLE LIST (Alphabetical):');
        console.log('=====================================');
        
        for (let i = 0; i < sortedTableNames.length; i++) {
            const tableName = sortedTableNames[i];
            const usageCount = tableUsage.get(tableName)?.length || 0;
            console.log(`${(i + 1).toString().padStart(3, ' ')}. ${tableName.toUpperCase().padEnd(35, ' ')} (used in ${usageCount} problem${usageCount !== 1 ? 's' : ''})`);
        }

        console.log('\n🔍 TABLE USAGE DETAILS:');
        console.log('=======================');
        
        for (const tableName of sortedTableNames) {
            const problems = tableUsage.get(tableName) || [];
            console.log(`\n🔹 ${tableName.toUpperCase()}`);
            console.log(`   Used in ${problems.length} problem${problems.length !== 1 ? 's' : ''}:`);
            for (const problem of problems.slice(0, 3)) { // Show first 3 problems
                console.log(`   - ${problem}`);
            }
            if (problems.length > 3) {
                console.log(`   ... and ${problems.length - 3} more`);
            }
        }

        console.log('\n🎯 MYSQL CREATE TABLE REQUIREMENTS:');
        console.log('====================================');
        console.log('Every table listed above MUST exist in your MySQL sandbox database.');
        console.log('Missing any of these tables will cause SQL execution errors.');
        console.log('Use the complete_mysql_schema.sql file to create all required tables.');

        // Key table that was missing
        if (allTableNames.has('aig_policies')) {
            console.log('\n✅ CONFIRMED: aig_policies table IS included in the schema');
        } else {
            console.log('\n❌ WARNING: aig_policies table NOT found in schemas');
        }

    } catch (error) {
        console.error('❌ Error listing tables:', error);
    } finally {
        await pool.end();
    }
}

listAllTables();