const express = require('express');
const router = express.Router();
const SearchService = require('../services/searchService');

// Advanced search endpoint
router.get('/search', async (req, res) => {
  try {
    const {
      q: query = '',
      difficulty = null,
      categories = '',
      companies = '',
      concepts = '',
      tags = '',
      minSolved = null,
      maxSolved = null,
      sortBy = 'numeric_id',
      sortOrder = 'ASC',
      limit = 20,
      page = 1
    } = req.query;

    // Parse array parameters
    const parseArrayParam = (param) => {
      if (!param) return [];
      return typeof param === 'string' ? param.split(',').filter(Boolean) : param;
    };

    const searchOptions = {
      query: query.trim(),
      difficulty: difficulty || null,
      categories: parseArrayParam(categories),
      companies: parseArrayParam(companies),
      concepts: parseArrayParam(concepts),
      tags: parseArrayParam(tags),
      minSolvedCount: minSolved ? parseInt(minSolved) : null,
      maxSolvedCount: maxSolved ? parseInt(maxSolved) : null,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const results = await SearchService.searchProblems(searchOptions);

    res.json({
      success: true,
      query: query.trim(),
      filters: {
        difficulty,
        categories: parseArrayParam(categories),
        companies: parseArrayParam(companies),
        concepts: parseArrayParam(concepts),
        tags: parseArrayParam(tags),
        minSolved: minSolved ? parseInt(minSolved) : null,
        maxSolved: maxSolved ? parseInt(maxSolved) : null
      },
      results: results.problems,
      pagination: results.pagination
    });

  } catch (error) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search problems' 
    });
  }
});

// Search suggestions endpoint
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q: query = '', limit = 10 } = req.query;

    if (!query.trim()) {
      return res.json({
        success: true,
        suggestions: { problems: [], tags: [] }
      });
    }

    const suggestions = await SearchService.getSearchSuggestions(
      query.trim(), 
      parseInt(limit)
    );

    res.json({
      success: true,
      query: query.trim(),
      suggestions
    });

  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get search suggestions' 
    });
  }
});

// Get filter options for search interface
router.get('/search/filters', async (req, res) => {
  try {
    const filterOptions = await SearchService.getFilterOptions();

    res.json({
      success: true,
      filters: filterOptions
    });

  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get filter options' 
    });
  }
});

// Get trending problems
router.get('/search/trending', async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;

    const trendingProblems = await SearchService.getTrendingProblems(
      parseInt(days), 
      parseInt(limit)
    );

    res.json({
      success: true,
      trending: trendingProblems,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error getting trending problems:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get trending problems' 
    });
  }
});

// Get similar problems
router.get('/search/similar/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const { limit = 5 } = req.query;

    // Convert numeric ID to UUID if needed
    let actualProblemId = problemId;
    if (/^\d+$/.test(problemId)) {
      // It's a numeric ID, convert to UUID
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query('SELECT id FROM problems WHERE numeric_id = $1', [parseInt(problemId)]);
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Problem not found' 
        });
      }
      actualProblemId = result.rows[0].id;
    }

    const similarProblems = await SearchService.getSimilarProblems(
      actualProblemId, 
      parseInt(limit)
    );

    res.json({
      success: true,
      problemId,
      similar: similarProblems
    });

  } catch (error) {
    console.error('Error getting similar problems:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get similar problems' 
    });
  }
});

// Quick search endpoint (simplified)
router.get('/search/quick', async (req, res) => {
  try {
    const { q: query = '', limit = 5 } = req.query;

    if (!query.trim()) {
      return res.json({
        success: true,
        results: []
      });
    }

    const searchOptions = {
      query: query.trim(),
      sortBy: 'relevance',
      sortOrder: 'DESC',
      limit: parseInt(limit),
      offset: 0
    };

    const results = await SearchService.searchProblems(searchOptions);

    // Return simplified results for quick search
    const quickResults = results.problems.map(problem => ({
      numeric_id: problem.numeric_id,
      title: problem.title,
      difficulty: problem.difficulty,
      category_name: problem.category_name
    }));

    res.json({
      success: true,
      query: query.trim(),
      results: quickResults
    });

  } catch (error) {
    console.error('Error in quick search:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to perform quick search' 
    });
  }
});

module.exports = router;