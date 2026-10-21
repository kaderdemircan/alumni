/**
 * Automated Verification Script: Job Applications & Relational Routes
 */

const http = require('http');
const assert = require('assert');
const { JobApplicationModel, JobPostingModel, UserModel, SkillModel } = require('./models');

function request(options, postData) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json = null;
                try {
                    json = JSON.parse(data);
                } catch (e) {
                    json = data;
                }
                resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

(async () => {
    console.log('🧪 Starting Job Applications & Relational Routes Test Suite...\n');

    // Clean test state
    JobApplicationModel.applications = [];
    JobApplicationModel.currentId = 1;
    JobApplicationModel._saveFallback();

    // Ensure dummy job and user exist for testing
    let testUser = UserModel.users.find(u => u.id === 1);
    if (!testUser) {
        UserModel.users.push({ id: 1, name: 'Kader', surname: 'Demircan', email: 'kader@test.com' });
    }
    let applicantUser = UserModel.users.find(u => u.id === 2);
    if (!applicantUser) {
        UserModel.users.push({ id: 2, name: 'Gülnihal', surname: 'Arıkaymak', email: 'gulnihal@test.com' });
    }
    let secondApplicant = UserModel.users.find(u => u.id === 3);
    if (!secondApplicant) {
        UserModel.users.push({ id: 3, name: 'Ahmet', surname: 'Yılmaz', email: 'ahmet@test.com' });
    }

    let testJob = JobPostingModel.jobs.find(j => j.id === 101);
    if (!testJob) {
        testJob = {
            id: 101,
            company_name: 'Tech Innovators A.Ş.',
            title: 'Senior Node.js Backend Architect',
            category: 'Yazılım Geliştirme',
            location: 'İstanbul',
            status: 'open'
        };
        JobPostingModel.jobs.push(testJob);
    }

    // -------------------------------------------------------------------------
    // TEST 1: Model Validation
    // -------------------------------------------------------------------------
    console.log('Test 1: Model Validation Rules');
    const invalidJob = JobApplicationModel.validate({ job_id: 'invalid', user_id: 2 });
    assert.strictEqual(invalidJob.isValid, false, 'Should fail without valid job_id');

    const invalidStatus = JobApplicationModel.validate({ job_id: 101, user_id: 2, status: 'unknown_status' });
    assert.strictEqual(invalidStatus.isValid, false, 'Should fail with unknown status');

    const invalidSalary = JobApplicationModel.validate({ job_id: 101, user_id: 2, expected_salary: -500 });
    assert.strictEqual(invalidSalary.isValid, false, 'Should fail with negative expected salary');

    const invalidScore = JobApplicationModel.validate({ job_id: 101, user_id: 2, feedback_score: 6 });
    assert.strictEqual(invalidScore.isValid, false, 'Should fail with score > 5');

    const validPayload = JobApplicationModel.validate({
        job_id: 101,
        user_id: 2,
        expected_salary: 85000,
        currency: 'TRY',
        notice_period_days: 30,
        status: 'submitted',
        feedback_score: 5
    });
    assert.strictEqual(validPayload.isValid, true, 'Valid payload must pass');
    console.log('  ✅ Validation rules verified');

    // -------------------------------------------------------------------------
    // TEST 2: Model Creation & Unique Constraint
    // -------------------------------------------------------------------------
    console.log('\nTest 2: Model Creation & Duplicate Application Prevention');
    const createRes = await JobApplicationModel.create({
        job_id: 101,
        user_id: 2,
        resume_url: 'https://storage.alumni.edu/cv/applicant_2.pdf',
        cover_letter: 'Backend mimarisi ve yüksek ölçeklenebilir sistemler konusunda 5 yıllık tecrübem var.',
        portfolio_url: 'https://github.com/applicant2',
        expected_salary: 95000,
        currency: 'TRY',
        notice_period_days: 15,
        status: 'submitted'
    });
    assert.strictEqual(createRes.success, true, 'Application 1 creation should succeed');
    assert.strictEqual(createRes.application.job_id, 101);
    assert.strictEqual(createRes.application.user_id, 2);
    assert.strictEqual(createRes.application.expected_salary, 95000);
    assert.strictEqual(createRes.application.portfolio_url, 'https://github.com/applicant2');

    // Try duplicate application
    const dupRes = await JobApplicationModel.create({
        job_id: 101,
        user_id: 2,
        resume_url: 'https://storage.alumni.edu/cv/another_cv.pdf'
    });
    assert.strictEqual(dupRes.success, false, 'Duplicate application must fail');
    assert.strictEqual(dupRes.duplicate, true, 'Duplicate flag must be set');
    console.log('  ✅ Creation with all fields & duplicate application prevention verified');

    // -------------------------------------------------------------------------
    // TEST 3: Status Transition & Interview Scheduling
    // -------------------------------------------------------------------------
    console.log('\nTest 3: Status Transition & Interview Scheduling');
    const appId = createRes.application.id;

    // Transition status to in_review
    const reviewRes = await JobApplicationModel.updateStatus(appId, 'in_review', {
        review_notes: 'CV incelendi, teknik deneyim iş gereksinimlerine oldukça uygun.'
    });
    assert.strictEqual(reviewRes.success, true);
    assert.strictEqual(reviewRes.application.status, 'in_review');
    assert.strictEqual(reviewRes.application.review_notes, 'CV incelendi, teknik deneyim iş gereksinimlerine oldukça uygun.');

    // Schedule interview
    const interviewDate = '2026-11-05T14:30:00.000Z';
    const interviewRes = await JobApplicationModel.scheduleInterview(appId, interviewDate, 'Google Meet teknik görüşme linki iletildi.');
    assert.strictEqual(interviewRes.success, true);
    assert.strictEqual(interviewRes.application.status, 'interview_scheduled');
    assert.strictEqual(new Date(interviewRes.application.interview_date).toISOString(), interviewDate);
    assert.strictEqual(interviewRes.application.review_notes, 'Google Meet teknik görüşme linki iletildi.');
    console.log('  ✅ Status update and interview scheduling verified');

    // -------------------------------------------------------------------------
    // TEST 4: Query Filtering in getAll
    // -------------------------------------------------------------------------
    console.log('\nTest 4: Query Filtering in getAll');
    // Create second application with different user and status
    const app2Res = await JobApplicationModel.create({
        job_id: 101,
        user_id: 3,
        expected_salary: 80000,
        status: 'submitted'
    });
    assert.strictEqual(app2Res.success, true);

    const allApps = await JobApplicationModel.getAll();
    assert.strictEqual(allApps.length, 2);

    const filteredByStatus = await JobApplicationModel.getAll({ status: 'interview_scheduled' });
    assert.strictEqual(filteredByStatus.length, 1);
    assert.strictEqual(filteredByStatus[0].id, appId);

    const filteredByUser = await JobApplicationModel.getAll({ user_id: 3 });
    assert.strictEqual(filteredByUser.length, 1);
    assert.strictEqual(filteredByUser[0].user_id, 3);
    console.log('  ✅ getAll filtering by status and user verified');

    // -------------------------------------------------------------------------
    // TEST 5: Relational Association Lookups
    // -------------------------------------------------------------------------
    console.log('\nTest 5: Relational Association Methods');
    const jobLookup = await JobApplicationModel.getJob(appId);
    assert.ok(jobLookup, 'Associated job should be found');
    assert.strictEqual(jobLookup.id, 101);

    const applicantLookup = await JobApplicationModel.getApplicant(appId);
    assert.ok(applicantLookup, 'Associated applicant user should be found');
    assert.strictEqual(applicantLookup.id, 2);

    const jobApplications = await JobPostingModel.getApplications(101);
    assert.strictEqual(jobApplications.length, 2, 'Job posting should show 2 applications');

    const userApplications = await UserModel.getJobApplications(2);
    assert.strictEqual(userApplications.length, 1, 'User should show 1 application');
    console.log('  ✅ Relational model association lookups verified');

    // -------------------------------------------------------------------------
    // TEST 6: HTTP Server Direct & Nested Endpoints
    // -------------------------------------------------------------------------
    console.log('\nTest 6: HTTP Server Endpoints (Direct & Nested)');
    const PORT = 8089;
    const server = http.createServer(async (req, res) => {
        const handleApiUserRoutes = require('./routes/apiUserRoutes');
        const handleApiJobRoutes = require('./routes/apiJobRoutes');
        const handleApiJobApplicationRoutes = require('./routes/apiJobApplicationRoutes');

        if (handleApiUserRoutes(req, res)) return;
        if (handleApiJobRoutes(req, res)) return;
        if (handleApiJobApplicationRoutes(req, res)) return;

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    });

    await new Promise((resolve) => server.listen(PORT, resolve));

    try {
        // Direct GET /api/applications
        const resList = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/applications?status=interview_scheduled',
            method: 'GET'
        });
        assert.strictEqual(resList.statusCode, 200);
        assert.strictEqual(resList.body.applications.length, 1);
        assert.strictEqual(resList.body.applications[0].status, 'interview_scheduled');

        // Direct GET /api/applications/:id
        const resDetail = await request({
            hostname: 'localhost',
            port: PORT,
            path: `/api/applications/${appId}`,
            method: 'GET'
        });
        assert.strictEqual(resDetail.statusCode, 200);
        assert.strictEqual(resDetail.body.id, appId);
        assert.ok(resDetail.body.job, 'Detail must include job relation');
        assert.ok(resDetail.body.applicant, 'Detail must include applicant relation');

        // Direct PATCH /api/applications/:id/status
        const resStatus = await request({
            hostname: 'localhost',
            port: PORT,
            path: `/api/applications/${appId}/status`,
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        }, {
            status: 'shortlisted',
            review_notes: 'Teknik mülakat başarılı geçti, kısa listeye alındı.'
        });
        assert.strictEqual(resStatus.statusCode, 200);
        assert.strictEqual(resStatus.body.application.status, 'shortlisted');

        // Direct POST /api/applications/:id/interview
        const resInterview = await request({
            hostname: 'localhost',
            port: PORT,
            path: `/api/applications/${appId}/interview`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            interview_date: '2026-11-10T10:00:00.000Z',
            review_notes: 'İkinci aşama mimarlık mülakatı'
        });
        assert.strictEqual(resInterview.statusCode, 200);
        assert.strictEqual(resInterview.body.application.status, 'interview_scheduled');

        // Nested GET /api/jobs/:jobId/applications
        const resJobApps = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/jobs/101/applications',
            method: 'GET'
        });
        assert.strictEqual(resJobApps.statusCode, 200);
        assert.strictEqual(resJobApps.body.total_applications, 2);

        // Nested GET /api/users/:userId/applications
        const resUserApps = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/users/2/applications',
            method: 'GET'
        });
        assert.strictEqual(resUserApps.statusCode, 200);
        assert.strictEqual(resUserApps.body.total_applications, 1);

        // Nested POST /api/users/:userId/applications for a new job
        const secondJob = {
            id: 102,
            company_name: 'Cloud Tech',
            title: 'DevOps Engineer',
            status: 'open'
        };
        JobPostingModel.jobs.push(secondJob);

        const resNestedUserSubmit = await request({
            hostname: 'localhost',
            port: PORT,
            path: '/api/users/2/applications',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            job_id: 102,
            cover_letter: 'Kubernetes ve Docker uzmanlığımla başvuruyorum.',
            expected_salary: 90000,
            notice_period_days: 30
        });
        assert.strictEqual(resNestedUserSubmit.statusCode, 201);
        assert.strictEqual(resNestedUserSubmit.body.application.user_id, 2);
        assert.strictEqual(resNestedUserSubmit.body.application.job_id, 102);

        // Direct DELETE /api/applications/:id
        const resDelete = await request({
            hostname: 'localhost',
            port: PORT,
            path: `/api/applications/${resNestedUserSubmit.body.application.id}`,
            method: 'DELETE'
        });
        assert.strictEqual(resDelete.statusCode, 200);

        console.log('  ✅ HTTP Server Direct and Nested endpoints successfully verified');
    } finally {
        server.close();
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Verified.');
})();
