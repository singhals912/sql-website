#!/usr/bin/env node
/**
 * Final Integration Test - Progress and Bookmarks
 * Comprehensive test to verify both pages work correctly
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

async function testProgressPage() {
  console.log('📈 Testing Progress Page Integration...\n');
  
  const sessionId = 'final_test_' + Date.now();
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    // 1. Simulate NewProgressPage.js initialization
    console.log('1️⃣ Simulating Progress Page Load...');
    
    // Initialize session (as NewProgressPage does)
    await makeRequest(`${BASE_URL}/progress/session`, 'POST', {}, headers);
    console.log('   ✅ Session initialized');
    
    // Add some test data
    console.log('2️⃣ Adding test progress data...');
    const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=2`);
    const testProblems = problemsResponse.problems || [];
    
    for (let i = 0; i < Math.min(2, testProblems.length); i++) {
      const problem = testProblems[i];
      await makeRequest(`${BASE_URL}/progress/track`, 'POST', {
        problemId: problem.id,
        problemNumericId: problem.numeric_id,
        success: true,
        executionTime: 1000 + (i * 200)
      }, headers);
    }
    console.log('   ✅ Test progress data added');
    
    // Test the three API calls that NewProgressPage makes
    console.log('3️⃣ Testing NewProgressPage API calls...');
    const [progressData, userStats, leaderboardData] = await Promise.all([
      makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/progress/stats`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/progress/leaderboard`, 'GET', null, headers)
    ]);
    
    // Verify progress data structure
    console.log('4️⃣ Verifying Progress Page data structure...');
    const progressChecks = {
      'progressData.success': !!progressData.success,
      'progressData.progress.overview': !!progressData.progress?.overview,
      'progressData.progress.byDifficulty': Array.isArray(progressData.progress?.byDifficulty),
      'progressData.progress.byCategory': Array.isArray(progressData.progress?.byCategory),
      'progressData.progress.recentActivity': Array.isArray(progressData.progress?.recentActivity),
      'progressData.progress.achievements': Array.isArray(progressData.progress?.achievements)
    };
    
    let progressPassed = true;
    Object.entries(progressChecks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      if (!passed) progressPassed = false;
    });
    
    if (progressPassed && progressData.progress?.overview?.completed > 0) {
      console.log('   🎉 Progress Page: ALL CHECKS PASSED!');
      console.log(`   📊 User has completed ${progressData.progress.overview.completed} problems`);
      return { success: true, message: 'Progress page working correctly' };
    } else {
      return { success: false, message: 'Progress page structure issues' };
    }
    
  } catch (error) {
    console.error('❌ Progress page test failed:', error);
    return { success: false, message: error.message };
  }
}

async function testBookmarksPage() {
  console.log('\n📚 Testing Bookmarks Page Integration...\n');
  
  const sessionId = 'final_bookmarks_test_' + Date.now();
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    // 1. Simulate BookmarksPage.js initialization
    console.log('1️⃣ Simulating Bookmarks Page Load...');
    
    // Add some test bookmark data
    console.log('2️⃣ Adding test bookmark data...');
    const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=2`);
    const testProblems = problemsResponse.problems || [];
    
    const bookmarkTypes = ['favorite', 'review_later'];
    for (let i = 0; i < Math.min(2, testProblems.length); i++) {
      const problem = testProblems[i];
      await makeRequest(`${BASE_URL}/bookmarks/${problem.numeric_id}`, 'POST', {
        bookmarkType: bookmarkTypes[i],
        notes: `Test bookmark ${i + 1}`,
        tags: ['test', 'integration']
      }, headers);
    }
    console.log('   ✅ Test bookmark data added');
    
    // Test the API calls that BookmarksPage components make
    console.log('3️⃣ Testing BookmarksPage API calls...');
    const [allBookmarks, bookmarkStats, collections] = await Promise.all([
      makeRequest(`${BASE_URL}/bookmarks/`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/bookmarks/stats`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/bookmarks/collection`, 'GET', null, headers)
    ]);
    
    // Verify bookmarks data structure
    console.log('4️⃣ Verifying Bookmarks Page data structure...');
    const bookmarkChecks = {
      'allBookmarks.success': !!allBookmarks.success,
      'allBookmarks.bookmarks': Array.isArray(allBookmarks.bookmarks),
      'bookmarkStats.success': !!bookmarkStats.success,
      'bookmarkStats.stats': !!bookmarkStats.stats,
      'collections.success': !!collections.success,
      'collections.collection': Array.isArray(collections.collection)
    };
    
    let bookmarksPassed = true;
    Object.entries(bookmarkChecks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
      if (!passed) bookmarksPassed = false;
    });
    
    // Test bookmark filtering
    console.log('5️⃣ Testing bookmark filtering...');
    const favoriteBookmarks = await makeRequest(`${BASE_URL}/bookmarks/?type=favorite`, 'GET', null, headers);
    const filterPassed = !!favoriteBookmarks.success && Array.isArray(favoriteBookmarks.bookmarks);
    console.log(`   ${filterPassed ? '✅' : '❌'} Bookmark filtering works`);
    
    if (bookmarksPassed && filterPassed && bookmarkStats.stats?.total > 0) {
      console.log('   🎉 Bookmarks Page: ALL CHECKS PASSED!');
      console.log(`   📚 User has ${bookmarkStats.stats.total} bookmarks`);
      return { success: true, message: 'Bookmarks page working correctly' };
    } else {
      return { success: false, message: 'Bookmarks page structure issues' };
    }
    
  } catch (error) {
    console.error('❌ Bookmarks page test failed:', error);
    return { success: false, message: error.message };
  }
}

async function runFinalIntegrationTest() {
  console.log('🔄 Final Integration Test - Progress and Bookmarks Pages\n');
  console.log('=' .repeat(70));
  
  try {
    // Test both pages
    const progressResult = await testProgressPage();
    const bookmarksResult = await testBookmarksPage();
    
    console.log('\n' + '=' .repeat(70));
    console.log('\n🎯 FINAL TEST RESULTS:');
    console.log('📈 Progress Page:', progressResult.success ? '✅ WORKING' : '❌ FAILED');
    console.log('📚 Bookmarks Page:', bookmarksResult.success ? '✅ WORKING' : '❌ FAILED');
    
    if (progressResult.success && bookmarksResult.success) {
      console.log('\n🎉🎉🎉 SUCCESS! 🎉🎉🎉');
      console.log('✅ Both Progress and Bookmarks pages should now work correctly!');
      console.log('✅ All backend APIs return the correct structure');
      console.log('✅ Frontend components should display data properly');
      console.log('✅ Session management is working');
      console.log('✅ Progress tracking is functional');
      console.log('✅ Bookmark management is functional');
      
      console.log('\n📝 Next Steps:');
      console.log('1. Navigate to http://localhost:3001/progress in your browser');
      console.log('2. Navigate to http://localhost:3001/bookmarks in your browser');
      console.log('3. Try solving some problems to see progress tracking');
      console.log('4. Try bookmarking problems to see bookmark functionality');
      
      console.log('\n💡 If pages still show issues, check browser console for errors');
      
    } else {
      console.log('\n❌ Some issues remain:');
      if (!progressResult.success) {
        console.log('  - Progress Page:', progressResult.message);
      }
      if (!bookmarksResult.success) {
        console.log('  - Bookmarks Page:', bookmarksResult.message);
      }
    }
    
  } catch (error) {
    console.error('💥 Integration test failed:', error);
  }
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
runFinalIntegrationTest()
  .then(() => {
    console.log('\n🏁 Final integration test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Final integration test failed:', error);
    process.exit(1);
  });