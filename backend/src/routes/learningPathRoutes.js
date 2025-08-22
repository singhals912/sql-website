const express = require('express');
const router = express.Router();
const LearningPathService = require('../services/learningPathService');
const authMiddleware = require('../middleware/authMiddleware');

// Helper to get user ID or session ID from request
const getUserIdentifier = (req) => {
  const userId = req.user?.userId || null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
  return { userId, sessionId };
};

// Get all learning paths
router.get('/learning-paths', async (req, res) => {
  try {
    const learningPaths = await LearningPathService.getAllLearningPaths();

    res.json({
      success: true,
      learningPaths
    });

  } catch (error) {
    console.error('Error getting learning paths:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get learning paths' 
    });
  }
});

// Get specific learning path with steps
router.get('/learning-paths/:pathId', async (req, res) => {
  try {
    const { pathId } = req.params;
    const learningPath = await LearningPathService.getLearningPathWithSteps(pathId);

    res.json({
      success: true,
      learningPath
    });

  } catch (error) {
    console.error('Error getting learning path:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to get learning path' 
    });
  }
});

// Start a learning path
router.post('/learning-paths/:pathId/start', authMiddleware.optional, async (req, res) => {
  try {
    const { pathId } = req.params;
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const progress = await LearningPathService.startLearningPath(userId, sessionId, pathId);

    res.json({
      success: true,
      message: 'Learning path started successfully',
      progress
    });

  } catch (error) {
    console.error('Error starting learning path:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to start learning path' 
    });
  }
});

// Get user progress for learning paths
router.get('/learning-paths/progress', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const progress = await LearningPathService.getUserProgress(userId, sessionId);

    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error getting learning path progress:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get progress' 
    });
  }
});

// Update step completion
router.put('/learning-paths/:pathId/steps/:stepId', authMiddleware.optional, async (req, res) => {
  try {
    const { pathId, stepId } = req.params;
    const { completed } = req.body;
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const progress = await LearningPathService.updateStepCompletion(
      userId, sessionId, pathId, stepId, completed
    );

    res.json({
      success: true,
      message: 'Step completion updated',
      progress
    });

  } catch (error) {
    console.error('Error updating step completion:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to update step completion' 
    });
  }
});

// Get learning path statistics
router.get('/learning-paths/statistics', async (req, res) => {
  try {
    const statistics = await LearningPathService.getStatistics();

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Error getting learning path statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get statistics' 
    });
  }
});

// Get recommendations for user
router.get('/learning-paths/recommendations', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        recommendations: {
          recommendedLevel: 'beginner',
          paths: [],
          userStats: {}
        }
      });
    }

    const recommendations = await LearningPathService.getRecommendations(userId, sessionId);

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get recommendations' 
    });
  }
});

// Get next problem in learning path
router.get('/learning-paths/:pathId/next/:problemId', async (req, res) => {
  try {
    const { pathId, problemId } = req.params;
    const nextProblem = await LearningPathService.getNextProblemInPath(pathId, problemId);

    if (!nextProblem) {
      return res.json({
        success: true,
        nextProblem: null,
        message: 'You have completed this learning path!'
      });
    }

    res.json({
      success: true,
      nextProblem
    });

  } catch (error) {
    console.error('Error getting next problem in path:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get next problem' 
    });
  }
});

// Get problem position in learning path
router.get('/learning-paths/:pathId/position/:problemId', async (req, res) => {
  try {
    const { pathId, problemId } = req.params;
    const position = await LearningPathService.getProblemPositionInPath(pathId, problemId);

    if (!position) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found in this learning path'
      });
    }

    res.json({
      success: true,
      position
    });

  } catch (error) {
    console.error('Error getting problem position in path:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get problem position' 
    });
  }
});

// Get learning paths for a specific problem
router.get('/problems/:problemId/learning-paths', async (req, res) => {
  try {
    const { problemId } = req.params;
    const learningPaths = await LearningPathService.getLearningPathsForProblem(problemId);

    res.json({
      success: true,
      learningPaths
    });

  } catch (error) {
    console.error('Error getting learning paths for problem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get learning paths for problem' 
    });
  }
});

module.exports = router;