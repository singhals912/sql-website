[dotenv@17.2.1] injecting env (20) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.2.1] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
Connected to PostgreSQL database
Extracting schemas from 70 problems...
Schema extraction complete!
-- ============================================
-- COMPREHENSIVE SQL PRACTICE PLATFORM SCHEMA
-- Generated: 2025-08-22T23:34:46.835Z
-- All tables required for SQL Practice Problems
-- ============================================

-- ============================================
-- Problem: A/B Test Results Analysis
-- Slug: ab-test-results-analysis
-- ============================================

      CREATE TABLE ab_test_results (
          user_id INT,
          test_group VARCHAR(20),
          converted TINYINT(1),
          signup_date DATE
      );
      INSERT INTO ab_test_results VALUES 
      (1, 'control', 1, '2024-01-15'),
      (2, 'control', 0, '2024-01-16'),
      (3, 'control', 1, '2024-01-17'),
      (4, 'control', 0, '2024-01-18'),
      (5, 'treatment', 1, '2024-01-15'),
      (6, 'treatment', 1, '2024-01-16'),
      (7, 'treatment', 0, '2024-01-17'),
      (8, 'treatment', 1, '2024-01-18'),
      (9, 'control', 0, '2024-01-19'),
      (10, 'treatment', 1, '2024-01-19'),
      (11, 'control', 1, '2024-01-20'),
      (12, 'treatment', 0, '2024-01-20'),
      (13, 'control', 0, '2024-01-21'),
      (14, 'treatment', 1, '2024-01-21'),
      (15, 'control', 1, '2024-01-22'),
      (16, 'treatment', 1, '2024-01-22'),
      (17, 'control', 0, '2024-01-23'),
      (18, 'treatment', 0, '2024-01-23'),
      (19, 'control', 1, '2024-01-24'),
      (20, 'treatment', 1, '2024-01-24'),
      (21, 'control', 0, '2024-01-25'),
      (22, 'treatment', 1, '2024-01-25'),
      (23, 'control', 1, '2024-01-26'),
      (24, 'treatment', 0, '2024-01-26'),
      (25, 'control', 1, '2024-01-27');

-- ============================================
-- Problem: ABN AMRO Corporate Banking Risk Analytics
-- Slug: abn-amro-risk-management-system
-- ============================================

      CREATE TABLE corporate_risk_profiles (
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
      (5, 'Healthcare', 3.5, 95.80, 0.0080),
      (6, 'Oil & Gas_1', 7.6, 135.50, 0.0360),
      (7, 'Technology_1', 4.3, 95.25, 0.0130),
      (8, 'Manufacturing_1', 6.9, 230.75, 0.0290),
      (9, 'Real Estate_1', 8.3, 190.90, 0.0430),
      (10, 'Healthcare_1', 3.6, 105.80, 0.0090),
      (11, 'Oil & Gas_2', 7.7, 145.50, 0.0370),
      (12, 'Technology_2', 4.4, 105.25, 0.0140),
      (13, 'Manufacturing_2', 7.0, 240.75, 0.0300),
      (14, 'Real Estate_2', 8.4, 200.90, 0.0440),
      (15, 'Healthcare_2', 3.7, 115.80, 0.0100),
      (16, 'Oil & Gas_3', 7.8, 155.50, 0.0380),
      (17, 'Technology_3', 4.5, 115.25, 0.0150),
      (18, 'Manufacturing_3', 7.1, 250.75, 0.0310),
      (19, 'Real Estate_3', 8.5, 210.90, 0.0450),
      (20, 'Healthcare_3', 3.8, 125.80, 0.0110),
      (21, 'Financial_Services', 6.2, 175.40, 0.0250),
      (22, 'Retail', 5.8, 90.15, 0.0220),
      (23, 'Telecommunications', 4.9, 155.60, 0.0180),
      (24, 'Energy', 7.9, 165.80, 0.0390),
      (25, 'Automotive', 6.5, 145.25, 0.0270);

-- ============================================
-- Problem: AIG Insurance Claims Fraud Detection
-- Slug: aig-insurance-claims-fraud-detection
-- ============================================
CREATE TABLE aig_policies (
        policy_id VARCHAR(20) PRIMARY KEY,
        policyholder_name VARCHAR(100),
        policy_type VARCHAR(30),
        annual_premium DECIMAL(10,2),
        coverage_amount DECIMAL(12,2),
        policy_start_date DATE
    );
      INSERT INTO aig_policies  VALUES
      ('POL-001', 'ABC Manufacturing', 'Commercial Property', 125000.00, 5000000.00, '2023-01-15'),
      ('POL-002', 'Smith Family Trust', 'Homeowners', 3500.00, 750000.00, '2023-03-20'),
      ('POL-003', 'Global Logistics Inc', 'Commercial Auto', 85000.00, 2500000.00, '2023-02-10'),
      ('POL-004', 'Johnson Residence', 'Homeowners', 2800.00, 650000.00, '2023-04-05'),
      ('POL-005', 'Tech Startup LLC', 'General Liability', 15000.00, 1000000.00, '2023-05-12'),
      ('POL-001_v1', 'ABC Manufacturing_v1', 'Commercial Property_v1', 125000.10, 5000000.10, '2023-01-16'),
      ('POL-002_v2', 'Smith Family Trust_v2', 'Homeowners_v2', 3500.20, 750000.20, '2023-03-22'),
      ('POL-003_v3', 'Global Logistics Inc_v3', 'Commercial Auto_v3', 85000.30, 2500000.30, '2023-02-13'),
      ('POL-004_v4', 'Johnson Residence_v4', 'Homeowners_v4', 2800.40, 650000.40, '2023-04-09'),
      ('POL-005_v5', 'Tech Startup LLC_v5', 'General Liability_v5', 15000.50, 1000000.50, '2023-05-17'),
      ('POL-001_v6', 'ABC Manufacturing_v6', 'Commercial Property_v6', 125000.60, 5000000.60, '2023-01-21'),
      ('POL-002_v7', 'Smith Family Trust_v7', 'Homeowners_v7', 3500.70, 750000.70, '2023-03-27'),
      ('POL-003_v8', 'Global Logistics Inc_v8', 'Commercial Auto_v8', 85000.80, 2500000.80, '2023-02-18'),
      ('POL-004_v9', 'Johnson Residence_v9', 'Homeowners_v9', 2800.90, 650000.90, '2023-04-14'),
      ('POL-005_v10', 'Tech Startup LLC_v10', 'General Liability_v10', 15001.00, 1000001.00, '2023-05-22'),
      ('POL-001_v11', 'ABC Manufacturing_v11', 'Commercial Property_v11', 125001.10, 5000001.10, '2023-01-26'),
      ('POL-002_v12', 'Smith Family Trust_v12', 'Homeowners_v12', 3501.20, 750001.20, '2023-04-01'),
      ('POL-003_v13', 'Global Logistics Inc_v13', 'Commercial Auto_v13', 85001.30, 2500001.30, '2023-02-23'),
      ('POL-004_v14', 'Johnson Residence_v14', 'Homeowners_v14', 2801.40, 650001.40, '2023-04-19'),
      ('POL-005_v15', 'Tech Startup LLC_v15', 'General Liability_v15', 15001.50, 1000001.50, '2023-05-27'),
      ('POL-001_v16', 'ABC Manufacturing_v16', 'Commercial Property_v16', 125001.60, 5000001.60, '2023-01-31'),
      ('POL-002_v17', 'Smith Family Trust_v17', 'Homeowners_v17', 3501.70, 750001.70, '2023-04-06'),
      ('POL-003_v18', 'Global Logistics Inc_v18', 'Commercial Auto_v18', 85001.80, 2500001.80, '2023-02-28'),
      ('POL-004_v19', 'Johnson Residence_v19', 'Homeowners_v19', 2801.90, 650001.90, '2023-04-24'),
      ('POL-005_v20', 'Tech Startup LLC_v20', 'General Liability_v20', 15002.00, 1000002.00, '2023-06-01');

-- ============================================
-- Problem: AT&T Customer Service Call Volume Analytics
-- Slug: at-t-customer-service-call-volume
-- ============================================

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
      (25, 'Enterprise', 'Billing', 18, 'Resolved', 5, 124, '2024-01-27');

-- ============================================
-- Problem: Adobe Creative Cloud Subscription Analytics
-- Slug: adobe-revenue-analysis
-- ============================================

CREATE TABLE adobe_subscriptions (
    subscription_id INT PRIMARY KEY,
    plan_name VARCHAR(50),
    monthly_revenue DECIMAL(12,2),
    subscriber_count INT,
    churn_rate DECIMAL(5,2),
    signup_date DATE
);

INSERT INTO adobe_subscriptions VALUES
(1, 'Creative Cloud Individual', 52.99, 450000, 0.05, '2024-01-15'),
(2, 'Creative Cloud Business', 79.99, 120000, 0.03, '2024-02-10'),
(3, 'Photography Plan', 19.99, 800000, 0.07, '2024-01-20'),
(4, 'Single App Plan', 22.99, 200000, 0.08, '2024-03-05'),
(5, 'Student Plan', 19.99, 300000, 0.12, '2024-02-15'),
(6, 'Creative Cloud Teams', 84.99, 85000, 0.04, '2024-01-25'),
(7, 'Creative Cloud Enterprise', 99.99, 45000, 0.02, '2024-03-01'),
(8, 'Acrobat Pro DC', 23.99, 180000, 0.06, '2024-02-20'),
(9, 'Stock Standard', 29.99, 90000, 0.09, '2024-03-10'),
(10, 'Stock Premium', 99.99, 25000, 0.05, '2024-01-30');


-- ============================================
-- Problem: Amazon Prime Video Content Performance
-- Slug: amazon-prime-membership-growth
-- ============================================
CREATE TABLE amazon_prime_subscribers (
        subscriber_id INT PRIMARY KEY,
        region VARCHAR(50),
        subscription_type VARCHAR(30),
        monthly_fee DECIMAL(6,2),
        signup_date DATE,
        content_hours_watched INT
    );
    -- Create sufficient test data for each region
    -- North America: 1.25M subscribers
    INSERT INTO amazon_prime_subscribers 
    SELECT i as subscriber_id,
           'North America' as region,
           'Prime Video' as subscription_type,
           8.99 as monthly_fee,
           CURRENT_DATE - interval '30 days' as signup_date,
           25 as content_hours_watched
    FROM generate_series(1, 1250000) i;
    
    -- Europe: 750K subscribers  
    INSERT INTO amazon_prime_subscribers 
    SELECT i as subscriber_id,
           'Europe' as region,
           'Prime Video' as subscription_type,
           5.99 as monthly_fee,
           CURRENT_DATE - interval '45 days' as signup_date,
           18 as content_hours_watched
    FROM generate_series(1250001, 2000000) i;
    
    -- Asia Pacific: 1.1M subscribers
    INSERT INTO amazon_prime_subscribers 
    SELECT i as subscriber_id,
           'Asia Pacific' as region,
           'Prime Video' as subscription_type,
           4.99 as monthly_fee,
           CURRENT_DATE - interval '60 days' as signup_date,
           32 as content_hours_watched
    FROM generate_series(2000001, 3100000) i;
    
    -- Latin America: 500K subscribers (below 1M threshold)
    INSERT INTO amazon_prime_subscribers 
    SELECT i as subscriber_id,
           'Latin America' as region,
           'Prime Video' as subscription_type,
           3.99 as monthly_fee,
           CURRENT_DATE - interval '20 days' as signup_date,
           22 as content_hours_watched
    FROM generate_series(3100001, 3600000) i;

-- ============================================
-- Problem: American Express Credit Portfolio Analytics
-- Slug: american-express-portfolio-analytics
-- ============================================

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
      (25, 'Premium', 48000.00, 9600.00, 830, 34, 550.00, 120000);

-- ============================================
-- Problem: Apple App Store Revenue Analytics
-- Slug: apple-iphone-sales-by-quarter
-- ============================================
CREATE TABLE appstore_revenue (
        app_id INT PRIMARY KEY,
        app_category VARCHAR(50),
        quarterly_revenue DECIMAL(12,2),
        download_count INT,
        quarter VARCHAR(20),
        developer_tier VARCHAR(20)
    );
      INSERT INTO appstore_revenue  VALUES
      (1, 'Games', 125000000.50, 15000000, 'Q1 2024', 'Premium'),
      (2, 'Social Media', 78000000.75, 25000000, 'Q1 2024', 'Standard'),
      (3, 'Productivity', 45000000.25, 8000000, 'Q1 2024', 'Premium'),
      (4, 'Entertainment', 92000000.80, 18000000, 'Q1 2024', 'Standard'),
      (5, 'Finance', 67000000.60, 12000000, 'Q1 2024', 'Premium'),
      (7, 'Games_v1', 125000000.60, 15000010, 'Q1 2024_v1', 'Premium_v1'),
      (9, 'Social Media_v2', 78000000.95, 25000020, 'Q1 2024_v2', 'Standard_v2'),
      (11, 'Productivity_v3', 45000000.55, 8000030, 'Q1 2024_v3', 'Premium_v3'),
      (13, 'Entertainment_v4', 92000001.20, 18000040, 'Q1 2024_v4', 'Standard_v4'),
      (15, 'Finance_v5', 67000001.10, 12000050, 'Q1 2024_v5', 'Premium_v5'),
      (12, 'Games_v6', 125000001.10, 15000060, 'Q1 2024_v6', 'Premium_v6'),
      (14, 'Social Media_v7', 78000001.45, 25000070, 'Q1 2024_v7', 'Standard_v7'),
      (16, 'Productivity_v8', 45000001.05, 8000080, 'Q1 2024_v8', 'Premium_v8'),
      (18, 'Entertainment_v9', 92000001.70, 18000090, 'Q1 2024_v9', 'Standard_v9'),
      (20, 'Finance_v10', 67000001.60, 12000100, 'Q1 2024_v10', 'Premium_v10'),
      (17, 'Games_v11', 125000001.60, 15000110, 'Q1 2024_v11', 'Premium_v11'),
      (19, 'Social Media_v12', 78000001.95, 25000120, 'Q1 2024_v12', 'Standard_v12'),
      (21, 'Productivity_v13', 45000001.55, 8000130, 'Q1 2024_v13', 'Premium_v13'),
      (23, 'Entertainment_v14', 92000002.20, 18000140, 'Q1 2024_v14', 'Standard_v14'),
      (25, 'Finance_v15', 67000002.10, 12000150, 'Q1 2024_v15', 'Premium_v15'),
      (22, 'Games_v16', 125000002.10, 15000160, 'Q1 2024_v16', 'Premium_v16'),
      (24, 'Social Media_v17', 78000002.45, 25000170, 'Q1 2024_v17', 'Standard_v17'),
      (26, 'Productivity_v18', 45000002.05, 8000180, 'Q1 2024_v18', 'Premium_v18'),
      (28, 'Entertainment_v19', 92000002.70, 18000190, 'Q1 2024_v19', 'Standard_v19'),
      (30, 'Finance_v20', 67000002.60, 12000200, 'Q1 2024_v20', 'Premium_v20');

-- ============================================
-- Problem: BBVA Digital Banking Transformation Analytics
-- Slug: bbva-risk-management-system
-- ============================================
CREATE TABLE bbva_digital_banking (
        market_id INT PRIMARY KEY,
        geographic_market VARCHAR(50),
        total_customers INT,
        digital_active_customers INT,
        mobile_transactions_monthly BIGINT,
        total_transactions_monthly BIGINT,
        customer_lifetime_value DECIMAL(10,2),
        digital_revenue DECIMAL(12,2),
        customer_acquisition_cost DECIMAL(8,2),
        nps_score INT,
        market_date DATE
    );
      INSERT INTO bbva_digital_banking  VALUES
      (1, 'Spain', 12000000, 9600000, 450000000, 650000000, 5800.50, 2500000000.50, 125.50, 72, '2024-01-15'),
      (2, 'Mexico', 18000000, 14400000, 580000000, 750000000, 4200.75, 3200000000.75, 89.75, 68, '2024-01-15'),
      (3, 'Argentina', 8500000, 6375000, 220000000, 320000000, 3500.25, 1250000000.25, 95.25, 65, '2024-01-16'),
      (4, 'Colombia', 6200000, 4960000, 180000000, 280000000, 3800.80, 950000000.80, 85.80, 70, '2024-01-16'),
      (5, 'Turkey', 9800000, 7840000, 290000000, 420000000, 5200.60, 1800000000.60, 110.60, 69, '2024-01-17'),
      (7, 'Spain_v1', 12000010, 9600010, 450000010, 650000010, 5800.60, 2500000000.60, 125.60, 82, '2024-01-16'),
      (9, 'Mexico_v2', 18000020, 14400020, 580000020, 750000020, 4200.95, 3200000000.95, 89.95, 88, '2024-01-17'),
      (11, 'Argentina_v3', 8500030, 6375030, 220000030, 320000030, 3500.55, 1250000000.55, 95.55, 95, '2024-01-19'),
      (13, 'Colombia_v4', 6200040, 4960040, 180000040, 280000040, 3801.20, 950000001.20, 86.20, 110, '2024-01-20'),
      (15, 'Turkey_v5', 9800050, 7840050, 290000050, 420000050, 5201.10, 1800000001.10, 111.10, 119, '2024-01-22'),
      (12, 'Spain_v6', 12000060, 9600060, 450000060, 650000060, 5801.10, 2500000001.10, 126.10, 132, '2024-01-21'),
      (14, 'Mexico_v7', 18000070, 14400070, 580000070, 750000070, 4201.45, 3200000001.45, 90.45, 138, '2024-01-22'),
      (16, 'Argentina_v8', 8500080, 6375080, 220000080, 320000080, 3501.05, 1250000001.05, 96.05, 145, '2024-01-24'),
      (18, 'Colombia_v9', 6200090, 4960090, 180000090, 280000090, 3801.70, 950000001.70, 86.70, 160, '2024-01-25'),
      (20, 'Turkey_v10', 9800100, 7840100, 290000100, 420000100, 5201.60, 1800000001.60, 111.60, 169, '2024-01-27'),
      (17, 'Spain_v11', 12000110, 9600110, 450000110, 650000110, 5801.60, 2500000001.60, 126.60, 182, '2024-01-26'),
      (19, 'Mexico_v12', 18000120, 14400120, 580000120, 750000120, 4201.95, 3200000001.95, 90.95, 188, '2024-01-27'),
      (21, 'Argentina_v13', 8500130, 6375130, 220000130, 320000130, 3501.55, 1250000001.55, 96.55, 195, '2024-01-29'),
      (23, 'Colombia_v14', 6200140, 4960140, 180000140, 280000140, 3802.20, 950000002.20, 87.20, 210, '2024-01-30'),
      (25, 'Turkey_v15', 9800150, 7840150, 290000150, 420000150, 5202.10, 1800000002.10, 112.10, 219, '2024-02-01'),
      (22, 'Spain_v16', 12000160, 9600160, 450000160, 650000160, 5802.10, 2500000002.10, 127.10, 232, '2024-01-31'),
      (24, 'Mexico_v17', 18000170, 14400170, 580000170, 750000170, 4202.45, 3200000002.45, 91.45, 238, '2024-02-01'),
      (26, 'Argentina_v18', 8500180, 6375180, 220000180, 320000180, 3502.05, 1250000002.05, 97.05, 245, '2024-02-03'),
      (28, 'Colombia_v19', 6200190, 4960190, 180000190, 280000190, 3802.70, 950000002.70, 87.70, 260, '2024-02-04'),
      (30, 'Turkey_v20', 9800200, 7840200, 290000200, 420000200, 5202.60, 1800000002.60, 112.60, 269, '2024-02-06');

-- ============================================
-- Problem: BNP Paribas Investment Banking Analytics
-- Slug: bnp-paribas-risk-management-system
-- ============================================
CREATE TABLE bnpparibas_investment_banking (
        deal_id INT PRIMARY KEY,
        service_line VARCHAR(50),
        geographic_region VARCHAR(30),
        deal_value DECIMAL(15,2),
        advisory_fees DECIMAL(12,2),
        deal_status VARCHAR(20),
        completion_probability DECIMAL(5,3),
        client_relationship_years INT,
        competitive_position INT,
        sector_expertise_score DECIMAL(4,2),
        deal_date DATE
    );
      INSERT INTO bnpparibas_investment_banking  VALUES
      (1, 'M&A Advisory', 'Europe', 2800000000.00, 145600000.50, 'Completed', 0.920, 12, 2, 9.5, '2024-01-15'),
      (2, 'Equity Capital Markets', 'Asia Pacific', 1650000000.00, 82500000.75, 'Completed', 0.885, 8, 3, 8.8, '2024-01-15'),
      (3, 'Debt Capital Markets', 'North America', 3200000000.00, 128000000.25, 'Completed', 0.945, 15, 1, 9.2, '2024-01-16'),
      (4, 'Leveraged Finance', 'Europe', 950000000.00, 47500000.80, 'In Progress', 0.825, 6, 4, 8.5, '2024-01-16'),
      (5, 'Restructuring', 'Latin America', 750000000.00, 52500000.60, 'Completed', 0.875, 9, 2, 9.1, '2024-01-17'),
      (7, 'M&A Advisory_v1', 'Europe_v1', 2800000000.10, 145600000.60, 'Completed_v1', 1.02, 22, 12, 9.60, '2024-01-16'),
      (9, 'Equity Capital Markets_v2', 'Asia Pacific_v2', 1650000000.20, 82500000.95, 'Completed_v2', 1.08, 28, 23, 9.00, '2024-01-17'),
      (11, 'Debt Capital Markets_v3', 'North America_v3', 3200000000.30, 128000000.55, 'Completed_v3', 1.25, 45, 31, 9.50, '2024-01-19'),
      (13, 'Leveraged Finance_v4', 'Europe_v4', 950000000.40, 47500001.20, 'In Progress_v4', 1.23, 46, 44, 8.90, '2024-01-20'),
      (15, 'Restructuring_v5', 'Latin America_v5', 750000000.50, 52500001.10, 'Completed_v5', 1.38, 59, 52, 9.60, '2024-01-22'),
      (12, 'M&A Advisory_v6', 'Europe_v6', 2800000000.60, 145600001.10, 'Completed_v6', 1.52, 72, 62, 10.10, '2024-01-21'),
      (14, 'Equity Capital Markets_v7', 'Asia Pacific_v7', 1650000000.70, 82500001.45, 'Completed_v7', 1.58, 78, 73, 9.50, '2024-01-22'),
      (16, 'Debt Capital Markets_v8', 'North America_v8', 3200000000.80, 128000001.05, 'Completed_v8', 1.75, 95, 81, 10.00, '2024-01-24'),
      (18, 'Leveraged Finance_v9', 'Europe_v9', 950000000.90, 47500001.70, 'In Progress_v9', 1.73, 96, 94, 9.40, '2024-01-25'),
      (20, 'Restructuring_v10', 'Latin America_v10', 750000001.00, 52500001.60, 'Completed_v10', 1.88, 109, 102, 10.10, '2024-01-27'),
      (17, 'M&A Advisory_v11', 'Europe_v11', 2800000001.10, 145600001.60, 'Completed_v11', 2.02, 122, 112, 10.60, '2024-01-26'),
      (19, 'Equity Capital Markets_v12', 'Asia Pacific_v12', 1650000001.20, 82500001.95, 'Completed_v12', 2.08, 128, 123, 10.00, '2024-01-27'),
      (21, 'Debt Capital Markets_v13', 'North America_v13', 3200000001.30, 128000001.55, 'Completed_v13', 2.25, 145, 131, 10.50, '2024-01-29'),
      (23, 'Leveraged Finance_v14', 'Europe_v14', 950000001.40, 47500002.20, 'In Progress_v14', 2.23, 146, 144, 9.90, '2024-01-30'),
      (25, 'Restructuring_v15', 'Latin America_v15', 750000001.50, 52500002.10, 'Completed_v15', 2.38, 159, 152, 10.60, '2024-02-01'),
      (22, 'M&A Advisory_v16', 'Europe_v16', 2800000001.60, 145600002.10, 'Completed_v16', 2.52, 172, 162, 11.10, '2024-01-31'),
      (24, 'Equity Capital Markets_v17', 'Asia Pacific_v17', 1650000001.70, 82500002.45, 'Completed_v17', 2.58, 178, 173, 10.50, '2024-02-01'),
      (26, 'Debt Capital Markets_v18', 'North America_v18', 3200000001.80, 128000002.05, 'Completed_v18', 2.75, 195, 181, 11.00, '2024-02-03'),
      (28, 'Leveraged Finance_v19', 'Europe_v19', 950000001.90, 47500002.70, 'In Progress_v19', 2.73, 196, 194, 10.40, '2024-02-04'),
      (30, 'Restructuring_v20', 'Latin America_v20', 750000002.00, 52500002.60, 'Completed_v20', 2.88, 209, 202, 11.10, '2024-02-06');

-- ============================================
-- Problem: BlackRock Alternative Investment Analytics
-- Slug: blackrock-portfolio-analytics
-- ============================================
CREATE TABLE blackrock_alternatives (
        strategy_id INT PRIMARY KEY,
        strategy_name VARCHAR(50),
        asset_class VARCHAR(30),
        annual_return DECIMAL(8,4),
        volatility DECIMAL(8,4),
        sharpe_ratio DECIMAL(6,4),
        assets_under_management DECIMAL(15,2),
        benchmark_return DECIMAL(8,4),
        strategy_date DATE
    );
      INSERT INTO blackrock_alternatives  VALUES
      (1, 'Global Infrastructure', 'Real Estate', 0.1450, 0.1200, 1.2083, 45000000000.50, 0.0885, '2024-01-15'),
      (2, 'Private Credit Fund', 'Credit', 0.1350, 0.0950, 1.4211, 32000000000.75, 0.0750, '2024-01-15'),
      (3, 'Energy Transition Fund', 'Private Equity', 0.1680, 0.1850, 0.9081, 28000000000.25, 0.1125, '2024-01-16'),
      (4, 'Multi-Strategy Hedge', 'Hedge Fund', 0.1250, 0.0850, 1.4706, 18000000000.80, 0.0680, '2024-01-16'),
      (5, 'Asia Pacific RE', 'Real Estate', 0.1150, 0.1450, 0.7931, 22000000000.60, 0.0920, '2024-01-17'),
      (7, 'Global Infrastructure_v1', 'Real Estate_v1', 0.24, 0.22, 1.31, 45000000000.60, 0.19, '2024-01-16'),
      (9, 'Private Credit Fund_v2', 'Credit_v2', 0.34, 0.30, 1.62, 32000000000.95, 0.28, '2024-01-17'),
      (11, 'Energy Transition Fund_v3', 'Private Equity_v3', 0.47, 0.49, 1.21, 28000000000.55, 0.41, '2024-01-19'),
      (13, 'Multi-Strategy Hedge_v4', 'Hedge Fund_v4', 0.53, 0.49, 1.87, 18000000001.20, 0.47, '2024-01-20'),
      (15, 'Asia Pacific RE_v5', 'Real Estate_v5', 0.61, 0.65, 1.29, 22000000001.10, 0.59, '2024-01-22'),
      (12, 'Global Infrastructure_v6', 'Real Estate_v6', 0.75, 0.72, 1.81, 45000000001.10, 0.69, '2024-01-21'),
      (14, 'Private Credit Fund_v7', 'Credit_v7', 0.84, 0.80, 2.12, 32000000001.45, 0.78, '2024-01-22'),
      (16, 'Energy Transition Fund_v8', 'Private Equity_v8', 0.97, 0.99, 1.71, 28000000001.05, 0.91, '2024-01-24'),
      (18, 'Multi-Strategy Hedge_v9', 'Hedge Fund_v9', 1.02, 0.98, 2.37, 18000000001.70, 0.97, '2024-01-25'),
      (20, 'Asia Pacific RE_v10', 'Real Estate_v10', 1.11, 1.15, 1.79, 22000000001.60, 1.09, '2024-01-27'),
      (17, 'Global Infrastructure_v11', 'Real Estate_v11', 1.25, 1.22, 2.31, 45000000001.60, 1.19, '2024-01-26'),
      (19, 'Private Credit Fund_v12', 'Credit_v12', 1.34, 1.30, 2.62, 32000000001.95, 1.28, '2024-01-27'),
      (21, 'Energy Transition Fund_v13', 'Private Equity_v13', 1.47, 1.49, 2.21, 28000000001.55, 1.41, '2024-01-29'),
      (23, 'Multi-Strategy Hedge_v14', 'Hedge Fund_v14', 1.53, 1.49, 2.87, 18000000002.20, 1.47, '2024-01-30'),
      (25, 'Asia Pacific RE_v15', 'Real Estate_v15', 1.61, 1.65, 2.29, 22000000002.10, 1.59, '2024-02-01'),
      (22, 'Global Infrastructure_v16', 'Real Estate_v16', 1.75, 1.72, 2.81, 45000000002.10, 1.69, '2024-01-31'),
      (24, 'Private Credit Fund_v17', 'Credit_v17', 1.84, 1.80, 3.12, 32000000002.45, 1.78, '2024-02-01'),
      (26, 'Energy Transition Fund_v18', 'Private Equity_v18', 1.97, 1.99, 2.71, 28000000002.05, 1.91, '2024-02-03'),
      (28, 'Multi-Strategy Hedge_v19', 'Hedge Fund_v19', 2.03, 1.99, 3.37, 18000000002.70, 1.97, '2024-02-04'),
      (30, 'Asia Pacific RE_v20', 'Real Estate_v20', 2.12, 2.15, 2.79, 22000000002.60, 2.09, '2024-02-06');

-- ============================================
-- Problem: Charles Schwab Wealth Management Analytics
-- Slug: charles-schwab-portfolio-analytics
-- ============================================
CREATE TABLE schwab_wealth_management (
        client_id INT PRIMARY KEY,
        wealth_tier VARCHAR(30),
        portfolio_value DECIMAL(12,2),
        annual_return DECIMAL(8,4),
        portfolio_volatility DECIMAL(8,4),
        advisory_fees DECIMAL(8,2),
        tax_efficiency DECIMAL(6,4),
        client_date DATE
    );
      INSERT INTO schwab_wealth_management  VALUES
      (1, 'Ultra High Net Worth', 25000000.50, 0.1250, 0.1650, 250000.50, 0.8500, '2024-01-15'),
      (2, 'High Net Worth', 8500000.75, 0.1150, 0.1750, 85000.75, 0.8200, '2024-01-15'),
      (3, 'Affluent', 3200000.25, 0.1050, 0.1550, 32000.25, 0.7900, '2024-01-16'),
      (4, 'Mass Affluent', 1500000.80, 0.0950, 0.1850, 15000.80, 0.7600, '2024-01-16'),
      (5, 'Emerging Wealth', 750000.60, 0.0850, 0.1950, 7500.60, 0.7200, '2024-01-17'),
      (7, 'Ultra High Net Worth_v1', 25000000.60, 0.23, 0.27, 250000.60, 0.95, '2024-01-16'),
      (9, 'High Net Worth_v2', 8500000.95, 0.32, 0.38, 85000.95, 1.02, '2024-01-17'),
      (11, 'Affluent_v3', 3200000.55, 0.41, 0.46, 32000.55, 1.09, '2024-01-19'),
      (13, 'Mass Affluent_v4', 1500001.20, 0.49, 0.58, 15001.20, 1.16, '2024-01-20'),
      (15, 'Emerging Wealth_v5', 750001.10, 0.58, 0.70, 7501.10, 1.22, '2024-01-22'),
      (12, 'Ultra High Net Worth_v6', 25000001.10, 0.73, 0.77, 250001.10, 1.45, '2024-01-21'),
      (14, 'High Net Worth_v7', 8500001.45, 0.82, 0.88, 85001.45, 1.52, '2024-01-22'),
      (16, 'Affluent_v8', 3200001.05, 0.91, 0.96, 32001.05, 1.59, '2024-01-24'),
      (18, 'Mass Affluent_v9', 1500001.70, 0.99, 1.08, 15001.70, 1.66, '2024-01-25'),
      (20, 'Emerging Wealth_v10', 750001.60, 1.08, 1.20, 7501.60, 1.72, '2024-01-27'),
      (17, 'Ultra High Net Worth_v11', 25000001.60, 1.23, 1.27, 250001.60, 1.95, '2024-01-26'),
      (19, 'High Net Worth_v12', 8500001.95, 1.32, 1.38, 85001.95, 2.02, '2024-01-27'),
      (21, 'Affluent_v13', 3200001.55, 1.41, 1.46, 32001.55, 2.09, '2024-01-29'),
      (23, 'Mass Affluent_v14', 1500002.20, 1.50, 1.59, 15002.20, 2.16, '2024-01-30'),
      (25, 'Emerging Wealth_v15', 750002.10, 1.58, 1.70, 7502.10, 2.22, '2024-02-01'),
      (22, 'Ultra High Net Worth_v16', 25000002.10, 1.73, 1.77, 250002.10, 2.45, '2024-01-31'),
      (24, 'High Net Worth_v17', 8500002.45, 1.82, 1.88, 85002.45, 2.52, '2024-02-01'),
      (26, 'Affluent_v18', 3200002.05, 1.91, 1.96, 32002.05, 2.59, '2024-02-03'),
      (28, 'Mass Affluent_v19', 1500002.70, 2.00, 2.08, 15002.70, 2.66, '2024-02-04'),
      (30, 'Emerging Wealth_v20', 750002.60, 2.08, 2.19, 7502.60, 2.72, '2024-02-06');

-- ============================================
-- Problem: Citadel Hedge Fund Risk Parity Analysis
-- Slug: citadel-hedge-fund-risk-parity-analysis
-- ============================================
CREATE TABLE citadel_positions (
        position_id INT PRIMARY KEY,
        asset_name VARCHAR(100),
        asset_class VARCHAR(30),
        geographic_region VARCHAR(30),
        current_weight DECIMAL(8,4),
        expected_return DECIMAL(8,4),
        volatility DECIMAL(8,4),
        beta_to_portfolio DECIMAL(6,4)
    );
      INSERT INTO citadel_positions  VALUES
      (1, 'S&P 500 Futures', 'Equities', 'North America', 0.2500, 0.0850, 0.1820, 1.0000),
      (2, 'FTSE 100 Futures', 'Equities', 'Europe', 0.1500, 0.0720, 0.1950, 0.8500),
      (3, '10Y Treasury Futures', 'Fixed Income', 'North America', 0.3000, 0.0320, 0.0850, -0.2500),
      (4, 'German Bund Futures', 'Fixed Income', 'Europe', 0.1200, 0.0280, 0.0920, -0.1800),
      (5, 'Gold Futures', 'Commodities', 'Global', 0.0800, 0.0450, 0.2200, 0.1200),
      (6, 'EUR/USD Currency', 'Currencies', 'Global', 0.0500, 0.0150, 0.1100, 0.0800),
      (7, 'Emerging Markets ETF', 'Equities', 'Asia Pacific', 0.0500, 0.0920, 0.2800, 1.2500),
      (9, 'S&P 500 Futures_v1', 'Equities_v1', 'North America_v1', 0.35, 0.18, 0.28, 1.10),
      (11, 'FTSE 100 Futures_v2', 'Equities_v2', 'Europe_v2', 0.35, 0.27, 0.40, 1.05),
      (13, '10Y Treasury Futures_v3', 'Fixed Income_v3', 'North America_v3', 0.60, 0.33, 0.39, 0.05),
      (15, 'German Bund Futures_v4', 'Fixed Income_v4', 'Europe_v4', 0.52, 0.43, 0.49, 0.22),
      (17, 'Gold Futures_v5', 'Commodities_v5', 'Global_v5', 0.58, 0.55, 0.72, 0.62),
      (19, 'EUR/USD Currency_v6', 'Currencies_v6', 'Global_v6', 0.65, 0.62, 0.71, 0.68),
      (21, 'Emerging Markets ETF_v7', 'Equities_v7', 'Asia Pacific_v7', 0.75, 0.79, 0.98, 1.95),
      (16, 'S&P 500 Futures_v8', 'Equities_v8', 'North America_v8', 1.05, 0.89, 0.98, 1.80),
      (18, 'FTSE 100 Futures_v9', 'Equities_v9', 'Europe_v9', 1.05, 0.97, 1.09, 1.75),
      (20, '10Y Treasury Futures_v10', 'Fixed Income_v10', 'North America_v10', 1.30, 1.03, 1.08, 0.75),
      (22, 'German Bund Futures_v11', 'Fixed Income_v11', 'Europe_v11', 1.22, 1.13, 1.19, 0.92),
      (24, 'Gold Futures_v12', 'Commodities_v12', 'Global_v12', 1.28, 1.25, 1.42, 1.32),
      (26, 'EUR/USD Currency_v13', 'Currencies_v13', 'Global_v13', 1.35, 1.31, 1.41, 1.38),
      (28, 'Emerging Markets ETF_v14', 'Equities_v14', 'Asia Pacific_v14', 1.45, 1.49, 1.68, 2.65),
      (23, 'S&P 500 Futures_v15', 'Equities_v15', 'North America_v15', 1.75, 1.58, 1.68, 2.50),
      (25, 'FTSE 100 Futures_v16', 'Equities_v16', 'Europe_v16', 1.75, 1.67, 1.80, 2.45),
      (27, '10Y Treasury Futures_v17', 'Fixed Income_v17', 'North America_v17', 2.00, 1.73, 1.79, 1.45),
      (29, 'German Bund Futures_v18', 'Fixed Income_v18', 'Europe_v18', 1.92, 1.83, 1.89, 1.62);

-- ============================================
-- Problem: Citigroup Global Investment Banking Analytics
-- Slug: citigroup-portfolio-analytics
-- ============================================
CREATE TABLE citigroup_investment_banking (
        transaction_id INT PRIMARY KEY,
        service_line VARCHAR(50),
        transaction_value DECIMAL(15,2),
        advisory_fees DECIMAL(12,2),
        deal_type VARCHAR(40),
        client_tier VARCHAR(20),
        geographic_region VARCHAR(30),
        completion_status VARCHAR(20),
        transaction_date DATE
    );
      INSERT INTO citigroup_investment_banking  VALUES
      (1, 'M&A Advisory', 2500000000.00, 62500000.50, 'Cross-border M&A', 'Fortune 500', 'North America', 'Completed', '2024-01-15'),
      (2, 'Debt Capital Markets', 1200000000.00, 36000000.75, 'Investment Grade Bond', 'Large Cap', 'Europe', 'Completed', '2024-01-15'),
      (3, 'Equity Capital Markets', 800000000.00, 24000000.25, 'IPO Underwriting', 'Mid Cap', 'Asia Pacific', 'Completed', '2024-01-16'),
      (4, 'Leveraged Finance', 1500000000.00, 52500000.80, 'LBO Financing', 'Private Equity', 'North America', 'Completed', '2024-01-16'),
      (5, 'Restructuring', 600000000.00, 18000000.60, 'Debt Restructuring', 'Distressed', 'Europe', 'Completed', '2024-01-17'),
      (7, 'M&A Advisory_v1', 2500000000.10, 62500000.60, 'Cross-border M&A_v1', 'Fortune 500_v1', 'North America_v1', 'Completed_v1', '2024-01-16'),
      (9, 'Debt Capital Markets_v2', 1200000000.20, 36000000.95, 'Investment Grade Bond_v2', 'Large Cap_v2', 'Europe_v2', 'Completed_v2', '2024-01-17'),
      (11, 'Equity Capital Markets_v3', 800000000.30, 24000000.55, 'IPO Underwriting_v3', 'Mid Cap_v3', 'Asia Pacific_v3', 'Completed_v3', '2024-01-19'),
      (13, 'Leveraged Finance_v4', 1500000000.40, 52500001.20, 'LBO Financing_v4', 'Private Equity_v4', 'North America_v4', 'Completed_v4', '2024-01-20'),
      (15, 'Restructuring_v5', 600000000.50, 18000001.10, 'Debt Restructuring_v5', 'Distressed_v5', 'Europe_v5', 'Completed_v5', '2024-01-22'),
      (12, 'M&A Advisory_v6', 2500000000.60, 62500001.10, 'Cross-border M&A_v6', 'Fortune 500_v6', 'North America_v6', 'Completed_v6', '2024-01-21'),
      (14, 'Debt Capital Markets_v7', 1200000000.70, 36000001.45, 'Investment Grade Bond_v7', 'Large Cap_v7', 'Europe_v7', 'Completed_v7', '2024-01-22'),
      (16, 'Equity Capital Markets_v8', 800000000.80, 24000001.05, 'IPO Underwriting_v8', 'Mid Cap_v8', 'Asia Pacific_v8', 'Completed_v8', '2024-01-24'),
      (18, 'Leveraged Finance_v9', 1500000000.90, 52500001.70, 'LBO Financing_v9', 'Private Equity_v9', 'North America_v9', 'Completed_v9', '2024-01-25'),
      (20, 'Restructuring_v10', 600000001.00, 18000001.60, 'Debt Restructuring_v10', 'Distressed_v10', 'Europe_v10', 'Completed_v10', '2024-01-27'),
      (17, 'M&A Advisory_v11', 2500000001.10, 62500001.60, 'Cross-border M&A_v11', 'Fortune 500_v11', 'North America_v11', 'Completed_v11', '2024-01-26'),
      (19, 'Debt Capital Markets_v12', 1200000001.20, 36000001.95, 'Investment Grade Bond_v12', 'Large Cap_v12', 'Europe_v12', 'Completed_v12', '2024-01-27'),
      (21, 'Equity Capital Markets_v13', 800000001.30, 24000001.55, 'IPO Underwriting_v13', 'Mid Cap_v13', 'Asia Pacific_v13', 'Completed_v13', '2024-01-29'),
      (23, 'Leveraged Finance_v14', 1500000001.40, 52500002.20, 'LBO Financing_v14', 'Private Equity_v14', 'North America_v14', 'Completed_v14', '2024-01-30'),
      (25, 'Restructuring_v15', 600000001.50, 18000002.10, 'Debt Restructuring_v15', 'Distressed_v15', 'Europe_v15', 'Completed_v15', '2024-02-01'),
      (22, 'M&A Advisory_v16', 2500000001.60, 62500002.10, 'Cross-border M&A_v16', 'Fortune 500_v16', 'North America_v16', 'Completed_v16', '2024-01-31'),
      (24, 'Debt Capital Markets_v17', 1200000001.70, 36000002.45, 'Investment Grade Bond_v17', 'Large Cap_v17', 'Europe_v17', 'Completed_v17', '2024-02-01'),
      (26, 'Equity Capital Markets_v18', 800000001.80, 24000002.05, 'IPO Underwriting_v18', 'Mid Cap_v18', 'Asia Pacific_v18', 'Completed_v18', '2024-02-03'),
      (28, 'Leveraged Finance_v19', 1500000001.90, 52500002.70, 'LBO Financing_v19', 'Private Equity_v19', 'North America_v19', 'Completed_v19', '2024-02-04'),
      (30, 'Restructuring_v20', 600000002.00, 18000002.60, 'Debt Restructuring_v20', 'Distressed_v20', 'Europe_v20', 'Completed_v20', '2024-02-06');

-- ============================================
-- Problem: Costco Wholesale Membership Analytics
-- Slug: costco-revenue-analysis
-- ============================================
CREATE TABLE costco_memberships (
        member_id INT PRIMARY KEY,
        membership_type VARCHAR(30),
        annual_spending DECIMAL(10,2),
        membership_fee DECIMAL(6,2),
        renewal_status VARCHAR(20),
        member_since_date DATE
    );
      INSERT INTO costco_memberships  VALUES
      (1, 'Executive', 4500.75, 120.00, 'Active', '2022-01-15'),
      (2, 'Gold Star', 1850.25, 60.00, 'Active', '2023-03-20'),
      (3, 'Business', 6200.50, 60.00, 'Active', '2021-06-10'),
      (4, 'Executive', 5100.80, 120.00, 'Renewed', '2022-08-05'),
      (5, 'Gold Star', 2200.40, 60.00, 'Active', '2023-01-12'),
      (7, 'Executive_v1', 4500.85, 120.10, 'Active_v1', '2022-01-16'),
      (9, 'Gold Star_v2', 1850.45, 60.20, 'Active_v2', '2023-03-22'),
      (11, 'Business_v3', 6200.80, 60.30, 'Active_v3', '2021-06-13'),
      (13, 'Executive_v4', 5101.20, 120.40, 'Renewed_v4', '2022-08-09'),
      (15, 'Gold Star_v5', 2200.90, 60.50, 'Active_v5', '2023-01-17'),
      (12, 'Executive_v6', 4501.35, 120.60, 'Active_v6', '2022-01-21'),
      (14, 'Gold Star_v7', 1850.95, 60.70, 'Active_v7', '2023-03-27'),
      (16, 'Business_v8', 6201.30, 60.80, 'Active_v8', '2021-06-18'),
      (18, 'Executive_v9', 5101.70, 120.90, 'Renewed_v9', '2022-08-14'),
      (20, 'Gold Star_v10', 2201.40, 61.00, 'Active_v10', '2023-01-22'),
      (17, 'Executive_v11', 4501.85, 121.10, 'Active_v11', '2022-01-26'),
      (19, 'Gold Star_v12', 1851.45, 61.20, 'Active_v12', '2023-04-01'),
      (21, 'Business_v13', 6201.80, 61.30, 'Active_v13', '2021-06-23'),
      (23, 'Executive_v14', 5102.20, 121.40, 'Renewed_v14', '2022-08-19'),
      (25, 'Gold Star_v15', 2201.90, 61.50, 'Active_v15', '2023-01-27'),
      (22, 'Executive_v16', 4502.35, 121.60, 'Active_v16', '2022-01-31'),
      (24, 'Gold Star_v17', 1851.95, 61.70, 'Active_v17', '2023-04-06'),
      (26, 'Business_v18', 6202.30, 61.80, 'Active_v18', '2021-06-28'),
      (28, 'Executive_v19', 5102.70, 121.90, 'Renewed_v19', '2022-08-24'),
      (30, 'Gold Star_v20', 2202.40, 62.00, 'Active_v20', '2023-02-01');

-- ============================================
-- Problem: Credit Suisse Investment Banking M&A
-- Slug: ing-group-risk-management-system
-- ============================================
CREATE TABLE creditsuisse_ma_deals (
        deal_id INT PRIMARY KEY,
        industry_sector VARCHAR(50),
        deal_value DECIMAL(15,2),
        advisory_fees DECIMAL(12,2),
        transaction_multiple DECIMAL(6,2),
        deal_status VARCHAR(20),
        deal_duration_months INT,
        target_ebitda DECIMAL(12,2),
        announcement_date DATE
    );
      INSERT INTO creditsuisse_ma_deals  VALUES
      (1, 'Technology', 15000000000.50, 225000000.50, 18.50, 'Completed', 8, 750000000.25, '2024-01-15'),
      (2, 'Healthcare', 8500000000.75, 127500000.75, 22.25, 'Completed', 12, 380000000.50, '2024-01-15'),
      (3, 'Financial Services', 12000000000.25, 180000000.25, 15.75, 'Pending', 6, 890000000.80, '2024-01-16'),
      (4, 'Energy & Utilities', 6500000000.80, 97500000.80, 12.50, 'Completed', 10, 520000000.60, '2024-01-16'),
      (5, 'Consumer Goods', 4200000000.60, 63000000.60, 16.25, 'Completed', 9, 285000000.40, '2024-01-17'),
      (7, 'Technology_v1', 15000000000.60, 225000000.60, 18.60, 'Completed_v1', 18, 750000000.35, '2024-01-16'),
      (9, 'Healthcare_v2', 8500000000.95, 127500000.95, 22.45, 'Completed_v2', 32, 380000000.70, '2024-01-17'),
      (11, 'Financial Services_v3', 12000000000.55, 180000000.55, 16.05, 'Pending_v3', 36, 890000001.10, '2024-01-19'),
      (13, 'Energy & Utilities_v4', 6500000001.20, 97500001.20, 12.90, 'Completed_v4', 50, 520000001.00, '2024-01-20'),
      (15, 'Consumer Goods_v5', 4200000001.10, 63000001.10, 16.75, 'Completed_v5', 59, 285000000.90, '2024-01-22'),
      (12, 'Technology_v6', 15000000001.10, 225000001.10, 19.10, 'Completed_v6', 68, 750000000.85, '2024-01-21'),
      (14, 'Healthcare_v7', 8500000001.45, 127500001.45, 22.95, 'Completed_v7', 82, 380000001.20, '2024-01-22'),
      (16, 'Financial Services_v8', 12000000001.05, 180000001.05, 16.55, 'Pending_v8', 86, 890000001.60, '2024-01-24'),
      (18, 'Energy & Utilities_v9', 6500000001.70, 97500001.70, 13.40, 'Completed_v9', 100, 520000001.50, '2024-01-25'),
      (20, 'Consumer Goods_v10', 4200000001.60, 63000001.60, 17.25, 'Completed_v10', 109, 285000001.40, '2024-01-27'),
      (17, 'Technology_v11', 15000000001.60, 225000001.60, 19.60, 'Completed_v11', 118, 750000001.35, '2024-01-26'),
      (19, 'Healthcare_v12', 8500000001.95, 127500001.95, 23.45, 'Completed_v12', 132, 380000001.70, '2024-01-27'),
      (21, 'Financial Services_v13', 12000000001.55, 180000001.55, 17.05, 'Pending_v13', 136, 890000002.10, '2024-01-29'),
      (23, 'Energy & Utilities_v14', 6500000002.20, 97500002.20, 13.90, 'Completed_v14', 150, 520000002.00, '2024-01-30'),
      (25, 'Consumer Goods_v15', 4200000002.10, 63000002.10, 17.75, 'Completed_v15', 159, 285000001.90, '2024-02-01'),
      (22, 'Technology_v16', 15000000002.10, 225000002.10, 20.10, 'Completed_v16', 168, 750000001.85, '2024-01-31'),
      (24, 'Healthcare_v17', 8500000002.45, 127500002.45, 23.95, 'Completed_v17', 182, 380000002.20, '2024-02-01'),
      (26, 'Financial Services_v18', 12000000002.05, 180000002.05, 17.55, 'Pending_v18', 186, 890000002.60, '2024-02-03'),
      (28, 'Energy & Utilities_v19', 6500000002.70, 97500002.70, 14.40, 'Completed_v19', 200, 520000002.50, '2024-02-04'),
      (30, 'Consumer Goods_v20', 4200000002.60, 63000002.60, 18.25, 'Completed_v20', 209, 285000002.40, '2024-02-06');

-- ============================================
-- Problem: Credit Suisse Private Banking Analytics
-- Slug: barclays-risk-management-system
-- ============================================
CREATE TABLE creditsuisse_private_banking (
        client_id INT PRIMARY KEY,
        wealth_segment VARCHAR(50),
        geographic_region VARCHAR(30),
        assets_under_management DECIMAL(15,2),
        annual_fee_revenue DECIMAL(10,2),
        portfolio_performance DECIMAL(8,4),
        risk_adjusted_return DECIMAL(8,4),
        client_satisfaction_score DECIMAL(3,1),
        relationship_manager_score DECIMAL(3,1),
        years_as_client INT,
        client_date DATE
    );
      INSERT INTO creditsuisse_private_banking  VALUES
      (1, 'Ultra High Net Worth', 'Switzerland', 285000000.00, 4275000.50, 0.1285, 0.1125, 9.2, 9.5, 18, '2024-01-15'),
      (2, 'Family Office', 'Asia Pacific', 520000000.00, 6240000.75, 0.1425, 0.1285, 8.8, 9.1, 12, '2024-01-15'),
      (3, 'Institutional Wealth', 'North America', 180000000.00, 2340000.25, 0.1155, 0.0985, 8.6, 8.8, 15, '2024-01-16'),
      (4, 'High Net Worth', 'Europe', 85000000.00, 1105000.80, 0.1085, 0.0925, 8.2, 8.5, 9, '2024-01-16'),
      (5, 'Sovereign Wealth', 'Middle East', 750000000.00, 9750000.60, 0.1525, 0.1385, 9.1, 9.3, 22, '2024-01-17'),
      (7, 'Ultra High Net Worth_v1', 'Switzerland_v1', 285000000.10, 4275000.60, 0.23, 0.21, 9.30, 9.60, 28, '2024-01-16'),
      (9, 'Family Office_v2', 'Asia Pacific_v2', 520000000.20, 6240000.95, 0.34, 0.33, 9.00, 9.30, 32, '2024-01-17'),
      (11, 'Institutional Wealth_v3', 'North America_v3', 180000000.30, 2340000.55, 0.42, 0.40, 8.90, 9.10, 45, '2024-01-19'),
      (13, 'High Net Worth_v4', 'Europe_v4', 85000000.40, 1105001.20, 0.51, 0.49, 8.60, 8.90, 49, '2024-01-20'),
      (15, 'Sovereign Wealth_v5', 'Middle East_v5', 750000000.50, 9750001.10, 0.65, 0.64, 9.60, 9.80, 72, '2024-01-22'),
      (12, 'Ultra High Net Worth_v6', 'Switzerland_v6', 285000000.60, 4275001.10, 0.73, 0.71, 9.80, 10.10, 78, '2024-01-21'),
      (14, 'Family Office_v7', 'Asia Pacific_v7', 520000000.70, 6240001.45, 0.84, 0.83, 9.50, 9.80, 82, '2024-01-22'),
      (16, 'Institutional Wealth_v8', 'North America_v8', 180000000.80, 2340001.05, 0.92, 0.90, 9.40, 9.60, 95, '2024-01-24'),
      (18, 'High Net Worth_v9', 'Europe_v9', 85000000.90, 1105001.70, 1.01, 0.99, 9.10, 9.40, 99, '2024-01-25'),
      (20, 'Sovereign Wealth_v10', 'Middle East_v10', 750000001.00, 9750001.60, 1.15, 1.14, 10.10, 10.30, 122, '2024-01-27'),
      (17, 'Ultra High Net Worth_v11', 'Switzerland_v11', 285000001.10, 4275001.60, 1.23, 1.21, 10.30, 10.60, 128, '2024-01-26'),
      (19, 'Family Office_v12', 'Asia Pacific_v12', 520000001.20, 6240001.95, 1.34, 1.33, 10.00, 10.30, 132, '2024-01-27'),
      (21, 'Institutional Wealth_v13', 'North America_v13', 180000001.30, 2340001.55, 1.42, 1.40, 9.90, 10.10, 145, '2024-01-29'),
      (23, 'High Net Worth_v14', 'Europe_v14', 85000001.40, 1105002.20, 1.51, 1.49, 9.60, 9.90, 149, '2024-01-30'),
      (25, 'Sovereign Wealth_v15', 'Middle East_v15', 750000001.50, 9750002.10, 1.65, 1.64, 10.60, 10.80, 172, '2024-02-01'),
      (22, 'Ultra High Net Worth_v16', 'Switzerland_v16', 285000001.60, 4275002.10, 1.73, 1.71, 10.80, 11.10, 178, '2024-01-31'),
      (24, 'Family Office_v17', 'Asia Pacific_v17', 520000001.70, 6240002.45, 1.84, 1.83, 10.50, 10.80, 182, '2024-02-01'),
      (26, 'Institutional Wealth_v18', 'North America_v18', 180000001.80, 2340002.05, 1.92, 1.90, 10.40, 10.60, 195, '2024-02-03'),
      (28, 'High Net Worth_v19', 'Europe_v19', 85000001.90, 1105002.70, 2.01, 1.99, 10.10, 10.40, 199, '2024-02-04'),
      (30, 'Sovereign Wealth_v20', 'Middle East_v20', 750000002.00, 9750002.60, 2.15, 2.14, 11.10, 11.30, 222, '2024-02-06');

-- ============================================
-- Problem: Customer Service Analytics Dashboard
-- Slug: societe-generale-risk-management-system
-- ============================================

CREATE TABLE support_channels (
    channel_id INT PRIMARY KEY,
    channel_name VARCHAR(50),
    channel_type VARCHAR(30),
    availability_hours VARCHAR(20)
);

CREATE TABLE support_agents (
    agent_id INT PRIMARY KEY,
    agent_name VARCHAR(100),
    department VARCHAR(50),
    experience_years INT,
    specialization VARCHAR(50)
);

CREATE TABLE support_tickets (
    ticket_id INT PRIMARY KEY,
    channel_id INT,
    agent_id INT,
    ticket_category VARCHAR(50),
    priority_level VARCHAR(20),
    created_date DATE,
    resolved_date DATE,
    resolution_hours DECIMAL(6,2),
    customer_satisfaction DECIMAL(3,2),
    FOREIGN KEY (channel_id) REFERENCES support_channels(channel_id),
    FOREIGN KEY (agent_id) REFERENCES support_agents(agent_id)
);

INSERT INTO support_channels VALUES
(1, 'Live Chat', 'Digital', '24/7'),
(2, 'Email Support', 'Digital', 'Business Hours'),
(3, 'Phone Support', 'Voice', 'Business Hours'),
(4, 'Self-Service Portal', 'Digital', '24/7');

INSERT INTO support_agents VALUES
(1, 'Sarah Johnson', 'Technical Support', 5, 'Software Issues'),
(2, 'Mike Chen', 'Customer Success', 3, 'Account Management'),
(3, 'Lisa Rodriguez', 'Technical Support', 7, 'Network Issues'),
(4, 'David Kim', 'Billing Support', 4, 'Payment Issues'),
(5, 'Emma Wilson', 'General Support', 2, 'General Inquiries');

INSERT INTO support_tickets VALUES
(1, 1, 1, 'Technical Issue', 'High', '2024-05-01', '2024-05-01', 2.5, 4.5),
(2, 2, 2, 'Account Question', 'Medium', '2024-05-01', '2024-05-02', 18.0, 4.2),
(3, 3, 3, 'Network Problem', 'High', '2024-05-02', '2024-05-02', 4.0, 4.7),
(4, 1, 4, 'Billing Issue', 'Medium', '2024-05-02', '2024-05-03', 22.5, 4.0),
(5, 2, 5, 'General Inquiry', 'Low', '2024-05-03', '2024-05-04', 26.0, 4.3),
(6, 3, 1, 'Technical Issue', 'High', '2024-05-03', '2024-05-03', 3.5, 4.6),
(7, 1, 2, 'Account Question', 'Low', '2024-05-04', '2024-05-05', 20.0, 4.1),
(8, 2, 3, 'Network Problem', 'Medium', '2024-05-04', '2024-05-05', 16.5, 4.4),
(9, 3, 4, 'Billing Issue', 'High', '2024-05-05', '2024-05-05', 1.5, 4.8),
(10, 1, 5, 'General Inquiry', 'Low', '2024-05-05', '2024-05-06', 24.0, 4.2);

-- ============================================
-- Problem: Deutsche Bank Credit Risk Analytics
-- Slug: credit-suisse-risk-management-system
-- ============================================
CREATE TABLE deutschebank_credit_portfolio (
        loan_id INT PRIMARY KEY,
        borrower_sector VARCHAR(50),
        exposure_at_default DECIMAL(15,2),
        probability_of_default DECIMAL(8,5),
        loss_given_default DECIMAL(6,3),
        credit_rating VARCHAR(10),
        maturity_years INT,
        economic_capital DECIMAL(12,2),
        loan_date DATE
    );
      INSERT INTO deutschebank_credit_portfolio  VALUES
      (1, 'Energy & Utilities', 2500000000.50, 0.03250, 0.450, 'BB+', 5, 85000000.50, '2024-01-15'),
      (2, 'Real Estate', 1800000000.75, 0.02850, 0.380, 'BBB-', 7, 65000000.75, '2024-01-15'),
      (3, 'Manufacturing', 3200000000.25, 0.01950, 0.320, 'A-', 4, 45000000.25, '2024-01-16'),
      (4, 'Technology', 950000000.80, 0.01250, 0.250, 'A+', 3, 25000000.80, '2024-01-16'),
      (5, 'Retail & Consumer', 1650000000.60, 0.04150, 0.520, 'B+', 6, 125000000.60, '2024-01-17'),
      (7, 'Energy & Utilities_v1', 2500000000.60, 0.13, 0.55, 'BB+_v1', 15, 85000000.60, '2024-01-16'),
      (9, 'Real Estate_v2', 1800000000.95, 0.23, 0.58, 'BBB-_v2', 27, 65000000.95, '2024-01-17'),
      (11, 'Manufacturing_v3', 3200000000.55, 0.32, 0.62, 'A-_v3', 34, 45000000.55, '2024-01-19'),
      (13, 'Technology_v4', 950000001.20, 0.41, 0.65, 'A+_v4', 43, 25000001.20, '2024-01-20'),
      (15, 'Retail & Consumer_v5', 1650000001.10, 0.54, 1.02, 'B+_v5', 56, 125000001.10, '2024-01-22'),
      (12, 'Energy & Utilities_v6', 2500000001.10, 0.63, 1.05, 'BB+_v6', 65, 85000001.10, '2024-01-21'),
      (14, 'Real Estate_v7', 1800000001.45, 0.73, 1.08, 'BBB-_v7', 77, 65000001.45, '2024-01-22'),
      (16, 'Manufacturing_v8', 3200000001.05, 0.82, 1.12, 'A-_v8', 84, 45000001.05, '2024-01-24'),
      (18, 'Technology_v9', 950000001.70, 0.91, 1.15, 'A+_v9', 93, 25000001.70, '2024-01-25'),
      (20, 'Retail & Consumer_v10', 1650000001.60, 1.04, 1.52, 'B+_v10', 106, 125000001.60, '2024-01-27'),
      (17, 'Energy & Utilities_v11', 2500000001.60, 1.13, 1.55, 'BB+_v11', 115, 85000001.60, '2024-01-26'),
      (19, 'Real Estate_v12', 1800000001.95, 1.23, 1.58, 'BBB-_v12', 127, 65000001.95, '2024-01-27'),
      (21, 'Manufacturing_v13', 3200000001.55, 1.32, 1.62, 'A-_v13', 134, 45000001.55, '2024-01-29'),
      (23, 'Technology_v14', 950000002.20, 1.41, 1.65, 'A+_v14', 143, 25000002.20, '2024-01-30'),
      (25, 'Retail & Consumer_v15', 1650000002.10, 1.54, 2.02, 'B+_v15', 156, 125000002.10, '2024-02-01'),
      (22, 'Energy & Utilities_v16', 2500000002.10, 1.63, 2.05, 'BB+_v16', 165, 85000002.10, '2024-01-31'),
      (24, 'Real Estate_v17', 1800000002.45, 1.73, 2.08, 'BBB-_v17', 177, 65000002.45, '2024-02-01'),
      (26, 'Manufacturing_v18', 3200000002.05, 1.82, 2.12, 'A-_v18', 184, 45000002.05, '2024-02-03'),
      (28, 'Technology_v19', 950000002.70, 1.91, 2.15, 'A+_v19', 193, 25000002.70, '2024-02-04'),
      (30, 'Retail & Consumer_v20', 1650000002.60, 2.04, 2.52, 'B+_v20', 206, 125000002.60, '2024-02-06');

-- ============================================
-- Problem: Digital Marketing Campaign Performance
-- Slug: jpmorgan-chase-portfolio-analytics
-- ============================================

CREATE TABLE marketing_channels (
    channel_id INT PRIMARY KEY,
    channel_name VARCHAR(100),
    channel_type VARCHAR(50),
    cost_structure VARCHAR(30)
);

CREATE TABLE campaigns (
    campaign_id INT PRIMARY KEY,
    campaign_name VARCHAR(150),
    channel_id INT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10,2),
    objective VARCHAR(50),
    FOREIGN KEY (channel_id) REFERENCES marketing_channels(channel_id)
);

CREATE TABLE campaign_results (
    result_id INT PRIMARY KEY,
    campaign_id INT,
    date DATE,
    impressions INT,
    clicks INT,
    conversions INT,
    cost DECIMAL(8,2),
    revenue DECIMAL(10,2),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
);

INSERT INTO marketing_channels VALUES
(1, 'Google Ads', 'Search', 'CPC'),
(2, 'Facebook Ads', 'Social Media', 'CPC'),
(3, 'LinkedIn Ads', 'Professional', 'CPM'),
(4, 'Email Marketing', 'Direct', 'Fixed');

INSERT INTO campaigns VALUES
(1, 'Q2 Product Launch - Search', 1, '2024-04-01', '2024-06-30', 15000.00, 'Lead Generation'),
(2, 'Brand Awareness - Social', 2, '2024-03-15', '2024-05-15', 8000.00, 'Brand Awareness'),
(3, 'B2B Lead Gen - LinkedIn', 3, '2024-04-10', '2024-06-10', 12000.00, 'Lead Generation'),
(4, 'Customer Retention - Email', 4, '2024-01-01', '2024-12-31', 3000.00, 'Retention');

INSERT INTO campaign_results VALUES
(1, 1, '2024-05-01', 45000, 2250, 180, 1200.00, 18000.00),
(2, 1, '2024-05-15', 38000, 1900, 152, 1100.00, 15200.00),
(3, 2, '2024-04-01', 120000, 3600, 90, 800.00, 4500.00),
(4, 2, '2024-04-15', 95000, 2850, 76, 750.00, 3800.00),
(5, 3, '2024-05-01', 8500, 425, 42, 950.00, 21000.00),
(6, 3, '2024-05-15', 9200, 460, 46, 1000.00, 23000.00),
(7, 4, '2024-04-01', 15000, 1200, 240, 250.00, 12000.00),
(8, 4, '2024-05-01', 16500, 1320, 264, 275.00, 13200.00);

-- ============================================
-- Problem: E-commerce Customer Analytics
-- Slug: airbnb-revenue-analysis
-- ============================================

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    email VARCHAR(100),
    registration_date DATE,
    customer_tier VARCHAR(20)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2),
    product_category VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO customers VALUES
(1, 'Alice Johnson', 'alice@email.com', '2023-01-15', 'Premium'),
(2, 'Bob Smith', 'bob@email.com', '2023-02-20', 'Standard'),
(3, 'Carol Davis', 'carol@email.com', '2023-03-10', 'Premium'),
(4, 'David Wilson', 'david@email.com', '2023-01-25', 'Standard'),
(5, 'Emma Brown', 'emma@email.com', '2023-04-05', 'Premium');

INSERT INTO orders VALUES
(1, 1, '2024-01-10', 250.00, 'Electronics'),
(2, 1, '2024-02-15', 120.00, 'Books'),
(3, 2, '2024-01-20', 80.00, 'Clothing'),
(4, 3, '2024-03-05', 450.00, 'Electronics'),
(5, 3, '2024-03-20', 200.00, 'Home'),
(6, 4, '2024-02-10', 60.00, 'Books'),
(7, 5, '2024-04-15', 300.00, 'Electronics'),
(8, 1, '2024-04-20', 180.00, 'Clothing'),
(9, 2, '2024-04-25', 95.00, 'Home'),
(10, 3, '2024-05-01', 75.00, 'Books');

-- ============================================
-- Problem: Employee Performance Analytics
-- Slug: capital-one-credit-risk-modeling
-- ============================================

CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100),
    manager_name VARCHAR(100),
    budget DECIMAL(12,2)
);

CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    employee_name VARCHAR(100),
    dept_id INT,
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

CREATE TABLE performance_metrics (
    metric_id INT PRIMARY KEY,
    employee_id INT,
    quarter VARCHAR(10),
    projects_completed INT,
    avg_project_rating DECIMAL(3,2),
    skill_assessment_score INT,
    peer_review_score DECIMAL(3,2),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

INSERT INTO departments VALUES
(1, 'Engineering', 'Sarah Johnson', 2500000.00),
(2, 'Marketing', 'Mike Chen', 800000.00),
(3, 'Sales', 'Lisa Rodriguez', 1200000.00),
(4, 'Design', 'Alex Kim', 600000.00);

INSERT INTO employees VALUES
(1, 'John Smith', 1, 'Senior Developer', '2022-03-15', 95000.00),
(2, 'Emma Wilson', 1, 'DevOps Engineer', '2022-06-20', 88000.00),
(3, 'David Brown', 2, 'Marketing Manager', '2021-11-10', 75000.00),
(4, 'Jessica Lee', 3, 'Sales Representative', '2023-01-08', 65000.00),
(5, 'Mark Taylor', 4, 'UX Designer', '2022-09-12', 72000.00);

INSERT INTO performance_metrics VALUES
(1, 1, '2024-Q1', 8, 4.5, 92, 4.3),
(2, 2, '2024-Q1', 6, 4.2, 88, 4.1),
(3, 3, '2024-Q1', 12, 4.0, 85, 3.9),
(4, 4, '2024-Q1', 15, 3.8, 82, 3.7),
(5, 5, '2024-Q1', 5, 4.6, 90, 4.4),
(6, 1, '2024-Q2', 7, 4.4, 94, 4.2),
(7, 2, '2024-Q2', 8, 4.3, 89, 4.0),
(8, 3, '2024-Q2', 10, 4.1, 87, 4.0);

-- ============================================
-- Problem: Energy Consumption Analysis
-- Slug: energy-consumption-analysis
-- ============================================
CREATE TABLE solar_installations (
          installation_id INT,
          location VARCHAR(50),
          panel_capacity_kw DECIMAL(8,2),
          daily_production_kwh DECIMAL(10,2),
          installation_date DATE
      );
      INSERT INTO solar_installations  VALUES
      (1, 'California', 25.0, 120.5, '2023-06-15'),
      (2, 'Arizona', 30.0, 135.2, '2023-07-20'),
      (3, 'Nevada', 20.0, 85.8, '2023-08-10'),
      (4, 'Texas', 35.0, 145.6, '2023-05-25'),
      (5, 'Florida', 28.0, 98.4, '2023-09-12'),
      (6, 'Colorado', 22.0, 102.3, '2023-07-08'),
      (8, 'California_v1', 25.10, 120.60, '2023-06-16'),
      (10, 'Arizona_v2', 30.20, 135.40, '2023-07-22'),
      (12, 'Nevada_v3', 20.30, 86.10, '2023-08-13'),
      (14, 'Texas_v4', 35.40, 146.00, '2023-05-29'),
      (16, 'Florida_v5', 28.50, 98.90, '2023-09-17'),
      (18, 'Colorado_v6', 22.60, 102.90, '2023-07-14'),
      (14, 'California_v7', 25.70, 121.20, '2023-06-22'),
      (16, 'Arizona_v8', 30.80, 136.00, '2023-07-28'),
      (18, 'Nevada_v9', 20.90, 86.70, '2023-08-19'),
      (20, 'Texas_v10', 36.00, 146.60, '2023-06-04'),
      (22, 'Florida_v11', 29.10, 99.50, '2023-09-23'),
      (24, 'Colorado_v12', 23.20, 103.50, '2023-07-20'),
      (20, 'California_v13', 26.30, 121.80, '2023-06-28'),
      (22, 'Arizona_v14', 31.40, 136.60, '2023-08-03'),
      (24, 'Nevada_v15', 21.50, 87.30, '2023-08-25'),
      (26, 'Texas_v16', 36.60, 147.20, '2023-06-10'),
      (28, 'Florida_v17', 29.70, 100.10, '2023-09-29'),
      (30, 'Colorado_v18', 23.80, 104.10, '2023-07-26'),
      (26, 'California_v19', 26.90, 122.40, '2023-07-04');

-- ============================================
-- Problem: Fidelity Investment Portfolio Optimization
-- Slug: fidelity-portfolio-analytics
-- ============================================

            CREATE TABLE fidelity_portfolio_optimization (
                asset_id INT PRIMARY KEY,
                asset_class VARCHAR(50),
                portfolio_allocation DECIMAL(8,4),
                annual_return_rate DECIMAL(8,6),
                volatility DECIMAL(8,6),
                sharpe_ratio DECIMAL(6,4),
                risk_score DECIMAL(6,4),
                benchmark_return DECIMAL(8,6),
                portfolio_date DATE
            );
            
            INSERT INTO fidelity_portfolio_optimization VALUES
            (1, 'US Large Cap Equities', 0.3500, 0.1050, 0.1650, 0.6364, 12.5000, 0.0925, '2024-01-15'),
            (2, 'International Equities', 0.2500, 0.0875, 0.1825, 0.4795, 16.2500, 0.0785, '2024-01-15'),
            (3, 'Fixed Income', 0.2000, 0.0425, 0.0650, 0.6538, 8.7500, 0.0385, '2024-01-16'),
            (4, 'REITs', 0.1000, 0.0950, 0.2250, 0.4222, 18.5000, 0.0825, '2024-01-16'),
            (5, 'Private Equity', 0.1500, 0.1250, 0.2850, 0.4386, 22.8000, 0.1050, '2024-01-17');
        

-- ============================================
-- Problem: Financial Portfolio Performance Analysis
-- Slug: state-street-portfolio-analytics
-- ============================================

CREATE TABLE asset_classes (
    asset_class_id INT PRIMARY KEY,
    asset_class_name VARCHAR(100),
    risk_level VARCHAR(20),
    expected_annual_return DECIMAL(5,2)
);

CREATE TABLE portfolios (
    portfolio_id INT PRIMARY KEY,
    portfolio_name VARCHAR(100),
    client_risk_tolerance VARCHAR(20),
    total_value DECIMAL(12,2),
    creation_date DATE
);

CREATE TABLE portfolio_holdings (
    holding_id INT PRIMARY KEY,
    portfolio_id INT,
    asset_class_id INT,
    allocation_percentage DECIMAL(5,2),
    invested_amount DECIMAL(12,2),
    current_value DECIMAL(12,2),
    last_updated DATE,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(portfolio_id),
    FOREIGN KEY (asset_class_id) REFERENCES asset_classes(asset_class_id)
);

INSERT INTO asset_classes VALUES
(1, 'Large Cap Stocks', 'Medium', 8.50),
(2, 'Small Cap Stocks', 'High', 12.00),
(3, 'Government Bonds', 'Low', 3.50),
(4, 'Corporate Bonds', 'Medium-Low', 5.00),
(5, 'Real Estate', 'Medium-High', 9.50),
(6, 'International Stocks', 'High', 10.00);

INSERT INTO portfolios VALUES
(1, 'Conservative Growth', 'Low', 250000.00, '2023-01-15'),
(2, 'Balanced Portfolio', 'Medium', 500000.00, '2023-02-10'),
(3, 'Aggressive Growth', 'High', 750000.00, '2023-01-20'),
(4, 'Income Focus', 'Low', 300000.00, '2023-03-05');

INSERT INTO portfolio_holdings VALUES
(1, 1, 1, 30.00, 75000.00, 78000.00, '2024-05-01'),
(2, 1, 3, 50.00, 125000.00, 127500.00, '2024-05-01'),
(3, 1, 4, 20.00, 50000.00, 51000.00, '2024-05-01'),
(4, 2, 1, 40.00, 200000.00, 210000.00, '2024-05-01'),
(5, 2, 2, 20.00, 100000.00, 108000.00, '2024-05-01'),
(6, 2, 3, 25.00, 125000.00, 127500.00, '2024-05-01'),
(7, 2, 5, 15.00, 75000.00, 82500.00, '2024-05-01'),
(8, 3, 1, 35.00, 262500.00, 280000.00, '2024-05-01'),
(9, 3, 2, 30.00, 225000.00, 252000.00, '2024-05-01'),
(10, 3, 6, 35.00, 262500.00, 285000.00, '2024-05-01'),
(11, 4, 3, 60.00, 180000.00, 183000.00, '2024-05-01'),
(12, 4, 4, 40.00, 120000.00, 123000.00, '2024-05-01');

-- ============================================
-- Problem: Goldman Sachs Algorithmic Trading Performance
-- Slug: berkshire-hathaway-insurance-float-optimization
-- ============================================
CREATE TABLE goldmansachs_algo_trading (
        strategy_id INT PRIMARY KEY,
        strategy_name VARCHAR(100),
        asset_class VARCHAR(50),
        total_pnl DECIMAL(12,2),
        total_trades INT,
        winning_trades INT,
        gross_profit DECIMAL(12,2),
        gross_loss DECIMAL(12,2),
        max_drawdown_pct DECIMAL(6,3),
        volatility_annual DECIMAL(6,3),
        risk_free_rate DECIMAL(6,3),
        strategy_date DATE
    );
      INSERT INTO goldmansachs_algo_trading  VALUES
      (1, 'Statistical Arbitrage US Equities', 'US Equities', 125000000.50, 125000, 75000, 200000000.00, 75000000.00, 8.500, 12.500, 2.250, '2024-01-15'),
      (2, 'Market Making Fixed Income', 'Fixed Income', 85000000.75, 85000, 55000, 140000000.00, 55000000.00, 15.200, 18.750, 2.250, '2024-01-15'),
      (3, 'Cross-Asset Momentum', 'Multi-Asset', 95000000.25, 65000, 42000, 165000000.00, 70000000.00, 10.800, 16.250, 2.250, '2024-01-16'),
      (4, 'High Frequency ETF Arbitrage', 'ETFs', 65000000.80, 450000, 280000, 120000000.00, 55000000.00, 6.500, 8.750, 2.250, '2024-01-16'),
      (5, 'Options Market Making', 'Derivatives', 105000000.60, 95000, 58000, 175000000.00, 70000000.00, 14.500, 22.500, 2.250, '2024-01-17'),
      (7, 'Statistical Arbitrage US Equities_v1', 'US Equities_v1', 125000000.60, 125010, 75010, 200000000.10, 75000000.10, 8.60, 12.60, 2.35, '2024-01-16'),
      (9, 'Market Making Fixed Income_v2', 'Fixed Income_v2', 85000000.95, 85020, 55020, 140000000.20, 55000000.20, 15.40, 18.95, 2.45, '2024-01-17'),
      (11, 'Cross-Asset Momentum_v3', 'Multi-Asset_v3', 95000000.55, 65030, 42030, 165000000.30, 70000000.30, 11.10, 16.55, 2.55, '2024-01-19'),
      (13, 'High Frequency ETF Arbitrage_v4', 'ETFs_v4', 65000001.20, 450040, 280040, 120000000.40, 55000000.40, 6.90, 9.15, 2.65, '2024-01-20'),
      (15, 'Options Market Making_v5', 'Derivatives_v5', 105000001.10, 95050, 58050, 175000000.50, 70000000.50, 15.00, 23.00, 2.75, '2024-01-22'),
      (12, 'Statistical Arbitrage US Equities_v6', 'US Equities_v6', 125000001.10, 125060, 75060, 200000000.60, 75000000.60, 9.10, 13.10, 2.85, '2024-01-21'),
      (14, 'Market Making Fixed Income_v7', 'Fixed Income_v7', 85000001.45, 85070, 55070, 140000000.70, 55000000.70, 15.90, 19.45, 2.95, '2024-01-22'),
      (16, 'Cross-Asset Momentum_v8', 'Multi-Asset_v8', 95000001.05, 65080, 42080, 165000000.80, 70000000.80, 11.60, 17.05, 3.05, '2024-01-24'),
      (18, 'High Frequency ETF Arbitrage_v9', 'ETFs_v9', 65000001.70, 450090, 280090, 120000000.90, 55000000.90, 7.40, 9.65, 3.15, '2024-01-25'),
      (20, 'Options Market Making_v10', 'Derivatives_v10', 105000001.60, 95100, 58100, 175000001.00, 70000001.00, 15.50, 23.50, 3.25, '2024-01-27'),
      (17, 'Statistical Arbitrage US Equities_v11', 'US Equities_v11', 125000001.60, 125110, 75110, 200000001.10, 75000001.10, 9.60, 13.60, 3.35, '2024-01-26'),
      (19, 'Market Making Fixed Income_v12', 'Fixed Income_v12', 85000001.95, 85120, 55120, 140000001.20, 55000001.20, 16.40, 19.95, 3.45, '2024-01-27'),
      (21, 'Cross-Asset Momentum_v13', 'Multi-Asset_v13', 95000001.55, 65130, 42130, 165000001.30, 70000001.30, 12.10, 17.55, 3.55, '2024-01-29'),
      (23, 'High Frequency ETF Arbitrage_v14', 'ETFs_v14', 65000002.20, 450140, 280140, 120000001.40, 55000001.40, 7.90, 10.15, 3.65, '2024-01-30'),
      (25, 'Options Market Making_v15', 'Derivatives_v15', 105000002.10, 95150, 58150, 175000001.50, 70000001.50, 16.00, 24.00, 3.75, '2024-02-01'),
      (22, 'Statistical Arbitrage US Equities_v16', 'US Equities_v16', 125000002.10, 125160, 75160, 200000001.60, 75000001.60, 10.10, 14.10, 3.85, '2024-01-31'),
      (24, 'Market Making Fixed Income_v17', 'Fixed Income_v17', 85000002.45, 85170, 55170, 140000001.70, 55000001.70, 16.90, 20.45, 3.95, '2024-02-01'),
      (26, 'Cross-Asset Momentum_v18', 'Multi-Asset_v18', 95000002.05, 65180, 42180, 165000001.80, 70000001.80, 12.60, 18.05, 4.05, '2024-02-03'),
      (28, 'High Frequency ETF Arbitrage_v19', 'ETFs_v19', 65000002.70, 450190, 280190, 120000001.90, 55000001.90, 8.40, 10.65, 4.15, '2024-02-04'),
      (30, 'Options Market Making_v20', 'Derivatives_v20', 105000002.60, 95200, 58200, 175000002.00, 70000002.00, 16.50, 24.50, 4.25, '2024-02-06');

-- ============================================
-- Problem: Goldman Sachs Prime Brokerage Analytics
-- Slug: danske-bank-risk-management-system
-- ============================================
CREATE TABLE goldmansachs_prime_brokerage (
        client_id INT PRIMARY KEY,
        client_segment VARCHAR(50),
        assets_under_custody DECIMAL(15,2),
        margin_balance DECIMAL(12,2),
        financing_revenue DECIMAL(10,2),
        financing_spread_bps INT,
        counterparty_risk_score DECIMAL(3,1),
        margin_utilization_pct DECIMAL(5,2),
        trading_volume DECIMAL(15,2),
        relationship_years INT,
        client_date DATE
    );
      INSERT INTO goldmansachs_prime_brokerage  VALUES
      (1, 'Large Hedge Funds', 25000.00, 8500000.00, 425000.00, 185, 2.5, 78.5, 125000.00, 12, '2024-01-15'),
      (2, 'Quantitative Funds', 18000.00, 6200000.00, 380000.00, 195, 1.8, 82.3, 285000.00, 8, '2024-01-15'),
      (3, 'Long/Short Equity', 12000.00, 3850000.00, 245000.00, 165, 2.2, 72.8, 85000.00, 15, '2024-01-16'),
      (4, 'Multi-Strategy', 35000.00, 12500.00, 685000.00, 220, 2.8, 89.5, 450000.00, 18, '2024-01-16'),
      (5, 'Event Driven', 8500000.00, 2200000.00, 135000.00, 145, 3.2, 65.8, 28000.00, 6, '2024-01-17'),
      (7, 'Large Hedge Funds_v1', 25000.10, 8500000.10, 425000.10, 195, 2.60, 78.60, 125000.10, 22, '2024-01-16'),
      (9, 'Quantitative Funds_v2', 18000.20, 6200000.20, 380000.20, 215, 2.00, 82.50, 285000.20, 28, '2024-01-17'),
      (11, 'Long/Short Equity_v3', 12000.30, 3850000.30, 245000.30, 195, 2.50, 73.10, 85000.30, 45, '2024-01-19'),
      (13, 'Multi-Strategy_v4', 35000.40, 12500.40, 685000.40, 260, 3.20, 89.90, 450000.40, 58, '2024-01-20'),
      (15, 'Event Driven_v5', 8500000.50, 2200000.50, 135000.50, 195, 3.70, 66.30, 28000.50, 56, '2024-01-22'),
      (12, 'Large Hedge Funds_v6', 25000.60, 8500000.60, 425000.60, 245, 3.10, 79.10, 125000.60, 72, '2024-01-21'),
      (14, 'Quantitative Funds_v7', 18000.70, 6200000.70, 380000.70, 265, 2.50, 83.00, 285000.70, 78, '2024-01-22'),
      (16, 'Long/Short Equity_v8', 12000.80, 3850000.80, 245000.80, 245, 3.00, 73.60, 85000.80, 95, '2024-01-24'),
      (18, 'Multi-Strategy_v9', 35000.90, 12500.90, 685000.90, 310, 3.70, 90.40, 450000.90, 108, '2024-01-25'),
      (20, 'Event Driven_v10', 8500001.00, 2200001.00, 135001.00, 245, 4.20, 66.80, 28001.00, 106, '2024-01-27'),
      (17, 'Large Hedge Funds_v11', 25001.10, 8500001.10, 425001.10, 295, 3.60, 79.60, 125001.10, 122, '2024-01-26'),
      (19, 'Quantitative Funds_v12', 18001.20, 6200001.20, 380001.20, 315, 3.00, 83.50, 285001.20, 128, '2024-01-27'),
      (21, 'Long/Short Equity_v13', 12001.30, 3850001.30, 245001.30, 295, 3.50, 74.10, 85001.30, 145, '2024-01-29'),
      (23, 'Multi-Strategy_v14', 35001.40, 12501.40, 685001.40, 360, 4.20, 90.90, 450001.40, 158, '2024-01-30'),
      (25, 'Event Driven_v15', 8500001.50, 2200001.50, 135001.50, 295, 4.70, 67.30, 28001.50, 156, '2024-02-01'),
      (22, 'Large Hedge Funds_v16', 25001.60, 8500001.60, 425001.60, 345, 4.10, 80.10, 125001.60, 172, '2024-01-31'),
      (24, 'Quantitative Funds_v17', 18001.70, 6200001.70, 380001.70, 365, 3.50, 84.00, 285001.70, 178, '2024-02-01'),
      (26, 'Long/Short Equity_v18', 12001.80, 3850001.80, 245001.80, 345, 4.00, 74.60, 85001.80, 195, '2024-02-03'),
      (28, 'Multi-Strategy_v19', 35001.90, 12501.90, 685001.90, 410, 4.70, 91.40, 450001.90, 208, '2024-02-04'),
      (30, 'Event Driven_v20', 8500002.00, 2200002.00, 135002.00, 345, 5.20, 67.80, 28002.00, 206, '2024-02-06');

-- ============================================
-- Problem: HSBC Trade Finance Analytics
-- Slug: deutsche-bank-risk-management-system
-- ============================================
CREATE TABLE trade_transactions (
          transaction_id INT PRIMARY KEY,
          trade_type VARCHAR(50),
          transaction_value_millions DECIMAL(8,2),
          geographic_corridor VARCHAR(50),
          processing_days INT
      );
      INSERT INTO trade_transactions  VALUES
      (1, 'Letter of Credit', 2.5, 'Asia-Europe', 5),
      (2, 'Documentary Collection', 1.8, 'Americas-Asia', 7),
      (3, 'Trade Guarantee', 4.2, 'Europe-Middle East', 3),
      (4, 'Supply Chain Finance', 3.6, 'Asia-Americas', 4),
      (5, 'Export Finance', 5.8, 'Europe-Africa', 6),
      (7, 'Letter of Credit_v1', 2.60, 'Asia-Europe_v1', 15),
      (9, 'Documentary Collection_v2', 2.00, 'Americas-Asia_v2', 27),
      (11, 'Trade Guarantee_v3', 4.50, 'Europe-Middle East_v3', 33),
      (13, 'Supply Chain Finance_v4', 4.00, 'Asia-Americas_v4', 44),
      (15, 'Export Finance_v5', 6.30, 'Europe-Africa_v5', 56),
      (12, 'Letter of Credit_v6', 3.10, 'Asia-Europe_v6', 65),
      (14, 'Documentary Collection_v7', 2.50, 'Americas-Asia_v7', 77),
      (16, 'Trade Guarantee_v8', 5.00, 'Europe-Middle East_v8', 83),
      (18, 'Supply Chain Finance_v9', 4.50, 'Asia-Americas_v9', 94),
      (20, 'Export Finance_v10', 6.80, 'Europe-Africa_v10', 106),
      (17, 'Letter of Credit_v11', 3.60, 'Asia-Europe_v11', 115),
      (19, 'Documentary Collection_v12', 3.00, 'Americas-Asia_v12', 127),
      (21, 'Trade Guarantee_v13', 5.50, 'Europe-Middle East_v13', 133),
      (23, 'Supply Chain Finance_v14', 5.00, 'Asia-Americas_v14', 144),
      (25, 'Export Finance_v15', 7.30, 'Europe-Africa_v15', 156),
      (22, 'Letter of Credit_v16', 4.10, 'Asia-Europe_v16', 165),
      (24, 'Documentary Collection_v17', 3.50, 'Americas-Asia_v17', 177),
      (26, 'Trade Guarantee_v18', 6.00, 'Europe-Middle East_v18', 183),
      (28, 'Supply Chain Finance_v19', 5.50, 'Asia-Americas_v19', 194),
      (30, 'Export Finance_v20', 7.80, 'Europe-Africa_v20', 206);

-- ============================================
-- Problem: Hospital Patient Care Analytics
-- Slug: google-ad-revenue-by-platform
-- ============================================

CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100),
    head_doctor VARCHAR(100),
    bed_capacity INT
);

CREATE TABLE patients (
    patient_id INT PRIMARY KEY,
    patient_name VARCHAR(100),
    age INT,
    admission_date DATE,
    discharge_date DATE,
    dept_id INT,
    treatment_outcome VARCHAR(20),
    satisfaction_score INT,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
);

INSERT INTO departments VALUES
(1, 'Cardiology', 'Dr. Sarah Heart', 30),
(2, 'Orthopedics', 'Dr. Mike Bone', 25),
(3, 'Emergency', 'Dr. Lisa Quick', 40),
(4, 'Pediatrics', 'Dr. Alex Child', 20);

INSERT INTO patients VALUES
(1, 'John Smith', 65, '2024-04-15', '2024-04-20', 1, 'Recovered', 9),
(2, 'Emma Wilson', 45, '2024-04-16', '2024-04-18', 2, 'Recovered', 8),
(3, 'David Brown', 30, '2024-04-17', '2024-04-17', 3, 'Recovered', 7),
(4, 'Jessica Lee', 8, '2024-04-18', '2024-04-22', 4, 'Recovered', 10),
(5, 'Mark Taylor', 55, '2024-04-19', '2024-04-25', 1, 'Improved', 8),
(6, 'Anna Davis', 35, '2024-04-20', '2024-04-23', 2, 'Recovered', 9),
(7, 'Robert Wilson', 70, '2024-04-21', '2024-04-21', 3, 'Stable', 6),
(8, 'Maria Garcia', 12, '2024-04-22', '2024-04-24', 4, 'Recovered', 9);

-- ============================================
-- Problem: ING Sustainable Finance Analytics
-- Slug: goldman-sachs-risk-management-system
-- ============================================
CREATE TABLE ing_sustainable_finance (
        product_id INT PRIMARY KEY,
        financing_product VARCHAR(50),
        financing_amount DECIMAL(12,2),
        carbon_offset_tons DECIMAL(10,2),
        esg_risk_score DECIMAL(3,1),
        green_premium_bps INT,
        renewable_energy_mw DECIMAL(8,2),
        sustainability_impact_score DECIMAL(4,2),
        regulatory_compliance_pct DECIMAL(5,2),
        client_adoption_rate DECIMAL(5,2),
        product_date DATE
    );
      INSERT INTO ing_sustainable_finance  VALUES
      (1, 'Green Bonds', 2500000000.00, 125000.50, 8.5, 35, 1850.25, 9.2, 98.5, 82.3, '2024-01-15'),
      (2, 'Renewable Energy Loans', 1850000000.00, 98500.75, 8.8, 28, 2250.80, 9.5, 99.2, 78.8, '2024-01-15'),
      (3, 'ESG Corporate Bonds', 3200000000.00, 88500.25, 7.9, 42, 1250.60, 8.8, 97.8, 85.5, '2024-01-16'),
      (4, 'Sustainable Supply Chain', 950000000.00, 45200.80, 8.2, 32, 850.40, 8.9, 98.8, 72.5, '2024-01-16'),
      (5, 'Climate Transition Loans', 1250000000.00, 65800.60, 8.1, 55, 1580.20, 8.6, 96.5, 69.8, '2024-01-17'),
      (7, 'Green Bonds_v1', 2500000000.10, 125000.60, 8.60, 45, 1850.35, 9.30, 98.60, 82.40, '2024-01-16'),
      (9, 'Renewable Energy Loans_v2', 1850000000.20, 98500.95, 9.00, 48, 2251.00, 9.70, 99.40, 79.00, '2024-01-17'),
      (11, 'ESG Corporate Bonds_v3', 3200000000.30, 88500.55, 8.20, 72, 1250.90, 9.10, 98.10, 85.80, '2024-01-19'),
      (13, 'Sustainable Supply Chain_v4', 950000000.40, 45201.20, 8.60, 72, 850.80, 9.30, 99.20, 72.90, '2024-01-20'),
      (15, 'Climate Transition Loans_v5', 1250000000.50, 65801.10, 8.60, 105, 1580.70, 9.10, 97.00, 70.30, '2024-01-22'),
      (12, 'Green Bonds_v6', 2500000000.60, 125001.10, 9.10, 95, 1850.85, 9.80, 99.10, 82.90, '2024-01-21'),
      (14, 'Renewable Energy Loans_v7', 1850000000.70, 98501.45, 9.50, 98, 2251.50, 10.20, 99.90, 79.50, '2024-01-22'),
      (16, 'ESG Corporate Bonds_v8', 3200000000.80, 88501.05, 8.70, 122, 1251.40, 9.60, 98.60, 86.30, '2024-01-24'),
      (18, 'Sustainable Supply Chain_v9', 950000000.90, 45201.70, 9.10, 122, 851.30, 9.80, 99.70, 73.40, '2024-01-25'),
      (20, 'Climate Transition Loans_v10', 1250000001.00, 65801.60, 9.10, 155, 1581.20, 9.60, 97.50, 70.80, '2024-01-27'),
      (17, 'Green Bonds_v11', 2500000001.10, 125001.60, 9.60, 145, 1851.35, 10.30, 99.60, 83.40, '2024-01-26'),
      (19, 'Renewable Energy Loans_v12', 1850000001.20, 98501.95, 10.00, 148, 2252.00, 10.70, 100.40, 80.00, '2024-01-27'),
      (21, 'ESG Corporate Bonds_v13', 3200000001.30, 88501.55, 9.20, 172, 1251.90, 10.10, 99.10, 86.80, '2024-01-29'),
      (23, 'Sustainable Supply Chain_v14', 950000001.40, 45202.20, 9.60, 172, 851.80, 10.30, 100.20, 73.90, '2024-01-30'),
      (25, 'Climate Transition Loans_v15', 1250000001.50, 65802.10, 9.60, 205, 1581.70, 10.10, 98.00, 71.30, '2024-02-01'),
      (22, 'Green Bonds_v16', 2500000001.60, 125002.10, 10.10, 195, 1851.85, 10.80, 100.10, 83.90, '2024-01-31'),
      (24, 'Renewable Energy Loans_v17', 1850000001.70, 98502.45, 10.50, 198, 2252.50, 11.20, 100.90, 80.50, '2024-02-01'),
      (26, 'ESG Corporate Bonds_v18', 3200000001.80, 88502.05, 9.70, 222, 1252.40, 10.60, 99.60, 87.30, '2024-02-03'),
      (28, 'Sustainable Supply Chain_v19', 950000001.90, 45202.70, 10.10, 222, 852.30, 10.80, 100.70, 74.40, '2024-02-04'),
      (30, 'Climate Transition Loans_v20', 1250000002.00, 65802.60, 10.10, 255, 1582.20, 10.60, 98.50, 71.80, '2024-02-06');

-- ============================================
-- Problem: Intel Semiconductor Manufacturing Analytics
-- Slug: high-value-customers
-- ============================================
CREATE TABLE intel_manufacturing (
        batch_id INT PRIMARY KEY,
        processor_family VARCHAR(50),
        fabrication_node VARCHAR(20),
        yield_rate DECIMAL(5,2),
        wafers_processed INT,
        production_date DATE
    );
      INSERT INTO intel_manufacturing  VALUES
      (1, 'Core i9', '7nm', 89.50, 2500, '2024-01-15'),
      (2, 'Core i7', '10nm', 91.25, 3200, '2024-01-15'),
      (3, 'Core i5', '10nm', 87.80, 4100, '2024-01-16'),
      (4, 'Xeon', '7nm', 83.40, 1800, '2024-01-16'),
      (5, 'Pentium', '14nm', 94.60, 2900, '2024-01-17'),
      (7, 'Core i9_v1', '7nm_v1', 89.60, 2510, '2024-01-16'),
      (9, 'Core i7_v2', '10nm_v2', 91.45, 3220, '2024-01-17'),
      (11, 'Core i5_v3', '10nm_v3', 88.10, 4130, '2024-01-19'),
      (13, 'Xeon_v4', '7nm_v4', 83.80, 1840, '2024-01-20'),
      (15, 'Pentium_v5', '14nm_v5', 95.10, 2950, '2024-01-22'),
      (12, 'Core i9_v6', '7nm_v6', 90.10, 2560, '2024-01-21'),
      (14, 'Core i7_v7', '10nm_v7', 91.95, 3270, '2024-01-22'),
      (16, 'Core i5_v8', '10nm_v8', 88.60, 4180, '2024-01-24'),
      (18, 'Xeon_v9', '7nm_v9', 84.30, 1890, '2024-01-25'),
      (20, 'Pentium_v10', '14nm_v10', 95.60, 3000, '2024-01-27'),
      (17, 'Core i9_v11', '7nm_v11', 90.60, 2610, '2024-01-26'),
      (19, 'Core i7_v12', '10nm_v12', 92.45, 3320, '2024-01-27'),
      (21, 'Core i5_v13', '10nm_v13', 89.10, 4230, '2024-01-29'),
      (23, 'Xeon_v14', '7nm_v14', 84.80, 1940, '2024-01-30'),
      (25, 'Pentium_v15', '14nm_v15', 96.10, 3050, '2024-02-01'),
      (22, 'Core i9_v16', '7nm_v16', 91.10, 2660, '2024-01-31'),
      (24, 'Core i7_v17', '10nm_v17', 92.95, 3370, '2024-02-01'),
      (26, 'Core i5_v18', '10nm_v18', 89.60, 4280, '2024-02-03'),
      (28, 'Xeon_v19', '7nm_v19', 85.30, 1990, '2024-02-04'),
      (30, 'Pentium_v20', '14nm_v20', 96.60, 3100, '2024-02-06');

-- ============================================
-- Problem: Inventory Management System
-- Slug: cvs-health-pharmacy-inventory-management
-- ============================================

CREATE TABLE stores (
    store_id INT PRIMARY KEY,
    store_name VARCHAR(100),
    location VARCHAR(100),
    store_size VARCHAR(20)
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    unit_cost DECIMAL(8,2),
    supplier VARCHAR(100)
);

CREATE TABLE inventory (
    inventory_id INT PRIMARY KEY,
    store_id INT,
    product_id INT,
    current_stock INT,
    min_stock_level INT,
    last_restock_date DATE,
    units_sold_last_month INT,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO stores VALUES
(1, 'Downtown Store', 'New York, NY', 'Large'),
(2, 'Mall Location', 'Los Angeles, CA', 'Medium'),
(3, 'Suburban Store', 'Chicago, IL', 'Large'),
(4, 'Express Store', 'Houston, TX', 'Small');

INSERT INTO products VALUES
(1, 'Wireless Headphones', 'Electronics', 75.00, 'TechCorp'),
(2, 'Running Shoes', 'Footwear', 120.00, 'SportsBrand'),
(3, 'Coffee Maker', 'Appliances', 85.00, 'HomeGoods'),
(4, 'Smartphone Case', 'Electronics', 25.00, 'TechCorp'),
(5, 'Yoga Mat', 'Fitness', 45.00, 'FitnessCo');

INSERT INTO inventory VALUES
(1, 1, 1, 25, 10, '2024-04-15', 18),
(2, 1, 2, 15, 8, '2024-04-20', 12),
(3, 1, 3, 8, 5, '2024-04-10', 6),
(4, 2, 1, 30, 12, '2024-04-18', 22),
(5, 2, 4, 45, 15, '2024-04-12', 35),
(6, 3, 2, 20, 10, '2024-04-25', 15),
(7, 3, 5, 12, 6, '2024-04-22', 8),
(8, 4, 3, 6, 4, '2024-04-08', 5),
(9, 4, 4, 25, 10, '2024-04-16', 20);

-- ============================================
-- Problem: JPMorgan Derivatives Risk Analytics
-- Slug: jpmorgan-derivatives-risk-analytics
-- ============================================
CREATE TABLE jpmorgan_derivatives (
        instrument_id INT PRIMARY KEY,
        derivative_type VARCHAR(50),
        notional_amount DECIMAL(15,2),
        market_value DECIMAL(12,2),
        var_95_1day DECIMAL(10,2),
        expected_shortfall DECIMAL(10,2),
        delta DECIMAL(8,6),
        gamma DECIMAL(8,6),
        trade_date DATE
    );
      INSERT INTO jpmorgan_derivatives VALUES
    (1, 'Interest Rate Swap', 100000000.00, 1250000.00, 485000.00, 625000.00, 0.045600, 0.000125, '2024-01-15'),
    (2, 'Credit Default Swap', 75000000.00, -180000.00, 320000.00, 415000.00, -0.028500, 0.000085, '2024-01-15'),
    (3, 'FX Forward', 50000000.00, 675000.00, 285000.00, 350000.00, 0.018200, 0.000045, '2024-01-16'),
    (4, 'Equity Option', 25000000.00, 425000.00, 195000.00, 245000.00, 0.065800, 0.000165, '2024-01-16'),
    (5, 'Commodity Swap', 80000000.00, 890000.00, 385000.00, 485000.00, 0.032500, 0.000095, '2024-01-17'),
    (7, 'Interest Rate Swap_v1', 100000000.10, 1250000.10, 485000.10, 625000.10, 0.15, 0.10, '2024-01-16'),
    (9, 'Credit Default Swap_v2', 75000000.20, -179999.80, 320000.20, 415000.20, 0.17, 0.20, '2024-01-17'),
    (11, 'FX Forward_v3', 50000000.30, 675000.30, 285000.30, 350000.30, 0.32, 0.30, '2024-01-19'),
    (13, 'Equity Option_v4', 25000000.40, 425000.40, 195000.40, 245000.40, 0.47, 0.40, '2024-01-20'),
    (15, 'Commodity Swap_v5', 80000000.50, 890000.50, 385000.50, 485000.50, 0.53, 0.50, '2024-01-22'),
    (12, 'Interest Rate Swap_v6', 100000000.60, 1250000.60, 485000.60, 625000.60, 0.65, 0.60, '2024-01-21'),
    (14, 'Credit Default Swap_v7', 75000000.70, -179999.30, 320000.70, 415000.70, 0.67, 0.70, '2024-01-22'),
    (16, 'FX Forward_v8', 50000000.80, 675000.80, 285000.80, 350000.80, 0.82, 0.80, '2024-01-24'),
    (18, 'Equity Option_v9', 25000000.90, 425000.90, 195000.90, 245000.90, 0.97, 0.90, '2024-01-25'),
    (20, 'Commodity Swap_v10', 80000001.00, 890001.00, 385001.00, 485001.00, 1.03, 1.00, '2024-01-27'),
    (17, 'Interest Rate Swap_v11', 100000001.10, 1250001.10, 485001.10, 625001.10, 1.15, 1.10, '2024-01-26'),
    (19, 'Credit Default Swap_v12', 75000001.20, -179998.80, 320001.20, 415001.20, 1.17, 1.20, '2024-01-27'),
    (21, 'FX Forward_v13', 50000001.30, 675001.30, 285001.30, 350001.30, 1.32, 1.30, '2024-01-29'),
    (23, 'Equity Option_v14', 25000001.40, 425001.40, 195001.40, 245001.40, 1.47, 1.40, '2024-01-30'),
    (25, 'Commodity Swap_v15', 80000001.50, 890001.50, 385001.50, 485001.50, 1.53, 1.50, '2024-02-01'),
    (22, 'Interest Rate Swap_v16', 100000001.60, 1250001.60, 485001.60, 625001.60, 1.65, 1.60, '2024-01-31'),
    (24, 'Credit Default Swap_v17', 75000001.70, -179998.30, 320001.70, 415001.70, 1.67, 1.70, '2024-02-01'),
    (26, 'FX Forward_v18', 50000001.80, 675001.80, 285001.80, 350001.80, 1.82, 1.80, '2024-02-03'),
    (28, 'Equity Option_v19', 25000001.90, 425001.90, 195001.90, 245001.90, 1.97, 1.90, '2024-02-04'),
    (30, 'Commodity Swap_v20', 80000002.00, 890002.00, 385002.00, 485002.00, 2.03, 2.00, '2024-02-06');

-- ============================================
-- Problem: LinkedIn Professional Network Analytics
-- Slug: ibm-watson-ai-service-usage
-- ============================================
CREATE TABLE linkedin_engagement (
        user_id INT PRIMARY KEY,
        professional_industry VARCHAR(50),
        monthly_posts INT,
        monthly_connections INT,
        engagement_score DECIMAL(5,2),
        premium_status VARCHAR(20)
    );
      INSERT INTO linkedin_engagement  VALUES
      (1, 'Technology', 25, 45, 82.50, 'Premium'),
      (2, 'Finance', 18, 38, 78.25, 'Free'),
      (3, 'Healthcare', 22, 42, 79.80, 'Premium'),
      (4, 'Education', 15, 28, 68.40, 'Free'),
      (5, 'Consulting', 28, 52, 85.60, 'Premium'),
      (7, 'Technology_v1', 35, 55, 82.60, 'Premium_v1'),
      (9, 'Finance_v2', 38, 58, 78.45, 'Free_v2'),
      (11, 'Healthcare_v3', 52, 72, 80.10, 'Premium_v3'),
      (13, 'Education_v4', 55, 68, 68.80, 'Free_v4'),
      (15, 'Consulting_v5', 78, 102, 86.10, 'Premium_v5'),
      (12, 'Technology_v6', 85, 105, 83.10, 'Premium_v6'),
      (14, 'Finance_v7', 88, 108, 78.95, 'Free_v7'),
      (16, 'Healthcare_v8', 102, 122, 80.60, 'Premium_v8'),
      (18, 'Education_v9', 105, 118, 69.30, 'Free_v9'),
      (20, 'Consulting_v10', 128, 152, 86.60, 'Premium_v10'),
      (17, 'Technology_v11', 135, 155, 83.60, 'Premium_v11'),
      (19, 'Finance_v12', 138, 158, 79.45, 'Free_v12'),
      (21, 'Healthcare_v13', 152, 172, 81.10, 'Premium_v13'),
      (23, 'Education_v14', 155, 168, 69.80, 'Free_v14'),
      (25, 'Consulting_v15', 178, 202, 87.10, 'Premium_v15'),
      (22, 'Technology_v16', 185, 205, 84.10, 'Premium_v16'),
      (24, 'Finance_v17', 188, 208, 79.95, 'Free_v17'),
      (26, 'Healthcare_v18', 202, 222, 81.60, 'Premium_v18'),
      (28, 'Education_v19', 205, 218, 70.30, 'Free_v19'),
      (30, 'Consulting_v20', 228, 252, 87.60, 'Premium_v20');

-- ============================================
-- Problem: Manufacturing Quality Control Analysis
-- Slug: ford-vehicle-sales-performance
-- ============================================

CREATE TABLE production_lines (
    line_id INT PRIMARY KEY,
    line_name VARCHAR(100),
    product_type VARCHAR(50),
    capacity_per_hour INT,
    supervisor VARCHAR(100)
);

CREATE TABLE quality_inspections (
    inspection_id INT PRIMARY KEY,
    line_id INT,
    inspection_date DATE,
    units_produced INT,
    units_passed INT,
    defect_type VARCHAR(50),
    defect_count INT,
    inspector_name VARCHAR(100),
    FOREIGN KEY (line_id) REFERENCES production_lines(line_id)
);

INSERT INTO production_lines VALUES
(1, 'Assembly Line A', 'Electronics', 100, 'Maria Garcia'),
(2, 'Assembly Line B', 'Electronics', 120, 'James Wilson'),
(3, 'Packaging Line 1', 'Consumer Goods', 200, 'Sarah Johnson'),
(4, 'Packaging Line 2', 'Consumer Goods', 180, 'David Chen');

INSERT INTO quality_inspections VALUES
(1, 1, '2024-05-01', 800, 785, 'Component Failure', 15, 'Inspector A'),
(2, 1, '2024-05-02', 820, 810, 'Assembly Error', 10, 'Inspector A'),
(3, 2, '2024-05-01', 960, 945, 'Component Failure', 12, 'Inspector B'),
(4, 2, '2024-05-02', 940, 932, 'Wiring Issue', 8, 'Inspector B'),
(5, 3, '2024-05-01', 1600, 1590, 'Packaging Defect', 10, 'Inspector C'),
(6, 3, '2024-05-02', 1580, 1575, 'Label Error', 5, 'Inspector C'),
(7, 4, '2024-05-01', 1440, 1430, 'Packaging Defect', 8, 'Inspector D'),
(8, 4, '2024-05-02', 1460, 1455, 'Seal Issue', 5, 'Inspector D');

-- ============================================
-- Problem: Mastercard Global Payment Network Analytics
-- Slug: mastercard-portfolio-analytics
-- ============================================
CREATE TABLE mastercard_network (
        region_id INT PRIMARY KEY,
        region VARCHAR(50),
        monthly_volume BIGINT,
        fraud_incidents INT,
        failed_transactions INT,
        revenue DECIMAL(8,2),
        processing_cost DECIMAL(8,2),
        network_date DATE
    );
      INSERT INTO mastercard_network  VALUES
      (1, 'North America', 25000000000, 125000, 50000000, 8500.50, 1200.00, '2024-01-15'),
      (2, 'Europe', 18000000000, 95000, 36000000, 6200.75, 950.00, '2024-01-15'),
      (3, 'Asia Pacific', 22000000000, 180000, 88000000, 4800.25, 1100.00, '2024-01-16'),
      (4, 'Latin America', 8500000000, 65000, 25500000, 1850.80, 420.00, '2024-01-16'),
      (5, 'Middle East Africa', 4200000000, 42000, 12600000, 950.60, 185.00, '2024-01-17'),
      (7, 'North America_v1', 25000000010, 125010, 50000010, 8500.60, 1200.10, '2024-01-16'),
      (9, 'Europe_v2', 18000000020, 95020, 36000020, 6200.95, 950.20, '2024-01-17'),
      (11, 'Asia Pacific_v3', 22000000030, 180030, 88000030, 4800.55, 1100.30, '2024-01-19'),
      (13, 'Latin America_v4', 8500000040, 65040, 25500040, 1851.20, 420.40, '2024-01-20'),
      (15, 'Middle East Africa_v5', 4200000050, 42050, 12600050, 951.10, 185.50, '2024-01-22'),
      (12, 'North America_v6', 25000000060, 125060, 50000060, 8501.10, 1200.60, '2024-01-21'),
      (14, 'Europe_v7', 18000000070, 95070, 36000070, 6201.45, 950.70, '2024-01-22'),
      (16, 'Asia Pacific_v8', 22000000080, 180080, 88000080, 4801.05, 1100.80, '2024-01-24'),
      (18, 'Latin America_v9', 8500000090, 65090, 25500090, 1851.70, 420.90, '2024-01-25'),
      (20, 'Middle East Africa_v10', 4200000100, 42100, 12600100, 951.60, 186.00, '2024-01-27'),
      (17, 'North America_v11', 25000000110, 125110, 50000110, 8501.60, 1201.10, '2024-01-26'),
      (19, 'Europe_v12', 18000000120, 95120, 36000120, 6201.95, 951.20, '2024-01-27'),
      (21, 'Asia Pacific_v13', 22000000130, 180130, 88000130, 4801.55, 1101.30, '2024-01-29'),
      (23, 'Latin America_v14', 8500000140, 65140, 25500140, 1852.20, 421.40, '2024-01-30'),
      (25, 'Middle East Africa_v15', 4200000150, 42150, 12600150, 952.10, 186.50, '2024-02-01'),
      (22, 'North America_v16', 25000000160, 125160, 50000160, 8502.10, 1201.60, '2024-01-31'),
      (24, 'Europe_v17', 18000000170, 95170, 36000170, 6202.45, 951.70, '2024-02-01'),
      (26, 'Asia Pacific_v18', 22000000180, 180180, 88000180, 4802.05, 1101.80, '2024-02-03'),
      (28, 'Latin America_v19', 8500000190, 65190, 25500190, 1852.70, 421.90, '2024-02-04'),
      (30, 'Middle East Africa_v20', 4200000200, 42200, 12600200, 952.60, 187.00, '2024-02-06');

-- ============================================
-- Problem: McKinsey Client Engagement Analysis
-- Slug: mckinsey-client-engagement-analysis
-- ============================================
CREATE TABLE client_engagements (
          engagement_id INT PRIMARY KEY,
          industry_vertical VARCHAR(50),
          engagement_duration_months INT,
          team_size INT,
          client_satisfaction_score DECIMAL(3,2)
      );
      INSERT INTO client_engagements  VALUES
      (1, 'Financial Services', 8, 12, 4.2),
      (2, 'Technology', 6, 8, 4.6),
      (3, 'Healthcare', 12, 15, 4.1),
      (4, 'Manufacturing', 9, 10, 4.4),
      (5, 'Energy', 15, 18, 3.9),
      (7, 'Financial Services_v1', 18, 22, 4.30),
      (9, 'Technology_v2', 26, 28, 4.80),
      (11, 'Healthcare_v3', 42, 45, 4.40),
      (13, 'Manufacturing_v4', 49, 50, 4.80),
      (15, 'Energy_v5', 65, 68, 4.40),
      (12, 'Financial Services_v6', 68, 72, 4.80),
      (14, 'Technology_v7', 76, 78, 5.30),
      (16, 'Healthcare_v8', 92, 95, 4.90),
      (18, 'Manufacturing_v9', 99, 100, 5.30),
      (20, 'Energy_v10', 115, 118, 4.90),
      (17, 'Financial Services_v11', 118, 122, 5.30),
      (19, 'Technology_v12', 126, 128, 5.80),
      (21, 'Healthcare_v13', 142, 145, 5.40),
      (23, 'Manufacturing_v14', 149, 150, 5.80),
      (25, 'Energy_v15', 165, 168, 5.40),
      (22, 'Financial Services_v16', 168, 172, 5.80),
      (24, 'Technology_v17', 176, 178, 6.30),
      (26, 'Healthcare_v18', 192, 195, 5.90),
      (28, 'Manufacturing_v19', 199, 200, 6.30),
      (30, 'Energy_v20', 215, 218, 5.90);

-- ============================================
-- Problem: Morgan Stanley Institutional Securities Analytics
-- Slug: intesa-sanpaolo-risk-management-system
-- ============================================
CREATE TABLE morganstanley_institutional_securities (
        desk_id INT PRIMARY KEY,
        trading_desk VARCHAR(50),
        monthly_trading_volume DECIMAL(12,2),
        spread_capture_bps INT,
        client_revenue DECIMAL(10,2),
        market_share_pct DECIMAL(5,2),
        risk_adjusted_return DECIMAL(6,3),
        client_satisfaction_score DECIMAL(3,1),
        trader_count INT,
        technology_score DECIMAL(3,1),
        desk_date DATE
    );
      INSERT INTO morganstanley_institutional_securities VALUES
    (1, 'Equity Trading', 125000.00, 28, 485000.00, 12.5, 0.225, 8.8, 85, 9.2, '2024-01-15'),
    (2, 'Fixed Income', 185000.00, 35, 685000.00, 18.2, 0.285, 9.1, 120, 9.5, '2024-01-15'),
    (3, 'Foreign Exchange', 95000.00, 15, 285000.00, 8.5, 0.195, 8.5, 45, 8.8, '2024-01-16'),
    (4, 'Prime Brokerage', 85000.00, 45, 425000.00, 15.8, 0.325, 9.0, 65, 9.1, '2024-01-16'),
    (5, 'Derivatives Trading', 65000.00, 32, 385000.00, 22.5, 0.285, 8.9, 75, 9.3, '2024-01-17'),
    (7, 'Equity Trading_v1', 125000.10, 38, 485000.10, 12.60, 0.33, 8.90, 95, 9.30, '2024-01-16'),
    (9, 'Fixed Income_v2', 185000.20, 55, 685000.20, 18.40, 0.48, 9.30, 140, 9.70, '2024-01-17'),
    (11, 'Foreign Exchange_v3', 95000.30, 45, 285000.30, 8.80, 0.50, 8.80, 75, 9.10, '2024-01-19'),
    (13, 'Prime Brokerage_v4', 85000.40, 85, 425000.40, 16.20, 0.73, 9.40, 105, 9.50, '2024-01-20'),
    (15, 'Derivatives Trading_v5', 65000.50, 82, 385000.50, 23.00, 0.78, 9.40, 125, 9.80, '2024-01-22'),
    (12, 'Equity Trading_v6', 125000.60, 88, 485000.60, 13.10, 0.83, 9.40, 145, 9.80, '2024-01-21'),
    (14, 'Fixed Income_v7', 185000.70, 105, 685000.70, 18.90, 0.99, 9.80, 190, 10.20, '2024-01-22'),
    (16, 'Foreign Exchange_v8', 95000.80, 95, 285000.80, 9.30, 1.00, 9.30, 125, 9.60, '2024-01-24'),
    (18, 'Prime Brokerage_v9', 85000.90, 135, 425000.90, 16.70, 1.23, 9.90, 155, 10.00, '2024-01-25'),
    (20, 'Derivatives Trading_v10', 65001.00, 132, 385001.00, 23.50, 1.28, 9.90, 175, 10.30, '2024-01-27'),
    (17, 'Equity Trading_v11', 125001.10, 138, 485001.10, 13.60, 1.33, 9.90, 195, 10.30, '2024-01-26'),
    (19, 'Fixed Income_v12', 185001.20, 155, 685001.20, 19.40, 1.49, 10.30, 240, 10.70, '2024-01-27'),
    (21, 'Foreign Exchange_v13', 95001.30, 145, 285001.30, 9.80, 1.50, 9.80, 175, 10.10, '2024-01-29'),
    (23, 'Prime Brokerage_v14', 85001.40, 185, 425001.40, 17.20, 1.73, 10.40, 205, 10.50, '2024-01-30'),
    (25, 'Derivatives Trading_v15', 65001.50, 182, 385001.50, 24.00, 1.78, 10.40, 225, 10.80, '2024-02-01'),
    (22, 'Equity Trading_v16', 125001.60, 188, 485001.60, 14.10, 1.83, 10.40, 245, 10.80, '2024-01-31'),
    (24, 'Fixed Income_v17', 185001.70, 205, 685001.70, 19.90, 1.99, 10.80, 290, 11.20, '2024-02-01'),
    (26, 'Foreign Exchange_v18', 95001.80, 195, 285001.80, 10.30, 2.00, 10.30, 225, 10.60, '2024-02-03'),
    (28, 'Prime Brokerage_v19', 85001.90, 235, 425001.90, 17.70, 2.23, 10.90, 255, 11.00, '2024-02-04'),
    (30, 'Derivatives Trading_v20', 65002.00, 232, 385002.00, 24.50, 2.29, 10.90, 275, 11.30, '2024-02-06');

-- ============================================
-- Problem: Movie Recommendation Engine
-- Slug: movie-recommendation-engine
-- ============================================
CREATE TABLE movies (
          movie_id INT,
          title VARCHAR(100),
          genre VARCHAR(50),
          release_year INT,
          avg_rating DECIMAL(8,2)
      );
      INSERT INTO movies VALUES
    (1, 'Top Gun Maverick', 'Action', 2022, 4.5),
    (2, 'The Batman', 'Action', 2022, 4.2),
    (3, 'Frozen 2', 'Animation', 2019, 4.3),
    (4, 'John Wick 4', 'Action', 2023, 4.4),
    (5, 'Encanto', 'Animation', 2021, 4.1),
    (6, 'Fast X', 'Action', 2023, 3.8),
    (8, 'Top Gun Maverick_v1', 'Action_v1', 2032, 4.60),
    (10, 'The Batman_v2', 'Action_v2', 2042, 4.40),
    (12, 'Frozen 203', 'Animation_v3', 2049, 4.60),
    (14, 'John Wick 404', 'Action_v4', 2063, 4.80),
    (16, 'Encanto_v5', 'Animation_v5', 2071, 4.60),
    (18, 'Fast X_v6', 'Action_v6', 2083, 4.40),
    (15, 'Top Gun Maverick_v7', 'Action_v7', 2092, 5.20),
    (17, 'The Batman_v8', 'Action_v8', 2102, 5.00),
    (19, 'Frozen 209', 'Animation_v9', 2109, 5.20),
    (20, 'John Wick 410', 'Action_v10', 2123, 5.40),
    (22, 'Encanto_v11', 'Animation_v11', 2131, 5.20),
    (24, 'Fast X_v12', 'Action_v12', 2143, 5.00),
    (21, 'Top Gun Maverick_v13', 'Action_v13', 2152, 5.80),
    (23, 'The Batman_v14', 'Action_v14', 2162, 5.60),
    (25, 'Frozen 215', 'Animation_v15', 2169, 5.80),
    (26, 'John Wick 416', 'Action_v16', 2183, 6.00),
    (28, 'Encanto_v17', 'Animation_v17', 2191, 5.80),
    (30, 'Fast X_v18', 'Action_v18', 2203, 5.60),
    (27, 'Top Gun Maverick_v19', 'Action_v19', 2212, 6.40);

-- ============================================
-- Problem: Netflix Content Strategy Analytics
-- Slug: microsoft-azure-cloud-analytics
-- ============================================
CREATE TABLE netflix_content_strategy (
        content_id INT PRIMARY KEY,
        content_genre VARCHAR(50),
        production_budget DECIMAL(10,2),
        viewer_engagement_score DECIMAL(5,2),
        total_viewing_hours BIGINT,
        subscriber_retention_impact DECIMAL(5,3),
        global_availability_score DECIMAL(4,2),
        awards_nominations INT,
        content_date DATE
    );
      INSERT INTO netflix_content_strategy  VALUES
      (1, 'Drama Series', 35000000.00, 87.5, 2500000000, 0.125, 9.2, 15, '2024-01-15'),
      (2, 'Comedy Specials', 15000000.00, 82.3, 450000000, 0.085, 8.8, 3, '2024-01-15'),
      (3, 'Documentary Films', 8000000.00, 91.2, 320000000, 0.155, 9.5, 8, '2024-01-16'),
      (4, 'Action Movies', 65000000.00, 79.8, 1800000000, 0.095, 8.5, 2, '2024-01-16'),
      (5, 'International Series', 25000000.00, 85.9, 1200000000, 0.142, 9.1, 12, '2024-01-17'),
      (7, 'Drama Series_v1', 35000000.10, 87.60, 2500000010, 0.23, 9.30, 25, '2024-01-16'),
      (9, 'Comedy Specials_v2', 15000000.20, 82.50, 450000020, 0.29, 9.00, 23, '2024-01-17'),
      (11, 'Documentary Films_v3', 8000000.30, 91.50, 320000030, 0.46, 9.80, 38, '2024-01-19'),
      (13, 'Action Movies_v4', 65000000.40, 80.20, 1800000040, 0.49, 8.90, 42, '2024-01-20'),
      (15, 'International Series_v5', 25000000.50, 86.40, 1200000050, 0.64, 9.60, 62, '2024-01-22'),
      (12, 'Drama Series_v6', 35000000.60, 88.10, 2500000060, 0.73, 9.80, 75, '2024-01-21'),
      (14, 'Comedy Specials_v7', 15000000.70, 83.00, 450000070, 0.79, 9.50, 73, '2024-01-22'),
      (16, 'Documentary Films_v8', 8000000.80, 92.00, 320000080, 0.96, 10.30, 88, '2024-01-24'),
      (18, 'Action Movies_v9', 65000000.90, 80.70, 1800000090, 0.99, 9.40, 92, '2024-01-25'),
      (20, 'International Series_v10', 25000001.00, 86.90, 1200000100, 1.14, 10.10, 112, '2024-01-27'),
      (17, 'Drama Series_v11', 35000001.10, 88.60, 2500000110, 1.23, 10.30, 125, '2024-01-26'),
      (19, 'Comedy Specials_v12', 15000001.20, 83.50, 450000120, 1.29, 10.00, 123, '2024-01-27'),
      (21, 'Documentary Films_v13', 8000001.30, 92.50, 320000130, 1.46, 10.80, 138, '2024-01-29'),
      (23, 'Action Movies_v14', 65000001.40, 81.20, 1800000140, 1.50, 9.90, 142, '2024-01-30'),
      (25, 'International Series_v15', 25000001.50, 87.40, 1200000150, 1.64, 10.60, 162, '2024-02-01'),
      (22, 'Drama Series_v16', 35000001.60, 89.10, 2500000160, 1.73, 10.80, 175, '2024-01-31'),
      (24, 'Comedy Specials_v17', 15000001.70, 84.00, 450000170, 1.79, 10.50, 173, '2024-02-01'),
      (26, 'Documentary Films_v18', 8000001.80, 93.00, 320000180, 1.96, 11.30, 188, '2024-02-03'),
      (28, 'Action Movies_v19', 65000001.90, 81.70, 1800000190, 2.00, 10.40, 192, '2024-02-04'),
      (30, 'International Series_v20', 25000002.00, 87.90, 1200000200, 2.14, 11.10, 212, '2024-02-06');

-- ============================================
-- Problem: Online Learning Platform Analytics
-- Slug: disney-revenue-analysis
-- ============================================

CREATE TABLE courses (
    course_id INT PRIMARY KEY,
    course_title VARCHAR(100),
    instructor VARCHAR(100),
    category VARCHAR(50),
    difficulty_level VARCHAR(20),
    price DECIMAL(8,2)
);

CREATE TABLE students (
    student_id INT PRIMARY KEY,
    student_name VARCHAR(100),
    email VARCHAR(100),
    registration_date DATE,
    subscription_type VARCHAR(20)
);

CREATE TABLE enrollments (
    enrollment_id INT PRIMARY KEY,
    student_id INT,
    course_id INT,
    enrollment_date DATE,
    completion_status VARCHAR(20),
    progress_percentage INT,
    hours_studied DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

INSERT INTO courses VALUES
(1, 'Python for Beginners', 'Dr. Sarah Johnson', 'Programming', 'Beginner', 99.99),
(2, 'Advanced SQL Queries', 'Prof. Mike Chen', 'Database', 'Advanced', 149.99),
(3, 'Web Development Basics', 'Lisa Rodriguez', 'Web Dev', 'Beginner', 79.99),
(4, 'Data Science Fundamentals', 'Dr. Alex Kim', 'Data Science', 'Intermediate', 199.99);

INSERT INTO students VALUES
(1, 'John Smith', 'john@email.com', '2024-01-15', 'Premium'),
(2, 'Emma Wilson', 'emma@email.com', '2024-02-20', 'Basic'),
(3, 'David Brown', 'david@email.com', '2024-03-10', 'Premium'),
(4, 'Jessica Lee', 'jessica@email.com', '2024-01-25', 'Basic'),
(5, 'Mark Taylor', 'mark@email.com', '2024-04-05', 'Premium');

INSERT INTO enrollments VALUES
(1, 1, 1, '2024-05-01', 'Completed', 100, 25.5),
(2, 1, 3, '2024-05-05', 'In Progress', 60, 15.0),
(3, 2, 1, '2024-05-02', 'Completed', 100, 30.0),
(4, 3, 2, '2024-05-03', 'In Progress', 75, 40.5),
(5, 3, 4, '2024-05-04', 'Completed', 100, 50.0),
(6, 4, 3, '2024-05-06', 'In Progress', 45, 12.0),
(7, 5, 1, '2024-05-07', 'Completed', 100, 28.0),
(8, 5, 2, '2024-05-08', 'In Progress', 30, 18.5);

-- ============================================
-- Problem: Oracle Enterprise Software Analytics
-- Slug: morgan-stanley-portfolio-analytics
-- ============================================
CREATE TABLE oracle_enterprise_software (
        customer_id INT PRIMARY KEY,
        industry_vertical VARCHAR(50),
        annual_contract_value DECIMAL(10,2),
        software_utilization_rate DECIMAL(5,2),
        cloud_migration_progress DECIMAL(5,2),
        support_tickets_monthly INT,
        user_satisfaction_score DECIMAL(4,2),
        expansion_revenue DECIMAL(10,2),
        contract_date DATE
    );
      INSERT INTO oracle_enterprise_software  VALUES
      (1, 'Financial Services', 2500000.00, 82.5, 95.2, 45, 8.7, 450000.00, '2024-01-15'),
      (2, 'Manufacturing', 1200000.00, 78.3, 87.5, 62, 8.2, 185000.00, '2024-01-15'),
      (3, 'Healthcare', 850000.00, 91.2, 92.8, 28, 9.1, 325000.00, '2024-01-16'),
      (4, 'Retail & E-commerce', 675000.00, 76.8, 82.4, 55, 7.9, 125000.00, '2024-01-16'),
      (5, 'Government', 1800000.00, 68.5, 78.9, 82, 7.5, 95000.00, '2024-01-17'),
      (7, 'Financial Services_v1', 2500000.10, 82.60, 95.30, 55, 8.80, 450000.10, '2024-01-16'),
      (9, 'Manufacturing_v2', 1200000.20, 78.50, 87.70, 82, 8.40, 185000.20, '2024-01-17'),
      (11, 'Healthcare_v3', 850000.30, 91.50, 93.10, 58, 9.40, 325000.30, '2024-01-19'),
      (13, 'Retail & E-commerce_v4', 675000.40, 77.20, 82.80, 95, 8.30, 125000.40, '2024-01-20'),
      (15, 'Government_v5', 1800000.50, 69.00, 79.40, 132, 8.00, 95000.50, '2024-01-22'),
      (12, 'Financial Services_v6', 2500000.60, 83.10, 95.80, 105, 9.30, 450000.60, '2024-01-21'),
      (14, 'Manufacturing_v7', 1200000.70, 79.00, 88.20, 132, 8.90, 185000.70, '2024-01-22'),
      (16, 'Healthcare_v8', 850000.80, 92.00, 93.60, 108, 9.90, 325000.80, '2024-01-24'),
      (18, 'Retail & E-commerce_v9', 675000.90, 77.70, 83.30, 145, 8.80, 125000.90, '2024-01-25'),
      (20, 'Government_v10', 1800001.00, 69.50, 79.90, 182, 8.50, 95001.00, '2024-01-27'),
      (17, 'Financial Services_v11', 2500001.10, 83.60, 96.30, 155, 9.80, 450001.10, '2024-01-26'),
      (19, 'Manufacturing_v12', 1200001.20, 79.50, 88.70, 182, 9.40, 185001.20, '2024-01-27'),
      (21, 'Healthcare_v13', 850001.30, 92.50, 94.10, 158, 10.40, 325001.30, '2024-01-29'),
      (23, 'Retail & E-commerce_v14', 675001.40, 78.20, 83.80, 195, 9.30, 125001.40, '2024-01-30'),
      (25, 'Government_v15', 1800001.50, 70.00, 80.40, 232, 9.00, 95001.50, '2024-02-01'),
      (22, 'Financial Services_v16', 2500001.60, 84.10, 96.80, 205, 10.30, 450001.60, '2024-01-31'),
      (24, 'Manufacturing_v17', 1200001.70, 80.00, 89.20, 232, 9.90, 185001.70, '2024-02-01'),
      (26, 'Healthcare_v18', 850001.80, 93.00, 94.60, 208, 10.90, 325001.80, '2024-02-03'),
      (28, 'Retail & E-commerce_v19', 675001.90, 78.70, 84.30, 245, 9.80, 125001.90, '2024-02-04'),
      (30, 'Government_v20', 1800002.00, 70.50, 80.90, 282, 9.50, 95002.00, '2024-02-06');

-- ============================================
-- Problem: PayPal Digital Payments Analytics
-- Slug: merck-drug-development-pipeline
-- ============================================
CREATE TABLE paypal_transactions (
        transaction_id INT PRIMARY KEY,
        merchant_category VARCHAR(50),
        transaction_amount DECIMAL(10,2),
        payment_method VARCHAR(30),
        merchant_tier VARCHAR(20),
        transaction_date DATE
    );
      INSERT INTO paypal_transactions  VALUES
      (1, 'E-commerce Retail', 185.50, 'Credit Card', 'Premium', '2024-01-15'),
      (2, 'Professional Services', 420.75, 'PayPal Balance', 'Business', '2024-01-15'),
      (3, 'Software & SaaS', 89.25, 'Bank Transfer', 'Standard', '2024-01-16'),
      (4, 'Digital Marketing', 350.80, 'Credit Card', 'Premium', '2024-01-16'),
      (5, 'Consulting', 275.60, 'PayPal Balance', 'Business', '2024-01-17'),
      (7, 'E-commerce Retail_v1', 185.60, 'Credit Card_v1', 'Premium_v1', '2024-01-16'),
      (9, 'Professional Services_v2', 420.95, 'PayPal Balance_v2', 'Business_v2', '2024-01-17'),
      (11, 'Software & SaaS_v3', 89.55, 'Bank Transfer_v3', 'Standard_v3', '2024-01-19'),
      (13, 'Digital Marketing_v4', 351.20, 'Credit Card_v4', 'Premium_v4', '2024-01-20'),
      (15, 'Consulting_v5', 276.10, 'PayPal Balance_v5', 'Business_v5', '2024-01-22'),
      (12, 'E-commerce Retail_v6', 186.10, 'Credit Card_v6', 'Premium_v6', '2024-01-21'),
      (14, 'Professional Services_v7', 421.45, 'PayPal Balance_v7', 'Business_v7', '2024-01-22'),
      (16, 'Software & SaaS_v8', 90.05, 'Bank Transfer_v8', 'Standard_v8', '2024-01-24'),
      (18, 'Digital Marketing_v9', 351.70, 'Credit Card_v9', 'Premium_v9', '2024-01-25'),
      (20, 'Consulting_v10', 276.60, 'PayPal Balance_v10', 'Business_v10', '2024-01-27'),
      (17, 'E-commerce Retail_v11', 186.60, 'Credit Card_v11', 'Premium_v11', '2024-01-26'),
      (19, 'Professional Services_v12', 421.95, 'PayPal Balance_v12', 'Business_v12', '2024-01-27'),
      (21, 'Software & SaaS_v13', 90.55, 'Bank Transfer_v13', 'Standard_v13', '2024-01-29'),
      (23, 'Digital Marketing_v14', 352.20, 'Credit Card_v14', 'Premium_v14', '2024-01-30'),
      (25, 'Consulting_v15', 277.10, 'PayPal Balance_v15', 'Business_v15', '2024-02-01'),
      (22, 'E-commerce Retail_v16', 187.10, 'Credit Card_v16', 'Premium_v16', '2024-01-31'),
      (24, 'Professional Services_v17', 422.45, 'PayPal Balance_v17', 'Business_v17', '2024-02-01'),
      (26, 'Software & SaaS_v18', 91.05, 'Bank Transfer_v18', 'Standard_v18', '2024-02-03'),
      (28, 'Digital Marketing_v19', 352.70, 'Credit Card_v19', 'Premium_v19', '2024-02-04'),
      (30, 'Consulting_v20', 277.60, 'PayPal Balance_v20', 'Business_v20', '2024-02-06');

-- ============================================
-- Problem: Pinterest Content Engagement Analytics
-- Slug: netflix-revenue-analysis
-- ============================================
CREATE TABLE pinterest_content (
        pin_id INT PRIMARY KEY,
        content_category VARCHAR(50),
        impressions INT,
        engagements INT,
        saves INT,
        clicks INT,
        pin_date DATE
    );
      INSERT INTO pinterest_content  VALUES
      (1, 'Home Design', 125000, 22500, 8500, 4200, '2024-01-15'),
      (2, 'Fashion & Style', 185000, 28750, 12000, 6500, '2024-01-15'),
      (3, 'Food & Recipes', 95000, 18500, 7200, 3800, '2024-01-16'),
      (4, 'Travel & Places', 145000, 21250, 9500, 5100, '2024-01-16'),
      (5, 'DIY & Crafts', 75000, 12500, 5800, 2900, '2024-01-17'),
      (7, 'Home Design_v1', 125010, 22510, 8510, 4210, '2024-01-16'),
      (9, 'Fashion & Style_v2', 185020, 28770, 12020, 6520, '2024-01-17'),
      (11, 'Food & Recipes_v3', 95030, 18530, 7230, 3830, '2024-01-19'),
      (13, 'Travel & Places_v4', 145040, 21290, 9540, 5140, '2024-01-20'),
      (15, 'DIY & Crafts_v5', 75050, 12550, 5850, 2950, '2024-01-22'),
      (12, 'Home Design_v6', 125060, 22560, 8560, 4260, '2024-01-21'),
      (14, 'Fashion & Style_v7', 185070, 28820, 12070, 6570, '2024-01-22'),
      (16, 'Food & Recipes_v8', 95080, 18580, 7280, 3880, '2024-01-24'),
      (18, 'Travel & Places_v9', 145090, 21340, 9590, 5190, '2024-01-25'),
      (20, 'DIY & Crafts_v10', 75100, 12600, 5900, 3000, '2024-01-27'),
      (17, 'Home Design_v11', 125110, 22610, 8610, 4310, '2024-01-26'),
      (19, 'Fashion & Style_v12', 185120, 28870, 12120, 6620, '2024-01-27'),
      (21, 'Food & Recipes_v13', 95130, 18630, 7330, 3930, '2024-01-29'),
      (23, 'Travel & Places_v14', 145140, 21390, 9640, 5240, '2024-01-30'),
      (25, 'DIY & Crafts_v15', 75150, 12650, 5950, 3050, '2024-02-01'),
      (22, 'Home Design_v16', 125160, 22660, 8660, 4360, '2024-01-31'),
      (24, 'Fashion & Style_v17', 185170, 28920, 12170, 6670, '2024-02-01'),
      (26, 'Food & Recipes_v18', 95180, 18680, 7380, 3980, '2024-02-03'),
      (28, 'Travel & Places_v19', 145190, 21440, 9690, 5290, '2024-02-04'),
      (30, 'DIY & Crafts_v20', 75200, 12700, 6000, 3100, '2024-02-06');

-- ============================================
-- Problem: Product Inventory Status
-- Slug: product-inventory-status
-- ============================================
CREATE TABLE inventory (
          product_id INT,
          product_name VARCHAR(100),
          quantity INT,
          reorder_point INT
      );
      INSERT INTO inventory  VALUES
      (1, 'Wireless Headphones', 0, 20),
      (2, 'Bluetooth Speaker', 15, 25),
      (3, 'Laptop Stand', 75, 30),
      (4, 'USB Cable', 5, 50),
      (5, 'Phone Case', 100, 40),
      (6, 'Screen Protector', 0, 20),
      (8, 'Wireless Headphones_v1', 10, 30),
      (10, 'Bluetooth Speaker_v2', 35, 45),
      (12, 'Laptop Stand_v3', 105, 60),
      (14, 'USB Cable_v4', 45, 90),
      (16, 'Phone Case_v5', 150, 90),
      (18, 'Screen Protector_v6', 60, 80),
      (14, 'Wireless Headphones_v7', 70, 90),
      (16, 'Bluetooth Speaker_v8', 95, 105),
      (18, 'Laptop Stand_v9', 165, 120),
      (20, 'USB Cable_v10', 105, 150),
      (22, 'Phone Case_v11', 210, 150),
      (24, 'Screen Protector_v12', 120, 140),
      (20, 'Wireless Headphones_v13', 130, 150),
      (22, 'Bluetooth Speaker_v14', 155, 165),
      (24, 'Laptop Stand_v15', 225, 180),
      (26, 'USB Cable_v16', 165, 210),
      (28, 'Phone Case_v17', 270, 210),
      (30, 'Screen Protector_v18', 180, 200),
      (26, 'Wireless Headphones_v19', 190, 210);

-- ============================================
-- Problem: Real Estate Market Analysis
-- Slug: home-depot-revenue-analysis
-- ============================================

CREATE TABLE neighborhoods (
    neighborhood_id INT PRIMARY KEY,
    neighborhood_name VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    avg_income DECIMAL(10,2)
);

CREATE TABLE properties (
    property_id INT PRIMARY KEY,
    neighborhood_id INT,
    property_type VARCHAR(50),
    bedrooms INT,
    bathrooms DECIMAL(3,1),
    square_feet INT,
    sale_price DECIMAL(12,2),
    sale_date DATE,
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(neighborhood_id)
);

INSERT INTO neighborhoods VALUES
(1, 'Downtown', 'Seattle', 'WA', 85000.00),
(2, 'Suburb Hills', 'Seattle', 'WA', 95000.00),
(3, 'Riverside', 'Seattle', 'WA', 75000.00),
(4, 'Tech District', 'Seattle', 'WA', 120000.00);

INSERT INTO properties VALUES
(1, 1, 'Condo', 2, 2.0, 1200, 650000.00, '2024-04-15'),
(2, 1, 'Condo', 1, 1.0, 800, 450000.00, '2024-04-18'),
(3, 2, 'Single Family', 4, 3.0, 2500, 850000.00, '2024-04-20'),
(4, 2, 'Single Family', 3, 2.5, 2000, 720000.00, '2024-04-22'),
(5, 3, 'Townhouse', 3, 2.5, 1800, 580000.00, '2024-04-25'),
(6, 3, 'Townhouse', 2, 2.0, 1500, 480000.00, '2024-04-28'),
(7, 4, 'Condo', 2, 2.0, 1100, 780000.00, '2024-05-01'),
(8, 4, 'Single Family', 3, 2.5, 1900, 920000.00, '2024-05-03');

-- ============================================
-- Problem: Renaissance Technologies Quantitative Alpha
-- Slug: renaissance-technologies-quantitative-alpha
-- ============================================
CREATE TABLE renaissance_strategies (
        strategy_id INT PRIMARY KEY,
        strategy_name VARCHAR(100),
        asset_class VARCHAR(50),
        daily_return DECIMAL(8,6),
        volatility DECIMAL(8,6),
        benchmark_return DECIMAL(8,6),
        risk_free_rate DECIMAL(8,6),
        max_drawdown DECIMAL(8,6),
        trade_date DATE
    );
      INSERT INTO renaissance_strategies VALUES
    (1, 'Statistical Arbitrage Alpha', 'US Equities', 0.0125, 0.0180, 0.0085, 0.000350, 0.0650, '2024-01-15'),
    (2, 'Mean Reversion Capture', 'International Equities', 0.0095, 0.0145, 0.0065, 0.000350, 0.0720, '2024-01-15'),
    (3, 'Cross-Asset Momentum', 'Multi-Asset', 0.0145, 0.0165, 0.0090, 0.000350, 0.0580, '2024-01-16'),
    (4, 'Volatility Surface Arbitrage', 'Options', 0.0165, 0.0195, 0.0085, 0.000350, 0.0850, '2024-01-16'),
    (5, 'Market Microstructure', 'US Equities', 0.0185, 0.0175, 0.0085, 0.000350, 0.0450, '2024-01-17'),
    (7, 'Statistical Arbitrage Alpha_v1', 'US Equities_v1', 0.11, 0.12, 0.11, 0.10, 0.17, '2024-01-16'),
    (9, 'Mean Reversion Capture_v2', 'International Equities_v2', 0.21, 0.21, 0.21, 0.20, 0.27, '2024-01-17'),
    (11, 'Cross-Asset Momentum_v3', 'Multi-Asset_v3', 0.31, 0.32, 0.31, 0.30, 0.36, '2024-01-19'),
    (13, 'Volatility Surface Arbitrage_v4', 'Options_v4', 0.42, 0.42, 0.41, 0.40, 0.49, '2024-01-20'),
    (15, 'Market Microstructure_v5', 'US Equities_v5', 0.52, 0.52, 0.51, 0.50, 0.55, '2024-01-22'),
    (12, 'Statistical Arbitrage Alpha_v6', 'US Equities_v6', 0.61, 0.62, 0.61, 0.60, 0.67, '2024-01-21'),
    (14, 'Mean Reversion Capture_v7', 'International Equities_v7', 0.71, 0.71, 0.71, 0.70, 0.77, '2024-01-22'),
    (16, 'Cross-Asset Momentum_v8', 'Multi-Asset_v8', 0.81, 0.82, 0.81, 0.80, 0.86, '2024-01-24'),
    (18, 'Volatility Surface Arbitrage_v9', 'Options_v9', 0.92, 0.92, 0.91, 0.90, 0.98, '2024-01-25'),
    (20, 'Market Microstructure_v10', 'US Equities_v10', 1.02, 1.02, 1.01, 1.00, 1.04, '2024-01-27'),
    (17, 'Statistical Arbitrage Alpha_v11', 'US Equities_v11', 1.11, 1.12, 1.11, 1.10, 1.17, '2024-01-26'),
    (19, 'Mean Reversion Capture_v12', 'International Equities_v12', 1.21, 1.21, 1.21, 1.20, 1.27, '2024-01-27'),
    (21, 'Cross-Asset Momentum_v13', 'Multi-Asset_v13', 1.31, 1.32, 1.31, 1.30, 1.36, '2024-01-29'),
    (23, 'Volatility Surface Arbitrage_v14', 'Options_v14', 1.42, 1.42, 1.41, 1.40, 1.49, '2024-01-30'),
    (25, 'Market Microstructure_v15', 'US Equities_v15', 1.52, 1.52, 1.51, 1.50, 1.54, '2024-02-01'),
    (22, 'Statistical Arbitrage Alpha_v16', 'US Equities_v16', 1.61, 1.62, 1.61, 1.60, 1.67, '2024-01-31'),
    (24, 'Mean Reversion Capture_v17', 'International Equities_v17', 1.71, 1.71, 1.71, 1.70, 1.77, '2024-02-01'),
    (26, 'Cross-Asset Momentum_v18', 'Multi-Asset_v18', 1.81, 1.82, 1.81, 1.80, 1.86, '2024-02-03'),
    (28, 'Volatility Surface Arbitrage_v19', 'Options_v19', 1.92, 1.92, 1.91, 1.90, 1.99, '2024-02-04'),
    (30, 'Market Microstructure_v20', 'US Equities_v20', 2.02, 2.02, 2.01, 2.00, 2.04, '2024-02-06');

-- ============================================
-- Problem: Restaurant Chain Sales Analysis
-- Slug: citibank-credit-card-fraud-detection
-- ============================================

CREATE TABLE restaurants (
    restaurant_id INT PRIMARY KEY,
    restaurant_name VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    opening_date DATE
);

CREATE TABLE menu_items (
    item_id INT PRIMARY KEY,
    item_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(6,2)
);

CREATE TABLE sales (
    sale_id INT PRIMARY KEY,
    restaurant_id INT,
    item_id INT,
    sale_date DATE,
    quantity INT,
    total_amount DECIMAL(8,2),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

INSERT INTO restaurants VALUES
(1, 'Downtown Bistro', 'New York', 'NY', '2022-01-15'),
(2, 'Sunset Grill', 'Los Angeles', 'CA', '2022-03-20'),
(3, 'City Center Cafe', 'Chicago', 'IL', '2022-02-10'),
(4, 'Harbor View Restaurant', 'Miami', 'FL', '2022-04-05');

INSERT INTO menu_items VALUES
(1, 'Grilled Salmon', 'Main Course', 24.99),
(2, 'Caesar Salad', 'Appetizer', 12.99),
(3, 'Chocolate Cake', 'Dessert', 8.99),
(4, 'Pasta Primavera', 'Main Course', 18.99),
(5, 'Chicken Wings', 'Appetizer', 14.99),
(6, 'Tiramisu', 'Dessert', 9.99);

INSERT INTO sales VALUES
(1, 1, 1, '2024-05-01', 2, 49.98),
(2, 1, 2, '2024-05-01', 1, 12.99),
(3, 2, 4, '2024-05-02', 3, 56.97),
(4, 2, 5, '2024-05-02', 2, 29.98),
(5, 3, 1, '2024-05-03', 1, 24.99),
(6, 3, 6, '2024-05-03', 2, 19.98),
(7, 4, 2, '2024-05-04', 2, 25.98),
(8, 4, 3, '2024-05-04', 1, 8.99),
(9, 1, 4, '2024-05-05', 2, 37.98),
(10, 2, 1, '2024-05-05', 1, 24.99);

-- ============================================
-- Problem: Salesforce CRM Performance Analytics
-- Slug: nike-product-sales-by-region
-- ============================================
CREATE TABLE salesforce_usage (
        org_id INT PRIMARY KEY,
        industry_vertical VARCHAR(50),
        monthly_active_users INT,
        total_licenses INT,
        feature_adoption_score DECIMAL(5,2),
        subscription_tier VARCHAR(20)
    );
      INSERT INTO salesforce_usage  VALUES
      (1, 'Financial Services', 750, 1000, 82.50, 'Enterprise'),
      (2, 'Healthcare', 420, 650, 78.25, 'Professional'),
      (3, 'Technology', 890, 1200, 85.80, 'Enterprise'),
      (4, 'Manufacturing', 380, 500, 68.40, 'Professional'),
      (5, 'Retail', 650, 850, 75.60, 'Enterprise'),
      (7, 'Financial Services_v1', 760, 1010, 82.60, 'Enterprise_v1'),
      (9, 'Healthcare_v2', 440, 670, 78.45, 'Professional_v2'),
      (11, 'Technology_v3', 920, 1230, 86.10, 'Enterprise_v3'),
      (13, 'Manufacturing_v4', 420, 540, 68.80, 'Professional_v4'),
      (15, 'Retail_v5', 700, 900, 76.10, 'Enterprise_v5'),
      (12, 'Financial Services_v6', 810, 1060, 83.10, 'Enterprise_v6'),
      (14, 'Healthcare_v7', 490, 720, 78.95, 'Professional_v7'),
      (16, 'Technology_v8', 970, 1280, 86.60, 'Enterprise_v8'),
      (18, 'Manufacturing_v9', 470, 590, 69.30, 'Professional_v9'),
      (20, 'Retail_v10', 750, 950, 76.60, 'Enterprise_v10'),
      (17, 'Financial Services_v11', 860, 1110, 83.60, 'Enterprise_v11'),
      (19, 'Healthcare_v12', 540, 770, 79.45, 'Professional_v12'),
      (21, 'Technology_v13', 1020, 1330, 87.10, 'Enterprise_v13'),
      (23, 'Manufacturing_v14', 520, 640, 69.80, 'Professional_v14'),
      (25, 'Retail_v15', 800, 1000, 77.10, 'Enterprise_v15'),
      (22, 'Financial Services_v16', 910, 1160, 84.10, 'Enterprise_v16'),
      (24, 'Healthcare_v17', 590, 820, 79.95, 'Professional_v17'),
      (26, 'Technology_v18', 1070, 1380, 87.60, 'Enterprise_v18'),
      (28, 'Manufacturing_v19', 570, 690, 70.30, 'Professional_v19'),
      (30, 'Retail_v20', 850, 1050, 77.60, 'Enterprise_v20');

-- ============================================
-- Problem: Salesforce Customer Success Analytics
-- Slug: salesforce-revenue-analysis
-- ============================================
CREATE TABLE salesforce_customer_success (
        account_id INT PRIMARY KEY,
        industry_vertical VARCHAR(50),
        monthly_active_users INT,
        feature_adoption_score DECIMAL(5,2),
        annual_contract_value DECIMAL(10,2),
        churn_risk_score DECIMAL(5,2),
        success_date DATE
    );
      INSERT INTO salesforce_customer_success  VALUES
      (1, 'Financial Services', 850, 82.50, 125000.50, 15.25, '2024-01-15'),
      (2, 'Healthcare', 620, 78.75, 89000.75, 22.80, '2024-01-15'),
      (3, 'Technology', 950, 85.60, 185000.25, 12.45, '2024-01-16'),
      (4, 'Manufacturing', 420, 68.40, 65000.80, 28.90, '2024-01-16'),
      (5, 'Retail', 720, 76.80, 98000.60, 18.75, '2024-01-17'),
      (7, 'Financial Services_v1', 860, 82.60, 125000.60, 15.35, '2024-01-16'),
      (9, 'Healthcare_v2', 640, 78.95, 89000.95, 23.00, '2024-01-17'),
      (11, 'Technology_v3', 980, 85.90, 185000.55, 12.75, '2024-01-19'),
      (13, 'Manufacturing_v4', 460, 68.80, 65001.20, 29.30, '2024-01-20'),
      (15, 'Retail_v5', 770, 77.30, 98001.10, 19.25, '2024-01-22'),
      (12, 'Financial Services_v6', 910, 83.10, 125001.10, 15.85, '2024-01-21'),
      (14, 'Healthcare_v7', 690, 79.45, 89001.45, 23.50, '2024-01-22'),
      (16, 'Technology_v8', 1030, 86.40, 185001.05, 13.25, '2024-01-24'),
      (18, 'Manufacturing_v9', 510, 69.30, 65001.70, 29.80, '2024-01-25'),
      (20, 'Retail_v10', 820, 77.80, 98001.60, 19.75, '2024-01-27'),
      (17, 'Financial Services_v11', 960, 83.60, 125001.60, 16.35, '2024-01-26'),
      (19, 'Healthcare_v12', 740, 79.95, 89001.95, 24.00, '2024-01-27'),
      (21, 'Technology_v13', 1080, 86.90, 185001.55, 13.75, '2024-01-29'),
      (23, 'Manufacturing_v14', 560, 69.80, 65002.20, 30.30, '2024-01-30'),
      (25, 'Retail_v15', 870, 78.30, 98002.10, 20.25, '2024-02-01'),
      (22, 'Financial Services_v16', 1010, 84.10, 125002.10, 16.85, '2024-01-31'),
      (24, 'Healthcare_v17', 790, 80.45, 89002.45, 24.50, '2024-02-01'),
      (26, 'Technology_v18', 1130, 87.40, 185002.05, 14.25, '2024-02-03'),
      (28, 'Manufacturing_v19', 610, 70.30, 65002.70, 30.80, '2024-02-04'),
      (30, 'Retail_v20', 920, 78.80, 98002.60, 20.75, '2024-02-06');

-- ============================================
-- Problem: Session Duration Analysis
-- Slug: session-duration-analysis
-- ============================================
CREATE TABLE user_sessions (
          session_id INT,
          user_id INT,
          start_time DATETIME,
          end_time DATETIME,
          videos_watched INT
      );
      INSERT INTO user_sessions  VALUES
      (1, 101, '2024-01-15 14:00:00', '2024-01-15 14:45:00', 3),
      (2, 102, '2024-01-15 15:00:00', '2024-01-15 15:20:00', 2),
      (3, 101, '2024-01-16 16:00:00', '2024-01-16 16:35:00', 4),
      (4, 103, '2024-01-16 17:00:00', '2024-01-16 18:30:00', 6),
      (5, 102, '2024-01-17 19:00:00', '2024-01-17 19:15:00', 1),
      (6, 101, '2024-01-17 20:00:00', '2024-01-17 20:40:00', 3),
      (7, 103, '2024-01-18 14:30:00', '2024-01-18 16:00:00', 8),
      (9, 111, '2024-01-15 14:00:00_v1', '2024-01-15 14:45:00_v1', 13),
      (11, 122, '2024-01-15 15:00:00_v2', '2024-01-15 15:20:00_v2', 22),
      (13, 131, '2024-01-16 16:00:00_v3', '2024-01-16 16:35:00_v3', 34),
      (15, 143, '2024-01-16 17:00:00_v4', '2024-01-16 18:30:00_v4', 46),
      (17, 152, '2024-01-17 19:00:00_v5', '2024-01-17 19:15:00_v5', 51),
      (19, 161, '2024-01-17 20:00:00_v6', '2024-01-17 20:40:00_v6', 63),
      (21, 173, '2024-01-18 14:30:00_v7', '2024-01-18 16:00:00_v7', 78),
      (16, 181, '2024-01-15 14:00:00_v8', '2024-01-15 14:45:00_v8', 83),
      (18, 192, '2024-01-15 15:00:00_v9', '2024-01-15 15:20:00_v9', 92),
      (20, 201, '2024-01-16 16:00:00_v10', '2024-01-16 16:35:00_v10', 104),
      (22, 213, '2024-01-16 17:00:00_v11', '2024-01-16 18:30:00_v11', 116),
      (24, 222, '2024-01-17 19:00:00_v12', '2024-01-17 19:15:00_v12', 121),
      (26, 231, '2024-01-17 20:00:00_v13', '2024-01-17 20:40:00_v13', 133),
      (28, 243, '2024-01-18 14:30:00_v14', '2024-01-18 16:00:00_v14', 148),
      (23, 251, '2024-01-15 14:00:00_v15', '2024-01-15 14:45:00_v15', 153),
      (25, 262, '2024-01-15 15:00:00_v16', '2024-01-15 15:20:00_v16', 162),
      (27, 271, '2024-01-16 16:00:00_v17', '2024-01-16 16:35:00_v17', 174),
      (29, 283, '2024-01-16 17:00:00_v18', '2024-01-16 18:30:00_v18', 186);

-- ============================================
-- Problem: Snapchat Social Media Engagement
-- Slug: oracle-revenue-analysis
-- ============================================
CREATE TABLE snapchat_engagement (
        user_id INT PRIMARY KEY,
        age_demographic VARCHAR(20),
        daily_minutes_active DECIMAL(6,2),
        snaps_sent INT,
        stories_viewed INT,
        discover_engagement INT
    );
      INSERT INTO snapchat_engagement  VALUES
      (1, '13-17', 62.50, 45, 28, 15),
      (2, '18-24', 58.25, 38, 32, 22),
      (3, '25-34', 42.80, 25, 18, 12),
      (4, '35-44', 28.40, 15, 12, 8),
      (5, '45+', 18.60, 8, 6, 4),
      (7, '13-17_v1', 62.60, 55, 38, 25),
      (9, '18-24_v2', 58.45, 58, 52, 42),
      (11, '25-34_v3', 43.10, 55, 48, 42),
      (13, '35-44_v4', 28.80, 55, 52, 48),
      (15, '45+_v5', 19.10, 58, 56, 54),
      (12, '13-17_v6', 63.10, 105, 88, 75),
      (14, '18-24_v7', 58.95, 108, 102, 92),
      (16, '25-34_v8', 43.60, 105, 98, 92),
      (18, '35-44_v9', 29.30, 105, 102, 98),
      (20, '45+_v10', 19.60, 108, 106, 104),
      (17, '13-17_v11', 63.60, 155, 138, 125),
      (19, '18-24_v12', 59.45, 158, 152, 142),
      (21, '25-34_v13', 44.10, 155, 148, 142),
      (23, '35-44_v14', 29.80, 155, 152, 148),
      (25, '45+_v15', 20.10, 158, 156, 154),
      (22, '13-17_v16', 64.10, 205, 188, 175),
      (24, '18-24_v17', 59.95, 208, 202, 192),
      (26, '25-34_v18', 44.60, 205, 198, 192),
      (28, '35-44_v19', 30.30, 205, 202, 198),
      (30, '45+_v20', 20.60, 208, 206, 204);

-- ============================================
-- Problem: Social Media Engagement Analysis
-- Slug: spotify-revenue-analysis
-- ============================================

CREATE TABLE users (
    user_id INT PRIMARY KEY,
    username VARCHAR(50),
    follower_count INT,
    account_type VARCHAR(20),
    join_date DATE
);

CREATE TABLE posts (
    post_id INT PRIMARY KEY,
    user_id INT,
    post_type VARCHAR(30),
    content_category VARCHAR(30),
    post_date DATE,
    likes_count INT,
    comments_count INT,
    shares_count INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO users VALUES
(1, 'tech_guru', 15000, 'Creator', '2022-06-15'),
(2, 'food_lover', 8500, 'Influencer', '2022-08-20'),
(3, 'travel_blog', 25000, 'Creator', '2022-03-10'),
(4, 'fitness_coach', 12000, 'Influencer', '2022-09-05'),
(5, 'art_studio', 5000, 'Business', '2022-11-15');

INSERT INTO posts VALUES
(1, 1, 'Video', 'Technology', '2024-05-01', 450, 65, 120),
(2, 1, 'Photo', 'Technology', '2024-05-03', 320, 45, 80),
(3, 2, 'Video', 'Food', '2024-05-02', 680, 95, 200),
(4, 2, 'Photo', 'Food', '2024-05-04', 520, 70, 150),
(5, 3, 'Photo', 'Travel', '2024-05-01', 890, 120, 280),
(6, 3, 'Story', 'Travel', '2024-05-05', 340, 30, 90),
(7, 4, 'Video', 'Fitness', '2024-05-03', 420, 85, 110),
(8, 5, 'Photo', 'Art', '2024-05-02', 280, 40, 60);

-- ============================================
-- Problem: Subscription Business Analytics
-- Slug: jp-morgan-trading-desk-performance
-- ============================================

CREATE TABLE subscription_plans (
    plan_id INT PRIMARY KEY,
    plan_name VARCHAR(100),
    monthly_price DECIMAL(8,2),
    plan_type VARCHAR(50),
    features_included INT
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    company_size VARCHAR(20),
    industry VARCHAR(50),
    signup_date DATE
);

CREATE TABLE subscriptions (
    subscription_id INT PRIMARY KEY,
    customer_id INT,
    plan_id INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    monthly_revenue DECIMAL(8,2),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id)
);

INSERT INTO subscription_plans VALUES
(1, 'Basic Plan', 29.99, 'Individual', 10),
(2, 'Professional Plan', 99.99, 'Team', 25),
(3, 'Enterprise Plan', 299.99, 'Enterprise', 50),
(4, 'Startup Plan', 49.99, 'Small Business', 15);

INSERT INTO customers VALUES
(1, 'Tech Innovations Inc', 'Small', 'Technology', '2024-01-15'),
(2, 'Design Studio Pro', 'Medium', 'Creative', '2024-02-10'),
(3, 'Global Corp Ltd', 'Large', 'Finance', '2024-01-20'),
(4, 'Marketing Hub', 'Small', 'Marketing', '2024-03-05'),
(5, 'Data Analytics Co', 'Medium', 'Analytics', '2024-02-15'),
(6, 'Startup Ventures', 'Small', 'Consulting', '2024-04-01');

INSERT INTO subscriptions VALUES
(1, 1, 2, '2024-01-15', NULL, 'Active', 99.99),
(2, 2, 1, '2024-02-10', NULL, 'Active', 29.99),
(3, 3, 3, '2024-01-20', NULL, 'Active', 299.99),
(4, 4, 4, '2024-03-05', NULL, 'Active', 49.99),
(5, 5, 2, '2024-02-15', '2024-04-15', 'Cancelled', 99.99),
(6, 6, 4, '2024-04-01', NULL, 'Active', 49.99),
(7, 1, 3, '2024-04-10', NULL, 'Active', 299.99),
(8, 2, 2, '2024-04-20', NULL, 'Active', 99.99);

-- ============================================
-- Problem: Supply Chain Logistics Analytics
-- Slug: lockheed-martin-defense-contracts
-- ============================================

CREATE TABLE distribution_centers (
    center_id INT PRIMARY KEY,
    center_name VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    capacity INT
);

CREATE TABLE delivery_routes (
    route_id INT PRIMARY KEY,
    center_id INT,
    route_name VARCHAR(100),
    route_type VARCHAR(30),
    avg_distance_km DECIMAL(6,2),
    FOREIGN KEY (center_id) REFERENCES distribution_centers(center_id)
);

CREATE TABLE deliveries (
    delivery_id INT PRIMARY KEY,
    route_id INT,
    delivery_date DATE,
    packages_delivered INT,
    delivery_time_hours DECIMAL(4,2),
    fuel_cost DECIMAL(6,2),
    driver_cost DECIMAL(6,2),
    customer_rating DECIMAL(3,2),
    FOREIGN KEY (route_id) REFERENCES delivery_routes(route_id)
);

INSERT INTO distribution_centers VALUES
(1, 'North Regional Center', 'Seattle', 'WA', 5000),
(2, 'South Regional Center', 'Los Angeles', 'CA', 7500),
(3, 'East Regional Center', 'Atlanta', 'GA', 6000),
(4, 'Central Hub', 'Chicago', 'IL', 10000);

INSERT INTO delivery_routes VALUES
(1, 1, 'Seattle Metro Route', 'Urban', 45.5),
(2, 1, 'Pacific Northwest Route', 'Regional', 180.0),
(3, 2, 'LA County Express', 'Urban', 65.0),
(4, 2, 'SoCal Regional', 'Regional', 220.0),
(5, 3, 'Atlanta Metro', 'Urban', 55.0),
(6, 3, 'Southeast Corridor', 'Highway', 320.0),
(7, 4, 'Chicago Loop', 'Urban', 40.0),
(8, 4, 'Midwest Express', 'Highway', 280.0);

INSERT INTO deliveries VALUES
(1, 1, '2024-05-01', 45, 6.5, 85.00, 180.00, 4.2),
(2, 1, '2024-05-02', 42, 6.0, 80.00, 175.00, 4.5),
(3, 2, '2024-05-01', 28, 8.5, 120.00, 220.00, 4.0),
(4, 3, '2024-05-01', 55, 7.0, 95.00, 190.00, 4.3),
(5, 3, '2024-05-02', 50, 6.8, 90.00, 185.00, 4.4),
(6, 4, '2024-05-01', 35, 9.2, 140.00, 240.00, 3.8),
(7, 5, '2024-05-01', 38, 5.5, 75.00, 165.00, 4.6),
(8, 6, '2024-05-01', 22, 12.0, 180.00, 300.00, 3.9),
(9, 7, '2024-05-01', 60, 5.0, 70.00, 160.00, 4.7),
(10, 8, '2024-05-01', 30, 10.5, 160.00, 280.00, 4.1);

-- ============================================
-- Problem: Supply Chain Optimization
-- Slug: supply-chain-optimization
-- ============================================
CREATE TABLE warehouse_inventory (
          warehouse_id INT,
          product_name VARCHAR(100),
          current_stock INT,
          reorder_point INT,
          max_capacity INT
      );
      INSERT INTO warehouse_inventory  VALUES
      (1, 'Shipping Boxes', 150, 200, 1000),
      (1, 'Bubble Wrap', 75, 100, 500),
      (1, 'Packing Tape', 300, 150, 800),
      (2, 'Shipping Boxes', 180, 200, 1000),
      (2, 'Bubble Wrap', 45, 100, 500),
      (2, 'Labels', 250, 300, 600),
      (3, 'Shipping Boxes', 90, 200, 1000),
      (3, 'Packing Tape', 120, 150, 800),
      (10, 'Shipping Boxes_v1', 160, 210, 1010),
      (11, 'Bubble Wrap_v2', 95, 120, 520),
      (12, 'Packing Tape_v3', 330, 180, 830),
      (14, 'Shipping Boxes_v4', 220, 240, 1040),
      (15, 'Bubble Wrap_v5', 95, 150, 550),
      (16, 'Labels_v6', 310, 360, 660),
      (18, 'Shipping Boxes_v7', 160, 270, 1070),
      (19, 'Packing Tape_v8', 200, 230, 880),
      (18, 'Shipping Boxes_v9', 240, 290, 1090),
      (19, 'Bubble Wrap_v10', 175, 200, 600),
      (20, 'Packing Tape_v11', 410, 260, 910),
      (22, 'Shipping Boxes_v12', 300, 320, 1120),
      (23, 'Bubble Wrap_v13', 175, 230, 630),
      (24, 'Labels_v14', 390, 440, 740),
      (26, 'Shipping Boxes_v15', 240, 350, 1150),
      (27, 'Packing Tape_v16', 280, 310, 960),
      (26, 'Shipping Boxes_v17', 320, 370, 1170);

-- ============================================
-- Problem: Target Store Revenue by Category
-- Slug: target-store-revenue-by-category
-- ============================================

CREATE TABLE target_sales (
    sale_id INT PRIMARY KEY,
    store_id INT,
    product_category VARCHAR(100),
    product_name VARCHAR(150),
    sale_date DATE,
    quantity INT,
    unit_price DECIMAL(8,2),
    revenue DECIMAL(10,2)
);

INSERT INTO target_sales VALUES
(1, 101, 'Electronics', 'Smart TV 55 inch', '2024-05-01', 2, 899.99, 1799.98),
(2, 101, 'Clothing', 'Winter Jacket', '2024-05-01', 5, 79.99, 399.95),
(3, 102, 'Home & Garden', 'Garden Tools Set', '2024-05-02', 3, 149.99, 449.97),
(4, 103, 'Electronics', 'Smartphone', '2024-05-02', 4, 699.99, 2799.96),
(5, 101, 'Groceries', 'Organic Food Bundle', '2024-05-03', 10, 29.99, 299.90),
(6, 102, 'Clothing', 'Summer Dress', '2024-05-03', 8, 49.99, 399.92),
(7, 103, 'Home & Garden', 'Furniture Set', '2024-05-04', 1, 1299.99, 1299.99),
(8, 101, 'Electronics', 'Laptop Computer', '2024-05-04', 3, 999.99, 2999.97),
(9, 102, 'Groceries', 'Fresh Produce', '2024-05-05', 15, 19.99, 299.85),
(10, 103, 'Clothing', 'Athletic Wear', '2024-05-05', 6, 59.99, 359.94);

-- ============================================
-- Problem: Tesla Energy Storage Analytics
-- Slug: vanguard-portfolio-analytics
-- ============================================
CREATE TABLE tesla_energy_storage (
        system_id INT PRIMARY KEY,
        deployment_type VARCHAR(50),
        storage_capacity_mwh DECIMAL(8,2),
        capacity_utilization_rate DECIMAL(5,3),
        grid_stability_score DECIMAL(4,2),
        energy_efficiency_pct DECIMAL(5,2),
        annual_energy_savings DECIMAL(12,2),
        carbon_offset_tons DECIMAL(10,2),
        installation_cost DECIMAL(12,2),
        system_date DATE
    );
      INSERT INTO tesla_energy_storage  VALUES
      (1, 'Utility-Scale Megapack', 2580.50, 0.875, 9.85, 94.2, 4500000.00, 12500.75, 125000000.00, '2024-01-15'),
      (2, 'Commercial Powerwall', 125.75, 0.820, 9.25, 92.8, 185000.00, 850.25, 2800000.00, '2024-01-15'),
      (3, 'Residential Powerwall', 45.25, 0.785, 8.95, 91.5, 85000.00, 425.80, 850000.00, '2024-01-16'),
      (4, 'Grid-Scale Battery Farm', 5200.80, 0.925, 9.92, 95.1, 8200000.00, 28500.60, 285000000.00, '2024-01-16'),
      (5, 'Industrial Energy Storage', 850.60, 0.755, 9.15, 93.2, 1250000.00, 4200.40, 18500000.00, '2024-01-17'),
      (7, 'Utility-Scale Megapack_v1', 2580.60, 0.97, 9.95, 94.30, 4500000.10, 12500.85, 125000000.10, '2024-01-16'),
      (9, 'Commercial Powerwall_v2', 125.95, 1.02, 9.45, 93.00, 185000.20, 850.45, 2800000.20, '2024-01-17'),
      (11, 'Residential Powerwall_v3', 45.55, 1.08, 9.25, 91.80, 85000.30, 426.10, 850000.30, '2024-01-19'),
      (13, 'Grid-Scale Battery Farm_v4', 5201.20, 1.33, 10.32, 95.50, 8200000.40, 28501.00, 285000000.40, '2024-01-20'),
      (15, 'Industrial Energy Storage_v5', 851.10, 1.25, 9.65, 93.70, 1250000.50, 4200.90, 18500000.50, '2024-01-22'),
      (12, 'Utility-Scale Megapack_v6', 2581.10, 1.48, 10.45, 94.80, 4500000.60, 12501.35, 125000000.60, '2024-01-21'),
      (14, 'Commercial Powerwall_v7', 126.45, 1.52, 9.95, 93.50, 185000.70, 850.95, 2800000.70, '2024-01-22'),
      (16, 'Residential Powerwall_v8', 46.05, 1.58, 9.75, 92.30, 85000.80, 426.60, 850000.80, '2024-01-24'),
      (18, 'Grid-Scale Battery Farm_v9', 5201.70, 1.83, 10.82, 96.00, 8200000.90, 28501.50, 285000000.90, '2024-01-25'),
      (20, 'Industrial Energy Storage_v10', 851.60, 1.75, 10.15, 94.20, 1250001.00, 4201.40, 18500001.00, '2024-01-27'),
      (17, 'Utility-Scale Megapack_v11', 2581.60, 1.98, 10.95, 95.30, 4500001.10, 12501.85, 125000001.10, '2024-01-26'),
      (19, 'Commercial Powerwall_v12', 126.95, 2.02, 10.45, 94.00, 185001.20, 851.45, 2800001.20, '2024-01-27'),
      (21, 'Residential Powerwall_v13', 46.55, 2.08, 10.25, 92.80, 85001.30, 427.10, 850001.30, '2024-01-29'),
      (23, 'Grid-Scale Battery Farm_v14', 5202.20, 2.33, 11.32, 96.50, 8200001.40, 28502.00, 285000001.40, '2024-01-30'),
      (25, 'Industrial Energy Storage_v15', 852.10, 2.25, 10.65, 94.70, 1250001.50, 4201.90, 18500001.50, '2024-02-01'),
      (22, 'Utility-Scale Megapack_v16', 2582.10, 2.48, 11.45, 95.80, 4500001.60, 12502.35, 125000001.60, '2024-01-31'),
      (24, 'Commercial Powerwall_v17', 127.45, 2.52, 10.95, 94.50, 185001.70, 851.95, 2800001.70, '2024-02-01'),
      (26, 'Residential Powerwall_v18', 47.05, 2.58, 10.75, 93.30, 85001.80, 427.60, 850001.80, '2024-02-03'),
      (28, 'Grid-Scale Battery Farm_v19', 5202.70, 2.83, 11.82, 97.00, 8200001.90, 28502.50, 285000001.90, '2024-02-04'),
      (30, 'Industrial Energy Storage_v20', 852.60, 2.75, 11.15, 95.20, 1250002.00, 4202.40, 18500002.00, '2024-02-06');

-- ============================================
-- Problem: Top Spending Customers by Month
-- Slug: top-spending-customers-by-month
-- ============================================
CREATE TABLE transactions (
          transaction_id INT,
          customer_id INT,
          amount DECIMAL(10,2),
          transaction_date DATE
      );
      INSERT INTO transactions  VALUES
      (1, 101, 1250.00, '2024-01-15'),
      (2, 102, 890.00, '2024-01-20'),
      (3, 103, 2100.00, '2024-01-25'),
      (4, 101, 650.00, '2024-02-10'),
      (5, 104, 1800.00, '2024-02-15'),
      (6, 102, 950.00, '2024-02-20'),
      (7, 103, 1200.00, '2024-02-25'),
      (8, 104, 750.00, '2024-03-05'),
      (10, 111, 1250.10, '2024-01-16'),
      (12, 122, 890.20, '2024-01-22'),
      (14, 133, 2100.30, '2024-01-28'),
      (16, 141, 650.40, '2024-02-14'),
      (18, 154, 1800.50, '2024-02-20'),
      (20, 162, 950.60, '2024-02-26'),
      (22, 173, 1200.70, '2024-03-03'),
      (24, 184, 750.80, '2024-03-12'),
      (18, 191, 1250.90, '2024-01-24'),
      (20, 202, 891.00, '2024-01-30'),
      (22, 213, 2101.10, '2024-02-05'),
      (24, 221, 651.20, '2024-02-22'),
      (26, 234, 1801.30, '2024-02-28'),
      (28, 242, 951.40, '2024-03-05'),
      (30, 253, 1201.50, '2024-03-10'),
      (32, 264, 751.60, '2024-03-20'),
      (26, 271, 1251.70, '2024-02-01');

-- ============================================
-- Problem: UBS Wealth Management Analytics
-- Slug: morgan-stanley-risk-management-system
-- ============================================
CREATE TABLE ubs_wealth_management (
        segment_id INT PRIMARY KEY,
        wealth_segment VARCHAR(50),
        assets_under_management DECIMAL(15,2),
        portfolio_return DECIMAL(8,4),
        portfolio_volatility DECIMAL(8,4),
        advisory_fees DECIMAL(10,2),
        client_retention_rate DECIMAL(5,3),
        risk_free_rate DECIMAL(6,4),
        client_satisfaction_score DECIMAL(3,1),
        relationship_manager_ratio DECIMAL(5,1),
        segment_date DATE
    );
      INSERT INTO ubs_wealth_management VALUES
    (1, 'Ultra High Net Worth', 185000.00, 0.1485, 0.0750, 2775000.00, 0.978, 0.0200, 9.2, 25.5, '2024-01-15'),
    (2, 'Family Offices', 125000.00, 0.1625, 0.0825, 1875000.00, 0.985, 0.0200, 9.5, 18.2, '2024-01-15'),
    (3, 'Institutional Wealth', 95000.00, 0.1285, 0.0685, 1425000.00, 0.945, 0.0200, 8.8, 35.8, '2024-01-16'),
    (4, 'High Net Worth', 65000.00, 0.1185, 0.0925, 975000.00, 0.925, 0.0200, 8.5, 42.5, '2024-01-16'),
    (5, 'Affluent Clients', 45000.00, 0.1085, 0.1025, 675000.00, 0.915, 0.0200, 8.2, 55.2, '2024-01-17'),
    (7, 'Ultra High Net Worth_v1', 185000.10, 0.25, 0.17, 2775000.10, 1.08, 0.12, 9.30, 25.60, '2024-01-16'),
    (9, 'Family Offices_v2', 125000.20, 0.36, 0.28, 1875000.20, 1.19, 0.22, 9.70, 18.40, '2024-01-17'),
    (11, 'Institutional Wealth_v3', 95000.30, 0.43, 0.37, 1425000.30, 1.25, 0.32, 9.10, 36.10, '2024-01-19'),
    (13, 'High Net Worth_v4', 65000.40, 0.52, 0.49, 975000.40, 1.33, 0.42, 8.90, 42.90, '2024-01-20'),
    (15, 'Affluent Clients_v5', 45000.50, 0.61, 0.60, 675000.50, 1.42, 0.52, 8.70, 55.70, '2024-01-22'),
    (12, 'Ultra High Net Worth_v6', 185000.60, 0.75, 0.68, 2775000.60, 1.58, 0.62, 9.80, 26.10, '2024-01-21'),
    (14, 'Family Offices_v7', 125000.70, 0.86, 0.78, 1875000.70, 1.69, 0.72, 10.20, 18.90, '2024-01-22'),
    (16, 'Institutional Wealth_v8', 95000.80, 0.93, 0.87, 1425000.80, 1.75, 0.82, 9.60, 36.60, '2024-01-24'),
    (18, 'High Net Worth_v9', 65000.90, 1.02, 0.99, 975000.90, 1.83, 0.92, 9.40, 43.40, '2024-01-25'),
    (20, 'Affluent Clients_v10', 45001.00, 1.11, 1.10, 675001.00, 1.92, 1.02, 9.20, 56.20, '2024-01-27'),
    (17, 'Ultra High Net Worth_v11', 185001.10, 1.25, 1.18, 2775001.10, 2.08, 1.12, 10.30, 26.60, '2024-01-26'),
    (19, 'Family Offices_v12', 125001.20, 1.36, 1.28, 1875001.20, 2.19, 1.22, 10.70, 19.40, '2024-01-27'),
    (21, 'Institutional Wealth_v13', 95001.30, 1.43, 1.37, 1425001.30, 2.25, 1.32, 10.10, 37.10, '2024-01-29'),
    (23, 'High Net Worth_v14', 65001.40, 1.52, 1.49, 975001.40, 2.33, 1.42, 9.90, 43.90, '2024-01-30'),
    (25, 'Affluent Clients_v15', 45001.50, 1.61, 1.60, 675001.50, 2.42, 1.52, 9.70, 56.70, '2024-02-01'),
    (22, 'Ultra High Net Worth_v16', 185001.60, 1.75, 1.68, 2775001.60, 2.58, 1.62, 10.80, 27.10, '2024-01-31'),
    (24, 'Family Offices_v17', 125001.70, 1.86, 1.78, 1875001.70, 2.69, 1.72, 11.20, 19.90, '2024-02-01'),
    (26, 'Institutional Wealth_v18', 95001.80, 1.93, 1.87, 1425001.80, 2.75, 1.82, 10.60, 37.60, '2024-02-03'),
    (28, 'High Net Worth_v19', 65001.90, 2.02, 1.99, 975001.90, 2.83, 1.92, 10.40, 44.40, '2024-02-04'),
    (30, 'Affluent Clients_v20', 45002.00, 2.11, 2.10, 675002.00, 2.92, 2.02, 10.20, 57.20, '2024-02-06');

-- ============================================
-- Problem: UBS Wealth Management Private Banking
-- Slug: fraudulent-transaction-detection
-- ============================================
CREATE TABLE ubs_private_banking (
        client_id INT PRIMARY KEY,
        wealth_segment VARCHAR(50),
        portfolio_value DECIMAL(15,2),
        annual_return DECIMAL(8,4),
        benchmark_return DECIMAL(8,4),
        portfolio_volatility DECIMAL(8,4),
        risk_free_rate DECIMAL(6,4),
        alternative_allocation DECIMAL(6,3),
        private_equity_allocation DECIMAL(6,3),
        hedge_fund_allocation DECIMAL(6,3),
        real_estate_allocation DECIMAL(6,3),
        portfolio_date DATE
    );
      INSERT INTO ubs_private_banking VALUES
    (1, 'Ultra High Net Worth', 500000000.50, 14.2500, 11.8500, 18.5000, 2.2500, 0.350, 0.150, 0.125, 0.075, '2024-01-15'),
    (2, 'High Net Worth', 125000000.75, 12.5500, 10.2500, 16.2500, 2.2500, 0.250, 0.100, 0.075, 0.075, '2024-01-15'),
    (3, 'Emerging Wealth', 25000000.25, 10.8500, 9.5500, 14.7500, 2.2500, 0.150, 0.050, 0.050, 0.050, '2024-01-16'),
    (4, 'Family Office', 750000000.80, 15.5500, 12.2500, 20.2500, 2.2500, 0.450, 0.200, 0.150, 0.100, '2024-01-16'),
    (5, 'Institutional', 350000000.60, 13.2500, 10.8500, 17.5000, 2.2500, 0.300, 0.125, 0.100, 0.075, '2024-01-17'),
    (7, 'Ultra High Net Worth_v1', 500000000.60, 14.35, 11.95, 18.60, 2.35, 0.45, 0.25, 0.23, 0.17, '2024-01-16'),
    (9, 'High Net Worth_v2', 125000000.95, 12.75, 10.45, 16.45, 2.45, 0.45, 0.30, 0.28, 0.28, '2024-01-17'),
    (11, 'Emerging Wealth_v3', 25000000.55, 11.15, 9.85, 15.05, 2.55, 0.45, 0.35, 0.35, 0.35, '2024-01-19'),
    (13, 'Family Office_v4', 750000001.20, 15.95, 12.65, 20.65, 2.65, 0.85, 0.60, 0.55, 0.50, '2024-01-20'),
    (15, 'Institutional_v5', 350000001.10, 13.75, 11.35, 18.00, 2.75, 0.80, 0.63, 0.60, 0.57, '2024-01-22'),
    (12, 'Ultra High Net Worth_v6', 500000001.10, 14.85, 12.45, 19.10, 2.85, 0.95, 0.75, 0.73, 0.68, '2024-01-21'),
    (14, 'High Net Worth_v7', 125000001.45, 13.25, 10.95, 16.95, 2.95, 0.95, 0.80, 0.78, 0.78, '2024-01-22'),
    (16, 'Emerging Wealth_v8', 25000001.05, 11.65, 10.35, 15.55, 3.05, 0.95, 0.85, 0.85, 0.85, '2024-01-24'),
    (18, 'Family Office_v9', 750000001.70, 16.45, 13.15, 21.15, 3.15, 1.35, 1.10, 1.05, 1.00, '2024-01-25'),
    (20, 'Institutional_v10', 350000001.60, 14.25, 11.85, 18.50, 3.25, 1.30, 1.13, 1.10, 1.07, '2024-01-27'),
    (17, 'Ultra High Net Worth_v11', 500000001.60, 15.35, 12.95, 19.60, 3.35, 1.45, 1.25, 1.23, 1.18, '2024-01-26'),
    (19, 'High Net Worth_v12', 125000001.95, 13.75, 11.45, 17.45, 3.45, 1.45, 1.30, 1.28, 1.28, '2024-01-27'),
    (21, 'Emerging Wealth_v13', 25000001.55, 12.15, 10.85, 16.05, 3.55, 1.45, 1.35, 1.35, 1.35, '2024-01-29'),
    (23, 'Family Office_v14', 750000002.20, 16.95, 13.65, 21.65, 3.65, 1.85, 1.60, 1.55, 1.50, '2024-01-30'),
    (25, 'Institutional_v15', 350000002.10, 14.75, 12.35, 19.00, 3.75, 1.80, 1.63, 1.60, 1.57, '2024-02-01'),
    (22, 'Ultra High Net Worth_v16', 500000002.10, 15.85, 13.45, 20.10, 3.85, 1.95, 1.75, 1.73, 1.68, '2024-01-31'),
    (24, 'High Net Worth_v17', 125000002.45, 14.25, 11.95, 17.95, 3.95, 1.95, 1.80, 1.78, 1.78, '2024-02-01'),
    (26, 'Emerging Wealth_v18', 25000002.05, 12.65, 11.35, 16.55, 4.05, 1.95, 1.85, 1.85, 1.85, '2024-02-03'),
    (28, 'Family Office_v19', 750000002.70, 17.45, 14.15, 22.15, 4.15, 2.35, 2.10, 2.05, 2.00, '2024-02-04'),
    (30, 'Institutional_v20', 350000002.60, 15.25, 12.85, 19.50, 4.25, 2.30, 2.13, 2.10, 2.08, '2024-02-06');

-- ============================================
-- Problem: Uber Ride-Sharing Market Analytics
-- Slug: uber-revenue-analysis
-- ============================================
CREATE TABLE uber_market_performance (
        market_id INT PRIMARY KEY,
        metropolitan_area VARCHAR(50),
        total_rides INT,
        gross_ride_revenue DECIMAL(12,2),
        driver_count INT,
        market_penetration DECIMAL(5,2),
        market_date DATE
    );
      INSERT INTO uber_market_performance  VALUES
      (1, 'San Francisco Bay Area', 8500000, 170000000.50, 85000, 65.25, '2024-01-15'),
      (2, 'New York Metro', 12000000, 180000000.75, 125000, 58.40, '2024-01-15'),
      (3, 'Los Angeles', 9200000, 138000000.25, 95000, 52.80, '2024-01-16'),
      (4, 'Chicago', 5800000, 87000000.80, 62000, 48.60, '2024-01-16'),
      (5, 'Miami', 3500000, 59500000.60, 35000, 45.20, '2024-01-17'),
      (7, 'San Francisco Bay Area_v1', 8500010, 170000000.60, 85010, 65.35, '2024-01-16'),
      (9, 'New York Metro_v2', 12000020, 180000000.95, 125020, 58.60, '2024-01-17'),
      (11, 'Los Angeles_v3', 9200030, 138000000.55, 95030, 53.10, '2024-01-19'),
      (13, 'Chicago_v4', 5800040, 87000001.20, 62040, 49.00, '2024-01-20'),
      (15, 'Miami_v5', 3500050, 59500001.10, 35050, 45.70, '2024-01-22'),
      (12, 'San Francisco Bay Area_v6', 8500060, 170000001.10, 85060, 65.85, '2024-01-21'),
      (14, 'New York Metro_v7', 12000070, 180000001.45, 125070, 59.10, '2024-01-22'),
      (16, 'Los Angeles_v8', 9200080, 138000001.05, 95080, 53.60, '2024-01-24'),
      (18, 'Chicago_v9', 5800090, 87000001.70, 62090, 49.50, '2024-01-25'),
      (20, 'Miami_v10', 3500100, 59500001.60, 35100, 46.20, '2024-01-27'),
      (17, 'San Francisco Bay Area_v11', 8500110, 170000001.60, 85110, 66.35, '2024-01-26'),
      (19, 'New York Metro_v12', 12000120, 180000001.95, 125120, 59.60, '2024-01-27'),
      (21, 'Los Angeles_v13', 9200130, 138000001.55, 95130, 54.10, '2024-01-29'),
      (23, 'Chicago_v14', 5800140, 87000002.20, 62140, 50.00, '2024-01-30'),
      (25, 'Miami_v15', 3500150, 59500002.10, 35150, 46.70, '2024-02-01'),
      (22, 'San Francisco Bay Area_v16', 8500160, 170000002.10, 85160, 66.85, '2024-01-31'),
      (24, 'New York Metro_v17', 12000170, 180000002.45, 125170, 60.10, '2024-02-01'),
      (26, 'Los Angeles_v18', 9200180, 138000002.05, 95180, 54.60, '2024-02-03'),
      (28, 'Chicago_v19', 5800190, 87000002.70, 62190, 50.50, '2024-02-04'),
      (30, 'Miami_v20', 3500200, 59500002.60, 35200, 47.20, '2024-02-06');

-- ============================================
-- Problem: UnitedHealth Claims Processing Efficiency
-- Slug: unitedhealth-claims-processing-efficiency
-- ============================================

CREATE TABLE unitedhealth_claims (
    claim_id INT PRIMARY KEY,
    patient_id INT,
    claim_type VARCHAR(100),
    submission_date DATE,
    processing_date DATE,
    claim_amount DECIMAL(10,2),
    approved_amount DECIMAL(10,2),
    status VARCHAR(50),
    processing_days INT
);

INSERT INTO unitedhealth_claims VALUES
(1, 1001, 'Medical Procedure', '2024-04-01', '2024-04-03', 2500.00, 2250.00, 'Approved', 2),
(2, 1002, 'Prescription Drug', '2024-04-02', '2024-04-04', 150.00, 135.00, 'Approved', 2),
(3, 1003, 'Emergency Care', '2024-04-03', '2024-04-05', 5000.00, 4500.00, 'Approved', 2),
(4, 1004, 'Preventive Care', '2024-04-04', '2024-04-07', 300.00, 300.00, 'Approved', 3),
(5, 1005, 'Specialist Visit', '2024-04-05', '2024-04-09', 400.00, 320.00, 'Approved', 4),
(6, 1006, 'Medical Procedure', '2024-04-06', '2024-04-11', 1800.00, 0.00, 'Denied', 5),
(7, 1007, 'Prescription Drug', '2024-04-07', '2024-04-10', 200.00, 180.00, 'Approved', 3),
(8, 1008, 'Emergency Care', '2024-04-08', '2024-04-12', 3500.00, 3150.00, 'Approved', 4),
(9, 1009, 'Preventive Care', '2024-04-09', '2024-04-11', 250.00, 250.00, 'Approved', 2),
(10, 1010, 'Specialist Visit', '2024-04-10', '2024-04-15', 350.00, 315.00, 'Approved', 5);

-- ============================================
-- Problem: User Engagement Metrics
-- Slug: user-engagement-metrics
-- ============================================
CREATE TABLE posts (
          post_id INT,
          user_id INT,
          post_type VARCHAR(50),
          likes_count INT,
          comments_count INT,
          post_date DATE
      );
      INSERT INTO posts  VALUES
      (1, 101, 'article', 45, 12, '2024-01-15'),
      (2, 102, 'image', 23, 8, '2024-01-16'),
      (3, 103, 'video', 67, 15, '2024-01-17'),
      (4, 104, 'article', 34, 6, '2024-01-18'),
      (5, 105, 'image', 56, 11, '2024-01-19'),
      (6, 106, 'video', 89, 22, '2024-01-20'),
      (8, 111, 'article_v1', 55, 22, '2024-01-16'),
      (10, 122, 'image_v2', 43, 28, '2024-01-18'),
      (12, 133, 'video_v3', 97, 45, '2024-01-20'),
      (14, 144, 'article_v4', 74, 46, '2024-01-22'),
      (16, 155, 'image_v5', 106, 61, '2024-01-24'),
      (18, 166, 'video_v6', 149, 82, '2024-01-26'),
      (14, 171, 'article_v7', 115, 82, '2024-01-22'),
      (16, 182, 'image_v8', 103, 88, '2024-01-24'),
      (18, 193, 'video_v9', 157, 105, '2024-01-26'),
      (20, 204, 'article_v10', 134, 106, '2024-01-28'),
      (22, 215, 'image_v11', 166, 121, '2024-01-30'),
      (24, 226, 'video_v12', 209, 142, '2024-02-01'),
      (20, 231, 'article_v13', 175, 142, '2024-01-28'),
      (22, 242, 'image_v14', 163, 148, '2024-01-30'),
      (24, 253, 'video_v15', 217, 165, '2024-02-01'),
      (26, 264, 'article_v16', 194, 166, '2024-02-03'),
      (28, 275, 'image_v17', 226, 181, '2024-02-05'),
      (30, 286, 'video_v18', 269, 202, '2024-02-07'),
      (26, 291, 'article_v19', 235, 202, '2024-02-03');

-- ============================================
-- Problem: Vanguard Index Fund Performance Analytics
-- Slug: bank-of-america-portfolio-analytics
-- ============================================
CREATE TABLE vanguard_funds (
            fund_id INT PRIMARY KEY,
            fund_name VARCHAR(100),
            expense_ratio DECIMAL(5,4),
            ytd_return DECIMAL(5,2),
            five_year_return DECIMAL(5,2),
            assets_under_mgmt_billions DECIMAL(8,2)
        );
      INSERT INTO vanguard_funds  VALUES
      (1, 'Total Stock Market Index', 0.0003, 12.5, 8.9, 1250.5),
      (2, 'S&P 500 Index', 0.0003, 11.8, 8.7, 850.2),
      (3, 'Total Bond Market Index', 0.0005, -2.1, 2.8, 320.8),
      (4, 'International Stock Index', 0.0008, 8.9, 5.2, 180.9),
      (5, 'Emerging Markets Stock Index', 0.0014, 15.2, 4.1, 95.3),
      (7, 'Total Stock Market Index_v1', 0.10, 12.60, 9.00, 1250.60),
      (9, 'S&P 500 Index_v2', 0.20, 12.00, 8.90, 850.40),
      (11, 'Total Bond Market Index_v3', 0.30, -1.80, 3.10, 321.10),
      (13, 'International Stock Index_v4', 0.40, 9.30, 5.60, 181.30),
      (15, 'Emerging Markets Stock Index_v5', 0.50, 15.70, 4.60, 95.80),
      (12, 'Total Stock Market Index_v6', 0.60, 13.10, 9.50, 1251.10),
      (14, 'S&P 500 Index_v7', 0.70, 12.50, 9.40, 850.90),
      (16, 'Total Bond Market Index_v8', 0.80, -1.30, 3.60, 321.60),
      (18, 'International Stock Index_v9', 0.90, 9.80, 6.10, 181.80),
      (20, 'Emerging Markets Stock Index_v10', 1.00, 16.20, 5.10, 96.30),
      (17, 'Total Stock Market Index_v11', 1.10, 13.60, 10.00, 1251.60),
      (19, 'S&P 500 Index_v12', 1.20, 13.00, 9.90, 851.40),
      (21, 'Total Bond Market Index_v13', 1.30, -0.80, 4.10, 322.10),
      (23, 'International Stock Index_v14', 1.40, 10.30, 6.60, 182.30),
      (25, 'Emerging Markets Stock Index_v15', 1.50, 16.70, 5.60, 96.80),
      (22, 'Total Stock Market Index_v16', 1.60, 14.10, 10.50, 1252.10),
      (24, 'S&P 500 Index_v17', 1.70, 13.50, 10.40, 851.90),
      (26, 'Total Bond Market Index_v18', 1.80, -0.30, 4.60, 322.60),
      (28, 'International Stock Index_v19', 1.90, 10.80, 7.10, 182.80),
      (30, 'Emerging Markets Stock Index_v20', 2.00, 17.20, 6.10, 97.30);

-- ============================================
-- Problem: Verizon Network Coverage Analysis
-- Slug: verizon-network-coverage-analysis
-- ============================================
CREATE TABLE network_towers (
        tower_id INT PRIMARY KEY,
        state_region VARCHAR(50),
        coverage_area_sqkm DECIMAL(8,2),
        signal_strength_db INT,
        technology_type VARCHAR(100),
        uptime_percentage DECIMAL(5,2)
    );
      INSERT INTO network_towers VALUES
    (10, 'California', 450.75, -85, '5G', 99.95),
    (2, 'California', 320.50, -82, '5G', 99.90),
    (3, 'California', 280.25, -88, '4G LTE', 99.85),
    (4, 'Texas', 520.80, -80, '5G', 99.92),
    (5, 'Texas', 410.60, -84, '5G', 99.88),
    (6, 'Texas', 380.45, -89, '4G LTE', 99.80),
    (7, 'Florida', 290.30, -83, '5G', 99.91),
    (8, 'Florida', 350.65, -86, '4G LTE', 99.75),
    (9, 'New York', 220.40, -81, '5G', 99.94),
    (11, 'New York', 180.25, -87, '4G LTE', 99.82),
    (12, 'California_v1', 450.85, -75, '5G_v1', 100.05),
    (14, 'California_v2', 320.70, -62, '5G_v2', 100.10),
    (16, 'California_v3', 280.55, -58, '4G LTE_v3', 100.15),
    (18, 'Texas_v4', 521.20, -40, '5G_v4', 100.32),
    (20, 'Texas_v5', 411.10, -34, '5G_v5', 100.38),
    (22, 'Texas_v6', 381.05, -29, '4G LTE_v6', 100.40),
    (24, 'Florida_v7', 291.00, -13, '5G_v7', 100.61),
    (26, 'Florida_v8', 351.45, -6, '4G LTE_v8', 100.55),
    (28, 'New York_v9', 221.30, 9, '5G_v9', 100.84),
    (30, 'New York_v10', 181.25, 13, '4G LTE_v10', 100.82),
    (23, 'California_v11', 451.85, 25, '5G_v11', 101.05),
    (25, 'California_v12', 321.70, 38, '5G_v12', 101.10),
    (27, 'California_v13', 281.55, 42, '4G LTE_v13', 101.15),
    (29, 'Texas_v14', 522.20, 60, '5G_v14', 101.32),
    (31, 'Texas_v15', 412.10, 66, '5G_v15', 101.38);

-- ============================================
-- Problem: Visa Global Payment Processing Analytics
-- Slug: visa-portfolio-analytics
-- ============================================

CREATE TABLE visa_transactions (
    transaction_id INT PRIMARY KEY,
    merchant_id INT,
    merchant_category VARCHAR(100),
    transaction_date DATE,
    transaction_amount DECIMAL(10,2),
    currency_code VARCHAR(10),
    processing_fee DECIMAL(6,2),
    settlement_status VARCHAR(30),
    country_code VARCHAR(10)
);

INSERT INTO visa_transactions VALUES
(1, 2001, 'Retail Store', '2024-05-01', 125.50, 'USD', 2.25, 'Settled', 'US'),
(2, 2002, 'Restaurant', '2024-05-01', 89.75, 'USD', 1.60, 'Settled', 'US'),
(3, 2003, 'Gas Station', '2024-05-02', 65.20, 'USD', 1.17, 'Settled', 'US'),
(4, 2004, 'Online Store', '2024-05-02', 299.99, 'USD', 5.40, 'Settled', 'US'),
(5, 2005, 'Grocery Store', '2024-05-03', 156.80, 'USD', 2.82, 'Settled', 'US'),
(6, 2006, 'Hotel', '2024-05-03', 450.00, 'USD', 8.10, 'Settled', 'US'),
(7, 2007, 'Retail Store', '2024-05-04', 78.90, 'EUR', 1.42, 'Pending', 'DE'),
(8, 2008, 'Restaurant', '2024-05-04', 112.30, 'EUR', 2.02, 'Settled', 'FR'),
(9, 2009, 'Gas Station', '2024-05-05', 85.75, 'CAD', 1.54, 'Settled', 'CA'),
(10, 2010, 'Online Store', '2024-05-05', 199.99, 'GBP', 3.60, 'Settled', 'UK');

-- ============================================
-- Problem: Walmart Supply Chain Efficiency Analytics
-- Slug: walmart-revenue-analysis
-- ============================================
CREATE TABLE distribution_centers (
        center_id INT PRIMARY KEY,
        region VARCHAR(50),
        operational_efficiency_score DECIMAL(5,2),
        daily_throughput_units INT,
        energy_cost_per_unit DECIMAL(8,4)
    );
      INSERT INTO distribution_centers VALUES
    (1001, 'Southeast', 92.5, 125000, 0.0485),
    (1002, 'Southeast', 88.7, 98000, 0.0520),
    (1003, 'Midwest', 94.2, 142000, 0.0445),
    (1004, 'Midwest', 91.8, 118000, 0.0465),
    (1005, 'West Coast', 87.3, 89000, 0.0580),
    (1006, 'Northeast', 93.6, 135000, 0.0470),
    (1007, 'Southwest', 90.1, 105000, 0.0495),
    (1008, 'Southwest', 86.9, 92000, 0.0545),
    (1010, 'Southeast_v1', 92.60, 125010, 0.15),
    (1012, 'Southeast_v2', 88.90, 98020, 0.25),
    (1014, 'Midwest_v3', 94.50, 142030, 0.34),
    (1016, 'Midwest_v4', 92.20, 118040, 0.45),
    (1018, 'West Coast_v5', 87.80, 89050, 0.56),
    (1020, 'Northeast_v6', 94.20, 135060, 0.65),
    (1022, 'Southwest_v7', 90.80, 105070, 0.75),
    (1024, 'Southwest_v8', 87.70, 92080, 0.85),
    (1019, 'Southeast_v9', 93.40, 125090, 0.95),
    (1021, 'Southeast_v10', 89.70, 98100, 1.05),
    (1023, 'Midwest_v11', 95.30, 142110, 1.14),
    (1025, 'Midwest_v12', 93.00, 118120, 1.25),
    (1026, 'West Coast_v13', 88.60, 89130, 1.36),
    (1028, 'Northeast_v14', 95.00, 135140, 1.45),
    (1030, 'Southwest_v15', 91.60, 105150, 1.55),
    (1032, 'Southwest_v16', 88.50, 92160, 1.65),
    (1027, 'Southeast_v17', 94.20, 125170, 1.75);

-- ============================================
-- Problem: Wells Fargo Commercial Banking Analytics
-- Slug: wells-fargo-portfolio-analytics
-- ============================================
CREATE TABLE wellsfargo_commercial_banking (
        loan_id INT PRIMARY KEY,
        industry_sector VARCHAR(50),
        loan_amount DECIMAL(15,2),
        loan_interest_rate DECIMAL(6,3),
        cost_of_funds DECIMAL(6,3),
        default_probability DECIMAL(5,3),
        loan_term_years INT,
        collateral_coverage_ratio DECIMAL(5,2),
        relationship_revenue DECIMAL(10,2),
        regulatory_risk_weight DECIMAL(4,2),
        loan_date DATE
    );
      INSERT INTO wellsfargo_commercial_banking  VALUES
      (1, 'Technology Services', 450000000.00, 0.0485, 0.0125, 0.015, 5, 1.85, 2250000.00, 1.00, '2024-01-15'),
      (2, 'Healthcare', 280000000.00, 0.0525, 0.0125, 0.018, 7, 1.95, 1850000.00, 0.75, '2024-01-15'),
      (3, 'Manufacturing', 650000000.00, 0.0465, 0.0125, 0.022, 10, 2.15, 3200000.00, 1.25, '2024-01-16'),
      (4, 'Real Estate', 820000000.00, 0.0545, 0.0125, 0.025, 15, 1.45, 4850000.00, 1.50, '2024-01-16'),
      (5, 'Professional Services', 185000000.00, 0.0505, 0.0125, 0.012, 3, 1.65, 1250000.00, 0.85, '2024-01-17'),
      (7, 'Technology Services_v1', 450000000.10, 0.15, 0.11, 0.12, 15, 1.95, 2250000.10, 1.10, '2024-01-16'),
      (9, 'Healthcare_v2', 280000000.20, 0.25, 0.21, 0.22, 27, 2.15, 1850000.20, 0.95, '2024-01-17'),
      (11, 'Manufacturing_v3', 650000000.30, 0.35, 0.31, 0.32, 40, 2.45, 3200000.30, 1.55, '2024-01-19'),
      (13, 'Real Estate_v4', 820000000.40, 0.45, 0.41, 0.43, 55, 1.85, 4850000.40, 1.90, '2024-01-20'),
      (15, 'Professional Services_v5', 185000000.50, 0.55, 0.51, 0.51, 53, 2.15, 1250000.50, 1.35, '2024-01-22'),
      (12, 'Technology Services_v6', 450000000.60, 0.65, 0.61, 0.62, 65, 2.45, 2250000.60, 1.60, '2024-01-21'),
      (14, 'Healthcare_v7', 280000000.70, 0.75, 0.71, 0.72, 77, 2.65, 1850000.70, 1.45, '2024-01-22'),
      (16, 'Manufacturing_v8', 650000000.80, 0.85, 0.81, 0.82, 90, 2.95, 3200000.80, 2.05, '2024-01-24'),
      (18, 'Real Estate_v9', 820000000.90, 0.95, 0.91, 0.93, 105, 2.35, 4850000.90, 2.40, '2024-01-25'),
      (20, 'Professional Services_v10', 185000001.00, 1.05, 1.01, 1.01, 103, 2.65, 1250001.00, 1.85, '2024-01-27'),
      (17, 'Technology Services_v11', 450000001.10, 1.15, 1.11, 1.11, 115, 2.95, 2250001.10, 2.10, '2024-01-26'),
      (19, 'Healthcare_v12', 280000001.20, 1.25, 1.21, 1.22, 127, 3.15, 1850001.20, 1.95, '2024-01-27'),
      (21, 'Manufacturing_v13', 650000001.30, 1.35, 1.31, 1.32, 140, 3.45, 3200001.30, 2.55, '2024-01-29'),
      (23, 'Real Estate_v14', 820000001.40, 1.45, 1.41, 1.43, 155, 2.85, 4850001.40, 2.90, '2024-01-30'),
      (25, 'Professional Services_v15', 185000001.50, 1.55, 1.51, 1.51, 153, 3.15, 1250001.50, 2.35, '2024-02-01'),
      (22, 'Technology Services_v16', 450000001.60, 1.65, 1.61, 1.61, 165, 3.45, 2250001.60, 2.60, '2024-01-31'),
      (24, 'Healthcare_v17', 280000001.70, 1.75, 1.71, 1.72, 177, 3.65, 1850001.70, 2.45, '2024-02-01'),
      (26, 'Manufacturing_v18', 650000001.80, 1.85, 1.81, 1.82, 190, 3.95, 3200001.80, 3.05, '2024-02-03'),
      (28, 'Real Estate_v19', 820000001.90, 1.95, 1.91, 1.93, 205, 3.35, 4850001.90, 3.40, '2024-02-04'),
      (30, 'Professional Services_v20', 185000002.00, 2.05, 2.01, 2.01, 203, 3.65, 1250002.00, 2.85, '2024-02-06');

-- ============================================
-- Problem: Wells Fargo Mortgage Risk Assessment
-- Slug: wells-fargo-mortgage-risk-assessment
-- ============================================
CREATE TABLE wf_borrowers (
        borrower_id INT PRIMARY KEY,
        credit_score INT,
        annual_income DECIMAL(12,2),
        employment_years DECIMAL(8,2),
        total_debt DECIMAL(12,2),
        loan_amount DECIMAL(12,2),
        home_value DECIMAL(12,2),
        loan_status VARCHAR(100)
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
    (9010, 660, 68000.00, 5.1, 39000.00, 315000.00, 375000.00, 'Current'),
    (9012, 760, 95000.10, 8.60, 25000.10, 380000.10, 450000.10, 'Current_v1'),
    (9014, 700, 72000.20, 4.40, 35000.20, 320000.20, 400000.20, 'Default_v2'),
    (9016, 750, 88000.30, 7.10, 28000.30, 350000.30, 425000.30, 'Current_v3'),
    (9018, 660, 55000.40, 2.50, 45000.40, 280000.40, 325000.40, 'Default_v4'),
    (9020, 830, 125000.50, 12.80, 18000.50, 420000.50, 500000.50, 'Current_v5'),
    (9022, 700, 58000.60, 4.10, 42000.60, 295000.60, 340000.60, 'Default_v6'),
    (9024, 780, 82000.70, 7.90, 31000.70, 365000.70, 430000.70, 'Current_v7'),
    (9026, 670, 48000.80, 2.60, 38000.80, 265000.80, 310000.80, 'Default_v8'),
    (9028, 890, 150000.90, 16.50, 22000.90, 480000.90, 580000.90, 'Current_v9'),
    (9030, 760, 68001.00, 6.10, 39001.00, 315001.00, 375001.00, 'Current_v10'),
    (9023, 860, 95001.10, 9.60, 25001.10, 380001.10, 450001.10, 'Current_v11'),
    (9025, 800, 72001.20, 5.40, 35001.20, 320001.20, 400001.20, 'Default_v12'),
    (9027, 850, 88001.30, 8.10, 28001.30, 350001.30, 425001.30, 'Current_v13'),
    (9029, 760, 55001.40, 3.50, 45001.40, 280001.40, 325001.40, 'Default_v14'),
    (9031, 930, 125001.50, 13.80, 18001.50, 420001.50, 500001.50, 'Current_v15');


