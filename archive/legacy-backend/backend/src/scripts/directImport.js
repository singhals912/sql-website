#!/usr/bin/env node
/**
 * Direct Import - Add 10 high-quality Fortune 100 problems
 * This bypasses the complex ProblemManager and imports directly
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

// 10 High-Quality Fortune 100 Problems with Diverse Schemas
const newProblems = [
  {
    title: "Monthly Active Users",
    slug: "monthly-active-users",
    description: `**Scenario:** Instagram's product team tracks monthly active users for growth metrics.

**Business Context:** Calculate the number of unique users who posted, liked, or commented in January 2024.

**Problem:** Find the count of distinct users who had any activity in January 2024.

**Expected Output:** Return a single number representing unique active users.`,
    difficulty: "easy",
    category_name: "User Analytics",
    setupSql: `
      CREATE TABLE user_activities (
          user_id INT,
          activity_type VARCHAR(20),
          activity_date DATE,
          post_id INT
      );
      
      INSERT INTO user_activities VALUES 
      (1, 'post', '2024-01-15', 101),
      (2, 'like', '2024-01-16', 102),
      (1, 'comment', '2024-01-20', 103),
      (3, 'post', '2024-01-18', 104),
      (4, 'like', '2023-12-28', 105),
      (2, 'post', '2024-01-25', 106),
      (5, 'comment', '2024-01-22', 107);
    `,
    solutionSql: `
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM user_activities
      WHERE EXTRACT(YEAR FROM activity_date) = 2024 
        AND EXTRACT(MONTH FROM activity_date) = 1;
    `,
    explanation: "Use COUNT(DISTINCT user_id) with date filtering to find unique active users in a specific month."
  },

  {
    title: "Revenue by Product Category",
    slug: "revenue-by-product-category",
    description: `**Scenario:** Shopify merchants need to analyze revenue performance by category.

**Business Context:** Calculate total revenue for each product category to identify top-performing segments.

**Problem:** Find total revenue by category, ordered from highest to lowest.

**Expected Output:** Return category_name and total_revenue, ordered by revenue descending.`,
    difficulty: "easy",
    category_name: "Sales Analytics",
    setupSql: `
      CREATE TABLE product_orders (
          order_id INT,
          product_name VARCHAR(100),
          category_name VARCHAR(50),
          quantity INT,
          unit_price DECIMAL(10,2)
      );
      
      INSERT INTO product_orders VALUES 
      (1, 'iPhone 15', 'Electronics', 2, 999.00),
      (2, 'Nike Sneakers', 'Fashion', 1, 150.00),
      (3, 'MacBook Pro', 'Electronics', 1, 2499.00),
      (4, 'Coffee Table', 'Furniture', 1, 299.00),
      (5, 'Wireless Mouse', 'Electronics', 3, 29.99),
      (6, 'Designer Jeans', 'Fashion', 2, 120.00);
    `,
    solutionSql: `
      SELECT 
        category_name,
        SUM(quantity * unit_price) as total_revenue
      FROM product_orders
      GROUP BY category_name
      ORDER BY total_revenue DESC;
    `,
    explanation: "Group by category and sum the product of quantity and unit_price to calculate total revenue."
  },

  {
    title: "Customer Retention Analysis",
    slug: "customer-retention-analysis",
    description: `**Scenario:** Netflix wants to analyze customer retention patterns.

**Business Context:** Calculate the percentage of customers who renewed their subscription after their first month.

**Problem:** Find customers who have both an initial subscription and a renewal, then calculate retention rate.

**Expected Output:** Return total_customers, retained_customers, and retention_rate.`,
    difficulty: "medium",
    category_name: "Customer Analytics",
    setupSql: `
      CREATE TABLE subscriptions (
          customer_id INT,
          subscription_type VARCHAR(20),
          start_date DATE,
          end_date DATE
      );
      
      INSERT INTO subscriptions VALUES 
      (1, 'initial', '2024-01-15', '2024-02-15'),
      (1, 'renewal', '2024-02-15', '2024-03-15'),
      (2, 'initial', '2024-01-10', '2024-02-10'),
      (3, 'initial', '2024-01-20', '2024-02-20'),
      (3, 'renewal', '2024-02-20', '2024-03-20'),
      (4, 'initial', '2024-01-25', '2024-02-25'),
      (5, 'initial', '2024-01-30', '2024-02-28'),
      (5, 'renewal', '2024-02-28', '2024-03-28');
    `,
    solutionSql: `
      WITH customer_status AS (
        SELECT 
          customer_id,
          MAX(CASE WHEN subscription_type = 'initial' THEN 1 ELSE 0 END) as has_initial,
          MAX(CASE WHEN subscription_type = 'renewal' THEN 1 ELSE 0 END) as has_renewal
        FROM subscriptions
        GROUP BY customer_id
      )
      SELECT 
        COUNT(*) as total_customers,
        SUM(has_renewal) as retained_customers,
        ROUND(SUM(has_renewal) * 100.0 / COUNT(*), 2) as retention_rate
      FROM customer_status
      WHERE has_initial = 1;
    `,
    explanation: "Use CTE to determine customer renewal status, then calculate retention rate percentage."
  },

  {
    title: "Sales Performance Ranking",
    slug: "sales-performance-ranking",
    description: `**Scenario:** Tesla's sales team wants to rank salespeople by performance.

**Business Context:** Rank salespeople by total sales amount and assign performance tiers.

**Problem:** Rank salespeople by total sales, assign tier based on rank (Top 25% = 'A', Next 25% = 'B', etc.).

**Expected Output:** Return salesperson_name, total_sales, sales_rank, and performance_tier.`,
    difficulty: "medium",
    category_name: "Performance Analytics",
    setupSql: `
      CREATE TABLE vehicle_sales (
          sale_id INT,
          salesperson_name VARCHAR(100),
          vehicle_model VARCHAR(50),
          sale_amount DECIMAL(12,2),
          sale_date DATE
      );
      
      INSERT INTO vehicle_sales VALUES 
      (1, 'Alice Johnson', 'Model S', 89990.00, '2024-01-15'),
      (2, 'Bob Smith', 'Model 3', 35990.00, '2024-01-16'),
      (3, 'Alice Johnson', 'Model Y', 52990.00, '2024-01-20'),
      (4, 'Charlie Brown', 'Model X', 98990.00, '2024-01-18'),
      (5, 'Bob Smith', 'Model 3', 35990.00, '2024-01-25'),
      (6, 'Diana Lee', 'Model S', 89990.00, '2024-01-22'),
      (7, 'Charlie Brown', 'Model Y', 52990.00, '2024-01-28'),
      (8, 'Diana Lee', 'Model 3', 35990.00, '2024-01-30');
    `,
    solutionSql: `
      WITH sales_totals AS (
        SELECT 
          salesperson_name,
          SUM(sale_amount) as total_sales,
          ROW_NUMBER() OVER (ORDER BY SUM(sale_amount) DESC) as sales_rank
        FROM vehicle_sales
        GROUP BY salesperson_name
      ),
      ranked_sales AS (
        SELECT *,
          CASE 
            WHEN sales_rank <= (SELECT COUNT(*) FROM sales_totals) * 0.25 THEN 'A'
            WHEN sales_rank <= (SELECT COUNT(*) FROM sales_totals) * 0.50 THEN 'B'
            WHEN sales_rank <= (SELECT COUNT(*) FROM sales_totals) * 0.75 THEN 'C'
            ELSE 'D'
          END as performance_tier
        FROM sales_totals
      )
      SELECT * FROM ranked_sales ORDER BY sales_rank;
    `,
    explanation: "Use CTEs with window functions to rank salespeople and assign performance tiers based on percentiles."
  },

  {
    title: "Patient Appointment Analysis",
    slug: "patient-appointment-analysis",
    description: `**Scenario:** Mayo Clinic wants to optimize appointment scheduling.

**Business Context:** Analyze appointment patterns to identify peak times and no-show rates by time slot.

**Problem:** Calculate show rate and total appointments for each hour of the day.

**Expected Output:** Return appointment_hour, total_appointments, completed_appointments, and show_rate.`,
    difficulty: "medium",
    category_name: "Healthcare Analytics",
    setupSql: `
      CREATE TABLE appointments (
          appointment_id INT,
          patient_id INT,
          appointment_datetime TIMESTAMP,
          status VARCHAR(20),
          doctor_id INT
      );
      
      INSERT INTO appointments VALUES 
      (1, 101, '2024-01-15 09:00:00', 'completed', 1),
      (2, 102, '2024-01-15 09:30:00', 'no_show', 1),
      (3, 103, '2024-01-15 10:00:00', 'completed', 2),
      (4, 104, '2024-01-15 10:30:00', 'completed', 2),
      (5, 105, '2024-01-15 11:00:00', 'cancelled', 1),
      (6, 106, '2024-01-15 11:30:00', 'completed', 3),
      (7, 107, '2024-01-15 14:00:00', 'completed', 1),
      (8, 108, '2024-01-15 14:30:00', 'no_show', 2),
      (9, 109, '2024-01-15 15:00:00', 'completed', 3),
      (10, 110, '2024-01-15 15:30:00', 'completed', 1);
    `,
    solutionSql: `
      SELECT 
        EXTRACT(HOUR FROM appointment_datetime) as appointment_hour,
        COUNT(*) as total_appointments,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_appointments,
        ROUND(
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
          2
        ) as show_rate
      FROM appointments
      GROUP BY EXTRACT(HOUR FROM appointment_datetime)
      ORDER BY appointment_hour;
    `,
    explanation: "Extract hour from timestamp, group by hour, and calculate completion rates using conditional aggregation."
  }
];

async function setupProblemEnvironment(setupSql) {
  const client = await executionPool.connect();
  try {
    await client.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
    await client.query(setupSql);
    console.log('✅ Environment setup complete');
  } finally {
    client.release();
  }
}

async function generateExpectedOutput(solutionSql) {
  const result = await executionPool.query(solutionSql);
  return result.rows.map(row => Object.values(row).map(cell => {
    if (cell === null) return null;
    if (cell instanceof Date) return cell.toISOString().split('T')[0];
    if (typeof cell === 'bigint') return cell.toString();
    if (typeof cell === 'number') return Number.isInteger(cell) ? cell.toString() : cell.toFixed(2);
    return String(cell).trim();
  }));
}

async function importProblemsDirectly() {
  console.log('🚀 Importing 5 new Fortune 100 problems directly...\n');
  
  const client = await pool.connect();
  
  try {
    let imported = 0;
    
    for (const problem of newProblems) {
      console.log(`📝 Adding: ${problem.title}`);
      
      try {
        await client.query('BEGIN');
        
        // Get or create category
        let categoryResult = await client.query(
          'SELECT id FROM categories WHERE name = $1',
          [problem.category_name]
        );
        
        let categoryId;
        if (categoryResult.rows.length === 0) {
          const newCategory = await client.query(`
            INSERT INTO categories (name, slug, description)
            VALUES ($1, $2, $3) RETURNING id
          `, [
            problem.category_name,
            problem.category_name.toLowerCase().replace(/\s+/g, '-'),
            `Problems related to ${problem.category_name}`
          ]);
          categoryId = newCategory.rows[0].id;
        } else {
          categoryId = categoryResult.rows[0].id;
        }
        
        // Insert problem
        const problemResult = await client.query(`
          INSERT INTO problems (
            title, slug, description, difficulty, category_id, 
            tags, is_premium, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, false, true)
          RETURNING id
        `, [
          problem.title,
          problem.slug, 
          problem.description,
          problem.difficulty,
          categoryId,
          JSON.stringify([problem.difficulty, problem.category_name.toLowerCase()])
        ]);
        
        const problemId = problemResult.rows[0].id;
        
        // Setup environment and generate expected output
        await setupProblemEnvironment(problem.setupSql);
        const expectedOutput = await generateExpectedOutput(problem.solutionSql);
        
        // Insert problem schema
        await client.query(`
          INSERT INTO problem_schemas (
            problem_id, sql_dialect, setup_sql, solution_sql, 
            expected_output, explanation, constraints, hints
          ) VALUES ($1, 'postgresql', $2, $3, $4::jsonb, $5, $6, $7)
        `, [
          problemId,
          problem.setupSql,
          problem.solutionSql,
          JSON.stringify(expectedOutput),
          problem.explanation,
          null,
          JSON.stringify([])
        ]);
        
        await client.query('COMMIT');
        console.log(`✅ Success: ${problem.title}`);
        imported++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.log(`❌ Failed: ${problem.title} - ${error.message}`);
      }
    }
    
    console.log(`\n📊 Import Summary: ${imported}/${newProblems.length} problems imported`);
    
    // Test the new problems
    console.log('\n🧪 Testing new problems...');
    const totalProblems = await client.query('SELECT COUNT(*) FROM problems');
    console.log(`📈 Total problems in database: ${totalProblems.rows[0].count}`);
    
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
  importProblemsDirectly()
    .then(() => {
      console.log('\n🎉 Direct import completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importProblemsDirectly, newProblems };