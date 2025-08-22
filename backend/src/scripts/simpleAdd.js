#!/usr/bin/env node
/**
 * Simple Add - Just add 5 more problems using the existing schema format
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const executionPool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'password',
  database: 'sandbox'
});

const simpleProblems = [
  {
    title: "High Value Customers",
    slug: "high-value-customers",
    description: `**Scenario:** Airbnb wants to identify high-value customers for VIP treatment.

**Business Context:** Find customers who have made bookings worth more than $1000 in total.

**Problem:** Return customers with total booking value > $1000.

**Expected Output:** Return customer_id and total_spent, ordered by total_spent descending.`,
    difficulty: "easy",
    setupSql: `
      CREATE TABLE bookings (
          booking_id INT,
          customer_id INT,
          booking_amount DECIMAL(10,2),
          booking_date DATE
      );
      
      INSERT INTO bookings VALUES 
      (1, 101, 450.00, '2024-01-15'),
      (2, 102, 280.00, '2024-01-16'),
      (3, 101, 620.00, '2024-01-20'),
      (4, 103, 180.00, '2024-01-18'),
      (5, 102, 850.00, '2024-01-25'),
      (6, 104, 320.00, '2024-01-22');
    `,
    solutionSql: `
      SELECT 
        customer_id,
        SUM(booking_amount) as total_spent
      FROM bookings
      GROUP BY customer_id
      HAVING SUM(booking_amount) > 1000
      ORDER BY total_spent DESC;
    `,
    category: "Basic Queries"
  },

  {
    title: "Product Inventory Status",
    slug: "product-inventory-status", 
    description: `**Scenario:** Walmart needs to track inventory levels for restocking.

**Business Context:** Identify products that are low in stock (quantity < 50) or out of stock.

**Problem:** Find products with low inventory and categorize their status.

**Expected Output:** Return product_name, quantity, and status ('Out of Stock' if 0, 'Low Stock' if < 50, 'In Stock' otherwise).`,
    difficulty: "easy",
    setupSql: `
      CREATE TABLE inventory (
          product_id INT,
          product_name VARCHAR(100),
          quantity INT,
          reorder_point INT
      );
      
      INSERT INTO inventory VALUES 
      (1, 'Wireless Headphones', 0, 20),
      (2, 'Bluetooth Speaker', 15, 25),
      (3, 'Laptop Stand', 75, 30),
      (4, 'USB Cable', 5, 50),
      (5, 'Phone Case', 100, 40),
      (6, 'Screen Protector', 0, 20);
    `,
    solutionSql: `
      SELECT 
        product_name,
        quantity,
        CASE 
          WHEN quantity = 0 THEN 'Out of Stock'
          WHEN quantity < 50 THEN 'Low Stock'
          ELSE 'In Stock'
        END as status
      FROM inventory
      ORDER BY quantity;
    `,
    category: "Basic Queries"
  },

  {
    title: "User Engagement Metrics",
    slug: "user-engagement-metrics",
    description: `**Scenario:** LinkedIn wants to measure user engagement across different content types.

**Business Context:** Calculate average engagement rate (likes + comments) per post type.

**Problem:** Find average engagement for each post type.

**Expected Output:** Return post_type and avg_engagement, ordered by avg_engagement descending.`,
    difficulty: "easy", 
    setupSql: `
      CREATE TABLE posts (
          post_id INT,
          user_id INT,
          post_type VARCHAR(50),
          likes_count INT,
          comments_count INT,
          post_date DATE
      );
      
      INSERT INTO posts VALUES 
      (1, 101, 'article', 45, 12, '2024-01-15'),
      (2, 102, 'image', 23, 8, '2024-01-16'),
      (3, 103, 'video', 67, 15, '2024-01-17'),
      (4, 104, 'article', 34, 6, '2024-01-18'),
      (5, 105, 'image', 56, 11, '2024-01-19'),
      (6, 106, 'video', 89, 22, '2024-01-20');
    `,
    solutionSql: `
      SELECT 
        post_type,
        ROUND(AVG(likes_count + comments_count), 2) as avg_engagement
      FROM posts
      GROUP BY post_type
      ORDER BY avg_engagement DESC;
    `,
    category: "Aggregation"
  },

  {
    title: "Top Spending Customers by Month",
    slug: "top-spending-customers-by-month",
    description: `**Scenario:** Stripe wants to identify top spending customers each month for account management.

**Business Context:** Find the highest spending customer for each month in 2024.

**Problem:** Return the customer with the highest total spending for each month.

**Expected Output:** Return month, customer_id, and total_spent for top customer each month.`,
    difficulty: "medium",
    setupSql: `
      CREATE TABLE transactions (
          transaction_id INT,
          customer_id INT,
          amount DECIMAL(10,2),
          transaction_date DATE
      );
      
      INSERT INTO transactions VALUES 
      (1, 101, 1250.00, '2024-01-15'),
      (2, 102, 890.00, '2024-01-20'),
      (3, 103, 2100.00, '2024-01-25'),
      (4, 101, 650.00, '2024-02-10'),
      (5, 104, 1800.00, '2024-02-15'),
      (6, 102, 950.00, '2024-02-20'),
      (7, 103, 1200.00, '2024-02-25'),
      (8, 104, 750.00, '2024-03-05');
    `,
    solutionSql: `
      WITH monthly_spending AS (
        SELECT 
          TO_CHAR(transaction_date, 'YYYY-MM') as month,
          customer_id,
          SUM(amount) as total_spent
        FROM transactions
        GROUP BY TO_CHAR(transaction_date, 'YYYY-MM'), customer_id
      ),
      ranked_customers AS (
        SELECT 
          month,
          customer_id,
          total_spent,
          ROW_NUMBER() OVER (PARTITION BY month ORDER BY total_spent DESC) as rank
        FROM monthly_spending
      )
      SELECT month, customer_id, total_spent
      FROM ranked_customers
      WHERE rank = 1
      ORDER BY month;
    `,
    category: "Window Functions"
  },

  {
    title: "Session Duration Analysis",
    slug: "session-duration-analysis",
    description: `**Scenario:** YouTube wants to analyze user session patterns for recommendation algorithms.

**Business Context:** Calculate session statistics including total time, average session duration, and user activity patterns.

**Problem:** Find users with average session duration > 30 minutes and total watch time > 2 hours.

**Expected Output:** Return user_id, session_count, total_minutes, and avg_session_duration for qualifying users.`,
    difficulty: "medium",
    setupSql: `
      CREATE TABLE user_sessions (
          session_id INT,
          user_id INT,
          start_time TIMESTAMP,
          end_time TIMESTAMP,
          videos_watched INT
      );
      
      INSERT INTO user_sessions VALUES 
      (1, 101, '2024-01-15 14:00:00', '2024-01-15 14:45:00', 3),
      (2, 102, '2024-01-15 15:00:00', '2024-01-15 15:20:00', 2),
      (3, 101, '2024-01-16 16:00:00', '2024-01-16 16:35:00', 4),
      (4, 103, '2024-01-16 17:00:00', '2024-01-16 18:30:00', 6),
      (5, 102, '2024-01-17 19:00:00', '2024-01-17 19:15:00', 1),
      (6, 101, '2024-01-17 20:00:00', '2024-01-17 20:40:00', 3),
      (7, 103, '2024-01-18 14:30:00', '2024-01-18 16:00:00', 8);
    `,
    solutionSql: `
      SELECT 
        user_id,
        COUNT(*) as session_count,
        SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60) as total_minutes,
        ROUND(AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60), 2) as avg_session_duration
      FROM user_sessions
      GROUP BY user_id
      HAVING AVG(EXTRACT(EPOCH FROM (end_time - start_time))/60) > 30 
        AND SUM(EXTRACT(EPOCH FROM (end_time - start_time))/60) > 120
      ORDER BY total_minutes DESC;
    `,
    category: "Time Analysis"
  }
];

async function addSimpleProblems() {
  console.log('🎯 Adding 5 simple problems without array issues...\n');
  
  const client = await pool.connect();
  
  try {
    let imported = 0;
    
    for (const problem of simpleProblems) {
      console.log(`📝 Adding: ${problem.title}`);
      
      try {
        await client.query('BEGIN');
        
        // Get or create category
        let categoryResult = await client.query(
          'SELECT id FROM categories WHERE name = $1',
          [problem.category]
        );
        
        let categoryId;
        if (categoryResult.rows.length === 0) {
          const newCategory = await client.query(`
            INSERT INTO categories (name, slug, description)
            VALUES ($1, $2, $3) RETURNING id
          `, [
            problem.category,
            problem.category.toLowerCase().replace(/\s+/g, '-'),
            `Problems related to ${problem.category}`
          ]);
          categoryId = newCategory.rows[0].id;
        } else {
          categoryId = categoryResult.rows[0].id;
        }
        
        // Insert problem WITHOUT tags field to avoid array issues
        const problemResult = await client.query(`
          INSERT INTO problems (
            title, slug, description, difficulty, category_id, 
            is_premium, is_active, total_submissions, total_accepted
          ) VALUES ($1, $2, $3, $4, $5, false, true, 0, 0)
          RETURNING id
        `, [
          problem.title,
          problem.slug, 
          problem.description,
          problem.difficulty,
          categoryId
        ]);
        
        const problemId = problemResult.rows[0].id;
        
        // Setup environment and generate expected output
        console.log('  🔧 Setting up environment...');
        const execClient = await executionPool.connect();
        try {
          await execClient.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
          await execClient.query(problem.setupSql);
          const result = await execClient.query(problem.solutionSql);
          
          const expectedOutput = result.rows.map(row => Object.values(row).map(cell => {
            if (cell === null) return null;
            if (cell instanceof Date) return cell.toISOString().split('T')[0];
            if (typeof cell === 'bigint') return cell.toString();
            if (typeof cell === 'number') return Number.isInteger(cell) ? cell.toString() : cell.toFixed(2);
            return String(cell).trim();
          }));
          
          // Insert problem schema WITHOUT hints to avoid array issues  
          await client.query(`
            INSERT INTO problem_schemas (
              problem_id, sql_dialect, setup_sql, solution_sql, 
              expected_output, explanation
            ) VALUES ($1, 'postgresql', $2, $3, $4::jsonb, $5)
          `, [
            problemId,
            problem.setupSql,
            problem.solutionSql,
            JSON.stringify(expectedOutput),
            `Solution uses ${problem.category.toLowerCase()} concepts to solve the business problem.`
          ]);
          
        } finally {
          execClient.release();
        }
        
        await client.query('COMMIT');
        console.log(`  ✅ Success!`);
        imported++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.log(`  ❌ Failed: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Import Summary: ${imported}/${simpleProblems.length} problems added successfully!`);
    
    // Check total count
    const totalProblems = await client.query('SELECT COUNT(*) FROM problems');
    console.log(`📈 Total problems now: ${totalProblems.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    client.release();
    await pool.end();
    await executionPool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addSimpleProblems()
    .then(() => {
      console.log('\n🎉 Simple problems added successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { addSimpleProblems };