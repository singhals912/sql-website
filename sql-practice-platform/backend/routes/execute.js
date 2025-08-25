const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const pool = require('../config/database');
const sqlSecurity = require('../services/sqlSecurity');
const educationalFeedback = require('../services/educationalFeedback');

// Helper function to track progress
async function trackProgress(sessionId, problemId, problemNumericId, success, executionTime) {
    console.log('DEBUG trackProgress called with:', { sessionId, problemId, problemNumericId, success, executionTime });
    if (!sessionId || !problemId) {
        console.log('DEBUG trackProgress: Missing sessionId or problemId, skipping');
        return;
    }
    
    try {
        // Get or create progress record - check by both problem_id and numeric_id
        const existingProgress = await pool.query(`
            SELECT * FROM user_problem_progress 
            WHERE session_id = $1 AND (
                (problem_id = $2 AND $2 IS NOT NULL) OR 
                (problem_numeric_id = $3 AND $3 IS NOT NULL)
            )
            ORDER BY first_attempt_at DESC
            LIMIT 1
        `, [sessionId, problemId, problemNumericId]);
        
        if (existingProgress.rows.length === 0) {
            // Create new progress record
            await pool.query(`
                INSERT INTO user_problem_progress 
                (session_id, problem_id, problem_numeric_id, status, total_attempts, correct_attempts, best_execution_time_ms, first_attempt_at)
                VALUES ($1, $2, $3, $4, 1, $5, $6, CURRENT_TIMESTAMP)
            `, [sessionId, problemId, problemNumericId, success ? 'completed' : 'attempted', success ? 1 : 0, success ? executionTime : null]);
        } else {
            // Update existing progress
            const current = existingProgress.rows[0];
            const newCorrectAttempts = current.correct_attempts + (success ? 1 : 0);
            const newTotalAttempts = current.total_attempts + 1;
            const newStatus = success ? 'completed' : (current.status === 'completed' ? 'completed' : 'attempted');
            const newBestTime = success && executionTime ? 
                (current.best_execution_time_ms ? Math.min(current.best_execution_time_ms, executionTime) : executionTime) :
                current.best_execution_time_ms;
            
            console.log('DEBUG trackProgress: Updating existing progress:', {
                newTotalAttempts, newCorrectAttempts, newStatus, newBestTime
            });
            
            await pool.query(`
                UPDATE user_problem_progress 
                SET total_attempts = $1, correct_attempts = $2, status = $3, 
                    best_execution_time_ms = $4, last_attempt_at = CURRENT_TIMESTAMP,
                    completed_at = CASE WHEN $5 AND completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END
                WHERE session_id = $6 AND problem_id = $7
            `, [newTotalAttempts, newCorrectAttempts, newStatus, newBestTime, success, sessionId, problemId]);
        }
        
        console.log('DEBUG trackProgress: Successfully tracked progress for session:', sessionId);
    } catch (error) {
        console.error('Error tracking progress:', error);
        // Don't fail the SQL execution if progress tracking fails
    }
}

// SQL execution endpoint
router.post('/sql', async (req, res) => {
    try {
        const { sql, dialect = 'postgresql', problemId, problemNumericId } = req.body;
        const sessionId = req.headers['x-session-id'];
        
        console.log('=== DEBUG EXECUTE API CALLED ===');
        console.log('DEBUG execute.js: Received request with:', {
            sessionId, problemId, problemNumericId, dialect,
            bodyKeys: Object.keys(req.body),
            sqlLength: sql ? sql.length : 0
        });
        console.log('=== END DEBUG ===');
        
        if (!sql || sql.trim() === '') {
            return res.status(400).json({ error: 'SQL query is required' });
        }

        // SECURITY: Validate SQL query before execution
        const validation = sqlSecurity.validateQuery(sql);
        if (!validation.isValid) {
            sqlSecurity.logSecurityEvent('QUERY_BLOCKED', sql, null, sessionId);
            return res.status(400).json({ 
                success: false,
                error: 'Query not allowed',
                details: validation.reasons,
                isCorrect: false,
                feedback: `Query blocked for security: ${validation.reasons.join(', ')}`
            });
        }
        
        const startTime = Date.now();
        let setupSql = null;
        let expectedOutput = null;
        let sampleData = null;
        
        // Get problem setup and expected output if problemId is provided
        if (problemId || problemNumericId) {
            try {
                let problemQuery, problemParams;
                
                if (problemId) {
                    problemQuery = `
                        SELECT ps.setup_sql, ps.expected_output, ps.sample_data
                        FROM problems p 
                        JOIN problem_schemas ps ON p.id = ps.problem_id 
                        WHERE p.id = $1 AND (p.is_active = true OR p.is_active IS NULL)
                        LIMIT 1
                    `;
                    problemParams = [problemId];
                } else {
                    problemQuery = `
                        SELECT ps.setup_sql, ps.expected_output, ps.sample_data
                        FROM problems p 
                        JOIN problem_schemas ps ON p.id = ps.problem_id 
                        WHERE p.numeric_id = $1 AND (p.is_active = true OR p.is_active IS NULL)
                        LIMIT 1
                    `;
                    problemParams = [problemNumericId];
                }
                
                const problemResult = await pool.query(problemQuery, problemParams);
                
                console.log('DEBUG: problemResult.rows.length:', problemResult.rows.length);
                if (problemResult.rows.length > 0) {
                    console.log('DEBUG: problemResult.rows[0]:', problemResult.rows[0]);
                    setupSql = problemResult.rows[0].setup_sql;
                    expectedOutput = problemResult.rows[0].expected_output;
                    sampleData = problemResult.rows[0].sample_data;
                    console.log('DEBUG: expectedOutput after assignment:', expectedOutput);
                }
            } catch (setupError) {
                console.error('Error getting problem setup:', setupError);
                // Continue without setup if there's an error
            }
        }
        
        if (dialect === 'mysql') {
            // MySQL connection
            const connection = await mysql.createConnection({
                host: 'localhost',
                port: 3307,
                database: 'sandbox',
                user: 'root',
                password: 'password',
                connectTimeout: 5000
            });
            
            try {
                // Run setup SQL first if available
                if (setupSql) {
                    // Disable foreign key checks and drop all existing tables
                    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
                    
                    const [tables] = await connection.execute('SHOW TABLES');
                    for (const table of tables) {
                        const tableName = Object.values(table)[0];
                        await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
                    }
                    
                    // Re-enable foreign key checks
                    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
                    
                    // Execute setup SQL
                    const statements = setupSql.split(';').filter(stmt => stmt.trim());
                    for (const statement of statements) {
                        if (statement.trim()) {
                            await connection.execute(statement);
                        }
                    }
                }
                
                // Execute user's query with security logging
                sqlSecurity.logSecurityEvent('QUERY_EXECUTED', validation.sanitizedQuery, null, sessionId);
                const [rows, fields] = await connection.execute(validation.sanitizedQuery);
                const executionTime = Date.now() - startTime;
                
                // Check if result matches expected output (if available)
                let isCorrect = null; // null means "cannot validate"
                let feedback = "Query executed successfully";
                
                if (expectedOutput && expectedOutput.length > 0) {
                    // Compare user result with expected output
                    const userRows = rows || [];
                    const expectedRows = expectedOutput;
                    
                    isCorrect = true; // Assume correct until proven otherwise
                    
                    if (userRows.length !== expectedRows.length) {
                        isCorrect = false;
                        feedback = `Expected ${expectedRows.length} rows, but got ${userRows.length} rows.`;
                    } else {
                        // Check if rows match - normalize values to strings for comparison
                        for (let i = 0; i < userRows.length; i++) {
                            const userRow = userRows[i];
                            const expectedRow = expectedRows[i];
                            
                            // Normalize both rows by converting all values to strings
                            const normalizeRow = (row) => {
                                const normalized = {};
                                for (const [key, value] of Object.entries(row)) {
                                    normalized[key] = value !== null && value !== undefined ? String(value) : null;
                                }
                                return normalized;
                            };
                            
                            const normalizedUser = normalizeRow(userRow);
                            const normalizedExpected = normalizeRow(expectedRow);
                            
                            const userStr = JSON.stringify(normalizedUser, Object.keys(normalizedUser).sort());
                            const expectedStr = JSON.stringify(normalizedExpected, Object.keys(normalizedExpected).sort());
                            
                            if (userStr !== expectedStr) {
                                isCorrect = false;
                                feedback = `Row ${i + 1} doesn't match expected output.`;
                                console.log(`DEBUG Row ${i + 1} mismatch:`);
                                console.log(`User:     ${userStr}`);
                                console.log(`Expected: ${expectedStr}`);
                                break;
                            }
                        }
                    }
                    
                    if (isCorrect) {
                        feedback = "Correct! Your query produced the expected output.";
                    }
                } else {
                    // No expected output available - provide helpful feedback
                    const userRows = rows || [];
                    
                    if (userRows.length === 0) {
                        feedback = "Query executed successfully but returned no results. Check if this is expected.";
                    } else {
                        // Check for common patterns to provide hints
                        if (sql.toLowerCase().includes('select *')) {
                            feedback = `Query executed successfully and returned ${userRows.length} rows. Note: If this problem requires aggregation or specific columns, consider using GROUP BY, COUNT, AVG, etc. instead of SELECT *.`;
                        } else {
                            feedback = `Query executed successfully and returned ${userRows.length} rows. (Automatic validation not available for this problem yet)`;
                        }
                    }
                }
                
                // Track progress based on correctness (only count as success if actually correct)
                const progressSuccess = isCorrect === true; // null or false = not successful
                await trackProgress(sessionId, problemId, problemNumericId, progressSuccess, executionTime);
                
                console.log('DEBUG: Progress tracked, progress success:', progressSuccess);
                
                // Limit rows for display to prevent frontend crashes
                const totalRows = Array.isArray(rows) ? rows.length : 0;
                const maxDisplayRows = 1000;
                const displayRows = totalRows > maxDisplayRows ? rows.slice(0, maxDisplayRows) : rows;
                
                let displayFeedback = feedback;
                if (totalRows > maxDisplayRows) {
                    displayFeedback = `${feedback} (Showing first ${maxDisplayRows} of ${totalRows} rows)`;
                }
                
                res.json({
                    success: true,
                    data: {
                        columns: fields ? fields.map(f => f.name) : [],
                        rows: displayRows || [],
                        rowCount: totalRows,
                        executionTime,
                        isCorrect: isCorrect,
                        feedback: displayFeedback
                    }
                });
            } catch (queryError) {
                const executionTime = Date.now() - startTime;
                
                // Security logging for failed queries
                sqlSecurity.logSecurityEvent('QUERY_ERROR', sql, null, sessionId);
                
                // Generate educational feedback for the error
                const errorFeedback = educationalFeedback.generateEducationalFeedback(
                    queryError.message,
                    sql,
                    { category: 'MySQL Query', difficulty: 'medium' }
                );
                
                // Track progress for failed execution
                const success = false;
                await trackProgress(sessionId, problemId, problemNumericId, success, executionTime);
                
                res.json({
                    success: false,
                    error: queryError.message,
                    executionTime,
                    isCorrect: false,
                    feedback: errorFeedback.explanation || "Query failed to execute. Check your syntax and try again.",
                    educationalFeedback: errorFeedback.isEducational ? errorFeedback : null
                });
            } finally {
                await connection.end();
            }
        } else {
            // PostgreSQL connection - Use Railway database with sandbox schema
            const executorPool = new Pool(
                process.env.DATABASE_URL 
                    ? { 
                        connectionString: process.env.DATABASE_URL,
                        ssl: process.env.NODE_ENV === 'production' ? {
                            rejectUnauthorized: false
                        } : false,
                        max: 1,
                        idleTimeoutMillis: 5000,
                        connectionTimeoutMillis: 2000,
                    }
                    : {
                        host: process.env.DB_HOST || 'localhost',
                        port: process.env.DB_PORT || 5432,
                        database: process.env.DB_NAME || 'sql_practice',
                        user: process.env.DB_USER || 'postgres',
                        password: process.env.DB_PASSWORD || 'password',
                        max: 1,
                        idleTimeoutMillis: 5000,
                        connectionTimeoutMillis: 2000,
                    }
            );
            
            try {
                // Run setup SQL first if available
                if (setupSql) {
                    // Drop all existing tables first
                    await executorPool.query(`
                        DO $$ 
                        DECLARE
                            r RECORD;
                        BEGIN
                            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                            END LOOP;
                        END $$;
                    `);
                    
                    // Execute setup SQL
                    await executorPool.query(setupSql);
                    
                    // Execute sample data if available
                    if (sampleData) {
                        await executorPool.query(sampleData);
                    }
                }
                
                // Execute user's query with security logging
                sqlSecurity.logSecurityEvent('QUERY_EXECUTED', validation.sanitizedQuery, null, sessionId);
                const result = await executorPool.query(validation.sanitizedQuery);
                const executionTime = Date.now() - startTime;
                
                // Check if result matches expected output (if available)
                let isCorrect = null; // null means "cannot validate"
                let feedback = "Query executed successfully";
                
                console.log('DEBUG: PostgreSQL Validation check - expectedOutput:', expectedOutput);
                console.log('DEBUG: expectedOutput type:', typeof expectedOutput);
                console.log('DEBUG: expectedOutput length:', expectedOutput ? expectedOutput.length : 'N/A');
                
                if (expectedOutput && expectedOutput.length > 0) {
                    // Compare user result with expected output
                    const userRows = result.rows || [];
                    const expectedRows = expectedOutput;
                    
                    isCorrect = true; // Assume correct until proven otherwise
                    
                    if (userRows.length !== expectedRows.length) {
                        isCorrect = false;
                        feedback = `Expected ${expectedRows.length} rows, but got ${userRows.length} rows.`;
                    } else {
                        // Check if rows match (simple comparison)
                        for (let i = 0; i < userRows.length; i++) {
                            const userRow = userRows[i];
                            const expectedRow = expectedRows[i];
                            
                            // Convert both to strings for comparison (handles different data types)
                            const userStr = JSON.stringify(userRow, Object.keys(userRow).sort());
                            const expectedStr = JSON.stringify(expectedRow, Object.keys(expectedRow).sort());
                            
                            if (userStr !== expectedStr) {
                                isCorrect = false;
                                feedback = `Row ${i + 1} doesn't match expected output.`;
                                break;
                            }
                        }
                    }
                    
                    if (isCorrect) {
                        feedback = "Correct! Your query produced the expected output.";
                    }
                } else {
                    // No expected output available - provide helpful feedback
                    const userRows = result.rows || [];
                    
                    if (userRows.length === 0) {
                        feedback = "Query executed successfully but returned no results. Check if this is expected.";
                    } else {
                        // Check for common patterns to provide hints
                        if (sql.toLowerCase().includes('select *')) {
                            feedback = `Query executed successfully and returned ${userRows.length} rows. Note: If this problem requires aggregation or specific columns, consider using GROUP BY, COUNT, AVG, etc. instead of SELECT *.`;
                        } else {
                            feedback = `Query executed successfully and returned ${userRows.length} rows. (Automatic validation not available for this problem yet)`;
                        }
                    }
                }
                
                // Track progress based on correctness (only count as success if actually correct)
                const progressSuccess = isCorrect === true; // null or false = not successful
                await trackProgress(sessionId, problemId, problemNumericId, progressSuccess, executionTime);
                
                console.log('DEBUG: Progress tracked, progress success:', progressSuccess);
                
                console.log('Sending response with feedback:', feedback, 'isCorrect:', isCorrect);
                res.json({
                    success: true,
                    data: {
                        columns: result.fields ? result.fields.map(f => f.name) : [],
                        rows: result.rows || [],
                        rowCount: result.rowCount || 0,
                        executionTime,
                        isCorrect: isCorrect,
                        feedback: feedback
                    }
                });
            } catch (queryError) {
                const executionTime = Date.now() - startTime;
                
                // Security logging for failed queries
                sqlSecurity.logSecurityEvent('QUERY_ERROR', sql, null, sessionId);
                
                // Generate educational feedback for the error
                const errorFeedback = educationalFeedback.generateEducationalFeedback(
                    queryError.message,
                    sql,
                    { category: 'PostgreSQL Query', difficulty: 'medium' }
                );
                
                // Track progress for failed execution
                const success = false;
                await trackProgress(sessionId, problemId, problemNumericId, success, executionTime);
                
                res.json({
                    success: false,
                    error: queryError.message,
                    executionTime,
                    isCorrect: false,
                    feedback: errorFeedback.explanation || "Query failed to execute. Check your syntax and try again.",
                    educationalFeedback: errorFeedback.isEducational ? errorFeedback : null
                });
            } finally {
                await executorPool.end();
            }
        }
    } catch (error) {
        console.error('SQL execution error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to execute SQL query' 
        });
    }
});

module.exports = router;