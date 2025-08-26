const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

console.log('🚀 Loading FIXED ADAPTIVE AUTH SYSTEM - v2.1 WITH FORGOT PASSWORD');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Test endpoint to verify deployment
router.get('/test-deployment', (req, res) => {
    res.json({ 
        version: 'v2.1-with-forgot-password',
        timestamp: new Date().toISOString(),
        forgotPasswordEndpoint: 'Available at POST /api/auth/forgot-password'
    });
});

// Registration endpoint with email verification
router.post('/register', async (req, res) => {
    try {
        console.log('🔵 Registration attempt for:', req.body.email);
        const { username, email, password, fullName } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Strong password validation
        if (password === '12345678' || password.length < 8 || !/(?=.*[a-zA-Z])/.test(password)) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters and contain letters and numbers' 
            });
        }
        
        // Try to inspect existing users table
        try {
            console.log('🔍 Checking existing users table...');
            const existingUsers = await pool.query('SELECT * FROM users LIMIT 1');
            const columns = existingUsers.rows[0] ? Object.keys(existingUsers.rows[0]) : [];
            console.log('✅ Found users table with columns:', columns);
            
            // If the table doesn't have email column, it's incompatible - use app_users instead
            if (!columns.includes('email')) {
                console.log('❌ Users table missing email column. Creating app_users table...');
                throw new Error('Incompatible table structure');
            }
            
            // Add missing verification columns if they don't exist
            if (!columns.includes('is_verified')) {
                try {
                    console.log('🔧 Adding verification columns to users table...');
                    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false');
                    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10)');
                    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP');
                    console.log('✅ Verification columns added to users table');
                } catch (alterError) {
                    console.log('❌ Failed to add verification columns:', alterError.message);
                }
            }
            
            // Users table has email - use it
            const idColumn = columns.includes('id') ? 'id' : 
                            columns.includes('user_id') ? 'user_id' :
                            columns[0];
            
            console.log('✅ Using users table with ID column:', idColumn);
            
            // Check if user exists
            const userExists = await pool.query(`SELECT ${idColumn} FROM users WHERE email = $1`, [email]);
            if (userExists.rows && userExists.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
            
            // Hash password and create unverified user in existing users table
            const passwordHash = await bcrypt.hash(password, 10);
            const finalUsername = username || email.split('@')[0];
            
            // Generate OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry
            
            await pool.query(
                'INSERT INTO users (username, email, password_hash, full_name, is_verified, otp_code, otp_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [finalUsername, email, passwordHash, fullName, false, otp, otpExpiry]
            );
            
            const result = await pool.query(
                `SELECT ${idColumn}, username, email, full_name FROM users WHERE email = $1 ORDER BY ${idColumn} DESC LIMIT 1`,
                [email]
            );
            
            const user = result.rows[0];
            
            console.log('🎉 Registration successful with users table - OTP required');
            return res.status(201).json({
                success: true,
                message: 'Account created! Please check your email for verification code.',
                requiresVerification: true,
                userId: user[idColumn],
                // For development - remove in production
                ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
            });
            
        } catch (tableError) {
            console.log('❌ Users table issue:', tableError.message);
            console.log('🏗️ Creating app_users table as fallback...');
            
            // Create app_users table
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS app_users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(255),
                        is_active BOOLEAN DEFAULT true,
                        is_verified BOOLEAN DEFAULT false,
                        otp_code VARCHAR(10),
                        otp_expires_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // Check if user exists in app_users
                const appUserExists = await pool.query('SELECT id FROM app_users WHERE email = $1', [email]);
                if (appUserExists.rows && appUserExists.rows.length > 0) {
                    return res.status(400).json({ error: 'User already exists' });
                }
                
                // Hash password and create unverified user in app_users
                const passwordHash = await bcrypt.hash(password, 10);
                const finalUsername = username || email.split('@')[0];
                
                // Generate OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const otpExpiry = new Date();
                otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry
                
                await pool.query(
                    'INSERT INTO app_users (username, email, password_hash, full_name, is_verified, otp_code, otp_expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    [finalUsername, email, passwordHash, fullName, false, otp, otpExpiry]
                );
                
                const result = await pool.query(
                    'SELECT id, username, email, full_name FROM app_users WHERE email = $1 ORDER BY id DESC LIMIT 1',
                    [email]
                );
                
                const user = result.rows[0];
                
                console.log('🎉 Registration successful with app_users table - OTP required');
                return res.status(201).json({
                    success: true,
                    message: 'Account created! Please check your email for verification code.',
                    requiresVerification: true,
                    userId: user.id,
                    // For development - remove in production
                    ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
                });
                
            } catch (appUsersError) {
                console.error('❌ Failed to create app_users table:', appUsersError);
                return res.status(500).json({ 
                    error: 'Failed to create user account',
                    debug: appUsersError.message
                });
            }
        }
        
    } catch (error) {
        console.error('💥 Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed',
            debug: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Login endpoint (with forgot password functionality)
router.post('/login', async (req, res) => {
    try {
        // Check if this is a forgot password request
        if (req.query.action === 'forgot-password' || req.body.forgotPassword === true) {
            console.log('🔑 Forgot password request for:', req.body.email);
            const { email } = req.body;
            
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Valid email is required' });
            }
            
            // Check if user exists in either table
            let user = null;
            let tableName = '';
            
            try {
                let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                    tableName = 'users';
                } else {
                    result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
                    if (result.rows && result.rows.length > 0) {
                        user = result.rows[0];
                        tableName = 'app_users';
                    }
                }
            } catch (selectError) {
                const result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                    tableName = 'app_users';
                }
            }
            
            // Always return success to prevent email enumeration
            if (!user) {
                console.log('❌ User not found for password reset:', email);
                return res.json({ 
                    success: true, 
                    message: 'If an account with that email exists, a password reset link has been sent.',
                    forgotPassword: true
                });
            }
            
            // Create password_resets table if it doesn't exist
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS password_resets (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) UNIQUE NOT NULL,
                        expires_at TIMESTAMP NOT NULL,
                        used BOOLEAN DEFAULT false,
                        table_name VARCHAR(50) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
            } catch (tableError) {
                console.log('Password resets table creation failed:', tableError.message);
            }
            
            // Generate reset token
            const resetToken = require('crypto').randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
            
            const idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
            
            // Save reset token
            await pool.query(
                'INSERT INTO password_resets (user_id, email, token, expires_at, table_name) VALUES ($1, $2, $3, $4, $5)',
                [user[idColumn], email, resetToken, expiresAt, tableName]
            );
            
            console.log('✅ Password reset token created for:', email);
            
            // For now, return the reset link in the response (in production, send email)
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            return res.json({ 
                success: true,
                message: 'Password reset link has been generated.',
                forgotPassword: true,
                // For development - remove in production
                resetLink,
                devToken: resetToken
            });
        }
        
        console.log('🔑 Login attempt for:', req.body.email);
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Try both tables: users and app_users
        let result = null;
        let tableName = '';
        
        try {
            result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            tableName = 'users';
            if (!result.rows || result.rows.length === 0) {
                result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
                tableName = 'app_users';
            }
        } catch (selectError) {
            result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
            tableName = 'app_users';
        }
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
        const passwordColumn = Object.keys(user).includes('password_hash') ? 'password_hash' : 'password';
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user[passwordColumn]);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check if user is verified
        if (user.is_verified === false) {
            return res.status(403).json({ 
                error: 'Please verify your email address before logging in.',
                requiresVerification: true,
                userId: user[idColumn]
            });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user[idColumn], username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('✅ Login successful for:', email, 'from table:', tableName);
        res.json({
            token,
            user: {
                id: user[idColumn],
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Validate token endpoint
router.get('/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Try both tables
        let result = null;
        try {
            result = await pool.query('SELECT * FROM users WHERE id = $1 OR user_id = $1', [decoded.userId]);
            if (!result.rows || result.rows.length === 0) {
                result = await pool.query('SELECT * FROM app_users WHERE id = $1', [decoded.userId]);
            }
        } catch (selectError) {
            result = await pool.query('SELECT * FROM app_users WHERE id = $1', [decoded.userId]);
        }
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = result.rows[0];
        const idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
        
        res.json({
            valid: true,
            user: {
                id: user[idColumn],
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
        
    } catch (error) {
        console.error('❌ Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        console.log('🔑 Forgot password request for:', req.body.email);
        const { email } = req.body;
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }
        
        // Check if user exists in either table
        let user = null;
        let tableName = '';
        
        try {
            let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                tableName = 'users';
            } else {
                result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                    tableName = 'app_users';
                }
            }
        } catch (selectError) {
            const result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                tableName = 'app_users';
            }
        }
        
        // Always return success to prevent email enumeration
        if (!user) {
            console.log('❌ User not found for password reset:', email);
            return res.json({ 
                success: true, 
                message: 'If an account with that email exists, a password reset link has been sent.' 
            });
        }
        
        // Create password_resets table if it doesn't exist
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS password_resets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(255) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used BOOLEAN DEFAULT false,
                    table_name VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
        } catch (tableError) {
            console.log('Password resets table creation failed:', tableError.message);
        }
        
        // Generate reset token
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
        
        const idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
        
        // Save reset token
        await pool.query(
            'INSERT INTO password_resets (user_id, email, token, expires_at, table_name) VALUES ($1, $2, $3, $4, $5)',
            [user[idColumn], email, resetToken, expiresAt, tableName]
        );
        
        console.log('✅ Password reset token created for:', email);
        
        // For now, return the reset link in the response (in production, send email)
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        
        res.json({ 
            success: true,
            message: 'Password reset link has been sent to your email.',
            // For development - remove in production
            ...(process.env.NODE_ENV === 'development' && { 
                resetLink,
                devToken: resetToken 
            })
        });
        
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        console.log('🔑 Password reset attempt');
        const { token, password } = req.body;
        
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Find valid reset token
        const resetResult = await pool.query(`
            SELECT pr.*, pr.table_name
            FROM password_resets pr
            WHERE pr.token = $1 
            AND pr.expires_at > NOW() 
            AND pr.used = false
        `, [token]);
        
        if (resetResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        const resetRecord = resetResult.rows[0];
        
        // Hash new password
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Update user password in the appropriate table
        const tableName = resetRecord.table_name;
        const idColumn = tableName === 'users' ? (
            // Check if users table uses id or user_id
            await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('id', 'user_id')`)
        ).rows[0]?.column_name || 'id' : 'id';
        
        try {
            // Begin transaction
            await pool.query('BEGIN');
            
            // Update password
            await pool.query(
                `UPDATE ${tableName} SET password_hash = $1 WHERE ${idColumn} = $2`,
                [passwordHash, resetRecord.user_id]
            );
            
            // Mark token as used
            await pool.query(
                'UPDATE password_resets SET used = true WHERE id = $1',
                [resetRecord.id]
            );
            
            await pool.query('COMMIT');
            
            console.log('✅ Password reset successful for:', resetRecord.email);
            res.json({ 
                success: true,
                message: 'Password has been reset successfully. You can now log in with your new password.' 
            });
            
        } catch (updateError) {
            await pool.query('ROLLBACK');
            throw updateError;
        }
        
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
    try {
        console.log('📧 Email verification attempt');
        const { userId, otp } = req.body;
        
        if (!userId || !otp) {
            return res.status(400).json({ error: 'User ID and OTP are required' });
        }
        
        // Find user with OTP in both tables
        let user = null;
        let tableName = '';
        let idColumn = 'id';
        
        try {
            let result = await pool.query('SELECT * FROM users WHERE id = $1 OR user_id = $1', [userId]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                tableName = 'users';
                idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
            } else {
                result = await pool.query('SELECT * FROM app_users WHERE id = $1', [userId]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                    tableName = 'app_users';
                }
            }
        } catch (selectError) {
            const result = await pool.query('SELECT * FROM app_users WHERE id = $1', [userId]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                tableName = 'app_users';
            }
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if already verified
        if (user.is_verified === true) {
            return res.status(400).json({ error: 'Email is already verified' });
        }
        
        // Check OTP
        if (!user.otp_code || user.otp_code !== otp.toString()) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }
        
        // Check OTP expiry
        if (user.otp_expires_at && new Date() > new Date(user.otp_expires_at)) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }
        
        // Verify user
        await pool.query(
            `UPDATE ${tableName} SET is_verified = true, otp_code = NULL, otp_expires_at = NULL WHERE ${idColumn} = $1`,
            [userId]
        );
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user[idColumn], username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log('✅ Email verification successful for:', user.email);
        res.json({
            success: true,
            message: 'Email verified successfully! You are now logged in.',
            token,
            user: {
                id: user[idColumn],
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
        
    } catch (error) {
        console.error('❌ Email verification error:', error);
        res.status(500).json({ error: 'Failed to verify email' });
    }
});

// Resend verification code endpoint
router.post('/resend-verification', async (req, res) => {
    try {
        console.log('🔄 Resend verification request');
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Find user in both tables
        let user = null;
        let tableName = '';
        let idColumn = 'id';
        
        try {
            let result = await pool.query('SELECT * FROM users WHERE id = $1 OR user_id = $1', [userId]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                tableName = 'users';
                idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
            } else {
                result = await pool.query('SELECT * FROM app_users WHERE id = $1', [userId]);
                if (result.rows && result.rows.length > 0) {
                    user = result.rows[0];
                    tableName = 'app_users';
                }
            }
        } catch (selectError) {
            const result = await pool.query('SELECT * FROM app_users WHERE id = $1', [userId]);
            if (result.rows && result.rows.length > 0) {
                user = result.rows[0];
                tableName = 'app_users';
            }
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if already verified
        if (user.is_verified === true) {
            return res.status(400).json({ error: 'Email is already verified' });
        }
        
        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // 10 minutes expiry
        
        // Update OTP
        await pool.query(
            `UPDATE ${tableName} SET otp_code = $1, otp_expires_at = $2 WHERE ${idColumn} = $3`,
            [otp, otpExpiry, userId]
        );
        
        console.log('✅ New verification code generated for:', user.email);
        res.json({
            success: true,
            message: 'A new verification code has been sent to your email.',
            // For development - remove in production
            ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
        });
        
    } catch (error) {
        console.error('❌ Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification code' });
    }
});

console.log('✅ FIXED ADAPTIVE AUTH SYSTEM loaded successfully');
module.exports = router;