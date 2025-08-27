const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

console.log('🧪 Loading minimal auth test routes');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// In-memory user store for demo (production should use database)
global.users = global.users || [];

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Auth routes working!', 
        timestamp: new Date().toISOString() 
    });
});

// Register endpoint
router.post('/register', async (req, res) => {
    console.log('📝 Registration request');
    const { username, email, password, fullName } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    try {
        // Check if user already exists
        const existingUser = global.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Create user
        const user = {
            id: Date.now(), // Simple ID for demo
            username: username || email.split('@')[0],
            email,
            passwordHash,
            fullName: fullName || '',
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        global.users.push(user);
        console.log(`✅ User registered: ${email} (Total users: ${global.users.length})`);
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    console.log('🔐 Login request');
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        // Find user
        const user = global.users.find(u => u.email === email && u.isActive);
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        console.log(`✅ User logged in: ${email}`);
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Forgot password with SendGrid SDK
router.post('/forgot-password', async (req, res) => {
    console.log('🔑 Forgot password request for:', req.body.email);
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    
    try {
        // Check if user exists (for security, always return success message)
        const userExists = global.users.find(u => u.email === email && u.isActive);
        console.log(`🔍 User exists for ${email}:`, !!userExists);
        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetLink = `https://datasql.pro/reset-password?token=${resetToken}`;
        
        // Store the reset token in a simple in-memory store (for demo)
        // In production, this should be stored in database with expiry
        global.resetTokens = global.resetTokens || {};
        global.resetTokens[resetToken] = {
            email: email,
            expires: Date.now() + (60 * 60 * 1000) // 1 hour
        };
        
        // Try SendGrid SDK first
        if (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('SG.')) {
            console.log('📧 Trying SendGrid SDK...');
            try {
                const sgMail = require('@sendgrid/mail');
                sgMail.setApiKey(process.env.SMTP_PASS);
                
                const msg = {
                    to: email,
                    from: process.env.EMAIL_FROM || 'noreply@datasql.pro',
                    subject: 'Reset Your SQL Practice Platform Password',
                    text: `Password Reset\n\nReset your password: ${resetLink}\n\nThis link expires in 1 hour.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Password Reset - SQL Practice Platform</h2>
                            <p>You requested a password reset for your account.</p>
                            <p><a href="${resetLink}" style="background: #4c51bf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset My Password</a></p>
                            <p>Or copy this link: ${resetLink}</p>
                            <p>This link expires in 1 hour.</p>
                        </div>
                    `
                };
                
                console.log('📧 Sending via SendGrid SDK to:', email);
                const result = await sgMail.send(msg);
                console.log('📧 ✅ SendGrid SDK: Email sent successfully!', result[0].statusCode);
                
            } catch (sgError) {
                console.error('📧 ❌ SendGrid SDK failed:', sgError.message);
            }
        } else {
            console.log('📧 No SendGrid API key found');
        }
        
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            devResetLink: resetLink,
            devToken: resetToken
        });
        
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    console.log('🔄 Reset password request');
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    try {
        // Check token from in-memory store (in production, use database)
        global.resetTokens = global.resetTokens || {};
        const tokenData = global.resetTokens[token];
        
        if (!tokenData) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        if (Date.now() > tokenData.expires) {
            delete global.resetTokens[token];
            return res.status(400).json({ error: 'Reset token has expired' });
        }
        
        // Hash new password and update user
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Find and update user
        const userIndex = global.users.findIndex(u => u.email === tokenData.email);
        if (userIndex !== -1) {
            global.users[userIndex].passwordHash = hashedPassword;
            console.log(`🔄 Password updated in user store for: ${tokenData.email}`);
        } else {
            console.log(`🔄 User not found in store for: ${tokenData.email}`);
        }
        
        console.log(`🔄 Password reset successful for: ${tokenData.email}`);
        
        // Clean up token
        delete global.resetTokens[token];
        
        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
        
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

console.log('✅ Minimal auth test routes loaded');
module.exports = router;