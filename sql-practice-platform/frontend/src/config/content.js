// Content configuration for the SQL Practice Platform
// This centralizes all UI text and messaging

const content = {
  // Application branding
  app: {
    name: process.env.REACT_APP_NAME || 'SQL Practice Platform',
    tagline: process.env.REACT_APP_TAGLINE || 'A New Way to Learn SQL',
    description: process.env.REACT_APP_DESCRIPTION || 'Level up your SQL skills with our curated collection of problems from Fortune 100 companies.',
    shortDescription: process.env.REACT_APP_SHORT_DESC || 'Master SQL with interactive challenges'
  },

  // Homepage content
  homepage: {
    hero: {
      title: 'A New Way to Learn SQL',
      subtitle: 'Level up your SQL skills with our curated collection of problems from Fortune 100 companies.',
      ctaPrimary: 'Start Practicing',
      ctaSecondary: 'View Problems'
    },
    stats: {
      totalLabel: 'Total Problems',
      easyLabel: 'Easy',
      mediumLabel: 'Medium',
      hardLabel: 'Hard'
    },
    studyPlan: {
      title: 'Study Plan',
      fundamentals: {
        title: 'Fundamentals',
        description: 'SELECT, WHERE, ORDER BY',
        problemCount: '15 problems'
      },
      joins: {
        title: 'Joins',
        description: 'INNER, LEFT, RIGHT',
        problemCount: '20 problems'
      },
      aggregation: {
        title: 'Aggregation',
        description: 'GROUP BY, HAVING',
        problemCount: '18 problems'
      },
      advanced: {
        title: 'Advanced',
        description: 'Window Functions, CTEs',
        problemCount: '17 problems'
      }
    }
  },

  // Problems page content
  problems: {
    title: 'Problems',
    subtitle: 'Solve SQL challenges from real companies',
    resultsText: 'results',
    searchPlaceholder: 'Search problems...',
    filters: {
      status: {
        all: 'All Status',
        solved: 'Solved',
        unsolved: 'Todo'
      },
      difficulty: {
        all: 'All Difficulty',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard'
      },
      topics: {
        all: 'All Topics'
      },
      sort: {
        default: 'Sort by Default',
        title: 'Sort by Title',
        acceptance: 'Sort by Acceptance',
        difficulty: 'Sort by Difficulty',
        ascending: 'Sort Ascending',
        descending: 'Sort Descending'
      }
    },
    table: {
      status: 'Status',
      title: 'Title', 
      acceptance: 'Acceptance',
      difficulty: 'Difficulty',
      actions: 'Actions'
    },
    emptyState: {
      title: 'No problems found',
      subtitle: 'Try adjusting your search criteria or filters.'
    }
  },

  // Authentication content
  auth: {
    login: {
      title: 'Sign In',
      subtitle: 'Welcome back! Please sign in to your account.',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      submitButton: 'Sign In',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      signUpLink: 'Sign up'
    },
    register: {
      title: 'Create Account', 
      subtitle: 'Join thousands of developers improving their SQL skills.',
      fullNameLabel: 'Full Name',
      usernameLabel: 'Username',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      submitButton: 'Create Account',
      hasAccount: 'Already have an account?',
      signInLink: 'Sign in',
      passwordRequirement: 'Password must be at least 8 characters long'
    }
  },

  // Error messages
  errors: {
    connection: 'Failed to connect to server',
    generic: 'Something went wrong. Please try again.',
    notFound: 'The requested resource was not found.',
    unauthorized: 'You are not authorized to access this resource.',
    validation: 'Please check your input and try again.'
  },

  // Success messages
  success: {
    saved: 'Changes saved successfully!',
    registered: 'Account created successfully!',
    loggedIn: 'Welcome back!',
    loggedOut: 'You have been logged out.',
    passwordReset: 'Password reset email sent!'
  },

  // Loading states
  loading: {
    problems: 'Loading problems...',
    authenticating: 'Signing you in...',
    saving: 'Saving...',
    general: 'Loading...'
  },

  // Navigation
  navigation: {
    home: 'Home',
    problems: 'Problems',
    learningPaths: 'Learning Paths',
    progress: 'Progress',
    bookmarks: 'Bookmarks',
    profile: 'Profile',
    signOut: 'Sign Out'
  },

  // SQL Editor
  editor: {
    placeholder: `-- Write your SQL query here
-- Use Ctrl+Enter to execute
-- Keywords: SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY`,
    helpText: 'SQL Editor • Ctrl+Enter to run',
    executing: 'Executing...',
    execute: 'Run Query'
  }
};

export default content;