#!/usr/bin/env node
/**
 * Debug Session ID Issue
 * Check what session IDs exist and their progress
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

async function debugSessionIssue() {
  console.log('🔍 Debugging Session ID Issue\n');
  
  // Test 1: Try with no session ID (like a fresh browser)
  console.log('1️⃣ Testing with no session ID (fresh browser)...');
  const noSessionResponse = await makeRequest(`${BASE_URL}/progress/overview`);
  console.log('   Response:', noSessionResponse.data);
  
  // Test 2: Try creating a new session ID (like frontend would)
  console.log('\n2️⃣ Testing with new session ID...');
  const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const newSessionResponse = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, {
    'X-Session-ID': newSessionId
  });
  console.log('   New Session ID:', newSessionId);
  console.log('   Response:', newSessionResponse.data);
  
  // Test 3: Try with a session that we know has progress
  console.log('\n3️⃣ Testing with known working session...');
  const workingSessionResponse = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, {
    'X-Session-ID': 'session_1755295387084_mpfabzzbd'
  });
  console.log('   Working Session ID: session_1755295387084_mpfabzzbd');
  console.log('   Response:', workingSessionResponse.data);
  
  // Test 4: Check what sessions have progress in database
  console.log('\n4️⃣ Sessions with progress in database:');
  console.log('   Run this command to see all sessions with progress:');
  console.log('   psql -h localhost -p 5432 -d sql_practice -c "SELECT DISTINCT session_id, COUNT(*) as problems, MAX(last_attempt_at) as last_activity FROM user_problem_progress GROUP BY session_id ORDER BY last_activity DESC LIMIT 10;"');
  
  console.log('\n💡 The issue is likely:');
  console.log('1. Frontend creates a new session ID every time');
  console.log('2. Progress is saved under old session IDs');
  console.log('3. Frontend looks for progress under new session ID');
  console.log('4. No progress found → shows "No Progress Yet"');
  
  console.log('\n🔧 Solution:');
  console.log('1. Frontend should persist session ID in localStorage');
  console.log('2. Use same session ID for all progress tracking');
  console.log('3. Or aggregate progress across all session IDs');
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

debugSessionIssue()
  .then(() => {
    console.log('\n🏁 Debug completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });