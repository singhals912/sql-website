const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all problems with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const offset = (page - 1) * limit;
        const difficulty = req.query.difficulty;
        const category = req.query.category;

        let query = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
        `;
        const queryParams = [];
        let paramIndex = 1;

        if (difficulty) {
            query += ` AND p.difficulty = $${paramIndex}`;
            queryParams.push(difficulty);
            paramIndex++;
        }

        if (category) {
            query += ` AND c.slug = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        const result = await pool.query(query, queryParams);
        
        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM problems p';
        if (difficulty || category) {
            countQuery += ' LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = true';
            const countParams = [];
            let countParamIndex = 1;
            
            if (difficulty) {
                countQuery += ` AND p.difficulty = $${countParamIndex}`;
                countParams.push(difficulty);
                countParamIndex++;
            }
            
            if (category) {
                countQuery += ` AND c.slug = $${countParamIndex}`;
                countParams.push(category);
            }
            
            const countResult = await pool.query(countQuery, countParams);
            const total = parseInt(countResult.rows[0].count);
            
            res.json({
                problems: result.rows,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        } else {
            const countResult = await pool.query('SELECT COUNT(*) FROM problems WHERE is_active = true');
            const total = parseInt(countResult.rows[0].count);
            
            res.json({
                problems: result.rows,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            });
        }
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
});

// Get single problem by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const problemQuery = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM problems p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.slug = $1 AND p.is_active = true
        `;
        
        const problemResult = await pool.query(problemQuery, [slug]);
        
        if (problemResult.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const problem = problemResult.rows[0];
        
        // Get problem schemas
        const schemaQuery = `
            SELECT * FROM problem_schemas 
            WHERE problem_id = $1
            ORDER BY sql_dialect
        `;
        
        const schemaResult = await pool.query(schemaQuery, [problem.id]);
        
        res.json({
            ...problem,
            schemas: schemaResult.rows
        });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
});

// Get categories
router.get('/categories/list', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, COUNT(p.id) as problem_count
            FROM categories c
            LEFT JOIN problems p ON c.id = p.category_id AND p.is_active = true
            WHERE c.is_active = true
            GROUP BY c.id, c.name, c.description, c.slug, c.icon, c.sort_order
            ORDER BY c.sort_order
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

module.exports = router;