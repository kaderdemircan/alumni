/**
 * nav.js — Client-side navigation state manager
 * Runs on every page. Reads the userId cookie and toggles
 * the right-hand nav buttons between:
 *   Guest:    [Login] [Register]
 *   LoggedIn: [My Profile] [Logout]
 */
(function() {
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    const userId   = getCookie('userId');
    const userName = getCookie('userName');
    const userRole = getCookie('userRole');
    const ctaEl    = document.getElementById('nav-cta');
    if (!ctaEl) return;

    if (userId) {
        // --- Logged-in state ---
        const roleLabel = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';
        ctaEl.innerHTML = `
            <span style="font-size:13px;color:#555;margin-right:8px;">${userName || ''} <span style="background:#fef08a;padding:2px 8px;border-radius:999px;font-weight:600;font-size:11px;text-transform:uppercase;">${roleLabel}</span></span>
            <a href="/profile" class="ease-btn-secondary ease-btn-sm" style="margin-right:8px;">My Profile</a>
            <a href="/logout" class="ease-btn-primary ease-btn-sm" style="background:#111;">Logout</a>
        `;
    } else {
        // --- Guest state ---
        ctaEl.innerHTML = `
            <a href="/login" class="ease-btn-secondary ease-btn-sm" style="margin-right:8px;">Login</a>
            <a href="/register" class="ease-btn-primary ease-btn-sm">Register <span>→</span></a>
        `;
    }
})();
