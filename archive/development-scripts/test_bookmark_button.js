#!/usr/bin/env node
/**
 * Test BookmarkButton Functionality
 * Simulates the API calls that BookmarkButton makes
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
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    if (typeof body === 'object') {
      options.body = JSON.stringify(body);
    }
  }
  
  const response = await fetch(url, options);
  return {
    ok: response.ok,
    status: response.status,
    data: await response.json()
  };
}

async function testBookmarkButtonWorkflow() {
  console.log('🔘 Testing BookmarkButton Component Workflow\n');
  
  // Generate test session ID (as BookmarkButton would)
  const sessionId = 'bookmark_test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const headers = { 'X-Session-ID': sessionId };
  
  // Get a test problem
  const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=1`);
  if (!problemsResponse.ok || !problemsResponse.data.problems?.length) {
    console.error('❌ Could not get test problem');
    return;
  }
  
  const testProblem = problemsResponse.data.problems[0];
  const problemId = testProblem.numeric_id;
  
  console.log(`🧪 Testing with Problem #${problemId}: ${testProblem.title}\n`);
  
  try {
    // 1. Test initial bookmark status check (as BookmarkButton.checkBookmarkStatus() does)
    console.log('1️⃣ Testing bookmark status check...');
    const checkResponse = await makeRequest(`${BASE_URL}/bookmarks/check/${problemId}`, 'GET', null, headers);
    
    console.log('   Status Code:', checkResponse.status);
    console.log('   Response OK:', checkResponse.ok);
    console.log('   Response Data:', JSON.stringify(checkResponse.data, null, 2));
    
    if (checkResponse.ok) {
      console.log('   ✅ Bookmark status check: SUCCESS');
      console.log(`   📊 Is bookmarked: ${checkResponse.data.bookmarked}`);
      console.log(`   🏷️  Bookmark type: ${checkResponse.data.bookmarkType || 'none'}`);
    } else {
      console.log('   ❌ Bookmark status check: FAILED');
      return;
    }
    
    // 2. Test adding a bookmark (as BookmarkButton.handleBookmark('favorite') does)
    console.log('\n2️⃣ Testing bookmark addition...');
    const addResponse = await makeRequest(`${BASE_URL}/bookmarks/${problemId}`, 'POST', {
      bookmarkType: 'favorite',
      notes: 'Test bookmark from BookmarkButton',
      tags: ['test', 'bookmark']
    }, headers);
    
    console.log('   Status Code:', addResponse.status);
    console.log('   Response OK:', addResponse.ok);
    console.log('   Response Data:', JSON.stringify(addResponse.data, null, 2));
    
    if (addResponse.ok && addResponse.data.success) {
      console.log('   ✅ Bookmark addition: SUCCESS');
      console.log(`   🎯 Bookmarked as: ${addResponse.data.bookmarkType}`);
    } else {
      console.log('   ❌ Bookmark addition: FAILED');
      return;
    }
    
    // 3. Test bookmark status check after adding
    console.log('\n3️⃣ Testing bookmark status after addition...');
    const checkAfterAddResponse = await makeRequest(`${BASE_URL}/bookmarks/check/${problemId}`, 'GET', null, headers);
    
    if (checkAfterAddResponse.ok && checkAfterAddResponse.data.bookmarked) {
      console.log('   ✅ Bookmark status after addition: SUCCESS');
      console.log(`   📊 Is bookmarked: ${checkAfterAddResponse.data.bookmarked}`);
      console.log(`   🏷️  Bookmark type: ${checkAfterAddResponse.data.bookmarkType}`);
    } else {
      console.log('   ❌ Bookmark status after addition: FAILED');
      console.log('   Response:', JSON.stringify(checkAfterAddResponse.data, null, 2));
      return;
    }
    
    // 4. Test changing bookmark type (as BookmarkButton.handleBookmark('challenging') does)
    console.log('\n4️⃣ Testing bookmark type change...');
    const changeTypeResponse = await makeRequest(`${BASE_URL}/bookmarks/${problemId}`, 'POST', {
      bookmarkType: 'challenging',
      notes: 'Changed to challenging',
      tags: ['test', 'challenging']
    }, headers);
    
    if (changeTypeResponse.ok && changeTypeResponse.data.success) {
      console.log('   ✅ Bookmark type change: SUCCESS');
      console.log(`   🎯 Changed to: ${changeTypeResponse.data.bookmarkType}`);
    } else {
      console.log('   ❌ Bookmark type change: FAILED');
      return;
    }
    
    // 5. Test bookmark removal (as BookmarkButton.handleBookmark() does when removing)
    console.log('\n5️⃣ Testing bookmark removal...');
    const removeResponse = await makeRequest(`${BASE_URL}/bookmarks/${problemId}`, 'DELETE', null, headers);
    
    console.log('   Status Code:', removeResponse.status);
    console.log('   Response OK:', removeResponse.ok);
    console.log('   Response Data:', JSON.stringify(removeResponse.data, null, 2));
    
    if (removeResponse.ok && removeResponse.data.success) {
      console.log('   ✅ Bookmark removal: SUCCESS');
      console.log(`   🗑️  Bookmark removed: ${!removeResponse.data.bookmarked}`);
    } else {
      console.log('   ❌ Bookmark removal: FAILED');
      return;
    }
    
    // 6. Test final bookmark status check
    console.log('\n6️⃣ Testing final bookmark status...');
    const finalCheckResponse = await makeRequest(`${BASE_URL}/bookmarks/check/${problemId}`, 'GET', null, headers);
    
    if (finalCheckResponse.ok && !finalCheckResponse.data.bookmarked) {
      console.log('   ✅ Final bookmark status: SUCCESS');
      console.log(`   📊 Is bookmarked: ${finalCheckResponse.data.bookmarked}`);
    } else {
      console.log('   ❌ Final bookmark status: FAILED');
      console.log('   Response:', JSON.stringify(finalCheckResponse.data, null, 2));
      return;
    }
    
    console.log('\n🎉 BookmarkButton Component Test: ALL TESTS PASSED!');
    console.log('✅ Bookmark status checking works');
    console.log('✅ Bookmark addition works');  
    console.log('✅ Bookmark type changing works');
    console.log('✅ Bookmark removal works');
    console.log('✅ BookmarkButton should now work in the frontend!');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Navigate to any problem page');
    console.log('2. Look for the bookmark button (usually a star or bookmark icon)');
    console.log('3. Click the bookmark button to bookmark the problem');
    console.log('4. Try different bookmark types (favorite, review later, challenging)');
    console.log('5. Check the Bookmarks page to see your saved bookmarks');
    
  } catch (error) {
    console.error('❌ BookmarkButton test failed:', error);
  }
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
testBookmarkButtonWorkflow()
  .then(() => {
    console.log('\n🏁 BookmarkButton test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 BookmarkButton test failed:', error);
    process.exit(1);
  });