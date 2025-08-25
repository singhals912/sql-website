// Vercel serverless function for problems API
const pool = require('../backend/config/database');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // For now, return mock data to test the connection
    const mockProblems = [
      {
        id: 5,
        numeric_id: 5,
        title: "Adobe Creative Cloud Subscription Analytics",
        description: "Adobe Creative Cloud wants to identify their most valuable customers for targeted marketing campaigns and loyalty programs. Analyze customer subscription and purchase data to find customers who have made the highest total purchases.",
        difficulty: "Easy",
        category_name: "Data Analysis",
        slug: "adobe-creative-cloud-subscription-analytics"
      }
    ];

    res.json({
      problems: mockProblems,
      total: 1,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};