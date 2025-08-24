import React, { useState, useEffect } from 'react';

const BookmarkStats = ({ className = '' }) => {
  const [stats, setStats] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Session ID for anonymous users (use same key as ProgressService)
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
      
      const [statsResponse, collectionResponse] = await Promise.all([
        fetch('http://localhost:5001/api/bookmarks/stats', {
          headers: { 'X-Session-ID': sessionId }
        }),
        fetch('http://localhost:5001/api/bookmarks/collection', {
          headers: { 'X-Session-ID': sessionId }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || { total: 0 });
      } else {
        console.error('Failed to fetch bookmark stats:', statsResponse.status);
        setStats({ total: 0, favorite: 0, review_later: 0, challenging: 0 });
      }

      if (collectionResponse.ok) {
        const collectionData = await collectionResponse.json();
        setCollection(collectionData.collection);
      } else {
        console.error('Failed to fetch bookmark collection:', collectionResponse.status);
        setCollection(null);
      }
    } catch (error) {
      console.error('Error fetching bookmark stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <div className="text-gray-500 dark:text-gray-400">
          No bookmarks yet. Start solving problems to build your collection!
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: '⭐',
      label: 'Favorites',
      count: stats.favorite || 0,
      color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300',
      description: 'Problems you loved'
    },
    {
      icon: '📚',
      label: 'Review Later',
      count: stats.review_later || 0,
      color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      description: 'Saved for review'
    },
    {
      icon: '🔥',
      label: 'Challenging',
      count: stats.challenging || 0,
      color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      description: 'Tough problems'
    },
    {
      icon: '📊',
      label: 'Total',
      count: stats.total || 0,
      color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
      description: 'All bookmarks'
    }
  ];

  return (
    <div className={className}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg p-4 text-center`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold mb-1">{card.count}</div>
            <div className="text-sm font-medium mb-1">{card.label}</div>
            <div className="text-xs opacity-75">{card.description}</div>
          </div>
        ))}
      </div>

      {/* Collection Overview */}
      {collection && collection.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📈 Collection Overview
          </h3>
          
          <div className="space-y-4">
            {collection.map((item) => {
              const typeInfo = {
                favorite: { icon: '⭐', label: 'Favorites' },
                review_later: { icon: '📚', label: 'Review Later' },
                challenging: { icon: '🔥', label: 'Challenging' }
              }[item.type];

              // Fallback for unknown types
              if (!typeInfo) {
                return null;
              }

              return (
                <div key={item.type} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{typeInfo.icon}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {typeInfo.label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.count} bookmarks
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    First: {new Date(item.firstBookmarked).toLocaleDateString()} • 
                    Last: {new Date(item.lastBookmarked).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkStats;