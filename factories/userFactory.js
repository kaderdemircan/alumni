/**
 * User Factory
 * Generates realistic User/Alumni mock records for testing, prototyping, and database seeding.
 */

const UserModel = require('../models/userModel');
const { 
    firstNames, 
    lastNames, 
    cities, 
    companies, 
    titles, 
    randomPick, 
    randomInt, 
    randomDate, 
    sanitizeEmail 
} = require('./helpers');

class UserFactory {
    /**
     * Default schema definition for a User entity
     * @returns {Object}
     */
    definition() {
        const name = randomPick(firstNames);
        const surname = randomPick(lastNames);
        const birthday = randomDate(1992, 2003);
        const birthYear = parseInt(birthday.split('-')[0], 10);
        const age = new Date().getFullYear() - birthYear;
        const sanitizedName = sanitizeEmail(name);
        const sanitizedSurname = sanitizeEmail(surname);
        const email = `${sanitizedName}.${sanitizedSurname}${randomInt(10, 99)}@example.com`;

        return {
            name,
            surname,
            age,
            birthday,
            email,
            city: randomPick(cities),
            company: randomPick(companies),
            title: randomPick(titles)
        };
    }

    /**
     * Build an unpersisted User object (in-memory only)
     * @param {Object} overrides
     * @returns {Object}
     */
    make(overrides = {}) {
        return {
            ...this.definition(),
            ...overrides
        };
    }

    /**
     * Build an array of unpersisted User objects
     * @param {number} count
     * @param {Object} overrides
     * @returns {Array<Object>}
     */
    makeMany(count = 5, overrides = {}) {
        const users = [];
        for (let i = 0; i < count; i++) {
            users.push(this.make(overrides));
        }
        return users;
    }

    /**
     * Create and persist a User record via UserModel
     * @param {Object} overrides
     * @returns {Promise<Object>}
     */
    async create(overrides = {}) {
        const userData = this.make(overrides);
        const result = await UserModel.create(userData);
        if (!result.success) {
            throw new Error(`UserFactory creation failed: ${result.error}`);
        }
        return result.user;
    }

    /**
     * Create and persist multiple User records via UserModel
     * @param {number} count
     * @param {Object} overrides
     * @returns {Promise<Array<Object>>}
     */
    async createMany(count = 5, overrides = {}) {
        const createdUsers = [];
        for (let i = 0; i < count; i++) {
            createdUsers.push(await this.create(overrides));
        }
        return createdUsers;
    }
}

const userFactoryInstance = new UserFactory();
module.exports = userFactoryInstance;
module.exports.UserFactory = UserFactory;
