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

// Batch 4: 5 Easy Problems (Focus on completing Easy target)
const easyProblems = [
  {
    id: uuidv4(),
    title: "General Electric Manufacturing Efficiency",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** General Electric's manufacturing operations track production efficiency across different industrial segments to optimize resource allocation and identify improvement opportunities.

**Scenario:** You're a manufacturing analyst at GE analyzing production performance across different business segments. The operations team wants to identify which segments are exceeding efficiency targets.

**Problem:** Find all manufacturing segments where the average efficiency score is greater than 85%.

**Expected Output:** Manufacturing segments with average efficiency (>85% only), ordered by efficiency descending.`,
    setupSql: `CREATE TABLE ge_manufacturing (
        plant_id INT,
        segment VARCHAR(50),
        efficiency_score DECIMAL(5,2),
        production_date DATE
    );
    
    INSERT INTO ge_manufacturing VALUES 
    (101, 'Aviation', 88.5, '2024-01-15'),
    (102, 'Healthcare', 92.3, '2024-01-15'),
    (103, 'Power', 78.9, '2024-01-15'),
    (104, 'Renewable Energy', 91.7, '2024-01-15'),
    (105, 'Aviation', 85.2, '2024-01-16'),
    (106, 'Healthcare', 89.8, '2024-01-16'),
    (107, 'Power', 81.4, '2024-01-16'),
    (108, 'Digital', 87.6, '2024-01-16');`,
    solutionSql: `SELECT segment, AVG(efficiency_score) as avg_efficiency
FROM ge_manufacturing 
GROUP BY segment 
HAVING AVG(efficiency_score) > 85 
ORDER BY avg_efficiency DESC;`,
    explanation: "Manufacturing efficiency analysis using AVG aggregate function with HAVING clause for performance thresholds."
  },
  {
    id: uuidv4(),
    title: "Boeing Aircraft Orders Analysis", 
    difficulty: "easy",
    category: "Basic Queries",
    description: `**Business Context:** Boeing's commercial aircraft division tracks order patterns from airlines worldwide to forecast production schedules and optimize supply chain planning.

**Scenario:** You're an aircraft sales analyst at Boeing analyzing order volumes by aircraft model. The sales team needs to identify which models have strong order volumes for production planning.

**Problem:** List all aircraft models that have received more than 10 total orders.

**Expected Output:** Aircraft models with total order counts (>10 orders only), ordered by orders descending.`,
    setupSql: `CREATE TABLE boeing_orders (
        order_id INT PRIMARY KEY,
        aircraft_model VARCHAR(20),
        airline VARCHAR(50),
        quantity INT,
        order_date DATE
    );
    
    INSERT INTO boeing_orders VALUES 
    (1, '737 MAX', 'Southwest Airlines', 8, '2024-01-15'),
    (2, '787 Dreamliner', 'United Airlines', 12, '2024-01-15'),
    (3, '777X', 'Emirates', 6, '2024-01-15'),
    (4, '737 MAX', 'American Airlines', 15, '2024-01-16'),
    (5, '787 Dreamliner', 'British Airways', 8, '2024-01-16'),
    (6, '737 MAX', 'Delta Air Lines', 18, '2024-01-17'),
    (7, '777X', 'Lufthansa', 9, '2024-01-17'),
    (8, '787 Dreamliner', 'Air France', 7, '2024-01-17');`,
    solutionSql: `SELECT aircraft_model, SUM(quantity) as total_orders
FROM boeing_orders 
GROUP BY aircraft_model 
HAVING SUM(quantity) > 10 
ORDER BY total_orders DESC;`,
    explanation: "Aircraft order analysis with GROUP BY and SUM aggregation, typical aerospace industry metrics."
  }
];

// Batch 4: 12 Medium Problems (Heavy focus on Medium)
const mediumProblems = [
  {
    id: uuidv4(),
    title: "Coca-Cola Global Distribution Network",
    difficulty: "medium",
    category: "Joins",
    description: `**Business Context:** Coca-Cola's global operations team manages distribution networks across regions to ensure product availability while optimizing transportation costs and inventory levels.

**Scenario:** You're a supply chain analyst at Coca-Cola analyzing distribution efficiency. The logistics team needs to identify bottling plants that serve multiple regions with high total volumes.

**Problem:** Find bottling plants that distribute to more than 2 different regions and have total monthly volume exceeding 1 million liters.

**Expected Output:** Plant details with region count and total volume, only plants meeting both criteria, ordered by volume descending.`,
    setupSql: `CREATE TABLE coca_cola_plants (
        plant_id INT PRIMARY KEY,
        plant_name VARCHAR(100),
        location VARCHAR(50),
        capacity_liters BIGINT
    );
    
    CREATE TABLE distribution_volumes (
        distribution_id INT PRIMARY KEY,
        plant_id INT,
        region VARCHAR(50),
        monthly_volume BIGINT,
        distribution_date DATE
    );
    
    INSERT INTO coca_cola_plants VALUES 
    (301, 'Atlanta Bottling', 'Atlanta, GA', 5000000),
    (302, 'Mexico City Plant', 'Mexico City, MX', 8000000),
    (303, 'London Facility', 'London, UK', 3000000),
    (304, 'Tokyo Operations', 'Tokyo, JP', 6000000);
    
    INSERT INTO distribution_volumes VALUES 
    (1, 301, 'Southeast US', 450000, '2024-01-01'),
    (2, 301, 'Northeast US', 380000, '2024-01-01'),
    (3, 301, 'Midwest US', 420000, '2024-01-01'),
    (4, 302, 'Central Mexico', 650000, '2024-01-01'),
    (5, 302, 'Northern Mexico', 580000, '2024-01-01'),
    (6, 303, 'UK & Ireland', 280000, '2024-01-01'),
    (7, 303, 'Continental Europe', 350000, '2024-01-01'),
    (8, 304, 'Japan', 720000, '2024-01-01'),
    (9, 304, 'Southeast Asia', 450000, '2024-01-01');`,
    solutionSql: `SELECT 
        p.plant_id,
        p.plant_name,
        p.location,
        COUNT(DISTINCT d.region) as regions_served,
        SUM(d.monthly_volume) as total_volume
    FROM coca_cola_plants p
    JOIN distribution_volumes d ON p.plant_id = d.plant_id
    GROUP BY p.plant_id, p.plant_name, p.location
    HAVING COUNT(DISTINCT d.region) > 2 
        AND SUM(d.monthly_volume) > 1000000
    ORDER BY total_volume DESC;`,
    explanation: "Supply chain analysis using JOINs with GROUP BY and multiple HAVING conditions for complex business criteria."
  },
  {
    id: uuidv4(),
    title: "Intel Chip Performance Benchmarks",
    difficulty: "medium",
    category: "Window Functions",
    description: `**Business Context:** Intel's processor engineering team analyzes chip performance data across different architectures to guide product development and competitive positioning strategies.

**Scenario:** You're a performance engineer at Intel analyzing benchmark results across processor families. The team needs to understand how each chip ranks within its generation for marketing and positioning.

**Problem:** For each processor generation, rank chips by performance score and identify the top 3 performers. Calculate the performance gap between each chip and the generation leader.

**Expected Output:** Top 3 chips per generation with rank, performance score, and gap from leader, ordered by generation and rank.`,
    setupSql: `CREATE TABLE intel_processors (
        processor_id INT PRIMARY KEY,
        model_name VARCHAR(50),
        generation VARCHAR(20),
        performance_score INT,
        cores INT,
        release_date DATE
    );
    
    INSERT INTO intel_processors VALUES 
    (1, 'Core i9-13900K', '13th Gen', 28500, 24, '2024-01-15'),
    (2, 'Core i7-13700K', '13th Gen', 25200, 16, '2024-01-15'),
    (3, 'Core i5-13600K', '13th Gen', 22800, 14, '2024-01-15'),
    (4, 'Core i3-13100', '13th Gen', 18500, 4, '2024-01-15'),
    (5, 'Core i9-12900K', '12th Gen', 26800, 16, '2023-11-01'),
    (6, 'Core i7-12700K', '12th Gen', 23500, 12, '2023-11-01'),
    (7, 'Core i5-12600K', '12th Gen', 21200, 10, '2023-11-01'),
    (8, 'Core i3-12100', '12th Gen', 16800, 4, '2023-11-01');`,
    solutionSql: `WITH processor_rankings AS (
        SELECT 
            processor_id,
            model_name,
            generation,
            performance_score,
            cores,
            ROW_NUMBER() OVER (PARTITION BY generation ORDER BY performance_score DESC) as rank_in_gen,
            FIRST_VALUE(performance_score) OVER (PARTITION BY generation ORDER BY performance_score DESC) as leader_score
        FROM intel_processors
    )
    SELECT 
        model_name,
        generation,
        performance_score,
        cores,
        rank_in_gen,
        (leader_score - performance_score) as performance_gap
    FROM processor_rankings
    WHERE rank_in_gen <= 3
    ORDER BY generation DESC, rank_in_gen;`,
    explanation: "Advanced window functions using ROW_NUMBER() and FIRST_VALUE() for competitive analysis and performance ranking within groups."
  },
  {
    id: uuidv4(),
    title: "FedEx Delivery Route Optimization",
    difficulty: "medium",
    category: "Time Analysis",
    description: `**Business Context:** FedEx operations teams analyze delivery route efficiency to optimize driver schedules, reduce fuel costs, and improve customer satisfaction through reliable delivery windows.

**Scenario:** You're a logistics analyst at FedEx studying route performance. The operations team needs to identify routes with consistent delivery time improvements for best practice sharing.

**Problem:** Find delivery routes where the average delivery time has improved by more than 10% comparing this month to last month.

**Expected Output:** Routes with current and previous month averages, improvement percentage, and package counts, ordered by improvement descending.`,
    setupSql: `CREATE TABLE fedex_deliveries (
        delivery_id INT PRIMARY KEY,
        route_code VARCHAR(20),
        delivery_minutes INT,
        package_count INT,
        delivery_date DATE
    );
    
    INSERT INTO fedex_deliveries VALUES 
    (1, 'ATL-001', 45, 25, '2024-01-15'),
    (2, 'ATL-001', 42, 28, '2024-01-16'),
    (3, 'ATL-001', 38, 22, '2024-01-17'),
    (4, 'NYC-105', 62, 35, '2024-01-15'),
    (5, 'NYC-105', 58, 32, '2024-01-16'),
    (6, 'NYC-105', 55, 38, '2024-01-17'),
    (7, 'ATL-001', 52, 30, '2023-12-15'),
    (8, 'ATL-001', 48, 26, '2023-12-16'),
    (9, 'ATL-001', 50, 29, '2023-12-17'),
    (10, 'NYC-105', 68, 40, '2023-12-15'),
    (11, 'NYC-105', 65, 36, '2023-12-16'),
    (12, 'NYC-105', 70, 42, '2023-12-17');`,
    solutionSql: `WITH monthly_performance AS (
        SELECT 
            route_code,
            DATE_TRUNC('month', delivery_date) as month,
            AVG(delivery_minutes) as avg_delivery_time,
            COUNT(*) as total_deliveries
        FROM fedex_deliveries
        WHERE delivery_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months'
        GROUP BY route_code, DATE_TRUNC('month', delivery_date)
    ),
    route_comparison AS (
        SELECT 
            route_code,
            MAX(CASE WHEN month = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN avg_delivery_time END) as current_avg,
            MAX(CASE WHEN month = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months') THEN avg_delivery_time END) as previous_avg,
            SUM(total_deliveries) as total_packages
        FROM monthly_performance
        GROUP BY route_code
        HAVING COUNT(DISTINCT month) = 2
    )
    SELECT 
        route_code,
        ROUND(previous_avg, 2) as previous_month_avg,
        ROUND(current_avg, 2) as current_month_avg,
        ROUND(((previous_avg - current_avg) / previous_avg) * 100, 2) as improvement_percent,
        total_packages
    FROM route_comparison
    WHERE ((previous_avg - current_avg) / previous_avg) > 0.10
    ORDER BY improvement_percent DESC;`,
    explanation: "Complex time-series analysis using CTEs and conditional aggregation to compare month-over-month performance improvements."
  }
];

// Batch 4: 8 Hard Problems (Heavy focus on Hard)
const hardProblems = [
  {
    id: uuidv4(),
    title: "BlackRock ESG Investment Analysis",
    difficulty: "hard", 
    category: "Advanced Topics",
    description: `**Business Context:** BlackRock's ESG (Environmental, Social, Governance) investment team evaluates portfolio companies across sustainability metrics to make informed investment decisions and meet client ESG mandates.

**Scenario:** You're a senior ESG analyst at BlackRock developing systematic approaches to identify high-performing sustainable investments. The team needs to create composite ESG scores and identify investment opportunities.

**Problem:** Calculate a weighted ESG composite score (40% Environmental, 35% Social, 25% Governance) for each company. Identify companies in the top quartile of their sector by ESG score that also have positive 12-month returns.

**Expected Output:** Top ESG performers by sector with composite scores, returns, and sector rankings, ordered by composite score descending.`,
    setupSql: `CREATE TABLE blackrock_holdings (
        company_id INT PRIMARY KEY,
        company_name VARCHAR(100),
        sector VARCHAR(50),
        market_cap BIGINT,
        twelve_month_return DECIMAL(8,4)
    );
    
    CREATE TABLE esg_scores (
        company_id INT,
        environmental_score DECIMAL(5,2),
        social_score DECIMAL(5,2),
        governance_score DECIMAL(5,2),
        assessment_date DATE
    );
    
    INSERT INTO blackrock_holdings VALUES 
    (1, 'Microsoft Corporation', 'Technology', 2800000000000, 0.1850),
    (2, 'Johnson & Johnson', 'Healthcare', 450000000000, 0.0920),
    (3, 'Procter & Gamble', 'Consumer Staples', 380000000000, 0.1240),
    (4, 'Unilever PLC', 'Consumer Staples', 140000000000, 0.0680),
    (5, 'ASML Holding', 'Technology', 280000000000, 0.2150),
    (6, 'Nestle SA', 'Consumer Staples', 320000000000, 0.0850),
    (7, 'TSMC', 'Technology', 520000000000, 0.1950),
    (8, 'Novartis AG', 'Healthcare', 210000000000, 0.0450);
    
    INSERT INTO esg_scores VALUES 
    (1, 88.5, 92.3, 89.7, '2024-01-15'),
    (2, 85.2, 88.9, 91.4, '2024-01-15'),
    (3, 82.7, 86.5, 88.2, '2024-01-15'),
    (4, 91.3, 89.7, 87.6, '2024-01-15'),
    (5, 79.8, 83.4, 92.1, '2024-01-15'),
    (6, 88.9, 91.2, 85.3, '2024-01-15'),
    (7, 75.6, 78.9, 88.7, '2024-01-15'),
    (8, 87.3, 85.8, 90.2, '2024-01-15');`,
    solutionSql: `WITH esg_composite AS (
        SELECT 
            h.company_id,
            h.company_name,
            h.sector,
            h.twelve_month_return,
            (e.environmental_score * 0.40 + e.social_score * 0.35 + e.governance_score * 0.25) as composite_esg_score
        FROM blackrock_holdings h
        JOIN esg_scores e ON h.company_id = e.company_id
        WHERE h.twelve_month_return > 0
    ),
    sector_quartiles AS (
        SELECT 
            *,
            NTILE(4) OVER (PARTITION BY sector ORDER BY composite_esg_score) as esg_quartile
        FROM esg_composite
    )
    SELECT 
        company_name,
        sector,
        ROUND(composite_esg_score, 2) as composite_esg_score,
        ROUND(twelve_month_return * 100, 2) as return_percent,
        esg_quartile
    FROM sector_quartiles
    WHERE esg_quartile = 4
    ORDER BY composite_esg_score DESC;`,
    explanation: "Sophisticated ESG investment analysis using weighted composite scoring, quartile ranking within sectors, and multi-criteria filtering for sustainable investment identification."
  },
  {
    id: uuidv4(),
    title: "Goldman Sachs Algorithmic Trading Analysis",
    difficulty: "hard",
    category: "Advanced Topics", 
    description: `**Business Context:** Goldman Sachs' algorithmic trading division analyzes trading strategy performance across different market conditions to optimize execution algorithms and risk management parameters.

**Scenario:** You're a quantitative analyst at Goldman Sachs developing performance attribution models for algorithmic trading strategies. The team needs to understand which strategies perform best under different market volatility regimes.

**Problem:** Classify trading days by market volatility (Low <2%, Medium 2-4%, High >4%) and calculate risk-adjusted returns (Sharpe ratio) for each strategy in each volatility regime. Identify strategies with Sharpe ratios >1.5 in high volatility periods.

**Expected Output:** Strategy performance by volatility regime, showing only high-volatility outperformers with Sharpe ratios >1.5, ordered by Sharpe ratio descending.`,
    setupSql: `CREATE TABLE market_data (
        trade_date DATE PRIMARY KEY,
        sp500_return DECIMAL(8,4),
        volatility DECIMAL(8,4),
        risk_free_rate DECIMAL(6,4)
    );
    
    CREATE TABLE algo_trading_pnl (
        trade_id INT PRIMARY KEY,
        strategy_name VARCHAR(50),
        trade_date DATE,
        daily_return DECIMAL(8,4),
        notional_amount BIGINT
    );
    
    INSERT INTO market_data VALUES 
    ('2024-01-15', 0.0125, 0.0180, 0.035),
    ('2024-01-16', -0.0089, 0.0220, 0.035),
    ('2024-01-17', 0.0234, 0.0320, 0.035),
    ('2024-01-18', -0.0156, 0.0450, 0.035),
    ('2024-01-19', 0.0087, 0.0380, 0.035),
    ('2024-01-22', 0.0298, 0.0520, 0.035),
    ('2024-01-23', -0.0234, 0.0480, 0.035),
    ('2024-01-24', 0.0145, 0.0290, 0.035);
    
    INSERT INTO algo_trading_pnl VALUES 
    (1, 'Momentum Strategy', '2024-01-15', 0.0095, 50000000),
    (2, 'Mean Reversion', '2024-01-15', 0.0078, 75000000),
    (3, 'Momentum Strategy', '2024-01-16', -0.0045, 50000000),
    (4, 'Mean Reversion', '2024-01-16', 0.0034, 75000000),
    (5, 'Momentum Strategy', '2024-01-17', 0.0185, 50000000),
    (6, 'Mean Reversion', '2024-01-17', -0.0087, 75000000),
    (7, 'Momentum Strategy', '2024-01-18', -0.0098, 50000000),
    (8, 'Mean Reversion', '2024-01-18', 0.0156, 75000000),
    (9, 'Momentum Strategy', '2024-01-19', 0.0067, 50000000),
    (10, 'Mean Reversion', '2024-01-19', -0.0023, 75000000),
    (11, 'Momentum Strategy', '2024-01-22', 0.0234, 50000000),
    (12, 'Mean Reversion', '2024-01-22', 0.0198, 75000000),
    (13, 'Momentum Strategy', '2024-01-23', -0.0156, 50000000),
    (14, 'Mean Reversion', '2024-01-23', 0.0089, 75000000),
    (15, 'Momentum Strategy', '2024-01-24', 0.0123, 50000000),
    (16, 'Mean Reversion', '2024-01-24', -0.0045, 75000000);`,
    solutionSql: `WITH volatility_classification AS (
        SELECT 
            trade_date,
            volatility,
            risk_free_rate,
            CASE 
                WHEN volatility < 0.02 THEN 'Low Volatility'
                WHEN volatility BETWEEN 0.02 AND 0.04 THEN 'Medium Volatility' 
                ELSE 'High Volatility'
            END as vol_regime
        FROM market_data
    ),
    strategy_performance AS (
        SELECT 
            atp.strategy_name,
            vc.vol_regime,
            AVG(atp.daily_return) as avg_return,
            STDDEV(atp.daily_return) as return_volatility,
            AVG(vc.risk_free_rate) as avg_risk_free_rate,
            COUNT(*) as trading_days
        FROM algo_trading_pnl atp
        JOIN volatility_classification vc ON atp.trade_date = vc.trade_date
        GROUP BY atp.strategy_name, vc.vol_regime
    )
    SELECT 
        strategy_name,
        vol_regime,
        ROUND(avg_return * 100, 3) as avg_return_percent,
        ROUND(return_volatility * 100, 3) as volatility_percent,
        ROUND((avg_return - avg_risk_free_rate) / return_volatility, 3) as sharpe_ratio,
        trading_days
    FROM strategy_performance
    WHERE vol_regime = 'High Volatility'
        AND return_volatility > 0
        AND (avg_return - avg_risk_free_rate) / return_volatility > 1.5
    ORDER BY sharpe_ratio DESC;`,
    explanation: "Advanced quantitative finance analysis using volatility regime classification, risk-adjusted return calculations, and performance attribution across market conditions."
  }
];

async function importBatch4() {
  console.log('🚀 Starting import of 25 problems (Batch 4)...');
  
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
  
  console.log(`🎉 Batch 4 import complete! Added ${successCount}/${allProblems.length} problems.`);
  
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
  
  const targetDistribution = { easy: 33, medium: 33, hard: 34 };
  console.log('\n🎯 Progress to Target:');
  result.rows.forEach(row => {
    const remaining = targetDistribution[row.difficulty] - parseInt(row.count);
    console.log(`${row.difficulty}: ${row.count}/${targetDistribution[row.difficulty]} (${remaining} remaining)`);
  });
  
  await pool.end();
}

importBatch4().catch(console.error);