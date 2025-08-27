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

// Forgot password with SendGrid SDK
router.post('/forgot-password', async (req, res) => {
    console.log('🔑 Forgot password request for:', req.body.email);
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    
    try {
        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetLink = `https://datasql.pro/reset-password?token=${resetToken}`;
        
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

console.log('✅ Minimal auth test routes loaded');
module.exports = router;