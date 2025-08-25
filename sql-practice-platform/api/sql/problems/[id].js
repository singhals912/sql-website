// Vercel serverless function for individual problem by ID
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { id } = req.query;
    
    if (id === '5') {
      // Return the enhanced Adobe problem with ALL required fields for frontend
      const problem = {
        id: 5,
        numeric_id: 5,
        title: "Adobe Creative Cloud Subscription Analytics",
        description: `Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns and loyalty programs. As a data analyst, you need to analyze customer subscription and purchase data to determine which customers have spent the most money overall.

**Business Context:**
Adobe Creative Cloud offers various subscription plans and additional purchases. The company wants to:
- Identify top-spending customers for premium support
- Create personalized offers for high-value customers  
- Understand customer purchasing patterns
- Calculate customer lifetime value metrics

**Your Task:**
Write a SQL query that analyzes the customer and order data to find customers who have made the highest total purchases. Your query should:

1. Join the customers and orders tables
2. Only include completed orders (status = 'completed')
3. Calculate the total number of orders per customer
4. Calculate the total amount spent per customer
5. Display results ordered by total spending (highest first)
6. Include customer name, order count, and total spent

**Expected Columns:**
- customer_name: The customer's full name
- order_count: Total number of completed orders
- total_spent: Total amount spent across all orders`,
        difficulty: "Easy",
        category_name: "Data Analysis",
        category_slug: "data-analysis",
        slug: "adobe-creative-cloud-subscription-analytics",
        is_active: true
      };

      const transformedSchema = {
        id: 1,
        problem_id: 5,
        schema_name: "ecommerce",
        setup_sql: "CREATE TABLE customers (customer_id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), registration_date DATE); CREATE TABLE orders (order_id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), total_amount DECIMAL(10,2), status VARCHAR(50), order_date DATE);",
        sample_data: "INSERT INTO customers VALUES (1, 'John Smith', 'john.smith@gmail.com', '2023-01-15'), (2, 'Jane Doe', 'jane.doe@company.com', '2023-02-01'), (3, 'Mike Wilson', 'mike.w@design.co', '2023-01-20'), (4, 'Sarah Johnson', 'sarah@freelancer.com', '2023-03-10'); INSERT INTO orders VALUES (1, 1, 199.99, 'completed', '2024-01-05'), (2, 1, 189.99, 'completed', '2024-02-15'), (3, 2, 149.99, 'completed', '2024-01-12'), (4, 2, 199.50, 'completed', '2024-03-08'), (5, 3, 99.99, 'completed', '2024-01-25'), (6, 3, 79.99, 'pending', '2024-03-20'), (7, 4, 249.99, 'completed', '2024-02-10'), (8, 1, 49.99, 'cancelled', '2024-03-01');",
        expected_output: '[{"customer_name":"John Smith","order_count":"2","total_spent":"389.98"},{"customer_name":"Jane Doe","order_count":"2","total_spent":"349.49"}]',
        solution_sql: "SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = 'completed' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;",
        teardown_sql: null,
        created_at: "2024-08-25T00:00:00Z"
      };

      return res.json({
        // Primary structure that frontend expects
        problem: problem,
        schema: transformedSchema,
        schemas: [transformedSchema],
        // Direct fields for compatibility with different frontend expectations
        id: problem.id,
        numeric_id: problem.numeric_id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category_name: problem.category_name
      });
    }
    
    // Return basic problem for other IDs
    if (id === '1') {
      const basicProblem = {
        id: 1,
        numeric_id: 1,
        title: "Employee Salary Analysis",
        description: "Find employees with salary greater than average salary in the company.",
        difficulty: "Easy",
        category_name: "Basic Queries",
        category_slug: "basic-queries",
        slug: "employee-salary-analysis"
      };
      
      return res.json({
        problem: basicProblem,
        schema: null,
        schemas: [],
        id: basicProblem.id,
        numeric_id: basicProblem.numeric_id,
        title: basicProblem.title,
        description: basicProblem.description,
        difficulty: basicProblem.difficulty,
        category_name: basicProblem.category_name
      });
    }
    
    res.status(404).json({ error: 'Problem not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
};