const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

// Simple JWT secret setup
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Debug endpoint
router.post('/debug-db', async (req, res) => {
    try {
        console.log('Testing database connection...');
        const result = await pool.query('SELECT NOW() as current_time');
        console.log('Database connection successful:', result.rows[0]);
        res.json({ success: true, dbTime: result.rows[0].current_time });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Simple registration endpoint
router.post('/register', async (req, res) => {
    try {
        console.log('🔵 Registration attempt:', req.body);
        const { username, email, password, fullName } = req.body;
        
        // Basic validation
        if (!email || !password) {
            console.log('❌ Validation failed: missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (password.length < 8) {
            console.log('❌ Validation failed: password too short');
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        console.log('✅ Validation passed');
        
        // Auto-create users table if it doesn't exist
        console.log('🔵 Creating users table if not exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table creation/check completed');
        
        // Check if user exists
        console.log('🔵 Checking if user exists...');
        const userExists = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username || email.split('@')[0]]
        );
        console.log('✅ User existence check completed:', userExists.rows.length, 'existing users found');
        
        if (userExists.rows.length > 0) {
            console.log('❌ User already exists');
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        console.log('🔵 Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed');
        
        // Create user
        console.log('🔵 Creating user...');
        const finalUsername = username || email.split('@')[0];
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING id, username, email, full_name',
            [finalUsername, email, passwordHash, fullName]
        );
        console.log('✅ User created:', result.rows[0]);
        
        const user = result.rows[0];
        
        // Create JWT token
        console.log('🔵 Creating JWT token...');
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        console.log('✅ JWT token created');
        
        const response = {
            success: true,
            message: 'Account created successfully!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        };
        console.log('✅ Sending success response');
        res.status(201).json(response);
    } catch (error) {
        console.error('❌ Registration error:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        if (error.code === '23505') {
            res.status(400).json({ error: 'User already exists' });
        } else {
            res.status(500).json({ 
                error: 'Failed to register user',
                debug: error.message 
            });
        }
    }
});

// Simple login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
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
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
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
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
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