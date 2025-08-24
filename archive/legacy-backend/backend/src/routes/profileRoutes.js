const express = require('express');
const router = express.Router();
const ProfileService = require('../services/profileService');
const authMiddleware = require('../middleware/authMiddleware');

// Get comprehensive user profile
router.get('/profile/complete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await ProfileService.getUserProfile(userId);

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error getting complete profile:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get profile' 
    });
  }
});

// Get user statistics
router.get('/profile/statistics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const statistics = await ProfileService.getUserStatistics(userId);

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get statistics' 
    });
  }
});

// Get recent activity
router.get('/profile/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 20 } = req.query;
    
    const activity = await ProfileService.getRecentActivity(userId, parseInt(limit));

    res.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Error getting activity:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get activity' 
    });
  }
});

// Get user achievements
router.get('/profile/achievements', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const achievements = await ProfileService.getUserAchievements(userId);

    res.json({
      success: true,
      achievements
    });

  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get achievements' 
    });
  }
});

// Update user preferences
router.put('/profile/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid preferences object is required'
      });
    }

    const updatedPreferences = await ProfileService.updatePreferences(userId, preferences);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update preferences' 
    });
  }
});

// Set user goals
router.post('/profile/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { goals } = req.body;

    if (!goals || !Array.isArray(goals)) {
      return res.status(400).json({
        success: false,
        error: 'Goals array is required'
      });
    }

    // Validate each goal
    for (const goal of goals) {
      if (!goal.type || !goal.target) {
        return res.status(400).json({
          success: false,
          error: 'Each goal must have a type and target value'
        });
      }
    }

    const result = await ProfileService.setUserGoals(userId, goals);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error setting goals:', error);
    
    if (error.message.includes('Invalid goal type')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to set goals' 
    });
  }
});

// Get goal progress
router.get('/profile/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const goalProgress = await ProfileService.getGoalProgress(userId);

    res.json({
      success: true,
      goals: goalProgress
    });

  } catch (error) {
    console.error('Error getting goal progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get goal progress' 
    });
  }
});

// Update avatar
router.put('/profile/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: 'Avatar URL is required'
      });
    }

    // Basic URL validation
    try {
      new URL(avatarUrl);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid avatar URL'
      });
    }

    const result = await ProfileService.updateAvatar(userId, avatarUrl);

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatarUrl: result.avatarUrl
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update avatar' 
    });
  }
});

// Get user comparison with platform
router.get('/profile/comparison', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const comparison = await ProfileService.getUserComparison(userId);

    res.json({
      success: true,
      comparison
    });

  } catch (error) {
    console.error('Error getting user comparison:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get comparison data' 
    });
  }
});

// Get current streaks
router.get('/profile/streaks', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const streaks = await ProfileService.getCurrentStreaks(userId);

    res.json({
      success: true,
      streaks
    });

  } catch (error) {
    console.error('Error getting streaks:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get streaks' 
    });
  }
});

// Generate profile summary for sharing
router.get('/profile/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await ProfileService.getUserProfile(userId);

    // Create a shareable summary
    const summary = {
      username: profile.user.username || 'Anonymous User',
      joinDate: profile.user.created_at,
      stats: {
        problemsSolved: profile.statistics.problemSolving.problemsSolved,
        totalAttempts: profile.statistics.problemSolving.totalAttempts,
        successRate: profile.statistics.problemSolving.successRate,
        activeDays: profile.statistics.activity.activeDays,
        percentileRank: profile.statistics.ranking.percentile
      },
      achievements: {
        total: profile.achievements.total,
        recent: profile.achievements.recent.slice(0, 3)
      },
      difficultyBreakdown: profile.statistics.difficultyBreakdown
    };

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error generating profile summary:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate profile summary' 
    });
  }
});

module.exports = router;