#!/usr/bin/env node
/**
 * Auto-Setup All 70 Problem Schemas
 * This script sets up all problem environments automatically
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function setupAllProblems() {
  console.log('🚀 Setting up all 70 problem schemas...\n');
  
  try {
    // Get all problems
    console.log('📥 Fetching all problems...');
    const response = await axios.get(`${BASE_URL}/api/sql/problems`);
    const problems = response.data.problems;
    
    console.log(`✅ Found ${problems.length} problems\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Setup each problem
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      const progress = `${i + 1}/${problems.length}`;
      
      try {
        console.log(`🔧 [${progress}] Setting up: ${problem.title}`);
        
        const setupResponse = await axios.post(
          `${BASE_URL}/api/sql/problems/${problem.id}/setup`,
          { dialect: 'postgresql' },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (setupResponse.data.success) {
          console.log(`   ✅ Success`);
          successCount++;
        } else {
          console.log(`   ❌ Failed: ${setupResponse.data.error}`);
          failCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.response?.data?.error || error.message}`);
        failCount++;
      }
      
      // Small delay to avoid overwhelming the server
      if (i < problems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n📊 Setup Complete!');
    console.log(`✅ Successful: ${successCount} problems`);
    console.log(`❌ Failed: ${failCount} problems`);
    
    if (successCount > 0) {
      console.log('\n🎉 Your SQL platform is ready!');
      console.log('💡 All working problems now have their tables set up');
      console.log('🚀 Go to http://localhost:3000 and try running queries!');
    }
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupAllProblems()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });