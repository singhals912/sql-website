const express = require('express');
const ProgressService = require('../services/progressService');
const router = express.Router();

// Middleware to get or create session ID
const getSessionId = (req, res, next) => {
  // Try to get session ID from various sources
  let sessionId = req.headers['x-session-id'] || 
                  req.query.sessionId || 
                  req.body.sessionId ||
                  req.session?.id;
  
  // If no session ID, generate one (simple UUID-like string)
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  req.sessionId = sessionId;
  next();
};

// Initialize or get session
router.post('/session', getSessionId, async (req, res) => {
  try {
    const { ipAddress, userAgent } = req.body;
    const session = await ProgressService.initializeSession(
      req.sessionId, 
      ipAddress || req.ip, 
      userAgent || req.get('User-Agent')
    );
    
    res.json({ 
      success: true, 
      sessionId: req.sessionId,
      session 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Record a problem attempt
router.post('/attempt', getSessionId, async (req, res) => {
  try {
    const {
      problemId,
      problemNumericId,
      query,
      isCorrect,
      executionTimeMs,
      errorMessage,
      hintUsed = false,
      solutionViewed = false
    } = req.body;

    if (!problemId || !problemNumericId || !query) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: problemId, problemNumericId, query'
      });
    }

    const attempt = await ProgressService.recordAttempt(
      req.sessionId,
      problemId,
      problemNumericId,
      query,
      isCorrect,
      executionTimeMs,
      errorMessage,
      hintUsed,
      solutionViewed
    );

    // Update session activity
    await ProgressService.updateSessionActivity(req.sessionId);

    res.json({ 
      success: true, 
      attempt,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get comprehensive user progress
router.get('/overview', getSessionId, async (req, res) => {
  try {
    const progress = await ProgressService.getUserProgress(req.sessionId);
    
    res.json({ 
      success: true, 
      progress,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get detailed progress for all problems
router.get('/detailed', getSessionId, async (req, res) => {
  try {
    const problems = await ProgressService.getDetailedProgress(req.sessionId);
    
    res.json({ 
      success: true, 
      problems,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get user statistics
router.get('/stats', getSessionId, async (req, res) => {
  try {
    const progress = await ProgressService.getUserProgress(req.sessionId);
    
    // Extract key stats
    const stats = {
      overview: progress.overview,
      topCategory: progress.byCategory.length > 0 ? 
        progress.byCategory.reduce((prev, current) => 
          (prev.completed > current.completed) ? prev : current
        ) : null,
      recentAchievements: progress.achievements.slice(0, 5),
      currentStreaks: progress.streaks.filter(s => s.current_count > 0),
      performanceMetrics: {
        averageAttemptsPerProblem: progress.overview.avgAttemptsPerProblem,
        averageExecutionTime: progress.overview.avgExecutionTime,
        difficultyBreakdown: progress.byDifficulty
      }
    };
    
    res.json({ 
      success: true, 
      stats,
      sessionId: req.sessionId
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get leaderboard (anonymous)
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await ProgressService.getLeaderboard(limit);
    
    res.json({ 
      success: true, 
      leaderboard 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update session activity (heartbeat)
router.post('/heartbeat', getSessionId, async (req, res) => {
  try {
    await ProgressService.updateSessionActivity(req.sessionId);
    
    res.json({ 
      success: true, 
      sessionId: req.sessionId 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;