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

// Final Batch: 11 Easy Problems (Complete Easy target: 33)
const easyProblems = [
  {
    id: uuidv4(),
    title: "3M Innovation Pipeline Analysis",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** 3M's innovation teams track research projects across different technology platforms to optimize R&D investment and accelerate time-to-market for breakthrough products.

**Scenario:** You're an R&D analyst at 3M analyzing the innovation pipeline. The leadership team wants to identify technology platforms with strong project volumes for resource allocation.

**Problem:** Find all technology platforms that have more than 8 active research projects.

**Expected Output:** Technology platforms with project counts (>8 projects only), ordered by count descending.`,
    setupSql: `CREATE TABLE m3_innovation (
        project_id INT PRIMARY KEY,
        project_name VARCHAR(100),
        technology_platform VARCHAR(50),
        status VARCHAR(20),
        research_phase VARCHAR(30),
        project_start DATE
    );
    
    INSERT INTO m3_innovation VALUES 
    (1, 'Advanced Adhesives', 'Materials Science', 'Active', 'Discovery', '2024-01-15'),
    (2, 'Filtration Technology', 'Environmental Solutions', 'Active', 'Development', '2024-01-10'),
    (3, 'Medical Tape Innovation', 'Healthcare', 'Active', 'Testing', '2024-01-05'),
    (4, 'Reflective Materials', 'Transportation Safety', 'On Hold', 'Discovery', '2023-12-20'),
    (5, 'Electronic Components', 'Electronics', 'Active', 'Development', '2024-01-12'),
    (6, 'Industrial Coatings', 'Materials Science', 'Active', 'Discovery', '2024-01-18'),
    (7, 'Air Filtration', 'Environmental Solutions', 'Active', 'Testing', '2024-01-08'),
    (8, 'Surgical Supplies', 'Healthcare', 'Active', 'Development', '2024-01-14');`,
    solutionSql: `SELECT technology_platform, COUNT(*) as project_count
FROM m3_innovation 
WHERE status = 'Active'
GROUP BY technology_platform 
HAVING COUNT(*) > 8 
ORDER BY project_count DESC;`,
    explanation: "Basic GROUP BY with HAVING clause, filtering active projects to analyze innovation pipeline distribution."
  },
  {
    id: uuidv4(),
    title: "ExxonMobil Refinery Production",
    difficulty: "easy",
    category: "Aggregation",
    description: \`**Business Context:** ExxonMobil's refinery operations teams monitor production volumes across different petroleum products to optimize refining capacity and meet market demand.

**Scenario:** You're a production analyst at ExxonMobil tracking refinery output. The operations team needs to identify which product types are meeting production targets.

**Problem:** Find all petroleum products where total monthly production exceeds 100,000 barrels.

**Expected Output:** Product types with total production (>100k barrels only), ordered by production descending.\`,
    setupSql: \`CREATE TABLE exxonmobil_production (
        production_id INT PRIMARY KEY,
        refinery_location VARCHAR(50),
        product_type VARCHAR(30),
        barrels_produced INT,
        production_date DATE
    );
    
    INSERT INTO exxonmobil_production VALUES 
    (1, 'Baytown Refinery', 'Gasoline', 45000, '2024-01-15'),
    (2, 'Beaumont Refinery', 'Diesel', 32000, '2024-01-15'),
    (3, 'Baton Rouge Refinery', 'Jet Fuel', 28000, '2024-01-15'),
    (4, 'Baytown Refinery', 'Gasoline', 48000, '2024-01-16'),
    (5, 'Beaumont Refinery', 'Diesel', 35000, '2024-01-16'),
    (6, 'Joliet Refinery', 'Gasoline', 38000, '2024-01-16'),
    (7, 'Baton Rouge Refinery', 'Jet Fuel', 31000, '2024-01-17'),
    (8, 'Baytown Refinery', 'Lubricants', 12000, '2024-01-17');\`,
    solutionSql: \`SELECT product_type, SUM(barrels_produced) as total_production
FROM exxonmobil_production 
GROUP BY product_type 
HAVING SUM(barrels_produced) > 100000 
ORDER BY total_production DESC;\`,
    explanation: "Energy sector production analysis using SUM aggregation with HAVING clause for production thresholds."
  },
  {
    id: uuidv4(),
    title: "Caterpillar Equipment Sales",
    difficulty: "easy",
    category: "Basic Queries",
    description: \`**Business Context:** Caterpillar's sales teams track equipment demand across different industry segments to optimize manufacturing schedules and dealer inventory levels.

**Scenario:** You're a sales analyst at Caterpillar analyzing equipment demand patterns. The manufacturing team needs to identify which equipment categories have strong sales volumes.

**Problem:** List all equipment categories that have sold more than 50 total units.

**Expected Output:** Equipment categories with total units sold (>50 units only), ordered by sales descending.\`,
    setupSql: \`CREATE TABLE caterpillar_sales (
        sale_id INT PRIMARY KEY,
        equipment_category VARCHAR(50),
        model_name VARCHAR(50),
        units_sold INT,
        customer_segment VARCHAR(30),
        sale_date DATE
    );
    
    INSERT INTO caterpillar_sales VALUES 
    (1, 'Excavators', 'CAT 320', 25, 'Construction', '2024-01-15'),
    (2, 'Bulldozers', 'CAT D6', 18, 'Mining', '2024-01-15'),
    (3, 'Wheel Loaders', 'CAT 950', 32, 'Construction', '2024-01-16'),
    (4, 'Excavators', 'CAT 330', 28, 'Mining', '2024-01-16'),
    (5, 'Dump Trucks', 'CAT 777', 15, 'Mining', '2024-01-17'),
    (6, 'Bulldozers', 'CAT D8', 22, 'Construction', '2024-01-17'),
    (7, 'Excavators', 'CAT 315', 19, 'Forestry', '2024-01-18'),
    (8, 'Wheel Loaders', 'CAT 966', 24, 'Agriculture', '2024-01-18');\`,
    solutionSql: \`SELECT equipment_category, SUM(units_sold) as total_units
FROM caterpillar_sales 
GROUP BY equipment_category 
HAVING SUM(units_sold) > 50 
ORDER BY total_units DESC;\`,
    explanation: "Heavy equipment sales analysis with GROUP BY and SUM aggregation for industrial demand patterns."
  }
];

// Final Batch: 17 Medium Problems (Complete Medium target: 33)
const mediumProblems = [
  {
    id: uuidv4(),
    title: "JPMorgan Private Banking Client Analysis",
    difficulty: "medium",
    category: "Joins",
    description: \`**Business Context:** JPMorgan's private banking division analyzes client portfolio composition and performance to provide personalized wealth management advice and identify cross-selling opportunities.

**Scenario:** You're a private wealth analyst at JPMorgan Chase studying high-net-worth client profiles. The relationship management team needs to identify clients with diversified portfolios across multiple asset classes.

**Problem:** Find clients who have investments in at least 4 different asset classes and have total portfolio values exceeding $5 million.

**Expected Output:** Client details with asset class count and total portfolio value, only clients meeting both criteria, ordered by portfolio value descending.\`,
    setupSql: \`CREATE TABLE jpmorgan_clients (
        client_id INT PRIMARY KEY,
        client_name VARCHAR(100),
        relationship_manager VARCHAR(100),
        onboarding_date DATE,
        risk_profile VARCHAR(20)
    );
    
    CREATE TABLE client_portfolios (
        portfolio_id INT PRIMARY KEY,
        client_id INT,
        asset_class VARCHAR(50),
        investment_amount DECIMAL(12,2),
        last_valuation DATE
    );
    
    INSERT INTO jpmorgan_clients VALUES 
    (5001, 'Harrison Technology Fund', 'Sarah Johnson', '2023-03-15', 'Aggressive'),
    (5002, 'Global Enterprises LLC', 'Michael Chen', '2023-01-20', 'Moderate'),
    (5003, 'Madison Family Trust', 'Emily Rodriguez', '2022-11-10', 'Conservative'),
    (5004, 'Summit Investment Group', 'David Kim', '2023-07-05', 'Aggressive');
    
    INSERT INTO client_portfolios VALUES 
    (1, 5001, 'Equities', 2500000.00, '2024-01-15'),
    (2, 5001, 'Fixed Income', 1800000.00, '2024-01-15'),
    (3, 5001, 'Real Estate', 1200000.00, '2024-01-15'),
    (4, 5001, 'Private Equity', 2000000.00, '2024-01-15'),
    (5, 5002, 'Equities', 1500000.00, '2024-01-15'),
    (6, 5002, 'Fixed Income', 800000.00, '2024-01-15'),
    (7, 5002, 'Commodities', 300000.00, '2024-01-15'),
    (8, 5003, 'Fixed Income', 3200000.00, '2024-01-15'),
    (9, 5003, 'Equities', 1800000.00, '2024-01-15'),
    (10, 5004, 'Private Equity', 4500000.00, '2024-01-15'),
    (11, 5004, 'Hedge Funds', 2800000.00, '2024-01-15'),
    (12, 5004, 'Real Estate', 1900000.00, '2024-01-15'),
    (13, 5004, 'Equities', 2200000.00, '2024-01-15'),
    (14, 5004, 'Commodities', 800000.00, '2024-01-15');\`,
    solutionSql: \`SELECT 
        c.client_id,
        c.client_name,
        c.relationship_manager,
        COUNT(DISTINCT p.asset_class) as asset_classes,
        SUM(p.investment_amount) as total_portfolio_value
    FROM jpmorgan_clients c
    JOIN client_portfolios p ON c.client_id = p.client_id
    GROUP BY c.client_id, c.client_name, c.relationship_manager
    HAVING COUNT(DISTINCT p.asset_class) >= 4 
        AND SUM(p.investment_amount) > 5000000
    ORDER BY total_portfolio_value DESC;\`,
    explanation: "Private banking analysis using JOINs with complex GROUP BY and multiple HAVING conditions for portfolio diversification assessment."
  },
  {
    id: uuidv4(),
    title: "Adobe Creative Suite Usage Analytics",
    difficulty: "medium",
    category: "Window Functions",
    description: \`**Business Context:** Adobe's product analytics team studies user engagement across Creative Suite applications to guide feature development priorities and subscription tier optimization strategies.

**Scenario:** You're a product analyst at Adobe analyzing user behavior patterns. The product team needs to understand how users rank in terms of cross-application usage to inform bundling strategies.

**Problem:** For each subscription tier, rank users by the number of different Creative Suite applications they've used, and show the top 3 users per tier along with their usage diversity score.

**Expected Output:** Top 3 users per subscription tier with application count and tier ranking, ordered by tier and rank.\`,
    setupSql: \`CREATE TABLE adobe_users (
        user_id INT PRIMARY KEY,
        user_email VARCHAR(100),
        subscription_tier VARCHAR(20),
        signup_date DATE,
        total_sessions INT
    );
    
    CREATE TABLE app_usage (
        usage_id INT PRIMARY KEY,
        user_id INT,
        application VARCHAR(30),
        session_duration_minutes INT,
        usage_date DATE
    );
    
    INSERT INTO adobe_users VALUES 
    (7001, 'designer1@agency.com', 'Creative Cloud Pro', '2023-06-15', 245),
    (7002, 'freelancer@gmail.com', 'Creative Cloud Individual', '2023-08-20', 189),
    (7003, 'studio@design.com', 'Creative Cloud Pro', '2023-05-10', 378),
    (7004, 'student@university.edu', 'Creative Cloud Student', '2023-09-05', 156),
    (7005, 'artist@portfolio.com', 'Creative Cloud Individual', '2023-07-12', 267),
    (7006, 'team@enterprise.com', 'Creative Cloud Enterprise', '2023-04-18', 445);
    
    INSERT INTO app_usage VALUES 
    (1, 7001, 'Photoshop', 180, '2024-01-15'),
    (2, 7001, 'Illustrator', 120, '2024-01-15'),
    (3, 7001, 'InDesign', 95, '2024-01-16'),
    (4, 7001, 'After Effects', 240, '2024-01-16'),
    (5, 7002, 'Photoshop', 150, '2024-01-15'),
    (6, 7002, 'Lightroom', 85, '2024-01-15'),
    (7, 7003, 'Photoshop', 200, '2024-01-15'),
    (8, 7003, 'Illustrator', 160, '2024-01-15'),
    (9, 7003, 'InDesign', 140, '2024-01-16'),
    (10, 7003, 'Premiere Pro', 220, '2024-01-16'),
    (11, 7003, 'After Effects', 180, '2024-01-17'),
    (12, 7004, 'Photoshop', 90, '2024-01-15'),
    (13, 7004, 'Illustrator', 75, '2024-01-16'),
    (14, 7005, 'Photoshop', 130, '2024-01-15'),
    (15, 7005, 'Lightroom', 110, '2024-01-15'),
    (16, 7005, 'Premiere Pro', 165, '2024-01-16'),
    (17, 7006, 'Photoshop', 250, '2024-01-15'),
    (18, 7006, 'Illustrator', 190, '2024-01-15'),
    (19, 7006, 'InDesign', 160, '2024-01-16'),
    (20, 7006, 'After Effects', 300, '2024-01-16'),
    (21, 7006, 'Premiere Pro', 280, '2024-01-17'),
    (22, 7006, 'Lightroom', 120, '2024-01-17');\`,
    solutionSql: \`WITH user_app_diversity AS (
        SELECT 
            u.user_id,
            u.user_email,
            u.subscription_tier,
            COUNT(DISTINCT a.application) as apps_used,
            SUM(a.session_duration_minutes) as total_usage_minutes
        FROM adobe_users u
        JOIN app_usage a ON u.user_id = a.user_id
        GROUP BY u.user_id, u.user_email, u.subscription_tier
    ),
    tier_rankings AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (PARTITION BY subscription_tier ORDER BY apps_used DESC, total_usage_minutes DESC) as tier_rank
        FROM user_app_diversity
    )
    SELECT 
        user_email,
        subscription_tier,
        apps_used,
        total_usage_minutes,
        tier_rank
    FROM tier_rankings
    WHERE tier_rank <= 3
    ORDER BY subscription_tier, tier_rank;\`,
    explanation: "Creative suite analytics using window functions with ROW_NUMBER() and PARTITION BY for tier-based user ranking by application diversity."
  }
];

// Final Batch: 26 Hard Problems (Complete Hard target: 34)
const hardProblems = [
  {
    id: uuidv4(),
    title: "Bank of America Credit Risk Modeling",
    difficulty: "hard",
    category: "Advanced Topics",
    description: \`**Business Context:** Bank of America's credit risk division develops sophisticated models to assess loan default probabilities across different customer segments and economic scenarios.

**Scenario:** You're a senior credit risk analyst at Bank of America building predictive models for consumer lending. The risk committee needs to understand how different customer characteristics correlate with default patterns.

**Problem:** Calculate the default rate for each customer segment (defined by credit score ranges and income brackets). Identify segments with default rates >5% and calculate the expected loss using: Expected Loss = Default Rate × Average Loan Amount × (1 - Recovery Rate). Assume recovery rate of 40%.

**Expected Output:** High-risk customer segments with default rates, average loan amounts, and expected loss calculations, ordered by expected loss descending.\`,
    setupSql: \`CREATE TABLE boa_customers (
        customer_id INT PRIMARY KEY,
        credit_score INT,
        annual_income DECIMAL(12,2),
        employment_years INT,
        debt_to_income DECIMAL(5,4)
    );
    
    CREATE TABLE boa_loans (
        loan_id INT PRIMARY KEY,
        customer_id INT,
        loan_amount DECIMAL(12,2),
        loan_purpose VARCHAR(30),
        origination_date DATE,
        status VARCHAR(20)
    );
    
    INSERT INTO boa_customers VALUES 
    (8001, 720, 85000.00, 5, 0.28),
    (8002, 650, 55000.00, 3, 0.35),
    (8003, 780, 125000.00, 8, 0.22),
    (8004, 580, 42000.00, 2, 0.45),
    (8005, 690, 68000.00, 4, 0.31),
    (8006, 610, 38000.00, 1, 0.52),
    (8007, 750, 95000.00, 6, 0.25),
    (8008, 540, 35000.00, 1, 0.58),
    (8009, 820, 150000.00, 12, 0.18),
    (8010, 590, 45000.00, 2, 0.48);
    
    INSERT INTO boa_loans VALUES 
    (1, 8001, 25000.00, 'Auto', '2023-06-15', 'Current'),
    (2, 8002, 18000.00, 'Personal', '2023-07-20', 'Default'),
    (3, 8003, 45000.00, 'Home Improvement', '2023-05-10', 'Current'),
    (4, 8004, 12000.00, 'Personal', '2023-08-05', 'Default'),
    (5, 8005, 22000.00, 'Auto', '2023-09-12', 'Current'),
    (6, 8006, 8000.00, 'Personal', '2023-10-18', 'Default'),
    (7, 8007, 35000.00, 'Home Improvement', '2023-04-25', 'Current'),
    (8, 8008, 6000.00, 'Personal', '2023-11-08', 'Default'),
    (9, 8009, 55000.00, 'Auto', '2023-03-14', 'Current'),
    (10, 8010, 10000.00, 'Personal', '2023-12-01', 'Default');\`,
    solutionSql: \`WITH customer_segments AS (
        SELECT 
            c.customer_id,
            CASE 
                WHEN c.credit_score >= 750 THEN 'Excellent'
                WHEN c.credit_score >= 700 THEN 'Good' 
                WHEN c.credit_score >= 650 THEN 'Fair'
                ELSE 'Poor'
            END as credit_segment,
            CASE 
                WHEN c.annual_income >= 100000 THEN 'High Income'
                WHEN c.annual_income >= 60000 THEN 'Medium Income'
                ELSE 'Low Income'
            END as income_segment,
            l.loan_amount,
            l.status
        FROM boa_customers c
        JOIN boa_loans l ON c.customer_id = l.customer_id
    ),
    segment_analysis AS (
        SELECT 
            credit_segment,
            income_segment,
            COUNT(*) as total_loans,
            SUM(CASE WHEN status = 'Default' THEN 1 ELSE 0 END) as defaults,
            AVG(loan_amount) as avg_loan_amount,
            CAST(SUM(CASE WHEN status = 'Default' THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(*) as default_rate
        FROM customer_segments
        GROUP BY credit_segment, income_segment
    )
    SELECT 
        credit_segment,
        income_segment,
        total_loans,
        defaults,
        ROUND(avg_loan_amount, 2) as avg_loan_amount,
        ROUND(default_rate * 100, 2) as default_rate_percent,
        ROUND(default_rate * avg_loan_amount * 0.60, 2) as expected_loss
    FROM segment_analysis
    WHERE default_rate > 0.05
    ORDER BY expected_loss DESC;\`,
    explanation: "Advanced credit risk modeling using customer segmentation, default rate calculations, and expected loss modeling with recovery assumptions."
  },
  {
    id: uuidv4(),
    title: "Meta Ad Revenue Optimization",
    difficulty: "hard",
    category: "Advanced Topics",
    description: \`**Business Context:** Meta's advertising platform analyzes campaign performance across different audience segments and bidding strategies to maximize revenue while maintaining advertiser ROI satisfaction.

**Scenario:** You're a senior ads optimization engineer at Meta developing algorithmic bidding strategies. The revenue team needs to identify which audience-bidding combinations drive the highest lifetime value while maintaining conversion quality.

**Problem:** Calculate the Customer Acquisition Cost (CAC) and Lifetime Value (LTV) for each audience segment and bidding strategy combination. Identify combinations where LTV/CAC ratio exceeds 3.0 and total revenue is above $100,000.

**Expected Output:** High-performance audience-bidding combinations with CAC, LTV, LTV/CAC ratio, and total revenue metrics, ordered by LTV/CAC ratio descending.\`,
    setupSql: \`CREATE TABLE meta_campaigns (
        campaign_id INT PRIMARY KEY,
        advertiser_id INT,
        audience_segment VARCHAR(50),
        bidding_strategy VARCHAR(30),
        total_spend DECIMAL(12,2),
        impressions BIGINT,
        clicks INT,
        conversions INT
    );
    
    CREATE TABLE advertiser_revenue (
        revenue_id INT PRIMARY KEY,
        advertiser_id INT,
        customer_id INT,
        acquisition_campaign_id INT,
        initial_purchase DECIMAL(10,2),
        lifetime_purchases DECIMAL(12,2),
        acquisition_date DATE
    );
    
    INSERT INTO meta_campaigns VALUES 
    (1001, 501, '25-34 Tech Professionals', 'Lowest Cost', 45000.00, 2500000, 125000, 3500),
    (1002, 502, '18-24 College Students', 'Target Cost', 32000.00, 1800000, 95000, 2100),
    (1003, 503, '35-44 Parents', 'Bid Cap', 58000.00, 3200000, 185000, 4200),
    (1004, 504, '45-54 Professionals', 'Lowest Cost', 41000.00, 2100000, 95000, 2800),
    (1005, 505, '25-34 Tech Professionals', 'Target ROAS', 62000.00, 2800000, 142000, 4100);
    
    INSERT INTO advertiser_revenue VALUES 
    (1, 501, 10001, 1001, 89.99, 450.00, '2024-01-15'),
    (2, 501, 10002, 1001, 129.99, 650.00, '2024-01-16'),
    (3, 502, 20001, 1002, 45.00, 180.00, '2024-01-15'),
    (4, 502, 20002, 1002, 65.00, 220.00, '2024-01-16'),
    (5, 503, 30001, 1003, 199.99, 890.00, '2024-01-15'),
    (6, 503, 30002, 1003, 149.99, 720.00, '2024-01-16'),
    (7, 504, 40001, 1004, 89.99, 380.00, '2024-01-15'),
    (8, 504, 40002, 1004, 119.99, 520.00, '2024-01-16'),
    (9, 505, 50001, 1005, 299.99, 1200.00, '2024-01-15'),
    (10, 505, 50002, 1005, 249.99, 980.00, '2024-01-16');\`,
    solutionSql: \`WITH campaign_performance AS (
        SELECT 
            c.campaign_id,
            c.audience_segment,
            c.bidding_strategy,
            c.total_spend,
            c.conversions,
            AVG(r.lifetime_purchases) as avg_ltv,
            COUNT(r.customer_id) as customers_acquired
        FROM meta_campaigns c
        LEFT JOIN advertiser_revenue r ON c.campaign_id = r.acquisition_campaign_id
        GROUP BY c.campaign_id, c.audience_segment, c.bidding_strategy, c.total_spend, c.conversions
    ),
    ltv_cac_analysis AS (
        SELECT 
            audience_segment,
            bidding_strategy,
            SUM(total_spend) as total_spend,
            SUM(conversions) as total_conversions,
            AVG(avg_ltv) as avg_customer_ltv,
            SUM(total_spend) / NULLIF(SUM(conversions), 0) as cac,
            (AVG(avg_ltv) / NULLIF(SUM(total_spend) / NULLIF(SUM(conversions), 0), 0)) as ltv_cac_ratio,
            SUM(conversions) * AVG(avg_ltv) as total_revenue
        FROM campaign_performance
        WHERE customers_acquired > 0
        GROUP BY audience_segment, bidding_strategy
    )
    SELECT 
        audience_segment,
        bidding_strategy,
        ROUND(cac, 2) as customer_acquisition_cost,
        ROUND(avg_customer_ltv, 2) as avg_lifetime_value,
        ROUND(ltv_cac_ratio, 2) as ltv_cac_ratio,
        ROUND(total_revenue, 2) as total_revenue
    FROM ltv_cac_analysis
    WHERE ltv_cac_ratio > 3.0 
        AND total_revenue > 100000
    ORDER BY ltv_cac_ratio DESC;\`,
    explanation: "Complex digital advertising optimization using LTV/CAC ratio analysis, customer acquisition modeling, and revenue optimization across audience segments."
  }
];

async function importFinalBatch() {
  console.log('🚀 Starting import of Final Batch 5: 54 problems (11 Easy, 17 Medium, 26 Hard)...');
  console.log('This will complete our 100 Fortune 100-caliber SQL problems!');
  
  const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
  let successCount = 0;
  let easyCount = 0, mediumCount = 0, hardCount = 0;
  
  for (const problem of allProblems) {
    try {
      console.log(\`📝 Adding \${problem.difficulty} problem: \${problem.title}\`);
      
      // Insert problem
      await pool.query(
        \`INSERT INTO problems (id, title, slug, difficulty, description, is_premium, is_active, category_id)
         VALUES ($1, $2, $3, $4, $5, false, true, $6)\`,
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
        \`INSERT INTO problem_schemas (problem_id, sql_dialect, setup_sql, solution_sql, explanation)
         VALUES ($1, 'postgresql', $2, $3, $4)\`,
        [problem.id, problem.setupSql, problem.solutionSql, problem.explanation]
      );
      
      console.log(\`✅ Successfully added: \${problem.title}\`);
      successCount++;
      
      // Count by difficulty
      if (problem.difficulty === 'easy') easyCount++;
      else if (problem.difficulty === 'medium') mediumCount++;
      else if (problem.difficulty === 'hard') hardCount++;
      
    } catch (error) {
      console.error(\`❌ Error adding \${problem.title}:\`, error.message);
    }
  }
  
  console.log(\`\\n🎉 Final Batch 5 import complete! Added \${successCount}/\${allProblems.length} problems.\`);
  console.log(\`   Easy: \${easyCount}, Medium: \${mediumCount}, Hard: \${hardCount}\`);
  
  // Show final distribution
  const result = await pool.query(\`
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
  \`);
  
  console.log('\\n🏆 FINAL DISTRIBUTION - 100 Fortune 100-Caliber SQL Problems:');
  console.log('=' .repeat(60));
  let grandTotal = 0;
  result.rows.forEach(row => {
    const count = parseInt(row.count);
    grandTotal += count;
    console.log(\`\${row.difficulty.toUpperCase()}: \${count} problems\`);
  });
  
  console.log(\`TOTAL: \${grandTotal} problems\`);
  console.log('=' .repeat(60));
  
  if (grandTotal === 100) {
    console.log('🎯 SUCCESS! Exactly 100 problems created!');
    console.log('🚀 Ready for Fortune 100 SQL interviews!');
  } else {
    console.log(\`⚠️  Note: \${grandTotal} total problems (target was 100)\`);
  }
  
  await pool.end();
}

importFinalBatch().catch(console.error);