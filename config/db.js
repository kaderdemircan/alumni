/**
 * Database Configuration & Connection Pool
 * Connects to PostgreSQL using environment variables from .env
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Ensure .env is loaded
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const firstEq = trimmed.indexOf('=');
            if (firstEq > 0) {
                const key = trimmed.slice(0, firstEq).trim();
                const value = trimmed.slice(firstEq + 1).trim();
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    });
}

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'alumni_db',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

// Test and log connection on startup
let isConnected = false;

pool.connect((err, client, release) => {
    if (err) {
        console.warn(`⚠️ PostgreSQL connection warning: ${err.message}. (Using fallback or waiting for database service).`);
    } else {
        isConnected = true;
        console.log(`✅ Connected to PostgreSQL database [${process.env.DB_NAME || 'alumni_db'}] on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
        release();
    }
});

/**
 * Execute SQL query with parameter binding
 * @param {string} text
 * @param {Array} params
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('executed query', { text: text.slice(0, 80), duration, rows: res.rowCount });
        }
        return res;
    } catch (error) {
        console.error('Database query error:', { text: text.slice(0, 100), error: error.message });
        throw error;
    }
}

/**
 * Initialize core database tables if they do not exist
 */
async function initDb() {
    try {
        // 1. Users table
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                surname VARCHAR(100) NOT NULL,
                age INTEGER,
                birthday DATE,
                email VARCHAR(255) UNIQUE,
                city VARCHAR(100),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // 2. Announcements table
        await query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id BIGSERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                author VARCHAR(100) NOT NULL,
                category VARCHAR(50) DEFAULT 'Genel',
                priority VARCHAR(20) DEFAULT 'Normal',
                date DATE DEFAULT CURRENT_DATE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('✅ PostgreSQL database tables verified/initialized.');
    } catch (e) {
        console.warn('Database initialization note:', e.message);
    }
}

module.exports = {
    pool,
    query,
    initDb,
    get isConnected() { return isConnected; }
};
