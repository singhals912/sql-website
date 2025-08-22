import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AchievementSystem = ({ showNotifications = true }) => {
  const [achievements, setAchievements] = useState({ earned: [], available: [] });
  const [newAchievements, setNewAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId') || 'anonymous-' + Date.now();
      const response = await axios.get('http://localhost:5001/api/recommendations/achievements', {
        headers: { 'x-session-id': sessionId }
      });
      
      if (response.data.success) {
        const newData = response.data.data;
        
        // Check for new achievements
        const previousEarned = JSON.parse(localStorage.getItem('earnedAchievements') || '[]');
        const newlyEarned = newData.earned.filter(
          achievement => !previousEarned.some(prev => prev.key === achievement.key)
        );
        
        if (newlyEarned.length > 0 && showNotifications) {
          setNewAchievements(newlyEarned);
          setTimeout(() => setNewAchievements([]), 5000);
        }
        
        // Store current achievements
        localStorage.setItem('earnedAchievements', JSON.stringify(newData.earned));
        setAchievements(newData);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const AchievementBadge = ({ achievement, isEarned = false, isNew = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div
        className={`relative group transform transition-all duration-300 ${
          isEarned ? 'hover:scale-110 cursor-pointer' : 'opacity-60'
        } ${isNew ? 'animate-bounce' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all duration-300 ${
            isEarned
              ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-yellow-200'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}
        >
          {achievement.icon}
          
          {/* Shine effect for earned achievements */}
          {isEarned && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          )}
          
          {/* New achievement indicator */}
          {isNew && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </div>
        
        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
              <div className="font-semibold">{achievement.name}</div>
              <div className="opacity-80">{achievement.description}</div>
              {achievement.progress !== undefined && !isEarned && (
                <div className="mt-1">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1">{achievement.progress}% complete</div>
                </div>
              )}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AchievementNotification = ({ achievement, onClose }) => {
    return (
      <div className="fixed top-4 right-4 z-50 animate-slideInRight">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-bounce">{achievement.icon}</div>
            <div className="flex-1">
              <h4 className="font-bold text-lg">Achievement Unlocked!</h4>
              <p className="text-sm opacity-90">{achievement.name}</p>
              <p className="text-xs opacity-80">{achievement.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Notifications */}
      {newAchievements.map((achievement, index) => (
        <AchievementNotification
          key={achievement.key}
          achievement={achievement}
          onClose={() => setNewAchievements(prev => prev.filter((_, i) => i !== index))}
        />
      ))}

      {/* Earned Achievements Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>🏆</span>
            <span>Your Achievements</span>
          </h3>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            {achievements.earned.length} earned
          </div>
        </div>

        {achievements.earned.length > 0 ? (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-items-center">
            {achievements.earned.map((achievement) => (
              <div key={achievement.key} className="text-center">
                <AchievementBadge 
                  achievement={achievement} 
                  isEarned={true}
                  isNew={newAchievements.some(newAch => newAch.key === achievement.key)}
                />
                <div className="mt-2">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {achievement.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start your achievement journey!
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Solve problems to unlock your first achievement
            </p>
          </div>
        )}
      </div>

      {/* Available Achievements Section */}
      {achievements.available.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <span>🎯</span>
            <span>Coming Up Next</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.available.slice(0, 6).map((achievement) => (
              <div
                key={achievement.key}
                className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center space-x-4">
                  <AchievementBadge achievement={achievement} isEarned={false} />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    
                    {/* Progress bar for achievements with progress */}
                    {achievement.progress !== undefined && achievement.progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <span>📊</span>
          <span>Achievement Stats</span>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {achievements.earned.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Earned</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {achievements.total_available}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Math.round((achievements.earned.length / achievements.total_available) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {achievements.available.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;