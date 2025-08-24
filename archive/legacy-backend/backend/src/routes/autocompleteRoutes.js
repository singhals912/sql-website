const express = require('express');
const router = express.Router();
const AutocompleteService = require('../services/autocompleteService');

// Get SQL completions
router.post('/sql/autocomplete', async (req, res) => {
  try {
    const { query, cursorPosition, problemId } = req.body;

    if (typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query must be a string'
      });
    }

    if (typeof cursorPosition !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Cursor position must be a number'
      });
    }

    const completions = await AutocompleteService.getCompletions(
      query, 
      cursorPosition, 
      problemId
    );

    res.json(completions);

  } catch (error) {
    console.error('Error getting SQL completions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get completions',
      completions: []
    });
  }
});

// Get schema information
router.get('/sql/schema', async (req, res) => {
  try {
    const { problemId } = req.query;
    
    const schema = await AutocompleteService.getProblemSchema(problemId);
    
    res.json({
      success: true,
      schema
    });

  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get schema'
    });
  }
});

// Get available tables and columns
router.get('/sql/schema/tables', async (req, res) => {
  try {
    const tables = Array.from(AutocompleteService.schemaCache.tables.values()).map(table => ({
      name: table.name,
      columnCount: table.columns.length,
      columns: table.columns.map(col => ({
        name: col.name,
        dataType: col.dataType,
        nullable: col.nullable,
        isPrimaryKey: col.isPrimaryKey,
        isForeignKey: col.isForeignKey
      }))
    }));

    res.json({
      success: true,
      tables,
      totalTables: tables.length,
      totalColumns: tables.reduce((sum, t) => sum + t.columnCount, 0),
      lastUpdate: AutocompleteService.schemaCache.lastUpdate
    });

  } catch (error) {
    console.error('Error getting tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tables'
    });
  }
});

// Refresh schema cache manually
router.post('/sql/schema/refresh', async (req, res) => {
  try {
    await AutocompleteService.refreshSchemaCache();
    
    res.json({
      success: true,
      message: 'Schema cache refreshed successfully',
      tablesCount: AutocompleteService.schemaCache.tables.size,
      columnsCount: AutocompleteService.schemaCache.columns.size,
      lastUpdate: AutocompleteService.schemaCache.lastUpdate
    });

  } catch (error) {
    console.error('Error refreshing schema cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh schema cache'
    });
  }
});

module.exports = router;