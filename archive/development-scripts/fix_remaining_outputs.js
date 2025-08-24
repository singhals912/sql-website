#!/usr/bin/env node
/**
 * Fix Remaining Expected Output Issues
 * 
 * This script focuses specifically on the problems that failed to save expected outputs
 * due to the database schema issue and other problems.
 */

const { Pool } = require('pg');

// Import fetch for Node.js
if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.error('node-fetch not available. Install with: npm install node-fetch');
        process.exit(1);
    }
}

const mainPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sql_practice',
    user: 'postgres',
    password: 'password'
});

const sandboxPool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'sandbox',
    user: 'postgres',
    password: 'password'
});

const BASE_URL = 'http://localhost:5001/api';

async function makeRequest(url, method = 'GET', body = null, headers = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json()
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error.message
        };
    }
}

async function setupProblemEnvironment(problemId) {
    try {
        const response = await makeRequest(`${BASE_URL}/sql/problems/${problemId}/setup`, 'POST', {
            dialect: 'postgresql'
        });
        return response.ok;
    } catch (error) {
        console.error(`Setup failed for problem ${problemId}:`, error.message);
        return false;
    }
}

async function executeSolutionSQL(solutionSql) {
    try {
        const result = await sandboxPool.query(solutionSql);
        return result.rows;
    } catch (error) {
        console.error('Solution execution failed:', error.message);
        return null;
    }
}

async function updateExpectedOutput(problemId, expectedOutput) {
    try {
        // Convert result rows to the format expected by the validation system
        const formattedOutput = expectedOutput.map(row => {
            // Convert all values to strings and handle nulls
            return Object.values(row).map(val => val !== null ? String(val) : null);
        });
        
        const jsonOutput = JSON.stringify(formattedOutput);
        
        // Fixed query without updated_at column
        await mainPool.query(`
            UPDATE problem_schemas 
            SET expected_output = $1::jsonb
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [jsonOutput, problemId]);
        
        return true;
    } catch (error) {
        console.error(`Failed to update expected output for problem ${problemId}:`, error.message);
        return false;
    }
}

async function fixProblemExpectedOutput(problem) {
    console.log(`🔧 Fixing Problem #${problem.numeric_id}: ${problem.title.substring(0, 60)}...`);
    
    try {
        // Get current problem schema
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (!schemaResponse.ok) {
            console.log('   ❌ Cannot fetch problem schema');
            return false;
        }
        
        const schema = schemaResponse.data.schema;
        
        if (!schema) {
            console.log('   ❌ No schema available');
            return false;
        }
        
        // Check if expected output already exists
        if (schema.expected_output) {
            console.log('   ✅ Expected output already exists');
            return true;
        }
        
        if (!schema.solution_sql) {
            console.log('   ❌ No solution SQL available');
            return false;
        }
        
        console.log('   🔨 Generating expected output from solution...');
        
        // Setup problem environment
        const setupSuccess = await setupProblemEnvironment(problem.numeric_id);
        if (!setupSuccess) {
            console.log('   ❌ Failed to setup problem environment');
            return false;
        }
        
        // Small delay to ensure setup completes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Execute solution SQL
        const solutionResults = await executeSolutionSQL(schema.solution_sql);
        if (!solutionResults) {
            console.log('   ❌ Solution SQL execution failed');
            return false;
        }
        
        if (solutionResults.length === 0) {
            console.log('   ❌ Solution returns no results');
            return false;
        }
        
        // Update expected output
        const updateSuccess = await updateExpectedOutput(problem.numeric_id, solutionResults);
        if (updateSuccess) {
            console.log(`   ✅ Generated expected output: ${solutionResults.length} rows`);
            return true;
        } else {
            console.log('   ❌ Failed to save expected output to database');
            return false;
        }
        
    } catch (error) {
        console.log(`   💥 Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Fixing Remaining Expected Output Issues');
    console.log('🎯 Target: Add missing expected outputs for validation\\n');
    
    try {
        // Get problems missing expected outputs
        const problemsResult = await mainPool.query(`
            SELECT p.id, p.numeric_id, p.title, p.description, p.difficulty, 
                   COALESCE(c.name, 'Uncategorized') as category
            FROM problems p 
            LEFT JOIN categories c ON p.category_id = c.id
            JOIN problem_schemas ps ON p.id = ps.problem_id
            WHERE p.is_active = true 
            AND ps.sql_dialect = 'postgresql'
            AND (ps.expected_output IS NULL OR ps.expected_output = 'null'::jsonb)
            AND ps.solution_sql IS NOT NULL
            ORDER BY p.numeric_id
        `);
        
        const problems = problemsResult.rows;
        console.log(`Found ${problems.length} problems missing expected outputs\\n`);
        
        if (problems.length === 0) {
            console.log('🎉 All problems already have expected outputs!');
            return;
        }
        
        let fixed = 0;
        let failed = 0;
        
        for (const problem of problems) {
            const success = await fixProblemExpectedOutput(problem);
            
            if (success) {
                fixed++;
            } else {
                failed++;
            }
            
            // Small delay between problems
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\\n' + '='.repeat(70));
        console.log('📊 EXPECTED OUTPUT FIXING REPORT');
        console.log('='.repeat(70));
        console.log(`\\n📈 Results:`);
        console.log(`   Total Problems: ${problems.length}`);
        console.log(`   ✅ Fixed: ${fixed} (${Math.round(fixed / problems.length * 100)}%)`);
        console.log(`   ❌ Failed: ${failed} (${Math.round(failed / problems.length * 100)}%)`);
        
        if (fixed > 0) {
            console.log(`\\n🎉 Success! ${fixed} problems now have expected outputs for validation.`);
        }
        
        if (failed > 0) {
            console.log(`\\n🔧 ${failed} problems still need manual attention.`);
            console.log(`   Common reasons for failure:`);
            console.log(`   - Solution SQL references tables/columns not in setup SQL`);
            console.log(`   - Solution SQL has syntax errors`);
            console.log(`   - Problem environment setup issues`);
        }
        
        console.log(`\\n💡 Next Steps:`);
        console.log(`   1. Run validation script to see improvement`);
        console.log(`   2. Test some problems in the frontend`);
        console.log(`   3. Address remaining failed problems manually`);
        
    } catch (error) {
        console.error('💥 Fixing process failed:', error);
        process.exit(1);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log('\\n🏁 Expected output fixing completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}