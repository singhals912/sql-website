-- CRITICAL DATABASE MIGRATION: Add Missing Tables and Columns
-- This migration adds essential tables that the application depends on
-- Run this immediately before any application usage

-- 1. Add numeric_id column to problems table (CRITICAL)
ALTER TABLE problems ADD COLUMN IF NOT EXISTS numeric_id SERIAL UNIQUE;

-- Update existing problems with sequential numeric IDs
UPDATE problems 
SET numeric_id = row_number() OVER (ORDER BY created_at)
WHERE numeric_id IS NULL;

-- 2. Create user_sessions table (CRITICAL - required for session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- 3. Create user_problem_progress table (CRITICAL - required for progress tracking)
CREATE TABLE IF NOT EXISTS user_problem_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    problem_numeric_id INTEGER,
    status VARCHAR(20) DEFAULT 'attempted' CHECK (status IN ('attempted', 'completed')),
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    best_execution_time_ms INTEGER,
    first_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, problem_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_problem_progress_session ON user_problem_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_progress_problem ON user_problem_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_problem_progress_status ON user_problem_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_problem_progress_numeric ON user_problem_progress(problem_numeric_id);

-- 4. Create user_bookmarks table (CRITICAL - required for bookmark functionality)
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL REFERENCES user_sessions(session_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    bookmark_type VARCHAR(20) NOT NULL CHECK (bookmark_type IN ('favorite', 'review_later', 'challenging')),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, problem_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_session ON user_bookmarks(session_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_problem ON user_bookmarks(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_type ON user_bookmarks(bookmark_type);

-- 5. Create indexes on problems table for numeric_id lookups
CREATE INDEX IF NOT EXISTS idx_problems_numeric_id ON problems(numeric_id);

-- 6. Add auto-update trigger for user_sessions last_activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_sessions_activity 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_last_activity();

-- 7. Sync numeric_id with problem_numeric_id in existing progress records
UPDATE user_problem_progress 
SET problem_numeric_id = p.numeric_id 
FROM problems p 
WHERE user_problem_progress.problem_id = p.id 
AND user_problem_progress.problem_numeric_id IS NULL;

-- 8. Add foreign key constraint for problem_numeric_id (if safe)
-- This ensures data consistency between problems.numeric_id and user_problem_progress.problem_numeric_id
-- Commented out for now to avoid conflicts, can be enabled later
-- ALTER TABLE user_problem_progress 
-- ADD CONSTRAINT fk_user_problem_progress_numeric_id 
-- FOREIGN KEY (problem_numeric_id) REFERENCES problems(numeric_id);

-- Verify the migration worked
DO $$
DECLARE
    table_count INTEGER;
    column_count INTEGER;
BEGIN
    -- Check if tables exist
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('user_sessions', 'user_problem_progress', 'user_bookmarks');
    
    -- Check if numeric_id column exists
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'problems' 
    AND column_name = 'numeric_id';
    
    IF table_count = 3 AND column_count = 1 THEN
        RAISE NOTICE 'MIGRATION SUCCESS: All critical tables and columns created successfully';
    ELSE
        RAISE EXCEPTION 'MIGRATION FAILED: Missing tables or columns. Tables found: %, numeric_id column: %', table_count, column_count;
    END IF;
END $$;