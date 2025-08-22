/**
 * SQL Security and Sandboxing Service
 * Provides secure execution of user-submitted SQL queries
 */

class SQLSecurityService {
  constructor() {
    // Dangerous SQL keywords that should never be allowed in user queries
    this.dangerousKeywords = [
      // Data Definition Language (DDL) - Structure modification
      'DROP', 'CREATE', 'ALTER', 'TRUNCATE', 'RENAME',
      
      // Data Control Language (DCL) - Permissions and users
      'GRANT', 'REVOKE', 'DENY',
      
      // Database administration
      'SHOW', 'DESCRIBE', 'EXPLAIN', 'ANALYZE',
      
      // Transaction control that could be abused
      'COMMIT', 'ROLLBACK', 'SAVEPOINT',
      
      // System and meta commands
      'USE', 'SET', 'RESET', 'FLUSH', 'KILL', 'SHUTDOWN',
      
      // File operations
      'LOAD', 'OUTFILE', 'INFILE', 'IMPORT', 'EXPORT',
      
      // User and security functions
      'USER', 'PASSWORD', 'IDENTIFIED',
      
      // Stored procedures and functions
      'PROCEDURE', 'FUNCTION', 'TRIGGER', 'EVENT',
      
      // Advanced features that could be dangerous
      'DECLARE', 'CURSOR', 'HANDLER', 'CONDITION',
      
      // Database-specific dangerous functions
      'SLEEP', 'BENCHMARK', 'RAND', 'CONNECTION_ID',
      'DATABASE', 'VERSION', 'SCHEMA', 'INFORMATION_SCHEMA'
    ];

    // Only allow safe SELECT operations and basic DML for practice
    this.allowedKeywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'HAVING', 
      'ORDER', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT', 'DESC', 'ASC',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON',
      'UNION', 'ALL', 'INTERSECT', 'EXCEPT',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE',
      'IS', 'NULL', 'TRUE', 'FALSE',
      // Safe functions
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'FLOOR', 'CEIL',
      'UPPER', 'LOWER', 'LENGTH', 'SUBSTRING', 'CONCAT',
      'DATE', 'YEAR', 'MONTH', 'DAY', 'NOW', 'CURRENT_DATE'
    ];

    // Maximum query execution time (seconds)
    this.maxExecutionTime = 30;
    
    // Maximum result rows to prevent memory exhaustion
    this.maxResultRows = 1000;
  }

  /**
   * Validate and sanitize a user SQL query
   * @param {string} query - The SQL query to validate
   * @returns {Object} - Validation result with isValid and reasons
   */
  validateQuery(query) {
    const result = {
      isValid: true,
      reasons: [],
      sanitizedQuery: query.trim()
    };

    if (!query || typeof query !== 'string') {
      result.isValid = false;
      result.reasons.push('Query must be a non-empty string');
      return result;
    }

    // Remove comments to prevent comment-based injection
    const cleanQuery = this.removeComments(query);
    
    // Check for dangerous keywords
    const dangerousFound = this.findDangerousKeywords(cleanQuery);
    if (dangerousFound.length > 0) {
      result.isValid = false;
      result.reasons.push(`Dangerous keywords not allowed: ${dangerousFound.join(', ')}`);
    }

    // Check for multiple statements (prevent SQL injection via stacked queries)
    if (this.hasMultipleStatements(cleanQuery)) {
      result.isValid = false;
      result.reasons.push('Multiple SQL statements not allowed');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = this.findSuspiciousPatterns(cleanQuery);
    if (suspiciousPatterns.length > 0) {
      result.isValid = false;
      result.reasons.push(`Suspicious patterns detected: ${suspiciousPatterns.join(', ')}`);
    }

    // Ensure query starts with SELECT (for practice problems)
    if (!this.startsWithSelect(cleanQuery)) {
      result.isValid = false;
      result.reasons.push('Only SELECT queries are allowed in practice mode');
    }

    // Check query length to prevent DoS
    if (cleanQuery.length > 5000) {
      result.isValid = false;
      result.reasons.push('Query too long (maximum 5000 characters)');
    }

    result.sanitizedQuery = cleanQuery;
    return result;
  }

  /**
   * Remove SQL comments from query
   */
  removeComments(query) {
    // Remove single-line comments (-- style)
    let cleaned = query.replace(/--.*$/gm, '');
    
    // Remove multi-line comments (/* */ style)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    
    return cleaned.trim();
  }

  /**
   * Find dangerous keywords in query
   */
  findDangerousKeywords(query) {
    const upperQuery = query.toUpperCase();
    const found = [];

    for (const keyword of this.dangerousKeywords) {
      // Use word boundaries to match whole words only
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(upperQuery)) {
        found.push(keyword);
      }
    }

    return found;
  }

  /**
   * Check for multiple SQL statements
   */
  hasMultipleStatements(query) {
    // Split by semicolon and check for multiple non-empty statements
    const statements = query.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    return statements.length > 1;
  }

  /**
   * Find suspicious patterns that could indicate injection attempts
   */
  findSuspiciousPatterns(query) {
    const patterns = [
      // Common injection patterns
      /union\s+select/i,
      /\'\s*or\s*\'/i,
      /\'\s*and\s*\'/i,
      /\'\s*;\s*drop/i,
      /\'\s*;\s*delete/i,
      /\'\s*;\s*insert/i,
      /\'\s*;\s*update/i,
      // Hex encoding attempts
      /0x[0-9a-f]+/i,
      // Function calls that could be dangerous
      /\bload_file\b/i,
      /\binto\s+outfile\b/i,
      /\binto\s+dumpfile\b/i,
      // Time-based attack patterns
      /\bsleep\s*\(/i,
      /\bwaitfor\s+delay/i,
      /\bbenchmark\s*\(/i
    ];

    const found = [];
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].test(query)) {
        found.push(`Pattern ${i + 1}`);
      }
    }

    return found;
  }

  /**
   * Check if query starts with SELECT
   */
  startsWithSelect(query) {
    const trimmed = query.trim().toUpperCase();
    return trimmed.startsWith('SELECT') || trimmed.startsWith('WITH');
  }

  /**
   * Create a sandboxed database configuration
   */
  getSandboxConfig(dialect = 'postgresql') {
    const baseConfig = {
      connectionLimit: 5,
      acquireTimeout: 5000,
      timeout: this.maxExecutionTime * 1000,
      charset: 'utf8'
    };

    switch (dialect) {
      case 'postgresql':
        return {
          ...baseConfig,
          host: process.env.EXECUTOR_DB_HOST || 'localhost',
          port: process.env.EXECUTOR_DB_PORT || 5433,
          database: process.env.EXECUTOR_DB_NAME || 'sql_practice_executor',
          user: process.env.EXECUTOR_DB_USER || 'sql_executor_limited',
          password: process.env.EXECUTOR_DB_PASSWORD,
          ssl: false,
          statement_timeout: this.maxExecutionTime * 1000,
          query_timeout: this.maxExecutionTime * 1000
        };
      
      case 'mysql':
        return {
          ...baseConfig,
          host: process.env.MYSQL_EXECUTOR_HOST || 'localhost',
          port: process.env.MYSQL_EXECUTOR_PORT || 3307,
          database: 'sandbox_limited',
          user: 'sql_executor_limited',
          password: process.env.MYSQL_EXECUTOR_PASSWORD
        };
      
      default:
        throw new Error(`Unsupported database dialect: ${dialect}`);
    }
  }

  /**
   * Log security events for monitoring
   */
  logSecurityEvent(event, query, userId, sessionId) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      query: query.substring(0, 500), // Limit log size
      userId,
      sessionId,
      severity: event.includes('BLOCKED') ? 'HIGH' : 'MEDIUM'
    };

    console.warn(`🛡️  SQL SECURITY EVENT: ${JSON.stringify(logEntry)}`);
    
    // In production, send to centralized logging system
    // this.sendToSecurityLog(logEntry);
  }

  /**
   * Create execution context with timeout and resource limits
   */
  createExecutionContext() {
    return {
      startTime: Date.now(),
      maxExecutionTime: this.maxExecutionTime * 1000,
      maxResultRows: this.maxResultRows,
      timeoutId: null
    };
  }
}

module.exports = new SQLSecurityService();