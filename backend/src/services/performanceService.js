const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class PerformanceService {
  constructor() {
    // In-memory performance metrics cache
    this.metricsCache = {
      queryExecutions: [],
      slowQueries: [],
      userSessions: new Map(),
      systemMetrics: {
        totalQueries: 0,
        avgExecutionTime: 0,
        successRate: 0,
        errorCount: 0
      }
    };
    
    // Performance thresholds
    this.thresholds = {
      slowQuery: 1000, // ms
      verySlowQuery: 5000, // ms
      maxCacheSize: 10000,
      metricsRetentionHours: 24
    };

    // Clean up old metrics every hour
    setInterval(() => this.cleanupOldMetrics(), 60 * 60 * 1000);
  }

  // Record query execution performance
  async recordQueryExecution(metrics) {
    const {
      sessionId,
      userId,
      problemId,
      query,
      dialect,
      executionTime,
      success,
      errorMessage,
      rowCount,
      planningTime,
      actualTime,
      memoryUsage
    } = metrics;

    const timestamp = new Date();
    const executionRecord = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      sessionId,
      userId,
      problemId,
      query: query.substring(0, 500), // Truncate for storage
      dialect,
      executionTime: parseFloat(executionTime),
      planningTime: parseFloat(planningTime) || 0,
      actualTime: parseFloat(actualTime) || 0,
      success,
      errorMessage,
      rowCount: parseInt(rowCount) || 0,
      memoryUsage: parseInt(memoryUsage) || 0,
      queryComplexity: this.calculateQueryComplexity(query)
    };

    // Add to cache
    this.metricsCache.queryExecutions.push(executionRecord);
    
    // Track slow queries
    if (executionTime >= this.thresholds.slowQuery) {
      this.metricsCache.slowQueries.push({
        ...executionRecord,
        severity: executionTime >= this.thresholds.verySlowQuery ? 'critical' : 'warning'
      });
    }

    // Update system metrics
    this.updateSystemMetrics(executionRecord);

    // Update user session metrics
    this.updateUserSessionMetrics(sessionId, executionRecord);

    // Persist to database (async, don't block)
    setImmediate(() => this.persistMetrics(executionRecord));

    // Cleanup cache if too large
    if (this.metricsCache.queryExecutions.length > this.thresholds.maxCacheSize) {
      this.metricsCache.queryExecutions = this.metricsCache.queryExecutions.slice(-this.thresholds.maxCacheSize / 2);
    }

    return executionRecord;
  }

  // Calculate query complexity score
  calculateQueryComplexity(query) {
    let complexity = 1;
    const upperQuery = query.toUpperCase();
    
    // Count joins
    complexity += (upperQuery.match(/\bJOIN\b/g) || []).length * 2;
    
    // Count subqueries
    complexity += (upperQuery.match(/\bSELECT\b/g) || []).length - 1;
    
    // Count aggregations
    complexity += (upperQuery.match(/\b(COUNT|SUM|AVG|MIN|MAX|GROUP BY)\b/g) || []).length;
    
    // Count window functions
    complexity += (upperQuery.match(/\bOVER\s*\(/g) || []).length * 3;
    
    // Count CTEs
    complexity += (upperQuery.match(/\bWITH\b/g) || []).length * 2;

    return Math.min(complexity, 20); // Cap at 20
  }

  // Update system-wide metrics
  updateSystemMetrics(record) {
    const metrics = this.metricsCache.systemMetrics;
    
    metrics.totalQueries++;
    
    // Update average execution time (rolling average)
    metrics.avgExecutionTime = (
      (metrics.avgExecutionTime * (metrics.totalQueries - 1) + record.executionTime) / 
      metrics.totalQueries
    );
    
    // Update success rate
    const successCount = this.metricsCache.queryExecutions.filter(r => r.success).length;
    metrics.successRate = (successCount / this.metricsCache.queryExecutions.length) * 100;
    
    // Update error count
    if (!record.success) {
      metrics.errorCount++;
    }
  }

  // Update user session metrics
  updateUserSessionMetrics(sessionId, record) {
    if (!this.metricsCache.userSessions.has(sessionId)) {
      this.metricsCache.userSessions.set(sessionId, {
        sessionId,
        startTime: new Date(),
        queryCount: 0,
        totalExecutionTime: 0,
        successCount: 0,
        errorCount: 0,
        avgExecutionTime: 0,
        problemsSolved: new Set(),
        lastActivity: new Date()
      });
    }

    const session = this.metricsCache.userSessions.get(sessionId);
    session.queryCount++;
    session.totalExecutionTime += record.executionTime;
    session.lastActivity = new Date();
    
    if (record.success) {
      session.successCount++;
    } else {
      session.errorCount++;
    }
    
    session.avgExecutionTime = session.totalExecutionTime / session.queryCount;
    
    if (record.problemId) {
      session.problemsSolved.add(record.problemId);
    }
  }

  // Get real-time performance metrics
  async getPerformanceMetrics() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Filter recent metrics
    const recentMetrics = this.metricsCache.queryExecutions.filter(
      record => record.timestamp.getTime() > oneHourAgo
    );

    const recentSlowQueries = this.metricsCache.slowQueries.filter(
      record => record.timestamp.getTime() > oneHourAgo
    );

    // Calculate performance percentiles
    const executionTimes = recentMetrics.map(r => r.executionTime).sort((a, b) => a - b);
    const percentiles = {
      p50: this.getPercentile(executionTimes, 50),
      p90: this.getPercentile(executionTimes, 90),
      p95: this.getPercentile(executionTimes, 95),
      p99: this.getPercentile(executionTimes, 99)
    };

    // Get top slow queries
    const topSlowQueries = recentSlowQueries
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // Active user sessions
    const activeSessions = Array.from(this.metricsCache.userSessions.values())
      .filter(session => (now - session.lastActivity.getTime()) < (30 * 60 * 1000)) // Active in last 30 min
      .length;

    return {
      timestamp: new Date(),
      overview: {
        totalQueries: this.metricsCache.systemMetrics.totalQueries,
        avgExecutionTime: Math.round(this.metricsCache.systemMetrics.avgExecutionTime * 100) / 100,
        successRate: Math.round(this.metricsCache.systemMetrics.successRate * 100) / 100,
        errorCount: this.metricsCache.systemMetrics.errorCount,
        activeSessions
      },
      recentActivity: {
        queriesLastHour: recentMetrics.length,
        slowQueriesLastHour: recentSlowQueries.length,
        avgExecutionTimeLastHour: recentMetrics.length > 0 
          ? Math.round((recentMetrics.reduce((sum, r) => sum + r.executionTime, 0) / recentMetrics.length) * 100) / 100
          : 0
      },
      performancePercentiles: percentiles,
      topSlowQueries: topSlowQueries.map(q => ({
        query: q.query,
        executionTime: q.executionTime,
        timestamp: q.timestamp,
        severity: q.severity,
        problemId: q.problemId,
        dialect: q.dialect
      })),
      dialectBreakdown: this.getDialectBreakdown(recentMetrics),
      complexityAnalysis: this.getComplexityAnalysis(recentMetrics)
    };
  }

  // Get user-specific performance metrics
  async getUserPerformanceMetrics(sessionId, userId) {
    const session = this.metricsCache.userSessions.get(sessionId);
    if (!session) {
      return null;
    }

    const userQueries = this.metricsCache.queryExecutions.filter(
      r => r.sessionId === sessionId
    );

    const recentQueries = userQueries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    return {
      sessionId,
      startTime: session.startTime,
      queryCount: session.queryCount,
      avgExecutionTime: Math.round(session.avgExecutionTime * 100) / 100,
      successRate: session.queryCount > 0 ? Math.round((session.successCount / session.queryCount) * 100) : 0,
      problemsSolved: session.problemsSolved.size,
      lastActivity: session.lastActivity,
      recentQueries: recentQueries.map(q => ({
        timestamp: q.timestamp,
        executionTime: q.executionTime,
        success: q.success,
        complexity: q.queryComplexity,
        problemId: q.problemId
      }))
    };
  }

  // Helper methods
  getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  getDialectBreakdown(metrics) {
    const breakdown = {};
    metrics.forEach(metric => {
      if (!breakdown[metric.dialect]) {
        breakdown[metric.dialect] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      breakdown[metric.dialect].count++;
      breakdown[metric.dialect].totalTime += metric.executionTime;
      breakdown[metric.dialect].avgTime = breakdown[metric.dialect].totalTime / breakdown[metric.dialect].count;
    });
    return breakdown;
  }

  getComplexityAnalysis(metrics) {
    const complexities = metrics.map(m => m.queryComplexity);
    const avgComplexity = complexities.reduce((sum, c) => sum + c, 0) / complexities.length || 0;
    
    const complexityBuckets = {
      simple: complexities.filter(c => c <= 3).length,
      moderate: complexities.filter(c => c > 3 && c <= 8).length,
      complex: complexities.filter(c => c > 8).length
    };

    return {
      avgComplexity: Math.round(avgComplexity * 100) / 100,
      distribution: complexityBuckets
    };
  }

  // Persist metrics to database
  async persistMetrics(record) {
    try {
      await pool.query(`
        INSERT INTO performance_metrics 
        (id, timestamp, session_id, user_id, problem_id, query_snippet, dialect, 
         execution_time, planning_time, actual_time, success, error_message, 
         row_count, memory_usage, query_complexity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO NOTHING
      `, [
        record.id, record.timestamp, record.sessionId, record.userId,
        record.problemId, record.query, record.dialect, record.executionTime,
        record.planningTime, record.actualTime, record.success, record.errorMessage,
        record.rowCount, record.memoryUsage, record.queryComplexity
      ]);
    } catch (error) {
      console.error('Error persisting performance metrics:', error);
      // Don't throw - this shouldn't break query execution
    }
  }

  // Clean up old in-memory metrics
  cleanupOldMetrics() {
    const cutoffTime = Date.now() - (this.thresholds.metricsRetentionHours * 60 * 60 * 1000);
    
    this.metricsCache.queryExecutions = this.metricsCache.queryExecutions.filter(
      record => record.timestamp.getTime() > cutoffTime
    );
    
    this.metricsCache.slowQueries = this.metricsCache.slowQueries.filter(
      record => record.timestamp.getTime() > cutoffTime
    );

    // Clean up inactive user sessions
    for (const [sessionId, session] of this.metricsCache.userSessions.entries()) {
      if (session.lastActivity.getTime() < cutoffTime) {
        this.metricsCache.userSessions.delete(sessionId);
      }
    }
  }

  // Database schema initialization
  async initializeSchema() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS performance_metrics (
          id VARCHAR(255) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          session_id VARCHAR(255),
          user_id UUID,
          problem_id UUID,
          query_snippet TEXT,
          dialect VARCHAR(50),
          execution_time FLOAT,
          planning_time FLOAT DEFAULT 0,
          actual_time FLOAT DEFAULT 0,
          success BOOLEAN,
          error_message TEXT,
          row_count INTEGER DEFAULT 0,
          memory_usage INTEGER DEFAULT 0,
          query_complexity INTEGER DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);
        CREATE INDEX IF NOT EXISTS idx_performance_session ON performance_metrics(session_id);
        CREATE INDEX IF NOT EXISTS idx_performance_problem ON performance_metrics(problem_id);
        CREATE INDEX IF NOT EXISTS idx_performance_execution_time ON performance_metrics(execution_time);
      `);
      console.log('✅ Performance metrics schema initialized');
    } catch (error) {
      console.error('Error initializing performance metrics schema:', error);
    }
  }
}

module.exports = new PerformanceService();