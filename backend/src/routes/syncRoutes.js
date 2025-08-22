const express = require('express');
const router = express.Router();
const SyncService = require('../services/syncService');
const authMiddleware = require('../middleware/authMiddleware');

// Get sync status
router.get('/sync/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const status = await SyncService.getSyncStatus(userId);

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get sync status' 
    });
  }
});

// Sync user data to cloud
router.post('/sync/upload', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const syncResult = await SyncService.syncUserDataToCloud(userId);

    res.json({
      success: true,
      message: 'Data synced to cloud successfully',
      sync: syncResult
    });

  } catch (error) {
    console.error('Error syncing to cloud:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync data to cloud' 
    });
  }
});

// Backup user data for download
router.get('/sync/backup', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const backup = await SyncService.backupUserData(userId);

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="sql-practice-backup-${Date.now()}.json"`);
    
    res.json(backup);

  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create backup' 
    });
  }
});

// Restore user data from backup
router.post('/sync/restore', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { backupData } = req.body;

    if (!backupData) {
      return res.status(400).json({
        success: false,
        error: 'Backup data is required'
      });
    }

    const restoreResult = await SyncService.restoreUserData(userId, backupData);

    res.json({
      success: true,
      message: 'Data restored successfully',
      restore: restoreResult
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    
    if (error.message.includes('Invalid backup')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to restore data' 
    });
  }
});

// Merge session data (used during login)
router.post('/sync/merge-session', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const mergeResult = await SyncService.mergeSessionToUser(userId, sessionId);

    res.json({
      success: true,
      message: 'Session data merged successfully',
      merge: mergeResult
    });

  } catch (error) {
    console.error('Error merging session data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to merge session data' 
    });
  }
});

// Get user data summary (for sync interface)
router.get('/sync/data-summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await SyncService.getUserSyncData(userId);

    // Create summary without full data
    const summary = {
      progress: {
        totalProblems: userData.progress.length,
        solvedProblems: userData.progress.filter(p => p.is_solved).length,
        totalAttempts: userData.progress.reduce((sum, p) => sum + p.total_attempts, 0),
        lastActivity: userData.progress.length > 0 ? 
          Math.max(...userData.progress.map(p => new Date(p.last_attempt_at).getTime())) : null
      },
      bookmarks: {
        total: userData.bookmarks.length,
        byType: userData.bookmarks.reduce((acc, b) => {
          acc[b.bookmark_type] = (acc[b.bookmark_type] || 0) + 1;
          return acc;
        }, {})
      },
      achievements: {
        total: userData.achievements.length,
        recent: userData.achievements.slice(0, 5).map(a => ({
          type: a.achievement_type,
          earnedAt: a.earned_at
        }))
      },
      learningPaths: {
        total: userData.learningPaths.length,
        active: userData.learningPaths.filter(lp => lp.is_active).length,
        completed: userData.learningPaths.filter(lp => lp.completion_percentage >= 100).length
      }
    };

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error getting data summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get data summary' 
    });
  }
});

module.exports = router;