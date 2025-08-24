#!/usr/bin/env node
/**
 * Quick Add 3 High-Quality Fortune 100 Problems
 * These are real interview-style problems with diverse schemas
 */

const ProblemManager = require('../services/problemManager');
require('dotenv').config();

const highQualityProblems = [
  // Problem 1: E-commerce - Advanced User Behavior Analysis  
  {
    title: "Customer Purchase Pattern Analysis",
    slug: "customer-purchase-pattern-analysis",
    description: `**Scenario:** Amazon's recommendation engine team needs to analyze customer purchase patterns.

**Business Context:** The team wants to identify customers who made their second purchase within 30 days of their first purchase, as these are high-value customers for targeted campaigns.

**Problem:** Find customers who made their second purchase within 30 days of their first purchase. Return customer_id, first_purchase_date, second_purchase_date, and days_between.

**Expected Output:** Customers with quick repeat purchases, ordered by days_between ascending.`,
    difficulty: "medium",
    category: "Customer Analytics",
    setupSql: `
      CREATE TABLE purchase_history (
          purchase_id INT,
          customer_id INT,
          purchase_date DATE,
          product_category VARCHAR(50),
          amount DECIMAL(10,2)
      );
      
      INSERT INTO purchase_history VALUES 
      (1, 101, '2024-01-15', 'Electronics', 299.99),
      (2, 102, '2024-01-16', 'Books', 24.99),
      (3, 101, '2024-01-25', 'Electronics', 149.99),
      (4, 103, '2024-01-18', 'Clothing', 89.99),
      (5, 102, '2024-02-20', 'Books', 19.99),
      (6, 104, '2024-01-20', 'Home', 199.99),
      (7, 103, '2024-02-01', 'Clothing', 129.99),
      (8, 104, '2024-01-22', 'Kitchen', 79.99),
      (9, 105, '2024-01-25', 'Electronics', 399.99),
      (10, 105, '2024-02-15', 'Electronics', 199.99);
    `,
    solutionSql: `
      WITH customer_purchases AS (
        SELECT 
          customer_id,
          purchase_date,
          ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY purchase_date) as purchase_rank
        FROM purchase_history
      ),
      first_second_purchases AS (
        SELECT 
          customer_id,
          MAX(CASE WHEN purchase_rank = 1 THEN purchase_date END) as first_purchase_date,
          MAX(CASE WHEN purchase_rank = 2 THEN purchase_date END) as second_purchase_date
        FROM customer_purchases
        WHERE purchase_rank <= 2
        GROUP BY customer_id
        HAVING COUNT(*) >= 2
      )
      SELECT 
        customer_id,
        first_purchase_date,
        second_purchase_date,
        second_purchase_date - first_purchase_date as days_between
      FROM first_second_purchases
      WHERE second_purchase_date - first_purchase_date <= 30
      ORDER BY days_between;
    `,
    explanation: "Use CTEs with window functions to identify purchase sequences, then calculate time differences between first and second purchases.",
    tags: ["window-functions", "cte", "date-arithmetic"],
    hints: ["Use ROW_NUMBER() to rank purchases by date", "Filter for customers with 2+ purchases", "Calculate date differences"]
  },

  // Problem 2: SaaS Analytics - User Engagement Scoring
  {
    title: "SaaS User Engagement Score",
    slug: "saas-user-engagement-score", 
    description: `**Scenario:** Salesforce wants to calculate user engagement scores to identify at-risk accounts.

**Business Context:** The customer success team needs an engagement score based on login frequency, feature usage, and support ticket volume in the last 30 days.

**Problem:** Calculate engagement score for each user: (login_days * 2) + (features_used * 3) - (support_tickets * 1). Classify users as 'High' (>= 20), 'Medium' (10-19), or 'Low' (< 10) engagement.

**Expected Output:** Return user_id, login_days, features_used, support_tickets, engagement_score, and engagement_level.`,
    difficulty: "medium",
    category: "User Analytics",
    setupSql: `
      CREATE TABLE user_activity_summary (
          user_id INT,
          login_days_last_30 INT,
          unique_features_used INT,
          support_tickets_created INT,
          account_tier VARCHAR(20)
      );
      
      INSERT INTO user_activity_summary VALUES 
      (1, 28, 12, 1, 'Enterprise'),
      (2, 15, 8, 0, 'Professional'),
      (3, 5, 3, 2, 'Starter'),
      (4, 22, 15, 1, 'Enterprise'),
      (5, 8, 4, 3, 'Professional'),
      (6, 30, 18, 0, 'Enterprise'),
      (7, 12, 6, 1, 'Professional'),
      (8, 2, 2, 4, 'Starter'),
      (9, 25, 10, 2, 'Professional'),
      (10, 18, 14, 1, 'Enterprise');
    `,
    solutionSql: `
      SELECT 
        user_id,
        login_days_last_30 as login_days,
        unique_features_used as features_used,
        support_tickets_created as support_tickets,
        (login_days_last_30 * 2) + (unique_features_used * 3) - (support_tickets_created * 1) as engagement_score,
        CASE 
          WHEN (login_days_last_30 * 2) + (unique_features_used * 3) - (support_tickets_created * 1) >= 20 THEN 'High'
          WHEN (login_days_last_30 * 2) + (unique_features_used * 3) - (support_tickets_created * 1) >= 10 THEN 'Medium'
          ELSE 'Low'
        END as engagement_level
      FROM user_activity_summary
      ORDER BY engagement_score DESC;
    `,
    explanation: "Calculate engagement scores using business logic formula and classify users into engagement tiers using CASE statements.",
    tags: ["calculated-fields", "case-statements", "business-metrics"],
    hints: ["Use arithmetic operations for scoring", "Apply CASE WHEN for classification", "Order by engagement score"]
  },

  // Problem 3: Healthcare Analytics - Patient Risk Assessment
  {
    title: "Patient Risk Score Analysis",
    slug: "patient-risk-score-analysis",
    description: `**Scenario:** Kaiser Permanente's clinical team needs to identify high-risk patients for preventive care interventions.

**Business Context:** Calculate risk scores based on age, number of chronic conditions, recent hospitalizations, and missed appointments. Prioritize patients needing immediate attention.

**Problem:** Calculate risk score: (age * 0.1) + (chronic_conditions * 5) + (hospitalizations_last_year * 3) + (missed_appointments * 2). Identify patients with risk score >= 15 as 'High Risk'.

**Expected Output:** Return patient_id, patient_name, age, risk_score, and risk_category for high-risk patients only.`,
    difficulty: "easy",
    category: "Healthcare Analytics",
    setupSql: `
      CREATE TABLE patient_risk_data (
          patient_id INT,
          patient_name VARCHAR(100),
          age INT,
          chronic_conditions_count INT,
          hospitalizations_last_year INT,
          missed_appointments_count INT,
          insurance_type VARCHAR(50)
      );
      
      INSERT INTO patient_risk_data VALUES 
      (1, 'John Smith', 65, 3, 2, 1, 'Medicare'),
      (2, 'Mary Johnson', 45, 1, 0, 2, 'Private'),
      (3, 'Robert Davis', 72, 4, 1, 3, 'Medicare'),
      (4, 'Susan Wilson', 38, 0, 0, 1, 'Private'),
      (5, 'Michael Brown', 68, 2, 1, 0, 'Medicare'),
      (6, 'Linda Garcia', 55, 2, 0, 4, 'Medicaid'),
      (7, 'James Miller', 80, 5, 3, 2, 'Medicare'),
      (8, 'Patricia Martinez', 42, 1, 0, 1, 'Private');
    `,
    solutionSql: `
      SELECT 
        patient_id,
        patient_name,
        age,
        ROUND((age * 0.1) + (chronic_conditions_count * 5) + (hospitalizations_last_year * 3) + (missed_appointments_count * 2), 2) as risk_score,
        'High Risk' as risk_category
      FROM patient_risk_data
      WHERE (age * 0.1) + (chronic_conditions_count * 5) + (hospitalizations_last_year * 3) + (missed_appointments_count * 2) >= 15
      ORDER BY risk_score DESC;
    `,
    explanation: "Apply weighted scoring formula to patient data and filter for high-risk patients using calculated risk thresholds.",
    tags: ["healthcare", "risk-scoring", "filtering"],
    hints: ["Use arithmetic with decimal weights", "Filter with WHERE on calculated fields", "Round scores for readability"]
  }
];

async function addHighQualityProblems() {
  console.log('🏆 Adding 3 High-Quality Fortune 100 SQL Problems...\n');
  
  const problemManager = new ProblemManager();
  
  try {
    console.log('📊 Problem Overview:');
    console.log('• Amazon: Customer purchase pattern analysis (Medium)');
    console.log('• Salesforce: User engagement scoring (Medium)');
    console.log('• Kaiser Permanente: Patient risk assessment (Easy)');
    console.log('');
    
    // Import problems one by one for better error handling
    for (const problem of highQualityProblems) {
      console.log(`📝 Adding: ${problem.title}`);
      
      try {
        const result = await problemManager.addProblem(problem);
        console.log(`✅ Success: ${result.message}`);
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
      }
    }
    
    // Test validation
    console.log('\n🧪 Testing validation for new problems...');
    const testResults = await problemManager.validationService.testAllProblems();
    
    const newProblems = testResults.filter(r => 
      highQualityProblems.some(p => p.title === r.title)
    );
    
    const passCount = newProblems.filter(r => r.status === 'PASS').length;
    
    console.log(`📊 New Problems Validation: ${passCount}/${newProblems.length} passing`);
    
    if (passCount === newProblems.length) {
      console.log('\n🎉 SUCCESS! High-quality Fortune 100 problems ready!');
      console.log('💪 These problems cover real interview scenarios from top companies!');
    }
    
  } catch (error) {
    console.error('❌ Error adding problems:', error);
  }
}

module.exports = {
  addHighQualityProblems,
  highQualityProblems
};

// Run if called directly
if (require.main === module) {
  addHighQualityProblems()
    .then(() => {
      console.log('\n🚀 High-quality problems added successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Failed to add problems:', error);
      process.exit(1);
    });
}