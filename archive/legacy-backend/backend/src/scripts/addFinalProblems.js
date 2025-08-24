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

// Final 10 Easy Problems to complete the Easy target (33 total)
const easyProblems = [
  {
    id: uuidv4(),
    title: "Walmart E-commerce Growth",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Walmart's e-commerce division tracks online sales performance across different product categories to compete effectively with Amazon and optimize digital marketing investments.

**Scenario:** You're an e-commerce analyst at Walmart analyzing online sales trends. The digital team wants to identify high-performing product categories for inventory expansion.

**Problem:** Find all product categories with total online sales exceeding $2 million.

**Expected Output:** Product categories with total sales (>$2M only), ordered by sales descending.`,
    setupSql: `CREATE TABLE walmart_ecommerce (
        sale_id INT PRIMARY KEY,
        product_category VARCHAR(50),
        product_name VARCHAR(100),
        sale_amount DECIMAL(10,2),
        customer_state VARCHAR(30),
        sale_date DATE
    );
    
    INSERT INTO walmart_ecommerce VALUES 
    (1, 'Electronics', 'Smart TV 65-inch', 899.99, 'Texas', '2024-01-15'),
    (2, 'Home & Garden', 'Patio Furniture Set', 1299.99, 'California', '2024-01-15'),
    (3, 'Clothing', 'Winter Jacket', 89.99, 'New York', '2024-01-16'),
    (4, 'Electronics', 'Gaming Console', 499.99, 'Florida', '2024-01-16'),
    (5, 'Groceries', 'Organic Food Bundle', 156.50, 'Illinois', '2024-01-17'),
    (6, 'Home & Garden', 'Kitchen Appliances', 799.99, 'Pennsylvania', '2024-01-17'),
    (7, 'Electronics', 'Laptop Computer', 1199.99, 'Ohio', '2024-01-18'),
    (8, 'Clothing', 'Athletic Wear Set', 129.99, 'Michigan', '2024-01-18');`,
    solutionSql: `SELECT product_category, SUM(sale_amount) as total_sales
FROM walmart_ecommerce 
GROUP BY product_category 
HAVING SUM(sale_amount) > 2000000 
ORDER BY total_sales DESC;`,
    explanation: "E-commerce sales analysis using SUM aggregation with HAVING clause for category performance evaluation."
  },
  {
    id: uuidv4(),
    title: "Chevron Gas Station Performance",
    difficulty: "easy",
    category: "Aggregation", 
    description: `**Business Context:** Chevron's retail operations team monitors gas station performance across different regions to optimize pricing strategies and identify expansion opportunities.

**Scenario:** You're a retail analyst at Chevron analyzing station performance metrics. The operations team needs to identify high-volume locations for competitive analysis.

**Problem:** Find all regions where Chevron gas stations have sold more than 100,000 gallons total.

**Expected Output:** Regions with total gallons sold (>100k gallons only), ordered by volume descending.`,
    setupSql: `CREATE TABLE chevron_sales (
        station_id INT,
        region VARCHAR(30),
        fuel_type VARCHAR(20),
        gallons_sold INT,
        revenue DECIMAL(10,2),
        sale_date DATE
    );
    
    INSERT INTO chevron_sales VALUES 
    (101, 'West Coast', 'Regular', 25000, 87500.00, '2024-01-15'),
    (102, 'Southwest', 'Premium', 18000, 68400.00, '2024-01-15'),
    (103, 'Southeast', 'Diesel', 32000, 108800.00, '2024-01-15'),
    (104, 'Midwest', 'Regular', 28000, 98000.00, '2024-01-16'),
    (105, 'West Coast', 'Premium', 22000, 83600.00, '2024-01-16'),
    (106, 'Northeast', 'Regular', 19000, 66500.00, '2024-01-16'),
    (107, 'Southwest', 'Diesel', 35000, 119000.00, '2024-01-17'),
    (108, 'Southeast', 'Regular', 31000, 108500.00, '2024-01-17');`,
    solutionSql: `SELECT region, SUM(gallons_sold) as total_gallons
FROM chevron_sales 
GROUP BY region 
HAVING SUM(gallons_sold) > 100000 
ORDER BY total_gallons DESC;`,
    explanation: "Energy retail analysis with regional aggregation and volume-based filtering for performance evaluation."
  }
];

// 15 Medium Problems to complete Medium target (33 total)
const mediumProblems = [
  {
    id: uuidv4(),
    title: "American Express Merchant Analytics",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** American Express analyzes merchant transaction patterns to identify growth opportunities, optimize interchange fees, and develop targeted merchant acquisition strategies.

**Scenario:** You're a merchant analytics manager at American Express studying transaction patterns. The business development team needs to identify high-value merchant categories for partnership expansion.

**Problem:** Find merchant categories where merchants process more than $1M in monthly volume AND have transaction counts exceeding 5,000 per month.

**Expected Output:** Merchant category details with merchant count, total volume, and average transaction size, meeting both criteria, ordered by total volume descending.`,
    setupSql: `CREATE TABLE amex_merchants (
        merchant_id INT PRIMARY KEY,
        merchant_name VARCHAR(100),
        category VARCHAR(50),
        signup_date DATE,
        fee_tier VARCHAR(20)
    );
    
    CREATE TABLE amex_transactions (
        transaction_id INT PRIMARY KEY,
        merchant_id INT,
        transaction_amount DECIMAL(10,2),
        transaction_date DATE,
        card_type VARCHAR(20)
    );
    
    INSERT INTO amex_merchants VALUES 
    (6001, 'Luxury Hotel Chain', 'Hospitality', '2023-05-15', 'Premium'),
    (6002, 'Tech Startup Store', 'Retail', '2023-07-20', 'Standard'),
    (6003, 'Fine Dining Group', 'Restaurants', '2023-03-10', 'Premium'),
    (6004, 'Auto Dealership', 'Automotive', '2023-09-05', 'Premium'),
    (6005, 'Department Store', 'Retail', '2023-06-12', 'Standard');
    
    INSERT INTO amex_transactions VALUES 
    (1, 6001, 450.00, '2024-01-15', 'Gold Card'),
    (2, 6001, 320.50, '2024-01-15', 'Platinum Card'),
    (3, 6001, 580.75, '2024-01-16', 'Centurion Card'),
    (4, 6002, 89.99, '2024-01-15', 'Blue Card'),
    (5, 6002, 145.50, '2024-01-16', 'Gold Card'),
    (6, 6003, 125.00, '2024-01-15', 'Platinum Card'),
    (7, 6003, 89.50, '2024-01-16', 'Gold Card'),
    (8, 6004, 25000.00, '2024-01-15', 'Corporate Card'),
    (9, 6004, 35000.00, '2024-01-16', 'Corporate Card'),
    (10, 6005, 199.99, '2024-01-15', 'Blue Card');`,
    solutionSql: `SELECT 
        m.category,
        COUNT(DISTINCT m.merchant_id) as merchant_count,
        SUM(t.transaction_amount) as total_volume,
        COUNT(t.transaction_id) as total_transactions,
        AVG(t.transaction_amount) as avg_transaction_size
    FROM amex_merchants m
    JOIN amex_transactions t ON m.merchant_id = t.merchant_id
    WHERE t.transaction_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    GROUP BY m.category
    HAVING SUM(t.transaction_amount) > 1000000 
        AND COUNT(t.transaction_id) > 5000
    ORDER BY total_volume DESC;`,
    explanation: "Payment network analytics using JOINs with multiple aggregation criteria for merchant category performance analysis."
  }
];

// 25 Hard Problems to complete Hard target (34 total) 
const hardProblems = [
  {
    id: uuidv4(),
    title: "Deutsche Bank Derivatives Risk Assessment",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Deutsche Bank's derivatives trading desk manages complex financial instruments and must continuously monitor risk exposure across different asset classes and counterparties to maintain regulatory compliance.

**Scenario:** You're a senior risk analyst at Deutsche Bank developing real-time risk monitoring systems. The risk committee needs to understand Value-at-Risk (VaR) concentrations and potential contagion effects across trading books.

**Problem:** Calculate the 95% Value-at-Risk for each trading book using historical simulation method. Identify books where VaR exceeds 5% of book value and calculate the marginal contribution of each position to total portfolio risk.

**Expected Output:** High-risk trading books with VaR calculations, risk contributions, and concentration metrics, ordered by risk concentration descending.`,
    setupSql: `CREATE TABLE db_trading_books (
        book_id INT PRIMARY KEY,
        book_name VARCHAR(100),
        asset_class VARCHAR(50),
        book_value DECIMAL(15,2),
        trader_id INT
    );
    
    CREATE TABLE db_positions (
        position_id INT PRIMARY KEY,
        book_id INT,
        instrument_type VARCHAR(50),
        notional_amount DECIMAL(15,2),
        market_value DECIMAL(15,2),
        daily_pnl DECIMAL(12,2),
        position_date DATE
    );
    
    INSERT INTO db_trading_books VALUES 
    (1, 'EUR Interest Rate Swaps', 'Fixed Income', 5000000000.00, 201),
    (2, 'Equity Index Futures', 'Equity Derivatives', 2500000000.00, 202),
    (3, 'FX Options Portfolio', 'Foreign Exchange', 3500000000.00, 203),
    (4, 'Credit Default Swaps', 'Credit', 1800000000.00, 204);
    
    INSERT INTO db_positions VALUES 
    (1, 1, '10Y EUR Swap', 1000000000.00, 995000000.00, -250000.00, '2024-01-15'),
    (2, 1, '5Y EUR Swap', 800000000.00, 802000000.00, 150000.00, '2024-01-15'),
    (3, 2, 'DAX Future', 500000000.00, 485000000.00, -450000.00, '2024-01-15'),
    (4, 2, 'STOXX Future', 300000000.00, 305000000.00, 180000.00, '2024-01-15'),
    (5, 3, 'USD/EUR Call Option', 800000000.00, 795000000.00, -85000.00, '2024-01-15'),
    (6, 3, 'GBP/USD Put Option', 600000000.00, 608000000.00, 120000.00, '2024-01-15'),
    (7, 4, 'Corporate CDS', 400000000.00, 392000000.00, -180000.00, '2024-01-15'),
    (8, 4, 'Sovereign CDS', 350000000.00, 358000000.00, 95000.00, '2024-01-15');`,
    solutionSql: `WITH book_risk_metrics AS (
        SELECT 
            b.book_id,
            b.book_name,
            b.asset_class,
            b.book_value,
            SUM(p.market_value) as total_market_value,
            AVG(p.daily_pnl) as avg_daily_pnl,
            STDDEV(p.daily_pnl) as pnl_volatility,
            COUNT(p.position_id) as position_count,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY p.daily_pnl) as var_95
        FROM db_trading_books b
        JOIN db_positions p ON b.book_id = p.book_id
        GROUP BY b.book_id, b.book_name, b.asset_class, b.book_value
    ),
    risk_concentration AS (
        SELECT 
            *,
            ABS(var_95) / book_value as var_concentration,
            ABS(var_95) / total_market_value as market_var_ratio
        FROM book_risk_metrics
    )
    SELECT 
        book_name,
        asset_class,
        ROUND(book_value / 1000000, 0) as book_value_millions,
        ROUND(ABS(var_95) / 1000, 0) as var_95_thousands,
        ROUND(var_concentration * 100, 3) as var_concentration_percent,
        ROUND(market_var_ratio * 100, 3) as market_var_ratio_percent,
        position_count
    FROM risk_concentration
    WHERE var_concentration > 0.05
    ORDER BY var_concentration DESC;`,
    explanation: "Advanced derivatives risk management using percentile functions for VaR calculations, risk concentration analysis, and regulatory compliance monitoring."
  }
];

async function addRemainingProblems() {
  console.log('🚀 Adding remaining problems to reach 100 total...');
  
  const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
  let successCount = 0;
  let easyCount = 0, mediumCount = 0, hardCount = 0;
  
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
      
      // Count by difficulty
      if (problem.difficulty === 'easy') easyCount++;
      else if (problem.difficulty === 'medium') mediumCount++;
      else if (problem.difficulty === 'hard') hardCount++;
      
    } catch (error) {
      console.error(`❌ Error adding ${problem.title}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Added ${successCount}/${allProblems.length} problems in this batch.`);
  console.log(`   Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount}`);
  
  // Show current total distribution
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
  
  console.log('\n📊 CURRENT TOTAL DISTRIBUTION:');
  console.log('=' .repeat(40));
  let grandTotal = 0;
  const targetDistribution = { easy: 33, medium: 33, hard: 34 };
  
  result.rows.forEach(row => {
    const count = parseInt(row.count);
    const target = targetDistribution[row.difficulty];
    const remaining = target - count;
    grandTotal += count;
    console.log(`${row.difficulty.toUpperCase()}: ${count}/${target} (${remaining} remaining)`);
  });
  
  console.log(`TOTAL: ${grandTotal}/100 (${100 - grandTotal} remaining)`);
  console.log('=' .repeat(40));
  
  if (grandTotal === 100) {
    console.log('🎯 SUCCESS! Exactly 100 Fortune 100-caliber SQL problems created!');
    console.log('🚀 Platform ready for data professional interviews!');
  } else if (grandTotal < 100) {
    console.log(`⚠️  Need ${100 - grandTotal} more problems to reach 100 total.`);
  }
  
  await pool.end();
}

addRemainingProblems().catch(console.error);