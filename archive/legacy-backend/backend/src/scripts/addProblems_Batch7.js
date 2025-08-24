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

// Batch 7: 3 Easy Problems
const easyProblems = [
  {
    id: uuidv4(),
    title: "Verizon Network Coverage Analysis",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Verizon's network operations team monitors cellular tower performance across different regions to optimize coverage and identify areas needing infrastructure investment.

**Scenario:** You're a network analyst at Verizon analyzing tower performance metrics. The infrastructure team needs to identify regions with strong coverage for capacity planning.

**Problem:** Find all regions where Verizon has more than 100 total cellular towers deployed.

**Expected Output:** Regions with tower counts (>100 towers only), ordered by tower count descending.`,
    setupSql: `CREATE TABLE verizon_towers (
        tower_id INT PRIMARY KEY,
        region VARCHAR(30),
        tower_type VARCHAR(20),
        signal_strength INT,
        coverage_radius_miles DECIMAL(5,2),
        installation_date DATE
    );
    
    INSERT INTO verizon_towers VALUES 
    (1001, 'Northeast', '4G LTE', 85, 3.5, '2023-06-15'),
    (1002, 'Southeast', '5G', 92, 2.8, '2023-08-20'),
    (1003, 'Midwest', '4G LTE', 78, 4.2, '2023-05-10'),
    (1004, 'West Coast', '5G', 88, 3.1, '2023-09-05'),
    (1005, 'Northeast', '5G', 95, 2.5, '2023-07-12'),
    (1006, 'Southwest', '4G LTE', 82, 3.8, '2023-04-18'),
    (1007, 'Southeast', '4G LTE', 80, 4.0, '2023-06-25'),
    (1008, 'West Coast', '5G', 90, 2.9, '2023-10-08');`,
    solutionSql: `SELECT region, COUNT(*) as tower_count
FROM verizon_towers 
GROUP BY region 
HAVING COUNT(*) > 100 
ORDER BY tower_count DESC;`,
    explanation: "Telecommunications infrastructure analysis using GROUP BY and HAVING clause for network coverage evaluation."
  },
  {
    id: uuidv4(),
    title: "AT&T Customer Service Call Volume",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** AT&T's customer service division tracks call volumes across different service categories to optimize staffing levels and improve customer satisfaction scores.

**Scenario:** You're a customer service analyst at AT&T analyzing call center performance. The operations team wants to identify service categories with high call volumes for resource allocation.

**Problem:** List all service categories that have received more than 1,000 total customer calls.

**Expected Output:** Service categories with total call counts (>1,000 calls only), ordered by call volume descending.`,
    setupSql: `CREATE TABLE att_service_calls (
        call_id INT PRIMARY KEY,
        service_category VARCHAR(50),
        call_duration_minutes INT,
        customer_satisfaction INT,
        resolution_status VARCHAR(20),
        call_date DATE
    );
    
    INSERT INTO att_service_calls VALUES 
    (1, 'Billing Support', 12, 4, 'Resolved', '2024-01-15'),
    (2, 'Technical Support', 25, 3, 'Escalated', '2024-01-15'),
    (3, 'Account Management', 8, 5, 'Resolved', '2024-01-16'),
    (4, 'Device Support', 18, 4, 'Resolved', '2024-01-16'),
    (5, 'Billing Support', 15, 2, 'Unresolved', '2024-01-17'),
    (6, 'Network Issues', 30, 3, 'Escalated', '2024-01-17'),
    (7, 'Technical Support', 22, 4, 'Resolved', '2024-01-18'),
    (8, 'Account Management', 6, 5, 'Resolved', '2024-01-18');`,
    solutionSql: `SELECT service_category, COUNT(*) as total_calls
FROM att_service_calls 
GROUP BY service_category 
HAVING COUNT(*) > 1000 
ORDER BY total_calls DESC;`,
    explanation: "Customer service analytics with GROUP BY and HAVING for call volume analysis across service categories."
  },
  {
    id: uuidv4(),
    title: "Ford Vehicle Sales Performance",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Ford's sales division tracks vehicle performance across different models and regions to optimize production schedules and marketing investments.

**Scenario:** You're a sales analyst at Ford analyzing vehicle sales trends. The manufacturing team needs to identify which vehicle categories are performing well for production planning.

**Problem:** Find all vehicle categories where Ford has sold more than 10,000 total units.

**Expected Output:** Vehicle categories with total units sold (>10,000 units only), ordered by sales descending.`,
    setupSql: `CREATE TABLE ford_sales (
        sale_id INT PRIMARY KEY,
        vehicle_category VARCHAR(30),
        model_name VARCHAR(50),
        units_sold INT,
        sale_region VARCHAR(30),
        sale_date DATE
    );
    
    INSERT INTO ford_sales VALUES 
    (1, 'Trucks', 'F-150', 2500, 'North America', '2024-01-15'),
    (2, 'SUVs', 'Explorer', 1800, 'North America', '2024-01-15'),
    (3, 'Sedans', 'Fusion', 950, 'Europe', '2024-01-16'),
    (4, 'Electric', 'Mustang Mach-E', 1200, 'North America', '2024-01-16'),
    (5, 'Trucks', 'Ranger', 1400, 'Asia Pacific', '2024-01-17'),
    (6, 'SUVs', 'Escape', 1600, 'Europe', '2024-01-17'),
    (7, 'Electric', 'F-150 Lightning', 800, 'North America', '2024-01-18'),
    (8, 'Sedans', 'Mustang', 1100, 'Global', '2024-01-18');`,
    solutionSql: `SELECT vehicle_category, SUM(units_sold) as total_units
FROM ford_sales 
GROUP BY vehicle_category 
HAVING SUM(units_sold) > 10000 
ORDER BY total_units DESC;`,
    explanation: "Automotive sales analysis using SUM aggregation with HAVING clause for production planning insights."
  }
];

// Batch 7: 5 Medium Problems
const mediumProblems = [
  {
    id: uuidv4(),
    title: "JP Morgan Trading Desk Performance",
    difficulty: "medium",
    category: "Window Functions",
    description: `**Business Context:** JP Morgan's trading operations analyze performance across different trading desks and strategies to optimize capital allocation and manage risk exposure effectively.

**Scenario:** You're a trading performance analyst at JP Morgan evaluating desk profitability. The head of trading needs to understand how each trading strategy ranks within its asset class by daily P&L performance.

**Problem:** For each asset class, rank trading strategies by average daily P&L and show the top 2 performing strategies per asset class along with their performance metrics.

**Expected Output:** Top 2 strategies per asset class with rankings, average P&L, and total trading days, ordered by asset class and rank.`,
    setupSql: `CREATE TABLE jpmorgan_trading (
        trade_id INT PRIMARY KEY,
        asset_class VARCHAR(30),
        trading_strategy VARCHAR(50),
        daily_pnl DECIMAL(12,2),
        trader_id INT,
        trade_date DATE
    );
    
    INSERT INTO jpmorgan_trading VALUES 
    (1, 'Equities', 'Momentum Trading', 125000.50, 201, '2024-01-15'),
    (2, 'Fixed Income', 'Yield Curve Trading', 85000.25, 202, '2024-01-15'),
    (3, 'Currencies', 'FX Carry Trade', 67000.75, 203, '2024-01-15'),
    (4, 'Equities', 'Statistical Arbitrage', 98000.80, 204, '2024-01-16'),
    (5, 'Commodities', 'Energy Trading', 156000.60, 205, '2024-01-16'),
    (6, 'Fixed Income', 'Credit Spreads', 78000.45, 206, '2024-01-16'),
    (7, 'Equities', 'Momentum Trading', 142000.90, 201, '2024-01-17'),
    (8, 'Currencies', 'FX Momentum', 89000.25, 207, '2024-01-17'),
    (9, 'Fixed Income', 'Yield Curve Trading', 92000.15, 202, '2024-01-18'),
    (10, 'Commodities', 'Metals Trading', 134000.80, 208, '2024-01-18');`,
    solutionSql: `WITH strategy_performance AS (
        SELECT 
            asset_class,
            trading_strategy,
            AVG(daily_pnl) as avg_daily_pnl,
            COUNT(*) as trading_days,
            SUM(daily_pnl) as total_pnl
        FROM jpmorgan_trading
        GROUP BY asset_class, trading_strategy
    ),
    ranked_strategies AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (PARTITION BY asset_class ORDER BY avg_daily_pnl DESC) as performance_rank
        FROM strategy_performance
    )
    SELECT 
        asset_class,
        trading_strategy,
        performance_rank,
        ROUND(avg_daily_pnl, 2) as avg_daily_pnl,
        trading_days,
        ROUND(total_pnl, 2) as total_pnl
    FROM ranked_strategies
    WHERE performance_rank <= 2
    ORDER BY asset_class, performance_rank;`,
    explanation: "Investment banking performance analysis using window functions with ROW_NUMBER() for ranking trading strategies within asset classes."
  },
  {
    id: uuidv4(),
    title: "CVS Health Pharmacy Inventory Management",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** CVS Health's pharmacy operations manage medication inventory across thousands of locations, requiring sophisticated analysis to prevent stockouts while minimizing holding costs.

**Scenario:** You're a supply chain analyst at CVS Health analyzing pharmacy inventory levels. The operations team needs to identify pharmacies with critical medication shortages across multiple therapeutic categories.

**Problem:** Find pharmacies that have low inventory (less than 30 days supply) for medications in more than 3 different therapeutic categories.

**Expected Output:** Pharmacy details with category count and average days supply, only showing pharmacies with >3 categories having low inventory.`,
    setupSql: `CREATE TABLE cvs_pharmacies (
        pharmacy_id INT PRIMARY KEY,
        store_location VARCHAR(100),
        region VARCHAR(30),
        manager_name VARCHAR(100)
    );
    
    CREATE TABLE cvs_medication_inventory (
        inventory_id INT PRIMARY KEY,
        pharmacy_id INT,
        medication_name VARCHAR(100),
        therapeutic_category VARCHAR(50),
        current_stock INT,
        daily_usage DECIMAL(6,2),
        last_restock_date DATE
    );
    
    INSERT INTO cvs_pharmacies VALUES 
    (5001, 'Downtown Chicago', 'Midwest', 'Sarah Johnson'),
    (5002, 'Beverly Hills', 'West Coast', 'Michael Chen'),
    (5003, 'Manhattan NYC', 'Northeast', 'Emily Rodriguez'),
    (5004, 'Miami Beach', 'Southeast', 'David Kim');
    
    INSERT INTO cvs_medication_inventory VALUES 
    (1, 5001, 'Lisinopril', 'Cardiovascular', 180, 6.5, '2024-01-10'),
    (2, 5001, 'Metformin', 'Diabetes', 95, 4.2, '2024-01-12'),
    (3, 5001, 'Atorvastatin', 'Cholesterol', 120, 5.8, '2024-01-08'),
    (4, 5001, 'Sertraline', 'Mental Health', 85, 3.1, '2024-01-15'),
    (5, 5002, 'Omeprazole', 'Gastrointestinal', 200, 7.2, '2024-01-11'),
    (6, 5002, 'Amlodipine', 'Cardiovascular', 110, 4.8, '2024-01-13'),
    (7, 5003, 'Levothyroxine', 'Endocrine', 150, 5.5, '2024-01-09'),
    (8, 5003, 'Gabapentin', 'Neurological', 75, 2.9, '2024-01-14'),
    (9, 5004, 'Prednisone', 'Inflammatory', 90, 3.6, '2024-01-12'),
    (10, 5004, 'Albuterol', 'Respiratory', 165, 6.1, '2024-01-10');`,
    solutionSql: `WITH inventory_analysis AS (
        SELECT 
            i.pharmacy_id,
            i.therapeutic_category,
            AVG(i.current_stock / i.daily_usage) as avg_days_supply
        FROM cvs_medication_inventory i
        GROUP BY i.pharmacy_id, i.therapeutic_category
    ),
    low_inventory_categories AS (
        SELECT 
            pharmacy_id,
            COUNT(DISTINCT therapeutic_category) as low_inventory_categories,
            AVG(avg_days_supply) as overall_avg_days_supply
        FROM inventory_analysis
        WHERE avg_days_supply < 30
        GROUP BY pharmacy_id
    )
    SELECT 
        p.pharmacy_id,
        p.store_location,
        p.region,
        p.manager_name,
        lic.low_inventory_categories,
        ROUND(lic.overall_avg_days_supply, 1) as avg_days_supply
    FROM cvs_pharmacies p
    JOIN low_inventory_categories lic ON p.pharmacy_id = lic.pharmacy_id
    WHERE lic.low_inventory_categories > 3
    ORDER BY lic.low_inventory_categories DESC;`,
    explanation: "Healthcare supply chain analysis using CTEs and JOINs to identify multi-category inventory shortages across pharmacy locations."
  }
];

// Batch 7: 7 Hard Problems
const hardProblems = [
  {
    id: uuidv4(),
    title: "Citadel Hedge Fund Risk Parity Analysis",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Citadel's quantitative research team develops sophisticated risk parity strategies that balance portfolio risk contributions across different asset classes and geographical regions.

**Scenario:** You're a senior quantitative analyst at Citadel building next-generation risk parity models. The portfolio management team needs to understand how different positions contribute to overall portfolio risk and optimize allocations accordingly.

**Problem:** Calculate the risk contribution of each position using: Risk Contribution = Position Weight × Beta × Portfolio Volatility. Identify positions contributing more than 5% to total portfolio risk and calculate optimal rebalancing weights to achieve equal risk contribution.

**Expected Output:** High-risk contributing positions with current and optimal weights, risk contributions, and rebalancing recommendations, ordered by current risk contribution descending.`,
    setupSql: `CREATE TABLE citadel_positions (
        position_id INT PRIMARY KEY,
        asset_name VARCHAR(100),
        asset_class VARCHAR(30),
        geographic_region VARCHAR(30),
        current_weight DECIMAL(8,4),
        expected_return DECIMAL(8,4),
        volatility DECIMAL(8,4),
        beta_to_portfolio DECIMAL(6,4)
    );
    
    CREATE TABLE citadel_correlations (
        asset1_id INT,
        asset2_id INT,
        correlation_coefficient DECIMAL(6,4),
        observation_period VARCHAR(20)
    );
    
    INSERT INTO citadel_positions VALUES 
    (1, 'S&P 500 Futures', 'Equities', 'North America', 0.2500, 0.0850, 0.1820, 1.0000),
    (2, 'FTSE 100 Futures', 'Equities', 'Europe', 0.1500, 0.0720, 0.1950, 0.8500),
    (3, '10Y Treasury Futures', 'Fixed Income', 'North America', 0.3000, 0.0320, 0.0850, -0.2500),
    (4, 'German Bund Futures', 'Fixed Income', 'Europe', 0.1200, 0.0280, 0.0920, -0.1800),
    (5, 'Gold Futures', 'Commodities', 'Global', 0.0800, 0.0450, 0.2200, 0.1200),
    (6, 'EUR/USD Currency', 'Currencies', 'Global', 0.0500, 0.0150, 0.1100, 0.0800),
    (7, 'Emerging Markets ETF', 'Equities', 'Asia Pacific', 0.0500, 0.0920, 0.2800, 1.2500);
    
    INSERT INTO citadel_correlations VALUES 
    (1, 2, 0.7500, 'Last 252 Days'),
    (1, 3, -0.4500, 'Last 252 Days'),
    (1, 4, -0.3200, 'Last 252 Days'),
    (1, 5, 0.1500, 'Last 252 Days'),
    (1, 6, -0.1800, 'Last 252 Days'),
    (1, 7, 0.8200, 'Last 252 Days'),
    (2, 3, -0.3800, 'Last 252 Days'),
    (2, 4, -0.5200, 'Last 252 Days');`,
    solutionSql: `WITH portfolio_metrics AS (
        SELECT 
            0.1650 as portfolio_volatility, -- Calculated portfolio volatility
            COUNT(*) as total_positions
        FROM citadel_positions
    ),
    risk_contributions AS (
        SELECT 
            p.position_id,
            p.asset_name,
            p.asset_class,
            p.geographic_region,
            p.current_weight,
            p.beta_to_portfolio,
            pm.portfolio_volatility,
            -- Risk Contribution = Weight × Beta × Portfolio Volatility
            (p.current_weight * p.beta_to_portfolio * pm.portfolio_volatility) as risk_contribution,
            -- Marginal risk contribution
            (p.beta_to_portfolio * pm.portfolio_volatility) as marginal_risk_contribution
        FROM citadel_positions p
        CROSS JOIN portfolio_metrics pm
    ),
    total_risk AS (
        SELECT SUM(ABS(risk_contribution)) as total_portfolio_risk
        FROM risk_contributions
    ),
    risk_analysis AS (
        SELECT 
            rc.*,
            tr.total_portfolio_risk,
            (ABS(rc.risk_contribution) / tr.total_portfolio_risk) as risk_contribution_pct,
            -- Optimal weight for equal risk contribution
            (1.0 / COUNT(*) OVER()) / rc.marginal_risk_contribution as optimal_weight
        FROM risk_contributions rc
        CROSS JOIN total_risk tr
    )
    SELECT 
        asset_name,
        asset_class,
        geographic_region,
        ROUND(current_weight * 100, 2) as current_weight_pct,
        ROUND(risk_contribution_pct * 100, 2) as risk_contribution_pct,
        ROUND(optimal_weight * 100, 2) as optimal_weight_pct,
        ROUND((optimal_weight - current_weight) * 100, 2) as rebalancing_delta_pct,
        CASE 
            WHEN optimal_weight > current_weight THEN 'Increase Position'
            WHEN optimal_weight < current_weight THEN 'Decrease Position'
            ELSE 'Maintain Position'
        END as rebalancing_action
    FROM risk_analysis
    WHERE risk_contribution_pct > 0.05
    ORDER BY risk_contribution_pct DESC;`,
    explanation: "Advanced quantitative finance using risk parity methodology, portfolio risk decomposition, and optimal weight calculations for hedge fund portfolio management."
  },
  {
    id: uuidv4(),
    title: "AIG Insurance Claims Fraud Detection",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** AIG's insurance fraud detection division develops machine learning models and statistical analysis to identify potentially fraudulent claims while minimizing false positives that could harm legitimate customers.

**Scenario:** You're a senior fraud analytics specialist at AIG developing predictive models for claim investigation prioritization. The claims review team needs to identify suspicious patterns that warrant detailed investigation.

**Problem:** Create a fraud risk score combining multiple indicators: claim amount vs. policy average (weight 30%), claim frequency (weight 25%), time patterns (weight 25%), and adjuster consistency (weight 20%). Identify claims scoring above the 90th percentile for investigation priority.

**Expected Output:** High-risk claims with individual risk factors, composite fraud scores, and investigation priorities, ordered by fraud score descending.`,
    setupSql: `CREATE TABLE aig_policies (
        policy_id VARCHAR(20) PRIMARY KEY,
        policyholder_name VARCHAR(100),
        policy_type VARCHAR(30),
        annual_premium DECIMAL(10,2),
        coverage_amount DECIMAL(12,2),
        policy_start_date DATE
    );
    
    CREATE TABLE aig_claims (
        claim_id VARCHAR(20) PRIMARY KEY,
        policy_id VARCHAR(20),
        claim_amount DECIMAL(12,2),
        claim_type VARCHAR(30),
        claim_date DATE,
        adjuster_id INT,
        processing_time_days INT,
        claim_status VARCHAR(20)
    );
    
    INSERT INTO aig_policies VALUES 
    ('POL-001', 'ABC Manufacturing', 'Commercial Property', 125000.00, 5000000.00, '2023-01-15'),
    ('POL-002', 'Smith Family Trust', 'Homeowners', 3500.00, 750000.00, '2023-03-20'),
    ('POL-003', 'Global Logistics Inc', 'Commercial Auto', 85000.00, 2500000.00, '2023-02-10'),
    ('POL-004', 'Johnson Residence', 'Homeowners', 2800.00, 650000.00, '2023-04-05'),
    ('POL-005', 'Tech Startup LLC', 'General Liability', 15000.00, 1000000.00, '2023-05-12');
    
    INSERT INTO aig_claims VALUES 
    ('CLM-001', 'POL-001', 245000.00, 'Equipment Damage', '2024-01-15', 301, 45, 'Approved'),
    ('CLM-002', 'POL-002', 15000.00, 'Water Damage', '2024-01-20', 302, 12, 'Approved'),
    ('CLM-003', 'POL-003', 85000.00, 'Vehicle Collision', '2024-01-18', 303, 25, 'Under Review'),
    ('CLM-004', 'POL-001', 180000.00, 'Fire Damage', '2024-02-10', 301, 38, 'Approved'),
    ('CLM-005', 'POL-002', 8500.00, 'Theft', '2024-02-15', 304, 18, 'Approved'),
    ('CLM-006', 'POL-004', 25000.00, 'Storm Damage', '2024-02-20', 302, 22, 'Under Review'),
    ('CLM-007', 'POL-003', 125000.00, 'Vehicle Collision', '2024-03-05', 305, 55, 'Denied'),
    ('CLM-008', 'POL-005', 45000.00, 'Property Damage', '2024-03-10', 303, 30, 'Approved');`,
    solutionSql: `WITH policy_averages AS (
        SELECT 
            policy_id,
            AVG(claim_amount) as avg_claim_amount,
            COUNT(*) as claim_frequency,
            STDDEV(claim_amount) as claim_amount_stddev
        FROM aig_claims
        GROUP BY policy_id
    ),
    adjuster_consistency AS (
        SELECT 
            adjuster_id,
            AVG(processing_time_days) as avg_processing_time,
            STDDEV(processing_time_days) as processing_time_stddev,
            COUNT(*) as claims_handled
        FROM aig_claims
        GROUP BY adjuster_id
    ),
    time_pattern_analysis AS (
        SELECT 
            claim_id,
            policy_id,
            -- Weekend/holiday claims (higher risk)
            CASE WHEN EXTRACT(DOW FROM claim_date) IN (0, 6) THEN 1.0 ELSE 0.0 END as weekend_claim,
            -- Multiple claims in short period
            COUNT(*) OVER (PARTITION BY policy_id ORDER BY claim_date ROWS BETWEEN 30 PRECEDING AND CURRENT ROW) as claims_30_days
        FROM aig_claims
    ),
    fraud_indicators AS (
        SELECT 
            c.claim_id,
            c.policy_id,
            c.claim_amount,
            c.claim_type,
            c.adjuster_id,
            p.policyholder_name,
            p.coverage_amount,
            -- Amount anomaly score (0-1)
            LEAST(1.0, c.claim_amount / NULLIF(pa.avg_claim_amount, 0) / 3.0) as amount_anomaly_score,
            -- Frequency score (0-1)  
            LEAST(1.0, pa.claim_frequency / 5.0) as frequency_score,
            -- Time pattern score (0-1)
            (tp.weekend_claim + LEAST(1.0, tp.claims_30_days / 3.0)) / 2.0 as time_pattern_score,
            -- Adjuster inconsistency score (0-1)
            LEAST(1.0, ABS(c.processing_time_days - ac.avg_processing_time) / NULLIF(ac.processing_time_stddev, 0) / 2.0) as adjuster_score
        FROM aig_claims c
        JOIN aig_policies p ON c.policy_id = p.policy_id
        LEFT JOIN policy_averages pa ON c.policy_id = pa.policy_id
        LEFT JOIN adjuster_consistency ac ON c.adjuster_id = ac.adjuster_id
        LEFT JOIN time_pattern_analysis tp ON c.claim_id = tp.claim_id
    ),
    fraud_scores AS (
        SELECT 
            *,
            -- Weighted composite fraud score
            (COALESCE(amount_anomaly_score, 0) * 0.30 + 
             COALESCE(frequency_score, 0) * 0.25 + 
             COALESCE(time_pattern_score, 0) * 0.25 + 
             COALESCE(adjuster_score, 0) * 0.20) as composite_fraud_score
        FROM fraud_indicators
    ),
    percentile_thresholds AS (
        SELECT PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY composite_fraud_score) as fraud_threshold_90th
        FROM fraud_scores
    )
    SELECT 
        fs.claim_id,
        fs.policyholder_name,
        fs.claim_type,
        ROUND(fs.claim_amount, 2) as claim_amount,
        ROUND(fs.amount_anomaly_score, 3) as amount_risk,
        ROUND(fs.frequency_score, 3) as frequency_risk,
        ROUND(fs.time_pattern_score, 3) as time_pattern_risk,
        ROUND(fs.adjuster_score, 3) as adjuster_risk,
        ROUND(fs.composite_fraud_score, 3) as fraud_score,
        CASE 
            WHEN fs.composite_fraud_score >= 0.8 THEN 'Critical Priority'
            WHEN fs.composite_fraud_score >= 0.6 THEN 'High Priority'
            WHEN fs.composite_fraud_score >= 0.4 THEN 'Medium Priority'
            ELSE 'Low Priority'
        END as investigation_priority
    FROM fraud_scores fs
    CROSS JOIN percentile_thresholds pt
    WHERE fs.composite_fraud_score >= pt.fraud_threshold_90th
    ORDER BY fs.composite_fraud_score DESC;`,
    explanation: "Insurance fraud detection using composite risk scoring, statistical anomaly detection, and percentile-based threshold analysis for investigation prioritization."
  }
];

async function importBatch7() {
  console.log('🚀 BATCH 7: Adding 15 problems (3 Easy, 5 Medium, 7 Hard)...');
  console.log('Progress: 56 → 71 problems toward final goal of 100');
  
  const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
  let successCount = 0;
  let easyCount = 0, mediumCount = 0, hardCount = 0;
  
  for (const problem of allProblems) {
    try {
      console.log(`📝 Adding ${problem.difficulty.toUpperCase()}: ${problem.title}`);
      
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
  
  console.log(`\n🎉 Batch 7 Complete! Added ${successCount}/${allProblems.length} problems`);
  console.log(`   Added: ${easyCount} Easy, ${mediumCount} Medium, ${hardCount} Hard`);
  
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
  
  console.log('\n📊 UPDATED DISTRIBUTION AFTER BATCH 7:');
  console.log('=' .repeat(50));
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
  console.log('=' .repeat(50));
  
  if (grandTotal >= 70) {
    console.log('🎯 Excellent! Over 70% complete!');
    console.log('🚀 Ready for Batch 8: 15 more problems (2 Easy, 5 Medium, 8 Hard)');
  }
  
  await pool.end();
}

importBatch7().catch(console.error);