# Database Schema Reference

## Available Tables for SQL Practice

### **PostgreSQL Tables:**
- `amazon_prime_subscribers`
- `customers` 
- `disney_subscribers`
- `employees`
- `netflix_shows`
- `solar_installations`

### **MySQL Tables:**
- `customers`
- `disney_subscribers` 
- `employees`
- `netflix_shows`
- `solar_installations`

---

## Table Schemas

### 1. **employees**
```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE
);
```
**Sample Data:** 5 employees from Engineering, Marketing, HR, Sales departments

### 2. **disney_subscribers**
```sql
CREATE TABLE disney_subscribers (
    subscriber_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    subscription_plan VARCHAR(50),     -- Basic, Premium, Family
    monthly_fee DECIMAL(6,2),
    signup_date DATE,
    country VARCHAR(50),               -- USA, Canada, UK, Australia
    device_type VARCHAR(30),           -- Smart TV, Mobile, Tablet, Laptop
    content_hours_watched INTEGER
);
```
**Sample Data:** 5 subscribers with different plans and viewing habits

### 3. **customers**
```sql
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    registration_date DATE,
    total_orders INTEGER,
    total_spent DECIMAL(10,2)
);
```
**Sample Data:** 5 customers from major US cities

### 4. **netflix_shows**
```sql
CREATE TABLE netflix_shows (
    show_id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    genre VARCHAR(100),
    release_year INTEGER,
    rating VARCHAR(10),                -- TV-14, TV-MA
    duration_minutes INTEGER,
    director VARCHAR(100),
    country VARCHAR(100)
);
```
**Sample Data:** 5 popular Netflix shows including Stranger Things, The Crown, etc.

### 5. **solar_installations**
```sql
CREATE TABLE solar_installations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100),
    installation_date DATE,
    system_size_kw DECIMAL(8,2),
    cost DECIMAL(10,2),
    location VARCHAR(100)              -- California, Texas, Florida, Arizona, Nevada
);
```
**Sample Data:** 5 solar installations across different US states

### 6. **amazon_prime_subscribers** (PostgreSQL only)
```sql
CREATE TABLE amazon_prime_subscribers (
    subscriber_id INTEGER PRIMARY KEY,
    region VARCHAR,
    subscription_type VARCHAR,
    monthly_fee NUMERIC,
    signup_date DATE,
    content_hours_watched INTEGER
);
```
**Sample Data:** Amazon Prime subscription data

---

## Sample Queries to Try

### **Basic Queries:**
```sql
-- Get all Disney subscribers
SELECT * FROM disney_subscribers;

-- Get employees by department
SELECT * FROM employees WHERE department = 'Engineering';

-- Get high-spending customers
SELECT * FROM customers WHERE total_spent > 1000;
```

### **Aggregate Queries:**
```sql
-- Average salary by department
SELECT department, AVG(salary) as avg_salary 
FROM employees 
GROUP BY department;

-- Total revenue by subscription plan
SELECT subscription_plan, SUM(monthly_fee) as total_revenue 
FROM disney_subscribers 
GROUP BY subscription_plan;

-- Shows by country
SELECT country, COUNT(*) as show_count 
FROM netflix_shows 
GROUP BY country;
```

### **Join Queries:**
```sql
-- Note: These tables are independent, but you can practice joins within each table
-- using self-joins or subqueries

-- Customers in same state
SELECT c1.first_name, c1.last_name, c1.state
FROM customers c1
JOIN customers c2 ON c1.state = c2.state AND c1.customer_id != c2.customer_id;
```

### **Advanced Queries:**
```sql
-- Top 3 Netflix shows by duration
SELECT title, duration_minutes 
FROM netflix_shows 
ORDER BY duration_minutes DESC 
LIMIT 3;

-- Solar installations with above-average cost
SELECT customer_name, cost 
FROM solar_installations 
WHERE cost > (SELECT AVG(cost) FROM solar_installations);

-- Disney subscribers by device type with analytics
SELECT device_type, 
       COUNT(*) as subscribers,
       AVG(content_hours_watched) as avg_hours,
       AVG(monthly_fee) as avg_fee
FROM disney_subscribers 
GROUP BY device_type
ORDER BY subscribers DESC;
```

---

## Quick Reference

### **Common SQL Operations:**
- `SELECT * FROM table_name` - Get all data
- `WHERE column = 'value'` - Filter rows
- `GROUP BY column` - Group data
- `ORDER BY column DESC` - Sort data
- `LIMIT n` - Get first n rows
- `COUNT(*)` - Count rows
- `AVG(column)` - Average value
- `SUM(column)` - Sum values
- `MAX(column)` - Maximum value
- `MIN(column)` - Minimum value

### **Database Differences:**
- **PostgreSQL**: Use `LIMIT` for row limiting
- **MySQL**: Use `LIMIT` for row limiting (same as PostgreSQL)
- Both databases support standard SQL operations

---

*Last Updated: August 15, 2025*