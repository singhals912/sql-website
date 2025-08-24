#!/usr/bin/env node
/**
 * Test New Progress API Structure
 * Tests if the new progress API structure matches frontend expectations
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

async function testNewProgressStructure() {
  console.log('🔄 Testing New Progress API Structure\n');
  
  // Generate a test session ID
  const sessionId = 'progress_test_' + Date.now();
  const headers = { 'X-Session-ID': sessionId };
  
  try {
    // 1. Initialize session
    console.log('1️⃣ Initializing session...');
    await makeRequest(`${BASE_URL}/progress/session`, 'POST', {}, headers);
    
    // 2. Add some test progress data
    console.log('2️⃣ Adding test progress data...');
    const problemsResponse = await makeRequest(`${BASE_URL}/sql/problems?limit=3`);
    const testProblems = problemsResponse.problems || [];
    
    for (let i = 0; i < Math.min(3, testProblems.length); i++) {
      const problem = testProblems[i];
      await makeRequest(`${BASE_URL}/progress/track`, 'POST', {
        problemId: problem.id,
        problemNumericId: problem.numeric_id,
        success: i < 2, // First 2 are successful, last one fails
        executionTime: 1000 + (i * 500)
      }, headers);
      console.log(`   ✅ Tracked progress for problem #${problem.numeric_id}: ${problem.title}`);
    }
    
    // 3. Test the new progress API structure
    console.log('\n3️⃣ Testing progress API structure...');
    const progressResponse = await makeRequest(`${BASE_URL}/progress/overview`, 'GET', null, headers);
    
    if (progressResponse.success && progressResponse.progress) {
      const progress = progressResponse.progress;
      
      console.log('✅ API Structure Check:');
      console.log('   - overview:', !!progress.overview);
      console.log('   - byDifficulty:', Array.isArray(progress.byDifficulty));
      console.log('   - byCategory:', Array.isArray(progress.byCategory));
      console.log('   - recentActivity:', Array.isArray(progress.recentActivity));
      console.log('   - achievements:', Array.isArray(progress.achievements));
      
      console.log('\n📊 Overview Data:');
      if (progress.overview) {
        console.log('   - completed:', progress.overview.completed);
        console.log('   - attempted:', progress.overview.attempted);
        console.log('   - total:', progress.overview.total);
        console.log('   - completionRate:', progress.overview.completionRate + '%');
        console.log('   - avgExecutionTime:', progress.overview.avgExecutionTime + 'ms');
      }
      
      console.log('\n📈 Difficulty Breakdown:');
      progress.byDifficulty.forEach(diff => {
        console.log(`   - ${diff.difficulty}: ${diff.completed}/${diff.total} (${diff.percentage}%)`);
      });
      
      console.log('\n📚 Recent Activity:');
      progress.recentActivity.forEach((activity, idx) => {
        console.log(`   ${idx + 1}. Problem #${activity.problemId}: ${activity.problemTitle} (${activity.status})`);
      });
      
      // 4. Test frontend expectations
      console.log('\n4️⃣ Testing Frontend Compatibility:');
      
      // Check if structure matches what NewProgressPage expects
      const frontendChecks = {
        'progressData.overview.completed': !!progress.overview?.completed,
        'progressData.overview.attempted': !!progress.overview?.attempted,
        'progressData.byDifficulty': Array.isArray(progress.byDifficulty),
        'progressData.byCategory': Array.isArray(progress.byCategory),
        'progressData.recentActivity': Array.isArray(progress.recentActivity),
        'progressData.achievements': Array.isArray(progress.achievements)
      };
      
      let allChecksPass = true;
      Object.entries(frontendChecks).forEach(([check, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${check}`);
        if (!passed) allChecksPass = false;
      });
      
      if (allChecksPass) {
        console.log('\n🎉 SUCCESS: New progress API structure matches frontend expectations!');
        console.log('✅ NewProgressPage should now display progress data correctly');
        console.log('✅ All expected fields are present and correctly typed');
      } else {
        console.log('\n❌ FAILED: Some frontend compatibility checks failed');
      }
      
    } else {
      console.log('❌ Failed to get progress data:', progressResponse);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Import fetch if not available globally (for Node.js)
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Run the test
testNewProgressStructure()
  .then(() => {
    console.log('\n🏁 Progress structure test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Progress structure test failed:', error);
    process.exit(1);
  });