const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class AutocompleteService {
  constructor() {
    // Cache for schema information
    this.schemaCache = {
      tables: new Map(),
      columns: new Map(),
      functions: new Map(),
      keywords: new Set(),
      lastUpdate: null
    };

    // SQL Keywords and functions
    this.initializeKeywords();
    
    // Refresh schema cache every 5 minutes
    setInterval(() => this.refreshSchemaCache(), 5 * 60 * 1000);
    
    // Initialize schema cache on startup
    this.refreshSchemaCache();
  }

  initializeKeywords() {
    const sqlKeywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
      'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM',
      'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS NULL',
      'IS NOT NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'UNION ALL',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP',
      'INDEX', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'CONSTRAINT', 'CHECK',
      'DEFAULT', 'NOT NULL', 'UNIQUE', 'AUTO_INCREMENT', 'SERIAL', 'BOOLEAN', 'INTEGER',
      'VARCHAR', 'TEXT', 'DECIMAL', 'DATE', 'TIMESTAMP', 'TIME'
    ];

    const sqlFunctions = [
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'SQRT',
      'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'SUBSTRING', 'CONCAT', 'COALESCE', 'NULLIF',
      'CAST', 'EXTRACT', 'DATE_PART', 'NOW', 'CURRENT_DATE', 'CURRENT_TIME',
      'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE'
    ];

    sqlKeywords.forEach(keyword => this.schemaCache.keywords.add(keyword));
    sqlFunctions.forEach(func => this.schemaCache.functions.set(func, {
      name: func,
      type: 'function',
      description: this.getFunctionDescription(func),
      usage: this.getFunctionUsage(func)
    }));
  }

  getFunctionDescription(funcName) {
    const descriptions = {
      'COUNT': 'Returns the number of rows',
      'SUM': 'Returns the sum of numeric values',
      'AVG': 'Returns the average of numeric values',
      'MIN': 'Returns the minimum value',
      'MAX': 'Returns the maximum value',
      'ROUND': 'Rounds a number to specified decimal places',
      'UPPER': 'Converts text to uppercase',
      'LOWER': 'Converts text to lowercase',
      'CONCAT': 'Concatenates strings together',
      'ROW_NUMBER': 'Assigns unique numbers to rows',
      'NOW': 'Returns current timestamp'
    };
    return descriptions[funcName] || 'SQL function';
  }

  getFunctionUsage(funcName) {
    const usages = {
      'COUNT': 'COUNT(*) or COUNT(column)',
      'SUM': 'SUM(column)',
      'AVG': 'AVG(column)',
      'ROUND': 'ROUND(number, decimals)',
      'UPPER': 'UPPER(text)',
      'LOWER': 'LOWER(text)',
      'CONCAT': 'CONCAT(str1, str2, ...)',
      'ROW_NUMBER': 'ROW_NUMBER() OVER (ORDER BY column)',
      'NOW': 'NOW()'
    };
    return usages[funcName] || funcName + '()';
  }

  async refreshSchemaCache() {
    try {
      // Get all tables from the sandbox database (execution environment)
      const executionPool = new Pool({
        host: 'localhost',
        port: 5433,
        user: 'postgres',
        password: 'password',
        database: 'sandbox'
      });

      // Get tables and their columns
      const tablesResult = await executionPool.query(`
        SELECT 
          t.table_name,
          c.column_name,
          c.data_type,
          c.is_nullable,
          c.column_default,
          tc.constraint_type
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
        LEFT JOIN information_schema.constraint_column_usage ccu ON c.column_name = ccu.column_name AND c.table_name = ccu.table_name
        LEFT JOIN information_schema.table_constraints tc ON ccu.constraint_name = tc.constraint_name
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
      `);

      this.schemaCache.tables.clear();
      this.schemaCache.columns.clear();

      const tableMap = new Map();

      tablesResult.rows.forEach(row => {
        const tableName = row.table_name;
        const columnName = row.column_name;

        if (!tableMap.has(tableName)) {
          tableMap.set(tableName, {
            name: tableName,
            type: 'table',
            columns: []
          });
          this.schemaCache.tables.set(tableName, tableMap.get(tableName));
        }

        if (columnName) {
          const column = {
            name: columnName,
            table: tableName,
            dataType: row.data_type,
            nullable: row.is_nullable === 'YES',
            defaultValue: row.column_default,
            isPrimaryKey: row.constraint_type === 'PRIMARY KEY',
            isForeignKey: row.constraint_type === 'FOREIGN KEY',
            type: 'column'
          };

          tableMap.get(tableName).columns.push(column);
          this.schemaCache.columns.set(`${tableName}.${columnName}`, column);
          this.schemaCache.columns.set(columnName, column); // Also allow column-only lookup
        }
      });

      await executionPool.end();
      this.schemaCache.lastUpdate = new Date();
      console.log(`✅ Schema cache refreshed: ${this.schemaCache.tables.size} tables, ${this.schemaCache.columns.size} columns`);

    } catch (error) {
      console.error('Error refreshing schema cache:', error);
    }
  }

  // Main autocomplete function
  async getCompletions(query, cursorPosition, problemId = null) {
    try {
      // Parse the query context at cursor position
      const context = this.parseQueryContext(query, cursorPosition);
      
      // Get completions based on context
      const completions = await this.generateCompletions(context, problemId);
      
      return {
        success: true,
        completions: completions.slice(0, 20), // Limit to 20 suggestions
        context: context,
        meta: {
          totalSuggestions: completions.length,
          schemaLastUpdate: this.schemaCache.lastUpdate
        }
      };

    } catch (error) {
      console.error('Error generating completions:', error);
      return {
        success: false,
        error: error.message,
        completions: []
      };
    }
  }

  parseQueryContext(query, cursorPosition) {
    const beforeCursor = query.substring(0, cursorPosition).trim();
    const afterCursor = query.substring(cursorPosition).trim();
    
    // Find current word being typed
    const wordMatch = beforeCursor.match(/\b\w*$/);
    const currentWord = wordMatch ? wordMatch[0] : '';
    
    // Find the last few tokens to understand context
    const tokens = beforeCursor.replace(/[^\w\s]/g, ' ').trim().split(/\s+/).slice(-5);
    const lastToken = tokens[tokens.length - 1] || '';
    const secondLastToken = tokens[tokens.length - 2] || '';
    
    return {
      beforeCursor,
      afterCursor,
      currentWord,
      lastToken,
      secondLastToken,
      tokens,
      isAfterSelect: /\bSELECT\s*$/i.test(beforeCursor),
      isAfterFrom: /\bFROM\s*$/i.test(beforeCursor),
      isAfterWhere: /\bWHERE\s*$/i.test(beforeCursor),
      isAfterJoin: /\b(JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN)\s*$/i.test(beforeCursor),
      isAfterOn: /\bON\s*$/i.test(beforeCursor),
      isAfterGroupBy: /\bGROUP\s+BY\s*$/i.test(beforeCursor),
      isAfterOrderBy: /\bORDER\s+BY\s*$/i.test(beforeCursor),
      isInSelectList: this.isInSelectList(beforeCursor),
      tables: this.extractTablesFromQuery(beforeCursor)
    };
  }

  isInSelectList(beforeCursor) {
    const selectMatch = beforeCursor.match(/\bSELECT\b.*$/i);
    if (!selectMatch) return false;
    
    const fromMatch = selectMatch[0].match(/\bFROM\b/i);
    return !fromMatch; // We're in select list if no FROM clause yet
  }

  extractTablesFromQuery(query) {
    const tables = [];
    
    // Extract tables from FROM clause
    const fromMatches = query.match(/\bFROM\s+(\w+)(?:\s+AS\s+(\w+))?/gi);
    if (fromMatches) {
      fromMatches.forEach(match => {
        const parts = match.replace(/\bFROM\s+/i, '').split(/\s+AS\s+/i);
        tables.push({
          name: parts[0].trim(),
          alias: parts[1] ? parts[1].trim() : parts[0].trim()
        });
      });
    }

    // Extract tables from JOIN clauses
    const joinMatches = query.match(/\bJOIN\s+(\w+)(?:\s+AS\s+(\w+))?/gi);
    if (joinMatches) {
      joinMatches.forEach(match => {
        const parts = match.replace(/\b\w+\s+JOIN\s+/i, '').split(/\s+AS\s+/i);
        tables.push({
          name: parts[0].trim(),
          alias: parts[1] ? parts[1].trim() : parts[0].trim()
        });
      });
    }

    return tables;
  }

  async generateCompletions(context, problemId) {
    const completions = [];
    const currentWord = context.currentWord.toLowerCase();

    // Table suggestions (after FROM, JOIN)
    if (context.isAfterFrom || context.isAfterJoin) {
      for (const [tableName, table] of this.schemaCache.tables) {
        if (tableName.toLowerCase().includes(currentWord)) {
          completions.push({
            text: tableName,
            type: 'table',
            description: `Table with ${table.columns.length} columns`,
            insertText: tableName,
            priority: 100
          });
        }
      }
    }

    // Column suggestions (after SELECT, WHERE, ON, GROUP BY, ORDER BY)
    if (context.isInSelectList || context.isAfterWhere || context.isAfterOn || 
        context.isAfterGroupBy || context.isAfterOrderBy || context.currentWord) {
      
      // Add columns from tables in the query
      context.tables.forEach(table => {
        const tableSchema = this.schemaCache.tables.get(table.name);
        if (tableSchema) {
          tableSchema.columns.forEach(column => {
            if (column.name.toLowerCase().includes(currentWord)) {
              completions.push({
                text: column.name,
                type: 'column',
                description: `${column.dataType}${column.nullable ? ' (nullable)' : ''}`,
                insertText: column.name,
                priority: 90,
                table: table.name,
                alias: table.alias
              });

              // Also suggest with table prefix
              completions.push({
                text: `${table.alias}.${column.name}`,
                type: 'column',
                description: `${table.name}.${column.name} (${column.dataType})`,
                insertText: `${table.alias}.${column.name}`,
                priority: 85,
                table: table.name,
                alias: table.alias
              });
            }
          });
        }
      });

      // If no tables in context, suggest all columns
      if (context.tables.length === 0) {
        for (const [columnKey, column] of this.schemaCache.columns) {
          if (column.name.toLowerCase().includes(currentWord) && !columnKey.includes('.')) {
            completions.push({
              text: column.name,
              type: 'column',
              description: `${column.dataType} from ${column.table}`,
              insertText: column.name,
              priority: 70,
              table: column.table
            });
          }
        }
      }
    }

    // Function suggestions
    for (const [funcName, func] of this.schemaCache.functions) {
      if (funcName.toLowerCase().includes(currentWord)) {
        completions.push({
          text: funcName,
          type: 'function',
          description: func.description,
          insertText: func.usage,
          priority: 60,
          usage: func.usage
        });
      }
    }

    // Keyword suggestions
    for (const keyword of this.schemaCache.keywords) {
      if (keyword.toLowerCase().includes(currentWord)) {
        completions.push({
          text: keyword,
          type: 'keyword',
          description: 'SQL keyword',
          insertText: keyword,
          priority: 50
        });
      }
    }

    // Smart contextual suggestions
    this.addContextualSuggestions(completions, context);

    // Sort by priority and relevance
    return completions
      .sort((a, b) => {
        // Higher priority first
        if (b.priority !== a.priority) return b.priority - a.priority;
        
        // Exact matches first
        const aExact = a.text.toLowerCase() === currentWord;
        const bExact = b.text.toLowerCase() === currentWord;
        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;
        
        // Starts with current word
        const aStarts = a.text.toLowerCase().startsWith(currentWord);
        const bStarts = b.text.toLowerCase().startsWith(currentWord);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
        
        // Alphabetical
        return a.text.localeCompare(b.text);
      });
  }

  addContextualSuggestions(completions, context) {
    // After SELECT, suggest common patterns
    if (context.isAfterSelect && !context.currentWord) {
      completions.push(
        { text: '*', type: 'keyword', description: 'Select all columns', insertText: '*', priority: 95 },
        { text: 'DISTINCT', type: 'keyword', description: 'Remove duplicates', insertText: 'DISTINCT ', priority: 80 }
      );
    }

    // After WHERE, suggest common patterns
    if (context.isAfterWhere && !context.currentWord) {
      completions.push(
        { text: '1=1', type: 'pattern', description: 'Always true condition', insertText: '1=1', priority: 75 },
        { text: 'EXISTS', type: 'keyword', description: 'Check if subquery returns results', insertText: 'EXISTS (', priority: 70 }
      );
    }

    // Smart JOIN suggestions
    if (context.isAfterJoin && context.tables.length > 0) {
      // Suggest likely join targets based on naming conventions
      const currentTables = new Set(context.tables.map(t => t.name));
      for (const [tableName] of this.schemaCache.tables) {
        if (!currentTables.has(tableName)) {
          completions.push({
            text: tableName,
            type: 'table',
            description: `Join with ${tableName}`,
            insertText: `${tableName} ON `,
            priority: 85
          });
        }
      }
    }
  }

  // Get schema information for a specific problem
  async getProblemSchema(problemId) {
    try {
      if (!problemId) {
        return { tables: Array.from(this.schemaCache.tables.values()) };
      }

      // Get problem-specific schema from database
      const problemResult = await pool.query(`
        SELECT setup_sql FROM problems_schema WHERE problem_id = $1
      `, [problemId]);

      if (problemResult.rows.length === 0) {
        return { tables: Array.from(this.schemaCache.tables.values()) };
      }

      // Parse problem-specific schema
      const setupSql = problemResult.rows[0].setup_sql;
      const problemTables = this.parseProblemSchema(setupSql);

      return {
        tables: problemTables,
        setupSql: setupSql
      };

    } catch (error) {
      console.error('Error getting problem schema:', error);
      return { tables: Array.from(this.schemaCache.tables.values()) };
    }
  }

  parseProblemSchema(setupSql) {
    const tables = [];
    
    // Extract CREATE TABLE statements
    const createTableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
    let match;

    while ((match = createTableRegex.exec(setupSql)) !== null) {
      const tableName = match[1];
      const columnsText = match[2];
      
      const columns = this.parseColumns(columnsText);
      
      tables.push({
        name: tableName,
        type: 'table',
        columns: columns
      });
    }

    return tables;
  }

  parseColumns(columnsText) {
    const columns = [];
    const lines = columnsText.split(',');
    
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine && !cleanLine.toUpperCase().includes('CONSTRAINT')) {
        const parts = cleanLine.split(/\s+/);
        if (parts.length >= 2) {
          columns.push({
            name: parts[0],
            dataType: parts[1],
            type: 'column',
            nullable: !cleanLine.toUpperCase().includes('NOT NULL'),
            isPrimaryKey: cleanLine.toUpperCase().includes('PRIMARY KEY')
          });
        }
      }
    }

    return columns;
  }
}

module.exports = new AutocompleteService();