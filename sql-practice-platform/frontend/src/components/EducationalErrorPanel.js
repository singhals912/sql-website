import React, { useState } from 'react';

const EducationalErrorPanel = ({ error, educationalFeedback, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  if (!error && !educationalFeedback) return null;

  const getErrorTypeIcon = (type) => {
    const icons = {
      'syntax_error': '⚠️',
      'table_not_found': '🔍',
      'column_not_found': '📍',
      'group_by_error': '📊',
      'aggregate_in_where': '🚫',
      'ambiguous_column': '❓',
      'division_by_zero': '🔢',
      'incomplete_query': '✏️',
      'general_error': '💡'
    };
    return icons[type] || '💡';
  };

  const getErrorTypeColor = (type) => {
    const colors = {
      'syntax_error': 'from-red-500 to-pink-500',
      'table_not_found': 'from-blue-500 to-indigo-500',
      'column_not_found': 'from-purple-500 to-indigo-500',
      'group_by_error': 'from-orange-500 to-red-500',
      'aggregate_in_where': 'from-red-500 to-rose-500',
      'ambiguous_column': 'from-yellow-500 to-orange-500',
      'division_by_zero': 'from-indigo-500 to-purple-500',
      'incomplete_query': 'from-teal-500 to-cyan-500',
      'general_error': 'from-gray-500 to-gray-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  // If we have educational feedback, use it. Otherwise, create a basic one.
  const feedback = educationalFeedback || {
    type: 'general_error',
    title: 'SQL Error',
    explanation: error || 'An error occurred while executing your query.',
    suggestions: ['Check your SQL syntax', 'Verify table and column names'],
    example: 'Make sure your query follows proper SQL structure',
    learnMore: 'SQL errors help you learn - each one teaches something new!',
    isEducational: false
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden shadow-lg animate-slideIn">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getErrorTypeColor(feedback.type)} p-4`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getErrorTypeIcon(feedback.type)}</div>
            <div>
              <h3 className="text-lg font-bold">{feedback.title}</h3>
              <p className="text-sm opacity-90">Let's fix this together!</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Main Explanation */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center space-x-2">
            <span>📚</span>
            <span>What's happening?</span>
          </h4>
          <p className="text-red-700 dark:text-red-300 leading-relaxed">
            {feedback.explanation}
          </p>
        </div>

        {/* Suggestions */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center space-x-2">
              <span>🛠️</span>
              <span>How to fix it</span>
            </h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3 text-blue-700 dark:text-blue-300">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-200">
                      {index + 1}
                    </span>
                  </div>
                  <span className="leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Example */}
        {feedback.example && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center space-x-2">
              <span>💡</span>
              <span>Example</span>
            </h4>
            <div className="bg-green-100 dark:bg-green-800 rounded-md p-3">
              <code className="text-green-700 dark:text-green-300 text-sm font-mono">
                {feedback.example}
              </code>
            </div>
          </div>
        )}

        {/* Learn More */}
        {feedback.learnMore && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center space-x-2">
              <span>🎓</span>
              <span>Learning insight</span>
            </h4>
            <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
              {feedback.learnMore}
            </p>
          </div>
        )}

        {/* Contextual Suggestions */}
        {feedback.context && feedback.context.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center space-x-2">
              <span>🎯</span>
              <span>For this problem</span>
            </h4>
            <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
              {feedback.context.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debugging Tips */}
        {feedback.debuggingTips && feedback.debuggingTips.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <span>🔧</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Debugging Tips
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600">
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 mt-3">
                  {feedback.debuggingTips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Technical Details Toggle */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>Technical details</span>
            <svg
              className={`w-4 h-4 transform transition-transform duration-200 ${
                showTechnical ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTechnical && (
            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                {feedback.originalError || error}
              </code>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onDismiss}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
          >
            Got it, let me try again!
          </button>
          {feedback.isEducational && (
            <button
              onClick={() => window.open('https://www.w3schools.com/sql/', '_blank')}
              className="flex-1 sm:flex-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Learn more about SQL
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationalErrorPanel;