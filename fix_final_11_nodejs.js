// Fix the final 11 problems with proper string conversion
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

const brokenProblems = [25, 28, 29, 33, 43, 44, 50, 53, 59, 61, 70];

async function setupProblem(problemId) {
    try {
        const result = await mainPool.query(`
            SELECT ps.setup_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        if (result.rows.length === 0) return false;
        
        const setupSql = result.rows[0].setup_sql;
        
        // Setup sandbox
        await sandboxPool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
        await sandboxPool.query(setupSql);
        
        return true;
    } catch (error) {
        console.log(`      Setup error: ${error.message.substring(0, 80)}`);
        return false;
    }
}

async function fixProblem(problemId) {
    try {
        console.log(`🔧 Problem #${problemId}...`);
        
        // Get solution SQL
        const solutionResult = await mainPool.query(`
            SELECT ps.solution_sql
            FROM problems p
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.numeric_id = $1 AND ps.sql_dialect = 'postgresql'
        `, [problemId]);
        
        if (solutionResult.rows.length === 0) {
            console.log('   ❌ No solution found');
            return false;
        }
        
        const solutionSql = solutionResult.rows[0].solution_sql;
        
        // Setup environment
        if (!await setupProblem(problemId)) {
            console.log('   ❌ Setup failed');
            return false;
        }
        
        // Execute solution
        const result = await sandboxPool.query(solutionSql);
        const rows = result.rows;
        
        // Convert ALL values to strings (this is key!)
        const stringRows = rows.map(row => {
            const stringRow = {};
            for (const [key, value] of Object.entries(row)) {
                stringRow[key] = value !== null ? String(value) : null;
            }
            return stringRow;
        });
        
        // Update expected output
        await mainPool.query(`
            UPDATE problem_schemas 
            SET expected_output = $1::jsonb
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [JSON.stringify(stringRows), problemId]);
        
        console.log(`   ✅ FIXED (${stringRows.length} rows, all values as strings)`);
        return true;
        
    } catch (error) {
        console.log(`   ❌ Error: ${error.message.substring(0, 80)}`);
        return false;
    }
}

async function main() {
    console.log('🚀 FIXING FINAL 11 PROBLEMS - STRING CONVERSION');
    console.log('🎯 Converting ALL values to strings to match API behavior');
    console.log('');
    
    let fixed = 0;
    let failed = 0;
    
    for (const problemId of brokenProblems) {
        if (await fixProblem(problemId)) {
            fixed++;
        } else {
            failed++;
        }
    }
    
    console.log(`\n📊 Results: ✅${fixed} ❌${failed}`);
    
    if (fixed === brokenProblems.length) {
        console.log('\n🎉 ALL 11 PROBLEMS FIXED!');
        console.log('🏆 STRING CONVERSION COMPLETE!');
        console.log('✅ ALL 70 PROBLEMS SHOULD NOW HAVE 100% WORKING VALIDATION!');
    }
    
    // Close connections
    await mainPool.end();
    await sandboxPool.end();
}

main().catch(console.error);