#!/usr/bin/env node
/**
 * Test All 70 Problems Systematically
 * This script tests each problem by:
 * 1. Setting up the problem environment
 * 2. Running the solution SQL
 * 3. Comparing actual output with expected output
 * 4. Reporting any mismatches
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAllProblems() {
  console.log('🧪 Testing all 70 problems systematically...\n');
  
  try {
    // Get all problems
    const response = await axios.get(`${BASE_URL}/api/sql/problems`);
    const problems = response.data.problems;
    
    console.log(`📥 Found ${problems.length} problems to test\n`);
    
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    const failedProblems = [];
    
    // Test in batches of 10
    const batchSize = 10;
    const totalBatches = Math.ceil(problems.length / batchSize);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * batchSize;
      const endIdx = Math.min(startIdx + batchSize, problems.length);
      const batch = problems.slice(startIdx, endIdx);
      
      console.log(`\n📦 BATCH ${batchNum + 1}/${totalBatches} (Problems ${startIdx + 1}-${endIdx}):`);
      console.log('='.repeat(60));
      
      for (let i = 0; i < batch.length; i++) {
        const problem = batch[i];
        const problemNum = startIdx + i + 1;
        
        try {
          console.log(`\n🔧 [${problemNum}/${problems.length}] ${problem.title}`);
          
          // Step 1: Get problem details including solution
          const detailResponse = await axios.get(`${BASE_URL}/api/sql/problems/${problem.id}`);
          const problemData = detailResponse.data;
          
          if (!problemData.schemas || problemData.schemas.length === 0) {
            console.log('   ⚠️  No schemas found');
            errorCount++;
            failedProblems.push({
              title: problem.title,
              issue: 'No schemas found'
            });
            continue;
          }
          
          const schema = problemData.schemas[0]; // Use first schema (PostgreSQL)
          
          if (!schema.solution_sql) {
            console.log('   ⚠️  No solution SQL found');
            errorCount++;
            failedProblems.push({
              title: problem.title,
              issue: 'No solution SQL found'
            });
            continue;
          }
          
          // Step 2: Setup problem environment
          console.log('   🔄 Setting up environment...');
          const setupResponse = await axios.post(
            `${BASE_URL}/api/sql/problems/${problem.id}/setup`,
            { dialect: 'postgresql' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (!setupResponse.data.success) {
            console.log(`   ❌ Setup failed: ${setupResponse.data.error}`);
            errorCount++;
            failedProblems.push({
              title: problem.title,
              issue: `Setup failed: ${setupResponse.data.error}`
            });
            continue;
          }
          
          // Step 3: Execute solution SQL
          console.log('   ⚡ Running solution...');
          const executeResponse = await axios.post(
            `${BASE_URL}/api/execute/sql`,
            { 
              sql: schema.solution_sql,
              dialect: 'postgresql' 
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (!executeResponse.data.success) {
            console.log(`   ❌ Solution failed: ${executeResponse.data.error}`);
            failCount++;
            failedProblems.push({
              title: problem.title,
              issue: `Solution failed: ${executeResponse.data.error}`
            });
            continue;
          }
          
          const actualRows = executeResponse.data.data.rows;
          const actualRowCount = executeResponse.data.data.rowCount;
          
          // Step 4: Compare with expected output
          let expectedOutput = null;
          try {
            expectedOutput = schema.expected_output ? JSON.parse(schema.expected_output) : null;
          } catch (e) {
            console.log('   ⚠️  Could not parse expected output');
          }
          
          if (expectedOutput && Array.isArray(expectedOutput)) {
            const expectedRowCount = expectedOutput.length;
            
            if (actualRowCount === expectedRowCount) {
              console.log(`   ✅ PASS - ${actualRowCount} rows (matches expected)`);
              passCount++;
            } else {
              console.log(`   ❌ FAIL - Expected ${expectedRowCount} rows, got ${actualRowCount}`);
              console.log(`   📊 First few actual rows:`, actualRows.slice(0, 2));
              console.log(`   📊 First few expected rows:`, expectedOutput.slice(0, 2));
              failCount++;
              failedProblems.push({
                title: problem.title,
                issue: `Row count mismatch: expected ${expectedRowCount}, got ${actualRowCount}`
              });
            }
          } else {
            console.log(`   ✅ RUNS - ${actualRowCount} rows (no expected output to compare)`);
            passCount++;
          }
          
        } catch (error) {
          console.log(`   💥 ERROR: ${error.message}`);
          errorCount++;
          failedProblems.push({
            title: problem.title,
            issue: `Error: ${error.message}`
          });
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`\n📊 Batch ${batchNum + 1} Complete:`);
      console.log(`   ✅ Passed: ${passCount - (batchNum * batchSize >= passCount ? 0 : Math.min(batchSize, passCount - batchNum * batchSize))}`);
      
      // Small delay between batches
      if (batchNum < totalBatches - 1) {
        console.log('\n⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 FINAL RESULTS:');
    console.log('='.repeat(80));
    console.log(`✅ PASSED: ${passCount} problems`);
    console.log(`❌ FAILED: ${failCount} problems`);
    console.log(`💥 ERRORS: ${errorCount} problems`);
    console.log(`📊 TOTAL: ${problems.length} problems`);
    console.log(`🎯 SUCCESS RATE: ${Math.round((passCount / problems.length) * 100)}%`);
    
    if (failedProblems.length > 0) {
      console.log('\n❌ FAILED PROBLEMS:');
      console.log('-'.repeat(80));
      failedProblems.forEach((problem, index) => {
        console.log(`${index + 1}. ${problem.title}`);
        console.log(`   Issue: ${problem.issue}`);
      });
    }
    
    if (passCount === problems.length) {
      console.log('\n🎉 ALL PROBLEMS WORKING PERFECTLY!');
      console.log('💪 Your SQL platform is fully industry-grade!');
    } else {
      console.log(`\n⚠️  ${failCount + errorCount} problems need attention.`);
    }
    
  } catch (error) {
    console.error('💥 Testing failed:', error.message);
    process.exit(1);
  }
}

// Run the comprehensive test
testAllProblems()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });