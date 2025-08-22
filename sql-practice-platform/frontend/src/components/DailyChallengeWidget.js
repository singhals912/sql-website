import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DailyChallengeWidget = ({ compact = false }) => {
  const [challenge, setChallenge] = useState(null);
  const [streakInfo, setStreakInfo] = useState({ current_streak: 0, longest_streak: 0 });
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    fetchDailyChallenge();
    fetchStreakInfo();
    
    // Update countdown every minute
    const interval = setInterval(updateTimeRemaining, 60000);
    updateTimeRemaining();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchStreakInfo();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, []);

  const fetchDailyChallenge = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      const response = await axios.get('http://localhost:5001/api/recommendations/daily-challenge', {
        headers: { 'x-session-id': sessionId }
      });
      
      if (response.data.success) {
        setChallenge(response.data.data.challenge);
      }
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreakInfo = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      const response = await axios.get('http://localhost:5001/api/recommendations/progress-dashboard', {
        headers: { 'x-session-id': sessionId }
      });
      
      if (response.data.success) {
        setStreakInfo(response.data.data.streakInfo || { current_streak: 0, longest_streak: 0 });
      }
    } catch (error) {
      console.error('Error fetching streak info:', error);
    }
  };

  const updateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeRemaining(`${hours}h ${minutes}m`);
  };

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return '🚀';
    if (streak >= 14) return '🔥';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '💪';
    if (streak >= 1) return '🌟';
    return '💤';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-emerald-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading challenge...</span>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">😴</div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">No challenge today</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Check back tomorrow!</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-bold text-sm">Daily Challenge</div>
              <div className="text-xs opacity-90">#{challenge.numeric_id} • {challenge.difficulty}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{streakInfo.current_streak}</div>
            <div className="text-xs opacity-90">streak</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔥</div>
            <div>
              <h3 className="text-xl font-bold">Daily Challenge</h3>
              <p className="text-sm opacity-90">Keep your streak alive!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Resets in</div>
            <div className="text-lg font-bold">{timeRemaining}</div>
          </div>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-center space-x-6 bg-white/10 rounded-lg p-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-2xl">{getStreakEmoji(streakInfo.current_streak)}</span>
              <span className="text-2xl font-bold">{streakInfo.current_streak}</span>
            </div>
            <div className="text-xs opacity-90">Current Streak</div>
          </div>
          <div className="h-8 w-px bg-white/30"></div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-2xl">🏆</span>
              <span className="text-2xl font-bold">{streakInfo.longest_streak}</span>
            </div>
            <div className="text-xs opacity-90">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              #{challenge.numeric_id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
              {challenge.category}
            </span>
          </div>
          {challenge.completed_today && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Completed!</span>
            </div>
          )}
        </div>

        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {challenge.title}
        </h4>

        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
          {challenge.description.substring(0, 200)}...
        </p>

        {/* Progress Indicator */}
        {!challenge.completed_today && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Today's Progress</span>
              <span>0% complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full w-0 transition-all duration-500"></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button 
          className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg ${
            challenge.completed_today
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white'
          }`}
          onClick={() => window.location.href = `/practice/${challenge.id}`}
        >
          {challenge.completed_today ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Challenge Complete!</span>
            </div>
          ) : (
            'Start Daily Challenge'
          )}
        </button>

        {/* Streak Motivation */}
        {!challenge.completed_today && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-blue-500 dark:text-blue-400">💡</span>
              <span className="text-blue-700 dark:text-blue-300 font-medium">
                {streakInfo.current_streak === 0 
                  ? "Start your streak today!" 
                  : `Don't break your ${streakInfo.current_streak}-day streak!`
                }
              </span>
            </div>
          </div>
        )}

        {/* Achievement Preview */}
        {streakInfo.current_streak > 0 && streakInfo.current_streak < 30 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 dark:text-yellow-400">🎯</span>
                <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                  Next milestone: {getNextMilestone(streakInfo.current_streak)} days
                </span>
              </div>
              <div className="text-yellow-600 dark:text-yellow-400 text-xs">
                {getNextMilestone(streakInfo.current_streak) - streakInfo.current_streak} to go
              </div>
            </div>
            <div className="mt-2 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-1">
              <div
                className="bg-yellow-500 h-1 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(streakInfo.current_streak / getNextMilestone(streakInfo.current_streak)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get next streak milestone
const getNextMilestone = (currentStreak) => {
  const milestones = [3, 7, 14, 30, 50, 100];
  return milestones.find(milestone => milestone > currentStreak) || currentStreak + 10;
};

export default DailyChallengeWidget;