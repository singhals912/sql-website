const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Helper function to get problem UUID by numeric ID or slug
async function getProblemId(problemIdentifier) {
  try {
    // Check if it's a UUID (8-4-4-4-12 format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(problemIdentifier)) {
      return problemIdentifier; // Already a UUID
    } else if (isNaN(problemIdentifier)) {
      // It's a slug
      const result = await pool.query('SELECT id FROM problems WHERE slug = $1 AND is_active = true', [problemIdentifier]);
      return result.rows[0]?.id;
    } else {
      // It's a numeric ID
      const result = await pool.query('SELECT id FROM problems WHERE numeric_id = $1 AND is_active = true', [parseInt(problemIdentifier)]);
      return result.rows[0]?.id;
    }
  } catch (error) {
    console.error('Error getting problem ID:', error);
    return null;
  }
}

// Get all bookmarks for user
router.get('/', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        const { type } = req.query; // Optional filter by bookmark type
        
        if (!sessionId) {
            return res.json({
                success: true,
                bookmarks: []
            });
        }
        
        let query = `
            SELECT ub.*, p.title, p.numeric_id, p.slug, p.difficulty, c.name as category_name
            FROM user_bookmarks ub
            JOIN problems p ON ub.problem_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE ub.session_id = $1
        `;
        const params = [sessionId];
        
        if (type) {
            query += ' AND ub.bookmark_type = $2';
            params.push(type);
        }
        
        query += ' ORDER BY ub.created_at DESC';
        
        const result = await pool.query(query, params);
        
        const bookmarks = result.rows.map(row => ({
            id: row.id,
            problem_id: row.problem_id,
            numeric_id: row.numeric_id,
            title: row.title,
            slug: row.slug,
            difficulty: row.difficulty,
            category: row.category_name,
            bookmark_type: row.bookmark_type,
            notes: row.notes,
            tags: row.tags || [],
            created_at: row.created_at
        }));
        
        res.json({ 
          success: true,
          bookmarks: bookmarks 
        });
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Get bookmark statistics
router.get('/stats', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        
        if (!sessionId) {
            return res.json({
                success: true,
                stats: {
                    total: 0,
                    byType: {},
                    byDifficulty: {},
                    byCategory: {}
                }
            });
        }
        
        // Get total bookmarks
        const totalResult = await pool.query(
            'SELECT COUNT(*) as total FROM user_bookmarks WHERE session_id = $1',
            [sessionId]
        );
        
        // Get bookmarks by type
        const typeResult = await pool.query(`
            SELECT bookmark_type, COUNT(*) as count
            FROM user_bookmarks
            WHERE session_id = $1
            GROUP BY bookmark_type
        `, [sessionId]);
        
        // Get bookmarks by difficulty
        const difficultyResult = await pool.query(`
            SELECT p.difficulty, COUNT(*) as count
            FROM user_bookmarks ub
            JOIN problems p ON ub.problem_id = p.id
            WHERE ub.session_id = $1
            GROUP BY p.difficulty
        `, [sessionId]);
        
        // Get bookmarks by category
        const categoryResult = await pool.query(`
            SELECT c.name, COUNT(*) as count
            FROM user_bookmarks ub
            JOIN problems p ON ub.problem_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE ub.session_id = $1
            GROUP BY c.name
        `, [sessionId]);
        
        const byType = {};
        typeResult.rows.forEach(row => {
            byType[row.bookmark_type] = parseInt(row.count);
        });
        
        const byDifficulty = {};
        difficultyResult.rows.forEach(row => {
            byDifficulty[row.difficulty] = parseInt(row.count);
        });
        
        const byCategory = {};
        categoryResult.rows.forEach(row => {
            byCategory[row.name] = parseInt(row.count);
        });
        
        res.json({
            success: true,
            stats: {
                total: parseInt(totalResult.rows[0].total),
                byType,
                byDifficulty,
                byCategory
            }
        });
    } catch (error) {
        console.error('Error fetching bookmark stats:', error);
        res.status(500).json({ error: 'Failed to fetch bookmark stats' });
    }
});

// Get bookmark collections (grouped by type)
router.get('/collection', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        
        if (!sessionId) {
            return res.json({
                success: true,
                collection: []
            });
        }
        
        const result = await pool.query(`
            SELECT 
                bookmark_type,
                COUNT(*) as count,
                MIN(created_at) as first_bookmarked,
                MAX(created_at) as last_bookmarked
            FROM user_bookmarks 
            WHERE session_id = $1
            GROUP BY bookmark_type
            ORDER BY bookmark_type
        `, [sessionId]);
        
        const collections = result.rows.map(row => ({
            type: row.bookmark_type,
            count: parseInt(row.count),
            firstBookmarked: row.first_bookmarked,
            lastBookmarked: row.last_bookmarked
        }));
        
        res.json({
            success: true,
            collection: collections
        });
    } catch (error) {
        console.error('Error fetching bookmark collections:', error);
        res.status(500).json({ error: 'Failed to fetch bookmark collections' });
    }
});

// Check if problem is bookmarked
router.get('/check/:problemId', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        const { problemId } = req.params;
        
        if (!sessionId) {
            return res.json({ bookmarked: false });
        }
        
        // Get the actual problem UUID
        const problemUuid = await getProblemId(problemId);
        if (!problemUuid) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const result = await pool.query(
            'SELECT bookmark_type FROM user_bookmarks WHERE session_id = $1 AND problem_id = $2',
            [sessionId, problemUuid]
        );
        
        res.json({ 
            bookmarked: result.rows.length > 0,
            bookmarkType: result.rows[0]?.bookmark_type || null
        });
    } catch (error) {
        console.error('Error checking bookmark:', error);
        res.status(500).json({ error: 'Failed to check bookmark' });
    }
});

// Add bookmark
router.post('/:problemId', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        const { problemId } = req.params;
        const { bookmarkType = 'favorite', notes = '', tags = [] } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }
        
        // Get the actual problem UUID
        const problemUuid = await getProblemId(problemId);
        if (!problemUuid) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        // Insert or update bookmark
        await pool.query(`
            INSERT INTO user_bookmarks (session_id, problem_id, bookmark_type, notes, tags)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (session_id, problem_id) 
            DO UPDATE SET bookmark_type = $3, notes = $4, tags = $5, created_at = CURRENT_TIMESTAMP
        `, [sessionId, problemUuid, bookmarkType, notes, tags]);
        
        res.json({ success: true, bookmarked: true, bookmarkType });
    } catch (error) {
        console.error('Error adding bookmark:', error);
        res.status(500).json({ error: 'Failed to add bookmark' });
    }
});

// Remove bookmark
router.delete('/:problemId', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        const { problemId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }
        
        // Get the actual problem UUID
        const problemUuid = await getProblemId(problemId);
        if (!problemUuid) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        await pool.query(
            'DELETE FROM user_bookmarks WHERE session_id = $1 AND problem_id = $2',
            [sessionId, problemUuid]
        );
        
        res.json({ success: true, bookmarked: false });
    } catch (error) {
        console.error('Error removing bookmark:', error);
        res.status(500).json({ error: 'Failed to remove bookmark' });
    }
});

module.exports = router;