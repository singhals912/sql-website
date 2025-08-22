const validator = require('validator');

class SQLSecurityValidator {
  constructor() {
    // Dangerous keywords that should be completely blocked
    this.dangerousKeywords = [
      'DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE',
      'EXEC', 'EXECUTE', 'DECLARE', 'CURSOR', 'PROCEDURE', 'FUNCTION',
      'TRIGGER', 'VIEW', 'INDEX', 'SCHEMA', 'DATABASE', 'GRANT', 'REVOKE',
      'COMMIT', 'ROLLBACK', 'SAVEPOINT', 'LOCK', 'UNLOCK'
    ];

    // Suspicious patterns that might indicate injection attempts
    this.suspiciousPatterns = [
      /;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)/gi,  // Multiple statements
      /UNION\s+SELECT/gi,                                 // Union-based injection
      /'\s*OR\s+'[^']*'\s*=\s*'/gi,                      // OR-based injection
      /--\s*[^\r\n]*/g,                                  // SQL comments (suspicious)
      /\/\*[\s\S]*?\*\//g,                               // Block comments
      /0x[0-9A-Fa-f]+/g,                                 // Hexadecimal values
      /WAITFOR\s+DELAY/gi,                               // Time-based attacks
      /BENCHMARK\s*\(/gi,                                // MySQL benchmark attacks
      /SLEEP\s*\(/gi,                                    // Sleep attacks
      /pg_sleep\s*\(/gi,                                 // PostgreSQL sleep
      /information_schema/gi,                            // Schema enumeration
      /sys\./gi,                                         // System tables
      /master\./gi,                                      // SQL Server system DB
      /msdb\./gi,                                        // SQL Server system DB
      /tempdb\./gi                                       // SQL Server temp DB
    ];

    // Allowed SELECT-only patterns for practice queries (using 'i' flag only to avoid global state)
    this.allowedPatterns = [
      /^SELECT\s+/i,
      /^WITH\s+/i,      // Common Table Expressions
      /^EXPLAIN\s+/i,   // Query analysis
      /^DESCRIBE\s+/i,  // Table description
      /^SHOW\s+/i       // MySQL show commands (translated)
    ];

    // Rate limiting storage (in production, use Redis)
    this.rateLimitStore = new Map();
    this.rateLimitWindow = 60000; // 1 minute
    this.maxQueriesPerWindow = 30; // 30 queries per minute per IP
  }

  /**
   * Comprehensive SQL injection validation
   */
  validateQuery(query, userIP = null) {
    const result = {
      isValid: false,
      riskLevel: 'low', // low, medium, high, critical
      violations: [],
      sanitizedQuery: query && typeof query === 'string' ? query.trim() : ''
    };

    try {
      // Basic validation
      if (!query || typeof query !== 'string') {
        result.violations.push('Invalid query format');
        result.riskLevel = 'high';
        return result;
      }

      // Normalize query for analysis
      const normalizedQuery = query.trim().toUpperCase();
      
      // Check if query is empty or too short
      if (normalizedQuery.length < 3) {
        result.violations.push('Query too short');
        result.riskLevel = 'medium';
        return result;
      }

      // Check query length (prevent DoS)
      if (query.length > 10000) {
        result.violations.push('Query too long (max 10,000 characters)');
        result.riskLevel = 'high';
        return result;
      }

      // 1. Check for dangerous keywords
      for (const keyword of this.dangerousKeywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(normalizedQuery)) {
          result.violations.push(`Dangerous keyword detected: ${keyword}`);
          result.riskLevel = 'critical';
          return result;
        }
      }

      // 2. Check for suspicious patterns
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(query)) {
          result.violations.push(`Suspicious pattern detected: ${pattern.source}`);
          result.riskLevel = result.riskLevel === 'critical' ? 'critical' : 'high';
        }
      }

      // 3. Ensure query starts with allowed patterns
      const startsWithAllowed = this.allowedPatterns.some(pattern => 
        pattern.test(normalizedQuery)
      );

      if (!startsWithAllowed) {
        result.violations.push('Query must start with SELECT, WITH, EXPLAIN, DESCRIBE, or SHOW');
        result.riskLevel = 'high';
        return result;
      }

      // 4. Check for multiple statements (basic check)
      const statements = query.split(';').filter(stmt => stmt.trim().length > 0);
      if (statements.length > 1) {
        result.violations.push('Multiple statements not allowed');
        result.riskLevel = 'high';
        return result;
      }

      // 5. Validate parentheses balance (prevent syntax confusion)
      if (!this.isParenthesesBalanced(query)) {
        result.violations.push('Unbalanced parentheses detected');
        result.riskLevel = 'medium';
        return result;
      }

      // 6. Check quote balance
      if (!this.isQuotesBalanced(query)) {
        result.violations.push('Unbalanced quotes detected');
        result.riskLevel = 'medium';
        return result;
      }

      // 7. Rate limiting check
      if (userIP && !this.checkRateLimit(userIP)) {
        result.violations.push('Rate limit exceeded');
        result.riskLevel = 'high';
        return result;
      }

      // If we get here and no violations, query is valid
      if (result.violations.length === 0) {
        result.isValid = true;
        result.riskLevel = 'low';
      }

      return result;

    } catch (error) {
      result.violations.push(`Validation error: ${error.message}`);
      result.riskLevel = 'high';
      return result;
    }
  }

  /**
   * Check if parentheses are balanced
   */
  isParenthesesBalanced(query) {
    let count = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      
      // Handle string literals
      if ((char === '"' || char === "'") && !inString) {
        inString = true;
        stringChar = char;
        continue;
      }
      
      if (char === stringChar && inString) {
        // Check if it's escaped
        let escaped = false;
        let backCount = 0;
        for (let j = i - 1; j >= 0 && query[j] === '\\'; j--) {
          backCount++;
        }
        escaped = backCount % 2 === 1;
        
        if (!escaped) {
          inString = false;
          stringChar = '';
        }
        continue;
      }

      if (!inString) {
        if (char === '(') count++;
        else if (char === ')') count--;
        
        if (count < 0) return false; // More closing than opening
      }
    }

    return count === 0;
  }

  /**
   * Check if quotes are balanced
   */
  isQuotesBalanced(query) {
    let singleQuotes = 0;
    let doubleQuotes = 0;

    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      
      if (char === "'") {
        // Check if escaped
        let escaped = false;
        let backCount = 0;
        for (let j = i - 1; j >= 0 && query[j] === '\\'; j--) {
          backCount++;
        }
        escaped = backCount % 2 === 1;
        
        if (!escaped) singleQuotes++;
      }
      
      if (char === '"') {
        // Check if escaped
        let escaped = false;
        let backCount = 0;
        for (let j = i - 1; j >= 0 && query[j] === '\\'; j--) {
          backCount++;
        }
        escaped = backCount % 2 === 1;
        
        if (!escaped) doubleQuotes++;
      }
    }

    return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0;
  }

  /**
   * Rate limiting check
   */
  checkRateLimit(userIP) {
    const now = Date.now();
    const userKey = `rate_limit_${userIP}`;
    
    // Clean old entries
    this.cleanRateLimitStore();
    
    if (!this.rateLimitStore.has(userKey)) {
      this.rateLimitStore.set(userKey, { count: 1, windowStart: now });
      return true;
    }

    const userRecord = this.rateLimitStore.get(userKey);
    
    // Check if we're in a new window
    if (now - userRecord.windowStart > this.rateLimitWindow) {
      this.rateLimitStore.set(userKey, { count: 1, windowStart: now });
      return true;
    }

    // Check if user has exceeded limit
    if (userRecord.count >= this.maxQueriesPerWindow) {
      return false;
    }

    // Increment count
    userRecord.count++;
    return true;
  }

  /**
   * Clean old rate limit entries
   */
  cleanRateLimitStore() {
    const now = Date.now();
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (now - value.windowStart > this.rateLimitWindow * 2) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  sanitizeForLogging(query) {
    return query
      .replace(/'[^']*'/g, "'***'")  // Replace string literals
      .replace(/"[^"]*"/g, '"***"')  // Replace quoted identifiers
      .replace(/\b\d+\b/g, 'NUM')    // Replace numbers
      .substring(0, 200);            // Limit length
  }

  /**
   * Get security report for monitoring
   */
  getSecurityReport() {
    return {
      rateLimitEntries: this.rateLimitStore.size,
      dangerousKeywords: this.dangerousKeywords.length,
      suspiciousPatterns: this.suspiciousPatterns.length,
      maxQueriesPerWindow: this.maxQueriesPerWindow,
      rateLimitWindow: this.rateLimitWindow
    };
  }
}

module.exports = SQLSecurityValidator;