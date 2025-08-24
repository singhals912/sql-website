import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/environment.js';
import content from '../config/content.js';
import { mockLearningModules, mockLearningPaths, mockUserProgress } from '../data/mockLearningData.js';

function LearnPage() {
  const [modules, setModules] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('paths');
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const [modulesRes, pathsRes, progressRes] = await Promise.all([
          fetch(apiUrl('learning/modules')),
          fetch(apiUrl('learning/paths')),
          fetch(apiUrl('learning/progress'))
        ]);

        const [modulesData, pathsData, progressData] = await Promise.all([
          modulesRes.json(),
          pathsRes.json(), 
          progressRes.json()
        ]);

        if (modulesData.success) setModules(modulesData.modules);
        else throw new Error('API not available');
        
        if (pathsData.success) setLearningPaths(pathsData.paths);
        if (progressData.success) setUserProgress(progressData.progress);

      } catch (apiError) {
        console.log('API not available, using mock data for demonstration');
        // Use mock data as fallback
        setModules(mockLearningModules);
        setLearningPaths(mockLearningPaths);
        setUserProgress(mockUserProgress);
        
        // Add demo mode indicator
        localStorage.setItem('learning_demo_mode', 'true');
        setIsDemoMode(true);
      }

    } catch (error) {
      console.error('Failed to fetch learning data:', error);
      // Fallback to mock data in case of any error
      setModules(mockLearningModules);
      setLearningPaths(mockLearningPaths);
      setUserProgress(mockUserProgress);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '🚀';
      case 'advanced': return '🎯';
      default: return '📚';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-gray-500 dark:text-gray-400 mt-2">Loading learning content...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Learn SQL
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Master SQL with structured lessons and hands-on practice
              </p>
            </div>
            {userProgress && (
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Your Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {userProgress.completionPercentage}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {userProgress.totalConceptsCompleted} of {userProgress.totalConcepts} concepts
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-200">Demo Mode Active</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Learning system is running with demonstration data. Restart the backend server to enable full functionality.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('paths')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'paths'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Learning Paths
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Modules
            </button>
          </nav>
        </div>

        {/* Learning Paths Tab */}
        {activeTab === 'paths' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Structured Learning Paths
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Follow these curated paths to build your SQL knowledge step by step.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {learningPaths.map((path) => (
                <Link
                  key={path.id}
                  to={`/learn/paths/${path.id}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {path.title}
                    </h3>
                    <div className="text-2xl">📚</div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {path.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>{path.modules.length} modules</span>
                    <span>{path.estimatedTime}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {path.modules.slice(0, 3).map((moduleId, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {moduleId.replace('-', ' ')}
                      </span>
                    ))}
                    {path.modules.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{path.modules.length - 3} more
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                All Learning Modules
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Explore individual modules to focus on specific SQL topics.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <Link
                  key={module.id}
                  to={`/learn/modules/${module.id}`}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {module.title}
                    </h3>
                    <div className="text-2xl">{getDifficultyIcon(module.difficulty)}</div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {module.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(module.difficulty)}`}>
                      {module.difficulty}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {module.estimatedTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{module.conceptCount} concepts</span>
                    {module.prerequisites.length > 0 && (
                      <span>Prerequisites: {module.prerequisites.length}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearnPage;