import React, { useRef, useEffect, useState } from 'react';
import config from '../config/environment.js';
import theme from '../config/theme.js';

const SQLSyntaxEditor = ({ 
  value, 
  onChange, 
  onExecute, 
  isExecuting, 
  height = config.DEFAULT_EDITOR_HEIGHT,
  readOnly = false
}) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(value || '');

  // SQL keywords for syntax highlighting
  const sqlKeywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
    'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT'
  ];

  // Create highlighted HTML
  const highlightSQL = (text) => {
    if (!text) return '';
    
    let highlighted = text;
    
    // Escape HTML
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Highlight SQL keywords (case insensitive)
    sqlKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="sql-keyword">$1</span>');
    });
    
    // Highlight strings
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="sql-string">"$1"</span>');
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="sql-number">$1</span>');
    
    // Highlight comments
    highlighted = highlighted.replace(/--.*$/gm, '<span class="sql-comment">$&</span>');
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="sql-comment">$&</span>');
    
    return highlighted;
  };

  // Update highlighting when value changes
  useEffect(() => {
    setDisplayValue(value || '');
    if (highlightRef.current) {
      highlightRef.current.innerHTML = highlightSQL(value || '');
    }
  }, [value, highlightSQL]);

  // Inject CSS for syntax highlighting
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sql-editor-container {
        position: relative;
        background: ${theme.editor.background};
        border-radius: ${theme.borderRadius.sm};
        overflow: hidden;
      }
      
      .sql-textarea {
        background: transparent !important;
        color: transparent !important;
        caret-color: ${theme.editor.cursor} !important;
        font-family: ${theme.fonts.mono} !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        padding: ${theme.spacing.editorPadding} !important;
        border: none !important;
        outline: none !important;
        resize: none !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 2 !important;
        tab-size: 2 !important;
        white-space: pre !important;
      }
      
      .sql-highlight {
        background: ${theme.editor.background} !important;
        color: ${theme.editor.text} !important;
        font-family: ${theme.fonts.mono} !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        padding: ${theme.spacing.editorPadding} !important;
        border: none !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 1 !important;
        pointer-events: none !important;
        tab-size: 2 !important;
        white-space: pre !important;
        overflow: hidden !important;
      }
      
      .sql-keyword {
        color: ${theme.editor.keywords} !important;
        font-weight: bold !important;
      }
      
      .sql-string {
        color: ${theme.editor.strings} !important;
      }
      
      .sql-number {
        color: ${theme.editor.numbers} !important;
      }
      
      .sql-comment {
        color: ${theme.editor.comments} !important;
        font-style: italic !important;
      }
      
      .sql-textarea::placeholder {
        color: #6b7280 !important;
      }
      
      .sql-textarea:focus {
        outline: 2px solid ${theme.editor.focusBorder} !important;
        outline-offset: -2px !important;
      }
    `;
    
    if (!document.head.querySelector('#sql-syntax-styles')) {
      style.id = 'sql-syntax-styles';
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.head.querySelector('#sql-syntax-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    // Handle Ctrl+Enter for execution
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onExecute && !isExecuting) {
        onExecute();
      }
    }
    
    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert spaces for tab
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleScroll = (e) => {
    // Sync scroll between textarea and highlight layer
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <div className="sql-editor-container w-full h-full">
        {/* Syntax highlighting layer */}
        <div
          ref={highlightRef}
          className="sql-highlight"
          dangerouslySetInnerHTML={{ __html: highlightSQL(displayValue) }}
        />
        
        {/* Transparent textarea for input */}
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          className="sql-textarea"
          placeholder="-- Write your SQL query here
-- Use Ctrl+Enter to execute
-- Keywords: SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
      
      {/* Help text overlay */}
      <div className="absolute top-2 right-2 text-xs text-gray-300 bg-gray-800 bg-opacity-80 px-2 py-1 rounded pointer-events-none z-10">
        SQL Editor • Ctrl+Enter to run
      </div>
    </div>
  );
};

export default SQLSyntaxEditor;