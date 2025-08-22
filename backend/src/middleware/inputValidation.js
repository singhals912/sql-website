const validator = require('validator');
const rateLimit = require('express-rate-limit');

class InputValidator {
  /**
   * Validate SQL execution request
   */
  static validateSQLRequest(req, res, next) {
    const { query, dialect, problemId } = req.body;
    const errors = [];

    // Validate query
    if (!query) {
      errors.push('SQL query is required');
    } else if (typeof query !== 'string') {
      errors.push('SQL query must be a string');
    } else if (query.length > 10000) {
      errors.push('SQL query too long (maximum 10,000 characters)');
    } else if (query.trim().length < 3) {
      errors.push('SQL query too short (minimum 3 characters)');
    }

    // Validate dialect
    const allowedDialects = ['postgresql', 'mysql'];
    if (dialect && !allowedDialects.includes(dialect)) {
      errors.push(`Invalid dialect. Allowed: ${allowedDialects.join(', ')}`);
    }

    // Validate problemId if provided
    if (problemId !== undefined) {
      if (typeof problemId === 'string') {
        // Check if it's UUID or numeric
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(problemId) && 
            !/^\d+$/.test(problemId)) {
          errors.push('Invalid problemId format');
        }
      } else if (typeof problemId === 'number') {
        if (!Number.isInteger(problemId) || problemId < 1 || problemId > 10000) {
          errors.push('Invalid problemId range (1-10000)');
        }
      } else {
        errors.push('problemId must be string or number');
      }
    }

    // Validate session ID
    const sessionId = req.headers['x-session-id'];
    if (sessionId && !validator.isAlphanumeric(sessionId.replace(/[_-]/g, ''))) {
      errors.push('Invalid session ID format');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
        executionTime: '0ms'
      });
    }

    next();
  }

  /**
   * Validate problem request (GET /problems/:id)
   */
  static validateProblemRequest(req, res, next) {
    const { id } = req.params;
    const errors = [];

    if (!id) {
      errors.push('Problem ID is required');
    } else if (typeof id !== 'string') {
      errors.push('Problem ID must be a string');
    } else {
      // Check if it's UUID or numeric ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const isNumeric = /^\d+$/.test(id);
      
      if (!isUUID && !isNumeric) {
        errors.push('Problem ID must be UUID or numeric');
      } else if (isNumeric) {
        const numId = parseInt(id);
        if (numId < 1 || numId > 10000) {
          errors.push('Numeric problem ID must be between 1 and 10000');
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid problem ID',
        details: errors
      });
    }

    next();
  }

  /**
   * Validate problem setup request (POST /problems/:problemId/setup)
   */
  static validateProblemSetupRequest(req, res, next) {
    const { problemId } = req.params;
    const errors = [];

    if (!problemId) {
      errors.push('Problem ID is required');
    } else if (typeof problemId !== 'string') {
      errors.push('Problem ID must be a string');
    } else {
      // Check if it's UUID or numeric ID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(problemId);
      const isNumeric = /^\d+$/.test(problemId);
      
      if (!isUUID && !isNumeric) {
        errors.push('Problem ID must be UUID or numeric');
      } else if (isNumeric) {
        const numId = parseInt(problemId);
        if (numId < 1 || numId > 10000) {
          errors.push('Numeric problem ID must be between 1 and 10000');
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid problem ID',
        details: errors
      });
    }

    next();
  }

  /**
   * Validate problems list request
   */
  static validateProblemsRequest(req, res, next) {
    const { difficulty, category, company, limit, offset } = req.query;
    const errors = [];

    // Validate difficulty
    if (difficulty) {
      const allowedDifficulties = ['easy', 'medium', 'hard'];
      if (!allowedDifficulties.includes(difficulty.toLowerCase())) {
        errors.push(`Invalid difficulty. Allowed: ${allowedDifficulties.join(', ')}`);
      }
    }

    // Validate category
    if (category && !validator.isAlpha(category.replace(/\s+/g, ''))) {
      errors.push('Category must contain only letters and spaces');
    }

    // Validate company
    if (company && !validator.isAlpha(company.replace(/[\s&]/g, ''))) {
      errors.push('Company must contain only letters, spaces, and &');
    }

    // Validate limit
    if (limit !== undefined) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
        errors.push('Limit must be between 1 and 1000');
      }
    }

    // Validate offset
    if (offset !== undefined) {
      const offsetNum = parseInt(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        errors.push('Offset must be non-negative');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html) {
    if (!html) return html;
    
    // Basic HTML sanitization (in production, use a library like DOMPurify)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  /**
   * Validate and sanitize user input
   */
  static sanitizeUserInput(req, res, next) {
    // Sanitize common string fields
    const stringFields = ['query', 'title', 'description', 'category'];
    
    for (const field of stringFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = validator.escape(req.body[field]).trim();
      }
    }

    next();
  }

  /**
   * Security headers middleware
   */
  static securityHeaders(req, res, next) {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // CSP for API
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'none'; object-src 'none';"
    );

    next();
  }
}

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use default IP handling to properly handle IPv6
    skip: (req) => {
      // Skip rate limiting for health check
      return req.path === '/api/health';
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // SQL execution: 30 queries per minute per session
  sqlExecution: createRateLimit(
    60 * 1000, // 1 minute
    30,
    'Too many SQL queries. Please wait before trying again.'
  ),

  // API requests: 500 requests per minute per IP (increased for development)
  general: createRateLimit(
    60 * 1000, // 1 minute
    500,
    'Too many API requests. Please slow down.'
  ),

  // Problem loading: 200 requests per minute per IP
  problems: createRateLimit(
    60 * 1000, // 1 minute  
    200,
    'Too many problem requests. Please wait a moment.'
  ),

  // Strict rate limit for expensive operations
  strict: createRateLimit(
    60 * 1000, // 1 minute
    10,
    'Rate limit exceeded for this operation.'
  )
};

module.exports = {
  InputValidator,
  rateLimits
};