# Alumni Tracking System
## Brand Identity & Web Design System Guidelines

A comprehensive design system, UI component library, and frontend specification for the **Alumni Tracking System** web platform.

---

## 📌 Table of Contents
1. [Brand Overview & Identity](#1-brand-overview--identity)
2. [Strict Color Palette (Black, White, Yellow, Blue)](#2-strict-color-palette-black-white-yellow-blue)
3. [Typography & Layout System](#3-typography--layout-system)
4. [Logo Specification](#4-logo-specification)
5. [Core Components](#5-core-components)
   - [5.1. Logo](#51-logo-component)
   - [5.2. Header](#52-header-component)
   - [5.3. Menu (Navigation)](#53-menu-navigation-component)
   - [5.4. Product Page (Landing & Features)](#54-product-page-component)
   - [5.5. Alumni List (Directory Table & Cards)](#55-alumni-list-component)
   - [5.6. Alumni Profile (Detail Card)](#56-alumni-profile-component)
   - [5.7. Footer](#57-footer-component)
6. [CSS Design Tokens & Commands](#6-css-design-tokens--commands)
7. [Design Principles & Best Practices](#7-design-principles--best-practices)

---

## 1. Brand Overview & Identity

### Identity Essence
- **Official System Title:** `Alumni Tracking System`
- **Tagline:** *Connecting Alumni, Empowering Careers, Celebrating Legacy*
- **Aesthetic:** Modern, airy SaaS design inspired by soft architectural rounded panels, clean 1px structural hairlines, generous breathing room, and a disciplined, high-contrast 4-color palette.

### Core Brand Pillars
1. **Network (Connection):** Bridging graduates across graduation years, faculties, and industries.
2. **Growth (Excellence):** Facilitating career advancement, mentorship opportunities, and job placement.
3. **Heritage (Pride):** Maintaining an enduring bond with the alma mater.
4. **Reliability (Simplicity):** Fast, accessible, zero-dependency web interface built with pure semantic HTML5, CSS3, and JavaScript.

---

## 2. Strict Color Palette (Black, White, Yellow, Blue)

The visual identity strictly adheres to four foundational colors: **Black**, **White**, **Yellow**, and **Blue**. No unauthorized tertiary colors are permitted.

| Color Name | Token Variable | Hex Code | RGB | Role & Usage |
|:---|:---|:---|:---|:---|
| **Primary Blue** | `--clr-blue` | `#3498db` | `rgb(52, 152, 219)` | Primary brand color, interactive buttons, nav highlights, links, focus rings |
| **Deep Blue (Hover)**| `--clr-blue-dark` | `#2980b9` | `rgb(41, 128, 185)` | Hover states for blue buttons, gradient accents |
| **Light Blue Tint** | `--clr-blue-light`| `#ebf5fb` | `rgb(235, 245, 251)` | Subtle active backgrounds, soft card fills, info badges |
| **Accent Yellow** | `--clr-yellow` | `#f1c40f` | `rgb(241, 196, 15)` | Attention points, badges, borders, highlights, ratings |
| **Warm Yellow Tint** | `--clr-yellow-light` | `#fef9e7` | `rgb(254, 249, 231)` | Chip backgrounds, alert panels, warning cards |
| **Pure Black / Charcoal** | `--clr-black` | `#111111` | `rgb(17, 17, 17)` | Top header bars, primary typography, high-contrast badges, footers |
| **Dark Neutral** | `--clr-gray-dark` | `#2c3e50` | `rgb(44, 62, 80)` | Headings, table text, secondary dark surfaces |
| **Pure White** | `--clr-white` | `#ffffff` | `rgb(255, 255, 255)` | Card backgrounds, modal surfaces, primary canvas |
| **Off-White Canvas** | `--clr-bg` | `#f8f9fa` | `rgb(248, 249, 250)` | Body background, soft container fills |
| **Border Gray** | `--clr-border` | `#e2e8f0` | `rgb(226, 232, 240)` | Clean structural 1px hairlines |

---

## 3. Typography & Layout System

### Font Families
- **Primary Interface:** `'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif`
- **Monospace (Code / IDs):** `'Courier New', Consolas, monospace`

### Typographic Hierarchy
- **Hero Title (Display):** `2.5rem` – `3.2rem` (40px–52px) · Weight: `800` (Extra Bold)
- **H1 (Page Title):** `2.0rem` – `2.4rem` (32px–38px) · Weight: `700` (Bold)
- **H2 (Section Header):** `1.5rem` – `1.8rem` (24px–29px) · Weight: `700` (Bold)
- **H3 (Card Title):** `1.15rem` – `1.3rem` (18px–21px) · Weight: `600` (Semi-Bold)
- **Body Text:** `1.0rem` (16px) · Line Height: `1.65` · Weight: `400`
- **Small / Metadata / Badges:** `0.75rem` – `0.85rem` (12px–14px) · Weight: `600`

### Spacing & Architecture
- **Base Grid Unit:** `8px` (`0.5rem`)
- **Container Radii:**
  - Extra Large Shells: `24px` – `32px` (Hero panels & showcase wrappers)
  - Standard Cards: `12px` – `16px`
  - Buttons & Inputs: `8px` – `10px`
  - Pill Badges: `9999px` (Full pill shape)
- **Borders:** Thin structural hairlines (`1px solid var(--clr-border)`) rather than heavy multi-layer shadows.

---

## 4. Logo Specification

### Concept
The official logo depicts an academic mortarboard intertwined with a global network node, rendered cleanly with geometric SVG vectors in **Primary Blue**, **Black**, and **Accent Yellow**.

### Logo Asset (Inline SVG)
```html
<div class="logo-wrapper">
    <svg class="logo-icon" viewBox="0 0 24 24" width="36" height="36" fill="none">
        <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="#3498db"/>
        <circle cx="12" cy="9" r="2.5" fill="#f1c40f"/>
    </svg>
    <div class="logo-text">
        <span class="logo-title">Alumni Tracking System</span>
        <span class="logo-subtitle">Community & Career Network</span>
    </div>
</div>
```

---

## 5. Core Components

### 5.1. Logo Component
```html
<!-- Logo Component Markup -->
<a href="/" class="brand-logo">
    <div class="brand-icon-box">
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/>
        </svg>
    </div>
    <div class="brand-text">
        <h2>Alumni Tracking System</h2>
        <span>Connect • Grow • Lead</span>
    </div>
</a>
```
```css
/* Logo Styling */
.brand-logo {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    text-decoration: none;
    color: var(--clr-black);
}
.brand-icon-box {
    width: 42px;
    height: 42px;
    background: var(--clr-black);
    color: var(--clr-yellow);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 3px solid var(--clr-blue);
}
.brand-icon-box svg {
    width: 24px;
    height: 24px;
}
.brand-text h2 {
    font-size: 1.15rem;
    font-weight: 800;
    margin: 0;
    color: var(--clr-black);
    line-height: 1.2;
}
.brand-text span {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--clr-blue);
    font-weight: 700;
}
```

---

### 5.2. Header Component
```html
<!-- Header Component Markup -->
<header class="app-header">
    <div class="header-container">
        <!-- Logo -->
        <a href="/" class="brand-logo">
            <div class="brand-icon-box">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg>
            </div>
            <div class="brand-text">
                <h2>Alumni Tracking System</h2>
                <span>Global Portal</span>
            </div>
        </a>

        <!-- Desktop Navigation Menu -->
        <nav class="header-nav">
            <a href="/" class="nav-item active">Home</a>
            <a href="/about" class="nav-item">About Us</a>
            <a href="/users" class="nav-item">Alumni Directory</a>
            <a href="/announcements" class="nav-item">Announcements</a>
            <a href="/api/swagger" class="nav-item">API Docs</a>
        </nav>

        <!-- Action CTA -->
        <div class="header-actions">
            <a href="/users" class="btn btn-primary btn-sm">Join Network</a>
        </div>
    </div>
</header>
```
```css
/* Header Styling */
.app-header {
    background: var(--clr-white);
    border-bottom: 3px solid var(--clr-blue);
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.85rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
```

---

### 5.3. Menu (Navigation) Component
```html
<!-- Navigation Menu with Pill Highlights -->
<nav class="nav-menu">
    <a href="/" class="menu-link active">Home</a>
    <a href="/about" class="menu-link">About Us</a>
    <a href="/users" class="menu-link">Alumni System</a>
    <a href="/announcements" class="menu-link">Announcements</a>
    <a href="/api/swagger" class="menu-link">API Docs</a>
</nav>
```
```css
/* Menu Styling */
.nav-menu {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}
.menu-link {
    color: var(--clr-black);
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 600;
    padding: 0.55rem 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
}
.menu-link:hover {
    background-color: var(--clr-yellow);
    color: var(--clr-black);
}
.menu-link.active {
    background-color: var(--clr-blue);
    color: var(--clr-white);
}
```

---

### 5.4. Product Page Component (Landing & Showcase)
```html
<!-- Product Showcase Hero & Feature Shells -->
<section class="product-hero">
    <div class="hero-shell">
        <div class="hero-badge">
            <span class="badge-dot"></span>
            <span>Official Alumni Tracking & Career Management System</span>
        </div>
        <h1 class="hero-heading">
            Connect With Graduates. <br>
            <span class="highlight-blue">Accelerate Careers</span> Across the Globe.
        </h1>
        <p class="hero-subtext">
            Welcome to the centralized platform connecting alumni, current students, and institutions. Discover verified peer networks, explore job boards, and mentor the leaders of tomorrow.
        </p>
        <div class="hero-button-group">
            <a href="/users" class="btn btn-primary">Browse Alumni Directory →</a>
            <a href="/announcements" class="btn btn-outline">Latest Announcements</a>
        </div>

        <!-- Metric Shells -->
        <div class="stats-row">
            <div class="stat-pill">
                <span class="stat-num">1,250+</span>
                <span class="stat-lbl">Active Alumni</span>
            </div>
            <div class="stat-pill">
                <span class="stat-num">48</span>
                <span class="stat-lbl">Global Hubs</span>
            </div>
            <div class="stat-pill">
                <span class="stat-num">320+</span>
                <span class="stat-lbl">Partner Companies</span>
            </div>
            <div class="stat-pill">
                <span class="stat-num">100%</span>
                <span class="stat-lbl">Verified Profiles</span>
            </div>
        </div>
    </div>
</section>
```
```css
/* Product Page Hero Styling */
.product-hero {
    padding: 3rem 1.5rem;
    background: var(--clr-bg);
}
.hero-shell {
    max-width: 1100px;
    margin: 0 auto;
    background: var(--clr-white);
    border: 1px solid var(--clr-border);
    border-radius: 28px;
    padding: 3.5rem 2.5rem;
    text-align: center;
    border-top: 6px solid var(--clr-blue);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: var(--clr-blue-light);
    color: var(--clr-blue-dark);
    font-size: 0.82rem;
    font-weight: 700;
    border-radius: 9999px;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(52, 152, 219, 0.2);
}
.badge-dot {
    width: 8px;
    height: 8px;
    background-color: var(--clr-yellow);
    border-radius: 50%;
}
.hero-heading {
    font-size: 2.8rem;
    font-weight: 800;
    color: var(--clr-black);
    line-height: 1.2;
    margin-bottom: 1.2rem;
}
.highlight-blue {
    color: var(--clr-blue);
}
.hero-subtext {
    font-size: 1.12rem;
    color: #4a5568;
    max-width: 720px;
    margin: 0 auto 2.2rem;
    line-height: 1.7;
}
.hero-button-group {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 3rem;
}
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.2rem;
    border-top: 1px solid var(--clr-border);
    padding-top: 2rem;
}
.stat-pill {
    padding: 1rem;
    background: var(--clr-bg);
    border-radius: 12px;
    border-bottom: 3px solid var(--clr-yellow);
}
.stat-num {
    display: block;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--clr-blue);
}
.stat-lbl {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--clr-black);
    text-transform: uppercase;
}
```

---

### 5.5. Alumni List Component (Directory Table & Cards)
```html
<!-- Alumni List Directory View -->
<div class="alumni-directory">
    <div class="directory-header">
        <div>
            <h2>Alumni Directory</h2>
            <p>Search, review, and manage verified alumni members</p>
        </div>
        <div class="directory-actions">
            <input type="text" class="search-field" placeholder="Search by name or degree...">
            <a href="#register" class="btn btn-primary btn-sm">+ Add Alumnus</a>
        </div>
    </div>

    <!-- Data Table Format -->
    <div class="table-container">
        <table class="alumni-table">
            <thead>
                <tr>
                    <th># ID</th>
                    <th>Full Name</th>
                    <th>Age</th>
                    <th>Birthday</th>
                    <th>Status</th>
                    <th style="text-align: right;">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>#101</strong></td>
                    <td class="name-cell">
                        <div class="avatar-sm">JD</div>
                        <div>
                            <span class="user-name">Jane Doe</span>
                            <span class="user-sub">Computer Engineering</span>
                        </div>
                    </td>
                    <td>28</td>
                    <td>1998-04-12</td>
                    <td><span class="pill-badge pill-active">Active Alum</span></td>
                    <td class="actions-cell">
                        <a href="/users/101" class="action-btn view-btn">View</a>
                        <a href="/users/101/edit" class="action-btn edit-btn">Edit</a>
                        <button class="action-btn delete-btn">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```
```css
/* Alumni List Styling */
.alumni-directory {
    background: var(--clr-white);
    border: 1px solid var(--clr-border);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}
.directory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid var(--clr-yellow);
    padding-bottom: 1rem;
}
.directory-header h2 {
    color: var(--clr-black);
    margin: 0;
    font-size: 1.6rem;
}
.directory-actions {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}
.search-field {
    padding: 0.65rem 1rem;
    border: 1px solid var(--clr-border);
    border-radius: 8px;
    font-size: 0.95rem;
}
.search-field:focus {
    outline: none;
    border-color: var(--clr-blue);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.15);
}
.table-container {
    overflow-x: auto;
}
.alumni-table {
    width: 100%;
    border-collapse: collapse;
}
.alumni-table th {
    background-color: var(--clr-black);
    color: var(--clr-white);
    padding: 12px 16px;
    font-size: 0.88rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.alumni-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--clr-border);
    font-size: 0.95rem;
    color: var(--clr-black);
}
.alumni-table tr:hover {
    background-color: var(--clr-blue-light);
}
.name-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.avatar-sm {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--clr-blue);
    color: var(--clr-white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.82rem;
}
.user-name {
    display: block;
    font-weight: 700;
    color: var(--clr-black);
}
.user-sub {
    display: block;
    font-size: 0.78rem;
    color: #666;
}
.pill-badge {
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    font-size: 0.78rem;
    font-weight: 700;
}
.pill-active {
    background: var(--clr-yellow);
    color: var(--clr-black);
}
.actions-cell {
    text-align: right;
    white-space: nowrap;
}
.action-btn {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 6px;
    font-size: 0.82rem;
    font-weight: 700;
    text-decoration: none;
    margin-left: 0.3rem;
    border: none;
    cursor: pointer;
}
.view-btn { background: var(--clr-blue); color: var(--clr-white); }
.edit-btn { background: var(--clr-yellow); color: var(--clr-black); }
.delete-btn { background: #e74c3c; color: var(--clr-white); }
```

---

### 5.6. Alumni Profile Component (Detail Card)
```html
<!-- Alumni Profile Card Component -->
<div class="profile-card">
    <div class="profile-header-banner">
        <div class="profile-avatar-large">JD</div>
    </div>
    <div class="profile-body">
        <div class="profile-title-row">
            <div>
                <h2 class="profile-fullname">Jane Doe</h2>
                <span class="profile-designation">Lead Software Architect at TechCorp</span>
            </div>
            <span class="pill-badge pill-active">Class of 2020</span>
        </div>

        <div class="profile-details-grid">
            <div class="detail-box">
                <span class="detail-label">Alumni ID</span>
                <span class="detail-val">#101</span>
            </div>
            <div class="detail-box">
                <span class="detail-label">Age</span>
                <span class="detail-val">28 Years Old</span>
            </div>
            <div class="detail-box">
                <span class="detail-label">Birth Date</span>
                <span class="detail-val">April 12, 1998</span>
            </div>
            <div class="detail-box">
                <span class="detail-label">Faculty</span>
                <span class="detail-val">Computer Engineering</span>
            </div>
        </div>

        <div class="profile-bio-box">
            <h4>Biography & Background</h4>
            <p>Jane graduated with high honors and specializes in high-throughput cloud architectures and distributed databases. She actively mentors senior students and participates in campus hackathons.</p>
        </div>

        <div class="profile-footer-actions">
            <a href="/users" class="btn btn-outline btn-sm">← Back to Directory</a>
            <a href="/users/101/edit" class="btn btn-primary btn-sm">Edit Profile</a>
        </div>
    </div>
</div>
```
```css
/* Alumni Profile Styling */
.profile-card {
    max-width: 760px;
    margin: 2rem auto;
    background: var(--clr-white);
    border: 1px solid var(--clr-border);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.profile-header-banner {
    height: 120px;
    background: linear-gradient(135deg, var(--clr-black) 0%, var(--clr-blue) 100%);
    position: relative;
    border-bottom: 4px solid var(--clr-yellow);
}
.profile-avatar-large {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: var(--clr-white);
    border: 4px solid var(--clr-white);
    color: var(--clr-blue);
    font-size: 2rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: -42px;
    left: 2rem;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}
.profile-body {
    padding: 3.5rem 2rem 2rem;
}
.profile-title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--clr-border);
    padding-bottom: 1.2rem;
    margin-bottom: 1.5rem;
}
.profile-fullname {
    font-size: 1.75rem;
    color: var(--clr-black);
    margin: 0 0 0.3rem;
}
.profile-designation {
    font-size: 0.95rem;
    color: var(--clr-blue);
    font-weight: 600;
}
.profile-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
    margin-bottom: 1.8rem;
}
.detail-box {
    background: var(--clr-bg);
    padding: 1rem;
    border-radius: 10px;
    border-left: 4px solid var(--clr-blue);
}
.detail-label {
    display: block;
    font-size: 0.78rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #718096;
    margin-bottom: 0.25rem;
}
.detail-val {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--clr-black);
}
.profile-bio-box {
    background: var(--clr-blue-light);
    border: 1px solid rgba(52, 152, 219, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.8rem;
}
.profile-bio-box h4 {
    margin: 0 0 0.5rem;
    color: var(--clr-blue-dark);
}
.profile-bio-box p {
    margin: 0;
    color: #2d3748;
    line-height: 1.6;
}
.profile-footer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--clr-border);
    padding-top: 1.5rem;
}
```

---

### 5.7. Footer Component
```html
<!-- Footer Component Markup -->
<footer class="app-footer">
    <div class="footer-container">
        <div class="footer-info">
            <div class="footer-brand">
                <div class="brand-icon-box" style="width: 32px; height: 32px;">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg>
                </div>
                <h3>Alumni Tracking System</h3>
            </div>
            <p>The centralized hub for graduate networking, mentorship, career postings, and alumni tracking.</p>
            <span class="footer-badge">Zero-Dependency Node.js MVC Architecture</span>
        </div>

        <div class="footer-nav-col">
            <h4>Platform</h4>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/users">Alumni Directory</a></li>
                <li><a href="/announcements">Announcements</a></li>
            </ul>
        </div>

        <div class="footer-nav-col">
            <h4>Developer APIs</h4>
            <ul>
                <li><a href="/api/swagger">Interactive Swagger</a></li>
                <li><a href="/api/swagger.json">OpenAPI 3.0 Spec</a></li>
                <li><a href="/api/health">System Health Check</a></li>
                <li><a href="/api/users">REST Users Endpoint</a></li>
            </ul>
        </div>
    </div>

    <div class="footer-bottom">
        <div class="footer-bottom-inner">
            <span>© 2026 Alumni Tracking System. All rights reserved.</span>
            <span>Designed in compliance with Brand & Ease Health Guidelines.</span>
        </div>
    </div>
</footer>
```
```css
/* Footer Styling */
.app-footer {
    background: var(--clr-black);
    color: var(--clr-white);
    border-top: 5px solid var(--clr-blue);
    margin-top: auto;
}
.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 1.5rem 2rem;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 3rem;
}
.footer-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}
.footer-brand h3 {
    margin: 0;
    color: var(--clr-white);
    font-size: 1.25rem;
}
.footer-info p {
    color: #a0aec0;
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 380px;
    margin-bottom: 1rem;
}
.footer-badge {
    display: inline-block;
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    background: rgba(241, 196, 15, 0.15);
    color: var(--clr-yellow);
    font-size: 0.75rem;
    font-weight: 700;
}
.footer-nav-col h4 {
    color: var(--clr-yellow);
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 1.2rem;
}
.footer-nav-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
}
.footer-nav-col li {
    margin-bottom: 0.6rem;
}
.footer-nav-col a {
    color: #cbd5e0;
    text-decoration: none;
    font-size: 0.88rem;
    transition: color 0.2s;
}
.footer-nav-col a:hover {
    color: var(--clr-blue);
}
.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.2rem 1.5rem;
    font-size: 0.82rem;
    color: #718096;
}
.footer-bottom-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.8rem;
}
```

---

## 6. CSS Design Tokens & Commands

Copy and import these standard tokens into any stylesheet across the project:

```css
/* ── Alumni Tracking System Design Tokens ───────────────────────────────── */
:root {
    /* Strict Brand Palette: Black, White, Yellow, Blue */
    --clr-black: #111111;
    --clr-white: #ffffff;
    --clr-blue: #3498db;
    --clr-blue-dark: #2980b9;
    --clr-blue-light: #ebf5fb;
    --clr-yellow: #f1c40f;
    --clr-yellow-dark: #d4ac0d;
    --clr-yellow-light: #fef9e7;
    --clr-bg: #f8f9fa;
    --clr-border: #e2e8f0;

    /* Semantic Aliases */
    --clr-primary: var(--clr-blue);
    --clr-accent: var(--clr-yellow);
    --clr-surface: var(--clr-white);

    /* Radii Scale (Ease Health Architectural Style) */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-xl: 28px;
    --radius-pill: 9999px;

    /* Shadow Elevation */
    --shadow-soft: 0 4px 15px rgba(0, 0, 0, 0.05);
    --shadow-hover: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* ── Standard Button Classes ────────────────────────────────────────────── */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.6rem;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: all 0.25s ease;
}
.btn-primary {
    background-color: var(--clr-blue);
    color: var(--clr-white);
    box-shadow: 0 4px 10px rgba(52, 152, 219, 0.25);
}
.btn-primary:hover {
    background-color: var(--clr-blue-dark);
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(52, 152, 219, 0.35);
}
.btn-outline {
    background-color: var(--clr-white);
    color: var(--clr-black);
    border: 2px solid var(--clr-black);
}
.btn-outline:hover {
    background-color: var(--clr-yellow);
    border-color: var(--clr-yellow);
    transform: translateY(-2px);
}
.btn-sm {
    padding: 0.5rem 1.1rem;
    font-size: 0.85rem;
}
```

---

## 7. Design Principles & Best Practices

1. **Adherence to Colors:** Always maintain Black, White, Yellow, and Blue as the sole palette. Avoid adding arbitrary purples, greens, or foreign hues.
2. **Structural Hairlines:** Use `1px solid var(--clr-border)` rather than multi-layered dark drop shadows to maintain a clean, airy feeling.
3. **Generous Radii:** Apply `24px–28px` rounded shells to hero containers and feature wrappers in alignment with the Ease Health layout philosophy.
4. **Accessible Contrast:** Always ensure text rendered on yellow backgrounds is `#111111` (Black), and text rendered on blue backgrounds is `#ffffff` (White).
5. **Responsive Integrity:** Ensure navigation collapses into a clean mobile drawer on screens `< 768px`, and tables allow horizontal scrolling with sticky primary columns.

---

*Alumni Tracking System • Official Brand Identity Guide • 2026*
