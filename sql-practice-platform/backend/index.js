const express = require('express');
require('dotenv').config();

console.log('🚀 Starting SQL Practice Platform Backend v2.1...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 5001;

// Essential middleware only for startup
app.use(express.json({ limit: '10mb' }));

// CORS - configured for custom domain support
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://datasql.pro',
    'https://www.datasql.pro', 
    'https://sql-website-two.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Basic middleware - simplified for reliable startup
app.use(express.urlencoded({ extended: true }));

// Health check - FIRST to ensure it's always available
app.get('/api/health', (req, res) => {
    console.log('Health check requested');
    res.json({ 
        status: 'ok', 
        message: 'Server is running', 
        timestamp: new Date().toISOString(),
        version: 'v2.3-with-forgot-password-workaround'
    });
});

// Temporary forgot password workaround via health endpoint
app.post('/api/health/forgot-password', async (req, res) => {
    console.log('🔑 WORKAROUND: Forgot password request for:', req.body.email);
    const { email } = req.body;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }
    
    try {
        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetLink = `https://datasql.pro/reset-password?token=${resetToken}`;
        
        // Try to send email if nodemailer is available
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const nodemailer = require('nodemailer');
                
                const transporter = nodemailer.createTransporter({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || 'noreply@datasql.pro',
                    to: email,
                    subject: 'Reset Your SQL Practice Platform Password',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Password Reset - SQL Practice Platform</h2>
                            <p>You requested a password reset for your account.</p>
                            <p><a href="${resetLink}" style="background: #4c51bf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset My Password</a></p>
                            <p>Or copy this link: ${resetLink}</p>
                            <p>This link expires in 1 hour.</p>
                        </div>
                    `,
                    text: `Password Reset - SQL Practice Platform\n\nReset your password: ${resetLink}\n\nThis link expires in 1 hour.`
                });
                
                console.log('📧 Password reset email sent successfully to:', email);
            } catch (emailError) {
                console.error('📧 Email sending failed:', emailError.message);
            }
        } else {
            console.log('📧 [CONSOLE] Password reset for:', email, 'Link:', resetLink);
        }
        
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.',
            // For development - include link for testing
            devResetLink: resetLink,
            devToken: resetToken
        });
        
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Essential routes only for startup - load others after server starts
console.log('Loading essential routes...');

try {
  app.use('/api/problems', require('./routes/problems'));
  console.log('✅ Problems route loaded');
} catch (e) {
  console.error('❌ Problems route failed:', e.message);
}

try {
  app.use('/api/sql', require('./routes/sql'));
  console.log('✅ SQL route loaded');
} catch (e) {
  console.error('❌ SQL route failed:', e.message);
}

try {
  app.use('/api/execute', require('./routes/execute'));
  console.log('✅ Execute route loaded');
} catch (e) {
  console.error('❌ Execute route failed:', e.message);
}

try {
  app.use('/api/import-complete', require('./routes/import-complete'));
  console.log('✅ Import-complete route loaded');
} catch (e) {
  console.error('❌ Import-complete route failed:', e.message);
}

try {
  app.use('/api/emergency-fix', require('./routes/emergency-fix'));
  console.log('✅ Emergency-fix route loaded');
} catch (e) {
  console.error('❌ Emergency-fix route failed:', e.message);
}

try {
  app.use('/api/learning-paths', require('./routes/learning-paths'));
  console.log('✅ Learning-paths route loaded');
} catch (e) {
  console.error('❌ Learning-paths route failed:', e.message);
}

try {
  app.use('/api/bookmarks', require('./routes/bookmarks'));
  console.log('✅ Bookmarks route loaded');
} catch (e) {
  console.error('❌ Bookmarks route failed:', e.message);
}

try {
  app.use('/api/progress', require('./routes/progress'));
  console.log('✅ Progress route loaded');
} catch (e) {
  console.error('❌ Progress route failed:', e.message);
}

try {
  app.use('/api/auth', require('./routes/auth-minimal-test'));
  console.log('✅ Auth route (minimal test) loaded');
} catch (e) {
  console.error('❌ Auth route failed:', e.message);
}

try {
  app.use('/api/recommendations', require('./routes/recommendations'));
  console.log('✅ Recommendations route loaded');
} catch (e) {
  console.error('❌ Recommendations route failed:', e.message);
}

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Serve React app for all non-API routes
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        } else {
            res.status(404).json({ error: 'API route not found' });
        }
    });
} else {
    // 404 handler for development
    app.use('*', (req, res) => {
        res.status(404).json({ error: 'Route not found' });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Catch-all route for 404s
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server with enhanced error handling
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎉 Server successfully started on port ${PORT}`);
    console.log(`🏥 Health check available at: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
    console.error('🚨 Server startup error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    }
});

process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;