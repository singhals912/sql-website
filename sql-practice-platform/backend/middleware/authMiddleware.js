const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

// Ensure JWT secret exists and is secure
const JWT_SECRET = (() => {
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
        return process.env.JWT_SECRET;
    }
    
    console.warn('⚠️  WARNING: No secure JWT_SECRET found in environment variables!');
    console.warn('⚠️  Using fallback - THIS IS NOT SECURE FOR PRODUCTION!');
    
    // Generate a random secret for this session (better than hardcoded fallback)
    return crypto.randomBytes(64).toString('hex');
})();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database to ensure they still exist and are active
        const userResult = await pool.query(
            'SELECT id, username, email, full_name, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
            return res.status(401).json({ error: 'Invalid or inactive user' });
        }

        // Add user info to request object
        req.user = {
            id: userResult.rows[0].id,
            username: userResult.rows[0].username,
            email: userResult.rows[0].email,
            fullName: userResult.rows[0].full_name
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else {
            console.error('Auth middleware error:', error);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    }
};

// Optional authentication middleware (doesn't fail if no token provided)
const optionalAuthentication = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            req.user = null;
            return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const userResult = await pool.query(
            'SELECT id, username, email, full_name, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
            req.user = {
                id: userResult.rows[0].id,
                username: userResult.rows[0].username,
                email: userResult.rows[0].email,
                fullName: userResult.rows[0].full_name
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // If token verification fails, treat as unauthenticated
        req.user = null;
        next();
    }
};

// Rate limiting middleware for auth endpoints
const authRateLimit = (() => {
    const attempts = new Map(); // In production, use Redis or database
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const key = `${ip}:${req.path}`;
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minutes
        const maxAttempts = req.path.includes('login') ? 5 : 3; // 5 login attempts, 3 for register/forgot-password
        
        // Clean up old entries
        for (const [entryKey, entry] of attempts.entries()) {
            if (now - entry.firstAttempt > windowMs) {
                attempts.delete(entryKey);
            }
        }
        
        let entry = attempts.get(key);
        
        if (!entry) {
            entry = { count: 1, firstAttempt: now };
            attempts.set(key, entry);
            return next();
        }
        
        if (now - entry.firstAttempt > windowMs) {
            // Reset window
            entry.count = 1;
            entry.firstAttempt = now;
            return next();
        }
        
        entry.count++;
        
        if (entry.count > maxAttempts) {
            return res.status(429).json({ 
                error: 'Too many attempts. Please try again later.',
                retryAfter: Math.ceil((windowMs - (now - entry.firstAttempt)) / 1000)
            });
        }
        
        next();
    };
})();

module.exports = {
    authenticateToken,
    optionalAuthentication,
    authRateLimit,
    JWT_SECRET
};