const { workspace } = require('../config/roles');
const escapeHtml = require('./escapeHtml');
const { sitePreferences, renderSiteSettings } = require('./sitePreferences');

const links = [
    ['/', 'Home', 'Ana Sayfa'],
    ['/about', 'About', 'Hakkımızda'],
    ['/users', 'Directory', 'Üye Rehberi'],
    ['/announcements', 'Announcements', 'Duyurular'],
    ['/jobs', 'Careers', 'Kariyer'],
    ['/mentorship', 'Mentorship', 'Mentorluk'],
    ['/api/swagger', 'API Docs', 'API Belgeleri']
];

function renderNavigation(html, req) {
    if (!html.includes('<!-- SITE_NAVIGATION -->')) return html;
    const preferences = sitePreferences(req);
    const { language, theme, t } = preferences;
    const pathname = req.url.split('?')[0];
    const session = req.session;
    const isAdmin = session?.role === 'admin';
    const page = workspace(session?.role);
    const hubLabels = { student: 'Öğrenci Merkezi', alumni: 'Mezun Merkezi', staff: 'Personel Merkezi', admin: 'Yönetim Paneli' };

    function link(href, label, className = '') {
        const pageIsActive = pathname === href;
        const sectionIsActive = href !== '/' && pathname.startsWith(href + '/');
        const active = pageIsActive ? ' aria-current="page"' : sectionIsActive ? ' aria-current="location"' : '';
        return `<a class="${className}" href="${href}"${active}>${escapeHtml(label)}</a>`;
    }

    const account = session?.isLoggedIn
        ? `${session.pendingAlumni ? '' : link(page.path, language === 'tr' ? hubLabels[page.role] : page.title, 'site-nav__hub')}
           ${link('/profile', t.profile, 'site-nav__button')}
           <form method="post" action="/logout">
               <button class="site-nav__button site-nav__button--primary" type="submit">${t.signOut}</button>
           </form>`
        : `${link('/login', t.signIn, 'site-nav__button')}
           ${link('/register', t.register, 'site-nav__button site-nav__button--primary')}`;

    return html.replace(/<html(?=\s|>)/i, `<html data-site-theme="${theme}"`)
        .replace('</body>', () => renderSiteSettings(preferences) + '</body>')
        .replace('<!-- SITE_NAVIGATION -->', () => `
        <header class="site-nav" lang="${language}"${isAdmin ? ' data-admin="true"' : ''}>
            <div class="site-nav__inner">
                <a class="site-nav__brand" href="/">Alumni Network</a>
                <nav class="site-nav__links" aria-label="${t.main}">
                    ${links.map(([url, en, tr]) => link(url, language === 'tr' ? tr : en)).join('')}
                </nav>
                <nav class="site-nav__account" aria-label="${t.account}">
                    ${account}
                </nav>
            </div>
        </header>`);
}

module.exports = renderNavigation;
