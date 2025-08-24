import React, { useRef, useState, useEffect } from 'react';

const SQLHighlightEditor = ({ 
  value, 
  onChange, 
  onExecute, 
  isExecuting, 
  height = '500px',
  readOnly = false
}) => {
  const [content, setContent] = useState(value || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(value || '');
  }, [value]);

  // Simple SQL highlighting function that returns JSX
  const highlightSQL = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const tokens = [];
      
      // Define SQL keywords
      const keywords = [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
        'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
        'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
        'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT',
        'DESC', 'ASC'
      ];
      
      // Split line into words and spaces
      const parts = line.split(/(\s+|[(),;])/);
      
      parts.forEach((part, partIndex) => {
        const key = `${lineIndex}-${partIndex}`;
        
        if (!part) return;
        
        // Check if it's a keyword
        if (keywords.includes(part.toUpperCase())) {
          tokens.push(
            <span key={key} style={{ color: '#569cd6', fontWeight: 'bold' }}>
              {part}
            </span>
          );
        }
        // Check if it's a string
        else if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"'))) {
          tokens.push(
            <span key={key} style={{ color: '#ce9178' }}>
              {part}
            </span>
          );
        }
        // Check if it's a number
        else if (/^\d+\.?\d*$/.test(part)) {
          tokens.push(
            <span key={key} style={{ color: '#b5cea8' }}>
              {part}
            </span>
          );
        }
        // Check if it's a comment
        else if (part.startsWith('--')) {
          tokens.push(
            <span key={key} style={{ color: '#6a9955', fontStyle: 'italic' }}>
              {part}
            </span>
          );
        }
        // Regular text
        else {
          tokens.push(
            <span key={key} style={{ color: '#d4d4d4' }}>
              {part}
            </span>
          );
        }
      });
      
      return (
        <div key={lineIndex} style={{ minHeight: '21px' }}>
          {tokens.length > 0 ? tokens : <span style={{ color: '#d4d4d4' }}>&nbsp;</span>}
        </div>
      );
    });
  };

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
      const newValue = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newValue);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: height,
    backgroundColor: '#1e1e1e',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    border: '1px solid #333',
    borderRadius: '4px',
    overflow: 'auto'
  };

  const textareaStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: '16px',
    backgroundColor: 'transparent',
    color: 'transparent',
    caretColor: '#ffffff',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    zIndex: 2,
    tabSize: 2,
    whiteSpace: 'pre',
    overflow: 'auto'
  };

  const highlightStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: '16px',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    zIndex: 1,
    pointerEvents: 'none',
    overflow: 'auto',
    whiteSpace: 'pre'
  };

  const handleScroll = (e) => {
    // Sync scroll between textarea and highlight layer
    const highlightLayer = e.target.parentElement.querySelector('.highlight-layer');
    if (highlightLayer) {
      highlightLayer.scrollTop = e.target.scrollTop;
      highlightLayer.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div style={containerStyle}>
      {/* Syntax highlighting layer */}
      <div 
        className="highlight-layer"
        style={{
          ...highlightStyle,
          overflow: 'hidden' // Let textarea handle scrolling
        }}
      >
        {highlightSQL(content)}
      </div>
      
      {/* Textarea for input */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        readOnly={readOnly}
        style={{
          ...textareaStyle,
          color: 'transparent',
          caretColor: '#ffffff',
          backgroundColor: 'transparent',
          overflow: 'auto' // Enable scrolling on textarea
        }}
        placeholder="-- Write your SQL query here
-- Use Ctrl+Enter to execute"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};

export default SQLHighlightEditor;