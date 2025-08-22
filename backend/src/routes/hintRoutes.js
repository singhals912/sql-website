const express = require('express');
const router = express.Router();
const HintService = require('../services/hintService');
const authMiddleware = require('../middleware/authMiddleware');

// Helper to get user ID or session ID from request
const getUserIdentifier = (req) => {
  const userId = req.user?.userId || null;
  const sessionId = req.headers['x-session-id'] || req.body.sessionId || null;
  return { userId, sessionId };
};

// Get hints for a problem
router.get('/hints/problem/:problemId', authMiddleware.optional, async (req, res) => {
  try {
    const { problemId } = req.params;
    const hints = await HintService.getHintsForProblem(problemId);

    res.json({
      success: true,
      hints
    });

  } catch (error) {
    console.error('Error getting hints for problem:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to get hints' 
    });
  }
});

// Get available hints based on attempt count
router.get('/hints/available/:problemId', authMiddleware.optional, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { attempts = 0 } = req.query;
    
    const hints = await HintService.getAvailableHints(problemId, parseInt(attempts));

    res.json({
      success: true,
      hints
    });

  } catch (error) {
    console.error('Error getting available hints:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to get available hints' 
    });
  }
});

// Reveal a hint
router.post('/hints/:hintId/reveal', authMiddleware.optional, async (req, res) => {
  try {
    const { hintId } = req.params;
    const { problemId, attemptNumber = 0 } = req.body;
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'User ID or session ID is required'
      });
    }

    const result = await HintService.revealHint(
      userId, sessionId, problemId, hintId, attemptNumber
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error revealing hint:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to reveal hint' 
    });
  }
});

// Get hint usage for a problem
router.get('/hints/usage/:problemId', authMiddleware.optional, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        usage: []
      });
    }

    const usage = await HintService.getHintUsage(userId, sessionId, problemId);

    res.json({
      success: true,
      usage
    });

  } catch (error) {
    console.error('Error getting hint usage:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get hint usage' 
    });
  }
});

// Get hint statistics for user
router.get('/hints/statistics', authMiddleware.optional, async (req, res) => {
  try {
    const { userId, sessionId } = getUserIdentifier(req);

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        statistics: {
          total_hints_used: 0,
          problems_with_hints: 0,
          concept_hints_used: 0,
          text_hints_used: 0,
          code_hints_used: 0
        }
      });
    }

    const statistics = await HintService.getHintStatistics(userId, sessionId);

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Error getting hint statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get hint statistics' 
    });
  }
});

// Get hint effectiveness for a problem
router.get('/hints/effectiveness/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const effectiveness = await HintService.getHintEffectiveness(problemId);

    res.json({
      success: true,
      effectiveness
    });

  } catch (error) {
    console.error('Error getting hint effectiveness:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get hint effectiveness' 
    });
  }
});

module.exports = router;