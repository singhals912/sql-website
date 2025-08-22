#!/usr/bin/env node
/**
 * Add More Clean Problem Replacements
 * 
 * Create 10 more clean, working problems to replace problematic ones
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

const sandboxPool = new Pool({
    host: 'localhost',
    port: 5433,
    database: 'sandbox',
    user: 'postgres',
    password: 'password'
});

const BASE_URL = 'http://localhost:5001/api';

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

async function updateProblemSchema(problemId, title, description, setupSql, solutionSql) {
    try {
        await mainPool.query(`
            UPDATE problems 
            SET title = $1, description = $2
            WHERE numeric_id = $3
        `, [title, description, problemId]);
        
        await mainPool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1, solution_sql = $2, expected_output = NULL
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $3) 
            AND sql_dialect = 'postgresql'
        `, [setupSql, solutionSql, problemId]);
        
        return true;
    } catch (error) {
        console.error(`Failed to update problem ${problemId}:`, error.message);
        return false;
    }
}

async function updateExpectedOutput(problemId, expectedOutput) {
    try {
        const formattedOutput = expectedOutput.map(row => {
            return Object.values(row).map(val => val !== null ? String(val) : null);
        });
        
        const jsonOutput = JSON.stringify(formattedOutput);
        
        await mainPool.query(`
            UPDATE problem_schemas 
            SET expected_output = $1::jsonb
            WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2) 
            AND sql_dialect = 'postgresql'
        `, [jsonOutput, problemId]);
        
        return true;
    } catch (error) {
        console.error(`Failed to update expected output for problem ${problemId}:`, error.message);
        return false;
    }
}

async function setupProblemEnvironment(problemId) {
    try {
        const response = await makeRequest(`${BASE_URL}/sql/problems/${problemId}/setup`, 'POST', {
            dialect: 'postgresql'
        });
        return { success: response.ok, error: response.data?.error };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function executeSolutionSQL(solutionSql) {
    try {
        const result = await sandboxPool.query(solutionSql);
        return { success: true, rows: result.rows };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Additional clean problems
const additionalProblems = {
    18: {
        title: "Restaurant Chain Sales Analysis",
        description: `Business Context: A restaurant chain wants to analyze sales performance across different locations and menu categories to optimize their operations and menu offerings.

Scenario: You're a business analyst for a growing restaurant chain. The management team needs insights into sales patterns, popular menu items, and location performance to make strategic decisions.

Problem: Analyze restaurant sales data to identify top-performing locations, popular menu categories, and sales trends. Calculate average order values and identify growth opportunities.

Expected Output: Sales performance metrics by location and menu category, sorted by total revenue.`,
        setupSql: `
CREATE TABLE restaurants (
    restaurant_id INT PRIMARY KEY,
    restaurant_name VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    opening_date DATE
);

CREATE TABLE menu_items (
    item_id INT PRIMARY KEY,
    item_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(6,2)
);

CREATE TABLE sales (
    sale_id INT PRIMARY KEY,
    restaurant_id INT,
    item_id INT,
    sale_date DATE,
    quantity INT,
    total_amount DECIMAL(8,2),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

INSERT INTO restaurants VALUES
(1, 'Downtown Bistro', 'New York', 'NY', '2022-01-15'),
(2, 'Sunset Grill', 'Los Angeles', 'CA', '2022-03-20'),
(3, 'City Center Cafe', 'Chicago', 'IL', '2022-02-10'),
(4, 'Harbor View Restaurant', 'Miami', 'FL', '2022-04-05');

INSERT INTO menu_items VALUES
(1, 'Grilled Salmon', 'Main Course', 24.99),
(2, 'Caesar Salad', 'Appetizer', 12.99),
(3, 'Chocolate Cake', 'Dessert', 8.99),
(4, 'Pasta Primavera', 'Main Course', 18.99),
(5, 'Chicken Wings', 'Appetizer', 14.99),
(6, 'Tiramisu', 'Dessert', 9.99);

INSERT INTO sales VALUES
(1, 1, 1, '2024-05-01', 2, 49.98),
(2, 1, 2, '2024-05-01', 1, 12.99),
(3, 2, 4, '2024-05-02', 3, 56.97),
(4, 2, 5, '2024-05-02', 2, 29.98),
(5, 3, 1, '2024-05-03', 1, 24.99),
(6, 3, 6, '2024-05-03', 2, 19.98),
(7, 4, 2, '2024-05-04', 2, 25.98),
(8, 4, 3, '2024-05-04', 1, 8.99),
(9, 1, 4, '2024-05-05', 2, 37.98),
(10, 2, 1, '2024-05-05', 1, 24.99);`,
        solutionSql: `
SELECT 
    r.city,
    m.category,
    COUNT(s.sale_id) as total_orders,
    SUM(s.quantity) as total_items_sold,
    ROUND(SUM(s.total_amount), 2) as total_revenue,
    ROUND(AVG(s.total_amount), 2) as avg_order_value
FROM restaurants r
JOIN sales s ON r.restaurant_id = s.restaurant_id
JOIN menu_items m ON s.item_id = m.item_id
GROUP BY r.city, m.category
ORDER BY total_revenue DESC;`
    },
    
    24: {
        title: "Online Learning Platform Analytics",
        description: `Business Context: An online education platform wants to analyze student engagement and course performance to improve content delivery and student outcomes.

Scenario: You're a data analyst for an e-learning platform. The education team needs insights into course completion rates, student engagement, and content effectiveness.

Problem: Analyze student learning data to identify popular courses, completion patterns, and engagement metrics. Calculate success rates and identify areas for improvement.

Expected Output: Course performance analytics showing enrollment, completion rates, and engagement metrics.`,
        setupSql: `
CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    course_title VARCHAR(100),
    instructor VARCHAR(100),
    category VARCHAR(50),
    difficulty_level VARCHAR(20),
    price DECIMAL(8,2)
);

CREATE TABLE students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100),
    email VARCHAR(100),
    registration_date DATE,
    subscription_type VARCHAR(20)
);

CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY,
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    completion_status VARCHAR(20),
    progress_percentage INT,
    hours_studied DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

INSERT INTO courses VALUES
(1, 'Python for Beginners', 'Dr. Sarah Johnson', 'Programming', 'Beginner', 99.99),
(2, 'Advanced SQL Queries', 'Prof. Mike Chen', 'Database', 'Advanced', 149.99),
(3, 'Web Development Basics', 'Lisa Rodriguez', 'Web Dev', 'Beginner', 79.99),
(4, 'Data Science Fundamentals', 'Dr. Alex Kim', 'Data Science', 'Intermediate', 199.99);

INSERT INTO students VALUES
(1, 'John Smith', 'john@email.com', '2024-01-15', 'Premium'),
(2, 'Emma Wilson', 'emma@email.com', '2024-02-20', 'Basic'),
(3, 'David Brown', 'david@email.com', '2024-03-10', 'Premium'),
(4, 'Jessica Lee', 'jessica@email.com', '2024-01-25', 'Basic'),
(5, 'Mark Taylor', 'mark@email.com', '2024-04-05', 'Premium');

INSERT INTO enrollments VALUES
(1, 1, 1, '2024-05-01', 'Completed', 100, 25.5),
(2, 1, 3, '2024-05-05', 'In Progress', 60, 15.0),
(3, 2, 1, '2024-05-02', 'Completed', 100, 30.0),
(4, 3, 2, '2024-05-03', 'In Progress', 75, 40.5),
(5, 3, 4, '2024-05-04', 'Completed', 100, 50.0),
(6, 4, 3, '2024-05-06', 'In Progress', 45, 12.0),
(7, 5, 1, '2024-05-07', 'Completed', 100, 28.0),
(8, 5, 2, '2024-05-08', 'In Progress', 30, 18.5);`,
        solutionSql: `
SELECT 
    c.category,
    c.difficulty_level,
    COUNT(e.enrollment_id) as total_enrollments,
    COUNT(CASE WHEN e.completion_status = 'Completed' THEN 1 END) as completions,
    ROUND(
        COUNT(CASE WHEN e.completion_status = 'Completed' THEN 1 END) * 100.0 / COUNT(e.enrollment_id), 
        2
    ) as completion_rate,
    ROUND(AVG(e.hours_studied), 2) as avg_study_hours
FROM courses c
JOIN enrollments e ON c.course_id = e.course_id
GROUP BY c.category, c.difficulty_level
ORDER BY completion_rate DESC;`
    },
    
    27: {
        title: "Manufacturing Quality Control Analysis",
        description: `Business Context: A manufacturing company needs to analyze production quality metrics to identify defect patterns, improve processes, and maintain high quality standards.

Scenario: You're a quality assurance analyst in a manufacturing plant. The production team needs insights into defect rates, production efficiency, and quality trends across different product lines.

Problem: Analyze quality control data to identify defect patterns, calculate quality scores, and determine which production lines need attention.

Expected Output: Quality metrics by production line and defect type, showing defect rates and quality scores.`,
        setupSql: `
CREATE TABLE production_lines (
    line_id INT PRIMARY KEY,
    line_name VARCHAR(100),
    product_type VARCHAR(50),
    capacity_per_hour INT,
    supervisor VARCHAR(100)
);

CREATE TABLE quality_inspections (
    inspection_id INT PRIMARY KEY,
    line_id INT,
    inspection_date DATE,
    units_produced INT,
    units_passed INT,
    defect_type VARCHAR(50),
    defect_count INT,
    inspector_name VARCHAR(100),
    FOREIGN KEY (line_id) REFERENCES production_lines(line_id)
);

INSERT INTO production_lines VALUES
(1, 'Assembly Line A', 'Electronics', 100, 'Maria Garcia'),
(2, 'Assembly Line B', 'Electronics', 120, 'James Wilson'),
(3, 'Packaging Line 1', 'Consumer Goods', 200, 'Sarah Johnson'),
(4, 'Packaging Line 2', 'Consumer Goods', 180, 'David Chen');

INSERT INTO quality_inspections VALUES
(1, 1, '2024-05-01', 800, 785, 'Component Failure', 15, 'Inspector A'),
(2, 1, '2024-05-02', 820, 810, 'Assembly Error', 10, 'Inspector A'),
(3, 2, '2024-05-01', 960, 945, 'Component Failure', 12, 'Inspector B'),
(4, 2, '2024-05-02', 940, 932, 'Wiring Issue', 8, 'Inspector B'),
(5, 3, '2024-05-01', 1600, 1590, 'Packaging Defect', 10, 'Inspector C'),
(6, 3, '2024-05-02', 1580, 1575, 'Label Error', 5, 'Inspector C'),
(7, 4, '2024-05-01', 1440, 1430, 'Packaging Defect', 8, 'Inspector D'),
(8, 4, '2024-05-02', 1460, 1455, 'Seal Issue', 5, 'Inspector D');`,
        solutionSql: `
SELECT 
    pl.product_type,
    qi.defect_type,
    COUNT(qi.inspection_id) as inspection_count,
    SUM(qi.units_produced) as total_units_produced,
    SUM(qi.defect_count) as total_defects,
    ROUND(
        SUM(qi.defect_count) * 100.0 / SUM(qi.units_produced), 
        3
    ) as defect_rate_percentage,
    ROUND(
        SUM(qi.units_passed) * 100.0 / SUM(qi.units_produced), 
        2
    ) as pass_rate_percentage
FROM production_lines pl
JOIN quality_inspections qi ON pl.line_id = qi.line_id
GROUP BY pl.product_type, qi.defect_type
ORDER BY defect_rate_percentage DESC;`
    },
    
    30: {
        title: "Hospital Patient Care Analytics",
        description: `Business Context: A hospital system wants to analyze patient care metrics to improve treatment outcomes, optimize resource allocation, and enhance patient satisfaction.

Scenario: You're a healthcare data analyst working with hospital administration. The medical team needs insights into patient outcomes, treatment effectiveness, and resource utilization.

Problem: Analyze patient care data to identify treatment success rates, average stay durations, and department performance metrics.

Expected Output: Healthcare analytics showing patient outcomes and department performance metrics.`,
        setupSql: `
CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100),
    head_doctor VARCHAR(100),
    bed_capacity INT
);

CREATE TABLE patients (
    patient_id INT PRIMARY KEY,
    patient_name VARCHAR(100),
    age INT,
    admission_date DATE,
    discharge_date DATE,
    dept_id INT,
    treatment_outcome VARCHAR(20),
    satisfaction_score INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

INSERT INTO departments VALUES
(1, 'Cardiology', 'Dr. Sarah Heart', 30),
(2, 'Orthopedics', 'Dr. Mike Bone', 25),
(3, 'Emergency', 'Dr. Lisa Quick', 40),
(4, 'Pediatrics', 'Dr. Alex Child', 20);

INSERT INTO patients VALUES
(1, 'John Smith', 65, '2024-04-15', '2024-04-20', 1, 'Recovered', 9),
(2, 'Emma Wilson', 45, '2024-04-16', '2024-04-18', 2, 'Recovered', 8),
(3, 'David Brown', 30, '2024-04-17', '2024-04-17', 3, 'Recovered', 7),
(4, 'Jessica Lee', 8, '2024-04-18', '2024-04-22', 4, 'Recovered', 10),
(5, 'Mark Taylor', 55, '2024-04-19', '2024-04-25', 1, 'Improved', 8),
(6, 'Anna Davis', 35, '2024-04-20', '2024-04-23', 2, 'Recovered', 9),
(7, 'Robert Wilson', 70, '2024-04-21', '2024-04-21', 3, 'Stable', 6),
(8, 'Maria Garcia', 12, '2024-04-22', '2024-04-24', 4, 'Recovered', 9);`,
        solutionSql: `
SELECT 
    d.dept_name,
    COUNT(p.patient_id) as total_patients,
    ROUND(AVG(p.discharge_date - p.admission_date), 1) as avg_stay_days,
    COUNT(CASE WHEN p.treatment_outcome = 'Recovered' THEN 1 END) as recovered_patients,
    ROUND(
        COUNT(CASE WHEN p.treatment_outcome = 'Recovered' THEN 1 END) * 100.0 / COUNT(p.patient_id), 
        2
    ) as recovery_rate_percentage,
    ROUND(AVG(p.satisfaction_score), 1) as avg_satisfaction_score
FROM departments d
JOIN patients p ON d.dept_id = p.dept_id
GROUP BY d.dept_name
ORDER BY recovery_rate_percentage DESC;`
    },
    
    32: {
        title: "Real Estate Market Analysis",
        description: `Business Context: A real estate agency wants to analyze property market trends to help clients make informed buying and selling decisions and optimize their pricing strategies.

Scenario: You're a market analyst for a real estate company. The sales team needs insights into property values, market trends, and neighborhood performance to guide client recommendations.

Problem: Analyze real estate transaction data to identify price trends, popular neighborhoods, and property characteristics that affect market value.

Expected Output: Market analysis showing price trends and property performance metrics by location and type.`,
        setupSql: `
CREATE TABLE neighborhoods (
    neighborhood_id INT PRIMARY KEY,
    neighborhood_name VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    avg_income DECIMAL(10,2)
);

CREATE TABLE properties (
    property_id INT PRIMARY KEY,
    neighborhood_id INT,
    property_type VARCHAR(50),
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    square_feet INT,
    sale_price DECIMAL(12,2),
    sale_date DATE,
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(neighborhood_id)
);

INSERT INTO neighborhoods VALUES
(1, 'Downtown', 'Seattle', 'WA', 85000.00),
(2, 'Suburb Hills', 'Seattle', 'WA', 95000.00),
(3, 'Riverside', 'Seattle', 'WA', 75000.00),
(4, 'Tech District', 'Seattle', 'WA', 120000.00);

INSERT INTO properties VALUES
(1, 1, 'Condo', 2, 2.0, 1200, 650000.00, '2024-04-15'),
(2, 1, 'Condo', 1, 1.0, 800, 450000.00, '2024-04-18'),
(3, 2, 'Single Family', 4, 3.0, 2500, 850000.00, '2024-04-20'),
(4, 2, 'Single Family', 3, 2.5, 2000, 720000.00, '2024-04-22'),
(5, 3, 'Townhouse', 3, 2.5, 1800, 580000.00, '2024-04-25'),
(6, 3, 'Townhouse', 2, 2.0, 1500, 480000.00, '2024-04-28'),
(7, 4, 'Condo', 2, 2.0, 1100, 780000.00, '2024-05-01'),
(8, 4, 'Single Family', 3, 2.5, 1900, 920000.00, '2024-05-03');`,
        solutionSql: `
SELECT 
    n.neighborhood_name,
    p.property_type,
    COUNT(p.property_id) as properties_sold,
    ROUND(AVG(p.sale_price), 0) as avg_sale_price,
    ROUND(AVG(p.sale_price / p.square_feet), 2) as price_per_sqft,
    ROUND(AVG(p.square_feet), 0) as avg_square_feet
FROM neighborhoods n
JOIN properties p ON n.neighborhood_id = p.neighborhood_id
GROUP BY n.neighborhood_name, p.property_type
ORDER BY avg_sale_price DESC;`
    }
};

async function replaceProblems() {
    console.log('🚀 Adding More Clean Problem Replacements');
    console.log('🎯 Target: Replace 5 more problematic problems with clean solutions\\n');
    
    let replaced = 0;
    let failed = 0;
    
    for (const [problemId, problem] of Object.entries(additionalProblems)) {
        console.log(`\\n🔧 Replacing Problem #${problemId}: ${problem.title}...`);
        
        try {
            // Update the problem schema
            const updateSuccess = await updateProblemSchema(
                problemId,
                problem.title,
                problem.description,
                problem.setupSql,
                problem.solutionSql
            );
            
            if (!updateSuccess) {
                console.log('   ❌ Failed to update problem schema');
                failed++;
                continue;
            }
            
            console.log('   ✅ Problem schema updated');
            
            // Wait and test setup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('   🔧 Testing setup...');
            const setupTest = await setupProblemEnvironment(problemId);
            
            if (!setupTest.success) {
                console.log(`   ❌ Setup failed: ${setupTest.error}`);
                failed++;
                continue;
            }
            
            console.log('   ✅ Setup successful');
            
            // Test solution
            console.log('   🔧 Testing solution...');
            const solutionTest = await executeSolutionSQL(problem.solutionSql);
            
            if (!solutionTest.success) {
                console.log(`   ❌ Solution failed: ${solutionTest.error}`);
                failed++;
                continue;
            }
            
            if (!solutionTest.rows || solutionTest.rows.length === 0) {
                console.log('   ❌ Solution returns no results');
                failed++;
                continue;
            }
            
            console.log(`   ✅ Solution works: ${solutionTest.rows.length} rows`);
            
            // Save expected output
            console.log('   💾 Saving expected output...');
            await updateExpectedOutput(problemId, solutionTest.rows);
            
            console.log(`   🎉 Problem #${problemId} REPLACED successfully!`);
            replaced++;
            
            // Delay between problems
            await new Promise(resolve => setTimeout(resolve, 1500));
            
        } catch (error) {
            console.log(`   💥 Error: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\\n' + '='.repeat(60));
    console.log('📊 ADDITIONAL REPLACEMENTS REPORT');
    console.log('='.repeat(60));
    console.log(`\\n📈 Results:`);
    console.log(`   ✅ Successfully Replaced: ${replaced}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    const previousWorking = 41; // 37 + 4 from last batch
    const newWorking = replaced;
    const totalWorking = previousWorking + newWorking;
    
    console.log(`\\n🏆 Updated Platform Status:`);
    console.log(`   Previously Working: ${previousWorking} problems`);
    console.log(`   Newly Working: ${newWorking} problems`);
    console.log(`   Total Working: ${totalWorking}/70 problems (${Math.round(totalWorking/70*100)}%)`);
    
    let grade = 'F';
    const passRate = totalWorking / 70 * 100;
    if (passRate >= 85) grade = 'A';
    else if (passRate >= 75) grade = 'B';
    else if (passRate >= 65) grade = 'C';
    else if (passRate >= 55) grade = 'D';
    
    console.log(`   Platform Quality Grade: ${grade}`);
    
    if (replaced > 0) {
        console.log(`\\n🔄 Newly Replaced Problems:`);
        Object.entries(additionalProblems).forEach(([problemId, problem]) => {
            console.log(`   #${problemId}: ${problem.title}`);
        });
    }
}

async function main() {
    try {
        await replaceProblems();
    } catch (error) {
        console.error('💥 Process failed:', error);
    } finally {
        await mainPool.end();
        await sandboxPool.end();
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log('\\n🏁 Additional problem replacement completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}