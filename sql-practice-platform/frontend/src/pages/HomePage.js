import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-slide-up">
          Master SQL with Interactive Challenges
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto animate-slide-up animation-delay-200">
          Practice SQL queries with real-time execution and instant feedback. 
          Build your skills from basic queries to advanced data analysis with Fortune 100 scenarios.
        </p>
        
        <div className="flex justify-center gap-4 mb-12 animate-slide-up animation-delay-300">
          <Link 
            to="/problems" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 hover-lift btn-press"
          >
            🚀 Start Practicing
          </Link>
          <Link 
            to="/learning-paths" 
            className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-300 hover-lift btn-press"
          >
            📚 Learning Paths
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-slide-up animation-delay-400">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow card-hover animate-scale-in">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <span className="text-2xl">💻</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Interactive Editor</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Write and execute SQL queries with syntax highlighting and autocomplete
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow card-hover animate-scale-in animation-delay-100">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in animation-delay-100">
              <span className="text-2xl">🗄️</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Multi-Database Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Practice with PostgreSQL, MySQL, and SQLite environments
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow card-hover animate-scale-in animation-delay-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in animation-delay-200">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Progress Tracking</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your learning journey with detailed analytics and achievements
            </p>
          </div>
        </div>

        <div className="mt-16 animate-slide-up animation-delay-500">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 animate-slide-down">Learning Path</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up animation-delay-100">
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 card-hover animate-scale-in">
              <h4 className="font-semibold text-green-800 dark:text-green-300">Beginner</h4>
              <p className="text-sm text-green-600 dark:text-green-400">Basic SELECT, WHERE, ORDER BY</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 card-hover animate-scale-in animation-delay-100">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Intermediate</h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">JOINs, Subqueries, GROUP BY</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-4 card-hover animate-scale-in animation-delay-200">
              <h4 className="font-semibold text-orange-800 dark:text-orange-300">Advanced</h4>
              <p className="text-sm text-orange-600 dark:text-orange-400">Window Functions, CTEs</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 card-hover animate-scale-in animation-delay-300">
              <h4 className="font-semibold text-red-800 dark:text-red-300">Expert</h4>
              <p className="text-sm text-red-600 dark:text-red-400">Optimization, Complex Queries</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default HomePage;