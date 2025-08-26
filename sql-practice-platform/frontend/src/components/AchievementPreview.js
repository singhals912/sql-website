import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { recommendationsUrl } from '../config/environment';

const AchievementPreview = () => {
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [availableAchievements, setAvailableAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchAchievements();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, []);

  const fetchAchievements = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      if (!sessionId) return;

      const response = await axios.get(recommendationsUrl('achievements'), {
        headers: { 'x-session-id': sessionId }
      });

      if (response.data.success) {
        const data = response.data.data || {};
        setEarnedAchievements(data.earned || []);
        setAvailableAchievements(data.available || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse">
          <div className="w-8 h-8 bg-slate-300 dark:bg-slate-600 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Show latest earned achievement */}
      {earnedAchievements.length > 0 && (
        <div className="flex items-center space-x-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg border border-green-200 dark:border-green-700 animate-scale-in">
          <span className="text-2xl">{earnedAchievements[earnedAchievements.length - 1].icon || '🏆'}</span>
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200">
              {earnedAchievements[earnedAchievements.length - 1].name}
            </h4>
            <p className="text-xs text-green-600 dark:text-green-400">
              {earnedAchievements[earnedAchievements.length - 1].description}
            </p>
          </div>
        </div>
      )}
      
      {/* Show next available achievement */}
      {availableAchievements.length > 0 && (
        <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-gray-600 opacity-60 animate-scale-in animation-delay-100">
          <span className="text-2xl">{availableAchievements[0].icon || '🎯'}</span>
          <div>
            <h4 className="font-medium text-gray-600 dark:text-gray-400">
              {availableAchievements[0].name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {availableAchievements[0].description}
            </p>
          </div>
        </div>
      )}

      {/* Fallback if no achievements */}
      {earnedAchievements.length === 0 && availableAchievements.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
            <span className="text-2xl">🚀</span>
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Start Your Journey</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400">Solve your first problem to earn achievements!</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center pt-2">
        <Link 
          to="/progress"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover-glow"
        >
          View all achievements →
        </Link>
      </div>
    </div>
  );
};

export default AchievementPreview;