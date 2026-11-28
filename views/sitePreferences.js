const parseCookies = require('../middleware/cookieParser');

const labels = {
    en: { settings: 'Settings', language: 'Language', appearance: 'Appearance', light: 'Light', dark: 'Dark', save: 'Apply', main: 'Main navigation', account: 'Account', profile: 'My Profile', signIn: 'Sign In', register: 'Register', signOut: 'Sign Out' },
    tr: { settings: 'Ayarlar', language: 'Dil', appearance: 'Görünüm', light: 'Açık', dark: 'Koyu', save: 'Uygula', main: 'Ana menü', account: 'Hesap', profile: 'Profilim', signIn: 'Giriş Yap', register: 'Kayıt Ol', signOut: 'Çıkış Yap' }
};

function sitePreferences(req) {
    if (!req.cookies) parseCookies(req);
    const language = req.cookies.alumni_language === 'tr' ? 'tr' : req.cookies.alumni_language === 'en' ? 'en' :
        req.session?.adminLanguage === 'tr' ? 'tr' : 'en';
    const theme = req.cookies.alumni_theme === 'dark' ? 'dark' : req.cookies.alumni_theme === 'light' ? 'light' :
        req.session?.adminTheme === 'dark' ? 'dark' : 'light';
    return { language, theme, t: labels[language] };
}

function renderSiteSettings({ language, theme, t }) {
    return `<details class="site-settings" lang="${language}">
        <summary><span aria-hidden="true">⚙</span> ${t.settings}</summary>
        <form class="site-settings__panel" id="site-settings-form">
            <label for="site-language">${t.language}</label>
            <select id="site-language" name="language">
                <option value="en"${language === 'en' ? ' selected' : ''}>English</option>
                <option value="tr"${language === 'tr' ? ' selected' : ''}>Türkçe</option>
            </select>
            <label for="site-theme">${t.appearance}</label>
            <select id="site-theme" name="theme">
                <option value="light"${theme === 'light' ? ' selected' : ''}>${t.light}</option>
                <option value="dark"${theme === 'dark' ? ' selected' : ''}>${t.dark}</option>
            </select>
            <button type="submit">${t.save}</button>
        </form>
    </details>
    <script defer src="/nav.js"></script>`;
}

module.exports = { sitePreferences, renderSiteSettings };
