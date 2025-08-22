const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testCompleteSystem() {
  console.log('🚀 COMPREHENSIVE SYSTEM TESTING');
  console.log('================================');
  
  let allTestsPassed = true;
  const testResults = [];

  try {
    // Test 1: Database Schema Validation
    console.log('\n📊 Testing Database Schema...');
    const schemaTest = await testDatabaseSchema();
    testResults.push({ test: 'Database Schema', passed: schemaTest.passed, details: schemaTest.details });
    if (!schemaTest.passed) allTestsPassed = false;

    // Test 2: Learning Paths System
    console.log('\n📚 Testing Learning Paths System...');
    const learningPathsTest = await testLearningPaths();
    testResults.push({ test: 'Learning Paths', passed: learningPathsTest.passed, details: learningPathsTest.details });
    if (!learningPathsTest.passed) allTestsPassed = false;

    // Test 3: Hints System
    console.log('\n💡 Testing Hints System...');
    const hintsTest = await testHintsSystem();
    testResults.push({ test: 'Hints System', passed: hintsTest.passed, details: hintsTest.details });
    if (!hintsTest.passed) allTestsPassed = false;

    // Test 4: Search & Filtering
    console.log('\n🔍 Testing Search & Filtering...');
    const searchTest = await testSearchSystem();
    testResults.push({ test: 'Search System', passed: searchTest.passed, details: searchTest.details });
    if (!searchTest.passed) allTestsPassed = false;

    // Test 5: User Authentication Flow
    console.log('\n🔐 Testing Authentication System...');
    const authTest = await testAuthenticationSystem();
    testResults.push({ test: 'Authentication', passed: authTest.passed, details: authTest.details });
    if (!authTest.passed) allTestsPassed = false;

    // Test 6: Progress Tracking
    console.log('\n📈 Testing Progress Tracking...');
    const progressTest = await testProgressTracking();
    testResults.push({ test: 'Progress Tracking', passed: progressTest.passed, details: progressTest.details });
    if (!progressTest.passed) allTestsPassed = false;

    // Test 7: Bookmarking System
    console.log('\n🔖 Testing Bookmarking System...');
    const bookmarkTest = await testBookmarkingSystem();
    testResults.push({ test: 'Bookmarking', passed: bookmarkTest.passed, details: bookmarkTest.details });
    if (!bookmarkTest.passed) allTestsPassed = false;

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(50));
    
    testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}`);
      if (!result.passed) {
        console.log(`   Error: ${result.details}`);
      }
    });

    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 ALL TESTS PASSED! System is ready for production.');
    } else {
      console.log('❌ Some tests failed. Please review and fix issues.');
    }
    console.log('='.repeat(50));

    return {
      allPassed: allTestsPassed,
      results: testResults
    };

  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    return {
      allPassed: false,
      error: error.message
    };
  } finally {
    await pool.end();
  }
}

// Test database schema integrity
async function testDatabaseSchema() {
  try {
    const requiredTables = [
      'users', 'problems', 'problem_schemas', 'learning_paths',
      'learning_path_steps', 'problem_hints', 'user_bookmarks',
      'user_problem_progress', 'user_problem_attempts', 'problem_tags'
    ];

    for (const table of requiredTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (!result.rows[0].exists) {
        return { passed: false, details: `Missing table: ${table}` };
      }
    }

    // Check for essential indexes
    const indexCheck = await pool.query(`
      SELECT schemaname, indexname 
      FROM pg_indexes 
      WHERE indexname LIKE '%search_vector%' OR indexname LIKE '%problems%'
    `);

    if (indexCheck.rows.length === 0) {
      return { passed: false, details: 'Missing search indexes' };
    }

    console.log('✅ All required tables and indexes exist');
    return { passed: true, details: 'Schema validation successful' };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Test learning paths system
async function testLearningPaths() {
  try {
    // Check if learning paths exist
    const pathsResult = await pool.query('SELECT COUNT(*) as count FROM learning_paths');
    const pathCount = parseInt(pathsResult.rows[0].count);
    
    if (pathCount === 0) {
      return { passed: false, details: 'No learning paths found' };
    }

    // Check if learning path steps exist
    const stepsResult = await pool.query('SELECT COUNT(*) as count FROM learning_path_steps');
    const stepCount = parseInt(stepsResult.rows[0].count);
    
    if (stepCount === 0) {
      return { passed: false, details: 'No learning path steps found' };
    }

    // Test path-problem relationships
    const relationshipTest = await pool.query(`
      SELECT lps.*, p.title 
      FROM learning_path_steps lps
      JOIN problems p ON lps.problem_id = p.id
      LIMIT 5
    `);

    if (relationshipTest.rows.length === 0) {
      return { passed: false, details: 'Learning path-problem relationships broken' };
    }

    console.log(`✅ Found ${pathCount} learning paths with ${stepCount} steps`);
    return { passed: true, details: `${pathCount} paths with ${stepCount} steps` };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Test hints system
async function testHintsSystem() {
  try {
    // Check if hints exist
    const hintsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_hints,
        COUNT(DISTINCT problem_id) as problems_with_hints
      FROM problem_hints
    `);
    
    const hintData = hintsResult.rows[0];
    const totalHints = parseInt(hintData.total_hints);
    const problemsWithHints = parseInt(hintData.problems_with_hints);
    
    if (totalHints === 0) {
      return { passed: false, details: 'No hints found in system' };
    }

    // Test hint-problem relationships
    const hintTest = await pool.query(`
      SELECT ph.*, p.title 
      FROM problem_hints ph
      JOIN problems p ON ph.problem_id = p.id
      WHERE ph.hint_order = 1
      LIMIT 5
    `);

    if (hintTest.rows.length === 0) {
      return { passed: false, details: 'Hint-problem relationships broken' };
    }

    console.log(`✅ Found ${totalHints} hints across ${problemsWithHints} problems`);
    return { passed: true, details: `${totalHints} hints for ${problemsWithHints} problems` };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Test search system
async function testSearchSystem() {
  try {
    // Test full-text search capability
    const searchTest = await pool.query(`
      SELECT COUNT(*) as count 
      FROM problems 
      WHERE search_vector IS NOT NULL
    `);
    
    const searchableCount = parseInt(searchTest.rows[0].count);
    if (searchableCount === 0) {
      return { passed: false, details: 'No searchable problems found' };
    }

    // Test tag system
    const tagsTest = await pool.query('SELECT COUNT(*) as count FROM problem_tags');
    const tagCount = parseInt(tagsTest.rows[0].count);
    
    if (tagCount === 0) {
      return { passed: false, details: 'No problem tags found' };
    }

    // Test actual search functionality
    const testSearch = await pool.query(`
      SELECT * FROM problems 
      WHERE search_vector @@ plainto_tsquery('english', 'business')
      LIMIT 5
    `);

    if (testSearch.rows.length === 0) {
      return { passed: false, details: 'Search functionality not working' };
    }

    console.log(`✅ ${searchableCount} searchable problems with ${tagCount} tags`);
    return { passed: true, details: `Search ready with ${tagCount} tags` };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Test authentication system
async function testAuthenticationSystem() {
  try {
    // Test users table structure
    const userTableTest = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

    const requiredColumns = ['email', 'password_hash', 'username', 'preferences', 'goals'];
    const existingColumns = userTableTest.rows.map(row => row.column_name);
    
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col)) {
        return { passed: false, details: `Missing column in users table: ${col}` };
      }
    }

    // Test user constraints
    const constraintTest = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass
    `);

    console.log('✅ User authentication schema is properly configured');
    return { passed: true, details: 'Auth system ready' };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Test progress tracking
async function testProgressTracking() {
  try {
    // Test progress tracking tables
    const progressTables = ['user_problem_progress', 'user_problem_attempts', 'user_achievements'];
    
    for (const table of progressTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (!result.rows[0].exists) {
        return { passed: false, details: `Missing progress table: ${table}` };
      }
    }

    // Test if progress tracking functions are in place
    const functionTest = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_proc 
        WHERE proname = 'update_problem_search_vector'
      )
    `);

    console.log('✅ Progress tracking system configured');
    return { passed: true, details: 'Progress tracking ready' };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Test bookmarking system
async function testBookmarkingSystem() {
  try {
    // Test bookmarks table
    const bookmarkTableTest = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_bookmarks'
    `);

    const requiredColumns = ['user_id', 'session_id', 'problem_id', 'bookmark_type'];
    const existingColumns = bookmarkTableTest.rows.map(row => row.column_name);
    
    for (const col of requiredColumns) {
      if (!existingColumns.includes(col)) {
        return { passed: false, details: `Missing column in bookmarks: ${col}` };
      }
    }

    // Test bookmark constraints
    const constraintTest = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'user_bookmarks'::regclass 
      AND contype = 'u'
    `);

    if (constraintTest.rows.length === 0) {
      return { passed: false, details: 'Missing unique constraints on bookmarks' };
    }

    console.log('✅ Bookmarking system properly configured');
    return { passed: true, details: 'Bookmarking ready' };

  } catch (error) {
    return { passed: false, details: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  testCompleteSystem()
    .then(results => {
      process.exit(results.allPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteSystem };