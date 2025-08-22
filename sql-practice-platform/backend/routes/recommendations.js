/**
 * Recommendations API Routes
 * Provides intelligent problem recommendations and personalized learning insights
 */

const express = require('express');
const router = express.Router();
const recommendationEngine = require('../services/recommendationEngine');
const progressAnalytics = require('../services/progressAnalytics');
const smartHints = require('../services/smartHints');

/**
 * GET /api/recommendations/problems
 * Get personalized problem recommendations for a user
 */
router.get('/problems', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const limit = parseInt(req.query.limit) || 5;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const recommendations = await recommendationEngine.getRecommendations(sessionId, limit);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting problem recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
});

/**
 * GET /api/recommendations/daily-challenge
 * Get daily challenge problem for a user
 */
router.get('/daily-challenge', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const dailyChallenge = await recommendationEngine.getDailyChallenge(sessionId);
    
    if (!dailyChallenge) {
      return res.status(404).json({
        success: false,
        error: 'No daily challenge available'
      });
    }

    res.json({
      success: true,
      data: {
        challenge: dailyChallenge,
        description: 'Complete today\'s challenge to maintain your learning streak!'
      }
    });
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get daily challenge'
    });
  }
});

/**
 * GET /api/recommendations/progress-dashboard
 * Get comprehensive progress dashboard with analytics
 */
router.get('/progress-dashboard', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const dashboard = await progressAnalytics.getProgressDashboard(sessionId);
    
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting progress dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get progress dashboard'
    });
  }
});

/**
 * GET /api/recommendations/hints/:problemId
 * Get progressive hints for a specific problem
 */
router.get('/hints/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const sessionId = req.headers['x-session-id'];
    const userAttempts = parseInt(req.query.attempts) || 0;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const hints = await smartHints.getProgressiveHints(problemId, sessionId, userAttempts);
    
    res.json(hints);
  } catch (error) {
    console.error('Error getting progressive hints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hints'
    });
  }
});

/**
 * POST /api/recommendations/hint-usage
 * Track hint usage for analytics
 */
router.post('/hint-usage', async (req, res) => {
  try {
    const { hintId, problemId } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId || !hintId || !problemId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID, hint ID, and problem ID are required'
      });
    }

    const result = await smartHints.trackHintUsage(hintId, sessionId, problemId);
    
    res.json(result);
  } catch (error) {
    console.error('Error tracking hint usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track hint usage'
    });
  }
});

/**
 * GET /api/recommendations/learning-path/:category
 * Get recommended next problems in a specific category
 */
router.get('/learning-path/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const sessionId = req.headers['x-session-id'];
    const limit = parseInt(req.query.limit) || 3;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Get user's mastery in this category
    const userProfile = await recommendationEngine.getUserProfile(sessionId);
    const conceptMastery = await recommendationEngine.getConceptMastery(sessionId);
    
    const categoryMastery = conceptMastery[category];
    
    if (!categoryMastery) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Determine next difficulty level
    const nextDifficulty = categoryMastery.difficulties.easy?.mastery_percentage < 70 ? 'easy' :
                          categoryMastery.difficulties.medium?.mastery_percentage < 70 ? 'medium' : 'hard';

    const problems = await recommendationEngine.getProblemsForConcept(category, nextDifficulty, userProfile);
    
    res.json({
      success: true,
      data: {
        problems,
        category,
        currentMastery: categoryMastery.overall_mastery,
        recommendedDifficulty: nextDifficulty,
        progressInsight: `You're ${categoryMastery.overall_mastery}% complete with ${category} problems`
      }
    });
  } catch (error) {
    console.error('Error getting learning path recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get learning path recommendations'
    });
  }
});

/**
 * GET /api/recommendations/skill-gaps
 * Identify areas where user needs improvement
 */
router.get('/skill-gaps', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const conceptMastery = await recommendationEngine.getConceptMastery(sessionId);
    const gaps = recommendationEngine.identifyLearningGaps(conceptMastery);
    
    res.json({
      success: true,
      data: {
        skillGaps: gaps,
        totalConcepts: Object.keys(conceptMastery).length,
        masteredConcepts: Object.values(conceptMastery).filter(c => c.overall_mastery >= 70).length,
        recommendation: gaps.length > 0 ? 
          `Focus on ${gaps[0].concept} next - you're ${gaps[0].current_mastery}% complete` :
          'Great job! You have strong mastery across all SQL concepts.'
      }
    });
  } catch (error) {
    console.error('Error identifying skill gaps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to identify skill gaps'
    });
  }
});

/**
 * GET /api/recommendations/achievements
 * Get user achievements and progress towards next achievements
 */
router.get('/achievements', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const dashboard = await progressAnalytics.getProgressDashboard(sessionId);
    
    if (!dashboard.success) {
      return res.status(500).json(dashboard);
    }

    res.json({
      success: true,
      data: dashboard.data.achievements
    });
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievements'
    });
  }
});

/**
 * GET /api/recommendations/personalized-hint
 * Get a personalized hint based on user's current query attempt
 */
router.post('/personalized-hint', async (req, res) => {
  try {
    const { problemId, userQuery } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId || !problemId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and problem ID are required'
      });
    }

    const problemContext = await smartHints.getProblemContext(problemId);
    const personalizedHint = smartHints.generatePersonalizedHint(userQuery, problemContext);
    
    res.json({
      success: true,
      data: {
        hint: personalizedHint,
        contextual: true,
        message: personalizedHint ? 
          'Here\'s a suggestion based on your current query:' :
          'Keep working on it! Your query is on the right track.'
      }
    });
  } catch (error) {
    console.error('Error generating personalized hint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate personalized hint'
    });
  }
});

module.exports = router;