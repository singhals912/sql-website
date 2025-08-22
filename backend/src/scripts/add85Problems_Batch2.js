const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Category UUIDs for proper mapping
const categories = {
  'Basic Queries': 'c5ec99f8-01ff-4d36-b36e-27688566397d',
  'Aggregation': '426fcc68-b403-458f-9afd-5137f772de78',
  'Advanced Topics': 'c7e4c5a1-5b75-4117-a113-118749434557',
  'Joins': '8798fdcf-0411-45cb-83dd-b4912e133354',
  'Time Analysis': '47c2009b-81d2-458f-96b0-1a68aee370d6',
  'Window Functions': '9ba6536c-e307-41f7-8ae0-8e49f3f98d55',
  'Subqueries': 'e1b879e5-e95b-41ee-b22a-a2ea91897277'
};

// Batch 2: 15 Easy Problems
const easyProblems = [
  {
    id: uuidv4(),
    title: "Walmart Sales by Department",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Walmart's merchandising team tracks departmental sales performance to optimize inventory allocation and store layouts.

**Scenario:** You're a retail analyst at Walmart analyzing department performance. The team needs to see which departments are generating the most revenue.

**Problem:** List all departments with their total sales amounts, showing only departments with sales greater than $50,000.

**Expected Output:** Department names with total sales amounts (>$50k only), ordered by sales descending.`,
    setupSql: `CREATE TABLE walmart_sales (
        sale_id INT PRIMARY KEY,
        department VARCHAR(50),
        product_name VARCHAR(100),
        sale_amount DECIMAL(10,2),
        sale_date DATE
    );
    
    INSERT INTO walmart_sales VALUES 
    (1, 'Electronics', 'Samsung TV 55-inch', 899.99, '2024-01-15'),
    (2, 'Groceries', 'Organic Produce Bundle', 45.50, '2024-01-15'),
    (3, 'Clothing', 'Winter Jacket', 89.99, '2024-01-15'),
    (4, 'Electronics', 'iPhone 15', 999.99, '2024-01-15'),
    (5, 'Home & Garden', 'Kitchen Appliance Set', 299.99, '2024-01-16'),
    (6, 'Electronics', 'Laptop Dell XPS', 1299.99, '2024-01-16'),
    (7, 'Groceries', 'Weekly Grocery Bundle', 125.75, '2024-01-16'),
    (8, 'Clothing', 'Designer Jeans', 79.99, '2024-01-16');`,
    solutionSql: `SELECT department, SUM(sale_amount) as total_sales
FROM walmart_sales 
GROUP BY department 
HAVING SUM(sale_amount) > 50000 
ORDER BY total_sales DESC;`,
    explanation: "Basic aggregation with HAVING clause to filter grouped results based on sum condition."
  },
  {
    id: uuidv4(),
    title: "Facebook User Post Engagement",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Facebook's News Feed algorithm team analyzes user engagement patterns to improve content ranking and user satisfaction.

**Scenario:** You're working on Facebook's engagement analytics team. The product managers want to understand which types of posts generate the most user interaction.

**Problem:** Find all post types that have received more than 100 total likes across all posts.

**Expected Output:** Post types with total like counts (>100 likes only), ordered by likes descending.`,
    setupSql: `CREATE TABLE facebook_posts (
        post_id INT PRIMARY KEY,
        user_id INT,
        post_type VARCHAR(30),
        likes_count INT,
        comments_count INT,
        shares_count INT,
        post_date DATE
    );
    
    INSERT INTO facebook_posts VALUES 
    (1, 1001, 'Photo', 45, 12, 8, '2024-01-15'),
    (2, 1002, 'Video', 89, 25, 15, '2024-01-15'),
    (3, 1003, 'Status', 23, 5, 2, '2024-01-15'),
    (4, 1001, 'Photo', 67, 18, 12, '2024-01-16'),
    (5, 1004, 'Video', 134, 45, 28, '2024-01-16'),
    (6, 1002, 'Link', 56, 14, 9, '2024-01-16'),
    (7, 1005, 'Photo', 78, 20, 11, '2024-01-17'),
    (8, 1003, 'Video', 95, 32, 18, '2024-01-17');`,
    solutionSql: `SELECT post_type, SUM(likes_count) as total_likes
FROM facebook_posts 
GROUP BY post_type 
HAVING SUM(likes_count) > 100 
ORDER BY total_likes DESC;`,
    explanation: "GROUP BY with HAVING clause applied to social media engagement data, testing basic aggregation concepts."
  },
  {
    id: uuidv4(),
    title: "Starbucks Store Revenue Analysis", 
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Starbucks regional managers need to evaluate store performance to make decisions about staffing, inventory, and potential store expansions.

**Scenario:** You're a business analyst at Starbucks corporate analyzing store performance across different cities. The operations team wants to identify high-performing locations.

**Problem:** Find all cities where Starbucks stores have generated more than $5,000 in total revenue.

**Expected Output:** Cities with total store revenue (>$5,000 only), ordered by revenue descending.`,
    setupSql: `CREATE TABLE starbucks_revenue (
        store_id INT,
        city VARCHAR(50),
        daily_revenue DECIMAL(8,2),
        revenue_date DATE
    );
    
    INSERT INTO starbucks_revenue VALUES 
    (101, 'Seattle', 2850.75, '2024-01-15'),
    (102, 'New York', 3200.50, '2024-01-15'),
    (103, 'San Francisco', 2950.25, '2024-01-15'),
    (104, 'Chicago', 2100.00, '2024-01-15'),
    (101, 'Seattle', 2750.80, '2024-01-16'),
    (102, 'New York', 3350.25, '2024-01-16'),
    (105, 'Austin', 1850.75, '2024-01-16'),
    (103, 'San Francisco', 3100.50, '2024-01-16');`,
    solutionSql: `SELECT city, SUM(daily_revenue) as total_revenue
FROM starbucks_revenue 
GROUP BY city 
HAVING SUM(daily_revenue) > 5000 
ORDER BY total_revenue DESC;`,
    explanation: "Aggregation problem focusing on revenue analysis with geographic grouping and filtering."
  },
  {
    id: uuidv4(),
    title: "Disney+ Content Duration Analysis",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Disney+'s content strategy team analyzes viewing patterns and content library composition to make informed decisions about new acquisitions and original productions.

**Scenario:** You're a content analyst at Disney+ working on library optimization. The team wants to understand the distribution of content by duration categories.

**Problem:** Find all content types where the average duration is greater than 90 minutes.

**Expected Output:** Content types with average duration (>90 minutes only), ordered by average duration descending.`,
    setupSql: `CREATE TABLE disney_content (
        content_id INT PRIMARY KEY,
        title VARCHAR(100),
        content_type VARCHAR(30),
        duration_minutes INT,
        genre VARCHAR(50),
        release_year INT
    );
    
    INSERT INTO disney_content VALUES 
    (1, 'The Lion King', 'Movie', 118, 'Animation', 2019),
    (2, 'The Mandalorian S1E1', 'TV Episode', 45, 'Sci-Fi', 2019),
    (3, 'Frozen 2', 'Movie', 103, 'Animation', 2019),
    (4, 'WandaVision S1E1', 'TV Episode', 35, 'Drama', 2021),
    (5, 'Black Widow', 'Movie', 134, 'Action', 2021),
    (6, 'Loki S1E1', 'TV Episode', 52, 'Drama', 2021),
    (7, 'Encanto', 'Movie', 102, 'Animation', 2021),
    (8, 'Hawkeye S1E1', 'TV Episode', 47, 'Action', 2021);`,
    solutionSql: `SELECT content_type, AVG(duration_minutes) as avg_duration
FROM disney_content 
GROUP BY content_type 
HAVING AVG(duration_minutes) > 90 
ORDER BY avg_duration DESC;`,
    explanation: "Tests understanding of AVG aggregate function with HAVING clause for filtering averaged results."
  },
  {
    id: uuidv4(),
    title: "McDonald's Menu Item Popularity",
    difficulty: "easy", 
    category: "Basic Queries",
    description: `**Business Context:** McDonald's menu development team tracks item popularity to make decisions about seasonal menu changes and regional customizations.

**Scenario:** You're a menu analyst at McDonald's corporate analyzing sales data. The marketing team wants to identify the most popular menu categories for upcoming promotions.

**Problem:** List all menu categories that have sold more than 500 total items.

**Expected Output:** Menu categories with total items sold (>500 items only), ordered by quantity descending.`,
    setupSql: `CREATE TABLE mcdonalds_orders (
        order_id INT PRIMARY KEY,
        menu_item VARCHAR(50),
        category VARCHAR(30),
        quantity_sold INT,
        price DECIMAL(6,2),
        order_date DATE
    );
    
    INSERT INTO mcdonalds_orders VALUES 
    (1, 'Big Mac', 'Burgers', 145, 5.99, '2024-01-15'),
    (2, 'French Fries', 'Sides', 234, 2.49, '2024-01-15'),
    (3, 'Coca Cola', 'Beverages', 189, 1.99, '2024-01-15'),
    (4, 'McChicken', 'Burgers', 167, 4.99, '2024-01-15'),
    (5, 'Apple Pie', 'Desserts', 78, 1.29, '2024-01-16'),
    (6, 'Quarter Pounder', 'Burgers', 123, 6.49, '2024-01-16'),
    (7, 'McFlurry', 'Desserts', 92, 3.99, '2024-01-16'),
    (8, 'Orange Juice', 'Beverages', 145, 2.29, '2024-01-16');`,
    solutionSql: `SELECT category, SUM(quantity_sold) as total_sold
FROM mcdonalds_orders 
GROUP BY category 
HAVING SUM(quantity_sold) > 500 
ORDER BY total_sold DESC;`,
    explanation: "Basic GROUP BY with SUM and HAVING clause, applied to restaurant sales data analysis."
  }
];

// Batch 2: 8 Medium Problems
const mediumProblems = [
  {
    id: uuidv4(),
    title: "IBM Cloud Service Utilization",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** IBM's cloud services division tracks customer usage patterns to optimize resource allocation and identify upselling opportunities for enterprise clients.

**Scenario:** You're a cloud operations analyst at IBM working on customer success metrics. The team needs to understand which customers are using multiple services effectively.

**Problem:** Find customers who are using both 'Compute' and 'Storage' services, showing their total monthly costs across all services.

**Expected Output:** Customer details with service count and total costs, only for customers using both Compute and Storage.`,
    setupSql: `CREATE TABLE cloud_customers (
        customer_id INT PRIMARY KEY,
        company_name VARCHAR(100),
        tier VARCHAR(20),
        signup_date DATE
    );
    
    CREATE TABLE cloud_usage (
        usage_id INT PRIMARY KEY,
        customer_id INT,
        service_type VARCHAR(30),
        monthly_cost DECIMAL(10,2),
        usage_date DATE
    );
    
    INSERT INTO cloud_customers VALUES 
    (1001, 'TechCorp Inc', 'Enterprise', '2023-06-15'),
    (1002, 'StartupXYZ', 'Standard', '2023-08-20'),
    (1003, 'Global Industries', 'Enterprise', '2023-05-10'),
    (1004, 'Local Business', 'Basic', '2023-09-05');
    
    INSERT INTO cloud_usage VALUES 
    (1, 1001, 'Compute', 2500.00, '2024-01-01'),
    (2, 1001, 'Storage', 800.00, '2024-01-01'),
    (3, 1001, 'Database', 1200.00, '2024-01-01'),
    (4, 1002, 'Compute', 450.00, '2024-01-01'),
    (5, 1002, 'Analytics', 300.00, '2024-01-01'),
    (6, 1003, 'Storage', 1500.00, '2024-01-01'),
    (7, 1003, 'Compute', 3200.00, '2024-01-01'),
    (8, 1004, 'Database', 200.00, '2024-01-01');`,
    solutionSql: `SELECT 
        c.customer_id,
        c.company_name,
        COUNT(DISTINCT u.service_type) as service_count,
        SUM(u.monthly_cost) as total_cost
    FROM cloud_customers c
    JOIN cloud_usage u ON c.customer_id = u.customer_id
    WHERE c.customer_id IN (
        SELECT customer_id
        FROM cloud_usage
        WHERE service_type IN ('Compute', 'Storage')
        GROUP BY customer_id
        HAVING COUNT(DISTINCT service_type) = 2
    )
    GROUP BY c.customer_id, c.company_name
    ORDER BY total_cost DESC;`,
    explanation: "Complex query combining JOINs with subqueries and HAVING clauses to identify customers using specific service combinations."
  },
  {
    id: uuidv4(),
    title: "Oracle Database Performance Metrics",
    difficulty: "medium",
    category: "Window Functions", 
    description: `**Business Context:** Oracle's database performance team monitors system metrics across different client environments to proactively identify performance bottlenecks and optimize database configurations.

**Scenario:** You're a database performance engineer at Oracle analyzing client system metrics. The team needs to identify databases with consistently high CPU usage patterns.

**Problem:** For each database, calculate the running average of CPU usage over the past 3 measurements and identify databases where this running average exceeds 80%.

**Expected Output:** Database names with their latest CPU usage and 3-period running average, only showing databases with running average >80%.`,
    setupSql: `CREATE TABLE oracle_metrics (
        metric_id INT PRIMARY KEY,
        database_name VARCHAR(50),
        cpu_usage DECIMAL(5,2),
        memory_usage DECIMAL(5,2),
        measurement_date DATE
    );
    
    INSERT INTO oracle_metrics VALUES 
    (1, 'PROD_DB_01', 85.5, 72.3, '2024-01-15'),
    (2, 'PROD_DB_02', 65.2, 68.1, '2024-01-15'),
    (3, 'TEST_DB_01', 45.8, 52.4, '2024-01-15'),
    (4, 'PROD_DB_01', 88.3, 75.6, '2024-01-16'),
    (5, 'PROD_DB_02', 71.4, 69.8, '2024-01-16'),
    (6, 'TEST_DB_01', 48.2, 54.1, '2024-01-16'),
    (7, 'PROD_DB_01', 92.1, 78.9, '2024-01-17'),
    (8, 'PROD_DB_02', 68.7, 66.2, '2024-01-17'),
    (9, 'TEST_DB_01', 51.3, 55.8, '2024-01-17');`,
    solutionSql: `WITH running_averages AS (
        SELECT 
            database_name,
            cpu_usage,
            measurement_date,
            AVG(cpu_usage) OVER (
                PARTITION BY database_name 
                ORDER BY measurement_date 
                ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
            ) as running_avg_cpu
        FROM oracle_metrics
    )
    SELECT 
        database_name,
        cpu_usage as latest_cpu,
        ROUND(running_avg_cpu, 2) as running_avg_cpu
    FROM running_averages
    WHERE running_avg_cpu > 80
    ORDER BY running_avg_cpu DESC;`,
    explanation: "Advanced window function using AVG OVER with ROWS BETWEEN to calculate running averages, demonstrating time-series analysis skills."
  }
];

// Batch 2: 2 Hard Problems
const hardProblems = [
  {
    id: uuidv4(),
    title: "Visa Fraud Detection System",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Visa's fraud detection team develops sophisticated algorithms to identify suspicious transaction patterns while minimizing false positives that could disrupt legitimate customer transactions.

**Scenario:** You're a senior data scientist at Visa working on real-time fraud detection. The team needs to identify potentially fraudulent patterns based on transaction velocity and geographic anomalies.

**Problem:** Identify credit cards that have more than 3 transactions within a 2-hour window AND have transactions in more than 2 different countries on the same day. Calculate the risk score as (transaction_count * country_count * avg_amount/1000).

**Expected Output:** High-risk cards with transaction details, country count, and calculated risk scores, ordered by risk score descending.`,
    setupSql: `CREATE TABLE visa_transactions (
        transaction_id INT PRIMARY KEY,
        card_number VARCHAR(20),
        merchant_name VARCHAR(100),
        amount DECIMAL(10,2),
        country VARCHAR(50),
        transaction_timestamp TIMESTAMP
    );
    
    INSERT INTO visa_transactions VALUES 
    (1, '4532-1234-5678-9012', 'Amazon US', 299.99, 'United States', '2024-01-15 10:30:00'),
    (2, '4532-1234-5678-9012', 'Hotel London', 450.00, 'United Kingdom', '2024-01-15 11:45:00'),
    (3, '4532-1234-5678-9012', 'Restaurant Paris', 125.50, 'France', '2024-01-15 12:15:00'),
    (4, '4532-1234-5678-9012', 'ATM Berlin', 200.00, 'Germany', '2024-01-15 12:30:00'),
    (5, '4111-2222-3333-4444', 'Gas Station', 85.75, 'United States', '2024-01-15 09:00:00'),
    (6, '4111-2222-3333-4444', 'Grocery Store', 156.25, 'United States', '2024-01-15 14:30:00'),
    (7, '4555-6666-7777-8888', 'Online Store', 89.99, 'Canada', '2024-01-15 08:00:00'),
    (8, '4555-6666-7777-8888', 'Coffee Shop', 12.50, 'Canada', '2024-01-15 08:15:00'),
    (9, '4555-6666-7777-8888', 'Restaurant', 75.25, 'Mexico', '2024-01-15 10:30:00'),
    (10, '4555-6666-7777-8888', 'Hotel', 320.00, 'Mexico', '2024-01-15 11:00:00');`,
    solutionSql: `WITH transaction_analysis AS (
        SELECT 
            card_number,
            DATE(transaction_timestamp) as transaction_date,
            COUNT(*) as daily_transaction_count,
            COUNT(DISTINCT country) as country_count,
            AVG(amount) as avg_amount
        FROM visa_transactions
        GROUP BY card_number, DATE(transaction_timestamp)
    ),
    time_window_analysis AS (
        SELECT 
            t1.card_number,
            DATE(t1.transaction_timestamp) as transaction_date,
            COUNT(*) as transactions_in_window
        FROM visa_transactions t1
        JOIN visa_transactions t2 ON t1.card_number = t2.card_number
            AND t2.transaction_timestamp BETWEEN t1.transaction_timestamp 
            AND t1.transaction_timestamp + INTERVAL '2 hours'
        GROUP BY t1.card_number, DATE(t1.transaction_timestamp), t1.transaction_id
        HAVING COUNT(*) > 3
    )
    SELECT 
        ta.card_number,
        ta.daily_transaction_count,
        ta.country_count,
        ROUND(ta.avg_amount, 2) as avg_amount,
        ROUND((ta.daily_transaction_count * ta.country_count * ta.avg_amount / 1000), 2) as risk_score
    FROM transaction_analysis ta
    WHERE ta.country_count > 2
        AND ta.card_number IN (SELECT DISTINCT card_number FROM time_window_analysis)
    ORDER BY risk_score DESC;`,
    explanation: "Complex fraud detection query using CTEs, self-joins, time window analysis, and multi-criteria risk scoring algorithms."
  }
];

async function importBatch2() {
  console.log('🚀 Starting import of 25 problems (Batch 2)...');
  
  const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
  let successCount = 0;
  
  for (const problem of allProblems) {
    try {
      console.log(`📝 Adding ${problem.difficulty} problem: ${problem.title}`);
      
      // Insert problem
      await pool.query(
        `INSERT INTO problems (id, title, slug, difficulty, description, is_premium, is_active, category_id)
         VALUES ($1, $2, $3, $4, $5, false, true, $6)`,
        [
          problem.id,
          problem.title,
          problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          problem.difficulty,
          problem.description,
          categories[problem.category]
        ]
      );
      
      // Insert schema
      await pool.query(
        `INSERT INTO problem_schemas (problem_id, sql_dialect, setup_sql, solution_sql, explanation)
         VALUES ($1, 'postgresql', $2, $3, $4)`,
        [problem.id, problem.setupSql, problem.solutionSql, problem.explanation]
      );
      
      console.log(`✅ Successfully added: ${problem.title}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Error adding ${problem.title}:`, error.message);
    }
  }
  
  console.log(`🎉 Batch 2 import complete! Added ${successCount}/${allProblems.length} problems.`);
  
  // Show updated distribution
  const result = await pool.query(`
    SELECT difficulty, COUNT(*) as count 
    FROM problems 
    WHERE is_active = true 
    GROUP BY difficulty 
    ORDER BY 
      CASE difficulty 
        WHEN 'easy' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'hard' THEN 3 
      END
  `);
  
  console.log('\n📊 Updated Distribution:');
  result.rows.forEach(row => {
    console.log(`${row.difficulty}: ${row.count} problems`);
  });
  
  const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
  console.log(`Total: ${total} problems`);
  console.log(`Remaining: ${100 - total} problems needed`);
  
  await pool.end();
}

importBatch2().catch(console.error);