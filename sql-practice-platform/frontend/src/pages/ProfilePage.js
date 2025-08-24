import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Session ID for anonymous users
  const getSessionId = () => {
    let sessionId = localStorage.getItem('sql-practice-session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sql-practice-session', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const sessionId = getSessionId();
      
      // For now, we'll create a mock profile since we don't have user authentication
      // In a real app, this would fetch from the profile API
      setProfile({
        user: {
          id: sessionId,
          username: 'Anonymous User',
          email: '',
          avatar_url: null,
          created_at: new Date().toISOString(),
          preferences: {},
          goals: []
        },
        statistics: {
          problemSolving: {
            problemsAttempted: Math.floor(Math.random() * 50) + 10,
            problemsSolved: Math.floor(Math.random() * 30) + 5,
            totalAttempts: Math.floor(Math.random() * 200) + 50,
            avgSolveTime: Math.floor(Math.random() * 60000) + 30000,
            bestSolveTime: Math.floor(Math.random() * 20000) + 10000,
            successRate: Math.floor(Math.random() * 40) + 60
          },
          difficultyBreakdown: {
            easy: Math.floor(Math.random() * 15) + 5,
            medium: Math.floor(Math.random() * 10) + 3,
            hard: Math.floor(Math.random() * 5) + 1
          },
          activity: {
            activeDays: Math.floor(Math.random() * 30) + 10,
            lastActivity: new Date().toISOString(),
            firstActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            daysSinceStart: Math.floor(Math.random() * 30) + 10
          },
          bookmarks: {
            total: Math.floor(Math.random() * 20) + 5,
            favorites: Math.floor(Math.random() * 8) + 2,
            reviewLater: Math.floor(Math.random() * 8) + 2,
            challenging: Math.floor(Math.random() * 5) + 1
          },
          learningPaths: {
            totalPaths: Math.floor(Math.random() * 5) + 2,
            completedPaths: Math.floor(Math.random() * 3) + 1,
            avgCompletion: Math.floor(Math.random() * 40) + 50,
            activePaths: Math.floor(Math.random() * 3) + 1
          },
          ranking: {
            percentile: Math.floor(Math.random() * 60) + 30,
            solvedCount: Math.floor(Math.random() * 30) + 5
          }
        },
        recentActivity: [],
        achievements: { total: 0, byType: {}, recent: [] },
        streaks: []
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.round(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview', description: 'Statistics and progress summary' },
    { key: 'activity', label: '📈 Activity', description: 'Recent activity and trends' },
    { key: 'achievements', label: '🏆 Achievements', description: 'Badges and milestones' },
    { key: 'goals', label: '🎯 Goals', description: 'Personal goals and targets' },
    { key: 'settings', label: '⚙️ Settings', description: 'Profile and preferences' }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 text-4xl mb-4">❌</div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
          <button
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { statistics } = profile;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6 mb-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.user.username?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.user.username || 'Anonymous User'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Member since {formatDate(profile.user.created_at)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              #{statistics.ranking.percentile}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Percentile Rank
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg p-4 text-center animate-slide-up animation-delay-100">
          <div className="text-2xl font-bold">{statistics.problemSolving.problemsSolved}</div>
          <div className="text-sm">Problems Solved</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg p-4 text-center animate-slide-up animation-delay-200">
          <div className="text-2xl font-bold">{statistics.problemSolving.successRate}%</div>
          <div className="text-sm">Success Rate</div>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg p-4 text-center animate-slide-up animation-delay-300">
          <div className="text-2xl font-bold">{statistics.activity.activeDays}</div>
          <div className="text-sm">Active Days</div>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg p-4 text-center animate-slide-up animation-delay-400">
          <div className="text-2xl font-bold">{statistics.bookmarks.total}</div>
          <div className="text-sm">Bookmarks</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg mb-6 animate-slide-up animation-delay-500">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title={tab.description}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Problem Solving Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🧩 Problem Solving Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {statistics.problemSolving.problemsAttempted}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Problems Attempted</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatTime(statistics.problemSolving.avgSolveTime)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Average Solve Time</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatTime(statistics.problemSolving.bestSolveTime)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Best Solve Time</div>
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Difficulty Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 dark:text-green-300 font-medium">Easy</span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {statistics.difficultyBreakdown.easy}
                      </span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">Medium</span>
                      <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                        {statistics.difficultyBreakdown.medium}
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 dark:text-red-300 font-medium">Hard</span>
                      <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {statistics.difficultyBreakdown.hard}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Paths Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📚 Learning Paths
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {statistics.learningPaths.totalPaths}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Paths</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {statistics.learningPaths.completedPaths}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {statistics.learningPaths.avgCompletion}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {statistics.learningPaths.activePaths}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/learning-paths"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    📚 Explore Learning Paths
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity Timeline
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Track your daily progress and streaks
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Coming soon! This will show your activity calendar and progress charts.
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Achievements & Badges
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Earn badges by completing challenges and milestones
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Start solving problems to unlock your first achievements!
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Goals
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Set and track your learning objectives
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Goal setting feature coming soon!
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <ProfileSettings />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up animation-delay-600">
        <Link
          to="/problems"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-medium text-gray-900 dark:text-white">Solve Problems</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Continue practicing</div>
          </div>
        </Link>
        
        <Link
          to="/bookmarks"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🔖</div>
            <div className="font-medium text-gray-900 dark:text-white">My Bookmarks</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Review saved problems</div>
          </div>
        </Link>
        
        <Link
          to="/learning-paths"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📚</div>
            <div className="font-medium text-gray-900 dark:text-white">Learning Paths</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Follow guided tracks</div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;