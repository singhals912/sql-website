const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { authRateLimit } = require('../middleware/authMiddleware');
// Safe import of email service - fallback if not available
let generateOTP, sendVerificationEmail, sendPasswordResetEmail;
try {
    const emailService = require('../services/emailService');
    generateOTP = emailService.generateOTP;
    sendVerificationEmail = emailService.sendVerificationEmail;
    sendPasswordResetEmail = emailService.sendPasswordResetEmail;
} catch (emailError) {
    console.warn('Email service not available:', emailError.message);
    // Fallback functions
    generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
    sendVerificationEmail = async () => ({ success: false, error: 'Email service unavailable' });
    sendPasswordResetEmail = async () => ({ success: false, error: 'Email service unavailable' });
}

// Ensure JWT secret exists and is secure
const JWT_SECRET = (() => {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
        return process.env.JWT_SECRET;
    }
    
    console.warn('⚠️  WARNING: No secure JWT_SECRET found in environment variables!');
    console.warn('⚠️  Using fallback - THIS IS NOT SECURE FOR PRODUCTION!');
    
    // Generate a random secret for this session (better than hardcoded fallback)
    return crypto.randomBytes(64).toString('hex');
})();

// Input validation middleware
const validateRegistration = (req, res, next) => {
    const { email, password, username } = req.body;
    const errors = [];
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }
    
    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
    
    if (username && (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username))) {
        errors.push('Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }
    
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    
    next();
};

// Register
router.post('/register', authRateLimit, validateRegistration, async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        
        // Auto-create users table if it doesn't exist
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    is_verified BOOLEAN DEFAULT false,
                    verification_token VARCHAR(255),
                    verification_expires TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Create email verification table
            await pool.query(`
                CREATE TABLE IF NOT EXISTS email_verifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    email VARCHAR(255) NOT NULL,
                    otp VARCHAR(10) NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    verified BOOLEAN DEFAULT false,
                    attempts INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (tableError) {
            console.log('Table creation failed but continuing:', tableError.message);
        }
        
        // Check if user exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Create user (generate username from email if not provided)
        const finalUsername = username || email.split('@')[0];
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name',
            [finalUsername, email, passwordHash, fullName]
        );
        
        const user = result.rows[0];
        
        // Generate OTP and send verification email
        const otp = generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry
        
        let emailVerificationEnabled = false;
        try {
            // Store OTP in database
            await pool.query(`
                INSERT INTO email_verifications (user_id, email, otp, expires_at)
                VALUES ($1, $2, $3, $4)
            `, [user.id, email, otp, expiresAt]);
            
            // Send verification email
            const emailResult = await sendVerificationEmail(email, otp, fullName);
            
            if (emailResult.success) {
                emailVerificationEnabled = true;
            } else {
                console.error('Failed to send verification email:', emailResult.error);
            }
        } catch (otpError) {
            console.error('OTP generation/storage failed:', otpError);
        }
        
        if (emailVerificationEnabled) {
            // Email verification is working - require verification
            res.status(201).json({
                success: true,
                message: 'Account created successfully! Please check your email for a verification code.',
                requiresVerification: true,
                userId: user.id,
                email: user.email,
                // For development - remove in production
                ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
            });
        } else {
            // Email verification failed - create JWT token directly (fallback)
            console.log('Email verification unavailable, creating immediate JWT token');
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            res.status(201).json({
                success: true,
                message: 'Account created successfully!',
                requiresVerification: false,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name
                }
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail
        });
        
        // More specific error messages for debugging
        if (error.code === '23505') {
            res.status(400).json({ error: 'User already exists' });
        } else if (error.code === '42P01') {
            res.status(500).json({ error: 'Database table missing - please contact support' });
        } else {
            res.status(500).json({ 
                error: 'Failed to register user',
                ...(process.env.NODE_ENV === 'development' && { 
                    debug: error.message,
                    code: error.code 
                })
            });
        }
    }
});

// Login
router.post('/login', authRateLimit, validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const result = await pool.query(
            'SELECT id, username, email, password_hash, full_name, is_active FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        if (!user.is_active) {
            return res.status(400).json({ error: 'Account is disabled' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Validate token
router.get('/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user data
        const result = await pool.query(
            'SELECT id, username, email, full_name, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = result.rows[0];
        
        res.json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Forgot Password
router.post('/forgot-password', authRateLimit, async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        
        // Check if user exists
        const userResult = await pool.query(
            'SELECT id, email, full_name FROM users WHERE email = $1 AND is_active = true',
            [email]
        );
        
        // Always return success to prevent email enumeration
        if (userResult.rows.length === 0) {
            return res.json({ 
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.' 
            });
        }
        
        const user = userResult.rows[0];
        
        // Create password reset table if it doesn't exist
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS password_resets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (tableError) {
            console.log('Password reset table creation failed:', tableError.message);
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
        
        // Save reset token
        await pool.query(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [user.id, resetToken, expiresAt]
        );
        
        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, resetToken, user.full_name);
        
        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
        }
        
        res.json({ 
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            // TODO: Remove this debug info in production
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return res.status(400).json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' });
        }
        
        // Find valid reset token
        const resetResult = await pool.query(`
            SELECT pr.id, pr.user_id, u.email
            FROM password_resets pr
            JOIN users u ON pr.user_id = u.id
            WHERE pr.token = $1 
            AND pr.expires_at > NOW() 
            AND pr.used = false
            AND u.is_active = true
        `, [token]);
        
        if (resetResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        const resetRecord = resetResult.rows[0];
        
        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Update user password and mark token as used
        await pool.query('BEGIN');
        
        try {
            await pool.query(
                'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [passwordHash, resetRecord.user_id]
            );
            
            await pool.query(
                'UPDATE password_resets SET used = true WHERE id = $1',
                [resetRecord.id]
            );
            
            await pool.query('COMMIT');
            
            res.json({ 
                success: true,
                message: 'Password has been reset successfully' 
            });
        } catch (updateError) {
            await pool.query('ROLLBACK');
            throw updateError;
        }
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Profile management endpoint
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const result = await pool.query(
            'SELECT id, username, email, full_name, created_at FROM users WHERE id = $1 AND is_active = true',
            [decoded.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update profile endpoint
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const { username, fullName } = req.body;
        
        // Validate inputs
        if (username && (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username))) {
            return res.status(400).json({ error: 'Username must be at least 3 characters and contain only letters, numbers, hyphens, and underscores' });
        }
        
        // Check if username is taken (if being changed)
        if (username) {
            const usernameCheck = await pool.query(
                'SELECT id FROM users WHERE username = $1 AND id != $2',
                [username, decoded.userId]
            );
            
            if (usernameCheck.rows.length > 0) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
        }
        
        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        if (username) {
            updates.push(`username = $${paramIndex++}`);
            values.push(username);
        }
        
        if (fullName) {
            updates.push(`full_name = $${paramIndex++}`);
            values.push(fullName);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid updates provided' });
        }
        
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(decoded.userId);
        
        const updateQuery = `
            UPDATE users 
            SET ${updates.join(', ')} 
            WHERE id = $${paramIndex} AND is_active = true
            RETURNING id, username, email, full_name
        `;
        
        const result = await pool.query(updateQuery, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        if (error.code === '23505') { // Unique constraint violation
            res.status(400).json({ error: 'Username is already taken' });
        } else {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
});

// Verify email with OTP
router.post('/verify-email', authRateLimit, async (req, res) => {
    try {
        const { userId, otp } = req.body;
        
        if (!userId || !otp) {
            return res.status(400).json({ error: 'User ID and OTP are required' });
        }
        
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({ error: 'Invalid OTP format' });
        }
        
        // Find valid OTP
        const otpResult = await pool.query(`
            SELECT ev.id, ev.user_id, ev.attempts, u.username, u.email, u.full_name
            FROM email_verifications ev
            JOIN users u ON ev.user_id = u.id
            WHERE ev.user_id = $1 
            AND ev.otp = $2 
            AND ev.expires_at > NOW() 
            AND ev.verified = false
            AND ev.attempts < 5
            AND u.is_active = true
        `, [userId, otp]);
        
        if (otpResult.rows.length === 0) {
            // Increment attempts for failed verification
            await pool.query(`
                UPDATE email_verifications 
                SET attempts = attempts + 1 
                WHERE user_id = $1 AND verified = false
            `, [userId]);
            
            return res.status(400).json({ 
                error: 'Invalid or expired OTP. Please check your code or request a new one.' 
            });
        }
        
        const verification = otpResult.rows[0];
        
        // Mark email as verified and user as verified
        await pool.query('BEGIN');
        
        try {
            await pool.query(`
                UPDATE email_verifications 
                SET verified = true 
                WHERE id = $1
            `, [verification.id]);
            
            await pool.query(`
                UPDATE users 
                SET is_verified = true, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1
            `, [verification.user_id]);
            
            await pool.query('COMMIT');
            
            // Create JWT token after successful verification
            const token = jwt.sign(
                { userId: verification.user_id, username: verification.username, email: verification.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            res.json({
                success: true,
                message: 'Email verified successfully!',
                token,
                user: {
                    id: verification.user_id,
                    username: verification.username,
                    email: verification.email,
                    fullName: verification.full_name,
                    isVerified: true
                }
            });
            
        } catch (updateError) {
            await pool.query('ROLLBACK');
            throw updateError;
        }
        
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

// Resend verification email
router.post('/resend-verification', authRateLimit, async (req, res) => {
    try {
        const { userId, email } = req.body;
        
        if (!userId || !email) {
            return res.status(400).json({ error: 'User ID and email are required' });
        }
        
        // Check if user exists and is not already verified
        const userResult = await pool.query(`
            SELECT id, username, email, full_name, is_verified, is_active
            FROM users 
            WHERE id = $1 AND email = $2 AND is_active = true
        `, [userId, email]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = userResult.rows[0];
        
        if (user.is_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }
        
        // Check recent verification attempts (rate limiting)
        const recentAttempts = await pool.query(`
            SELECT COUNT(*) as count
            FROM email_verifications 
            WHERE user_id = $1 AND created_at > NOW() - INTERVAL '5 minutes'
        `, [userId]);
        
        if (parseInt(recentAttempts.rows[0].count) >= 3) {
            return res.status(429).json({ 
                error: 'Too many verification emails sent. Please wait 5 minutes before requesting another.' 
            });
        }
        
        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        
        // Invalidate old OTPs and create new one
        await pool.query('BEGIN');
        
        try {
            await pool.query(`
                UPDATE email_verifications 
                SET verified = true 
                WHERE user_id = $1 AND verified = false
            `, [userId]);
            
            await pool.query(`
                INSERT INTO email_verifications (user_id, email, otp, expires_at)
                VALUES ($1, $2, $3, $4)
            `, [userId, email, otp, expiresAt]);
            
            await pool.query('COMMIT');
            
            // Send verification email
            const emailResult = await sendVerificationEmail(email, otp, user.full_name);
            
            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
                return res.status(500).json({ error: 'Failed to send verification email' });
            }
            
            res.json({
                success: true,
                message: 'Verification email sent! Please check your inbox.',
                // For development - remove in production
                ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
            });
            
        } catch (dbError) {
            await pool.query('ROLLBACK');
            throw dbError;
        }
        
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

// Check verification status
router.get('/verification-status/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userResult = await pool.query(`
            SELECT is_verified, email 
            FROM users 
            WHERE id = $1 AND is_active = true
        `, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = userResult.rows[0];
        
        res.json({
            success: true,
            isVerified: user.is_verified,
            email: user.email
        });
        
    } catch (error) {
        console.error('Verification status error:', error);
        res.status(500).json({ error: 'Failed to check verification status' });
    }
});

// Debug endpoint to test system health
router.get('/debug/health', async (req, res) => {
    try {
        console.log('Health check started');
        
        // Test database connection
        const dbTest = await pool.query('SELECT NOW()');
        console.log('Database connection: OK');
        
        // Test email service
        let emailServiceStatus = 'Not available';
        try {
            const testOTP = generateOTP();
            emailServiceStatus = testOTP ? 'Available (OTP generated)' : 'Failed to generate OTP';
        } catch (emailError) {
            emailServiceStatus = `Error: ${emailError.message}`;
        }
        console.log('Email service status:', emailServiceStatus);
        
        // Test JWT secret
        const jwtStatus = JWT_SECRET && JWT_SECRET.length > 10 ? 'Available' : 'Missing/Invalid';
        console.log('JWT secret status:', jwtStatus);
        
        res.json({
            success: true,
            status: {
                database: 'Connected',
                emailService: emailServiceStatus,
                jwtSecret: jwtStatus,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;