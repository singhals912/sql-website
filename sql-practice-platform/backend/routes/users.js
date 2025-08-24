const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get user profile
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await pool.query(`
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active,
                   up.display_name, up.bio, up.skill_level, up.preferred_sql_dialect,
                   up.avatar_url, up.location, up.website_url, up.github_url, up.linkedin_url
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE u.id = $1
        `, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Get user statistics
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await pool.query(`
            SELECT us.*, 
                   (SELECT COUNT(*) FROM user_problem_progress upp WHERE upp.user_id = $1 AND upp.status = 'solved') as problems_solved,
                   (SELECT COUNT(*) FROM user_problem_attempts upa WHERE upa.user_id = $1) as total_attempts
            FROM user_statistics us
            WHERE us.user_id = $1
        `, [userId]);
        
        if (result.rows.length === 0) {
            // Create default stats if none exist
            await pool.query(`
                INSERT INTO user_statistics (user_id) VALUES ($1)
            `, [userId]);
            
            res.json({
                user_id: userId,
                problems_solved: 0,
                total_attempts: 0,
                accuracy_rate: 0,
                avg_solve_time_ms: 0,
                current_streak_days: 0,
                longest_streak_days: 0,
                points: 0,
                ranking: null
            });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
});

module.exports = router;