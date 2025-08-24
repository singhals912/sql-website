#!/usr/bin/env node
/**
 * Debug Problem Detection
 * Test if the backend can find problem schemas
 */

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
  
  const response = await fetch(url, options);
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json()
  };
}

async function debugProblemDetection() {
  console.log('🔍 Debug Problem Detection\n');
  
  // Test 1: Get a specific problem by numeric ID
  console.log('1️⃣ Getting problem by numeric ID...');
  const problemResponse = await makeRequest(`${BASE_URL}/sql/problems/2`);
  
  if (problemResponse.ok) {
    console.log('   ✅ Problem found:', problemResponse.data.problem.title);
    console.log('   🗄️  Has schema:', !!problemResponse.data.schema);
    
    if (problemResponse.data.schema) {
      console.log('   📋 Setup SQL exists:', !!problemResponse.data.schema.setup_sql);
      console.log('   📊 Expected output exists:', !!problemResponse.data.schema.expected_output);
    }
  } else {
    console.log('   ❌ Problem not found:', problemResponse.data);
  }
  
  // Test 2: Try to manually setup problem environment
  console.log('\n2️⃣ Testing manual setup endpoint...');
  const setupResponse = await makeRequest(`${BASE_URL}/sql/problems/2/setup`, 'POST', {
    dialect: 'postgresql'
  });
  
  console.log('   Setup successful:', setupResponse.ok);
  if (!setupResponse.ok) {
    console.log('   Setup error:', setupResponse.data);
  } else {
    console.log('   ✅ Setup completed successfully');
  }
  
  // Test 3: After setup, try to query the table
  if (setupResponse.ok) {
    console.log('\n3️⃣ Testing query after manual setup...');
    const queryResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
      sql: 'SELECT COUNT(*) FROM corporate_risk_profiles;',
      dialect: 'postgresql'
    }, { 'X-Session-ID': 'debug789' });
    
    console.log('   Query successful:', queryResponse.ok);
    if (queryResponse.ok) {
      console.log('   📊 Table has data:', queryResponse.data.data?.rows?.[0]);
    } else {
      console.log('   Query error:', queryResponse.data.error);
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('   The issue might be:');
  console.log('   1. Problem detection in execute route not working');
  console.log('   2. Setup SQL not being retrieved correctly');
  console.log('   3. Sandbox database connection issue');
  console.log('   4. SQL execution happening before setup');
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

debugProblemDetection()
  .then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });