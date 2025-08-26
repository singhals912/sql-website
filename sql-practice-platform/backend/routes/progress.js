const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Helper function to get or create session
async function getOrCreateSession(sessionId, ip, userAgent) {
  if (!sessionId) {
    sessionId = uuidv4();
  }
  
  try {
    // Check if session exists
    const existingSession = await pool.query(
      'SELECT session_id FROM user_sessions WHERE session_id = $1',
      [sessionId]
    );
    
    if (existingSession.rows.length === 0) {
      // Create new session
      await pool.query(
        'INSERT INTO user_sessions (session_id, ip_address, user_agent) VALUES ($1, $2, $3)',
        [sessionId, ip, userAgent]
      );
    } else {
      // Update last activity
      await pool.query(
        'UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = $1',
        [sessionId]
      );
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error managing session:', error);
    return sessionId;
  }
}

// Create or validate session
router.post('/session', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || uuidv4();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const finalSessionId = await getOrCreateSession(sessionId, ip, userAgent);
    
    res.json({ success: true, sessionId: finalSessionId });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get progress overview
router.get('/overview', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.json({
        success: true,
        progress: {
          overview: {
            completed: 0,
            attempted: 0,
            total: 70,
            completionRate: 0,
            avgExecutionTime: 0,
            avgAttemptsPerProblem: 0
          },
          byDifficulty: [
            { difficulty: 'easy', total: 0, completed: 0, percentage: 0 },
            { difficulty: 'medium', total: 0, completed: 0, percentage: 0 },
            { difficulty: 'hard', total: 0, completed: 0, percentage: 0 }
          ],
          byCategory: [],
          recentActivity: [],
          achievements: []
        }
      });
    }
    
    // Get total problems count
    const totalResult = await pool.query(
      'SELECT COUNT(*) as total FROM problems WHERE is_active = true'
    );
    const totalProblems = parseInt(totalResult.rows[0].total);
    
    // Get solved problems count
    const solvedResult = await pool.query(
      "SELECT COUNT(*) as solved FROM user_problem_progress WHERE session_id = $1 AND status = 'completed'",
      [sessionId]
    );
    const solvedProblems = parseInt(solvedResult.rows[0].solved);
    
    // Get accuracy rate
    const accuracyResult = await pool.query(
      'SELECT AVG(CASE WHEN correct_attempts > 0 THEN correct_attempts::float / total_attempts ELSE 0 END) as accuracy FROM user_problem_progress WHERE session_id = $1 AND total_attempts > 0',
      [sessionId]
    );
    const accuracyRate = Math.round((parseFloat(accuracyResult.rows[0].accuracy) || 0) * 100);
    
    // Get average execution time
    const timeResult = await pool.query(
      'SELECT AVG(best_execution_time_ms) as avg_time FROM user_problem_progress WHERE session_id = $1 AND best_execution_time_ms IS NOT NULL',
      [sessionId]
    );
    const averageTime = Math.round(parseFloat(timeResult.rows[0].avg_time) || 0);
    
    // Get detailed progress data for the full response
    const difficultyResult = await pool.query(`
      SELECT p.difficulty, 
             COUNT(*) as total,
             COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) as completed
      FROM problems p
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true
      GROUP BY p.difficulty
    `, [sessionId]);
    
    const categoryResult = await pool.query(`
      SELECT c.name, 
             COUNT(*) as total,
             COUNT(CASE WHEN upp.status = 'completed' THEN 1 END) as completed
      FROM problems p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_progress upp ON p.id = upp.problem_id AND upp.session_id = $1
      WHERE p.is_active = true
      GROUP BY c.name
    `, [sessionId]);
    
    const recentResult = await pool.query(`
      SELECT p.title, p.numeric_id, upp.status, upp.last_attempt_at, upp.total_attempts
      FROM user_problem_progress upp
      JOIN problems p ON upp.problem_id = p.id
      WHERE upp.session_id = $1
      ORDER BY upp.last_attempt_at DESC
      LIMIT 10
    `, [sessionId]);
    
    // Format difficulty data
    const byDifficulty = difficultyResult.rows.map(row => ({
      difficulty: row.difficulty,
      total: parseInt(row.total),
      completed: parseInt(row.completed),
      percentage: row.total > 0 ? Math.round((parseInt(row.completed) / parseInt(row.total)) * 100) : 0
    }));
    
    // Format category data
    const byCategory = categoryResult.rows.map(row => ({
      category: row.name,
      total: parseInt(row.total),
      completed: parseInt(row.completed),
      percentage: row.total > 0 ? Math.round((parseInt(row.completed) / parseInt(row.total)) * 100) : 0
    }));
    
    // Format recent activity
    const recentActivity = recentResult.rows.map(row => ({
      problemTitle: row.title,
      problemId: row.numeric_id,
      status: row.status,
      timestamp: row.last_attempt_at,
      attempts: row.total_attempts
    }));
    
    res.json({
      success: true,
      progress: {
        overview: {
          completed: solvedProblems,
          attempted: solvedProblems, // For now, same as completed
          total: totalProblems,
          completionRate: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
          avgExecutionTime: averageTime,
          avgAttemptsPerProblem: accuracyRate / 100 // Convert back to decimal
        },
        byDifficulty,
        byCategory,
        recentActivity,
        achievements: [] // TODO: Implement achievements
      }
    });
  } catch (error) {
    console.error('Error fetching progress overview:', error);
    res.status(500).json({ error: 'Failed to fetch progress overview' });
  }
});

// Get detailed progress
router.get('/detailed', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.json({
        success: true,
        problems: []
      });
    }
    
    // Get all progress records with problem details for the new ProgressPage format
    const progressResult = await pool.query(`
      SELECT 
        p.numeric_id as problem_numeric_id,
        p.title,
        p.difficulty,
        p.id as problem_id,
        upp.status,
        upp.total_attempts,
        upp.correct_attempts,
        upp.best_execution_time_ms,
        upp.last_attempt_at,
        upp.first_attempt_at
      FROM user_problem_progress upp
      JOIN problems p ON upp.problem_id = p.id
      WHERE upp.session_id = $1
      ORDER BY upp.last_attempt_at DESC NULLS LAST
    `, [sessionId]);
    
    res.json({
      success: true,
      problems: progressResult.rows
    });
  } catch (error) {
    console.error('Error fetching detailed progress:', error);
    res.status(500).json({ error: 'Failed to fetch detailed progress' });
  }
});

// Get progress stats
router.get('/stats', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.json({
        success: true,
        stats: {
          problemsSolved: 0,
          totalAttempts: 0,
          successRate: 0,
          averageExecutionTime: 0
        }
      });
    }
    
    const statsResult = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as problems_solved,
        SUM(total_attempts) as total_attempts,
        AVG(CASE WHEN correct_attempts > 0 THEN correct_attempts::float / total_attempts ELSE 0 END) as success_rate,
        AVG(best_execution_time_ms) as avg_execution_time
      FROM user_problem_progress 
      WHERE session_id = $1
    `, [sessionId]);
    
    const stats = statsResult.rows[0];
    
    res.json({
      success: true,
      stats: {
        problemsSolved: parseInt(stats.problems_solved) || 0,
        totalAttempts: parseInt(stats.total_attempts) || 0,
        successRate: Math.round((parseFloat(stats.success_rate) || 0) * 100),
        averageExecutionTime: Math.round(parseFloat(stats.avg_execution_time) || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({ error: 'Failed to fetch progress stats' });
  }
});

// Get leaderboard (mock for now)
router.get('/leaderboard', (req, res) => {
  res.json([]);
});

// Debug endpoint to check table structure
router.get('/debug/schema', async (req, res) => {
  try {
    // Check if table exists and get its structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_problem_progress'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    // Also get a sample record
    const sampleData = await pool.query(`
      SELECT * FROM user_problem_progress LIMIT 1
    `);
    
    res.json({
      tableExists: tableInfo.rows.length > 0,
      columns: tableInfo.rows,
      sampleRecord: sampleData.rows[0] || null,
      recordCount: sampleData.rowCount
    });
  } catch (error) {
    res.json({
      error: error.message,
      tableExists: false
    });
  }
});

// Update session activity
router.post('/heartbeat', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId) {
      await pool.query(
        'UPDATE user_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = $1',
        [sessionId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    res.json({ success: true }); // Don't fail heartbeat
  }
});

// Track problem attempt/completion
router.post('/track', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    const { problemId, problemNumericId, success, executionTime } = req.body;
    
    if (!sessionId || !problemId) {
      return res.status(400).json({ error: 'Session ID and problem ID required' });
    }
    
    // Get or create progress record with auto table creation
    let existingProgress;
    try {
      existingProgress = await pool.query(
        'SELECT * FROM user_problem_progress WHERE session_id = $1 AND problem_id = $2',
        [sessionId, problemId]
      );
    } catch (dbError) {
      console.log('⚠️ user_problem_progress table not found, creating...');
      
      // Create the progress table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_problem_progress (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          problem_id INTEGER NOT NULL,
          problem_numeric_id INTEGER,
          status VARCHAR(50) DEFAULT 'attempted',
          total_attempts INTEGER DEFAULT 0,
          correct_attempts INTEGER DEFAULT 0,
          best_execution_time_ms INTEGER,
          first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          UNIQUE(session_id, problem_id)
        )
      `);
      
      console.log('✅ user_problem_progress table created');
      
      // Retry the query
      existingProgress = await pool.query(
        'SELECT * FROM user_problem_progress WHERE session_id = $1 AND problem_id = $2',
        [sessionId, problemId]
      );
    }
    
    if (existingProgress.rows.length === 0) {
      // Create new progress record
      await pool.query(`
        INSERT INTO user_problem_progress 
        (session_id, problem_id, problem_numeric_id, status, total_attempts, correct_attempts, best_execution_time_ms, first_attempt_at)
        VALUES ($1, $2, $3, $4, 1, $5, $6, CURRENT_TIMESTAMP)
      `, [sessionId, problemId, problemNumericId, success ? 'completed' : 'attempted', success ? 1 : 0, success ? executionTime : null]);
    } else {
      // Update existing progress
      const current = existingProgress.rows[0];
      const newCorrectAttempts = current.correct_attempts + (success ? 1 : 0);
      const newTotalAttempts = current.total_attempts + 1;
      const newStatus = success ? 'completed' : (newCorrectAttempts > 0 ? 'completed' : 'attempted');
      const newBestTime = success && executionTime ? 
        (current.best_execution_time_ms ? Math.min(current.best_execution_time_ms, executionTime) : executionTime) :
        current.best_execution_time_ms;
      
      await pool.query(`
        UPDATE user_problem_progress 
        SET total_attempts = $1, correct_attempts = $2, status = $3, 
            best_execution_time_ms = $4, last_attempt_at = CURRENT_TIMESTAMP,
            completed_at = CASE WHEN $5 AND completed_at IS NULL THEN CURRENT_TIMESTAMP ELSE completed_at END
        WHERE session_id = $6 AND problem_id = $7
      `, [newTotalAttempts, newCorrectAttempts, newStatus, newBestTime, success, sessionId, problemId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking progress:', error);
    res.status(500).json({ error: 'Failed to track progress' });
  }
});

module.exports = router;