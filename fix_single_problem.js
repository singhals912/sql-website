#!/usr/bin/env node
/**
 * Fix Single Problem - Problem #5 Adobe Creative Cloud
 * 
 * Let's manually fix one problem completely to test our approach
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

async function updateSetupSQL(problemId, newSetupSql) {
    try {
        await mainPool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [newSetupSql, problemId]);
        return true;
    } catch (error) {
        console.error(`Failed to update setup SQL for problem ${problemId}:`, error.message);
        return false;
    }
}

async function updateSolutionSQL(problemId, newSolutionSql) {
    try {
        await mainPool.query(`
            UPDATE problem_schemas 
            SET solution_sql = $1
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [newSolutionSql, problemId]);
        return true;
    } catch (error) {
        console.error(`Failed to update solution SQL for problem ${problemId}:`, error.message);
        return false;
    }
}

async function updateExpectedOutput(problemId, expectedOutput) {
    try {
        const formattedOutput = expectedOutput.map(row => {
            return Object.values(row).map(val => val !== null ? String(val) : null);
        });
        
        const jsonOutput = JSON.stringify(formattedOutput);
        
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

async function setupProblemEnvironment(problemId) {
    try {
        const response = await makeRequest(`${BASE_URL}/sql/problems/${problemId}/setup`, 'POST', {
            dialect: 'postgresql'
        });
        return { success: response.ok, error: response.data?.error };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function executeSolutionSQL(solutionSql) {
    try {
        const result = await sandboxPool.query(solutionSql);
        return { success: true, rows: result.rows };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function fixProblem5() {
    console.log('🔧 Fixing Problem #5: Adobe Creative Cloud Subscription Analytics');
    
    // Create a completely new, clean setup SQL
    const newSetupSQL = `
CREATE TABLE adobe_subscriptions (
    subscription_id INT PRIMARY KEY,
    plan_name VARCHAR(50),
    monthly_revenue DECIMAL(12,2),
    subscriber_count INT,
    churn_rate DECIMAL(5,2),
    signup_date DATE
);

INSERT INTO adobe_subscriptions VALUES
(1, 'Creative Cloud Individual', 52.99, 450000, 0.05, '2024-01-15'),
(2, 'Creative Cloud Business', 79.99, 120000, 0.03, '2024-02-10'),
(3, 'Photography Plan', 19.99, 800000, 0.07, '2024-01-20'),
(4, 'Single App Plan', 22.99, 200000, 0.08, '2024-03-05'),
(5, 'Student Plan', 19.99, 300000, 0.12, '2024-02-15'),
(6, 'Creative Cloud Teams', 84.99, 85000, 0.04, '2024-01-25'),
(7, 'Creative Cloud Enterprise', 99.99, 45000, 0.02, '2024-03-01'),
(8, 'Acrobat Pro DC', 23.99, 180000, 0.06, '2024-02-20'),
(9, 'Stock Standard', 29.99, 90000, 0.09, '2024-03-10'),
(10, 'Stock Premium', 99.99, 25000, 0.05, '2024-01-30');
`;

    const newSolutionSQL = `
SELECT 
    plan_name, 
    SUM(monthly_revenue * subscriber_count) as total_revenue
FROM adobe_subscriptions 
GROUP BY plan_name 
HAVING SUM(monthly_revenue * subscriber_count) > 1000000 
ORDER BY total_revenue DESC;
`;

    try {
        console.log('   📝 Updating setup SQL...');
        const setupUpdateSuccess = await updateSetupSQL(5, newSetupSQL);
        
        if (!setupUpdateSuccess) {
            console.log('   ❌ Failed to update setup SQL');
            return false;
        }
        
        console.log('   ✅ Setup SQL updated');
        
        // Wait and test setup
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('   🔧 Testing setup...');
        const setupTest = await setupProblemEnvironment(5);
        
        if (!setupTest.success) {
            console.log(`   ❌ Setup failed: ${setupTest.error}`);
            return false;
        }
        
        console.log('   ✅ Setup successful');
        
        // Test solution
        console.log('   🔧 Testing solution...');
        const solutionTest = await executeSolutionSQL(newSolutionSQL);
        
        if (!solutionTest.success) {
            console.log(`   ❌ Solution failed: ${solutionTest.error}`);
            return false;
        }
        
        if (!solutionTest.rows || solutionTest.rows.length === 0) {
            console.log('   ❌ Solution returns no results');
            return false;
        }
        
        console.log(`   ✅ Solution works: ${solutionTest.rows.length} rows`);
        
        // Update solution and expected output
        console.log('   💾 Saving solution and expected output...');
        await updateSolutionSQL(5, newSolutionSQL);
        await updateExpectedOutput(5, solutionTest.rows);
        
        console.log('   🎉 Problem #5 fixed completely!');
        console.log('   📊 Expected output rows:', solutionTest.rows.length);
        console.log('   📋 Sample result:', JSON.stringify(solutionTest.rows[0], null, 2));
        
        return true;
        
    } catch (error) {
        console.log(`   💥 Error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Testing Single Problem Fix Approach');
    console.log('🎯 Target: Completely fix Problem #5 with clean SQL\\n');
    
    try {
        const success = await fixProblem5();
        
        if (success) {
            console.log('\\n🎉 SUCCESS! Problem #5 is now fully working.');
            console.log('\\n🔧 Testing the fix...');
            
            // Test the fix by running a query
            const testResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
                sql: 'SELECT plan_name, SUM(monthly_revenue * subscriber_count) as total_revenue FROM adobe_subscriptions GROUP BY plan_name ORDER BY total_revenue DESC;',
                dialect: 'postgresql',
                problemNumericId: 5
            }, { 'X-Session-ID': 'test_fix_' + Date.now() });
            
            if (testResponse.ok) {
                const data = testResponse.data.data || testResponse.data;
                console.log('✅ Validation test:', {
                    isCorrect: data.isCorrect,
                    feedback: data.feedback,
                    rows: data.rowCount
                });
            }
        } else {
            console.log('\\n❌ Failed to fix Problem #5');
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log('\\n🏁 Single problem fix test completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}