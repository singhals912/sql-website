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
      'concept': 'bg-slate-600 text-slate-50',
      'text': 'bg-emerald-600 text-emerald-50',
      'code': 'bg-slate-700 text-slate-50',
      'example': 'bg-amber-600 text-amber-50',
      'getting_started': 'bg-amber-500 text-amber-50',
      'concept_help': 'bg-slate-600 text-slate-50',
      'structural_hint': 'bg-emerald-600 text-emerald-50'
    };
    return colors[type] || 'bg-slate-500 text-slate-50';
  };

  if (loading && hints.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
          <span className="ml-2 text-slate-600 dark:text-slate-400">Loading hints...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-700 p-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>💡</span>
            <span>Smart Hints</span>
          </h3>
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
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
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
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
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{hint.icon}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {hint.type.replace('_', ' ')}
                  </h4>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg font-medium">
                    Smart
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {hint.content}
                </p>
                {hint.concept && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-lg">
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
                  ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50' 
                  : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => !isLocked && toggleHint(hint.id)}
                disabled={isLocked}
                className={`w-full p-4 text-left flex items-center justify-between ${
                  isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600'
                } rounded-lg transition-colors duration-200`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-2xl ${isLocked ? 'opacity-50' : ''}`}>
                    {isLocked ? '🔒' : getHintTypeIcon(hint.hint_type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-semibold ${isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        Hint {hint.hint_order}
                      </h4>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getHintTypeColor(hint.hint_type)}`}>
                        {hint.hint_type}
                      </span>
                      {hint.sql_concept && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 text-xs rounded-lg">
                          {hint.sql_concept}
                        </span>
                      )}
                    </div>
                    {isLocked && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Unlocks after {hint.reveal_after_attempts} attempts
                      </p>
                    )}
                  </div>
                </div>
                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  {isLocked ? (
                    <div className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{hint.reveal_after_attempts}</span>
                    </div>
                  ) : (
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>
              
              {isExpanded && !isLocked && (
                <div className="px-4 pb-4">
                  <div className="bg-slate-50 dark:bg-slate-600 rounded-lg p-4 mt-2">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {hint.hint_content}
                    </p>
                    {hint.hint_type === 'code' && (
                      <div className="mt-3 p-3 bg-slate-900 rounded-md">
                        <code className="text-emerald-400 text-sm font-mono">
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
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No hints available yet
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Try attempting the problem to unlock contextual hints!
            </p>
          </div>
        )}

        {/* Hint Progress */}
        {hints.length > 0 && (
          <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>Hints Progress</span>
              <span>{expandedHints.size} of {hints.length} viewed</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
              <div
                className="bg-slate-600 h-2 rounded-full transition-all duration-500"
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