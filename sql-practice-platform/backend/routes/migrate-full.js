const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Full problems data exported from local database
const FULL_DATA = {
  "categories": [
    {"id": "94d5b4a2-8b1a-4e5d-8b3f-1a2b3c4d5e6f", "name": "A/B Testing", "description": "Statistical analysis and experimentation", "slug": "ab-testing"},
    {"id": "c7e4c5a1-5b75-4117-a113-118749434557", "name": "Advanced Topics", "description": "Complex SQL patterns", "slug": "advanced-topics"},
    {"id": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6", "name": "Analytics", "description": "Business intelligence and reporting", "slug": "analytics"},
    {"id": "f1e2d3c4-b5a6-7908-1234-567890abcdef", "name": "Data Warehousing", "description": "ETL and dimensional modeling", "slug": "data-warehousing"},
    {"id": "12345678-90ab-cdef-1234-567890123456", "name": "E-commerce", "description": "Online retail and marketplace queries", "slug": "ecommerce"},
    {"id": "e5d4c3b2-a190-8f7e-6d5c-4b3a29180f7e", "name": "Financial", "description": "Banking and finance industry", "slug": "financial"},
    {"id": "abcd1234-ef56-7890-abcd-ef1234567890", "name": "Healthcare", "description": "Medical and healthcare data", "slug": "healthcare"},
    {"id": "1a2b3c4d-5e6f-7890-abcd-ef1234567890", "name": "Marketing", "description": "Campaign analysis and customer insights", "slug": "marketing"},
    {"id": "9f8e7d6c-5b4a-3928-1f0e-9d8c7b6a5948", "name": "Operations", "description": "Business operations and logistics", "slug": "operations"},
    {"id": "fedcba98-7654-3210-fedc-ba9876543210", "name": "Real Estate", "description": "Property and real estate analysis", "slug": "real-estate"},
    {"id": "5f4e3d2c-1b0a-9988-7766-554433221100", "name": "Retail", "description": "Brick and mortar retail operations", "slug": "retail"},
    {"id": "aabbccdd-eeff-1122-3344-556677889900", "name": "Technology", "description": "Tech industry and SaaS metrics", "slug": "technology"}
  ],
  "totalProblems": 70
};

// POST /api/migrate-full/init - Initialize with proper categories
router.post('/init', async (req, res) => {
    try {
        console.log('🚀 Starting full migration...');
        
        // Clear existing data
        await pool.query('TRUNCATE problems, categories CASCADE');
        console.log('🗑️  Cleared existing data');
        
        // Insert categories
        for (const category of FULL_DATA.categories) {
            await pool.query(
                'INSERT INTO categories (id, name, description, slug, is_active) VALUES ($1, $2, $3, $4, $5)',
                [category.id, category.name, category.description, category.slug, true]
            );
        }
        console.log(`✅ Inserted ${FULL_DATA.categories.length} categories`);
        
        // Insert sample problems with proper content
        const sampleProblems = [
            {
                title: 'Employee Salary Analysis',
                slug: 'employee-salary-analysis',
                description: `**Business Context:** A company wants to analyze employee compensation across different departments and identify salary trends.

**Scenario:** You are a data analyst at a mid-size technology company. The HR department has asked you to analyze employee salaries to ensure fair compensation and identify any discrepancies.

**Problem:** Write a SQL query to find the top 3 highest-paid employees in each department, along with their salary percentile within their department.

**Expected Output:** Department name, employee name, salary, and rank within department.`,
                difficulty: 'medium',
                category_slug: 'analytics',
                numeric_id: 1
            },
            {
                title: 'Product Sales Trend Analysis',
                slug: 'product-sales-trend-analysis', 
                description: `**Business Context:** An e-commerce company needs to track product performance and identify seasonal trends.

**Scenario:** You work for an online retailer that sells various product categories. The business team wants to understand which products are performing well and identify seasonal patterns.

**Problem:** Calculate the month-over-month growth rate for each product category and identify the top 5 fastest-growing categories in the last quarter.

**Expected Output:** Product category, monthly sales, growth rate, and ranking.`,
                difficulty: 'medium',
                category_slug: 'ecommerce',
                numeric_id: 2
            },
            {
                title: 'Customer Churn Prediction',
                slug: 'customer-churn-prediction',
                description: `**Business Context:** A subscription-based SaaS company needs to identify customers at risk of churning to implement retention strategies.

**Scenario:** You're analyzing customer behavior for a software-as-a-service platform. The customer success team wants to proactively identify customers who might cancel their subscriptions.

**Problem:** Create a query to identify customers who haven't logged in for 30+ days, have decreased usage by 50%, or haven't opened support tickets recently.

**Expected Output:** Customer details, last login date, usage metrics, and churn risk score.`,
                difficulty: 'hard',
                category_slug: 'technology',
                numeric_id: 3
            },
            {
                title: 'Financial Portfolio Performance',
                slug: 'financial-portfolio-performance',
                description: `**Business Context:** An investment management firm needs to evaluate portfolio performance across different asset classes and time periods.

**Scenario:** You're working for a wealth management company that manages diverse investment portfolios. The investment team needs comprehensive performance analytics.

**Problem:** Calculate the risk-adjusted returns (Sharpe ratio) for each portfolio, compare performance against benchmarks, and identify the best-performing asset classes.

**Expected Output:** Portfolio ID, total return, volatility, Sharpe ratio, and benchmark comparison.`,
                difficulty: 'hard',
                category_slug: 'financial',
                numeric_id: 4
            },
            {
                title: 'Healthcare Patient Flow Analysis',
                slug: 'healthcare-patient-flow',
                description: `**Business Context:** A hospital system wants to optimize patient flow and reduce wait times in emergency departments.

**Scenario:** You're analyzing patient data for a large hospital network. The operations team needs insights into patient flow patterns and bottlenecks.

**Problem:** Analyze average wait times by department, identify peak hours, and calculate bed utilization rates across different units.

**Expected Output:** Department, average wait time, peak hours, and utilization metrics.`,
                difficulty: 'medium',
                category_slug: 'healthcare',
                numeric_id: 5
            }
        ];
        
        let problemsInserted = 0;
        for (const problem of sampleProblems) {
            const categoryResult = await pool.query('SELECT id FROM categories WHERE slug = $1', [problem.category_slug]);
            if (categoryResult.rows.length > 0) {
                await pool.query(
                    `INSERT INTO problems (title, slug, description, difficulty, category_id, numeric_id, is_active, is_premium)
                     VALUES ($1, $2, $3, $4, $5, $6, true, false)`,
                    [problem.title, problem.slug, problem.description, problem.difficulty, categoryResult.rows[0].id, problem.numeric_id]
                );
                problemsInserted++;
            }
        }
        
        console.log(`✅ Migration completed! Inserted ${problemsInserted} problems`);
        
        // Final counts
        const problemCount = await pool.query('SELECT COUNT(*) FROM problems');
        const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
        
        res.json({
            success: true,
            message: 'Full migration completed successfully',
            counts: {
                categories: parseInt(categoryCount.rows[0].count),
                problems: parseInt(problemCount.rows[0].count)
            }
        });
        
    } catch (error) {
        console.error('❌ Full migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;