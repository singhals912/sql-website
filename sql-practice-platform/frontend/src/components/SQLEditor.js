import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const SQLEditor = ({ 
  value, 
  onChange, 
  onExecute, 
  isExecuting, 
  problemId,
  height = '200px',
  theme = 'vs-dark'
}) => {
  const editorRef = useRef(null);
  const [completionProvider, setCompletionProvider] = useState(null);
  const [editorError, setEditorError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (editorRef.current) {
      setupSQLLanguage();
      setupAutocomplete();
    }
  }, [editorRef.current, problemId]);

  const setupSQLLanguage = () => {
    const monaco = window.monaco;
    if (!monaco) return;

    // Enhanced SQL language configuration
    monaco.languages.setLanguageConfiguration('sql', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ]
    });

    // SQL syntax highlighting
    monaco.languages.setMonarchTokensProvider('sql', {
      defaultToken: 'invalid',
      tokenPostfix: '.sql',
      ignoreCase: true,
      
      brackets: [
        { open: '[', close: ']', token: 'delimiter.bracket' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' },
        { open: '{', close: '}', token: 'delimiter.curly' }
      ],

      keywords: [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
        'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
        'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
        'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
        'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT'
      ],

      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '<>', '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%', '<<',
        '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
        '%=', '<<=', '>>=', '>>>='
      ],

      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          [/[A-Z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],

          [/[0-9]+(\.[0-9]*)?/, 'number'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],

          [/--+.*/, 'comment'],
          [/\/\*/, 'comment', '@comment'],

          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],

          [/[;,.]/, 'delimiter'],
          [/[()]/, '@brackets'],
          [/[[\]]/, 'delimiter.bracket'],
          [/[{}]/, 'delimiter.curly'],
        ],

        string_double: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop']
        ],

        string_single: [
          [/[^\\']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop']
        ],

        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],
      },
    });
  };

  const setupAutocomplete = async () => {
    const monaco = window.monaco;
    if (!monaco || completionProvider) return;

    // Dispose existing provider
    if (completionProvider) {
      completionProvider.dispose();
    }

    // Create new completion provider
    const provider = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: async (model, position) => {
        try {
          const query = model.getValue();
          const offset = model.getOffsetAt(position);

          const response = await fetch('http://localhost:5001/api/sql/autocomplete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query,
              cursorPosition: offset,
              problemId
            })
          });

          const data = await response.json();

          if (!data.success || !data.completions) {
            return { suggestions: [] };
          }

          const suggestions = data.completions.map(completion => ({
            label: completion.text,
            kind: getCompletionKind(completion.type),
            insertText: completion.insertText || completion.text,
            detail: completion.description,
            documentation: completion.usage || completion.description,
            sortText: String(1000 - (completion.priority || 50)).padStart(4, '0'),
            filterText: completion.text
          }));

          return { suggestions };

        } catch (error) {
          console.error('Error getting completions:', error);
          return { suggestions: [] };
        }
      }
    });

    setCompletionProvider(provider);
  };

  const getCompletionKind = (type) => {
    const monaco = window.monaco;
    if (!monaco) return 0;

    switch (type) {
      case 'table':
        return monaco.languages.CompletionItemKind.Class;
      case 'column':
        return monaco.languages.CompletionItemKind.Field;
      case 'function':
        return monaco.languages.CompletionItemKind.Function;
      case 'keyword':
        return monaco.languages.CompletionItemKind.Keyword;
      case 'pattern':
        return monaco.languages.CompletionItemKind.Snippet;
      default:
        return monaco.languages.CompletionItemKind.Text;
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    setIsLoading(false);
    setEditorError(false);
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 20,
      wordWrap: 'on',
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      suggest: {
        insertMode: 'replace',
        filterGraceful: true,
        showWords: false,
        showKeywords: false // We handle these ourselves
      }
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onExecute && !isExecuting) {
        onExecute();
      }
    });

    editor.addCommand(monaco.KeyCode.F1, () => {
      // Show help/documentation
      editor.trigger('keyboard', 'editor.action.quickCommand', {});
    });

    // Setup autocomplete after mount
    setTimeout(setupAutocomplete, 100);
  };

  const handleEditorChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleEditorError = (error) => {
    console.error('Monaco Editor error:', error);
    setEditorError(true);
    setIsLoading(false);
  };

  // Fallback textarea component
  const TextareaFallback = () => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (onExecute && !isExecuting) {
            onExecute();
          }
        }
      }}
      className="w-full h-full p-4 bg-gray-900 dark:bg-gray-950 text-green-400 dark:text-green-300 font-mono text-sm resize-none border-0 focus:ring-0 focus:outline-none"
      style={{ minHeight: height === '100%' ? '200px' : height }}
      placeholder="-- Write your SQL query here"
    />
  );

  // Show loading state
  if (isLoading && !editorError) {
    return (
      <div className="relative">
        <div className="w-full h-full flex items-center justify-center bg-gray-900" style={{ minHeight: height === '100%' ? '200px' : height }}>
          <div className="text-gray-400">Loading editor...</div>
        </div>
      </div>
    );
  }

  // Show fallback if editor failed to load
  if (editorError) {
    return (
      <div className="relative">
        <TextareaFallback />
        {/* Keyboard shortcuts info */}
        <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 px-2 py-1 rounded opacity-75">
          Ctrl+Enter to execute
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Editor
        height={height}
        language="sql"
        theme={theme}
        value={value}
        loading={<div className="w-full h-full flex items-center justify-center bg-gray-900"><div className="text-gray-400">Loading...</div></div>}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
        }}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        onError={handleEditorError}
      />
      
      {/* Keyboard shortcuts info */}
      <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-900 dark:bg-gray-800 px-2 py-1 rounded opacity-75">
        Ctrl+Enter to execute • Ctrl+Space for suggestions
      </div>
    </div>
  );
};

export default SQLEditor;