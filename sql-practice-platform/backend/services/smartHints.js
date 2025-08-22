/**
 * Smart Hint System with Progressive Revelation
 * Provides contextual, progressive hints based on user attempts and performance
 */

const pool = require('../config/database');

class SmartHintsService {
  constructor() {
    this.hintTypes = {
      'conceptual': { order: 1, description: 'High-level approach' },
      'structural': { order: 2, description: 'Query structure guidance' },
      'syntax': { order: 3, description: 'Specific syntax help' },
      'example': { order: 4, description: 'Code example' }
    };

    // Common SQL patterns and their educational hints
    this.sqlPatterns = {
      'aggregation': {
        keywords: ['GROUP BY', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'],
        hints: [
          'Think about grouping your data first - what are you counting or summing?',
          'Use GROUP BY when you want to calculate something for each group',
          'Aggregate functions like COUNT(), SUM(), AVG() work on groups of rows'
        ]
      },
      'joins': {
        keywords: ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN'],
        hints: [
          'Consider which tables contain the data you need',
          'JOIN tables using their relationship columns (usually IDs)',
          'LEFT JOIN keeps all rows from the left table, INNER JOIN only keeps matches'
        ]
      },
      'subqueries': {
        keywords: ['EXISTS', 'IN', 'NOT IN', 'ANY', 'ALL'],
        hints: [
          'A subquery is a query inside another query',
          'Use EXISTS when you want to check if something exists',
          'IN is useful for checking if a value matches any in a list'
        ]
      },
      'window-functions': {
        keywords: ['ROW_NUMBER', 'RANK', 'PARTITION BY', 'OVER'],
        hints: [
          'Window functions perform calculations across related rows',
          'PARTITION BY divides the result set into groups',
          'ORDER BY in window functions determines the ranking/numbering'
        ]
      }
    };
  }

  /**
   * Get progressive hints for a problem based on user attempts
   */
  async getProgressiveHints(problemId, sessionId, userAttempts = 0) {
    try {
      // Get problem context and existing hints
      const problemContext = await this.getProblemContext(problemId);
      const existingHints = await this.getExistingHints(problemId);
      const userProgress = await this.getUserProgress(problemId, sessionId);

      // Determine which hints to show based on attempts
      const availableHints = this.determineAvailableHints(
        existingHints,
        userAttempts,
        userProgress
      );

      // Generate smart contextual hints if needed
      const smartHints = await this.generateSmartHints(problemContext, userProgress);

      return {
        success: true,
        data: {
          hints: availableHints,
          smartHints,
          totalHints: existingHints.length,
          hintsUnlocked: availableHints.length,
          nextHintAt: this.getNextHintThreshold(userAttempts, existingHints.length)
        }
      };
    } catch (error) {
      console.error('Error getting progressive hints:', error);
      return {
        success: false,
        error: 'Failed to get hints'
      };
    }
  }

  /**
   * Get problem context for hint generation
   */
  async getProblemContext(problemId) {
    const query = `
      SELECT 
        p.title,
        p.description,
        p.difficulty,
        c.name as category,
        ps.setup_sql,
        ps.solution_sql
      FROM problems p
      JOIN categories c ON p.category_id = c.id
      JOIN problem_schemas ps ON p.id = ps.problem_id
      WHERE p.id = $1 AND ps.sql_dialect = 'postgresql'
    `;

    const result = await pool.query(query, [problemId]);
    return result.rows[0];
  }

  /**
   * Get existing hints for a problem
   */
  async getExistingHints(problemId) {
    const query = `
      SELECT 
        id,
        hint_order,
        hint_type,
        hint_content,
        reveal_after_attempts,
        sql_concept
      FROM problem_hints
      WHERE problem_id = $1
      ORDER BY hint_order
    `;

    const result = await pool.query(query, [problemId]);
    return result.rows;
  }

  /**
   * Get user progress on this specific problem
   */
  async getUserProgress(problemId, sessionId) {
    const query = `
      SELECT 
        total_attempts,
        correct_attempts,
        status,
        best_execution_time_ms,
        last_attempt_at
      FROM user_problem_progress
      WHERE problem_id = $1 AND session_id = $2
    `;

    const result = await pool.query(query, [problemId, sessionId]);
    return result.rows[0] || { total_attempts: 0, correct_attempts: 0, status: null };
  }

  /**
   * Determine which hints are available based on attempts
   */
  determineAvailableHints(existingHints, userAttempts, userProgress) {
    return existingHints.filter(hint => {
      // Always show hints with reveal_after_attempts = 0
      if (hint.reveal_after_attempts <= userAttempts) {
        return true;
      }
      return false;
    }).map(hint => ({
      ...hint,
      is_unlocked: true,
      unlock_reason: hint.reveal_after_attempts === 0 ? 'immediately' : `after ${hint.reveal_after_attempts} attempts`
    }));
  }

  /**
   * Generate smart contextual hints based on problem context
   */
  async generateSmartHints(problemContext, userProgress) {
    const smartHints = [];

    if (!problemContext) return smartHints;

    // Analyze the solution to understand required concepts
    const requiredConcepts = this.analyzeSQLConcepts(problemContext.solution_sql);

    // Generate hints based on user attempts and concepts
    if (userProgress.total_attempts === 0) {
      smartHints.push({
        type: 'getting_started',
        content: `Start by reading the problem description carefully. This is a ${problemContext.difficulty} level ${problemContext.category} problem.`,
        icon: '💡'
      });
    }

    if (userProgress.total_attempts >= 2 && userProgress.correct_attempts === 0) {
      // User is struggling, provide concept-specific help
      requiredConcepts.forEach(concept => {
        if (this.sqlPatterns[concept]) {
          smartHints.push({
            type: 'concept_help',
            concept: concept,
            content: this.sqlPatterns[concept].hints[0],
            icon: '🎯'
          });
        }
      });
    }

    if (userProgress.total_attempts >= 5 && userProgress.correct_attempts === 0) {
      smartHints.push({
        type: 'structural_hint',
        content: this.generateStructuralHint(problemContext),
        icon: '🏗️'
      });
    }

    return smartHints;
  }

  /**
   * Analyze SQL solution to identify required concepts
   */
  analyzeSQLConcepts(solutionSQL) {
    if (!solutionSQL) return [];

    const concepts = [];
    const upperSQL = solutionSQL.toUpperCase();

    // Check for aggregation
    if (/GROUP\s+BY|COUNT|SUM|AVG|MIN|MAX/.test(upperSQL)) {
      concepts.push('aggregation');
    }

    // Check for joins
    if (/JOIN/.test(upperSQL)) {
      concepts.push('joins');
    }

    // Check for subqueries
    if (/EXISTS|IN\s*\(|NOT\s+IN/.test(upperSQL)) {
      concepts.push('subqueries');
    }

    // Check for window functions
    if (/ROW_NUMBER|RANK|PARTITION\s+BY|OVER\s*\(/.test(upperSQL)) {
      concepts.push('window-functions');
    }

    return concepts;
  }

  /**
   * Generate structural hint based on solution pattern
   */
  generateStructuralHint(problemContext) {
    const solution = problemContext.solution_sql?.toUpperCase() || '';
    
    if (solution.includes('GROUP BY')) {
      return 'Your query needs to group data. Think: SELECT ... FROM ... GROUP BY ...';
    }
    
    if (solution.includes('JOIN')) {
      return 'This problem requires joining tables. Consider which tables have the data you need.';
    }
    
    if (solution.includes('WHERE')) {
      return 'Use WHERE to filter your data before any grouping or aggregation.';
    }
    
    return 'Break down the problem into steps: What data do you need? From which tables? What conditions apply?';
  }

  /**
   * Get when the next hint will be available
   */
  getNextHintThreshold(currentAttempts, totalHints) {
    // Progressive hint revelation: 0, 2, 4, 6+ attempts
    const thresholds = [0, 2, 4, 6];
    
    for (let i = 0; i < Math.min(thresholds.length, totalHints); i++) {
      if (currentAttempts < thresholds[i]) {
        return thresholds[i];
      }
    }
    
    return null; // All hints revealed
  }

  /**
   * Track hint usage for analytics
   */
  async trackHintUsage(hintId, sessionId, problemId) {
    try {
      const query = `
        INSERT INTO user_hint_usage (session_id, problem_id, hint_id, used_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (session_id, hint_id) DO UPDATE SET
        used_at = CURRENT_TIMESTAMP,
        usage_count = user_hint_usage.usage_count + 1
      `;

      await pool.query(query, [sessionId, problemId, hintId]);
      
      return { success: true };
    } catch (error) {
      console.error('Error tracking hint usage:', error);
      return { success: false };
    }
  }

  /**
   * Get hint effectiveness analytics
   */
  async getHintAnalytics(problemId) {
    const query = `
      SELECT 
        h.hint_content,
        h.hint_type,
        h.hint_order,
        COUNT(uhu.hint_id) as usage_count,
        COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) as led_to_success,
        ROUND(
          COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(uhu.hint_id), 0), 1
        ) as success_rate
      FROM problem_hints h
      LEFT JOIN user_hint_usage uhu ON h.id = uhu.hint_id
      LEFT JOIN user_problem_progress upp ON uhu.session_id = upp.session_id 
        AND uhu.problem_id = upp.problem_id 
        AND upp.completed_at > uhu.used_at
      WHERE h.problem_id = $1
      GROUP BY h.id, h.hint_content, h.hint_type, h.hint_order
      ORDER BY h.hint_order
    `;

    const result = await pool.query(query, [problemId]);
    return result.rows;
  }

  /**
   * Generate personalized hint based on user's SQL attempt
   */
  generatePersonalizedHint(userQuery, problemContext) {
    if (!userQuery) return null;

    const upperQuery = userQuery.toUpperCase();
    const hints = [];

    // Check for common mistakes
    if (upperQuery.includes('SELECT *') && problemContext.category !== 'Basic Queries') {
      hints.push({
        type: 'improvement',
        content: 'Try selecting specific columns instead of using SELECT *. What specific data does the problem ask for?',
        icon: '🎯'
      });
    }

    if (upperQuery.includes('GROUP BY') && !upperQuery.includes('HAVING') && 
        problemContext.solution_sql?.toUpperCase().includes('HAVING')) {
      hints.push({
        type: 'missing_clause',
        content: 'You might need HAVING to filter groups after GROUP BY.',
        icon: '🔍'
      });
    }

    if (!upperQuery.includes('JOIN') && problemContext.solution_sql?.toUpperCase().includes('JOIN')) {
      hints.push({
        type: 'missing_concept',
        content: 'This problem likely requires joining multiple tables to get all the needed data.',
        icon: '🔗'
      });
    }

    return hints.length > 0 ? hints[0] : null;
  }
}

module.exports = new SmartHintsService();