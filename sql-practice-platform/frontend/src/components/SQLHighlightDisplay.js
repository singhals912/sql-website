import React from 'react';

const SQLHighlightDisplay = ({ 
  value, 
  height = 'auto',
  className = ''
}) => {
  // Simple SQL highlighting function that returns HTML string
  const highlightSQL = (text) => {
    if (!text) return '';
    
    // Define SQL keywords
    const keywords = [
      'WITH', 'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
      'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
      'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT',
      'DESC', 'ASC', 'CROSS', 'OVER', 'ROUND', 'ABS'
    ];
    
    let highlighted = text;
    
    // Escape HTML
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Highlight SQL keywords (case insensitive)
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<span style="color: #569cd6; font-weight: bold;">$1</span>');
    });
    
    // Highlight strings
    highlighted = highlighted.replace(/'([^']*)'/g, '<span style="color: #ce9178;">\'$1\'</span>');
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span style="color: #ce9178;">"$1"</span>');
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #b5cea8;">$1</span>');
    
    // Highlight comments
    highlighted = highlighted.replace(/--.*$/gm, '<span style="color: #6a9955; font-style: italic;">$&</span>');
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span style="color: #6a9955; font-style: italic;">$&</span>');
    
    return highlighted;
  };

  const containerStyle = {
    width: '100%',
    height: height,
    backgroundColor: '#1e1e1e',
    borderRadius: '4px',
    overflow: 'scroll',
    boxSizing: 'border-box',
    padding: '16px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#d4d4d4',
    whiteSpace: 'pre',
    margin: 0,
    border: 'none',
    outline: 'none'
  };

  // Simple SQL highlighting function that returns JSX
  const highlightSQLJSX = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const tokens = [];
      
      // Define SQL keywords
      const keywords = [
        'WITH', 'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
        'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
        'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
        'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT',
        'DESC', 'ASC', 'CROSS', 'OVER', 'ROUND', 'ABS'
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

  const handleScroll = (e) => {
    // Sync scroll between textarea and highlight layer
    const highlightLayer = e.target.parentElement.querySelector('.highlight-layer');
    if (highlightLayer) {
      highlightLayer.scrollTop = e.target.scrollTop;
      highlightLayer.scrollLeft = e.target.scrollLeft;
    }
  };

  const updatedContainerStyle = {
    position: 'relative',
    width: '100%',
    height: height,
    backgroundColor: '#1e1e1e',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    border: '1px solid #333',
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const highlightLayerStyle = {
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
    overflow: 'hidden',
    whiteSpace: 'pre'
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
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '14px',
    lineHeight: '1.5',
    zIndex: 2,
    whiteSpace: 'pre',
    overflow: 'auto'
  };

  return (
    <div style={updatedContainerStyle} className={className}>
      {/* Syntax highlighting layer */}
      <div 
        className="highlight-layer"
        style={highlightLayerStyle}
      >
        {highlightSQLJSX(value || '')}
      </div>
      
      {/* Transparent textarea for scrolling */}
      <textarea
        value={value || ''}
        readOnly
        onScroll={handleScroll}
        style={textareaStyle}
        tabIndex={-1}
      />
    </div>
  );
};

export default SQLHighlightDisplay;