#!/usr/bin/env node
/**
 * Add 5 More Diverse Fortune 100 Problems
 * Bringing total to 15 problems with maximum variety
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

const diverseProblems = [
  {
    title: "Fraudulent Transaction Detection",
    slug: "fraudulent-transaction-detection",
    description: `**Scenario:** PayPal's fraud detection team needs to identify suspicious transactions.

**Business Context:** Find transactions that are significantly higher than a user's average transaction amount (more than 3x their average).

**Problem:** Identify potentially fraudulent transactions based on spending patterns.

**Expected Output:** Return user_id, transaction_id, amount, user_avg_amount, and ratio for suspicious transactions.`,
    difficulty: "hard",
    setupSql: `
      CREATE TABLE financial_transactions (
          transaction_id INT,
          user_id INT,
          amount DECIMAL(12,2),
          transaction_date DATE,
          merchant_category VARCHAR(50)
      );
      
      INSERT INTO financial_transactions VALUES 
      (1, 101, 45.50, '2024-01-15', 'grocery'),
      (2, 101, 2500.00, '2024-01-20', 'electronics'),
      (3, 101, 38.75, '2024-01-25', 'restaurant'),
      (4, 102, 150.00, '2024-01-16', 'clothing'),
      (5, 102, 180.25, '2024-01-22', 'gas'),
      (6, 102, 1200.00, '2024-01-28', 'jewelry'),
      (7, 103, 25.00, '2024-01-18', 'coffee'),
      (8, 103, 95.50, '2024-01-24', 'grocery'),
      (9, 103, 750.00, '2024-01-30', 'electronics');
    `,
    solutionSql: `
      WITH user_averages AS (
        SELECT 
          user_id,
          AVG(amount) as avg_amount
        FROM financial_transactions
        GROUP BY user_id
      ),
      transaction_analysis AS (
        SELECT 
          ft.user_id,
          ft.transaction_id,
          ft.amount,
          ua.avg_amount as user_avg_amount,
          ROUND(ft.amount / ua.avg_amount, 2) as ratio
        FROM financial_transactions ft
        JOIN user_averages ua ON ft.user_id = ua.user_id
      )
      SELECT *
      FROM transaction_analysis
      WHERE ratio > 3.0
      ORDER BY ratio DESC;
    `,
    category: "Fraud Detection"
  },

  {
    title: "Movie Recommendation Engine",
    slug: "movie-recommendation-engine",
    description: `**Scenario:** Disney+ wants to build a content recommendation system.

**Business Context:** Find movies similar to a user's watched content based on genre preferences and ratings.

**Problem:** For users who watched 'Action' movies, recommend other high-rated movies in the same genre they haven't seen.

**Expected Output:** Return movie recommendations for Action movie watchers, excluding movies they've already seen.`,
    difficulty: "hard",
    setupSql: `
      CREATE TABLE movies (
          movie_id INT,
          title VARCHAR(100),
          genre VARCHAR(50),
          release_year INT,
          avg_rating DECIMAL(3,2)
      );
      
      CREATE TABLE user_views (
          user_id INT,
          movie_id INT,
          rating INT,
          view_date DATE
      );
      
      INSERT INTO movies VALUES 
      (1, 'Top Gun Maverick', 'Action', 2022, 4.5),
      (2, 'The Batman', 'Action', 2022, 4.2),
      (3, 'Frozen 2', 'Animation', 2019, 4.3),
      (4, 'John Wick 4', 'Action', 2023, 4.4),
      (5, 'Encanto', 'Animation', 2021, 4.1),
      (6, 'Fast X', 'Action', 2023, 3.8);
      
      INSERT INTO user_views VALUES 
      (101, 1, 5, '2024-01-15'),
      (101, 3, 4, '2024-01-20'),
      (102, 1, 4, '2024-01-16'),
      (102, 2, 5, '2024-01-22'),
      (103, 3, 5, '2024-01-18'),
      (103, 5, 4, '2024-01-25');
    `,
    solutionSql: `
      WITH action_viewers AS (
        SELECT DISTINCT uv.user_id
        FROM user_views uv
        JOIN movies m ON uv.movie_id = m.movie_id
        WHERE m.genre = 'Action'
      ),
      user_watched_movies AS (
        SELECT user_id, movie_id
        FROM user_views
      )
      SELECT DISTINCT 
        av.user_id,
        m.movie_id,
        m.title,
        m.avg_rating
      FROM action_viewers av
      CROSS JOIN movies m
      LEFT JOIN user_watched_movies uwm ON av.user_id = uwm.user_id AND m.movie_id = uwm.movie_id
      WHERE m.genre = 'Action'
        AND uwm.movie_id IS NULL
        AND m.avg_rating >= 4.0
      ORDER BY av.user_id, m.avg_rating DESC;
    `,
    category: "Recommendation Systems"
  },

  {
    title: "Supply Chain Optimization",
    slug: "supply-chain-optimization",
    description: `**Scenario:** FedEx needs to optimize warehouse inventory levels across regions.

**Business Context:** Calculate reorder points for each product at each warehouse based on demand patterns.

**Problem:** Find products that need restocking (current_stock < reorder_point) at each warehouse.

**Expected Output:** Return warehouse_id, product_name, current_stock, reorder_point, and shortage_amount.`,
    difficulty: "medium",
    setupSql: `
      CREATE TABLE warehouse_inventory (
          warehouse_id INT,
          product_name VARCHAR(100),
          current_stock INT,
          reorder_point INT,
          max_capacity INT
      );
      
      INSERT INTO warehouse_inventory VALUES 
      (1, 'Shipping Boxes', 150, 200, 1000),
      (1, 'Bubble Wrap', 75, 100, 500),
      (1, 'Packing Tape', 300, 150, 800),
      (2, 'Shipping Boxes', 180, 200, 1000),
      (2, 'Bubble Wrap', 45, 100, 500),
      (2, 'Labels', 250, 300, 600),
      (3, 'Shipping Boxes', 90, 200, 1000),
      (3, 'Packing Tape', 120, 150, 800);
    `,
    solutionSql: `
      SELECT 
        warehouse_id,
        product_name,
        current_stock,
        reorder_point,
        reorder_point - current_stock as shortage_amount
      FROM warehouse_inventory
      WHERE current_stock < reorder_point
      ORDER BY warehouse_id, shortage_amount DESC;
    `,
    category: "Supply Chain"
  },

  {
    title: "A/B Test Results Analysis",
    slug: "ab-test-results-analysis", 
    description: `**Scenario:** Facebook's growth team needs to analyze A/B test performance for a new feature.

**Business Context:** Compare conversion rates between control and test groups to determine if the new feature improves user engagement.

**Problem:** Calculate conversion rates for each test group and determine statistical significance.

**Expected Output:** Return group_name, total_users, conversions, conversion_rate for each test group.`,
    difficulty: "medium",
    setupSql: `
      CREATE TABLE ab_test_results (
          user_id INT,
          test_group VARCHAR(20),
          converted BOOLEAN,
          signup_date DATE
      );
      
      INSERT INTO ab_test_results VALUES 
      (1, 'control', true, '2024-01-15'),
      (2, 'control', false, '2024-01-16'),
      (3, 'control', true, '2024-01-17'),
      (4, 'control', false, '2024-01-18'),
      (5, 'treatment', true, '2024-01-15'),
      (6, 'treatment', true, '2024-01-16'),
      (7, 'treatment', false, '2024-01-17'),
      (8, 'treatment', true, '2024-01-18'),
      (9, 'control', false, '2024-01-19'),
      (10, 'treatment', true, '2024-01-19');
    `,
    solutionSql: `
      SELECT 
        test_group as group_name,
        COUNT(*) as total_users,
        SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
        ROUND(
          SUM(CASE WHEN converted THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
          2
        ) as conversion_rate
      FROM ab_test_results
      GROUP BY test_group
      ORDER BY conversion_rate DESC;
    `,
    category: "A/B Testing"
  },

  {
    title: "Energy Consumption Analysis",
    slug: "energy-consumption-analysis",
    description: `**Scenario:** Tesla's energy division analyzes solar panel performance across installations.

**Business Context:** Calculate energy efficiency and identify underperforming installations for maintenance.

**Problem:** Find installations with below-average energy production efficiency.

**Expected Output:** Return installation_id, avg_daily_production, efficiency_rating, and performance_category.`,
    difficulty: "medium",
    setupSql: `
      CREATE TABLE solar_installations (
          installation_id INT,
          location VARCHAR(50),
          panel_capacity_kw DECIMAL(8,2),
          daily_production_kwh DECIMAL(10,2),
          installation_date DATE
      );
      
      INSERT INTO solar_installations VALUES 
      (1, 'California', 25.0, 120.5, '2023-06-15'),
      (2, 'Arizona', 30.0, 135.2, '2023-07-20'),
      (3, 'Nevada', 20.0, 85.8, '2023-08-10'),
      (4, 'Texas', 35.0, 145.6, '2023-05-25'),
      (5, 'Florida', 28.0, 98.4, '2023-09-12'),
      (6, 'Colorado', 22.0, 102.3, '2023-07-08');
    `,
    solutionSql: `
      WITH efficiency_metrics AS (
        SELECT 
          installation_id,
          location,
          daily_production_kwh as avg_daily_production,
          ROUND(daily_production_kwh / panel_capacity_kw, 2) as efficiency_rating,
          AVG(daily_production_kwh / panel_capacity_kw) OVER() as overall_avg_efficiency
        FROM solar_installations
      )
      SELECT 
        installation_id,
        avg_daily_production,
        efficiency_rating,
        CASE 
          WHEN efficiency_rating >= overall_avg_efficiency THEN 'Above Average'
          ELSE 'Below Average'
        END as performance_category
      FROM efficiency_metrics
      WHERE efficiency_rating < overall_avg_efficiency
      ORDER BY efficiency_rating;
    `,
    category: "Energy Analytics"
  }
];

async function add5MoreProblems() {
  console.log('🌟 Adding 5 more diverse Fortune 100 problems...\n');
  
  const client = await pool.connect();
  
  try {
    let imported = 0;
    
    for (const problem of diverseProblems) {
      console.log(`📝 Adding: ${problem.title} (${problem.difficulty})`);
      
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
            `Advanced problems in ${problem.category}`
          ]);
          categoryId = newCategory.rows[0].id;
        } else {
          categoryId = categoryResult.rows[0].id;
        }
        
        // Insert problem 
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
          
          // Insert problem schema
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
            `Advanced ${problem.category} problem with real business applications.`
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
    
    console.log(`\n📊 Import Summary: ${imported}/${diverseProblems.length} problems added!`);
    
    // Check final count
    const totalProblems = await client.query('SELECT COUNT(*) FROM problems');
    console.log(`🚀 Total problems now: ${totalProblems.rows[0].count}`);
    
    // Show difficulty distribution
    const difficultyCount = await client.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM problems 
      GROUP BY difficulty 
      ORDER BY count DESC
    `);
    
    console.log('\n📈 Current Distribution:');
    difficultyCount.rows.forEach(row => {
      console.log(`   • ${row.difficulty}: ${row.count} problems`);
    });
    
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
  add5MoreProblems()
    .then(() => {
      console.log('\n🎉 5 more diverse problems added successfully!');
      console.log('💪 Your SQL platform now has maximum variety!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { add5MoreProblems };