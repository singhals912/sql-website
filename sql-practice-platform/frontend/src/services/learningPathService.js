import { useAuth } from '../contexts/AuthContext';
import ProgressService from './progressService';
import config, { apiUrl } from '../config/environment.js';

class LearningPathService {
  static baseURL = config.API_BASE_URL;

  // Get headers with authentication
  static getHeaders(token = null) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Session-ID': ProgressService.sessionId,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Get all learning paths
  static async getLearningPaths() {
    try {
      const response = await fetch(`${this.baseURL}/learning-paths`);
      const data = await response.json();
      
      // Handle both direct array response and wrapped response
      if (Array.isArray(data)) {
        return data;
      } else if (data.success && data.learningPaths) {
        return data.learningPaths;
      } else {
        throw new Error(data.error || 'Failed to fetch learning paths');
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      throw error;
    }
  }

  // Get specific learning path with steps
  static async getLearningPath(pathId) {
    try {
      console.log(`🎯 Fetching learning path ${pathId} from:`, `${this.baseURL}/learning-paths/${pathId}`);
      const response = await fetch(`${this.baseURL}/learning-paths/${pathId}`);
      const data = await response.json();
      
      console.log(`🎯 Learning path ${pathId} response:`, {
        hasTitle: !!data.title,
        hasProblems: !!data.problems,
        problemsLength: data.problems ? data.problems.length : 0,
        keys: Object.keys(data)
      });
      
      // Handle direct response format from updated API
      if (data.error) {
        console.error(`❌ Learning path ${pathId} error:`, data.error);
        throw new Error(data.error);
      } else if (data.title && data.problems) {
        console.log(`✅ Learning path ${pathId} loaded successfully with ${data.problems.length} problems`);
        // Convert 'problems' to 'steps' for frontend compatibility
        const result = {
          ...data,
          steps: data.problems.map(problem => ({
            ...problem,
            problem_numeric_id: problem.numeric_id,
            step_order: problem.stepOrder
          }))
        };
        console.log(`✅ Learning path ${pathId} converted steps:`, result.steps.map(s => ({ 
          id: s.problem_numeric_id, 
          title: s.title 
        })));
        return result;
      } else {
        console.error(`❌ Learning path ${pathId} missing required fields:`, { 
          hasTitle: !!data.title, 
          hasProblems: !!data.problems 
        });
        throw new Error('Failed to fetch learning path');
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
      throw error;
    }
  }

  // Start a learning path (for authenticated users)
  static async startLearningPath(pathId, token) {
    try {
      const response = await fetch(`${this.baseURL}/learning-paths/${pathId}/start`, {
        method: 'POST',
        headers: this.getHeaders(token)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.progress;
      } else {
        throw new Error(data.error || 'Failed to start learning path');
      }
    } catch (error) {
      console.error('Error starting learning path:', error);
      throw error;
    }
  }

  // Get user progress for learning paths
  static async getUserProgress(token) {
    try {
      const response = await fetch(`${this.baseURL}/learning-paths/progress`, {
        headers: this.getHeaders(token)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.progress;
      } else {
        throw new Error(data.error || 'Failed to fetch progress');
      }
    } catch (error) {
      console.error('Error fetching learning path progress:', error);
      throw error;
    }
  }

  // Update step completion
  static async updateStepCompletion(pathId, stepId, completed, token) {
    try {
      const response = await fetch(`${this.baseURL}/learning-paths/${pathId}/steps/${stepId}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify({ completed })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.progress;
      } else {
        throw new Error(data.error || 'Failed to update step');
      }
    } catch (error) {
      console.error('Error updating step completion:', error);
      throw error;
    }
  }

  // Get recommended learning paths based on user's progress
  static async getRecommendations(token) {
    try {
      const response = await fetch(`${this.baseURL}/learning-paths/recommendations`, {
        headers: this.getHeaders(token)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.recommendations;
      } else {
        return []; // Return empty array if no recommendations
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  // Get learning path statistics
  static async getStatistics() {
    try {
      const response = await fetch(`${this.baseURL}/learning-paths/statistics`);
      const data = await response.json();
      
      if (data.success) {
        return data.statistics;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching learning path statistics:', error);
      return null;
    }
  }
}

export default LearningPathService;