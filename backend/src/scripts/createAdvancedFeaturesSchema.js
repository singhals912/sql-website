const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdvancedFeaturesSchema() {
  console.log('🚀 CREATING ADVANCED FEATURES SCHEMA');
  console.log('===================================');
  
  try {
    // 1. Users table for authentication
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        username VARCHAR(50) UNIQUE,
        password_hash VARCHAR(255),
        full_name VARCHAR(100),
        avatar_url TEXT,
        preferences JSONB DEFAULT '{}',
        goals JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP
      );
    `);
    console.log('✅ Created users table');

    // 2. Learning Paths
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        difficulty_level VARCHAR(20) NOT NULL, -- beginner, intermediate, advanced
        estimated_hours INT,
        prerequisites TEXT[],
        skills_learned TEXT[],
        is_active BOOLEAN DEFAULT true,
        order_index INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created learning_paths table');

    // 3. Learning Path Steps (problems in paths)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_path_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        step_order INT NOT NULL,
        description TEXT,
        learning_objectives TEXT[],
        prerequisites TEXT[],
        is_optional BOOLEAN DEFAULT false,
        estimated_time_minutes INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(learning_path_id, problem_id),
        UNIQUE(learning_path_id, step_order)
      );
    `);
    console.log('✅ Created learning_path_steps table');

    // 4. User Learning Path Progress
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_learning_path_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255), -- For anonymous users
        learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
        current_step_id UUID REFERENCES learning_path_steps(id),
        steps_completed INT DEFAULT 0,
        total_steps INT,
        completion_percentage DECIMAL(5,2) DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        CONSTRAINT user_session_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);
    console.log('✅ Created user_learning_path_progress table');

    // 5. Hints system
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problem_hints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        hint_order INT NOT NULL,
        hint_type VARCHAR(20) DEFAULT 'text', -- text, code, concept
        hint_content TEXT NOT NULL,
        reveal_after_attempts INT DEFAULT 0,
        difficulty_level VARCHAR(20), -- easy, medium, hard
        sql_concept VARCHAR(50), -- joins, aggregation, subqueries, etc.
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(problem_id, hint_order)
      );
    `);
    console.log('✅ Created problem_hints table');

    // 6. Solution explanations (enhanced problem_schemas)
    await pool.query(`
      ALTER TABLE problem_schemas 
      ADD COLUMN IF NOT EXISTS explanation_detailed TEXT,
      ADD COLUMN IF NOT EXISTS approach_summary TEXT,
      ADD COLUMN IF NOT EXISTS key_concepts TEXT[],
      ADD COLUMN IF NOT EXISTS alternative_solutions TEXT[],
      ADD COLUMN IF NOT EXISTS time_complexity VARCHAR(50),
      ADD COLUMN IF NOT EXISTS space_complexity VARCHAR(50),
      ADD COLUMN IF NOT EXISTS common_mistakes TEXT[],
      ADD COLUMN IF NOT EXISTS optimization_tips TEXT[];
    `);
    console.log('✅ Enhanced problem_schemas with detailed explanations');

    // 7. User bookmarks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255), -- For anonymous users
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        bookmark_type VARCHAR(20) DEFAULT 'favorite', -- favorite, review_later, challenging
        notes TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, problem_id),
        UNIQUE(session_id, problem_id),
        CONSTRAINT bookmark_user_session_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);
    console.log('✅ Created user_bookmarks table');

    // 8. User hint usage tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_hint_usage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(255), -- For anonymous users
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        hint_id UUID NOT NULL REFERENCES problem_hints(id) ON DELETE CASCADE,
        revealed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attempt_number INT,
        CONSTRAINT hint_user_session_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      );
    `);
    console.log('✅ Created user_hint_usage table');

    // 9. Enhanced search support
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problem_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
        tag_name VARCHAR(50) NOT NULL,
        tag_category VARCHAR(30), -- concept, company, difficulty, industry
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(problem_id, tag_name)
      );
    `);
    console.log('✅ Created problem_tags table');

    // 10. User goals and preferences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(30) NOT NULL, -- daily_problems, weekly_problems, completion_target, skill_focus
        target_value INT,
        target_date DATE,
        current_progress INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        achieved_at TIMESTAMP
      );
    `);
    console.log('✅ Created user_goals table');

    // Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_learning_path_steps_path_order ON learning_path_steps(learning_path_id, step_order);',
      'CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_user ON user_learning_path_progress(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_session ON user_learning_path_progress(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_problem_hints_problem_order ON problem_hints(problem_id, hint_order);',
      'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_bookmarks_session ON user_bookmarks(session_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_hint_usage_user_problem ON user_hint_usage(user_id, problem_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_hint_usage_session_problem ON user_hint_usage(session_id, problem_id);',
      'CREATE INDEX IF NOT EXISTS idx_problem_tags_problem ON problem_tags(problem_id);',
      'CREATE INDEX IF NOT EXISTS idx_problem_tags_name ON problem_tags(tag_name);',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);',
      'CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);'
    ];

    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    console.log('✅ Created performance indexes');

    // Create full-text search index for problems
    await pool.query(`
      ALTER TABLE problems 
      ADD COLUMN IF NOT EXISTS search_vector tsvector;
    `);

    await pool.query(`
      UPDATE problems 
      SET search_vector = to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' ||
        COALESCE((SELECT string_agg(tag_name, ' ') FROM problem_tags WHERE problem_id = problems.id), '')
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_problems_search_vector ON problems USING gin(search_vector);
    `);
    console.log('✅ Created full-text search support');

    // Create trigger to update search vector
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_problem_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.search_vector = to_tsvector('english', 
          COALESCE(NEW.title, '') || ' ' || 
          COALESCE(NEW.description, '') || ' ' ||
          COALESCE((SELECT string_agg(tag_name, ' ') FROM problem_tags WHERE problem_id = NEW.id), '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS trigger_update_problem_search_vector ON problems;
      CREATE TRIGGER trigger_update_problem_search_vector
        BEFORE INSERT OR UPDATE ON problems
        FOR EACH ROW EXECUTE FUNCTION update_problem_search_vector();
    `);
    console.log('✅ Created search vector update triggers');

    console.log('\n🎉 ADVANCED FEATURES SCHEMA CREATED SUCCESSFULLY');
    console.log('Features available:');
    console.log('  📚 Learning Paths with progress tracking');
    console.log('  💡 Progressive hint system');
    console.log('  📖 Detailed solution explanations');
    console.log('  🔖 User bookmarking system');
    console.log('  🔍 Advanced search and filtering');
    console.log('  👤 User authentication system');
    console.log('  ☁️  Cloud progress sync capability');
    console.log('  ⚙️  Profile customization support');

  } catch (error) {
    console.error('❌ Error creating advanced features schema:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createAdvancedFeaturesSchema()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Schema creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdvancedFeaturesSchema };