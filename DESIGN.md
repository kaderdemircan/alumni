# Alumni Tracking System
## Design System Specification — Ease Health Architecture

> Editorial authority meets academic community: A refined cream canvas layered with warm yellow washes, cool slate-blue product panels, and deep obsidian-black ink.

Adapted from the **Ease Health Design System** (Refero Styles UUID: `e9f5e976-53f7-42f5-a882-4e63b3c2f734`) for the **Alumni Tracking System**, preserving the strict brand palette: **Black, White, Yellow, and Blue**.

---

## 📌 Design Philosophy & Essence

Ease Health rejects corporate cookie-cutter UI and heavy drop-shadows. Instead, it creates depth and calm through:
1. **Weight 300 Display Serif Typography (`Faire Octave` / `Cormorant Garamond`):** Quiet, editorial authority for all major headings. Never bolded. Tight letter spacing (`-0.01em` to `-0.03em`).
2. **Humanist Sans (`Suisse Intl` / `Inter`):** Precision body copy at 14px and tiny 11px uppercase eyebrow labels with `0.08em` tracking.
3. **Layered Flat Surfaces (No Shadows):** `boxShadow: none` across the entire system. Elevation is communicated strictly through tinted surface washes: Cream Paper → Soft Butter Wash → Warm Sand → Slate Hush Blue.
4. **Architectural Radii:** Strict `14px` on cards and buttons, `999px` on pills and tags, `7px` on interactive nav items.
5. **Generous Spacing:** `28px–42px` internal card padding, `64px–96px` section gaps.

---

## 🎨 1. Color Palette Tokens (Black, White, Yellow, Blue Adaptation)

| Token Name | CSS Variable | Value | Role in Alumni Tracking System |
|:---|:---|:---|:---|
| **Deep Ink Black** | `--color-forest-ink` / `--color-ink` | `#111111` | Primary action buttons, headings, links, icon strokes — deep saturated ink |
| **Warm Sand / Gold Wash** | `--color-sage-mist` / `--color-yellow-wash` | `#f4d03f` / `#fef08a` | Mid-tone card backgrounds and decorative washes, panel-level surfaces |
| **Light Butter Wash** | `--color-keylime-wash` / `--color-cream-wash` | `#fef9e7` | Hero panel background, light card surfaces — dominant tinted canvas |
| **Soft Amber Veil** | `--color-mint-veil` / `--color-amber-veil` | `#fae588` | Accent card surfaces, soft section dividers between layers |
| **Slate Hush Blue** | `--color-slate-hush` | `#b6ced5` | Cool counter-balance panel for product preview and feature blocks |
| **Deep Ocean Blue** | `--color-blue-ink` | `#2980b9` | Supporting interactive link color and brand accent |
| **Cream Paper** | `--color-cream-paper` | `#fffefc` | Page background, badge backgrounds, button text — warm off-white |
| **Charcoal** | `--color-charcoal` | `#222222` | Navigation text, body copy, and minor UI strokes |
| **Border Mist** | `--color-border-mist` | `#efeeeb` | Hairline dividers and subtle 1px borders throughout the layout |
| **Ink Shadow** | `--color-forest-shadow` / `--color-ink-deep`| `#0a0a0a` | Hover states on primary buttons |

---

## ✍️ 2. Typography Specification

### Font Families
- **Display Serif (`--font-faire-octave`):** `'Faire Octave'`, `'Cormorant Garamond'`, `'Playfair Display'`, Georgia, serif.
  - Used for ALL headings (Display, H1, H2, H3).
  - Always **Weight 300 (Light)**. Never bolded.
  - Tracking tightens as size increases: `-0.01em` at 40px, `-0.03em` at 56px–74px.
- **Humanist Sans (`--font-suisse-intl`):** `'Suisse Intl'`, `'Inter'`, system-ui, -apple-system, sans-serif.
  - Used for body copy (14px/400), buttons (14px/400), navigation (14px/400), and eyebrows (11px/600 uppercase, `letter-spacing: 0.08em`).

### Type Scale

| Level | Size | Weight | Line Height | Tracking | Token |
|:---|:---|:---|:---|:---|:---|
| **Caption** | 10px | 400 | 1.61 | 0em | `--text-caption` |
| **Eyebrow** | 11px | 600 | 1.50 | 0.08em (UPPERCASE) | `--text-eyebrow` |
| **Body** | 14px | 400 | 1.50 | 0em | `--text-body` |
| **Subheading** | 18px | 400 | 1.30 | 0em | `--text-subheading` |
| **Heading SM** | 23px | 400 | 1.50 | 0em | `--text-heading-sm` |
| **Heading** | 40px | 300 | 1.35 | -0.01em | `--text-heading` |
| **Heading LG** | 56px | 300 | 1.20 | -0.03em | `--text-heading-lg` |
| **Display** | 74px | 300 | 1.05 | -0.03em | `--text-display` |

---

## 📐 3. Spacing, Radii & Layout Scale

### Spacing Scale
- `4px`, `7px`, `9px`, `11px`, `14px`, `18px`, `21px`, `28px`, `35px`, `42px`, `49px`, `56px`, `70px`, `76px`, `99px`, `156px`.

### Border Radii
- **Navigation Items:** `7px`
- **Cards & Outer Shells:** `14px` (`14.08px`)
- **Pill Badges & Tags:** `999px`
- **Action Buttons:** `14px` or `9999px` (Full capsule)

### Layout Rules
- **Container Max-Width:** `1200px` centered.
- **Section Gap:** `64px`–`96px` vertical rhythm.
- **Card Padding:** `28px`–`42px` all sides.
- **Shadows:** `box-shadow: none` strictly enforced. Depth is expressed exclusively through tinted surface contrast.

---

## 🧩 4. Full Component Blueprints

### 4.1. Navigation Bar Component
```html
<header class="ease-nav-wrapper">
    <div class="ease-nav-container">
        <!-- Logo -->
        <a href="/" class="ease-brand-lockup">
            <span class="ease-brand-mark">●</span>
            <span class="ease-brand-text">Alumni Tracking System</span>
        </a>

        <!-- Centered Navigation Links -->
        <nav class="ease-nav-links">
            <a href="/" class="ease-nav-item active">Home</a>
            <a href="/about" class="ease-nav-item">About Us</a>
            <a href="/users" class="ease-nav-item">Alumni Directory</a>
            <a href="/announcements" class="ease-nav-item">Announcements</a>
            <a href="/api/swagger" class="ease-nav-item">API Docs</a>
        </nav>

        <!-- Right CTA Button -->
        <div class="ease-nav-cta">
            <a href="/users" class="ease-btn-primary ease-btn-sm">
                <span>Join Network</span>
                <span class="btn-arrow">→</span>
            </a>
        </div>
    </div>
</header>
```
```css
.ease-nav-wrapper {
    background-color: var(--color-cream-paper);
    border-bottom: 1px solid var(--color-border-mist);
    padding: var(--spacing-14) var(--spacing-28);
}
.ease-nav-container {
    max-width: var(--page-max-width);
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.ease-brand-lockup {
    display: flex;
    align-items: center;
    gap: var(--spacing-9);
    text-decoration: none;
    color: var(--color-ink);
}
.ease-brand-mark {
    color: var(--color-ink);
    font-size: 18px;
}
.ease-brand-text {
    font-family: var(--font-suisse-intl);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.2px;
}
.ease-nav-links {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
}
.ease-nav-item {
    font-family: var(--font-suisse-intl);
    font-size: var(--text-body);
    color: var(--color-charcoal);
    text-decoration: none;
    padding: var(--spacing-7) var(--spacing-14);
    border-radius: var(--radius-nav);
    transition: background-color 0.15s ease;
}
.ease-nav-item:hover {
    background-color: var(--color-keylime-wash);
}
.ease-nav-item.active {
    font-weight: 600;
    color: var(--color-ink);
}
```

---

### 4.2. Product Page (Ease Health Two-Column Hero)
```html
<section class="ease-hero-section">
    <div class="ease-hero-grid">
        <!-- Left Column: Light Wash Panel -->
        <div class="ease-hero-panel-left">
            <div class="ease-eyebrow">COMMUNITY & CAREER PLATFORM</div>
            <h1 class="ease-hero-heading">Connecting graduates with lasting purpose.</h1>
            <p class="ease-hero-body">
                The official Alumni Tracking System bridges students, alumni, and institutions into a single verified network. Built to foster lifelong relationships and high-growth opportunities.
            </p>
            <div class="ease-hero-actions">
                <a href="/users" class="ease-btn-primary">
                    <span>Explore Directory</span>
                    <span class="btn-arrow">→</span>
                </a>
                <a href="/announcements" class="ease-tag-pill">Latest Announcements</a>
            </div>
        </div>

        <!-- Right Column: Slate Hush Panel with Floating UI Cards -->
        <div class="ease-hero-panel-right">
            <div class="ease-slate-wrapper">
                <div class="ease-eyebrow" style="color: #222;">ALUMNI PLATFORM MODULES</div>
                
                <!-- Floating Product Preview Card 1: Directory -->
                <div class="ease-preview-card">
                    <div class="preview-badge-row">
                        <span class="preview-pill">Directory</span>
                        <span class="preview-count">1,250+ Members</span>
                    </div>
                    <h3>Global Alumni Directory</h3>
                    <p>Instant verified cohort search by graduation year, degree, and current city.</p>
                </div>

                <!-- Floating Product Preview Card 2: Mentorship -->
                <div class="ease-preview-card">
                    <div class="preview-badge-row">
                        <span class="preview-pill">Mentorship</span>
                        <span class="preview-count">320+ Mentors</span>
                    </div>
                    <h3>1-on-1 Career Mentorship</h3>
                    <p>Direct industry advisory sessions connecting seniors with experienced alumni leaders.</p>
                </div>
            </div>
        </div>
    </div>
</section>
```
```css
.ease-hero-section {
    max-width: var(--page-max-width);
    margin: var(--spacing-42) auto var(--spacing-70);
    padding: 0 var(--spacing-21);
}
.ease-hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: var(--spacing-21);
}
.ease-hero-panel-left {
    background-color: var(--color-keylime-wash);
    border-radius: var(--radius-cards);
    padding: var(--spacing-42);
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.ease-eyebrow {
    font-family: var(--font-suisse-intl);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ink);
    margin-bottom: var(--spacing-14);
}
.ease-hero-heading {
    font-family: var(--font-faire-octave);
    font-size: var(--text-heading-lg);
    font-weight: var(--font-weight-light);
    line-height: var(--leading-heading-lg);
    letter-spacing: var(--tracking-heading-lg);
    color: var(--color-ink);
    margin-bottom: var(--spacing-21);
}
.ease-hero-body {
    font-family: var(--font-suisse-intl);
    font-size: var(--text-body);
    line-height: var(--leading-body);
    color: var(--color-charcoal);
    max-width: 480px;
    margin-bottom: var(--spacing-35);
}
.ease-hero-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-14);
}
.ease-hero-panel-right {
    background-color: var(--color-slate-hush);
    border-radius: var(--radius-cards);
    padding: var(--spacing-42);
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.ease-preview-card {
    background-color: var(--color-cream-paper);
    border-radius: var(--radius-cards);
    padding: var(--spacing-28);
    margin-top: var(--spacing-14);
}
.ease-preview-card h3 {
    font-family: var(--font-faire-octave);
    font-size: 21px;
    font-weight: 300;
    color: var(--color-ink);
    margin: var(--spacing-7) 0;
}
.ease-preview-card p {
    font-family: var(--font-suisse-intl);
    font-size: 13px;
    color: var(--color-charcoal);
    line-height: 1.5;
    margin: 0;
}
.preview-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.preview-pill {
    background: var(--color-keylime-wash);
    color: var(--color-ink);
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 999px;
}
.preview-count {
    font-size: 12px;
    color: #555;
}
```

---

### 4.3. Alumni List Component (Directory Table & Cards)
```html
<section class="ease-directory-section">
    <div class="ease-section-header">
        <div class="ease-eyebrow">VERIFIED MEMBERS</div>
        <h2 class="ease-section-heading">Alumni Directory</h2>
        <p class="ease-section-sub">Search, connect, and collaborate with verified alumni members.</p>
    </div>

    <!-- Ease Health Layered Table Surface -->
    <div class="ease-table-shell">
        <div class="ease-table-controls">
            <input type="text" class="ease-input" placeholder="Search alumnus by name or faculty...">
            <a href="/users" class="ease-btn-primary ease-btn-sm">+ Register Alumnus</a>
        </div>

        <table class="ease-table">
            <thead>
                <tr>
                    <th># ID</th>
                    <th>Full Name</th>
                    <th>Age</th>
                    <th>Birth Date</th>
                    <th>Status</th>
                    <th style="text-align: right;">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>#101</strong></td>
                    <td>
                        <span class="user-name">Jane Doe</span>
                        <span class="user-sub">Computer Engineering</span>
                    </td>
                    <td>28</td>
                    <td>1998-04-12</td>
                    <td><span class="ease-tag-pill">Active Alum</span></td>
                    <td style="text-align: right;">
                        <a href="/users/1" class="ease-link">View Profile →</a>
                    </td>
                </tr>
                <tr>
                    <td><strong>#102</strong></td>
                    <td>
                        <span class="user-name">Marcus Chen</span>
                        <span class="user-sub">Business Administration</span>
                    </td>
                    <td>31</td>
                    <td>1995-09-24</td>
                    <td><span class="ease-tag-pill">Mentor</span></td>
                    <td style="text-align: right;">
                        <a href="/users/2" class="ease-link">View Profile →</a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
```
```css
.ease-directory-section {
    max-width: var(--page-max-width);
    margin: var(--spacing-70) auto;
    padding: 0 var(--spacing-21);
}
.ease-section-heading {
    font-family: var(--font-faire-octave);
    font-size: var(--text-heading);
    font-weight: var(--font-weight-light);
    color: var(--color-ink);
    margin: var(--spacing-7) 0 var(--spacing-14);
}
.ease-table-shell {
    background-color: var(--color-keylime-wash);
    border-radius: var(--radius-cards);
    padding: var(--spacing-35);
    margin-top: var(--spacing-28);
}
.ease-table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-21);
}
.ease-input {
    background-color: var(--color-cream-paper);
    border: 1px solid var(--color-border-mist);
    border-radius: var(--radius-cards);
    padding: var(--spacing-11) var(--spacing-18);
    font-family: var(--font-suisse-intl);
    font-size: var(--text-body);
    width: 320px;
}
.ease-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-cream-paper);
    border-radius: var(--radius-cards);
    overflow: hidden;
}
.ease-table th {
    font-family: var(--font-suisse-intl);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ink);
    padding: var(--spacing-14) var(--spacing-21);
    border-bottom: 1px solid var(--color-border-mist);
    text-align: left;
    background: var(--color-cream-paper);
}
.ease-table td {
    padding: var(--spacing-18) var(--spacing-21);
    border-bottom: 1px solid var(--color-border-mist);
    font-family: var(--font-suisse-intl);
    font-size: var(--text-body);
}
.user-name {
    display: block;
    font-weight: 600;
    color: var(--color-ink);
}
.user-sub {
    display: block;
    font-size: 12px;
    color: #666;
}
.ease-link {
    color: var(--color-ink);
    font-weight: 600;
    text-decoration: none;
    font-size: 13px;
}
```

---

### 4.4. Alumni Profile Component (Clinical Showcase Card)
```html
<section class="ease-profile-showcase">
    <div class="ease-eyebrow">FEATURED ALUMNUS</div>
    <div class="ease-profile-grid">
        <!-- Profile Main Card (White on Slate) -->
        <div class="ease-profile-card">
            <div class="profile-header">
                <div>
                    <h2 class="profile-name">Jane Doe</h2>
                    <span class="profile-title">Lead Software Architect at TechCorp • Class of 2020</span>
                </div>
                <span class="ease-tag-pill">Verified Mentor</span>
            </div>

            <div class="profile-meta-grid">
                <div class="meta-item">
                    <span class="meta-label">ID</span>
                    <span class="meta-val">#101</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">AGE</span>
                    <span class="meta-val">28 Years</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">BIRTHDAY</span>
                    <span class="meta-val">1998-04-12</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">FACULTY</span>
                    <span class="meta-val">Computer Engineering</span>
                </div>
            </div>

            <div class="profile-bio">
                <p>Jane specializes in high-throughput distributed systems and cloud databases. As an active alumnus, she hosts technical mock interviews and sponsors senior capstone projects.</p>
            </div>

            <div class="profile-actions">
                <a href="/users" class="ease-btn-primary ease-btn-sm">Connect with Jane →</a>
            </div>
        </div>
    </div>
</section>
```
```css
.ease-profile-showcase {
    max-width: var(--page-max-width);
    margin: var(--spacing-70) auto;
    padding: 0 var(--spacing-21);
}
.ease-profile-card {
    background-color: var(--color-cream-paper);
    border: 1px solid var(--color-border-mist);
    border-radius: var(--radius-cards);
    padding: var(--spacing-42);
}
.profile-name {
    font-family: var(--font-faire-octave);
    font-size: var(--text-heading);
    font-weight: 300;
    color: var(--color-ink);
    margin: 0 0 var(--spacing-7);
}
.profile-title {
    font-family: var(--font-suisse-intl);
    font-size: 14px;
    color: #555;
}
.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--color-border-mist);
    padding-bottom: var(--spacing-21);
    margin-bottom: var(--spacing-28);
}
.profile-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-21);
    margin-bottom: var(--spacing-28);
}
.meta-item {
    background: var(--color-keylime-wash);
    padding: var(--spacing-14) var(--spacing-18);
    border-radius: var(--radius-cards);
}
.meta-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--color-ink);
    margin-bottom: var(--spacing-4);
}
.meta-val {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-ink);
}
.profile-bio p {
    font-size: var(--text-body);
    line-height: 1.65;
    color: var(--color-charcoal);
    margin-bottom: var(--spacing-28);
}
```

---

### 4.5. Footer Component
```html
<footer class="ease-footer">
    <div class="ease-footer-container">
        <div class="footer-brand-col">
            <div class="ease-brand-lockup">
                <span class="ease-brand-mark">●</span>
                <span class="ease-brand-text">Alumni Tracking System</span>
            </div>
            <p class="footer-desc">
                An editorial-grade alumni connection platform fostering lifelong engagement between graduates, students, and university faculties.
            </p>
            <span class="ease-tag-pill">Zero-Dependency Node.js MVC</span>
        </div>

        <div class="footer-col">
            <span class="footer-eyebrow">PLATFORM</span>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/users">Alumni Directory</a></li>
                <li><a href="/announcements">Announcements</a></li>
            </ul>
        </div>

        <div class="footer-col">
            <span class="footer-eyebrow">DEVELOPER APIS</span>
            <ul>
                <li><a href="/api/swagger">Interactive Swagger</a></li>
                <li><a href="/api/swagger.json">OpenAPI 3.0 Spec</a></li>
                <li><a href="/api/health">System Health Check</a></li>
                <li><a href="/api/users">REST Users API</a></li>
            </ul>
        </div>
    </div>

    <div class="ease-footer-bottom">
        <div class="footer-bottom-inner">
            <span>© 2026 Alumni Tracking System. All rights reserved.</span>
            <span>Ease Health Architectural System • Palette: Black, White, Yellow, Blue</span>
        </div>
    </div>
</footer>
```
```css
.ease-footer {
    background-color: var(--color-cream-paper);
    border-top: 1px solid var(--color-border-mist);
    margin-top: var(--spacing-99);
}
.ease-footer-container {
    max-width: var(--page-max-width);
    margin: 0 auto;
    padding: var(--spacing-70) var(--spacing-21) var(--spacing-42);
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: var(--spacing-42);
}
.footer-desc {
    font-size: var(--text-body);
    color: #666;
    line-height: 1.6;
    max-width: 380px;
    margin: var(--spacing-14) 0 var(--spacing-21);
}
.footer-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--color-ink);
    display: block;
    margin-bottom: var(--spacing-14);
}
.footer-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.footer-col li {
    margin-bottom: var(--spacing-9);
}
.footer-col a {
    color: var(--color-charcoal);
    text-decoration: none;
    font-size: var(--text-body);
}
.footer-col a:hover {
    color: var(--color-ink);
}
.ease-footer-bottom {
    border-top: 1px solid var(--color-border-mist);
    padding: var(--spacing-21);
    font-size: 12px;
    color: #777;
}
.footer-bottom-inner {
    max-width: var(--page-max-width);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
}
```

---

## 🚫 5. Critical Do's and Don'ts

### ✅ Do
- **Always use weight 300 for Faire Octave headings** — never bold display serifs.
- **Always use `box-shadow: none`** — build depth strictly through layered tinted fills (`Cream` → `Keylime Wash` → `Sage/Yellow` → `Slate Hush`).
- **Use `14px` border-radius** on all cards, buttons, and panels.
- **Use `999px` border-radius** on all pills and status tags.
- **Set all eyebrows to 11px / weight 600 / `0.08em` tracking / UPPERCASE**.

### ❌ Don't
- **Never add drop-shadows or glow effects.**
- **Never use colored borders on cards** — depth comes from fill contrast, not thick strokes.
- **Never use bold serifs.**
- **Never introduce unapproved neon or saturated secondary colors** — keep strictly to Black, White, Yellow, and Blue.

---

*Alumni Tracking System • Ease Health Design Specification v2.0 • 2026*
