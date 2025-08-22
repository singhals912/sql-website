const AuthService = require('../services/authService');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'No authorization header provided' 
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Add user info to request
    req.user = {
      userId: decoded.userId,
      iat: decoded.iat
    };

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token has expired' 
      });
    }

    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    req.user = {
      userId: decoded.userId,
      iat: decoded.iat
    };

    next();

  } catch (error) {
    // If token is invalid, just continue without user info
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.optional = optionalAuthMiddleware;