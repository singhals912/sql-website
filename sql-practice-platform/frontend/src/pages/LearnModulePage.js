import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../config/environment.js';
import SQLHighlightEditor from '../components/SQLHighlightEditor.js';
import { mockModuleContent } from '../data/mockLearningData.js';
import { formatSQLForDisplay, validateSQLEquivalence, SQL_FORMAT_PRESETS } from '../utils/sqlFormatter.js';

function LearnModulePage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  // Simple SQL highlighting function
  const highlightSQL = (text) => {
    if (!text) return '';
    
    // Define SQL keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
      'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'LIMIT', 'OFFSET', 'DISTINCT',
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE',
      'BETWEEN', 'IS', 'NULL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'CONSTRAINT', 'CHECK', 'DEFAULT', 'UNIQUE', 'AUTO_INCREMENT',
      'DESC', 'ASC', 'CROSS', 'OVER', 'ROUND', 'ABS'
    ];
    
    let highlighted = text;
    
    // First highlight keywords (before HTML escaping)
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
      highlighted = highlighted.replace(regex, `__KEYWORD_START__$1__KEYWORD_END__`);
    });
    
    // Highlight strings  
    highlighted = highlighted.replace(/'([^']*)'/g, '__STRING_START__\'$1\'__STRING_END__');
    highlighted = highlighted.replace(/"([^"]*)"/g, '__STRING_START__"$1"__STRING_END__');
    
    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '__NUMBER_START__$1__NUMBER_END__');
    
    // Highlight comments
    highlighted = highlighted.replace(/--.*$/gm, '__COMMENT_START__$&__COMMENT_END__');
    highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '__COMMENT_START__$&__COMMENT_END__');
    
    // Now escape HTML
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Replace placeholders with actual HTML spans
    highlighted = highlighted
      .replace(/__KEYWORD_START__(.*?)__KEYWORD_END__/g, '<span style="color: #569cd6; font-weight: bold;">$1</span>')
      .replace(/__STRING_START__(.*?)__STRING_END__/g, '<span style="color: #ce9178;">$1</span>')
      .replace(/__NUMBER_START__(.*?)__NUMBER_END__/g, '<span style="color: #b5cea8;">$1</span>')
      .replace(/__COMMENT_START__(.*?)__COMMENT_END__/g, '<span style="color: #6a9955; font-style: italic;">$1</span>');
    
    // Wrap the entire result to ensure default text color
    return `<span style="color: #d4d4d4;">${highlighted}</span>`;
  };
  const [module, setModule] = useState(null);
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [exerciseResult, setExerciseResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory');

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      setLoading(true);
      
      // Try API first, fallback to mock data
      try {
        const response = await fetch(apiUrl(`learning/modules/${moduleId}`));
        const data = await response.json();
        
        if (data.success) {
          setModule(data.module);
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        console.log('API not available, using mock data for demonstration');
        // Use mock data as fallback
        const mockModule = mockModuleContent[moduleId];
        if (mockModule) {
          setModule(mockModule);
        } else {
          console.error('Module not found in mock data:', moduleId);
        }
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateExercise = async () => {
    if (!userQuery.trim()) return;

    try {
      // Try API first, fallback to mock validation
      try {
        const response = await fetch(apiUrl(`learning/modules/${moduleId}/concepts/${currentConcept.id}/validate`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: userQuery,
            exerciseIndex: currentExerciseIndex
          })
        });

        const data = await response.json();
        if (data.success) {
          setExerciseResult(data);
          if (data.isCorrect) {
            setTimeout(() => nextExercise(), 2000);
          }
          return;
        }
      } catch (apiError) {
        console.log('Using mock validation');
      }

      // Mock validation for demonstration
      const currentExercise = currentConcept.practice?.[currentExerciseIndex];
      if (currentExercise) {
        const isCorrect = validateSQLEquivalence(userQuery, currentExercise.expectedQuery);

        setExerciseResult({
          isCorrect: isCorrect,
          feedback: isCorrect 
            ? 'Excellent! Your query is correct.'
            : 'Not quite right. Check the hint and try again.',
          expectedQuery: isCorrect ? null : formatSQLForDisplay(currentExercise.expectedQuery, SQL_FORMAT_PRESETS.validation),
          hint: isCorrect ? null : currentExercise.hint
        });

        if (isCorrect) {
          setTimeout(() => nextExercise(), 2000);
        }
      }
    } catch (error) {
      console.error('Error validating exercise:', error);
    }
  };

  const nextConcept = () => {
    if (currentConceptIndex < module.concepts.length - 1) {
      setCurrentConceptIndex(currentConceptIndex + 1);
      setCurrentExerciseIndex(0);
      setActiveTab('theory');
      setUserQuery('');
      setExerciseResult(null);
      setShowHint(false);
    }
  };

  const previousConcept = () => {
    if (currentConceptIndex > 0) {
      setCurrentConceptIndex(currentConceptIndex - 1);
      setCurrentExerciseIndex(0);
      setActiveTab('theory');
      setUserQuery('');
      setExerciseResult(null);
      setShowHint(false);
    }
  };

  const nextExercise = () => {
    const currentConcept = module.concepts[currentConceptIndex];
    if (currentExerciseIndex < currentConcept.practice.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setUserQuery('');
      setExerciseResult(null);
      setShowHint(false);
    } else {
      // All exercises completed, move to next concept
      if (currentConceptIndex < module.concepts.length - 1) {
        nextConcept();
      } else {
        // Module completed!
        alert('Congratulations! You have completed this module.');
      }
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setUserQuery('');
      setExerciseResult(null);
      setShowHint(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-gray-500 dark:text-gray-400 mt-2">Loading module...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 font-medium">Module not found</div>
            <Link to="/learn" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
              ← Back to Learning
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentConcept = module.concepts[currentConceptIndex];
  const currentExercise = currentConcept.practice?.[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/learn"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Back to Learning
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {module.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentConcept.title} ({currentConceptIndex + 1} of {module.concepts.length})
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-4">
              <div className="w-32 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentConceptIndex + 1) / module.concepts.length) * 100}%`
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(((currentConceptIndex + 1) / module.concepts.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('theory')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'theory'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📚 Theory
                </button>
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'examples'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💡 Examples
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'practice'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  disabled={!currentConcept.practice || currentConcept.practice.length === 0}
                >
                  🏋️ Practice
                </button>
              </nav>
            </div>

            {/* Theory Tab */}
            {activeTab === 'theory' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {currentConcept.title}
                </h2>
                
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {currentConcept.theory.explanation}
                  </p>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Syntax:</h4>
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-200">
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightSQL(formatSQLForDisplay(currentConcept.theory.syntax, SQL_FORMAT_PRESETS.display))
                      }} />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {currentConcept.theory.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
              <div className="space-y-6">
                {currentConcept.examples.map((example, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {example.title}
                    </h3>
                    
                    <div className="bg-gray-900 rounded-lg p-3 mb-4 font-mono text-sm text-gray-200">
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightSQL(formatSQLForDisplay(example.query, SQL_FORMAT_PRESETS.display))
                      }} />
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {example.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Practice Tab */}
            {activeTab === 'practice' && currentExercise && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Practice Exercise {currentExerciseIndex + 1} of {currentConcept.practice.length}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={previousExercise}
                      disabled={currentExerciseIndex === 0}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextExercise}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Skip
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {currentExercise.instruction}
                  </p>

                  {/* Database Schema for Practice Exercise */}
                  {currentExercise.schema && (
                    <div className="mb-4">
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-3">Available Tables</h4>
                      <div className="space-y-4">
                        {Object.entries(currentExercise.schema).map(([tableName, tableInfo]) => (
                          <div key={tableName} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{tableName}</span>
                            </div>
                            
                            {/* Column definitions */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {tableInfo.columns.map(col => (
                                <div key={col.name} className="px-4 py-2 flex justify-between items-center">
                                  <div>
                                    <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{col.name}</span>
                                    {col.description && (
                                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">- {col.description}</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {col.type}
                                  </span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Sample Data */}
                            {tableInfo.sampleData && tableInfo.sampleData.length > 0 && (
                              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                                <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Sample Data</h5>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs">
                                    <thead>
                                      <tr className="bg-gray-50 dark:bg-gray-800">
                                        {tableInfo.columns.map(col => (
                                          <th key={col.name} className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                            {col.name}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {tableInfo.sampleData.slice(0, 3).map((row, idx) => (
                                        <tr key={idx} className="bg-white dark:bg-gray-900">
                                          {tableInfo.columns.map(col => (
                                            <td key={col.name} className="px-3 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                              {row[col.name] !== null && row[col.name] !== undefined ? row[col.name].toString() : 'NULL'}
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
                  
                  {showHint && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        💡 Hint: {currentExercise.hint}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <SQLHighlightEditor
                    value={userQuery}
                    onChange={setUserQuery}
                    onExecute={validateExercise}
                    height="200px"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={validateExercise}
                      disabled={!userQuery.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Check Answer
                    </button>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  </div>
                </div>

                {exerciseResult && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    exerciseResult.isCorrect 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <p className={`font-medium ${
                      exerciseResult.isCorrect 
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      {exerciseResult.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      exerciseResult.isCorrect 
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    }`}>
                      {exerciseResult.feedback}
                    </p>
                    {exerciseResult.expectedQuery && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expected solution:
                        </p>
                        <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-200">
                          <span dangerouslySetInnerHTML={{ 
                            __html: highlightSQL(exerciseResult.expectedQuery)
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Module Progress
              </h3>
              
              <div className="space-y-3">
                {module.concepts.map((concept, index) => (
                  <div
                    key={concept.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      index === currentConceptIndex
                        ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
                        : index < currentConceptIndex
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-700'
                    }`}
                    onClick={() => {
                      setCurrentConceptIndex(index);
                      setCurrentExerciseIndex(0);
                      setActiveTab('theory');
                      setUserQuery('');
                      setExerciseResult(null);
                      setShowHint(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        index === currentConceptIndex
                          ? 'bg-blue-600 text-white'
                          : index < currentConceptIndex
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index < currentConceptIndex ? '✓' : index + 1}
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${
                          index === currentConceptIndex
                            ? 'text-blue-900 dark:text-blue-200'
                            : index < currentConceptIndex
                            ? 'text-green-900 dark:text-green-200'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {concept.title}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={previousConcept}
                    disabled={currentConceptIndex === 0}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextConcept}
                    disabled={currentConceptIndex === module.concepts.length - 1}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnModulePage;