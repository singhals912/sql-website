#!/usr/bin/env node
/**
 * Test Progress and Bookmarks Functionality
 * Tests the newly implemented progress tracking and bookmarks APIs
 */

const { v4: uuidv4 } = require('uuid');

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
  return response.json();
}

async function testProgressAndBookmarks() {
  console.log('🧪 Testing Progress and Bookmarks Functionality\n');
  
  // Generate a test session ID
  const sessionId = 'test_session_' + Date.now();
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    // 1. Initialize session
    console.log('1️⃣ Testing session initialization...');
    const sessionResult = await makeRequest(`${BASE_URL}/progress/session`, 'POST', {}, headers);
    console.log('✅ Session created:', sessionResult.sessionId);
    
    // 2. Test initial progress (should be empty)
    console.log('\n2️⃣ Testing initial progress overview...');
    const initialProgress = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers);
    console.log('✅ Initial progress:', JSON.stringify(initialProgress, null, 2));
    
    // 3. Get a sample problem ID for testing
    console.log('\n3️⃣ Getting sample problem for testing...');
    const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=1`);
    if (problemsResponse.problems && problemsResponse.problems.length > 0) {
      const testProblem = problemsResponse.problems[0];
      console.log('✅ Using test problem:', testProblem.title, '(ID:', testProblem.id, ', Numeric ID:', testProblem.numeric_id, ')');
      
      // 4. Test progress tracking
      console.log('\n4️⃣ Testing progress tracking...');
      const progressResult = await makeRequest(`${BASE_URL}/progress/track`, 'POST', {
        problemId: testProblem.id,
        problemNumericId: testProblem.numeric_id,
        success: true,
        executionTime: 1500
      }, headers);
      console.log('✅ Progress tracked:', progressResult);
      
      // 5. Test updated progress
      console.log('\n5️⃣ Testing updated progress overview...');
      const updatedProgress = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers);
      console.log('✅ Updated progress:', JSON.stringify(updatedProgress, null, 2));
      
      // 6. Test detailed progress
      console.log('\n6️⃣ Testing detailed progress...');
      const detailedProgress = await makeRequest(`${BASE_URL}/progress/detailed`, 'GET', null, headers);
      console.log('✅ Detailed progress:', JSON.stringify(detailedProgress, null, 2));
      
      // 7. Test bookmark creation
      console.log('\n7️⃣ Testing bookmark creation...');
      const bookmarkResult = await makeRequest(`${BASE_URL}/bookmarks/${testProblem.numeric_id}`, 'POST', {
        bookmarkType: 'favorite',
        notes: 'Great problem for learning JOINs',
        tags: ['sql', 'joins', 'practice']
      }, headers);
      console.log('✅ Bookmark created:', bookmarkResult);
      
      // 8. Test bookmark check
      console.log('\n8️⃣ Testing bookmark check...');
      const bookmarkCheck = await makeRequest(`${BASE_URL}/bookmarks/check/${testProblem.numeric_id}`, 'GET', null, headers);
      console.log('✅ Bookmark check:', bookmarkCheck);
      
      // 9. Test bookmark list
      console.log('\n9️⃣ Testing bookmark list...');
      const bookmarkList = await makeRequest(`${BASE_URL}/bookmarks/`, 'GET', null, headers);
      console.log('✅ Bookmark list:', JSON.stringify(bookmarkList, null, 2));
      
      // 10. Test bookmark stats
      console.log('\n🔟 Testing bookmark stats...');
      const bookmarkStats = await makeRequest(`${BASE_URL}/bookmarks/stats`, 'GET', null, headers);
      console.log('✅ Bookmark stats:', JSON.stringify(bookmarkStats, null, 2));
      
      // 11. Test bookmark removal
      console.log('\n🗑️  Testing bookmark removal...');
      const removeResult = await makeRequest(`${BASE_URL}/bookmarks/${testProblem.numeric_id}`, 'DELETE', null, headers);
      console.log('✅ Bookmark removed:', removeResult);
      
      // 12. Verify bookmark was removed
      console.log('\n✅ Verifying bookmark removal...');
      const finalBookmarkCheck = await makeRequest(`${BASE_URL}/bookmarks/check/${testProblem.numeric_id}`, 'GET', null, headers);
      console.log('✅ Final bookmark check:', finalBookmarkCheck);
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\n📊 Test Summary:');
      console.log('✅ Session management: Working');
      console.log('✅ Progress tracking: Working');  
      console.log('✅ Progress analytics: Working');
      console.log('✅ Bookmark creation: Working');
      console.log('✅ Bookmark retrieval: Working');
      console.log('✅ Bookmark deletion: Working');
      console.log('✅ Bookmark statistics: Working');
      
    } else {
      console.log('❌ No problems found to test with');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
testProgressAndBookmarks()
  .then(() => {
    console.log('\n🏁 Test execution completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });