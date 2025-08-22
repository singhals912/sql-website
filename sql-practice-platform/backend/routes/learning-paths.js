const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all learning paths
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                lp.*,
                COUNT(lps.id) as problem_count,
                ROUND(AVG(lps.estimated_time_minutes)) as avg_time_per_problem
            FROM learning_paths lp
            LEFT JOIN learning_path_steps lps ON lp.id = lps.learning_path_id
            WHERE lp.is_active = true
            GROUP BY lp.id
            ORDER BY lp.order_index
        `);
        
        // Transform to frontend format
        const learningPaths = result.rows.map(path => ({
            id: path.id,
            name: path.name, // Frontend expects 'name'
            title: path.name,
            description: path.description,
            slug: path.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            level: path.difficulty_level,
            difficulty_level: path.difficulty_level, // Frontend expects this field
            duration: `${path.estimated_hours} hours`,
            estimated_hours: path.estimated_hours, // Frontend expects this field
            estimatedHours: path.estimated_hours,
            skills: path.skills_learned || [],
            skills_learned: path.skills_learned || [], // Frontend might expect this field
            prerequisites: path.prerequisites || [],
            problemCount: parseInt(path.problem_count) || 0,
            total_steps: parseInt(path.problem_count) || 0, // Frontend expects 'total_steps'
            avgTimePerProblem: parseInt(path.avg_time_per_problem) || 30,
            order: path.order_index
        }));
        
        res.json(learningPaths);
    } catch (error) {
        console.error('Error fetching learning paths:', error);
        res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
});

// Get learning path problems by problem ID
router.get('/:problemId/learning-paths', async (req, res) => {
    try {
        const { problemId } = req.params;
        
        // Get the problem first
        let problem;
        if (isNaN(problemId)) {
            const result = await pool.query(
                'SELECT * FROM problems WHERE slug = $1 AND is_active = true',
                [problemId]
            );
            problem = result.rows[0];
        } else {
            const result = await pool.query(`
                SELECT * FROM problems 
                WHERE is_active = true 
                ORDER BY created_at DESC 
                LIMIT 1 OFFSET $1
            `, [parseInt(problemId) - 1]);
            problem = result.rows[0];
        }
        
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        // Get the category/learning path for this problem
        const result = await pool.query(
            'SELECT * FROM categories WHERE id = $1',
            [problem.category_id]
        );
        
        if (result.rows.length === 0) {
            return res.json([]);
        }
        
        const category = result.rows[0];
        
        res.json([{
            id: category.id,
            title: category.name,
            description: category.description,
            slug: category.slug,
            icon: category.icon
        }]);
    } catch (error) {
        console.error('Error fetching learning paths for problem:', error);
        res.status(500).json({ error: 'Failed to fetch learning paths' });
    }
});

// Get specific learning path with problems
router.get('/:pathId', async (req, res) => {
    try {
        const { pathId } = req.params;
        
        // Get learning path details
        const pathResult = await pool.query(`
            SELECT * FROM learning_paths 
            WHERE id = $1 AND is_active = true
        `, [pathId]);
        
        if (pathResult.rows.length === 0) {
            return res.status(404).json({ error: 'Learning path not found' });
        }
        
        const path = pathResult.rows[0];
        
        // Get problems in this learning path
        const problemsResult = await pool.query(`
            SELECT 
                p.*,
                lps.step_order,
                lps.description as step_description,
                lps.learning_objectives,
                lps.estimated_time_minutes,
                lps.is_optional,
                c.name as category_name
            FROM learning_path_steps lps
            JOIN problems p ON lps.problem_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE lps.learning_path_id = $1
            ORDER BY lps.step_order
        `, [pathId]);
        
        const problems = problemsResult.rows.map(problem => ({
            id: problem.id,
            numeric_id: problem.numeric_id,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            description: problem.description,
            category: problem.category_name,
            stepOrder: problem.step_order,
            stepDescription: problem.step_description,
            learningObjectives: problem.learning_objectives || [],
            estimatedTimeMinutes: problem.estimated_time_minutes || 30,
            isOptional: problem.is_optional || false,
            acceptance_rate: problem.acceptance_rate
        }));
        
        res.json({
            id: path.id,
            title: path.name,
            description: path.description,
            difficulty_level: path.difficulty_level,
            estimated_hours: path.estimated_hours,
            prerequisites: path.prerequisites || [],
            skills_learned: path.skills_learned || [],
            problems: problems,
            totalProblems: problems.length,
            completedProblems: 0 // TODO: Get from user progress
        });
    } catch (error) {
        console.error('Error fetching learning path:', error);
        res.status(500).json({ error: 'Failed to fetch learning path' });
    }
});

module.exports = router;