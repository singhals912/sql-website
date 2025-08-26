const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

// Minimal JWT secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Ultra minimal registration - work with existing table structure
router.post('/register', async (req, res) => {
    try {
        console.log('🔵 Minimal registration attempt');
        const { username, email, password, fullName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        console.log('🔍 Checking what users table looks like...');
        
        // First, let's see what the existing users table structure is
        try {
            const existingUsers = await pool.query('SELECT * FROM users LIMIT 1');
            const columns = existingUsers.rows[0] ? Object.keys(existingUsers.rows[0]) : [];
            console.log('✅ Found users table with columns:', columns);
            
            // Check if user already exists using whatever ID column is available
            const idColumn = columns.includes('id') ? 'id' : 
                            columns.includes('user_id') ? 'user_id' :
                            columns.includes('ID') ? 'ID' : 
                            columns[0]; // Use first column as fallback
                            
            console.log('🔍 Using ID column:', idColumn);
            
            // Try to find existing user
            let userExists;
            if (columns.includes('email')) {
                userExists = await pool.query(`SELECT ${idColumn} FROM users WHERE email = ?`, [email]);
            } else {
                console.log('❌ No email column found, cannot check for existing users');
                return res.status(500).json({ error: 'Database table structure incompatible' });
            }
            
            if (userExists.rows && userExists.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
            
            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            
            // Insert new user - adapt to existing table structure
            const finalUsername = username || email.split('@')[0];
            
            if (columns.includes('username') && columns.includes('password_hash')) {
                // Standard structure
                await pool.query(
                    'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                    [finalUsername, email, passwordHash, fullName]
                );
            } else if (columns.includes('password')) {
                // Different password column name
                await pool.query(
                    'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
                    [finalUsername, email, passwordHash, fullName]
                );
            } else {
                console.log('❌ Cannot determine how to insert user with columns:', columns);
                return res.status(500).json({ error: 'Cannot adapt to table structure', columns });
            }
            
            // Get the created user
            const result = await pool.query(
                `SELECT ${idColumn}, username, email, full_name FROM users WHERE email = ? ORDER BY ${idColumn} DESC LIMIT 1`,
                [email]
            );
            
            if (!result.rows || result.rows.length === 0) {
                return res.status(500).json({ error: 'User created but not found' });
            }
            
            const user = result.rows[0];
            
            // Create JWT token
            const token = jwt.sign(
                { userId: user[idColumn], username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            res.status(201).json({
                success: true,
                message: 'Account created successfully!',
                token,
                user: {
                    id: user[idColumn],
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name
                }
            });
            
        } catch (tableError) {
            console.log('❌ No users table exists, creating new one...');
            
            // Create fresh table with MySQL syntax (most common on Railway)
            await pool.query(`
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            const finalUsername = username || email.split('@')[0];
            
            // Insert user
            await pool.query(
                'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                [finalUsername, email, passwordHash, fullName]
            );
            
            // Get the created user
            const result = await pool.query(
                'SELECT id, username, email, full_name FROM users WHERE email = ? ORDER BY id DESC LIMIT 1',
                [email]
            );
            
            const user = result.rows[0];
            
            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            res.status(201).json({
                success: true,
                message: 'Account created successfully!',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    fullName: user.full_name
                }
            });
        }
    } catch (error) {
        console.error('❌ Minimal registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed',
            debug: error.message,
            stack: error.stack
        });
    }
});

// Basic login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Get user with flexible column detection
        let result;
        try {
            result = await pool.query(
                'SELECT * FROM users WHERE email = ? AND is_active = true',
                [email]
            );
        } catch (selectError) {
            result = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
        }
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const columns = Object.keys(user);
        const idColumn = columns.includes('id') ? 'id' : 
                        columns.includes('user_id') ? 'user_id' :
                        columns.includes('ID') ? 'ID' : 
                        columns[0];
        const passwordColumn = columns.includes('password_hash') ? 'password_hash' : 'password';
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user[passwordColumn]);
        
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user[idColumn], username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user[idColumn],
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
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
        
        // Get user data with flexible columns
        const result = await pool.query('SELECT * FROM users WHERE id = ? OR user_id = ? OR ID = ?', [decoded.userId, decoded.userId, decoded.userId]);
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = result.rows[0];
        const columns = Object.keys(user);
        const idColumn = columns.includes('id') ? 'id' : columns.includes('user_id') ? 'user_id' : columns[0];
        
        res.json({
            valid: true,
            user: {
                id: user[idColumn],
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
    } catch (error) {
        console.error('❌ Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;