const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// CRITICAL: Validate environment security before starting server
const { validation } = require('./config/environment');
if (!validation.isValid) {
  console.error('🚨 Server startup blocked due to security issues');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting - Very generous limits for development
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5000 // limit each IP to 5000 requests per minute
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/problems', require('./routes/problems-learning-paths'));
app.use('/api/users', require('./routes/users'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/sql', require('./routes/sql'));
app.use('/api/learning-paths', require('./routes/learning-paths'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/monitor', require('./routes/monitor'));
app.use('/api/migrate', require('./routes/migrate'));
app.use('/api/migrate-simple', require('./routes/migrate-simple'));
app.use('/api/migrate-data', require('./routes/migrate-data'));
app.use('/api/migrate-full', require('./routes/migrate-full'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

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
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;