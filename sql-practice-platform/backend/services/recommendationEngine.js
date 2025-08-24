/**
 * Intelligent Problem Recommendation Engine
 * Provides personalized problem recommendations based on user performance and learning patterns
 */

const pool = require('../config/database');

class RecommendationEngine {
  constructor() {
    // SQL concept mapping for skill tracking
    this.sqlConcepts = {
      'basic-queries': ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT'],
      'aggregation': ['GROUP BY', 'HAVING', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
      'joins': ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'],
      'subqueries': ['EXISTS', 'IN', 'NOT IN', 'ANY', 'ALL'],
      'window-functions': ['ROW_NUMBER', 'RANK', 'LAG', 'LEAD', 'PARTITION BY'],
      'time-analysis': ['DATE_TRUNC', 'EXTRACT', 'DATE_PART', 'INTERVAL'],
      'advanced': ['CTE', 'RECURSIVE', 'CASE WHEN', 'PIVOT']
    };

    // Difficulty progression mapping
    this.difficultyWeights = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };
  }

  /**
   * Get personalized problem recommendations for a user session
   */
  async getRecommendations(sessionId, limit = 5) {
    try {
      const userProfile = await this.getUserProfile(sessionId);
      const conceptMastery = await this.getConceptMastery(sessionId);
      const nextConcepts = this.identifyLearningGaps(conceptMastery);
      
      const recommendations = await this.generateRecommendations(
        userProfile, 
        conceptMastery, 
        nextConcepts, 
        limit
      );

      return {
        success: true,
        data: {
          recommendations,
          userProfile,
          conceptMastery,
          nextLearningGoals: nextConcepts
        }
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        success: false,
        error: 'Failed to generate recommendations'
      };
    }
  }

  /**
   * Analyze user performance and learning patterns
   */
  async getUserProfile(sessionId) {
    const query = `
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_problems,
        COUNT(DISTINCT problem_id) as unique_problems_attempted,
        ROUND(AVG(best_execution_time_ms), 0) as avg_execution_time,
        ROUND(
          COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
          1
        ) as success_rate,
        MIN(first_attempt_at) as first_activity,
        MAX(last_attempt_at) as last_activity,
        COUNT(CASE WHEN DATE(last_attempt_at) = CURRENT_DATE THEN 1 END) as today_attempts
      FROM user_problem_progress 
      WHERE session_id = $1
    `;

    const result = await pool.query(query, [sessionId]);
    const profile = result.rows[0] || {
      total_attempts: 0,
      completed_problems: 0,
      unique_problems_attempted: 0,
      success_rate: 0,
      avg_execution_time: 0,
      today_attempts: 0
    };

    // Determine user skill level
    profile.skill_level = this.determineSkillLevel(profile);
    profile.engagement_level = this.determineEngagementLevel(profile);

    return profile;
  }

  /**
   * Get user mastery level for each SQL concept
   */
  async getConceptMastery(sessionId) {
    const query = `
      SELECT 
        c.name as category,
        p.difficulty,
        COUNT(*) as total_problems,
        COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) as completed_problems,
        ROUND(
          COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 1
        ) as mastery_percentage,
        ROUND(AVG(upp.best_execution_time_ms), 0) as avg_solve_time
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true
      GROUP BY c.name, p.difficulty
      ORDER BY c.name, p.difficulty
    `;

    const result = await pool.query(query, [sessionId]);
    
    // Organize by category with overall mastery score
    const conceptMastery = {};
    result.rows.forEach(row => {
      if (!conceptMastery[row.category]) {
        conceptMastery[row.category] = {
          category: row.category,
          overall_mastery: 0,
          difficulties: {},
          total_completed: 0,
          total_available: 0
        };
      }

      conceptMastery[row.category].difficulties[row.difficulty] = {
        mastery_percentage: parseFloat(row.mastery_percentage) || 0,
        completed_problems: parseInt(row.completed_problems) || 0,
        total_problems: parseInt(row.total_problems) || 0,
        avg_solve_time: parseInt(row.avg_solve_time) || 0
      };

      conceptMastery[row.category].total_completed += parseInt(row.completed_problems) || 0;
      conceptMastery[row.category].total_available += parseInt(row.total_problems) || 0;
    });

    // Calculate overall mastery per category
    Object.keys(conceptMastery).forEach(category => {
      const data = conceptMastery[category];
      data.overall_mastery = data.total_available > 0 
        ? Math.round((data.total_completed / data.total_available) * 100)
        : 0;
    });

    return conceptMastery;
  }

  /**
   * Identify learning gaps and next concepts to focus on
   */
  identifyLearningGaps(conceptMastery) {
    const gaps = [];
    
    // Learning progression path
    const progressionPath = [
      'Basic Queries',
      'Aggregation', 
      'Joins',
      'Window Functions',
      'Subqueries',
      'Time Analysis',
      'Advanced Topics'
    ];

    progressionPath.forEach((concept, index) => {
      const mastery = conceptMastery[concept];
      if (!mastery || mastery.overall_mastery < 70) {
        // Check if prerequisites are met
        const hasPrerequisites = index === 0 || 
          (conceptMastery[progressionPath[index - 1]]?.overall_mastery >= 50);

        if (hasPrerequisites) {
          gaps.push({
            concept,
            current_mastery: mastery?.overall_mastery || 0,
            priority: this.calculatePriority(concept, mastery, index),
            next_difficulty: this.getNextDifficulty(mastery)
          });
        }
      }
    });

    return gaps.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }

  /**
   * Generate personalized problem recommendations
   */
  async generateRecommendations(userProfile, conceptMastery, nextConcepts, limit) {
    const recommendations = [];

    for (const concept of nextConcepts) {
      const problems = await this.getProblemsForConcept(
        concept.concept, 
        concept.next_difficulty,
        userProfile
      );
      
      recommendations.push(...problems);
      if (recommendations.length >= limit) break;
    }

    // If we don't have enough from learning gaps, add variety
    if (recommendations.length < limit) {
      const varietyProblems = await this.getVarietyProblems(
        userProfile, 
        recommendations.map(r => r.id),
        limit - recommendations.length
      );
      recommendations.push(...varietyProblems);
    }

    // Add recommendation reasons and scores
    return recommendations.slice(0, limit).map((problem, index) => ({
      ...problem,
      recommendation_score: Math.max(100 - (index * 10), 10),
      recommendation_reason: this.getRecommendationReason(problem, conceptMastery, userProfile)
    }));
  }

  /**
   * Get problems for a specific concept and difficulty
   */
  async getProblemsForConcept(conceptName, difficulty, userProfile) {
    const query = `
      SELECT 
        p.id,
        p.numeric_id,
        p.title,
        p.difficulty,
        p.description,
        c.name as category,
        CASE WHEN upp.status = 'completed' THEN true ELSE false END as completed,
        upp.total_attempts,
        (SELECT COUNT(*) FROM problem_hints WHERE problem_id = p.id) as hint_count
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true 
        AND c.name = $2
        AND p.difficulty = $3
        AND (upp.status IS NULL OR upp.status != 'completed')
      ORDER BY 
        CASE WHEN upp.total_attempts IS NULL THEN 0 ELSE upp.total_attempts END,
        p.numeric_id
      LIMIT 3
    `;

    const result = await pool.query(query, [userProfile.sessionId || 'temp', conceptName, difficulty]);
    return result.rows;
  }

  /**
   * Get variety problems to fill remaining recommendations
   */
  async getVarietyProblems(userProfile, excludeIds, limit) {
    const excludeClause = excludeIds.length > 0 
      ? `AND p.id NOT IN (${excludeIds.map((_, i) => `$${i + 2}`).join(', ')})`
      : '';

    const query = `
      SELECT 
        p.id,
        p.numeric_id,
        p.title,
        p.difficulty,
        p.description,
        c.name as category,
        CASE WHEN upp.status = 'completed' THEN true ELSE false END as completed,
        upp.total_attempts,
        (SELECT COUNT(*) FROM problem_hints WHERE problem_id = p.id) as hint_count
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true 
        AND (upp.status IS NULL OR upp.status != 'completed')
        ${excludeClause}
      ORDER BY 
        CASE 
          WHEN p.difficulty = 'easy' THEN 1
          WHEN p.difficulty = 'medium' THEN 2
          WHEN p.difficulty = 'hard' THEN 3
        END,
        RANDOM()
      LIMIT $${excludeIds.length + 2}
    `;

    const params = [userProfile.sessionId || 'temp', ...excludeIds, limit];
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Determine user skill level based on performance
   */
  determineSkillLevel(profile) {
    if (profile.completed_problems === 0) return 'beginner';
    if (profile.success_rate >= 80 && profile.completed_problems >= 20) return 'advanced';
    if (profile.success_rate >= 60 && profile.completed_problems >= 10) return 'intermediate';
    return 'beginner';
  }

  /**
   * Determine user engagement level
   */
  determineEngagementLevel(profile) {
    if (profile.today_attempts >= 5) return 'high';
    if (profile.today_attempts >= 2 || profile.total_attempts >= 10) return 'medium';
    return 'low';
  }

  /**
   * Calculate priority score for learning concepts
   */
  calculatePriority(concept, mastery, progressionIndex) {
    const basePriority = 100 - (progressionIndex * 10); // Earlier concepts have higher priority
    const masteryBonus = mastery ? (50 - mastery.overall_mastery) : 50; // Lower mastery = higher priority
    return basePriority + masteryBonus;
  }

  /**
   * Get next difficulty level for a concept
   */
  getNextDifficulty(mastery) {
    if (!mastery) return 'easy';
    
    const { difficulties } = mastery;
    if (!difficulties.easy || difficulties.easy.mastery_percentage < 70) return 'easy';
    if (!difficulties.medium || difficulties.medium.mastery_percentage < 70) return 'medium';
    return 'hard';
  }

  /**
   * Generate human-readable recommendation reason
   */
  getRecommendationReason(problem, conceptMastery, userProfile) {
    const categoryMastery = conceptMastery[problem.category];
    
    if (!categoryMastery || categoryMastery.overall_mastery < 30) {
      return `Perfect for learning ${problem.category} fundamentals`;
    }
    
    if (categoryMastery.overall_mastery < 70) {
      return `Continue building ${problem.category} skills - you're making progress!`;
    }
    
    if (problem.difficulty === 'hard') {
      return `Challenge yourself with this advanced ${problem.category} problem`;
    }
    
    return `Recommended based on your learning path`;
  }

  /**
   * Get daily challenge for user
   */
  async getDailyChallenge(sessionId) {
    // Rotate daily challenge based on date
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    
    const query = `
      SELECT 
        p.id,
        p.numeric_id,
        p.title,
        p.difficulty,
        p.description,
        c.name as category,
        CASE WHEN upp.status = 'completed' THEN true ELSE false END as completed_today
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id 
        AND upp.session_id = $1 
        AND DATE(upp.last_attempt_at) = CURRENT_DATE
      WHERE p.is_active = true
      ORDER BY (p.numeric_id + $2) % 70
      LIMIT 1
    `;

    const result = await pool.query(query, [sessionId, dayOfYear]);
    return result.rows[0] || null;
  }
}

module.exports = new RecommendationEngine();