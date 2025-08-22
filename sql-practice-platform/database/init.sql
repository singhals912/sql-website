-- SQL Practice Platform Database Schema
-- Initialize database with required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table  
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    bio TEXT,
    skill_level VARCHAR(20) DEFAULT 'beginner',
    preferred_sql_dialect VARCHAR(20) DEFAULT 'postgresql',
    avatar_url TEXT,
    location VARCHAR(100),
    website_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    total_accepted INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Problem schemas for different SQL dialects
CREATE TABLE problem_schemas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    sql_dialect VARCHAR(20) NOT NULL CHECK (sql_dialect IN ('postgresql', 'mysql', 'sqlite')),
    setup_sql TEXT NOT NULL,
    expected_output JSONB,
    test_cases JSONB DEFAULT '[]',
    constraints TEXT,
    hints TEXT[] DEFAULT '{}',
    solution_sql TEXT,
    explanation TEXT,
    time_limit INTEGER DEFAULT 30,
    memory_limit INTEGER DEFAULT 128,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(problem_id, sql_dialect)
);

-- User solutions
CREATE TABLE user_solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    sql_dialect VARCHAR(20) NOT NULL,
    solution_sql TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    execution_time_ms INTEGER,
    memory_used_mb DECIMAL(8,2),
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User progress tracking
CREATE TABLE user_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'attempted', 'solved')),
    attempts INTEGER DEFAULT 0,
    best_time_ms INTEGER,
    best_memory_mb DECIMAL(8,2),
    first_solved_at TIMESTAMP WITH TIME ZONE,
    last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, problem_id)
);

-- User statistics
CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    problems_solved INTEGER DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0,
    avg_solve_time_ms INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 0,
    longest_streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    points INTEGER DEFAULT 0,
    ranking INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Discussions
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments on discussions
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User votes on discussions and comments
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('discussion', 'comment')),
    target_id UUID NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id)
);

-- Indexes for performance
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_category ON problems(category_id);
CREATE INDEX idx_problems_created_at ON problems(created_at);
CREATE INDEX idx_user_solutions_user_problem ON user_solutions(user_id, problem_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_discussions_problem ON discussions(problem_id);
CREATE INDEX idx_comments_discussion ON comments(discussion_id);

-- Insert default categories
INSERT INTO categories (name, description, slug, icon, sort_order) VALUES
('Basic Queries', 'Learn fundamental SELECT, WHERE, and basic filtering', 'basic-queries', '📝', 1),
('Joins', 'Master INNER, LEFT, RIGHT, and FULL JOINs', 'joins', '🔗', 2),
('Aggregation', 'GROUP BY, COUNT, SUM, AVG, and aggregate functions', 'aggregation', '📊', 3),
('Subqueries', 'Nested queries and correlated subqueries', 'subqueries', '🔍', 4),
('Window Functions', 'ROW_NUMBER, RANK, LAG, LEAD, and analytics', 'window-functions', '🪟', 5),
('Data Modification', 'INSERT, UPDATE, DELETE operations', 'data-modification', '✏️', 6),
('Advanced Topics', 'CTEs, recursive queries, and optimization', 'advanced-topics', '🚀', 7);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert original 5 problems
INSERT INTO problems (id, title, slug, description, difficulty, category_id, tags, is_premium, is_active, acceptance_rate, total_submissions, total_accepted, created_by, created_at, updated_at) VALUES 
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
Return all rows and columns from the customers table.', 'easy', (SELECT id FROM categories WHERE slug = 'basic-queries'), '{easy,"basic queries"}', false, true, 0.00, 490, 670, NULL, '2025-08-10 20:10:19.57183+00', '2025-08-10 20:10:19.57183+00'),

('deb72c12-6ea3-4dd5-abec-9498841c5b7c', 'Find US Customers', 'find-us-customers', '**Problem Statement:**

Write a SQL query to find all customers who are located in the USA.

**Expected Output:**
Return all columns for customers where country = ''USA''.', 'easy', (SELECT id FROM categories WHERE slug = 'basic-queries'), '{easy,"basic queries"}', false, true, 0.00, 550, 415, NULL, '2025-08-10 20:10:19.581851+00', '2025-08-10 20:10:19.581851+00'),

('4295fa58-b0a9-44b4-9a27-a3100843bcb1', 'Count Orders by Customer', 'count-orders-by-customer', '**Problem Statement:**

Write a SQL query to count the number of orders for each customer.

**Expected Output:**
Return customer_id and the count of their orders, ordered by customer_id.', 'medium', (SELECT id FROM categories WHERE slug = 'aggregation'), '{medium,aggregation}', false, true, 0.00, 1073, 133, NULL, '2025-08-10 20:10:19.584382+00', '2025-08-10 20:10:19.584382+00'),

('665b6953-4cd3-431d-a57c-ebd9072937e7', 'Customer Order Details', 'customer-order-details', '**Problem Statement:**

Write a SQL query to get customer details along with their order information.

**Expected Output:**
Return first_name, last_name, order_id, order_date, and total_amount for all orders.', 'medium', (SELECT id FROM categories WHERE slug = 'joins'), '{medium,joins}', false, true, 0.00, 823, 506, NULL, '2025-08-10 20:10:19.586526+00', '2025-08-10 20:10:19.586526+00'),

('7fe09131-2b69-439f-80a1-6e2a2cfbfad2', 'Rank Orders by Amount', 'rank-orders-by-amount', '**Problem Statement:**

Write a SQL query to rank orders by their total amount within each customer, with the highest amount getting rank 1.

**Expected Output:**
Return order_id, customer_id, total_amount, and rank ordered by customer_id, then by rank.', 'hard', (SELECT id FROM categories WHERE slug = 'window-functions'), '{hard,"window functions"}', false, true, 0.00, 1054, 436, NULL, '2025-08-10 20:10:19.588172+00', '2025-08-10 20:10:19.588172+00');

-- Insert problem schemas for the 5 problems
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
(5, 102, ''2023-01-22'', 150.25);', '[[2, 101, "320.75", "1"], [1, 101, "250.00", "2"], [3, 101, "180.50", "3"], [4, 102, "400.00", "1"], [5, 102, "150.25", "2"]]', 'SELECT order_id, customer_id, total_amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total_amount DESC) as rank FROM orders ORDER BY customer_id, rank;', 'This query uses window functions to rank orders by amount within each customer.', 30, 128);