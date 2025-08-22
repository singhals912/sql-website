const express = require('express');
const router = express.Router();
const BookmarkService = require('../services/bookmarkService');

// Helper to get user ID or session ID from request
const getUserIdentifier = (req) => {
  // TODO: When auth is implemented, extract user ID from JWT token
  const userId = req.user?.id || null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
  return { userId, sessionId };
};

// Add or update bookmark
router.post('/bookmarks', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { problemId, bookmarkType = 'favorite', notes = '', tags = [] } = req.body;
    
    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const bookmark = await BookmarkService.addBookmark(
      userId, sessionId, problemId, bookmarkType, notes, tags
    );
    
    res.json({
      success: true,
      bookmark,
      message: 'Bookmark added successfully'
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:problemId', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { problemId } = req.params;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const removedBookmark = await BookmarkService.removeBookmark(userId, sessionId, problemId);
    
    if (!removedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Get user bookmarks
router.get('/bookmarks', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { type } = req.query;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const bookmarks = await BookmarkService.getUserBookmarks(userId, sessionId, type);
    
    res.json({
      success: true,
      bookmarks,
      count: bookmarks.length
    });
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// Check if problem is bookmarked
router.get('/bookmarks/check/:problemId', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { problemId } = req.params;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const bookmarkType = await BookmarkService.isBookmarked(userId, sessionId, problemId);
    
    res.json({
      success: true,
      isBookmarked: !!bookmarkType,
      bookmarkType
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ error: 'Failed to check bookmark status' });
  }
});

// Batch check if problems are bookmarked
router.post('/bookmarks/check-batch', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { problemIds } = req.body;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: 'problemIds array is required' });
    }
    
    if (problemIds.length > 100) {
      return res.status(400).json({ error: 'Maximum 100 problem IDs allowed' });
    }
    
    const bookmarkStatuses = await BookmarkService.checkBatchBookmarks(userId, sessionId, problemIds);
    
    res.json({
      success: true,
      bookmarkStatuses
    });
  } catch (error) {
    console.error('Error checking batch bookmark status:', error);
    res.status(500).json({ error: 'Failed to check batch bookmark status' });
  }
});

// Get bookmark statistics
router.get('/bookmarks/stats', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const stats = await BookmarkService.getBookmarkStats(userId, sessionId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting bookmark stats:', error);
    res.status(500).json({ error: 'Failed to get bookmark stats' });
  }
});

// Get popular bookmarked problems
router.get('/bookmarks/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const popularBookmarks = await BookmarkService.getPopularBookmarks(parseInt(limit));
    
    res.json({
      success: true,
      popularBookmarks
    });
  } catch (error) {
    console.error('Error getting popular bookmarks:', error);
    res.status(500).json({ error: 'Failed to get popular bookmarks' });
  }
});

// Get bookmarks by tags
router.get('/bookmarks/tags', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { tags } = req.query;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    if (!tags) {
      return res.status(400).json({ error: 'Tags parameter is required' });
    }
    
    const tagArray = Array.isArray(tags) ? tags : tags.split(',');
    const bookmarks = await BookmarkService.getBookmarksByTags(userId, sessionId, tagArray);
    
    res.json({
      success: true,
      bookmarks,
      count: bookmarks.length
    });
  } catch (error) {
    console.error('Error getting bookmarks by tags:', error);
    res.status(500).json({ error: 'Failed to get bookmarks by tags' });
  }
});

// Update bookmark notes and tags
router.put('/bookmarks/:problemId', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    const { problemId } = req.params;
    const { notes = '', tags = [] } = req.body;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const updatedBookmark = await BookmarkService.updateBookmark(
      userId, sessionId, problemId, notes, tags
    );
    
    if (!updatedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    res.json({
      success: true,
      bookmark: updatedBookmark,
      message: 'Bookmark updated successfully'
    });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({ error: 'Failed to update bookmark' });
  }
});

// Get bookmark collection summary
router.get('/bookmarks/collection', async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'User ID or session ID is required' });
    }
    
    const collection = await BookmarkService.getBookmarkCollection(userId, sessionId);
    
    res.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Error getting bookmark collection:', error);
    res.status(500).json({ error: 'Failed to get bookmark collection' });
  }
});

module.exports = router;