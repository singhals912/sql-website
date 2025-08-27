import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { bookmarksUrl } from '../config/environment';

const BookmarksList = ({ bookmarkType = null, className = '' }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use the prop directly, don't maintain separate state
  const selectedType = bookmarkType || 'all';

  // Session ID for anonymous users (use same key as ProgressService)
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sql_practice_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sql_practice_session_id', sessionId);
    }
    return sessionId;
  };

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sessionId = getSessionId();
      // The backend /bookmarks endpoint should filter on the frontend side,
      // not via different URLs. All bookmarks are returned and we filter them.
      const url = bookmarksUrl(); // Just get base bookmarks URL
      
      console.log('Fetching bookmarks:', { url, sessionId, selectedType });
      
      const response = await fetch(url, {
        headers: {
          'X-Session-ID': sessionId
        }
      });
      
      console.log('Bookmarks response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bookmarks response data:', data);
        
        let allBookmarks = data.bookmarks || [];
        
        // Filter bookmarks based on selectedType
        let filteredBookmarks = allBookmarks;
        if (selectedType !== 'all') {
          // Map frontend filter names to backend type values
          const typeMap = {
            'favorites': 'favorite',
            'review': 'review_later', 
            'challenging': 'challenging'
          };
          const backendType = typeMap[selectedType] || selectedType;
          filteredBookmarks = allBookmarks.filter(bookmark => bookmark.type === backendType);
        }
        
        setBookmarks(filteredBookmarks);
        console.log('Updated bookmarks state with', filteredBookmarks.length, 'items (filtered from', allBookmarks.length, 'total)');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Bookmarks fetch failed:', response.status, errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [bookmarkType, selectedType]); // Dependencies for useCallback

  const removeBookmark = async (problemId) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(bookmarksUrl(problemId), {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId
        }
      });
      
      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.problem_id !== problemId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // Fetch bookmarks when bookmarkType changes
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // Add refresh every 5 seconds to catch new bookmarks - now properly respects filter
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing bookmarks...');
      fetchBookmarks();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchBookmarks]);

  const getBookmarkIcon = (type) => {
    switch (type) {
      case 'favorite': return '⭐';
      case 'review_later': return '📚';
      case 'challenging': return '🔥';
      default: return '🔖';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };


  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-2">❌</div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
          <button
            onClick={fetchBookmarks}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No bookmarks yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {selectedType === 'all' 
              ? 'Start bookmarking problems to build your collection!'
              : `No ${selectedType.replace('_', ' ')} bookmarks found.`
            }
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <span>🔍</span>
            Browse Problems
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(bookmark => (
            <div
              key={bookmark.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{getBookmarkIcon(bookmark.bookmark_type)}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-sm bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                      #{bookmark.numeric_id?.toString().padStart(3, '0')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(bookmark.difficulty)}`}>
                      {bookmark.difficulty?.charAt(0).toUpperCase() + bookmark.difficulty?.slice(1)}
                    </span>
                  </div>
                  
                  <Link
                    to={`/practice/${bookmark.numeric_id}`}
                    className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors block mb-2"
                  >
                    {bookmark.title}
                  </Link>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{bookmark.category_name || 'Uncategorized'}</span>
                    <span>•</span>
                    <span>Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {bookmark.notes && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Notes: </span>
                      {bookmark.notes}
                    </div>
                  )}
                  
                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {bookmark.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/practice/${bookmark.numeric_id}`}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"
                  >
                    Solve
                  </Link>
                  <button
                    onClick={() => removeBookmark(bookmark.problem_id)}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksList;