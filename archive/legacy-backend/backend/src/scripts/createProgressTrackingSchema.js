const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createProgressTrackingSchema() {
  console.log('🚀 CREATING PROGRESS TRACKING SCHEMA');
  console.log('===================================');
  
  try {
    // Create user_sessions table to track user activity
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) UNIQUE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created user_sessions table');

    // Create user_problem_attempts table to track all attempts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_problem_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) NOT NULL,
        problem_id UUID NOT NULL,
        problem_numeric_id INT NOT NULL,
        query_submitted TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        execution_time_ms INT,
        error_message TEXT,
        hint_used BOOLEAN DEFAULT false,
        solution_viewed BOOLEAN DEFAULT false,
        attempt_number INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Created user_problem_attempts table');

    // Create user_problem_progress table to track current status per problem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_problem_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) NOT NULL,
        problem_id UUID NOT NULL,
        problem_numeric_id INT NOT NULL,
        status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, needs_review
        total_attempts INT DEFAULT 0,
        correct_attempts INT DEFAULT 0,
        best_execution_time_ms INT,
        first_attempt_at TIMESTAMP,
        completed_at TIMESTAMP,
        last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        difficulty_rating INT CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
        notes TEXT,
        UNIQUE(session_id, problem_id),
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Created user_problem_progress table');

    // Create user_achievements table for gamification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) NOT NULL,
        achievement_type VARCHAR(50) NOT NULL, -- first_solve, speed_demon, category_master, etc.
        achievement_name VARCHAR(100) NOT NULL,
        description TEXT,
        problem_id UUID,
        category VARCHAR(50),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB -- extra data like time taken, streak count, etc.
      );
    `);
    console.log('✅ Created user_achievements table');

    // Create user_streaks table to track solving streaks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) NOT NULL,
        streak_type VARCHAR(30) NOT NULL, -- daily, problem_solving, category
        current_count INT DEFAULT 0,
        max_count INT DEFAULT 0,
        last_activity DATE,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB,
        UNIQUE(session_id, streak_type)
      );
    `);
    console.log('✅ Created user_streaks table');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_problem_attempts_session 
      ON user_problem_attempts(session_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_problem_attempts_problem 
      ON user_problem_attempts(problem_numeric_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_problem_progress_session 
      ON user_problem_progress(session_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_problem_progress_status 
      ON user_problem_progress(status);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_achievements_session 
      ON user_achievements(session_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_streaks_session 
      ON user_streaks(session_id);
    `);

    console.log('✅ Created performance indexes');

    // Create functions for automatic progress tracking
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_problem_progress()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update or insert progress record
        INSERT INTO user_problem_progress (
          session_id, problem_id, problem_numeric_id, 
          total_attempts, correct_attempts, first_attempt_at, last_attempt_at,
          status, best_execution_time_ms
        )
        VALUES (
          NEW.session_id, NEW.problem_id, NEW.problem_numeric_id,
          1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END, 
          NEW.created_at, NEW.created_at,
          CASE WHEN NEW.is_correct THEN 'completed' ELSE 'in_progress' END,
          NEW.execution_time_ms
        )
        ON CONFLICT (session_id, problem_id) DO UPDATE SET
          total_attempts = user_problem_progress.total_attempts + 1,
          correct_attempts = user_problem_progress.correct_attempts + CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
          last_attempt_at = NEW.created_at,
          status = CASE 
            WHEN NEW.is_correct AND user_problem_progress.status != 'completed' THEN 'completed'
            WHEN user_problem_progress.status = 'not_started' THEN 'in_progress'
            ELSE user_problem_progress.status
          END,
          completed_at = CASE 
            WHEN NEW.is_correct AND user_problem_progress.completed_at IS NULL THEN NEW.created_at
            ELSE user_problem_progress.completed_at
          END,
          best_execution_time_ms = CASE
            WHEN NEW.is_correct AND NEW.execution_time_ms IS NOT NULL THEN
              LEAST(COALESCE(user_problem_progress.best_execution_time_ms, NEW.execution_time_ms), NEW.execution_time_ms)
            ELSE user_problem_progress.best_execution_time_ms
          END;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_problem_progress ON user_problem_attempts;
      CREATE TRIGGER trigger_update_problem_progress
        AFTER INSERT ON user_problem_attempts
        FOR EACH ROW EXECUTE FUNCTION update_problem_progress();
    `);

    console.log('✅ Created automatic progress tracking triggers');

    console.log('\n🎉 PROGRESS TRACKING SCHEMA CREATED SUCCESSFULLY');
    console.log('Features available:');
    console.log('  📊 Detailed attempt tracking');
    console.log('  🎯 Problem-by-problem progress');
    console.log('  🏆 Achievement system');
    console.log('  🔥 Streak tracking');
    console.log('  ⚡ Real-time progress updates');

  } catch (error) {
    console.error('❌ Error creating progress schema:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createProgressTrackingSchema()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Schema creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createProgressTrackingSchema };