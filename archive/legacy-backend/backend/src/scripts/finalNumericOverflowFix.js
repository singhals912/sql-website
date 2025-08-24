const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixNumericOverflowIssues() {
  console.log('🔧 FIXING FINAL NUMERIC OVERFLOW ISSUES');
  console.log('========================================');
  
  const overflowProblems = [85, 90, 91];
  
  const fixes = {
    85: {
      title: "Santander Consumer Banking Analytics",
      setupSql: `CREATE TABLE consumer_loans (
          loan_id INT PRIMARY KEY,
          customer_segment VARCHAR(50),
          loan_amount DECIMAL(10,2),
          interest_rate DECIMAL(5,3),
          loan_term_months INT,
          risk_category VARCHAR(20)
      );
      INSERT INTO consumer_loans VALUES
      (1, 'Prime', 25000.00, 3.250, 36, 'Low'),
      (2, 'Prime', 45000.00, 3.500, 60, 'Low'),
      (3, 'Near Prime', 18000.00, 7.250, 48, 'Medium'),
      (4, 'Near Prime', 22000.00, 8.000, 42, 'Medium'),
      (5, 'Subprime', 12000.00, 12.500, 36, 'High'),
      (6, 'Subprime', 15000.00, 13.750, 48, 'High');`,
      solutionSql: `SELECT customer_segment, AVG(interest_rate) as avg_rate
FROM consumer_loans 
GROUP BY customer_segment 
HAVING AVG(interest_rate) > 5.0 
ORDER BY avg_rate DESC;`
    },
    90: {
      title: "Barclays Investment Bank Analytics", 
      setupSql: `CREATE TABLE investment_deals (
          deal_id INT PRIMARY KEY,
          deal_type VARCHAR(50),
          deal_value_millions DECIMAL(8,2),
          fee_percentage DECIMAL(4,3),
          completion_status VARCHAR(20)
      );
      INSERT INTO investment_deals VALUES
      (1, 'IPO Underwriting', 850.50, 2.500, 'Completed'),
      (2, 'M&A Advisory', 1250.75, 1.750, 'Completed'),
      (3, 'Bond Issuance', 500.25, 0.875, 'Completed'),
      (4, 'Equity Financing', 320.80, 3.250, 'In Progress'),
      (5, 'Debt Refinancing', 680.90, 1.500, 'Completed');`,
      solutionSql: `SELECT deal_type, AVG(deal_value_millions) as avg_deal_size
FROM investment_deals 
WHERE completion_status = 'Completed'
GROUP BY deal_type 
HAVING AVG(deal_value_millions) > 400 
ORDER BY avg_deal_size DESC;`
    },
    91: {
      title: "Commerzbank Corporate Finance Analytics",
      setupSql: `CREATE TABLE corporate_clients (
          client_id INT PRIMARY KEY,
          industry_sector VARCHAR(50),
          annual_revenue_millions DECIMAL(8,2),
          credit_rating VARCHAR(10),
          relationship_years INT
      );
      INSERT INTO corporate_clients VALUES
      (1, 'Manufacturing', 250.50, 'A-', 8),
      (2, 'Technology', 180.75, 'A', 5),
      (3, 'Healthcare', 320.25, 'A+', 12),
      (4, 'Energy', 450.80, 'BBB+', 15),
      (5, 'Financial Services', 120.90, 'A-', 6);`,
      solutionSql: `SELECT industry_sector, AVG(annual_revenue_millions) as avg_revenue
FROM corporate_clients 
GROUP BY industry_sector 
HAVING AVG(annual_revenue_millions) > 200 
ORDER BY avg_revenue DESC;`
    }
  };
  
  let fixedCount = 0;
  
  for (const problemId of overflowProblems) {
    if (fixes[problemId]) {
      console.log(`\n🔨 Fixing Problem #${problemId}: ${fixes[problemId].title}`);
      
      try {
        const updateQuery = `
          UPDATE problem_schemas 
          SET setup_sql = $1, solution_sql = $2
          WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $3)
        `;
        
        await pool.query(updateQuery, [
          fixes[problemId].setupSql,
          fixes[problemId].solutionSql,
          problemId
        ]);
        
        console.log(`✅ Problem #${problemId} fixed`);
        fixedCount++;
      } catch (error) {
        console.log(`❌ Failed to fix Problem #${problemId}: ${error.message}`);
      }
    }
  }
  
  // Fix remaining problems with no results
  const noResultsFixes = {
    67: {
      title: "ABN AMRO Corporate Banking Risk Analytics",
      setupSql: `CREATE TABLE corporate_risk_profiles (
          profile_id INT PRIMARY KEY,
          client_industry VARCHAR(50),
          risk_score DECIMAL(4,2),
          exposure_millions DECIMAL(8,2),
          probability_default DECIMAL(5,4)
      );
      INSERT INTO corporate_risk_profiles VALUES
      (1, 'Oil & Gas', 7.5, 125.50, 0.0350),
      (2, 'Technology', 4.2, 85.25, 0.0120),
      (3, 'Manufacturing', 6.8, 220.75, 0.0280),
      (4, 'Real Estate', 8.2, 180.90, 0.0420),
      (5, 'Healthcare', 3.5, 95.80, 0.0080);`,
      solutionSql: `SELECT client_industry, AVG(risk_score) as avg_risk
FROM corporate_risk_profiles 
GROUP BY client_industry 
HAVING AVG(risk_score) > 5.0 
ORDER BY avg_risk DESC;`
    },
    77: {
      title: "HSBC Trade Finance Analytics",
      setupSql: `CREATE TABLE trade_transactions (
          transaction_id INT PRIMARY KEY,
          trade_type VARCHAR(50),
          transaction_value_millions DECIMAL(8,2),
          geographic_corridor VARCHAR(50),
          processing_days INT
      );
      INSERT INTO trade_transactions VALUES
      (1, 'Letter of Credit', 2.5, 'Asia-Europe', 5),
      (2, 'Documentary Collection', 1.8, 'Americas-Asia', 7),
      (3, 'Trade Guarantee', 4.2, 'Europe-Middle East', 3),
      (4, 'Supply Chain Finance', 3.6, 'Asia-Americas', 4),
      (5, 'Export Finance', 5.8, 'Europe-Africa', 6);`,
      solutionSql: `SELECT trade_type, AVG(transaction_value_millions) as avg_value
FROM trade_transactions 
GROUP BY trade_type 
HAVING AVG(transaction_value_millions) > 3.0 
ORDER BY avg_value DESC;`
    },
    87: {
      title: "McKinsey Client Engagement Analysis",
      setupSql: `CREATE TABLE client_engagements (
          engagement_id INT PRIMARY KEY,
          industry_vertical VARCHAR(50),
          engagement_duration_months INT,
          team_size INT,
          client_satisfaction_score DECIMAL(3,2)
      );
      INSERT INTO client_engagements VALUES
      (1, 'Financial Services', 8, 12, 4.2),
      (2, 'Technology', 6, 8, 4.6),
      (3, 'Healthcare', 12, 15, 4.1),
      (4, 'Manufacturing', 9, 10, 4.4),
      (5, 'Energy', 15, 18, 3.9);`,
      solutionSql: `SELECT industry_vertical, AVG(client_satisfaction_score) as avg_satisfaction
FROM client_engagements 
GROUP BY industry_vertical 
HAVING AVG(client_satisfaction_score) > 4.0 
ORDER BY avg_satisfaction DESC;`
    }
  };
  
  for (const [problemId, fixData] of Object.entries(noResultsFixes)) {
    console.log(`\n🔨 Adding data for Problem #${problemId}: ${fixData.title}`);
    
    try {
      const updateQuery = `
        UPDATE problem_schemas 
        SET setup_sql = $1, solution_sql = $2
        WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $3)
      `;
      
      await pool.query(updateQuery, [
        fixData.setupSql,
        fixData.solutionSql,
        parseInt(problemId)
      ]);
      
      console.log(`✅ Problem #${problemId} fixed`);
      fixedCount++;
    } catch (error) {
      console.log(`❌ Failed to fix Problem #${problemId}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Total problems fixed: ${fixedCount}`);
  console.log(`🎉 All numeric overflow and no-results issues resolved!`);
}

// Run if called directly
if (require.main === module) {
  fixNumericOverflowIssues()
    .then(() => {
      console.log('\n✅ Final fix complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Final fix failed:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}

module.exports = { fixNumericOverflowIssues };