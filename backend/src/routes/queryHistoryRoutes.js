const express = require('express');
const router = express.Router();
const QueryHistoryService = require('../services/queryHistoryService');
const authMiddleware = require('../middleware/authMiddleware');

// Helper to get user identifier
const getUserIdentifier = (req) => {
  const userId = req.user?.userId || null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
  return { userId, sessionId };
};

// Get query history
router.get('/queries/history', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      problemId: req.query.problemId || null,
      successfulOnly: req.query.successfulOnly === 'true',
      startDate: req.query.startDate ? new Date(req.query.startDate) : null,
      endDate: req.query.endDate ? new Date(req.query.endDate) : null
    };

    const history = await QueryHistoryService.getHistory(userId, sessionId, options);

    res.json({
      success: true,
      ...history
    });

  } catch (error) {
    console.error('Error getting query history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get query history'
    });
  }
});

// Save query to history (usually called automatically)
router.post('/queries/history', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const {
      problemId,
      problemNumericId,
      queryText,
      dialect,
      executionTime,
      wasSuccessful,
      rowCount,
      errorMessage
    } = req.body;

    if (!queryText) {
      return res.status(400).json({
        success: false,
        error: 'Query text is required'
      });
    }

    const historyEntry = await QueryHistoryService.saveToHistory({
      userId,
      sessionId,
      problemId,
      problemNumericId,
      queryText,
      dialect,
      executionTime,
      wasSuccessful,
      rowCount,
      errorMessage
    });

    res.json({
      success: true,
      historyEntry
    });

  } catch (error) {
    console.error('Error saving query to history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save query to history'
    });
  }
});

// Get saved queries
router.get('/queries/saved', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      problemId: req.query.problemId || null,
      tags: req.query.tags ? req.query.tags.split(',') : [],
      search: req.query.search || '',
      includePublic: req.query.includePublic === 'true'
    };

    const savedQueries = await QueryHistoryService.getSavedQueries(
      userId, sessionId, options
    );

    res.json({
      success: true,
      ...savedQueries
    });

  } catch (error) {
    console.error('Error getting saved queries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get saved queries'
    });
  }
});

// Save a query
router.post('/queries/saved', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const {
      name,
      description,
      queryText,
      dialect,
      problemId,
      problemNumericId,
      isPublic,
      tags
    } = req.body;

    if (!name || !queryText) {
      return res.status(400).json({
        success: false,
        error: 'Name and query text are required'
      });
    }

    const savedQuery = await QueryHistoryService.saveQuery({
      userId,
      sessionId,
      name,
      description,
      queryText,
      dialect,
      problemId,
      problemNumericId,
      isPublic,
      tags
    });

    res.json({
      success: true,
      savedQuery
    });

  } catch (error) {
    console.error('Error saving query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save query'
    });
  }
});

// Update saved query
router.put('/queries/saved/:queryId', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { queryId } = req.params;
    const updates = req.body;

    const updatedQuery = await QueryHistoryService.updateSavedQuery(
      queryId, userId, sessionId, updates
    );

    res.json({
      success: true,
      savedQuery: updatedQuery
    });

  } catch (error) {
    console.error('Error updating saved query:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update saved query'
    });
  }
});

// Delete saved query
router.delete('/queries/saved/:queryId', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { queryId } = req.params;

    await QueryHistoryService.deleteSavedQuery(queryId, userId, sessionId);

    res.json({
      success: true,
      message: 'Query deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting saved query:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete saved query'
    });
  }
});

// Get query analytics
router.get('/queries/analytics', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const days = parseInt(req.query.days) || 30;
    const analytics = await QueryHistoryService.getQueryAnalytics(
      userId, sessionId, days
    );

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error getting query analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get query analytics'
    });
  }
});

// Get popular public queries
router.get('/queries/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const popularQueries = await QueryHistoryService.getPopularQueries(limit);

    res.json({
      success: true,
      popularQueries
    });

  } catch (error) {
    console.error('Error getting popular queries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular queries'
    });
  }
});

module.exports = router;