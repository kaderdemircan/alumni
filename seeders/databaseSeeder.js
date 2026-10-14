/**
 * Database Seeder (Master Seeder)
 * Orchestrates all individual entity seeders (UserSeeder, AnnouncementSeeder)
 * and generates corresponding SQL seed statements for PostgreSQL migrations.
 */

const fs = require('fs');
const path = require('path');
const UserSeeder = require('./userSeeder');
const AnnouncementSeeder = require('./announcementSeeder');

class DatabaseSeeder {
    /**
     * Run all seeders in correct dependency order
     * @param {Object} options
     * @param {boolean} [options.clear=false]
     * @param {number} [options.usersCount=12]
     * @param {number} [options.announcementsCount=4]
     * @param {boolean} [options.exportSql=true]
     * @returns {Promise<{ users: Array<Object>, announcements: Array<Object> }>}
     */
    async run(options = {}) {
        const {
            clear = false,
            usersCount = 12,
            announcementsCount = 4,
            exportSql = true
        } = options;

        console.log('🌱 Starting Database Seeding...');
        if (clear) {
            console.log('🧹 Clearing existing records (reset mode enabled)...');
        }

        // 1. Seed Users
        const users = await UserSeeder.run({ count: usersCount, clear });
        console.log(`✅ Seeded ${users.length} Users into Model & Storage.`);

        // 2. Seed Announcements
        const announcements = await AnnouncementSeeder.run({ count: announcementsCount, clear });
        console.log(`✅ Seeded ${announcements.length} Announcements into Model & Storage.`);

        // 3. Export SQL Seed file for PostgreSQL if requested
        if (exportSql) {
            this.exportSqlFile(users, announcements);
        }

        console.log('🎉 Database seeding completed successfully!\n');
        return { users, announcements };
    }

    /**
     * Export generated data as PostgreSQL INSERT statements
     * @param {Array<Object>} users
     * @param {Array<Object>} announcements
     */
    exportSqlFile(users, announcements) {
        try {
            const sqlLines = [
                '-- ============================================================================',
                '-- AUTO-GENERATED DATABASE SEED SCRIPT (via DatabaseSeeder)',
                `-- Generated At: ${new Date().toISOString()}`,
                '-- ============================================================================',
                '',
                '-- SEED USERS'
            ];

            users.forEach(u => {
                const name = (u.name || '').replace(/'/g, "''");
                const surname = (u.surname || '').replace(/'/g, "''");
                const email = (u.email || `${u.name.toLowerCase()}.${u.surname.toLowerCase()}@example.com`).replace(/'/g, "''");
                const city = (u.city || 'İstanbul').replace(/'/g, "''");
                sqlLines.push(
                    `INSERT INTO users (name, surname, age, birthday, email, city) VALUES ('${name}', '${surname}', ${u.age || 22}, '${u.birthday || '2000-01-01'}', '${email}', '${city}') ON CONFLICT (email) DO NOTHING;`
                );
            });

            sqlLines.push('', '-- SEED ANNOUNCEMENTS');
            announcements.forEach(a => {
                const title = (a.title || '').replace(/'/g, "''");
                const content = (a.content || '').replace(/'/g, "''");
                const author = (a.author || '').replace(/'/g, "''");
                const category = (a.category || 'Genel').replace(/'/g, "''");
                const priority = (a.priority || 'Normal').replace(/'/g, "''");
                const date = a.date || new Date().toISOString().split('T')[0];
                sqlLines.push(
                    `INSERT INTO announcements (title, content, author, category, priority, date) VALUES ('${title}', '${content}', '${author}', '${category}', '${priority}', '${date}') ON CONFLICT DO NOTHING;`
                );
            });

            const targetPath = path.join(__dirname, '..', 'migrations', '003_seed_initial_data.sql');
            fs.writeFileSync(targetPath, sqlLines.join('\n'), 'utf8');
            console.log(`📝 Updated PostgreSQL seed migration: migrations/003_seed_initial_data.sql`);
        } catch (e) {
            console.warn(`⚠️ Warning: Could not write SQL seed file: ${e.message}`);
        }
    }
}

const databaseSeederInstance = new DatabaseSeeder();
module.exports = databaseSeederInstance;
module.exports.DatabaseSeeder = DatabaseSeeder;
