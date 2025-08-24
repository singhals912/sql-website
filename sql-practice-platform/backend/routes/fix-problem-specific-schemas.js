const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// POST /api/fix-problem-specific-schemas/social-media - Fix social media problem schema
router.post('/social-media', async (req, res) => {
    try {
        console.log('🔧 Fixing Social Media Engagement Analysis schema...');
        
        // Find the Social Media problem
        const problemResult = await pool.query(
            "SELECT id FROM problems WHERE title ILIKE '%social media%' OR description ILIKE '%social media%'"
        );
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Social Media problem not found' });
        }
        
        const problemId = problemResult.rows[0].id;
        
        const setupSql = `-- Social Media Engagement Database Schema
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    content_type VARCHAR(50), -- 'video', 'image', 'text', 'story'
    caption TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for Social Media Engagement Analysis
INSERT INTO users (user_id, username, follower_count, following_count) VALUES
(1, 'tech_guru', 15000, 500),
(2, 'lifestyle_blogger', 8500, 300),
(3, 'food_critic', 12000, 200),
(4, 'travel_explorer', 20000, 800),
(5, 'fitness_coach', 18000, 400);

INSERT INTO posts (post_id, user_id, content_type, caption, likes_count, comments_count, shares_count) VALUES
(1, 1, 'video', 'Latest tech review: iPhone vs Android', 1250, 89, 156),
(2, 2, 'image', 'Morning routine essentials', 890, 45, 67),
(3, 3, 'image', 'Best pasta in NYC - hidden gem!', 2100, 134, 289),
(4, 4, 'video', 'Sunset in Santorini - breathtaking!', 3400, 267, 445),
(5, 5, 'video', '10-minute morning workout', 1800, 156, 234),
(6, 1, 'text', 'Thoughts on AI in everyday life', 670, 78, 89),
(7, 2, 'story', 'Behind the scenes of photoshoot', 450, 23, 34),
(8, 3, 'video', 'Cooking masterclass: Italian basics', 2800, 189, 367);`;

        const expectedOutput = [
            {
                "content_type": "video",
                "avg_engagement": "2087.5",
                "total_posts": 4
            },
            {
                "content_type": "image", 
                "avg_engagement": "1495.0",
                "total_posts": 2
            },
            {
                "content_type": "text",
                "avg_engagement": "837.0",
                "total_posts": 1
            },
            {
                "content_type": "story",
                "avg_engagement": "507.0", 
                "total_posts": 1
            }
        ];

        // Update the schema for this problem
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1, expected_output = $2
            WHERE problem_id = $3 AND sql_dialect = 'postgresql'
        `, [setupSql, JSON.stringify(expectedOutput), problemId]);
        
        console.log('✅ Social Media schema fixed');
        
        res.json({
            success: true,
            message: 'Social Media Engagement Analysis schema fixed',
            problemId: problemId
        });
        
    } catch (error) {
        console.error('❌ Schema fix failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/fix-problem-specific-schemas/batch-fix - Fix multiple problems at once
router.post('/batch-fix', async (req, res) => {
    try {
        console.log('🔧 Starting batch fix of problem-specific schemas...');
        
        const fixes = [
            {
                searchTerm: 'social media',
                setupSql: `-- Social Media Engagement Database Schema
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    content_type VARCHAR(50),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,  
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO posts (post_id, user_id, content_type, likes_count, comments_count, shares_count) VALUES
(1, 1, 'video', 1250, 89, 156),
(2, 2, 'image', 890, 45, 67),
(3, 3, 'image', 2100, 134, 289),
(4, 4, 'video', 3400, 267, 445),
(5, 5, 'video', 1800, 156, 234);`,
                expectedOutput: [
                    {"content_type": "video", "avg_engagement": "2150.0", "total_posts": 3},
                    {"content_type": "image", "avg_engagement": "1495.0", "total_posts": 2}
                ]
            }
            // Add more problem-specific fixes here
        ];
        
        let results = { fixed: 0, errors: [] };
        
        for (const fix of fixes) {
            try {
                const problemResult = await pool.query(
                    "SELECT id FROM problems WHERE description ILIKE $1 OR title ILIKE $1",
                    [`%${fix.searchTerm}%`]
                );
                
                if (problemResult.rows.length > 0) {
                    const problemId = problemResult.rows[0].id;
                    
                    await pool.query(`
                        UPDATE problem_schemas 
                        SET setup_sql = $1, expected_output = $2
                        WHERE problem_id = $3 AND sql_dialect = 'postgresql'
                    `, [fix.setupSql, JSON.stringify(fix.expectedOutput), problemId]);
                    
                    results.fixed++;
                    console.log(`✅ Fixed schema for ${fix.searchTerm} problem`);
                }
            } catch (error) {
                results.errors.push(`${fix.searchTerm}: ${error.message}`);
            }
        }
        
        console.log(`🎉 Batch fix completed: ${results.fixed} problems fixed`);
        
        res.json({
            success: true,
            message: `Batch fix completed: ${results.fixed} problems fixed`,
            results: results
        });
        
    } catch (error) {
        console.error('❌ Batch fix failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;