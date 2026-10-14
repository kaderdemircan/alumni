/**
 * User Seeder
 * Populates UserModel (and persisted data store) with curated demo users and factory-generated alumni.
 */

const UserFactory = require('../factories/userFactory');
const UserModel = require('../models/userModel');

// Fixed high-quality demo accounts to guarantee key records exist
const defaultFixedUsers = [
    {
        name: 'Kader',
        surname: 'Demircan',
        age: 24,
        birthday: '2000-05-15',
        email: 'kader@example.com',
        city: 'İstanbul',
        company: 'Teknoloji A.Ş.',
        title: 'Full Stack Engineer'
    },
    {
        name: 'Ahmet',
        surname: 'Yılmaz',
        age: 27,
        birthday: '1999-01-20',
        email: 'ahmet.yilmaz@example.com',
        city: 'Ankara',
        company: 'Aselsan',
        title: 'Senior Software Architect'
    },
    {
        name: 'Ayşe',
        surname: 'Kaya',
        age: 25,
        birthday: '2001-08-10',
        email: 'ayse.kaya@example.com',
        city: 'İzmir',
        company: 'Google',
        title: 'AI Research Scientist'
    }
];

class UserSeeder {
    /**
     * Run the user seeding process
     * @param {Object} options
     * @param {number} [options.count=12] - Number of random factory users to generate
     * @param {boolean} [options.clear=false] - Clear existing records before seeding
     * @returns {Promise<Array<Object>>} List of all seeded users
     */
    async run(options = {}) {
        const count = options.count !== undefined ? options.count : 12;
        const shouldClear = options.clear || false;

        if (shouldClear) {
            await UserModel.clear();
        }

        const seededUsers = [];

        // 1. Seed fixed high-profile demo users
        const existingUsers = await UserModel.getAll();
        for (const user of defaultFixedUsers) {
            // Avoid duplicate name+surname if not cleared
            const existing = existingUsers.find(u => u.name === user.name && u.surname === user.surname);
            if (!existing) {
                const res = await UserModel.create(user);
                if (res.success) seededUsers.push(res.user);
            }
        }

        // 2. Seed realistic factory users
        const factoryUsers = await UserFactory.createMany(count);
        seededUsers.push(...factoryUsers);

        return seededUsers;
    }
}

const userSeederInstance = new UserSeeder();
module.exports = userSeederInstance;
module.exports.UserSeeder = UserSeeder;
