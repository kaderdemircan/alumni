/**
 * Database Seeder (Master Seeder)
 * Orchestrates all individual entity seeders (UserSeeder, AnnouncementSeeder, JobPostingSeeder)
 * and generates corresponding SQL seed statements for PostgreSQL migrations.
 */

const fs = require('fs');
const path = require('path');
const UserSeeder = require('./userSeeder');
const AnnouncementSeeder = require('./announcementSeeder');
const JobPostingSeeder = require('./jobPostingSeeder');

class DatabaseSeeder {
    /**
     * Run all seeders in correct dependency order
     * @param {Object} options
     * @param {boolean} [options.clear=false]
     * @param {number} [options.usersCount=12]
     * @param {number} [options.announcementsCount=4]
     * @param {number} [options.jobsCount=8]
     * @param {boolean} [options.exportSql=true]
     * @returns {Promise<{ users: Array<Object>, announcements: Array<Object>, jobs: Array<Object> }>}
     */
    async run(options = {}) {
        const {
            clear = false,
            usersCount = 12,
            announcementsCount = 4,
            jobsCount = 8,
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

        // 3. Seed Job Postings & Associated Skills
        const jobs = await JobPostingSeeder.run({ count: jobsCount, clear });
        console.log(`✅ Seeded ${jobs.length} Job Postings into Model & Storage.`);

        // 4. Export SQL Seed file for PostgreSQL if requested
        if (exportSql) {
            this.exportSqlFile(users, announcements, jobs);
        }

        console.log('🎉 Database seeding completed successfully!\n');
        return { users, announcements, jobs };
    }

    /**
     * Export generated data as PostgreSQL INSERT statements
     * @param {Array<Object>} users
     * @param {Array<Object>} announcements
     * @param {Array<Object>} jobs
     */
    exportSqlFile(users, announcements, jobs = []) {
        try {
            const sqlLines = [
                '-- ============================================================================',
                '-- AUTO-GENERATED DATABASE SEED SCRIPT (via DatabaseSeeder)',
                `-- Generated At: ${new Date().toISOString()}`,
                '-- ============================================================================',
                '',
                '-- 1. SEED USERS'
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

            sqlLines.push('', '-- 2. SEED ANNOUNCEMENTS');
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

            if (jobs && jobs.length > 0) {
                sqlLines.push('', '-- 3. SEED JOB POSTINGS');
                jobs.forEach(j => {
                    const company = (j.company_name || '').replace(/'/g, "''");
                    const title = (j.title || '').replace(/'/g, "''");
                    const category = (j.category || 'Genel').replace(/'/g, "''");
                    const description = (j.description || '').replace(/'/g, "''").replace(/\r?\n/g, '\\n');
                    const requirements = (j.requirements || '').replace(/'/g, "''").replace(/\r?\n/g, '\\n');
                    const benefits = (j.benefits || '').replace(/'/g, "''").replace(/\r?\n/g, '\\n');
                    const empType = (j.employment_type || 'full-time').replace(/'/g, "''");
                    const workType = (j.workplace_type || 'hybrid').replace(/'/g, "''");
                    const expLevel = (j.experience_level || 'mid').replace(/'/g, "''");
                    const loc = (j.location || 'İstanbul').replace(/'/g, "''");
                    const sMin = j.salary_min !== null && j.salary_min !== undefined ? j.salary_min : 'NULL';
                    const sMax = j.salary_max !== null && j.salary_max !== undefined ? j.salary_max : 'NULL';
                    const currency = (j.currency || 'TRY').replace(/'/g, "''");
                    const isSalaryVisible = Boolean(j.is_salary_visible);
                    const appUrl = (j.application_url || '').replace(/'/g, "''");
                    const email = (j.contact_email || '').replace(/'/g, "''");
                    const deadline = j.deadline ? `'${j.deadline}'` : 'NULL';
                    const status = (j.status || 'open').replace(/'/g, "''");
                    const isFeatured = Boolean(j.is_featured);
                    const views = Number(j.views_count) || 0;

                    sqlLines.push(
                        `INSERT INTO job_postings (company_name, title, category, description, requirements, benefits, employment_type, workplace_type, experience_level, location, salary_min, salary_max, currency, is_salary_visible, application_url, contact_email, deadline, status, is_featured, views_count) VALUES ('${company}', '${title}', '${category}', '${description}', '${requirements}', '${benefits}', '${empType}', '${workType}', '${expLevel}', '${loc}', ${sMin}, ${sMax}, '${currency}', ${isSalaryVisible}, '${appUrl}', '${email}', ${deadline}, '${status}', ${isFeatured}, ${views});`
                    );
                });
            }

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
