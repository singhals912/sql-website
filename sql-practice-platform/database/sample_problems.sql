-- Original 5 problems only

-- Problem 1: Select All Customers
INSERT INTO problems (id, title, slug, description, difficulty, category_id, tags, is_premium, is_active, acceptance_rate, total_submissions, total_accepted, created_at, updated_at) VALUES 
('8cab939c-6250-4d3b-a1a4-29737e64552c', 'Select All Customers', 'select-all-customers', '**Problem Statement:**

Write a SQL query to select all columns from the `customers` table.

**Table Schema:**
```sql
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);
```

**Expected Output:**
Return all rows and columns from the customers table.', 'easy', NULL, '{}', false, true, 0, 0, 0, '2025-08-10 20:10:19.57183+00', '2025-08-10 20:10:19.57183+00');

-- Problem 2: Find US Customers
INSERT INTO problems (id, title, slug, description, difficulty, category_id, tags, is_premium, is_active, acceptance_rate, total_submissions, total_accepted, created_at, updated_at) VALUES 
('deb72c12-6ea3-4dd5-abec-9498841c5b7c', 'Find US Customers', 'find-us-customers', '**Problem Statement:**

Write a SQL query to find all customers who are located in the USA.

**Expected Output:**
Return all columns for customers where country = ''USA''.', 'easy', NULL, '{}', false, true, 0, 0, 0, '2025-08-10 20:10:19.581851+00', '2025-08-10 20:10:19.581851+00');

-- Problem 3: Count Orders by Customer
INSERT INTO problems (id, title, slug, description, difficulty, category_id, tags, is_premium, is_active, acceptance_rate, total_submissions, total_accepted, created_at, updated_at) VALUES 
('4295fa58-b0a9-44b4-9a27-a3100843bcb1', 'Count Orders by Customer', 'count-orders-by-customer', '**Problem Statement:**

Write a SQL query to count the number of orders for each customer.

**Expected Output:**
Return customer_id and the count of their orders, ordered by customer_id.', 'medium', NULL, '{}', false, true, 0, 0, 0, '2025-08-10 20:10:19.584382+00', '2025-08-10 20:10:19.584382+00');

-- Problem 4: Customer Order Details
INSERT INTO problems (id, title, slug, description, difficulty, category_id, tags, is_premium, is_active, acceptance_rate, total_submissions, total_accepted, created_at, updated_at) VALUES 
('665b6953-4cd3-431d-a57c-ebd9072937e7', 'Customer Order Details', 'customer-order-details', '**Problem Statement:**

Write a SQL query to get customer details along with their order information.

**Expected Output:**
Return first_name, last_name, order_id, order_date, and total_amount for all orders.', 'medium', NULL, '{}', false, true, 0, 0, 0, '2025-08-10 20:10:19.586526+00', '2025-08-10 20:10:19.586526+00');

-- Problem 5: Rank Orders by Amount
INSERT INTO problems (id, title, slug, description, difficulty, category_id, tags, is_premium, is_active, acceptance_rate, total_submissions, total_accepted, created_at, updated_at) VALUES 
('7fe09131-2b69-439f-80a1-6e2a2cfbfad2', 'Rank Orders by Amount', 'rank-orders-by-amount', '**Problem Statement:**

Write a SQL query to rank orders by their total amount within each customer, with the highest amount getting rank 1.

**Expected Output:**
Return order_id, customer_id, total_amount, and rank ordered by customer_id, then by rank.', 'hard', NULL, '{}', false, true, 0, 0, 0, '2025-08-10 20:10:19.588172+00', '2025-08-10 20:10:19.588172+00');

-- Problem schemas for the 5 problems
INSERT INTO problem_schemas (id, problem_id, sql_dialect, setup_sql, expected_output, solution_sql, explanation, time_limit, memory_limit) VALUES 
(uuid_generate_v4(), '8cab939c-6250-4d3b-a1a4-29737e64552c', 'postgresql', 'CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);

INSERT INTO customers VALUES
(1, ''John'', ''Doe'', ''john@email.com'', ''New York'', ''USA''),
(2, ''Jane'', ''Smith'', ''jane@email.com'', ''London'', ''UK''),
(3, ''Bob'', ''Johnson'', ''bob@email.com'', ''Toronto'', ''Canada'');', '[{"city": "New York", "email": "john@email.com", "country": "USA", "last_name": "Doe", "first_name": "John", "customer_id": 1}, {"city": "London", "email": "jane@email.com", "country": "UK", "last_name": "Smith", "first_name": "Jane", "customer_id": 2}, {"city": "Toronto", "email": "bob@email.com", "country": "Canada", "last_name": "Johnson", "first_name": "Bob", "customer_id": 3}]', 'SELECT * FROM customers;', 'This query selects all columns from the customers table.', 30, 128),

(uuid_generate_v4(), 'deb72c12-6ea3-4dd5-abec-9498841c5b7c', 'postgresql', 'CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    country VARCHAR(50)
);

INSERT INTO customers VALUES
(1, ''John'', ''Doe'', ''john@email.com'', ''New York'', ''USA''),
(2, ''Jane'', ''Smith'', ''jane@email.com'', ''London'', ''UK''),
(3, ''Bob'', ''Johnson'', ''bob@email.com'', ''Los Angeles'', ''USA''),
(4, ''Alice'', ''Brown'', ''alice@email.com'', ''Paris'', ''France'');', '[{"city": "New York", "email": "john@email.com", "country": "USA", "last_name": "Doe", "first_name": "John", "customer_id": 1}, {"city": "Los Angeles", "email": "bob@email.com", "country": "USA", "last_name": "Johnson", "first_name": "Bob", "customer_id": 3}]', 'SELECT * FROM customers WHERE country = ''USA'';', 'This query filters customers by country to find only USA customers.', 30, 128),

(uuid_generate_v4(), '4295fa58-b0a9-44b4-9a27-a3100843bcb1', 'postgresql', 'CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

INSERT INTO orders VALUES
(1, 101, ''2023-01-15'', 250.00),
(2, 102, ''2023-01-16'', 180.50),
(3, 101, ''2023-01-20'', 320.75),
(4, 103, ''2023-01-22'', 95.25),
(5, 101, ''2023-01-25'', 440.00),
(6, 102, ''2023-01-28'', 200.30);', '[{"customer_id": 101, "order_count": 3}, {"customer_id": 102, "order_count": 2}, {"customer_id": 103, "order_count": 1}]', 'SELECT customer_id, COUNT(*) as order_count FROM orders GROUP BY customer_id ORDER BY customer_id;', 'This query groups orders by customer and counts them.', 30, 128),

(uuid_generate_v4(), '665b6953-4cd3-431d-a57c-ebd9072937e7', 'postgresql', 'CREATE TABLE customers (
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
(101, ''John'', ''Doe'', ''john@email.com''),
(102, ''Jane'', ''Smith'', ''jane@email.com''),
(103, ''Bob'', ''Johnson'', ''bob@email.com'');

INSERT INTO orders VALUES
(1, 101, ''2023-01-15'', 250.00),
(2, 102, ''2023-01-16'', 180.50),
(3, 101, ''2023-01-20'', 320.75);', '[["John", "Doe", 1, "2023-01-15", "250.00"], ["Jane", "Smith", 2, "2023-01-16", "180.50"], ["John", "Doe", 3, "2023-01-20", "320.75"]]', 'SELECT c.first_name, c.last_name, o.order_id, o.order_date, o.total_amount FROM customers c INNER JOIN orders o ON c.customer_id = o.customer_id;', 'This query joins customers and orders tables to show customer details with order information.', 30, 128),

(uuid_generate_v4(), '7fe09131-2b69-439f-80a1-6e2a2cfbfad2', 'postgresql', 'CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

INSERT INTO orders VALUES
(1, 101, ''2023-01-15'', 250.00),
(2, 101, ''2023-01-20'', 320.75),
(3, 101, ''2023-01-25'', 180.50),
(4, 102, ''2023-01-16'', 400.00),
(5, 102, ''2023-01-22'', 150.25);', '[["2", 101, "320.75", "1"], ["1", 101, "250.00", "2"], ["3", 101, "180.50", "3"], ["4", 102, "400.00", "1"], ["5", 102, "150.25", "2"]]', 'SELECT order_id, customer_id, total_amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total_amount DESC) as rank FROM orders ORDER BY customer_id, rank;', 'This query uses window functions to rank orders by amount within each customer.', 30, 128);