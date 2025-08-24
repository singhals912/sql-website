// Theme configuration for the SQL Practice Platform
// This centralizes all styling values and color schemes

const theme = {
  // SQL Editor Colors (VS Code Dark Theme)
  editor: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    keywords: '#569cd6',
    strings: '#ce9178',
    numbers: '#b5cea8',
    comments: '#6a9955',
    selection: '#264f78',
    cursor: '#ffffff',
    border: '#3e3e3e',
    focusBorder: '#3b82f6'
  },

  // Difficulty Colors (LeetCode Style)
  difficulty: {
    easy: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      color: '#10b981'
    },
    medium: {
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      color: '#f59e0b'
    },
    hard: {
      bg: 'bg-red-100',
      text: 'text-red-800', 
      border: 'border-red-200',
      color: '#ef4444'
    }
  },

  // Primary Color Palette
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
    success: '#10b981',
    warning: '#f59e0b', 
    error: '#ef4444',
    info: '#3b82f6'
  },

  // Typography
  fonts: {
    mono: "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
    sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
  },

  // Spacing and Sizing
  spacing: {
    editorPadding: '16px',
    cardPadding: '24px',
    buttonPadding: '12px 24px',
    sectionSpacing: '48px'
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '6px', 
    lg: '8px',
    xl: '12px'
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },

  // Animations and Transitions
  animations: {
    defaultDuration: '150ms',
    slowDuration: '300ms',
    fastDuration: '75ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};

// Helper functions
export const getDifficultyClasses = (difficulty) => {
  const config = theme.difficulty[difficulty] || theme.difficulty.medium;
  return `${config.bg} ${config.text} ${config.border}`;
};

export const getDifficultyColor = (difficulty) => {
  return theme.difficulty[difficulty]?.color || theme.difficulty.medium.color;
};

export const getCSSVariables = () => {
  return {
    '--color-primary': theme.colors.primary[500],
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--font-mono': theme.fonts.mono,
    '--editor-bg': theme.editor.background,
    '--editor-text': theme.editor.text,
    '--editor-keywords': theme.editor.keywords,
    '--editor-strings': theme.editor.strings,
    '--editor-numbers': theme.editor.numbers,
    '--editor-comments': theme.editor.comments
  };
};

export default theme;