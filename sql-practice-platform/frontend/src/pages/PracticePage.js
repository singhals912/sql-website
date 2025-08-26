import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProgressService from '../services/progressService';
import SmartHintsPanel from '../components/SmartHintsPanel';
import BookmarkButton from '../components/BookmarkButton';
import EnhancedErrorDisplay from '../components/EnhancedErrorDisplay';
import SQLHighlightEditor from '../components/SQLHighlightEditor';
import SQLHighlightDisplay from '../components/SQLHighlightDisplay';
import { sqlUrl, apiUrl, learningPathsUrl } from '../config/environment';


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
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'editorial', 'solutions'

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
      await fetch(sqlUrl(`problems/${id}/setup`), {
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
    console.log('🔍 LOADING PROBLEM:', id, 'URL:', sqlUrl(`problems/${id}`));
    try {
      const response = await fetch(sqlUrl(`problems/${id}`));
      console.log('📡 PROBLEM API Response:', response.status, response.statusText);
      const data = await response.json();
      console.log('📊 PROBLEM API Data:', data);
      
      if (response.ok) {
        console.log('DEBUG: Successfully loaded problem data:', data);
        console.log('DEBUG: Problem object exists:', !!data.problem);
        console.log('DEBUG: Problem title:', data.problem?.title);
        console.log('DEBUG: Problem numeric_id:', data.problem?.numeric_id);
        console.log('DEBUG: Full problem object:', JSON.stringify(data.problem));
        setProblem(data.problem);
        
        // Process schema and parse JSON strings
        let processedSchema = data.schema || data.problem?.schema;
        if (processedSchema && processedSchema.expected_output) {
          try {
            // Parse expected_output if it's a string
            if (typeof processedSchema.expected_output === 'string') {
              processedSchema.expected_output = JSON.parse(processedSchema.expected_output);
            }
          } catch (error) {
            console.error('Failed to parse expected_output:', error);
            processedSchema.expected_output = [];
          }
        }
        setSchema(processedSchema);
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
      } else {
        console.error('DEBUG: API response not ok:', response.status, response.statusText);
        console.error('DEBUG: Response data:', data);
      }
    } catch (error) {
      console.error('DEBUG: Failed to load problem:', error);
      console.error('DEBUG: Error details:', error.message, error.stack);
      
      // Fallback to mock data for problem 5 when API fails
      if (id === '5') {
        console.log('DEBUG: Using fallback mock data for problem 5');
        const mockProblem = {
          id: 5,
          numeric_id: 5,
          title: "Adobe Creative Cloud Subscription Analytics",
          description: `Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns and loyalty programs. As a data analyst, you need to analyze customer subscription and purchase data to determine which customers have spent the most money overall.

**Business Context:**
Adobe Creative Cloud offers various subscription plans and additional purchases. The company wants to:
- Identify top-spending customers for premium support
- Create personalized offers for high-value customers  
- Understand customer purchasing patterns
- Calculate customer lifetime value metrics

**Your Task:**
Write a SQL query that analyzes the customer and order data to find customers who have made the highest total purchases. Your query should:

1. Join the customers and orders tables
2. Only include completed orders (status = 'completed')
3. Calculate the total number of orders per customer
4. Calculate the total amount spent per customer
5. Display results ordered by total spending (highest first)
6. Include customer name, order count, and total spent

**Expected Columns:**
- customer_name: The customer's full name
- order_count: Total number of completed orders
- total_spent: Total amount spent across all orders`,
          difficulty: "Easy",
          category_name: "Data Analysis",
          slug: "adobe-creative-cloud-subscription-analytics"
        };

        const mockSchema = {
          id: 1,
          problem_id: 5,
          schema_name: "ecommerce",
          setup_sql: "CREATE TABLE customers (customer_id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(100), registration_date DATE); CREATE TABLE orders (order_id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), total_amount DECIMAL(10,2), status VARCHAR(50), order_date DATE);",
          sample_data: "INSERT INTO customers VALUES (1, 'John Smith', 'john.smith@gmail.com', '2023-01-15'), (2, 'Jane Doe', 'jane.doe@company.com', '2023-02-01'), (3, 'Mike Wilson', 'mike.w@design.co', '2023-01-20'), (4, 'Sarah Johnson', 'sarah@freelancer.com', '2023-03-10'); INSERT INTO orders VALUES (1, 1, 199.99, 'completed', '2024-01-05'), (2, 1, 189.99, 'completed', '2024-02-15'), (3, 2, 149.99, 'completed', '2024-01-12'), (4, 2, 199.50, 'completed', '2024-03-08'), (5, 3, 99.99, 'completed', '2024-01-25'), (6, 3, 79.99, 'pending', '2024-03-20'), (7, 4, 249.99, 'completed', '2024-02-10'), (8, 1, 49.99, 'cancelled', '2024-03-01');",
          solution_sql: "SELECT c.name as customer_name, COUNT(o.order_id) as order_count, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status = 'completed' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC;"
        };

        setProblem(mockProblem);
        setSchema(mockSchema);
        setShowSolution(false);
        setResults(null);
        setError(null);
        setAttemptCount(0);
        setShowHints(false);
        
        console.log('DEBUG: Mock problem loaded successfully');
      }
    }
  }, [selectedDialect]);

  const checkLearningPathContext = useCallback(async (problemId) => {
    try {
      // Check if learning path is specified in URL parameters
      const searchParams = new URLSearchParams(location.search);
      const learningPathId = searchParams.get('learningPath');
      
      if (learningPathId) {
        // User came from a specific learning path, use that context
        const positionResponse = await fetch(learningPathsUrl(`${learningPathId}/position/${problemId}`));
        const positionData = await positionResponse.json();
        
        if (positionResponse.ok) {
          setLearningPathContext({ learning_path_id: learningPathId, learning_path_name: 'Learning Path' });
          setPathPosition(positionData.position);
          return;
        }
      }
      
      // Fallback: check if problem belongs to any learning paths
      const response = await fetch(apiUrl(`problems/${problemId}/learning-paths`));
      const data = await response.json();
      
      if (response.ok && data.learningPaths && data.learningPaths.length > 0) {
        // Set the first learning path as context
        const primaryPath = data.learningPaths[0];
        setLearningPathContext(primaryPath);
        
        // Get position information for this problem in the learning path
        const positionResponse = await fetch(learningPathsUrl(`${primaryPath.learning_path_id}/position/${problemId}`));
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
        const response = await fetch(learningPathsUrl(`${learningPathId}`));
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
        const response = await fetch(sqlUrl('problems'));
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
        const response = await fetch(learningPathsUrl(`${learningPathContext.learning_path_id}/next/${problemId}`));
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

  // Memoize the expensive schema parsing to prevent re-computation on every render
  const parsedSchema = useMemo(() => {
    if (!schema?.setup_sql) return { tables: [], sampleData: {} };
    
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
    const insertMatches = [...schema.setup_sql.matchAll(/INSERT\s+INTO\s+(\w+)(?:\s*\([^)]+\))?\s+VALUES\s+([\s\S]*?);/gi)];
    insertMatches.forEach(match => {
      const tableName = match[1];
      const valuesText = match[2];
      const rowMatches = [...valuesText.matchAll(/\(([\s\S]*?)\)/g)];
      sampleData[tableName] = rowMatches.slice(0, 3).map(rowMatch => {
        return rowMatch[1].split(',').map(val => {
          const trimmed = val.trim();
          if (trimmed === 'NULL') return 'NULL';
          return trimmed.replace(/^'|'$/g, '').replace(/''/g, "'");
        });
      });
    });
    
    return { tables, sampleData };
  }, [schema?.setup_sql]);

  // Memoize the processed problem description to prevent re-processing
  const processedDescription = useMemo(() => {
    if (!problem?.description) return '';
    
    return problem.description
      .replace(/\*\*Expected Output:\*\*.*?(?=\*\*|$)/g, '')
      .replace(/Expected Output:.*?(?=\n\n|\n\*\*|$)/g, '')
      .replace(/\*\*Business Context:\*\*/g, '<h4 class="text-gray-900 dark:text-white font-semibold mt-6 mb-2">Business Context</h4>')
      .replace(/\*\*Scenario:\*\*/g, '<h4 class="text-gray-900 dark:text-white font-semibold mt-6 mb-2">Scenario</h4>')
      .replace(/\*\*Problem:\*\*/g, '<h4 class="text-gray-900 dark:text-white font-semibold mt-6 mb-2">Problem</h4>')
      .replace(/Business Context:/g, '<h4 class="text-gray-900 dark:text-white font-semibold mt-6 mb-2">Business Context</h4>')
      .replace(/Scenario:/g, '<h4 class="text-gray-900 dark:text-white font-semibold mt-6 mb-2">Scenario</h4>')
      .replace(/Problem:/g, '<h4 class="text-gray-900 dark:text-white font-semibold mt-6 mb-2">Problem</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 dark:text-white">$1</strong>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/```sql\n([\s\S]*?)\n```/g, '<pre class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mt-4 mb-4"><code class="text-sm text-gray-900 dark:text-gray-100">$1</code></pre>')
      .replace(/\n/g, '<br>')
      .replace(/<br><br>/g, '<br>');
  }, [problem?.description]);

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
      
      const response = await fetch(apiUrl('execute/sql'), {
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

  // Debug loading state
  if (!problem) {
    console.log('🔍 PROBLEM PAGE: No problem data loaded yet, problemId:', problemId);
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading problem {problemId}...</p>
        </div>
      </div>
    );
  }
  // Problem mode - show the full problem-solving interface
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header - LeetCode Style */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/problems')}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {problem && (
                <div className="flex items-center space-x-3">
                  <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                    {console.log('DEBUG RENDER: problem object:', problem) || ''}
                    {console.log('DEBUG RENDER: numeric_id:', problem.numeric_id, 'title:', problem.title) || ''}
                    {problem.numeric_id || 'No ID'}. {problem.title || 'No Title'}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <BookmarkButton problemId={problem?.id} size="sm" />
              <button
                onClick={navigateToPreviousProblem}
                disabled={currentProblemIndex === 0}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setShowProblemsList(!showProblemsList)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded"
              >
                {currentProblemIndex + 1} / {allProblems?.length || 0}
              </button>
              <button
                onClick={navigateToNextProblem}
                disabled={currentProblemIndex === (allProblems?.length || 0) - 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - LeetCode Split Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex px-4">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'description' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('editorial')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'editorial' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Editorial
              </button>
              <button 
                onClick={() => setActiveTab('solutions')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'solutions' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Solutions
              </button>
            </nav>
          </div>
          
          {/* Problem Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {problem && (
              <div className="space-y-6">
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <>
                    {/* Problem Description */}
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      <div dangerouslySetInnerHTML={{ __html: processedDescription }} />
                    </div>

                    {/* Database Schema with Sample Data */}
                    {parsedSchema.tables.length > 0 && (
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Database Schema</h4>
                        <div className="space-y-4">
                          {parsedSchema.tables.map(table => (
                            <div key={table.name} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{table.name}</span>
                              </div>
                              
                              {/* Column definitions */}
                              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {table.columns.map(col => (
                                  <div key={col.name} className="px-4 py-2 flex justify-between items-center">
                                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{col.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                      {col.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Sample Data */}
                              {parsedSchema.sampleData[table.name] && parsedSchema.sampleData[table.name].length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                  <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Sample Data</h5>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                          {table.columns.map(col => (
                                            <th key={col.name} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                              {col.name}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {parsedSchema.sampleData[table.name].map((row, idx) => (
                                          <tr key={idx} className="bg-white dark:bg-gray-900">
                                            {row.map((cell, cellIdx) => (
                                              <td key={cellIdx} className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
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
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expected Output */}
                    {schema && schema.expected_output && Array.isArray(schema.expected_output) && schema.expected_output.length > 0 && (
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-semibold mb-4">Expected Output</h4>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  {schema.expected_output[0] ? Object.keys(schema.expected_output[0]).map((column) => (
                                    <th key={column} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      {column}
                                    </th>
                                  )) : null}
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {schema.expected_output.slice(0, 5).map((row, idx) => (
                                  <tr key={idx}>
                                    {Object.values(row).map((cell, cellIdx) => (
                                      <td key={cellIdx} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                        {cell !== null ? cell.toString() : 'NULL'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {schema.expected_output.length > 5 && (
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                              Showing 5 of {schema.expected_output.length} rows
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Editorial Tab */}
                {activeTab === 'editorial' && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Editorial Coming Soon</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Detailed explanations and approaches for this problem will be available soon.
                    </p>
                  </div>
                )}

                {/* Solutions Tab */}
                {activeTab === 'solutions' && (
                  <div className="space-y-6">
                    {schema && schema.solution_sql ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-gray-900 dark:text-white font-semibold">Official Solution</h4>
                          <button
                            onClick={async (event) => {
                              try {
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  await navigator.clipboard.writeText(schema.solution_sql);
                                  // Show success feedback
                                  const button = event.target;
                                  const originalText = button.textContent;
                                  button.textContent = 'Copied!';
                                  button.className = 'px-3 py-1.5 bg-green-600 text-white text-sm rounded transition-colors';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.className = 'px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors';
                                  }, 2000);
                                } else {
                                  // Fallback for older browsers
                                  const textArea = document.createElement('textarea');
                                  textArea.value = schema.solution_sql;
                                  textArea.style.position = 'fixed';
                                  textArea.style.opacity = '0';
                                  document.body.appendChild(textArea);
                                  textArea.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(textArea);
                                  
                                  // Show success feedback
                                  const button = event.target;
                                  const originalText = button.textContent;
                                  button.textContent = 'Copied!';
                                  button.className = 'px-3 py-1.5 bg-green-600 text-white text-sm rounded transition-colors';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.className = 'px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors';
                                  }, 2000);
                                }
                              } catch (error) {
                                console.error('Failed to copy solution:', error);
                                // Show error feedback
                                const button = event.target;
                                const originalText = button.textContent;
                                button.textContent = 'Copy Failed!';
                                button.className = 'px-3 py-1.5 bg-red-600 text-white text-sm rounded transition-colors';
                                setTimeout(() => {
                                  button.textContent = originalText;
                                  button.className = 'px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors';
                                }, 2000);
                              }
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            Copy Solution
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <pre className="text-sm text-gray-900 dark:text-gray-100 overflow-x-auto">
                            <code>{schema.solution_sql}</code>
                          </pre>
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Approach</h5>
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            This solution demonstrates the optimal approach to solving this problem. 
                            Study the query structure and try to understand the logic before looking at the code.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔐</div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Solution Locked</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Complete this problem to unlock the official solution.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Code Editor Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SQL</span>
                <select
                  value={selectedDialect}
                  onChange={(e) => setSelectedDialect(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={executeQuery}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Run
                </button>
                <button
                  onClick={executeQuery}
                  disabled={isExecuting || !sqlQuery.trim()}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div className="h-80 border-b border-gray-200 dark:border-gray-700">
              <SQLHighlightEditor
                value={sqlQuery}
                onChange={setSqlQuery}
                onExecute={executeQuery}
                isExecuting={isExecuting}
                height="100%"
              />
            </div>

            {/* Results Panel */}
            <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
              {isExecuting && (
                <div className="flex items-center justify-center py-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Running...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded text-sm">
                  <div className="font-medium text-red-800 dark:text-red-300 mb-1">Error</div>
                  <div className="text-red-700 dark:text-red-400">{error}</div>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  {/* Validation Results */}
                  {results.isCorrect !== null && (
                    <div className={`p-3 rounded border ${
                      results.isCorrect 
                        ? 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span>{results.isCorrect ? '✓' : '✗'}</span>
                        <span className="font-medium">
                          {results.isCorrect ? 'Accepted' : 'Wrong Answer'}
                        </span>
                      </div>
                      {results.feedback && (
                        <div className="text-sm mt-1">{results.feedback}</div>
                      )}
                    </div>
                  )}

                  {/* Query Results */}
                  {results.rows && results.rows.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {results.rows.length} rows • {results.executionTime}
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded max-h-80 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                              <tr>
                                {Object.keys(results.rows[0]).map((column) => (
                                  <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                              {results.rows.map((row, idx) => (
                                <tr key={idx}>
                                  {Object.values(row).map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                      {cell !== null ? cell.toString() : <span className="text-gray-400">NULL</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        {results.rows.length > 10 && (
                          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                            Showing all {results.rows.length} rows • Scroll to see more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {results.rows && results.rows.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Query executed successfully but returned no rows
                    </div>
                  )}
                </div>
              )}

              {!results && !error && !isExecuting && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Run your code to see results here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Problems dropdown */}
      {showProblemsList && (
        <div className="fixed top-16 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
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
                  <span className="font-medium">{prob.numeric_id}.</span>
                  <span className="truncate flex-1">{prob.title}</span>
                  <span className={`px-1 py-0.5 rounded text-xs ${
                    prob.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    prob.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {prob.difficulty?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PracticePage;