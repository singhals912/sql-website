#!/usr/bin/env node
// Import fetch for Node.js
if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.error('node-fetch not available. Install with: npm install node-fetch');
        process.exit(1);
    }
}

async function quickTest() {
    console.log('🔍 Quick validation test...\n');
    
    // Test 1: Can we get a problem?
    console.log('1. Testing problem API...');
    try {
        const response = await fetch('http://localhost:5001/api/sql/problems/1');
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Problem API working');
            console.log('   📊 Schema available:', !!data.schema);
            console.log('   📋 Setup SQL available:', !!data.schema?.setup_sql);
            console.log('   🎯 Expected output available:', !!data.schema?.expected_output);
        } else {
            console.log('   ❌ Problem API failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Problem API error:', error.message);
    }
    
    // Test 2: Can we execute SQL?
    console.log('\n2. Testing SQL execution...');
    try {
        const response = await fetch('http://localhost:5001/api/execute/sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': 'test123'
            },
            body: JSON.stringify({
                sql: 'SELECT 1 as test',
                dialect: 'postgresql',
                problemNumericId: 1
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ SQL execution working');
            console.log('   📊 Response format:', Object.keys(data));
        } else {
            console.log('   ❌ SQL execution failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ SQL execution error:', error.message);
    }
    
    // Test 3: Can we setup a problem?
    console.log('\n3. Testing problem setup...');
    try {
        const response = await fetch('http://localhost:5001/api/sql/problems/1/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dialect: 'postgresql'
            })
        });
        
        if (response.ok) {
            console.log('   ✅ Problem setup working');
        } else {
            console.log('   ❌ Problem setup failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Problem setup error:', error.message);
    }
    
    // Test 4: Can we access bookmarks?
    console.log('\n4. Testing bookmarks API...');
    try {
        const response = await fetch('http://localhost:5001/api/bookmarks', {
            headers: {
                'X-Session-ID': 'test123'
            }
        });
        
        if (response.ok) {
            console.log('   ✅ Bookmarks API working');
        } else {
            console.log('   ❌ Bookmarks API failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Bookmarks API error:', error.message);
    }
    
    // Test 5: Can we access progress?
    console.log('\n5. Testing progress API...');
    try {
        const response = await fetch('http://localhost:5001/api/progress', {
            headers: {
                'X-Session-ID': 'test123'
            }
        });
        
        if (response.ok) {
            console.log('   ✅ Progress API working');
        } else {
            console.log('   ❌ Progress API failed:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Progress API error:', error.message);
    }
    
    console.log('\n📋 Quick test completed!');
}

quickTest().catch(console.error);