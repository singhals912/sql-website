const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class HintService {
  // Get hints for a problem
  static async getHintsForProblem(problemId) {
    try {
      // Convert numeric ID to UUID if needed
      let actualProblemId = problemId;
      if (/^\d+$/.test(problemId)) {
        const result = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [parseInt(problemId)]);
        if (result.rows.length === 0) {
          throw new Error('Problem not found');
        }
        actualProblemId = result.rows[0].id;
      }

      const result = await pool.query(`
        SELECT 
          id,
          hint_order,
          hint_type,
          hint_content,
          reveal_after_attempts,
          sql_concept
        FROM problem_hints
        WHERE problem_id = $1
        ORDER BY hint_order ASC
      `, [actualProblemId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting hints for problem:', error);
      throw error;
    }
  }

  // Get available hints based on attempt count
  static async getAvailableHints(problemId, attemptCount = 0) {
    try {
      // Convert numeric ID to UUID if needed
      let actualProblemId = problemId;
      if (/^\d+$/.test(problemId)) {
        const result = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [parseInt(problemId)]);
        if (result.rows.length === 0) {
          throw new Error('Problem not found');
        }
        actualProblemId = result.rows[0].id;
      }

      const result = await pool.query(`
        SELECT 
          id,
          hint_order,
          hint_type,
          reveal_after_attempts,
          sql_concept,
          CASE 
            WHEN reveal_after_attempts <= $2 THEN hint_content
            ELSE NULL
          END as hint_content,
          CASE 
            WHEN reveal_after_attempts <= $2 THEN true
            ELSE false
          END as is_available
        FROM problem_hints
        WHERE problem_id = $1
        ORDER BY hint_order ASC
      `, [actualProblemId, attemptCount]);

      return result.rows;
    } catch (error) {
      console.error('Error getting available hints:', error);
      throw error;
    }
  }

  // Reveal a hint (track usage)
  static async revealHint(userId, sessionId, problemId, hintId, attemptNumber = 0) {
    try {
      await pool.query('BEGIN');

      // Get hint details
      const hintResult = await pool.query(`
        SELECT * FROM problem_hints WHERE id = $1
      `, [hintId]);

      if (hintResult.rows.length === 0) {
        throw new Error('Hint not found');
      }

      const hint = hintResult.rows[0];

      // Record hint usage
      await pool.query(`
        INSERT INTO user_hint_usage (user_id, session_id, problem_id, hint_id, attempt_number)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (${userId ? 'user_id' : 'session_id'}, problem_id, hint_id) DO NOTHING
      `, [userId, sessionId, hint.problem_id, hintId, attemptNumber]);

      await pool.query('COMMIT');

      return {
        hint,
        revealed: true,
        message: 'Hint revealed successfully'
      };

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error revealing hint:', error);
      throw error;
    }
  }

  // Get hint usage for user on a problem
  static async getHintUsage(userId, sessionId, problemId) {
    try {
      // Convert numeric ID to UUID if needed
      let actualProblemId = problemId;
      if (/^\d+$/.test(problemId)) {
        const result = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [parseInt(problemId)]);
        if (result.rows.length === 0) {
          return [];
        }
        actualProblemId = result.rows[0].id;
      }

      const whereClause = userId ? 'uhu.user_id = $1' : 'uhu.session_id = $1';
      
      const result = await pool.query(`
        SELECT 
          uhu.*,
          ph.hint_order,
          ph.hint_type,
          ph.hint_content,
          ph.sql_concept
        FROM user_hint_usage uhu
        JOIN problem_hints ph ON uhu.hint_id = ph.id
        WHERE ${whereClause} AND uhu.problem_id = $2
        ORDER BY ph.hint_order ASC
      `, [userId || sessionId, actualProblemId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting hint usage:', error);
      return [];
    }
  }

  // Get hint statistics for a user
  static async getHintStatistics(userId, sessionId) {
    try {
      const whereClause = userId ? 'user_id = $1' : 'session_id = $1';
      
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_hints_used,
          COUNT(DISTINCT problem_id) as problems_with_hints,
          COUNT(DISTINCT CASE WHEN ph.hint_type = 'concept' THEN uhu.hint_id END) as concept_hints_used,
          COUNT(DISTINCT CASE WHEN ph.hint_type = 'text' THEN uhu.hint_id END) as text_hints_used,
          COUNT(DISTINCT CASE WHEN ph.hint_type = 'code' THEN uhu.hint_id END) as code_hints_used
        FROM user_hint_usage uhu
        JOIN problem_hints ph ON uhu.hint_id = ph.id
        WHERE ${whereClause}
      `, [userId || sessionId]);

      return result.rows[0] || {
        total_hints_used: 0,
        problems_with_hints: 0,
        concept_hints_used: 0,
        text_hints_used: 0,
        code_hints_used: 0
      };
    } catch (error) {
      console.error('Error getting hint statistics:', error);
      return {};
    }
  }

  // Get hint effectiveness (how often hints lead to successful solutions)
  static async getHintEffectiveness(problemId) {
    try {
      // Convert numeric ID to UUID if needed
      let actualProblemId = problemId;
      if (/^\d+$/.test(problemId)) {
        const result = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [parseInt(problemId)]);
        if (result.rows.length === 0) {
          return {};
        }
        actualProblemId = result.rows[0].id;
      }

      const result = await pool.query(`
        SELECT 
          ph.hint_order,
          ph.hint_type,
          ph.sql_concept,
          COUNT(uhu.id) as times_used,
          COUNT(CASE WHEN upp.is_solved THEN 1 END) as led_to_solution
        FROM problem_hints ph
        LEFT JOIN user_hint_usage uhu ON ph.id = uhu.hint_id
        LEFT JOIN user_problem_progress upp ON uhu.problem_id = upp.problem_id 
          AND (uhu.user_id = upp.user_id OR uhu.session_id = upp.session_id)
        WHERE ph.problem_id = $1
        GROUP BY ph.id, ph.hint_order, ph.hint_type, ph.sql_concept
        ORDER BY ph.hint_order ASC
      `, [actualProblemId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting hint effectiveness:', error);
      return [];
    }
  }
}

module.exports = HintService;