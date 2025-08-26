import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProgressService from '../services/progressService';
import { progressUrl } from '../config/environment';

function NewProgressPage() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [detailedProblems, setDetailedProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        // Force session initialization first
        console.log('DEBUG: Initializing session in NewProgressPage');
        await ProgressService.initializeSession();
        console.log('DEBUG: Session initialized with ID:', ProgressService.sessionId);
        
        // Then load progress data
        await loadProgressData();
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Try to load data anyway
        loadProgressData();
      }
    };
    
    initializeAndLoadData();
    
    // Set up heartbeat to keep session active
    const heartbeatInterval = setInterval(() => {
      ProgressService.sendHeartbeat();
    }, 30000); // every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, []);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const sessionIdFromStorage = localStorage.getItem('sql_practice_session_id');
      console.log('DEBUG NewProgressPage: Session ID from localStorage:', sessionIdFromStorage);
      console.log('DEBUG NewProgressPage: ProgressService session ID:', ProgressService.sessionId);
      
      // Test API call directly
      const testResponse = await fetch(`${progressUrl()}/overview`, {
        headers: { 'X-Session-ID': ProgressService.sessionId }
      });
      const testData = await testResponse.json();
      console.log('DEBUG NewProgressPage: Direct API test response:', testData);
      
      // Load all data in parallel - handle each separately to avoid one failure breaking everything
      const [progressData, userStats, leaderboardData] = await Promise.allSettled([
        ProgressService.getProgressOverview(),
        ProgressService.getStats(),
        ProgressService.getLeaderboard()
      ]);
      
      // Extract data from settled promises
      const actualProgressData = progressData.status === 'fulfilled' ? progressData.value : null;
      const actualUserStats = userStats.status === 'fulfilled' ? userStats.value : null;
      const actualLeaderboard = leaderboardData.status === 'fulfilled' ? leaderboardData.value : [];

      console.log('DEBUG NewProgressPage: Progress data received:', actualProgressData);
      console.log('DEBUG NewProgressPage: Overview details:', actualProgressData?.overview);
      console.log('DEBUG NewProgressPage: By difficulty:', actualProgressData?.byDifficulty);
      console.log('DEBUG NewProgressPage: By category:', actualProgressData?.byCategory);
      console.log('DEBUG NewProgressPage: Recent activity:', actualProgressData?.recentActivity);
      console.log('DEBUG NewProgressPage: User stats received:', actualUserStats);
      
      // Even if no progress exists, set the data structure
      const defaultProgressData = {
        overview: { completed: 0, attempted: 0, total: 70, completionRate: 0, avgExecutionTime: 0, avgAttemptsPerProblem: 0 },
        byDifficulty: [],
        byCategory: [],
        recentActivity: [],
        achievements: []
      };
      
      setProgressData(actualProgressData || defaultProgressData);
      
      // Get detailed progress for Problems tab
      try {
        const detailedProgress = await ProgressService.getDetailedProgress();
        console.log('DEBUG: Detailed progress response:', detailedProgress);
        console.log('DEBUG: Type of detailed progress:', typeof detailedProgress);
        console.log('DEBUG: Keys of detailed progress:', Object.keys(detailedProgress || {}));
        
        // The detailed progress might have different structure
        // Check if it has problems in recentActivity or other fields
        let problemsArray = [];
        if (Array.isArray(detailedProgress)) {
          problemsArray = detailedProgress;
        } else if (detailedProgress?.problems) {
          problemsArray = detailedProgress.problems;
        } else if (detailedProgress?.recentActivity) {
          problemsArray = detailedProgress.recentActivity;
        } else {
          // If detailed progress is empty, use the recent activity from overview
          problemsArray = actualProgressData?.recentActivity || [];
        }
        
        console.log('DEBUG: Final problems array:', problemsArray);
        setDetailedProblems(problemsArray);
      } catch (error) {
        console.log('Could not load detailed problems:', error);
        // Fallback to recent activity if detailed progress fails
        setDetailedProblems(actualProgressData?.recentActivity || []);
      }
      
      setStats(actualUserStats || { totalProblems: 0, completedProblems: 0 });
      setLeaderboard(actualLeaderboard || []);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      // Set default data structure even on error
      const defaultProgressData = {
        overview: { completed: 0, attempted: 0, total: 70, completionRate: 0, avgExecutionTime: 0, avgAttemptsPerProblem: 0 },
        byDifficulty: [],
        byCategory: [],
        recentActivity: [],
        achievements: []
      };
      setProgressData(defaultProgressData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <div className="text-gray-600 dark:text-gray-400 mt-4 text-lg">Loading your progress...</div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Progress Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start solving problems to see your progress here!</p>
          <Link
            to="/practice"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Practicing
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'in_progress': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'not_started': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredProblems = (Array.isArray(detailedProblems) ? detailedProblems : []).filter(problem => {
    if (filterDifficulty !== 'all' && problem.difficulty !== filterDifficulty) {
      return false;
    }
    if (filterStatus !== 'all' && problem.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">{progressData.overview.completed}</div>
          <div className="text-blue-100">Problems Solved</div>
          <div className="text-xs text-blue-200 mt-1">
            {progressData.overview.completionRate}% complete
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">{progressData.overview.attempted}</div>
          <div className="text-green-100">Problems Attempted</div>
          <div className="text-xs text-green-200 mt-1">
            Out of 91 total
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">
            {progressData.overview.avgExecutionTime ? `${progressData.overview.avgExecutionTime}ms` : 'N/A'}
          </div>
          <div className="text-purple-100">Avg Execution Time</div>
          <div className="text-xs text-purple-200 mt-1">
            For solved problems
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold mb-2">
            {progressData.overview.avgAttemptsPerProblem || 'N/A'}
          </div>
          <div className="text-orange-100">Avg Attempts</div>
          <div className="text-xs text-orange-200 mt-1">
            Per problem
          </div>
        </div>
      </div>

      {/* Progress by Difficulty */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Progress by Difficulty</h3>
        <div className="space-y-4">
          {(progressData?.byDifficulty || []).map((difficulty, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${getDifficultyColor(difficulty.difficulty)}`}></span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{difficulty.difficulty}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {difficulty.completed || 0}/{difficulty.total || 0} ({difficulty.percentage || difficulty.completionRate || 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${getDifficultyColor(difficulty.difficulty)}`}
                  style={{ width: `${difficulty.completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{difficulty.avgAttempts ? `Avg: ${difficulty.avgAttempts} attempts` : ''}</span>
                <span>{difficulty.avgTime ? `${difficulty.avgTime}ms avg time` : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress by Category */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Progress by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(progressData?.byCategory || []).slice(0, 8).map((category, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{category.category}</h4>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category.completed || 0}/{category.total || category.totalProblems || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${category.percentage || category.completionRate || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {category.percentage || category.completionRate || 0}% complete
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {progressData.recentActivity && progressData.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-3">
            {progressData.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <Link
                      to={`/practice/${activity.problemId}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      #{activity.problemId}: {activity.problemTitle}
                    </Link>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.attempts} attempt{activity.attempts > 1 ? 's' : ''} • {activity.status}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {activity.status}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp && !isNaN(new Date(activity.timestamp)) 
                      ? new Date(activity.timestamp).toLocaleDateString()
                      : 'Recently'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {progressData.achievements && progressData.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">🏆 Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressData.achievements.map((achievement, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🏆</span>
                  <h4 className="font-medium text-gray-900 dark:text-white">{achievement.achievement_name}</h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{achievement.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(achievement.earned_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProblemsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Problems ({filteredProblems.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProblems.map((problem, index) => (
            <div key={index} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                      #{problem.problemId || problem.numeric_id}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/practice/${problem.problemId || problem.numeric_id}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {problem.problemTitle || problem.title}
                    </Link>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {problem.category || 'Unknown'} • {problem.difficulty || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    {problem.attempts > 0 && (
                      <div className="text-gray-600 dark:text-gray-400">
                        {problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}
                      </div>
                    )}
                    {problem.best_execution_time_ms && (
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        Best: {problem.best_execution_time_ms}ms
                      </div>
                    )}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(problem.status)}`}>
                    {problem.status === 'not_started' && '⭕ Not Started'}
                    {problem.status === 'in_progress' && '🔄 In Progress'}
                    {problem.status === 'completed' && '✅ Completed'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">🏆 Anonymous Leaderboard</h3>
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                }`}>
                  {entry.rank}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Anonymous User</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Joined {new Date(entry.firstCompletion).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">{entry.problemsSolved} problems</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {entry.avgExecutionTime ? `${entry.avgExecutionTime}ms avg` : 'No time data'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Your Progress</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your SQL learning journey and achievements</p>
        </div>
        <button
          onClick={loadProgressData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>{loading ? 'Refreshing...' : 'Refresh Progress'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'problems', name: 'Problems', icon: '📝' },
            { id: 'leaderboard', name: 'Leaderboard', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'problems' && renderProblemsTab()}
      {activeTab === 'leaderboard' && renderLeaderboardTab()}

      {/* Refresh Button */}
      <div className="mt-8 text-center">
        <button
          onClick={loadProgressData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Refreshing...
            </>
          ) : (
            '🔄 Refresh Progress'
          )}
        </button>
      </div>
    </div>
  );
}

export default NewProgressPage;