const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Fix Problem 61: UBS Private Banking - Add Schema
router.post('/fix-schema-61', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 61: UBS Private Banking...');
        
        const setupSql = `-- UBS Private Banking Database
CREATE TABLE ubs_private_banking (
    client_id INTEGER,
    client_segment VARCHAR(50),
    portfolio_value DECIMAL(15,2),
    investment_strategy VARCHAR(100),
    portfolio_return DECIMAL(6,4),
    market_benchmark DECIMAL(6,4),
    risk_free_rate DECIMAL(5,4),
    portfolio_volatility DECIMAL(6,4),
    diversification_score DECIMAL(4,2),
    alternative_allocation_pct DECIMAL(5,2),
    client_satisfaction_score DECIMAL(3,2)
);

-- Sample UBS Private Banking data
INSERT INTO ubs_private_banking VALUES
(1, 'Ultra High Net Worth', 85000000, 'Alternative Investments', 0.1250, 0.0850, 0.0200, 0.0920, 9.2, 35.5, 9.5),
(2, 'Ultra High Net Worth', 120000000, 'Growth Equity', 0.1180, 0.0850, 0.0200, 0.0850, 8.8, 28.0, 9.1),
(3, 'Family Office', 250000000, 'Diversified Alpha', 0.1320, 0.0850, 0.0200, 0.0780, 9.5, 42.0, 9.8),
(4, 'Ultra High Net Worth', 75000000, 'Private Equity Focus', 0.1410, 0.0850, 0.0200, 0.0950, 8.9, 45.0, 9.3),
(5, 'Family Office', 180000000, 'Hedge Fund Platform', 0.1380, 0.0850, 0.0200, 0.0820, 9.1, 38.5, 9.6),
(6, 'Ultra High Net Worth', 95000000, 'ESG Impact', 0.1150, 0.0850, 0.0200, 0.0880, 8.7, 25.0, 8.9);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 61');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 61 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 61:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 61', details: error.message });
    }
});

// Fix Problem 62: Uber Ride-Sharing Market Analytics - Add Schema
router.post('/fix-schema-62', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 62: Uber Market Analytics...');
        
        const setupSql = `-- Uber Market Analytics Database
CREATE TABLE uber_rides (
    ride_id INTEGER,
    market_name VARCHAR(50),
    service_type VARCHAR(30),
    ride_distance_km DECIMAL(8,2),
    ride_duration_minutes INTEGER,
    ride_revenue DECIMAL(8,2),
    driver_earnings DECIMAL(8,2),
    surge_multiplier DECIMAL(4,2),
    ride_date DATE
);

-- Sample Uber ride data
INSERT INTO uber_rides VALUES
(1, 'San Francisco', 'UberX', 8.5, 25, 18.50, 13.88, 1.2, '2024-06-01'),
(2, 'San Francisco', 'UberPool', 12.2, 35, 12.80, 9.60, 1.0, '2024-06-01'),
(3, 'New York', 'UberBlack', 6.8, 20, 24.00, 18.00, 1.5, '2024-06-01'),
(4, 'New York', 'UberX', 15.3, 42, 22.50, 16.88, 1.3, '2024-06-01'),
(5, 'Los Angeles', 'UberX', 18.7, 38, 16.20, 12.15, 1.1, '2024-06-01'),
(6, 'San Francisco', 'UberBlack', 4.2, 15, 19.50, 14.63, 1.0, '2024-06-01');`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 62');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 62 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 62:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 62', details: error.message });
    }
});

// Fix Problem 65: Vanguard Index Fund Analytics - Add Schema
router.post('/fix-schema-65', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 65: Vanguard Index Fund Analytics...');
        
        const setupSql = `-- Vanguard Index Fund Performance Database
CREATE TABLE vanguard_index_funds (
    fund_symbol VARCHAR(10),
    fund_name VARCHAR(100),
    benchmark_index VARCHAR(100),
    trade_date DATE,
    fund_nav DECIMAL(10,4),
    benchmark_value DECIMAL(10,4),
    tracking_error_bp DECIMAL(6,2),
    fund_aum_billions DECIMAL(8,2),
    expense_ratio_bp DECIMAL(6,2)
);

-- Sample Vanguard fund data  
INSERT INTO vanguard_index_funds VALUES
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-01-01', 245.82, 245.95, 8.5, 1250.5, 3.0),
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-02-01', 251.34, 251.41, 7.2, 1260.8, 3.0),
('VTI', 'Total Stock Market ETF', 'CRSP US Total Market', '2024-03-01', 248.67, 248.80, 9.1, 1245.2, 3.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-01-01', 28.45, 28.52, 12.8, 580.3, 11.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-02-01', 29.12, 29.18, 11.4, 585.7, 11.0),
('VTIAX', 'Total International Stock', 'FTSE Global All Cap ex US', '2024-03-01', 28.89, 28.96, 13.2, 582.1, 11.0);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 65');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 65 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 65:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 65', details: error.message });
    }
});

// Fix Problem 69: YouTube Creator Monetization - Add Schema
router.post('/fix-schema-69', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 69: YouTube Creator Monetization...');
        
        const setupSql = `-- YouTube Creator Monetization Database
CREATE TABLE youtube_creators (
    creator_id INTEGER,
    content_category VARCHAR(50),
    subscriber_count INTEGER,
    monthly_views INTEGER,
    watch_time_hours DECIMAL(12,2),
    ad_revenue DECIMAL(10,2),
    membership_revenue DECIMAL(10,2),
    super_chat_revenue DECIMAL(8,2),
    sponsored_content_revenue DECIMAL(10,2)
);

-- Sample YouTube creator data
INSERT INTO youtube_creators VALUES
(1, 'Finance', 245000, 1800000, 28800, 7200, 850, 180, 2500),
(2, 'Finance', 180000, 1200000, 18500, 6800, 920, 220, 3200),
(3, 'Technology', 320000, 2200000, 31200, 5500, 1200, 380, 4800),
(4, 'Technology', 280000, 1950000, 29800, 6200, 980, 290, 4100),
(5, 'Gaming', 150000, 850000, 15200, 2800, 450, 680, 1200),
(6, 'Lifestyle', 220000, 1100000, 19800, 3200, 580, 150, 1800);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 69');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 69 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 69:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 69', details: error.message });
    }
});

// Fix Problem 63: Tesla Energy Storage Analytics - Add Schema
router.post('/fix-schema-63', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 63: Tesla Energy Storage...');
        
        const setupSql = `-- Tesla Energy Storage Analytics Database
CREATE TABLE tesla_energy_storage (
    installation_id INTEGER,
    project_type VARCHAR(50),
    location VARCHAR(50),
    battery_capacity_mwh DECIMAL(8,2),
    energy_discharged_mwh DECIMAL(8,2),
    grid_revenue DECIMAL(10,2),
    efficiency_rating DECIMAL(4,2),
    installation_date DATE,
    grid_stability_score DECIMAL(4,2)
);

-- Sample Tesla energy storage data
INSERT INTO tesla_energy_storage VALUES
(1, 'Utility Scale', 'California', 129.6, 118.2, 285000, 95.8, '2023-03-15', 9.2),
(2, 'Commercial', 'Texas', 25.4, 23.1, 58500, 94.2, '2023-05-20', 8.9),
(3, 'Utility Scale', 'Australia', 194.5, 180.8, 420000, 96.1, '2023-01-10', 9.5),
(4, 'Commercial', 'New York', 15.8, 14.5, 35200, 93.8, '2023-07-08', 8.7),
(5, 'Residential', 'Florida', 2.1, 1.9, 4800, 92.5, '2023-09-12', 8.4),
(6, 'Utility Scale', 'Nevada', 165.2, 152.4, 380000, 95.3, '2023-02-28', 9.1);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 63');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 63 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 63:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 63', details: error.message });
    }
});

// Fix Problem 64: Airbnb Host Revenue Analytics - Add Schema
router.post('/fix-schema-64', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 64: Airbnb Host Revenue...');
        
        const setupSql = `-- Airbnb Host Revenue Analytics Database
CREATE TABLE airbnb_hosts (
    host_id INTEGER,
    property_type VARCHAR(50),
    neighborhood VARCHAR(50),
    listing_count INTEGER,
    avg_nightly_rate DECIMAL(8,2),
    occupancy_rate DECIMAL(5,2),
    monthly_revenue DECIMAL(10,2),
    guest_rating DECIMAL(3,2),
    superhust_status BOOLEAN
);

-- Sample Airbnb host data
INSERT INTO airbnb_hosts VALUES
(1, 'Entire Apartment', 'Manhattan', 3, 245.00, 0.85, 18750, 4.8, true),
(2, 'Private Room', 'Brooklyn', 2, 125.00, 0.78, 5850, 4.6, false),
(3, 'Entire House', 'Los Angeles', 1, 320.00, 0.72, 6912, 4.9, true),
(4, 'Entire Apartment', 'San Francisco', 2, 280.00, 0.80, 13440, 4.7, true),
(5, 'Private Room', 'Miami', 1, 95.00, 0.68, 1938, 4.4, false),
(6, 'Entire House', 'Austin', 1, 185.00, 0.75, 4162.5, 4.8, false);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 64');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 64 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 64:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 64', details: error.message });
    }
});

// Fix Problem 66: Spotify Music Streaming Analytics - Add Schema
router.post('/fix-schema-66', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 66: Spotify Music Streaming...');
        
        const setupSql = `-- Spotify Music Streaming Analytics Database
CREATE TABLE spotify_streams (
    track_id INTEGER,
    artist_name VARCHAR(100),
    genre VARCHAR(50),
    monthly_streams INTEGER,
    skip_rate DECIMAL(5,2),
    playlist_additions INTEGER,
    user_rating DECIMAL(3,2),
    release_date DATE,
    label VARCHAR(100)
);

-- Sample Spotify streaming data
INSERT INTO spotify_streams VALUES
(1, 'Taylor Swift', 'Pop', 125000000, 0.12, 450000, 4.8, '2023-10-27', 'Republic Records'),
(2, 'Bad Bunny', 'Reggaeton', 98000000, 0.08, 380000, 4.7, '2023-01-13', 'Rimas Entertainment'),
(3, 'Drake', 'Hip Hop', 87000000, 0.15, 320000, 4.5, '2023-06-16', 'OVO Sound'),
(4, 'The Weeknd', 'R&B', 72000000, 0.11, 285000, 4.6, '2023-03-24', 'XO'),
(5, 'Dua Lipa', 'Pop', 65000000, 0.13, 240000, 4.4, '2023-05-05', 'Warner Records'),
(6, 'Olivia Rodrigo', 'Pop', 58000000, 0.09, 220000, 4.7, '2023-09-08', 'Geffen Records');`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 66');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 66 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 66:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 66', details: error.message });
    }
});

// Fix Problem 67: Netflix Content Performance Analytics - Add Schema
router.post('/fix-schema-67', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 67: Netflix Content Performance...');
        
        const setupSql = `-- Netflix Content Performance Analytics Database
CREATE TABLE netflix_content (
    content_id INTEGER,
    title VARCHAR(100),
    content_type VARCHAR(20),
    genre VARCHAR(50),
    release_date DATE,
    total_hours_watched BIGINT,
    completion_rate DECIMAL(5,2),
    user_rating DECIMAL(3,2),
    production_budget DECIMAL(12,2),
    global_reach_countries INTEGER
);

-- Sample Netflix content data
INSERT INTO netflix_content VALUES
(1, 'Wednesday', 'Series', 'Horror Comedy', '2022-11-23', 1650000000, 0.78, 4.6, 75000000, 94),
(2, 'Stranger Things 4', 'Series', 'Sci-Fi', '2022-05-27', 1350000000, 0.82, 4.8, 30000000, 83),
(3, 'Glass Onion', 'Movie', 'Mystery', '2022-12-23', 820000000, 0.74, 4.2, 40000000, 78),
(4, 'The Night Agent', 'Series', 'Thriller', '2023-03-23', 1200000000, 0.71, 4.1, 35000000, 88),
(5, 'Red Notice', 'Movie', 'Action', '2021-11-12', 950000000, 0.68, 3.9, 200000000, 92),
(6, 'Squid Game', 'Series', 'Thriller', '2021-09-17', 1800000000, 0.85, 4.9, 21400000, 94);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 67');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 67 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 67:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 67', details: error.message });
    }
});

// Fix Problem 68: Amazon Prime Video Analytics - Add Schema
router.post('/fix-schema-68', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 68: Amazon Prime Video...');
        
        const setupSql = `-- Amazon Prime Video Analytics Database
CREATE TABLE amazon_prime_video (
    content_id INTEGER,
    title VARCHAR(100),
    content_type VARCHAR(20),
    genre VARCHAR(50),
    prime_exclusive BOOLEAN,
    monthly_views INTEGER,
    average_watch_time_minutes INTEGER,
    user_rating DECIMAL(3,2),
    subscription_impact_score DECIMAL(4,2),
    advertising_revenue DECIMAL(10,2)
);

-- Sample Amazon Prime Video data
INSERT INTO amazon_prime_video VALUES
(1, 'The Boys', 'Series', 'Superhero', true, 45000000, 52, 4.7, 9.2, 15000000),
(2, 'The Marvelous Mrs. Maisel', 'Series', 'Comedy-Drama', true, 28000000, 48, 4.6, 8.8, 8500000),
(3, 'Jack Ryan', 'Series', 'Action Thriller', true, 38000000, 45, 4.3, 8.5, 12000000),
(4, 'The Terminal List', 'Series', 'Thriller', true, 32000000, 50, 4.1, 8.2, 9800000),
(5, 'Citadel', 'Series', 'Spy Thriller', true, 25000000, 55, 3.9, 7.8, 18500000),
(6, 'Air', 'Movie', 'Biography', false, 18000000, 118, 4.4, 7.5, 5200000);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 68');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 68 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 68:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 68', details: error.message });
    }
});

// Fix Problem 70: Zoom Video Conferencing Analytics - Add Schema
router.post('/fix-schema-70', async (req, res) => {
    try {
        console.log('🔧 Adding schema for Problem 70: Zoom Video Analytics...');
        
        const setupSql = `-- Zoom Video Conferencing Analytics Database
CREATE TABLE zoom_meetings (
    meeting_id INTEGER,
    organization_type VARCHAR(50),
    meeting_type VARCHAR(50),
    host_plan_type VARCHAR(30),
    participant_count INTEGER,
    meeting_duration_minutes INTEGER,
    video_quality_score DECIMAL(4,2),
    audio_quality_score DECIMAL(4,2),
    connection_stability_score DECIMAL(4,2),
    screen_share_usage_pct DECIMAL(5,2),
    chat_messages_count INTEGER
);

-- Sample Zoom meeting data
INSERT INTO zoom_meetings VALUES
(1, 'Enterprise', 'Team Meeting', 'Pro', 8, 45, 9.2, 9.5, 8.9, 75.5, 12),
(2, 'Enterprise', 'Team Meeting', 'Pro', 9, 42, 9.1, 9.3, 9.0, 68.2, 8),
(3, 'Education', 'Class', 'Education', 25, 60, 8.8, 8.9, 8.7, 85.0, 45),
(4, 'Education', 'Class', 'Education', 28, 58, 8.7, 8.8, 8.6, 82.3, 38),
(5, 'Healthcare', 'Consultation', 'Pro', 3, 30, 9.5, 9.6, 9.4, 15.0, 2),
(6, 'Small Business', 'Client Meeting', 'Basic', 5, 35, 8.2, 8.4, 7.9, 45.5, 6);`;

        const problemResult = await pool.query('SELECT id FROM problems WHERE numeric_id = 70');
        const problemId = problemResult.rows[0].id;
        
        await pool.query(`
            UPDATE problem_schemas 
            SET setup_sql = $1
            WHERE problem_id = $2
        `, [setupSql, problemId]);
        
        res.json({
            success: true,
            message: 'Problem 70 schema added successfully'
        });
        
    } catch (error) {
        console.error('❌ Error adding schema for Problem 70:', error);
        res.status(500).json({ error: 'Failed to add schema for Problem 70', details: error.message });
    }
});

// Batch fix all schemas 61-70
router.post('/fix-all-schemas-61-70', async (req, res) => {
    try {
        console.log('🚨 BATCH FIXING all problem schemas 61-70...');
        
        const fixes = [
            { endpoint: '/fix-schema-61', name: 'UBS Private Banking' },
            { endpoint: '/fix-schema-62', name: 'Uber Market Analytics' },
            { endpoint: '/fix-schema-63', name: 'Tesla Energy Storage' },
            { endpoint: '/fix-schema-64', name: 'Airbnb Host Revenue' },
            { endpoint: '/fix-schema-65', name: 'Vanguard Index Funds' },
            { endpoint: '/fix-schema-66', name: 'Spotify Music Streaming' },
            { endpoint: '/fix-schema-67', name: 'Netflix Content Performance' },
            { endpoint: '/fix-schema-68', name: 'Amazon Prime Video' },
            { endpoint: '/fix-schema-69', name: 'YouTube Creator Monetization' },
            { endpoint: '/fix-schema-70', name: 'Zoom Video Analytics' }
        ];
        
        const results = [];
        
        for (const fix of fixes) {
            try {
                const response = await fetch(`http://localhost:5001/api/fix-problems-61-70-schemas${fix.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const result = await response.json();
                results.push({
                    problem: fix.name,
                    status: result.success ? 'FIXED' : 'FAILED',
                    message: result.message
                });
            } catch (error) {
                results.push({
                    problem: fix.name,
                    status: 'ERROR',
                    error: error.message
                });
            }
        }
        
        console.log('✅ BATCH SCHEMA FIX COMPLETED');
        
        res.json({
            success: true,
            message: 'Batch schema fix completed for problems 61-70',
            results: results,
            summary: {
                total_problems: fixes.length,
                fixed: results.filter(r => r.status === 'FIXED').length,
                failed: results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length
            }
        });
        
    } catch (error) {
        console.error('❌ Error in batch schema fix:', error);
        res.status(500).json({ error: 'Batch schema fix failed', details: error.message });
    }
});

module.exports = router;