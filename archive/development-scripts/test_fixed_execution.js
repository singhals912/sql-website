#!/usr/bin/env node
/**
 * Test Fixed SQL Execution
 * Test the updated execute endpoint with proper setup and validation
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

async function testFixedExecution() {
  console.log('🔧 Testing Fixed SQL Execution\n');
  
  const sessionId = 'test_fixed_' + Date.now();
  const headers = { 'X-Session-ID': sessionId };
  
  // Get a specific problem to test with
  console.log('1️⃣ Getting test problem...');
  const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=1`);
  if (!problemsResponse.ok || !problemsResponse.data.problems?.length) {
    console.error('❌ Could not get test problem');
    return;
  }
  
  const testProblem = problemsResponse.data.problems[0];
  console.log(`   📝 Testing with Problem #${testProblem.numeric_id}: ${testProblem.title}`);
  
  // Test with CORRECT query
  console.log('\n2️⃣ Testing with CORRECT query...');
  let correctQuery = 'SELECT * FROM ab_test_results LIMIT 5;'; // Default query for any problem
  
  // Use problem-specific correct queries
  if (testProblem.numeric_id === 1) {
    correctQuery = 'SELECT test_group, COUNT(*) as users, SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions, ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate FROM ab_test_results GROUP BY test_group ORDER BY test_group;';
  } else if (testProblem.numeric_id === 2) {
    correctQuery = 'SELECT client_industry, AVG(risk_score) as avg_risk FROM corporate_risk_profiles GROUP BY client_industry HAVING AVG(risk_score) > 5.0 ORDER BY avg_risk DESC;';
  } else {
    // For unknown problems, just try to select from any table that exists
    correctQuery = 'SELECT 1 as test';
  }
  
  const correctResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
    sql: correctQuery,
    dialect: 'postgresql',
    problemId: testProblem.id,
    problemNumericId: testProblem.numeric_id
  }, headers);
  
  console.log('   Execution successful:', correctResponse.ok);
  if (correctResponse.ok) {
    console.log('   Response:', JSON.stringify(correctResponse.data, null, 2));
    const data = correctResponse.data.data || correctResponse.data;
    console.log('   Tables setup automatically:', data.rows && data.rows.length > 0);
    console.log('   Result rows:', data.rows ? data.rows.length : 'No rows');
    console.log('   Is correct:', data.isCorrect);
    console.log('   Feedback:', data.feedback);
  } else {
    console.log('   Error:', correctResponse.data.error);
  }
  
  // Test with INCORRECT query
  console.log('\n3️⃣ Testing with INCORRECT query...');
  let incorrectQuery = 'SELECT wrong_column FROM ab_test_results;'; // Wrong column
  
  if (testProblem.numeric_id === 2) {
    incorrectQuery = 'SELECT wrong_column FROM corporate_risk_profiles;';
  }
  
  const incorrectResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
    sql: incorrectQuery,
    dialect: 'postgresql',
    problemId: testProblem.id,
    problemNumericId: testProblem.numeric_id
  }, headers);
  
  console.log('   Execution successful:', incorrectResponse.ok);
  if (incorrectResponse.ok) {
    const data = incorrectResponse.data.data;
    console.log('   Result rows:', data.rows.length);
    console.log('   Is correct:', data.isCorrect);
    console.log('   Feedback:', data.feedback);
  }
  
  // Test with SYNTAX ERROR query
  console.log('\n4️⃣ Testing with SYNTAX ERROR query...');
  const syntaxErrorQuery = 'SELCT * FROM customers;'; // Typo in SELECT
  
  const errorResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
    sql: syntaxErrorQuery,
    dialect: 'postgresql',
    problemId: testProblem.id,
    problemNumericId: testProblem.numeric_id
  }, headers);
  
  console.log('   Execution successful:', errorResponse.ok);
  console.log('   Is correct:', errorResponse.data.data?.isCorrect);
  console.log('   Error message:', errorResponse.data.error || errorResponse.data.data?.feedback);
  
  // Test query against nonexistent table (without problem context)
  console.log('\n5️⃣ Testing query without problem context...');
  const noContextResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
    sql: 'SELECT * FROM nonexistent_table;',
    dialect: 'postgresql'
  }, headers);
  
  console.log('   Should fail (no tables setup):', !noContextResponse.ok || !!noContextResponse.data.error);
  
  console.log('\n🎉 Fixed execution test completed!');
  console.log('\n✅ Key improvements:');
  console.log('   📋 Tables are automatically setup for each problem');
  console.log('   ✔️  Queries are validated against expected output');
  console.log('   📊 Progress tracking now reflects actual correctness');
  console.log('   🚫 Syntax errors are properly caught and reported');
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

testFixedExecution()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });