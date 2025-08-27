import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { recommendationsUrl } from '../config/environment';

const RecommendationDashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  useEffect(() => {
    fetchRecommendations();

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
      const response = await axios.get(recommendationsUrl('problems'), {
        headers: { 'x-session-id': sessionId }
      });
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'medium': return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'hard': return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
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

      {/* Recommendations Section - Compact */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            📚 Recommended Problems
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            AI-curated for you
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Ready to start your SQL journey?</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Complete a few problems to get personalized recommendations!</p>
            <button 
              onClick={() => window.location.href = '/problems'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Browse All Problems
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {(showAllRecommendations ? recommendations : recommendations.slice(0, 3)).map((problem, index) => (
            <div 
              key={problem.id}
              className="group bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Header Line */}
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                      #{problem.numeric_id}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded text-xs">
                      {problem.category}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                      <span>{problem.recommendation_score}% match</span>
                    </div>
                  </div>
                  
                  {/* Title and Description */}
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {problem.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                    {problem.description.substring(0, 80)}...
                  </p>
                  
                  {/* Bottom Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="text-slate-600 dark:text-slate-400">
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
                  className="ml-4 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm z-10 relative cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/practice/${problem.id}`;
                  }}
                >
                  Solve
                </button>
              </div>
            </div>
          ))}
          
          {/* Show More/Less Button */}
          {recommendations.length > 3 && (
            <button 
              className="w-full py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors cursor-pointer relative z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAllRecommendations(!showAllRecommendations);
              }}
            >
              {showAllRecommendations 
                ? `Show less ↑` 
                : `Show ${recommendations.length - 3} more recommendations →`
              }
            </button>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationDashboard;