import React from 'react';
import { Link } from 'react-router-dom';
import RecommendationDashboard from '../components/RecommendationDashboard';
import DailyChallengeWidget from '../components/DailyChallengeWidget';
import AchievementPreview from '../components/AchievementPreview';
import ProgressVisualization from '../components/ProgressVisualization';
import LearningPathPreview from '../components/LearningPathPreview';

function NewHomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors animate-fade-in">
      <div className="space-y-8">
        {/* Hero Section with Welcome */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-float">
            Welcome to Your SQL Learning Journey
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            Master SQL with personalized recommendations, intelligent hints, and real-time progress tracking
          </p>
        </div>

        {/* Top Row: Daily Challenge + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up animation-delay-300">
          <div className="lg:col-span-2 animate-slide-right">
            <DailyChallengeWidget />
          </div>
          <div className="space-y-4 animate-slide-right animation-delay-100">
            {/* Quick Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-scale-in">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <span>🚀</span>
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                <Link 
                  to="/problems" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg block text-center hover-lift btn-press"
                >
                  Browse All Problems
                </Link>
                <Link 
                  to="/progress" 
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 block text-center hover-lift btn-press"
                >
                  View Detailed Progress
                </Link>
                <Link 
                  to="/learning-paths" 
                  className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200 block text-center hover-lift btn-press"
                >
                  Learning Paths
                </Link>
              </div>
            </div>

            {/* Achievement Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-scale-in animation-delay-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>🏆</span>
                  <span>Recent Achievements</span>
                </h3>
                <Link 
                  to="/progress"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors hover-glow"
                >
                  View all →
                </Link>
              </div>
              
              {/* Simple Achievement Preview */}
              <AchievementPreview />
            </div>
          </div>
        </div>

        {/* Main Content: Recommendations */}
        <div className="animate-slide-up animation-delay-400">
          <RecommendationDashboard />
        </div>

        {/* Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-slide-up animation-delay-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>📊</span>
              <span>Your Progress Overview</span>
            </h2>
            <Link 
              to="/progress"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 hover-lift btn-press"
            >
              View Full Dashboard
            </Link>
          </div>
          <ProgressVisualization />
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up animation-delay-600">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 card-hover animate-scale-in">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <span className="text-2xl text-white">💡</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100 text-center">Smart Hints</h3>
            <p className="text-blue-700 dark:text-blue-300 text-center text-sm">
              Progressive hints that unlock based on your attempts and provide contextual guidance
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 card-hover animate-scale-in animation-delay-100">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in animation-delay-100">
              <span className="text-2xl text-white">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-green-900 dark:text-green-100 text-center">Personalized Learning</h3>
            <p className="text-green-700 dark:text-green-300 text-center text-sm">
              AI-powered recommendations based on your skill level and learning patterns
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 card-hover animate-scale-in animation-delay-200">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in animation-delay-200">
              <span className="text-2xl text-white">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-purple-900 dark:text-purple-100 text-center">Educational Feedback</h3>
            <p className="text-purple-700 dark:text-purple-300 text-center text-sm">
              Transform SQL errors into learning moments with detailed explanations and examples
            </p>
          </div>
        </div>

        {/* Learning Path Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-slide-up animation-delay-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2 animate-slide-down">
            <span>🛤️</span>
            <span>Your Learning Path</span>
          </h2>
          <LearningPathPreview />
        </div>
      </div>
    </main>
  );
}

export default NewHomePage;