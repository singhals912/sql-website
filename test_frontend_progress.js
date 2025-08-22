#!/usr/bin/env node
/**
 * Test Frontend Progress Flow
 * Simulates the exact flow that happens when a user solves problems in the frontend
 */

const BASE_URL = 'http://localhost:5001/api';

// Test helper function
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

async function testFrontendProgressFlow() {
  console.log('🧪 Testing Frontend Progress Flow\n');
  
  // Step 1: Create session ID like frontend does
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('📱 Created session ID:', sessionId);
  
  const headers = { 'X-Session-ID': sessionId };
  
  // Step 2: Initialize session (like ProgressService does)
  console.log('\n1️⃣ Initializing session...');
  const sessionResponse = await makeRequest(`${BASE_URL}/progress/session`, 'POST', {
    ipAddress: null,
    userAgent: 'Test Browser'
  }, headers);
  
  if (sessionResponse.ok) {
    console.log('   ✅ Session initialized successfully');
  } else {
    console.log('   ❌ Session initialization failed:', sessionResponse.data);
  }
  
  // Step 3: Get a problem to test with
  console.log('\n2️⃣ Getting test problem...');
  const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=1`);
  if (!problemsResponse.ok || !problemsResponse.data.problems?.length) {
    console.error('❌ Could not get test problem');
    return;
  }
  
  const testProblem = problemsResponse.data.problems[0];
  console.log(`   📝 Testing with Problem #${testProblem.numeric_id}: ${testProblem.title}`);
  
  // Step 4: Execute SQL (like frontend does when user runs a query)
  console.log('\n3️⃣ Executing SQL query...');
  const executeResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
    sql: 'SELECT 1 as test',
    dialect: 'postgresql',
    problemId: testProblem.id,
    problemNumericId: testProblem.numeric_id
  }, headers);
  
  if (executeResponse.ok) {
    console.log('   ✅ SQL executed successfully');
    console.log('   📊 Execution result:', executeResponse.data.success);
  } else {
    console.log('   ❌ SQL execution failed:', executeResponse.data);
    return;
  }
  
  // Step 5: Check progress overview (like Progress page does)
  console.log('\n4️⃣ Checking progress overview...');
  const progressResponse = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers);
  
  if (progressResponse.ok) {
    console.log('   ✅ Progress overview retrieved');
    console.log('   📈 Progress data:', JSON.stringify(progressResponse.data.progress.overview, null, 2));
    
    if (progressResponse.data.progress.overview.completed > 0) {
      console.log('   🎉 SUCCESS: Progress is being tracked!');
    } else {
      console.log('   ❌ ISSUE: No progress recorded despite SQL execution');
    }
  } else {
    console.log('   ❌ Progress overview failed:', progressResponse.data);
  }
  
  // Step 6: Check detailed progress
  console.log('\n5️⃣ Checking detailed progress...');
  const detailedResponse = await makeRequest(`${BASE_URL}/progress/detailed`, 'GET', null, headers);
  
  if (detailedResponse.ok) {
    console.log('   ✅ Detailed progress retrieved');
    const problems = detailedResponse.data.problems || [];
    const completedProblems = problems.filter(p => p.status === 'completed');
    console.log(`   📝 Total problems in detailed view: ${problems.length}`);
    console.log(`   ✅ Completed problems: ${completedProblems.length}`);
    
    if (completedProblems.length > 0) {
      console.log('   🎉 SUCCESS: Detailed progress shows completed problems!');
      completedProblems.forEach(p => {
        console.log(`      ✅ Problem #${p.problemNumericId}: ${p.status} (${p.totalAttempts} attempts)`);
      });
    }
  } else {
    console.log('   ❌ Detailed progress failed:', detailedResponse.data);
  }
  
  // Step 7: Check what's in the database for this session
  console.log('\n6️⃣ Checking database directly...');
  console.log('   Run this command to see progress in database:');
  console.log(`   psql -h localhost -p 5432 -d sql_practice -c "SELECT problem_numeric_id, status, total_attempts, correct_attempts FROM user_problem_progress WHERE session_id = '${sessionId}'"`);
  
  console.log('\n🏁 Frontend Progress Flow Test Complete');
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
testFrontendProgressFlow()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });