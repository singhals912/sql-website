import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookmarkButton from '../components/BookmarkButton';

function ProblemsPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Map category slugs to display names
  const categorySlugToName = {
    'a/b-testing': 'A/B Testing',
    'advanced-topics': 'Advanced Topics',
    'aggregation': 'Aggregation',
    'basic-queries': 'Basic Queries',
    'energy-analytics': 'Energy Analytics',
    'fraud-detection': 'Fraud Detection',
    'joins': 'Joins',
    'recommendation-systems': 'Recommendation Systems',
    'subqueries': 'Subqueries',
    'supply-chain': 'Supply Chain',
    'time-analysis': 'Time Analysis',
    'window-functions': 'Window Functions'
  };
  
  const categoryParam = searchParams.get('category');
  const initialCategory = categoryParam && categorySlugToName[categoryParam] ? categorySlugToName[categoryParam] : 'all';
  
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get('company') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [problems, setProblems] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      
      // Convert category display name back to slug for API call
      if (selectedCategory !== 'all') {
        const categoryNameToSlug = {
          'A/B Testing': 'a/b-testing',
          'Advanced Topics': 'advanced-topics',
          'Aggregation': 'aggregation',
          'Basic Queries': 'basic-queries',
          'Energy Analytics': 'energy-analytics',
          'Fraud Detection': 'fraud-detection',
          'Joins': 'joins',
          'Recommendation Systems': 'recommendation-systems',
          'Subqueries': 'subqueries',
          'Supply Chain': 'supply-chain',
          'Time Analysis': 'time-analysis',
          'Window Functions': 'window-functions'
        };
        const categorySlug = categoryNameToSlug[selectedCategory] || selectedCategory;
        params.append('category', categorySlug);
      }
      
      if (selectedCompany !== 'all') params.append('company', selectedCompany);
      
      const response = await fetch(`http://localhost:5001/api/sql/problems?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        // Sort problems by numeric_id and format for display
        const sortedProblems = data.problems
          .sort((a, b) => (a.numeric_id || 0) - (b.numeric_id || 0))
          .map(p => ({
            ...p,
            category: p.category_name, // Map category_name to category for filtering
            acceptance: `${p.acceptance_rate}%`,
            solved: Math.random() > 0.7 // Random solved status for demo
          }));
        setProblems(sortedProblems);
      } else {
        setError(data.error || 'Failed to fetch problems');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Load companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/sql/companies');
        const data = await response.json();
        if (response.ok) {
          setCompanies([
            { name: 'all', display: 'All Companies', count: 0 },
            ...data
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };
    
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [selectedDifficulty, selectedCategory, selectedCompany]);

  const categories = ["all", "A/B Testing", "Advanced Topics", "Aggregation", "Basic Queries", "Energy Analytics", "Fraud Detection", "Joins", "Recommendation Systems", "Subqueries", "Supply Chain", "Time Analysis", "Window Functions"];
  const difficulties = ["all", "easy", "medium", "hard"];

  const filteredProblems = problems.filter(problem => {
    // Basic filters
    if (selectedDifficulty !== 'all' && problem.difficulty !== selectedDifficulty) return false;
    if (selectedCategory !== 'all' && problem.category !== selectedCategory) return false;
    if (selectedCompany !== 'all' && problem.company !== selectedCompany) return false;
    
    // Status filter
    if (statusFilter === 'solved' && !problem.solved) return false;
    if (statusFilter === 'unsolved' && problem.solved) return false;
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return problem.title.toLowerCase().includes(searchLower) ||
             (problem.category && problem.category.toLowerCase().includes(searchLower)) ||
             (problem.company && problem.company.toLowerCase().includes(searchLower)) ||
             (problem.numeric_id && problem.numeric_id.toString().includes(searchTerm));
    }
    
    return true;
  }).sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'difficulty':
        const diffOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        aVal = diffOrder[a.difficulty] || 0;
        bVal = diffOrder[b.difficulty] || 0;
        break;
      case 'acceptance':
        aVal = parseFloat(a.acceptance) || 0;
        bVal = parseFloat(b.acceptance) || 0;
        break;
      case 'company':
        aVal = a.company || '';
        bVal = b.company || '';
        break;
      default: // 'id'
        aVal = a.numeric_id || a.id;
        bVal = b.numeric_id || b.id;
    }
    
    if (sortOrder === 'desc') {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    } else {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
  });

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50';
      case 'hard': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <div className="text-gray-500 dark:text-gray-400 mt-2">Loading problems...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="text-red-800 dark:text-red-300 font-medium">Error</div>
          <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-slide-up">
            SQL Problems
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 animate-slide-up animation-delay-200">
            Practice with Fortune 100 company scenarios
          </p>
        </div>
        <div className="text-right animate-slide-up animation-delay-300">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {problems.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            problems (#001-#100)
          </div>
        </div>
      </div>

      {/* Advanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 mb-6 animate-slide-up animation-delay-400 border border-gray-200 dark:border-gray-700">
        {/* Search Bar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🔍 Search Problems
          </label>
          <input
            type="text"
            placeholder="Search by title, category, company, or problem number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select 
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company
            </label>
            <select 
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {companies.map(company => (
                <option key={company.name} value={company.name}>
                  {company.display}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Problems</option>
              <option value="solved">✅ Solved</option>
              <option value="unsolved">⭕ Unsolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="id">Problem #</option>
              <option value="title">Title</option>
              <option value="difficulty">Difficulty</option>
              <option value="acceptance">Acceptance Rate</option>
              <option value="company">Company</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order
            </label>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="asc">⬆️ Ascending</option>
              <option value="desc">⬇️ Descending</option>
            </select>
          </div>
        </div>
        
        {/* Quick Filter Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDifficulty('all');
              setSelectedCategory('all');
              setSelectedCompany('all');
              setStatusFilter('all');
              setSortBy('id');
              setSortOrder('asc');
            }}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            🔄 Clear All
          </button>
          <button
            onClick={() => setStatusFilter('unsolved')}
            className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900 transition-colors text-sm"
          >
            🎯 Show Unsolved
          </button>
          <button
            onClick={() => { setSelectedDifficulty('easy'); setSortBy('id'); }}
            className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900 transition-colors text-sm"
          >
            🟢 Easy Problems
          </button>
          <button
            onClick={() => { setSelectedDifficulty('hard'); setSortBy('acceptance'); setSortOrder('asc'); }}
            className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm"
          >
            🔴 Hard Challenges
          </button>
        </div>
        
        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredProblems.length} of {problems.length} problems
          {searchTerm && ` for "${searchTerm}"`}
          {(selectedDifficulty !== 'all' || selectedCategory !== 'all' || selectedCompany !== 'all' || statusFilter !== 'all') && 
            ' with active filters'
          }
        </div>
      </div>

      {/* Problems List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up animation-delay-500 border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredProblems.map((problem, index) => (
            <div key={problem.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-300 transform hover:scale-[1.01] animate-slide-up" style={{animationDelay: `${600 + index * 50}ms`}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {problem.solved ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {problem.numeric_id && (
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        #{problem.numeric_id.toString().padStart(3, '0')}
                      </span>
                    )}
                    <div>
                      <Link 
                        to={`/practice/${problem.numeric_id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {problem.title}
                      </Link>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{problem.category || 'Uncategorized'}</span>
                        {problem.company && (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded">
                            {problem.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Acceptance</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{problem.acceptance}</div>
                  </div>
                  <BookmarkButton problemId={problem.numeric_id} size="md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;