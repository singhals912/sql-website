class ErrorAnalysisService {
  constructor() {
    // Common SQL error patterns and their solutions
    this.errorPatterns = [
      {
        pattern: /relation "(\w+)" does not exist/i,
        type: 'table_not_found',
        severity: 'error',
        getMessage: (match) => `Table "${match[1]}" doesn't exist`,
        getSuggestion: (match, context) => this.getTableSuggestions(match[1], context),
        getExample: (match) => `Try: SELECT * FROM existing_table_name;`
      },
      {
        pattern: /column "(\w+)" does not exist/i,
        type: 'column_not_found',
        severity: 'error',
        getMessage: (match) => `Column "${match[1]}" doesn't exist`,
        getSuggestion: (match, context) => this.getColumnSuggestions(match[1], context),
        getExample: (match) => `Check column names with: DESCRIBE table_name;`
      },
      {
        pattern: /syntax error at or near "(\w+)"/i,
        type: 'syntax_error',
        severity: 'error',
        getMessage: (match) => `Syntax error near "${match[1]}"`,
        getSuggestion: (match, context) => this.getSyntaxSuggestions(match[1], context),
        getExample: (match) => `Check SQL syntax around "${match[1]}"`
      },
      {
        pattern: /column ".*" must appear in the GROUP BY clause/i,
        type: 'group_by_error',
        severity: 'error',
        getMessage: () => 'Column must be in GROUP BY clause',
        getSuggestion: () => 'When using aggregate functions (COUNT, SUM, etc.), all non-aggregated columns in SELECT must be in GROUP BY.',
        getExample: () => 'SELECT column1, COUNT(*) FROM table GROUP BY column1;'
      },
      {
        pattern: /aggregate function calls cannot be nested/i,
        type: 'nested_aggregate',
        severity: 'error',
        getMessage: () => 'Cannot nest aggregate functions',
        getSuggestion: () => 'Use subqueries or window functions instead of nesting aggregates like COUNT(SUM(...))',
        getExample: () => 'SELECT COUNT(*) FROM (SELECT SUM(amount) FROM sales GROUP BY customer_id) subquery;'
      },
      {
        pattern: /division by zero/i,
        type: 'division_by_zero',
        severity: 'error',
        getMessage: () => 'Division by zero error',
        getSuggestion: () => 'Add a CASE statement to handle zero divisors',
        getExample: () => 'SELECT CASE WHEN denominator = 0 THEN 0 ELSE numerator/denominator END;'
      },
      {
        pattern: /operator does not exist.*boolean/i,
        type: 'boolean_operator_error',
        severity: 'error',
        getMessage: () => 'Invalid boolean operation',
        getSuggestion: () => 'Use proper boolean operators: AND, OR, NOT instead of &, |, !',
        getExample: () => 'WHERE condition1 = true AND condition2 = false'
      },
      {
        pattern: /invalid input syntax for.*integer/i,
        type: 'invalid_integer',
        severity: 'error',
        getMessage: () => 'Invalid integer format',
        getSuggestion: () => 'Ensure numeric values are properly formatted without quotes',
        getExample: () => 'WHERE age > 25 (not WHERE age > \'25\')'
      },
      {
        pattern: /permission denied/i,
        type: 'permission_denied',
        severity: 'error',
        getMessage: () => 'Permission denied',
        getSuggestion: () => 'You may not have permission to access this table or perform this operation',
        getExample: () => 'Contact your database administrator for proper permissions'
      },
      {
        pattern: /function.*does not exist/i,
        type: 'function_not_found',
        severity: 'error',
        getMessage: (match) => `Function doesn't exist or wrong parameters`,
        getSuggestion: (match) => this.getFunctionSuggestions(match[0]),
        getExample: (match) => 'Check function name spelling and parameter types'
      }
    ];

    // Common SQL mistakes and their corrections
    this.commonMistakes = [
      {
        pattern: /SELECT \* FROM (\w+) WHERE (\w+) = (\w+)/i,
        type: 'string_without_quotes',
        suggestion: 'String values should be enclosed in single quotes',
        correction: (match) => `SELECT * FROM ${match[1]} WHERE ${match[2]} = '${match[3]}'`
      },
      {
        pattern: /SELECT.*COUNT\(\*\).*FROM.*WHERE/i,
        type: 'count_with_where',
        suggestion: 'Consider using aggregate functions with GROUP BY for better analysis',
        correction: () => 'Add GROUP BY clause after WHERE conditions'
      }
    ];

    // Performance hints
    this.performanceHints = [
      {
        pattern: /SELECT \* FROM \w+ WHERE \w+ LIKE '%.*%'/i,
        message: 'Using LIKE with leading wildcard (%) can be slow on large tables',
        suggestion: 'Consider full-text search or restructure your query if possible'
      },
      {
        pattern: /SELECT.*FROM.*WHERE.*OR.*OR/i,
        message: 'Multiple OR conditions might benefit from index optimization',
        suggestion: 'Consider using IN clause: WHERE column IN (value1, value2, ...)'
      },
      {
        pattern: /SELECT \* FROM/i,
        message: 'Selecting all columns (*) can impact performance',
        suggestion: 'Select only the columns you need: SELECT col1, col2 FROM ...'
      }
    ];
  }

  // Main error analysis function
  analyzeError(errorMessage, query, context = {}) {
    const analysis = {
      originalError: errorMessage,
      errorType: 'unknown',
      severity: 'error',
      enhancedMessage: errorMessage,
      suggestions: [],
      examples: [],
      performanceHints: [],
      relatedDocs: [],
      quickFixes: []
    };

    // Analyze against known error patterns
    for (const pattern of this.errorPatterns) {
      const match = errorMessage.match(pattern.pattern);
      if (match) {
        analysis.errorType = pattern.type;
        analysis.severity = pattern.severity;
        analysis.enhancedMessage = pattern.getMessage(match);
        
        const suggestion = pattern.getSuggestion(match, context);
        if (suggestion) analysis.suggestions.push(suggestion);
        
        const example = pattern.getExample(match);
        if (example) analysis.examples.push(example);
        
        break;
      }
    }

    // Check for common mistakes in the query
    this.analyzeQueryMistakes(query, analysis);
    
    // Add performance hints
    this.addPerformanceHints(query, analysis);
    
    // Add contextual suggestions
    this.addContextualSuggestions(analysis, context);

    return analysis;
  }

  analyzeQueryMistakes(query, analysis) {
    if (!query) return;

    for (const mistake of this.commonMistakes) {
      const match = query.match(mistake.pattern);
      if (match) {
        analysis.suggestions.push(mistake.suggestion);
        if (mistake.correction) {
          analysis.quickFixes.push({
            description: mistake.suggestion,
            correctedQuery: mistake.correction(match)
          });
        }
      }
    }
  }

  addPerformanceHints(query, analysis) {
    if (!query) return;

    for (const hint of this.performanceHints) {
      if (hint.pattern.test(query)) {
        analysis.performanceHints.push({
          message: hint.message,
          suggestion: hint.suggestion
        });
      }
    }
  }

  addContextualSuggestions(analysis, context) {
    // Add suggestions based on available tables/columns
    if (context.availableTables) {
      if (analysis.errorType === 'table_not_found') {
        analysis.suggestions.push(`Available tables: ${context.availableTables.join(', ')}`);
      }
    }

    if (context.availableColumns) {
      if (analysis.errorType === 'column_not_found') {
        analysis.suggestions.push(`Available columns: ${context.availableColumns.join(', ')}`);
      }
    }

    // Add documentation links
    this.addDocumentationLinks(analysis);
  }

  addDocumentationLinks(analysis) {
    const docLinks = {
      'syntax_error': 'https://www.postgresql.org/docs/current/sql-syntax.html',
      'group_by_error': 'https://www.postgresql.org/docs/current/tutorial-agg.html',
      'function_not_found': 'https://www.postgresql.org/docs/current/functions.html',
      'table_not_found': 'https://www.postgresql.org/docs/current/ddl-basics.html'
    };

    if (docLinks[analysis.errorType]) {
      analysis.relatedDocs.push({
        title: 'PostgreSQL Documentation',
        url: docLinks[analysis.errorType],
        description: `Learn more about ${analysis.errorType.replace('_', ' ')}`
      });
    }
  }

  getTableSuggestions(invalidTable, context) {
    if (!context.availableTables) {
      return 'Check that the table name is spelled correctly and exists in the database.';
    }

    // Find similar table names
    const similar = this.findSimilarStrings(invalidTable, context.availableTables);
    if (similar.length > 0) {
      return `Did you mean: ${similar.join(', ')}? Available tables: ${context.availableTables.join(', ')}`;
    }

    return `Table "${invalidTable}" not found. Available tables: ${context.availableTables.join(', ')}`;
  }

  getColumnSuggestions(invalidColumn, context) {
    if (!context.availableColumns) {
      return 'Check that the column name is spelled correctly and exists in the selected tables.';
    }

    // Find similar column names
    const similar = this.findSimilarStrings(invalidColumn, context.availableColumns);
    if (similar.length > 0) {
      return `Did you mean: ${similar.join(', ')}?`;
    }

    return `Column "${invalidColumn}" not found. Available columns: ${context.availableColumns.join(', ')}`;
  }

  getSyntaxSuggestions(nearToken, context) {
    const suggestions = [];
    
    // Common syntax fixes
    const syntaxFixes = {
      'FROM': 'Check if you\'re missing a comma in the SELECT clause',
      'WHERE': 'Ensure proper JOIN syntax before WHERE clause',
      'GROUP': 'Did you mean "GROUP BY"?',
      'ORDER': 'Did you mean "ORDER BY"?',
      ')': 'Check for matching opening parenthesis',
      '(': 'Check for matching closing parenthesis',
      ',': 'Check for proper comma placement in lists',
      ';': 'Semicolon should only appear at the end of the statement'
    };

    if (syntaxFixes[nearToken.toUpperCase()]) {
      suggestions.push(syntaxFixes[nearToken.toUpperCase()]);
    }

    return suggestions.length > 0 ? suggestions.join('. ') : 'Check SQL syntax and keyword spelling.';
  }

  getFunctionSuggestions(errorMessage) {
    const commonFunctions = {
      'count': 'COUNT(*) or COUNT(column_name)',
      'sum': 'SUM(numeric_column)',
      'avg': 'AVG(numeric_column)', 
      'max': 'MAX(column_name)',
      'min': 'MIN(column_name)',
      'upper': 'UPPER(text_column)',
      'lower': 'LOWER(text_column)',
      'length': 'LENGTH(text_column)',
      'substring': 'SUBSTRING(text_column, start, length)',
      'now': 'NOW() or CURRENT_TIMESTAMP',
      'date': 'DATE(timestamp_column)'
    };

    // Extract function name from error
    const funcMatch = errorMessage.match(/function (\w+)/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toLowerCase();
      if (commonFunctions[funcName]) {
        return `Try: ${commonFunctions[funcName]}`;
      }
    }

    return 'Check function name spelling and parameter types. Common functions: COUNT, SUM, AVG, MAX, MIN.';
  }

  findSimilarStrings(target, options, threshold = 0.6) {
    if (!options || options.length === 0) return [];

    return options
      .map(option => ({
        option,
        similarity: this.calculateSimilarity(target.toLowerCase(), option.toLowerCase())
      }))
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(item => item.option);
  }

  calculateSimilarity(str1, str2) {
    // Simple Levenshtein distance-based similarity
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion  
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    return 1 - (distance / Math.max(len1, len2));
  }

  // Generate learning suggestions based on error patterns
  generateLearningSuggestions(errorType) {
    const learningPaths = {
      'table_not_found': [
        'Learn about database schemas and table structures',
        'Practice writing basic SELECT statements',
        'Understand how to list available tables'
      ],
      'column_not_found': [
        'Learn about table columns and data types',
        'Practice describing table structures',
        'Understand column naming conventions'
      ],
      'syntax_error': [
        'Review basic SQL syntax rules',
        'Practice with simple queries first',
        'Learn about SQL statement structure'
      ],
      'group_by_error': [
        'Learn about aggregate functions',
        'Understand GROUP BY clause usage',
        'Practice with COUNT, SUM, AVG functions'
      ]
    };

    return learningPaths[errorType] || [
      'Review SQL fundamentals',
      'Practice with similar query patterns',
      'Check documentation for proper syntax'
    ];
  }
}

module.exports = new ErrorAnalysisService();