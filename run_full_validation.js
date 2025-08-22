#!/usr/bin/env node
/**
 * Full Platform Validation - All 70 Problems
 * Comprehensive quality assessment based on the 9-point checklist
 */

const { Pool } = require('pg');

// Import fetch for Node.js
if (!global.fetch) {
    try {
        global.fetch = require('node-fetch');
    } catch (e) {
        console.error('node-fetch not available. Install with: npm install node-fetch');
        process.exit(1);
    }
}

const mainPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'sql_practice',
    user: 'postgres',
    password: 'password'
});

const BASE_URL = 'http://localhost:5001/api';

const validationResults = {
    problems: {},
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        issues: [],
        categories: {}
    }
};

async function makeRequest(url, method = 'GET', body = null, headers = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, options);
        return {
            ok: response.ok,
            status: response.status,
            data: await response.json()
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error.message
        };
    }
}

async function validateProblem(problem, index, total) {
    console.log(`[${index}/${total}] Problem #${problem.numeric_id}: ${problem.title.substring(0, 50)}...`);
    
    const issues = [];
    
    // 1. Problem Statement Quality
    if (!problem.description || problem.description.length < 100) {
        issues.push('Problem Statement: Description too short');
    }
    
    const hasBusinessContext = problem.description && (
        problem.description.includes('Business Context:') ||
        problem.description.includes('Scenario:') ||
        problem.description.includes('business') ||
        problem.description.includes('company')
    );
    
    if (!hasBusinessContext) {
        issues.push('Problem Statement: Missing business context');
    }
    
    const hasExplicitTask = problem.description && (
        problem.description.includes('Problem:') ||
        problem.description.includes('Create') ||
        problem.description.includes('Write') ||
        problem.description.includes('Find')
    );
    
    if (!hasExplicitTask) {
        issues.push('Problem Statement: Missing explicit task');
    }
    
    const hasExpectedOutput = problem.description && (
        problem.description.includes('Expected Output:') ||
        problem.description.includes('Output:')
    );
    
    if (!hasExpectedOutput) {
        issues.push('Problem Statement: Missing expected output description');
    }
    
    // 2. Schema & Data Completeness
    try {
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (!schemaResponse.ok) {
            issues.push('Schema & Data: Cannot fetch schema');
        } else {
            const schema = schemaResponse.data.schema;
            
            if (!schema?.setup_sql) {
                issues.push('Schema & Data: Missing setup SQL');
            } else {
                if (!schema.setup_sql.includes('CREATE TABLE')) {
                    issues.push('Schema & Data: No table creation statements');
                }
                if (!schema.setup_sql.includes('INSERT INTO')) {
                    issues.push('Schema & Data: No sample data');
                } else {
                    // Count data volume
                    const rowMatches = [...schema.setup_sql.matchAll(/\\([^)]+\\),?/g)];
                    if (rowMatches.length < 5) {
                        issues.push('Schema & Data: Insufficient sample data');
                    }
                }
            }
            
            if (!schema?.expected_output) {
                issues.push('Schema & Data: Missing expected output for validation');
            }
            
            if (!schema?.solution_sql) {
                issues.push('Schema & Data: Missing solution SQL');
            }
        }
    } catch (error) {
        issues.push(`Schema & Data: Error - ${error.message}`);
    }
    
    // 3. Execution Environment
    try {
        const sessionId = `validate_${Date.now()}_${problem.numeric_id}`;
        
        const execResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
            sql: 'SELECT 1 as test',
            dialect: 'postgresql',
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (!execResponse.ok) {
            issues.push('Execution Environment: Cannot execute queries');
        } else {
            const data = execResponse.data.data || execResponse.data;
            
            if (!data.hasOwnProperty('isCorrect')) {
                issues.push('Execution Environment: Missing validation results');
            }
            if (!data.hasOwnProperty('feedback')) {
                issues.push('Execution Environment: Missing feedback messages');
            }
            if (!data.hasOwnProperty('executionTime')) {
                issues.push('Execution Environment: Missing execution timing');
            }
        }
        
        // Test error handling
        const errorResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
            sql: 'INVALID SQL SYNTAX',
            dialect: 'postgresql',
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (errorResponse.ok && !errorResponse.data.error && !errorResponse.data.data?.feedback?.includes('error')) {
            issues.push('Execution Environment: Poor error handling');
        }
        
    } catch (error) {
        issues.push(`Execution Environment: Error - ${error.message}`);
    }
    
    // 4. Validation System
    try {
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (schemaResponse.ok && schemaResponse.data.schema?.expected_output) {
            const sessionId = `validation_${Date.now()}_${problem.numeric_id}`;
            
            const wrongResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
                sql: 'SELECT 999 as wrong_result',
                dialect: 'postgresql',
                problemNumericId: problem.numeric_id
            }, { 'X-Session-ID': sessionId });
            
            if (wrongResponse.ok) {
                const data = wrongResponse.data.data || wrongResponse.data;
                
                if (data.isCorrect === true) {
                    issues.push('Validation System: Wrong queries marked as correct');
                }
                
                if (!data.feedback || data.feedback === 'Query executed successfully') {
                    issues.push('Validation System: Uninformative feedback');
                }
            }
        } else if (!schemaResponse.data.schema?.expected_output) {
            issues.push('Validation System: Cannot validate - no expected output');
        }
        
    } catch (error) {
        issues.push(`Validation System: Error - ${error.message}`);
    }
    
    // 5. Difficulty & Skills Tagging
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!problem.difficulty || !validDifficulties.includes(problem.difficulty.toLowerCase())) {
        issues.push(`Difficulty & Skills: Invalid difficulty - ${problem.difficulty}`);
    }
    
    if (!problem.category || problem.category === 'Uncategorized') {
        issues.push('Difficulty & Skills: Missing or invalid category');
    }
    
    // 6. Frontend Sample Data Display
    try {
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (schemaResponse.ok && schemaResponse.data.schema?.setup_sql) {
            const setupSql = schemaResponse.data.schema.setup_sql;
            
            const insertMatches = [...setupSql.matchAll(/INSERT INTO\\s+(\\w+)\\s+VALUES\\s+([\\s\\S]*?);/g)];
            
            if (setupSql.includes('INSERT INTO') && insertMatches.length === 0) {
                issues.push('Frontend Display: Sample data parsing will fail');
            }
        }
    } catch (error) {
        issues.push(`Frontend Display: Error - ${error.message}`);
    }
    
    // 7. User Experience Features
    try {
        const sessionId = `ux_${Date.now()}_${problem.numeric_id}`;
        
        // Test bookmarks
        const bookmarkResponse = await makeRequest(`${BASE_URL}/bookmarks`, 'POST', {
            problemId: problem.id,
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (!bookmarkResponse.ok) {
            issues.push('User Experience: Bookmark functionality broken');
        }
        
    } catch (error) {
        issues.push(`User Experience: Error - ${error.message}`);
    }
    
    // Store results
    validationResults.problems[problem.numeric_id] = {
        title: problem.title,
        difficulty: problem.difficulty,
        category: problem.category,
        issues: issues,
        passed: issues.length === 0
    };
    
    if (issues.length === 0) {
        console.log(`   ✅ PASSED all checks`);
        validationResults.summary.passed++;
    } else {
        console.log(`   ❌ ${issues.length} issues found`);
        validationResults.summary.failed++;
        validationResults.summary.issues.push(...issues);
    }
    
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 50));
}

function generateReport() {
    console.log('\\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE PLATFORM VALIDATION REPORT');
    console.log('='.repeat(80));
    
    const { summary } = validationResults;
    
    console.log(`\\n📈 Overall Quality Score:`);
    console.log(`   Total Problems: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed} (${Math.round(summary.passed / summary.total * 100)}%)`);
    console.log(`   ❌ Failed: ${summary.failed} (${Math.round(summary.failed / summary.total * 100)}%)`);
    console.log(`   🔍 Total Issues: ${summary.issues.length}`);
    console.log(`   📊 Average Issues per Problem: ${(summary.issues.length / summary.total).toFixed(2)}`);
    
    // Quality grade
    const passRate = summary.passed / summary.total * 100;
    let grade = 'F';
    if (passRate >= 90) grade = 'A';
    else if (passRate >= 80) grade = 'B';  
    else if (passRate >= 70) grade = 'C';
    else if (passRate >= 60) grade = 'D';
    
    console.log(`   🏆 Platform Quality Grade: ${grade}`);
    
    // Issue categories
    const issueCategories = {};
    summary.issues.forEach(issue => {
        const category = issue.split(':')[0];
        issueCategories[category] = (issueCategories[category] || 0) + 1;
    });
    
    console.log(`\\n🏷️ Issues by Category:`);
    Object.entries(issueCategories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
            const percentage = Math.round(count / summary.issues.length * 100);
            console.log(`   ${category}: ${count} issues (${percentage}%)`);
        });
    
    // Most critical problems
    const failedProblems = Object.entries(validationResults.problems)
        .filter(([_, data]) => !data.passed)
        .sort((a, b) => b[1].issues.length - a[1].issues.length);
    
    console.log(`\\n❌ Problems Needing Most Attention:`);
    failedProblems.slice(0, 10).forEach(([problemId, data]) => {
        console.log(`   #${problemId}: ${data.title.substring(0, 50)}... (${data.issues.length} issues)`);
    });
    
    // Priority recommendations
    console.log(`\\n🎯 Priority Recommendations:`);
    const topCategories = Object.entries(issueCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
    topCategories.forEach(([category, count], index) => {
        console.log(`   ${index + 1}. Fix ${category} issues (${count} problems affected)`);
    });
    
    // Difficulty analysis
    const difficultyStats = {};
    Object.values(validationResults.problems).forEach(problem => {
        const diff = problem.difficulty;
        if (!difficultyStats[diff]) {
            difficultyStats[diff] = { total: 0, passed: 0 };
        }
        difficultyStats[diff].total++;
        if (problem.passed) {
            difficultyStats[diff].passed++;
        }
    });
    
    console.log(`\\n📊 Quality by Difficulty:`);
    Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
        const passRate = Math.round(stats.passed / stats.total * 100);
        console.log(`   ${difficulty}: ${stats.passed}/${stats.total} passed (${passRate}%)`);
    });
    
    console.log(`\\n✅ Next Steps:`);
    console.log(`   1. Address top ${topCategories.length} issue categories`);
    console.log(`   2. Focus on problems with most issues first`);
    console.log(`   3. Add missing expected outputs (${issueCategories['Schema & Data'] || 0} affected)`);
    console.log(`   4. Improve problem statements and business context`);
    console.log(`   5. Run this validation regularly to monitor quality`);
}

async function main() {
    console.log('🚀 Starting Full Platform Validation (All 70 Problems)');
    console.log('📋 Checking against comprehensive quality checklist...\\n');
    
    try {
        const problemsResult = await mainPool.query(`
            SELECT p.id, p.numeric_id, p.title, p.description, p.difficulty, 
                   COALESCE(c.name, 'Uncategorized') as category, p.is_active
            FROM problems p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
            ORDER BY p.numeric_id
        `);
        
        const problems = problemsResult.rows;
        validationResults.summary.total = problems.length;
        
        console.log(`Found ${problems.length} active problems to validate\\n`);
        
        for (let i = 0; i < problems.length; i++) {
            await validateProblem(problems[i], i + 1, problems.length);
        }
        
        generateReport();
        
        console.log(`\\n🏁 Validation completed!`);
        
    } catch (error) {
        console.error('💥 Validation failed:', error);
        process.exit(1);
    } finally {
        await mainPool.end();
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}