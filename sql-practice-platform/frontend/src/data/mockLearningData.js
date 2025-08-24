// Temporary mock data for learning system demonstration
// This will be used until backend is restarted with new learning routes

export const mockLearningModules = [
  {
    id: 'basic-queries',
    title: 'Basic SQL Queries',
    description: 'Learn the fundamentals of SQL with SELECT, WHERE, and ORDER BY',
    difficulty: 'beginner',
    estimatedTime: '45 minutes',
    prerequisites: [],
    conceptCount: 3
  },
  {
    id: 'aggregation',
    title: 'Aggregation Functions',
    description: 'Master COUNT, SUM, AVG, MIN, MAX and GROUP BY operations',
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    prerequisites: ['basic-queries'],
    conceptCount: 3
  },
  {
    id: 'joins',
    title: 'SQL Joins',
    description: 'Connect data across multiple tables with INNER, LEFT, RIGHT, and FULL joins',
    difficulty: 'intermediate',
    estimatedTime: '75 minutes',
    prerequisites: ['basic-queries'],
    conceptCount: 4
  },
  {
    id: 'subqueries',
    title: 'Subqueries',
    description: 'Learn nested queries, correlated subqueries, and EXISTS operations',
    difficulty: 'intermediate',
    estimatedTime: '50 minutes',
    prerequisites: ['basic-queries', 'aggregation'],
    conceptCount: 2
  },
  {
    id: 'window-functions',
    title: 'Window Functions',
    description: 'Advanced analytics with ROW_NUMBER, RANK, DENSE_RANK, and aggregate window functions',
    difficulty: 'advanced',
    estimatedTime: '90 minutes',
    prerequisites: ['basic-queries', 'aggregation', 'joins'],
    conceptCount: 2
  },
  {
    id: 'advanced-topics',
    title: 'Advanced SQL Topics',
    description: 'CTEs, recursive queries, pivot operations, and performance optimization',
    difficulty: 'advanced',
    estimatedTime: '120 minutes',
    prerequisites: ['basic-queries', 'aggregation', 'joins', 'subqueries', 'window-functions'],
    conceptCount: 2
  }
];

export const mockLearningPaths = [
  {
    id: 'sql-fundamentals',
    title: 'SQL Fundamentals',
    description: 'Master the basics of SQL querying',
    modules: ['basic-queries', 'aggregation', 'joins'],
    estimatedTime: '3-4 hours'
  },
  {
    id: 'intermediate-sql',
    title: 'Intermediate SQL',
    description: 'Advanced querying techniques',
    modules: ['subqueries', 'window-functions'],
    estimatedTime: '2-3 hours'
  },
  {
    id: 'advanced-sql',
    title: 'Advanced SQL',
    description: 'Expert-level SQL concepts',
    modules: ['advanced-topics'],
    estimatedTime: '2-3 hours'
  }
];

export const mockUserProgress = {
  userId: 'demo-user',
  completedModules: [],
  currentModule: 'basic-queries',
  currentConcept: 'select-basics',
  totalConceptsCompleted: 0,
  totalConcepts: 16,
  completionPercentage: 0
};

export const mockModuleContent = {
  'basic-queries': {
    id: 'basic-queries',
    title: 'Basic SQL Queries',
    description: 'Learn the fundamentals of SQL with SELECT, WHERE, and ORDER BY',
    difficulty: 'beginner',
    estimatedTime: '45 minutes',
    prerequisites: [],
    concepts: [
      {
        id: 'select-basics',
        title: 'SELECT Statement Basics',
        theory: {
          explanation: 'The SELECT statement is the foundation of SQL queries. It retrieves data from database tables.',
          syntax: 'SELECT column1, column2 FROM table_name;',
          keyPoints: [
            'SELECT specifies which columns to retrieve',
            'FROM specifies which table to query',
            'Use * to select all columns',
            'Column names are case-insensitive'
          ]
        },
        examples: [
          {
            title: 'Select all employees',
            query: 'SELECT * FROM employees;',
            explanation: 'Retrieves all columns and rows from the employees table'
          },
          {
            title: 'Select specific columns',
            query: 'SELECT first_name, last_name, salary FROM employees;',
            explanation: 'Retrieves only the specified columns'
          }
        ],
        practice: [
          {
            instruction: 'Select all products from the products table',
            expectedQuery: 'SELECT * FROM products;',
            tables: ['products'],
            hint: 'Use SELECT * to get all columns'
          },
          {
            instruction: 'Select only product_name and price from products',
            expectedQuery: 'SELECT product_name, price FROM products;',
            tables: ['products'],
            hint: 'List the column names separated by commas'
          }
        ]
      },
      {
        id: 'where-clause',
        title: 'WHERE Clause Filtering',
        theory: {
          explanation: 'The WHERE clause filters rows based on specified conditions.',
          syntax: 'SELECT columns FROM table WHERE condition;',
          keyPoints: [
            'WHERE filters rows that meet specific criteria',
            'Common operators: =, !=, <, >, <=, >=',
            'Use quotes for text values',
            'Combine conditions with AND, OR'
          ]
        },
        examples: [
          {
            title: 'Filter by salary',
            query: 'SELECT * FROM employees WHERE salary > 50000;',
            explanation: 'Shows employees earning more than $50,000'
          },
          {
            title: 'Filter by department',
            query: "SELECT * FROM employees WHERE department = 'Engineering';",
            explanation: 'Shows only engineering department employees'
          }
        ],
        practice: [
          {
            instruction: 'Find products with price greater than 100',
            expectedQuery: 'SELECT * FROM products WHERE price > 100;',
            tables: ['products'],
            hint: 'Use the > operator to compare prices'
          }
        ]
      },
      {
        id: 'order-by',
        title: 'ORDER BY Sorting',
        theory: {
          explanation: 'ORDER BY sorts query results in ascending or descending order.',
          syntax: 'SELECT columns FROM table ORDER BY column [ASC|DESC];',
          keyPoints: [
            'ASC is ascending (default)',
            'DESC is descending', 
            'Can sort by multiple columns',
            'NULL values appear first in ASC, last in DESC'
          ]
        },
        examples: [
          {
            title: 'Sort by salary descending',
            query: 'SELECT * FROM employees ORDER BY salary DESC;',
            explanation: 'Shows employees from highest to lowest salary'
          }
        ],
        practice: [
          {
            instruction: 'Sort products by price in ascending order',
            expectedQuery: 'SELECT * FROM products ORDER BY price ASC;',
            tables: ['products'],
            hint: 'Use ORDER BY with ASC (or leave it off since ASC is default)'
          }
        ]
      }
    ]
  }
};