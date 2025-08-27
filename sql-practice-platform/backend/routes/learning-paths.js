const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all learning paths
router.get('/', async (req, res) => {
    try {
        // First try to query the learning paths tables
        let learningPaths;
        
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
            learningPaths = result.rows.map(path => ({
                id: path.id,
                name: path.name,
                title: path.name,
                description: path.description,
                slug: path.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                level: path.difficulty_level,
                difficulty_level: path.difficulty_level,
                duration: `${path.estimated_hours} hours`,
                estimated_hours: path.estimated_hours,
                estimatedHours: path.estimated_hours,
                skills: path.skills_learned || [],
                skills_learned: path.skills_learned || [],
                prerequisites: path.prerequisites || [],
                problemCount: parseInt(path.problem_count) || 0,
                total_steps: parseInt(path.problem_count) || 0,
                avgTimePerProblem: parseInt(path.avg_time_per_problem) || 30,
                order: path.order_index
            }));
        } catch (dbError) {
            console.log('⚠️ Learning paths tables not found, using fallback data');
            
            // Fallback: Create learning paths based on CORE SQL categories only (6 paths, not 12)
            try {
                const coreCategories = ['basic-queries', 'joins', 'aggregation', 'subqueries', 'window-functions', 'advanced-topics'];
                
                const categoriesResult = await pool.query(`
                    SELECT 
                        c.*, 
                        COUNT(p.id) as problem_count
                    FROM categories c
                    LEFT JOIN problems p ON c.id = p.category_id AND p.is_active = true
                    WHERE c.slug = ANY($1)
                    GROUP BY c.id
                    ORDER BY 
                        CASE c.slug
                            WHEN 'basic-queries' THEN 1
                            WHEN 'joins' THEN 2
                            WHEN 'aggregation' THEN 3
                            WHEN 'subqueries' THEN 4
                            WHEN 'window-functions' THEN 5
                            WHEN 'advanced-topics' THEN 6
                            ELSE 7
                        END
                `, [coreCategories]);
                
                console.log(`📚 Found ${categoriesResult.rows.length} core learning paths`);
                
                learningPaths = categoriesResult.rows.map((category, index) => {
                    const difficultyMap = {
                        'Basic Queries': 'Beginner',
                        'Joins': 'Beginner',
                        'Aggregation': 'Intermediate',
                        'Subqueries': 'Intermediate',
                        'Window Functions': 'Advanced',
                        'Advanced Topics': 'Advanced'
                    };
                    
                    const estimatedHoursMap = {
                        'Beginner': 4,
                        'Intermediate': 6,
                        'Advanced': 8
                    };
                    
                    const difficulty = difficultyMap[category.name] || 'Intermediate';
                    
                    return {
                        id: category.id,
                        name: category.name,
                        title: category.name,
                        description: category.description || `Master ${category.name} concepts through practical problems`,
                        slug: category.slug,
                        level: difficulty,
                        difficulty_level: difficulty,
                        duration: `${estimatedHoursMap[difficulty]} hours`,
                        estimated_hours: estimatedHoursMap[difficulty],
                        estimatedHours: estimatedHoursMap[difficulty],
                        skills: [category.name, 'SQL', 'Database Querying'],
                        skills_learned: [category.name, 'SQL', 'Database Querying'],
                        prerequisites: difficulty === 'Beginner' ? [] : ['Basic SQL Knowledge'],
                        problemCount: parseInt(category.problem_count) || 0,
                        total_steps: parseInt(category.problem_count) || 0,
                        avgTimePerProblem: 30,
                        order: index
                    };
                });
            } catch (fallbackError) {
                console.log('⚠️ Categories table also not found, using hardcoded fallback');
                
                // Ultimate fallback: 6 core SQL learning paths (matching local setup)
                learningPaths = [
                    {
                        id: 1,
                        name: 'Basic Queries',
                        title: 'Basic Queries',
                        description: 'Master fundamental SQL operations and data retrieval',
                        slug: 'basic-queries',
                        level: 'Beginner',
                        difficulty_level: 'Beginner',
                        duration: '3 hours',
                        estimated_hours: 3,
                        estimatedHours: 3,
                        skills: ['SELECT statements', 'WHERE clauses', 'Basic functions'],
                        skills_learned: ['SELECT statements', 'WHERE clauses', 'Basic functions'],
                        prerequisites: [],
                        problemCount: 12,
                        total_steps: 12,
                        avgTimePerProblem: 30,
                        order: 0
                    },
                    {
                        id: 2,
                        name: 'Joins',
                        title: 'Joins',
                        description: 'Learn to combine data from multiple tables effectively',
                        slug: 'joins',
                        level: 'Beginner',
                        difficulty_level: 'Beginner',
                        duration: '4 hours',
                        estimated_hours: 4,
                        estimatedHours: 4,
                        skills: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
                        skills_learned: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
                        prerequisites: ['Basic SQL Knowledge'],
                        problemCount: 15,
                        total_steps: 15,
                        avgTimePerProblem: 30,
                        order: 1
                    },
                    {
                        id: 3,
                        name: 'Aggregation',
                        title: 'Aggregation',
                        description: 'Master data summarization with GROUP BY and aggregate functions',
                        slug: 'aggregation',
                        level: 'Intermediate',
                        difficulty_level: 'Intermediate',
                        duration: '5 hours',
                        estimated_hours: 5,
                        estimatedHours: 5,
                        skills: ['GROUP BY', 'HAVING', 'COUNT', 'SUM', 'AVG'],
                        skills_learned: ['GROUP BY', 'HAVING', 'COUNT', 'SUM', 'AVG'],
                        prerequisites: ['Basic SQL Knowledge'],
                        problemCount: 18,
                        total_steps: 18,
                        avgTimePerProblem: 30,
                        order: 2
                    },
                    {
                        id: 4,
                        name: 'Subqueries',
                        title: 'Subqueries',
                        description: 'Build complex nested queries for advanced data analysis',
                        slug: 'subqueries',
                        level: 'Intermediate',
                        difficulty_level: 'Intermediate',
                        duration: '6 hours',
                        estimated_hours: 6,
                        estimatedHours: 6,
                        skills: ['Nested queries', 'EXISTS', 'IN clauses', 'Correlated subqueries'],
                        skills_learned: ['Nested queries', 'EXISTS', 'IN clauses', 'Correlated subqueries'],
                        prerequisites: ['Joins', 'Aggregation'],
                        problemCount: 12,
                        total_steps: 12,
                        avgTimePerProblem: 30,
                        order: 3
                    },
                    {
                        id: 5,
                        name: 'Window Functions',
                        title: 'Window Functions',
                        description: 'Advanced analytics with OVER, PARTITION BY, and ranking functions',
                        slug: 'window-functions',
                        level: 'Advanced',
                        difficulty_level: 'Advanced',
                        duration: '7 hours',
                        estimated_hours: 7,
                        estimatedHours: 7,
                        skills: ['OVER clause', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'LAG/LEAD'],
                        skills_learned: ['OVER clause', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'LAG/LEAD'],
                        prerequisites: ['Aggregation', 'Subqueries'],
                        problemCount: 8,
                        total_steps: 8,
                        avgTimePerProblem: 30,
                        order: 4
                    },
                    {
                        id: 6,
                        name: 'Advanced Topics',
                        title: 'Advanced Topics',
                        description: 'Master CTEs, recursive queries, and advanced SQL techniques',
                        slug: 'advanced-topics',
                        level: 'Advanced',
                        difficulty_level: 'Advanced',
                        duration: '8 hours',
                        estimated_hours: 8,
                        estimatedHours: 8,
                        skills: ['Common Table Expressions', 'Recursive queries', 'Advanced optimization'],
                        skills_learned: ['Common Table Expressions', 'Recursive queries', 'Advanced optimization'],
                        prerequisites: ['Window Functions', 'Subqueries'],
                        problemCount: 5,
                        total_steps: 5,
                        avgTimePerProblem: 30,
                        order: 5
                    }
                ];
            }
        }
        
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
        console.log('📚 Getting learning path details for ID:', pathId);
        
        // Try to get learning path details - with fallback to category-based approach
        let pathDetails;
        let problems = [];
        
        try {
            // First try proper learning paths table
            const pathResult = await pool.query(`
                SELECT * FROM learning_paths 
                WHERE id = $1 AND is_active = true
            `, [pathId]);
            
            if (pathResult.rows.length > 0) {
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
                
                problems = problemsResult.rows.map(problem => ({
                    id: problem.id,
                    numeric_id: problem.numeric_id,
                    problem_numeric_id: problem.numeric_id, // Frontend expects this
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
                
                pathDetails = {
                    id: path.id,
                    name: path.name,
                    title: path.name,
                    description: path.description,
                    difficulty_level: path.difficulty_level,
                    estimated_hours: path.estimated_hours,
                    prerequisites: path.prerequisites || [],
                    skills_learned: path.skills_learned || []
                };
            } else {
                throw new Error('Learning path not found in learning_paths table');
            }
        } catch (dbError) {
            console.log('⚠️ Learning paths table not found, using category-based fallback for ID:', pathId);
            
            // Fallback: Map pathId to category and get problems from that category
            const categoryMappings = {
                '1': 'basic-queries',           // SQL Fundamentals -> Basic Queries (14 problems)
                '2': 'aggregation',             // Data Analysis -> Aggregation (10 problems)
                '3': 'window-functions',        // Advanced Analytics -> Window Functions (9 problems)
                '4': 'joins',                   // Joins & Relationships -> Joins (6 problems)
                '5': 'subqueries',              // Subqueries & CTEs -> Subqueries (3 problems)
                '6': 'advanced-topics',         // Advanced Topics (19 problems)
                '7': 'time-analysis',           // Time Series Analysis (4 problems)
                '8': 'fraud-detection',         // Fraud Detection (1 problem)
                '9': 'supply-chain',            // Supply Chain Analytics (1 problem)
                '10': 'recommendation-systems', // Recommendation Systems (1 problem)
                '11': 'energy-analytics',       // Energy Analytics (1 problem)
                '12': 'a/b-testing'             // A/B Testing (1 problem)
            };
            
            const categorySlug = categoryMappings[pathId];
            if (categorySlug) {
                try {
                    // Get category details
                    const categoryResult = await pool.query(`
                        SELECT * FROM categories WHERE slug = $1
                    `, [categorySlug]);
                    
                    if (categoryResult.rows.length > 0) {
                        const category = categoryResult.rows[0];
                        
                        // Get problems for this category
                        const problemsResult = await pool.query(`
                            SELECT p.*, c.name as category_name
                            FROM problems p
                            LEFT JOIN categories c ON p.category_id = c.id
                            WHERE p.category_id = $1 AND p.is_active = true
                            ORDER BY p.numeric_id
                        `, [category.id]);
                        
                        problems = problemsResult.rows.map((problem, index) => ({
                            id: problem.id,
                            numeric_id: problem.numeric_id,
                            problem_numeric_id: problem.numeric_id, // Frontend expects this
                            title: problem.title,
                            slug: problem.slug,
                            difficulty: problem.difficulty,
                            description: problem.description,
                            category: problem.category_name,
                            stepOrder: index + 1,
                            stepDescription: `Problem ${index + 1} in ${category.name}`,
                            learningObjectives: [`Master ${category.name} concepts`],
                            estimatedTimeMinutes: 30,
                            isOptional: false,
                            acceptance_rate: problem.acceptance_rate
                        }));
                        
                        const difficultyMap = {
                            'basic-queries': 'Beginner',
                            'joins': 'Beginner', 
                            'aggregation': 'Intermediate',
                            'subqueries': 'Intermediate',
                            'window-functions': 'Advanced',
                            'advanced-topics': 'Advanced',
                            'time-analysis': 'Intermediate',
                            'fraud-detection': 'Advanced',
                            'supply-chain': 'Intermediate',
                            'recommendation-systems': 'Advanced',
                            'energy-analytics': 'Intermediate',
                            'a/b-testing': 'Intermediate'
                        };
                        
                        pathDetails = {
                            id: parseInt(pathId),
                            name: category.name,
                            title: category.name,
                            description: category.description || `Master ${category.name} through hands-on problems`,
                            difficulty_level: difficultyMap[categorySlug] || 'Intermediate',
                            estimated_hours: Math.max(2, Math.ceil(problems.length * 0.5)),
                            prerequisites: difficultyMap[categorySlug] === 'Beginner' ? [] : ['Basic SQL Knowledge'],
                            skills_learned: [category.name, 'SQL', 'Database Querying']
                        };
                    }
                } catch (categoryError) {
                    console.log('⚠️ Category lookup failed, using hardcoded fallback');
                    throw new Error('Category not found');
                }
            } else {
                throw new Error('Invalid path ID');
            }
        }
        
        if (!pathDetails) {
            return res.status(404).json({ error: 'Learning path not found' });
        }
        
        console.log('✅ Found learning path with', problems.length, 'problems');
        
        res.json({
            ...pathDetails,
            steps: problems, // Frontend expects 'steps'
            problems: problems, // Also provide 'problems' for compatibility
            totalProblems: problems.length,
            completedProblems: 0 // TODO: Get from user progress
        });
    } catch (error) {
        console.error('Error fetching learning path:', error);
        res.status(500).json({ error: 'Failed to fetch learning path' });
    }
});

module.exports = router;