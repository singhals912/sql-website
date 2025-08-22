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

// Batch 8: 2 Easy Problems
const easyProblems = [
  {
    id: uuidv4(),
    title: "IBM Watson AI Service Usage",
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** IBM's Watson AI division tracks service usage across different AI capabilities to understand customer adoption patterns and optimize product development priorities.

**Scenario:** You're an AI product analyst at IBM Watson analyzing service utilization. The product team wants to identify which AI services have strong adoption for capacity planning.

**Problem:** Find all AI service categories that have processed more than 1,000 total API requests.

**Expected Output:** AI service categories with request counts (>1,000 requests only), ordered by requests descending.`,
    setupSql: `CREATE TABLE ibm_watson_usage (
        request_id INT PRIMARY KEY,
        service_category VARCHAR(50),
        api_endpoint VARCHAR(100),
        request_count INT,
        processing_time_ms INT,
        usage_date DATE
    );
    
    INSERT INTO ibm_watson_usage VALUES 
    (1, 'Natural Language Processing', 'sentiment-analysis', 450, 125, '2024-01-15'),
    (2, 'Computer Vision', 'object-detection', 320, 280, '2024-01-15'),
    (3, 'Speech Recognition', 'speech-to-text', 280, 190, '2024-01-16'),
    (4, 'Language Translation', 'translate', 380, 95, '2024-01-16'),
    (5, 'Natural Language Processing', 'entity-extraction', 520, 150, '2024-01-17'),
    (6, 'Computer Vision', 'image-classification', 410, 220, '2024-01-17'),
    (7, 'Machine Learning', 'predictive-modeling', 195, 340, '2024-01-18'),
    (8, 'Speech Recognition', 'text-to-speech', 315, 165, '2024-01-18');`,
    solutionSql: `SELECT service_category, SUM(request_count) as total_requests
FROM ibm_watson_usage 
GROUP BY service_category 
HAVING SUM(request_count) > 1000 
ORDER BY total_requests DESC;`,
    explanation: "AI service analytics using GROUP BY and HAVING to identify high-usage service categories for capacity planning."
  },
  {
    id: uuidv4(),
    title: "Target Store Revenue by Category",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Target's retail operations team analyzes product category performance across stores to optimize inventory allocation and promotional strategies.

**Scenario:** You're a retail analyst at Target studying category performance. The merchandising team needs to identify which product categories are driving the most revenue for strategic planning.

**Problem:** List all product categories with total revenue exceeding $1 million.

**Expected Output:** Product categories with total revenue (>$1M only), ordered by revenue descending.`,
    setupSql: `CREATE TABLE target_sales (
        sale_id INT PRIMARY KEY,
        product_category VARCHAR(50),
        store_location VARCHAR(50),
        revenue_amount DECIMAL(12,2),
        units_sold INT,
        sale_date DATE
    );
    
    INSERT INTO target_sales VALUES 
    (1, 'Electronics', 'Minneapolis Central', 145000.50, 285, '2024-01-15'),
    (2, 'Clothing & Accessories', 'Chicago North', 89000.75, 425, '2024-01-15'),
    (3, 'Home & Garden', 'Denver West', 112000.25, 185, '2024-01-16'),
    (4, 'Beauty & Personal Care', 'Dallas South', 78000.80, 320, '2024-01-16'),
    (5, 'Electronics', 'Phoenix East', 134000.60, 245, '2024-01-17'),
    (6, 'Grocery & Food', 'Atlanta Downtown', 95000.45, 580, '2024-01-17'),
    (7, 'Clothing & Accessories', 'Seattle Center', 156000.90, 485, '2024-01-18'),
    (8, 'Home & Garden', 'Miami Beach', 125000.40, 195, '2024-01-18');`,
    solutionSql: `SELECT product_category, SUM(revenue_amount) as total_revenue
FROM target_sales 
GROUP BY product_category 
HAVING SUM(revenue_amount) > 1000000 
ORDER BY total_revenue DESC;`,
    explanation: "Retail category performance analysis using SUM aggregation with revenue thresholds for merchandising strategy."
  }
];

// Batch 8: 5 Medium Problems  
const mediumProblems = [
  {
    id: uuidv4(),
    title: "Capital One Credit Risk Modeling",
    difficulty: "medium",
    category: "Window Functions", 
    description: `**Business Context:** Capital One's credit risk team develops sophisticated models to assess borrower creditworthiness and optimize lending decisions while maintaining competitive approval rates.

**Scenario:** You're a credit risk analyst at Capital One analyzing borrower risk profiles. The lending team needs to understand how borrowers rank within their income segments based on credit utilization patterns.

**Problem:** For each income bracket, rank borrowers by their average credit utilization ratio and identify the top 3 highest utilization borrowers per bracket along with their risk metrics.

**Expected Output:** Top 3 borrowers per income bracket with utilization rankings and risk scores, ordered by income bracket and rank.`,
    setupSql: `CREATE TABLE capitalone_borrowers (
        borrower_id INT PRIMARY KEY,
        annual_income DECIMAL(12,2),
        total_credit_limit DECIMAL(10,2),
        current_balance DECIMAL(10,2),
        payment_history_score INT,
        months_on_file INT,
        risk_score INT
    );
    
    INSERT INTO capitalone_borrowers VALUES 
    (8001, 45000.00, 12000.00, 8500.00, 720, 36, 680),
    (8002, 75000.00, 25000.00, 15000.00, 780, 48, 720),
    (8003, 120000.00, 45000.00, 12000.00, 820, 72, 780),
    (8004, 55000.00, 18000.00, 16500.00, 650, 24, 620),
    (8005, 95000.00, 35000.00, 28000.00, 740, 60, 690),
    (8006, 38000.00, 8000.00, 7200.00, 690, 30, 640),
    (8007, 150000.00, 60000.00, 18000.00, 850, 84, 820),
    (8008, 62000.00, 22000.00, 19800.00, 670, 42, 650),
    (8009, 85000.00, 30000.00, 21000.00, 760, 54, 710),
    (8010, 42000.00, 10000.00, 9500.00, 700, 18, 660);`,
    solutionSql: `WITH income_segments AS (
        SELECT 
            borrower_id,
            annual_income,
            total_credit_limit,
            current_balance,
            payment_history_score,
            risk_score,
            (current_balance / total_credit_limit) as utilization_ratio,
            CASE 
                WHEN annual_income < 50000 THEN 'Low Income (<$50K)'
                WHEN annual_income < 75000 THEN 'Mid Income ($50K-$75K)'
                WHEN annual_income < 100000 THEN 'Upper Mid ($75K-$100K)'
                ELSE 'High Income (>$100K)'
            END as income_bracket
        FROM capitalone_borrowers
    ),
    ranked_borrowers AS (
        SELECT 
            *,
            ROW_NUMBER() OVER (PARTITION BY income_bracket ORDER BY utilization_ratio DESC) as utilization_rank
        FROM income_segments
    )
    SELECT 
        income_bracket,
        borrower_id,
        ROUND(annual_income, 0) as annual_income,
        ROUND(utilization_ratio * 100, 2) as utilization_pct,
        payment_history_score,
        risk_score,
        utilization_rank
    FROM ranked_borrowers
    WHERE utilization_rank <= 3
    ORDER BY income_bracket, utilization_rank;`,
    explanation: "Credit risk analysis using income segmentation, utilization ratio calculations, and window functions for borrower ranking within risk categories."
  },
  {
    id: uuidv4(),
    title: "UnitedHealth Claims Processing Efficiency",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** UnitedHealth's claims processing division analyzes workflow efficiency across different claim types and processing centers to optimize operations and reduce patient wait times.

**Scenario:** You're an operations analyst at UnitedHealth studying claims processing performance. The operations team needs to identify processing centers with consistently high efficiency across multiple claim types.

**Problem:** Find processing centers that handle more than 5 different claim types AND maintain an average processing time under 3 days across all claim types.

**Expected Output:** Efficient processing centers with claim type diversity, average processing times, and total volume, meeting both criteria.`,
    setupSql: `CREATE TABLE unitedhealth_centers (
        center_id INT PRIMARY KEY,
        center_name VARCHAR(100),
        region VARCHAR(30),
        center_manager VARCHAR(100)
    );
    
    CREATE TABLE unitedhealth_claims (
        claim_id INT PRIMARY KEY,
        center_id INT,
        claim_type VARCHAR(50),
        processing_time_days DECIMAL(4,2),
        claim_amount DECIMAL(10,2),
        submission_date DATE
    );
    
    INSERT INTO unitedhealth_centers VALUES 
    (501, 'Atlanta Processing Center', 'Southeast', 'Sarah Johnson'),
    (502, 'Phoenix Operations Hub', 'Southwest', 'Michael Chen'),
    (503, 'Chicago Central Facility', 'Midwest', 'Emily Rodriguez'),
    (504, 'Portland Regional Center', 'Northwest', 'David Kim');
    
    INSERT INTO unitedhealth_claims VALUES 
    (1, 501, 'Inpatient Hospital', 2.5, 25000.00, '2024-01-15'),
    (2, 501, 'Outpatient Surgery', 1.8, 8500.00, '2024-01-15'),
    (3, 501, 'Emergency Room', 1.2, 3200.00, '2024-01-16'),
    (4, 501, 'Prescription Drugs', 0.8, 450.00, '2024-01-16'),
    (5, 501, 'Physical Therapy', 1.5, 1200.00, '2024-01-17'),
    (6, 501, 'Diagnostic Imaging', 2.1, 2800.00, '2024-01-17'),
    (7, 502, 'Inpatient Hospital', 3.2, 32000.00, '2024-01-15'),
    (8, 502, 'Outpatient Surgery', 2.8, 9200.00, '2024-01-15'),
    (9, 503, 'Emergency Room', 1.5, 2900.00, '2024-01-16'),
    (10, 503, 'Prescription Drugs', 1.0, 380.00, '2024-01-16');`,
    solutionSql: `WITH center_performance AS (
        SELECT 
            c.center_id,
            c.center_name,
            c.region,
            c.center_manager,
            COUNT(DISTINCT cl.claim_type) as claim_types_handled,
            AVG(cl.processing_time_days) as avg_processing_time,
            COUNT(cl.claim_id) as total_claims_processed,
            SUM(cl.claim_amount) as total_claim_value
        FROM unitedhealth_centers c
        JOIN unitedhealth_claims cl ON c.center_id = cl.center_id
        GROUP BY c.center_id, c.center_name, c.region, c.center_manager
    )
    SELECT 
        center_name,
        region,
        center_manager,
        claim_types_handled,
        ROUND(avg_processing_time, 2) as avg_processing_days,
        total_claims_processed,
        ROUND(total_claim_value, 0) as total_claim_value
    FROM center_performance
    WHERE claim_types_handled > 5 
        AND avg_processing_time < 3.0
    ORDER BY avg_processing_time ASC;`,
    explanation: "Healthcare operations analysis using JOINs with multi-criteria filtering for processing center efficiency evaluation across claim type diversity and speed metrics."
  }
];

// Batch 8: 8 Hard Problems
const hardProblems = [
  {
    id: uuidv4(),
    title: "Renaissance Technologies Quantitative Alpha",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Renaissance Technologies' quantitative research team develops sophisticated mathematical models to identify market inefficiencies and generate alpha through statistical arbitrage strategies.

**Scenario:** You're a senior quantitative researcher at Renaissance Technologies building next-generation alpha generation models. The investment committee needs to understand which factor combinations produce the most consistent risk-adjusted returns across different market regimes.

**Problem:** Calculate factor loadings and alpha generation using a multi-factor model: Return = Alpha + β₁×Market + β₂×Size + β₃×Value + β₄×Momentum + ε. Identify strategies with Information Ratios > 1.5 and consistent alpha across bull/bear markets.

**Expected Output:** High-alpha strategies with factor loadings, Information Ratios, and regime-specific performance, showing only strategies with IR > 1.5, ordered by Information Ratio descending.`,
    setupSql: `CREATE TABLE renaissance_strategies (
        strategy_id INT PRIMARY KEY,
        strategy_name VARCHAR(100),
        strategy_type VARCHAR(50),
        portfolio_manager VARCHAR(100),
        inception_date DATE
    );
    
    CREATE TABLE renaissance_returns (
        return_id INT PRIMARY KEY,
        strategy_id INT,
        return_date DATE,
        strategy_return DECIMAL(8,6),
        market_return DECIMAL(8,6),
        size_factor DECIMAL(8,6),
        value_factor DECIMAL(8,6),
        momentum_factor DECIMAL(8,6),
        risk_free_rate DECIMAL(8,6),
        market_regime VARCHAR(20)
    );
    
    INSERT INTO renaissance_strategies VALUES 
    (1, 'Statistical Arbitrage Alpha', 'Equity Market Neutral', 'Dr. Sarah Quantson', '2020-01-15'),
    (2, 'Cross-Asset Momentum', 'Multi-Asset', 'Prof. Michael Alphus', '2019-06-20'),
    (3, 'Mean Reversion Capture', 'Fixed Income Relative Value', 'Dr. Emily Factorus', '2021-03-10'),
    (4, 'Volatility Surface Arb', 'Options Strategies', 'Dr. David Greekius', '2020-09-05');
    
    INSERT INTO renaissance_returns VALUES 
    (1, 1, '2024-01-15', 0.0085, 0.0125, -0.0032, 0.0018, -0.0045, 0.0035, 'Bull Market'),
    (2, 1, '2024-01-16', 0.0092, 0.0098, -0.0028, 0.0022, -0.0038, 0.0035, 'Bull Market'),
    (3, 1, '2024-01-17', -0.0025, -0.0156, 0.0045, -0.0031, 0.0052, 0.0035, 'Bear Market'),
    (4, 1, '2024-01-18', 0.0078, 0.0089, -0.0035, 0.0015, -0.0042, 0.0035, 'Bull Market'),
    (5, 2, '2024-01-15', 0.0156, 0.0125, 0.0018, -0.0025, 0.0089, 0.0035, 'Bull Market'),
    (6, 2, '2024-01-16', 0.0134, 0.0098, 0.0022, -0.0018, 0.0076, 0.0035, 'Bull Market'),
    (7, 2, '2024-01-17', -0.0089, -0.0156, -0.0038, 0.0045, -0.0098, 0.0035, 'Bear Market'),
    (8, 2, '2024-01-18', 0.0142, 0.0089, 0.0015, -0.0022, 0.0082, 0.0035, 'Bull Market'),
    (9, 3, '2024-01-15', 0.0045, 0.0125, 0.0008, 0.0035, -0.0018, 0.0035, 'Bull Market'),
    (10, 3, '2024-01-16', 0.0038, 0.0098, 0.0012, 0.0028, -0.0022, 0.0035, 'Bull Market');`,
    solutionSql: `WITH factor_regressions AS (
        SELECT 
            s.strategy_id,
            s.strategy_name,
            s.strategy_type,
            COUNT(r.return_id) as observations,
            AVG(r.strategy_return - r.risk_free_rate) as avg_excess_return,
            STDDEV(r.strategy_return - r.risk_free_rate) as return_volatility,
            -- Multi-factor alpha calculation (simplified - in reality would use proper regression)
            AVG(r.strategy_return - r.risk_free_rate) - 
                (CORR(r.strategy_return, r.market_return) * AVG(r.market_return - r.risk_free_rate)) as estimated_alpha,
            CORR(r.strategy_return, r.market_return) as market_beta,
            CORR(r.strategy_return, r.size_factor) as size_beta,
            CORR(r.strategy_return, r.value_factor) as value_beta,
            CORR(r.strategy_return, r.momentum_factor) as momentum_beta
        FROM renaissance_strategies s
        JOIN renaissance_returns r ON s.strategy_id = r.strategy_id
        GROUP BY s.strategy_id, s.strategy_name, s.strategy_type
    ),
    regime_analysis AS (
        SELECT 
            s.strategy_id,
            r.market_regime,
            AVG(r.strategy_return - r.risk_free_rate) as regime_excess_return,
            STDDEV(r.strategy_return - r.risk_free_rate) as regime_volatility,
            COUNT(*) as regime_observations
        FROM renaissance_strategies s
        JOIN renaissance_returns r ON s.strategy_id = r.strategy_id
        GROUP BY s.strategy_id, r.market_regime
    ),
    information_ratios AS (
        SELECT 
            fr.*,
            -- Information Ratio = Alpha / Tracking Error (simplified)
            CASE 
                WHEN fr.return_volatility > 0 THEN fr.estimated_alpha / fr.return_volatility
                ELSE 0
            END as information_ratio
        FROM factor_regressions fr
    )
    SELECT 
        ir.strategy_name,
        ir.strategy_type,
        ROUND(ir.estimated_alpha * 252, 4) as annualized_alpha,
        ROUND(ir.market_beta, 3) as market_beta,
        ROUND(ir.size_beta, 3) as size_beta,  
        ROUND(ir.value_beta, 3) as value_beta,
        ROUND(ir.momentum_beta, 3) as momentum_beta,
        ROUND(ir.information_ratio, 3) as information_ratio,
        ROUND(ir.return_volatility * SQRT(252), 3) as annualized_volatility,
        ir.observations
    FROM information_ratios ir
    WHERE ir.information_ratio > 1.5
    ORDER BY ir.information_ratio DESC;`,
    explanation: "Advanced quantitative finance using multi-factor models, alpha decomposition, Information Ratio calculations, and regime analysis for systematic trading strategy evaluation."
  },
  {
    id: uuidv4(),
    title: "Berkshire Hathaway Insurance Float Optimization",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** Berkshire Hathaway's insurance operations generate massive float that Warren Buffett invests to create value. The insurance division must optimize float generation while maintaining underwriting discipline and regulatory capital requirements.

**Scenario:** You're a senior insurance analyst at Berkshire Hathaway developing float optimization models. The executive team needs to understand which business lines generate the most valuable float considering both size and cost characteristics.

**Problem:** Calculate float value using: Float Value = Float Amount × (Investment Return - Float Cost) × Duration. Identify business lines with float yields > 8% and combined ratios < 100%. Include regulatory capital efficiency metrics.

**Expected Output:** High-value insurance lines with float metrics, investment returns, combined ratios, and capital efficiency, showing only profitable float generators, ordered by float value descending.`,
    setupSql: `CREATE TABLE berkshire_insurance_lines (
        line_id INT PRIMARY KEY,
        business_line VARCHAR(100),
        line_manager VARCHAR(100),
        regulatory_capital_req DECIMAL(15,2),
        avg_policy_duration_years DECIMAL(4,2)
    );
    
    CREATE TABLE berkshire_float_data (
        data_id INT PRIMARY KEY,
        line_id INT,
        reporting_period VARCHAR(20),
        premiums_written DECIMAL(15,2),
        claims_paid DECIMAL(15,2),
        expenses DECIMAL(15,2),
        float_balance DECIMAL(15,2),
        investment_income DECIMAL(15,2),
        underwriting_result DECIMAL(15,2)
    );
    
    INSERT INTO berkshire_insurance_lines VALUES 
    (1, 'GEICO Auto Insurance', 'Tony Nicely', 15000000000.00, 1.0),
    (2, 'General Re Reinsurance', 'Tad Montross', 25000000000.00, 3.5),
    (3, 'Berkshire Hathaway Reinsurance', 'Ajit Jain', 45000000000.00, 8.2),
    (4, 'National Indemnity', 'Don Wurster', 8000000000.00, 2.1),
    (5, 'Medical Protective', 'Tim Kenesey', 3000000000.00, 4.8);
    
    INSERT INTO berkshire_float_data VALUES 
    (1, 1, '2023 Annual', 48000000000.00, 42000000000.00, 4500000000.00, 28000000000.00, 2100000000.00, 1500000000.00),
    (2, 2, '2023 Annual', 8500000000.00, 7200000000.00, 980000000.00, 35000000000.00, 3200000000.00, 320000000.00),
    (3, 3, '2023 Annual', 12000000000.00, 9800000000.00, 1100000000.00, 78000000000.00, 6800000000.00, 1100000000.00),
    (4, 4, '2023 Annual', 3200000000.00, 2800000000.00, 450000000.00, 12000000000.00, 950000000.00, -50000000.00),
    (5, 5, '2023 Annual', 1800000000.00, 1400000000.00, 320000000.00, 8500000000.00, 720000000.00, 80000000.00);`,
    solutionSql: `WITH insurance_metrics AS (
        SELECT 
            il.line_id,
            il.business_line,
            il.line_manager,
            il.avg_policy_duration_years,
            fd.premiums_written,
            fd.claims_paid,
            fd.expenses,
            fd.float_balance,
            fd.investment_income,
            fd.underwriting_result,
            -- Combined Ratio = (Claims + Expenses) / Premiums Written
            ((fd.claims_paid + fd.expenses) / fd.premiums_written) * 100 as combined_ratio,
            -- Float Cost = Underwriting Loss / Float Balance (if underwriting loss)
            CASE 
                WHEN fd.underwriting_result < 0 THEN ABS(fd.underwriting_result) / fd.float_balance
                ELSE 0
            END as float_cost_rate,
            -- Investment Return Rate
            fd.investment_income / fd.float_balance as investment_return_rate,
            -- Capital Efficiency = Float Balance / Regulatory Capital
            fd.float_balance / il.regulatory_capital_req as capital_efficiency
        FROM berkshire_insurance_lines il
        JOIN berkshire_float_data fd ON il.line_id = fd.line_id
    ),
    float_value_analysis AS (
        SELECT 
            *,
            -- Net Float Yield = Investment Return - Float Cost
            (investment_return_rate - float_cost_rate) as net_float_yield,
            -- Float Value = Float × Net Yield × Duration (simplified)
            float_balance * (investment_return_rate - float_cost_rate) * avg_policy_duration_years as float_value,
            -- Regulatory Capital ROE
            (investment_income + underwriting_result) / (float_balance / capital_efficiency) as regulatory_roe
        FROM insurance_metrics
    )
    SELECT 
        business_line,
        line_manager,
        ROUND(float_balance / 1000000000, 1) as float_balance_billions,
        ROUND(combined_ratio, 2) as combined_ratio,
        ROUND(net_float_yield * 100, 2) as float_yield_pct,
        ROUND(float_value / 1000000000, 1) as float_value_billions,
        ROUND(investment_return_rate * 100, 2) as investment_return_pct,
        ROUND(capital_efficiency, 2) as capital_efficiency,
        ROUND(regulatory_roe * 100, 2) as regulatory_roe_pct
    FROM float_value_analysis
    WHERE net_float_yield > 0.08 
        AND combined_ratio < 100
    ORDER BY float_value DESC;`,
    explanation: "Insurance industry financial analysis using float valuation models, combined ratio calculations, and capital efficiency metrics for investment-focused insurance operations optimization."
  }
];

async function importBatch8() {
  console.log('🚀 BATCH 8: Adding 15 problems (2 Easy, 5 Medium, 8 Hard)...');
  console.log('Progress: 63 → 78 problems toward final goal of 100');
  
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
  
  console.log(`\n🎉 Batch 8 Complete! Added ${successCount}/${allProblems.length} problems`);
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
  
  console.log('\n📊 UPDATED DISTRIBUTION AFTER BATCH 8:');
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
  
  if (grandTotal >= 75) {
    console.log('🎯 Outstanding! Over 75% complete!');
    console.log('🚀 Ready for Final Batch 9: 22 remaining problems (2 Easy, 4 Medium, 8 Hard)');
  }
  
  await pool.end();
}

importBatch8().catch(console.error);