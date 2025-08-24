import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LearningPathPreview = () => {
  const [conceptMastery, setConceptMastery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningPath();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchLearningPath();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, []);

  const fetchLearningPath = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      if (!sessionId) return;

      const response = await axios.get('http://localhost:5001/api/recommendations/problems', {
        headers: { 'x-session-id': sessionId }
      });

      if (response.data.success) {
        setConceptMastery(response.data.data.conceptMastery || {});
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelInfo = () => {
    if (!conceptMastery) return [];

    // Calculate mastery for different skill levels
    const basicQueries = conceptMastery['Basic Queries']?.overall_mastery || 0;
    const aggregation = conceptMastery['Aggregation']?.overall_mastery || 0;
    const joins = conceptMastery['Joins']?.overall_mastery || 0;
    const windowFunctions = conceptMastery['Window Functions']?.overall_mastery || 0;
    const advancedTopics = conceptMastery['Advanced Topics']?.overall_mastery || 0;

    // Calculate overall levels
    const beginner = Math.round((basicQueries + aggregation) / 2);
    const intermediate = Math.round((joins + (conceptMastery['Subqueries']?.overall_mastery || 0)) / 2);
    const advanced = Math.round((windowFunctions + (conceptMastery['Time Analysis']?.overall_mastery || 0)) / 2);
    const expert = Math.round(advancedTopics);

    return [
      {
        name: 'Beginner',
        description: 'Basic SELECT, WHERE, ORDER BY',
        mastery: beginner,
        icon: '🌱',
        gradient: 'bg-emerald-600',
        concepts: ['Basic Queries', 'Aggregation']
      },
      {
        name: 'Intermediate', 
        description: 'JOINs, Subqueries, GROUP BY',
        mastery: intermediate,
        icon: '💪',
        gradient: 'bg-amber-600',
        concepts: ['Joins', 'Subqueries']
      },
      {
        name: 'Advanced',
        description: 'Window Functions, CTEs',
        mastery: advanced,
        icon: '🚀',
        gradient: 'bg-slate-600',
        concepts: ['Window Functions', 'Time Analysis']
      },
      {
        name: 'Expert',
        description: 'Optimization, Complex Queries',
        mastery: expert,
        icon: '👑',
        gradient: 'bg-slate-700',
        concepts: ['Advanced Topics']
      }
    ];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-700 rounded-lg p-4 animate-pulse">
            <div className="h-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const levels = getLevelInfo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up animation-delay-100">
      {levels.map((level, index) => {
        const isUnlocked = index === 0 || levels[index - 1].mastery >= 60;
        const opacity = isUnlocked ? 'opacity-100' : 'opacity-60';
        
        return (
          <div key={level.name} className={`relative ${opacity}`}>
            <div className={`${level.gradient} text-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow card-hover animate-scale-in animation-delay-${index * 100 + 100}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{level.name}</h4>
                <span className="text-2xl">{level.icon}</span>
              </div>
              <p className="text-sm opacity-90 mb-3">{level.description}</p>
              <div className="w-full bg-white/20 rounded-full h-2 progress-bar">
                <div 
                  className="bg-white h-2 rounded-full animate-progress" 
                  style={{ 
                    '--progress-width': `${level.mastery}%`,
                    width: `${level.mastery}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs opacity-80 mt-1">
                {isUnlocked ? `${level.mastery}% Complete` : 'Locked'}
              </p>
            </div>
            <div className={`absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              isUnlocked ? level.gradient : 'bg-slate-400'
            } rounded-full border-4 border-white dark:border-slate-900`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default LearningPathPreview;