import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SmartHintsPanel = ({ problemId, userAttempts = 0, userQuery = '' }) => {
  const [hints, setHints] = useState([]);
  const [smartHints, setSmartHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedHints, setExpandedHints] = useState(new Set());
  const [personalizedHint, setPersonalizedHint] = useState(null);

  useEffect(() => {
    if (problemId) {
      fetchHints();
    }
  }, [problemId, userAttempts]);

  useEffect(() => {
    if (userQuery && userQuery.trim().length > 10) {
      const debounceTimer = setTimeout(() => {
        fetchPersonalizedHint();
      }, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [userQuery, problemId]);

  const fetchHints = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      const response = await axios.get(
        `http://localhost:5001/api/recommendations/hints/${problemId}?attempts=${userAttempts}`,
        { headers: { 'x-session-id': sessionId } }
      );
      
      if (response.data.success) {
        setHints(response.data.data.hints || []);
        setSmartHints(response.data.data.smartHints || []);
      }
    } catch (error) {
      console.error('Error fetching hints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedHint = async () => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      const response = await axios.post(
        'http://localhost:5001/api/recommendations/personalized-hint',
        { problemId, userQuery },
        { headers: { 'x-session-id': sessionId } }
      );
      
      if (response.data.success && response.data.data.hint) {
        setPersonalizedHint(response.data.data.hint);
      } else {
        setPersonalizedHint(null);
      }
    } catch (error) {
      console.error('Error fetching personalized hint:', error);
      setPersonalizedHint(null);
    }
  };

  const trackHintUsage = async (hintId) => {
    try {
      const sessionId = localStorage.getItem('sql_practice_session_id');
      await axios.post(
        'http://localhost:5001/api/recommendations/hint-usage',
        { hintId, problemId },
        { headers: { 'x-session-id': sessionId } }
      );
    } catch (error) {
      console.error('Error tracking hint usage:', error);
    }
  };

  const toggleHint = (hintId) => {
    const newExpanded = new Set(expandedHints);
    if (newExpanded.has(hintId)) {
      newExpanded.delete(hintId);
    } else {
      newExpanded.add(hintId);
      trackHintUsage(hintId);
    }
    setExpandedHints(newExpanded);
  };

  const getHintTypeIcon = (type) => {
    const icons = {
      'concept': '💡',
      'text': '📝',
      'code': '💻',
      'example': '🔍',
      'getting_started': '🌟',
      'concept_help': '🎯',
      'structural_hint': '🏗️'
    };
    return icons[type] || '💡';
  };

  const getHintTypeColor = (type) => {
    const colors = {
      'concept': 'from-blue-500 to-indigo-500',
      'text': 'from-green-500 to-teal-500',
      'code': 'from-purple-500 to-pink-500',
      'example': 'from-orange-500 to-red-500',
      'getting_started': 'from-yellow-400 to-orange-500',
      'concept_help': 'from-indigo-500 to-purple-500',
      'structural_hint': 'from-teal-500 to-cyan-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  if (loading && hints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading hints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <span>💡</span>
            <span>Smart Hints</span>
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{hints.length} hints available</span>
            {userAttempts > 0 && (
              <>
                <span>•</span>
                <span>{userAttempts} attempts</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Personalized Hint */}
        {personalizedHint && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getHintTypeIcon(personalizedHint.type)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
                    Real-time Suggestion
                  </h4>
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs rounded-full font-medium">
                    Based on your query
                  </span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
                  {personalizedHint.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Smart Contextual Hints */}
        {smartHints.map((hint, index) => (
          <div 
            key={`smart-${index}`}
            className={`bg-gradient-to-r ${getHintTypeColor(hint.type)}/10 border border-current/20 rounded-lg p-4 transform hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{hint.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {hint.type.replace('_', ' ')}
                  </h4>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 text-xs rounded-full font-medium">
                    Smart
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {hint.content}
                </p>
                {hint.concept && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                      {hint.concept}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Progressive Hints */}
        {hints.map((hint, index) => {
          const isExpanded = expandedHints.has(hint.id);
          const isLocked = hint.reveal_after_attempts > userAttempts;
          
          return (
            <div 
              key={hint.id}
              className={`border rounded-lg transition-all duration-300 ${
                isLocked 
                  ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:shadow-md'
              }`}
            >
              <button
                onClick={() => !isLocked && toggleHint(hint.id)}
                disabled={isLocked}
                className={`w-full p-4 text-left flex items-center justify-between ${
                  isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
                } rounded-lg transition-colors duration-200`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${isLocked ? 'opacity-50' : ''}`}>
                    {isLocked ? '🔒' : getHintTypeIcon(hint.hint_type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold ${isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        Hint {hint.hint_order}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getHintTypeColor(hint.hint_type)} text-white`}>
                        {hint.hint_type}
                      </span>
                      {hint.sql_concept && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          {hint.sql_concept}
                        </span>
                      )}
                    </div>
                    {isLocked && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Unlocks after {hint.reveal_after_attempts} attempts
                      </p>
                    )}
                  </div>
                </div>
                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  {isLocked ? (
                    <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{hint.reveal_after_attempts}</span>
                    </div>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>
              
              {isExpanded && !isLocked && (
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4 mt-2">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {hint.hint_content}
                    </p>
                    {hint.hint_type === 'code' && (
                      <div className="mt-3 p-3 bg-gray-900 rounded-md">
                        <code className="text-green-400 text-sm font-mono">
                          {hint.hint_content}
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* No Hints Available */}
        {hints.length === 0 && smartHints.length === 0 && !personalizedHint && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤔</div>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hints available yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Try attempting the problem to unlock contextual hints!
            </p>
          </div>
        )}

        {/* Hint Progress */}
        {hints.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Hints Progress</span>
              <span>{expandedHints.size} of {hints.length} viewed</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(expandedHints.size / hints.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartHintsPanel;