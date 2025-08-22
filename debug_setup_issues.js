#!/usr/bin/env node
/**
 * Debug Setup Issues
 * 
 * Let's examine specific problems to understand why setup is failing
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

async function debugProblem(problemId) {
    console.log(`\\n🔍 Debugging Problem #${problemId}`);
    
    try {
        // Get schema
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problemId}`);
        
        if (!schemaResponse.ok) {
            console.log('   ❌ Cannot fetch schema');
            return;
        }
        
        const schema = schemaResponse.data.schema;
        
        if (!schema) {
            console.log('   ❌ No schema');
            return;
        }
        
        console.log('   📋 Setup SQL length:', schema.setup_sql?.length || 0);
        console.log('   📋 Solution SQL length:', schema.solution_sql?.length || 0);
        console.log('   📋 Expected output exists:', !!schema.expected_output);
        
        if (schema.setup_sql) {
            // Show first part of setup SQL
            const setupPreview = schema.setup_sql.substring(0, 200);
            console.log('   📋 Setup SQL preview:', setupPreview + '...');
            
            // Check for common issues
            if (!schema.setup_sql.includes('CREATE TABLE')) {
                console.log('   ⚠️  No CREATE TABLE statements');
            }
            
            if (!schema.setup_sql.includes('INSERT INTO')) {
                console.log('   ⚠️  No INSERT statements');
            }
            
            // Check for syntax errors
            const createTableMatches = [...schema.setup_sql.matchAll(/CREATE TABLE\\s+(\\w+)/gi)];
            console.log('   📊 Tables found:', createTableMatches.map(m => m[1]).join(', '));
        }
        
        if (schema.solution_sql) {
            const solutionPreview = schema.solution_sql.substring(0, 200);
            console.log('   📋 Solution SQL preview:', solutionPreview + '...');
        }
        
        // Try setup
        console.log('   🔧 Testing setup...');
        const setupResponse = await makeRequest(`${BASE_URL}/sql/problems/${problemId}/setup`, 'POST', {
            dialect: 'postgresql'
        });
        
        if (setupResponse.ok) {
            console.log('   ✅ Setup successful');
        } else {
            console.log('   ❌ Setup failed:', setupResponse.data);
        }
        
    } catch (error) {
        console.log('   💥 Error:', error.message);
    }
}

async function main() {
    console.log('🚀 Debugging Setup Issues for Failing Problems\\n');
    
    // Test a few specific problems that are failing
    const testProblems = [3, 5, 6, 8, 9, 10]; // Sample of failing problems
    
    for (const problemId of testProblems) {
        await debugProblem(problemId);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    await mainPool.end();
}

if (require.main === module) {
    main()
        .then(() => {
            console.log('\\n🏁 Debug completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}