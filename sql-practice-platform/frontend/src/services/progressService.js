class ProgressService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api/progress';
    this.sessionId = this.getSessionId();
    this.cache = new Map();
    this.cacheTimeout = 2000; // 2 seconds
  }

  // Get or create session ID
  getSessionId() {
    let sessionId = localStorage.getItem('sql_practice_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sql_practice_session_id', sessionId);
    }
    return sessionId;
  }

  // Initialize session with backend
  async initializeSession() {
    try {
      const response = await fetch(`${this.baseURL}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          ipAddress: null, // Browser can't access this
          userAgent: navigator.userAgent
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update session ID if backend created a new one
        this.sessionId = data.sessionId;
        localStorage.setItem('sql_practice_session_id', this.sessionId);
        return data;
      }
      throw new Error(data.error || 'Failed to initialize session');
    } catch (error) {
      console.error('Failed to initialize session:', error);
      throw error;
    }
  }

  // Check cache before making API call
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache data
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Clear cache when progress updates
  clearCache() {
    this.cache.clear();
    console.log('DEBUG: Progress cache cleared');
  }

  // Get comprehensive progress overview
  async getProgressOverview() {
    const cacheKey = 'overview';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseURL}/overview`, {
        headers: {
          'X-Session-ID': this.sessionId
        }
      });
      
      const data = await response.json();
      if (data.success) {
        this.setCachedData(cacheKey, data.progress);
        return data.progress;
      }
      throw new Error(data.error || 'Failed to get progress overview');
    } catch (error) {
      console.error('Failed to get progress overview:', error);
      throw error;
    }
  }

  // Get detailed problem-by-problem progress
  async getDetailedProgress() {
    const cacheKey = 'detailed';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.baseURL}/detailed`, {
        headers: {
          'X-Session-ID': this.sessionId
        }
      });
      
      const data = await response.json();
      if (data.success) {
        this.setCachedData(cacheKey, data.problems);
        return data.problems;
      }
      throw new Error(data.error || 'Failed to get detailed progress');
    } catch (error) {
      console.error('Failed to get detailed progress:', error);
      throw error;
    }
  }

  // Get user statistics
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        headers: {
          'X-Session-ID': this.sessionId
        }
      });
      
      const data = await response.json();
      if (data.success) {
        return data.stats;
      }
      throw new Error(data.error || 'Failed to get stats');
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/leaderboard?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return data.leaderboard;
      }
      throw new Error(data.error || 'Failed to get leaderboard');
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  // Send heartbeat to keep session active
  async sendHeartbeat() {
    try {
      await fetch(`${this.baseURL}/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        }
      });
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }

  // Record manual attempt (if needed)
  async recordAttempt(problemId, problemNumericId, query, isCorrect, executionTimeMs, errorMessage = null, hintUsed = false, solutionViewed = false) {
    try {
      const response = await fetch(`${this.baseURL}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          problemId,
          problemNumericId,
          query,
          isCorrect,
          executionTimeMs,
          errorMessage,
          hintUsed,
          solutionViewed
        })
      });
      
      const data = await response.json();
      if (data.success) {
        return data.attempt;
      }
      throw new Error(data.error || 'Failed to record attempt');
    } catch (error) {
      console.error('Failed to record attempt:', error);
      throw error;
    }
  }
}

export default new ProgressService();