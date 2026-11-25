const db = require('../config/db');
const users = require('../models/userModel');

async function grantAdmin() {
    const email = process.argv[2]?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Usage: npm run auth:grant-admin -- <registered-email>');
    }
    await db.initDb();
    const user = await users.findByEmail(email);
    if (!user?.password_hash || user.status === 'inactive') {
        throw new Error('An active, registered account with a password is required for this email.');
    }
    if (!(await users.updateAccount(user.id, { role: 'admin' }))) {
        throw new Error('The administrator role could not be saved.');
    }
    console.log(`Administrator role granted to ${email}.`);
}

grantAdmin().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
}).finally(() => db.pool.end?.());
