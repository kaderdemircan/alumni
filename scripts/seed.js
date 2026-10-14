/**
 * Seed CLI Runner
 * 
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --reset
 *   npm run seed
 */

const DatabaseSeeder = require('../seeders/databaseSeeder');
const db = require('../config/db');

const args = process.argv.slice(2);
const isReset = args.includes('--reset') || args.includes('--clear');

(async () => {
    try {
        console.log('=====================================================');
        console.log('🌾 Alumni Tracking System - Database Seeder Runner');
        console.log('=====================================================');

        await db.initDb();

        const result = await DatabaseSeeder.run({
            clear: isReset,
            usersCount: 12,
            announcementsCount: 4,
            exportSql: true
        });

        console.log('📊 Summary:');
        console.log(`   - Total Users Seeded        : ${result.users.length}`);
        console.log(`   - Total Announcements Seeded: ${result.announcements.length}`);
        console.log('\n💡 İpucu: Web arayüzünü açarak kayıtları inceleyebilirsiniz:');
        console.log('   - Alumni Directory : http://localhost:8080/users');
        console.log('   - Announcements    : http://localhost:8080/announcements');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        await db.pool.end();
    }
})();
