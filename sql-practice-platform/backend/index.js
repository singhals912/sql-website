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
        version: 'v2.4-debug-email-config',
        emailConfig: {
            hasSmtpHost: !!process.env.SMTP_HOST,
            hasSmtpUser: !!process.env.SMTP_USER,
            hasSmtpPass: !!process.env.SMTP_PASS,
            smtpHost: process.env.SMTP_HOST || 'NOT_SET',
            emailFrom: process.env.EMAIL_FROM || 'NOT_SET'
        }
    });
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

// Temporarily disabled due to syntax conflicts
// try {
//   app.use('/api/emergency-fix', require('./routes/emergency-fix'));
//   console.log('✅ Emergency-fix route loaded');
// } catch (e) {
//   console.error('❌ Emergency-fix route failed:', e.message);
// }

try {
  app.use('/api/learning-paths', require('./routes/learning-paths'));
  console.log('✅ Learning-paths route loaded');
} catch (e) {
  console.error('❌ Learning-paths route failed:', e.message);
}

try {
  app.use('/api/learning', require('./routes/learning'));
  console.log('✅ Learning route loaded');
} catch (e) {
  console.error('❌ Learning route failed:', e.message);
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
  const authRoute = require('./routes/auth-minimal-test');
  app.use('/api/auth', authRoute);
  console.log('✅ Auth route (minimal test with SendGrid) loaded');
} catch (e) {
  console.error('❌ Auth route failed:', e.message);
}

try {
  app.use('/api/recommendations', require('./routes/recommendations'));
  console.log('✅ Recommendations route loaded');
} catch (e) {
  console.error('❌ Recommendations route failed:', e.message);
}

try {
  app.use('/api/fix', require('./routes/fix-problems-1-10'));
  console.log('✅ Fix problems 1-10 route loaded');
} catch (e) {
  console.error('❌ Fix problems 1-10 route failed:', e.message);
}

try {
  app.use('/api/fix', require('./routes/fix-problems-11-20'));
  console.log('✅ Fix problems 11-20 route loaded');
} catch (e) {
  console.error('❌ Fix problems 11-20 route failed:', e.message);
}

try {
  app.use('/api/fix', require('./routes/fix-problems-21-30'));
  console.log('✅ Fix problems 21-30 route loaded');
} catch (e) {
  console.error('❌ Fix problems 21-30 route failed:', e.message);
}

try {
  app.use('/api/fix', require('./routes/fix-problems-31-40'));
  console.log('✅ Fix problems 31-40 route loaded');
} catch (e) {
  console.error('❌ Fix problems 31-40 route failed:', e.message);
}

try {
  app.use('/api/fix', require('./routes/fix-problems-31-40-content'));
  console.log('✅ Fix problems 31-40 content route loaded');
} catch (e) {
  console.error('❌ Fix problems 31-40 content route failed:', e.message);
}

try {
  app.use('/api/emergency', require('./routes/emergency-schema-recovery'));
  console.log('✅ Emergency schema recovery route loaded');
} catch (e) {
  console.error('❌ Emergency schema recovery route failed:', e.message);
}

try {
  app.use('/api/emergency', require('./routes/emergency-schemas-51-60'));
  console.log('✅ Emergency schemas 51-60 route loaded');
} catch (e) {
  console.error('❌ Emergency schemas 51-60 route failed:', e.message);
}

try {
  app.use('/api/fix-advanced', require('./routes/fix-advanced-problems'));
  console.log('✅ Fix advanced problems route loaded');
} catch (e) {
  console.error('❌ Fix advanced problems route failed:', e.message);
}

try {
  app.use('/api/fix-batch1', require('./routes/fix-remaining-problems-batch1'));
  console.log('✅ Fix remaining problems batch 1 route loaded');
} catch (e) {
  console.error('❌ Fix remaining problems batch 1 route failed:', e.message);
}

try {
  app.use('/api/fix-batch2', require('./routes/fix-remaining-problems-batch2'));
  console.log('✅ Fix remaining problems batch 2 route loaded');
} catch (e) {
  console.error('❌ Fix remaining problems batch 2 route failed:', e.message);
}

try {
  app.use('/api/fix-batch3', require('./routes/fix-remaining-problems-batch3'));
  console.log('✅ Fix remaining problems batch 3 route loaded');
} catch (e) {
  console.error('❌ Fix remaining problems batch 3 route failed:', e.message);
}

try {
  app.use('/api/fix-final', require('./routes/fix-final-problems'));
  console.log('✅ Fix final problems route loaded');
} catch (e) {
  console.error('❌ Fix final problems route failed:', e.message);
}

try {
  app.use('/api/fix-schemas', require('./routes/fix-schemas-comprehensive'));
  console.log('✅ Fix schemas comprehensive route loaded');
} catch (e) {
  console.error('❌ Fix schemas comprehensive route failed:', e.message);
}

try {
  app.use('/api/fix-problems-61-70-schemas', require('./routes/fix-problems-61-70-schemas'));
  console.log('✅ Fix problems 61-70 schemas route loaded');
} catch (e) {
  console.error('❌ Fix problems 61-70 schemas route failed:', e.message);
}

try {
  app.use('/api/debug', require('./routes/debug-schemas'));
  console.log('✅ Debug schemas route loaded');
} catch (e) {
  console.error('❌ Debug schemas route failed:', e.message);
}

try {
  app.use('/api/urgent', require('./routes/urgent-schema-fix'));
  console.log('✅ Urgent schema fix route loaded');
} catch (e) {
  console.error('❌ Urgent schema fix route failed:', e.message);
}

try {
  app.use('/api/debug', require('./routes/debug-problem-65'));
  console.log('✅ Debug Problem 65 route loaded');
} catch (e) {
  console.error('❌ Debug Problem 65 route failed:', e.message);
}

try {
  app.use('/api/uuid-fix', require('./routes/uuid-schema-fix'));
  console.log('✅ UUID Schema Fix route loaded');
} catch (e) {
  console.error('❌ UUID Schema Fix route failed:', e.message);
}

try {
  app.use('/api/debug-db', require('./routes/debug-db-structure'));
  console.log('✅ Debug DB Structure route loaded');
} catch (e) {
  console.error('❌ Debug DB Structure route failed:', e.message);
}

try {
  app.use('/api/direct-fix', require('./routes/direct-sql-fix'));
  console.log('✅ Direct SQL Fix route loaded');
} catch (e) {
  console.error('❌ Direct SQL Fix route failed:', e.message);
}

try {
  app.use('/api/systematic', require('./routes/systematic-problem-fix'));
  console.log('✅ Systematic Problem Fix route loaded');
} catch (e) {
  console.error('❌ Systematic Problem Fix route failed:', e.message);
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