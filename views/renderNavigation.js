const { workspace } = require('../config/roles');
const escapeHtml = require('./escapeHtml');

const links = [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/users', 'Directory'],
    ['/announcements', 'Announcements'],
    ['/jobs', 'Careers'],
    ['/mentorship', 'Mentorship'],
    ['/api/swagger', 'API Docs']
];

function renderNavigation(html, req) {
    const pathname = req.url.split('?')[0];
    const session = req.session;
    const isAdmin = session?.role === 'admin';
    const page = workspace(session?.role);

    function link(href, label, className = '') {
        const pageIsActive = pathname === href;
        const sectionIsActive = href !== '/' && pathname.startsWith(href + '/');
        const active = pageIsActive ? ' aria-current="page"' : sectionIsActive ? ' aria-current="location"' : '';
        return `<a class="${className}" href="${href}"${active}>${escapeHtml(label)}</a>`;
    }

    const account = session?.isLoggedIn
        ? `${link(page.path, page.title, 'site-nav__hub')}
           ${link('/profile', 'My Profile', 'site-nav__button')}
           <form method="post" action="/logout">
               <button class="site-nav__button site-nav__button--primary" type="submit">Sign Out</button>
           </form>`
        : `${link('/login', 'Sign In', 'site-nav__button')}
           ${link('/register', 'Register', 'site-nav__button site-nav__button--primary')}`;

    return html.replace('<!-- SITE_NAVIGATION -->', () => `
        <header class="site-nav"${isAdmin ? ' data-admin="true"' : ''}>
            <div class="site-nav__inner">
                <a class="site-nav__brand" href="/">Alumni Network</a>
                <nav class="site-nav__links" aria-label="Main navigation">
                    ${links.map(([url, label]) => link(url, label)).join('')}
                </nav>
                <nav class="site-nav__account" aria-label="Account">
                    ${account}
                </nav>
            </div>
        </header>`);
}

module.exports = renderNavigation;
