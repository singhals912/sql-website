const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class ExplanationService {
  constructor() {
    // Common SQL concepts with detailed explanations
    this.conceptExplanations = {
      'SELECT': {
        title: 'SELECT Statement',
        description: 'Retrieves data from one or more tables',
        examples: [
          {
            code: 'SELECT name, age FROM users;',
            explanation: 'Select specific columns from a table'
          },
          {
            code: 'SELECT * FROM users WHERE age > 18;',
            explanation: 'Select all columns with a condition'
          }
        ],
        tips: [
          'Use specific column names instead of * for better performance',
          'Always consider adding WHERE clauses to limit results'
        ]
      },
      'JOIN': {
        title: 'JOIN Operations',
        description: 'Combine rows from two or more tables based on a related column',
        examples: [
          {
            code: 'SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id;',
            explanation: 'Inner join returns only matching rows from both tables'
          },
          {
            code: 'SELECT u.name, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id;',
            explanation: 'Left join returns all users, even if they have no orders'
          }
        ],
        tips: [
          'Use table aliases (u, o) to make queries more readable',
          'Always specify the join condition with ON clause',
          'LEFT JOIN includes all rows from left table, INNER JOIN only matching rows'
        ]
      },
      'GROUP BY': {
        title: 'GROUP BY Clause',
        description: 'Groups rows that have the same values in specified columns',
        examples: [
          {
            code: 'SELECT department, COUNT(*) FROM employees GROUP BY department;',
            explanation: 'Count employees by department'
          },
          {
            code: 'SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 100;',
            explanation: 'Average price by category, only for categories with avg > 100'
          }
        ],
        tips: [
          'All non-aggregate columns in SELECT must be in GROUP BY',
          'Use HAVING for conditions on aggregated data',
          'Use WHERE for conditions on individual rows before grouping'
        ]
      },
      'WHERE': {
        title: 'WHERE Clause',
        description: 'Filters rows based on specified conditions',
        examples: [
          {
            code: 'SELECT * FROM products WHERE price BETWEEN 10 AND 50;',
            explanation: 'Products with price in a range'
          },
          {
            code: 'SELECT * FROM users WHERE name LIKE \'John%\' AND age >= 25;',
            explanation: 'Users whose name starts with "John" and age is 25 or more'
          }
        ],
        tips: [
          'Use LIKE for pattern matching with % (any characters) and _ (single character)',
          'Combine conditions with AND, OR, and use parentheses for complex logic',
          'Use IN for multiple values: WHERE id IN (1, 2, 3)'
        ]
      }
    };

    // Problem difficulty guidelines
    this.difficultyGuides = {
      'easy': {
        description: 'Basic SQL operations and simple queries',
        concepts: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT'],
        approach: 'Focus on understanding basic SQL syntax and simple data retrieval'
      },
      'medium': {
        description: 'Multiple table operations and aggregate functions',
        concepts: ['JOIN', 'GROUP BY', 'HAVING', 'Aggregate Functions', 'Subqueries'],
        approach: 'Practice combining tables and using functions to analyze data'
      },
      'hard': {
        description: 'Complex queries with advanced SQL features',
        concepts: ['Window Functions', 'Complex JOINs', 'CTEs', 'Advanced Subqueries'],
        approach: 'Master advanced SQL concepts and optimize query performance'
      }
    };
  }

  // Get enhanced explanation for a problem
  async getEnhancedExplanation(problemId) {
    try {
      // Get problem details (simplified to work with existing schema)
      const problemResult = await pool.query(`
        SELECT 
          p.*,
          c.name as category_name
        FROM problems p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1 OR p.numeric_id = $1
      `, [problemId]);

      if (problemResult.rows.length === 0) {
        throw new Error('Problem not found');
      }

      const problem = problemResult.rows[0];

      // Analyze the problem and generate enhanced explanations
      const enhancement = await this.generateEnhancement(problem);

      return {
        problem: {
          id: problem.id,
          numeric_id: problem.numeric_id,
          title: problem.title,
          difficulty: problem.difficulty,
          category: problem.category_name,
          description: problem.description
        },
        enhancement
      };

    } catch (error) {
      console.error('Error getting enhanced explanation:', error);
      throw error;
    }
  }

  // Generate enhanced explanations based on problem analysis
  async generateEnhancement(problem) {
    const enhancement = {
      conceptsUsed: [],
      stepByStep: [],
      alternativeSolutions: [],
      commonMistakes: [],
      practiceExercises: [],
      difficultyGuide: this.difficultyGuides[problem.difficulty?.toLowerCase()] || this.difficultyGuides['medium'],
      performanceTips: []
    };

    // Analyze problem description to identify likely concepts
    enhancement.conceptsUsed = this.identifyConceptsFromDescription(problem.description || '');

    // Generate step-by-step breakdown
    enhancement.stepByStep = this.generateStepByStepSolution(problem);

    // Generate alternative approaches
    enhancement.alternativeSolutions = this.generateAlternativeSolutions(problem);

    // Common mistakes for this type of problem
    enhancement.commonMistakes = this.getCommonMistakes(problem);

    // Practice exercises
    enhancement.practiceExercises = this.generatePracticeExercises(problem);

    // Performance tips
    enhancement.performanceTips = this.getPerformanceTips(problem);

    return enhancement;
  }

  // Identify SQL concepts from problem description
  identifyConceptsFromDescription(description) {
    const concepts = [];
    const lowerDesc = description.toLowerCase();

    // Check for different SQL concepts based on description keywords
    if (lowerDesc.includes('select') || lowerDesc.includes('find') || lowerDesc.includes('get')) {
      concepts.push('SELECT');
    }
    
    if (lowerDesc.includes('join') || lowerDesc.includes('combine') || lowerDesc.includes('relate')) {
      concepts.push('JOIN');
    }
    
    if (lowerDesc.includes('group') || lowerDesc.includes('count') || lowerDesc.includes('sum') || 
        lowerDesc.includes('average') || lowerDesc.includes('total')) {
      concepts.push('GROUP BY');
      concepts.push('Aggregate Functions');
    }
    
    if (lowerDesc.includes('where') || lowerDesc.includes('condition') || lowerDesc.includes('filter')) {
      concepts.push('WHERE');
    }
    
    if (lowerDesc.includes('order') || lowerDesc.includes('sort') || lowerDesc.includes('arrange')) {
      concepts.push('ORDER BY');
    }

    // Add default SELECT if no concepts identified
    if (concepts.length === 0) {
      concepts.push('SELECT');
    }

    return concepts.map(concept => ({
      name: concept,
      explanation: this.conceptExplanations[concept] || {
        title: concept,
        description: `Learn more about ${concept} in SQL documentation`
      }
    }));
  }

  // Identify SQL concepts used in a query
  identifyConceptsInQuery(query) {
    const concepts = [];
    const upperQuery = query.toUpperCase();

    // Check for different SQL concepts
    if (upperQuery.includes('SELECT')) concepts.push('SELECT');
    if (upperQuery.includes('JOIN')) concepts.push('JOIN');
    if (upperQuery.includes('GROUP BY')) concepts.push('GROUP BY');
    if (upperQuery.includes('WHERE')) concepts.push('WHERE');
    if (upperQuery.includes('HAVING')) concepts.push('HAVING');
    if (upperQuery.includes('ORDER BY')) concepts.push('ORDER BY');
    if (upperQuery.includes('LIMIT')) concepts.push('LIMIT');
    if (upperQuery.includes('UNION')) concepts.push('UNION');
    if (upperQuery.includes('CASE')) concepts.push('CASE WHEN');
    if (upperQuery.includes('WITH')) concepts.push('CTE');
    if (upperQuery.includes('OVER')) concepts.push('Window Functions');
    if (/COUNT|SUM|AVG|MIN|MAX/.test(upperQuery)) concepts.push('Aggregate Functions');
    if (upperQuery.includes('EXISTS') || /\(\s*SELECT/.test(upperQuery)) concepts.push('Subqueries');

    return concepts.map(concept => ({
      name: concept,
      explanation: this.conceptExplanations[concept] || {
        title: concept,
        description: `Learn more about ${concept} in SQL documentation`
      }
    }));
  }

  // Generate step-by-step solution breakdown
  generateStepByStepSolution(problem) {
    const steps = [];

    // Analyze problem description to generate logical steps
    const description = problem.description?.toLowerCase() || '';

    if (description.includes('find') || description.includes('select') || description.includes('get')) {
      steps.push({
        step: 1,
        title: 'Understand the Requirements',
        description: 'Identify what data needs to be retrieved and from which tables.',
        example: 'Look for keywords like "find all", "get customers", "list orders"'
      });
    }

    if (description.includes('join') || description.includes('combine') || description.includes('with')) {
      steps.push({
        step: steps.length + 1,
        title: 'Identify Table Relationships',
        description: 'Determine which tables need to be joined and how they relate.',
        example: 'Look for foreign key relationships between tables'
      });
    }

    if (description.includes('where') || description.includes('condition') || description.includes('filter')) {
      steps.push({
        step: steps.length + 1,
        title: 'Apply Filtering Conditions',
        description: 'Add WHERE clause to filter rows based on requirements.',
        example: 'Use AND/OR to combine multiple conditions'
      });
    }

    if (description.includes('group') || description.includes('count') || description.includes('sum') || description.includes('average')) {
      steps.push({
        step: steps.length + 1,
        title: 'Group and Aggregate Data',
        description: 'Use GROUP BY and aggregate functions to summarize data.',
        example: 'GROUP BY category, COUNT(*) for counting by category'
      });
    }

    if (description.includes('order') || description.includes('sort') || description.includes('highest') || description.includes('lowest')) {
      steps.push({
        step: steps.length + 1,
        title: 'Sort the Results',
        description: 'Add ORDER BY clause to sort results as required.',
        example: 'ORDER BY column_name DESC for descending order'
      });
    }

    // Add default steps if none were generated
    if (steps.length === 0) {
      steps.push(
        {
          step: 1,
          title: 'Analyze the Problem',
          description: 'Read the problem description carefully and identify the required output.',
          example: 'What columns do you need? Which tables contain this data?'
        },
        {
          step: 2,
          title: 'Write the Basic Query',
          description: 'Start with a simple SELECT statement from the main table.',
          example: 'SELECT column1, column2 FROM main_table;'
        },
        {
          step: 3,
          title: 'Add Conditions and Joins',
          description: 'Enhance the query with WHERE clauses and JOIN operations as needed.',
          example: 'Add WHERE conditions and JOIN other tables if required'
        }
      );
    }

    return steps;
  }

  // Generate alternative solution approaches
  generateAlternativeSolutions(problem) {
    const alternatives = [];

    // This could be enhanced with actual alternative queries
    // For now, provide conceptual alternatives
    if (problem.difficulty === 'medium' || problem.difficulty === 'hard') {
      alternatives.push({
        approach: 'Subquery Approach',
        description: 'Use subqueries instead of JOINs for better readability',
        pros: ['More readable', 'Easier to debug step by step'],
        cons: ['May be less efficient', 'Can be slower on large datasets']
      });

      alternatives.push({
        approach: 'JOIN Approach',
        description: 'Use JOINs to combine data from multiple tables',
        pros: ['Usually more efficient', 'Better performance'],
        cons: ['More complex syntax', 'Harder to debug']
      });
    }

    if (problem.difficulty === 'hard') {
      alternatives.push({
        approach: 'Window Functions',
        description: 'Use window functions for advanced analytics',
        pros: ['Very powerful', 'Can handle complex calculations'],
        cons: ['Advanced syntax', 'Not supported in all databases']
      });
    }

    return alternatives;
  }

  // Get common mistakes for problem type
  getCommonMistakes(problem) {
    const mistakes = [
      {
        mistake: 'Forgetting WHERE clauses',
        description: 'Not filtering data when required, leading to too many results',
        solution: 'Always check if the problem asks for specific conditions'
      },
      {
        mistake: 'Incorrect JOIN conditions',
        description: 'Using wrong columns in ON clause, causing incorrect results',
        solution: 'Verify the relationship between tables before joining'
      }
    ];

    if (problem.difficulty === 'medium' || problem.difficulty === 'hard') {
      mistakes.push({
        mistake: 'Missing GROUP BY columns',
        description: 'Not including all non-aggregate columns in GROUP BY clause',
        solution: 'Every column in SELECT (except aggregates) must be in GROUP BY'
      });
    }

    return mistakes;
  }

  // Generate practice exercises
  generatePracticeExercises(problem) {
    return [
      {
        title: 'Simplify the Problem',
        description: 'Start with a simpler version of this problem',
        task: 'Remove some conditions or requirements and solve step by step'
      },
      {
        title: 'Extend the Solution',
        description: 'Add more complexity to your solution',
        task: 'Add additional filtering, sorting, or grouping to the basic solution'
      },
      {
        title: 'Test with Different Data',
        description: 'Verify your solution works with various data scenarios',
        task: 'Think about edge cases: empty results, null values, duplicates'
      }
    ];
  }

  // Get performance tips
  getPerformanceTips(problem) {
    const tips = [
      {
        tip: 'Use specific column names',
        description: 'Avoid SELECT * when you only need specific columns',
        impact: 'Reduces network traffic and memory usage'
      },
      {
        tip: 'Add appropriate indexes',
        description: 'Index columns used in WHERE and JOIN conditions',
        impact: 'Dramatically improves query speed'
      }
    ];

    if (problem.difficulty === 'medium' || problem.difficulty === 'hard') {
      tips.push({
        tip: 'Optimize JOIN order',
        description: 'Join smaller tables first to reduce intermediate result size',
        impact: 'Reduces memory usage and execution time'
      });
    }

    return tips;
  }

  // Get learning resources for concepts
  getLearningResources(concepts) {
    return concepts.map(concept => ({
      concept: concept.name,
      resources: [
        {
          type: 'Documentation',
          title: `${concept.name} Documentation`,
          url: `https://www.postgresql.org/docs/current/sql-${concept.name.toLowerCase().replace(' ', '-')}.html`
        },
        {
          type: 'Tutorial',
          title: `Interactive ${concept.name} Tutorial`,
          description: 'Practice with hands-on examples'
        }
      ]
    }));
  }
}

module.exports = new ExplanationService();