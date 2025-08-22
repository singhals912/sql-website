import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RecommendationDashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    fetchDailyChallenge();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      console.log('📡 RecommendationDashboard received progressUpdated event, refreshing...');
      fetchRecommendations();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, []);

  const fetchRecommendations = async () => {
    try {
      let sessionId = localStorage.getItem('sql_practice_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sql_practice_session_id', sessionId);
      }
      
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/recommendations/problems', {
        headers: { 'x-session-id': sessionId }
      });
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations);
        setUserProfile(response.data.data.userProfile);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyChallenge = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      const response = await axios.get('http://localhost:5001/api/recommendations/daily-challenge', {
        headers: { 'x-session-id': sessionId }
      });
      if (response.data.success) {
        setDailyChallenge(response.data.data.challenge);
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSkillLevelEmoji = (level) => {
    const levels = {
      'Newcomer': '🌱',
      'Beginner': '📚',
      'Intermediate': '💪',
      'Advanced': '🚀',
      'Expert': '👑'
    };
    return levels[level] || '🌱';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your SQL Learning Journey</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getSkillLevelEmoji(userProfile?.skill_level)}</span>
                <span className="text-lg font-semibold">{userProfile?.skill_level || 'Newcomer'}</span>
              </div>
              <div className="h-6 w-px bg-white/30"></div>
              <div className="text-sm opacity-90">
                {userProfile?.completed_problems || 0} problems solved
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end space-y-2">
            <button 
              onClick={() => fetchRecommendations()}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? '⟳' : '↻'} Refresh
            </button>
            <div>
              <div className="text-3xl font-bold">{userProfile?.success_rate || 0}%</div>
              <div className="text-sm opacity-90">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Section */}
      {dailyChallenge && (
        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🔥</div>
              <div>
                <h3 className="text-xl font-bold">Daily Challenge</h3>
                <p className="text-sm opacity-90">Keep your streak alive!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">#{dailyChallenge.numeric_id}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(dailyChallenge.difficulty)}`}>
                {dailyChallenge.difficulty}
              </span>
            </div>
          </div>
          <h4 className="text-lg font-semibold mb-2">{dailyChallenge.title}</h4>
          <p className="text-sm opacity-90 line-clamp-2">{dailyChallenge.description.substring(0, 120)}...</p>
          <button 
            className="mt-4 bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200"
            onClick={() => window.location.href = `/practice/${dailyChallenge.id}`}
          >
            Start Challenge
          </button>
        </div>
      )}

      {/* Recommendations Section - Compact */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            📚 Recommended Problems
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            AI-curated for you
          </span>
        </div>

        <div className="grid gap-3">
          {recommendations.slice(0, 3).map((problem, index) => (
            <div 
              key={problem.id}
              className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Header Line */}
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      #{problem.numeric_id}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs">
                      {problem.category}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      <span>{problem.recommendation_score}% match</span>
                    </div>
                  </div>
                  
                  {/* Title and Description */}
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {problem.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                    {problem.description.substring(0, 80)}...
                  </p>
                  
                  {/* Bottom Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-blue-600 dark:text-blue-400">
                        💡 {problem.recommendation_reason}
                      </span>
                      {problem.hint_count > 0 && (
                        <span>🔍 {problem.hint_count} hints</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Button - Compact */}
                <button 
                  className="ml-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
                  onClick={() => window.location.href = `/practice/${problem.id}`}
                >
                  Solve
                </button>
              </div>
            </div>
          ))}
          
          {/* Show More Button */}
          {recommendations.length > 3 && (
            <button className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
              Show {recommendations.length - 3} more recommendations →
            </button>
          )}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ready to start your SQL journey?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete a few problems to get personalized recommendations!
            </p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              onClick={() => window.location.href = '/problems'}
            >
              Browse All Problems
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationDashboard;