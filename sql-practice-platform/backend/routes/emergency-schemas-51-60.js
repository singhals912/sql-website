const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Create emergency schemas for priority problems 51-60
router.post('/create-schemas-51-60', async (req, res) => {
    try {
        console.log('🚨 Creating emergency schemas for problems 51-60...');
        
        // Focus on easier problems first for quick wins
        const emergencySchemas = [
            {
                numeric_id: 51,
                title: 'Salesforce CRM Performance Analytics',
                setup_sql: `CREATE TABLE salesforce_usage (
                    org_id INT PRIMARY KEY,
                    industry_vertical VARCHAR(100),
                    monthly_active_users INT,
                    total_users INT,
                    features_used INT,
                    data_storage_gb DECIMAL(10,2),
                    custom_objects INT,
                    api_calls_monthly BIGINT
                );
                INSERT INTO salesforce_usage VALUES 
                (1, 'Technology', 750, 1000, 25, 150.5, 45, 500000),
                (2, 'Healthcare', 650, 800, 18, 220.3, 32, 350000),
                (3, 'Financial Services', 820, 900, 30, 180.7, 55, 750000),
                (4, 'Manufacturing', 450, 600, 15, 95.2, 28, 200000),
                (5, 'Retail', 580, 750, 22, 130.8, 38, 400000);`,
                solution_sql: `SELECT 
                    industry_vertical,
                    monthly_active_users,
                    ROUND(monthly_active_users * 100.0 / total_users, 1) as adoption_rate,
                    features_used,
                    api_calls_monthly
                FROM salesforce_usage
                WHERE monthly_active_users > 500
                ORDER BY monthly_active_users DESC;`,
                expected_output: `[{"industry_vertical":"Financial Services","monthly_active_users":"820","adoption_rate":"91.1","features_used":"30","api_calls_monthly":"750000"},{"industry_vertical":"Technology","monthly_active_users":"750","adoption_rate":"75.0","features_used":"25","api_calls_monthly":"500000"},{"industry_vertical":"Healthcare","monthly_active_users":"650","adoption_rate":"81.3","features_used":"18","api_calls_monthly":"350000"},{"industry_vertical":"Retail","monthly_active_users":"580","adoption_rate":"77.3","features_used":"22","api_calls_monthly":"400000"}]`
            },
            {
                numeric_id: 52,
                title: 'Salesforce Customer Success Analytics',
                setup_sql: `CREATE TABLE customer_success_metrics (
                    customer_id INT PRIMARY KEY,
                    industry VARCHAR(100),
                    health_score DECIMAL(4,2),
                    support_tickets_monthly INT,
                    feature_adoption_rate DECIMAL(5,2),
                    contract_value DECIMAL(12,2),
                    renewal_likelihood DECIMAL(5,2),
                    days_since_last_login INT
                );
                INSERT INTO customer_success_metrics VALUES 
                (1, 'Technology', 8.5, 3, 85.50, 120000.00, 92.00, 2),
                (2, 'Healthcare', 7.2, 8, 68.30, 85000.00, 78.50, 5),
                (3, 'Financial Services', 9.1, 1, 94.20, 250000.00, 96.80, 1),
                (4, 'Manufacturing', 6.8, 12, 55.70, 45000.00, 65.20, 15),
                (5, 'Retail', 7.8, 6, 72.40, 95000.00, 82.30, 3);`,
                solution_sql: `SELECT 
                    industry,
                    COUNT(*) as customer_count,
                    ROUND(AVG(health_score), 2) as avg_health_score,
                    ROUND(AVG(support_tickets_monthly), 1) as avg_monthly_tickets,
                    ROUND(AVG(feature_adoption_rate), 1) as avg_feature_adoption,
                    ROUND(AVG(renewal_likelihood), 1) as avg_renewal_likelihood
                FROM customer_success_metrics
                GROUP BY industry
                ORDER BY avg_health_score DESC;`,
                expected_output: `[{"industry":"Financial Services","customer_count":"1","avg_health_score":"9.10","avg_monthly_tickets":"1.0","avg_feature_adoption":"94.2","avg_renewal_likelihood":"96.8"},{"industry":"Technology","customer_count":"1","avg_health_score":"8.50","avg_monthly_tickets":"3.0","avg_feature_adoption":"85.5","avg_renewal_likelihood":"92.0"}]`
            },
            {
                numeric_id: 54,
                title: 'Snapchat Social Media Engagement',
                setup_sql: `CREATE TABLE snapchat_content (
                    content_id INT PRIMARY KEY,
                    content_type VARCHAR(50),
                    creator_tier VARCHAR(20),
                    views_24h BIGINT,
                    likes INT,
                    shares INT,
                    comments INT,
                    engagement_rate DECIMAL(5,2),
                    created_date DATE
                );
                INSERT INTO snapchat_content VALUES 
                (1, 'Story', 'Premium', 1500000, 125000, 8500, 2300, 9.10, '2024-01-15'),
                (2, 'Spotlight', 'Creator', 2200000, 185000, 12000, 4200, 9.14, '2024-01-16'),
                (3, 'Lens', 'Brand', 950000, 76000, 3200, 1100, 8.45, '2024-01-17'),
                (4, 'Story', 'Creator', 750000, 58000, 2800, 950, 8.24, '2024-01-18'),
                (5, 'Spotlight', 'Premium', 1800000, 152000, 9800, 3400, 9.18, '2024-01-19');`,
                solution_sql: `SELECT 
                    content_type,
                    creator_tier,
                    COUNT(*) as content_count,
                    ROUND(AVG(views_24h), 0) as avg_views,
                    ROUND(AVG(engagement_rate), 2) as avg_engagement_rate,
                    SUM(likes + shares + comments) as total_interactions
                FROM snapchat_content
                GROUP BY content_type, creator_tier
                ORDER BY avg_engagement_rate DESC;`,
                expected_output: `[{"content_type":"Spotlight","creator_tier":"Premium","content_count":"1","avg_views":"1800000","avg_engagement_rate":"9.18","total_interactions":"165200"},{"content_type":"Spotlight","creator_tier":"Creator","content_count":"1","avg_views":"2200000","avg_engagement_rate":"9.14","total_interactions":"201200"}]`
            },
            {
                numeric_id: 57,
                title: 'Target Store Revenue by Category',
                setup_sql: `CREATE TABLE target_sales (
                    sale_id INT PRIMARY KEY,
                    store_id INT,
                    product_category VARCHAR(100),
                    sale_amount DECIMAL(10,2),
                    quantity_sold INT,
                    discount_applied DECIMAL(8,2),
                    sale_date DATE,
                    region VARCHAR(50)
                );
                INSERT INTO target_sales VALUES 
                (1, 101, 'Electronics', 1250.99, 3, 125.10, '2024-01-15', 'Midwest'),
                (2, 102, 'Clothing', 89.50, 2, 8.95, '2024-01-15', 'Northeast'),
                (3, 101, 'Home & Garden', 245.75, 5, 24.58, '2024-01-16', 'Midwest'),
                (4, 103, 'Electronics', 899.00, 2, 89.90, '2024-01-16', 'West'),
                (5, 102, 'Groceries', 67.25, 12, 6.73, '2024-01-17', 'Northeast'),
                (6, 101, 'Clothing', 156.30, 3, 15.63, '2024-01-17', 'Midwest');`,
                solution_sql: `SELECT 
                    product_category,
                    COUNT(*) as transaction_count,
                    SUM(quantity_sold) as total_items_sold,
                    ROUND(SUM(sale_amount), 2) as total_revenue,
                    ROUND(AVG(sale_amount), 2) as avg_transaction_value,
                    ROUND(SUM(discount_applied), 2) as total_discounts_given
                FROM target_sales
                GROUP BY product_category
                ORDER BY total_revenue DESC;`,
                expected_output: `[{"product_category":"Electronics","transaction_count":"2","total_items_sold":"5","total_revenue":"2149.99","avg_transaction_value":"1075.00","total_discounts_given":"215.00"},{"product_category":"Home & Garden","transaction_count":"1","total_items_sold":"5","total_revenue":"245.75","avg_transaction_value":"245.75","total_discounts_given":"24.58"}]`
            },
            {
                numeric_id: 59,
                title: 'Top Spending Customers by Month',
                setup_sql: `CREATE TABLE customer_purchases (
                    purchase_id INT PRIMARY KEY,
                    customer_id INT,
                    customer_name VARCHAR(100),
                    purchase_amount DECIMAL(10,2),
                    purchase_date DATE,
                    product_category VARCHAR(50),
                    payment_method VARCHAR(30)
                );
                INSERT INTO customer_purchases VALUES 
                (1, 201, 'Alice Johnson', 1250.00, '2024-01-15', 'Electronics', 'Credit Card'),
                (2, 202, 'Bob Smith', 875.50, '2024-01-18', 'Home Appliances', 'Debit Card'),
                (3, 201, 'Alice Johnson', 450.75, '2024-01-22', 'Clothing', 'Credit Card'),
                (4, 203, 'Carol Davis', 1890.00, '2024-01-25', 'Furniture', 'Credit Card'),
                (5, 202, 'Bob Smith', 325.25, '2024-02-02', 'Electronics', 'Cash'),
                (6, 204, 'David Wilson', 2150.80, '2024-02-05', 'Jewelry', 'Credit Card');`,
                solution_sql: `SELECT 
                    EXTRACT(YEAR FROM purchase_date) as year,
                    EXTRACT(MONTH FROM purchase_date) as month,
                    customer_name,
                    SUM(purchase_amount) as total_spent,
                    COUNT(*) as purchase_count,
                    ROUND(AVG(purchase_amount), 2) as avg_purchase_value
                FROM customer_purchases
                GROUP BY EXTRACT(YEAR FROM purchase_date), EXTRACT(MONTH FROM purchase_date), customer_id, customer_name
                ORDER BY year DESC, month DESC, total_spent DESC;`,
                expected_output: `[{"year":"2024","month":"2","customer_name":"David Wilson","total_spent":"2150.80","purchase_count":"1","avg_purchase_value":"2150.80"},{"year":"2024","month":"2","customer_name":"Bob Smith","total_spent":"325.25","purchase_count":"1","avg_purchase_value":"325.25"}]`
            }
        ];
        
        let createdCount = 0;
        const results = [];
        
        for (const schema of emergencySchemas) {
            try {
                // Get the actual problem ID from numeric_id
                const problemResult = await pool.query(
                    'SELECT id FROM problems WHERE numeric_id = $1',
                    [schema.numeric_id]
                );
                
                if (problemResult.rows.length === 0) {
                    results.push({
                        numeric_id: schema.numeric_id,
                        status: 'PROBLEM_NOT_FOUND'
                    });
                    continue;
                }
                
                const problemId = problemResult.rows[0].id;
                
                // Check if schema already exists
                const existing = await pool.query(
                    'SELECT id FROM problem_schemas WHERE problem_id = $1',
                    [problemId]
                );
                
                if (existing.rows.length === 0) {
                    await pool.query(`
                        INSERT INTO problem_schemas 
                        (problem_id, schema_name, setup_sql, solution_sql, expected_output, sql_dialect)
                        VALUES ($1, 'default', $2, $3, $4, 'postgresql')
                    `, [
                        problemId,
                        schema.setup_sql,
                        schema.solution_sql,
                        schema.expected_output
                    ]);
                    
                    createdCount++;
                    results.push({
                        numeric_id: schema.numeric_id,
                        title: schema.title,
                        status: 'SCHEMA_CREATED'
                    });
                } else {
                    results.push({
                        numeric_id: schema.numeric_id,
                        title: schema.title,
                        status: 'ALREADY_EXISTS'
                    });
                }
            } catch (error) {
                results.push({
                    numeric_id: schema.numeric_id,
                    error: error.message,
                    status: 'ERROR'
                });
            }
        }
        
        console.log(`🚨 BATCH RECOVERY: Created ${createdCount} schemas for problems 51-60`);
        
        res.json({
            success: true,
            message: `Emergency batch schema creation completed for problems 51-60`,
            schemas_created: createdCount,
            total_attempted: emergencySchemas.length,
            results: results,
            recovery_progress: {
                batch_restored: createdCount,
                cumulative_restored: `${createdCount} + previous emergency schemas`,
                remaining_corrupted: `~25 problems still need schemas`
            }
        });
        
    } catch (error) {
        console.error('❌ Error in batch schema creation 51-60:', error);
        res.status(500).json({ 
            error: 'Batch schema creation failed for 51-60', 
            details: error.message 
        });
    }
});

module.exports = router;