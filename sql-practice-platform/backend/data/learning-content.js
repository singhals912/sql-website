// SQL Learning Content Database
// Comprehensive tutorials and practice exercises for all SQL concepts

const learningContent = {
  // Basic SQL Concepts
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
          explanation: `The SELECT statement is the foundation of SQL queries. It retrieves data from database tables.`,
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
            hint: 'Use SELECT * to get all columns',
            schema: {
              products: {
                columns: [
                  { name: 'product_id', type: 'INTEGER', description: 'Unique product identifier' },
                  { name: 'product_name', type: 'VARCHAR(100)', description: 'Product name' },
                  { name: 'price', type: 'DECIMAL(10,2)', description: 'Product price' },
                  { name: 'category', type: 'VARCHAR(50)', description: 'Product category' },
                  { name: 'in_stock', type: 'BOOLEAN', description: 'Product availability' }
                ],
                sampleData: [
                  { product_id: 1, product_name: 'Laptop', price: 1200.00, category: 'Electronics', in_stock: true },
                  { product_id: 2, product_name: 'Phone', price: 800.00, category: 'Electronics', in_stock: true },
                  { product_id: 3, product_name: 'Book', price: 25.99, category: 'Books', in_stock: false }
                ]
              }
            }
          },
          {
            instruction: 'Select only product_name and price from products',
            expectedQuery: 'SELECT product_name, price FROM products;',
            tables: ['products'],
            hint: 'List the column names separated by commas',
            schema: {
              products: {
                columns: [
                  { name: 'product_id', type: 'INTEGER', description: 'Unique product identifier' },
                  { name: 'product_name', type: 'VARCHAR(100)', description: 'Product name' },
                  { name: 'price', type: 'DECIMAL(10,2)', description: 'Product price' },
                  { name: 'category', type: 'VARCHAR(50)', description: 'Product category' },
                  { name: 'in_stock', type: 'BOOLEAN', description: 'Product availability' }
                ],
                sampleData: [
                  { product_id: 1, product_name: 'Laptop', price: 1200.00, category: 'Electronics', in_stock: true },
                  { product_id: 2, product_name: 'Phone', price: 800.00, category: 'Electronics', in_stock: true },
                  { product_id: 3, product_name: 'Book', price: 25.99, category: 'Books', in_stock: false }
                ]
              }
            }
          }
        ]
      },
      {
        id: 'where-clause',
        title: 'WHERE Clause Filtering',
        theory: {
          explanation: `The WHERE clause filters rows based on specified conditions.`,
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
            hint: 'Use the > operator to compare prices',
            schema: {
              products: {
                columns: [
                  { name: 'product_id', type: 'INTEGER', description: 'Unique product identifier' },
                  { name: 'product_name', type: 'VARCHAR(100)', description: 'Product name' },
                  { name: 'price', type: 'DECIMAL(10,2)', description: 'Product price' },
                  { name: 'category', type: 'VARCHAR(50)', description: 'Product category' },
                  { name: 'in_stock', type: 'BOOLEAN', description: 'Product availability' }
                ],
                sampleData: [
                  { product_id: 1, product_name: 'Laptop', price: 1200.00, category: 'Electronics', in_stock: true },
                  { product_id: 2, product_name: 'Phone', price: 800.00, category: 'Electronics', in_stock: true },
                  { product_id: 3, product_name: 'Book', price: 25.99, category: 'Books', in_stock: false }
                ]
              }
            }
          }
        ]
      },
      {
        id: 'order-by',
        title: 'ORDER BY Sorting',
        theory: {
          explanation: `ORDER BY sorts query results in ascending or descending order.`,
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
          },
          {
            title: 'Sort by multiple columns',
            query: 'SELECT * FROM employees ORDER BY department, salary DESC;',
            explanation: 'Groups by department, then sorts salary within each department'
          }
        ],
        practice: [
          {
            instruction: 'Sort products by price in ascending order',
            expectedQuery: 'SELECT * FROM products ORDER BY price ASC;',
            tables: ['products'],
            hint: 'Use ORDER BY with ASC (or leave it off since ASC is default)',
            schema: {
              products: {
                columns: [
                  { name: 'product_id', type: 'INTEGER', description: 'Unique product identifier' },
                  { name: 'product_name', type: 'VARCHAR(100)', description: 'Product name' },
                  { name: 'price', type: 'DECIMAL(10,2)', description: 'Product price' },
                  { name: 'category', type: 'VARCHAR(50)', description: 'Product category' },
                  { name: 'in_stock', type: 'BOOLEAN', description: 'Product availability' }
                ],
                sampleData: [
                  { product_id: 1, product_name: 'Laptop', price: 1200.00, category: 'Electronics', in_stock: true },
                  { product_id: 2, product_name: 'Phone', price: 800.00, category: 'Electronics', in_stock: true },
                  { product_id: 3, product_name: 'Book', price: 25.99, category: 'Books', in_stock: false }
                ]
              }
            }
          }
        ]
      }
    ]
  },

  // Aggregation Functions
  'aggregation': {
    id: 'aggregation',
    title: 'Aggregation Functions',
    description: 'Master COUNT, SUM, AVG, MIN, MAX and GROUP BY operations',
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    prerequisites: ['basic-queries'],
    concepts: [
      {
        id: 'basic-aggregates',
        title: 'Basic Aggregate Functions',
        theory: {
          explanation: `Aggregate functions perform calculations on sets of rows and return single values.`,
          syntax: 'SELECT aggregate_function(column) FROM table;',
          keyPoints: [
            'COUNT() counts rows',
            'SUM() adds numeric values', 
            'AVG() calculates average',
            'MIN()/MAX() find minimum/maximum values',
            'Aggregate functions ignore NULL values (except COUNT(*))'
          ]
        },
        examples: [
          {
            title: 'Count all employees',
            query: 'SELECT COUNT(*) FROM employees;',
            explanation: 'Returns the total number of employees'
          },
          {
            title: 'Calculate average salary',
            query: 'SELECT AVG(salary) FROM employees;',
            explanation: 'Returns the average salary across all employees'
          },
          {
            title: 'Find salary range',
            query: 'SELECT MIN(salary), MAX(salary) FROM employees;',
            explanation: 'Returns the lowest and highest salaries'
          }
        ],
        practice: [
          {
            instruction: 'Count the total number of products',
            expectedQuery: 'SELECT COUNT(*) FROM products;',
            tables: ['products'],
            hint: 'Use COUNT(*) to count all rows'
          },
          {
            instruction: 'Find the average product price',
            expectedQuery: 'SELECT AVG(price) FROM products;',
            tables: ['products'],
            hint: 'Use AVG() function on the price column'
          }
        ]
      },
      {
        id: 'group-by',
        title: 'GROUP BY Clause',
        theory: {
          explanation: `GROUP BY groups rows with the same values and allows aggregate functions to operate on each group.`,
          syntax: 'SELECT column, aggregate_function(column) FROM table GROUP BY column;',
          keyPoints: [
            'Groups rows by specified columns',
            'Must include non-aggregate columns in GROUP BY',
            'Creates one row per unique group',
            'Often used with aggregate functions'
          ]
        },
        examples: [
          {
            title: 'Count employees by department',
            query: 'SELECT department, COUNT(*) FROM employees GROUP BY department;',
            explanation: 'Shows how many employees are in each department'
          },
          {
            title: 'Average salary by department',
            query: 'SELECT department, AVG(salary) FROM employees GROUP BY department;',
            explanation: 'Calculates average salary for each department'
          }
        ],
        practice: [
          {
            instruction: 'Count products by category',
            expectedQuery: 'SELECT category, COUNT(*) FROM products GROUP BY category;',
            tables: ['products'],
            hint: 'Group by category and count the rows in each group'
          }
        ]
      },
      {
        id: 'having-clause',
        title: 'HAVING Clause',
        theory: {
          explanation: `HAVING filters groups created by GROUP BY, similar to how WHERE filters individual rows.`,
          syntax: 'SELECT columns FROM table GROUP BY column HAVING condition;',
          keyPoints: [
            'HAVING works on grouped data',
            'WHERE works on individual rows before grouping',
            'Can use aggregate functions in HAVING conditions',
            'Applied after GROUP BY'
          ]
        },
        examples: [
          {
            title: 'Departments with more than 5 employees',
            query: 'SELECT department, COUNT(*) FROM employees GROUP BY department HAVING COUNT(*) > 5;',
            explanation: 'Shows only departments that have more than 5 employees'
          }
        ],
        practice: [
          {
            instruction: 'Find categories with average price > 50',
            expectedQuery: 'SELECT category, AVG(price) FROM products GROUP BY category HAVING AVG(price) > 50;',
            tables: ['products'],
            hint: 'Use HAVING with AVG(price) > 50'
          }
        ]
      }
    ]
  },

  // Joins
  'joins': {
    id: 'joins',
    title: 'SQL Joins',
    description: 'Connect data across multiple tables with INNER, LEFT, RIGHT, and FULL joins',
    difficulty: 'intermediate',
    estimatedTime: '75 minutes',
    prerequisites: ['basic-queries'],
    concepts: [
      {
        id: 'inner-join',
        title: 'INNER JOIN',
        theory: {
          explanation: `INNER JOIN returns only rows that have matching values in both tables.`,
          syntax: 'SELECT columns FROM table1 INNER JOIN table2 ON table1.column = table2.column;',
          keyPoints: [
            'Only returns matching rows from both tables',
            'Most restrictive type of join',
            'NULL values are excluded',
            'Order of tables usually doesn\'t matter for results'
          ]
        },
        examples: [
          {
            title: 'Join employees with departments',
            query: `SELECT e.first_name, e.last_name, d.department_name 
                     FROM employees e 
                     INNER JOIN departments d ON e.department_id = d.department_id;`,
            explanation: 'Shows employee names with their department names'
          }
        ],
        practice: [
          {
            instruction: 'Join orders with customers to show customer names',
            expectedQuery: 'SELECT o.order_id, c.customer_name FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;',
            tables: ['orders', 'customers'],
            hint: 'Use INNER JOIN and match the customer_id columns'
          }
        ]
      },
      {
        id: 'left-join',
        title: 'LEFT JOIN',
        theory: {
          explanation: `LEFT JOIN returns all rows from the left table and matching rows from the right table.`,
          syntax: 'SELECT columns FROM table1 LEFT JOIN table2 ON table1.column = table2.column;',
          keyPoints: [
            'All rows from left table are included',
            'Non-matching rows from right table show as NULL',
            'Useful for finding records that may not have matches',
            'More inclusive than INNER JOIN'
          ]
        },
        examples: [
          {
            title: 'All employees with their departments',
            query: `SELECT e.first_name, e.last_name, d.department_name 
                     FROM employees e 
                     LEFT JOIN departments d ON e.department_id = d.department_id;`,
            explanation: 'Shows all employees, even those without assigned departments'
          }
        ],
        practice: [
          {
            instruction: 'Show all customers and their orders (if any)',
            expectedQuery: 'SELECT c.customer_name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;',
            tables: ['customers', 'orders'],
            hint: 'LEFT JOIN keeps all customers, even those without orders'
          }
        ]
      }
    ]
  },

  // Subqueries
  'subqueries': {
    id: 'subqueries',
    title: 'Subqueries',
    description: 'Learn nested queries, correlated subqueries, and EXISTS operations',
    difficulty: 'intermediate',
    estimatedTime: '50 minutes',
    prerequisites: ['basic-queries', 'aggregation'],
    concepts: [
      {
        id: 'basic-subqueries',
        title: 'Basic Subqueries',
        theory: {
          explanation: `A subquery is a query nested inside another query, used to provide data for the main query.`,
          syntax: 'SELECT columns FROM table WHERE column operator (SELECT column FROM table WHERE condition);',
          keyPoints: [
            'Subqueries are enclosed in parentheses',
            'Can be used in SELECT, WHERE, FROM, and HAVING clauses',
            'Inner query executes first',
            'Must return appropriate data type for comparison'
          ]
        },
        examples: [
          {
            title: 'Employees earning above average',
            query: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
            explanation: 'Finds employees whose salary is above the company average'
          }
        ],
        practice: [
          {
            instruction: 'Find products more expensive than the average price',
            expectedQuery: 'SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);',
            tables: ['products'],
            hint: 'Use a subquery to calculate the average price'
          }
        ]
      },
      {
        id: 'exists-subqueries',
        title: 'EXISTS and NOT EXISTS',
        theory: {
          explanation: `EXISTS checks if a subquery returns any rows, returning TRUE or FALSE.`,
          syntax: 'SELECT columns FROM table WHERE EXISTS (SELECT 1 FROM table2 WHERE condition);',
          keyPoints: [
            'EXISTS returns TRUE if subquery has results',
            'NOT EXISTS returns TRUE if subquery has no results',
            'More efficient than IN for large datasets',
            'Often used with correlated subqueries'
          ]
        },
        examples: [
          {
            title: 'Customers who have placed orders',
            query: 'SELECT * FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);',
            explanation: 'Shows customers who have at least one order'
          }
        ],
        practice: [
          {
            instruction: 'Find categories that have products',
            expectedQuery: 'SELECT * FROM categories c WHERE EXISTS (SELECT 1 FROM products p WHERE p.category_id = c.category_id);',
            tables: ['categories', 'products'],
            hint: 'Use EXISTS to check if products exist for each category'
          }
        ]
      }
    ]
  },

  // Window Functions
  'window-functions': {
    id: 'window-functions',
    title: 'Window Functions',
    description: 'Advanced analytics with ROW_NUMBER, RANK, DENSE_RANK, and aggregate window functions',
    difficulty: 'advanced',
    estimatedTime: '90 minutes',
    prerequisites: ['basic-queries', 'aggregation', 'joins'],
    concepts: [
      {
        id: 'ranking-functions',
        title: 'Ranking Window Functions',
        theory: {
          explanation: `Window functions perform calculations across related rows without collapsing the result set.`,
          syntax: 'SELECT column, window_function() OVER (PARTITION BY column ORDER BY column) FROM table;',
          keyPoints: [
            'ROW_NUMBER() assigns unique sequential numbers',
            'RANK() assigns ranks with gaps for ties',
            'DENSE_RANK() assigns ranks without gaps',
            'PARTITION BY divides data into groups'
          ]
        },
        examples: [
          {
            title: 'Rank employees by salary within department',
            query: `SELECT first_name, last_name, department, salary,
                     RANK() OVER (PARTITION BY department ORDER BY salary DESC) as salary_rank
                     FROM employees;`,
            explanation: 'Ranks employees by salary within their department'
          }
        ],
        practice: [
          {
            instruction: 'Number products by price within each category',
            expectedQuery: 'SELECT product_name, category, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as price_rank FROM products;',
            tables: ['products'],
            hint: 'Use ROW_NUMBER() with PARTITION BY category and ORDER BY price DESC'
          }
        ]
      },
      {
        id: 'aggregate-windows',
        title: 'Aggregate Window Functions',
        theory: {
          explanation: `Aggregate functions can be used as window functions to perform running calculations.`,
          syntax: 'SELECT column, SUM(column) OVER (ORDER BY column ROWS BETWEEN ... AND ...) FROM table;',
          keyPoints: [
            'Running totals with SUM() OVER',
            'Moving averages with AVG() OVER',
            'ROWS BETWEEN defines the window frame',
            'UNBOUNDED PRECEDING/FOLLOWING for unlimited range'
          ]
        },
        examples: [
          {
            title: 'Running total of sales',
            query: `SELECT order_date, amount,
                     SUM(amount) OVER (ORDER BY order_date) as running_total
                     FROM sales;`,
            explanation: 'Calculates cumulative sales over time'
          }
        ],
        practice: [
          {
            instruction: 'Calculate running average of product prices',
            expectedQuery: 'SELECT product_name, price, AVG(price) OVER (ORDER BY product_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_avg FROM products;',
            tables: ['products'],
            hint: 'Use AVG() OVER with proper window frame'
          }
        ]
      }
    ]
  },

  // Advanced Topics
  'advanced-topics': {
    id: 'advanced-topics',
    title: 'Advanced SQL Topics',
    description: 'CTEs, recursive queries, pivot operations, and performance optimization',
    difficulty: 'advanced',
    estimatedTime: '120 minutes',
    prerequisites: ['basic-queries', 'aggregation', 'joins', 'subqueries', 'window-functions'],
    concepts: [
      {
        id: 'ctes',
        title: 'Common Table Expressions (CTEs)',
        theory: {
          explanation: `CTEs provide a way to write more readable queries by creating temporary named result sets.`,
          syntax: 'WITH cte_name AS (SELECT ...) SELECT ... FROM cte_name;',
          keyPoints: [
            'CTEs improve query readability',
            'Can be referenced multiple times',
            'Exist only for the duration of the query',
            'Can be recursive for hierarchical data'
          ]
        },
        examples: [
          {
            title: 'Department summary with CTE',
            query: `WITH dept_stats AS (
                       SELECT department, AVG(salary) as avg_salary, COUNT(*) as emp_count
                       FROM employees GROUP BY department
                     )
                     SELECT * FROM dept_stats WHERE avg_salary > 60000;`,
            explanation: 'Creates a temporary result set and filters it'
          }
        ],
        practice: [
          {
            instruction: 'Use CTE to find high-value customers',
            expectedQuery: 'WITH customer_totals AS (SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id) SELECT c.customer_name, ct.total FROM customers c JOIN customer_totals ct ON c.customer_id = ct.customer_id WHERE ct.total > 1000;',
            tables: ['customers', 'orders'],
            hint: 'Create a CTE to calculate total orders per customer first'
          }
        ]
      },
      {
        id: 'recursive-ctes',
        title: 'Recursive CTEs',
        theory: {
          explanation: `Recursive CTEs call themselves to traverse hierarchical data structures.`,
          syntax: 'WITH RECURSIVE cte_name AS (base_query UNION ALL recursive_query) SELECT ... FROM cte_name;',
          keyPoints: [
            'Requires RECURSIVE keyword',
            'Has base case and recursive case',
            'Useful for organizational charts, file systems',
            'Must have termination condition'
          ]
        },
        examples: [
          {
            title: 'Employee hierarchy',
            query: `WITH RECURSIVE employee_hierarchy AS (
                       SELECT employee_id, first_name, manager_id, 1 as level
                       FROM employees WHERE manager_id IS NULL
                       UNION ALL
                       SELECT e.employee_id, e.first_name, e.manager_id, eh.level + 1
                       FROM employees e JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
                     )
                     SELECT * FROM employee_hierarchy;`,
            explanation: 'Builds complete organizational hierarchy'
          }
        ],
        practice: [
          {
            instruction: 'Find all category hierarchies',
            expectedQuery: 'WITH RECURSIVE category_tree AS (SELECT category_id, category_name, parent_category_id, 1 as level FROM categories WHERE parent_category_id IS NULL UNION ALL SELECT c.category_id, c.category_name, c.parent_category_id, ct.level + 1 FROM categories c JOIN category_tree ct ON c.parent_category_id = ct.category_id) SELECT * FROM category_tree;',
            tables: ['categories'],
            hint: 'Start with root categories (parent_category_id IS NULL) and recursively join'
          }
        ]
      }
    ]
  },

  // Time Analysis
  'time-analysis': {
    id: 'time-analysis',
    title: 'Time Series Analysis',
    description: 'Date functions, time-based aggregations, and temporal analytics',
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    prerequisites: ['basic-queries', 'aggregation'],
    concepts: [
      {
        id: 'date-functions',
        title: 'Date and Time Functions',
        theory: {
          explanation: `SQL provides various functions to work with dates and times for temporal analysis.`,
          syntax: 'SELECT DATE_FUNCTION(date_column) FROM table;',
          keyPoints: [
            'EXTRACT() gets parts of dates',
            'DATE_TRUNC() truncates to specific intervals',
            'INTERVAL for date arithmetic',
            'Different databases have different functions'
          ]
        },
        examples: [
          {
            title: 'Extract year and month from orders',
            query: "SELECT EXTRACT(YEAR FROM order_date) as year, EXTRACT(MONTH FROM order_date) as month, COUNT(*) FROM orders GROUP BY year, month;",
            explanation: 'Groups orders by year and month'
          }
        ],
        practice: [
          {
            instruction: 'Count sales by day of week',
            expectedQuery: "SELECT EXTRACT(DOW FROM sale_date) as day_of_week, COUNT(*) FROM sales GROUP BY day_of_week ORDER BY day_of_week;",
            tables: ['sales'],
            hint: 'Use EXTRACT(DOW FROM date) to get day of week'
          }
        ]
      }
    ]
  }
};

// Learning path progressions
const learningPaths = {
  'sql-fundamentals': {
    id: 'sql-fundamentals',
    title: 'SQL Fundamentals',
    description: 'Master the basics of SQL querying',
    modules: ['basic-queries', 'aggregation', 'joins'],
    estimatedTime: '3-4 hours'
  },
  'intermediate-sql': {
    id: 'intermediate-sql', 
    title: 'Intermediate SQL',
    description: 'Advanced querying techniques',
    modules: ['subqueries', 'window-functions', 'time-analysis'],
    estimatedTime: '4-5 hours'
  },
  'advanced-sql': {
    id: 'advanced-sql',
    title: 'Advanced SQL',
    description: 'Expert-level SQL concepts',
    modules: ['advanced-topics'],
    estimatedTime: '2-3 hours'
  }
};

module.exports = { learningContent, learningPaths };