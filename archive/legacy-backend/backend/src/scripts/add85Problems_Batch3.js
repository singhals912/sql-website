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

// Batch 3: 10 Easy Problems
const easyProblems = [
  {
    id: uuidv4(),
    title: "Johnson & Johnson Drug Research Pipeline",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Johnson & Johnson's pharmaceutical division tracks drug development progress across different therapeutic areas to optimize R&D resource allocation and timeline planning.

**Scenario:** You're a research analyst at J&J Pharmaceuticals analyzing the drug development pipeline. The team needs to identify which therapeutic areas have the most active research projects.

**Problem:** Find all therapeutic areas that have more than 3 active drug research projects.

**Expected Output:** Therapeutic areas with their active project counts (>3 projects only), ordered by project count descending.`,
    setupSql: `CREATE TABLE jnj_drug_pipeline (
        project_id INT PRIMARY KEY,
        drug_name VARCHAR(100),
        therapeutic_area VARCHAR(50),
        phase VARCHAR(20),
        status VARCHAR(20),
        projected_completion DATE
    );
    
    INSERT INTO jnj_drug_pipeline VALUES 
    (1, 'Oncology Drug A', 'Oncology', 'Phase II', 'Active', '2025-06-15'),
    (2, 'Immunology Compound B', 'Immunology', 'Phase III', 'Active', '2024-12-20'),
    (3, 'Neuroscience Treatment C', 'Neuroscience', 'Phase I', 'Active', '2026-03-10'),
    (4, 'Cardiovascular Drug D', 'Cardiovascular', 'Phase II', 'Active', '2025-09-25'),
    (5, 'Oncology Drug E', 'Oncology', 'Phase I', 'Active', '2025-11-30'),
    (6, 'Immunology Compound F', 'Immunology', 'Phase II', 'On Hold', '2025-08-15'),
    (7, 'Oncology Drug G', 'Oncology', 'Phase III', 'Active', '2024-10-05'),
    (8, 'Neuroscience Treatment H', 'Neuroscience', 'Phase II', 'Active', '2025-07-18');`,
    solutionSql: `SELECT therapeutic_area, COUNT(*) as active_projects
FROM jnj_drug_pipeline 
WHERE status = 'Active'
GROUP BY therapeutic_area 
HAVING COUNT(*) > 3 
ORDER BY active_projects DESC;`,
    explanation: "Basic GROUP BY with HAVING and WHERE clause combination, testing filtering before and after aggregation."
  },
  {
    id: uuidv4(),
    title: "Home Depot Store Performance",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Home Depot's regional management team evaluates store performance metrics to make decisions about inventory allocation, staffing levels, and promotional strategies.

**Scenario:** You're a retail operations analyst at Home Depot analyzing store performance across different regions. The management team wants to identify top-performing regions for best practice sharing.

**Problem:** Find all regions where Home Depot stores have generated more than $100,000 in total sales.

**Expected Output:** Regions with total sales amounts (>$100k only), ordered by sales descending.`,
    setupSql: `CREATE TABLE homedepot_sales (
        store_id INT,
        store_name VARCHAR(50),
        region VARCHAR(30),
        daily_sales DECIMAL(10,2),
        sales_date DATE
    );
    
    INSERT INTO homedepot_sales VALUES 
    (101, 'Atlanta Main', 'Southeast', 45000.50, '2024-01-15'),
    (102, 'Dallas Central', 'Southwest', 52000.75, '2024-01-15'),
    (103, 'Chicago North', 'Midwest', 38000.25, '2024-01-15'),
    (104, 'Phoenix West', 'Southwest', 41000.80, '2024-01-15'),
    (105, 'Miami Beach', 'Southeast', 47500.25, '2024-01-16'),
    (106, 'Seattle Downtown', 'Northwest', 35000.60, '2024-01-16'),
    (107, 'Denver Tech', 'Mountain', 29000.45, '2024-01-16'),
    (102, 'Dallas Central', 'Southwest', 48000.90, '2024-01-16');`,
    solutionSql: `SELECT region, SUM(daily_sales) as total_sales
FROM homedepot_sales 
GROUP BY region 
HAVING SUM(daily_sales) > 100000 
ORDER BY total_sales DESC;`,
    explanation: "Regional sales aggregation with HAVING clause for filtering grouped sums, typical retail analytics pattern."
  },
  {
    id: uuidv4(),
    title: "Pfizer Vaccine Distribution Analysis",
    difficulty: "easy",
    category: "Basic Queries", 
    description: `**Business Context:** Pfizer's global supply chain team monitors vaccine distribution to ensure equitable access and optimize logistics across different regions and healthcare systems.

**Scenario:** You're a supply chain analyst at Pfizer tracking vaccine distribution efficiency. The team needs to identify regions with high distribution volumes for capacity planning.

**Problem:** List all regions that have received more than 50,000 vaccine doses in total.

**Expected Output:** Regions with total doses distributed (>50,000 doses only), ordered by doses descending.`,
    setupSql: `CREATE TABLE pfizer_distribution (
        shipment_id INT PRIMARY KEY,
        region VARCHAR(50),
        healthcare_facility VARCHAR(100),
        vaccine_type VARCHAR(30),
        doses_shipped INT,
        shipment_date DATE
    );
    
    INSERT INTO pfizer_distribution VALUES 
    (1, 'North America', 'Mayo Clinic', 'COVID-19 mRNA', 25000, '2024-01-15'),
    (2, 'Europe', 'NHS London', 'COVID-19 mRNA', 30000, '2024-01-15'),
    (3, 'Asia Pacific', 'Singapore General', 'COVID-19 mRNA', 18000, '2024-01-15'),
    (4, 'North America', 'Cleveland Clinic', 'COVID-19 mRNA', 22000, '2024-01-16'),
    (5, 'Europe', 'Charité Berlin', 'COVID-19 mRNA', 28000, '2024-01-16'),
    (6, 'Latin America', 'Hospital São Paulo', 'COVID-19 mRNA', 15000, '2024-01-16'),
    (7, 'North America', 'Johns Hopkins', 'COVID-19 mRNA', 27000, '2024-01-17'),
    (8, 'Asia Pacific', 'Tokyo Medical', 'COVID-19 mRNA', 20000, '2024-01-17');`,
    solutionSql: `SELECT region, SUM(doses_shipped) as total_doses
FROM pfizer_distribution 
GROUP BY region 
HAVING SUM(doses_shipped) > 50000 
ORDER BY total_doses DESC;`,
    explanation: "Healthcare supply chain analysis using GROUP BY and HAVING for pharmaceutical distribution metrics."
  },
  {
    id: uuidv4(),
    title: "UPS Package Delivery Performance",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** UPS operations teams monitor delivery performance across different service types to maintain customer satisfaction and optimize delivery routes and scheduling.

**Scenario:** You're a logistics analyst at UPS analyzing delivery performance metrics. The operations team wants to identify which service types are meeting volume thresholds for resource allocation.

**Problem:** Find all delivery service types that have processed more than 1,000 packages.

**Expected Output:** Service types with total package counts (>1,000 packages only), ordered by package count descending.`,
    setupSql: `CREATE TABLE ups_deliveries (
        delivery_id INT PRIMARY KEY,
        service_type VARCHAR(30),
        package_count INT,
        delivery_zone VARCHAR(20),
        delivery_date DATE
    );
    
    INSERT INTO ups_deliveries VALUES 
    (1, 'Ground', 450, 'Urban', '2024-01-15'),
    (2, 'Next Day Air', 125, 'Urban', '2024-01-15'),
    (3, '2-Day Air', 280, 'Suburban', '2024-01-15'),
    (4, 'Ground', 520, 'Rural', '2024-01-15'),
    (5, 'Ground', 380, 'Urban', '2024-01-16'),
    (6, 'Next Day Air', 95, 'Suburban', '2024-01-16'),
    (7, 'SurePost', 650, 'Urban', '2024-01-16'),
    (8, '2-Day Air', 240, 'Rural', '2024-01-16');`,
    solutionSql: `SELECT service_type, SUM(package_count) as total_packages
FROM ups_deliveries 
GROUP BY service_type 
HAVING SUM(package_count) > 1000 
ORDER BY total_packages DESC;`,
    explanation: "Logistics performance analysis with GROUP BY and HAVING, focusing on delivery service optimization."
  },
  {
    id: uuidv4(),
    title: "Procter & Gamble Brand Sales",
    difficulty: "easy", 
    category: "Aggregation",
    description: `**Business Context:** Procter & Gamble's brand management team tracks sales performance across their diverse product portfolio to make strategic decisions about marketing investments and product development.

**Scenario:** You're a brand analyst at P&G analyzing sales performance across different product categories. The team needs to identify which categories are driving the most revenue.

**Problem:** List all product categories with total sales exceeding $500,000.

**Expected Output:** Product categories with total sales (>$500k only), ordered by sales descending.`,
    setupSql: `CREATE TABLE pg_brand_sales (
        sale_id INT PRIMARY KEY,
        brand_name VARCHAR(50),
        product_category VARCHAR(50),
        sales_amount DECIMAL(12,2),
        sales_region VARCHAR(30),
        sales_date DATE
    );
    
    INSERT INTO pg_brand_sales VALUES 
    (1, 'Tide', 'Laundry Care', 285000.50, 'North America', '2024-01-15'),
    (2, 'Pampers', 'Baby Care', 420000.75, 'Global', '2024-01-15'),
    (3, 'Gillette', 'Grooming', 195000.25, 'North America', '2024-01-15'),
    (4, 'Olay', 'Beauty Care', 315000.80, 'Asia Pacific', '2024-01-15'),
    (5, 'Crest', 'Oral Care', 225000.60, 'Europe', '2024-01-16'),
    (6, 'Tide', 'Laundry Care', 325000.25, 'Europe', '2024-01-16'),
    (7, 'Pampers', 'Baby Care', 380000.90, 'Asia Pacific', '2024-01-16'),
    (8, 'Head & Shoulders', 'Hair Care', 165000.40, 'Latin America', '2024-01-16');`,
    solutionSql: `SELECT product_category, SUM(sales_amount) as total_sales
FROM pg_brand_sales 
GROUP BY product_category 
HAVING SUM(sales_amount) > 500000 
ORDER BY total_sales DESC;`,
    explanation: "Consumer goods sales analysis using aggregation functions to identify top-performing product categories."
  }
];

// Batch 3: 10 Medium Problems
const mediumProblems = [
  {
    id: uuidv4(),
    title: "Berkshire Hathaway Portfolio Analysis", 
    difficulty: "medium",
    category: "Window Functions",
    description: `**Business Context:** Berkshire Hathaway's investment team analyzes portfolio performance across different sectors to make informed decisions about position sizing and sector allocation strategies.

**Scenario:** You're a portfolio analyst at Berkshire Hathaway working on sector performance evaluation. Warren Buffett's team needs to understand how each holding ranks within its sector by market value.

**Problem:** For each stock holding, calculate its rank within its sector based on market value, and show only the top 2 holdings per sector.

**Expected Output:** Stock holdings with their sector rank, showing only rank 1 and 2 positions per sector, ordered by sector and rank.`,
    setupSql: `CREATE TABLE berkshire_holdings (
        holding_id INT PRIMARY KEY,
        company_name VARCHAR(100),
        ticker_symbol VARCHAR(10),
        sector VARCHAR(50),
        market_value DECIMAL(15,2),
        shares_owned BIGINT,
        last_updated DATE
    );
    
    INSERT INTO berkshire_holdings VALUES 
    (1, 'Apple Inc', 'AAPL', 'Technology', 125000000000, 915000000, '2024-01-15'),
    (2, 'Bank of America', 'BAC', 'Financial', 35000000000, 1025000000, '2024-01-15'),
    (3, 'Coca-Cola Company', 'KO', 'Consumer Staples', 25000000000, 400000000, '2024-01-15'),
    (4, 'Microsoft Corp', 'MSFT', 'Technology', 8500000000, 25000000, '2024-01-15'),
    (5, 'American Express', 'AXP', 'Financial', 22000000000, 151000000, '2024-01-15'),
    (6, 'Kraft Heinz', 'KHC', 'Consumer Staples', 12000000000, 325000000, '2024-01-15'),
    (7, 'Chevron Corporation', 'CVX', 'Energy', 18000000000, 123000000, '2024-01-15'),
    (8, 'Occidental Petroleum', 'OXY', 'Energy', 15000000000, 250000000, '2024-01-15');`,
    solutionSql: `WITH sector_rankings AS (
        SELECT 
            company_name,
            ticker_symbol,
            sector,
            market_value,
            ROW_NUMBER() OVER (PARTITION BY sector ORDER BY market_value DESC) as sector_rank
        FROM berkshire_holdings
    )
    SELECT 
        company_name,
        ticker_symbol,
        sector,
        market_value,
        sector_rank
    FROM sector_rankings
    WHERE sector_rank <= 2
    ORDER BY sector, sector_rank;`,
    explanation: "Advanced window functions using ROW_NUMBER() with PARTITION BY to rank holdings within sectors, demonstrating portfolio analysis techniques."
  },
  {
    id: uuidv4(),
    title: "Salesforce Customer Success Metrics",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** Salesforce's customer success team tracks user adoption and feature utilization to identify accounts at risk of churn and opportunities for expansion.

**Scenario:** You're a customer success analyst at Salesforce analyzing user engagement patterns. The team needs to identify enterprise customers with low feature adoption rates who might need additional support.

**Problem:** Find enterprise customers who have used fewer than 3 different Salesforce features in the last month, along with their total usage hours.

**Expected Output:** Enterprise customer details with feature count and total hours, only showing customers with <3 features used.`,
    setupSql: `CREATE TABLE salesforce_customers (
        customer_id INT PRIMARY KEY,
        company_name VARCHAR(100),
        tier VARCHAR(20),
        contract_value DECIMAL(12,2),
        signup_date DATE
    );
    
    CREATE TABLE salesforce_usage (
        usage_id INT PRIMARY KEY,
        customer_id INT,
        feature_name VARCHAR(50),
        usage_hours DECIMAL(6,2),
        usage_date DATE
    );
    
    INSERT INTO salesforce_customers VALUES 
    (2001, 'Enterprise Corp A', 'Enterprise', 250000.00, '2023-03-15'),
    (2002, 'Global Industries B', 'Enterprise', 450000.00, '2023-01-20'),
    (2003, 'Startup XYZ', 'Professional', 25000.00, '2023-09-10'),
    (2004, 'MegaCorp C', 'Enterprise', 750000.00, '2022-11-05');
    
    INSERT INTO salesforce_usage VALUES 
    (1, 2001, 'Sales Cloud', 45.5, '2024-01-15'),
    (2, 2001, 'Service Cloud', 28.3, '2024-01-16'),
    (3, 2002, 'Sales Cloud', 85.2, '2024-01-15'),
    (4, 2002, 'Marketing Cloud', 62.1, '2024-01-16'),
    (5, 2002, 'Analytics Cloud', 38.7, '2024-01-17'),
    (6, 2002, 'Commerce Cloud', 24.9, '2024-01-18'),
    (7, 2004, 'Sales Cloud', 15.6, '2024-01-15'),
    (8, 2004, 'Einstein AI', 8.4, '2024-01-16');`,
    solutionSql: `SELECT 
        c.customer_id,
        c.company_name,
        c.tier,
        COUNT(DISTINCT u.feature_name) as features_used,
        SUM(u.usage_hours) as total_hours
    FROM salesforce_customers c
    LEFT JOIN salesforce_usage u ON c.customer_id = u.customer_id
        AND u.usage_date >= CURRENT_DATE - INTERVAL '30 days'
    WHERE c.tier = 'Enterprise'
    GROUP BY c.customer_id, c.company_name, c.tier
    HAVING COUNT(DISTINCT u.feature_name) < 3
    ORDER BY features_used ASC, total_hours DESC;`,
    explanation: "Customer success analysis using JOINs with date filtering, GROUP BY with HAVING, and COUNT(DISTINCT) for feature adoption tracking."
  }
];

// Batch 3: 5 Hard Problems
const hardProblems = [
  {
    id: uuidv4(),
    title: "Morgan Stanley Risk Management",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Morgan Stanley's risk management division monitors portfolio risk across trading desks and client accounts to ensure compliance with regulatory limits and internal risk policies.

**Scenario:** You're a senior risk analyst at Morgan Stanley developing early warning systems for portfolio risk. The team needs to identify trading strategies that show concerning risk-return patterns.

**Problem:** Calculate the Value at Risk (VaR) for each trading strategy using the 95th percentile of daily losses. Include strategies with at least 10 trading days and identify those where VaR exceeds $1 million.

**Expected Output:** Trading strategies with trading days count, average daily P&L, VaR (95th percentile of losses), and risk classification, ordered by VaR descending.`,
    setupSql: `CREATE TABLE trading_pnl (
        trade_id INT PRIMARY KEY,
        strategy_name VARCHAR(50),
        trader_id INT,
        daily_pnl DECIMAL(12,2),
        trade_date DATE
    );
    
    INSERT INTO trading_pnl VALUES 
    (1, 'Equity Long-Short', 101, 125000.50, '2024-01-15'),
    (2, 'Fixed Income Arb', 102, 75000.25, '2024-01-15'),
    (3, 'Equity Long-Short', 101, -85000.75, '2024-01-16'),
    (4, 'Credit Derivatives', 103, 245000.80, '2024-01-15'),
    (5, 'Equity Long-Short', 101, 195000.60, '2024-01-17'),
    (6, 'Fixed Income Arb', 102, -125000.45, '2024-01-16'),
    (7, 'Equity Long-Short', 101, -155000.20, '2024-01-18'),
    (8, 'Credit Derivatives', 103, 185000.30, '2024-01-16'),
    (9, 'Equity Long-Short', 101, 85000.90, '2024-01-19'),
    (10, 'Fixed Income Arb', 102, 95000.15, '2024-01-17'),
    (11, 'Equity Long-Short', 101, -225000.40, '2024-01-20'),
    (12, 'Credit Derivatives', 103, -195000.60, '2024-01-17'),
    (13, 'Equity Long-Short', 101, 155000.25, '2024-01-21'),
    (14, 'Fixed Income Arb', 102, -85000.80, '2024-01-18'),
    (15, 'Equity Long-Short', 101, -125000.35, '2024-01-22');`,
    solutionSql: `WITH strategy_stats AS (
        SELECT 
            strategy_name,
            COUNT(*) as trading_days,
            AVG(daily_pnl) as avg_daily_pnl,
            PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY daily_pnl) as var_95
        FROM trading_pnl
        GROUP BY strategy_name
        HAVING COUNT(*) >= 10
    )
    SELECT 
        strategy_name,
        trading_days,
        ROUND(avg_daily_pnl, 2) as avg_daily_pnl,
        ROUND(ABS(var_95), 2) as var_95_loss,
        CASE 
            WHEN ABS(var_95) > 1000000 THEN 'High Risk'
            WHEN ABS(var_95) > 500000 THEN 'Medium Risk'
            ELSE 'Low Risk'
        END as risk_classification
    FROM strategy_stats
    WHERE ABS(var_95) > 1000000
    ORDER BY ABS(var_95) DESC;`,
    explanation: "Advanced financial risk analysis using PERCENTILE_CONT for VaR calculation, demonstrating sophisticated risk management SQL techniques."
  }
];

async function importBatch3() {
  console.log('🚀 Starting import of 25 problems (Batch 3)...');
  
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
  
  console.log(`🎉 Batch 3 import complete! Added ${successCount}/${allProblems.length} problems.`);
  
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

importBatch3().catch(console.error);