const express = require('express');
const router = express.Router();

console.log('🧪 Loading minimal auth test routes');

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Auth routes working!', 
        timestamp: new Date().toISOString() 
    });
});

// Basic forgot password
router.post('/forgot-password', (req, res) => {
    console.log('🔑 Forgot password test request for:', req.body.email);
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    // Generate a test reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetLink = `https://datasql.pro/reset-password?token=${resetToken}`;
    
    res.json({
        success: true,
        message: 'Password reset request received',
        email: email,
        resetLink: resetLink,
        token: resetToken
    });
});

console.log('✅ Minimal auth test routes loaded');
module.exports = router;