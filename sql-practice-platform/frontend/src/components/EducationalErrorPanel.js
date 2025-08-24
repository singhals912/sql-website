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
      'syntax_error': 'bg-rose-600',
      'table_not_found': 'bg-slate-600',
      'column_not_found': 'bg-slate-700',
      'group_by_error': 'bg-amber-600',
      'aggregate_in_where': 'bg-rose-600',
      'ambiguous_column': 'bg-amber-500',
      'division_by_zero': 'bg-slate-600',
      'incomplete_query': 'bg-emerald-600',
      'general_error': 'bg-slate-500'
    };
    return colors[type] || 'bg-slate-500';
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
    <div className="bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl overflow-hidden shadow-sm animate-slideIn">
      {/* Header */}
      <div className={`${getErrorTypeColor(feedback.type)} p-4`}>
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
            className="text-white hover:text-slate-200 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Main Explanation */}
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
          <h4 className="font-semibold text-rose-800 dark:text-rose-200 mb-2 flex items-center space-x-2">
            <span>📚</span>
            <span>What's happening?</span>
          </h4>
          <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
            {feedback.explanation}
          </p>
        </div>

        {/* Suggestions */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center space-x-2">
              <span>🛠️</span>
              <span>How to fix it</span>
            </h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3 text-slate-700 dark:text-slate-300">
                  <div className="w-6 h-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
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
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center space-x-2">
              <span>💡</span>
              <span>Example</span>
            </h4>
            <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-md p-3">
              <code className="text-emerald-700 dark:text-emerald-300 text-sm font-mono">
                {feedback.example}
              </code>
            </div>
          </div>
        )}

        {/* Learn More */}
        {feedback.learnMore && (
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center space-x-2">
              <span>🎓</span>
              <span>Learning insight</span>
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {feedback.learnMore}
            </p>
          </div>
        )}

        {/* Contextual Suggestions */}
        {feedback.context && feedback.context.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center space-x-2">
              <span>🎯</span>
              <span>For this problem</span>
            </h4>
            <ul className="text-amber-700 dark:text-amber-300 space-y-1">
              {feedback.context.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debugging Tips */}
        {feedback.debuggingTips && feedback.debuggingTips.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-600 rounded-lg">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-2">
                <span>🔧</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Debugging Tips
                </span>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${
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
              <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-600">
                <ul className="text-slate-600 dark:text-slate-400 space-y-2 mt-3">
                  {feedback.debuggingTips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-slate-500 mt-1">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Technical Details Toggle */}
        <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200 flex items-center space-x-2"
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
            <div className="mt-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-md">
              <code className="text-xs text-slate-600 dark:text-slate-400 font-mono break-all">
                {feedback.originalError || error}
              </code>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onDismiss}
            className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md"
          >
            Got it, let me try again!
          </button>
          {feedback.isEducational && (
            <button
              onClick={() => window.open('https://www.w3schools.com/sql/', '_blank')}
              className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
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