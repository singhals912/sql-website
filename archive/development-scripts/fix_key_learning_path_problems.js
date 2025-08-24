#!/usr/bin/env node
/**
 * Fix Key Learning Path Problems
 * Manually fix critical problems used in learning paths to ensure they work properly
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'sql_practice',
  user: 'postgres',
  password: 'password'
});

async function fixKeyProblems() {
  console.log('🔧 Fixing key learning path problems...\n');
  
  try {
    // Problem #4 - AT&T Customer Service (first in SQL Fundamentals)
    console.log('✅ Fixing Problem #4 - AT&T Customer Service');
    const problem4SQL = `
      CREATE TABLE att_service_calls (
          call_id INT PRIMARY KEY,
          customer_type VARCHAR(20),
          service_category VARCHAR(30),
          call_duration_minutes INT,
          resolution_status VARCHAR(20),
          satisfaction_rating INT,
          agent_id INT,
          call_date DATE
      );
      INSERT INTO att_service_calls VALUES
      (1, 'Residential', 'Technical Support', 25, 'Resolved', 4, 101, '2024-01-15'),
      (2, 'Business', 'Billing', 15, 'Resolved', 5, 102, '2024-01-15'),
      (3, 'Enterprise', 'Network Issues', 45, 'Resolved', 3, 103, '2024-01-16'),
      (4, 'Residential', 'Technical Support', 0, 'Dropped', NULL, NULL, '2024-01-16'),
      (5, 'Business', 'Billing', 12, 'Resolved', 4, 104, '2024-01-17'),
      (6, 'Residential', 'Account Changes', 18, 'Resolved', 5, 105, '2024-01-17'),
      (7, 'Enterprise', 'Network Issues', 38, 'Resolved', 4, 106, '2024-01-18'),
      (8, 'Business', 'Technical Support', 22, 'Resolved', 3, 107, '2024-01-18'),
      (9, 'Residential', 'Billing', 8, 'Resolved', 5, 108, '2024-01-19'),
      (10, 'Enterprise', 'Account Changes', 35, 'Resolved', 4, 109, '2024-01-19'),
      (11, 'Residential', 'Technical Support', 28, 'Resolved', 4, 110, '2024-01-20'),
      (12, 'Business', 'Network Issues', 42, 'Resolved', 3, 111, '2024-01-20'),
      (13, 'Enterprise', 'Billing', 20, 'Resolved', 5, 112, '2024-01-21'),
      (14, 'Residential', 'Account Changes', 16, 'Resolved', 4, 113, '2024-01-21'),
      (15, 'Business', 'Technical Support', 31, 'Resolved', 3, 114, '2024-01-22'),
      (16, 'Enterprise', 'Network Issues', 50, 'Resolved', 4, 115, '2024-01-22'),
      (17, 'Residential', 'Billing', 10, 'Resolved', 5, 116, '2024-01-23'),
      (18, 'Business', 'Account Changes', 24, 'Resolved', 4, 117, '2024-01-23'),
      (19, 'Enterprise', 'Technical Support', 55, 'Resolved', 3, 118, '2024-01-24'),
      (20, 'Residential', 'Network Issues', 33, 'Resolved', 4, 119, '2024-01-24'),
      (21, 'Business', 'Billing', 14, 'Resolved', 5, 120, '2024-01-25'),
      (22, 'Enterprise', 'Account Changes', 40, 'Resolved', 3, 121, '2024-01-25'),
      (23, 'Residential', 'Technical Support', 27, 'Resolved', 4, 122, '2024-01-26'),
      (24, 'Business', 'Network Issues', 36, 'Resolved', 4, 123, '2024-01-26'),
      (25, 'Enterprise', 'Billing', 18, 'Resolved', 5, 124, '2024-01-27');`;

    await pool.query(`
      UPDATE problem_schemas 
      SET setup_sql = $1
      WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = 4)
      AND sql_dialect = 'postgresql'
    `, [problem4SQL]);

    // Problem #9 - American Express (first in Financial Services)
    console.log('✅ Fixing Problem #9 - American Express Credit Portfolio');
    const problem9SQL = `
      CREATE TABLE amex_credit_portfolio (
          account_id INT PRIMARY KEY,
          customer_segment VARCHAR(20),
          credit_limit DECIMAL(10,2),
          current_balance DECIMAL(10,2),
          payment_history_score INT,
          account_age_months INT,
          annual_fee DECIMAL(6,2),
          reward_points_earned INT
      );
      INSERT INTO amex_credit_portfolio VALUES
      (1, 'Premium', 50000.00, 12500.00, 850, 36, 550.00, 125000),
      (2, 'Standard', 15000.00, 3500.00, 720, 24, 0.00, 15000),
      (3, 'Business', 75000.00, 25000.00, 780, 48, 450.00, 85000),
      (4, 'Premium', 40000.00, 8000.00, 800, 30, 550.00, 95000),
      (5, 'Standard', 8000.00, 2400.00, 680, 18, 0.00, 8500),
      (6, 'Business', 100000.00, 35000.00, 820, 60, 450.00, 150000),
      (7, 'Premium', 60000.00, 15000.00, 880, 42, 550.00, 175000),
      (8, 'Standard', 12000.00, 4800.00, 740, 20, 0.00, 22000),
      (9, 'Business', 80000.00, 20000.00, 760, 36, 450.00, 95000),
      (10, 'Premium', 35000.00, 7000.00, 840, 28, 550.00, 85000),
      (11, 'Standard', 20000.00, 6000.00, 700, 30, 0.00, 28000),
      (12, 'Business', 120000.00, 45000.00, 790, 72, 450.00, 210000),
      (13, 'Premium', 45000.00, 9000.00, 860, 38, 550.00, 115000),
      (14, 'Standard', 10000.00, 3000.00, 710, 22, 0.00, 12000),
      (15, 'Business', 90000.00, 27000.00, 800, 54, 450.00, 125000),
      (16, 'Premium', 55000.00, 11000.00, 870, 40, 550.00, 145000),
      (17, 'Standard', 16000.00, 4800.00, 730, 26, 0.00, 18000),
      (18, 'Business', 110000.00, 33000.00, 810, 66, 450.00, 180000),
      (19, 'Premium', 65000.00, 13000.00, 850, 44, 550.00, 160000),
      (20, 'Standard', 14000.00, 4200.00, 720, 24, 0.00, 16000),
      (21, 'Business', 85000.00, 25500.00, 780, 48, 450.00, 115000),
      (22, 'Premium', 70000.00, 14000.00, 890, 50, 550.00, 185000),
      (23, 'Standard', 18000.00, 5400.00, 750, 32, 0.00, 24000),
      (24, 'Business', 95000.00, 28500.00, 820, 58, 450.00, 140000),
      (25, 'Premium', 48000.00, 9600.00, 830, 34, 550.00, 120000);`;

    await pool.query(`
      UPDATE problem_schemas 
      SET setup_sql = $1
      WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = 9)
      AND sql_dialect = 'postgresql'
    `, [problem9SQL]);

    // Problem #1 - A/B Test (easiest problem)
    console.log('✅ Fixing Problem #1 - A/B Test Results Analysis');
    const problem1SQL = `
      CREATE TABLE ab_test_results (
          user_id INT,
          test_group VARCHAR(20),
          converted BOOLEAN,
          signup_date DATE
      );
      INSERT INTO ab_test_results VALUES 
      (1, 'control', true, '2024-01-15'),
      (2, 'control', false, '2024-01-16'),
      (3, 'control', true, '2024-01-17'),
      (4, 'control', false, '2024-01-18'),
      (5, 'treatment', true, '2024-01-15'),
      (6, 'treatment', true, '2024-01-16'),
      (7, 'treatment', false, '2024-01-17'),
      (8, 'treatment', true, '2024-01-18'),
      (9, 'control', false, '2024-01-19'),
      (10, 'treatment', true, '2024-01-19'),
      (11, 'control', true, '2024-01-20'),
      (12, 'treatment', false, '2024-01-20'),
      (13, 'control', false, '2024-01-21'),
      (14, 'treatment', true, '2024-01-21'),
      (15, 'control', true, '2024-01-22'),
      (16, 'treatment', true, '2024-01-22'),
      (17, 'control', false, '2024-01-23'),
      (18, 'treatment', false, '2024-01-23'),
      (19, 'control', true, '2024-01-24'),
      (20, 'treatment', true, '2024-01-24'),
      (21, 'control', false, '2024-01-25'),
      (22, 'treatment', true, '2024-01-25'),
      (23, 'control', true, '2024-01-26'),
      (24, 'treatment', false, '2024-01-26'),
      (25, 'control', true, '2024-01-27');`;

    await pool.query(`
      UPDATE problem_schemas 
      SET setup_sql = $1
      WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = 1)
      AND sql_dialect = 'postgresql'
    `, [problem1SQL]);

    console.log('\n🎉 Key learning path problems fixed!');
    console.log('✅ Problem #1 - A/B Test Results Analysis');
    console.log('✅ Problem #4 - AT&T Customer Service');
    console.log('✅ Problem #9 - American Express Credit Portfolio');
    
  } catch (error) {
    console.error('💥 Failed to fix key problems:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixKeyProblems()
  .then(() => {
    console.log('\n🚀 Key problems ready for learning paths!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Key problems fix failed:', error);
    process.exit(1);
  });