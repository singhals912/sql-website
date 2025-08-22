#!/usr/bin/env node
/**
 * Validation Testing Framework
 * Tests all problems to ensure validation works correctly
 */

const ValidationService = require('../services/validationService');
require('dotenv').config();

async function runValidationTests() {
  console.log('🧪 Starting comprehensive validation tests...\n');
  
  const validationService = new ValidationService();
  
  try {
    // Test 1: Auto-generate all expected outputs
    console.log('📝 Step 1: Auto-generating expected outputs...');
    await validationService.updateAllExpectedOutputs();
    console.log('✅ All expected outputs updated\n');
    
    // Test 2: Test all canonical solutions
    console.log('🎯 Step 2: Testing all canonical solutions...');
    const results = await validationService.testAllProblems();
    
    console.log('\n📊 VALIDATION TEST RESULTS:');
    console.log('═'.repeat(60));
    
    let passCount = 0;
    let failCount = 0;
    let errorCount = 0;
    
    results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : 
                    result.status === 'FAIL' ? '❌' : '🔥';
      
      console.log(`${status} ${result.title}`);
      
      if (result.status !== 'PASS') {
        console.log(`   ${result.message}`);
      }
      
      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else errorCount++;
    });
    
    console.log('═'.repeat(60));
    console.log(`✅ PASSED: ${passCount}`);
    console.log(`❌ FAILED: ${failCount}`);
    console.log(`🔥 ERRORS: ${errorCount}`);
    console.log(`📊 TOTAL:  ${results.length}`);
    
    if (failCount === 0 && errorCount === 0) {
      console.log('\n🎉 ALL VALIDATIONS PASSING! System is ready for production.');
    } else {
      console.log('\n⚠️  Some issues found. Please review and fix before deployment.');
    }
    
  } catch (error) {
    console.error('💥 Test framework error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  runValidationTests();
}

module.exports = runValidationTests;