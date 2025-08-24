const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const mysql = require('mysql2/promise');

// MySQL connection configuration
const mysqlConfig = {
    host: 'localhost',
    user: 'root', 
    password: 'password',
    database: 'sandbox',
    port: 3307
};

// System health and performance monitoring
router.get('/health', async (req, res) => {
    try {
        const healthData = {
            timestamp: new Date().toISOString(),
            system: 'healthy',
            databases: {},
            performance: {},
            problems: {}
        };

        // Test PostgreSQL connection and performance
        const pgStart = Date.now();
        try {
            const pgClient = await pool.connect();
            const pgResult = await pgClient.query('SELECT NOW()');
            pgClient.release();
            const pgTime = Date.now() - pgStart;
            
            healthData.databases.postgresql = {
                status: 'healthy',
                responseTime: `${pgTime}ms`,
                host: 'localhost:5432'
            };
        } catch (error) {
            healthData.databases.postgresql = {
                status: 'error',
                error: error.message,
                host: 'localhost:5432'
            };
            healthData.system = 'degraded';
        }

        // Test MySQL connection and performance
        const mysqlStart = Date.now();
        try {
            const mysqlConnection = await mysql.createConnection(mysqlConfig);
            await mysqlConnection.execute('SELECT NOW()');
            await mysqlConnection.end();
            const mysqlTime = Date.now() - mysqlStart;
            
            healthData.databases.mysql = {
                status: 'healthy',
                responseTime: `${mysqlTime}ms`,
                host: 'localhost:3307'
            };
        } catch (error) {
            healthData.databases.mysql = {
                status: 'error',
                error: error.message,
                host: 'localhost:3307'
            };
            healthData.system = 'degraded';
        }

        // Get problem statistics
        try {
            const problemStats = await pool.query(`
                SELECT 
                    COUNT(*) as total_problems,
                    COUNT(*) FILTER (WHERE is_active = true) as active_problems,
                    COUNT(*) FILTER (WHERE difficulty = 'easy') as easy_problems,
                    COUNT(*) FILTER (WHERE difficulty = 'medium') as medium_problems,
                    COUNT(*) FILTER (WHERE difficulty = 'hard') as hard_problems
                FROM problems
            `);

            const schemaStats = await pool.query(`
                SELECT 
                    sql_dialect,
                    COUNT(*) as schema_count,
                    COUNT(*) FILTER (WHERE expected_output IS NOT NULL AND expected_output != '[]'::jsonb) as with_validation
                FROM problem_schemas 
                GROUP BY sql_dialect
                ORDER BY sql_dialect
            `);

            healthData.problems = {
                overview: problemStats.rows[0],
                schemas: schemaStats.rows
            };
        } catch (error) {
            healthData.problems = { error: error.message };
        }

        // Performance metrics
        healthData.performance = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
        };

        res.json(healthData);
    } catch (error) {
        res.status(500).json({
            system: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Detailed system metrics
router.get('/metrics', async (req, res) => {
    try {
        const metrics = {
            timestamp: new Date().toISOString(),
            databases: {},
            queries: {},
            system: {}
        };

        // Database table counts
        try {
            const pgTables = await pool.query(`
                SELECT schemaname, tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            `);
            
            metrics.databases.postgresql = {
                tables: pgTables.rows.length,
                tableList: pgTables.rows.map(row => row.tablename)
            };
        } catch (error) {
            metrics.databases.postgresql = { error: error.message };
        }

        try {
            const mysqlConnection = await mysql.createConnection(mysqlConfig);
            const [mysqlTables] = await mysqlConnection.execute('SHOW TABLES');
            await mysqlConnection.end();
            
            metrics.databases.mysql = {
                tables: mysqlTables.length,
                tableList: mysqlTables.map(row => Object.values(row)[0])
            };
        } catch (error) {
            metrics.databases.mysql = { error: error.message };
        }

        // System resources
        metrics.system = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        };

        res.json(metrics);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Query performance test
router.post('/benchmark', async (req, res) => {
    try {
        const { dialect = 'postgresql', iterations = 5 } = req.body;
        
        const testQuery = dialect === 'mysql' 
            ? 'SELECT COUNT(*) as test_count FROM ab_test_results'
            : 'SELECT COUNT(*) as test_count FROM problems';

        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const start = Date.now();
            
            if (dialect === 'mysql') {
                const mysqlConnection = await mysql.createConnection(mysqlConfig);
                await mysqlConnection.execute(testQuery);
                await mysqlConnection.end();
            } else {
                const pgClient = await pool.connect();
                await pgClient.query(testQuery);
                pgClient.release();
            }
            
            results.push(Date.now() - start);
        }

        res.json({
            dialect,
            iterations,
            query: testQuery,
            results: results,
            average: Math.round(results.reduce((a, b) => a + b, 0) / results.length),
            min: Math.min(...results),
            max: Math.max(...results),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;