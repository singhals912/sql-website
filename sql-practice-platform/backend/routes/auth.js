const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        
        // Check if user exists
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Create user (generate username from email if not provided)
        const finalUsername = username || email.split('@')[0];
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name',
            [finalUsername, email, passwordHash, fullName]
        );
        
        const user = result.rows[0];
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            },
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const result = await pool.query(
            'SELECT id, username, email, password_hash, full_name, is_active FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        if (!user.is_active) {
            return res.status(400).json({ error: 'Account is disabled' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Validate token
router.get('/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        // Get user data
        const result = await pool.query(
            'SELECT id, username, email, full_name, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = result.rows[0];
        
        res.json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;