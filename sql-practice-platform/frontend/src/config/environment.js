// Environment configuration for the SQL Practice Platform
// This centralizes all environment-specific settings

const config = {
  // API Configuration - force correct Railway URL in production
  API_BASE_URL: (() => {
    const envUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
    // Fix incorrect Railway URL missing -d4d1 suffix
    if (envUrl.includes('sql-website-production.up.railway.app')) {
      return envUrl.replace('sql-website-production.up.railway.app', 'sql-website-production-d4d1.up.railway.app');
    }
    return envUrl;
  })(),
  
  // App Information
  APP_NAME: process.env.REACT_APP_NAME || 'SQL Practice Platform',
  APP_DESCRIPTION: process.env.REACT_APP_DESCRIPTION || 'Master SQL with interactive challenges',
  
  // Performance Settings
  CACHE_TIMEOUT: parseInt(process.env.REACT_APP_CACHE_TIMEOUT) || 2000,
  ACHIEVEMENT_DISPLAY_DURATION: parseInt(process.env.REACT_APP_ACHIEVEMENT_DURATION) || 5000,
  REDIRECT_DELAY: parseInt(process.env.REACT_APP_REDIRECT_DELAY) || 2000,
  TIME_UPDATE_INTERVAL: parseInt(process.env.REACT_APP_TIME_INTERVAL) || 60000,
  
  // Authentication Settings
  MIN_PASSWORD_LENGTH: parseInt(process.env.REACT_APP_MIN_PASSWORD_LENGTH) || 8,
  SESSION_PREFIX: process.env.REACT_APP_SESSION_PREFIX || 'sql-practice-',
  
  // UI Settings
  DEFAULT_EDITOR_HEIGHT: process.env.REACT_APP_EDITOR_HEIGHT || '500px',
  
  // Feature Flags
  ENABLE_MOCK_DATA: process.env.REACT_APP_ENABLE_MOCK_DATA === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  
  // Development Settings
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

// Helper functions for common URL patterns
export const apiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.API_BASE_URL}/${cleanEndpoint}`;
};

export const authUrl = (endpoint) => apiUrl(`auth/${endpoint}`);
export const sqlUrl = (endpoint) => apiUrl(`sql/${endpoint}`);
export const bookmarksUrl = (endpoint = '') => apiUrl(`bookmarks${endpoint ? `/${endpoint}` : ''}`);
export const progressUrl = (endpoint = '') => apiUrl(`progress${endpoint ? `/${endpoint}` : ''}`);
export const recommendationsUrl = (endpoint) => apiUrl(`recommendations/${endpoint}`);
export const learningPathsUrl = (endpoint = '') => apiUrl(`learning-paths${endpoint ? `/${endpoint}` : ''}`);

export default config;