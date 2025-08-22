import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import HintService from '../services/hintService';

const HintsPanel = ({ problemId, attemptCount = 0 }) => {
  const [hints, setHints] = useState([]);
  const [revealedHints, setRevealedHints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, token } = useAuth();

  useEffect(() => {
    if (problemId) {
      loadHints();
      loadRevealedHints();
    }
  }, [problemId, attemptCount]);

  const loadHints = async () => {
    try {
      const availableHints = await HintService.getAvailableHints(problemId, attemptCount, token);
      setHints(availableHints);
    } catch (error) {
      console.error('Error loading hints:', error);
      setError('Failed to load hints');
    }
  };

  const loadRevealedHints = async () => {
    try {
      const usage = await HintService.getHintUsage(problemId, token);
      setRevealedHints(usage.map(u => u.hint_id));
    } catch (error) {
      console.error('Error loading revealed hints:', error);
    }
  };

  const revealHint = async (hintId) => {
    setLoading(true);
    try {
      await HintService.revealHint(problemId, hintId, token);
      setRevealedHints([...revealedHints, hintId]);
      await loadHints(); // Reload to get updated content
    } catch (error) {
      console.error('Error revealing hint:', error);
      setError('Failed to reveal hint');
    } finally {
      setLoading(false);
    }
  };

  const getHintIcon = (type) => {
    switch (type) {
      case 'concept': return '💡';
      case 'text': return '📝';
      case 'code': return '💻';
      default: return '❓';
    }
  };

  const getHintTypeColor = (type) => {
    switch (type) {
      case 'concept': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'text': return 'bg-green-50 border-green-200 text-green-800';
      case 'code': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (hints.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg border">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">💡 Hints</h3>
        </div>
        <div className="p-4 text-center text-gray-500">
          <div className="text-4xl mb-2">🤔</div>
          <div>No hints available for this problem yet.</div>
          <div className="text-sm mt-1">Try solving it on your own first!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">💡 Hints</h3>
          <div className="text-sm text-gray-500">
            {revealedHints.length} of {hints.length} revealed
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-1">
          Progressive hints to help you solve the problem step by step
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {hints.map((hint, index) => {
          const isRevealed = hint.is_available && (revealedHints.includes(hint.id) || hint.hint_content);
          const canReveal = hint.is_available && !isRevealed;
          const isLocked = !hint.is_available;

          return (
            <div key={hint.id} className={`border rounded-lg overflow-hidden ${getHintTypeColor(hint.hint_type)}`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getHintIcon(hint.hint_type)}</span>
                    <span className="font-medium">
                      Hint {hint.hint_order} - {hint.hint_type?.charAt(0).toUpperCase() + hint.hint_type?.slice(1)}
                    </span>
                    {hint.sql_concept && (
                      <span className="px-2 py-1 bg-white bg-opacity-60 rounded text-xs">
                        {hint.sql_concept}
                      </span>
                    )}
                  </div>
                  
                  {isLocked && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>🔒</span>
                      <span>After {hint.reveal_after_attempts} attempts</span>
                    </div>
                  )}
                </div>

                {isRevealed ? (
                  <div className="bg-white bg-opacity-60 p-3 rounded border">
                    {hint.hint_type === 'code' ? (
                      <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800">
                        {hint.hint_content}
                      </pre>
                    ) : (
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {hint.hint_content}
                      </p>
                    )}
                  </div>
                ) : canReveal ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Click to reveal this hint (available after {hint.reveal_after_attempts} attempts)
                    </p>
                    <button
                      onClick={() => revealHint(hint.id)}
                      disabled={loading}
                      className="bg-white bg-opacity-80 hover:bg-opacity-100 px-3 py-1 rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Revealing...' : 'Reveal Hint'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-40 p-3 rounded border border-dashed">
                    <p className="text-sm text-gray-600 italic">
                      This hint will be available after {hint.reveal_after_attempts} attempts. 
                      Current attempts: {attemptCount}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {hints.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-600 mt-0.5">💡</span>
              <div className="text-sm text-yellow-800">
                <strong>Pro tip:</strong> Try to solve the problem yourself first! Hints are here to help when you're stuck, 
                but you'll learn more by attempting the solution independently.
              </div>
            </div>
          </div>
        )}

        {!user && hints.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">🔐</span>
              <div className="text-sm text-blue-800">
                <strong>Sign up for free</strong> to track your hint usage and get personalized recommendations!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HintsPanel;