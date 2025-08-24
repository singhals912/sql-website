const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function systematicQualityCheck() {
  console.log('🔍 SYSTEMATIC QUALITY CHECK - ALL 100 PROBLEMS');
  console.log('=' .repeat(80));
  
  try {
    const result = await pool.query(`
      SELECT 
        p.numeric_id, 
        p.title, 
        p.description,
        p.difficulty
      FROM problems p 
      WHERE p.is_active = true 
      ORDER BY p.numeric_id ASC
    `);
    
    console.log(`📊 Analyzing ${result.rows.length} problems...\n`);
    
    const needsFixing = [];
    const highQuality = [];
    
    result.rows.forEach(problem => {
      const hasBusinessContext = problem.description.includes('Business Context');
      const hasScenario = problem.description.includes('Scenario'); 
      const hasProblemSection = problem.description.includes('Problem');
      const hasExpectedOutput = problem.description.includes('Expected Output');
      const hasProperLength = problem.description.length > 200;
      
      const qualityScore = [
        hasBusinessContext,
        hasScenario,
        hasProblemSection, 
        hasExpectedOutput,
        hasProperLength
      ].filter(Boolean).length;
      
      if (qualityScore >= 4) {
        highQuality.push({
          id: problem.numeric_id,
          title: problem.title,
          score: qualityScore
        });
      } else {
        needsFixing.push({
          id: problem.numeric_id,
          title: problem.title,
          score: qualityScore,
          issues: [
            !hasBusinessContext && 'No Business Context',
            !hasScenario && 'No Scenario',
            !hasProblemSection && 'No Problem Statement',
            !hasExpectedOutput && 'No Expected Output',
            !hasProperLength && 'Too Short'
          ].filter(Boolean)
        });
      }
    });
    
    console.log(`✅ HIGH QUALITY PROBLEMS (${highQuality.length}):`);
    highQuality.forEach(p => {
      console.log(`   #${p.id.toString().padStart(3, '0')}: ${p.title} (${p.score}/5)`);
    });
    
    console.log(`\n❌ PROBLEMS NEEDING FIXES (${needsFixing.length}):`);
    needsFixing.forEach(p => {
      console.log(`   #${p.id.toString().padStart(3, '0')}: ${p.title} (${p.score}/5)`);
      p.issues.forEach(issue => {
        console.log(`      • ${issue}`);
      });
    });
    
    // Group by difficulty for systematic fixing
    console.log(`\n📋 PROBLEMS NEEDING FIXES BY DIFFICULTY:`);
    const easyFixes = needsFixing.filter(p => p.id <= 33);
    const mediumFixes = needsFixing.filter(p => p.id >= 34 && p.id <= 66);
    const hardFixes = needsFixing.filter(p => p.id >= 67);
    
    console.log(`   EASY (${easyFixes.length}): ${easyFixes.map(p => `#${p.id}`).join(', ')}`);
    console.log(`   MEDIUM (${mediumFixes.length}): ${mediumFixes.map(p => `#${p.id}`).join(', ')}`);  
    console.log(`   HARD (${hardFixes.length}): ${hardFixes.map(p => `#${p.id}`).join(', ')}`);
    
    console.log(`\n🎯 SUMMARY:`);
    console.log(`   High Quality: ${highQuality.length}/100 (${Math.round(highQuality.length)}%)`);
    console.log(`   Need Fixes: ${needsFixing.length}/100 (${Math.round(needsFixing.length)}%)`);
    console.log(`   Success Rate: ${Math.round((highQuality.length/100)*100)}%`);
    
    if (needsFixing.length > 0) {
      console.log(`\n🔧 NEXT STEPS:`);
      console.log(`   1. Create batch fixes for ${needsFixing.length} problems`);
      console.log(`   2. Focus on systematic Fortune 100 business contexts`);
      console.log(`   3. Target: Achieve 90%+ high quality rate`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

systematicQualityCheck().catch(console.error);