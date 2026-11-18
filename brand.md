# Alumni Tracking System
## Brand Identity & Design System Guidelines

A comprehensive design specification and UI component library for the **Alumni Tracking System** web platform, structured on the architectural, typographic, and surface layering principles of the **Ease Health** design system.

---

## 📌 Table of Contents

1. [Brand Overview & Identity](#1-brand-overview--identity)
2. [Strict Color Palette (Black, White, Yellow, Blue)](#2-strict-color-palette-black-white-yellow-blue)
3. [Typography & Typographic Scale](#3-typography--typographic-scale)
4. [Spatial Geometry, Elevation & Radii](#4-spatial-geometry-elevation--radii)
5. [Core Components](#5-core-components)
   - [5.1. Logo Component](#51-logo-component)
   - [5.2. Header & Navigation](#52-header--navigation)
   - [5.3. Menu Component](#53-menu-component)
   - [5.4. Product Page (Two-Column Hero & Features)](#54-product-page-component)
   - [5.5. Alumni List Component](#55-alumni-list-component)
   - [5.6. Alumni Profile Component](#56-alumni-profile-component)
   - [5.7. Footer Component](#57-footer-component)
6. [CSS Tokens & Utility Commands](#6-css-tokens--utility-commands)
7. [Editorial Rules (Do's & Don'ts)](#7-editorial-rules-dos--donts)

---

## 1. Brand Overview & Identity

- **Official Product Title:** `Alumni Tracking System`
- **Tagline:** *Connecting graduates with lasting purpose.*
- **Aesthetic Essence:** High-end editorial serenity. Layered flat surfaces, warm cream canvas, quiet weight-300 display serifs paired with crisp humanist sans typography, and zero drop shadows.
- **Strict Color Anchor:** Black, White, Yellow, and Blue.

---

## 2. Strict Color Palette (Black, White, Yellow, Blue)

| Token Name | Variable | Hex | Role |
|:---|:---|:---|:---|
| **Deep Ink Black** | `--color-forest-ink` | `#111111` | Primary CTA buttons, headings, links, icon strokes — deep saturated ink |
| **Warm Sand / Gold Wash** | `--color-sage-mist` | `#f4d03f` / `#fef08a` | Mid-tone card backgrounds, decorative washes, panel-level surfaces |
| **Light Butter Wash** | `--color-keylime-wash` | `#fef9e7` | Hero panel background, light card surfaces — dominant tinted canvas |
| **Soft Amber Veil** | `--color-mint-veil` | `#fae588` | Accent card surfaces, soft section dividers between layers |
| **Slate Hush Blue** | `--color-slate-hush` | `#b6ced5` | Cool counter-balance panel for product previews and feature blocks |
| **Deep Blue Ink** | `--color-blue-ink` | `#2980b9` | Supporting interactive link color and brand accent |
| **Cream Paper** | `--color-cream-paper` | `#fffefc` | Page background, badge backgrounds, button text — warm off-white |
| **Charcoal** | `--color-charcoal` | `#222222` | Navigation text, body copy, and secondary UI strokes |
| **Border Mist** | `--color-border-mist` | `#efeeeb` | Hairline dividers and subtle 1px borders throughout the layout |

---

## 3. Typography & Typographic Scale

### Font Pairing
- **Display Serif:** `'Faire Octave'` (or Google Font `'Cormorant Garamond'`) at **Weight 300 (Light)**.
  - Used for all major display titles and section headings. Never bolded.
  - Tight letter-spacing: `-0.01em` (40px) to `-0.03em` (56px–74px).
- **Humanist Sans:** `'Suisse Intl'` (or Google Font `'Inter'`) at **Weights 300, 400, 600**.
  - Used for body copy (14px), buttons, metadata, and eyebrows.
  - **Eyebrow Labels:** `11px`, weight `600`, `letter-spacing: 0.08em`, `UPPERCASE`.

### Scale
- **Display:** `74px` / line-height `1.05` / `-2.22px`
- **Heading LG:** `56px` / line-height `1.20` / `-1.68px`
- **Heading:** `40px` / line-height `1.35` / `-0.40px`
- **Heading SM:** `23px` / line-height `1.50` / `0px`
- **Subheading:** `18px` / line-height `1.30` / `0px`
- **Body:** `14px` / line-height `1.50` / `0px`
- **Eyebrow:** `11px` / weight `600` / `0.08em` / `UPPERCASE`
- **Caption:** `10px` / line-height `1.61` / `0px`

---

## 4. Spatial Geometry, Elevation & Radii

- **Shadows:** `box-shadow: none` across the entire design system. Elevation is expressed strictly through layered tinted fills (`Cream Paper` → `Butter Wash` → `Slate Hush`).
- **Radii:**
  - Navigation elements: `7px`
  - Cards & outer shells: `14px`
  - Pill badges & tags: `999px`
  - Action buttons: `14px` or `9999px` (full capsule)
- **Padding:** `28px`–`42px` comfortable breathing room on all cards.
- **Section Gaps:** `64px`–`96px` editorial pacing.

---

## 5. Core Components

### 5.1. Logo Component
```html
<a href="/" class="ease-brand-lockup">
    <span class="ease-brand-mark">●</span>
    <span class="ease-brand-text">Alumni Tracking System</span>
</a>
```

### 5.2. Header & Navigation
```html
<header class="ease-nav-wrapper">
    <div class="ease-nav-container">
        <a href="/" class="ease-brand-lockup">
            <span class="ease-brand-mark">●</span>
            <span class="ease-brand-text">Alumni Tracking System</span>
        </a>
        <nav class="ease-nav-links">
            <a href="/" class="ease-nav-item active">Home</a>
            <a href="/about" class="ease-nav-item">About Us</a>
            <a href="/users" class="ease-nav-item">Alumni Directory</a>
            <a href="/announcements" class="ease-nav-item">Announcements</a>
            <a href="/api/swagger" class="ease-nav-item">API Docs</a>
        </nav>
        <div class="ease-nav-cta">
            <a href="/users" class="ease-btn-primary ease-btn-sm">
                <span>Join Network</span>
                <span class="btn-arrow">→</span>
            </a>
        </div>
    </div>
</header>
```

### 5.3. Menu Component
- Capsule-style menu items with `7px` border radius.
- `14px` Suisse Intl typography.
- Active item rendered with bold weight or subtle tint wash.

### 5.4. Product Page Component
- Two-column hero: Left Keylime/Butter Wash panel + Right Slate Hush panel with floating white product preview cards.
- Weight 300 Faire Octave headline.
- 11px uppercase eyebrow label.
- Primary filled CTA button with trailing arrow icon.

### 5.5. Alumni List Component
- Clean table surface layered over tinted wash panel.
- 11px uppercase table headers.
- Pill badges for graduation status.
- Directional arrow action links (`View Profile →`).

### 5.6. Alumni Profile Component
- Clinical card on Cream/Slate background.
- Floating white detail card with 4-grid metadata tiles.
- Weight 300 serif name headline.
- Compact capsule buttons.

### 5.7. Footer Component
- Grounded cream surface with clean hairline separator.
- Minimal left brand lockup, centered and right navigation columns.
- Explicit Ease Health architectural attribution.

---

## 6. CSS Tokens & Utility Commands

```css
:root {
  /* Colors */
  --color-forest-ink: #111111;
  --color-sage-mist: #fef08a;
  --color-keylime-wash: #fef9e7;
  --color-mint-veil: #fae588;
  --color-slate-hush: #b6ced5;
  --color-cream-paper: #fffefc;
  --color-charcoal: #222222;
  --color-border-mist: #efeeeb;
  --color-forest-shadow: #0a0a0a;

  /* Typography */
  --font-faire-octave: 'Cormorant Garamond', 'Faire Octave', Georgia, serif;
  --font-suisse-intl: 'Inter', 'Suisse Intl', system-ui, -apple-system, sans-serif;

  /* Scale */
  --text-caption: 10px;
  --text-eyebrow: 11px;
  --text-body: 14px;
  --text-subheading: 18px;
  --text-heading-sm: 23px;
  --text-heading: 40px;
  --text-heading-lg: 56px;
  --text-display: 74px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-7: 7px;
  --spacing-9: 9px;
  --spacing-11: 11px;
  --spacing-14: 14px;
  --spacing-18: 18px;
  --spacing-21: 21px;
  --spacing-28: 28px;
  --spacing-35: 35px;
  --spacing-42: 42px;
  --spacing-49: 49px;
  --spacing-56: 56px;
  --spacing-70: 70px;
  --spacing-76: 76px;
  --spacing-99: 99px;
  --spacing-156: 156px;

  /* Layout */
  --page-max-width: 1200px;
  --radius-nav: 7px;
  --radius-cards: 14px;
  --radius-badges: 999px;
  --radius-buttons: 14px;
}
```

---

## 7. Editorial Rules (Do's & Don'ts)

- **DO** set display headings in Faire Octave / Cormorant Garamond at weight 300 with negative tracking.
- **DO** use `box-shadow: none` and create depth solely via tinted surface washes.
- **DO** maintain 28px–42px padding on all cards for generous breathing room.
- **DON'T** use bold serifs or heavy drop shadows.
- **DON'T** introduce unapproved saturated tertiary colors.

---

*Alumni Tracking System • Official Brand Identity Guide • 2026*
