const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class ProfileService {
  // Get comprehensive user profile with statistics
  static async getUserProfile(userId) {
    try {
      // Get basic user info
      const userResult = await pool.query(`
        SELECT 
          id, email, username, full_name, avatar_url,
          preferences, goals, created_at, last_login, email_verified
        FROM users 
        WHERE id = $1 AND is_active = true
      `, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get user statistics
      const stats = await this.getUserStatistics(userId);
      
      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId, 10);
      
      // Get achievements
      const achievements = await this.getUserAchievements(userId);
      
      // Get current streaks
      const streaks = await this.getCurrentStreaks(userId);

      return {
        user,
        statistics: stats,
        recentActivity,
        achievements,
        streaks
      };

    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStatistics(userId) {
    try {
      const stats = await pool.query(`
        SELECT 
          -- Problem solving stats
          COUNT(DISTINCT upp.problem_id) as problems_attempted,
          COUNT(DISTINCT CASE WHEN upp.is_solved THEN upp.problem_id END) as problems_solved,
          SUM(upp.total_attempts) as total_attempts,
          AVG(CASE WHEN upp.is_solved THEN upp.best_time_ms END) as avg_solve_time,
          MIN(CASE WHEN upp.is_solved THEN upp.best_time_ms END) as best_solve_time,
          
          -- Difficulty breakdown
          COUNT(DISTINCT CASE WHEN p.difficulty = 'easy' AND upp.is_solved THEN p.id END) as easy_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'medium' AND upp.is_solved THEN p.id END) as medium_solved,
          COUNT(DISTINCT CASE WHEN p.difficulty = 'hard' AND upp.is_solved THEN p.id END) as hard_solved,
          
          -- Activity stats
          COUNT(DISTINCT DATE(upp.last_attempt_at)) as active_days,
          MAX(upp.last_attempt_at) as last_activity,
          MIN(upp.last_attempt_at) as first_activity
          
        FROM user_problem_progress upp
        LEFT JOIN problems p ON upp.problem_id = p.id
        WHERE upp.user_id = $1
      `, [userId]);

      const basicStats = stats.rows[0];

      // Get bookmark stats
      const bookmarkStats = await pool.query(`
        SELECT 
          COUNT(*) as total_bookmarks,
          COUNT(CASE WHEN bookmark_type = 'favorite' THEN 1 END) as favorites,
          COUNT(CASE WHEN bookmark_type = 'review_later' THEN 1 END) as review_later,
          COUNT(CASE WHEN bookmark_type = 'challenging' THEN 1 END) as challenging
        FROM user_bookmarks
        WHERE user_id = $1
      `, [userId]);

      // Get learning path stats
      const learningPathStats = await pool.query(`
        SELECT 
          COUNT(*) as total_paths,
          COUNT(CASE WHEN completion_percentage >= 100 THEN 1 END) as completed_paths,
          AVG(completion_percentage) as avg_completion,
          COUNT(CASE WHEN is_active THEN 1 END) as active_paths
        FROM user_learning_path_progress
        WHERE user_id = $1
      `, [userId]);

      // Calculate percentile ranking
      const ranking = await pool.query(`
        WITH user_scores AS (
          SELECT 
            user_id,
            COUNT(DISTINCT CASE WHEN is_solved THEN problem_id END) as solved_count
          FROM user_problem_progress
          GROUP BY user_id
        ),
        user_rank AS (
          SELECT 
            user_id,
            solved_count,
            PERCENT_RANK() OVER (ORDER BY solved_count) as percentile
          FROM user_scores
        )
        SELECT 
          solved_count,
          ROUND(percentile * 100, 1) as percentile_rank
        FROM user_rank
        WHERE user_id = $1
      `, [userId]);

      return {
        problemSolving: {
          problemsAttempted: parseInt(basicStats.problems_attempted) || 0,
          problemsSolved: parseInt(basicStats.problems_solved) || 0,
          totalAttempts: parseInt(basicStats.total_attempts) || 0,
          avgSolveTime: basicStats.avg_solve_time ? Math.round(basicStats.avg_solve_time) : null,
          bestSolveTime: basicStats.best_solve_time ? Math.round(basicStats.best_solve_time) : null,
          successRate: basicStats.problems_attempted > 0 ? 
            Math.round((basicStats.problems_solved / basicStats.problems_attempted) * 100) : 0
        },
        difficultyBreakdown: {
          easy: parseInt(basicStats.easy_solved) || 0,
          medium: parseInt(basicStats.medium_solved) || 0,
          hard: parseInt(basicStats.hard_solved) || 0
        },
        activity: {
          activeDays: parseInt(basicStats.active_days) || 0,
          lastActivity: basicStats.last_activity,
          firstActivity: basicStats.first_activity,
          daysSinceStart: basicStats.first_activity ? 
            Math.ceil((new Date() - new Date(basicStats.first_activity)) / (1000 * 60 * 60 * 24)) : 0
        },
        bookmarks: {
          total: parseInt(bookmarkStats.rows[0].total_bookmarks) || 0,
          favorites: parseInt(bookmarkStats.rows[0].favorites) || 0,
          reviewLater: parseInt(bookmarkStats.rows[0].review_later) || 0,
          challenging: parseInt(bookmarkStats.rows[0].challenging) || 0
        },
        learningPaths: {
          totalPaths: parseInt(learningPathStats.rows[0].total_paths) || 0,
          completedPaths: parseInt(learningPathStats.rows[0].completed_paths) || 0,
          avgCompletion: learningPathStats.rows[0].avg_completion ? 
            Math.round(learningPathStats.rows[0].avg_completion) : 0,
          activePaths: parseInt(learningPathStats.rows[0].active_paths) || 0
        },
        ranking: {
          percentile: ranking.rows[0]?.percentile_rank || 0,
          solvedCount: parseInt(ranking.rows[0]?.solved_count) || 0
        }
      };

    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Get recent activity
  static async getRecentActivity(userId, limit = 10) {
    try {
      const activities = await pool.query(`
        (
          SELECT 
            'problem_attempt' as activity_type,
            p.numeric_id,
            p.title,
            p.difficulty,
            upa.is_correct,
            upa.execution_time_ms,
            upa.created_at as activity_date
          FROM user_problem_attempts upa
          JOIN problems p ON upa.problem_id = p.id
          WHERE upa.user_id = $1
        )
        UNION ALL
        (
          SELECT 
            'bookmark_added' as activity_type,
            p.numeric_id,
            p.title,
            p.difficulty,
            null as is_correct,
            null as execution_time_ms,
            ub.created_at as activity_date
          FROM user_bookmarks ub
          JOIN problems p ON ub.problem_id = p.id
          WHERE ub.user_id = $1
        )
        UNION ALL
        (
          SELECT 
            'achievement_earned' as activity_type,
            null as numeric_id,
            ua.achievement_type as title,
            null as difficulty,
            null as is_correct,
            null as execution_time_ms,
            ua.earned_at as activity_date
          FROM user_achievements ua
          WHERE ua.user_id = $1
        )
        ORDER BY activity_date DESC
        LIMIT $2
      `, [userId, limit]);

      return activities.rows;

    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw error;
    }
  }

  // Get user achievements
  static async getUserAchievements(userId) {
    try {
      const achievements = await pool.query(`
        SELECT 
          achievement_type,
          achievement_data,
          earned_at,
          EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - earned_at)) / 86400 as days_ago
        FROM user_achievements
        WHERE user_id = $1
        ORDER BY earned_at DESC
      `, [userId]);

      // Group achievements by type
      const grouped = achievements.rows.reduce((acc, achievement) => {
        const type = achievement.achievement_type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push({
          data: achievement.achievement_data,
          earnedAt: achievement.earned_at,
          daysAgo: Math.floor(achievement.days_ago)
        });
        return acc;
      }, {});

      return {
        total: achievements.rows.length,
        byType: grouped,
        recent: achievements.rows.slice(0, 5)
      };

    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  // Get current streaks
  static async getCurrentStreaks(userId) {
    try {
      const streaks = await pool.query(`
        SELECT 
          streak_type,
          current_count,
          best_count,
          last_activity_date,
          created_at
        FROM user_streaks
        WHERE user_id = $1
        ORDER BY current_count DESC
      `, [userId]);

      return streaks.rows;

    } catch (error) {
      console.error('Error getting current streaks:', error);
      throw error;
    }
  }

  // Update user preferences
  static async updatePreferences(userId, preferences) {
    try {
      const result = await pool.query(`
        UPDATE users 
        SET 
          preferences = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING preferences
      `, [userId, JSON.stringify(preferences)]);

      return result.rows[0].preferences;

    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Set user goals
  static async setUserGoals(userId, goals) {
    try {
      // Validate goals structure
      const validGoalTypes = ['daily_problems', 'weekly_problems', 'monthly_problems', 'skill_focus', 'completion_target'];
      
      for (const goal of goals) {
        if (!validGoalTypes.includes(goal.type)) {
          throw new Error(`Invalid goal type: ${goal.type}`);
        }
      }

      // Clear existing goals
      await pool.query(`
        UPDATE user_goals 
        SET is_active = false
        WHERE user_id = $1
      `, [userId]);

      // Insert new goals
      for (const goal of goals) {
        await pool.query(`
          INSERT INTO user_goals (user_id, goal_type, target_value, target_date, is_active)
          VALUES ($1, $2, $3, $4, true)
        `, [userId, goal.type, goal.target, goal.targetDate || null]);
      }

      // Update user goals in profile
      await pool.query(`
        UPDATE users 
        SET 
          goals = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId, JSON.stringify(goals)]);

      return { message: 'Goals updated successfully' };

    } catch (error) {
      console.error('Error setting user goals:', error);
      throw error;
    }
  }

  // Get goal progress
  static async getGoalProgress(userId) {
    try {
      const goals = await pool.query(`
        SELECT 
          goal_type,
          target_value,
          target_date,
          current_progress,
          is_active,
          created_at,
          achieved_at
        FROM user_goals
        WHERE user_id = $1 AND is_active = true
        ORDER BY created_at DESC
      `, [userId]);

      // Calculate current progress for each goal
      for (const goal of goals.rows) {
        let currentProgress = 0;
        
        switch (goal.goal_type) {
          case 'daily_problems':
            const dailyResult = await pool.query(`
              SELECT COUNT(DISTINCT problem_id) as count
              FROM user_problem_progress
              WHERE user_id = $1 
              AND DATE(last_attempt_at) = CURRENT_DATE
              AND is_solved = true
            `, [userId]);
            currentProgress = parseInt(dailyResult.rows[0].count);
            break;
            
          case 'weekly_problems':
            const weeklyResult = await pool.query(`
              SELECT COUNT(DISTINCT problem_id) as count
              FROM user_problem_progress
              WHERE user_id = $1 
              AND last_attempt_at >= DATE_TRUNC('week', CURRENT_DATE)
              AND is_solved = true
            `, [userId]);
            currentProgress = parseInt(weeklyResult.rows[0].count);
            break;
            
          case 'monthly_problems':
            const monthlyResult = await pool.query(`
              SELECT COUNT(DISTINCT problem_id) as count
              FROM user_problem_progress
              WHERE user_id = $1 
              AND last_attempt_at >= DATE_TRUNC('month', CURRENT_DATE)
              AND is_solved = true
            `, [userId]);
            currentProgress = parseInt(monthlyResult.rows[0].count);
            break;
        }
        
        goal.current_progress = currentProgress;
        goal.progress_percentage = goal.target_value > 0 ? 
          Math.min(Math.round((currentProgress / goal.target_value) * 100), 100) : 0;
      }

      return goals.rows;

    } catch (error) {
      console.error('Error getting goal progress:', error);
      throw error;
    }
  }

  // Update avatar
  static async updateAvatar(userId, avatarUrl) {
    try {
      const result = await pool.query(`
        UPDATE users 
        SET 
          avatar_url = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING avatar_url
      `, [userId, avatarUrl]);

      return { avatarUrl: result.rows[0].avatar_url };

    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  }

  // Get user comparison (vs other users)
  static async getUserComparison(userId) {
    try {
      const comparison = await pool.query(`
        WITH user_stats AS (
          SELECT 
            COUNT(DISTINCT CASE WHEN is_solved THEN problem_id END) as solved_count,
            AVG(CASE WHEN is_solved THEN best_time_ms END) as avg_time
          FROM user_problem_progress
          WHERE user_id = $1
        ),
        all_users_stats AS (
          SELECT 
            user_id,
            COUNT(DISTINCT CASE WHEN is_solved THEN problem_id END) as solved_count,
            AVG(CASE WHEN is_solved THEN best_time_ms END) as avg_time
          FROM user_problem_progress
          GROUP BY user_id
        )
        SELECT 
          us.solved_count as user_solved,
          us.avg_time as user_avg_time,
          AVG(aus.solved_count) as platform_avg_solved,
          AVG(aus.avg_time) as platform_avg_time,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY aus.solved_count) as median_solved,
          COUNT(CASE WHEN aus.solved_count < us.solved_count THEN 1 END) * 100.0 / COUNT(*) as percentile
        FROM user_stats us
        CROSS JOIN all_users_stats aus
        GROUP BY us.solved_count, us.avg_time
      `, [userId]);

      return comparison.rows[0] || {};

    } catch (error) {
      console.error('Error getting user comparison:', error);
      throw error;
    }
  }
}

module.exports = ProfileService;