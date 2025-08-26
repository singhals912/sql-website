const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');

console.log('🚀 Loading ADAPTIVE AUTH SYSTEM - v2.0');

// Minimal JWT secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Ultra minimal registration - work with existing table structure
router.post('/register', async (req, res) => {
    try {
        console.log('🔵 ADAPTIVE registration attempt for:', req.body.email);
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
                console.log('✅ User existence check:', userExists.rows?.length || 0, 'existing users');
            } else {
                console.log('❌ No email column found, attempting to add missing columns...');
                
                // Try to add missing columns to existing table
                try {
                    if (!columns.includes('email')) {
                        console.log('🔧 Adding email column...');
                        await pool.query('ALTER TABLE users ADD COLUMN email VARCHAR(255)');
                    }
                    if (!columns.includes('password_hash') && !columns.includes('password')) {
                        console.log('🔧 Adding password_hash column...');
                        await pool.query('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)');
                    }
                    if (!columns.includes('username')) {
                        console.log('🔧 Adding username column...');
                        await pool.query('ALTER TABLE users ADD COLUMN username VARCHAR(50)');
                    }
                    if (!columns.includes('full_name')) {
                        console.log('🔧 Adding full_name column...');
                        await pool.query('ALTER TABLE users ADD COLUMN full_name VARCHAR(255)');
                    }
                    
                    console.log('✅ Missing columns added, retrying registration...');
                    
                    // Now proceed with registration
                    const userExists = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
                    if (userExists.rows && userExists.rows.length > 0) {
                        return res.status(400).json({ error: 'User already exists' });
                    }
                    
                } catch (alterError) {
                    console.log('❌ Cannot alter table, using new table approach:', alterError.message);
                    
                    // If we can't alter, create a new table with different name
                    try {
                        console.log('🏗️ Creating app_users table as fallback...');
                        await pool.query(`
                            CREATE TABLE app_users (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                username VARCHAR(50) UNIQUE NOT NULL,
                                email VARCHAR(255) UNIQUE NOT NULL,
                                password_hash VARCHAR(255) NOT NULL,
                                full_name VARCHAR(255),
                                is_active BOOLEAN DEFAULT true,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                            )
                        `);
                        
                        // Update all subsequent queries to use app_users
                        const passwordHash = await bcrypt.hash(password, 10);
                        const finalUsername = username || email.split('@')[0];
                        
                        await pool.query(
                            'INSERT INTO app_users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                            [finalUsername, email, passwordHash, fullName]
                        );
                        
                        const result = await pool.query(
                            'SELECT id, username, email, full_name FROM app_users WHERE email = ? ORDER BY id DESC LIMIT 1',
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
                        
                    } catch (newTableError) {
                        console.log('❌ All table solutions failed');
                        return res.status(500).json({ 
                            error: 'Cannot create compatible table structure',
                            availableColumns: columns,
                            details: newTableError.message
                        });
                    }
                }
            }
            
            if (userExists.rows && userExists.rows.length > 0) {
                console.log('❌ User already exists');
                return res.status(400).json({ error: 'User already exists' });
            }
            
            // Hash password
            console.log('🔒 Hashing password...');
            const passwordHash = await bcrypt.hash(password, 10);
            
            // Insert new user - adapt to existing table structure
            const finalUsername = username || email.split('@')[0];
            console.log('📝 Inserting user with username:', finalUsername);
            
            if (columns.includes('username') && columns.includes('password_hash')) {
                console.log('✅ Using standard column structure');
                await pool.query(
                    'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
                    [finalUsername, email, passwordHash, fullName]
                );
            } else if (columns.includes('password')) {
                console.log('✅ Using alternative password column');
                await pool.query(
                    'INSERT INTO users (username, email, password, full_name) VALUES (?, ?, ?, ?)',
                    [finalUsername, email, passwordHash, fullName]
                );
            } else {
                console.log('❌ Cannot determine how to insert user with columns:', columns);
                return res.status(500).json({ error: 'Cannot adapt to table structure', columns });
            }
            
            console.log('📋 Retrieving created user...');
            // Get the created user
            const result = await pool.query(
                `SELECT ${idColumn}, username, email, full_name FROM users WHERE email = ? ORDER BY ${idColumn} DESC LIMIT 1`,
                [email]
            );
            
            if (!result.rows || result.rows.length === 0) {
                console.log('❌ User created but not found');
                return res.status(500).json({ error: 'User created but not found' });
            }
            
            const user = result.rows[0];
            console.log('✅ User created successfully:', user);
            
            // Create JWT token
            console.log('🎫 Creating JWT token...');
            const token = jwt.sign(
                { userId: user[idColumn], username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            console.log('🎉 Registration successful for:', email);
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
            console.log('❌ No users table exists, creating new one...', tableError.message);
            
            // Create fresh table with MySQL syntax (most common on Railway)
            console.log('🏗️ Creating new users table...');
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
            console.log('✅ Users table created successfully');
            
            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            const finalUsername = username || email.split('@')[0];
            
            // Insert user
            console.log('👤 Inserting first user...');
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
            console.log('✅ First user created:', user);
            
            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            console.log('🎉 Registration successful with new table for:', email);
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
        console.error('💥 ADAPTIVE registration error:', error);
        console.error('💥 Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Registration failed',
            debug: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Basic login
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login attempt for:', req.body.email);
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
            console.log('Trying without is_active filter...');
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
        
        console.log('Using columns - ID:', idColumn, 'Password:', passwordColumn);
        
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
        
        console.log('✅ Login successful for:', email);
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

console.log('✅ ADAPTIVE AUTH SYSTEM loaded successfully');
module.exports = router;