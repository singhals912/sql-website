const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Category UUIDs
const categories = {
  'Basic Queries': 'c5ec99f8-01ff-4d36-b36e-27688566397d',
  'Aggregation': '426fcc68-b403-458f-9afd-5137f772de78',
  'Advanced Topics': 'c7e4c5a1-5b75-4117-a113-118749434557',
  'Joins': '8798fdcf-0411-45cb-83dd-b4912e133354',
  'Time Analysis': '47c2009b-81d2-458f-96b0-1a68aee370d6',
  'Window Functions': '9ba6536c-e307-41f7-8ae0-8e49f3f98d55',
  'Subqueries': 'e1b879e5-e95b-41ee-b22a-a2ea91897277'
};

// Remaining Easy Problems (need 23 more to reach 33)
const easyProblems = [
  {
    title: "Apple iPhone Sales by Quarter",
    category: "Basic Queries",
    description: "Apple's retail operations track iPhone sales performance across different quarters to optimize inventory and production planning.",
    setupSql: `CREATE TABLE apple_sales (sale_id INT, quarter VARCHAR(10), iphone_model VARCHAR(50), units_sold INT, revenue DECIMAL(15,2));
    INSERT INTO apple_sales VALUES (1, 'Q1 2024', 'iPhone 15', 12500, 999750000), (2, 'Q1 2024', 'iPhone 14', 8500, 679150000), (3, 'Q2 2024', 'iPhone 15 Pro', 15000, 1499250000);`,
    solutionSql: `SELECT quarter, SUM(units_sold) as total_units FROM apple_sales GROUP BY quarter ORDER BY total_units DESC;`
  },
  {
    title: "Amazon Prime Membership Growth",
    category: "Aggregation", 
    description: "Amazon analyzes Prime membership growth across different regions to understand market penetration and expansion opportunities.",
    setupSql: `CREATE TABLE amazon_memberships (member_id INT, region VARCHAR(30), membership_type VARCHAR(20), signup_date DATE, monthly_fee DECIMAL(6,2));
    INSERT INTO amazon_memberships VALUES (1, 'North America', 'Prime', '2024-01-15', 14.99), (2, 'Europe', 'Prime', '2024-01-20', 8.99), (3, 'Asia Pacific', 'Prime Student', '2024-02-10', 7.49);`,
    solutionSql: `SELECT region, COUNT(*) as member_count FROM amazon_memberships GROUP BY region ORDER BY member_count DESC;`
  },
  {
    title: "Google Ad Revenue by Platform",
    category: "Basic Queries",
    description: "Google's advertising division tracks revenue performance across different platforms to optimize ad placement strategies.",
    setupSql: `CREATE TABLE google_ads (ad_id INT, platform VARCHAR(30), advertiser VARCHAR(100), revenue DECIMAL(12,2), impressions BIGINT, clicks INT);
    INSERT INTO google_ads VALUES (1, 'Search', 'Nike', 125000.50, 5000000, 45000), (2, 'YouTube', 'Coca Cola', 89000.25, 8000000, 32000), (3, 'Display Network', 'Amazon', 67000.75, 3500000, 28000);`,
    solutionSql: `SELECT platform, SUM(revenue) as total_revenue FROM google_ads GROUP BY platform ORDER BY total_revenue DESC;`
  }
  // ... continuing with more easy problems
];

// Remaining Medium Problems (need 21 more to reach 33)  
const mediumProblems = [
  {
    title: "Microsoft Azure Cloud Analytics",
    category: "Window Functions",
    description: "Microsoft Azure analyzes customer usage patterns and growth trends to optimize cloud service offerings and pricing strategies.",
    setupSql: `CREATE TABLE azure_usage (customer_id INT, service_type VARCHAR(50), usage_hours DECIMAL(10,2), cost DECIMAL(10,2), usage_date DATE);
    INSERT INTO azure_usage VALUES (1, 'Virtual Machines', 720.5, 1250.75, '2024-01-01'), (2, 'Storage', 8760.0, 450.25, '2024-01-01'), (3, 'Database', 2160.0, 890.50, '2024-01-01');`,
    solutionSql: `SELECT service_type, AVG(cost) as avg_cost, ROW_NUMBER() OVER (ORDER BY AVG(cost) DESC) as cost_rank FROM azure_usage GROUP BY service_type ORDER BY avg_cost DESC;`
  }
  // ... continuing with more medium problems
];

// Remaining Hard Problems (need 25 more to reach 34)
const hardProblems = [
  {
    title: "JPMorgan Derivatives Risk Analytics",
    category: "Advanced Topics",
    description: "JPMorgan's quantitative risk team develops sophisticated models to measure and manage derivatives portfolio risk across multiple asset classes and market conditions.",
    setupSql: `CREATE TABLE jpmorgan_derivatives (instrument_id INT, derivative_type VARCHAR(50), notional_amount DECIMAL(15,2), market_value DECIMAL(15,2), delta DECIMAL(8,6), gamma DECIMAL(8,6), vega DECIMAL(8,6), theta DECIMAL(8,6));
    INSERT INTO jpmorgan_derivatives VALUES (1, 'Interest Rate Swap', 100000000.00, 1250000.00, 0.045600, 0.000125, 0.008900, -450.75), (2, 'Credit Default Swap', 50000000.00, -125000.00, -0.012500, 0.000045, 0.005600, -125.25);`,
    solutionSql: `WITH risk_metrics AS (SELECT derivative_type, AVG(ABS(delta)) as avg_delta, AVG(ABS(gamma)) as avg_gamma, SUM(ABS(market_value)) as total_exposure FROM jpmorgan_derivatives GROUP BY derivative_type) SELECT derivative_type, ROUND(avg_delta, 6) as average_delta_risk, ROUND(total_exposure/1000000, 2) as exposure_millions FROM risk_metrics ORDER BY total_exposure DESC;`
  }
  // ... continuing with more hard problems
];

async function completeToHundred() {
  console.log('🎯 COMPLETING TO 100 PROBLEMS');
  console.log('=' .repeat(50));
  
  try {
    // Get current distribution
    const currentDist = await pool.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM problems 
      WHERE is_active = true 
      GROUP BY difficulty 
      ORDER BY difficulty
    `);
    
    console.log('📊 Current Distribution:');
    let total = 0;
    const current = {};
    currentDist.rows.forEach(row => {
      const count = parseInt(row.count);
      current[row.difficulty] = count;
      total += count;
      console.log(`   ${row.difficulty.toUpperCase()}: ${count}`);
    });
    console.log(`   TOTAL: ${total}/100\n`);
    
    // Calculate what we need
    const targets = { easy: 33, medium: 33, hard: 34 };
    const needed = {
      easy: Math.max(0, targets.easy - (current.easy || 0)),
      medium: Math.max(0, targets.medium - (current.medium || 0)),
      hard: Math.max(0, targets.hard - (current.hard || 0))
    };
    
    console.log('🎯 Problems needed to reach targets:');
    console.log(`   Easy: ${needed.easy} more (to reach ${targets.easy})`);
    console.log(`   Medium: ${needed.medium} more (to reach ${targets.medium})`);
    console.log(`   Hard: ${needed.hard} more (to reach ${targets.hard})`);
    console.log(`   Total to add: ${needed.easy + needed.medium + needed.hard}\n`);
    
    // Add problems in batches
    let totalAdded = 0;
    
    // Add Easy problems
    if (needed.easy > 0) {
      console.log(`🟢 Adding ${Math.min(needed.easy, easyProblems.length)} Easy problems...`);
      for (let i = 0; i < Math.min(needed.easy, easyProblems.length); i++) {
        try {
          const problem = easyProblems[i];
          await addProblem({ ...problem, difficulty: 'easy' });
          console.log(`   ✅ Added: ${problem.title}`);
          totalAdded++;
        } catch (error) {
          console.log(`   ❌ Failed: ${easyProblems[i].title} - ${error.message}`);
        }
      }
    }
    
    // Add Medium problems  
    if (needed.medium > 0) {
      console.log(`🟡 Adding ${Math.min(needed.medium, mediumProblems.length)} Medium problems...`);
      for (let i = 0; i < Math.min(needed.medium, mediumProblems.length); i++) {
        try {
          const problem = mediumProblems[i];
          await addProblem({ ...problem, difficulty: 'medium' });
          console.log(`   ✅ Added: ${problem.title}`);
          totalAdded++;
        } catch (error) {
          console.log(`   ❌ Failed: ${mediumProblems[i].title} - ${error.message}`);
        }
      }
    }
    
    // Add Hard problems
    if (needed.hard > 0) {
      console.log(`🔴 Adding ${Math.min(needed.hard, hardProblems.length)} Hard problems...`);
      for (let i = 0; i < Math.min(needed.hard, hardProblems.length); i++) {
        try {
          const problem = hardProblems[i];
          await addProblem({ ...problem, difficulty: 'hard' });
          console.log(`   ✅ Added: ${problem.title}`);
          totalAdded++;
        } catch (error) {
          console.log(`   ❌ Failed: ${hardProblems[i].title} - ${error.message}`);
        }
      }
    }
    
    // Final count
    const finalDist = await pool.query(`
      SELECT difficulty, COUNT(*) as count 
      FROM problems 
      WHERE is_active = true 
      GROUP BY difficulty 
      ORDER BY difficulty
    `);
    
    console.log('\n🏆 FINAL DISTRIBUTION:');
    let finalTotal = 0;
    finalDist.rows.forEach(row => {
      const count = parseInt(row.count);
      const target = targets[row.difficulty];
      finalTotal += count;
      const status = count === target ? '✅' : (count < target ? '🔄' : '⚠️');
      console.log(`   ${row.difficulty.toUpperCase()}: ${count}/${target} ${status}`);
    });
    
    console.log(`   TOTAL: ${finalTotal}/100 ${finalTotal === 100 ? '🎉' : '🔄'}`);
    
    if (finalTotal === 100) {
      console.log('\n🎯🎉 MISSION ACCOMPLISHED! 🎉🎯');
      console.log('100 Fortune 100-caliber SQL problems created!');
    } else {
      console.log(`\n📊 Progress: ${finalTotal}/100 (${100 - finalTotal} remaining)`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

async function addProblem(problemData) {
  const problemId = uuidv4();
  
  // Insert problem
  await pool.query(
    `INSERT INTO problems (id, title, slug, difficulty, description, is_premium, is_active, category_id)
     VALUES ($1, $2, $3, $4, $5, false, true, $6)`,
    [
      problemId,
      problemData.title,
      problemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      problemData.difficulty,
      problemData.description,
      categories[problemData.category]
    ]
  );
  
  // Insert schema
  await pool.query(
    `INSERT INTO problem_schemas (problem_id, sql_dialect, setup_sql, solution_sql, explanation)
     VALUES ($1, 'postgresql', $2, $3, $4)`,
    [problemId, problemData.setupSql, problemData.solutionSql, `${problemData.category} analysis for ${problemData.title}`]
  );
}

if (require.main === module) {
  completeToHundred().catch(console.error);
}

module.exports = { completeToHundred };