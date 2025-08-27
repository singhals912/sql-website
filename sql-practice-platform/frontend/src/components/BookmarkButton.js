import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bookmarksUrl } from '../config/environment';

const BookmarkButton = ({ problemId, size = 'md', className = '' }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkType, setBookmarkType] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });


  const toggleBookmark = (buttonElement) => {
    if (isBookmarked) {
      removeBookmark();
    } else {
      // Calculate button position for dropdown placement
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom,
          left: rect.left
        });
      }
      setShowDropdown(!showDropdown);
    }
  };

  // Get session ID (same logic as other components)
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sql_practice_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sql_practice_session_id', sessionId);
    }
    return sessionId;
  };

  // Check if problem is already bookmarked when component loads
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!problemId) {
        console.log('No problemId provided, skipping bookmark check');
        return;
      }

      try {
        const sessionId = getSessionId();
        
        const response = await fetch(bookmarksUrl(`check/${problemId}`), {
          headers: {
            'X-Session-ID': sessionId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.bookmarked);
          setBookmarkType(data.bookmarkType);
        } else {
          console.error('Failed to check bookmark status:', response.status);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    if (problemId) {
      checkBookmarkStatus();
    }
  }, [problemId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the button and dropdown
      if (showDropdown && 
          !event.target.closest('.bookmark-dropdown') && 
          !event.target.closest('button')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

  // Early return if no problemId (after hooks)
  if (!problemId) {
    return (
      <div className={`relative ${className}`}>
        <button 
          className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
          disabled
          title="Problem ID not available"
        >
          🔖
        </button>
      </div>
    );
  }

  const handleBookmark = async (type) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const sessionId = getSessionId();
      
      // Add bookmark
      const response = await fetch(bookmarksUrl(problemId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          bookmarkType: type
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(true);
        setBookmarkType(type);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Bookmark failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    } finally {
      setLoading(false);
      setShowDropdown(false);
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      default: return 'w-10 h-10 text-base';
    }
  };

  const getBookmarkIcon = () => {
    if (!isBookmarked) return '🔖';
    switch (bookmarkType) {
      case 'favorite': return '⭐';
      case 'review_later': return '📚';
      case 'challenging': return '🔥';
      default: return '⭐';
    }
  };

  const removeBookmark = async () => {
    console.log('removeBookmark called');
    if (loading) return;
    
    setLoading(true);
    try {
      const sessionId = getSessionId();
      console.log('Removing bookmark:', { problemId, sessionId });
      
      const response = await fetch(bookmarksUrl(problemId), {
        method: 'DELETE',
        headers: {
          'X-Session-ID': sessionId
        }
      });
      
      console.log('Remove bookmark response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Remove bookmark response data:', data);
        setIsBookmarked(false);
        setBookmarkType(null);
        console.log('Bookmark state updated:', { isBookmarked: false, bookmarkType: null });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Remove bookmark failed:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} style={{ zIndex: showDropdown ? 9999 : 'auto' }}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          toggleBookmark(e.currentTarget);
        }}
        disabled={loading}
        className={`
          ${getSize()}
          flex items-center justify-center
          rounded-full border-2 transition-all duration-200
          cursor-pointer relative
          ${loading 
            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
            : isBookmarked 
              ? 'bg-blue-100 border-blue-500 text-blue-600 hover:bg-blue-200' 
              : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
          }
          ${!loading && 'hover:scale-105'}
        `}
        title={isBookmarked ? `Remove ${bookmarkType} bookmark` : "Bookmark this problem"}
        style={{ 
          pointerEvents: loading ? 'none' : 'auto',
          zIndex: showDropdown ? 10000 : 10
        }}
      >
        {loading ? '⏳' : getBookmarkIcon()}
      </button>

      {showDropdown && !isBookmarked && createPortal(
        <>
          {/* Transparent backdrop to close dropdown */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999998,
              backgroundColor: 'transparent',
              pointerEvents: 'all'
            }}
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown menu positioned near button */}
          <div 
            className="bookmark-dropdown w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl"
            style={{
              position: 'fixed',
              zIndex: 999999,
              top: buttonPosition.top + 8,
              left: Math.max(0, buttonPosition.left - 192 + 40), // Align right edge, with padding
              pointerEvents: 'all'
            }}
          >
            <div className="p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark('favorite');
                }}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
                style={{ pointerEvents: 'all' }}
              >
                <span>⭐</span>
                <span>Favorite</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark('review_later');
                }}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
                style={{ pointerEvents: 'all' }}
              >
                <span>📚</span>
                <span>Review Later</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark('challenging');
                }}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2"
                style={{ pointerEvents: 'all' }}
              >
                <span>🔥</span>
                <span>Challenging</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
      
    </div>
  );
};

export default BookmarkButton;