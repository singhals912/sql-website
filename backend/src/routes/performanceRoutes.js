const express = require('express');
const router = express.Router();
const PerformanceService = require('../services/performanceService');
const authMiddleware = require('../middleware/authMiddleware');

// Helper to get user identifier
const getUserIdentifier = (req) => {
  const userId = req.user?.userId || null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
  return { userId, sessionId };
};

// Get system-wide performance metrics (admin/monitoring endpoint)
router.get('/performance/metrics', async (req, res) => {
  try {
    const metrics = await PerformanceService.getPerformanceMetrics();
    
    res.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get performance metrics' 
    });
  }
});

// Get user-specific performance metrics
router.get('/performance/user', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const userMetrics = await PerformanceService.getUserPerformanceMetrics(sessionId, userId);
    
    if (!userMetrics) {
      return res.json({
        success: true,
        metrics: {
          sessionId: sessionId,
          message: 'No performance data available yet'
        }
      });
    }

    res.json({
      success: true,
      metrics: userMetrics
    });

  } catch (error) {
    console.error('Error getting user performance metrics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user performance metrics' 
    });
  }
});

// Get performance leaderboard
router.get('/performance/leaderboard', async (req, res) => {
  try {
    const metrics = await PerformanceService.getPerformanceMetrics();
    
    // Extract top performers based on avg execution time and success rate
    const activeSessions = Array.from(PerformanceService.metricsCache.userSessions.values())
      .filter(session => session.queryCount >= 5) // Minimum queries for leaderboard
      .map(session => ({
        sessionId: session.sessionId.substring(0, 8) + '...', // Anonymize
        queryCount: session.queryCount,
        avgExecutionTime: Math.round(session.avgExecutionTime * 100) / 100,
        successRate: Math.round((session.successCount / session.queryCount) * 100),
        problemsSolved: session.problemsSolved.size,
        score: Math.round(((session.successCount / session.queryCount) * 1000) / (session.avgExecutionTime / 1000))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json({
      success: true,
      leaderboard: activeSessions,
      criteria: {
        minimumQueries: 5,
        scoreFormula: "(successRate * 1000) / (avgExecutionTime / 1000)"
      }
    });

  } catch (error) {
    console.error('Error getting performance leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get performance leaderboard' 
    });
  }
});

// Health check endpoint for performance monitoring
router.get('/performance/health', async (req, res) => {
  try {
    const metrics = await PerformanceService.getPerformanceMetrics();
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      checks: {
        avgExecutionTime: {
          value: metrics.overview.avgExecutionTime,
          status: metrics.overview.avgExecutionTime < 2000 ? 'good' : 'warning',
          threshold: 2000
        },
        successRate: {
          value: metrics.overview.successRate,
          status: metrics.overview.successRate > 85 ? 'good' : 'warning',
          threshold: 85
        },
        slowQueries: {
          value: metrics.topSlowQueries.length,
          status: metrics.topSlowQueries.length < 5 ? 'good' : 'warning',
          threshold: 5
        }
      }
    };

    // Determine overall health
    const warningChecks = Object.values(health.checks).filter(check => check.status === 'warning');
    if (warningChecks.length > 1) {
      health.status = 'degraded';
    }

    res.json({
      success: true,
      health
    });

  } catch (error) {
    console.error('Error getting performance health:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get performance health',
      health: {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message
      }
    });
  }
});

module.exports = router;