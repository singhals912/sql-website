#!/usr/bin/env node
/**
 * Simulate User Flow
 * Test the exact sequence a user would experience
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

async function simulateUserFlow() {
  console.log('👤 Simulating Real User Flow\n');
  
  // STEP 1: User opens browser for first time (no localStorage)
  console.log('📱 STEP 1: User opens browser (fresh session)');
  let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('   Generated session ID:', sessionId);
  
  // STEP 2: User goes to practice page and solves a problem
  console.log('\n🎯 STEP 2: User solves a problem');
  const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=1`);
  const testProblem = problemsResponse.data.problems[0];
  
  const executeResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
    sql: 'SELECT 1 as test',
    dialect: 'postgresql',
    problemId: testProblem.id,
    problemNumericId: testProblem.numeric_id
  }, { 'X-Session-ID': sessionId });
  
  console.log('   Problem solved:', executeResponse.ok);
  console.log('   Session used for solving:', sessionId);
  
  // STEP 3: User navigates to Progress page
  console.log('\n📊 STEP 3: User opens Progress page');
  
  // This is what ProgressService.initializeSession() does:
  const sessionInitResponse = await makeRequest(`${BASE_URL}/progress/session`, 'POST', {
    ipAddress: null,
    userAgent: 'Test Browser'
  }, { 'X-Session-ID': sessionId });
  
  const returnedSessionId = sessionInitResponse.data.sessionId;
  console.log('   Session sent to backend:', sessionId);
  console.log('   Session returned by backend:', returnedSessionId);
  console.log('   Session IDs match:', sessionId === returnedSessionId);
  
  // This is what ProgressService.getProgressOverview() does:
  const progressResponse = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, {
    'X-Session-ID': returnedSessionId
  });
  
  console.log('   Progress data:', progressResponse.data.progress.overview);
  
  // STEP 4: Check if progress would show
  console.log('\n🔍 STEP 4: Analysis');
  const hasProgress = progressResponse.data.progress.overview.completed > 0;
  console.log('   Has progress:', hasProgress);
  console.log('   Would show "No Progress Yet":', !progressResponse.data);
  
  if (hasProgress) {
    console.log('   ✅ SUCCESS: Progress page would show data!');
  } else {
    console.log('   ❌ ISSUE: Progress page would show "No Progress Yet"');
    
    // Let's debug why
    console.log('\n🔧 Debugging...');
    console.log('   Checking if progress exists for this session in DB:');
    console.log(`   psql -h localhost -p 5432 -d sql_practice -c "SELECT * FROM user_problem_progress WHERE session_id = '${sessionId}'"`);
  }
  
  // STEP 5: Test what happens with a known working session
  console.log('\n🧪 STEP 5: Test with known working session');
  const workingSessionId = 'session_1755295387084_mpfabzzbd';
  const workingProgressResponse = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, {
    'X-Session-ID': workingSessionId
  });
  
  console.log('   Working session progress:', workingProgressResponse.data.progress.overview);
  console.log('   Working session has progress:', workingProgressResponse.data.progress.overview.completed > 0);
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

simulateUserFlow()
  .then(() => {
    console.log('\n🏁 User flow simulation completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Simulation failed:', error);
    process.exit(1);
  });