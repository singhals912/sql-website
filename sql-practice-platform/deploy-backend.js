// Quick backend deployment script
// This will help deploy the backend to a working service

const express = require('express');
const app = express();

// Import our working backend
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());
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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Import working routes
try {
  app.use('/api/problems', require('./backend/routes/problems'));
  app.use('/api/sql', require('./backend/routes/sql'));  
  app.use('/api/execute', require('./backend/routes/execute'));
  console.log('✅ All routes loaded');
} catch (e) {
  console.error('Route loading error:', e);
}

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});

module.exports = app;