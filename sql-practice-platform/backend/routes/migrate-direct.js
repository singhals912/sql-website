const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// POST /api/migrate-direct/all - Direct migration of all problems
router.post('/all', async (req, res) => {
    try {
        console.log('🚀 Starting direct migration of all problems...');
        
        // Read the exported data
        const exportFile = path.join(__dirname, '../problems-export-2025-08-24.json');
        if (!fs.existsSync(exportFile)) {
            throw new Error('Export file not found. Please export problems first.');
        }
        
        const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
        console.log(`📁 Found ${exportData.totalProblems} problems and ${exportData.totalCategories} categories`);
        
        // Clear existing data
        await pool.query('DELETE FROM problems');
        await pool.query('DELETE FROM categories');
        console.log('🗑️ Cleared existing data');
        
        // Insert categories
        let categoriesInserted = 0;
        for (const category of exportData.categories) {
            try {
                await pool.query(
                    'INSERT INTO categories (id, name, slug, description, created_at) VALUES ($1, $2, $3, $4, $5)',
                    [category.id, category.name, category.slug, category.description || '', category.created_at || new Date()]
                );
                categoriesInserted++;
            } catch (err) {
                console.log(`Category ${category.name} error:`, err.message);
            }
        }
        console.log(`✅ Inserted ${categoriesInserted} categories`);
        
        // Insert problems
        let problemsInserted = 0;
        let errors = 0;
        
        for (const problem of exportData.problems) {
            try {
                await pool.query(`
                    INSERT INTO problems (
                        id, title, slug, description, difficulty, 
                        category_id, is_premium, is_active, numeric_id,
                        tags, hints, created_at, total_submissions, 
                        total_accepted, acceptance_rate
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `, [
                    problem.id,
                    problem.title,
                    problem.slug, 
                    problem.description || 'Problem description will be available soon.',
                    problem.difficulty,
                    problem.category_id,
                    problem.is_premium || false,
                    problem.is_active !== false,
                    problem.numeric_id,
                    problem.tags ? JSON.stringify(problem.tags) : null,
                    problem.hints ? JSON.stringify(problem.hints) : null,
                    problem.created_at || new Date(),
                    problem.total_submissions || 0,
                    problem.total_accepted || 0,
                    problem.acceptance_rate || '0.00'
                ]);
                problemsInserted++;
                
                if (problemsInserted % 10 === 0) {
                    console.log(`📝 Processed ${problemsInserted} problems...`);
                }
            } catch (err) {
                console.log(`Problem ${problem.title} error:`, err.message);
                errors++;
            }
        }
        
        console.log(`✅ Migration completed! Inserted ${problemsInserted} problems, ${errors} errors`);
        
        // Final counts
        const problemCount = await pool.query('SELECT COUNT(*) FROM problems');
        const categoryCount = await pool.query('SELECT COUNT(*) FROM categories');
        
        res.json({
            success: true,
            message: 'Direct migration completed',
            counts: {
                categories: parseInt(categoryCount.rows[0].count),
                problems: parseInt(problemCount.rows[0].count)
            },
            inserted: problemsInserted,
            errors: errors
        });
        
    } catch (error) {
        console.error('❌ Direct migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;