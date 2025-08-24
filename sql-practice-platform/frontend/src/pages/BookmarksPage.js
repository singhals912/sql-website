import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookmarksList from '../components/BookmarksList';

const BookmarksPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ favorite: 0, review_later: 0, challenging: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const tabs = [
    { 
      key: 'all', 
      icon: '📝',
      title: 'Total Bookmarks', 
      description: 'View all saved problems', 
      count: stats.total 
    },
    { 
      key: 'favorites', 
      icon: '⭐',
      title: 'Favorites', 
      description: 'Your favorite problems', 
      count: stats.favorite 
    },
    { 
      key: 'review', 
      icon: '📚',
      title: 'Review Later', 
      description: 'Problems to review', 
      count: stats.review_later 
    },
    { 
      key: 'challenging', 
      icon: '🔥',
      title: 'Challenging', 
      description: 'Difficult problems', 
      count: stats.challenging 
    }
  ];

  // Session ID for anonymous users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sql_practice_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sql_practice_session_id', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch('http://localhost:5001/api/bookmarks/stats', {
        headers: { 'X-Session-ID': sessionId }
      });

      if (response.ok) {
        const data = await response.json();
        const apiStats = data.stats || { total: 0, byType: {} };
        setStats({
          total: apiStats.total || 0,
          favorite: apiStats.byType?.favorite || 0,
          review_later: apiStats.byType?.review_later || 0,
          challenging: apiStats.byType?.challenging || 0
        });
      }
    } catch (error) {
      console.error('Error fetching bookmark stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookmarkTypeFromTab = (tab) => {
    switch (tab) {
      case 'favorites': return 'favorite';
      case 'review': return 'review_later';
      case 'challenging': return 'challenging';
      case 'all': return null;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          📚 My Bookmarks
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your saved SQL problems and track your progress
        </p>
      </div>


      {/* Empty State */}
      {stats.total === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No bookmarks yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start bookmarking SQL problems to build your personal collection. Save favorites, mark problems for review, and track challenging exercises.
          </p>
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span>🔍</span>
            Browse Problems
          </Link>
        </div>
      )}

      {/* Tab Navigation - Only show if there are bookmarks */}
      {stats.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 text-center
                    ${activeTab === tab.key
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${tab.count === 0 && tab.key !== 'all' ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                  `}
                  title={tab.description}
                  disabled={tab.count === 0 && tab.key !== 'all'}
                >
                  <div className="text-2xl mb-2">
                    {tab.icon}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${
                    tab.key === 'favorites' ? 'text-yellow-600 dark:text-yellow-400' :
                    tab.key === 'review' ? 'text-blue-600 dark:text-blue-400' :
                    tab.key === 'challenging' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-900 dark:text-white'
                  }`}>
                    {tab.count}
                  </div>
                  <div className="text-sm font-medium">
                    {tab.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700"></div>

          {/* Tab Content */}
          <div className="p-6">
            <BookmarksList 
              bookmarkType={getBookmarkTypeFromTab(activeTab)}
              className="animate-fade-in"
            />
          </div>
        </div>
      )}

      {/* Help Section - Only show if there are bookmarks */}
      {stats.total > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
            💡 Bookmark Types
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800 dark:text-blue-300">
            <div className="flex items-start gap-2">
              <span className="text-lg">⭐</span>
              <div>
                <strong>Favorites:</strong> Problems you enjoyed or found particularly useful for learning
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">📚</span>
              <div>
                <strong>Review Later:</strong> Problems to revisit when you have more time or want to practice
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔥</span>
              <div>
                <strong>Challenging:</strong> Difficult problems that pushed your skills to the limit
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;