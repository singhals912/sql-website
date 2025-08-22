#!/usr/bin/env node
/**
 * Reset and Populate All 70 Problem Schemas with Data
 * This script drops existing tables and recreates them with proper data
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function resetAndPopulateAll() {
  console.log('🔄 Resetting and populating all 70 problem schemas with data...\n');
  
  try {
    // Step 1: Drop all existing tables in the sandbox database
    console.log('🗑️  Dropping all existing tables...');
    
    const dropResponse = await axios.post(
      `${BASE_URL}/api/execute/sql`,
      { 
        sql: `
          DO $$ 
          DECLARE
              r RECORD;
          BEGIN
              FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                  EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
              END LOOP;
          END $$;
        `,
        dialect: 'postgresql' 
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (dropResponse.data.success) {
      console.log('✅ All existing tables dropped successfully\n');
    } else {
      console.log('⚠️  Warning: Could not drop all tables:', dropResponse.data.error);
    }
    
    // Step 2: Get all problems
    console.log('📥 Fetching all problems...');
    const response = await axios.get(`${BASE_URL}/api/sql/problems`);
    const problems = response.data.problems;
    
    console.log(`✅ Found ${problems.length} problems\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Step 3: Setup each problem fresh
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
    
    console.log('\n📊 Reset and Population Complete!');
    console.log(`✅ Successful: ${successCount} problems`);
    console.log(`❌ Failed: ${failCount} problems`);
    
    if (successCount > 0) {
      console.log('\n🎉 Database reset complete!');
      console.log('💡 All working problems now have fresh tables with data');
      console.log('🚀 Try running queries - they should now return data!');
      
      // Test a few queries
      console.log('\n🧪 Testing sample queries...');
      const testQueries = [
        'SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = \'public\'',
        'SELECT * FROM corporate_risk_profiles LIMIT 1',
        'SELECT * FROM trading_positions LIMIT 1'
      ];
      
      for (const sql of testQueries) {
        try {
          const testResponse = await axios.post(
            `${BASE_URL}/api/execute/sql`,
            { sql, dialect: 'postgresql' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (testResponse.data.success) {
            console.log(`✅ "${sql}" -> ${testResponse.data.data.rowCount} rows`);
          } else {
            console.log(`❌ "${sql}" -> ${testResponse.data.error}`);
          }
        } catch (error) {
          console.log(`❌ "${sql}" -> Error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Reset failed:', error.message);
    process.exit(1);
  }
}

// Run the reset
resetAndPopulateAll()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  });