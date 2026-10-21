/**
 * Seed CLI Runner
 * 
 * Usage:
 *   node scripts/seed.js           # Seeds users, announcements, and job postings
 *   node scripts/seed.js --jobs    # Seeds only job-postings table & skills
 *   node scripts/seed.js --reset   # Clears and re-seeds all tables
 *   npm run seed                   # Default seeding via npm
 *   npm run db:seed                # Reset and full seed
 */

const DatabaseSeeder = require('../seeders/databaseSeeder');
const JobPostingSeeder = require('../seeders/jobPostingSeeder');
const db = require('../config/db');

const args = process.argv.slice(2);
const isReset = args.includes('--reset') || args.includes('--clear');
const isJobsOnly = args.includes('--jobs') || args.includes('--job-postings');

(async () => {
    try {
        console.log('=====================================================');
        console.log('🌾 Alumni Tracking System - Database Seeder Runner');
        console.log('=====================================================');

        await db.initDb();

        if (isJobsOnly) {
            console.log('💼 Seeding Job Postings table specifically...');
            const jobs = await JobPostingSeeder.run({
                count: 8,
                clear: isReset
            });

            console.log('\n📊 Summary:');
            console.log(`   - Total Job Postings Seeded : ${jobs.length}`);
            console.log('\n💡 İnceleme Bağlantıları:');
            console.log('   - REST API Jobs Endpoint : http://localhost:8080/api/jobs');
            console.log('   - Swagger Documentation  : http://localhost:8080/api/swagger');
        } else {
            const result = await DatabaseSeeder.run({
                clear: isReset,
                usersCount: 12,
                announcementsCount: 4,
                jobsCount: 8,
                exportSql: true
            });

            console.log('📊 Summary:');
            console.log(`   - Total Users Seeded        : ${result.users.length}`);
            console.log(`   - Total Announcements Seeded: ${result.announcements.length}`);
            console.log(`   - Total Job Postings Seeded : ${result.jobs.length}`);
            console.log('\n💡 İnceleme Bağlantıları:');
            console.log('   - Alumni Directory       : http://localhost:8080/users');
            console.log('   - Announcements          : http://localhost:8080/announcements');
            console.log('   - REST API Jobs          : http://localhost:8080/api/jobs');
            console.log('   - Swagger Documentation  : http://localhost:8080/api/swagger');
        }
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        await db.pool.end();
    }
})();
