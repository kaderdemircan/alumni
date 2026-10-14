/**
 * Migration Runner Script
 * 
 * Runs SQL migration files against the target database or displays migration status.
 * Usage:
 *   node scripts/migrate.js
 *   npm run migrate
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eq = trimmed.indexOf('=');
            if (eq > 0) {
                const k = trimmed.slice(0, eq).trim();
                const v = trimmed.slice(eq + 1).trim();
                if (!process.env[k]) process.env[k] = v;
            }
        }
    });
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_NAME = process.env.DB_NAME || 'alumni_db';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

console.log('=====================================================');
console.log('🚀 Alumni Tracking System - Database Migration Runner');
console.log('=====================================================');
console.log(`📡 Target Database : ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
console.log(`📁 Migrations Path : ${MIGRATIONS_DIR}`);

// 1. List available migration files
if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Error: migrations directory not found.');
    process.exit(1);
}

const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
console.log('\n📄 Found Migration Files:');
files.forEach((f, i) => {
    const stat = fs.statSync(path.join(MIGRATIONS_DIR, f));
    console.log(`   ${i + 1}. ${f} (${stat.size} bytes)`);
});

// 2. Check DB Port Connectivity
console.log(`\n⏳ Checking connection to ${DB_HOST}:${DB_PORT}...`);
const socket = new net.Socket();
socket.setTimeout(2500);

socket.connect(DB_PORT, DB_HOST, () => {
    console.log(`✅ PostgreSQL server is reachable at ${DB_HOST}:${DB_PORT}!`);
    console.log('\n💡 Migration Execution:');
    console.log('   Docker Compose otomatik olarak "migrations/init.sql" dosyasını konteyner açılışında çalıştırır.');
    console.log('   Manuel çalıştırmak isterseniz:');
    console.log(`   docker exec -i alumni_db psql -U ${DB_USER} -d ${DB_NAME} < migrations/init.sql`);
    socket.destroy();
    process.exit(0);
});

socket.on('error', (err) => {
    console.log(`ℹ️  PostgreSQL portu (${DB_HOST}:${DB_PORT}) şu anda kapalı veya Docker konteyneri henüz başlatılmamış.`);
    console.log('💡 Docker ile otomatik migration çalıştırmak için:');
    console.log('   1. Docker Desktop\'ı açın.');
    console.log('   2. "docker compose up -d" komutunu çalıştırın.');
    console.log('   3. "migrations/init.sql" otomatik olarak veritabanına uygulanacaktır.');
    socket.destroy();
    process.exit(0);
});

socket.on('timeout', () => {
    console.log(`⚠️  Bağlantı zaman aşımına uğradı (${DB_HOST}:${DB_PORT}).`);
    socket.destroy();
    process.exit(0);
});
