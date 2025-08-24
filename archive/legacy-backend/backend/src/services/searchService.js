const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class SearchService {
  // Advanced search with multiple filters
  static async searchProblems(searchOptions = {}) {
    try {
      const {
        query = '',
        difficulty = null,
        categories = [],
        companies = [],
        concepts = [],
        tags = [],
        minSolvedCount = null,
        maxSolvedCount = null,
        sortBy = 'numeric_id',
        sortOrder = 'ASC',
        limit = 50,
        offset = 0
      } = searchOptions;

      // Build the base query
      let sql = `
        SELECT DISTINCT
          p.id,
          p.numeric_id,
          p.title,
          p.description,
          p.difficulty,
          p.category_name,
          ps.setup_sql,
          ps.solution_sql,
          ps.explanation,
          ps.explanation_detailed,
          ps.approach_summary,
          ps.key_concepts,
          ps.common_mistakes,
          ps.optimization_tips,
          -- Get problem tags
          COALESCE(
            (SELECT json_agg(json_build_object('name', tag_name, 'category', tag_category))
             FROM problem_tags pt WHERE pt.problem_id = p.id), 
            '[]'::json
          ) as tags,
          -- Get solve count (from progress tracking)
          COALESCE(
            (SELECT COUNT(DISTINCT COALESCE(user_id, session_id))
             FROM user_problem_progress upp 
             WHERE upp.problem_id = p.id AND upp.is_solved = true), 
            0
          ) as solve_count,
          -- Calculate relevance score for text search
          ${query ? `ts_rank(p.search_vector, plainto_tsquery('english', $1)) as relevance_score` : '1 as relevance_score'}
        FROM problems p
        LEFT JOIN problem_schemas ps ON p.id = ps.problem_id
      `;

      const conditions = [];
      const params = [];
      let paramIndex = 1;

      // Full-text search
      if (query) {
        conditions.push(`p.search_vector @@ plainto_tsquery('english', $${paramIndex})`);
        params.push(query);
        paramIndex++;
      }

      // Difficulty filter
      if (difficulty) {
        conditions.push(`p.difficulty = $${paramIndex}`);
        params.push(difficulty);
        paramIndex++;
      }

      // Categories filter
      if (categories.length > 0) {
        conditions.push(`p.category_name = ANY($${paramIndex})`);
        params.push(categories);
        paramIndex++;
      }

      // Companies filter (search in tags)
      if (companies.length > 0) {
        conditions.push(`
          EXISTS (
            SELECT 1 FROM problem_tags pt 
            WHERE pt.problem_id = p.id 
            AND pt.tag_category = 'company' 
            AND pt.tag_name = ANY($${paramIndex})
          )
        `);
        params.push(companies);
        paramIndex++;
      }

      // SQL concepts filter
      if (concepts.length > 0) {
        conditions.push(`
          EXISTS (
            SELECT 1 FROM problem_tags pt 
            WHERE pt.problem_id = p.id 
            AND pt.tag_category = 'concept' 
            AND pt.tag_name = ANY($${paramIndex})
          )
        `);
        params.push(concepts);
        paramIndex++;
      }

      // General tags filter
      if (tags.length > 0) {
        conditions.push(`
          EXISTS (
            SELECT 1 FROM problem_tags pt 
            WHERE pt.problem_id = p.id 
            AND pt.tag_name = ANY($${paramIndex})
          )
        `);
        params.push(tags);
        paramIndex++;
      }

      // Add WHERE clause if there are conditions
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Add HAVING clause for solve count filters (after GROUP BY)
      const havingConditions = [];
      if (minSolvedCount !== null) {
        havingConditions.push(`COUNT(DISTINCT COALESCE(upp.user_id, upp.session_id)) >= $${paramIndex}`);
        params.push(minSolvedCount);
        paramIndex++;
      }
      if (maxSolvedCount !== null) {
        havingConditions.push(`COUNT(DISTINCT COALESCE(upp.user_id, upp.session_id)) <= $${paramIndex}`);
        params.push(maxSolvedCount);
        paramIndex++;
      }

      if (havingConditions.length > 0) {
        // We need to add a GROUP BY and LEFT JOIN for solve count filtering
        sql = sql.replace(
          'FROM problems p',
          `FROM problems p
           LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.is_solved = true`
        );
        sql += ` GROUP BY p.id, ps.id`;
        sql += ` HAVING ${havingConditions.join(' AND ')}`;
      }

      // Add ORDER BY
      const validSortFields = {
        'numeric_id': 'p.numeric_id',
        'title': 'p.title',
        'difficulty': 'p.difficulty',
        'category': 'p.category_name',
        'relevance': 'relevance_score',
        'solve_count': 'solve_count'
      };

      const sortField = validSortFields[sortBy] || 'p.numeric_id';
      const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      if (query && sortBy === 'relevance') {
        sql += ` ORDER BY ${sortField} DESC, p.numeric_id ASC`;
      } else {
        sql += ` ORDER BY ${sortField} ${order}`;
      }

      // Add LIMIT and OFFSET
      sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(sql, params);

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM problems p
        LEFT JOIN problem_schemas ps ON p.id = ps.problem_id
      `;

      if (havingConditions.length > 0) {
        countSql = countSql.replace(
          'FROM problems p',
          `FROM problems p
           LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.is_solved = true`
        );
      }

      if (conditions.length > 0) {
        countSql += ` WHERE ${conditions.join(' AND ')}`;
      }

      if (havingConditions.length > 0) {
        countSql += ` GROUP BY p.id HAVING ${havingConditions.join(' AND ')}`;
        countSql = `SELECT COUNT(*) as total FROM (${countSql}) as counted`;
      }

      const countResult = await pool.query(countSql, params.slice(0, -2)); // Remove limit/offset params
      const totalCount = parseInt(countResult.rows[0].total);

      return {
        problems: result.rows,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit)
        }
      };

    } catch (error) {
      console.error('Error searching problems:', error);
      throw error;
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(query, limit = 10) {
    try {
      // Get matching problem titles
      const titleMatches = await pool.query(`
        SELECT DISTINCT
          p.numeric_id,
          p.title,
          p.difficulty,
          'problem' as suggestion_type
        FROM problems p
        WHERE p.title ILIKE $1
        ORDER BY p.numeric_id
        LIMIT $2
      `, [`%${query}%`, Math.floor(limit / 2)]);

      // Get matching tags
      const tagMatches = await pool.query(`
        SELECT DISTINCT
          pt.tag_name as title,
          pt.tag_category,
          'tag' as suggestion_type,
          COUNT(*) as problem_count
        FROM problem_tags pt
        WHERE pt.tag_name ILIKE $1
        GROUP BY pt.tag_name, pt.tag_category
        ORDER BY problem_count DESC
        LIMIT $2
      `, [`%${query}%`, Math.floor(limit / 2)]);

      return {
        problems: titleMatches.rows,
        tags: tagMatches.rows
      };

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }

  // Get filter options for search interface
  static async getFilterOptions() {
    try {
      // Get available difficulties
      const difficulties = await pool.query(`
        SELECT DISTINCT difficulty, COUNT(*) as count
        FROM problems
        WHERE difficulty IS NOT NULL
        GROUP BY difficulty
        ORDER BY 
          CASE difficulty 
            WHEN 'easy' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'hard' THEN 3 
            ELSE 4 
          END
      `);

      // Get categories
      const categories = await pool.query(`
        SELECT DISTINCT category_name, COUNT(*) as count
        FROM problems
        WHERE category_name IS NOT NULL
        GROUP BY category_name
        ORDER BY count DESC
      `);

      // Get companies
      const companies = await pool.query(`
        SELECT tag_name, COUNT(*) as count
        FROM problem_tags
        WHERE tag_category = 'company'
        GROUP BY tag_name
        ORDER BY count DESC
        LIMIT 20
      `);

      // Get SQL concepts
      const concepts = await pool.query(`
        SELECT tag_name, COUNT(*) as count
        FROM problem_tags
        WHERE tag_category = 'concept'
        GROUP BY tag_name
        ORDER BY count DESC
        LIMIT 30
      `);

      // Get popular tags
      const popularTags = await pool.query(`
        SELECT tag_name, tag_category, COUNT(*) as count
        FROM problem_tags
        WHERE tag_category NOT IN ('company', 'concept')
        GROUP BY tag_name, tag_category
        ORDER BY count DESC
        LIMIT 20
      `);

      return {
        difficulties: difficulties.rows,
        categories: categories.rows,
        companies: companies.rows,
        concepts: concepts.rows,
        popularTags: popularTags.rows
      };

    } catch (error) {
      console.error('Error getting filter options:', error);
      throw error;
    }
  }

  // Get trending problems (most solved recently)
  static async getTrendingProblems(days = 7, limit = 10) {
    try {
      const result = await pool.query(`
        SELECT 
          p.numeric_id,
          p.title,
          p.difficulty,
          p.category_name,
          COUNT(DISTINCT COALESCE(upp.user_id, upp.session_id)) as recent_solvers,
          COUNT(DISTINCT COALESCE(upp2.user_id, upp2.session_id)) as total_solvers
        FROM problems p
        LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id 
          AND upp.is_solved = true 
          AND upp.solved_at >= CURRENT_DATE - INTERVAL '${days} days'
        LEFT JOIN user_problem_progress upp2 ON p.id = upp2.problem_id 
          AND upp2.is_solved = true
        GROUP BY p.id, p.numeric_id, p.title, p.difficulty, p.category_name
        HAVING COUNT(DISTINCT COALESCE(upp.user_id, upp.session_id)) > 0
        ORDER BY recent_solvers DESC, total_solvers DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting trending problems:', error);
      throw error;
    }
  }

  // Search similar problems
  static async getSimilarProblems(problemId, limit = 5) {
    try {
      const result = await pool.query(`
        WITH target_problem AS (
          SELECT 
            p.difficulty,
            p.category_name,
            array_agg(pt.tag_name) as tags
          FROM problems p
          LEFT JOIN problem_tags pt ON p.id = pt.problem_id
          WHERE p.id = $1
          GROUP BY p.id, p.difficulty, p.category_name
        )
        SELECT 
          p.numeric_id,
          p.title,
          p.difficulty,
          p.category_name,
          -- Calculate similarity score
          (
            CASE WHEN p.difficulty = tp.difficulty THEN 2 ELSE 0 END +
            CASE WHEN p.category_name = tp.category_name THEN 3 ELSE 0 END +
            COALESCE(array_length(array(
              SELECT unnest(array_agg(pt.tag_name)) 
              INTERSECT 
              SELECT unnest(tp.tags)
            ), 1), 0)
          ) as similarity_score
        FROM problems p
        LEFT JOIN problem_tags pt ON p.id = pt.problem_id
        CROSS JOIN target_problem tp
        WHERE p.id != $1
        GROUP BY p.id, p.numeric_id, p.title, p.difficulty, p.category_name, tp.difficulty, tp.category_name, tp.tags
        HAVING (
          CASE WHEN p.difficulty = tp.difficulty THEN 2 ELSE 0 END +
          CASE WHEN p.category_name = tp.category_name THEN 3 ELSE 0 END +
          COALESCE(array_length(array(
            SELECT unnest(array_agg(pt.tag_name)) 
            INTERSECT 
            SELECT unnest(tp.tags)
          ), 1), 0)
        ) > 0
        ORDER BY similarity_score DESC, p.numeric_id ASC
        LIMIT $2
      `, [problemId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting similar problems:', error);
      throw error;
    }
  }
}

module.exports = SearchService;