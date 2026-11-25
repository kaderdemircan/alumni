const roles = {
    student: { label: 'Student', path: '/student', title: 'Student Hub', summary: 'Explore internships, prepare for your first role, and connect with alumni.', links: [['/jobs', 'Browse jobs and internships'], ['/mentorship', 'Find career guidance']] },
    alumni: { label: 'Alumni', path: '/alumni-hub', title: 'Alumni Hub', summary: 'Reconnect with the university community and explore your next career move.', links: [['/users', 'Explore the member directory'], ['/mentorship', 'Visit the mentorship hub'], ['/jobs', 'Explore career opportunities']] },
    staff: { label: 'University Staff', path: '/staff', title: 'University Staff Hub', summary: 'Keep up with campus news and connect with students and graduates.', links: [['/announcements', 'Read university announcements'], ['/users', 'Browse the member directory']] },
    admin: { label: 'Administrator', path: '/admin', title: 'Admin Panel', links: [] }
};

function workspace(role) {
    const key = Object.hasOwn(roles, role) ? role : 'alumni';
    return { role: key, ...roles[key] };
}

module.exports = { workspace };
