import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config, { sqlUrl } from '../config/environment.js';
import content from '../config/content.js';

function HomePage() {
  const [problemStats, setProblemStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [userStats, setUserStats] = useState({ solved: 0, attempted: 0 });

  useEffect(() => {
    const fetchProblemStats = async () => {
      try {
        const response = await fetch(sqlUrl('problems'));
        const data = await response.json();
        
        if (response.ok && data.problems) {
          const problems = data.problems;
          const stats = {
            total: problems.length,
            easy: problems.filter(p => p.difficulty === 'easy').length,
            medium: problems.filter(p => p.difficulty === 'medium').length,
            hard: problems.filter(p => p.difficulty === 'hard').length
          };
          setProblemStats(stats);
        } else {
          console.warn('Failed to fetch problem stats from API');
          // Don't set fallback stats - let it show 0s if API fails
        }
      } catch (error) {
        console.error('Failed to fetch problem stats:', error);
        // Don't set fallback stats - let it show 0s if API fails
      }
    };

    fetchProblemStats();
    setUserStats({ solved: 12, attempted: 18 });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - LeetCode Style */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {content.homepage.hero.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {content.homepage.hero.subtitle}
            </p>
          </div>

          {/* Stats Cards - LeetCode Style */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{problemStats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{content.homepage.stats.totalLabel}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{problemStats.easy}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{content.homepage.stats.easyLabel}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{problemStats.medium}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{content.homepage.stats.mediumLabel}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{problemStats.hard}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{content.homepage.stats.hardLabel}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Link 
              to="/problems" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {content.homepage.hero.ctaPrimary}
            </Link>
            <Link 
              to="/learning-paths" 
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {content.homepage.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interactive Environment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Run SQL queries instantly with our online editor and see results in real-time.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Real Company Problems</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Practice with actual problems from Fortune 100 companies' technical interviews.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor your improvement with detailed analytics and achievement system.
            </p>
          </div>
        </div>

        {/* Study Plan Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Study Plan</h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded">
                <div className="text-green-600 font-semibold">Fundamentals</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">SELECT, WHERE, ORDER BY</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">15 problems</div>
              </div>
              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded">
                <div className="text-yellow-600 font-semibold">Intermediate</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">JOINs, GROUP BY</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">25 problems</div>
              </div>
              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded">
                <div className="text-orange-600 font-semibold">Advanced</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Window Functions</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">20 problems</div>
              </div>
              <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded">
                <div className="text-red-600 font-semibold">Expert</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complex Queries</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">10 problems</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;