import React, { useRef, useEffect } from 'react';

const SimpleSQLEditor = ({ 
  value, 
  onChange, 
  onExecute, 
  isExecuting, 
  height = '500px',
  readOnly = false
}) => {
  const textareaRef = useRef(null);

  // Inject CSS to ensure dark theme
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sql-dark-editor {
        background-color: #1e1e1e !important;
        color: #d4d4d4 !important;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace !important;
        font-size: 14px !important;
        line-height: 1.5 !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      .sql-dark-editor::placeholder {
        color: #6b7280 !important;
      }
      .sql-dark-editor:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: -2px !important;
      }
    `;
    
    if (!document.head.querySelector('#sql-dark-editor-styles')) {
      style.id = 'sql-dark-editor-styles';
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.head.querySelector('#sql-dark-editor-styles');
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
      
      // Insert tab character
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

  return (
    <div className="relative w-full" style={{ height, backgroundColor: '#1e1e1e' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className="sql-dark-editor w-full h-full border-0 resize-none"
        style={{
          padding: '16px',
          tabSize: 2,
          whiteSpace: 'pre'
        }}
        placeholder="-- Write your SQL query here
-- Use Ctrl+Enter to execute
-- Available keywords: SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
      
      {/* Help text overlay */}
      <div className="absolute top-2 right-2 text-xs text-gray-300 bg-gray-800 bg-opacity-80 px-2 py-1 rounded pointer-events-none">
        SQL Editor • Ctrl+Enter to run
      </div>
    </div>
  );
};

export default SimpleSQLEditor;