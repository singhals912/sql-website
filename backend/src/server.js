const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { InputValidator, rateLimits } = require('./middleware/inputValidation');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Custom security headers
app.use(InputValidator.securityHeaders);

// General rate limiting for all API requests (temporarily disabled for bookmarks)
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for bookmark endpoints to prevent frontend issues
  if (req.path.includes('/bookmarks/')) {
    return next();
  }
  return rateLimits.general(req, res, next);
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const sqlRoutes = require('./routes/sqlRoutes');
const resetRoute = require('./routes/resetRoute');
const progressRoutes = require('./routes/progressRoutes');
const authRoutes = require('./routes/authRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const searchRoutes = require('./routes/searchRoutes');
const syncRoutes = require('./routes/syncRoutes');
const profileRoutes = require('./routes/profileRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const hintRoutes = require('./routes/hintRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const autocompleteRoutes = require('./routes/autocompleteRoutes');
const queryHistoryRoutes = require('./routes/queryHistoryRoutes');
const explanationRoutes = require('./routes/explanationRoutes');
const PerformanceService = require('./services/performanceService');
const QueryHistoryService = require('./services/queryHistoryService');

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'sql-practice-backend'
  });
});

app.use('/api/sql', sqlRoutes);
app.use('/api/dev', resetRoute);
app.use('/api/progress', progressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', bookmarkRoutes);
app.use('/api', searchRoutes);
app.use('/api', syncRoutes);
app.use('/api', profileRoutes);
app.use('/api', learningPathRoutes);
app.use('/api', hintRoutes);
app.use('/api', performanceRoutes);
app.use('/api', autocompleteRoutes);
app.use('/api', queryHistoryRoutes);
app.use('/api', explanationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`=🚀 Server running on port ${PORT}`);
  console.log(`=🔍 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize performance monitoring schema
  try {
    await PerformanceService.initializeSchema();
    console.log(`=📊 Performance monitoring initialized`);
  } catch (error) {
    console.error('❌ Performance monitoring initialization failed:', error.message);
  }

  // Initialize query history schema
  try {
    await QueryHistoryService.initializeSchema();
    console.log(`=📚 Query history initialized`);
  } catch (error) {
    console.error('❌ Query history initialization failed:', error.message);
  }
});

module.exports = app;