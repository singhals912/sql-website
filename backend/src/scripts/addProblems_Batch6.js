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

// Batch 6: 4 Easy Problems 
const easyProblems = [
  {
    id: uuidv4(),
    title: "Nike Product Sales by Region",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Nike's regional sales teams track product performance across different markets to optimize inventory distribution and marketing spend allocation.

**Scenario:** You're a sales analyst at Nike analyzing regional performance. The marketing team wants to identify regions with strong sales volumes for upcoming campaign investments.

**Problem:** Find all regions where Nike products have generated more than $500,000 in total sales.

**Expected Output:** Regions with total sales amounts (>$500k only), ordered by sales descending.`,
    setupSql: `CREATE TABLE nike_sales (
        sale_id INT PRIMARY KEY,
        product_line VARCHAR(50),
        region VARCHAR(30),
        sales_amount DECIMAL(10,2),
        units_sold INT,
        sale_date DATE
    );
    
    INSERT INTO nike_sales VALUES 
    (1, 'Air Jordan', 'North America', 125000.50, 450, '2024-01-15'),
    (2, 'Air Max', 'Europe', 89000.75, 320, '2024-01-15'),
    (3, 'React Running', 'Asia Pacific', 67000.25, 280, '2024-01-16'),
    (4, 'Air Force 1', 'North America', 98000.80, 380, '2024-01-16'),
    (5, 'Dunk Series', 'Europe', 78000.60, 295, '2024-01-17'),
    (6, 'Air Jordan', 'Asia Pacific', 156000.25, 520, '2024-01-17'),
    (7, 'Training Shoes', 'Latin America', 45000.90, 215, '2024-01-18'),
    (8, 'Air Max', 'North America', 134000.40, 475, '2024-01-18');`,
    solutionSql: `SELECT region, SUM(sales_amount) as total_sales
FROM nike_sales 
GROUP BY region 
HAVING SUM(sales_amount) > 500000 
ORDER BY total_sales DESC;`,
    explanation: "Regional sales analysis with GROUP BY and HAVING clause for identifying high-performing markets."
  },
  {
    id: uuidv4(),
    title: "Merck Drug Development Pipeline",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Merck's pharmaceutical research division tracks drug development projects across different therapeutic areas to optimize R&D resource allocation and timeline planning.

**Scenario:** You're a research pipeline analyst at Merck analyzing project distribution. The R&D leadership wants to understand which therapeutic areas have the most active research programs.

**Problem:** List all therapeutic areas that have more than 5 active drug development projects.

**Expected Output:** Therapeutic areas with active project counts (>5 projects only), ordered by count descending.`,
    setupSql: `CREATE TABLE merck_pipeline (
        project_id INT PRIMARY KEY,
        drug_candidate VARCHAR(100),
        therapeutic_area VARCHAR(50),
        development_phase VARCHAR(30),
        status VARCHAR(20),
        estimated_completion DATE
    );
    
    INSERT INTO merck_pipeline VALUES 
    (1, 'MK-7845 Oncology', 'Oncology', 'Phase III', 'Active', '2025-06-15'),
    (2, 'MK-2190 Diabetes', 'Endocrinology', 'Phase II', 'Active', '2025-09-20'),
    (3, 'MK-5672 Cardio', 'Cardiovascular', 'Phase I', 'Active', '2026-03-10'),
    (4, 'MK-8834 Immuno', 'Immunology', 'Phase II', 'On Hold', '2025-12-25'),
    (5, 'MK-3451 Neuro', 'Neurology', 'Phase I', 'Active', '2026-08-30'),
    (6, 'MK-9012 Cancer', 'Oncology', 'Phase II', 'Active', '2025-11-15'),
    (7, 'MK-6789 Arthritis', 'Rheumatology', 'Phase III', 'Active', '2024-10-05'),
    (8, 'MK-4567 Migraine', 'Neurology', 'Phase I', 'Active', '2026-07-18');`,
    solutionSql: `SELECT therapeutic_area, COUNT(*) as active_projects
FROM merck_pipeline 
WHERE status = 'Active'
GROUP BY therapeutic_area 
HAVING COUNT(*) > 5 
ORDER BY active_projects DESC;`,
    explanation: "Pharmaceutical pipeline analysis using WHERE clause with GROUP BY and HAVING for active project filtering."
  }
];

// Batch 6: 8 Medium Problems
const mediumProblems = [
  {
    id: uuidv4(),
    title: "Citibank Credit Card Fraud Detection",
    difficulty: "medium",
    category: "Window Functions",
    description: `**Business Context:** Citibank's fraud prevention team develops machine learning models to detect suspicious credit card transactions in real-time while minimizing false positives that disrupt customer experience.

**Scenario:** You're a fraud analytics specialist at Citibank analyzing transaction patterns. The security team needs to identify cards with unusual spending velocity that may indicate fraudulent activity.

**Problem:** For each credit card, calculate the rolling 7-day average transaction amount and identify cards where any single transaction exceeds 3x the rolling average on that day.

**Expected Output:** Suspicious transactions with card details, transaction amount, rolling average, and deviation multiple, ordered by deviation descending.`,
    setupSql: `CREATE TABLE citibank_transactions (
        transaction_id INT PRIMARY KEY,
        card_number VARCHAR(20),
        merchant_category VARCHAR(50),
        transaction_amount DECIMAL(10,2),
        transaction_date DATE,
        merchant_location VARCHAR(100)
    );
    
    INSERT INTO citibank_transactions VALUES 
    (1, '4532-****-****-1234', 'Gas Stations', 45.75, '2024-01-15', 'New York, NY'),
    (2, '4532-****-****-1234', 'Restaurants', 78.50, '2024-01-16', 'New York, NY'),
    (3, '4532-****-****-1234', 'Department Stores', 245.00, '2024-01-17', 'New York, NY'),
    (4, '4532-****-****-1234', 'Electronics', 1899.99, '2024-01-18', 'New York, NY'),
    (5, '4532-****-****-1234', 'Grocery Stores', 125.30, '2024-01-19', 'New York, NY'),
    (6, '4111-****-****-5678', 'Gas Stations', 52.25, '2024-01-15', 'Los Angeles, CA'),
    (7, '4111-****-****-5678', 'Restaurants', 95.75, '2024-01-16', 'Los Angeles, CA'),
    (8, '4111-****-****-5678', 'Hotels', 450.00, '2024-01-17', 'Las Vegas, NV'),
    (9, '4111-****-****-5678', 'Airlines', 850.00, '2024-01-18', 'Las Vegas, NV'),
    (10, '4111-****-****-5678', 'Electronics', 2500.00, '2024-01-19', 'Las Vegas, NV');`,
    solutionSql: `WITH rolling_averages AS (
        SELECT 
            transaction_id,
            card_number,
            merchant_category,
            transaction_amount,
            transaction_date,
            merchant_location,
            AVG(transaction_amount) OVER (
                PARTITION BY card_number 
                ORDER BY transaction_date 
                ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING
            ) as rolling_7day_avg
        FROM citibank_transactions
    )
    SELECT 
        card_number,
        merchant_category,
        transaction_amount,
        ROUND(rolling_7day_avg, 2) as rolling_average,
        ROUND(transaction_amount / NULLIF(rolling_7day_avg, 0), 2) as deviation_multiple,
        transaction_date,
        merchant_location
    FROM rolling_averages
    WHERE transaction_amount > (3 * rolling_7day_avg)
        AND rolling_7day_avg IS NOT NULL
    ORDER BY deviation_multiple DESC;`,
    explanation: "Advanced fraud detection using window functions for rolling averages and transaction anomaly identification based on spending velocity patterns."
  },
  {
    id: uuidv4(),
    title: "Lockheed Martin Defense Contracts",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** Lockheed Martin's defense contracting division manages complex multi-year projects with various government agencies and must track contract performance across different program phases.

**Scenario:** You're a program analyst at Lockheed Martin analyzing contract portfolio performance. The business development team needs to identify which contract types and agencies provide the most stable revenue streams.

**Problem:** Find government agencies that have awarded contracts totaling more than $1 billion with Lockheed Martin, and calculate the average contract duration for each agency.

**Expected Output:** Agency details with total contract value, contract count, and average duration, only agencies >$1B total, ordered by total value descending.`,
    setupSql: `CREATE TABLE lm_government_agencies (
        agency_id INT PRIMARY KEY,
        agency_name VARCHAR(100),
        agency_type VARCHAR(50),
        primary_contact VARCHAR(100)
    );
    
    CREATE TABLE lm_defense_contracts (
        contract_id INT PRIMARY KEY,
        agency_id INT,
        contract_name VARCHAR(150),
        contract_value DECIMAL(15,2),
        contract_type VARCHAR(50),
        start_date DATE,
        end_date DATE,
        status VARCHAR(30)
    );
    
    INSERT INTO lm_government_agencies VALUES 
    (101, 'U.S. Air Force', 'Military', 'Colonel Sarah Johnson'),
    (102, 'U.S. Navy', 'Military', 'Admiral Michael Chen'),
    (103, 'NASA', 'Space Agency', 'Director Emily Rodriguez'),
    (104, 'Department of Defense', 'Defense', 'General David Kim');
    
    INSERT INTO lm_defense_contracts VALUES 
    (1, 101, 'F-35 Lightning II Program', 15000000000.00, 'Aircraft Development', '2020-01-15', '2025-12-31', 'Active'),
    (2, 102, 'Aegis Combat System', 8500000000.00, 'Naval Defense', '2019-06-01', '2024-05-30', 'Active'),
    (3, 103, 'Orion Spacecraft', 12000000000.00, 'Space Exploration', '2018-03-15', '2026-09-15', 'Active'),
    (4, 104, 'THAAD Missile Defense', 7200000000.00, 'Missile Defense', '2019-09-01', '2024-08-31', 'Active'),
    (5, 101, 'C-130J Super Hercules', 6800000000.00, 'Transport Aircraft', '2020-04-01', '2025-03-31', 'Active'),
    (6, 102, 'Littoral Combat Ship', 5500000000.00, 'Naval Vessels', '2018-11-15', '2023-10-15', 'Completed');`,
    solutionSql: `SELECT 
        a.agency_name,
        a.agency_type,
        COUNT(c.contract_id) as total_contracts,
        SUM(c.contract_value) / 1000000000 as total_value_billions,
        AVG(EXTRACT(YEAR FROM AGE(c.end_date, c.start_date))) as avg_duration_years
    FROM lm_government_agencies a
    JOIN lm_defense_contracts c ON a.agency_id = c.agency_id
    GROUP BY a.agency_id, a.agency_name, a.agency_type
    HAVING SUM(c.contract_value) > 1000000000
    ORDER BY SUM(c.contract_value) DESC;`,
    explanation: "Defense contracting analysis using JOINs with complex aggregation and date calculations for government agency relationship management."
  }
];

// Batch 6: 8 Hard Problems
const hardProblems = [
  {
    id: uuidv4(),
    title: "Wells Fargo Mortgage Risk Assessment",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Wells Fargo's mortgage lending division develops sophisticated risk models to assess loan default probability while ensuring fair lending practices and regulatory compliance across different demographic segments.

**Scenario:** You're a senior risk modeling analyst at Wells Fargo building next-generation mortgage risk assessment tools. The credit committee needs to understand how different borrower characteristics interact to predict default risk.

**Problem:** Create a comprehensive risk score using multiple factors: credit score weight (30%), debt-to-income weight (25%), loan-to-value weight (25%), employment history weight (20%). Calculate default probability by risk score deciles and identify deciles with default rates exceeding 8%.

**Expected Output:** Risk score deciles with borrower counts, average risk scores, default rates, and expected loss calculations, showing only high-risk deciles >8% default rate.`,
    setupSql: `CREATE TABLE wf_borrowers (
        borrower_id INT PRIMARY KEY,
        credit_score INT,
        annual_income DECIMAL(12,2),
        employment_years DECIMAL(4,2),
        total_debt DECIMAL(12,2),
        loan_amount DECIMAL(12,2),
        home_value DECIMAL(12,2),
        loan_status VARCHAR(20)
    );
    
    INSERT INTO wf_borrowers VALUES 
    (9001, 750, 95000.00, 8.5, 25000.00, 380000.00, 450000.00, 'Current'),
    (9002, 680, 72000.00, 4.2, 35000.00, 320000.00, 400000.00, 'Default'),
    (9003, 720, 88000.00, 6.8, 28000.00, 350000.00, 425000.00, 'Current'),
    (9004, 620, 55000.00, 2.1, 45000.00, 280000.00, 325000.00, 'Default'),
    (9005, 780, 125000.00, 12.3, 18000.00, 420000.00, 500000.00, 'Current'),
    (9006, 640, 58000.00, 3.5, 42000.00, 295000.00, 340000.00, 'Default'),
    (9007, 710, 82000.00, 7.2, 31000.00, 365000.00, 430000.00, 'Current'),
    (9008, 590, 48000.00, 1.8, 38000.00, 265000.00, 310000.00, 'Default'),
    (9009, 800, 150000.00, 15.6, 22000.00, 480000.00, 580000.00, 'Current'),
    (9010, 660, 68000.00, 5.1, 39000.00, 315000.00, 375000.00, 'Current');`,
    solutionSql: `WITH risk_calculations AS (
        SELECT 
            borrower_id,
            credit_score,
            annual_income,
            employment_years,
            loan_amount,
            home_value,
            total_debt,
            loan_status,
            (total_debt / annual_income) as debt_to_income_ratio,
            (loan_amount / home_value) as loan_to_value_ratio,
            -- Normalize factors to 0-100 scale and apply weights
            (
                (credit_score / 850.0 * 100 * 0.30) +
                ((1 - LEAST(total_debt / annual_income, 1)) * 100 * 0.25) +
                ((1 - LEAST(loan_amount / home_value, 1)) * 100 * 0.25) +
                (LEAST(employment_years / 20.0, 1) * 100 * 0.20)
            ) as composite_risk_score
        FROM wf_borrowers
    ),
    risk_deciles AS (
        SELECT 
            *,
            NTILE(10) OVER (ORDER BY composite_risk_score) as risk_decile
        FROM risk_calculations
    ),
    decile_analysis AS (
        SELECT 
            risk_decile,
            COUNT(*) as borrower_count,
            AVG(composite_risk_score) as avg_risk_score,
            SUM(CASE WHEN loan_status = 'Default' THEN 1 ELSE 0 END) as defaults,
            AVG(loan_amount) as avg_loan_amount,
            CAST(SUM(CASE WHEN loan_status = 'Default' THEN 1 ELSE 0 END) AS DECIMAL) / COUNT(*) as default_rate
        FROM risk_deciles
        GROUP BY risk_decile
    )
    SELECT 
        risk_decile,
        borrower_count,
        ROUND(avg_risk_score, 2) as avg_risk_score,
        defaults,
        ROUND(default_rate * 100, 2) as default_rate_percent,
        ROUND(avg_loan_amount, 0) as avg_loan_amount,
        ROUND(default_rate * avg_loan_amount * 0.5, 0) as expected_loss_per_borrower
    FROM decile_analysis
    WHERE default_rate > 0.08
    ORDER BY risk_decile DESC;`,
    explanation: "Sophisticated mortgage risk modeling using weighted composite scoring, decile analysis, and expected loss calculations for regulatory compliance and risk management."
  },
  {
    id: uuidv4(),
    title: "McKinsey Client Engagement Analysis",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** McKinsey & Company analyzes client engagement patterns and consultant utilization across different practice areas to optimize staffing models and identify high-value client relationships for strategic account management.

**Scenario:** You're a senior analytics manager at McKinsey developing insights for the firm's managing partners. The leadership team needs to understand which engagement types and client combinations drive the highest profitability and consultant development.

**Problem:** Calculate engagement profitability using: Revenue - (Consultant Hours × Hourly Rate × 1.4 overhead multiplier). Identify client-practice combinations with >$2M annual revenue and >25% profit margins. Rank by profit margin and include consultant utilization metrics.

**Expected Output:** High-value client-practice combinations with revenue, costs, profit margins, and utilization rates, showing only profitable engagements meeting criteria, ordered by profit margin descending.`,
    setupSql: `CREATE TABLE mckinsey_clients (
        client_id INT PRIMARY KEY,
        client_name VARCHAR(100),
        industry VARCHAR(50),
        client_tier VARCHAR(20),
        relationship_start DATE
    );
    
    CREATE TABLE mckinsey_practices (
        practice_id INT PRIMARY KEY,
        practice_name VARCHAR(100),
        practice_leader VARCHAR(100),
        standard_hourly_rate DECIMAL(8,2)
    );
    
    CREATE TABLE mckinsey_engagements (
        engagement_id INT PRIMARY KEY,
        client_id INT,
        practice_id INT,
        engagement_name VARCHAR(150),
        total_revenue DECIMAL(12,2),
        consultant_hours INT,
        start_date DATE,
        end_date DATE,
        status VARCHAR(30)
    );
    
    INSERT INTO mckinsey_clients VALUES 
    (701, 'Global Manufacturing Corp', 'Manufacturing', 'Tier 1', '2020-03-15'),
    (702, 'Tech Innovation Inc', 'Technology', 'Tier 1', '2019-08-20'),
    (703, 'Financial Services Group', 'Financial Services', 'Tier 2', '2021-01-10'),
    (704, 'Healthcare Systems Ltd', 'Healthcare', 'Tier 1', '2018-11-05');
    
    INSERT INTO mckinsey_practices VALUES 
    (201, 'Strategy & Corporate Finance', 'Jane Mitchell', 850.00),
    (202, 'Digital & Technology', 'Robert Chen', 950.00),
    (203, 'Operations', 'Sarah Johnson', 750.00),
    (204, 'Risk & Compliance', 'Michael Rodriguez', 800.00);
    
    INSERT INTO mckinsey_engagements VALUES 
    (1, 701, 201, 'Digital Transformation Strategy', 4500000.00, 3200, '2024-01-15', '2024-06-15', 'Active'),
    (2, 702, 202, 'AI Implementation Roadmap', 3200000.00, 2800, '2024-02-01', '2024-07-01', 'Active'),
    (3, 703, 204, 'Regulatory Compliance Program', 2800000.00, 2400, '2024-01-10', '2024-08-10', 'Active'),
    (4, 704, 203, 'Supply Chain Optimization', 3800000.00, 3600, '2023-11-01', '2024-05-01', 'Completed'),
    (5, 701, 202, 'Technology Integration', 2500000.00, 2200, '2024-03-01', '2024-08-01', 'Active'),
    (6, 702, 201, 'Market Entry Strategy', 2200000.00, 1800, '2024-01-20', '2024-06-20', 'Active');`,
    solutionSql: `WITH engagement_economics AS (
        SELECT 
            c.client_name,
            c.industry,
            c.client_tier,
            p.practice_name,
            p.practice_leader,
            e.engagement_name,
            e.total_revenue,
            e.consultant_hours,
            p.standard_hourly_rate,
            -- Calculate total costs with overhead
            (e.consultant_hours * p.standard_hourly_rate * 1.4) as total_costs,
            -- Calculate profit
            (e.total_revenue - (e.consultant_hours * p.standard_hourly_rate * 1.4)) as gross_profit,
            e.start_date,
            e.end_date
        FROM mckinsey_clients c
        JOIN mckinsey_engagements e ON c.client_id = e.client_id
        JOIN mckinsey_practices p ON e.practice_id = p.practice_id
        WHERE e.status IN ('Active', 'Completed')
    ),
    client_practice_summary AS (
        SELECT 
            client_name,
            industry,
            practice_name,
            COUNT(*) as engagement_count,
            SUM(total_revenue) as annual_revenue,
            SUM(total_costs) as annual_costs,
            SUM(gross_profit) as annual_profit,
            AVG(consultant_hours) as avg_engagement_hours,
            SUM(consultant_hours) as total_consultant_hours
        FROM engagement_economics
        WHERE start_date >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY client_name, industry, practice_name
    )
    SELECT 
        client_name,
        industry,
        practice_name,
        engagement_count,
        ROUND(annual_revenue / 1000000, 2) as annual_revenue_millions,
        ROUND(annual_costs / 1000000, 2) as annual_costs_millions,
        ROUND(annual_profit / 1000000, 2) as annual_profit_millions,
        ROUND((annual_profit / annual_revenue) * 100, 2) as profit_margin_percent,
        ROUND(avg_engagement_hours, 0) as avg_hours_per_engagement,
        total_consultant_hours as total_utilization_hours
    FROM client_practice_summary
    WHERE annual_revenue > 2000000
        AND (annual_profit / annual_revenue) > 0.25
    ORDER BY profit_margin_percent DESC;`,
    explanation: "Management consulting profitability analysis using complex cost modeling, overhead calculations, and client-practice performance optimization for strategic relationship management."
  }
];

async function importBatch6() {
  console.log('🚀 Starting Batch 6: Adding 20 more problems (4 Easy, 8 Medium, 8 Hard)...');
  
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
      
      if (problem.difficulty === 'easy') easyCount++;
      else if (problem.difficulty === 'medium') mediumCount++;
      else if (problem.difficulty === 'hard') hardCount++;
      
    } catch (error) {
      console.error(`❌ Error adding ${problem.title}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Batch 6 complete! Added ${successCount}/${allProblems.length} problems.`);
  console.log(`   Easy: ${easyCount}, Medium: ${mediumCount}, Hard: ${hardCount}`);
  
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
  
  console.log('\n📊 UPDATED TOTAL DISTRIBUTION:');
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
  
  if (grandTotal >= 90) {
    console.log('🎯 Almost there! Final stretch to 100 problems!');
  } else if (grandTotal >= 70) {
    console.log('🚀 Great progress! Over 70% complete!');
  }
  
  await pool.end();
}

importBatch6().catch(console.error);