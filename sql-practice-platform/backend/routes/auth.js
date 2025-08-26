const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

console.log('🚀 Loading FIXED ADAPTIVE AUTH SYSTEM');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Registration endpoint
router.post('/register', async (req, res) => {
    try {
        console.log('🔵 Registration attempt for:', req.body.email);
        const { username, email, password, fullName } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        
        // Try to inspect existing users table
        try {
            console.log('🔍 Checking existing users table...');
            const existingUsers = await pool.query('SELECT * FROM users LIMIT 1');
            const columns = existingUsers.rows[0] ? Object.keys(existingUsers.rows[0]) : [];
            console.log('✅ Found users table with columns:', columns);
            
            // If the table doesn't have email column, it's incompatible - use app_users instead
            if (!columns.includes('email')) {
                console.log('❌ Users table missing email column. Creating app_users table...');
                throw new Error('Incompatible table structure');
            }
            
            // Users table has email - use it
            const idColumn = columns.includes('id') ? 'id' : 
                            columns.includes('user_id') ? 'user_id' :
                            columns[0];
            
            console.log('✅ Using users table with ID column:', idColumn);
            
            // Check if user exists
            const userExists = await pool.query(`SELECT ${idColumn} FROM users WHERE email = $1`, [email]);
            if (userExists.rows && userExists.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists' });
            }
            
            // Hash password and create user in existing users table
            const passwordHash = await bcrypt.hash(password, 10);
            const finalUsername = username || email.split('@')[0];
            
            await pool.query(
                'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4)',
                [finalUsername, email, passwordHash, fullName]
            );
            
            const result = await pool.query(
                `SELECT ${idColumn}, username, email, full_name FROM users WHERE email = $1 ORDER BY ${idColumn} DESC LIMIT 1`,
                [email]
            );
            
            const user = result.rows[0];
            const token = jwt.sign(
                { userId: user[idColumn], username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            console.log('🎉 Registration successful with users table');
            return res.status(201).json({
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
            console.log('❌ Users table issue:', tableError.message);
            console.log('🏗️ Creating app_users table as fallback...');
            
            // Create app_users table
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS app_users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(255),
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);
                
                // Check if user exists in app_users
                const appUserExists = await pool.query('SELECT id FROM app_users WHERE email = $1', [email]);
                if (appUserExists.rows && appUserExists.rows.length > 0) {
                    return res.status(400).json({ error: 'User already exists' });
                }
                
                // Hash password and create user in app_users
                const passwordHash = await bcrypt.hash(password, 10);
                const finalUsername = username || email.split('@')[0];
                
                await pool.query(
                    'INSERT INTO app_users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4)',
                    [finalUsername, email, passwordHash, fullName]
                );
                
                const result = await pool.query(
                    'SELECT id, username, email, full_name FROM app_users WHERE email = $1 ORDER BY id DESC LIMIT 1',
                    [email]
                );
                
                const user = result.rows[0];
                const token = jwt.sign(
                    { userId: user.id, username: user.username, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );
                
                console.log('🎉 Registration successful with app_users table');
                return res.status(201).json({
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
                
            } catch (appUsersError) {
                console.error('❌ Failed to create app_users table:', appUsersError);
                return res.status(500).json({ 
                    error: 'Failed to create user account',
                    debug: appUsersError.message
                });
            }
        }
        
    } catch (error) {
        console.error('💥 Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed',
            debug: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login attempt for:', req.body.email);
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Try both tables: users and app_users
        let result = null;
        let tableName = '';
        
        try {
            result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            tableName = 'users';
            if (!result.rows || result.rows.length === 0) {
                result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
                tableName = 'app_users';
            }
        } catch (selectError) {
            result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
            tableName = 'app_users';
        }
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
        const passwordColumn = Object.keys(user).includes('password_hash') ? 'password_hash' : 'password';
        
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
        
        console.log('✅ Login successful for:', email, 'from table:', tableName);
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

// Validate token endpoint
router.get('/validate', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Try both tables
        let result = null;
        try {
            result = await pool.query('SELECT * FROM users WHERE id = $1 OR user_id = $1', [decoded.userId]);
            if (!result.rows || result.rows.length === 0) {
                result = await pool.query('SELECT * FROM app_users WHERE id = $1', [decoded.userId]);
            }
        } catch (selectError) {
            result = await pool.query('SELECT * FROM app_users WHERE id = $1', [decoded.userId]);
        }
        
        if (!result.rows || result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        const user = result.rows[0];
        const idColumn = Object.keys(user).includes('id') ? 'id' : 'user_id';
        
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

console.log('✅ FIXED ADAPTIVE AUTH SYSTEM loaded successfully');
module.exports = router;