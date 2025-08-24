const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function populateHintsAndExplanations() {
  console.log('🚀 POPULATING HINTS AND EXPLANATIONS');
  console.log('====================================');
  
  try {
    // Define hints and explanations for key problems
    const problemData = {
      1: { // AT&T Customer Service Call Volume Analytics
        hints: [
          {
            order: 1,
            type: 'concept',
            content: 'This problem requires aggregating data by groups. Think about which column you need to GROUP BY.',
            reveal_after_attempts: 0,
            sql_concept: 'aggregation'
          },
          {
            order: 2,
            type: 'text',
            content: 'You need to calculate averages and percentages for each service category. Use AVG() for averages.',
            reveal_after_attempts: 1,
            sql_concept: 'aggregation'
          },
          {
            order: 3,
            type: 'code',
            content: 'Start with: SELECT service_category, AVG(...), ... FROM table_name GROUP BY service_category',
            reveal_after_attempts: 2,
            sql_concept: 'aggregation'
          }
        ],
        explanation: {
          detailed: 'This problem tests your ability to aggregate data by categories and calculate multiple metrics per group. The key is using GROUP BY with multiple aggregate functions.',
          approach: 'Group by service category, then calculate averages for duration and resolution rate, plus count total calls.',
          key_concepts: ['GROUP BY', 'AVG()', 'COUNT()', 'Multiple aggregations'],
          common_mistakes: ['Forgetting GROUP BY', 'Using COUNT(*) instead of proper resolution rate calculation'],
          optimization_tips: ['Use proper column indexing on service_category for better performance']
        }
      },
      4: { // Amazon Prime Video Content Performance
        hints: [
          {
            order: 1,
            type: 'concept',
            content: 'You need to count subscribers by region and filter for regions with more than 1 million.',
            reveal_after_attempts: 0,
            sql_concept: 'aggregation'
          },
          {
            order: 2,
            type: 'text',
            content: 'Use GROUP BY region, then COUNT(*) to count subscribers. HAVING clause filters grouped results.',
            reveal_after_attempts: 1,
            sql_concept: 'aggregation'
          },
          {
            order: 3,
            type: 'code',
            content: 'SELECT region, COUNT(*) as total_subscribers FROM table_name GROUP BY region HAVING COUNT(*) > 1000000',
            reveal_after_attempts: 2,
            sql_concept: 'aggregation'
          }
        ],
        explanation: {
          detailed: 'This aggregation problem requires grouping data and filtering the grouped results. The key difference between WHERE and HAVING is that HAVING filters after grouping.',
          approach: 'Group subscribers by region, count them, filter groups with HAVING, and order results.',
          key_concepts: ['GROUP BY', 'COUNT()', 'HAVING clause', 'ORDER BY'],
          common_mistakes: ['Using WHERE instead of HAVING', 'Forgetting to order results'],
          optimization_tips: ['Index on region column can speed up grouping operations']
        }
      },
      34: { // A/B Test Results Analysis
        hints: [
          {
            order: 1,
            type: 'concept',
            content: 'You need to calculate conversion rates for each test group. This involves conditional counting.',
            reveal_after_attempts: 0,
            sql_concept: 'aggregation'
          },
          {
            order: 2,
            type: 'text',
            content: 'Use CASE WHEN with SUM() to count conversions, then calculate percentage with basic math.',
            reveal_after_attempts: 1,
            sql_concept: 'conditional-aggregation'
          },
          {
            order: 3,
            type: 'code',
            content: 'SUM(CASE WHEN converted THEN 1 ELSE 0 END) counts true values. Multiply by 100.0 for percentage.',
            reveal_after_attempts: 2,
            sql_concept: 'conditional-aggregation'
          }
        ],
        explanation: {
          detailed: 'A/B testing analysis requires calculating conversion rates using conditional aggregation. This is a common pattern in analytics.',
          approach: 'Group by test group, count total users and conversions separately, then calculate percentage.',
          key_concepts: ['CASE WHEN', 'Conditional aggregation', 'Percentage calculations', 'GROUP BY'],
          common_mistakes: ['Integer division issues', 'Not handling boolean fields properly'],
          optimization_tips: ['Consider using FILTER clause in PostgreSQL as alternative to CASE WHEN']
        }
      },
      62: { // Top Spending Customers by Month - Window Functions
        hints: [
          {
            order: 1,
            type: 'concept',
            content: 'This requires ranking customers within each month. Think about window functions.',
            reveal_after_attempts: 0,
            sql_concept: 'window-functions'
          },
          {
            order: 2,
            type: 'text',
            content: 'Use ROW_NUMBER() OVER (PARTITION BY month ORDER BY total_spent DESC) to rank within months.',
            reveal_after_attempts: 1,
            sql_concept: 'window-functions'
          },
          {
            order: 3,
            type: 'code',
            content: 'WITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY month ORDER BY amount DESC) as rank FROM ...) SELECT * FROM ranked WHERE rank = 1',
            reveal_after_attempts: 2,
            sql_concept: 'window-functions'
          }
        ],
        explanation: {
          detailed: 'This problem demonstrates window functions for ranking within groups. CTEs make the solution more readable.',
          approach: 'First aggregate spending by customer and month, then use window functions to rank within each month.',
          key_concepts: ['Window functions', 'ROW_NUMBER()', 'PARTITION BY', 'CTEs'],
          common_mistakes: ['Using GROUP BY instead of window functions', 'Incorrect partitioning'],
          optimization_tips: ['Window functions can be expensive on large datasets - consider proper indexing']
        }
      },
      89: { // Movie Recommendation Engine
        hints: [
          {
            order: 1,
            type: 'concept',
            content: 'This is a complex recommendation problem. You need to find movies that action viewers have NOT watched.',
            reveal_after_attempts: 0,
            sql_concept: 'joins'
          },
          {
            order: 2,
            type: 'text',
            content: 'Use CROSS JOIN to get all possible user-movie combinations, then LEFT JOIN to exclude watched movies.',
            reveal_after_attempts: 1,
            sql_concept: 'joins'
          },
          {
            order: 3,
            type: 'code',
            content: 'Start by finding action viewers with a CTE, then CROSS JOIN with action movies, LEFT JOIN with user_views to find NULL (unwatched) movies.',
            reveal_after_attempts: 2,
            sql_concept: 'joins'
          }
        ],
        explanation: {
          detailed: 'Recommendation engines often require finding what users have NOT interacted with. This uses advanced JOIN techniques.',
          approach: 'Identify action viewers, create all possible combinations with action movies, then exclude already watched movies.',
          key_concepts: ['CROSS JOIN', 'LEFT JOIN', 'IS NULL filtering', 'CTEs', 'Complex joins'],
          common_mistakes: ['Wrong JOIN types', 'Not properly excluding watched movies', 'Forgetting rating filters'],
          optimization_tips: ['This type of query can be expensive - consider materialized views for large datasets']
        }
      }
    };

    // Insert hints and explanations
    for (const [problemNumericId, data] of Object.entries(problemData)) {
      console.log(`\n💡 Adding hints for Problem #${problemNumericId}`);
      
      // Get problem ID
      const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [parseInt(problemNumericId)]);
      if (problemResult.rows.length === 0) {
        console.log(`⚠️  Problem #${problemNumericId} not found`);
        continue;
      }
      
      const problemId = problemResult.rows[0].id;
      
      // Insert hints
      for (const hint of data.hints) {
        await pool.query(`
          INSERT INTO problem_hints (problem_id, hint_order, hint_type, hint_content, reveal_after_attempts, sql_concept)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [problemId, hint.order, hint.type, hint.content, hint.reveal_after_attempts, hint.sql_concept]);
        
        console.log(`  📝 Added hint ${hint.order}: ${hint.type} hint`);
      }
      
      // Update problem schema with detailed explanation
      await pool.query(`
        UPDATE problem_schemas 
        SET 
          explanation_detailed = $1,
          approach_summary = $2,
          key_concepts = $3,
          common_mistakes = $4,
          optimization_tips = $5
        WHERE problem_id = $6
      `, [
        data.explanation.detailed,
        data.explanation.approach,
        data.explanation.key_concepts,
        data.explanation.common_mistakes,
        data.explanation.optimization_tips,
        problemId
      ]);
      
      console.log(`  📖 Added detailed explanation`);
    }

    // Add basic hints for some other key problems
    const basicHints = [
      {
        problemId: 2, // Adobe Creative Cloud
        hints: [
          { order: 1, content: 'Sum up subscription revenue by plan type. Use SUM() and GROUP BY.', type: 'concept', sql_concept: 'aggregation' },
          { order: 2, content: 'ORDER BY total revenue DESC to show highest revenue plans first.', type: 'text', sql_concept: 'sorting' }
        ]
      },
      {
        problemId: 3, // Airbnb Host Revenue
        hints: [
          { order: 1, content: 'Calculate average revenue per property type and filter for > $150.', type: 'concept', sql_concept: 'aggregation' },
          { order: 2, content: 'Use AVG() with GROUP BY, then HAVING AVG(revenue) > 150.', type: 'text', sql_concept: 'aggregation' }
        ]
      },
      {
        problemId: 35, // BlackRock Portfolio
        hints: [
          { order: 1, content: 'This requires multiple calculations per sector. Group by sector first.', type: 'concept', sql_concept: 'aggregation' },
          { order: 2, content: 'Calculate portfolio weight as (sector_value / total_portfolio_value) * 100.', type: 'text', sql_concept: 'calculations' }
        ]
      }
    ];

    for (const basicHint of basicHints) {
      const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [basicHint.problemId]);
      if (problemResult.rows.length === 0) continue;
      
      const problemId = problemResult.rows[0].id;
      
      for (const hint of basicHint.hints) {
        await pool.query(`
          INSERT INTO problem_hints (problem_id, hint_order, hint_type, hint_content, reveal_after_attempts, sql_concept)
          VALUES ($1, $2, $3, $4, 0, $5)
        `, [problemId, hint.order, hint.type, hint.content, hint.sql_concept]);
      }
      
      console.log(`💡 Added basic hints for Problem #${basicHint.problemId}`);
    }

    // Add general SQL concept explanations for different difficulty levels
    const conceptualHints = [
      // For easy problems (1-33)
      { 
        range: [1, 33], 
        generalHints: [
          'Easy problems typically use SELECT, WHERE, GROUP BY, and basic functions.',
          'Focus on understanding the business question first, then translate to SQL.',
          'Most easy problems can be solved with simple aggregation patterns.'
        ]
      },
      // For medium problems (34-66)
      { 
        range: [34, 66], 
        generalHints: [
          'Medium problems often require JOINs, subqueries, or window functions.',
          'Break complex problems into smaller steps using CTEs.',
          'Pay attention to data relationships between tables.'
        ]
      },
      // For hard problems (67-91)
      { 
        range: [67, 91], 
        generalHints: [
          'Hard problems may require advanced analytical functions and complex logic.',
          'Consider performance implications of your queries.',
          'Multiple solution approaches may exist - think about trade-offs.'
        ]
      }
    ];

    console.log('\n🎯 Adding concept-based hints for problem ranges...');
    
    for (const concept of conceptualHints) {
      for (let i = concept.range[0]; i <= concept.range[1]; i++) {
        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [i]);
        if (problemResult.rows.length === 0) continue;
        
        const problemId = problemResult.rows[0].id;
        
        // Check if hints already exist
        const existingHints = await pool.query('SELECT COUNT(*) as count FROM problem_hints WHERE problem_id = $1', [problemId]);
        if (parseInt(existingHints.rows[0].count) > 0) continue;
        
        // Add a general conceptual hint
        const hintIndex = Math.floor(Math.random() * concept.generalHints.length);
        await pool.query(`
          INSERT INTO problem_hints (problem_id, hint_order, hint_type, hint_content, reveal_after_attempts, sql_concept)
          VALUES ($1, 1, 'concept', $2, 0, 'general')
        `, [problemId, concept.generalHints[hintIndex]]);
      }
    }
    
    console.log('✅ Added conceptual hints for all problem ranges');

    // Get statistics
    const hintStats = await pool.query(`
      SELECT 
        COUNT(*) as total_hints,
        COUNT(DISTINCT problem_id) as problems_with_hints,
        COUNT(*) FILTER (WHERE hint_type = 'concept') as concept_hints,
        COUNT(*) FILTER (WHERE hint_type = 'text') as text_hints,
        COUNT(*) FILTER (WHERE hint_type = 'code') as code_hints
      FROM problem_hints
    `);
    
    const explanationStats = await pool.query(`
      SELECT COUNT(*) as problems_with_explanations
      FROM problem_schemas 
      WHERE explanation_detailed IS NOT NULL
    `);

    console.log('\n🎉 HINTS AND EXPLANATIONS POPULATED SUCCESSFULLY');
    console.log(`💡 Total hints created: ${hintStats.rows[0].total_hints}`);
    console.log(`📚 Problems with hints: ${hintStats.rows[0].problems_with_hints}/91`);
    console.log(`🎯 Concept hints: ${hintStats.rows[0].concept_hints}`);
    console.log(`📝 Text hints: ${hintStats.rows[0].text_hints}`);
    console.log(`💻 Code hints: ${hintStats.rows[0].code_hints}`);
    console.log(`📖 Problems with detailed explanations: ${explanationStats.rows[0].problems_with_explanations}`);

  } catch (error) {
    console.error('❌ Error populating hints and explanations:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  populateHintsAndExplanations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Population failed:', error);
      process.exit(1);
    });
}

module.exports = { populateHintsAndExplanations };