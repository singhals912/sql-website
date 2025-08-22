import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProgressVisualization = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProgressDashboard();

    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchProgressDashboard();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
    };
  }, []);

  const fetchProgressDashboard = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      console.log('📊 ProgressVisualization fetching with sessionId:', sessionId);
      
      const response = await axios.get('http://localhost:5001/api/recommendations/progress-dashboard', {
        headers: { 'x-session-id': sessionId }
      });
      
      console.log('📊 Progress dashboard response:', response.data);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
        console.log('📊 Dashboard data set:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching progress dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMasteryColor = (percentage) => {
    if (percentage >= 90) return 'from-purple-500 to-pink-500';
    if (percentage >= 70) return 'from-green-500 to-blue-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    if (percentage >= 25) return 'from-blue-500 to-indigo-500';
    return 'from-gray-400 to-gray-500';
  };

  const getMasteryLabel = (percentage) => {
    if (percentage >= 90) return 'Master';
    if (percentage >= 70) return 'Proficient';
    if (percentage >= 50) return 'Developing';
    if (percentage >= 25) return 'Learning';
    return 'Beginner';
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, children }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="text-blue-500 transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  const ActivityChart = ({ weeklyData }) => {
    console.log('🔍 ActivityChart received weeklyData:', weeklyData);
    
    // Generate the last 30 days of data
    const generateLast30Days = () => {
      const days = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Find actual data for this date or default to 0
        const dayData = weeklyData?.find(d => d.date === dateStr) || {
          date: dateStr,
          problems_solved: 0
        };
        
        days.push(dayData);
      }
      
      return days;
    };

    const last30Days = generateLast30Days();
    const maxProblems = Math.max(...last30Days.map(d => d.problems_solved), 1);
    
    // Calculate actual date labels
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    const endDate = new Date();
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Last 30 Days Activity
        </h4>
        <div className="grid grid-cols-10 gap-1">
          {last30Days.map((day, index) => {
            const intensity = day.problems_solved / maxProblems;
            const getIntensityColor = () => {
              if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
              if (intensity < 0.3) return 'bg-green-200 dark:bg-green-900';
              if (intensity < 0.6) return 'bg-green-400 dark:bg-green-700';
              if (intensity < 0.8) return 'bg-green-500 dark:bg-green-600';
              return 'bg-green-600 dark:bg-green-500';
            };

            const dayDate = new Date(day.date);
            const isToday = dayDate.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`w-3 h-3 rounded-sm ${getIntensityColor()} tooltip hover:scale-125 transition-transform cursor-pointer ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                }`}
                title={`${formatDate(dayDate)}: ${day.problems_solved} problem${day.problems_solved !== 1 ? 's' : ''} solved`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDate(startDate)}</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center p-8">No progress data available</div>;
  }

  const { overallProgress, skillMastery, achievements, streakInfo, weeklyProgress } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'skills', label: 'Skills', icon: '🎯' },
          { id: 'achievements', label: 'Achievements', icon: '🏆' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <CircularProgress percentage={parseFloat(overallProgress.completion_percentage)}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {overallProgress.completion_percentage}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
                  </div>
                </CircularProgress>
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Overall Progress
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {overallProgress.problems_completed} of {overallProgress.total_problems_available} problems
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🎯</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallProgress.success_rate || 0}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🔥</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {streakInfo.current_streak}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">⚡</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overallProgress.avg_solve_time ? Math.round(overallProgress.avg_solve_time / 1000) : 0}s
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Solve Time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <ActivityChart weeklyData={weeklyProgress} />
          </div>
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillMastery.map((skill) => (
            <div
              key={skill.category}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {skill.category}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getMasteryColor(skill.mastery_percentage)} text-white`}>
                    {getMasteryLabel(skill.mastery_percentage)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {skill.mastery_percentage}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {skill.completed_problems}/{skill.total_problems}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${getMasteryColor(skill.mastery_percentage)} transition-all duration-1000 ease-out`}
                  style={{ width: `${skill.mastery_percentage}%` }}
                ></div>
              </div>

              {/* Difficulty breakdown */}
              <div className="space-y-2">
                {Object.entries(skill.difficulty_breakdown).map(([difficulty, data]) => (
                  data.total > 0 && (
                    <div key={difficulty} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {difficulty}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-blue-500 transition-all duration-700"
                            style={{ width: `${data.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-xs w-8 text-right">
                          {data.completed}/{data.total}
                        </span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Earned Achievements */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>🏆</span>
              <span>Earned Achievements ({achievements.total_earned})</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.earned.map((achievement) => (
                <div
                  key={achievement.key}
                  className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-bold text-sm mb-1">{achievement.name}</h4>
                    <p className="text-xs opacity-90">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Achievements */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <span>🎯</span>
              <span>Next Achievements</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.available.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.key}
                  className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 hover:border-blue-400 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2 opacity-50">{achievement.icon}</div>
                    <h4 className="font-bold text-sm mb-1 text-gray-700 dark:text-gray-300">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {achievement.description}
                    </p>
                    {achievement.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div
                            className="h-1 rounded-full bg-blue-500"
                            style={{ width: `${Math.min(achievement.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressVisualization;