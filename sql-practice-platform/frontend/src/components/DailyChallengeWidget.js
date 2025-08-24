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
      case 'easy': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'hard': return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
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
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-bold text-sm text-amber-900 dark:text-amber-100">Daily Challenge</div>
              <div className="text-xs text-amber-700 dark:text-amber-300">#{challenge.numeric_id} • {challenge.difficulty}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-amber-900 dark:text-amber-100">{streakInfo.current_streak}</div>
            <div className="text-xs text-amber-700 dark:text-amber-300">streak</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔥</div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">Daily Challenge</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">Keep your streak alive!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-amber-700 dark:text-amber-300">Resets in</div>
            <div className="text-lg font-bold text-amber-900 dark:text-amber-100">{timeRemaining}</div>
          </div>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-center space-x-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-2xl">{getStreakEmoji(streakInfo.current_streak)}</span>
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">{streakInfo.current_streak}</span>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">Current Streak</div>
          </div>
          <div className="h-8 w-px bg-amber-300 dark:bg-amber-700"></div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span className="text-2xl">🏆</span>
              <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">{streakInfo.longest_streak}</span>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">Best Streak</div>
          </div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
              #{challenge.numeric_id}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
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

        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
          {challenge.title}
        </h4>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
          {challenge.description.substring(0, 200)}...
        </p>

        {/* Progress Indicator */}
        {!challenge.completed_today && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Today's Progress</span>
              <span>0% complete</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full w-0 transition-all duration-500"></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button 
          className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
            challenge.completed_today
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
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
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-amber-600 dark:text-amber-400">💡</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
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
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-amber-600 dark:text-amber-400">🎯</span>
                <span className="text-amber-700 dark:text-amber-300 font-medium">
                  Next milestone: {getNextMilestone(streakInfo.current_streak)} days
                </span>
              </div>
              <div className="text-amber-600 dark:text-amber-400 text-xs">
                {getNextMilestone(streakInfo.current_streak) - streakInfo.current_streak} to go
              </div>
            </div>
            <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-1">
              <div
                className="bg-amber-500 h-1 rounded-full transition-all duration-500"
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