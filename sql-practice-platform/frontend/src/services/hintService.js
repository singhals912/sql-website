import { useAuth } from '../contexts/AuthContext';
import ProgressService from './progressService';

class HintService {
  static baseURL = 'http://localhost:5001/api';

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

  // Get hints for a problem
  static async getHintsForProblem(problemId, token = null) {
    try {
      const response = await fetch(`${this.baseURL}/hints/problem/${problemId}`, {
        headers: this.getHeaders(token)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.hints;
      } else {
        throw new Error(data.error || 'Failed to fetch hints');
      }
    } catch (error) {
      console.error('Error fetching hints:', error);
      return [];
    }
  }

  // Reveal a specific hint
  static async revealHint(problemId, hintId, token = null) {
    try {
      const response = await fetch(`${this.baseURL}/hints/${hintId}/reveal`, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify({ problemId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || 'Failed to reveal hint');
      }
    } catch (error) {
      console.error('Error revealing hint:', error);
      throw error;
    }
  }

  // Get hint usage for user
  static async getHintUsage(problemId, token = null) {
    try {
      const response = await fetch(`${this.baseURL}/hints/usage/${problemId}`, {
        headers: this.getHeaders(token)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.usage;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching hint usage:', error);
      return [];
    }
  }

  // Get available hints for problem (without revealing content)
  static async getAvailableHints(problemId, attemptCount = 0, token = null) {
    try {
      const response = await fetch(`${this.baseURL}/hints/available/${problemId}?attempts=${attemptCount}`, {
        headers: this.getHeaders(token)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.hints;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching available hints:', error);
      return [];
    }
  }
}

export default HintService;