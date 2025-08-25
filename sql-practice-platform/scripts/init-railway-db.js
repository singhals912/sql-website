#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connect to Railway database
const pool = new Pool({
    connectionString: 'postgresql://postgres:UwiDfdnVOxLhPcOYJAXpUhzFeJeVWFAk@postgres.railway.internal:5432/railway'
});

async function initializeDatabase() {
    try {
        console.log('🚀 Initializing Railway PostgreSQL database...');
        
        // Read and execute schema
        const schemaSQL = fs.readFileSync(path.join(__dirname, '../database/init.sql'), 'utf8');
        await pool.query(schemaSQL);
        console.log('✅ Schema created successfully');
        
        // Read and execute migrations if they exist
        const migrationPath = path.join(__dirname, '../database/migrations/001_add_missing_critical_tables.sql');
        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            await pool.query(migrationSQL);
            console.log('✅ Migrations applied successfully');
        }
        
        // Check if problems table has data
        const result = await pool.query('SELECT COUNT(*) FROM problems');
        const problemCount = parseInt(result.rows[0].count);
        
        console.log(`📊 Database initialized with ${problemCount} problems`);
        
        if (problemCount === 0) {
            console.log('⚠️  No problems found. You may need to import problem data.');
        }
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    } finally {
        await pool.end();
    }
}

initializeDatabase();