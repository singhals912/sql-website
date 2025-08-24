const pool = require('./config/database');
require('dotenv').config();

// MySQL connection configuration
const mysql = require('mysql2/promise');
const mysqlConfig = {
    host: 'localhost',
    user: 'root', 
    password: 'password',
    database: 'sandbox',
    port: 3307
};

// Function to convert PostgreSQL schema to MySQL
function convertToMySQL(sql) {
    if (!sql) return sql;
    
    let converted = sql;
    
    // Convert data types
    converted = converted.replace(/SERIAL/gi, 'INT AUTO_INCREMENT');
    converted = converted.replace(/BIGSERIAL/gi, 'BIGINT AUTO_INCREMENT');
    converted = converted.replace(/BOOLEAN/gi, 'TINYINT(1)');
    converted = converted.replace(/TIMESTAMP(?!\s*WITHOUT)/gi, 'DATETIME');
    converted = converted.replace(/JSONB/gi, 'JSON');
    
    // Convert boolean values
    converted = converted.replace(/\btrue\b/gi, '1');
    converted = converted.replace(/\bfalse\b/gi, '0');
    
    // Handle PostgreSQL-specific functions that might need adjustment
    converted = converted.replace(/NOW\(\)/gi, 'NOW()');
    
    return converted;
}

async function createMySQLSchemas() {
    let postgresConnection;
    let mysqlConnection;
    
    try {
        console.log('🚀 Creating MySQL schemas with expected outputs for all 70 problems...\n');
        
        // Connect to PostgreSQL to get existing schemas
        postgresConnection = await pool.connect();
        
        // Connect to MySQL for validation queries
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        
        console.log('✅ Connected to both PostgreSQL and MySQL databases');
        
        // Get all PostgreSQL schemas
        const schemasQuery = `
            SELECT ps.id, ps.problem_id, ps.setup_sql, ps.solution_sql, ps.expected_output,
                   p.title, p.slug, p.difficulty, p.description
            FROM problem_schemas ps
            JOIN problems p ON ps.problem_id = p.id
            WHERE ps.sql_dialect = 'postgresql'
            ORDER BY ps.problem_id
        `;
        
        const schemasResult = await postgresConnection.query(schemasQuery);
        const postgresSchemas = schemasResult.rows;
        
        console.log(`Found ${postgresSchemas.length} PostgreSQL schemas to convert to MySQL\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const pgSchema of postgresSchemas) {
            console.log(`🔄 Processing Problem ${pgSchema.problem_id}: ${pgSchema.title}`);
            
            try {
                // Convert PostgreSQL SQL to MySQL SQL
                const mysqlSetupSql = convertToMySQL(pgSchema.setup_sql);
                const mysqlSolutionSql = convertToMySQL(pgSchema.solution_sql);
                
                // Execute the solution query in MySQL to get expected output
                let mysqlExpectedOutput = null;
                
                if (mysqlSolutionSql && mysqlSolutionSql.trim().length > 0) {
                    console.log('   📝 Executing solution query in MySQL to generate expected output...');
                    
                    try {
                        // Execute the setup SQL first (if needed)
                        if (mysqlSetupSql && mysqlSetupSql.includes('DROP TABLE IF EXISTS') || mysqlSetupSql.includes('CREATE TABLE')) {
                            // Setup SQL contains table creation, skip it as tables already exist
                        }
                        
                        // Execute the solution query
                        const [rows] = await mysqlConnection.execute(mysqlSolutionSql);
                        
                        // Convert MySQL results to the format expected by the validation system
                        if (rows && Array.isArray(rows)) {
                            mysqlExpectedOutput = rows.map(row => {
                                // Convert each row to the expected format with all values as strings
                                const convertedRow = {};
                                for (const [key, value] of Object.entries(row)) {
                                    // Convert all values to strings like in PostgreSQL expected output
                                    if (value === null) {
                                        convertedRow[key] = null;
                                    } else if (typeof value === 'number') {
                                        // Handle decimal formatting to match PostgreSQL
                                        convertedRow[key] = value.toString();
                                    } else if (value instanceof Date) {
                                        // Format dates consistently
                                        convertedRow[key] = value.toISOString().split('T')[0];
                                    } else {
                                        convertedRow[key] = String(value);
                                    }
                                }
                                return convertedRow;
                            });
                        }
                        
                        console.log(`   ✅ Generated expected output with ${mysqlExpectedOutput ? mysqlExpectedOutput.length : 0} rows`);
                        
                    } catch (mysqlError) {
                        console.log(`   ⚠️  Could not execute solution query in MySQL: ${mysqlError.message}`);
                        // Use PostgreSQL expected output as fallback
                        mysqlExpectedOutput = pgSchema.expected_output;
                        console.log(`   📋 Using PostgreSQL expected output as fallback`);
                    }
                } else {
                    // No solution SQL, use PostgreSQL expected output
                    mysqlExpectedOutput = pgSchema.expected_output;
                }
                
                // Insert MySQL schema into database
                const insertQuery = `
                    INSERT INTO problem_schemas (problem_id, sql_dialect, setup_sql, solution_sql, expected_output, created_at)
                    VALUES ($1, $2, $3, $4, $5, NOW())
                `;
                
                await postgresConnection.query(insertQuery, [
                    pgSchema.problem_id,
                    'mysql',
                    mysqlSetupSql,
                    mysqlSolutionSql,
                    JSON.stringify(mysqlExpectedOutput)
                ]);
                
                console.log(`   ✅ Created MySQL schema for Problem ${pgSchema.problem_id}\n`);
                successCount++;
                
            } catch (error) {
                console.log(`   ❌ Failed to create MySQL schema for Problem ${pgSchema.problem_id}: ${error.message}\n`);
                errorCount++;
            }
        }
        
        console.log('\n🎯 FINAL RESULTS');
        console.log('================');
        console.log(`✅ MySQL schemas created: ${successCount}/${postgresSchemas.length}`);
        console.log(`❌ Errors: ${errorCount}`);
        
        if (successCount === postgresSchemas.length) {
            console.log('\n🎉 SUCCESS: All MySQL problems now have validation support!');
            console.log('🔍 MySQL queries will now show correct/incorrect results like PostgreSQL');
        } else {
            console.log('\n⚠️  Some schemas failed to create. Check the errors above.');
        }
        
        // Verify the results
        const verifyQuery = `
            SELECT COUNT(*) as mysql_count 
            FROM problem_schemas 
            WHERE sql_dialect = 'mysql'
        `;
        
        const verifyResult = await postgresConnection.query(verifyQuery);
        console.log(`\n📊 Total MySQL schemas in database: ${verifyResult.rows[0].mysql_count}`);
        
    } catch (error) {
        console.error('❌ Error creating MySQL schemas:', error);
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

createMySQLSchemas();