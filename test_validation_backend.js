// Test script to debug validation issues
const { Pool } = require('pg');

const sandboxPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sandbox',
    password: 'password',
    port: 5433,
});

const mainPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sql_practice',
    password: 'password',
    port: 5432,
});

async function debugProblem25() {
    const problemId = 25;
    
    try {
        // Get expected output
        const expectedResult = await mainPool.query(`
            SELECT ps.expected_output, ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        const expectedOutput = expectedResult.rows[0].expected_output;
        const solutionSql = expectedResult.rows[0].solution_sql;
        
        console.log('Expected output (first row):');
        console.log(JSON.stringify(expectedOutput[0], Object.keys(expectedOutput[0]).sort()));
        
        // Setup problem environment
        const setupResult = await mainPool.query(`
            SELECT ps.setup_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        const setupSql = setupResult.rows[0].setup_sql;
        
        // Setup sandbox
        await sandboxPool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
        await sandboxPool.query(setupSql);
        
        // Execute solution
        const result = await sandboxPool.query(solutionSql);
        const rows = result.rows;
        
        console.log('Actual result (first row):');
        console.log(JSON.stringify(rows[0], Object.keys(rows[0]).sort()));
        
        // Test exact comparison
        const userStr = JSON.stringify(rows[0], Object.keys(rows[0]).sort());
        const expectedStr = JSON.stringify(expectedOutput[0], Object.keys(expectedOutput[0]).sort());
        
        console.log('\\nComparison:');
        console.log('User:     ', userStr);
        console.log('Expected: ', expectedStr);
        console.log('Match:    ', userStr === expectedStr);
        
        // Check each field
        console.log('\\nField by field comparison:');
        const userRow = rows[0];
        const expectedRow = expectedOutput[0];
        
        for (const key of Object.keys(expectedRow).sort()) {
            const userVal = userRow[key];
            const expectedVal = expectedRow[key];
            console.log(`${key}: "${userVal}" vs "${expectedVal}" (match: ${userVal === expectedVal})`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

debugProblem25();