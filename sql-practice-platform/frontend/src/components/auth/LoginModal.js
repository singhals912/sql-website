import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProgressService from '../../services/progressService';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const { login, forgotPassword } = useAuth();

  // Manage body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password, ProgressService.sessionId);
      
      if (result.success) {
        onClose();
        setEmail('');
        setPassword('');
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(forgotEmail);
      if (result.success) {
        setForgotMessage('Password reset link sent to your email!');
        setForgotEmail('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bg-black bg-opacity-50" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        className="bg-white rounded-lg p-8" 
        style={{
          position: 'relative',
          zIndex: 10000,
          width: '100%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflowY: 'auto',
          margin: 'auto'
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {showForgotPassword ? 'Reset Password' : 'Login'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!showForgotPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot your password?
              </button>
              
              <div className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </div>
            
            <div>
              <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {forgotMessage && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                {forgotMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setForgotMessage('');
                setForgotEmail('');
              }}
              className="w-full text-gray-600 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            🔒 Your session progress will be automatically saved when you log in
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;