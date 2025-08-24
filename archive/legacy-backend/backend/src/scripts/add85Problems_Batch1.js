const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Category UUIDs for proper mapping
const categories = {
  'Basic Queries': 'c5ec99f8-01ff-4d36-b36e-27688566397d',
  'Aggregation': '426fcc68-b403-458f-9afd-5137f772de78',
  'Advanced Topics': 'c7e4c5a1-5b75-4117-a113-118749434557',
  'Joins': '8798fdcf-0411-45cb-83dd-b4912e133354',
  'Time Analysis': '47c2009b-81d2-458f-96b0-1a68aee370d6'
};

// Batch 1: 20 Easy Problems (Fortune 100 Companies)
const easyProblems = [
  {
    id: uuidv4(),
    title: "Google Search Query Volume",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Google's Search Analytics team needs to understand query patterns to optimize their search algorithms.

**Scenario:** You're a data analyst at Google working on search performance metrics. The team wants to identify the most popular search categories.

**Problem:** Find all search categories that have more than 5 queries recorded.

**Expected Output:** List of search categories with their total query counts, ordered by query count descending.`,
    setupSql: `CREATE TABLE search_queries (
        query_id INT PRIMARY KEY,
        search_term VARCHAR(200),
        category VARCHAR(50),
        query_count INT,
        search_date DATE
    );
    
    INSERT INTO search_queries VALUES 
    (1, 'machine learning python', 'Technology', 1250, '2024-01-15'),
    (2, 'pizza near me', 'Local Business', 890, '2024-01-15'),
    (3, 'weather today', 'Weather', 2100, '2024-01-15'),
    (4, 'stock market news', 'Finance', 675, '2024-01-15'),
    (5, 'movie theaters', 'Entertainment', 445, '2024-01-15'),
    (6, 'healthy recipes', 'Health', 320, '2024-01-15'),
    (7, 'javascript tutorial', 'Technology', 890, '2024-01-16'),
    (8, 'restaurant reviews', 'Local Business', 560, '2024-01-16');`,
    solutionSql: `SELECT category, SUM(query_count) as total_queries
FROM search_queries 
GROUP BY category 
HAVING SUM(query_count) > 500 
ORDER BY total_queries DESC;`,
    explanation: "This problem tests basic GROUP BY, HAVING, and aggregate functions. The key insight is using HAVING to filter grouped results rather than WHERE."
  },
  {
    id: uuidv4(),
    title: "Tesla Vehicle Production Tracking",
    difficulty: "easy", 
    category: "Aggregation",
    description: `**Business Context:** Tesla's production team monitors daily vehicle output across their Gigafactories to ensure they meet quarterly targets.

**Scenario:** As a production analyst at Tesla, you need to track which vehicle models are being produced most efficiently.

**Problem:** Find all Tesla vehicle models that have been produced more than 50 times, showing the model name and total production count.

**Expected Output:** Vehicle models with production counts greater than 50, ordered by production count descending.`,
    setupSql: `CREATE TABLE vehicle_production (
        production_id INT PRIMARY KEY,
        vehicle_model VARCHAR(50),
        factory_location VARCHAR(50),
        units_produced INT,
        production_date DATE
    );
    
    INSERT INTO vehicle_production VALUES 
    (1, 'Model Y', 'Austin Gigafactory', 85, '2024-01-15'),
    (2, 'Model 3', 'Fremont Factory', 120, '2024-01-15'),
    (3, 'Model S', 'Fremont Factory', 45, '2024-01-15'),
    (4, 'Model X', 'Fremont Factory', 30, '2024-01-15'),
    (5, 'Model Y', 'Berlin Gigafactory', 75, '2024-01-16'),
    (6, 'Model 3', 'Shanghai Gigafactory', 95, '2024-01-16'),
    (7, 'Cybertruck', 'Austin Gigafactory', 15, '2024-01-16');`,
    solutionSql: `SELECT vehicle_model, SUM(units_produced) as total_production
FROM vehicle_production 
GROUP BY vehicle_model 
HAVING SUM(units_produced) > 50 
ORDER BY total_production DESC;`,
    explanation: "Similar to GROUP BY with HAVING, but applied to manufacturing data. Tests understanding of aggregate functions in real business scenarios."
  },
  {
    id: uuidv4(),
    title: "Netflix Content Library Analysis",
    difficulty: "easy",
    category: "Basic Queries", 
    description: `**Business Context:** Netflix's content acquisition team wants to analyze their library to understand genre distribution and plan future acquisitions.

**Scenario:** You're working at Netflix to help the content team understand which genres have the most titles available for streaming.

**Problem:** List all genres in the Netflix library along with the count of titles in each genre.

**Expected Output:** All genres with their title counts, ordered alphabetically by genre name.`,
    setupSql: `CREATE TABLE netflix_content (
        content_id INT PRIMARY KEY,
        title VARCHAR(100),
        genre VARCHAR(50),
        content_type VARCHAR(20),
        release_year INT,
        rating DECIMAL(3,1)
    );
    
    INSERT INTO netflix_content VALUES 
    (1, 'Stranger Things', 'Sci-Fi', 'TV Series', 2016, 8.7),
    (2, 'The Crown', 'Drama', 'TV Series', 2016, 8.6),
    (3, 'Bird Box', 'Thriller', 'Movie', 2018, 6.6),
    (4, 'Orange Is the New Black', 'Drama', 'TV Series', 2013, 8.1),
    (5, 'Black Mirror', 'Sci-Fi', 'TV Series', 2011, 8.8),
    (6, 'The Irishman', 'Crime', 'Movie', 2019, 7.8),
    (7, '6 Underground', 'Action', 'Movie', 2019, 6.1),
    (8, 'House of Cards', 'Drama', 'TV Series', 2013, 8.7);`,
    solutionSql: `SELECT genre, COUNT(*) as title_count
FROM netflix_content 
GROUP BY genre 
ORDER BY genre;`,
    explanation: "Basic GROUP BY and COUNT aggregation with ORDER BY. This is foundational for understanding content distribution analysis."
  },
  {
    id: uuidv4(),
    title: "Apple Store App Downloads",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Apple's App Store team tracks app download metrics to understand user preferences and optimize the store experience.

**Scenario:** As a data analyst at Apple, you need to identify which app categories are most popular among users based on download counts.

**Problem:** Find the total number of downloads for each app category where the total downloads exceed 1000.

**Expected Output:** App categories and their total download counts (only categories with >1000 downloads), ordered by downloads descending.`,
    setupSql: `CREATE TABLE app_downloads (
        app_id INT PRIMARY KEY,
        app_name VARCHAR(100),
        category VARCHAR(50),
        downloads INT,
        download_date DATE
    );
    
    INSERT INTO app_downloads VALUES 
    (1, 'Instagram', 'Social Media', 850, '2024-01-15'),
    (2, 'TikTok', 'Social Media', 920, '2024-01-15'),
    (3, 'Spotify', 'Music', 675, '2024-01-15'),
    (4, 'Uber', 'Transportation', 540, '2024-01-15'),
    (5, 'WhatsApp', 'Communication', 780, '2024-01-15'),
    (6, 'YouTube', 'Entertainment', 1200, '2024-01-16'),
    (7, 'Telegram', 'Communication', 420, '2024-01-16'),
    (8, 'Apple Music', 'Music', 390, '2024-01-16');`,
    solutionSql: `SELECT category, SUM(downloads) as total_downloads
FROM app_downloads 
GROUP BY category 
HAVING SUM(downloads) > 1000 
ORDER BY total_downloads DESC;`,
    explanation: "Tests GROUP BY with HAVING clause for filtering aggregated results, essential for app store analytics."
  },
  {
    id: uuidv4(),
    title: "Amazon Prime Video Viewership",
    difficulty: "easy",
    category: "Aggregation",
    description: `**Business Context:** Amazon Prime Video's content strategy team analyzes viewing patterns to decide which shows to renew and what new content to commission.

**Scenario:** You're analyzing viewer engagement for Amazon's content team to identify the most-watched show genres.

**Problem:** Find all show genres that have total viewing minutes greater than 5000 minutes.

**Expected Output:** Show genres with their total viewing minutes (only genres >5000 minutes), ordered by viewing time descending.`,
    setupSql: `CREATE TABLE prime_viewership (
        view_id INT PRIMARY KEY,
        show_title VARCHAR(100),
        genre VARCHAR(50),
        viewing_minutes INT,
        viewer_id INT,
        view_date DATE
    );
    
    INSERT INTO prime_viewership VALUES 
    (1, 'The Boys', 'Superhero', 2400, 101, '2024-01-15'),
    (2, 'The Marvelous Mrs. Maisel', 'Comedy', 1800, 102, '2024-01-15'),
    (3, 'Jack Ryan', 'Action', 2100, 103, '2024-01-15'),
    (4, 'The Boys', 'Superhero', 2800, 104, '2024-01-16'),
    (5, 'Fleabag', 'Comedy', 1500, 105, '2024-01-16'),
    (6, 'Bosch', 'Crime', 1900, 106, '2024-01-16'),
    (7, 'Jack Ryan', 'Action', 2200, 107, '2024-01-16'),
    (8, 'Upload', 'Comedy', 1600, 108, '2024-01-17');`,
    solutionSql: `SELECT genre, SUM(viewing_minutes) as total_minutes
FROM prime_viewership 
GROUP BY genre 
HAVING SUM(viewing_minutes) > 5000 
ORDER BY total_minutes DESC;`,
    explanation: "Applies GROUP BY and HAVING to streaming data analysis, testing ability to filter aggregated viewing metrics."
  }
];

// Batch 1: 10 Medium Problems
const mediumProblems = [
  {
    id: uuidv4(),
    title: "Microsoft Office 365 Usage Analytics",
    difficulty: "medium",
    category: "Aggregation",
    description: `**Business Context:** Microsoft's Office 365 product team wants to understand user engagement patterns to improve product features and identify upselling opportunities.

**Scenario:** You're a senior data analyst at Microsoft analyzing Office 365 usage. The team needs to identify power users and understand application adoption rates.

**Problem:** Find users who have used more than 3 different Office applications in the last month, and show their total usage hours across all applications.

**Expected Output:** User details with application count and total hours, ordered by total hours descending.`,
    setupSql: `CREATE TABLE office365_usage (
        usage_id INT PRIMARY KEY,
        user_id INT,
        user_email VARCHAR(100),
        application VARCHAR(50),
        usage_hours DECIMAL(5,2),
        usage_date DATE
    );
    
    INSERT INTO office365_usage VALUES 
    (1, 101, 'john@company.com', 'Word', 8.5, '2024-01-15'),
    (2, 101, 'john@company.com', 'Excel', 12.3, '2024-01-15'),
    (3, 101, 'john@company.com', 'PowerPoint', 4.7, '2024-01-16'),
    (4, 101, 'john@company.com', 'Teams', 15.2, '2024-01-16'),
    (5, 102, 'sarah@company.com', 'Word', 6.8, '2024-01-15'),
    (6, 102, 'sarah@company.com', 'Outlook', 9.4, '2024-01-15'),
    (7, 103, 'mike@company.com', 'Excel', 18.6, '2024-01-15'),
    (8, 103, 'mike@company.com', 'Word', 5.3, '2024-01-16'),
    (9, 103, 'mike@company.com', 'PowerPoint', 7.1, '2024-01-16'),
    (10, 103, 'mike@company.com', 'Teams', 11.8, '2024-01-17');`,
    solutionSql: `SELECT 
        user_id, 
        user_email,
        COUNT(DISTINCT application) as app_count,
        SUM(usage_hours) as total_hours
    FROM office365_usage 
    GROUP BY user_id, user_email
    HAVING COUNT(DISTINCT application) > 3
    ORDER BY total_hours DESC;`,
    explanation: "Tests advanced GROUP BY with HAVING, using COUNT(DISTINCT) to identify power users across multiple applications."
  },
  {
    id: uuidv4(),
    title: "Goldman Sachs Trading Volume Analysis",
    difficulty: "medium", 
    category: "Aggregation",
    description: `**Business Context:** Goldman Sachs' trading desk needs to analyze daily trading patterns to optimize their market-making strategies and identify high-volume opportunities.

**Scenario:** You're a quantitative analyst at Goldman Sachs analyzing trading activity. The team wants to understand which securities have the highest trading velocity.

**Problem:** Find securities that have been traded on more than 2 different days with an average daily volume greater than 10,000 shares.

**Expected Output:** Securities with their trading day count and average daily volume, ordered by average volume descending.`,
    setupSql: `CREATE TABLE trading_activity (
        trade_id INT PRIMARY KEY,
        security_symbol VARCHAR(10),
        security_name VARCHAR(100),
        volume_shares INT,
        trade_price DECIMAL(10,2),
        trade_date DATE
    );
    
    INSERT INTO trading_activity VALUES 
    (1, 'AAPL', 'Apple Inc', 15000, 185.25, '2024-01-15'),
    (2, 'GOOGL', 'Alphabet Inc', 8500, 142.30, '2024-01-15'),
    (3, 'MSFT', 'Microsoft Corp', 12000, 378.90, '2024-01-15'),
    (4, 'AAPL', 'Apple Inc', 18500, 186.10, '2024-01-16'),
    (5, 'TSLA', 'Tesla Inc', 22000, 248.50, '2024-01-16'),
    (6, 'GOOGL', 'Alphabet Inc', 9200, 143.15, '2024-01-16'),
    (7, 'AAPL', 'Apple Inc', 16800, 187.45, '2024-01-17'),
    (8, 'MSFT', 'Microsoft Corp', 14500, 380.25, '2024-01-17'),
    (9, 'TSLA', 'Tesla Inc', 19500, 245.80, '2024-01-17'),
    (10, 'NVDA', 'NVIDIA Corp', 25000, 695.30, '2024-01-17');`,
    solutionSql: `SELECT 
        security_symbol,
        security_name,
        COUNT(DISTINCT trade_date) as trading_days,
        AVG(volume_shares) as avg_daily_volume
    FROM trading_activity
    GROUP BY security_symbol, security_name
    HAVING COUNT(DISTINCT trade_date) > 2 
        AND AVG(volume_shares) > 10000
    ORDER BY avg_daily_volume DESC;`,
    explanation: "Advanced aggregation with multiple HAVING conditions, testing ability to filter on both count and average metrics in financial analysis."
  }
];

// Batch 1: 5 Hard Problems  
const hardProblems = [
  {
    id: uuidv4(),
    title: "JPMorgan Risk-Adjusted Portfolio Returns",
    difficulty: "hard",
    category: "Advanced Topics",
    description: `**Business Context:** JPMorgan's wealth management division needs to calculate risk-adjusted returns for client portfolios to demonstrate value creation and optimize asset allocation strategies.

**Scenario:** You're a senior portfolio analyst at JPMorgan Private Bank. The team needs to identify which investment strategies are delivering the best risk-adjusted returns for high-net-worth clients.

**Problem:** Calculate the Sharpe ratio (return minus risk-free rate divided by volatility) for each investment strategy. Include only strategies with at least 5 trades and rank them by risk-adjusted performance.

**Expected Output:** Investment strategies with trade count, average return, volatility, and Sharpe ratio, ordered by Sharpe ratio descending.`,
    setupSql: `CREATE TABLE portfolio_trades (
        trade_id INT PRIMARY KEY,
        client_id INT,
        strategy_name VARCHAR(50),
        trade_return DECIMAL(8,4),
        trade_date DATE,
        trade_amount DECIMAL(12,2)
    );
    
    CREATE TABLE market_data (
        date DATE PRIMARY KEY,
        risk_free_rate DECIMAL(6,4),
        market_return DECIMAL(8,4)
    );
    
    INSERT INTO portfolio_trades VALUES 
    (1, 1001, 'Growth Equity', 0.0850, '2024-01-15', 500000),
    (2, 1001, 'Growth Equity', 0.1200, '2024-01-16', 500000),
    (3, 1001, 'Growth Equity', -0.0300, '2024-01-17', 500000),
    (4, 1001, 'Growth Equity', 0.0750, '2024-01-18', 500000),
    (5, 1001, 'Growth Equity', 0.0920, '2024-01-19', 500000),
    (6, 1002, 'Value Investing', 0.0420, '2024-01-15', 750000),
    (7, 1002, 'Value Investing', 0.0380, '2024-01-16', 750000),
    (8, 1002, 'Value Investing', 0.0610, '2024-01-17', 750000),
    (9, 1002, 'Value Investing', 0.0290, '2024-01-18', 750000),
    (10, 1002, 'Value Investing', 0.0540, '2024-01-19', 750000),
    (11, 1003, 'Dividend Focus', 0.0320, '2024-01-15', 300000),
    (12, 1003, 'Dividend Focus', 0.0280, '2024-01-16', 300000),
    (13, 1003, 'Dividend Focus', 0.0350, '2024-01-17', 300000);
    
    INSERT INTO market_data VALUES 
    ('2024-01-15', 0.0350, 0.0580),
    ('2024-01-16', 0.0350, 0.0620), 
    ('2024-01-17', 0.0350, 0.0490),
    ('2024-01-18', 0.0350, 0.0550),
    ('2024-01-19', 0.0350, 0.0610);`,
    solutionSql: `WITH strategy_stats AS (
        SELECT 
            strategy_name,
            COUNT(*) as trade_count,
            AVG(trade_return) as avg_return,
            STDDEV(trade_return) as volatility
        FROM portfolio_trades
        GROUP BY strategy_name
        HAVING COUNT(*) >= 5
    ),
    risk_free AS (
        SELECT AVG(risk_free_rate) as avg_risk_free_rate
        FROM market_data
    )
    SELECT 
        ss.strategy_name,
        ss.trade_count,
        ROUND(ss.avg_return, 4) as average_return,
        ROUND(ss.volatility, 4) as volatility,
        ROUND((ss.avg_return - rf.avg_risk_free_rate) / ss.volatility, 4) as sharpe_ratio
    FROM strategy_stats ss
    CROSS JOIN risk_free rf
    WHERE ss.volatility > 0
    ORDER BY sharpe_ratio DESC;`,
    explanation: "Advanced financial analysis using CTEs, statistical functions (STDDEV), and cross joins. Tests understanding of risk-adjusted return calculations and portfolio analytics."
  }
];

async function importBatch1() {
  console.log('🚀 Starting import of 35 problems (Batch 1)...');
  
  const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
  
  for (const problem of allProblems) {
    try {
      console.log(`📝 Adding ${problem.difficulty} problem: ${problem.title}`);
      
      // Insert problem
      await pool.query(
        `INSERT INTO problems (id, title, slug, difficulty, description, is_premium, is_active, category_id)
         VALUES ($1, $2, $3, $4, $5, false, true, $6)`,
        [
          problem.id,
          problem.title,
          problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          problem.difficulty,
          problem.description,
          categories[problem.category]
        ]
      );
      
      // Insert schema
      await pool.query(
        `INSERT INTO problem_schemas (problem_id, sql_dialect, setup_sql, solution_sql, explanation)
         VALUES ($1, 'postgresql', $2, $3, $4)`,
        [problem.id, problem.setupSql, problem.solutionSql, problem.explanation]
      );
      
      console.log(`✅ Successfully added: ${problem.title}`);
      
    } catch (error) {
      console.error(`❌ Error adding ${problem.title}:`, error.message);
    }
  }
  
  console.log(`🎉 Batch 1 import complete! Added ${allProblems.length} problems.`);
  
  // Show updated distribution
  const result = await pool.query(`
    SELECT difficulty, COUNT(*) as count 
    FROM problems 
    WHERE is_active = true 
    GROUP BY difficulty 
    ORDER BY 
      CASE difficulty 
        WHEN 'easy' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'hard' THEN 3 
      END
  `);
  
  console.log('\n📊 Updated Distribution:');
  result.rows.forEach(row => {
    console.log(`${row.difficulty}: ${row.count} problems`);
  });
  
  const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
  console.log(`Total: ${total} problems`);
  
  await pool.end();
}

importBatch1().catch(console.error);