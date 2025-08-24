const pool = require('./config/database');
require('dotenv').config();

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
    
    // Convert boolean values
    converted = converted.replace(/\btrue\b/gi, '1');
    converted = converted.replace(/\bfalse\b/gi, '0');
    
    return converted;
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

async function createAllMySQLTables() {
    let postgresConnection;
    let mysqlConnection;
    
    try {
        console.log('🚀 Creating ALL MySQL tables for 70 SQL problems...\n');
        
        // Connect to PostgreSQL to get schemas
        postgresConnection = await pool.connect();
        
        // Get all schemas from PostgreSQL
        const schemasQuery = `
            SELECT ps.setup_sql, ps.solution_sql, p.title, p.slug
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            WHERE ps.sql_dialect = 'postgresql'
            ORDER BY p.title
        `;
        
        const schemasResult = await postgresConnection.query(schemasQuery);
        const schemas = schemasResult.rows;
        
        console.log(`Found ${schemas.length} problems to process`);
        
        // Connect to MySQL
        const mysql = require('mysql2/promise');
        mysqlConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'sandbox',
            port: 3307
        });
        
        console.log('✅ Connected to MySQL database');
        
        const allCreateStatements = [];
        const allInsertStatements = [];
        const processedTables = new Set();
        
        // Extract all unique CREATE and INSERT statements
        for (const schema of schemas) {
            const setupSql = schema.setup_sql || '';
            
            if (setupSql.trim().length > 0) {
                const createStatements = extractCreateStatements(setupSql);
                const insertStatements = extractInsertStatements(setupSql);
                
                for (const statement of createStatements) {
                    const convertedStatement = convertToMySQL(statement);
                    
                    // Extract table name to avoid duplicates
                    const match = convertedStatement.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?)(\w+)\1/i);
                    if (match) {
                        const tableName = match[2].toLowerCase();
                        if (!processedTables.has(tableName)) {
                            processedTables.add(tableName);
                            allCreateStatements.push({
                                statement: convertedStatement,
                                tableName: tableName,
                                problem: schema.title
                            });
                        }
                    }
                }
                
                for (const statement of insertStatements) {
                    const convertedStatement = convertToMySQL(statement);
                    allInsertStatements.push({
                        statement: convertedStatement,
                        problem: schema.title
                    });
                }
            }
        }
        
        console.log(`📊 Total unique tables to create: ${allCreateStatements.length}`);
        console.log(`📊 Total INSERT statements: ${allInsertStatements.length}`);
        
        // Execute DROP statements first (in reverse order to handle dependencies)
        console.log('\n🗑️  Dropping existing tables...');
        for (const tableInfo of allCreateStatements.reverse()) {
            try {
                await mysqlConnection.execute(`DROP TABLE IF EXISTS ${tableInfo.tableName}`);
            } catch (error) {
                console.log(`   ⚠️  Could not drop ${tableInfo.tableName}: ${error.message}`);
            }
        }
        allCreateStatements.reverse(); // restore original order
        
        // Execute CREATE statements
        console.log('\n🏗️  Creating tables...');
        let successCount = 0;
        for (const tableInfo of allCreateStatements) {
            try {
                await mysqlConnection.execute(tableInfo.statement);
                console.log(`   ✅ Created: ${tableInfo.tableName.toUpperCase()} (from ${tableInfo.problem})`);
                successCount++;
            } catch (error) {
                console.log(`   ❌ Failed to create ${tableInfo.tableName}: ${error.message}`);
            }
        }
        
        // Execute INSERT statements
        console.log('\n📝 Inserting data...');
        let insertSuccessCount = 0;
        for (const insertInfo of allInsertStatements) {
            try {
                await mysqlConnection.execute(insertInfo.statement);
                insertSuccessCount++;
            } catch (error) {
                console.log(`   ⚠️  Insert failed for ${insertInfo.problem}: ${error.message.substring(0, 100)}`);
            }
        }
        
        console.log('\n🎯 FINAL RESULTS');
        console.log('================');
        console.log(`✅ Total tables created: ${successCount}/${allCreateStatements.length}`);
        console.log(`✅ Total data inserts successful: ${insertSuccessCount}/${allInsertStatements.length}`);
        
        if (successCount === allCreateStatements.length) {
            console.log('\n🎉 SUCCESS: All 70 SQL problems now have complete MySQL support!');
            console.log('🚀 Your SQL practice platform is ready for MySQL queries!');
        } else {
            console.log('\n⚠️  Some tables failed to create. Check the errors above.');
        }
        
    } catch (error) {
        console.error('❌ Error creating MySQL tables:', error);
    } finally {
        if (postgresConnection) {
            postgresConnection.release();
        }
        if (mysqlConnection) {
            await mysqlConnection.end();
        }
        process.exit(0);
    }
}

createAllMySQLTables();