/**
 * JobPosting Seeder
 * 
 * Populates JobPostingModel and relational tables (job_skills) with curated career postings
 * and factory-generated opportunities.
 * Note: Job postings are independent corporate postings and are decoupled from individual users.
 */

const JobPostingModel = require('../models/jobPostingModel');
const SkillModel = require('../models/skillModel');
const JobPostingFactory = require('../factories/jobPostingFactory');
const { sampleJobTemplates } = require('../factories/jobPostingFactory');

class JobPostingSeeder {
    /**
     * Run the job posting seeding process
     * @param {Object} options
     * @param {number} [options.count=8] - Total number of jobs to seed
     * @param {boolean} [options.clear=false] - Clear existing jobs before seeding
     * @returns {Promise<Array<Object>>} List of all seeded job postings
     */
    async run(options = {}) {
        const count = options.count !== undefined ? options.count : 8;
        const shouldClear = options.clear || false;

        if (shouldClear) {
            await JobPostingModel.clear();
        }

        const seededJobs = [];

        // 1. Ensure basic industry skills exist in SkillModel for relational attachment
        const coreSkills = [
            { name: 'JavaScript / Node.js', category: 'Backend' },
            { name: 'Docker & Kubernetes', category: 'DevOps' },
            { name: 'PostgreSQL', category: 'Veritabanı' },
            { name: 'React / Next.js', category: 'Frontend' },
            { name: 'Python & PyTorch', category: 'Yapay Zeka' },
            { name: 'Go (Golang)', category: 'Backend' },
            { name: 'C / C++', category: 'Gömülü Sistemler' },
            { name: 'Siber Güvenlik & SIEM', category: 'Güvenlik' }
        ];

        const existingSkills = await SkillModel.getAll();
        const availableSkills = [...existingSkills];

        for (const skill of coreSkills) {
            let found = availableSkills.find(s => s.name.toLowerCase() === skill.name.toLowerCase());
            if (!found) {
                const sRes = await SkillModel.create(skill);
                if (sRes.success) availableSkills.push(sRes.skill);
            }
        }

        // 2. Seed fixed curated jobs from templates
        const existingJobs = await JobPostingModel.getAll();
        const templatesToUse = sampleJobTemplates.slice(0, Math.min(count, sampleJobTemplates.length));

        for (let i = 0; i < templatesToUse.length; i++) {
            const template = templatesToUse[i];
            const alreadyExists = existingJobs.find(j => j.title === template.title && j.company_name === template.company_name);

            if (!alreadyExists) {
                const now = new Date();
                const deadline = new Date(now.getTime() + (30 + i * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const jobPayload = {
                    company_name: template.company_name,
                    company_logo_url: `https://logo.clearbit.com/${template.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    title: template.title,
                    category: template.category,
                    description: template.description,
                    requirements: template.requirements,
                    benefits: template.benefits,
                    employment_type: template.employment_type || 'full-time',
                    workplace_type: template.workplace_type || 'hybrid',
                    experience_level: template.experience_level || 'mid',
                    location: template.workplace_type === 'remote' ? 'Remote / Türkiye Geneli' : 'İstanbul, Türkiye',
                    salary_min: template.salary_min,
                    salary_max: template.salary_max,
                    currency: 'TRY',
                    is_salary_visible: true,
                    application_url: `https://kariyer.${template.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/jobs`,
                    contact_email: `careers@${template.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    deadline,
                    status: 'open',
                    is_featured: i < 3, // Highlight top 3 as featured
                    views_count: 50 + i * 35
                };

                const res = await JobPostingModel.create(jobPayload);
                if (res.success) {
                    seededJobs.push(res.job);

                    // Attach relevant skills
                    if (availableSkills.length > 0) {
                        // Pick 2-3 skills to attach
                        const skill1 = availableSkills[i % availableSkills.length];
                        const skill2 = availableSkills[(i + 2) % availableSkills.length];
                        if (skill1) await JobPostingModel.attachSkill(res.job.id, skill1.id, true);
                        if (skill2 && skill2.id !== skill1.id) await JobPostingModel.attachSkill(res.job.id, skill2.id, false);
                    }
                }
            }
        }

        // 3. Generate remaining jobs with factory if count exceeds templates
        if (seededJobs.length < count) {
            const needed = count - seededJobs.length;
            for (let k = 0; k < needed; k++) {
                const factoryJob = await JobPostingFactory.create();
                seededJobs.push(factoryJob);

                if (availableSkills.length > 0) {
                    const randomSkill = availableSkills[k % availableSkills.length];
                    if (randomSkill) await JobPostingModel.attachSkill(factoryJob.id, randomSkill.id, true);
                }
            }
        }

        return seededJobs;
    }
}

const jobPostingSeederInstance = new JobPostingSeeder();
module.exports = jobPostingSeederInstance;
module.exports.JobPostingSeeder = JobPostingSeeder;
