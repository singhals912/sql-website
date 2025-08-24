const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function populateLearningPaths() {
  console.log('🚀 POPULATING LEARNING PATHS');
  console.log('============================');
  
  try {
    // Define learning paths
    const learningPaths = [
      {
        name: 'SQL Fundamentals',
        description: 'Master the basics of SQL with real-world problems from top companies. Perfect for beginners starting their SQL journey.',
        difficulty_level: 'beginner',
        estimated_hours: 15,
        prerequisites: [],
        skills_learned: ['SELECT statements', 'WHERE clauses', 'Basic aggregation', 'GROUP BY', 'ORDER BY', 'DISTINCT'],
        order_index: 1,
        problems: [1, 2, 3, 9, 12, 13, 16, 17, 20, 21, 22, 26, 28, 33] // Easy problems focusing on basics
      },
      {
        name: 'Data Aggregation & Analysis',
        description: 'Learn to analyze and summarize data using advanced aggregation techniques. Essential for data analysis roles.',
        difficulty_level: 'beginner',
        estimated_hours: 12,
        prerequisites: ['Basic SQL knowledge'],
        skills_learned: ['COUNT, SUM, AVG', 'GROUP BY with HAVING', 'Multiple aggregations', 'Data summarization'],
        order_index: 2,
        problems: [4, 5, 6, 7, 8, 14, 15, 18, 19, 23, 24, 25, 27] // Aggregation-focused problems
      },
      {
        name: 'Advanced Querying Techniques',
        description: 'Master complex SQL concepts including joins, subqueries, and window functions for intermediate-level challenges.',
        difficulty_level: 'intermediate',
        estimated_hours: 25,
        prerequisites: ['SQL Fundamentals', 'Data Aggregation & Analysis'],
        skills_learned: ['INNER/LEFT/RIGHT JOINs', 'Subqueries', 'Window functions', 'CTEs', 'Complex filtering'],
        order_index: 3,
        problems: [34, 35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 63, 64, 65, 66] // Medium difficulty problems
      },
      {
        name: 'Enterprise SQL & Performance',
        description: 'Tackle complex enterprise-level problems focusing on performance optimization and advanced analytical queries.',
        difficulty_level: 'advanced',
        estimated_hours: 35,
        prerequisites: ['Advanced Querying Techniques'],
        skills_learned: ['Complex analytical queries', 'Performance optimization', 'Advanced window functions', 'Recursive queries', 'Data modeling'],
        order_index: 4,
        problems: [67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 79, 82, 83, 84, 86, 87, 88, 89, 90, 91] // Hard problems
      },
      {
        name: 'Financial Services SQL',
        description: 'Specialized path for financial industry SQL problems including risk analysis, portfolio management, and trading analytics.',
        difficulty_level: 'intermediate',
        estimated_hours: 20,
        prerequisites: ['SQL Fundamentals'],
        skills_learned: ['Financial calculations', 'Risk analytics', 'Portfolio analysis', 'Trading metrics', 'Regulatory reporting'],
        order_index: 5,
        problems: [35, 36, 37, 38, 39, 42, 43, 45, 50, 53, 65, 66, 67, 70, 71, 72, 75, 76, 82, 83, 84, 86, 88, 90, 91] // Finance-focused problems
      },
      {
        name: 'Interview Preparation Track',
        description: 'Curated problems frequently asked in technical interviews at top tech companies. Includes time management tips.',
        difficulty_level: 'intermediate',
        estimated_hours: 18,
        prerequisites: ['SQL Fundamentals', 'Data Aggregation & Analysis'],
        skills_learned: ['Interview-style problem solving', 'Time management', 'Edge case handling', 'Optimization techniques'],
        order_index: 6,
        problems: [1, 4, 34, 35, 39, 42, 47, 52, 58, 62, 67, 72, 73, 89] // Popular interview problems
      }
    ];

    // Insert learning paths
    for (const path of learningPaths) {
      console.log(`\n📚 Creating learning path: ${path.name}`);
      
      // Insert learning path
      const pathResult = await pool.query(`
        INSERT INTO learning_paths (name, description, difficulty_level, estimated_hours, prerequisites, skills_learned, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        path.name,
        path.description, 
        path.difficulty_level,
        path.estimated_hours,
        path.prerequisites,
        path.skills_learned,
        path.order_index
      ]);
      
      const pathId = pathResult.rows[0].id;
      console.log(`✅ Created path with ID: ${pathId}`);
      
      // Insert learning path steps
      for (let i = 0; i < path.problems.length; i++) {
        const problemNumericId = path.problems[i];
        
        // Get problem UUID from numeric ID
        const problemResult = await pool.query(`
          SELECT id, title, difficulty FROM problems WHERE numeric_id = $1
        `, [problemNumericId]);
        
        if (problemResult.rows.length === 0) {
          console.log(`⚠️  Problem #${problemNumericId} not found, skipping`);
          continue;
        }
        
        const problem = problemResult.rows[0];
        
        // Generate step description based on position in path
        let description = '';
        let learningObjectives = [];
        let estimatedTime = 20; // Default 20 minutes
        
        if (i === 0) {
          description = `Start your ${path.name.toLowerCase()} journey with this foundational problem.`;
          learningObjectives = ['Understand basic problem structure', 'Practice fundamental concepts'];
        } else if (i < 3) {
          description = `Build upon previous concepts with this early-stage challenge.`;
          learningObjectives = ['Reinforce basic skills', 'Introduce new concepts gradually'];
        } else if (i < path.problems.length - 3) {
          description = `Apply your growing knowledge to solve this core challenge.`;
          learningObjectives = ['Combine multiple concepts', 'Develop problem-solving strategies'];
          estimatedTime = 30;
        } else {
          description = `Master advanced concepts with this challenging problem near the end of your path.`;
          learningObjectives = ['Demonstrate mastery', 'Handle complex scenarios'];
          estimatedTime = 45;
        }
        
        await pool.query(`
          INSERT INTO learning_path_steps (learning_path_id, problem_id, step_order, description, learning_objectives, estimated_time_minutes)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [pathId, problem.id, i + 1, description, learningObjectives, estimatedTime]);
        
        console.log(`  📝 Added step ${i + 1}: Problem #${problemNumericId} - ${problem.title}`);
      }
      
      console.log(`✅ Created ${path.problems.length} steps for ${path.name}`);
    }

    // Add some example tags to problems for better search
    const problemTags = [
      // Company tags
      { problems: [1], tags: [{ name: 'AT&T', category: 'company' }, { name: 'telecommunications', category: 'industry' }] },
      { problems: [2], tags: [{ name: 'Adobe', category: 'company' }, { name: 'creative-software', category: 'industry' }] },
      { problems: [3], tags: [{ name: 'Airbnb', category: 'company' }, { name: 'hospitality', category: 'industry' }] },
      { problems: [4], tags: [{ name: 'Amazon', category: 'company' }, { name: 'streaming', category: 'industry' }] },
      { problems: [5], tags: [{ name: 'Apple', category: 'company' }, { name: 'mobile-apps', category: 'industry' }] },
      
      // Concept tags
      { problems: [1, 13, 15, 18, 23], tags: [{ name: 'aggregation', category: 'concept' }] },
      { problems: [34], tags: [{ name: 'ab-testing', category: 'concept' }] },
      { problems: [35, 36, 37, 38, 39], tags: [{ name: 'finance', category: 'concept' }] },
      { problems: [41, 52, 63], tags: [{ name: 'joins', category: 'concept' }] },
      { problems: [42, 43, 45, 53, 54], tags: [{ name: 'window-functions', category: 'concept' }] },
      
      // Difficulty tags
      { problems: [1, 2, 3, 4, 5], tags: [{ name: 'beginner-friendly', category: 'difficulty' }] },
      { problems: [67, 68, 69, 70, 71], tags: [{ name: 'advanced', category: 'difficulty' }] },
      { problems: [89], tags: [{ name: 'algorithm', category: 'concept' }] }
    ];

    console.log('\n🏷️  Adding problem tags for better search...');
    for (const tagGroup of problemTags) {
      for (const problemNumericId of tagGroup.problems) {
        // Get problem UUID
        const problemResult = await pool.query(`
          SELECT id FROM problems WHERE numeric_id = $1
        `, [problemNumericId]);
        
        if (problemResult.rows.length === 0) continue;
        
        const problemId = problemResult.rows[0].id;
        
        for (const tag of tagGroup.tags) {
          await pool.query(`
            INSERT INTO problem_tags (problem_id, tag_name, tag_category)
            VALUES ($1, $2, $3)
            ON CONFLICT (problem_id, tag_name) DO NOTHING
          `, [problemId, tag.name, tag.category]);
        }
      }
    }
    console.log('✅ Added problem tags');

    // Update search vectors for all problems
    await pool.query(`
      UPDATE problems 
      SET search_vector = to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' ||
        COALESCE((SELECT string_agg(tag_name, ' ') FROM problem_tags WHERE problem_id = problems.id), '')
      );
    `);
    console.log('✅ Updated search vectors');

    console.log('\n🎉 LEARNING PATHS POPULATED SUCCESSFULLY');
    console.log(`📚 Created ${learningPaths.length} learning paths`);
    console.log('🏷️  Added searchable tags to problems');
    console.log('🔍 Updated full-text search indexes');

  } catch (error) {
    console.error('❌ Error populating learning paths:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  populateLearningPaths()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Population failed:', error);
      process.exit(1);
    });
}

module.exports = { populateLearningPaths };