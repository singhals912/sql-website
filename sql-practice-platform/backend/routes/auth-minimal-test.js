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
global.bookmarks = global.bookmarks || [];
global.progress = global.progress || [];
global.resetTokens = global.resetTokens || {};

// Debug: Log current state on route load
console.log('🧪 Auth routes loaded - Current state:');
console.log('🧪 Users in store:', global.users.length);
console.log('🧪 User emails:', global.users.map(u => u.email));
console.log('🧪 Active reset tokens:', Object.keys(global.resetTokens).length);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Auth routes working!', 
        timestamp: new Date().toISOString() 
    });
});

// Debug endpoint
router.get('/debug', (req, res) => {
    res.json({
        users: global.users.map(u => ({ email: u.email, hasPassword: !!u.passwordHash })),
        resetTokens: Object.keys(global.resetTokens).map(token => ({
            token: token.substring(0, 10) + '...',
            email: global.resetTokens[token]?.email,
            expires: new Date(global.resetTokens[token]?.expires).toISOString()
        })),
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
    console.log('🔐 Login attempt for email:', email);
    console.log('🔐 Password provided:', password ? `YES (length: ${password.length})` : 'NO');
    
    if (!email || !password) {
        console.log('🔐 ❌ Missing email or password');
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        // Find user
        console.log('🔐 Looking for user in store...');
        console.log('🔐 Total users in store:', global.users.length);
        console.log('🔐 User emails in store:', global.users.map(u => u.email));
        
        const user = global.users.find(u => u.email === email && u.isActive);
        
        if (!user) {
            console.log('🔐 ❌ User not found or inactive');
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        
        console.log('🔐 ✅ User found:', user.email);
        console.log('🔐 User hash:', user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'NO HASH');
        
        // Check password
        console.log('🔐 Comparing password...');
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        console.log('🔐 Password comparison result:', isValidPassword ? 'SUCCESS' : 'FAILED');
        
        if (!isValidPassword) {
            console.log('🔐 ❌ Invalid password');
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
    console.log('🔄 Request body:', { token: req.body.token ? 'EXISTS' : 'MISSING', newPassword: req.body.newPassword ? `LENGTH:${req.body.newPassword.length}` : 'MISSING' });
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        console.log('🔄 ❌ Missing token or password');
        return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 8) {
        console.log('🔄 ❌ Password too short');
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    try {
        // Check token from in-memory store (in production, use database)
        global.resetTokens = global.resetTokens || {};
        console.log('🔄 Available tokens:', Object.keys(global.resetTokens).length);
        console.log('🔄 Looking for token:', token.substring(0, 10) + '...');
        
        const tokenData = global.resetTokens[token];
        
        if (!tokenData) {
            console.log('🔄 ❌ Token not found in store');
            console.log('🔄 Available token prefixes:', Object.keys(global.resetTokens).map(t => t.substring(0, 10) + '...'));
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        
        console.log('🔄 ✅ Token found for email:', tokenData.email);
        console.log('🔄 Token expires at:', new Date(tokenData.expires).toISOString());
        console.log('🔄 Current time:', new Date(Date.now()).toISOString());
        
        if (Date.now() > tokenData.expires) {
            console.log('🔄 ❌ Token expired');
            delete global.resetTokens[token];
            return res.status(400).json({ error: 'Reset token has expired' });
        }
        
        // Hash new password and update user
        console.log('🔄 Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        console.log('🔄 Password hashed successfully');
        
        // Find and update user
        console.log('🔄 Looking for user with email:', tokenData.email);
        console.log('🔄 Total users in store:', global.users.length);
        console.log('🔄 User emails in store:', global.users.map(u => u.email));
        
        const userIndex = global.users.findIndex(u => u.email === tokenData.email);
        if (userIndex !== -1) {
            const oldPasswordHash = global.users[userIndex].passwordHash;
            global.users[userIndex].passwordHash = hashedPassword;
            console.log(`🔄 ✅ Password updated in user store for: ${tokenData.email}`);
            console.log(`🔄 Old hash: ${oldPasswordHash.substring(0, 20)}...`);
            console.log(`🔄 New hash: ${hashedPassword.substring(0, 20)}...`);
            
            // Verify the update worked
            const updatedUser = global.users[userIndex];
            console.log(`🔄 Verification - User hash is now: ${updatedUser.passwordHash.substring(0, 20)}...`);
            
            // Test password verification
            const testVerify = await bcrypt.compare(newPassword, updatedUser.passwordHash);
            console.log(`🔄 Test password verification: ${testVerify ? 'SUCCESS' : 'FAILED'}`);
            
        } else {
            console.log(`🔄 ❌ User not found in store for: ${tokenData.email}`);
            return res.status(400).json({ error: 'User account not found' });
        }
        
        console.log(`🔄 ✅ Password reset successful for: ${tokenData.email}`);
        
        // Clean up token
        delete global.resetTokens[token];
        console.log('🔄 ✅ Reset token cleaned up');
        
        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });
        
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Bookmarks endpoints
router.get('/bookmarks', (req, res) => {
    console.log('📚 Get bookmarks request');
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'] || 'anonymous';
    
    // Filter bookmarks for this session
    const userBookmarks = global.bookmarks.filter(b => b.sessionId === sessionId);
    
    // Mock some bookmark data if empty for demo
    if (userBookmarks.length === 0) {
        // Add sample bookmarks with different types
        const sampleBookmarks = [
            {
                id: Date.now(),
                sessionId,
                problemId: 1,
                title: 'Basic SELECT Query',
                difficulty: 'easy',
                category: 'basics',
                type: 'review_later',
                createdAt: new Date().toISOString(),
                notes: ''
            }
        ];
        global.bookmarks.push(...sampleBookmarks);
        userBookmarks.push(...sampleBookmarks);
    }
    
    res.json({
        success: true,
        bookmarks: userBookmarks,
        summary: {
            total: userBookmarks.length,
            favorites: userBookmarks.filter(b => b.type === 'favorite').length,
            reviewLater: userBookmarks.filter(b => b.type === 'review_later').length,
            challenging: userBookmarks.filter(b => b.type === 'challenging').length
        }
    });
});

router.get('/bookmarks/stats', (req, res) => {
    console.log('📊 Get bookmark stats request');
    const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'] || 'anonymous';
    
    // Filter bookmarks for this session
    const userBookmarks = global.bookmarks.filter(b => b.sessionId === sessionId);
    
    // Mock some bookmark data if empty for demo
    if (userBookmarks.length === 0) {
        const sampleBookmark = {
            id: Date.now(),
            sessionId,
            problemId: 1,
            title: 'Basic SELECT Query',
            difficulty: 'easy',
            category: 'basics',
            type: 'review_later',
            createdAt: new Date().toISOString(),
            notes: ''
        };
        global.bookmarks.push(sampleBookmark);
        userBookmarks.push(sampleBookmark);
    }
    
    const stats = {
        total: userBookmarks.length,
        byType: {
            favorite: userBookmarks.filter(b => b.type === 'favorite').length,
            review_later: userBookmarks.filter(b => b.type === 'review_later').length,
            challenging: userBookmarks.filter(b => b.type === 'challenging').length
        }
    };
    
    res.json({
        success: true,
        stats: stats
    });
});

router.post('/bookmarks', (req, res) => {
    console.log('📚 Add bookmark request');
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    const { problemId, title, difficulty, category, type = 'favorite', notes = '' } = req.body;
    
    const bookmark = {
        id: Date.now(),
        sessionId,
        problemId,
        title: title || `Problem #${problemId}`,
        difficulty: difficulty || 'medium',
        category: category || 'general',
        type,
        notes,
        createdAt: new Date().toISOString()
    };
    
    global.bookmarks.push(bookmark);
    
    res.json({
        success: true,
        message: 'Bookmark added successfully',
        bookmark
    });
});

// Progress endpoints  
router.get('/progress', (req, res) => {
    console.log('📊 Get progress request');
    const sessionId = req.headers['x-session-id'] || 'anonymous';
    
    // Filter progress for this session
    const userProgress = global.progress.filter(p => p.sessionId === sessionId);
    
    // Mock some progress data if empty for demo
    if (userProgress.length === 0) {
        const sampleProgress = {
            id: Date.now(),
            sessionId,
            problemId: 1,
            title: 'Basic SELECT Query',
            attempts: 1,
            correctAttempts: 1,
            bestTime: '19ms',
            lastAttempted: new Date().toISOString(),
            status: 'completed',
            difficulty: 'medium'
        };
        global.progress.push(sampleProgress);
        userProgress.push(sampleProgress);
    }
    
    const totalProblems = 70; // Mock total
    const solved = userProgress.filter(p => p.status === 'completed').length;
    const totalAttempts = userProgress.reduce((sum, p) => sum + p.attempts, 0);
    const correctAttempts = userProgress.reduce((sum, p) => sum + p.correctAttempts, 0);
    
    res.json({
        success: true,
        stats: {
            problemsSolved: solved,
            totalProblems: totalProblems,
            completionRate: Math.round((solved / totalProblems) * 100),
            totalAttempts: totalAttempts,
            accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0
        },
        recentActivity: userProgress.slice(-10).reverse() // Last 10, most recent first
    });
});

// Recommendations endpoints
router.get('/problems', (req, res) => {
    console.log('🎯 Get recommendations request');
    
    // Mock recommendation data
    const recommendations = [
        {
            id: 1,
            numeric_id: 1,
            title: 'Basic SELECT Query',
            description: 'Learn the fundamentals of retrieving data from a database table using SELECT statements.',
            difficulty: 'easy',
            category: 'Basics',
            recommendation_score: 95,
            recommendation_reason: 'Perfect starting point'
        },
        {
            id: 2,
            numeric_id: 2,
            title: 'Filtering with WHERE',
            description: 'Master conditional queries by filtering data with WHERE clauses and comparison operators.',
            difficulty: 'easy',
            category: 'Filtering',
            recommendation_score: 88,
            recommendation_reason: 'Build on SELECT knowledge'
        },
        {
            id: 3,
            numeric_id: 5,
            title: 'Joining Tables',
            description: 'Combine data from multiple tables using INNER JOIN, LEFT JOIN, and other join types.',
            difficulty: 'medium',
            category: 'Joins',
            recommendation_score: 75,
            recommendation_reason: 'Essential skill'
        }
    ];
    
    res.json({
        success: true,
        data: {
            recommendations: recommendations,
            userProfile: {
                skill_level: 'Newcomer',
                completed_problems: 0,
                success_rate: 0
            }
        }
    });
});

router.get('/daily-challenge', (req, res) => {
    console.log('🔥 Get daily challenge request');
    
    // Mock daily challenge
    const challenge = {
        id: 41,
        numeric_id: 41,
        title: 'McKinsey Client Engagement Analysis',
        description: '**Business Context:** McKinsey & Company analyzes client engagement patterns and consultant utilization across different practice areas to optimize staffing models and identify high-value client relationships...',
        difficulty: 'hard',
        category: 'Advanced Topics'
    };
    
    res.json({
        success: true,
        data: {
            challenge: challenge
        }
    });
});

router.get('/progress-dashboard', (req, res) => {
    console.log('📊 Get progress dashboard request');
    
    res.json({
        success: true,
        data: {
            streakInfo: {
                current_streak: 0,
                longest_streak: 0
            }
        }
    });
});

console.log('✅ Minimal auth test routes loaded');
module.exports = router;