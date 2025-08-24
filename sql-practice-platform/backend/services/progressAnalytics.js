/**
 * Enhanced Progress Analytics Service
 * Provides detailed progress tracking, skill mastery analytics, and learning insights
 */

const pool = require('../config/database');

class ProgressAnalyticsService {
  constructor() {
    this.skillCategories = [
      'Basic Queries',
      'Aggregation',
      'Joins',
      'Window Functions',
      'Subqueries',
      'Time Analysis',
      'Advanced Topics'
    ];

    this.achievements = {
      'first_solve': { name: 'First Steps', description: 'Solved your first problem', icon: '🎯' },
      'streak_3': { name: 'Getting Started', description: '3 problems solved', icon: '🔥' },
      'streak_10': { name: 'Building Momentum', description: '10 problems solved', icon: '💪' },
      'streak_25': { name: 'SQL Explorer', description: '25 problems solved', icon: '🗺️' },
      'streak_50': { name: 'SQL Master', description: '50 problems solved', icon: '👑' },
      'category_master': { name: 'Category Master', description: 'Completed all problems in a category', icon: '🏆' },
      'daily_solver': { name: 'Daily Solver', description: 'Solved a problem today', icon: '📅' },
      'speed_demon': { name: 'Speed Demon', description: 'Solved a problem in under 30 seconds', icon: '⚡' },
      'perfectionist': { name: 'Perfectionist', description: '90% success rate with 10+ attempts', icon: '💎' }
    };
  }

  /**
   * Get comprehensive progress dashboard data
   */
  async getProgressDashboard(sessionId) {
    try {
      const [
        overallProgress,
        skillMastery,
        recentActivity,
        achievements,
        streakInfo,
        weeklyProgress
      ] = await Promise.all([
        this.getOverallProgress(sessionId),
        this.getSkillMastery(sessionId),
        this.getRecentActivity(sessionId),
        this.getAchievements(sessionId),
        this.getStreakInfo(sessionId),
        this.getWeeklyProgress(sessionId)
      ]);

      return {
        success: true,
        data: {
          overallProgress,
          skillMastery,
          recentActivity,
          achievements,
          streakInfo,
          weeklyProgress,
          nextGoals: this.generateNextGoals(skillMastery, overallProgress)
        }
      };
    } catch (error) {
      console.error('Error generating progress dashboard:', error);
      return {
        success: false,
        error: 'Failed to generate progress dashboard'
      };
    }
  }

  /**
   * Get overall progress statistics
   */
  async getOverallProgress(sessionId) {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_problems_available,
        COUNT(DISTINCT CASE WHEN upp.status = 'completed' THEN p.id END) as problems_completed,
        COUNT(DISTINCT CASE WHEN upp.problem_id IS NOT NULL THEN p.id END) as problems_attempted,
        ROUND(AVG(CASE WHEN upp.status = 'completed' THEN upp.best_execution_time_ms END), 0) as avg_solve_time,
        COUNT(CASE WHEN upp.status = 'completed' AND DATE(upp.completed_at) = CURRENT_DATE THEN 1 END) as solved_today,
        COUNT(CASE WHEN upp.status = 'completed' AND DATE(upp.completed_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as solved_this_week,
        ROUND(
          COUNT(DISTINCT CASE WHEN upp.status = 'completed' THEN p.id END) * 100.0 / 
          COUNT(DISTINCT p.id), 1
        ) as completion_percentage,
        ROUND(
          COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN upp.total_attempts > 0 THEN 1 END), 0), 1
        ) as success_rate
      FROM problems p
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true
    `;

    const result = await pool.query(query, [sessionId]);
    const progress = result.rows[0];

    // Calculate skill level based on completion
    progress.skill_level = this.calculateSkillLevel(progress);
    progress.next_milestone = this.getNextMilestone(progress.problems_completed);

    return progress;
  }

  /**
   * Get detailed skill mastery breakdown
   */
  async getSkillMastery(sessionId) {
    const query = `
      SELECT 
        c.name as category,
        c.description as category_description,
        COUNT(p.id) as total_problems,
        COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) as completed_problems,
        COUNT(CASE WHEN p.difficulty = 'easy' THEN 1 END) as easy_total,
        COUNT(CASE WHEN p.difficulty = 'easy' AND upp.status = 'completed' THEN 1 END) as easy_completed,
        COUNT(CASE WHEN p.difficulty = 'medium' THEN 1 END) as medium_total,
        COUNT(CASE WHEN p.difficulty = 'medium' AND upp.status = 'completed' THEN 1 END) as medium_completed,
        COUNT(CASE WHEN p.difficulty = 'hard' THEN 1 END) as hard_total,
        COUNT(CASE WHEN p.difficulty = 'hard' AND upp.status = 'completed' THEN 1 END) as hard_completed,
        ROUND(AVG(CASE WHEN upp.status = 'completed' THEN upp.best_execution_time_ms END), 0) as avg_solve_time,
        MIN(CASE WHEN upp.status = 'completed' THEN upp.completed_at END) as first_completion,
        MAX(CASE WHEN upp.status = 'completed' THEN upp.completed_at END) as latest_completion
      FROM categories c
      JOIN problems p ON c.id = p.category_id
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name
    `;

    const result = await pool.query(query, [sessionId]);
    
    return result.rows.map(row => {
      const mastery_percentage = row.total_problems > 0 
        ? Math.round((row.completed_problems / row.total_problems) * 100)
        : 0;

      return {
        ...row,
        mastery_percentage,
        mastery_level: this.getMasteryLevel(mastery_percentage),
        difficulty_breakdown: {
          easy: {
            completed: parseInt(row.easy_completed) || 0,
            total: parseInt(row.easy_total) || 0,
            percentage: row.easy_total > 0 ? Math.round((row.easy_completed / row.easy_total) * 100) : 0
          },
          medium: {
            completed: parseInt(row.medium_completed) || 0,
            total: parseInt(row.medium_total) || 0,
            percentage: row.medium_total > 0 ? Math.round((row.medium_completed / row.medium_total) * 100) : 0
          },
          hard: {
            completed: parseInt(row.hard_completed) || 0,
            total: parseInt(row.hard_total) || 0,
            percentage: row.hard_total > 0 ? Math.round((row.hard_completed / row.hard_total) * 100) : 0
          }
        }
      };
    });
  }

  /**
   * Get recent activity timeline
   */
  async getRecentActivity(sessionId) {
    const query = `
      SELECT 
        p.numeric_id,
        p.title,
        p.difficulty,
        c.name as category,
        upp.status,
        upp.total_attempts,
        upp.best_execution_time_ms,
        upp.completed_at,
        upp.last_attempt_at,
        DATE(upp.last_attempt_at) as activity_date
      FROM user_problem_progress upp
      JOIN problems p ON upp.problem_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE upp.session_id = $1
        AND upp.last_attempt_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY upp.last_attempt_at DESC
      LIMIT 20
    `;

    const result = await pool.query(query, [sessionId]);
    
    // Group by date for timeline view
    const timeline = {};
    result.rows.forEach(activity => {
      const date = activity.activity_date;
      if (!timeline[date]) {
        timeline[date] = [];
      }
      timeline[date].push(activity);
    });

    return {
      recent_activities: result.rows,
      timeline,
      total_active_days: Object.keys(timeline).length
    };
  }

  /**
   * Get user achievements
   */
  async getAchievements(sessionId) {
    const progress = await this.getOverallProgress(sessionId);
    const earned = [];
    const available = [];

    // Check each achievement
    for (const [key, achievement] of Object.entries(this.achievements)) {
      const result = await this.checkAchievement(key, sessionId, progress);
      
      if (result && result.earned_at) {
        earned.push({ ...achievement, key, earned_at: result.earned_at });
      } else {
        available.push({ ...achievement, key, progress: result?.progress || 0 });
      }
    }

    return {
      earned,
      available: available.slice(0, 5), // Show next 5 achievements
      total_earned: earned.length,
      total_available: Object.keys(this.achievements).length
    };
  }

  /**
   * Get streak information
   */
  async getStreakInfo(sessionId) {

    const query = `
      WITH daily_solves AS (
        SELECT DISTINCT DATE(completed_at) as solve_date
        FROM user_problem_progress
        WHERE session_id = $1 AND status = 'completed' AND completed_at IS NOT NULL
        ORDER BY solve_date DESC
      ),
      streak_calc AS (
        SELECT 
          solve_date,
          solve_date - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY solve_date DESC) - 1) as streak_group
        FROM daily_solves
      )
      SELECT 
        COUNT(*) as current_streak,
        MIN(solve_date) as streak_start,
        MAX(solve_date) as streak_end
      FROM streak_calc
      WHERE streak_group = (
        SELECT streak_group 
        FROM streak_calc 
        ORDER BY solve_date DESC 
        LIMIT 1
      )
    `;

    const result = await pool.query(query, [sessionId]);
    const streak = result.rows[0] || { current_streak: 0 };

    // Get longest streak
    const longestQuery = `
      SELECT MAX(streak_length) as longest_streak
      FROM (
        SELECT COUNT(*) as streak_length
        FROM (
          SELECT 
            DATE(completed_at) as solve_date,
            DATE(completed_at) - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY DATE(completed_at)) - 1) as streak_group
          FROM user_problem_progress
          WHERE session_id = $1 AND status = 'completed' AND completed_at IS NOT NULL
        ) grouped
        GROUP BY streak_group
      ) streaks
    `;

    const longestResult = await pool.query(longestQuery, [sessionId]);
    streak.longest_streak = longestResult.rows[0]?.longest_streak || 0;

    return streak;
  }

  /**
   * Get weekly progress chart data
   */
  async getWeeklyProgress(sessionId) {
    const query = `
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as problems_solved,
        ROUND(AVG(best_execution_time_ms), 0) as avg_time
      FROM user_problem_progress
      WHERE session_id = $1 
        AND status = 'completed'
        AND completed_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(completed_at)
      ORDER BY date
    `;

    const result = await pool.query(query, [sessionId]);
    
    // Fill in missing dates with 0 values
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = result.rows.find(row => row.date === dateStr);
      last30Days.push({
        date: dateStr,
        problems_solved: dayData ? parseInt(dayData.problems_solved) : 0,
        avg_time: dayData ? parseInt(dayData.avg_time) : 0
      });
    }

    return last30Days;
  }

  /**
   * Calculate skill level based on progress
   */
  calculateSkillLevel(progress) {
    const completed = progress.problems_completed || 0;
    const successRate = progress.success_rate || 0;

    if (completed >= 50 && successRate >= 80) return 'Expert';
    if (completed >= 25 && successRate >= 70) return 'Advanced';
    if (completed >= 10 && successRate >= 60) return 'Intermediate';
    if (completed >= 5) return 'Beginner';
    return 'Newcomer';
  }

  /**
   * Get mastery level for a category
   */
  getMasteryLevel(percentage) {
    if (percentage >= 90) return 'Master';
    if (percentage >= 70) return 'Proficient';
    if (percentage >= 50) return 'Developing';
    if (percentage >= 25) return 'Learning';
    return 'Beginner';
  }

  /**
   * Get next milestone
   */
  getNextMilestone(completed) {
    const milestones = [5, 10, 25, 50, 70];
    return milestones.find(m => m > completed) || null;
  }

  /**
   * Check if user has earned an achievement
   */
  async checkAchievement(achievementKey, sessionId, progress) {
    switch (achievementKey) {
      case 'first_solve':
        return progress.problems_completed >= 1 ? { earned_at: new Date() } : false;
      
      case 'streak_3':
        return progress.problems_completed >= 3 ? { earned_at: new Date() } : false;
      
      case 'streak_10':
        return progress.problems_completed >= 10 ? { earned_at: new Date() } : false;
      
      case 'streak_25':
        return progress.problems_completed >= 25 ? { earned_at: new Date() } : false;
      
      case 'streak_50':
        return progress.problems_completed >= 50 ? { earned_at: new Date() } : false;
      
      case 'daily_solver':
        return progress.solved_today >= 1 ? { earned_at: new Date() } : false;
      
      case 'speed_demon':
        return progress.avg_solve_time && progress.avg_solve_time <= 30000 ? { earned_at: new Date() } : false;
      
      case 'perfectionist':
        return progress.success_rate >= 90 && progress.problems_attempted >= 10 ? { earned_at: new Date() } : false;
      
      default:
        return false;
    }
  }

  /**
   * Generate next learning goals
   */
  generateNextGoals(skillMastery, overallProgress) {
    const goals = [];

    // Find categories that need improvement
    skillMastery.forEach(category => {
      if (category.mastery_percentage < 70) {
        goals.push({
          type: 'category_mastery',
          category: category.category,
          current: category.completed_problems,
          target: category.total_problems,
          description: `Complete ${category.total_problems - category.completed_problems} more ${category.category} problems`
        });
      }
    });

    // Overall completion goal
    if (overallProgress.completion_percentage < 50) {
      goals.push({
        type: 'overall_progress',
        current: overallProgress.problems_completed,
        target: overallProgress.next_milestone,
        description: `Reach ${overallProgress.next_milestone} problems solved`
      });
    }

    return goals.slice(0, 3);
  }
}

module.exports = new ProgressAnalyticsService();