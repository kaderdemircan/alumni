if (document.querySelector('.site-nav[data-admin="true"]')) {
    document.querySelectorAll('[data-admin-only]').forEach(element => { element.hidden = false; });
}

const siteSettingsForm = document.getElementById('site-settings-form');
if (siteSettingsForm) {
    siteSettingsForm.addEventListener('submit', event => {
        event.preventDefault();
        const selections = new FormData(siteSettingsForm);
        const secure = location.protocol === 'https:' ? '; Secure' : '';
        for (const key of ['language', 'theme']) {
            document.cookie = `alumni_${key}=${encodeURIComponent(selections.get(key))}; Path=/; SameSite=Lax; Max-Age=31536000${secure}`;
        }
        location.reload();
    });

    siteSettingsForm.closest('details').addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        const settings = event.currentTarget;
        settings.open = false;
        settings.querySelector('summary').focus();
    });
}
