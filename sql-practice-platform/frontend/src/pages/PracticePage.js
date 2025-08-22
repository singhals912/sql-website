import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProgressService from '../services/progressService';
import SmartHintsPanel from '../components/SmartHintsPanel';
import BookmarkButton from '../components/BookmarkButton';
import EnhancedErrorDisplay from '../components/EnhancedErrorDisplay';
import SQLHighlightEditor from '../components/SQLHighlightEditor';
import SQLHighlightDisplay from '../components/SQLHighlightDisplay';


function PracticePage() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [sqlQuery, setSqlQuery] = useState('-- Write your SQL query here\n');
  const [selectedDialect, setSelectedDialect] = useState('postgresql');
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [problem, setProblem] = useState(null);
  const [schema, setSchema] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [allProblems, setAllProblems] = useState([]);
  const [showProblemsList, setShowProblemsList] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [learningPathContext, setLearningPathContext] = useState(null);
  const [pathPosition, setPathPosition] = useState(null);
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // 'schema' or 'expected' or null

  // Load cached query from localStorage when problem changes
  useEffect(() => {
    if (problemId) {
      const cachedQuery = localStorage.getItem(`sql_query_${problemId}`);
      console.log('DEBUG: Loading cached query for problem', problemId, ':', cachedQuery ? cachedQuery.substring(0, 50) + '...' : 'not found');
      
      // Clean up problematic cached queries
      if (cachedQuery && cachedQuery.includes('SELECT * FROM customers;')) {
        console.log('DEBUG: Removing problematic cached query');
        localStorage.removeItem(`sql_query_${problemId}`);
        setSqlQuery('-- Write your SQL query here\n');
      } else if (cachedQuery && cachedQuery !== '-- Write your SQL query here\n' && cachedQuery.trim() !== '') {
        setSqlQuery(cachedQuery);
      } else {
        setSqlQuery('-- Write your SQL query here\n');
      }
    }
  }, [problemId]);

  // Save query to localStorage whenever it changes
  useEffect(() => {
    if (problemId && sqlQuery && sqlQuery !== '-- Write your SQL query here\n' && sqlQuery.trim() !== '') {
      const timeoutId = setTimeout(() => {
        console.log('DEBUG: Saving query to localStorage for problem', problemId, sqlQuery.substring(0, 50) + '...');
        localStorage.setItem(`sql_query_${problemId}`, sqlQuery);
      }, 500); // Debounce saving for 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [sqlQuery, problemId]);

  // Define callback functions first (before useEffect that uses them)
  const setupProblemEnvironment = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/sql/problems/${id}/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dialect: selectedDialect })
      });
    } catch (error) {
      console.error('Failed to setup problem environment:', error);
    }
  };

  const loadProblem = useCallback(async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/sql/problems/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        setProblem(data.problem);
        setSchema(data.schema);
        // Don't reset sqlQuery here - let the caching useEffect handle it
        setShowSolution(false); // Reset solution visibility
        // Clear results and errors when loading a new problem
        setResults(null);
        setError(null);
        // Reset attempt count for new problem
        setAttemptCount(0);
        setShowHints(false);
        
        // Setup problem environment
        await setupProblemEnvironment(id);
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
    }
  }, [selectedDialect]);

  const checkLearningPathContext = useCallback(async (problemId) => {
    try {
      // Check if learning path is specified in URL parameters
      const searchParams = new URLSearchParams(location.search);
      const learningPathId = searchParams.get('learningPath');
      
      if (learningPathId) {
        // User came from a specific learning path, use that context
        const positionResponse = await fetch(`http://localhost:5001/api/learning-paths/${learningPathId}/position/${problemId}`);
        const positionData = await positionResponse.json();
        
        if (positionResponse.ok) {
          setLearningPathContext({ learning_path_id: learningPathId, learning_path_name: 'Learning Path' });
          setPathPosition(positionData.position);
          return;
        }
      }
      
      // Fallback: check if problem belongs to any learning paths
      const response = await fetch(`http://localhost:5001/api/problems/${problemId}/learning-paths`);
      const data = await response.json();
      
      if (response.ok && data.learningPaths && data.learningPaths.length > 0) {
        // Set the first learning path as context
        const primaryPath = data.learningPaths[0];
        setLearningPathContext(primaryPath);
        
        // Get position information for this problem in the learning path
        const positionResponse = await fetch(`http://localhost:5001/api/learning-paths/${primaryPath.learning_path_id}/position/${problemId}`);
        const positionData = await positionResponse.json();
        
        if (positionResponse.ok) {
          setPathPosition(positionData.position);
        }
      } else {
        setLearningPathContext(null);
        setPathPosition(null);
      }
    } catch (error) {
      console.error('Failed to check learning path context:', error);
      setLearningPathContext(null);
      setPathPosition(null);
    }
  }, [location.search]);

  // Load all problems and current problem
  useEffect(() => {
    const initialize = async () => {
      // Initialize session first
      try {
        console.log('DEBUG PracticePage: Initializing session');
        await ProgressService.initializeSession();
        console.log('DEBUG PracticePage: Session initialized with ID:', ProgressService.sessionId);
      } catch (error) {
        console.error('Failed to initialize session in PracticePage:', error);
      }
      
      // Then load problems and current problem
      loadAllProblems();
      if (problemId) {
        loadProblem(problemId);
        checkLearningPathContext(problemId);
      } else {
        // Set up default environment
        setupDefaultEnvironment();
      }
    };
    
    initialize();
  }, [problemId, location.search, loadProblem, checkLearningPathContext]);

  // Update current problem index when problem changes
  useEffect(() => {
    if (problemId && allProblems && allProblems.length > 0) {
      const index = allProblems.findIndex(p => 
        p.id === problemId || 
        p.slug === problemId || 
        p.numeric_id === parseInt(problemId)
      );
      if (index !== -1) {
        setCurrentProblemIndex(index);
      }
    }
  }, [problemId, allProblems]);

  const loadAllProblems = async () => {
    try {
      // Check if we're in a learning path context
      const searchParams = new URLSearchParams(location.search);
      const learningPathId = searchParams.get('learningPath');
      
      if (learningPathId) {
        // Load problems specific to this learning path
        const response = await fetch(`http://localhost:5001/api/learning-paths/${learningPathId}`);
        const data = await response.json();
        if (response.ok && data.problems) {
          // Sort by step order for learning paths
          const sortedProblems = data.problems
            .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
            .map(problem => ({
              ...problem,
              // Ensure compatibility with existing problem structure
              id: problem.id,
              numeric_id: problem.numeric_id,
              title: problem.title,
              difficulty: problem.difficulty,
              slug: problem.slug
            }));
          setAllProblems(sortedProblems);
          console.log(`Loaded ${sortedProblems.length} problems for learning path`);
        } else {
          console.error('Learning path problems not found:', data);
          setAllProblems([]);
        }
      } else {
        // Load all problems (default behavior)
        const response = await fetch('http://localhost:5001/api/sql/problems');
        const data = await response.json();
        if (response.ok && data.problems) {
          // Sort problems by numeric_id for sequential ordering
          const sortedProblems = data.problems.sort((a, b) => (a.numeric_id || 0) - (b.numeric_id || 0));
          setAllProblems(sortedProblems);
        } else {
          console.error('Problems data not found in response:', data);
          setAllProblems([]);
        }
      }
    } catch (error) {
      console.error('Failed to load problems list:', error);
      setAllProblems([]);
    }
  };

  const navigateToProblem = (problemId) => {
    // Preserve learning path context in URL if it exists
    const searchParams = new URLSearchParams(location.search);
    const learningPathId = searchParams.get('learningPath');
    const url = learningPathId ? `/practice/${problemId}?learningPath=${learningPathId}` : `/practice/${problemId}`;
    
    navigate(url);
    setShowProblemsList(false);
    // Clear results and errors when navigating to a new problem
    setResults(null);
    setError(null);
    // Scroll to top when navigating to new problem
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToNextProblem = useCallback(async () => {
    // If in learning path context, use learning path navigation
    if (learningPathContext && pathPosition) {
      try {
        const response = await fetch(`http://localhost:5001/api/learning-paths/${learningPathContext.learning_path_id}/next/${problemId}`);
        const data = await response.json();
        
        if (response.ok && data.nextProblem) {
          navigateToProblem(data.nextProblem.problem_numeric_id);
        } else if (data.message) {
          // Show completion message for learning path
          alert(data.message);
        }
        return;
      } catch (error) {
        console.error('Failed to get next problem in path:', error);
        // Fall through to regular navigation
      }
    }
    
    // Regular navigation (not in learning path or API failed)
    if (allProblems && allProblems.length > 0 && currentProblemIndex < allProblems.length - 1) {
      const nextProblem = allProblems[currentProblemIndex + 1];
      if (nextProblem) {
        navigateToProblem(nextProblem.numeric_id);
      }
    }
  }, [learningPathContext, pathPosition, problemId, allProblems, currentProblemIndex]);

  const navigateToPreviousProblem = useCallback(async () => {
    // If in learning path context, use learning path navigation
    if (learningPathContext && pathPosition && pathPosition.has_previous) {
      const prevProblem = pathPosition.previous_problem;
      if (prevProblem) {
        navigateToProblem(prevProblem.problem_numeric_id);
        return;
      }
    }
    
    // Regular navigation (not in learning path or no previous in path)
    if (currentProblemIndex > 0) {
      const prevProblem = allProblems[currentProblemIndex - 1];
      navigateToProblem(prevProblem.numeric_id);
    }
  }, [learningPathContext, pathPosition, currentProblemIndex, allProblems]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const setupDefaultEnvironment = async () => {
    // Default environment is set up automatically by the backend
    console.log('Using default practice environment');
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResults(null); // Clear previous results
    
    // Increment attempt count
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    
    try {
      console.log('DEBUG: Executing query with session ID:', ProgressService.sessionId, 'for problem:', problemId);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('http://localhost:5001/api/execute/sql', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': ProgressService.sessionId,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          sql: sqlQuery, 
          dialect: selectedDialect,
          problemId: problem?.id, // UUID from problem object
          problemNumericId: problem?.numeric_id || parseInt(problemId) // Numeric ID
        })
      });
      
      clearTimeout(timeoutId);
      
      console.log('DEBUG: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('DEBUG: Response data:', data);
      
      if (data.success) {
        setResults(data.data);
        setError(null);
        setErrorAnalysis(null);
        
        // Clear progress cache to ensure fresh data
        ProgressService.clearCache();
        
        // Progress is automatically tracked by the backend in execute.js
        console.log('DEBUG: Query completed. Progress should be automatically tracked by backend.', {
          sessionId: ProgressService.sessionId,
          problemId: problem?.id || problemId,
          problemNumericId: problemId,
          isCorrect: data.data.isCorrect
        });

        // Emit progress update event if problem was solved correctly
        if (data.data.isCorrect) {
          console.log('🎉 Problem solved correctly! Emitting progressUpdated event...');
          window.dispatchEvent(new CustomEvent('progressUpdated', {
            detail: { problemId, solved: true }
          }));
          console.log('✅ progressUpdated event emitted');
        }
      } else {
        console.log('DEBUG: Setting error:', data.error);
        setError(data.error);
        setErrorAnalysis(data.errorAnalysis || null);
        setResults(null); // Clear results on error
        console.log('DEBUG: Error state should now be set');
        
        // Note: Progress tracking for failed attempts is handled by the backend in execute.js
      }
    } catch (err) {
      console.error('DEBUG: Query execution error:', err);
      if (err.name === 'AbortError') {
        setError('Query timed out after 30 seconds. Please try a simpler query.');
      } else {
        setError(`Failed to execute query: ${err.message}`);
      }
      setErrorAnalysis(null);
      setResults(null); // Clear results on network error
    } finally {
      setIsExecuting(false);
    }
  };

  // Close problems list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowProblemsList(false);
      }
    };
    
    if (showProblemsList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProblemsList]);

  // Debug: Track error state changes
  useEffect(() => {
    console.log('DEBUG: Error state changed to:', error);
  }, [error]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger shortcuts when not typing in textarea or input
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        return;
      }
      
      if (event.key === 'ArrowLeft' && event.ctrlKey) {
        event.preventDefault();
        navigateToPreviousProblem();
      } else if (event.key === 'ArrowRight' && event.ctrlKey) {
        event.preventDefault();
        navigateToNextProblem();
      } else if (event.key === 'p' && event.ctrlKey) {
        event.preventDefault();
        setShowProblemsList(!showProblemsList);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentProblemIndex, allProblems?.length, showProblemsList, navigateToNextProblem, navigateToPreviousProblem]);

  // If no problem is selected, redirect to problems page
  if (!problemId) {
    return <Navigate to="/problems" replace />;
  }
  // Problem mode - show the full problem-solving interface
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="mb-6">
        {problem && (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-lg">
                  #{problem.numeric_id?.toString().padStart(3, '0') || '000'}
                </span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{problem.title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{problem.category_name}</span>
                    {learningPathContext && pathPosition && (
                      <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full border border-blue-200 dark:border-blue-800">
                        <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                          📚 {learningPathContext.learning_path_name}
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          ({pathPosition.current_step}/{pathPosition.total_steps})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                {/* Bookmark Button */}
                <BookmarkButton problemId={problem?.id} size="md" />
                
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                <div className="text-xs text-gray-500 mr-2">
                  <div>Ctrl + ← / →</div>
                  <div>Ctrl + P</div>
                </div>
                <button
                  onClick={navigateToPreviousProblem}
                  disabled={currentProblemIndex === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover-lift btn-press"
                  title="Previous Problem (Ctrl + Left Arrow)"
                >
                  ← Previous
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowProblemsList(!showProblemsList)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-blue-600 dark:border-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-lg transition-all duration-200 hover-lift btn-press animate-pulse-gentle"
                  >
                    All Problems ({allProblems?.length || 0})
                  </button>
                  
                  {/* Problems dropdown */}
                  {showProblemsList && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        {allProblems?.map((prob, index) => (
                          <button
                            key={prob.id}
                            onClick={() => {
                              navigateToProblem(prob.numeric_id);
                              setShowProblemsList(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              prob.numeric_id === problem?.numeric_id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">#{prob.numeric_id?.toString().padStart(3, '0') || '000'}</span>
                              <span className="truncate flex-1">{prob.title}</span>
                              <span className={`px-1 py-0.5 rounded text-xs ${getDifficultyColor(prob.difficulty)}`}>
                                {prob.difficulty?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={navigateToNextProblem}
                  disabled={currentProblemIndex === (allProblems?.length || 0) - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover-lift btn-press"
                  title="Next Problem (Ctrl + Right Arrow)"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Left/Right Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
        
        {/* LEFT PANEL: Problem Info, Schema, Hints */}
        <div className="flex flex-col space-y-4 h-full max-h-[80vh] overflow-y-auto pr-2">
          
          {/* Problem Description */}
          {problem && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Problem Description</h2>
                {schema && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="text-sm px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {showSolution ? 'Hide Solution' : 'Show Solution'}
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="prose max-w-none text-gray-900 dark:text-white">
                  <div dangerouslySetInnerHTML={{ 
                    __html: problem.description
                      .replace(/\*\*Expected Output:\*\*.*?(?=\*\*|$)/g, '') // Remove Expected Output section
                      .replace(/Expected Output:.*?(?=\n\n|\n\*\*|$)/g, '') // Remove Expected Output without bold
                      // Make section headers bold (whether they already are or not)
                      .replace(/\*\*Business Context:\*\*/g, '<strong class="text-gray-900 dark:text-white">Business Context:</strong>')
                      .replace(/\*\*Scenario:\*\*/g, '<strong class="text-gray-900 dark:text-white">Scenario:</strong>')
                      .replace(/\*\*Problem:\*\*/g, '<strong class="text-gray-900 dark:text-white">Problem:</strong>')
                      .replace(/Business Context:/g, '<strong class="text-gray-900 dark:text-white">Business Context:</strong>')
                      .replace(/Scenario:/g, '<strong class="text-gray-900 dark:text-white">Scenario:</strong>')
                      .replace(/Problem:/g, '<strong class="text-gray-900 dark:text-white">Problem:</strong>')
                      // Handle other bold text
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>')
                      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-1 rounded">$1</code>')
                      .replace(/```sql\n([\s\S]*?)\n```/g, '<pre class="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded overflow-x-auto"><code>$1</code></pre>')
                      .replace(/\n/g, '<br>')
                      .replace(/<br><br>/g, '<br>') // Clean up double line breaks
                  }} />
                </div>
                
                {/* Show Solution */}
                {showSolution && schema && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">💡</span>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Solution</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          navigator.clipboard.writeText(schema.solution_sql);
                          const btn = e.target;
                          const originalText = btn.textContent;
                          btn.textContent = 'Copied!';
                          setTimeout(() => {
                            btn.textContent = originalText;
                          }, 2000);
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Copy SQL to clipboard"
                      >
                        📋 Copy
                      </button>
                    </div>
                    <SQLHighlightDisplay
                      value={schema.solution_sql}
                      height="400px"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collapsible Sections */}
          <div className="space-y-4">
            {/* Database Schema Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setExpandedSection(expandedSection === 'schema' ? null : 'schema')}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
              >
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Database Schema</h2>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
                    expandedSection === 'schema' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSection === 'schema' && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  {schema ? (
                    <div>
                      {/* Parse and display schema tables */}
                      {(() => {
                        const createTableRegex = /CREATE TABLE (\w+) \(([\s\S]*?)\);/g;
                        const tables = [];
                        const sampleData = {};
                        let match;
                        
                        // Parse table structures
                        while ((match = createTableRegex.exec(schema.setup_sql)) !== null) {
                          const tableName = match[1];
                          const columnsText = match[2];
                          
                          const parseColumns = (columnsText) => {
                            const columns = [];
                            let current = '';
                            let parenDepth = 0;
                            
                            for (let i = 0; i < columnsText.length; i++) {
                              const char = columnsText[i];
                              if (char === '(') parenDepth++;
                              if (char === ')') parenDepth--;
                              
                              if (char === ',' && parenDepth === 0) {
                                if (current.trim()) columns.push(current.trim());
                                current = '';
                              } else {
                                current += char;
                              }
                            }
                            if (current.trim()) columns.push(current.trim());
                            return columns;
                          };
                          
                          const columns = parseColumns(columnsText)
                            .filter(col => col.length > 0)
                            .map(col => {
                              const parts = col.split(' ');
                              const name = parts[0];
                              const type = parts.slice(1).join(' ').toUpperCase();
                              return { name, type };
                            });
                          
                          tables.push({ name: tableName, columns });
                        }
                        
                        // Parse sample data
                        const insertMatches = [...schema.setup_sql.matchAll(/INSERT INTO\s+(\w+)\s+VALUES\s+([\s\S]*?);/g)];
                        insertMatches.forEach(match => {
                          const tableName = match[1];
                          const valuesText = match[2];
                          const rowMatches = [...valuesText.matchAll(/\(([\s\S]*?)\)/g)];
                          sampleData[tableName] = rowMatches.slice(0, 5).map(rowMatch => {
                            return rowMatch[1].split(',').map(val => {
                              const trimmed = val.trim();
                              // Remove quotes and handle nulls
                              if (trimmed === 'NULL') return 'NULL';
                              return trimmed.replace(/^'|'$/g, '').replace(/''/g, "'");
                            });
                          });
                        });
                        
                        return (
                          <div className="space-y-6">
                            {tables.map(table => (
                              <div key={table.name} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">{table.name}</h3>
                                </div>
                                <div className="p-4">
                                  <div className="space-y-2 mb-4">
                                    {table.columns.map(col => (
                                      <div key={col.name} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{col.name}</span>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 py-0.5 rounded">{col.type}</span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* Sample Data */}
                                  {sampleData[table.name] && sampleData[table.name].length > 0 && (
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sample Data:</h4>
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs border border-gray-200 dark:border-gray-600">
                                          <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                              {table.columns.map(col => (
                                                <th key={col.name} className="px-2 py-1 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-0">
                                                  {col.name}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {sampleData[table.name].map((row, idx) => (
                                              <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                                                {row.map((cell, cellIdx) => (
                                                  <td key={cellIdx} className="px-2 py-1 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-0">
                                                    {cell}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">No database schema available</div>
                  )}
                </div>
              )}
            </div>

            {/* Expected Output Section */}
            {problem && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'expected' ? null : 'expected')}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                >
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Expected Output</h2>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform ${
                      expandedSection === 'expected' ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSection === 'expected' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {schema && schema.expected_output && schema.expected_output.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              {Object.keys(schema.expected_output[0]).map((column, index) => (
                                <th
                                  key={index}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-500"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                            {schema.expected_output.slice(0, 10).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                {Object.values(row).map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                                  >
                                    {cell !== null ? cell.toString() : 'NULL'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {schema.expected_output.length > 10 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Showing first 10 rows of {schema.expected_output.length} expected rows
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expected output will be shown when available.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hints Panel */}
          {problem && showHints && (
            <SmartHintsPanel 
              problemId={problem?.id || problemId}
              attemptCount={attemptCount}
              userQuery={sqlQuery}
              onClose={() => setShowHints(false)}
            />
          )}
        </div>
        
        {/* RIGHT PANEL: SQL Editor, Results */}
        <div className="flex flex-col space-y-4 overflow-hidden">
          
          {/* SQL Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">SQL Query</h2>
              <div className="flex items-center space-x-2">
                {problem && attemptCount > 0 && (
                  <button
                    onClick={() => setShowHints(true)}
                    className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900 transition-colors"
                  >
                    💡 Hints ({Math.min(attemptCount, 3)})
                  </button>
                )}
                <select
                  value={selectedDialect}
                  onChange={(e) => setSelectedDialect(e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
                <button
                  onClick={executeQuery}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 hover-lift btn-press"
                  title="Execute query (Ctrl+Enter)"
                >
                  {isExecuting ? (
                    <>
                      <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Running...
                    </>
                  ) : (
                    'Run Query'
                  )}
                </button>
              </div>
            </div>
            
            <div style={{ height: '400px' }}>
              <SQLHighlightEditor
                value={sqlQuery}
                onChange={setSqlQuery}
                onExecute={executeQuery}
                isExecuting={isExecuting}
                height="100%"
              />
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" style={{ minHeight: '400px' }}>
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Results</h2>
            </div>
            
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '350px' }}>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800 dark:text-red-300 mb-2">
                    <span className="text-lg">❌</span>
                    <span className="font-medium">SQL Error</span>
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                </div>
              )}
              
              {results && (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">
                        Execution time: {results.executionTime} • {results.rowCount || results.rows?.length || 0} rows returned
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Query executed successfully
                      </div>
                    </div>
                    
                    {/* Validation Results */}
                    {(results.isCorrect !== null || results.feedback) && (
                      <div className={`p-3 rounded-md border ${
                        results.isCorrect === true
                          ? 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800' 
                          : 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800'
                      }`}>
                        <div className={`flex items-center space-x-2 ${
                          results.isCorrect === true
                            ? 'text-green-800 dark:text-green-300' 
                            : 'text-red-800 dark:text-red-300'
                        }`}>
                          <span className="text-lg">
                            {results.isCorrect ? '🎉' : '❌'}
                          </span>
                          <span className="font-medium">
                            {results.isCorrect ? 'Correct Solution!' : 'Incorrect Solution'}
                          </span>
                        </div>
                        <div className={`text-sm mt-1 ${
                          results.isCorrect 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-red-700 dark:text-red-400'
                        }`}>
                          {results.feedback}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Results Table */}
                  {results.rows && results.rows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 dark:border-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            {Object.keys(results.rows[0]).map((column) => (
                              <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {results.rows.slice(0, 100).map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                                  {value !== null ? value.toString() : <span className="text-gray-400">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {results.rows?.length > 100 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                          Showing first 100 rows of {results.rows?.length || 0} total rows
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 dark:text-gray-400">
                        Query executed successfully but returned no rows
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expected Output Section */}
              {problem && problem.expected_output && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Expected Output</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {problem.expected_output.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                          <thead className="bg-gray-100 dark:bg-gray-600">
                            <tr>
                              {Object.keys(problem.expected_output[0]).map((column, index) => (
                                <th
                                  key={index}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider border border-gray-300 dark:border-gray-500"
                                >
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                            {problem.expected_output.slice(0, 20).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                {Object.values(row).map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500"
                                  >
                                    {cell !== null ? cell.toString() : 'NULL'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {problem.expected_output.length > 20 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Showing first 20 rows of {problem.expected_output.length} expected rows
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-gray-500 dark:text-gray-400">
                          Expected output not available for this problem
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {!results && !error && !isExecuting && (
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">💻</div>
                  <div className="text-gray-500 dark:text-gray-400 mt-2">Run a query to see results</div>
                </div>
              )}
              
              {isExecuting && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <div className="text-gray-500 dark:text-gray-400 mt-2">Executing query...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PracticePage;