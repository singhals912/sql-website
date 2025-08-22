-- Create Restricted Database Users for SQL Execution Security
-- This script creates limited-privilege users for executing user-submitted SQL queries

-- ================================
-- POSTGRESQL RESTRICTED USER SETUP
-- ================================

-- Create a limited user for SQL query execution
CREATE USER sql_executor_limited WITH PASSWORD 'executor_secure_2024!';

-- Create a separate database for sandboxed execution
CREATE DATABASE sql_practice_executor;

-- Grant connect permission to the executor database
GRANT CONNECT ON DATABASE sql_practice_executor TO sql_executor_limited;

-- Switch to the executor database
\c sql_practice_executor;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO sql_executor_limited;

-- Grant SELECT permission on all tables (read-only access)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO sql_executor_limited;

-- Grant SELECT permission on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO sql_executor_limited;

-- Explicitly DENY dangerous permissions
-- Note: PostgreSQL uses REVOKE, but we're being explicit about what's NOT granted

-- NO CREATE permissions (cannot create tables, functions, etc.)
-- NO INSERT, UPDATE, DELETE permissions (read-only)
-- NO DROP permissions (cannot drop objects)
-- NO SUPER USER permissions
-- NO CREATE DATABASE permissions
-- NO CREATE ROLE permissions

-- Set query timeout limits
ALTER USER sql_executor_limited SET statement_timeout = '30s';
ALTER USER sql_executor_limited SET lock_timeout = '10s';
ALTER USER sql_executor_limited SET idle_in_transaction_session_timeout = '60s';

-- Prevent access to sensitive system tables
REVOKE ALL ON pg_authid FROM sql_executor_limited;
REVOKE ALL ON pg_shadow FROM sql_executor_limited;
REVOKE ALL ON pg_user FROM sql_executor_limited;

-- ================================
-- MYSQL RESTRICTED USER SETUP (for reference)
-- ================================
-- Note: This would be run on MySQL instance separately

/*
-- Create limited MySQL user
CREATE USER 'sql_executor_limited'@'localhost' IDENTIFIED BY 'executor_secure_2024!';

-- Create sandbox database
CREATE DATABASE sandbox_limited;

-- Grant only SELECT permission on sandbox database
GRANT SELECT ON sandbox_limited.* TO 'sql_executor_limited'@'localhost';

-- Set resource limits
ALTER USER 'sql_executor_limited'@'localhost' WITH 
    MAX_QUERIES_PER_HOUR 1000
    MAX_CONNECTIONS_PER_HOUR 100
    MAX_USER_CONNECTIONS 5;

-- Flush privileges
FLUSH PRIVILEGES;
*/

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Verify user creation
SELECT usename, usesuper, usecreatedb, usecanlogin 
FROM pg_user 
WHERE usename = 'sql_executor_limited';

-- Verify database access
SELECT datname, datacl 
FROM pg_database 
WHERE datname = 'sql_practice_executor';

-- Test connection (should work)
-- \c sql_practice_executor sql_executor_limited

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO sql_executor_limited;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO sql_executor_limited;