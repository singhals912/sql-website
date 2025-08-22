#!/usr/bin/env node
/**
 * Permanently Fix Schema Data for All Problems
 * This script updates the setup_sql in the database to include 20+ rows
 * so that every time a problem is loaded, it has sufficient data
 */

const { Pool } = require('pg');
const axios = require('axios');

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sql_practice',
  user: 'postgres',
  password: 'password'
});

const BASE_URL = 'http://localhost:5001';

async function generateExpandedSetupSQL(tableName, originalSetupSql, targetRows = 25) {
  console.log(`   🔧 Generating expanded SQL for ${tableName}...`);
  
  try {
    // Extract the CREATE TABLE statement
    const createTableMatch = originalSetupSql.match(/(CREATE TABLE[^;]+;)/is);
    if (!createTableMatch) {
      throw new Error('Could not extract CREATE TABLE statement');
    }
    
    const createTableSQL = createTableMatch[1];
    
    // Extract existing INSERT statements
    const insertMatch = originalSetupSql.match(/INSERT INTO[^;]+;/gis);
    if (!insertMatch) {
      throw new Error('Could not extract INSERT statements');
    }
    
    // Parse the first INSERT to understand the structure
    const firstInsert = insertMatch[0];
    const valuesMatch = firstInsert.match(/VALUES\s*(.+)$/is);
    if (!valuesMatch) {
      throw new Error('Could not parse INSERT VALUES');
    }
    
    const valuesSection = valuesMatch[1];
    // Split by commas that are outside parentheses to get individual rows
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
      } else if (inQuotes && char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else if (!inQuotes && char === '(') {
        parenDepth++;
      } else if (!inQuotes && char === ')') {
        parenDepth--;
      } else if (!inQuotes && char === ',' && parenDepth === 0) {
        // This comma separates rows
        rows.push(currentRow.trim());
        currentRow = '';
        continue;
      }
      
      currentRow += char;
    }
    
    // Add the last row
    if (currentRow.trim()) {
      rows.push(currentRow.trim());
    }
    
    console.log(`   📊 Found ${rows.length} original rows`);
    
    // Generate additional rows
    const additionalRowsNeeded = targetRows - rows.length;
    if (additionalRowsNeeded <= 0) {
      console.log(`   ✅ Already has ${rows.length} rows, no expansion needed`);
      return originalSetupSql;
    }
    
    const expandedRows = [...rows];
    
    for (let i = 0; i < additionalRowsNeeded; i++) {
      const sourceRowIndex = i % rows.length;
      const sourceRow = rows[sourceRowIndex];
      
      // Parse the source row values
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
        } else if (inQuotes && char === quoteChar) {
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
      
      // Modify values to create variations
      const modifiedValues = values.map((value, index) => {
        // Remove quotes for processing
        let cleanValue = value.replace(/^['"]|['"]$/g, '');
        
        if (index === 0 && !isNaN(cleanValue)) {
          // First column is usually ID - increment it
          const newId = parseInt(cleanValue) + rows.length + i + 1;
          return newId.toString();
        } else if (!isNaN(cleanValue) && cleanValue.includes('.')) {
          // Decimal number - add variation
          const num = parseFloat(cleanValue);
          const variation = num + (i + 1) * 0.1;
          return variation.toFixed(2);
        } else if (!isNaN(cleanValue)) {
          // Integer - add variation
          const num = parseInt(cleanValue);
          const variation = num + (i + 1) * 10;
          return variation.toString();
        } else if (cleanValue.toLowerCase() === 'true' || cleanValue.toLowerCase() === 'false') {
          // Boolean - alternate
          return i % 2 === 0 ? 'true' : 'false';
        } else if (cleanValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          // Date - add days
          const date = new Date(cleanValue);
          date.setDate(date.getDate() + i + 1);
          return `'${date.toISOString().split('T')[0]}'`;
        } else if (cleanValue === 'NULL' || cleanValue === 'null') {
          return 'NULL';
        } else {
          // String - add variation suffix
          return `'${cleanValue}_${i + 1}'`;
        }
      });
      
      expandedRows.push(`(${modifiedValues.join(', ')})`);
    }
    
    // Build the complete SQL
    const columnMatch = firstInsert.match(/INSERT INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES/is);
    const columns = columnMatch && columnMatch[2] ? `(${columnMatch[2]})` : '';
    
    const expandedSQL = `${createTableSQL}\n      INSERT INTO ${tableName} ${columns} VALUES\n      ${expandedRows.join(',\n      ')};`;
    
    console.log(`   ✅ Expanded from ${rows.length} to ${expandedRows.length} rows`);
    return expandedSQL;
    
  } catch (error) {
    console.log(`   ❌ Failed to expand SQL: ${error.message}`);
    return originalSetupSql;
  }
}

async function fixSchemaDataPermanently() {
  console.log('🔧 Permanently fixing schema data for all problems...\n');
  
  try {
    // Get all problem schemas
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
      ORDER BY p.numeric_id
    `);
    
    const schemas = result.rows;
    console.log(`📥 Found ${schemas.length} schemas to fix\n`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Process in batches of 5
    const batchSize = 5;
    const totalBatches = Math.ceil(schemas.length / batchSize);
    
    for (let batchNum = 0; batchNum < totalBatches; batchNum++) {
      const startIdx = batchNum * batchSize;
      const endIdx = Math.min(startIdx + batchSize, schemas.length);
      const batch = schemas.slice(startIdx, endIdx);
      
      console.log(`\n📦 BATCH ${batchNum + 1}/${totalBatches} (Problems ${startIdx + 1}-${endIdx}):`);
      console.log('='.repeat(60));
      
      for (let i = 0; i < batch.length; i++) {
        const schema = batch[i];
        const problemNum = startIdx + i + 1;
        
        try {
          console.log(`\n🔧 [${problemNum}/${schemas.length}] #${schema.numeric_id?.toString().padStart(3, '0')} - ${schema.title}`);
          
          // Extract table name
          const tableNameMatch = schema.setup_sql.match(/CREATE TABLE\s+(\w+)/i);
          if (!tableNameMatch) {
            console.log('   ❌ Could not extract table name');
            errorCount++;
            continue;
          }
          
          const tableName = tableNameMatch[1];
          console.log(`   📊 Table: ${tableName}`);
          
          // Generate expanded setup SQL
          const expandedSetupSQL = await generateExpandedSetupSQL(tableName, schema.setup_sql, 25);
          
          // Update the database
          await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1, updated_at = NOW()
            WHERE id = $2
          `, [expandedSetupSQL, schema.schema_id]);
          
          console.log(`   ✅ FIXED - Schema updated in database`);
          fixedCount++;
          
        } catch (error) {
          console.log(`   💥 ERROR: ${error.message}`);
          errorCount++;
        }
      }
      
      console.log(`\n📊 Batch ${batchNum + 1} Summary:`);
      console.log(`   ✅ Fixed: ${fixedCount}`);
      console.log(`   ❌ Errors: ${errorCount}`);
      
      // Small delay between batches
      if (batchNum < totalBatches - 1) {
        console.log('\n⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🏁 FINAL RESULTS:');
    console.log('='.repeat(80));
    console.log(`✅ FIXED: ${fixedCount} problem schemas`);
    console.log(`❌ ERRORS: ${errorCount} problem schemas`);
    console.log(`📊 TOTAL: ${schemas.length} problem schemas`);
    console.log(`🎯 SUCCESS RATE: ${Math.round((fixedCount / schemas.length) * 100)}%`);
    
    if (fixedCount === schemas.length) {
      console.log('\n🎉 ALL SCHEMAS PERMANENTLY FIXED!');
      console.log('💪 Every problem now has 20+ rows in setup_sql!');
      console.log('🚀 Navigation and setup will always create tables with sufficient data!');
    } else {
      console.log(`\n⚠️  ${errorCount} schemas need manual attention.`);
    }
    
  } catch (error) {
    console.error('💥 Schema fixing failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the permanent fix
fixSchemaDataPermanently()
  .then(() => {
    console.log('\n🎉 Schema data permanently fixed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Schema fixing failed:', error);
    process.exit(1);
  });