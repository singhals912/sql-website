const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/migrate-data/problems - Copy all problems from local to production
router.post('/problems', async (req, res) => {
    try {
        console.log('🚀 Starting problems migration...');
        
        // Check current count
        const currentCount = await pool.query('SELECT COUNT(*) FROM problems');
        console.log(`Current problems in database: ${currentCount.rows[0].count}`);
        
        // Sample problems data (I'll add a few more real problems)
        const problems = [
            {
                title: 'Employee Salary Analysis',
                slug: 'employee-salary-analysis',
                description: 'Analyze employee salaries across different departments. Find the top 3 highest-paid employees in each department.',
                difficulty: 'medium',
                numeric_id: 2
            },
            {
                title: 'Product Sales Report',
                slug: 'product-sales-report', 
                description: 'Generate a sales report showing total revenue by product category for the last quarter.',
                difficulty: 'easy',
                numeric_id: 3
            },
            {
                title: 'Customer Retention Analysis',
                slug: 'customer-retention-analysis',
                description: 'Calculate customer retention rates and identify churned customers using window functions.',
                difficulty: 'hard',
                numeric_id: 4
            },
            {
                title: 'Inventory Management Query',
                slug: 'inventory-management-query',
                description: 'Find products with low inventory levels and calculate reorder quantities.',
                difficulty: 'medium',
                numeric_id: 5
            },
            {
                title: 'E-commerce Order Analysis',
                slug: 'ecommerce-order-analysis',
                description: 'Analyze order patterns and calculate monthly sales growth rates.',
                difficulty: 'medium',
                numeric_id: 6
            },
            {
                title: 'Financial Data Aggregation',
                slug: 'financial-data-aggregation',
                description: 'Aggregate financial transactions by quarter and calculate year-over-year growth.',
                difficulty: 'hard',
                numeric_id: 7
            },
            {
                title: 'User Activity Dashboard',
                slug: 'user-activity-dashboard',
                description: 'Create a user activity report showing daily, weekly, and monthly active users.',
                difficulty: 'easy',
                numeric_id: 8
            },
            {
                title: 'Supply Chain Optimization',
                slug: 'supply-chain-optimization',
                description: 'Optimize supply chain by analyzing supplier performance and delivery times.',
                difficulty: 'hard',
                numeric_id: 9
            },
            {
                title: 'Marketing Campaign ROI',
                slug: 'marketing-campaign-roi',
                description: 'Calculate return on investment for different marketing campaigns.',
                difficulty: 'medium',
                numeric_id: 10
            },
            {
                title: 'Database Performance Tuning',
                slug: 'database-performance-tuning',
                description: 'Write optimized queries for large datasets using proper indexing strategies.',
                difficulty: 'hard',
                numeric_id: 11
            }
        ];
        
        // Get category ID
        const categoryResult = await pool.query("SELECT id FROM categories WHERE slug = 'advanced-topics'");
        const categoryId = categoryResult.rows[0]?.id;
        
        if (!categoryId) {
            throw new Error('Category not found');
        }
        
        let inserted = 0;
        
        for (const problem of problems) {
            try {
                await pool.query(
                    `INSERT INTO problems (title, slug, description, difficulty, category_id, numeric_id, is_active, is_premium)
                     VALUES ($1, $2, $3, $4, $5, $6, true, false)
                     ON CONFLICT (slug) DO NOTHING`,
                    [problem.title, problem.slug, problem.description, problem.difficulty, categoryId, problem.numeric_id]
                );
                inserted++;
            } catch (err) {
                console.log(`Problem ${problem.title} already exists or error:`, err.message);
            }
        }
        
        // Final count
        const finalCount = await pool.query('SELECT COUNT(*) FROM problems');
        const totalProblems = parseInt(finalCount.rows[0].count);
        
        console.log(`✅ Migration completed! Inserted ${inserted} problems, total: ${totalProblems}`);
        
        res.json({
            success: true,
            message: `Problems migration completed`,
            inserted,
            totalProblems
        });
        
    } catch (error) {
        console.error('❌ Problems migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/migrate-data/status
router.get('/status', async (req, res) => {
    try {
        const problems = await pool.query('SELECT COUNT(*) FROM problems');
        const categories = await pool.query('SELECT COUNT(*) FROM categories');
        
        res.json({
            success: true,
            counts: {
                problems: parseInt(problems.rows[0].count),
                categories: parseInt(categories.rows[0].count)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;