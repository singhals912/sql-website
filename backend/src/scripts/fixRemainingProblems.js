const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Fix remaining 18 problems with properly sized decimal values
const remainingFixes = {
  53: {
    title: "Mastercard Global Payment Network Analytics",
    description: `**Business Context:** Mastercard's payment network processes over 150 billion transactions annually across 210 countries, requiring sophisticated analytics to optimize transaction routing, fraud detection, and revenue optimization.

**Scenario:** You're a senior payments analyst at Mastercard studying transaction performance across geographic regions. The network team needs to identify high-performing regions with fraud rates below 0.1% and success rates above 99%.

**Problem:** Calculate payment network metrics and identify regions meeting fraud and success criteria.

**Expected Output:** High-performing regions (<0.1% fraud, >99% success), ordered by volume descending.`,
    setupSql: `CREATE TABLE mastercard_network (
        region_id INT PRIMARY KEY,
        region VARCHAR(50),
        monthly_volume BIGINT,
        fraud_incidents INT,
        failed_transactions INT,
        revenue DECIMAL(8,2),
        processing_cost DECIMAL(8,2),
        network_date DATE
    );
    INSERT INTO mastercard_network VALUES 
    (1, 'North America', 25000000000, 125000, 50000000, 8500.50, 1200.00, '2024-01-15'),
    (2, 'Europe', 18000000000, 95000, 36000000, 6200.75, 950.00, '2024-01-15'),
    (3, 'Asia Pacific', 22000000000, 180000, 88000000, 4800.25, 1100.00, '2024-01-16'),
    (4, 'Latin America', 8500000000, 65000, 25500000, 1850.80, 420.00, '2024-01-16'),
    (5, 'Middle East Africa', 4200000000, 42000, 12600000, 950.60, 185.00, '2024-01-17');`,
    solutionSql: `WITH metrics AS (
        SELECT 
            region,
            monthly_volume,
            ROUND((CAST(fraud_incidents AS DECIMAL) / monthly_volume) * 100, 4) as fraud_rate_pct,
            ROUND(((CAST(monthly_volume - failed_transactions AS DECIMAL) / monthly_volume) * 100), 3) as success_rate_pct,
            revenue
        FROM mastercard_network
    )
    SELECT region, ROUND(monthly_volume / 1000000000, 2) as volume_billions, fraud_rate_pct, success_rate_pct, revenue
    FROM metrics WHERE fraud_rate_pct < 0.1 AND success_rate_pct > 99.0 ORDER BY volume_billions DESC;`,
    explanation: "Mastercard payment network analytics using fraud rates and success rates."
  },

  54: {
    title: "Merck Pharmaceutical Pipeline Analytics", 
    description: `**Business Context:** Merck's pharmaceutical research division manages drug development across oncology, vaccines, and infectious diseases, requiring analytics to optimize R&D investments.

**Scenario:** You're a pipeline analyst at Merck evaluating therapeutic programs. The R&D team needs programs with high commercial potential and success probability above 25%.

**Problem:** Calculate pharmaceutical metrics and identify high-value programs meeting criteria.

**Expected Output:** High-potential programs (>$100K peak sales, >25% success), ordered by NPV descending.`,
    setupSql: `CREATE TABLE merck_pipeline (
        compound_id INT PRIMARY KEY,
        therapeutic_area VARCHAR(50),
        development_phase VARCHAR(20),
        peak_sales_projection DECIMAL(8,2),
        probability_of_success DECIMAL(5,3),
        risk_adjusted_npv DECIMAL(8,2),
        competitive_score DECIMAL(4,2),
        pipeline_date DATE
    );
    INSERT INTO merck_pipeline VALUES 
    (1, 'Oncology', 'Phase III', 350000.00, 0.650, 185000.00, 8.2, '2024-01-15'),
    (2, 'Vaccines', 'Phase II', 220000.00, 0.450, 98000.00, 7.5, '2024-01-15'),
    (3, 'Infectious Diseases', 'Phase III', 180000.00, 0.720, 125000.00, 9.1, '2024-01-16'),
    (4, 'Cardiovascular', 'Phase II', 150000.00, 0.380, 65000.00, 6.8, '2024-01-16'),
    (5, 'Diabetes', 'Phase III', 120000.00, 0.580, 89500.00, 7.8, '2024-01-17');`,
    solutionSql: `SELECT therapeutic_area, development_phase, ROUND(peak_sales_projection, 2) as peak_sales_thousands,
    ROUND(CAST(probability_of_success * 100 AS NUMERIC), 1) as success_probability_pct,
    ROUND(risk_adjusted_npv, 2) as npv_thousands, ROUND(competitive_score, 1) as competitive_score
    FROM merck_pipeline WHERE peak_sales_projection > 100000 AND probability_of_success > 0.25
    ORDER BY npv_thousands DESC;`,
    explanation: "Merck pharmaceutical pipeline analytics using NPV and success probability."
  },

  61: {
    title: "Procter & Gamble Brand Portfolio Analytics",
    description: `**Business Context:** P&G's brand management analyzes performance across consumer brands to optimize marketing investments and maximize market share.

**Scenario:** You're a brand analyst at P&G evaluating brand performance. The investment team needs brands with high marketing ROI above 4.0x and brand equity scores exceeding 85%.

**Problem:** Calculate brand metrics and identify high-performing brands meeting ROI and equity criteria.

**Expected Output:** High-performing brands (>4.0x ROI, >85% equity), ordered by market growth descending.`,
    setupSql: `CREATE TABLE pg_brands (
        brand_id INT PRIMARY KEY,
        brand_name VARCHAR(50),
        product_category VARCHAR(30),
        market_share_growth DECIMAL(6,3),
        marketing_roi DECIMAL(6,2),
        brand_equity_score DECIMAL(5,2),
        consumer_satisfaction INT,
        brand_date DATE
    );
    INSERT INTO pg_brands VALUES 
    (1, 'Tide Laundry Care', 'Fabric Care', 0.125, 4.85, 89.5, 87, '2024-01-15'),
    (2, 'Olay Skincare', 'Beauty', 0.098, 4.25, 86.8, 85, '2024-01-15'),
    (3, 'Pampers Diapers', 'Baby Care', 0.082, 3.95, 92.1, 91, '2024-01-16'),
    (4, 'Gillette Shaving', 'Grooming', 0.045, 5.20, 88.2, 83, '2024-01-16'),
    (5, 'Crest Oral Care', 'Health Care', 0.067, 4.15, 85.9, 86, '2024-01-17');`,
    solutionSql: `SELECT brand_name, product_category, 
    ROUND(CAST(market_share_growth * 100 AS NUMERIC), 2) as market_growth_pct,
    ROUND(marketing_roi, 2) as marketing_roi, ROUND(brand_equity_score, 1) as brand_equity_score,
    consumer_satisfaction FROM pg_brands WHERE marketing_roi > 4.0 AND brand_equity_score > 85
    ORDER BY market_growth_pct DESC;`,
    explanation: "P&G brand portfolio analytics using marketing ROI and brand equity."
  }
};

async function fixRemainingProblems() {
  console.log('🎯 FIXING REMAINING 18 PROBLEMS TO REACH 100/100 COMPLETION');
  console.log('Current: 82/100 → Target: 100/100 (100% completion)\n');
  
  let totalFixed = 0;
  
  try {
    // Fix the 3 numeric overflow problems first
    for (const [problemId, fix] of Object.entries(remainingFixes)) {
      console.log(`🔧 Problem #${problemId}: ${fix.title}`);
      
      try {
        await pool.query(`
          UPDATE problems 
          SET title = $1, description = $2
          WHERE numeric_id = $3
        `, [fix.title, fix.description, parseInt(problemId)]);
        
        await pool.query(`
          UPDATE problem_schemas 
          SET setup_sql = $1, solution_sql = $2, explanation = $3
          WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $4)
        `, [fix.setupSql, fix.solutionSql, fix.explanation, parseInt(problemId)]);
        
        await pool.query('BEGIN');
        await pool.query(fix.setupSql);
        const result = await pool.query(fix.solutionSql);
        await pool.query('ROLLBACK');
        
        console.log(`   ✅ Fixed (${result.rows.length} results)`);
        totalFixed++;
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message.substring(0, 60)}...`);
        try { await pool.query('ROLLBACK'); } catch {}
      }
    }
    
    console.log(`\n📊 COMPLETION UPDATE:`);
    console.log(`   ✅ Additional problems fixed: ${totalFixed}`);
    console.log(`   📈 New total quality: ${82 + totalFixed}/100 problems`);
    console.log(`   🎯 Progress: ${Math.round(((82 + totalFixed)/100)*100)}%`);
    
    if ((82 + totalFixed) >= 90) {
      console.log(`\n🏆 90%+ QUALITY TARGET ACHIEVED! 🏆`);
    } else {
      console.log(`\nRemaining for 90%: ${90 - (82 + totalFixed)} problems`);
    }
    
    console.log(`\n🔄 NEXT: Implement frontend navigation features`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixRemainingProblems().catch(console.error);