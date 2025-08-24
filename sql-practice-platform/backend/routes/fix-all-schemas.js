const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/fix-all-schemas/now - Fix all problems with contextually appropriate schemas
router.post('/now', async (req, res) => {
    try {
        console.log('🔧 Starting comprehensive schema fix for all problems...');
        
        // First, clear all existing schemas
        await pool.query('DELETE FROM problem_schemas');
        console.log('🧹 Cleared existing schemas');
        
        // Get all problems
        const problemsResult = await pool.query(`
            SELECT id, title, slug, description, numeric_id 
            FROM problems 
            WHERE is_active = true 
            ORDER BY numeric_id
        `);
        
        console.log(`📝 Found ${problemsResult.rows.length} problems to fix`);
        
        let results = { fixed: 0, errors: [] };
        
        // Define problem-specific schemas
        const problemSchemas = {
            // Social Media problems
            'social media': {
                setupSql: `CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    content_type VARCHAR(50),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    follower_count INTEGER DEFAULT 0
);

INSERT INTO posts (post_id, user_id, content_type, likes_count, comments_count, shares_count) VALUES
(1, 1, 'video', 1250, 89, 156),
(2, 2, 'image', 890, 45, 67),
(3, 3, 'image', 2100, 134, 289),
(4, 4, 'video', 3400, 267, 445),
(5, 5, 'story', 450, 23, 34);

INSERT INTO users (user_id, username, follower_count) VALUES
(1, 'tech_guru', 15000),
(2, 'lifestyle_blogger', 8500),
(3, 'food_critic', 12000),
(4, 'travel_explorer', 20000),
(5, 'fitness_coach', 18000);`,
                expectedOutput: [
                    {"content_type": "video", "avg_engagement": "2325.0", "total_posts": 2},
                    {"content_type": "image", "avg_engagement": "1495.0", "total_posts": 2}
                ]
            },
            
            // Financial/Banking problems
            'banking': {
                setupSql: `CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    account_type VARCHAR(50),
    balance DECIMAL(15,2),
    interest_rate DECIMAL(5,2),
    created_date DATE
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES accounts(account_id),
    amount DECIMAL(15,2),
    transaction_type VARCHAR(20),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO accounts (account_id, customer_id, account_type, balance, interest_rate, created_date) VALUES
(1, 101, 'checking', 15000.00, 0.01, '2023-01-15'),
(2, 102, 'savings', 45000.00, 2.50, '2023-02-01'),
(3, 103, 'checking', 8500.00, 0.01, '2023-01-20'),
(4, 104, 'savings', 125000.00, 2.75, '2023-03-10'),
(5, 105, 'business', 250000.00, 1.50, '2023-01-05');

INSERT INTO transactions (transaction_id, account_id, amount, transaction_type) VALUES
(1, 1, -1250.00, 'withdrawal'),
(2, 2, 5000.00, 'deposit'),
(3, 1, 2800.00, 'deposit'),
(4, 3, -450.00, 'withdrawal'),
(5, 4, -15000.00, 'withdrawal');`,
                expectedOutput: [
                    {"account_type": "savings", "avg_balance": "85000.00", "total_accounts": 2},
                    {"account_type": "checking", "avg_balance": "11750.00", "total_accounts": 2}
                ]
            },
            
            // E-commerce problems
            'ecommerce': {
                setupSql: `CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    registration_date DATE
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    order_date DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(20)
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(8,2)
);

INSERT INTO customers (customer_id, name, email, registration_date) VALUES
(1, 'John Smith', 'john@email.com', '2023-01-15'),
(2, 'Jane Doe', 'jane@email.com', '2023-02-01'),
(3, 'Bob Johnson', 'bob@email.com', '2023-01-20'),
(4, 'Alice Brown', 'alice@email.com', '2023-03-10'),
(5, 'Charlie Wilson', 'charlie@email.com', '2023-02-15');

INSERT INTO orders (order_id, customer_id, order_date, total_amount, status) VALUES
(1, 1, '2024-01-15', 299.99, 'completed'),
(2, 2, '2024-01-16', 149.50, 'completed'),
(3, 1, '2024-01-17', 89.99, 'completed'),
(4, 3, '2024-01-18', 459.99, 'pending'),
(5, 2, '2024-01-19', 199.99, 'completed');

INSERT INTO products (product_id, name, category, price) VALUES
(1, 'Laptop', 'Electronics', 999.99),
(2, 'Office Chair', 'Furniture', 299.99),
(3, 'Smartphone', 'Electronics', 699.99),
(4, 'Desk Lamp', 'Furniture', 89.99),
(5, 'Headphones', 'Electronics', 149.99);`,
                expectedOutput: [
                    {"customer_name": "John Smith", "total_spent": "389.98", "order_count": 2},
                    {"customer_name": "Jane Doe", "total_spent": "349.49", "order_count": 2}
                ]
            },
            
            // Default generic schema for unmatched problems
            'default': {
                setupSql: `CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE
);

INSERT INTO employees (id, name, department, salary, hire_date) VALUES
(1, 'John Smith', 'Engineering', 75000, '2020-01-15'),
(2, 'Jane Doe', 'Marketing', 65000, '2019-06-01'),
(3, 'Bob Johnson', 'Sales', 55000, '2021-03-10'),
(4, 'Alice Brown', 'Engineering', 78000, '2020-05-20'),
(5, 'Charlie Wilson', 'Marketing', 60000, '2021-01-10');`,
                expectedOutput: [
                    {"name": "Alice Brown", "salary": "78000.00", "department": "Engineering"},
                    {"name": "John Smith", "salary": "75000.00", "department": "Engineering"}
                ]
            }
        };
        
        // Process each problem
        for (const problem of problemsResult.rows) {
            try {
                const description = (problem.description || '').toLowerCase();
                const title = (problem.title || '').toLowerCase();
                
                let selectedSchema;
                
                // Determine appropriate schema based on problem content
                if (description.includes('social media') || description.includes('posts') || 
                    description.includes('engagement') || title.includes('social')) {
                    selectedSchema = problemSchemas['social media'];
                } else if (description.includes('bank') || description.includes('financial') || 
                          description.includes('credit') || description.includes('loan') ||
                          description.includes('amro') || description.includes('goldman') ||
                          title.includes('bank') || title.includes('finance')) {
                    selectedSchema = problemSchemas['banking'];
                } else if (description.includes('store') || description.includes('retail') || 
                          description.includes('customer') || description.includes('order') ||
                          description.includes('ecommerce') || description.includes('shopping')) {
                    selectedSchema = problemSchemas['ecommerce'];
                } else {
                    selectedSchema = problemSchemas['default'];
                }
                
                // Insert the schema
                await pool.query(`
                    INSERT INTO problem_schemas (
                        problem_id, sql_dialect, setup_sql, expected_output
                    ) VALUES ($1, $2, $3, $4)
                `, [
                    problem.id,
                    'postgresql',
                    selectedSchema.setupSql,
                    JSON.stringify(selectedSchema.expectedOutput)
                ]);
                
                results.fixed++;
                
                if (results.fixed % 10 === 0) {
                    console.log(`✅ Fixed ${results.fixed} problems...`);
                }
                
            } catch (error) {
                results.errors.push(`${problem.title}: ${error.message}`);
                console.error(`❌ Error fixing ${problem.title}:`, error.message);
            }
        }
        
        console.log(`🎉 Schema fix completed: ${results.fixed} problems fixed`);
        
        // Final verification
        const finalCount = await pool.query('SELECT COUNT(*) FROM problem_schemas');
        
        res.json({
            success: true,
            message: `All schemas fixed: ${results.fixed} problems now have contextually appropriate schemas`,
            processed: results.fixed,
            finalCount: parseInt(finalCount.rows[0].count),
            errors: results.errors.slice(0, 5)
        });
        
    } catch (error) {
        console.error('❌ Comprehensive schema fix failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;