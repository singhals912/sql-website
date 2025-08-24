#!/usr/bin/env node
/**
 * Sample Validation - Test first 5 problems to demonstrate comprehensive validation
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

async function validateProblem(problem) {
    console.log(`\n🔍 Problem #${problem.numeric_id}: ${problem.title}`);
    console.log(`   📝 Difficulty: ${problem.difficulty} | Category: ${problem.category}`);
    
    const issues = [];
    
    // 1. Problem Statement Check
    if (!problem.description || problem.description.length < 50) {
        issues.push('Description too short');
    }
    
    const hasBusinessContext = problem.description && problem.description.includes('Business Context:');
    if (!hasBusinessContext) {
        issues.push('Missing business context');
    }
    
    // 2. Schema & Data Check
    try {
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (!schemaResponse.ok) {
            issues.push('Cannot fetch schema');
        } else {
            const schema = schemaResponse.data.schema;
            
            if (!schema?.setup_sql) {
                issues.push('Missing setup SQL');
            } else {
                if (!schema.setup_sql.includes('CREATE TABLE')) {
                    issues.push('No table creation');
                }
                if (!schema.setup_sql.includes('INSERT INTO')) {
                    issues.push('No sample data');
                }
            }
            
            if (!schema?.expected_output) {
                issues.push('Missing expected output');
            }
            
            if (!schema?.solution_sql) {
                issues.push('Missing solution SQL');
            }
        }
    } catch (error) {
        issues.push(`Schema error: ${error.message}`);
    }
    
    // 3. Execution Test
    try {
        const sessionId = `test_${Date.now()}_${problem.numeric_id}`;
        
        const execResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
            sql: 'SELECT 1 as test',
            dialect: 'postgresql',
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (!execResponse.ok) {
            issues.push('Execution environment broken');
        } else {
            const data = execResponse.data.data || execResponse.data;
            if (!data.hasOwnProperty('isCorrect')) {
                issues.push('Missing validation');
            }
        }
    } catch (error) {
        issues.push(`Execution error: ${error.message}`);
    }
    
    // 4. Frontend Sample Data Test
    try {
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (schemaResponse.ok && schemaResponse.data.schema?.setup_sql) {
            const setupSql = schemaResponse.data.schema.setup_sql;
            
            // Test frontend parsing
            const insertMatches = [...setupSql.matchAll(/INSERT INTO\s+(\w+)\s+VALUES\s+([\s\S]*?);/g)];
            
            if (setupSql.includes('INSERT INTO') && insertMatches.length === 0) {
                issues.push('Frontend parsing will fail');
            }
        }
    } catch (error) {
        issues.push(`Frontend test error: ${error.message}`);
    }
    
    // Results
    if (issues.length === 0) {
        console.log('   🎉 ALL CHECKS PASSED');
    } else {
        console.log(`   ❌ ${issues.length} issues found:`);
        issues.forEach(issue => console.log(`      - ${issue}`));
    }
    
    return { passed: issues.length === 0, issues };
}

async function main() {
    console.log('🚀 Sample Validation - Testing First 5 Problems');
    console.log('=' * 60);
    
    try {
        // Get first 5 problems
        const problemsResult = await mainPool.query(`
            SELECT p.id, p.numeric_id, p.title, p.description, p.difficulty, 
                   COALESCE(c.name, 'Uncategorized') as category, p.is_active
            FROM problems p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
            ORDER BY p.numeric_id
            LIMIT 5
        `);
        
        const problems = problemsResult.rows;
        console.log(`\nTesting ${problems.length} problems...\n`);
        
        let passed = 0;
        let failed = 0;
        const allIssues = [];
        
        for (const problem of problems) {
            const result = await validateProblem(problem);
            
            if (result.passed) {
                passed++;
            } else {
                failed++;
                allIssues.push(...result.issues);
            }
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${passed}/${problems.length} (${Math.round(passed/problems.length*100)}%)`);
        console.log(`❌ Failed: ${failed}/${problems.length} (${Math.round(failed/problems.length*100)}%)`);
        console.log(`🔍 Total Issues: ${allIssues.length}`);
        
        if (allIssues.length > 0) {
            console.log('\n🔥 Common Issues:');
            const issueCounts = {};
            allIssues.forEach(issue => {
                issueCounts[issue] = (issueCounts[issue] || 0) + 1;
            });
            
            Object.entries(issueCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([issue, count]) => {
                    console.log(`   ${count}x: ${issue}`);
                });
        }
        
    } catch (error) {
        console.error('💥 Validation failed:', error);
    } finally {
        await mainPool.end();
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}