const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class BookmarkService {
  // Add or update bookmark
  static async addBookmark(userId, sessionId, problemId, bookmarkType = 'favorite', notes = '', tags = []) {
    try {
      const result = await pool.query(`
        INSERT INTO user_bookmarks (user_id, session_id, problem_id, bookmark_type, notes, tags)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, problem_id) 
        DO UPDATE SET bookmark_type = $4, notes = $5, tags = $6, created_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, sessionId, problemId, bookmarkType, notes, tags]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  // Remove bookmark
  static async removeBookmark(userId, sessionId, problemId) {
    try {
      const whereClause = userId 
        ? 'user_id = $1 AND problem_id = $2'
        : 'session_id = $1 AND problem_id = $2';
      
      const result = await pool.query(`
        DELETE FROM user_bookmarks 
        WHERE ${whereClause}
        RETURNING *
      `, [userId || sessionId, problemId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }

  // Get user bookmarks with problem details
  static async getUserBookmarks(userId, sessionId, bookmarkType = null) {
    try {
      let query = `
        SELECT 
          ub.*,
          p.numeric_id,
          p.title,
          p.description,
          p.difficulty,
          c.name as category_name,
          ps.setup_sql,
          ps.solution_sql,
          ps.explanation
        FROM user_bookmarks ub
        JOIN problems p ON ub.problem_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN problem_schemas ps ON p.id = ps.problem_id
        WHERE ${userId ? 'ub.user_id = $1' : 'ub.session_id = $1'}
      `;
      
      const params = [userId || sessionId];
      
      if (bookmarkType) {
        query += ' AND ub.bookmark_type = $2';
        params.push(bookmarkType);
      }
      
      query += ' ORDER BY ub.created_at DESC';
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting user bookmarks:', error);
      throw error;
    }
  }

  // Check if problem is bookmarked
  static async isBookmarked(userId, sessionId, problemId) {
    try {
      const whereClause = userId 
        ? 'user_id = $1 AND problem_id = $2'
        : 'session_id = $1 AND problem_id = $2';
      
      const result = await pool.query(`
        SELECT bookmark_type FROM user_bookmarks 
        WHERE ${whereClause}
      `, [userId || sessionId, problemId]);
      
      return result.rows.length > 0 ? result.rows[0].bookmark_type : null;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      throw error;
    }
  }

  // Batch check if problems are bookmarked
  static async checkBatchBookmarks(userId, sessionId, problemIds) {
    try {
      const identifier = userId || sessionId;
      const whereClause = userId 
        ? 'user_id = $1 AND problem_id = ANY($2)'
        : 'session_id = $1 AND problem_id = ANY($2)';
      
      const result = await pool.query(`
        SELECT problem_id, bookmark_type FROM user_bookmarks 
        WHERE ${whereClause}
      `, [identifier, problemIds]);
      
      // Create a map of problem_id -> bookmark status
      const bookmarkMap = {};
      result.rows.forEach(row => {
        bookmarkMap[row.problem_id] = {
          isBookmarked: true,
          bookmarkType: row.bookmark_type
        };
      });
      
      // Fill in missing problems as not bookmarked
      problemIds.forEach(problemId => {
        if (!bookmarkMap[problemId]) {
          bookmarkMap[problemId] = {
            isBookmarked: false,
            bookmarkType: null
          };
        }
      });
      
      return bookmarkMap;
    } catch (error) {
      console.error('Error checking batch bookmark status:', error);
      throw error;
    }
  }

  // Get bookmark statistics
  static async getBookmarkStats(userId, sessionId) {
    try {
      const whereClause = userId ? 'user_id = $1' : 'session_id = $1';
      
      const result = await pool.query(`
        SELECT 
          bookmark_type,
          COUNT(*) as count
        FROM user_bookmarks 
        WHERE ${whereClause}
        GROUP BY bookmark_type
      `, [userId || sessionId]);
      
      const stats = {
        favorite: 0,
        review_later: 0,
        challenging: 0,
        total: 0
      };
      
      result.rows.forEach(row => {
        stats[row.bookmark_type] = parseInt(row.count);
        stats.total += parseInt(row.count);
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting bookmark stats:', error);
      throw error;
    }
  }

  // Get popular bookmarked problems
  static async getPopularBookmarks(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT 
          p.numeric_id,
          p.title,
          p.difficulty,
          c.name as category_name,
          COUNT(ub.id) as bookmark_count,
          COUNT(CASE WHEN ub.bookmark_type = 'favorite' THEN 1 END) as favorite_count,
          COUNT(CASE WHEN ub.bookmark_type = 'challenging' THEN 1 END) as challenging_count
        FROM problems p
        JOIN user_bookmarks ub ON p.id = ub.problem_id
        LEFT JOIN categories c ON p.category_id = c.id
        GROUP BY p.id, p.numeric_id, p.title, p.difficulty, c.name
        ORDER BY bookmark_count DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting popular bookmarks:', error);
      throw error;
    }
  }

  // Get bookmarks by tags
  static async getBookmarksByTags(userId, sessionId, tags) {
    try {
      const whereClause = userId ? 'user_id = $1' : 'session_id = $1';
      
      const result = await pool.query(`
        SELECT 
          ub.*,
          p.numeric_id,
          p.title,
          p.difficulty,
          c.name as category_name
        FROM user_bookmarks ub
        JOIN problems p ON ub.problem_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE ${whereClause} AND ub.tags && $2
        ORDER BY ub.created_at DESC
      `, [userId || sessionId, tags]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting bookmarks by tags:', error);
      throw error;
    }
  }

  // Update bookmark notes and tags
  static async updateBookmark(userId, sessionId, problemId, notes, tags) {
    try {
      const whereClause = userId 
        ? 'user_id = $1 AND problem_id = $2'
        : 'session_id = $1 AND problem_id = $2';
      
      const result = await pool.query(`
        UPDATE user_bookmarks 
        SET notes = $3, tags = $4
        WHERE ${whereClause}
        RETURNING *
      `, [userId || sessionId, problemId, notes, tags]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating bookmark:', error);
      throw error;
    }
  }

  // Get bookmark collection summary
  static async getBookmarkCollection(userId, sessionId) {
    try {
      const whereClause = userId ? 'user_id = $1' : 'session_id = $1';
      
      const result = await pool.query(`
        SELECT 
          ub.bookmark_type,
          p.difficulty,
          COUNT(*) as count
        FROM user_bookmarks ub
        JOIN problems p ON ub.problem_id = p.id
        WHERE ${whereClause}
        GROUP BY ub.bookmark_type, p.difficulty
        ORDER BY ub.bookmark_type, p.difficulty
      `, [userId || sessionId]);
      
      // Structure the data for easy consumption
      const collection = {
        favorite: { easy: 0, medium: 0, hard: 0, total: 0 },
        review_later: { easy: 0, medium: 0, hard: 0, total: 0 },
        challenging: { easy: 0, medium: 0, hard: 0, total: 0 }
      };
      
      result.rows.forEach(row => {
        const type = row.bookmark_type;
        const difficulty = row.difficulty?.toLowerCase() || 'unknown';
        const count = parseInt(row.count);
        
        if (collection[type] && difficulty !== 'unknown') {
          collection[type][difficulty] = count;
          collection[type].total += count;
        }
      });
      
      return collection;
    } catch (error) {
      console.error('Error getting bookmark collection:', error);
      throw error;
    }
  }
}

module.exports = BookmarkService;