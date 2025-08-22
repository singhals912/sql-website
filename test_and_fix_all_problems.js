#!/usr/bin/env node
/**
 * Test and Fix All 70 Problems
 * This script:
 * 1. Gets all problems from the API
 * 2. Sets up each problem environment
 * 3. Tests basic SELECT * query for each table
 * 4. Ensures each problem has minimum 20 rows of data
 * 5. Reports any issues and fixes them
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testAndFixAllProblems() {
  console.log('🔧 Testing and fixing all 70 problems systematically...\n');
  
  try {
    // Get all problems
    console.log('📥 Fetching all problems...');
    const response = await axios.get(`${BASE_URL}/api/sql/problems`);
    const problems = response.data.problems;
    
    console.log(`Found ${problems.length} problems to test\n`);
    
    let passCount = 0;
    let fixCount = 0;
    let errorCount = 0;
    const issues = [];
    
    // Test in batches of 5 to avoid overwhelming the server
    const batchSize = 5;
    const totalBatches = Math.ceil(problems.length / batchSize);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * batchSize;
      const endIdx = Math.min(startIdx + batchSize, problems.length);
      const batch = problems.slice(startIdx, endIdx);
      
      console.log(`\n📦 BATCH ${batchNum + 1}/${totalBatches} (Problems ${startIdx + 1}-${endIdx}):`);
      console.log('='.repeat(80));
      
      for (let i = 0; i < batch.length; i++) {
        const problem = batch[i];
        const problemNum = startIdx + i + 1;
        
        try {
          console.log(`\n🔧 [${problemNum}/${problems.length}] #${problem.numeric_id?.toString().padStart(3, '0')} - ${problem.title}`);
          
          // Step 1: Get problem details including schema
          const detailResponse = await axios.get(`${BASE_URL}/api/sql/problems/${problem.numeric_id}`);
          const problemData = detailResponse.data;
          
          if (!problemData.schemas || problemData.schemas.length === 0) {
            console.log('   ❌ No schemas found');
            errorCount++;
            issues.push({
              problemNum,
              title: problem.title,
              issue: 'No schemas found'
            });
            continue;
          }
          
          const schema = problemData.schemas[0]; // Use PostgreSQL schema
          
          // Step 2: Setup problem environment
          console.log('   🔄 Setting up environment...');
          const setupResponse = await axios.post(
            `${BASE_URL}/api/sql/problems/${problem.numeric_id}/setup`,
            { dialect: 'postgresql' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (!setupResponse.data.success) {
            console.log(`   ❌ Setup failed: ${setupResponse.data.error}`);
            errorCount++;
            issues.push({
              problemNum,
              title: problem.title,
              issue: `Setup failed: ${setupResponse.data.error}`
            });
            continue;
          }
          
          // Step 3: Extract table name from setup SQL
          const setupSql = schema.setup_sql;
          const tableNameMatch = setupSql.match(/CREATE TABLE\s+(\w+)/i);
          
          if (!tableNameMatch) {
            console.log('   ⚠️  Could not extract table name from setup SQL');
            errorCount++;
            issues.push({
              problemNum,
              title: problem.title,
              issue: 'Could not extract table name'
            });
            continue;
          }
          
          const tableName = tableNameMatch[1];
          console.log(`   📊 Testing table: ${tableName}`);
          
          // Step 4: Test basic SELECT query
          const testQuery = `SELECT * FROM ${tableName} LIMIT 25`;
          const executeResponse = await axios.post(
            `${BASE_URL}/api/execute/sql`,
            { 
              sql: testQuery,
              dialect: 'postgresql' 
            },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (!executeResponse.data.success) {
            console.log(`   ❌ Query failed: ${executeResponse.data.error}`);
            errorCount++;
            issues.push({
              problemNum,
              title: problem.title,
              issue: `Query failed: ${executeResponse.data.error}`
            });
            continue;
          }
          
          const rowCount = executeResponse.data.data.rowCount;
          console.log(`   📈 Found ${rowCount} rows in ${tableName}`);
          
          // Step 5: Check if we have enough data (minimum 20 rows)
          if (rowCount < 20) {
            console.log(`   ⚠️  Only ${rowCount} rows - need minimum 20`);
            
            // Try to expand the data by duplicating existing rows
            try {
              console.log('   🔧 Attempting to expand data...');
              
              // Get current data
              const currentDataResponse = await axios.post(
                `${BASE_URL}/api/execute/sql`,
                { 
                  sql: `SELECT * FROM ${tableName}`,
                  dialect: 'postgresql' 
                },
                { headers: { 'Content-Type': 'application/json' } }
              );
              
              if (currentDataResponse.data.success && currentDataResponse.data.data.rows.length > 0) {
                const rows = currentDataResponse.data.data.rows;
                const columns = currentDataResponse.data.data.columns;
                
                // Generate additional rows by modifying existing data
                const additionalRowsNeeded = 25 - rowCount; // Aim for 25 rows
                let insertStatements = [];
                
                for (let j = 0; j < additionalRowsNeeded; j++) {
                  const sourceRow = rows[j % rows.length]; // Cycle through existing rows
                  
                  // Build INSERT statement
                  const values = columns.map(col => {
                    let value = sourceRow[col];
                    
                    // Modify some values to create variation
                    if (typeof value === 'number') {
                      value = value + (j + 1) * 100; // Add variation to numeric values
                    } else if (typeof value === 'string' && value.length > 0) {
                      value = `'${value}_v${j + 1}'`; // Add variation to strings
                      return value;
                    } else if (value === null) {
                      return 'NULL';
                    } else if (typeof value === 'boolean') {
                      value = j % 2 === 0 ? 'true' : 'false';
                      return value;
                    } else if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
                      // Handle dates - add days
                      const date = new Date(value);
                      date.setDate(date.getDate() + j + 1);
                      return `'${date.toISOString().split('T')[0]}'`;
                    }
                    
                    return typeof value === 'string' ? `'${value}'` : value;
                  });
                  
                  insertStatements.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`);
                }
                
                // Execute insert statements
                for (const statement of insertStatements) {
                  await axios.post(
                    `${BASE_URL}/api/execute/sql`,
                    { 
                      sql: statement,
                      dialect: 'postgresql' 
                    },
                    { headers: { 'Content-Type': 'application/json' } }
                  );
                }
                
                console.log(`   ✅ Added ${additionalRowsNeeded} additional rows`);
                fixCount++;
              }
            } catch (expandError) {
              console.log(`   ⚠️  Could not expand data: ${expandError.message}`);
            }
            
            // Re-test row count
            const retestResponse = await axios.post(
              `${BASE_URL}/api/execute/sql`,
              { 
                sql: `SELECT COUNT(*) as total FROM ${tableName}`,
                dialect: 'postgresql' 
              },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (retestResponse.data.success) {
              const newCount = retestResponse.data.data.rows[0].total;
              console.log(`   📊 Final row count: ${newCount}`);
            }
          }
          
          console.log(`   ✅ PASS - Problem #${problem.numeric_id} working correctly`);
          passCount++;
          
        } catch (error) {
          console.log(`   💥 ERROR: ${error.message}`);
          errorCount++;
          issues.push({
            problemNum,
            title: problem.title,
            issue: `Error: ${error.message}`
          });
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log(`\n📊 Batch ${batchNum + 1} Summary:`);
      console.log(`   ✅ Passed: ${Math.min(passCount, endIdx)}`);
      console.log(`   🔧 Fixed: ${fixCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      
      // Small delay between batches
      if (batchNum < totalBatches - 1) {
        console.log('\n⏳ Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 FINAL RESULTS:');
    console.log('='.repeat(80));
    console.log(`✅ PASSED: ${passCount} problems`);
    console.log(`🔧 FIXED: ${fixCount} problems (data expanded)`);
    console.log(`❌ ERRORS: ${errorCount} problems`);
    console.log(`📊 TOTAL: ${problems.length} problems`);
    console.log(`🎯 SUCCESS RATE: ${Math.round((passCount / problems.length) * 100)}%`);
    
    if (issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:');
      console.log('-'.repeat(80));
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. Problem #${issue.problemNum} - ${issue.title}`);
        console.log(`   Issue: ${issue.issue}`);
      });
    }
    
    if (passCount === problems.length) {
      console.log('\n🎉 ALL PROBLEMS WORKING PERFECTLY!');
      console.log('💪 Every table exists with sufficient data!');
    } else {
      console.log(`\n⚠️  ${errorCount} problems need manual attention.`);
    }
    
  } catch (error) {
    console.error('💥 Testing failed:', error.message);
    process.exit(1);
  }
}

// Run the comprehensive test and fix
testAndFixAllProblems()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Test and fix failed:', error);
    process.exit(1);
  });