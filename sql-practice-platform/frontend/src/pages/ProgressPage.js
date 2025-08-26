import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProgressService from '../services/progressService';
import { apiUrl } from '../config/environment';

function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    accuracyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        // Clear cache to get fresh data
        ProgressService.clearCache();
        
        // Get basic problem count
        const problemsResponse = await fetch(apiUrl('sql/problems'));
        const problemsData = await problemsResponse.json();
        const totalProblems = problemsData.problems?.length || 0;

        // Get user progress
        const detailedProgress = await ProgressService.getDetailedProgress();
        
        // Calculate key metrics
        const solvedProblems = detailedProgress.filter(p => p.status === 'completed').length;
        const totalAttempts = detailedProgress.reduce((sum, p) => sum + (p.total_attempts || 0), 0);
        const correctAttempts = detailedProgress.reduce((sum, p) => sum + (p.correct_attempts || 0), 0);
        const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

        // Get recent activity (last 10 problems worked on)
        const recentActivity = detailedProgress
          .filter(p => p.total_attempts > 0)
          .sort((a, b) => new Date(b.last_attempt_at) - new Date(a.last_attempt_at))
          .slice(0, 10);

        setStats({
          totalProblems,
          solvedProblems,
          totalAttempts,
          correctAttempts,
          accuracyRate
        });
        
        setRecentActivity(recentActivity);
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'attempted': return '🔄';
      default: return '⭕';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading your progress...</div>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalProblems > 0 ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">Your Progress</h1>
        <p className="text-gray-600 dark:text-gray-400 animate-slide-up animation-delay-100">Track your SQL learning journey</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up animation-delay-200">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 card-hover animate-scale-in">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-bounce-in">{stats.solvedProblems}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</div>
          <div className="text-xs text-gray-500 mt-1">of {stats.totalProblems} total</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 card-hover animate-scale-in animation-delay-100">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 animate-bounce-in animation-delay-100">{completionRate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2 progress-bar">
            <div className="bg-green-600 h-2 rounded-full animate-progress" style={{ '--progress-width': `${completionRate}%`, width: `${completionRate}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 card-hover animate-scale-in animation-delay-200">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 animate-bounce-in animation-delay-200">{stats.totalAttempts}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
          <div className="text-xs text-gray-500 mt-1">{stats.correctAttempts} correct</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 card-hover animate-scale-in animation-delay-300">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 animate-bounce-in animation-delay-300">{stats.accuracyRate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
          <div className="text-xs text-gray-500 mt-1">first-try success</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 card-hover animate-slide-up animation-delay-400">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-slide-down">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your last 10 problems</p>
        </div>
        
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">No activity yet</div>
              <Link 
                to="/problems" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors hover-lift btn-press animate-pulse-glow"
              >
                Start Solving Problems
              </Link>
            </div>
          ) : (
            <div className="space-y-3 animate-slide-up animation-delay-100">
              {recentActivity.map((activity, index) => (
                <div key={activity.problem_numeric_id} className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg card-hover animate-slide-right animation-delay-${index * 100 + 100}`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg animate-bounce-in">{getStatusIcon(activity.status)}</span>
                    <div>
                      <Link 
                        to={`/practice/${activity.problem_numeric_id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover-glow"
                      >
                        Problem #{activity.problem_numeric_id}
                      </Link>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.total_attempts} attempts • {activity.correct_attempts} correct
                        {activity.best_execution_time_ms && ` • ${activity.best_execution_time_ms}ms best time`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                      {activity.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.last_attempt_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-500">
        <Link 
          to="/problems" 
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium hover-lift btn-press animate-scale-in"
        >
          Browse All Problems
        </Link>
        <Link 
          to="/practice" 
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-medium hover-lift btn-press animate-scale-in animation-delay-100"
        >
          Continue Practicing
        </Link>
      </div>
    </div>
  );
}

export default ProgressPage;