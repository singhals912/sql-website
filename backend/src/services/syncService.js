const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class SyncService {
  // Sync user data to cloud (when user logs in on a new device)
  static async syncUserDataToCloud(userId) {
    try {
      // Get comprehensive user data for cloud sync
      const userData = await this.getUserSyncData(userId);
      
      // In a real implementation, this would sync to a cloud storage service
      // For now, we'll just ensure data consistency in our database
      await this.consolidateUserData(userId);
      
      return {
        syncedAt: new Date().toISOString(),
        userId,
        dataTypes: [
          'progress',
          'bookmarks', 
          'achievements',
          'learning_paths',
          'streaks',
          'preferences'
        ],
        recordCounts: {
          problemsAttempted: userData.progress.length,
          bookmarks: userData.bookmarks.length,
          achievements: userData.achievements.length,
          activeLearningPaths: userData.learningPaths.filter(lp => lp.is_active).length
        }
      };

    } catch (error) {
      console.error('Error syncing user data to cloud:', error);
      throw error;
    }
  }

  // Get user data for sync operations
  static async getUserSyncData(userId) {
    try {
      // Get user progress
      const progress = await pool.query(`
        SELECT 
          upp.*,
          p.numeric_id,
          p.title,
          p.difficulty
        FROM user_problem_progress upp
        JOIN problems p ON upp.problem_id = p.id
        WHERE upp.user_id = $1
        ORDER BY upp.last_attempt_at DESC
      `, [userId]);

      // Get user bookmarks
      const bookmarks = await pool.query(`
        SELECT 
          ub.*,
          p.numeric_id,
          p.title,
          p.difficulty
        FROM user_bookmarks ub
        JOIN problems p ON ub.problem_id = p.id
        WHERE ub.user_id = $1
        ORDER BY ub.created_at DESC
      `, [userId]);

      // Get user achievements
      const achievements = await pool.query(`
        SELECT * FROM user_achievements
        WHERE user_id = $1
        ORDER BY earned_at DESC
      `, [userId]);

      // Get learning path progress
      const learningPaths = await pool.query(`
        SELECT 
          ulpp.*,
          lp.name,
          lp.difficulty_level,
          lp.estimated_hours
        FROM user_learning_path_progress ulpp
        JOIN learning_paths lp ON ulpp.learning_path_id = lp.id
        WHERE ulpp.user_id = $1
        ORDER BY ulpp.last_activity DESC
      `, [userId]);

      // Get user streaks
      const streaks = await pool.query(`
        SELECT * FROM user_streaks
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]);

      // Get user preferences
      const userProfile = await pool.query(`
        SELECT preferences, goals FROM users
        WHERE id = $1
      `, [userId]);

      return {
        progress: progress.rows,
        bookmarks: bookmarks.rows,
        achievements: achievements.rows,
        learningPaths: learningPaths.rows,
        streaks: streaks.rows,
        preferences: userProfile.rows[0]?.preferences || {},
        goals: userProfile.rows[0]?.goals || {}
      };

    } catch (error) {
      console.error('Error getting user sync data:', error);
      throw error;
    }
  }

  // Consolidate user data (remove duplicates, fix inconsistencies)
  static async consolidateUserData(userId) {
    try {
      await pool.query('BEGIN');

      // Remove duplicate problem attempts (keep latest)
      await pool.query(`
        DELETE FROM user_problem_attempts upa1
        WHERE upa1.user_id = $1
        AND EXISTS (
          SELECT 1 FROM user_problem_attempts upa2
          WHERE upa2.user_id = upa1.user_id
          AND upa2.problem_id = upa1.problem_id
          AND upa2.created_at > upa1.created_at
        )
      `, [userId]);

      // Update progress summary based on latest attempts
      await pool.query(`
        UPDATE user_problem_progress upp
        SET 
          total_attempts = (
            SELECT COUNT(*) FROM user_problem_attempts upa
            WHERE upa.user_id = upp.user_id AND upa.problem_id = upp.problem_id
          ),
          is_solved = (
            SELECT bool_or(is_correct) FROM user_problem_attempts upa
            WHERE upa.user_id = upp.user_id AND upa.problem_id = upp.problem_id
          ),
          best_time_ms = (
            SELECT MIN(execution_time_ms) FROM user_problem_attempts upa
            WHERE upa.user_id = upp.user_id 
            AND upa.problem_id = upp.problem_id 
            AND upa.is_correct = true
          ),
          last_attempt_at = (
            SELECT MAX(created_at) FROM user_problem_attempts upa
            WHERE upa.user_id = upp.user_id AND upa.problem_id = upp.problem_id
          ),
          solved_at = (
            SELECT MIN(created_at) FROM user_problem_attempts upa
            WHERE upa.user_id = upp.user_id 
            AND upa.problem_id = upp.problem_id 
            AND upa.is_correct = true
          )
        WHERE upp.user_id = $1
      `, [userId]);

      // Update learning path progress
      await pool.query(`
        UPDATE user_learning_path_progress ulpp
        SET 
          steps_completed = (
            SELECT COUNT(DISTINCT lps.id)
            FROM learning_path_steps lps
            JOIN user_problem_progress upp ON lps.problem_id = upp.problem_id
            WHERE lps.learning_path_id = ulpp.learning_path_id
            AND upp.user_id = ulpp.user_id
            AND upp.is_solved = true
          ),
          completion_percentage = ROUND(
            (SELECT COUNT(DISTINCT lps.id) * 100.0 / ulpp.total_steps
             FROM learning_path_steps lps
             JOIN user_problem_progress upp ON lps.problem_id = upp.problem_id
             WHERE lps.learning_path_id = ulpp.learning_path_id
             AND upp.user_id = ulpp.user_id
             AND upp.is_solved = true
            ), 2
          ),
          last_activity = COALESCE(
            (SELECT MAX(upp.last_attempt_at)
             FROM learning_path_steps lps
             JOIN user_problem_progress upp ON lps.problem_id = upp.problem_id
             WHERE lps.learning_path_id = ulpp.learning_path_id
             AND upp.user_id = ulpp.user_id
            ), ulpp.last_activity
          )
        WHERE ulpp.user_id = $1
      `, [userId]);

      await pool.query('COMMIT');

      return { message: 'User data consolidated successfully' };

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error consolidating user data:', error);
      throw error;
    }
  }

  // Backup user data (export for download)
  static async backupUserData(userId) {
    try {
      const userData = await this.getUserSyncData(userId);
      
      // Get user profile info
      const userProfile = await pool.query(`
        SELECT 
          email, username, full_name, created_at,
          preferences, goals
        FROM users
        WHERE id = $1
      `, [userId]);

      // Create comprehensive backup
      const backup = {
        metadata: {
          userId,
          backupDate: new Date().toISOString(),
          version: '1.0',
          platform: 'SQL Practice Platform'
        },
        profile: userProfile.rows[0],
        data: userData,
        statistics: {
          totalProblemsAttempted: userData.progress.length,
          problemsSolved: userData.progress.filter(p => p.is_solved).length,
          totalAttempts: userData.progress.reduce((sum, p) => sum + p.total_attempts, 0),
          bookmarksCount: userData.bookmarks.length,
          achievementsCount: userData.achievements.length,
          activeLearningPaths: userData.learningPaths.filter(lp => lp.is_active).length
        }
      };

      return backup;

    } catch (error) {
      console.error('Error backing up user data:', error);
      throw error;
    }
  }

  // Restore user data from backup
  static async restoreUserData(userId, backupData) {
    try {
      await pool.query('BEGIN');

      // Validate backup data structure
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Invalid backup data format');
      }

      const { data } = backupData;

      // Restore bookmarks (avoid duplicates)
      if (data.bookmarks && data.bookmarks.length > 0) {
        for (const bookmark of data.bookmarks) {
          await pool.query(`
            INSERT INTO user_bookmarks (user_id, problem_id, bookmark_type, notes, tags, created_at)
            SELECT $1, p.id, $2, $3, $4, $5
            FROM problems p
            WHERE p.numeric_id = $6
            ON CONFLICT (user_id, problem_id) DO NOTHING
          `, [
            userId,
            bookmark.bookmark_type,
            bookmark.notes,
            bookmark.tags,
            bookmark.created_at,
            bookmark.numeric_id
          ]);
        }
      }

      // Restore learning path progress
      if (data.learningPaths && data.learningPaths.length > 0) {
        for (const pathProgress of data.learningPaths) {
          await pool.query(`
            INSERT INTO user_learning_path_progress 
            (user_id, learning_path_id, steps_completed, completion_percentage, started_at, last_activity)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, learning_path_id) 
            DO UPDATE SET
              steps_completed = GREATEST(user_learning_path_progress.steps_completed, $3),
              completion_percentage = GREATEST(user_learning_path_progress.completion_percentage, $4),
              last_activity = GREATEST(user_learning_path_progress.last_activity, $6)
          `, [
            userId,
            pathProgress.learning_path_id,
            pathProgress.steps_completed,
            pathProgress.completion_percentage,
            pathProgress.started_at,
            pathProgress.last_activity
          ]);
        }
      }

      // Restore achievements
      if (data.achievements && data.achievements.length > 0) {
        for (const achievement of data.achievements) {
          await pool.query(`
            INSERT INTO user_achievements (user_id, achievement_type, achievement_data, earned_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, achievement_type, earned_at) DO NOTHING
          `, [
            userId,
            achievement.achievement_type,
            achievement.achievement_data,
            achievement.earned_at
          ]);
        }
      }

      // Update user preferences
      if (data.preferences || data.goals) {
        await pool.query(`
          UPDATE users 
          SET 
            preferences = COALESCE($2, preferences),
            goals = COALESCE($3, goals)
          WHERE id = $1
        `, [userId, data.preferences, data.goals]);
      }

      await pool.query('COMMIT');

      return { 
        message: 'User data restored successfully',
        restoredItems: {
          bookmarks: data.bookmarks?.length || 0,
          learningPaths: data.learningPaths?.length || 0,
          achievements: data.achievements?.length || 0
        }
      };

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error restoring user data:', error);
      throw error;
    }
  }

  // Check sync status
  static async getSyncStatus(userId) {
    try {
      // Get last sync information (in real implementation, this would come from cloud)
      const lastActivity = await pool.query(`
        SELECT MAX(last_activity) as last_sync
        FROM (
          SELECT last_attempt_at as last_activity FROM user_problem_progress WHERE user_id = $1
          UNION ALL
          SELECT created_at as last_activity FROM user_bookmarks WHERE user_id = $1
          UNION ALL
          SELECT earned_at as last_activity FROM user_achievements WHERE user_id = $1
          UNION ALL
          SELECT last_activity FROM user_learning_path_progress WHERE user_id = $1
        ) activities
      `, [userId]);

      // Get data counts
      const counts = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM user_problem_progress WHERE user_id = $1) as progress_count,
          (SELECT COUNT(*) FROM user_bookmarks WHERE user_id = $1) as bookmarks_count,
          (SELECT COUNT(*) FROM user_achievements WHERE user_id = $1) as achievements_count,
          (SELECT COUNT(*) FROM user_learning_path_progress WHERE user_id = $1) as learning_paths_count
      `, [userId]);

      return {
        userId,
        lastSyncAt: lastActivity.rows[0].last_sync,
        status: 'synced', // In real implementation, compare with cloud timestamp
        dataCounts: counts.rows[0],
        needsSync: false // Would be determined by comparing local vs cloud timestamps
      };

    } catch (error) {
      console.error('Error getting sync status:', error);
      throw error;
    }
  }

  // Merge session data when user logs in
  static async mergeSessionToUser(userId, sessionId) {
    try {
      await pool.query('BEGIN');

      // Check if session data exists
      const sessionProgress = await pool.query(`
        SELECT COUNT(*) as count FROM user_problem_progress WHERE session_id = $1
      `, [sessionId]);

      if (parseInt(sessionProgress.rows[0].count) === 0) {
        await pool.query('COMMIT');
        return { message: 'No session data to merge' };
      }

      // Merge progress data - keep best results
      await pool.query(`
        INSERT INTO user_problem_progress 
        (user_id, problem_id, total_attempts, is_solved, best_time_ms, last_attempt_at, solved_at)
        SELECT 
          $1,
          problem_id,
          total_attempts,
          is_solved,
          best_time_ms,
          last_attempt_at,
          solved_at
        FROM user_problem_progress 
        WHERE session_id = $2
        ON CONFLICT (user_id, problem_id) DO UPDATE SET
          total_attempts = user_problem_progress.total_attempts + EXCLUDED.total_attempts,
          is_solved = user_problem_progress.is_solved OR EXCLUDED.is_solved,
          best_time_ms = LEAST(
            COALESCE(user_problem_progress.best_time_ms, EXCLUDED.best_time_ms),
            COALESCE(EXCLUDED.best_time_ms, user_problem_progress.best_time_ms)
          ),
          last_attempt_at = GREATEST(user_problem_progress.last_attempt_at, EXCLUDED.last_attempt_at),
          solved_at = COALESCE(
            LEAST(
              COALESCE(user_problem_progress.solved_at, EXCLUDED.solved_at),
              COALESCE(EXCLUDED.solved_at, user_problem_progress.solved_at)
            ),
            user_problem_progress.solved_at,
            EXCLUDED.solved_at
          )
      `, [userId, sessionId]);

      // Merge attempts
      await pool.query(`
        UPDATE user_problem_attempts 
        SET user_id = $1, session_id = NULL
        WHERE session_id = $2
      `, [userId, sessionId]);

      // Merge bookmarks (avoid duplicates)
      await pool.query(`
        INSERT INTO user_bookmarks (user_id, problem_id, bookmark_type, notes, tags, created_at)
        SELECT $1, problem_id, bookmark_type, notes, tags, created_at
        FROM user_bookmarks 
        WHERE session_id = $2
        ON CONFLICT (user_id, problem_id) DO NOTHING
      `, [userId, sessionId]);

      // Clean up session data
      await pool.query(`DELETE FROM user_problem_progress WHERE session_id = $1`, [sessionId]);
      await pool.query(`DELETE FROM user_bookmarks WHERE session_id = $1`, [sessionId]);

      await pool.query('COMMIT');

      return { message: 'Session data merged successfully' };

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error merging session data:', error);
      throw error;
    }
  }
}

module.exports = SyncService;