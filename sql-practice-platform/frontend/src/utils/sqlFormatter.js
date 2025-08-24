// SQL formatting utilities for consistent display across the website

/**
 * Formats SQL queries for display with consistent styling
 * @param {string} sql - The SQL query to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted SQL query
 */
export const formatSQLForDisplay = (sql, options = {}) => {
  const {
    uppercase = true,           // Convert keywords to uppercase
    addSemicolon = true,       // Ensure query ends with semicolon
    indentSize = 2,            // Number of spaces for indentation
    lineBreaks = false         // Add line breaks for readability
  } = options;

  if (!sql || typeof sql !== 'string') {
    return '';
  }

  let formatted = sql.trim();

  // SQL keywords to uppercase (if enabled)
  if (uppercase) {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
      'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
      'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT',
      'WITH', 'RECURSIVE', 'OVER', 'PARTITION', 'ROW_NUMBER', 'RANK', 'DENSE_RANK'
    ];

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword);
    });
  }

  // Add consistent spacing
  formatted = formatted
    .replace(/\s+/g, ' ')           // Multiple spaces to single space
    .replace(/,\s*/g, ', ')         // Standardize comma spacing
    .replace(/\(\s+/g, '(')         // Remove space after opening parenthesis
    .replace(/\s+\)/g, ')')         // Remove space before closing parenthesis
    .replace(/\s*=\s*/g, ' = ')     // Standardize equals spacing
    .replace(/\s*<\s*/g, ' < ')     // Standardize less than spacing
    .replace(/\s*>\s*/g, ' > ')     // Standardize greater than spacing
    .replace(/\s*<=\s*/g, ' <= ')   // Standardize less than or equal spacing
    .replace(/\s*>=\s*/g, ' >= ')   // Standardize greater than or equal spacing
    .replace(/\s*!=\s*/g, ' != ')   // Standardize not equal spacing
    .trim();

  // Add line breaks for readability (if enabled)
  if (lineBreaks) {
    const indent = ' '.repeat(indentSize);
    formatted = formatted
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bFULL JOIN\b/gi, '\nFULL JOIN')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .replace(/\n/g, '\n' + indent)
      .trim();
  }

  // Add semicolon if missing (if enabled)
  if (addSemicolon && !formatted.endsWith(';')) {
    formatted += ';';
  }

  return formatted;
};

/**
 * Normalizes SQL queries for comparison (used in validation)
 * @param {string} sql - The SQL query to normalize
 * @returns {string} - Normalized SQL query
 */
export const normalizeSQLForComparison = (sql) => {
  if (!sql || typeof sql !== 'string') {
    return '';
  }

  return sql.trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')          // Multiple spaces to single space
    .replace(/;\s*$/, '')          // Remove trailing semicolon
    .replace(/,\s+/g, ', ')        // Standardize comma spacing
    .replace(/\(\s+/g, '(')        // Remove space after opening parenthesis
    .replace(/\s+\)/g, ')')        // Remove space before closing parenthesis
    .trim();
};

/**
 * Validates if two SQL queries are equivalent
 * @param {string} userQuery - User's SQL query
 * @param {string} expectedQuery - Expected SQL query
 * @returns {boolean} - True if queries are equivalent
 */
export const validateSQLEquivalence = (userQuery, expectedQuery) => {
  const userNormalized = normalizeSQLForComparison(userQuery);
  const expectedNormalized = normalizeSQLForComparison(expectedQuery);
  const expectedNoSemicolon = normalizeSQLForComparison(expectedQuery.replace(/;$/, ''));
  
  return userNormalized === expectedNormalized || 
         userNormalized === expectedNoSemicolon;
};

/**
 * Gets SQL formatting options for different contexts
 */
export const SQL_FORMAT_PRESETS = {
  // For display in code blocks and examples
  display: {
    uppercase: true,
    addSemicolon: true,
    lineBreaks: false,
    indentSize: 2
  },
  
  // For learning examples with line breaks
  tutorial: {
    uppercase: true,
    addSemicolon: true,
    lineBreaks: true,
    indentSize: 2
  },
  
  // For user input (minimal formatting)
  userInput: {
    uppercase: false,
    addSemicolon: false,
    lineBreaks: false,
    indentSize: 0
  },
  
  // For validation display
  validation: {
    uppercase: true,
    addSemicolon: true,
    lineBreaks: false,
    indentSize: 0
  }
};

export default {
  formatSQLForDisplay,
  normalizeSQLForComparison,
  validateSQLEquivalence,
  SQL_FORMAT_PRESETS
};