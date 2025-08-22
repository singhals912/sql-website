import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the button (userMenuRef)
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        // Also check if click is not inside the dropdown portal
        const dropdown = document.querySelector('[style*="position: fixed"][style*="z-index: 2147483647"]');
        if (!dropdown || !dropdown.contains(event.target)) {
          setShowUserMenu(false);
        }
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleUserMenuToggle = (e) => {
    if (!showUserMenu && userMenuRef.current) {
      // Calculate position relative to the button
      const rect = userMenuRef.current.getBoundingClientRect();
      const dropdownWidth = 192; // w-48 = 12rem = 192px
      const rightPosition = window.innerWidth - rect.right + (rect.width / 2) - (dropdownWidth / 2);
      
      // Update the dropdown position
      setTimeout(() => {
        const dropdown = document.querySelector('[style*="position: fixed"][style*="z-index: 2147483647"]');
        if (dropdown) {
          dropdown.style.right = `${Math.max(4, rightPosition)}px`;
        }
      }, 0);
    }
    
    setShowUserMenu(prev => !prev);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 animate-slide-in-left transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover-lift bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text hover:text-transparent">
            SQL Practice Platform
          </Link>
          
          <nav className="flex items-center space-x-6 animate-slide-in-right">
            <Link 
              to="/learning-paths" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift ${
                isActive('/learning-paths') 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📚 Learning Paths
            </Link>
            <Link 
              to="/problems" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift ${
                isActive('/problems') || location.pathname.startsWith('/practice/') 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📝 Problems
            </Link>
            <Link 
              to="/progress" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift ${
                isActive('/progress') 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📊 Progress
            </Link>
            <Link 
              to="/bookmarks" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift ${
                isActive('/bookmarks') 
                  ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🔖 Bookmarks
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleUserMenuToggle}
                  onMouseDown={(e) => console.log('Mouse down on button')}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 hover-lift"
                  style={{ zIndex: 1000 }}
                >
                  <span>👤</span>
                  <span>{user?.username || user?.email?.split('@')[0] || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && createPortal(
                  <div 
                    className="w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700" 
                    style={{ 
                      position: 'fixed', 
                      zIndex: 2147483647, 
                      top: '60px', 
                      right: '4px'
                    }}
                  >
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        👤 Profile
                      </Link>
                      <Link
                        to="/bookmarks"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        🔖 Bookmarks
                      </Link>
                      <Link
                        to="/sync"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ☁️ Cloud Sync
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        ⚙️ Settings
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 hover-lift btn-press"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

    </header>
  );
}

export default Navbar;