/**
 * Models & Relationships Registry
 * 
 * Exports all data models and documents the complete Entity-Relationship (ER) graph
 * derived from database migrations (001_create_alumni_schema.sql, 
 * 002_create_announcements_schema.sql, 004_update_job_postings_schema.sql,
 * 005_update_job_applications_schema.sql, 006_decouple_user_and_job_postings.sql).
 * 
 * ============================================================================
 * RELATIONSHIPS DEFINITION:
 * ============================================================================
 * 
 * 1. User <-> JobApplication (1:N)
 *    - User.hasMany(JobApplication, { foreignKey: 'user_id', as: 'jobApplications' })
 *    - JobApplication.belongsTo(User, { foreignKey: 'user_id', as: 'applicant' })
 * 
 * 2. JobPosting <-> JobApplication (1:N)
 *    - JobPosting.hasMany(JobApplication, { foreignKey: 'job_id', as: 'applications' })
 *    - JobApplication.belongsTo(JobPosting, { foreignKey: 'job_id', as: 'job' })
 * 
 * 3. JobPosting <-> Skill (M:N via job_skills)
 *    - JobPosting.belongsToMany(Skill, { through: 'job_skills', foreignKey: 'job_id', otherKey: 'skill_id' })
 *    - Skill.belongsToMany(JobPosting, { through: 'job_skills', foreignKey: 'skill_id', otherKey: 'job_id' })
 * 
 * 4. User <-> Skill (M:N via alumni_skills)
 *    - User.belongsToMany(Skill, { through: 'alumni_skills', foreignKey: 'user_id', otherKey: 'skill_id' })
 *    - Skill.belongsToMany(User, { through: 'alumni_skills', foreignKey: 'skill_id', otherKey: 'user_id' })
 * 
 * Note on Architecture Decoupling:
 *    - Job postings are independent corporate/employer listings (no direct user foreign key).
 *    - Alumni users interact with job postings exclusively by applying through JobApplication.
 * ============================================================================
 */

const UserModel = require('./userModel');
const AnnouncementModel = require('./announcementModel');
const JobPostingModel = require('./jobPostingModel');
const JobApplicationModel = require('./jobApplicationModel');
const SkillModel = require('./skillModel');

const relationships = {
    User: {
        jobApplications: { type: 'HasMany', model: 'JobApplication', foreignKey: 'user_id' },
        skills: { type: 'BelongsToMany', model: 'Skill', through: 'alumni_skills', foreignKey: 'user_id', otherKey: 'skill_id' }
    },
    JobPosting: {
        applications: { type: 'HasMany', model: 'JobApplication', foreignKey: 'job_id' },
        skills: { type: 'BelongsToMany', model: 'Skill', through: 'job_skills', foreignKey: 'job_id', otherKey: 'skill_id' }
    },
    JobApplication: {
        job: { type: 'BelongsTo', model: 'JobPosting', foreignKey: 'job_id' },
        applicant: { type: 'BelongsTo', model: 'User', foreignKey: 'user_id' }
    },
    Skill: {
        users: { type: 'BelongsToMany', model: 'User', through: 'alumni_skills', foreignKey: 'skill_id', otherKey: 'user_id' },
        jobPostings: { type: 'BelongsToMany', model: 'JobPosting', through: 'job_skills', foreignKey: 'skill_id', otherKey: 'job_id' }
    }
};

module.exports = {
    UserModel,
    AnnouncementModel,
    JobPostingModel,
    JobApplicationModel,
    SkillModel,
    relationships
};
