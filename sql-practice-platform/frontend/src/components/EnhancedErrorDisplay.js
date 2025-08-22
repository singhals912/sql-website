import React, { useState } from 'react';

const EnhancedErrorDisplay = ({ error, errorAnalysis, onQuickFix }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');

  if (!error) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return '❌';
    }
  };

  const getErrorTypeIcon = (errorType) => {
    const icons = {
      'table_not_found': '🗂️',
      'column_not_found': '📋',
      'syntax_error': '🔤',
      'group_by_error': '📊',
      'function_not_found': '⚙️',
      'division_by_zero': '➗',
      'permission_denied': '🔒'
    };
    return icons[errorType] || '⚠️';
  };

  return (
    <div className={`border rounded-lg p-4 ${getSeverityColor(errorAnalysis?.severity)}`}>
      {/* Main Error Display */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {errorAnalysis ? getSeverityIcon(errorAnalysis.severity) : '❌'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              {errorAnalysis ? getErrorTypeIcon(errorAnalysis.type) : ''} SQL Error
              {errorAnalysis?.type && (
                <span className="ml-2 text-xs font-normal capitalize">
                  ({errorAnalysis.type.replace('_', ' ')})
                </span>
              )}
            </h3>
            {errorAnalysis && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-medium"
              >
                {showDetails ? 'Hide Details' : 'Show Help'}
              </button>
            )}
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>

      {/* Detailed Error Analysis */}
      {showDetails && errorAnalysis && (
        <div className="mt-4 border-t border-red-200 dark:border-red-800 pt-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-3">
            {[
              { key: 'suggestions', label: 'Solutions', count: errorAnalysis.suggestions?.length },
              { key: 'examples', label: 'Examples', count: errorAnalysis.examples?.length },
              { key: 'quickfixes', label: 'Quick Fixes', count: errorAnalysis.quickFixes?.length },
              { key: 'learning', label: 'Learn More', count: errorAnalysis.learningSuggestions?.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                    : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1 px-1 py-0.5 bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-red-100 dark:border-red-900">
            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && errorAnalysis.suggestions && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">💡 Solutions</h4>
                <ul className="space-y-2">
                  {errorAnalysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && errorAnalysis.examples && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">📝 Examples</h4>
                <div className="space-y-2">
                  {errorAnalysis.examples.map((example, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
                      <code className="text-gray-800 dark:text-gray-200">{example}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Fixes Tab */}
            {activeTab === 'quickfixes' && errorAnalysis.quickFixes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">🔧 Quick Fixes</h4>
                <div className="space-y-3">
                  {errorAnalysis.quickFixes.map((fix, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded p-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{fix.description}</p>
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        <code className="text-sm text-gray-800 dark:text-gray-200 block">
                          {fix.correctedQuery}
                        </code>
                        {onQuickFix && (
                          <button
                            onClick={() => onQuickFix(fix.correctedQuery)}
                            className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Apply Fix
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Tab */}
            {activeTab === 'learning' && errorAnalysis.learningSuggestions && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">📚 Learn More</h4>
                <ul className="space-y-2">
                  {errorAnalysis.learningSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                      <span className="text-blue-500 mr-2">📖</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Performance Hints */}
          {errorAnalysis.performanceHints && errorAnalysis.performanceHints.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                ⚡ Performance Hints
              </h4>
              {errorAnalysis.performanceHints.map((hint, index) => (
                <div key={index} className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                  <strong>{hint.message}</strong>
                  <br />
                  <em className="text-xs">{hint.suggestion}</em>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedErrorDisplay;