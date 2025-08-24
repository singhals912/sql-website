import React from 'react';
import { Link } from 'react-router-dom';

function TestHomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors animate-fade-in">
      <div className="space-y-8">
        {/* Test Hero Section */}
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-float">
            🎉 NEW BEAUTIFUL DESIGN IS WORKING! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            You can see the beautiful animations and new design! This confirms all our frontend enhancements are working.
          </p>
        </div>

        {/* Test Animation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up animation-delay-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-scale-in">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in">
              <span className="text-2xl text-white">✨</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white text-center">Beautiful Animations</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Smooth CSS animations with staggered delays and hover effects
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-scale-in animation-delay-100">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in animation-delay-100">
              <span className="text-2xl text-white">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white text-center">Modern Design</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Gradient backgrounds, rounded corners, and beautiful shadows
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover animate-scale-in animation-delay-200">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce-in animation-delay-200">
              <span className="text-2xl text-white">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white text-center">Responsive</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              Works perfectly on desktop, tablet, and mobile devices
            </p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex justify-center gap-4 animate-slide-up animation-delay-400">
          <Link 
            to="/problems" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover-lift btn-press animate-pulse-glow"
          >
            🚀 Try the Platform
          </Link>
          <Link 
            to="/progress" 
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 hover-lift btn-press"
          >
            📊 View Progress
          </Link>
        </div>

        {/* Test Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-slide-up animation-delay-500">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Animated Progress Bar</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 progress-bar">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full animate-progress" style={{'--progress-width': '75%', width: '75%'}}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Progress fills with animation!</p>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center animate-bounce-in animation-delay-600">
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">🎊 SUCCESS! 🎊</h2>
          <p className="text-green-700 dark:text-green-300">
            The frontend is working perfectly with all our beautiful enhancements! 
            You can see animations, hover effects, gradients, and responsive design.
          </p>
        </div>
      </div>
    </main>
  );
}

export default TestHomePage;