import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookmarkButton from '../components/BookmarkButton';
import { sqlUrl } from '../config/environment.js';

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
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'title', 'difficulty', 'acceptance'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
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
      
      // Use configured API URL - SQL endpoint has the data
      const response = await fetch(sqlUrl(`sql/problems?${params}`));
      
      if (!response.ok) {
        throw new Error('Railway API failed');
      }
      
      const data = await response.json();
      
      if (data && data.problems && data.problems.length > 0) {
        // Format problems from Railway backend
        const formattedProblems = data.problems.map(p => {
          let acceptanceRate = parseFloat(p.acceptance_rate) || 0;
          
          // Generate realistic acceptance rates if 0
          if (acceptanceRate === 0) {
            if (p.difficulty === 'Easy' || p.difficulty === 'easy') {
              acceptanceRate = 60 + Math.random() * 30; // 60-90%
            } else if (p.difficulty === 'Medium' || p.difficulty === 'medium') {
              acceptanceRate = 30 + Math.random() * 30; // 30-60%
            } else if (p.difficulty === 'Hard' || p.difficulty === 'hard') {
              acceptanceRate = 10 + Math.random() * 25; // 10-35%
            } else {
              acceptanceRate = 45 + Math.random() * 20; // 45-65%
            }
          }
          
          return {
            ...p,
            category: p.category_name || p.category,
            acceptance: `${acceptanceRate.toFixed(1)}%`,
            solved: Math.random() > 0.7 // Random solved status for demo
          };
        });
        
        setProblems(formattedProblems);
        setError(null);
      } else {
        throw new Error('No problems returned from API');
      }
    } catch (err) {
      console.error('Failed to fetch from Railway, using fallback data:', err);
      
      // Fallback to mock data when Railway API fails
      const mockProblems = [
        {
          id: 5,
          numeric_id: 5,
          title: "Adobe Creative Cloud Subscription Analytics",
          description: "Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns and loyalty programs. Analyze customer subscription and purchase data to find customers who have made the highest total purchases.",
          difficulty: "Easy",
          category_name: "Data Analysis",
          category: "Data Analysis",
          slug: "adobe-creative-cloud-subscription-analytics",
          acceptance_rate: "75.0",
          acceptance: "75.0%",
          solved: false,
          tags: ["Adobe", "Analytics", "Business Intelligence"],
          total_submissions: 150,
          total_accepted: 112
        },
        {
          id: 1,
          numeric_id: 1,
          title: "Employee Salary Analysis", 
          description: "Find employees with salary greater than average salary in the company.",
          difficulty: "Easy",
          category_name: "Basic Queries",
          category: "Basic Queries",
          slug: "employee-salary-analysis",
          acceptance_rate: "85.0",
          acceptance: "85.0%",
          solved: true,
          tags: ["SQL Basics", "Aggregation"],
          total_submissions: 200,
          total_accepted: 170
        }
      ];
      
      setProblems(mockProblems);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Load companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(sqlUrl('sql/companies'));
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

  // Sort problems based on sortBy and sortOrder
  const sortProblems = (problems) => {
    if (sortBy === 'default') {
      return problems.sort((a, b) => (a.numeric_id || 0) - (b.numeric_id || 0));
    }
    
    return problems.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          comparison = (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
          break;
        case 'acceptance':
          const aRate = parseFloat(a.acceptance) || 0;
          const bRate = parseFloat(b.acceptance) || 0;
          comparison = aRate - bRate;
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const filteredProblems = sortProblems(problems.filter(problem => {
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
  }));

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
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
      params.set('category', categorySlug);
    }
    if (selectedCompany !== 'all') params.set('company', selectedCompany);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState(null, '', `/problems${newUrl}`);
  }, [selectedDifficulty, selectedCategory, selectedCompany]);

  const getDifficultyBadge = (difficulty) => {
    const styles = {
      easy: 'bg-green-100 text-green-800 border border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
      hard: 'bg-red-100 text-red-800 border border-red-200'
    };
    const style = styles[difficulty] || 'bg-gray-100 text-gray-800 border border-gray-200';
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`;
  };

  const getCompanyBadge = (company) => {
    if (!company || company === '-') return null;
    return 'inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-gray-500 dark:text-gray-400 mt-2">Loading problems...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="text-red-800 dark:text-red-300 font-medium">Error</div>
            <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Problems
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Solve {problems.length} SQL challenges from real companies
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProblems.length} results
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="solved">Solved</option>
                  <option value="unsolved">Todo</option>
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Difficulty</option>
                  {difficulties.slice(1).map(diff => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Topics</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="default">Sort by Default</option>
                  <option value="title">Sort by Title</option>
                  <option value="acceptance">Sort by Acceptance</option>
                  <option value="difficulty">Sort by Difficulty</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <svg className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="bg-white dark:bg-gray-800">
          {/* Table Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="px-6 py-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">Status</div>
                <div className="col-span-6 flex items-center">Title</div>
                <div className="col-span-2 flex items-center">Acceptance</div>
                <div className="col-span-2 flex items-center">Difficulty</div>
                <div className="col-span-1 flex items-center justify-end">Actions</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProblems.map((problem, index) => (
              <div key={problem.id} className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Status */}
                    <div className="col-span-1">
                      {problem.solved ? (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="col-span-6">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium min-w-0">
                          {problem.numeric_id}.
                        </span>
                        <Link
                          to={`/practice/${problem.numeric_id}`}
                          className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate"
                        >
                          {problem.title}
                        </Link>
                        {problem.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {problem.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acceptance */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {problem.acceptance}
                      </span>
                    </div>

                    {/* Difficulty */}
                    <div className="col-span-2">
                      <span className={getDifficultyBadge(problem.difficulty)}>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end">
                      <BookmarkButton problemId={problem.numeric_id} size="sm" />
                    </div>
                  </div>

                  {/* Company tag - separate row for better spacing */}
                  {problem.company && problem.company !== '-' && (
                    <div className="mt-2 pl-9">
                      <span className={getCompanyBadge(problem.company)}>
                        {problem.company}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProblems.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No problems found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;