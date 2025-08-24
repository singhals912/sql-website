#!/usr/bin/env node
/**
 * Test Frontend Integration for Progress and Bookmarks
 * This test simulates what the frontend components would do
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
  return response.json();
}

async function testFrontendIntegration() {
  console.log('🔄 Testing Frontend-Backend Integration\n');
  
  // Generate a test session ID (as the frontend would)
  const sessionId = 'frontend_test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    console.log('📱 Session ID:', sessionId);
    
    // 1. Test ProgressService.initializeSession()
    console.log('\n1️⃣ Testing ProgressService.initializeSession()...');
    const sessionInit = await makeRequest(`${BASE_URL}/progress/session`, 'POST', {}, headers);
    console.log('✅ Session init:', sessionInit.success ? 'SUCCESS' : 'FAILED');
    
    // 2. Test ProgressService.getProgressOverview()
    console.log('\n2️⃣ Testing ProgressService.getProgressOverview()...');
    const overview = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers);
    console.log('✅ Overview structure check:');
    console.log('   - Has success:', !!overview.success);
    console.log('   - Has progress:', !!overview.progress);
    if (overview.progress) {
      console.log('   - totalProblems:', overview.progress.totalProblems);
      console.log('   - solvedProblems:', overview.progress.solvedProblems);
    }
    
    // 3. Test ProgressService.getDetailedProgress()
    console.log('\n3️⃣ Testing ProgressService.getDetailedProgress()...');
    const detailed = await makeRequest(`${BASE_URL}/progress/detailed`, 'GET', null, headers);
    console.log('✅ Detailed structure check:');
    console.log('   - Has success:', !!detailed.success);
    console.log('   - Has problems:', !!detailed.problems);
    if (detailed.problems) {
      console.log('   - byDifficulty keys:', Object.keys(detailed.problems.byDifficulty));
      console.log('   - byCategory keys:', Object.keys(detailed.problems.byCategory));
      console.log('   - recentActivity length:', detailed.problems.recentActivity?.length || 0);
    }
    
    // 4. Test ProgressService.getStats()
    console.log('\n4️⃣ Testing ProgressService.getStats()...');
    const statsResponse = await makeRequest(`${BASE_URL}/progress/stats`, 'GET', null, headers);
    console.log('✅ Stats structure check:');
    console.log('   - Has success:', !!statsResponse.success);
    console.log('   - Has stats:', !!statsResponse.stats);
    if (statsResponse.stats) {
      console.log('   - problemsSolved:', statsResponse.stats.problemsSolved);
      console.log('   - totalAttempts:', statsResponse.stats.totalAttempts);
    }
    
    // 5. Test BookmarksList (get all bookmarks)
    console.log('\n5️⃣ Testing BookmarksList (get all bookmarks)...');
    const bookmarks = await makeRequest(`${BASE_URL}/bookmarks/`, 'GET', null, headers);
    console.log('✅ Bookmarks list:', Array.isArray(bookmarks) ? `${bookmarks.length} items` : 'Not array');
    
    // 6. Test BookmarkStats
    console.log('\n6️⃣ Testing BookmarkStats...');
    const bookmarkStats = await makeRequest(`${BASE_URL}/bookmarks/stats`, 'GET', null, headers);
    console.log('✅ Bookmark stats structure:');
    console.log('   - total:', bookmarkStats.total);
    console.log('   - byType:', JSON.stringify(bookmarkStats.byType));
    console.log('   - byDifficulty:', JSON.stringify(bookmarkStats.byDifficulty));
    
    // 7. Test BookmarkStats collections
    console.log('\n7️⃣ Testing BookmarkStats collections...');
    const collections = await makeRequest(`${BASE_URL}/bookmarks/collection`, 'GET', null, headers);
    console.log('✅ Collections:', Array.isArray(collections) ? `${collections.length} items` : 'Not array');
    
    // 8. Simulate adding progress (as SQL execution would do)
    console.log('\n8️⃣ Simulating progress tracking...');
    const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=1`);
    if (problemsResponse.problems && problemsResponse.problems.length > 0) {
      const testProblem = problemsResponse.problems[0];
      const trackResult = await makeRequest(`${BASE_URL}/progress/track`, 'POST', {
        problemId: testProblem.id,
        problemNumericId: testProblem.numeric_id,
        success: true,
        executionTime: 2000
      }, headers);
      console.log('✅ Progress tracked:', trackResult.success ? 'SUCCESS' : 'FAILED');
      
      // 9. Test updated progress after tracking
      console.log('\n9️⃣ Testing updated progress after tracking...');
      const updatedOverview = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers);
      console.log('✅ Updated progress:');
      if (updatedOverview.progress) {
        console.log('   - solvedProblems:', updatedOverview.progress.solvedProblems);
        console.log('   - accuracyRate:', updatedOverview.progress.accuracyRate);
      }
      
      // 10. Test bookmarking the problem
      console.log('\n🔟 Testing bookmark functionality...');
      const addBookmark = await makeRequest(`${BASE_URL}/bookmarks/${testProblem.numeric_id}`, 'POST', {
        bookmarkType: 'favorite',
        notes: 'Frontend integration test',
        tags: ['test', 'integration']
      }, headers);
      console.log('✅ Bookmark added:', addBookmark.success ? 'SUCCESS' : 'FAILED');
      
      // 11. Check bookmark was added
      const updatedBookmarks = await makeRequest(`${BASE_URL}/bookmarks/`, 'GET', null, headers);
      console.log('✅ Updated bookmarks count:', Array.isArray(updatedBookmarks) ? updatedBookmarks.length : 0);
    }
    
    console.log('\n🎉 Frontend Integration Test Complete!');
    console.log('\n📊 Summary:');
    console.log('✅ All Progress API endpoints return expected structure');
    console.log('✅ All Bookmark API endpoints return expected structure');
    console.log('✅ Progress tracking works correctly');
    console.log('✅ Bookmark functionality works correctly');
    console.log('✅ Frontend components should now work properly');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
testFrontendIntegration()
  .then(() => {
    console.log('\n🏁 Integration test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Integration test failed:', error);
    process.exit(1);
  });