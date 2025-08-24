const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const authMiddleware = require('../middleware/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid email address' 
      });
    }

    const result = await AuthService.register(email, password, username, fullName);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: result.user
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('already exists') || error.message.includes('already taken')) {
      return res.status(409).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, sessionId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const result = await AuthService.login(email, password);

    // Migrate session data if sessionId provided
    if (sessionId) {
      try {
        await AuthService.migrateSessionData(result.user.id, sessionId);
      } catch (migrationError) {
        console.error('Session migration error:', migrationError);
        // Don't fail login if migration fails
      }
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: result.user,
      token: result.token
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('deactivated')) {
      return res.status(401).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification token is required' 
      });
    }

    const user = await AuthService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Email verification failed' 
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    const result = await AuthService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send password reset email' 
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Token and new password are required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 8 characters long' 
      });
    }

    const result = await AuthService.resetPassword(token, password);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Password reset failed' 
    });
  }
});

// Change password (authenticated)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current and new password are required' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        error: 'New password must be at least 8 characters long' 
      });
    }

    const result = await AuthService.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.message.includes('incorrect')) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to change password' 
    });
  }
});

// Get profile (authenticated)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await AuthService.getProfile(userId);

    res.json({
      success: true,
      user: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get profile' 
    });
  }
});

// Update profile (authenticated)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.email;
    delete updates.password;
    delete updates.password_hash;
    delete updates.verification_token;
    delete updates.reset_token;

    const updatedProfile = await AuthService.updateProfile(userId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.message.includes('already taken')) {
      return res.status(409).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile' 
    });
  }
});

// Deactivate account (authenticated)
router.post('/deactivate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await AuthService.deactivateAccount(userId);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to deactivate account' 
    });
  }
});

// Validate token
router.get('/validate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await AuthService.getProfile(userId);

    res.json({
      success: true,
      valid: true,
      user: profile
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ 
      success: false, 
      valid: false,
      error: 'Invalid token' 
    });
  }
});

// Logout (just for client-side token clearing confirmation)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;