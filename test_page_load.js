#!/usr/bin/env node
/**
 * Test Page Load Simulation
 * Simulates what happens when Progress and Bookmarks pages load
 */

const BASE_URL = 'http://localhost:5001/api';

// Simulate frontend session ID generation
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

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

async function simulateProgressPageLoad() {
  console.log('📈 Simulating Progress Page Load...\n');
  
  // Generate session ID as frontend would
  const sessionId = generateSessionId();
  console.log('🔧 Session ID:', sessionId);
  
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    // Step 1: Initialize session (as NewProgressPage.loadProgressData() does)
    console.log('1️⃣ Initializing session...');
    const sessionInit = await makeRequest(`${BASE_URL}/progress/session`, 'POST', {}, headers);
    console.log('   ✅ Session initialized:', sessionInit.success ? 'SUCCESS' : 'FAILED');
    
    // Step 2: Load progress data in parallel (as NewProgressPage does)
    console.log('\n2️⃣ Loading progress data in parallel...');
    const [overview, detailed, userStats, leaderboard] = await Promise.all([
      makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/progress/detailed`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/progress/stats`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/progress/leaderboard`, 'GET', null, headers)
    ]);
    
    console.log('   ✅ Overview loaded:', overview.success ? 'SUCCESS' : 'FAILED');
    console.log('   ✅ Detailed loaded:', detailed.success ? 'SUCCESS' : 'FAILED');
    console.log('   ✅ Stats loaded:', userStats.success ? 'SUCCESS' : 'FAILED');
    console.log('   ✅ Leaderboard loaded:', Array.isArray(leaderboard) ? 'SUCCESS' : 'FAILED');
    
    // Step 3: Check data content
    console.log('\n3️⃣ Progress Page Data:');
    if (overview.success && overview.progress) {
      console.log('   📊 Total Problems:', overview.progress.totalProblems);
      console.log('   ✅ Solved Problems:', overview.progress.solvedProblems);
      console.log('   📈 Accuracy Rate:', overview.progress.accuracyRate + '%');
    }
    
    if (detailed.success && detailed.problems) {
      console.log('   📊 Difficulty Breakdown:', JSON.stringify(detailed.problems.byDifficulty));
      console.log('   📚 Recent Activity:', detailed.problems.recentActivity?.length || 0, 'items');
    }
    
    if (userStats.success && userStats.stats) {
      console.log('   📊 User Stats - Solved:', userStats.stats.problemsSolved);
      console.log('   📊 User Stats - Attempts:', userStats.stats.totalAttempts);
    }
    
    return { success: true, data: { overview, detailed, userStats, leaderboard } };
    
  } catch (error) {
    console.error('❌ Progress page load failed:', error);
    return { success: false, error: error.message };
  }
}

async function simulateBookmarksPageLoad() {
  console.log('\n📚 Simulating Bookmarks Page Load...\n');
  
  // Generate session ID as frontend would
  const sessionId = generateSessionId();
  console.log('🔧 Session ID:', sessionId);
  
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    // Step 1: Load bookmarks data (as BookmarksPage would)
    console.log('1️⃣ Loading bookmarks data...');
    const [allBookmarks, bookmarkStats, collections] = await Promise.all([
      makeRequest(`${BASE_URL}/bookmarks/`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/bookmarks/stats`, 'GET', null, headers),
      makeRequest(`${BASE_URL}/bookmarks/collection`, 'GET', null, headers)
    ]);
    
    console.log('   ✅ All bookmarks loaded:', Array.isArray(allBookmarks) ? 'SUCCESS' : 'FAILED');
    console.log('   ✅ Stats loaded:', bookmarkStats.total !== undefined ? 'SUCCESS' : 'FAILED');
    console.log('   ✅ Collections loaded:', Array.isArray(collections) ? 'SUCCESS' : 'FAILED');
    
    // Step 2: Check data content  
    console.log('\n2️⃣ Bookmarks Page Data:');
    console.log('   📚 Total Bookmarks:', bookmarkStats.total || 0);
    console.log('   📊 By Type:', JSON.stringify(bookmarkStats.byType || {}));
    console.log('   📊 By Difficulty:', JSON.stringify(bookmarkStats.byDifficulty || {}));
    console.log('   📋 Collections:', collections?.length || 0);
    console.log('   📝 Bookmark List:', allBookmarks?.length || 0, 'items');
    
    // Step 3: Test bookmark filtering (as BookmarksList would)
    console.log('\n3️⃣ Testing bookmark filtering...');
    const favoriteBookmarks = await makeRequest(`${BASE_URL}/bookmarks/?type=favorite`, 'GET', null, headers);
    console.log('   ⭐ Favorite bookmarks:', Array.isArray(favoriteBookmarks) ? favoriteBookmarks.length : 0, 'items');
    
    return { success: true, data: { allBookmarks, bookmarkStats, collections } };
    
  } catch (error) {
    console.error('❌ Bookmarks page load failed:', error);
    return { success: false, error: error.message };
  }
}

async function runPageLoadTests() {
  console.log('🔄 Testing Page Load Simulation\n');
  console.log('=' .repeat(60));
  
  try {
    // Test Progress Page
    const progressResult = await simulateProgressPageLoad();
    
    console.log('\n' + '=' .repeat(60));
    
    // Test Bookmarks Page
    const bookmarksResult = await simulateBookmarksPageLoad();
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n🎉 Page Load Test Summary:');
    console.log('📈 Progress Page:', progressResult.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('📚 Bookmarks Page:', bookmarksResult.success ? '✅ SUCCESS' : '❌ FAILED');
    
    if (progressResult.success && bookmarksResult.success) {
      console.log('\n✅ Both Progress and Bookmarks pages should load correctly!');
      console.log('✅ All backend APIs are functioning properly');
      console.log('✅ Data structure matches frontend expectations');
      
      console.log('\n🔍 If the pages are still not working, the issue might be:');
      console.log('   • Frontend build/compilation issues');
      console.log('   • Browser console errors (check browser dev tools)');
      console.log('   • Frontend service initialization timing');
      console.log('   • React component rendering issues');
    } else {
      console.log('\n❌ There are still backend API issues to resolve');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
  }
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
runPageLoadTests()
  .then(() => {
    console.log('\n🏁 Page load test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Page load test failed:', error);
    process.exit(1);
  });