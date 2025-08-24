const express = require('express');
const router = express.Router();
const { executeSQL, getProblems, getProblem, setupProblemEnvironment, getCompanies } = require('../controllers/sqlControllerV2');
const { InputValidator, rateLimits } = require('../middleware/inputValidation');

// Execute SQL query with security validation and rate limiting
router.post('/execute', 
  rateLimits.sqlExecution, 
  InputValidator.validateSQLRequest,
  executeSQL
);

// Get all problems with filtering and validation
router.get('/problems', 
  rateLimits.problems,
  InputValidator.validateProblemsRequest,
  getProblems
);

// Get companies list with rate limiting
router.get('/companies', 
  rateLimits.general,
  getCompanies
);

// Get specific problem with validation
router.get('/problems/:id', 
  rateLimits.problems,
  InputValidator.validateProblemRequest,
  getProblem
);

// Set up problem environment with validation and rate limiting
router.post('/problems/:problemId/setup', 
  rateLimits.strict,
  InputValidator.validateProblemSetupRequest,
  setupProblemEnvironment
);

module.exports = router;