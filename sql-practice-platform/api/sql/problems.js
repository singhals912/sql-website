// Vercel serverless function for SQL problems API
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Return mock problems data that matches what the frontend expects
    const mockProblems = [
      {
        id: 5,
        numeric_id: 5,
        title: "Adobe Creative Cloud Subscription Analytics",
        description: "Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns and loyalty programs. Analyze customer subscription and purchase data to find customers who have made the highest total purchases.",
        difficulty: "Easy",
        category_name: "Data Analysis",
        category_slug: "data-analysis",
        slug: "adobe-creative-cloud-subscription-analytics",
        is_active: true,
        acceptance_rate: "75.0",
        total_submissions: 150,
        total_accepted: 112,
        tags: ["Adobe", "Analytics", "Business Intelligence"],
        created_at: "2024-08-25T00:00:00Z"
      },
      {
        id: 1,
        numeric_id: 1,
        title: "Employee Salary Analysis",
        description: "Find employees with salary greater than average salary in the company.",
        difficulty: "Easy",
        category_name: "Basic Queries",
        category_slug: "basic-queries",
        slug: "employee-salary-analysis",
        is_active: true,
        acceptance_rate: "85.0",
        total_submissions: 200,
        total_accepted: 170,
        tags: ["SQL Basics", "Aggregation"],
        created_at: "2024-08-24T00:00:00Z"
      }
    ];

    res.json({
      problems: mockProblems,
      total: mockProblems.length,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};