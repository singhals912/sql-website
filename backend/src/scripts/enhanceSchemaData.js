const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Enhanced schema data with comprehensive, realistic datasets
const enhancedSchemas = {
  1: {
    // AT&T Customer Service Call Volume - Enhanced with more data and edge cases
    title: "AT&T Customer Service Call Volume",
    setupSql: `CREATE TABLE att_service_calls (
        call_id INT PRIMARY KEY,
        service_category VARCHAR(50),
        call_duration_minutes INT,
        customer_satisfaction INT, -- 1-5 scale
        resolution_status VARCHAR(20),
        call_date DATE,
        agent_id INT,
        customer_type VARCHAR(20)
    );
    
    INSERT INTO att_service_calls VALUES 
    -- Regular cases
    (1, 'Billing Support', 12, 4, 'Resolved', '2024-01-15', 101, 'Residential'),
    (2, 'Technical Support', 25, 3, 'Escalated', '2024-01-15', 102, 'Business'),
    (3, 'Account Management', 8, 5, 'Resolved', '2024-01-16', 103, 'Residential'),
    (4, 'Device Support', 18, 4, 'Resolved', '2024-01-16', 101, 'Residential'),
    (5, 'Billing Support', 15, 2, 'Unresolved', '2024-01-17', 104, 'Business'),
    (6, 'Network Issues', 30, 3, 'Escalated', '2024-01-17', 102, 'Enterprise'),
    (7, 'Technical Support', 22, 4, 'Resolved', '2024-01-18', 105, 'Residential'),
    (8, 'Account Management', 6, 5, 'Resolved', '2024-01-18', 103, 'Business'),
    
    -- Edge cases and more variety
    (9, 'Billing Support', 45, 1, 'Escalated', '2024-01-19', 106, 'Enterprise'),
    (10, 'Network Issues', 3, 5, 'Resolved', '2024-01-19', 107, 'Residential'),
    (11, 'Device Support', 67, 2, 'Unresolved', '2024-01-20', 108, 'Business'),
    (12, 'Technical Support', 1, 4, 'Resolved', '2024-01-20', 105, 'Residential'),
    (13, 'Account Management', 90, 1, 'Escalated', '2024-01-21', 109, 'Enterprise'),
    (14, 'Billing Support', 5, 5, 'Resolved', '2024-01-21', 101, 'Residential'),
    (15, 'Network Issues', 35, 3, 'Resolved', '2024-01-22', 110, 'Business'),
    (16, 'Device Support', 14, 4, 'Resolved', '2024-01-22', 102, 'Residential'),
    (17, 'Technical Support', 28, 2, 'Escalated', '2024-01-23', 111, 'Enterprise'),
    (18, 'Account Management', 9, 5, 'Resolved', '2024-01-23', 103, 'Business'),
    
    -- Weekend and holiday patterns
    (19, 'Emergency Support', 120, 1, 'Escalated', '2024-01-27', 112, 'Enterprise'),
    (20, 'Network Issues', 2, 5, 'Resolved', '2024-01-28', 113, 'Residential'),
    (21, 'Billing Support', 0, NULL, 'Dropped', '2024-01-29', NULL, 'Residential'), -- Edge case: dropped call
    (22, 'Technical Support', 180, 1, 'Unresolved', '2024-01-30', 114, 'Enterprise'), -- Very long call
    (23, 'Device Support', 7, 4, 'Resolved', '2024-01-31', 115, 'Business'),
    (24, 'Account Management', 4, 5, 'Resolved', '2024-02-01', 103, 'Residential');`
  },

  10: {
    // Google Cloud Platform Revenue Analytics - Enhanced
    title: "Google Cloud Platform Revenue Analytics", 
    setupSql: `CREATE TABLE gcp_service_revenue (
        service_id INT PRIMARY KEY,
        service_category VARCHAR(50),
        quarterly_revenue DECIMAL(15,2),
        customer_count INT,
        quarter VARCHAR(10),
        pricing_model VARCHAR(30),
        growth_rate DECIMAL(5,2), -- Percentage growth
        region VARCHAR(20)
    );
    
    INSERT INTO gcp_service_revenue VALUES 
    -- Q1 2024 Data
    (1, 'Compute Engine', 2500000000.50, 45000, 'Q1 2024', 'Pay-as-you-go', 15.2, 'US-East'),
    (2, 'BigQuery', 1800000000.75, 32000, 'Q1 2024', 'Storage + Compute', 22.5, 'US-West'),
    (3, 'Cloud Storage', 950000000.25, 78000, 'Q1 2024', 'Storage Tiers', 8.3, 'Europe'),
    (4, 'Kubernetes Engine', 1200000000.80, 28000, 'Q1 2024', 'Node Hours', 35.7, 'Asia'),
    (5, 'Cloud AI/ML', 750000000.60, 15000, 'Q1 2024', 'API Calls', 67.8, 'US-Central'),
    
    -- Q2 2024 Data (showing growth patterns)
    (6, 'Compute Engine', 2875000000.75, 51800, 'Q2 2024', 'Pay-as-you-go', 15.0, 'US-East'),
    (7, 'BigQuery', 2205000000.20, 39200, 'Q2 2024', 'Storage + Compute', 22.5, 'US-West'),
    (8, 'Cloud Storage', 1029000000.50, 84500, 'Q2 2024', 'Storage Tiers', 8.3, 'Europe'),
    (9, 'Kubernetes Engine', 1628400000.85, 38000, 'Q2 2024', 'Node Hours', 35.7, 'Asia'),
    (10, 'Cloud AI/ML', 1258500000.80, 25200, 'Q2 2024', 'API Calls', 67.8, 'US-Central'),
    
    -- New services and edge cases
    (11, 'Cloud Functions', 125000000.00, 12000, 'Q1 2024', 'Invocations', 45.2, 'Global'),
    (12, 'Firebase', 89000000.50, 95000, 'Q1 2024', 'Usage Tiers', 28.1, 'Global'),
    (13, 'Cloud CDN', 156000000.25, 8500, 'Q1 2024', 'Bandwidth', 12.7, 'Global'),
    (14, 'Cloud Security', 234000000.75, 4200, 'Q2 2024', 'Per User', 89.3, 'US-East'),
    
    -- Edge cases
    (15, 'Legacy Service', 1500000.00, 150, 'Q1 2024', 'Fixed Contract', -15.5, 'US-West'), -- Declining service
    (16, 'Beta Service', 0.00, 500, 'Q1 2024', 'Free Beta', NULL, 'Global'), -- No revenue yet
    (17, 'Enterprise Only', 50000000.00, 5, 'Q2 2024', 'Custom Contract', 200.0, 'Global'); -- High per-customer revenue`
  },

  25: {
    // E-commerce analytics with comprehensive data
    title: "Amazon Prime Video Content Performance",
    setupSql: `CREATE TABLE prime_video_content (
        content_id INT PRIMARY KEY,
        title VARCHAR(100),
        content_type VARCHAR(20),
        genre VARCHAR(50),
        release_date DATE,
        total_views BIGINT,
        avg_rating DECIMAL(3,2),
        runtime_minutes INT,
        production_cost DECIMAL(15,2),
        revenue DECIMAL(15,2),
        region VARCHAR(20),
        language VARCHAR(20)
    );
    
    INSERT INTO prime_video_content VALUES 
    -- Popular shows and movies
    (1, 'The Boys Season 4', 'Series', 'Superhero/Drama', '2024-06-13', 89500000, 8.7, 3600, 200000000.00, 450000000.00, 'Global', 'English'),
    (2, 'The Rings of Power', 'Series', 'Fantasy/Adventure', '2022-09-02', 125000000, 7.8, 4800, 715000000.00, 650000000.00, 'Global', 'English'),
    (3, 'Jack Ryan Season 4', 'Series', 'Action/Thriller', '2023-06-30', 67000000, 8.2, 4800, 150000000.00, 280000000.00, 'Global', 'English'),
    (4, 'Citadel', 'Series', 'Action/Spy', '2023-04-28', 56000000, 7.5, 3600, 300000000.00, 175000000.00, 'Global', 'English'),
    
    -- Movies
    (5, 'Air', 'Movie', 'Biography/Drama', '2023-04-05', 45000000, 7.4, 112, 85000000.00, 120000000.00, 'Global', 'English'),
    (6, 'The Tomorrow War', 'Movie', 'Sci-Fi/Action', '2021-07-02', 78000000, 6.5, 138, 200000000.00, 150000000.00, 'Global', 'English'),
    (7, 'Coming 2 America', 'Movie', 'Comedy', '2021-03-05', 92000000, 5.3, 110, 60000000.00, 75000000.00, 'Global', 'English'),
    
    -- International content
    (8, 'Mirzapur Season 3', 'Series', 'Crime/Drama', '2024-07-05', 34000000, 8.9, 3000, 25000000.00, 45000000.00, 'India', 'Hindi'),
    (9, 'The Family Man 3', 'Series', 'Thriller/Drama', '2024-05-12', 28000000, 8.6, 2400, 20000000.00, 38000000.00, 'India', 'Hindi'),
    (10, 'El Presidente', 'Series', 'Biography/Drama', '2020-06-05', 15000000, 7.8, 2400, 15000000.00, 22000000.00, 'Latin America', 'Spanish'),
    
    -- Kids content
    (11, 'Pete the Cat', 'Series', 'Kids/Animation', '2017-12-25', 125000000, 4.2, 1800, 35000000.00, 89000000.00, 'US', 'English'),
    (12, 'Bluey Specials', 'Series', 'Kids/Family', '2023-11-12', 98000000, 4.9, 180, 5000000.00, 25000000.00, 'Global', 'English'),
    
    -- Documentary content
    (13, 'All or Nothing: Arsenal', 'Documentary', 'Sports', '2022-08-04', 23000000, 8.1, 2400, 12000000.00, 18000000.00, 'Global', 'English'),
    (14, 'LuLaRich', 'Documentary', 'True Crime', '2021-09-10', 18000000, 7.9, 240, 8000000.00, 12000000.00, 'US', 'English'),
    
    -- Edge cases and failures
    (15, 'Cancelled Show', 'Series', 'Drama', '2023-01-15', 2500000, 5.8, 600, 45000000.00, 8000000.00, 'US', 'English'), -- Poor performance
    (16, 'Foreign Experiment', 'Movie', 'Art House', '2023-08-20', 450000, 6.2, 95, 3000000.00, 750000.00, 'Europe', 'French'), -- Niche content
    (17, 'Reality Show Flop', 'Reality', 'Competition', '2023-04-01', 1200000, 3.1, 1200, 15000000.00, 2500000.00, 'US', 'English'), -- Major flop
    
    -- Recent releases with limited data
    (18, 'New Thriller Series', 'Series', 'Thriller', '2024-08-01', 12000000, 7.8, 2400, 75000000.00, NULL, 'Global', 'English'), -- No revenue data yet
    (19, 'Indie Film', 'Movie', 'Independent', '2024-07-28', 890000, 8.4, 89, 2500000.00, NULL, 'US', 'English'), -- Critical success, limited views
    (20, 'Holiday Special', 'Special', 'Family', '2023-12-24', 67000000, 4.5, 90, 12000000.00, 35000000.00, 'Global', 'English'); -- Seasonal content`
  }
};

async function enhanceSchemaData() {
  console.log('🚀 ENHANCING SCHEMA DATA WITH COMPREHENSIVE DATASETS');
  console.log('Adding realistic edge cases, more data points, and better patterns\n');
  
  let enhancedCount = 0;
  
  try {
    for (const [problemNumericId, enhancement] of Object.entries(enhancedSchemas)) {
      console.log(`📊 Enhancing Problem #${problemNumericId}: ${enhancement.title}`);
      
      try {
        // Update the problem schema with enhanced setup SQL
        const updateQuery = `
          UPDATE problem_schemas 
          SET setup_sql = $1
          WHERE problem_id = (SELECT id FROM problems WHERE numeric_id = $2 AND is_active = true)
        `;
        
        const result = await pool.query(updateQuery, [enhancement.setupSql, parseInt(problemNumericId)]);
        
        if (result.rowCount > 0) {
          // Test the enhanced schema
          await pool.query('BEGIN');
          await pool.query('CREATE SCHEMA IF NOT EXISTS test_schema');
          await pool.query('SET search_path TO test_schema');
          await pool.query(enhancement.setupSql);
          
          // Count rows to show improvement
          const tables = enhancement.setupSql.match(/CREATE TABLE (\w+)/g);
          if (tables && tables.length > 0) {
            const tableName = tables[0].replace('CREATE TABLE ', '');
            const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
            const rowCount = countResult.rows[0].count;
            
            console.log(`   ✅ Enhanced with ${rowCount} rows of data (was ~5-8 rows)`);
            enhancedCount++;
          }
          
          await pool.query('ROLLBACK');
        } else {
          console.log(`   ⚠️  Problem #${problemNumericId} not found or not active`);
        }
        
      } catch (error) {
        await pool.query('ROLLBACK');
        console.log(`   ❌ Failed to enhance Problem #${problemNumericId}: ${error.message.substring(0, 60)}...`);
      }
    }
    
    console.log(`\n📈 ENHANCEMENT RESULTS:`);
    console.log(`   ✅ Successfully enhanced: ${enhancedCount} problem schemas`);
    console.log(`   🎯 Improvements include:`);
    console.log(`      • 3-4x more sample data (15-25 rows vs 5-8 rows)`);
    console.log(`      • Edge cases: NULL values, outliers, boundary conditions`);
    console.log(`      • Realistic patterns: seasonal data, growth trends, failures`);
    console.log(`      • Better variety: multiple regions, time periods, categories`);
    console.log(`      • Complex scenarios: declined services, beta products, enterprise tiers`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Additional utility function to create edge case test scenarios
function createEdgeCaseScenarios() {
  return {
    nullValues: "Test handling of NULL values in various columns",
    outliers: "Test extreme values (very high/low numbers)",
    emptyResults: "Test queries that should return no rows", 
    duplicates: "Test handling of duplicate data scenarios",
    boundaries: "Test date boundaries, numeric limits, string lengths",
    seasonal: "Test time-based patterns and seasonal variations",
    international: "Test multi-language and multi-region scenarios",
    businessLogic: "Test real-world business constraints and edge cases"
  };
}

if (require.main === module) {
  enhanceSchemaData().catch(console.error);
}

module.exports = { enhanceSchemaData, createEdgeCaseScenarios };