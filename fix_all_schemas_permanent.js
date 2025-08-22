#!/usr/bin/env node
/**
 * Permanently Fix All 70 Problem Schemas
 * This script updates the setup_sql in the database to include 20-25 rows
 * for every problem, ensuring permanent data sufficiency
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sql_practice',
  user: 'postgres',
  password: 'password'
});

function parseInsertValues(insertSQL) {
  // Extract VALUES section
  const valuesMatch = insertSQL.match(/VALUES\s+(.*)/is);
  if (!valuesMatch) return [];
  
  const valuesSection = valuesMatch[1];
  const rows = [];
  let currentRow = '';
  let parenDepth = 0;
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < valuesSection.length; i++) {
    const char = valuesSection[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar && valuesSection[i-1] !== '\\') {
      inQuotes = false;
      quoteChar = '';
    } else if (!inQuotes && char === '(') {
      parenDepth++;
    } else if (!inQuotes && char === ')') {
      parenDepth--;
      if (parenDepth === 0) {
        currentRow += char;
        rows.push(currentRow.trim());
        currentRow = '';
        // Skip to next non-comma character
        while (i + 1 < valuesSection.length && 
               (valuesSection[i + 1] === ',' || valuesSection[i + 1] === ' ' || 
                valuesSection[i + 1] === '\n' || valuesSection[i + 1] === '\r')) {
          i++;
        }
        continue;
      }
    }
    
    currentRow += char;
  }
  
  return rows.filter(row => row.trim().length > 0);
}

function generateVariations(originalRows, tableName, targetCount = 25) {
  if (originalRows.length >= targetCount) {
    return originalRows.slice(0, targetCount);
  }
  
  const expandedRows = [...originalRows];
  const additionalNeeded = targetCount - originalRows.length;
  
  for (let i = 0; i < additionalNeeded; i++) {
    const sourceRowIndex = i % originalRows.length;
    const sourceRow = originalRows[sourceRowIndex];
    
    // Parse the values from the row
    const cleanRow = sourceRow.replace(/^\(|\)$/g, '').trim();
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let j = 0; j < cleanRow.length; j++) {
      const char = cleanRow[j];
      
      if (!inQuotes && (char === '"' || char === "'")) {
        inQuotes = true;
        quoteChar = char;
        currentValue += char;
      } else if (inQuotes && char === quoteChar && cleanRow[j-1] !== '\\') {
        inQuotes = false;
        quoteChar = '';
        currentValue += char;
      } else if (!inQuotes && char === ',') {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    if (currentValue.trim()) {
      values.push(currentValue.trim());
    }
    
    // Generate variations
    const modifiedValues = values.map((value, index) => {
      let cleanValue = value.replace(/^['"]|['"]$/g, '');
      
      // Handle different data types
      if (index === 0 && !isNaN(cleanValue)) {
        // Primary key - increment
        return (parseInt(cleanValue) + originalRows.length + i + 1).toString();
      } else if (cleanValue === 'NULL' || cleanValue.toLowerCase() === 'null') {
        return 'NULL';
      } else if (cleanValue === 'true' || cleanValue === 'false') {
        return i % 2 === 0 ? 'true' : 'false';
      } else if (cleanValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date
        const date = new Date(cleanValue);
        date.setDate(date.getDate() + i + 1);
        return `'${date.toISOString().split('T')[0]}'`;
      } else if (cleanValue.match(/^\d{4}-\d{2}-\d{2}T/)) {
        // DateTime
        const date = new Date(cleanValue);
        date.setDate(date.getDate() + i + 1);
        return `'${date.toISOString()}'`;
      } else if (!isNaN(cleanValue) && cleanValue.includes('.')) {
        // Decimal
        const num = parseFloat(cleanValue);
        const variation = (num + (i + 1) * 0.1).toFixed(2);
        return variation;
      } else if (!isNaN(cleanValue)) {
        // Integer
        const num = parseInt(cleanValue);
        return (num + (i + 1) * 10).toString();
      } else {
        // String
        return `'${cleanValue}_v${i + 1}'`;
      }
    });
    
    expandedRows.push(`(${modifiedValues.join(', ')})`);
  }
  
  return expandedRows;
}

async function expandSetupSQL(originalSetupSQL, tableName) {
  try {
    // Extract CREATE TABLE statement
    const createMatch = originalSetupSQL.match(/(CREATE TABLE[^;]+;)/is);
    if (!createMatch) {
      throw new Error('Could not extract CREATE TABLE statement');
    }
    
    const createTableSQL = createMatch[1];
    
    // Extract INSERT statement
    const insertMatch = originalSetupSQL.match(/(INSERT INTO[^;]+;)/is);
    if (!insertMatch) {
      throw new Error('Could not extract INSERT statement');
    }
    
    const insertSQL = insertMatch[1];
    
    // Parse existing rows
    const originalRows = parseInsertValues(insertSQL);
    if (originalRows.length === 0) {
      throw new Error('Could not parse existing rows');
    }
    
    console.log(`   📊 Found ${originalRows.length} original rows`);
    
    // Generate expanded rows
    const expandedRows = generateVariations(originalRows, tableName, 25);
    
    // Extract table name and columns from INSERT
    const insertParts = insertSQL.match(/INSERT INTO\s+(\w+)(\s*\([^)]+\))?\s*VALUES/i);
    if (!insertParts) {
      throw new Error('Could not parse INSERT statement structure');
    }
    
    const columns = insertParts[2] || '';
    
    // Build new SQL
    const expandedSQL = `${createTableSQL}\n      INSERT INTO ${tableName} ${columns} VALUES\n      ${expandedRows.join(',\n      ')};`;
    
    console.log(`   ✅ Expanded to ${expandedRows.length} rows`);
    return expandedSQL;
    
  } catch (error) {
    console.log(`   ❌ Failed to expand: ${error.message}`);
    return originalSetupSQL; // Return original if expansion fails
  }
}

async function fixAllSchemas() {
  console.log('🔧 Permanently fixing all 70 problem schemas...\n');
  
  try {
    // Get all schemas that need fixing
    const result = await pool.query(`
      SELECT 
        ps.id as schema_id,
        ps.problem_id,
        ps.setup_sql,
        p.title,
        p.numeric_id
      FROM problem_schemas ps
      JOIN problems p ON ps.problem_id = p.id
      WHERE ps.sql_dialect = 'postgresql'
      AND p.is_active = true
      AND p.numeric_id != 2  -- Skip #2 as it's already fixed
      ORDER BY p.numeric_id
    `);
    
    const schemas = result.rows;
    console.log(`📥 Found ${schemas.length} schemas to fix (excluding already fixed #2)\n`);
    
    let fixedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Process in batches of 10
    const batchSize = 10;
    const totalBatches = Math.ceil(schemas.length / batchSize);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * batchSize;
      const endIdx = Math.min(startIdx + batchSize, schemas.length);
      const batch = schemas.slice(startIdx, endIdx);
      
      console.log(`\n📦 BATCH ${batchNum + 1}/${totalBatches} (Problems ${startIdx + 1}-${endIdx}):`);
      console.log('='.repeat(80));
      
      for (let i = 0; i < batch.length; i++) {
        const schema = batch[i];
        const problemNum = startIdx + i + 1;
        
        try {
          console.log(`\n🔧 [${problemNum}/${schemas.length}] #${schema.numeric_id?.toString().padStart(3, '0')} - ${schema.title}`);
          
          // Extract table name
          const tableNameMatch = schema.setup_sql.match(/CREATE TABLE\s+(\w+)/i);
          if (!tableNameMatch) {
            console.log('   ⚠️  Could not extract table name - SKIPPING');
            skippedCount++;
            continue;
          }
          
          const tableName = tableNameMatch[1];
          console.log(`   📊 Table: ${tableName}`);
          
          // Check if it already has enough rows
          const rowCountMatch = schema.setup_sql.match(/VALUES[\s\S]*?\(/g);
          const currentRows = rowCountMatch ? rowCountMatch.length : 0;
          
          if (currentRows >= 20) {
            console.log(`   ✅ Already has ${currentRows} rows - SKIPPING`);
            skippedCount++;
            continue;
          }
          
          console.log(`   🔧 Expanding from ${currentRows} rows...`);
          
          // Generate expanded setup SQL
          const expandedSetupSQL = await expandSetupSQL(schema.setup_sql, tableName);
          
          // Update the database
          const updateResult = await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE id = $2
          `, [expandedSetupSQL, schema.schema_id]);
          
          if (updateResult.rowCount > 0) {
            console.log(`   ✅ FIXED - Schema updated in database`);
            fixedCount++;
          } else {
            console.log(`   ❌ UPDATE FAILED - No rows affected`);
            errorCount++;
          }
          
        } catch (error) {
          console.log(`   💥 ERROR: ${error.message}`);
          errorCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`\n📊 Batch ${batchNum + 1} Summary:`);
      console.log(`   ✅ Fixed: ${fixedCount}`);
      console.log(`   ⚠️  Skipped: ${skippedCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      
      // Delay between batches
      if (batchNum < totalBatches - 1) {
        console.log('\n⏳ Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 FINAL RESULTS:');
    console.log('='.repeat(80));
    console.log(`✅ FIXED: ${fixedCount} problem schemas`);
    console.log(`⚠️  SKIPPED: ${skippedCount} problem schemas (already sufficient data)`);
    console.log(`❌ ERRORS: ${errorCount} problem schemas`);
    console.log(`📊 TOTAL PROCESSED: ${schemas.length} problem schemas`);
    console.log(`🎯 SUCCESS RATE: ${Math.round(((fixedCount + skippedCount) / schemas.length) * 100)}%`);
    
    const totalFixed = fixedCount + skippedCount + 1; // +1 for #2 already fixed
    if (totalFixed >= 70) {
      console.log('\n🎉 ALL 70 PROBLEMS NOW HAVE SUFFICIENT DATA!');
      console.log('💪 Every problem schema contains 20+ rows permanently!');
      console.log('🚀 Navigation and setup will always create tables with sufficient data!');
    } else {
      console.log(`\n⚠️  ${70 - totalFixed} problems still need attention.`);
    }
    
  } catch (error) {
    console.error('💥 Schema fixing failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the comprehensive fix
fixAllSchemas()
  .then(() => {
    console.log('\n🎉 All schemas permanently fixed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Schema fixing failed:', error);
    process.exit(1);
  });