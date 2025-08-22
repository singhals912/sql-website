import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LearningPathService from '../services/learningPathService';

const LearningPathsPage = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPath, setSelectedPath] = useState(null);
  const [startingPath, setStartingPath] = useState(null);

  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadLearningPaths();
    if (isAuthenticated) {
      loadUserProgress();
    }
  }, [isAuthenticated]);

  const loadLearningPaths = async () => {
    try {
      const paths = await LearningPathService.getLearningPaths();
      console.log('Loaded learning paths:', paths); // Debug log
      setLearningPaths(paths);
    } catch (error) {
      setError('Failed to load learning paths');
      console.error('Error loading learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const progress = await LearningPathService.getUserProgress(token);
      setUserProgress(progress);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const getUserProgressForPath = (pathId) => {
    return userProgress.find(p => p.learning_path_id === pathId);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartPath = async (pathId) => {
    try {
      // Get the detailed learning path with steps
      const pathDetails = await LearningPathService.getLearningPath(pathId);
      
      if (pathDetails && pathDetails.steps && pathDetails.steps.length > 0) {
        // Navigate to the first problem in the learning path
        const firstStep = pathDetails.steps[0];
        navigate(`/practice/${firstStep.problem_numeric_id}?learningPath=${pathId}`);
      } else {
        // Fallback to problems page
        navigate(`/problems`);
      }
    } catch (error) {
      console.error('Error starting learning path:', error);
      navigate(`/problems`);
    }
  };

  const handleContinuePath = (pathId) => {
    const progress = getUserProgressForPath(pathId);
    const path = learningPaths.find(p => p.id === pathId);
    
    if (progress && path) {
      // Find next uncompleted step or first step
      const nextStep = path.steps.find(step => {
        // This would need to be enhanced with actual completion tracking
        return true; // For now, just go to first step
      });
      
      if (nextStep) {
        navigate(`/practice/${nextStep.problem_numeric_id}?learningPath=${pathId}`);
      }
    }
  };

  const handleViewDetails = async (pathId) => {
    try {
      const pathDetails = await LearningPathService.getLearningPath(pathId);
      setSelectedPath(pathDetails);
    } catch (error) {
      console.error('Error loading path details:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="mt-2 text-gray-600 dark:text-gray-400">Loading learning paths...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              setError('');
              loadLearningPaths();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Learning Paths</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Structured learning tracks to master SQL from beginner to advanced level. 
          Each path contains carefully curated problems that build upon each other.
        </p>
      </div>

      {/* User Progress Summary */}
      {isAuthenticated && userProgress.length > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userProgress.filter(p => p.is_active).length}</div>
              <div className="text-sm text-blue-700">Active Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userProgress.filter(p => p.completion_percentage >= 100).length}
              </div>
              <div className="text-sm text-green-700">Completed Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(userProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / userProgress.length) || 0}%
              </div>
              <div className="text-sm text-purple-700">Average Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {learningPaths.map((path) => {
          const progress = getUserProgressForPath(path.id);
          const isStarted = !!progress;
          const isCompleted = progress?.completion_percentage >= 100;
          
          return (
            <div key={path.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border hover:shadow-xl transition-shadow">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{path.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(path.difficulty_level)}`}>
                    {path.difficulty_level?.charAt(0).toUpperCase() + path.difficulty_level?.slice(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{path.description}</p>
                
                {/* Path Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📚 {path.total_steps || 0} problems</span>
                  <span>⏱️ {path.estimated_hours}h estimated</span>
                  {path.difficulty_level && <span>📈 {path.difficulty_level}</span>}
                </div>
              </div>

              {/* Progress Bar (if started) */}
              {progress && (
                <div className="px-6 py-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress.completion_percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress.completion_percentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {progress.steps_completed} of {progress.total_steps} problems completed
                  </div>
                </div>
              )}

              {/* Skills and Prerequisites */}
              <div className="p-6">
                {path.skills_learned && path.skills_learned.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills You'll Learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {path.skills_learned.slice(0, 4).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {path.skills_learned.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{path.skills_learned.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {path.prerequisites && path.prerequisites.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prerequisites</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {path.prerequisites.join(', ')}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6">
                  {isCompleted ? (
                    <button
                      onClick={() => handleContinuePath(path.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      ✅ Review Path
                    </button>
                  ) : isStarted ? (
                    <button
                      onClick={() => handleContinuePath(path.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartPath(path.id)}
                      disabled={startingPath === path.id}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {startingPath === path.id ? 'Starting...' : 'Start Path'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleViewDetails(path.id)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Path Details Modal */}
      {selectedPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedPath.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedPath.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPath(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Problems in this path</h3>
              <div className="space-y-3">
                {selectedPath.steps?.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">#{step.problem_numeric_id} - {step.problem_title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{step.description}</div>
                      {step.estimated_time_minutes && (
                        <div className="text-xs text-gray-500 mt-1">~{step.estimated_time_minutes} minutes</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        navigate(`/practice/${step.problem_numeric_id}?learningPath=${selectedPath.id}`);
                        setSelectedPath(null);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">💡 Get the Most Out of Learning Paths</h3>
          <p className="text-yellow-700 mb-4">
            Create an account to track your progress, earn achievements, and get personalized recommendations!
          </p>
          <div className="text-sm text-yellow-600">
            <div>✅ Save your progress across devices</div>
            <div>✅ Unlock hints and detailed explanations</div>
            <div>✅ Compete on leaderboards</div>
            <div>✅ Get learning path certificates</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathsPage;