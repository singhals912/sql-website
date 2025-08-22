const express = require('express');
const router = express.Router();
const ExplanationService = require('../services/explanationService');

// Get enhanced explanation for a problem
router.get('/problems/:problemId/explanation', async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const explanation = await ExplanationService.getEnhancedExplanation(problemId);
    
    res.json({
      success: true,
      explanation
    });

  } catch (error) {
    console.error('Error getting enhanced explanation:', error);
    
    if (error.message === 'Problem not found') {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get enhanced explanation'
    });
  }
});

// Get explanation for specific SQL concepts
router.get('/concepts/:conceptName/explanation', async (req, res) => {
  try {
    const { conceptName } = req.params;
    
    const concept = ExplanationService.conceptExplanations[conceptName.toUpperCase()];
    
    if (!concept) {
      return res.status(404).json({
        success: false,
        error: 'Concept not found'
      });
    }
    
    res.json({
      success: true,
      concept
    });

  } catch (error) {
    console.error('Error getting concept explanation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get concept explanation'
    });
  }
});

// Get all available SQL concepts
router.get('/concepts', async (req, res) => {
  try {
    const concepts = Object.keys(ExplanationService.conceptExplanations).map(key => ({
      name: key,
      title: ExplanationService.conceptExplanations[key].title,
      description: ExplanationService.conceptExplanations[key].description
    }));
    
    res.json({
      success: true,
      concepts
    });

  } catch (error) {
    console.error('Error getting concepts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get concepts'
    });
  }
});

// Get difficulty guide
router.get('/difficulty/:level/guide', async (req, res) => {
  try {
    const { level } = req.params;
    
    const guide = ExplanationService.difficultyGuides[level.toLowerCase()];
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        error: 'Difficulty level not found'
      });
    }
    
    res.json({
      success: true,
      guide: {
        level,
        ...guide
      }
    });

  } catch (error) {
    console.error('Error getting difficulty guide:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get difficulty guide'
    });
  }
});

module.exports = router;