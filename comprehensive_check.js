#!/usr/bin/env node
/**
 * Comprehensive System Check
 * Complete verification of Progress and Bookmarks functionality
 */

const BASE_URL = 'http://localhost:5001/api';

// Test helper function
async function makeRequest(url, method = 'GET', body = null, headers = {}) {
  try {
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
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

async function runComprehensiveCheck() {
  console.log('🔍 COMPREHENSIVE SYSTEM CHECK\n');
  console.log('=' .repeat(80));
  
  const results = {
    backend: { passed: 0, failed: 0 },
    progress: { passed: 0, failed: 0 },
    bookmarks: { passed: 0, failed: 0 },
    integration: { passed: 0, failed: 0 }
  };
  
  const sessionId = 'comprehensive_test_' + Date.now();
  const headers = { 'X-Session-ID': sessionId };
  
  // 1. BACKEND INFRASTRUCTURE TESTS
  console.log('1️⃣ BACKEND INFRASTRUCTURE TESTS');
  console.log('-' .repeat(40));
  
  const backendTests = [
    { name: 'Server responding', url: `${BASE_URL}/progress/overview` },
    { name: 'Database connection', url: `${BASE_URL}/sql/problems?limit=1` },
    { name: 'Session creation', url: `${BASE_URL}/progress/session`, method: 'POST' }
  ];
  
  for (const test of backendTests) {
    const result = await makeRequest(test.url, test.method || 'GET', null, headers);
    if (result.ok) {
      console.log(`   ✅ ${test.name}: PASS`);
      results.backend.passed++;
    } else {
      console.log(`   ❌ ${test.name}: FAIL (${result.status})`);
      results.backend.failed++;
    }
  }
  
  // 2. PROGRESS FUNCTIONALITY TESTS
  console.log('\\n2️⃣ PROGRESS FUNCTIONALITY TESTS');
  console.log('-' .repeat(40));
  
  // Add test progress data
  console.log('   📊 Adding test progress data...');
  const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=2`);
  const testProblems = problemsResponse.data?.problems || [];
  
  if (testProblems.length >= 2) {
    for (let i = 0; i < 2; i++) {
      const problem = testProblems[i];
      await makeRequest(`${BASE_URL}/progress/track`, 'POST', {
        problemId: problem.id,
        problemNumericId: problem.numeric_id,
        success: true,
        executionTime: 1000 + (i * 200)
      }, headers);
    }
    console.log('   ✅ Test progress data added');
  }
  
  const progressTests = [
    { name: 'Progress overview', url: `${BASE_URL}/progress/overview` },
    { name: 'Progress detailed', url: `${BASE_URL}/progress/detailed` },
    { name: 'Progress stats', url: `${BASE_URL}/progress/stats` },
    { name: 'Progress leaderboard', url: `${BASE_URL}/progress/leaderboard` },
    { name: 'Progress tracking', url: `${BASE_URL}/progress/track`, method: 'POST', 
      body: { problemId: testProblems[0]?.id, problemNumericId: testProblems[0]?.numeric_id, success: true, executionTime: 1500 } }
  ];
  
  for (const test of progressTests) {
    const result = await makeRequest(test.url, test.method || 'GET', test.body, headers);
    
    if (result.ok) {
      console.log(`   ✅ ${test.name}: PASS`);
      
      // Detailed validation for key endpoints
      if (test.name === 'Progress overview' && result.data?.success) {
        const progress = result.data.progress;
        if (progress?.overview && progress?.byDifficulty && progress?.recentActivity !== undefined) {
          console.log(`      📈 Structure valid - Completed: ${progress.overview.completed}`);
        } else {
          console.log(`      ⚠️  Structure issue in progress overview`);
        }
      }
      
      results.progress.passed++;
    } else {
      console.log(`   ❌ ${test.name}: FAIL (${result.status || 'Network error'})`);
      if (result.error) console.log(`      Error: ${result.error}`);
      results.progress.failed++;
    }
  }
  
  // 3. BOOKMARKS FUNCTIONALITY TESTS
  console.log('\\n3️⃣ BOOKMARKS FUNCTIONALITY TESTS');
  console.log('-' .repeat(40));
  
  const testProblemId = testProblems[0]?.numeric_id || 1;
  
  const bookmarkTests = [
    { name: 'Bookmark status check', url: `${BASE_URL}/bookmarks/check/${testProblemId}` },
    { name: 'Bookmark addition', url: `${BASE_URL}/bookmarks/${testProblemId}`, method: 'POST', 
      body: { bookmarkType: 'favorite', notes: 'Test bookmark', tags: ['test'] } },
    { name: 'Bookmark list', url: `${BASE_URL}/bookmarks/` },
    { name: 'Bookmark stats', url: `${BASE_URL}/bookmarks/stats` },
    { name: 'Bookmark collections', url: `${BASE_URL}/bookmarks/collection` },
    { name: 'Bookmark filtering', url: `${BASE_URL}/bookmarks/?type=favorite` },
    { name: 'Bookmark removal', url: `${BASE_URL}/bookmarks/${testProblemId}`, method: 'DELETE' }
  ];
  
  for (const test of bookmarkTests) {
    const result = await makeRequest(test.url, test.method || 'GET', test.body, headers);
    
    if (result.ok) {
      console.log(`   ✅ ${test.name}: PASS`);
      
      // Detailed validation for key endpoints
      if (test.name === 'Bookmark status check') {
        if (result.data?.bookmarked !== undefined) {
          console.log(`      📚 Bookmark status: ${result.data.bookmarked}`);
        }
      } else if (test.name === 'Bookmark addition' && result.data?.success) {
        console.log(`      📚 Bookmark added as: ${result.data.bookmarkType}`);
      } else if (test.name === 'Bookmark list' && result.data?.success) {
        console.log(`      📚 Bookmarks count: ${result.data.bookmarks?.length || 0}`);
      }
      
      results.bookmarks.passed++;
    } else {
      console.log(`   ❌ ${test.name}: FAIL (${result.status || 'Network error'})`);
      if (result.error) console.log(`      Error: ${result.error}`);
      results.bookmarks.failed++;
    }
  }
  
  // 4. FRONTEND INTEGRATION SIMULATION
  console.log('\\n4️⃣ FRONTEND INTEGRATION SIMULATION');
  console.log('-' .repeat(40));
  
  // Simulate NewProgressPage workflow
  console.log('   📱 Simulating NewProgressPage.js workflow...');
  const newProgressPageTest = await Promise.all([
    makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers),
    makeRequest(`${BASE_URL}/progress/stats`, 'GET', null, headers),
    makeRequest(`${BASE_URL}/progress/leaderboard`, 'GET', null, headers)
  ]);
  
  const allProgressCallsSucceeded = newProgressPageTest.every(result => result.ok);
  if (allProgressCallsSucceeded) {
    console.log('   ✅ NewProgressPage simulation: PASS');
    results.integration.passed++;
  } else {
    console.log('   ❌ NewProgressPage simulation: FAIL');
    results.integration.failed++;
  }
  
  // Simulate BookmarksPage workflow
  console.log('   📱 Simulating BookmarksPage.js workflow...');
  const bookmarksPageTest = await Promise.all([
    makeRequest(`${BASE_URL}/bookmarks/`, 'GET', null, headers),
    makeRequest(`${BASE_URL}/bookmarks/stats`, 'GET', null, headers),
    makeRequest(`${BASE_URL}/bookmarks/collection`, 'GET', null, headers)
  ]);
  
  const allBookmarkCallsSucceeded = bookmarksPageTest.every(result => result.ok);
  if (allBookmarkCallsSucceeded) {
    console.log('   ✅ BookmarksPage simulation: PASS');
    results.integration.passed++;
  } else {
    console.log('   ❌ BookmarksPage simulation: FAIL');
    results.integration.failed++;
  }
  
  // Simulate BookmarkButton workflow
  console.log('   📱 Simulating BookmarkButton.js workflow...');
  const bookmarkButtonTest = [
    await makeRequest(`${BASE_URL}/bookmarks/check/${testProblemId}`, 'GET', null, headers),
    await makeRequest(`${BASE_URL}/bookmarks/${testProblemId}`, 'POST', { bookmarkType: 'challenging' }, headers),
    await makeRequest(`${BASE_URL}/bookmarks/check/${testProblemId}`, 'GET', null, headers)
  ];
  
  const bookmarkButtonSucceeded = bookmarkButtonTest.every(result => result.ok);
  if (bookmarkButtonSucceeded) {
    const finalStatus = bookmarkButtonTest[2].data;
    if (finalStatus?.bookmarked && finalStatus?.bookmarkType === 'challenging') {
      console.log('   ✅ BookmarkButton simulation: PASS');
      console.log('      📚 Bookmark cycle completed successfully');
      results.integration.passed++;
    } else {
      console.log('   ❌ BookmarkButton simulation: FAIL (state inconsistency)');
      results.integration.failed++;
    }
  } else {
    console.log('   ❌ BookmarkButton simulation: FAIL');
    results.integration.failed++;
  }
  
  // 5. SUMMARY AND DIAGNOSIS
  console.log('\\n' + '=' .repeat(80));
  console.log('📊 COMPREHENSIVE CHECK RESULTS');
  console.log('=' .repeat(80));
  
  const totalTests = Object.values(results).reduce((sum, cat) => sum + cat.passed + cat.failed, 0);
  const totalPassed = Object.values(results).reduce((sum, cat) => sum + cat.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, cat) => sum + cat.failed, 0);
  
  console.log(`\\n📈 Overall: ${totalPassed}/${totalTests} tests passed (${Math.round(totalPassed/totalTests*100)}%)`);
  console.log(`\\n📊 Breakdown:`);
  console.log(`   🔧 Backend Infrastructure: ${results.backend.passed}/${results.backend.passed + results.backend.failed} passed`);
  console.log(`   📈 Progress Functionality: ${results.progress.passed}/${results.progress.passed + results.progress.failed} passed`);
  console.log(`   📚 Bookmarks Functionality: ${results.bookmarks.passed}/${results.bookmarks.passed + results.bookmarks.failed} passed`);
  console.log(`   🔗 Frontend Integration: ${results.integration.passed}/${results.integration.passed + results.integration.failed} passed`);
  
  if (totalFailed === 0) {
    console.log('\\n🎉 ALL SYSTEMS WORKING PERFECTLY!');
    console.log('\\n✅ Backend APIs are fully functional');
    console.log('✅ Progress tracking is working');
    console.log('✅ Bookmarks management is working');
    console.log('✅ All frontend integrations should work');
    
    console.log('\\n🔍 If BookmarkButton still not working in browser:');
    console.log('1. Clear browser cache and reload');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Verify BookmarkButton is rendering (look for 🔖 icons)');
    console.log('4. Make sure you\'re on a problem page (e.g., /practice/1)');
    
  } else {
    console.log(`\\n❌ ${totalFailed} ISSUES FOUND - see details above`);
  }
  
  console.log('\\n💡 Quick Frontend Test:');
  console.log('Navigate to: http://localhost:3001/practice/1');
  console.log('Look for: 🔖 bookmark icon near problem title');
  console.log('Expected: Clicking should show dropdown with bookmark options');
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the comprehensive check
runComprehensiveCheck()
  .then(() => {
    console.log('\\n🏁 Comprehensive check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Comprehensive check failed:', error);
    process.exit(1);
  });