const pool = require('./config/database');
require('dotenv').config();

// Function to extract table names from SQL statements
function extractTableNames(sql) {
    const tableNames = new Set();
    
    // Remove comments
    sql = sql.replace(/--.*$/gm, '');
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Extract table names from CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?)(\w+)\1/gi;
    let match;
    while ((match = createTableRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    // Extract table names from FROM clauses
    const fromRegex = /FROM\s+([`"]?)(\w+)\1/gi;
    while ((match = fromRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    // Extract table names from JOIN clauses
    const joinRegex = /JOIN\s+([`"]?)(\w+)\1/gi;
    while ((match = joinRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    // Extract table names from INSERT INTO statements
    const insertRegex = /INSERT\s+INTO\s+([`"]?)(\w+)\1/gi;
    while ((match = insertRegex.exec(sql)) !== null) {
        tableNames.add(match[2].toLowerCase());
    }
    
    return Array.from(tableNames);
}

// Function to extract CREATE TABLE statements
function extractCreateStatements(sql) {
    const statements = [];
    
    // Split by semicolon but be careful about semicolons in strings
    const parts = sql.split(/;(?=(?:[^']*'[^']*')*[^']*$)/);
    
    for (let part of parts) {
        part = part.trim();
        if (part.match(/CREATE\s+TABLE/i)) {
            statements.push(part + ';');
        }
    }
    
    return statements;
}

// Function to extract INSERT statements
function extractInsertStatements(sql) {
    const statements = [];
    
    // Split by semicolon but be careful about semicolons in strings
    const parts = sql.split(/;(?=(?:[^']*'[^']*')*[^']*$)/);
    
    for (let part of parts) {
        part = part.trim();
        if (part.match(/INSERT\s+INTO/i)) {
            statements.push(part + ';');
        }
    }
    
    return statements;
}

// Function to convert PostgreSQL schema to MySQL
function convertToMySQL(sql) {
    let converted = sql;
    
    // Convert data types
    converted = converted.replace(/SERIAL/gi, 'INT AUTO_INCREMENT');
    converted = converted.replace(/BIGSERIAL/gi, 'BIGINT AUTO_INCREMENT');
    converted = converted.replace(/TEXT/gi, 'TEXT');
    converted = converted.replace(/BOOLEAN/gi, 'TINYINT(1)');
    converted = converted.replace(/TIMESTAMP/gi, 'DATETIME');
    converted = converted.replace(/JSONB/gi, 'JSON');
    
    // Remove PostgreSQL-specific syntax
    converted = converted.replace(/IF NOT EXISTS/gi, 'IF NOT EXISTS');
    
    return converted;
}

async function auditAllTables() {
    try {
        console.log('🔍 Starting comprehensive table audit...\n');
        
        // Get ALL problems (including inactive ones)
        const problemsQuery = `
            SELECT id, title, slug, difficulty, is_active, created_at
            FROM problems
            ORDER BY id
        `;
        
        const problemsResult = await pool.query(problemsQuery);
        const problems = problemsResult.rows;
        
        console.log(`📊 Found ${problems.length} total problems in database`);
        console.log(`📊 Active problems: ${problems.filter(p => p.is_active).length}`);
        console.log(`📊 Inactive problems: ${problems.filter(p => !p.is_active).length}\n`);
        
        // Get ALL schemas for ALL problems
        const schemasQuery = `
            SELECT ps.id, ps.problem_id, ps.sql_dialect, ps.setup_sql, ps.solution_sql,
                   p.title, p.slug, p.is_active as problem_active
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            ORDER BY ps.problem_id, ps.sql_dialect
        `;
        
        const schemasResult = await pool.query(schemasQuery);
        const schemas = schemasResult.rows;
        
        console.log(`📊 Found ${schemas.length} total schemas across all problems\n`);
        
        // Group schemas by dialect
        const schemasByDialect = {
            postgresql: schemas.filter(s => s.sql_dialect === 'postgresql'),
            mysql: schemas.filter(s => s.sql_dialect === 'mysql')
        };
        
        console.log(`📊 PostgreSQL schemas: ${schemasByDialect.postgresql.length}`);
        console.log(`📊 MySQL schemas: ${schemasByDialect.mysql.length}\n`);
        
        // Extract all unique table names
        const allTableNames = new Set();
        const tablesBySchema = new Map();
        const createStatementsByTable = new Map();
        const insertStatementsByTable = new Map();
        
        // Process all schemas
        for (const schema of schemas) {
            console.log(`🔍 Processing: ${schema.title} (${schema.sql_dialect}) - Problem ${schema.problem_active ? 'ACTIVE' : 'INACTIVE'}`);
            
            const setupSql = schema.setup_sql || '';
            const solutionSql = schema.solution_sql || '';
            
            // Extract table names from both setup and solution SQL
            const tableNames = extractTableNames(setupSql + ' ' + solutionSql);
            
            // Extract CREATE statements from setup SQL
            const createStatements = extractCreateStatements(setupSql);
            
            // Extract INSERT statements from setup SQL
            const insertStatements = extractInsertStatements(setupSql);
            
            // Store information for each table
            for (const tableName of tableNames) {
                allTableNames.add(tableName);
                
                if (!tablesBySchema.has(tableName)) {
                    tablesBySchema.set(tableName, []);
                }
                tablesBySchema.get(tableName).push({
                    problemId: schema.problem_id,
                    problemTitle: schema.title,
                    problemSlug: schema.slug,
                    dialect: schema.sql_dialect,
                    isActive: schema.problem_active
                });
            }
            
            // Store CREATE statements
            for (const statement of createStatements) {
                const match = statement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?)(\w+)\1/i);
                if (match) {
                    const tableName = match[2].toLowerCase();
                    if (!createStatementsByTable.has(tableName)) {
                        createStatementsByTable.set(tableName, new Set());
                    }
                    createStatementsByTable.get(tableName).add({
                        statement: statement,
                        dialect: schema.sql_dialect,
                        problemTitle: schema.title
                    });
                }
            }
            
            // Store INSERT statements
            for (const statement of insertStatements) {
                const match = statement.match(/INSERT\s+INTO\s+([`"]?)(\w+)\1/i);
                if (match) {
                    const tableName = match[2].toLowerCase();
                    if (!insertStatementsByTable.has(tableName)) {
                        insertStatementsByTable.set(tableName, new Set());
                    }
                    insertStatementsByTable.get(tableName).add({
                        statement: statement,
                        dialect: schema.sql_dialect,
                        problemTitle: schema.title
                    });
                }
            }
        }
        
        // Sort table names alphabetically
        const sortedTableNames = Array.from(allTableNames).sort();
        
        console.log(`\n🎯 COMPREHENSIVE TABLE AUDIT RESULTS`);
        console.log(`=====================================`);
        console.log(`📊 Total unique tables found: ${sortedTableNames.length}\n`);
        
        console.log(`📋 COMPLETE TABLE INVENTORY:`);
        console.log(`===========================`);
        
        for (const tableName of sortedTableNames) {
            const usages = tablesBySchema.get(tableName) || [];
            const activeUsages = usages.filter(u => u.isActive);
            const inactiveUsages = usages.filter(u => !u.isActive);
            
            console.log(`\n🔹 Table: ${tableName.toUpperCase()}`);
            console.log(`   Total references: ${usages.length}`);
            console.log(`   Active problems: ${activeUsages.length}`);
            console.log(`   Inactive problems: ${inactiveUsages.length}`);
            
            // Show which problems use this table
            const problemRefs = [...new Set(usages.map(u => `${u.problemTitle} (${u.isActive ? 'active' : 'inactive'})`))];
            console.log(`   Used in: ${problemRefs.join(', ')}`);
        }
        
        console.log(`\n\n🏗️  MYSQL SCHEMA GENERATION`);
        console.log(`============================\n`);
        
        // Generate complete MySQL schema
        let mysqlSchema = `-- ============================================\n`;
        mysqlSchema += `-- COMPREHENSIVE SQL PRACTICE PLATFORM SCHEMA\n`;
        mysqlSchema += `-- Generated: ${new Date().toISOString()}\n`;
        mysqlSchema += `-- Total Tables: ${sortedTableNames.length}\n`;
        mysqlSchema += `-- ============================================\n\n`;
        
        mysqlSchema += `-- Drop existing tables (in dependency order)\n`;
        for (const tableName of sortedTableNames.reverse()) {
            mysqlSchema += `DROP TABLE IF EXISTS ${tableName};\n`;
        }
        sortedTableNames.reverse(); // restore original order
        
        mysqlSchema += `\n-- Create all tables\n\n`;
        
        for (const tableName of sortedTableNames) {
            mysqlSchema += `-- ============================================\n`;
            mysqlSchema += `-- Table: ${tableName.toUpperCase()}\n`;
            mysqlSchema += `-- ============================================\n`;
            
            const createStatements = createStatementsByTable.get(tableName);
            if (createStatements && createStatements.size > 0) {
                // Get the most recent/best CREATE statement (prefer MySQL, then PostgreSQL)
                let bestStatement = null;
                
                for (const stmt of createStatements) {
                    if (stmt.dialect === 'mysql') {
                        bestStatement = stmt;
                        break;
                    }
                    if (!bestStatement || stmt.dialect === 'postgresql') {
                        bestStatement = stmt;
                    }
                }
                
                if (bestStatement) {
                    let statement = bestStatement.statement;
                    if (bestStatement.dialect === 'postgresql') {
                        statement = convertToMySQL(statement);
                    }
                    
                    mysqlSchema += `-- Source: ${bestStatement.problemTitle} (${bestStatement.dialect})\n`;
                    mysqlSchema += `${statement}\n\n`;
                }
            } else {
                mysqlSchema += `-- WARNING: No CREATE statement found for ${tableName}\n`;
                mysqlSchema += `-- This table was referenced but not defined\n\n`;
            }
            
            // Add INSERT statements
            const insertStatements = insertStatementsByTable.get(tableName);
            if (insertStatements && insertStatements.size > 0) {
                mysqlSchema += `-- Sample data for ${tableName}\n`;
                
                const processedInserts = new Set();
                for (const stmt of insertStatements) {
                    let statement = stmt.statement;
                    if (stmt.dialect === 'postgresql') {
                        statement = convertToMySQL(statement);
                    }
                    
                    // Avoid duplicate INSERT statements
                    const normalized = statement.replace(/\s+/g, ' ').trim();
                    if (!processedInserts.has(normalized)) {
                        processedInserts.add(normalized);
                        mysqlSchema += `${statement}\n`;
                    }
                }
                mysqlSchema += `\n`;
            }
        }
        
        console.log(mysqlSchema);
        
        // Summary
        console.log(`\n\n📋 FINAL SUMMARY`);
        console.log(`===============`);
        console.log(`✅ Total problems analyzed: ${problems.length}`);
        console.log(`✅ Total schemas processed: ${schemas.length}`);
        console.log(`✅ Unique tables identified: ${sortedTableNames.length}`);
        console.log(`✅ Tables with CREATE statements: ${createStatementsByTable.size}`);
        console.log(`✅ Tables with INSERT statements: ${insertStatementsByTable.size}`);
        
        const missingCreateStatements = sortedTableNames.filter(name => !createStatementsByTable.has(name));
        if (missingCreateStatements.length > 0) {
            console.log(`\n⚠️  TABLES WITHOUT CREATE STATEMENTS:`);
            for (const tableName of missingCreateStatements) {
                console.log(`   - ${tableName}`);
            }
        }
        
        console.log(`\n🎯 ALL TABLES THAT MUST EXIST IN MYSQL:`);
        console.log(`======================================`);
        for (const tableName of sortedTableNames) {
            console.log(`   ${tableName}`);
        }
        
    } catch (error) {
        console.error('❌ Error during audit:', error);
    } finally {
        await pool.end();
    }
}

// Run the audit
if (require.main === module) {
    auditAllTables();
}

module.exports = { auditAllTables, extractTableNames, extractCreateStatements, extractInsertStatements };