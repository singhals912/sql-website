const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class LearningPathService {
  // Get all learning paths with basic info
  static async getAllLearningPaths() {
    try {
      const result = await pool.query(`
        SELECT 
          lp.*,
          COUNT(lps.id) as total_steps
        FROM learning_paths lp
        LEFT JOIN learning_path_steps lps ON lp.id = lps.learning_path_id
        WHERE lp.is_active = true
        GROUP BY lp.id
        ORDER BY lp.order_index ASC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting learning paths:', error);
      throw error;
    }
  }

  // Get specific learning path with steps
  static async getLearningPathWithSteps(pathId) {
    try {
      // Get path info
      const pathResult = await pool.query(`
        SELECT * FROM learning_paths WHERE id = $1 AND is_active = true
      `, [pathId]);

      if (pathResult.rows.length === 0) {
        throw new Error('Learning path not found');
      }

      const path = pathResult.rows[0];

      // Get steps with problem info
      const stepsResult = await pool.query(`
        SELECT 
          lps.*,
          p.numeric_id as problem_numeric_id,
          p.title as problem_title,
          p.difficulty as problem_difficulty,
          c.name as problem_category
        FROM learning_path_steps lps
        JOIN problems p ON lps.problem_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE lps.learning_path_id = $1
        ORDER BY lps.step_order ASC
      `, [pathId]);

      path.steps = stepsResult.rows;
      path.total_steps = stepsResult.rows.length;

      return path;
    } catch (error) {
      console.error('Error getting learning path with steps:', error);
      throw error;
    }
  }

  // Start learning path for user
  static async startLearningPath(userId, sessionId, pathId) {
    try {
      await pool.query('BEGIN');

      // Get path info
      const pathResult = await pool.query(`
        SELECT * FROM learning_paths WHERE id = $1 AND is_active = true
      `, [pathId]);

      if (pathResult.rows.length === 0) {
        throw new Error('Learning path not found');
      }

      const path = pathResult.rows[0];

      // Get total steps
      const stepsResult = await pool.query(`
        SELECT COUNT(*) as count FROM learning_path_steps WHERE learning_path_id = $1
      `, [pathId]);

      const totalSteps = parseInt(stepsResult.rows[0].count);

      // Check if already started
      const existingProgress = await pool.query(`
        SELECT * FROM user_learning_path_progress 
        WHERE learning_path_id = $1 AND ${userId ? 'user_id = $2' : 'session_id = $2'}
      `, [pathId, userId || sessionId]);

      if (existingProgress.rows.length > 0) {
        await pool.query('COMMIT');
        return existingProgress.rows[0];
      }

      // Create new progress record
      const progressResult = await pool.query(`
        INSERT INTO user_learning_path_progress 
        (user_id, session_id, learning_path_id, total_steps, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `, [userId, sessionId, pathId, totalSteps]);

      await pool.query('COMMIT');
      return progressResult.rows[0];

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error starting learning path:', error);
      throw error;
    }
  }

  // Get user progress for learning paths
  static async getUserProgress(userId, sessionId) {
    try {
      const whereClause = userId ? 'ulpp.user_id = $1' : 'ulpp.session_id = $1';
      
      const result = await pool.query(`
        SELECT 
          ulpp.*,
          lp.name as learning_path_name,
          lp.difficulty_level,
          lp.estimated_hours
        FROM user_learning_path_progress ulpp
        JOIN learning_paths lp ON ulpp.learning_path_id = lp.id
        WHERE ${whereClause}
        ORDER BY ulpp.last_activity DESC
      `, [userId || sessionId]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  // Update step completion
  static async updateStepCompletion(userId, sessionId, pathId, stepId, completed) {
    try {
      await pool.query('BEGIN');

      // Update the step completion (this would be handled by problem completion logic)
      // For now, we'll update the overall path progress

      // Get current progress
      const whereClause = userId ? 'user_id = $1' : 'session_id = $1';
      const progressResult = await pool.query(`
        SELECT * FROM user_learning_path_progress 
        WHERE learning_path_id = $2 AND ${whereClause}
      `, [userId || sessionId, pathId]);

      if (progressResult.rows.length === 0) {
        throw new Error('Learning path progress not found');
      }

      // Calculate new progress based on completed problems
      const completedSteps = await pool.query(`
        SELECT COUNT(DISTINCT lps.id) as count
        FROM learning_path_steps lps
        JOIN user_problem_progress upp ON lps.problem_id = upp.problem_id
        WHERE lps.learning_path_id = $1 
        AND upp.${userId ? 'user_id' : 'session_id'} = $2
        AND upp.is_solved = true
      `, [pathId, userId || sessionId]);

      const stepsCompleted = parseInt(completedSteps.rows[0].count);
      const totalSteps = progressResult.rows[0].total_steps;
      const completionPercentage = totalSteps > 0 ? (stepsCompleted / totalSteps) * 100 : 0;

      // Update progress
      const updatedProgress = await pool.query(`
        UPDATE user_learning_path_progress 
        SET 
          steps_completed = $1,
          completion_percentage = $2,
          last_activity = CURRENT_TIMESTAMP,
          completed_at = CASE WHEN $2 >= 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE learning_path_id = $3 AND ${whereClause}
        RETURNING *
      `, [stepsCompleted, completionPercentage, pathId, userId || sessionId]);

      await pool.query('COMMIT');
      return updatedProgress.rows[0];

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error updating step completion:', error);
      throw error;
    }
  }

  // Get learning path statistics
  static async getStatistics() {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_paths,
          COUNT(CASE WHEN difficulty_level = 'beginner' THEN 1 END) as beginner_paths,
          COUNT(CASE WHEN difficulty_level = 'intermediate' THEN 1 END) as intermediate_paths,
          COUNT(CASE WHEN difficulty_level = 'advanced' THEN 1 END) as advanced_paths,
          SUM(estimated_hours) as total_hours,
          (SELECT COUNT(*) FROM learning_path_steps) as total_problems,
          (SELECT COUNT(DISTINCT user_id) FROM user_learning_path_progress WHERE user_id IS NOT NULL) as active_learners
        FROM learning_paths
        WHERE is_active = true
      `);

      return stats.rows[0];
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  // Get next problem in learning path
  static async getNextProblemInPath(pathId, currentProblemId) {
    try {
      // Get all steps in the learning path ordered by step_order
      const stepsResult = await pool.query(`
        SELECT 
          lps.*,
          p.numeric_id as problem_numeric_id,
          p.title as problem_title,
          p.id as problem_uuid
        FROM learning_path_steps lps
        JOIN problems p ON lps.problem_id = p.id
        WHERE lps.learning_path_id = $1
        ORDER BY lps.step_order ASC
      `, [pathId]);

      const steps = stepsResult.rows;
      
      if (steps.length === 0) {
        return null;
      }

      // Find current problem index
      const currentIndex = steps.findIndex(step => 
        step.problem_id === currentProblemId || 
        step.problem_uuid === currentProblemId ||
        step.problem_numeric_id.toString() === currentProblemId.toString()
      );

      // Return next problem if exists
      if (currentIndex !== -1 && currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        return {
          step_order: nextStep.step_order,
          problem_id: nextStep.problem_id,
          problem_numeric_id: nextStep.problem_numeric_id,
          problem_title: nextStep.problem_title,
          description: nextStep.description,
          is_last: currentIndex + 1 === steps.length - 1,
          current_step: currentIndex + 2, // 1-based
          total_steps: steps.length
        };
      }

      return null; // No next problem or current problem not found
    } catch (error) {
      console.error('Error getting next problem in path:', error);
      throw error;
    }
  }

  // Get current problem's position in learning path
  static async getProblemPositionInPath(pathId, problemId) {
    try {
      const stepsResult = await pool.query(`
        SELECT 
          lps.*,
          p.numeric_id as problem_numeric_id,
          p.title as problem_title
        FROM learning_path_steps lps
        JOIN problems p ON lps.problem_id = p.id
        WHERE lps.learning_path_id = $1
        ORDER BY lps.step_order ASC
      `, [pathId]);

      const steps = stepsResult.rows;
      
      const currentIndex = steps.findIndex(step => 
        step.problem_id === problemId || 
        step.problem_numeric_id.toString() === problemId.toString()
      );

      if (currentIndex === -1) {
        return null;
      }

      return {
        current_step: currentIndex + 1, // 1-based
        total_steps: steps.length,
        step_order: steps[currentIndex].step_order,
        has_next: currentIndex < steps.length - 1,
        has_previous: currentIndex > 0,
        next_problem: currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null,
        previous_problem: currentIndex > 0 ? steps[currentIndex - 1] : null
      };
    } catch (error) {
      console.error('Error getting problem position in path:', error);
      throw error;
    }
  }

  // Get learning path context for a problem (which learning paths contain this problem)
  static async getLearningPathsForProblem(problemId) {
    try {
      // First try to find problem by UUID
      let result = await pool.query(`
        SELECT 
          lp.id as learning_path_id,
          lp.name as learning_path_name,
          lp.difficulty_level,
          lps.step_order,
          (SELECT COUNT(*) FROM learning_path_steps WHERE learning_path_id = lp.id) as total_steps
        FROM learning_path_steps lps
        JOIN learning_paths lp ON lps.learning_path_id = lp.id
        WHERE lps.problem_id = $1
        ORDER BY lp.order_index ASC, lps.step_order ASC
      `, [problemId]);

      // If no results and problemId looks like a number, try to find by numeric_id
      if (result.rows.length === 0 && /^\d+$/.test(problemId)) {
        const numericId = parseInt(problemId);
        result = await pool.query(`
          SELECT 
            lp.id as learning_path_id,
            lp.name as learning_path_name,
            lp.difficulty_level,
            lps.step_order,
            (SELECT COUNT(*) FROM learning_path_steps WHERE learning_path_id = lp.id) as total_steps
          FROM learning_path_steps lps
          JOIN learning_paths lp ON lps.learning_path_id = lp.id
          JOIN problems p ON lps.problem_id = p.id
          WHERE p.numeric_id = $1
          ORDER BY lp.order_index ASC, lps.step_order ASC
        `, [numericId]);
      }

      return result.rows;
    } catch (error) {
      console.error('Error getting learning paths for problem:', error);
      throw error;
    }
  }

  // Get recommendations for user
  static async getRecommendations(userId, sessionId) {
    try {
      // Get user's current skill level based on solved problems
      const userStats = await pool.query(`
        SELECT 
          COUNT(DISTINCT CASE WHEN p.difficulty = 'easy' AND upp.is_solved THEN p.id END) as easy_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'medium' AND upp.is_solved THEN p.id END) as medium_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'hard' AND upp.is_solved THEN p.id END) as hard_solved,
          COUNT(DISTINCT CASE WHEN upp.is_solved THEN p.id END) as total_solved
        FROM user_problem_progress upp
        JOIN problems p ON upp.problem_id = p.id
        WHERE upp.${userId ? 'user_id' : 'session_id'} = $1
      `, [userId || sessionId]);

      const stats = userStats.rows[0];
      const totalSolved = parseInt(stats.total_solved);

      let recommendedLevel = 'beginner';
      if (totalSolved >= 20 && parseInt(stats.medium_solved) >= 5) {
        recommendedLevel = 'intermediate';
      }
      if (totalSolved >= 50 && parseInt(stats.hard_solved) >= 10) {
        recommendedLevel = 'advanced';
      }

      // Get paths user hasn't started yet
      const recommendations = await pool.query(`
        SELECT lp.*, COUNT(lps.id) as total_steps
        FROM learning_paths lp
        LEFT JOIN learning_path_steps lps ON lp.id = lps.learning_path_id
        LEFT JOIN user_learning_path_progress ulpp ON lp.id = ulpp.learning_path_id 
          AND ulpp.${userId ? 'user_id' : 'session_id'} = $1
        WHERE lp.is_active = true 
        AND ulpp.id IS NULL
        AND lp.difficulty_level = $2
        GROUP BY lp.id
        ORDER BY lp.order_index ASC
        LIMIT 3
      `, [userId || sessionId, recommendedLevel]);

      return {
        recommendedLevel,
        paths: recommendations.rows,
        userStats: stats
      };

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { recommendedLevel: 'beginner', paths: [], userStats: {} };
    }
  }
}

module.exports = LearningPathService;