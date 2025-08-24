/**
 * Educational Feedback Service
 * Transforms technical SQL errors into learning opportunities with helpful guidance
 */

class EducationalFeedbackService {
  constructor() {
    // Common SQL error patterns and their educational explanations
    this.errorPatterns = [
      {
        pattern: /syntax error at or near "(.+)"/i,
        type: 'syntax_error',
        generateMessage: (match, originalError) => ({
          title: 'Syntax Error Found',
          explanation: `There's a syntax issue near "${match[1]}". This usually means a missing comma, parenthesis, or keyword.`,
          suggestions: [
            'Check for missing commas between column names',
            'Ensure all parentheses are properly closed',
            'Verify that SQL keywords are spelled correctly'
          ],
          example: 'Example: SELECT name, age FROM users (note the comma between columns)',
          learnMore: 'SQL syntax requires precise punctuation and keyword placement.'
        })
      },
      {
        pattern: /column "(.+)" must appear in the GROUP BY clause/i,
        type: 'group_by_error',
        generateMessage: (match, originalError) => ({
          title: 'GROUP BY Rule Violation',
          explanation: `When using GROUP BY, every column in SELECT (except aggregates) must be in the GROUP BY clause. Column "${match[1]}" is missing.`,
          suggestions: [
            `Add "${match[1]}" to your GROUP BY clause`,
            'Only aggregate functions (COUNT, SUM, etc.) can be used without GROUP BY',
            'Consider if you really need to group by this column'
          ],
          example: 'SELECT department, COUNT(*) FROM employees GROUP BY department',
          learnMore: 'GROUP BY determines how rows are combined for aggregate calculations.'
        })
      },
      {
        pattern: /relation "(.+)" does not exist/i,
        type: 'table_not_found',
        generateMessage: (match, originalError) => ({
          title: 'Table Not Found',
          explanation: `The table "${match[1]}" doesn't exist in the current database or isn't accessible.`,
          suggestions: [
            'Check the spelling of the table name',
            'Tables are case-sensitive in some databases',
            'Make sure the table exists in the current schema',
            'Review the problem description for the correct table names'
          ],
          example: 'Common tables might be: users, orders, products, etc.',
          learnMore: 'Table names must match exactly as they exist in the database.'
        })
      },
      {
        pattern: /column "(.+)" does not exist/i,
        type: 'column_not_found',
        generateMessage: (match, originalError) => ({
          title: 'Column Not Found',
          explanation: `The column "${match[1]}" doesn't exist in the tables you're querying.`,
          suggestions: [
            'Check the spelling of the column name',
            'Verify the column exists in the table you\'re selecting from',
            'Use table.column format if there\'s ambiguity',
            'Review the table schema in the problem description'
          ],
          example: 'SELECT users.name, orders.total FROM users JOIN orders...',
          learnMore: 'Column names must match exactly as defined in the table schema.'
        })
      },
      {
        pattern: /syntax error at end of input/i,
        type: 'incomplete_query',
        generateMessage: (match, originalError) => ({
          title: 'Incomplete Query',
          explanation: 'Your SQL query appears to be incomplete. The database expected more content.',
          suggestions: [
            'Check if you ended the query with a semicolon',
            'Make sure all clauses are complete (SELECT, FROM, WHERE, etc.)',
            'Verify that all parentheses and quotes are properly closed'
          ],
          example: 'Complete query: SELECT * FROM table_name WHERE condition;',
          learnMore: 'SQL queries need to be syntactically complete before execution.'
        })
      },
      {
        pattern: /aggregate functions are not allowed in WHERE/i,
        type: 'aggregate_in_where',
        generateMessage: (match, originalError) => ({
          title: 'Aggregate Function Misplacement',
          explanation: 'Aggregate functions (COUNT, SUM, AVG, etc.) cannot be used in WHERE clauses.',
          suggestions: [
            'Use HAVING clause instead of WHERE for aggregate conditions',
            'Move aggregate functions to SELECT or HAVING clauses',
            'Filter individual rows with WHERE, then aggregate with GROUP BY and HAVING'
          ],
          example: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5',
          learnMore: 'WHERE filters individual rows; HAVING filters grouped results.'
        })
      },
      {
        pattern: /ambiguous column name "(.+)"/i,
        type: 'ambiguous_column',
        generateMessage: (match, originalError) => ({
          title: 'Ambiguous Column Reference',
          explanation: `Column "${match[1]}" exists in multiple tables, making the reference unclear.`,
          suggestions: [
            `Use table prefixes: table1.${match[1]} or table2.${match[1]}`,
            'Give tables aliases for shorter references: SELECT u.name FROM users u',
            'Be specific about which table\'s column you want'
          ],
          example: 'SELECT users.id, orders.id FROM users JOIN orders ON users.id = orders.user_id',
          learnMore: 'Always specify the table when column names might be ambiguous.'
        })
      },
      {
        pattern: /division by zero/i,
        type: 'division_by_zero',
        generateMessage: (match, originalError) => ({
          title: 'Division by Zero Error',
          explanation: 'Your calculation attempted to divide by zero, which is undefined.',
          suggestions: [
            'Add a WHERE clause to exclude rows where the divisor is zero',
            'Use CASE statement to handle zero values: CASE WHEN divisor = 0 THEN NULL ELSE dividend/divisor END',
            'Use NULLIF function: dividend / NULLIF(divisor, 0)'
          ],
          example: 'SELECT revenue / NULLIF(cost, 0) as profit_margin FROM sales',
          learnMore: 'Always handle edge cases like zero or null values in calculations.'
        })
      }
    ];

    // Performance and best practice suggestions
    this.performanceTips = {
      'SELECT *': 'Consider selecting only the columns you need instead of using SELECT *',
      'no_index_hint': 'Large queries might benefit from proper indexing on filtered columns',
      'cartesian_product': 'Make sure your JOINs have proper ON conditions to avoid unintended combinations'
    };
  }

  /**
   * Transform a technical SQL error into educational feedback
   */
  generateEducationalFeedback(sqlError, userQuery, problemContext = null) {
    if (!sqlError || typeof sqlError !== 'string') {
      return this.getGenericFeedback();
    }

    // Try to match the error to known patterns
    for (const pattern of this.errorPatterns) {
      const match = sqlError.match(pattern.pattern);
      if (match) {
        const feedback = pattern.generateMessage(match, sqlError);
        return {
          type: pattern.type,
          isEducational: true,
          ...feedback,
          originalError: sqlError,
          context: this.getContextualSuggestions(pattern.type, problemContext)
        };
      }
    }

    // If no pattern matches, provide generic helpful feedback
    return this.getGenericFeedback(sqlError, userQuery);
  }

  /**
   * Get generic helpful feedback for unrecognized errors
   */
  getGenericFeedback(sqlError = '', userQuery = '') {
    return {
      type: 'general_error',
      isEducational: true,
      title: 'SQL Execution Error',
      explanation: 'Your query encountered an error. Let\'s figure out what went wrong!',
      suggestions: [
        'Check your SQL syntax carefully',
        'Verify table and column names are spelled correctly',
        'Make sure you\'re using the right SQL keywords',
        'Try breaking down complex queries into smaller parts'
      ],
      example: 'Basic query structure: SELECT columns FROM table WHERE condition',
      learnMore: 'SQL errors are learning opportunities - each one teaches you something new!',
      originalError: sqlError,
      debuggingTips: this.getDebuggingTips(userQuery)
    };
  }

  /**
   * Get contextual suggestions based on error type and problem context
   */
  getContextualSuggestions(errorType, problemContext) {
    if (!problemContext) return [];

    const suggestions = [];

    switch (errorType) {
      case 'group_by_error':
        if (problemContext.category === 'Aggregation') {
          suggestions.push('This is an aggregation problem - focus on what you\'re counting or summing');
          suggestions.push('Remember: GROUP BY groups rows, then aggregates calculate values for each group');
        }
        break;

      case 'table_not_found':
        suggestions.push('Review the problem description for the exact table names provided');
        if (problemContext.setup_sql) {
          suggestions.push('Check the setup SQL to see which tables are created');
        }
        break;

      case 'syntax_error':
        if (problemContext.difficulty === 'hard') {
          suggestions.push('Hard problems often require complex queries - build them step by step');
        }
        break;
    }

    return suggestions;
  }

  /**
   * Get debugging tips based on the user's query
   */
  getDebuggingTips(userQuery) {
    if (!userQuery) return [];

    const tips = [];
    const upperQuery = userQuery.toUpperCase();

    // Analyze common issues in the query
    if (upperQuery.includes('SELECT *')) {
      tips.push('Consider selecting specific columns instead of SELECT * for better practice');
    }

    if (upperQuery.includes('GROUP BY') && !upperQuery.includes('HAVING')) {
      tips.push('If you need to filter grouped results, use HAVING instead of WHERE');
    }

    if (upperQuery.includes('JOIN') && !upperQuery.includes(' ON ')) {
      tips.push('Make sure your JOINs have ON conditions to specify how tables relate');
    }

    if (!upperQuery.includes('WHERE') && upperQuery.includes('SELECT')) {
      tips.push('Consider if you need a WHERE clause to filter your results');
    }

    return tips;
  }

  /**
   * Generate success feedback with learning insights
   */
  generateSuccessFeedback(executionTime, isCorrect, problemContext, userQuery) {
    const feedback = {
      isEducational: true,
      type: 'success'
    };

    if (isCorrect) {
      feedback.title = '🎉 Correct Solution!';
      feedback.explanation = 'Your query produced the expected output. Great work!';
      
      // Performance feedback
      if (executionTime < 100) {
        feedback.performance = 'Excellent execution time! Your query is very efficient.';
      } else if (executionTime < 1000) {
        feedback.performance = 'Good execution time. Your query runs efficiently.';
      } else {
        feedback.performance = 'Query executed successfully. For large datasets, consider optimization techniques.';
      }

      // Learning insights
      feedback.insights = this.generateLearningInsights(userQuery, problemContext);
      
    } else {
      feedback.title = 'Query Executed Successfully';
      feedback.explanation = 'Your query ran without errors, but the output doesn\'t match the expected result.';
      feedback.suggestions = [
        'Compare your output with the expected result carefully',
        'Check if you\'re missing any filters or conditions',
        'Verify that your GROUP BY and ORDER BY clauses are correct',
        'Make sure you\'re calculating the right metrics'
      ];
    }

    return feedback;
  }

  /**
   * Generate learning insights from a successful query
   */
  generateLearningInsights(userQuery, problemContext) {
    const insights = [];
    const upperQuery = userQuery.toUpperCase();

    // Identify SQL concepts used
    const conceptsUsed = [];
    
    if (upperQuery.includes('GROUP BY')) conceptsUsed.push('Data Aggregation');
    if (upperQuery.includes('JOIN')) conceptsUsed.push('Table Joins');
    if (upperQuery.includes('CASE WHEN')) conceptsUsed.push('Conditional Logic');
    if (upperQuery.includes('ROW_NUMBER') || upperQuery.includes('RANK')) conceptsUsed.push('Window Functions');
    if (upperQuery.includes('EXISTS') || upperQuery.includes(' IN (')) conceptsUsed.push('Subqueries');

    if (conceptsUsed.length > 0) {
      insights.push(`You successfully used: ${conceptsUsed.join(', ')}`);
    }

    // Problem-specific insights
    if (problemContext) {
      if (problemContext.difficulty === 'hard') {
        insights.push('You tackled a challenging problem - your SQL skills are advancing!');
      }
      
      if (problemContext.category === 'Advanced Topics') {
        insights.push('Advanced problems like this prepare you for real-world data analysis');
      }
    }

    return insights;
  }

  /**
   * Get suggestion for next steps after solving a problem
   */
  getNextStepsSuggestion(problemContext, userPerformance) {
    const suggestions = [];

    if (problemContext.difficulty === 'easy' && userPerformance.success_rate > 80) {
      suggestions.push('You\'re ready for medium difficulty problems in this category!');
    }

    if (problemContext.category === 'Basic Queries' && userPerformance.category_mastery > 70) {
      suggestions.push('Try Aggregation problems next to learn GROUP BY and aggregate functions');
    }

    if (problemContext.category === 'Aggregation' && userPerformance.category_mastery > 70) {
      suggestions.push('Level up with Joins to learn how to combine data from multiple tables');
    }

    return suggestions;
  }
}

module.exports = new EducationalFeedbackService();