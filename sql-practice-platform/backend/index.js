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

// CORS - simplified for startup
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-id');
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
    res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
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
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth route loaded');
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