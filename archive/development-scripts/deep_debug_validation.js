// Deep debug of validation issue
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

async function deepDebugProblem25() {
    const problemId = 25;
    
    try {
        // Get expected output and solution
        const expectedResult = await mainPool.query(`
            SELECT ps.expected_output, ps.solution_sql, ps.setup_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        const { expected_output, solution_sql, setup_sql } = expectedResult.rows[0];
        
        console.log('=== DEEP DEBUG: Problem 25 ===\\n');
        
        // Setup sandbox
        await sandboxPool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
        await sandboxPool.query(setup_sql);
        
        // Execute solution
        const result = await sandboxPool.query(solution_sql);
        const userRows = result.rows;
        const expectedRows = expected_output;
        
        console.log('Expected rows:', expectedRows.length);
        console.log('User rows:', userRows.length);
        console.log('');
        
        // Apply the same normalization as the backend
        const normalizeRow = (row) => {
            const normalized = {};
            for (const [key, value] of Object.entries(row)) {
                normalized[key] = value !== null && value !== undefined ? String(value) : null;
            }
            return normalized;
        };
        
        for (let i = 0; i < Math.min(3, userRows.length); i++) {
            const userRow = userRows[i];
            const expectedRow = expectedRows[i];
            
            console.log(`--- Row ${i + 1} ---`);
            console.log('Original user row:', JSON.stringify(userRow));
            console.log('Original expected row:', JSON.stringify(expectedRow));
            
            const normalizedUser = normalizeRow(userRow);
            const normalizedExpected = normalizeRow(expectedRow);
            
            console.log('Normalized user row:', JSON.stringify(normalizedUser, Object.keys(normalizedUser).sort()));
            console.log('Normalized expected row:', JSON.stringify(normalizedExpected, Object.keys(normalizedExpected).sort()));
            
            const userStr = JSON.stringify(normalizedUser, Object.keys(normalizedUser).sort());
            const expectedStr = JSON.stringify(normalizedExpected, Object.keys(normalizedExpected).sort());
            
            console.log('Match:', userStr === expectedStr);
            
            if (userStr !== expectedStr) {
                console.log('DIFFERENCE FOUND:');
                console.log('User string    :', userStr);
                console.log('Expected string:', expectedStr);
                
                // Character by character comparison
                console.log('\\nCharacter-by-character difference:');
                const maxLen = Math.max(userStr.length, expectedStr.length);
                for (let j = 0; j < Math.min(200, maxLen); j++) {
                    const uChar = userStr[j] || '(end)';
                    const eChar = expectedStr[j] || '(end)';
                    if (uChar !== eChar) {
                        console.log(`Position ${j}: user="${uChar}" (${uChar.charCodeAt ? uChar.charCodeAt(0) : 'N/A'}) vs expected="${eChar}" (${eChar.charCodeAt ? eChar.charCodeAt(0) : 'N/A'})`);
                        break;
                    }
                }
            }
            console.log('');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

deepDebugProblem25();