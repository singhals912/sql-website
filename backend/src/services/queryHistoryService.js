const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class QueryHistoryService {
  // Initialize database schema for query history
  async initializeSchema() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS query_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          session_id VARCHAR(255),
          problem_id UUID,
          problem_numeric_id INTEGER,
          query_text TEXT NOT NULL,
          dialect VARCHAR(50) DEFAULT 'postgresql',
          execution_time INTEGER, -- in milliseconds
          was_successful BOOLEAN DEFAULT false,
          row_count INTEGER DEFAULT 0,
          error_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS saved_queries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          session_id VARCHAR(255),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          query_text TEXT NOT NULL,
          dialect VARCHAR(50) DEFAULT 'postgresql',
          problem_id UUID,
          problem_numeric_id INTEGER,
          is_public BOOLEAN DEFAULT false,
          tags TEXT[], -- Array of tags
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_query_history_user ON query_history(user_id);
        CREATE INDEX IF NOT EXISTS idx_query_history_session ON query_history(session_id);
        CREATE INDEX IF NOT EXISTS idx_query_history_problem ON query_history(problem_id);
        CREATE INDEX IF NOT EXISTS idx_query_history_created ON query_history(created_at);
        
        CREATE INDEX IF NOT EXISTS idx_saved_queries_user ON saved_queries(user_id);
        CREATE INDEX IF NOT EXISTS idx_saved_queries_session ON saved_queries(session_id);
        CREATE INDEX IF NOT EXISTS idx_saved_queries_problem ON saved_queries(problem_id);
        CREATE INDEX IF NOT EXISTS idx_saved_queries_public ON saved_queries(is_public);
      `);
      console.log('✅ Query history schema initialized');
    } catch (error) {
      console.error('Error initializing query history schema:', error);
    }
  }

  // Save query execution to history
  async saveToHistory({
    userId,
    sessionId,
    problemId,
    problemNumericId,
    queryText,
    dialect = 'postgresql',
    executionTime,
    wasSuccessful,
    rowCount = 0,
    errorMessage = null
  }) {
    try {
      const result = await pool.query(`
        INSERT INTO query_history 
        (user_id, session_id, problem_id, problem_numeric_id, query_text, dialect, 
         execution_time, was_successful, row_count, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at
      `, [
        userId, sessionId, problemId, problemNumericId, queryText, dialect,
        executionTime, wasSuccessful, rowCount, errorMessage
      ]);

      // Clean up old history entries (keep only last 1000 per user/session)
      await this.cleanupOldHistory(userId, sessionId);

      return result.rows[0];
    } catch (error) {
      console.error('Error saving query to history:', error);
      throw error;
    }
  }

  // Get query history for user/session
  async getHistory(userId, sessionId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        problemId = null,
        successfulOnly = false,
        startDate = null,
        endDate = null
      } = options;

      let whereClause = 'WHERE ';
      const params = [];
      const conditions = [];

      if (userId) {
        conditions.push(`user_id = $${params.length + 1}`);
        params.push(userId);
      } else if (sessionId) {
        conditions.push(`session_id = $${params.length + 1}`);
        params.push(sessionId);
      } else {
        throw new Error('Either userId or sessionId is required');
      }

      if (problemId) {
        conditions.push(`problem_id = $${params.length + 1}`);
        params.push(problemId);
      }

      if (successfulOnly) {
        conditions.push('was_successful = true');
      }

      if (startDate) {
        conditions.push(`created_at >= $${params.length + 1}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`created_at <= $${params.length + 1}`);
        params.push(endDate);
      }

      whereClause += conditions.join(' AND ');

      const query = `
        SELECT 
          h.*,
          p.title as problem_title,
          p.difficulty as problem_difficulty
        FROM query_history h
        LEFT JOIN problems p ON h.problem_id = p.id
        ${whereClause}
        ORDER BY h.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM query_history h
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      return {
        history: result.rows,
        total,
        hasMore: offset + limit < total
      };

    } catch (error) {
      console.error('Error getting query history:', error);
      throw error;
    }
  }

  // Save a query for later use
  async saveQuery({
    userId,
    sessionId,
    name,
    description = '',
    queryText,
    dialect = 'postgresql',
    problemId = null,
    problemNumericId = null,
    isPublic = false,
    tags = []
  }) {
    try {
      const result = await pool.query(`
        INSERT INTO saved_queries 
        (user_id, session_id, name, description, query_text, dialect, 
         problem_id, problem_numeric_id, is_public, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at
      `, [
        userId, sessionId, name, description, queryText, dialect,
        problemId, problemNumericId, isPublic, tags
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error saving query:', error);
      throw error;
    }
  }

  // Get saved queries
  async getSavedQueries(userId, sessionId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        problemId = null,
        tags = [],
        search = '',
        includePublic = false
      } = options;

      let whereClause = 'WHERE ';
      const params = [];
      const conditions = [];

      if (userId) {
        if (includePublic) {
          conditions.push(`(user_id = $${params.length + 1} OR is_public = true)`);
        } else {
          conditions.push(`user_id = $${params.length + 1}`);
        }
        params.push(userId);
      } else if (sessionId) {
        if (includePublic) {
          conditions.push(`(session_id = $${params.length + 1} OR is_public = true)`);
        } else {
          conditions.push(`session_id = $${params.length + 1}`);
        }
        params.push(sessionId);
      } else {
        conditions.push('is_public = true');
      }

      if (problemId) {
        conditions.push(`problem_id = $${params.length + 1}`);
        params.push(problemId);
      }

      if (search) {
        conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1} OR query_text ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }

      if (tags.length > 0) {
        conditions.push(`tags && $${params.length + 1}`);
        params.push(tags);
      }

      whereClause += conditions.join(' AND ');

      const query = `
        SELECT 
          s.*,
          p.title as problem_title,
          p.difficulty as problem_difficulty
        FROM saved_queries s
        LEFT JOIN problems p ON s.problem_id = p.id
        ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM saved_queries s
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      return {
        savedQueries: result.rows,
        total,
        hasMore: offset + limit < total
      };

    } catch (error) {
      console.error('Error getting saved queries:', error);
      throw error;
    }
  }

  // Update saved query
  async updateSavedQuery(queryId, userId, sessionId, updates) {
    try {
      const allowedFields = ['name', 'description', 'query_text', 'dialect', 'is_public', 'tags'];
      const updateFields = [];
      const params = [];

      Object.keys(updates).forEach(field => {
        if (allowedFields.includes(field)) {
          updateFields.push(`${field} = $${params.length + 1}`);
          params.push(updates[field]);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      const whereClause = userId 
        ? `id = $${params.length + 1} AND user_id = $${params.length + 2}`
        : `id = $${params.length + 1} AND session_id = $${params.length + 2}`;
      
      params.push(queryId, userId || sessionId);

      const query = `
        UPDATE saved_queries 
        SET ${updateFields.join(', ')}
        ${whereClause}
        RETURNING *
      `;

      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        throw new Error('Saved query not found or permission denied');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating saved query:', error);
      throw error;
    }
  }

  // Delete saved query
  async deleteSavedQuery(queryId, userId, sessionId) {
    try {
      const whereClause = userId 
        ? 'id = $1 AND user_id = $2'
        : 'id = $1 AND session_id = $2';

      const result = await pool.query(`
        DELETE FROM saved_queries 
        WHERE ${whereClause}
        RETURNING id
      `, [queryId, userId || sessionId]);

      if (result.rows.length === 0) {
        throw new Error('Saved query not found or permission denied');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting saved query:', error);
      throw error;
    }
  }

  // Get query analytics/statistics
  async getQueryAnalytics(userId, sessionId, days = 30) {
    try {
      const whereClause = userId 
        ? 'user_id = $1'
        : 'session_id = $1';

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await pool.query(`
        SELECT 
          COUNT(*) as total_queries,
          COUNT(CASE WHEN was_successful THEN 1 END) as successful_queries,
          COUNT(CASE WHEN was_successful = false THEN 1 END) as failed_queries,
          AVG(execution_time) as avg_execution_time,
          MAX(execution_time) as max_execution_time,
          AVG(row_count) as avg_row_count,
          COUNT(DISTINCT problem_id) as problems_attempted,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          COUNT(CASE WHEN dialect = 'mysql' THEN 1 END) as mysql_queries,
          COUNT(CASE WHEN dialect = 'postgresql' THEN 1 END) as postgresql_queries
        FROM query_history 
        WHERE ${whereClause} AND created_at >= $2
      `, [userId || sessionId, startDate]);

      const dailyActivity = await pool.query(`
        SELECT 
          DATE(created_at) as query_date,
          COUNT(*) as query_count,
          COUNT(CASE WHEN was_successful THEN 1 END) as successful_count,
          AVG(execution_time) as avg_execution_time
        FROM query_history 
        WHERE ${whereClause} AND created_at >= $2
        GROUP BY DATE(created_at)
        ORDER BY query_date DESC
      `, [userId || sessionId, startDate]);

      const topProblems = await pool.query(`
        SELECT 
          problem_id,
          problem_numeric_id,
          p.title as problem_title,
          COUNT(*) as attempt_count,
          COUNT(CASE WHEN was_successful THEN 1 END) as success_count
        FROM query_history h
        LEFT JOIN problems p ON h.problem_id = p.id
        WHERE ${whereClause} AND h.created_at >= $2 AND problem_id IS NOT NULL
        GROUP BY problem_id, problem_numeric_id, p.title
        ORDER BY attempt_count DESC
        LIMIT 10
      `, [userId || sessionId, startDate]);

      return {
        overview: {
          ...analytics.rows[0],
          success_rate: analytics.rows[0].total_queries > 0 
            ? Math.round((analytics.rows[0].successful_queries / analytics.rows[0].total_queries) * 100)
            : 0
        },
        dailyActivity: dailyActivity.rows,
        topProblems: topProblems.rows
      };

    } catch (error) {
      console.error('Error getting query analytics:', error);
      throw error;
    }
  }

  // Clean up old history entries
  async cleanupOldHistory(userId, sessionId, keepCount = 1000) {
    try {
      const whereClause = userId 
        ? 'user_id = $1'
        : 'session_id = $1';

      await pool.query(`
        DELETE FROM query_history 
        WHERE ${whereClause}
        AND id NOT IN (
          SELECT id FROM query_history 
          WHERE ${whereClause}
          ORDER BY created_at DESC 
          LIMIT $2
        )
      `, [userId || sessionId, keepCount]);

    } catch (error) {
      console.error('Error cleaning up old history:', error);
    }
  }

  // Get popular public queries
  async getPopularQueries(limit = 20) {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          p.title as problem_title,
          p.difficulty as problem_difficulty,
          COUNT(h.id) as usage_count
        FROM saved_queries s
        LEFT JOIN problems p ON s.problem_id = p.id
        LEFT JOIN query_history h ON h.query_text = s.query_text
        WHERE s.is_public = true
        GROUP BY s.id, p.title, p.difficulty
        ORDER BY usage_count DESC, s.created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting popular queries:', error);
      throw error;
    }
  }
}

module.exports = new QueryHistoryService();