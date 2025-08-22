const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixRemainingProblems() {
  console.log('🚀 FINAL FIX FOR ALL REMAINING PROBLEMS');
  console.log('=======================================');
  
  try {
    // First, get a sample category_id
    const categoryResult = await pool.query('SELECT category_id FROM problems WHERE category_id IS NOT NULL LIMIT 1');
    const sampleCategoryId = categoryResult.rows[0]?.category_id;
    
    // Add missing problems with correct UUID
    const missingProblemsData = {
      61: {
        title: 'Investment Portfolio Analysis',
        description: 'Analyze investment portfolio performance across different asset classes and risk profiles.',
        difficulty: 'medium',
        setupSql: `CREATE TABLE portfolio_holdings (
            holding_id INT PRIMARY KEY,
            asset_class VARCHAR(50),
            allocation_percent DECIMAL(5,2),
            annual_return DECIMAL(5,2),
            risk_score INT
        );
        INSERT INTO portfolio_holdings VALUES
        (1, 'Equities', 60.00, 8.5, 7),
        (2, 'Bonds', 30.00, 4.2, 3),
        (3, 'Real Estate', 10.00, 6.8, 5);`,
        solutionSql: `SELECT asset_class, allocation_percent, annual_return
FROM portfolio_holdings 
WHERE annual_return > 5.0 
ORDER BY annual_return DESC;`
      },
      80: {
        title: 'Customer Satisfaction Analysis',
        description: 'Analyze customer satisfaction scores and feedback patterns across service channels.',
        difficulty: 'medium', 
        setupSql: `CREATE TABLE customer_feedback (
            feedback_id INT PRIMARY KEY,
            service_channel VARCHAR(50),
            satisfaction_score INT,
            issue_resolved BOOLEAN
        );
        INSERT INTO customer_feedback VALUES
        (1, 'Phone Support', 8, true),
        (2, 'Live Chat', 9, true),
        (3, 'Email Support', 6, false),
        (4, 'Phone Support', 7, true),
        (5, 'Live Chat', 10, true);`,
        solutionSql: `SELECT service_channel, AVG(satisfaction_score) as avg_satisfaction
FROM customer_feedback 
GROUP BY service_channel 
HAVING AVG(satisfaction_score) > 7.0 
ORDER BY avg_satisfaction DESC;`
      }
    };
    
    // Add missing problems
    let addedCount = 0;
    for (const [problemId, problemData] of Object.entries(missingProblemsData)) {
      console.log(`\n🔨 Adding Problem #${problemId}: ${problemData.title}`);
      
      try {
        // Insert problem with proper UUID and unique slug
        const baseSlug = problemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const slug = `${baseSlug}-${problemId}`;
        const insertProblemQuery = `
          INSERT INTO problems (numeric_id, title, slug, description, difficulty, category_id, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, true)
          RETURNING id
        `;
        
        const problemResult = await pool.query(insertProblemQuery, [
          parseInt(problemId),
          problemData.title,
          slug,
          problemData.description,
          problemData.difficulty,
          sampleCategoryId
        ]);
        
        const problemDbId = problemResult.rows[0].id;
        
        // Insert schema
        const insertSchemaQuery = `
          INSERT INTO problem_schemas (problem_id, setup_sql, solution_sql, sql_dialect)
          VALUES ($1, $2, $3, 'postgresql')
        `;
        
        await pool.query(insertSchemaQuery, [
          problemDbId,
          problemData.setupSql,
          problemData.solutionSql
        ]);
        
        console.log(`✅ Problem #${problemId} added successfully`);
        addedCount++;
      } catch (error) {
        console.log(`❌ Failed to add Problem #${problemId}: ${error.message}`);
      }
    }
    
    // Fix remaining problems with no results
    const remainingProblemsData = {
      37: {
        title: "Vanguard Index Fund Performance Analytics",
        setupSql: `CREATE TABLE vanguard_funds (
            fund_id INT PRIMARY KEY,
            fund_name VARCHAR(100),
            expense_ratio DECIMAL(5,4),
            ytd_return DECIMAL(5,2),
            five_year_return DECIMAL(5,2),
            assets_under_mgmt_billions DECIMAL(8,2)
        );
        INSERT INTO vanguard_funds VALUES
        (1, 'Total Stock Market Index', 0.0003, 12.5, 8.9, 1250.5),
        (2, 'S&P 500 Index', 0.0003, 11.8, 8.7, 850.2),
        (3, 'Total Bond Market Index', 0.0005, -2.1, 2.8, 320.8),
        (4, 'International Stock Index', 0.0008, 8.9, 5.2, 180.9),
        (5, 'Emerging Markets Stock Index', 0.0014, 15.2, 4.1, 95.3);`,
        solutionSql: `SELECT fund_name, ytd_return, five_year_return
FROM vanguard_funds 
WHERE ytd_return > 10.0 
ORDER BY ytd_return DESC;`
      },
      
      38: {
        title: "State Street Global Custody Analytics",
        setupSql: `CREATE TABLE custody_assets (
            asset_id INT PRIMARY KEY,
            client_type VARCHAR(50),
            asset_value_billions DECIMAL(10,2),
            custody_fee_bps INT,
            geographic_region VARCHAR(50)
        );
        INSERT INTO custody_assets VALUES
        (1, 'Pension Fund', 125.5, 2, 'North America'),
        (2, 'Insurance Company', 89.2, 3, 'Europe'),
        (3, 'Sovereign Fund', 245.8, 1, 'Asia Pacific'),
        (4, 'Asset Manager', 67.9, 4, 'North America'),
        (5, 'Endowment', 32.1, 5, 'Europe');`,
        solutionSql: `SELECT client_type, AVG(asset_value_billions) as avg_assets
FROM custody_assets 
GROUP BY client_type 
HAVING AVG(asset_value_billions) > 50.0 
ORDER BY avg_assets DESC;`
      },
      
      50: {
        title: "JPMorgan Chase Wealth Management Client Analytics",
        setupSql: `CREATE TABLE wealth_clients (
            client_id INT PRIMARY KEY,
            wealth_tier VARCHAR(50),
            total_assets_millions DECIMAL(10,2),
            annual_fee_percentage DECIMAL(4,3),
            years_as_client INT
        );
        INSERT INTO wealth_clients VALUES
        (1, 'Private Bank', 25.5, 0.750, 8),
        (2, 'Private Bank', 45.2, 0.650, 12),
        (3, 'Private Bank', 78.9, 0.600, 15),
        (4, 'Premier Banking', 8.9, 1.250, 5),
        (5, 'Premier Banking', 12.1, 1.150, 7),
        (6, 'Select Banking', 2.5, 1.750, 3);`,
        solutionSql: `SELECT wealth_tier, AVG(total_assets_millions) as avg_assets
FROM wealth_clients 
GROUP BY wealth_tier 
HAVING AVG(total_assets_millions) > 10.0 
ORDER BY avg_assets DESC;`
      }
    };
    
    // Fix remaining problems
    let fixedRemaining = 0;
    for (const [problemId, problemData] of Object.entries(remainingProblemsData)) {
      console.log(`\n🔨 Fixing Problem #${problemId}: ${problemData.title}`);
      
      try {
        const updateQuery = `
          UPDATE problem_schemas 
          SET setup_sql = $1, solution_sql = $2
          WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $3)
        `;
        
        await pool.query(updateQuery, [
          problemData.setupSql,
          problemData.solutionSql,
          parseInt(problemId)
        ]);
        
        console.log(`✅ Problem #${problemId} fixed`);
        fixedRemaining++;
      } catch (error) {
        console.log(`❌ Failed to fix Problem #${problemId}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`✅ Added ${addedCount} missing problems`);
    console.log(`✅ Fixed ${fixedRemaining} remaining problems`);
    console.log(`\n🎉 All critical problems have been addressed!`);
    
  } catch (error) {
    console.error('❌ Final fix failed:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  fixRemainingProblems();
}

module.exports = { fixRemainingProblems };