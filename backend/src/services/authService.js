const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class AuthService {
  // Register new user
  static async register(email, password, username = null, fullName = null) {
    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Check username uniqueness if provided
      if (username) {
        const existingUsername = await pool.query(
          'SELECT id FROM users WHERE username = $1',
          [username.toLowerCase()]
        );

        if (existingUsername.rows.length > 0) {
          throw new Error('Username is already taken');
        }
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const result = await pool.query(`
        INSERT INTO users (email, password_hash, username, full_name, verification_token)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, username, full_name, created_at, email_verified
      `, [
        email.toLowerCase(),
        passwordHash,
        username ? username.toLowerCase() : null,
        fullName,
        verificationToken
      ]);

      const user = result.rows[0];

      // TODO: Send verification email (implement email service)
      console.log(`Verification token for ${email}: ${verificationToken}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          emailVerified: user.email_verified,
          createdAt: user.created_at
        },
        verificationToken
      };

    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Get user with password hash
      const result = await pool.query(`
        SELECT 
          id, email, password_hash, username, full_name, 
          email_verified, is_active, last_login, preferences, goals
        FROM users 
        WHERE email = $1
      `, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate JWT token
      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.full_name,
          emailVerified: user.email_verified,
          preferences: user.preferences,
          goals: user.goals,
          lastLogin: user.last_login
        },
        token
      };

    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  // Verify email
  static async verifyEmail(token) {
    try {
      const result = await pool.query(`
        UPDATE users 
        SET email_verified = true, verification_token = NULL
        WHERE verification_token = $1 AND email_verified = false
        RETURNING id, email, username, full_name
      `, [token]);

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired verification token');
      }

      return result.rows[0];

    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(email) {
    try {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      const result = await pool.query(`
        UPDATE users 
        SET reset_token = $1, reset_token_expires = $2
        WHERE email = $3 AND is_active = true
        RETURNING id, email, full_name
      `, [resetToken, resetExpires, email.toLowerCase()]);

      if (result.rows.length === 0) {
        // Don't reveal if email exists or not for security
        return { message: 'If the email exists, a reset link has been sent' };
      }

      const user = result.rows[0];

      // TODO: Send password reset email
      console.log(`Password reset token for ${email}: ${resetToken}`);

      return {
        message: 'Password reset link sent to your email',
        resetToken // Remove in production
      };

    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    try {
      // Find user with valid reset token
      const result = await pool.query(`
        SELECT id, email FROM users 
        WHERE reset_token = $1 
        AND reset_token_expires > CURRENT_TIMESTAMP
        AND is_active = true
      `, [token]);

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const user = result.rows[0];

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await pool.query(`
        UPDATE users 
        SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
        WHERE id = $2
      `, [passwordHash, user.id]);

      return {
        message: 'Password reset successfully',
        userId: user.id
      };

    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Change password (authenticated user)
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current password hash
      const result = await pool.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, userId]
      );

      return { message: 'Password changed successfully' };

    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(userId, updates) {
    try {
      const allowedFields = ['username', 'full_name', 'avatar_url', 'preferences', 'goals'];
      const setFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [field, value] of Object.entries(updates)) {
        if (allowedFields.includes(field) && value !== undefined) {
          setFields.push(`${field} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (setFields.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Check username uniqueness if updating username
      if (updates.username) {
        const existingUsername = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [updates.username.toLowerCase(), userId]
        );

        if (existingUsername.rows.length > 0) {
          throw new Error('Username is already taken');
        }
      }

      setFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      const result = await pool.query(`
        UPDATE users 
        SET ${setFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, username, full_name, avatar_url, preferences, goals, updated_at
      `, values);

      return result.rows[0];

    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Get user profile
  static async getProfile(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          id, email, username, full_name, avatar_url, 
          preferences, goals, created_at, updated_at, 
          last_login, email_verified
        FROM users 
        WHERE id = $1 AND is_active = true
      `, [userId]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];

    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  // Deactivate account
  static async deactivateAccount(userId) {
    try {
      await pool.query(
        'UPDATE users SET is_active = false WHERE id = $1',
        [userId]
      );

      return { message: 'Account deactivated successfully' };

    } catch (error) {
      console.error('Error deactivating account:', error);
      throw error;
    }
  }

  // Generate JWT token
  static generateToken(userId) {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d'
    });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Migrate session data to user account
  static async migrateSessionData(userId, sessionId) {
    try {
      await pool.query('BEGIN');

      // Migrate progress data
      await pool.query(`
        UPDATE user_problem_attempts 
        SET user_id = $1, session_id = NULL 
        WHERE session_id = $2
      `, [userId, sessionId]);

      await pool.query(`
        UPDATE user_problem_progress 
        SET user_id = $1, session_id = NULL 
        WHERE session_id = $2
      `, [userId, sessionId]);

      await pool.query(`
        UPDATE user_achievements 
        SET user_id = $1, session_id = NULL 
        WHERE session_id = $2
      `, [userId, sessionId]);

      await pool.query(`
        UPDATE user_streaks 
        SET user_id = $1, session_id = NULL 
        WHERE session_id = $2
      `, [userId, sessionId]);

      // Migrate bookmarks (handle conflicts)
      await pool.query(`
        INSERT INTO user_bookmarks (user_id, problem_id, bookmark_type, notes, tags, created_at)
        SELECT $1, problem_id, bookmark_type, notes, tags, created_at
        FROM user_bookmarks 
        WHERE session_id = $2
        ON CONFLICT (user_id, problem_id) DO NOTHING
      `, [userId, sessionId]);

      // Delete session bookmarks
      await pool.query(`
        DELETE FROM user_bookmarks WHERE session_id = $1
      `, [sessionId]);

      // Migrate hint usage
      await pool.query(`
        UPDATE user_hint_usage 
        SET user_id = $1, session_id = NULL 
        WHERE session_id = $2
      `, [userId, sessionId]);

      // Migrate learning path progress
      await pool.query(`
        UPDATE user_learning_path_progress 
        SET user_id = $1, session_id = NULL 
        WHERE session_id = $2
      `, [userId, sessionId]);

      await pool.query('COMMIT');

      return { message: 'Session data migrated successfully' };

    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error migrating session data:', error);
      throw error;
    }
  }
}

module.exports = AuthService;