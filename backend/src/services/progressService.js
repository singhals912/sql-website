const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class ProgressService {
  // Initialize or get session for user
  static async initializeSession(sessionId, ipAddress = null, userAgent = null) {
    try {
      const result = await pool.query(`
        INSERT INTO user_sessions (session_id, ip_address, user_agent)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id) DO UPDATE SET
          last_activity = CURRENT_TIMESTAMP,
          user_agent = COALESCE($3, user_sessions.user_agent)
        RETURNING id
      `, [sessionId, ipAddress, userAgent]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  // Record a problem attempt
  static async recordAttempt(sessionId, problemId, problemNumericId, query, isCorrect, executionTimeMs = null, errorMessage = null, hintUsed = false, solutionViewed = false) {
    try {
      // Get current attempt number for this problem
      const attemptCountResult = await pool.query(`
        SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
        FROM user_problem_attempts 
        WHERE session_id = $1 AND problem_numeric_id = $2
      `, [sessionId, problemNumericId]);
      
      const nextAttemptNumber = attemptCountResult.rows[0].next_attempt;

      const result = await pool.query(`
        INSERT INTO user_problem_attempts (
          session_id, problem_id, problem_numeric_id, query_submitted,
          is_correct, execution_time_ms, error_message, hint_used, 
          solution_viewed, attempt_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at
      `, [
        sessionId, problemId, problemNumericId, query,
        isCorrect, executionTimeMs, errorMessage, hintUsed, 
        solutionViewed, nextAttemptNumber
      ]);

      // Check for achievements after successful attempt
      if (isCorrect) {
        await this.checkAchievements(sessionId, problemId, problemNumericId, executionTimeMs);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error recording attempt:', error);
      throw error;
    }
  }

  // Get comprehensive user progress
  static async getUserProgress(sessionId) {
    try {
      // Get overall stats
      const overallStats = await pool.query(`
        SELECT 
          COUNT(*) as total_attempted,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE status = 'not_started') as not_started,
          AVG(best_execution_time_ms) FILTER (WHERE best_execution_time_ms IS NOT NULL) as avg_execution_time,
          AVG(total_attempts) as avg_attempts_per_problem
        FROM user_problem_progress 
        WHERE session_id = $1
      `, [sessionId]);

      // Get progress by difficulty
      const difficultyStats = await pool.query(`
        SELECT 
          p.difficulty,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE upp.status = 'completed') as completed,
          AVG(upp.total_attempts) as avg_attempts,
          AVG(upp.best_execution_time_ms) FILTER (WHERE upp.best_execution_time_ms IS NOT NULL) as avg_time
        FROM problems p
        LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
        WHERE p.is_active = true AND p.numeric_id BETWEEN 1 AND 91
        GROUP BY p.difficulty
        ORDER BY 
          CASE p.difficulty 
            WHEN 'easy' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'hard' THEN 3 
          END
      `, [sessionId]);

      // Get progress by category
      const categoryStats = await pool.query(`
        SELECT 
          COALESCE(c.name, 'Uncategorized') as category,
          COUNT(p.*) as total_problems,
          COUNT(upp.*) as attempted,
          COUNT(*) FILTER (WHERE upp.status = 'completed') as completed,
          ROUND(AVG(upp.total_attempts), 2) as avg_attempts,
          ROUND(AVG(upp.best_execution_time_ms), 0) as avg_execution_time
        FROM problems p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
        WHERE p.is_active = true AND p.numeric_id BETWEEN 1 AND 91
        GROUP BY c.name
        ORDER BY completed DESC, attempted DESC
      `, [sessionId]);

      // Get recent activity
      const recentActivity = await pool.query(`
        SELECT 
          upa.problem_numeric_id,
          p.title,
          p.difficulty,
          upa.is_correct,
          upa.execution_time_ms,
          upa.created_at,
          upa.attempt_number
        FROM user_problem_attempts upa
        JOIN problems p ON upa.problem_id = p.id
        WHERE upa.session_id = $1
        ORDER BY upa.created_at DESC
        LIMIT 20
      `, [sessionId]);

      // Get achievements
      const achievements = await pool.query(`
        SELECT 
          achievement_type,
          achievement_name,
          description,
          earned_at,
          metadata
        FROM user_achievements
        WHERE session_id = $1
        ORDER BY earned_at DESC
      `, [sessionId]);

      // Get streaks
      const streaks = await pool.query(`
        SELECT 
          streak_type,
          current_count,
          max_count,
          last_activity,
          started_at
        FROM user_streaks
        WHERE session_id = $1
      `, [sessionId]);

      // Calculate completion rate
      const totalProblems = 91;
      const stats = overallStats.rows[0];
      const completionRate = stats.completed ? (parseInt(stats.completed) / totalProblems * 100).toFixed(1) : 0;

      return {
        overview: {
          totalProblems,
          attempted: parseInt(stats.total_attempted) || 0,
          completed: parseInt(stats.completed) || 0,
          inProgress: parseInt(stats.in_progress) || 0,
          completionRate: parseFloat(completionRate),
          avgExecutionTime: stats.avg_execution_time ? Math.round(stats.avg_execution_time) : null,
          avgAttemptsPerProblem: stats.avg_attempts_per_problem ? parseFloat(stats.avg_attempts_per_problem).toFixed(1) : null
        },
        byDifficulty: difficultyStats.rows.map(row => ({
          difficulty: row.difficulty,
          total: parseInt(row.total),
          completed: parseInt(row.completed) || 0,
          completionRate: row.total > 0 ? ((parseInt(row.completed) || 0) / parseInt(row.total) * 100).toFixed(1) : 0,
          avgAttempts: row.avg_attempts ? parseFloat(row.avg_attempts).toFixed(1) : null,
          avgTime: row.avg_time ? Math.round(row.avg_time) : null
        })),
        byCategory: categoryStats.rows.map(row => ({
          category: row.category,
          totalProblems: parseInt(row.total_problems),
          attempted: parseInt(row.attempted) || 0,
          completed: parseInt(row.completed) || 0,
          completionRate: row.total_problems > 0 ? ((parseInt(row.completed) || 0) / parseInt(row.total_problems) * 100).toFixed(1) : 0,
          avgAttempts: row.avg_attempts,
          avgExecutionTime: row.avg_execution_time
        })),
        recentActivity: recentActivity.rows,
        achievements: achievements.rows,
        streaks: streaks.rows
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  // Get detailed progress for all problems
  static async getDetailedProgress(sessionId) {
    try {
      const result = await pool.query(`
        SELECT 
          p.numeric_id,
          p.title,
          p.difficulty,
          COALESCE(c.name, 'Uncategorized') as category,
          COALESCE(upp.status, 'not_started') as status,
          COALESCE(upp.total_attempts, 0) as attempts,
          COALESCE(upp.correct_attempts, 0) as correct_attempts,
          upp.best_execution_time_ms,
          upp.first_attempt_at,
          upp.completed_at,
          upp.last_attempt_at,
          upp.difficulty_rating,
          CASE 
            WHEN upp.status = 'completed' THEN true
            ELSE false
          END as is_completed
        FROM problems p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
        WHERE p.is_active = true AND p.numeric_id BETWEEN 1 AND 91
        ORDER BY p.numeric_id
      `, [sessionId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting detailed progress:', error);
      throw error;
    }
  }

  // Check and award achievements
  static async checkAchievements(sessionId, problemId, problemNumericId, executionTimeMs) {
    try {
      // First solve achievement
      const firstSolve = await pool.query(`
        SELECT 1 FROM user_achievements 
        WHERE session_id = $1 AND achievement_type = 'first_solve'
      `, [sessionId]);

      if (firstSolve.rows.length === 0) {
        await pool.query(`
          INSERT INTO user_achievements (session_id, achievement_type, achievement_name, description, problem_id)
          VALUES ($1, 'first_solve', 'First Steps', 'Solved your first SQL problem!', $2)
        `, [sessionId, problemId]);
      }

      // Speed achievements (under 1 second)
      if (executionTimeMs && executionTimeMs < 1000) {
        const speedAchievement = await pool.query(`
          SELECT 1 FROM user_achievements 
          WHERE session_id = $1 AND achievement_type = 'speed_demon' AND problem_id = $2
        `, [sessionId, problemId]);

        if (speedAchievement.rows.length === 0) {
          await pool.query(`
            INSERT INTO user_achievements (session_id, achievement_type, achievement_name, description, problem_id, metadata)
            VALUES ($1, 'speed_demon', 'Speed Demon', 'Solved a problem in under 1 second!', $2, $3)
          `, [sessionId, problemId, JSON.stringify({ execution_time_ms: executionTimeMs })]);
        }
      }

      // Milestone achievements (10, 25, 50 problems)
      const completedCount = await pool.query(`
        SELECT COUNT(*) as count FROM user_problem_progress 
        WHERE session_id = $1 AND status = 'completed'
      `, [sessionId]);

      const count = parseInt(completedCount.rows[0].count);
      const milestones = [10, 25, 50, 75, 91];
      
      for (const milestone of milestones) {
        if (count >= milestone) {
          const existingMilestone = await pool.query(`
            SELECT 1 FROM user_achievements 
            WHERE session_id = $1 AND achievement_type = 'milestone' AND metadata->>'count' = $2
          `, [sessionId, milestone.toString()]);

          if (existingMilestone.rows.length === 0) {
            await pool.query(`
              INSERT INTO user_achievements (session_id, achievement_type, achievement_name, description, metadata)
              VALUES ($1, 'milestone', $2, $3, $4)
            `, [
              sessionId, 
              `${milestone} Problems Solved`,
              `Congratulations on solving ${milestone} problems!`,
              JSON.stringify({ count: milestone })
            ]);
          }
        }
      }

    } catch (error) {
      console.error('Error checking achievements:', error);
      // Don't throw - achievements are nice-to-have
    }
  }

  // Update session activity
  static async updateSessionActivity(sessionId) {
    try {
      await pool.query(`
        UPDATE user_sessions 
        SET last_activity = CURRENT_TIMESTAMP 
        WHERE session_id = $1
      `, [sessionId]);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  // Get leaderboard data (anonymous)
  static async getLeaderboard(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as problems_solved,
          MIN(completed_at) as first_completion,
          AVG(best_execution_time_ms) FILTER (WHERE best_execution_time_ms IS NOT NULL) as avg_time,
          COUNT(DISTINCT session_id) as session_count
        FROM user_problem_progress
        WHERE status = 'completed'
        GROUP BY session_id
        ORDER BY problems_solved DESC, avg_time ASC
        LIMIT $1
      `, [limit]);

      return result.rows.map((row, index) => ({
        rank: index + 1,
        problemsSolved: parseInt(row.problems_solved),
        avgExecutionTime: row.avg_time ? Math.round(row.avg_time) : null,
        firstCompletion: row.first_completion
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }
}

module.exports = ProgressService;