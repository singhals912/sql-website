const express = require('express');
const router = express.Router();
const { learningContent, learningPaths } = require('../data/learning-content');
const { validateSQLEquivalence, formatSQLForDisplay } = require('../utils/sqlFormatter');

// Get all learning modules
router.get('/modules', (req, res) => {
  try {
    const modules = Object.values(learningContent).map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      difficulty: module.difficulty,
      estimatedTime: module.estimatedTime,
      prerequisites: module.prerequisites,
      conceptCount: module.concepts.length
    }));

    res.json({
      success: true,
      modules: modules
    });
  } catch (error) {
    console.error('Error fetching learning modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning modules'
    });
  }
});

// Get specific learning module with full content
router.get('/modules/:moduleId', (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = learningContent[moduleId];

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Learning module not found'
      });
    }

    res.json({
      success: true,
      module: module
    });
  } catch (error) {
    console.error('Error fetching learning module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning module'
    });
  }
});

// Get specific concept within a module
router.get('/modules/:moduleId/concepts/:conceptId', (req, res) => {
  try {
    const { moduleId, conceptId } = req.params;
    const module = learningContent[moduleId];

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Learning module not found'
      });
    }

    const concept = module.concepts.find(c => c.id === conceptId);
    if (!concept) {
      return res.status(404).json({
        success: false,
        error: 'Concept not found'
      });
    }

    res.json({
      success: true,
      concept: concept,
      moduleInfo: {
        id: module.id,
        title: module.title,
        difficulty: module.difficulty
      }
    });
  } catch (error) {
    console.error('Error fetching concept:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch concept'
    });
  }
});

// Validate practice exercise
router.post('/modules/:moduleId/concepts/:conceptId/validate', (req, res) => {
  try {
    const { moduleId, conceptId } = req.params;
    const { query, exerciseIndex } = req.body;

    const module = learningContent[moduleId];
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Learning module not found'
      });
    }

    const concept = module.concepts.find(c => c.id === conceptId);
    if (!concept || !concept.practice || !concept.practice[exerciseIndex]) {
      return res.status(404).json({
        success: false,
        error: 'Practice exercise not found'
      });
    }

    const exercise = concept.practice[exerciseIndex];
    const isCorrect = validateSQLEquivalence(query, exercise.expectedQuery);

    res.json({
      success: true,
      isCorrect: isCorrect,
      feedback: isCorrect 
        ? 'Excellent! Your query is correct.'
        : 'Not quite right. Check the hint and try again.',
      expectedQuery: isCorrect ? null : formatSQLForDisplay(exercise.expectedQuery, { uppercase: true, addSemicolon: true }),
      hint: isCorrect ? null : exercise.hint
    });
  } catch (error) {
    console.error('Error validating exercise:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate exercise'
    });
  }
});

// Get all learning paths
router.get('/paths', (req, res) => {
  try {
    res.json({
      success: true,
      paths: Object.values(learningPaths)
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning paths'
    });
  }
});

// Get specific learning path
router.get('/paths/:pathId', (req, res) => {
  try {
    const { pathId } = req.params;
    const path = learningPaths[pathId];

    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }

    // Include module details in the path
    const pathWithModules = {
      ...path,
      modules: path.modules.map(moduleId => {
        const module = learningContent[moduleId];
        return {
          id: module.id,
          title: module.title,
          description: module.description,
          difficulty: module.difficulty,
          estimatedTime: module.estimatedTime,
          conceptCount: module.concepts.length
        };
      })
    };

    res.json({
      success: true,
      path: pathWithModules
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning path'
    });
  }
});

// Get learning progress for a user (placeholder - integrate with your auth system)
router.get('/progress/:userId?', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Placeholder implementation - you'd integrate with your user system
    const mockProgress = {
      userId: userId || 'anonymous',
      completedModules: ['basic-queries'],
      currentModule: 'aggregation',
      currentConcept: 'basic-aggregates',
      totalConceptsCompleted: 3,
      totalConcepts: Object.values(learningContent).reduce((sum, module) => sum + module.concepts.length, 0),
      completionPercentage: 15
    };

    res.json({
      success: true,
      progress: mockProgress
    });
  } catch (error) {
    console.error('Error fetching learning progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning progress'
    });
  }
});

// Update learning progress (placeholder)
router.post('/progress/:userId?', (req, res) => {
  try {
    const { userId } = req.params;
    const { moduleId, conceptId, completed } = req.body;

    // Placeholder implementation - you'd save to database
    console.log(`User ${userId || 'anonymous'} completed ${conceptId} in ${moduleId}: ${completed}`);

    res.json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating learning progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update learning progress'
    });
  }
});

// Get recommended next concepts based on progress
router.get('/recommendations/:userId?', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Simple recommendation logic - you'd make this more sophisticated
    const recommendations = [
      {
        moduleId: 'basic-queries',
        conceptId: 'select-basics',
        title: 'SELECT Statement Basics',
        reason: 'Perfect starting point for SQL beginners',
        difficulty: 'beginner',
        estimatedTime: '15 minutes'
      },
      {
        moduleId: 'aggregation',
        conceptId: 'basic-aggregates',
        title: 'Basic Aggregate Functions',
        reason: 'Next logical step after basic queries',
        difficulty: 'intermediate', 
        estimatedTime: '20 minutes'
      }
    ];

    res.json({
      success: true,
      recommendations: recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

module.exports = router;