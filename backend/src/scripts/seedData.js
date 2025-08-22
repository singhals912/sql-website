const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const seedProblems = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding database with sample problems...');

    // Insert sample problems
    const problems = [
      {
        title: 'Select All Customers',
        slug: 'select-all-customers',
        description: `**Problem Statement:**

Write a SQL query to select all columns from the \`customers\` table.

**Table Schema:**
\`\`\`sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);
\`\`\`

**Expected Output:**
Return all rows and columns from the customers table.`,
        difficulty: 'easy',
        category: 'Basic Queries',
        setup_sql: `CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);

INSERT INTO customers VALUES 
(1, 'John', 'Doe', 'john@email.com', 'New York', 'USA'),
(2, 'Jane', 'Smith', 'jane@email.com', 'London', 'UK'),
(3, 'Bob', 'Johnson', 'bob@email.com', 'Toronto', 'Canada');`,
        expected_output: [
          {"customer_id": 1, "first_name": "John", "last_name": "Doe", "email": "john@email.com", "city": "New York", "country": "USA"},
          {"customer_id": 2, "first_name": "Jane", "last_name": "Smith", "email": "jane@email.com", "city": "London", "country": "UK"},
          {"customer_id": 3, "first_name": "Bob", "last_name": "Johnson", "email": "bob@email.com", "city": "Toronto", "country": "Canada"}
        ],
        solution_sql: 'SELECT * FROM customers;'
      },
      {
        title: 'Find US Customers',
        slug: 'find-us-customers',
        description: `**Problem Statement:**

Write a SQL query to find all customers who are located in the USA.

**Expected Output:**
Return all columns for customers where country = 'USA'.`,
        difficulty: 'easy',
        category: 'Basic Queries',
        setup_sql: `CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);

INSERT INTO customers VALUES 
(1, 'John', 'Doe', 'john@email.com', 'New York', 'USA'),
(2, 'Jane', 'Smith', 'jane@email.com', 'London', 'UK'),
(3, 'Bob', 'Johnson', 'bob@email.com', 'Los Angeles', 'USA'),
(4, 'Alice', 'Brown', 'alice@email.com', 'Paris', 'France');`,
        expected_output: [
          {"customer_id": 1, "first_name": "John", "last_name": "Doe", "email": "john@email.com", "city": "New York", "country": "USA"},
          {"customer_id": 3, "first_name": "Bob", "last_name": "Johnson", "email": "bob@email.com", "city": "Los Angeles", "country": "USA"}
        ],
        solution_sql: "SELECT * FROM customers WHERE country = 'USA';"
      },
      {
        title: 'Count Orders by Customer',
        slug: 'count-orders-by-customer',
        description: `**Problem Statement:**

Write a SQL query to count the number of orders for each customer.

**Expected Output:**
Return customer_id and the count of their orders, ordered by customer_id.`,
        difficulty: 'medium',
        category: 'Aggregation',
        setup_sql: `CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

INSERT INTO orders VALUES 
(1, 101, '2023-01-15', 250.00),
(2, 102, '2023-01-16', 180.50),
(3, 101, '2023-01-20', 320.75),
(4, 103, '2023-01-22', 95.25),
(5, 101, '2023-01-25', 440.00),
(6, 102, '2023-01-28', 200.30);`,
        expected_output: [
          {"customer_id": 101, "order_count": 3},
          {"customer_id": 102, "order_count": 2},
          {"customer_id": 103, "order_count": 1}
        ],
        solution_sql: 'SELECT customer_id, COUNT(*) as order_count FROM orders GROUP BY customer_id ORDER BY customer_id;'
      },
      {
        title: 'Customer Order Details',
        slug: 'customer-order-details',
        description: `**Problem Statement:**

Write a SQL query to get customer details along with their order information.

**Expected Output:**
Return first_name, last_name, order_id, order_date, and total_amount for all orders.`,
        difficulty: 'medium',
        category: 'Joins',
        setup_sql: `CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

INSERT INTO customers VALUES 
(101, 'John', 'Doe', 'john@email.com'),
(102, 'Jane', 'Smith', 'jane@email.com'),
(103, 'Bob', 'Johnson', 'bob@email.com');

INSERT INTO orders VALUES 
(1, 101, '2023-01-15', 250.00),
(2, 102, '2023-01-16', 180.50),
(3, 101, '2023-01-20', 320.75);`,
        expected_output: [
          {"first_name": "John", "last_name": "Doe", "order_id": 1, "order_date": "2023-01-15", "total_amount": 250.00},
          {"first_name": "Jane", "last_name": "Smith", "order_id": 2, "order_date": "2023-01-16", "total_amount": 180.50},
          {"first_name": "John", "last_name": "Doe", "order_id": 3, "order_date": "2023-01-20", "total_amount": 320.75}
        ],
        solution_sql: 'SELECT c.first_name, c.last_name, o.order_id, o.order_date, o.total_amount FROM customers c INNER JOIN orders o ON c.customer_id = o.customer_id;'
      },
      {
        title: 'Rank Orders by Amount',
        slug: 'rank-orders-by-amount',
        description: `**Problem Statement:**

Write a SQL query to rank orders by their total amount within each customer, with the highest amount getting rank 1.

**Expected Output:**
Return order_id, customer_id, total_amount, and rank ordered by customer_id, then by rank.`,
        difficulty: 'hard',
        category: 'Window Functions',
        setup_sql: `CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

INSERT INTO orders VALUES 
(1, 101, '2023-01-15', 250.00),
(2, 101, '2023-01-20', 320.75),
(3, 101, '2023-01-25', 180.50),
(4, 102, '2023-01-16', 400.00),
(5, 102, '2023-01-22', 150.25);`,
        expected_output: [
          {"order_id": 2, "customer_id": 101, "total_amount": 320.75, "rank": 1},
          {"order_id": 1, "customer_id": 101, "total_amount": 250.00, "rank": 2},
          {"order_id": 3, "customer_id": 101, "total_amount": 180.50, "rank": 3},
          {"order_id": 4, "customer_id": 102, "total_amount": 400.00, "rank": 1},
          {"order_id": 5, "customer_id": 102, "total_amount": 150.25, "rank": 2}
        ],
        solution_sql: 'SELECT order_id, customer_id, total_amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total_amount DESC) as rank FROM orders ORDER BY customer_id, rank;'
      }
    ];

    // Insert problems
    for (const problem of problems) {
      // Get category ID
      const categoryResult = await client.query(
        'SELECT id FROM categories WHERE name = $1',
        [problem.category]
      );
      
      if (categoryResult.rows.length === 0) {
        console.log(`Category '${problem.category}' not found, skipping problem: ${problem.title}`);
        continue;
      }
      
      const categoryId = categoryResult.rows[0].id;
      
      // Insert problem
      const problemResult = await client.query(`
        INSERT INTO problems (title, slug, description, difficulty, category_id, tags, total_submissions, total_accepted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO UPDATE SET 
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          difficulty = EXCLUDED.difficulty,
          category_id = EXCLUDED.category_id
        RETURNING id
      `, [
        problem.title,
        problem.slug,
        problem.description,
        problem.difficulty,
        categoryId,
        [problem.difficulty, problem.category.toLowerCase()],
        Math.floor(Math.random() * 1000) + 100, // Random submissions
        Math.floor(Math.random() * 700) + 50    // Random accepted
      ]);
      
      const problemId = problemResult.rows[0].id;
      
      // Insert problem schema
      await client.query(`
        INSERT INTO problem_schemas (problem_id, sql_dialect, setup_sql, expected_output, solution_sql, explanation)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (problem_id, sql_dialect) DO UPDATE SET 
          setup_sql = EXCLUDED.setup_sql,
          expected_output = EXCLUDED.expected_output,
          solution_sql = EXCLUDED.solution_sql
      `, [
        problemId,
        'postgresql',
        problem.setup_sql,
        JSON.stringify(problem.expected_output),
        problem.solution_sql,
        'Solution explanation will be added later'
      ]);
      
      console.log(`✅ Seeded problem: ${problem.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    client.release();
    pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  seedProblems();
}

module.exports = { seedProblems };