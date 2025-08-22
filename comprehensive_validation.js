#!/usr/bin/env node
/**
 * Comprehensive End-to-End Validation for SQL Practice Platform
 * 
 * This script validates all 70 problems against a detailed checklist:
 * 1. Problem Statement Quality
 * 2. Schema & Data Completeness  
 * 3. Input/Output Specification
 * 4. Difficulty & Skills Tagging
 * 5. Execution Environment
 * 6. Validation System
 * 7. Learning Aids
 * 8. User Experience
 * 9. Gamification/Meta Features
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

// Validation results storage
const validationResults = {
    problems: {},
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        issues: []
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

/**
 * 1. Problem Statement Validation
 */
async function validateProblemStatement(problem) {
    const issues = [];
    
    // Check title quality
    if (!problem.title || problem.title.length < 10) {
        issues.push('Title too short or missing');
    }
    if (problem.title && problem.title.length > 100) {
        issues.push('Title too long (>100 chars)');
    }
    
    // Check description quality
    if (!problem.description || problem.description.length < 50) {
        issues.push('Description too short or missing');
    }
    
    // Check for business context
    const hasBusinessContext = problem.description && (
        problem.description.includes('Business Context:') ||
        problem.description.includes('Scenario:') ||
        problem.description.includes('business') ||
        problem.description.includes('company') ||
        problem.description.includes('organization')
    );
    
    if (!hasBusinessContext) {
        issues.push('Missing business context/scenario');
    }
    
    // Check for explicit task
    const hasExplicitTask = problem.description && (
        problem.description.includes('Problem:') ||
        problem.description.includes('Task:') ||
        problem.description.includes('Create') ||
        problem.description.includes('Write') ||
        problem.description.includes('Find')
    );
    
    if (!hasExplicitTask) {
        issues.push('Missing explicit task description');
    }
    
    // Check for expected output description
    const hasExpectedOutput = problem.description && (
        problem.description.includes('Expected Output:') ||
        problem.description.includes('Output:') ||
        problem.description.includes('should return') ||
        problem.description.includes('result should')
    );
    
    if (!hasExpectedOutput) {
        issues.push('Missing expected output description');
    }
    
    return issues;
}

/**
 * 2. Schema & Data Validation
 */
async function validateSchemaAndData(problem) {
    const issues = [];
    
    try {
        // Get problem schema
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (!schemaResponse.ok) {
            issues.push('Cannot fetch problem schema');
            return issues;
        }
        
        const schema = schemaResponse.data.schema;
        
        if (!schema) {
            issues.push('No schema available');
            return issues;
        }
        
        // Check setup SQL
        if (!schema.setup_sql) {
            issues.push('Missing setup SQL');
        } else {
            // Check for table creation
            if (!schema.setup_sql.includes('CREATE TABLE')) {
                issues.push('Setup SQL missing CREATE TABLE statements');
            }
            
            // Check for sample data
            if (!schema.setup_sql.includes('INSERT INTO')) {
                issues.push('Setup SQL missing sample data (INSERT statements)');
            } else {
                // Count tables vs data
                const tableMatches = [...schema.setup_sql.matchAll(/CREATE TABLE\s+(\w+)/gi)];
                const insertMatches = [...schema.setup_sql.matchAll(/INSERT INTO\s+(\w+)/gi)];
                
                if (tableMatches.length > insertMatches.length) {
                    issues.push('Some tables missing sample data');
                }
                
                // Check data volume
                const rowMatches = [...schema.setup_sql.matchAll(/\([^)]+\),?/g)];
                if (rowMatches.length < 5) {
                    issues.push('Insufficient sample data (< 5 rows total)');
                }
            }
            
            // Check for data types
            if (!schema.setup_sql.includes('VARCHAR') && !schema.setup_sql.includes('TEXT') &&
                !schema.setup_sql.includes('INT') && !schema.setup_sql.includes('DECIMAL')) {
                issues.push('Setup SQL missing common data types');
            }
        }
        
        // Check expected output
        if (!schema.expected_output) {
            issues.push('Missing expected output for validation');
        } else {
            try {
                const expectedData = JSON.parse(schema.expected_output);
                if (!Array.isArray(expectedData) || expectedData.length === 0) {
                    issues.push('Expected output is empty or invalid format');
                }
            } catch (e) {
                issues.push('Expected output is not valid JSON');
            }
        }
        
        // Check solution SQL
        if (!schema.solution_sql) {
            issues.push('Missing solution SQL');
        } else {
            // Basic SQL validation
            if (!schema.solution_sql.includes('SELECT')) {
                issues.push('Solution SQL missing SELECT statement');
            }
        }
        
    } catch (error) {
        issues.push(`Schema validation error: ${error.message}`);
    }
    
    return issues;
}

/**
 * 3. Input/Output Specification Validation
 */
async function validateInputOutputSpec(problem) {
    const issues = [];
    
    try {
        // Test the execution environment
        const sessionId = `validate_${Date.now()}_${problem.numeric_id}`;
        
        // Test with a simple query
        const testResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
            sql: 'SELECT 1 as test',
            dialect: 'postgresql',
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (!testResponse.ok) {
            issues.push('Execution environment not working');
        } else {
            const data = testResponse.data.data || testResponse.data;
            
            // Check response format
            if (!data.hasOwnProperty('columns')) {
                issues.push('Response missing columns specification');
            }
            if (!data.hasOwnProperty('rows')) {
                issues.push('Response missing rows data');
            }
            if (!data.hasOwnProperty('executionTime')) {
                issues.push('Response missing execution time');
            }
            if (!data.hasOwnProperty('isCorrect')) {
                issues.push('Response missing validation result');
            }
            if (!data.hasOwnProperty('feedback')) {
                issues.push('Response missing feedback message');
            }
        }
        
    } catch (error) {
        issues.push(`I/O validation error: ${error.message}`);
    }
    
    return issues;
}

/**
 * 4. Difficulty & Skills Tagging Validation
 */
async function validateDifficultyAndSkills(problem) {
    const issues = [];
    
    // Check difficulty level
    const validDifficulties = ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'];
    if (!problem.difficulty || !validDifficulties.includes(problem.difficulty)) {
        issues.push(`Invalid or missing difficulty level: ${problem.difficulty}`);
    }
    
    // Check category
    if (!problem.category || problem.category.length < 3) {
        issues.push('Missing or invalid category');
    }
    
    // Check if difficulty matches content complexity
    if (problem.description) {
        const complexKeywords = ['window function', 'cte', 'recursive', 'pivot', 'advanced', 'complex'];
        const hasComplexContent = complexKeywords.some(keyword => 
            problem.description.toLowerCase().includes(keyword)
        );
        
        if (hasComplexContent && problem.difficulty === 'Easy') {
            issues.push('Difficulty may be too low for complex content');
        }
    }
    
    return issues;
}

/**
 * 5. Execution Environment Validation
 */
async function validateExecutionEnvironment(problem) {
    const issues = [];
    
    try {
        const sessionId = `exec_test_${Date.now()}_${problem.numeric_id}`;
        
        // Test valid query
        const validResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
            sql: 'SELECT COUNT(*) as total FROM (SELECT 1) t',
            dialect: 'postgresql',
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (!validResponse.ok) {
            issues.push('Cannot execute valid queries');
        }
        
        // Test syntax error handling
        const errorResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
            sql: 'SELCT invalid syntax',
            dialect: 'postgresql',
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (errorResponse.ok && !errorResponse.data.error && !errorResponse.data.data?.feedback?.includes('error')) {
            issues.push('Syntax errors not properly handled');
        }
        
        // Test environment setup
        const setupResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}/setup`, 'POST', {
            dialect: 'postgresql'
        });
        
        if (!setupResponse.ok) {
            issues.push('Problem environment setup not working');
        }
        
    } catch (error) {
        issues.push(`Execution environment error: ${error.message}`);
    }
    
    return issues;
}

/**
 * 6. Validation System Check
 */
async function validateValidationSystem(problem) {
    const issues = [];
    
    try {
        const sessionId = `validation_test_${Date.now()}_${problem.numeric_id}`;
        
        // Get problem schema to check expected output
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (schemaResponse.ok && schemaResponse.data.schema?.expected_output) {
            // Test with intentionally wrong query
            const wrongResponse = await makeRequest(`${BASE_URL}/execute/sql`, 'POST', {
                sql: 'SELECT 999 as wrong_result',
                dialect: 'postgresql', 
                problemNumericId: problem.numeric_id
            }, { 'X-Session-ID': sessionId });
            
            if (wrongResponse.ok) {
                const data = wrongResponse.data.data || wrongResponse.data;
                
                // Should be marked as incorrect
                if (data.isCorrect === true) {
                    issues.push('Validation not working - wrong query marked as correct');
                }
                
                if (!data.feedback || data.feedback === 'Query executed successfully') {
                    issues.push('Validation feedback not informative');
                }
            }
        } else {
            issues.push('Cannot test validation - no expected output available');
        }
        
    } catch (error) {
        issues.push(`Validation system error: ${error.message}`);
    }
    
    return issues;
}

/**
 * 7. Learning Aids Validation
 */
async function validateLearningAids(problem) {
    const issues = [];
    
    // Check hints system
    try {
        const hintsResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}/hints`);
        
        if (!hintsResponse.ok) {
            issues.push('Hints system not accessible');
        } else if (!hintsResponse.data.hints || hintsResponse.data.hints.length === 0) {
            issues.push('No hints available');
        }
    } catch (error) {
        issues.push('Hints system error');
    }
    
    // Check solution availability
    if (!problem.description || !problem.description.includes('Show Solution')) {
        // This is checked in the UI, so we'll note it
        issues.push('Solution accessibility unclear');
    }
    
    return issues;
}

/**
 * 8. User Experience Validation
 */
async function validateUserExperience(problem) {
    const issues = [];
    
    try {
        // Test progress tracking
        const sessionId = `ux_test_${Date.now()}_${problem.numeric_id}`;
        
        // Test bookmark functionality
        const bookmarkResponse = await makeRequest(`${BASE_URL}/bookmarks`, 'POST', {
            problemId: problem.id,
            problemNumericId: problem.numeric_id
        }, { 'X-Session-ID': sessionId });
        
        if (!bookmarkResponse.ok) {
            issues.push('Bookmark functionality not working');
        }
        
        // Test progress tracking
        const progressResponse = await makeRequest(`${BASE_URL}/progress`, 'GET', null, { 'X-Session-ID': sessionId });
        
        if (!progressResponse.ok) {
            issues.push('Progress tracking not working');
        }
        
    } catch (error) {
        issues.push(`UX validation error: ${error.message}`);
    }
    
    // Check navigation
    if (!problem.numeric_id || problem.numeric_id < 1 || problem.numeric_id > 70) {
        issues.push('Invalid problem numbering for navigation');
    }
    
    return issues;
}

/**
 * 9. Frontend Sample Data Display Validation
 */
async function validateFrontendDataDisplay(problem) {
    const issues = [];
    
    try {
        const schemaResponse = await makeRequest(`${BASE_URL}/sql/problems/${problem.numeric_id}`);
        
        if (schemaResponse.ok && schemaResponse.data.schema?.setup_sql) {
            const setupSql = schemaResponse.data.schema.setup_sql;
            
            // Test the regex patterns we fixed
            const insertMatches = [...setupSql.matchAll(/INSERT INTO\s+(\w+)\s+VALUES\s+([\s\S]*?);/g)];
            
            if (setupSql.includes('INSERT INTO') && insertMatches.length === 0) {
                issues.push('Frontend sample data parsing may fail - regex pattern issues');
            }
            
            // Check for complex INSERT patterns that might break parsing
            if (setupSql.includes('INSERT INTO') && setupSql.includes('\n')) {
                const testRows = [...setupSql.matchAll(/\(([\s\S]*?)\)/g)];
                if (testRows.length === 0) {
                    issues.push('Frontend cannot parse multi-line INSERT statements');
                }
            }
        }
    } catch (error) {
        issues.push(`Frontend display validation error: ${error.message}`);
    }
    
    return issues;
}

/**
 * Main validation function for a single problem
 */
async function validateProblem(problem) {
    console.log(`\\n🔍 Validating Problem #${problem.numeric_id}: ${problem.title}`);
    
    const allIssues = [];
    
    // Run all validation checks
    const checks = [
        { name: 'Problem Statement', fn: validateProblemStatement },
        { name: 'Schema & Data', fn: validateSchemaAndData },
        { name: 'Input/Output Spec', fn: validateInputOutputSpec },
        { name: 'Difficulty & Skills', fn: validateDifficultyAndSkills },
        { name: 'Execution Environment', fn: validateExecutionEnvironment },
        { name: 'Validation System', fn: validateValidationSystem },
        { name: 'Learning Aids', fn: validateLearningAids },
        { name: 'User Experience', fn: validateUserExperience },
        { name: 'Frontend Display', fn: validateFrontendDataDisplay }
    ];
    
    for (const check of checks) {
        try {
            const issues = await check.fn(problem);
            if (issues.length > 0) {
                allIssues.push(...issues.map(issue => `[${check.name}] ${issue}`));
            } else {
                console.log(`   ✅ ${check.name}`);
            }
        } catch (error) {
            allIssues.push(`[${check.name}] Validation failed: ${error.message}`);
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Store results
    validationResults.problems[problem.numeric_id] = {
        title: problem.title,
        issues: allIssues,
        passed: allIssues.length === 0
    };
    
    if (allIssues.length === 0) {
        console.log(`   🎉 Problem #${problem.numeric_id} PASSED all checks`);
        validationResults.summary.passed++;
    } else {
        console.log(`   ❌ Problem #${problem.numeric_id} has ${allIssues.length} issues:`);
        allIssues.forEach(issue => console.log(`      - ${issue}`));
        validationResults.summary.failed++;
        validationResults.summary.issues.push(...allIssues);
    }
}

/**
 * Generate comprehensive report
 */
function generateReport() {
    console.log('\\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE VALIDATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\\n📈 Overall Statistics:`);
    console.log(`   Total Problems: ${validationResults.summary.total}`);
    console.log(`   Passed: ${validationResults.summary.passed} (${Math.round(validationResults.summary.passed / validationResults.summary.total * 100)}%)`);
    console.log(`   Failed: ${validationResults.summary.failed} (${Math.round(validationResults.summary.failed / validationResults.summary.total * 100)}%)`);
    console.log(`   Total Issues: ${validationResults.summary.issues.length}`);
    
    // Issue categories summary
    const issueCategories = {};
    validationResults.summary.issues.forEach(issue => {
        const category = issue.split(']')[0] + ']';
        issueCategories[category] = (issueCategories[category] || 0) + 1;
    });
    
    console.log(`\\n🏷️  Issues by Category:`);
    Object.entries(issueCategories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
            console.log(`   ${category}: ${count} issues`);
        });
    
    // Most common issues
    const issueCounts = {};
    validationResults.summary.issues.forEach(issue => {
        const cleanIssue = issue.replace(/\\[.*?\\]\\s*/, '');
        issueCounts[cleanIssue] = (issueCounts[cleanIssue] || 0) + 1;
    });
    
    console.log(`\\n🔥 Most Common Issues:`);
    Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([issue, count]) => {
            console.log(`   ${count}x: ${issue}`);
        });
    
    // Failed problems summary
    const failedProblems = Object.entries(validationResults.problems)
        .filter(([_, data]) => !data.passed)
        .sort((a, b) => b[1].issues.length - a[1].issues.length);
    
    console.log(`\\n❌ Problems with Most Issues:`);
    failedProblems.slice(0, 10).forEach(([problemId, data]) => {
        console.log(`   Problem #${problemId}: ${data.title} (${data.issues.length} issues)`);
    });
    
    // Priority recommendations
    console.log(`\\n🎯 Priority Recommendations:`);
    console.log(`   1. Fix validation system issues (${(issueCategories['[Validation System]'] || 0)} problems affected)`);
    console.log(`   2. Add missing expected outputs (${(issueCategories['[Schema & Data]'] || 0)} problems affected)`);
    console.log(`   3. Improve problem statements (${(issueCategories['[Problem Statement]'] || 0)} problems affected)`);
    console.log(`   4. Fix execution environment (${(issueCategories['[Execution Environment]'] || 0)} problems affected)`);
    console.log(`   5. Add learning aids (${(issueCategories['[Learning Aids]'] || 0)} problems affected)`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting Comprehensive SQL Practice Platform Validation');
    console.log('This will check all 70 problems against a detailed quality checklist\\n');
    
    try {
        // Get all problems
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
        
        // Validate each problem
        for (const problem of problems) {
            await validateProblem(problem);
        }
        
        // Generate report
        generateReport();
        
        console.log(`\\n✅ Validation completed!`);
        console.log(`\\n💡 Next steps:`);
        console.log(`   1. Address high-priority issues first`);
        console.log(`   2. Focus on problems with most issues`);
        console.log(`   3. Run this validation script regularly`);
        console.log(`   4. Consider automated quality gates for new problems`);
        
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

module.exports = { validateProblem, generateReport };