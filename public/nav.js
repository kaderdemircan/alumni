if (document.querySelector('.site-nav[data-admin="true"]')) {
    document.querySelectorAll('[data-admin-only]').forEach(element => { element.hidden = false; });
}
