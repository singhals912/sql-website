const express = require('express');
const router = express.Router();

// Simple reset endpoint for development
router.post('/reset-sandbox', async (req, res) => {
  try {
    const { setupDefaultEnvironment } = require('../controllers/sqlController');
    await setupDefaultEnvironment();
    
    res.json({ 
      success: true, 
      message: 'Sandbox environment reset successfully' 
    });
  } catch (error) {
    console.error('Error resetting sandbox:', error);
    res.status(500).json({ error: 'Failed to reset sandbox' });
  }
});

module.exports = router;