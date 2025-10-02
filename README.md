# TenRusli Highlight Code (TRHC) — Multi‑Language Code Highlighter

> A lightweight, fast, and secure **PWA** code highlighter. **Copy with colors to Word/Google Docs without breaking formatting**, export **PNG/PDF**, **offline‑first** with a Service Worker, **auto‑detect** language + **PrismJS autoloader**.

[![PWA](https://img.shields.io/badge/PWA-Ready-8b5cf6)](#pwa--caching)
![Status](https://img.shields.io/badge/PWA-Ready-8b5cf6)
![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20diff--match--patch%20%7C%20PWA-111)
![NoBuild](https://img.shields.io/badge/Build-None%20%28Static%20Site%29-2ea44f)
![Stars](https://img.shields.io/github/stars/kakrusliandika/TenRusl-HighlightCode?style=social)
![Forks](https://img.shields.io/github/forks/kakrusliandika/TenRusl-HighlightCode?style=social)

Live: **https://tenrusl-highlightcode.pages.dev/**

---

## Table of Contents

-   [✨ Key Features](#key-features)
-   [▶️ Quick Demo](#quick-demo)
-   [📦 Install (Open Source)](#install-open-source)
-   [🚀 Deployment](#deployment)
-   [🗂️ Directory Structure](#directory-structure)
-   [⚙️ How It Works](#how-it-works)
-   [🔗 Share Snapshot](#share-snapshot)
-   [⌨️ Keyboard Shortcuts](#keyboard-shortcuts)
-   [🎛️ Options & Preferences](#options--preferences)
-   [🖨️ Export & Print](#export--print)
-   [📲 PWA & Caching](#pwa--caching)
-   [🌍 I18N](#i18n)
-   [🛡️ Security Headers (Recommended)](#security-headers-recommended)
-   [🛠️ Development](#development)
-   [🐞 Troubleshooting](#troubleshooting)
-   [🤝 Contributing](#contributing)
-   [📜 Code of Conduct](#code-of-conduct)
-   [🏆 Credits](#credits)
-   [👤 Author](#author)
-   [🗺️ Roadmap](#roadmap)
-   [📄 License](#license)

---

## ✨ Key Features

-   **Auto‑detect language** from code content, file extension, code fence (```lang), or shebang  
    → falls back to multi‑language keyword scoring.  
    → _Auto‑override_ to **AUTO** if a new detection beats the manual choice by **≥ 2 points**.
-   **PrismJS self‑hosted** + **Autoloader**  
    → loads language components **on‑demand** from `/assets/plugin/prismjs/package/components/`.
-   **Copy to Word/Docs** with colors (preserves styles) & **plain copy**.
-   **Export** to **PNG/PDF** (via `html-to-image` & `jsPDF`) + built‑in **Print**.
-   **PWA**: offline‑first with Service Worker + offline fallback.
-   **UI/UX**:
    -   **Dark/Light** themes (synced with Prism).
    -   **Line Numbers**, **Wrap lines**.
    -   **Language chooser** with search + language **badges**.
    -   **A11y**: ARIA roles, toolbar, dialog/popover, live region status.
-   **I18N**: Indonesian 🇮🇩 & English 🇬🇧.

---

## ▶️ Quick Demo

1. **Paste** or **drop** a code file into the left panel.
2. Choose a language (or keep **AUTO**).
3. Use **Copy**, **Copy Word**, **PNG**, **PDF**, **Print** from the Preview toolbar.
4. PWA is ready to **Install** (Add to Home Screen / A2HS).

---

## 📦 Install (Open Source)

### 1) Clone the repository

```bash
# SSH (recommended if you set up SSH keys)
git clone --depth 1 git@github.com:kakrusliandika/TenRusl-HighlightCode.git
# or HTTPS
git clone --depth 1 https://github.com/kakrusliandika/TenRusl-HighlightCode.git

cd TenRusl-HighlightCode
```

> `--depth 1` gives you a shallow clone for a faster download.

### 2) Run it

Pick one (no build step):

```bash
# Using Node "serve"
npx serve . -p 5173

# Or Python
python -m http.server 5173

# Or Bun
bunx serve . -p 5173
```

Open `http://localhost:5173` and start highlighting.

### 3) Keep your fork in sync (optional)

```bash
# Add the original repo as upstream
git remote add upstream https://github.com/kakrusliandika/TenRusl-HighlightCode.git

# Fetch and merge updates
git fetch upstream
git checkout main
git merge upstream/main
```

### 4) Create a new branch for your changes (for PRs)

```bash
git checkout -b feat/awesome-improvements
# ...do your changes...
git add -A
git commit -m "feat: awesome improvements to TRHC"
git push origin feat/awesome-improvements
# Then open a Pull Request on GitHub
```

---

## 🚀 Deployment

### Cloudflare Pages (recommended)

-   **Build command**: _(empty)_
-   **Output directory**: `/` (root)
-   Ensure the Service Worker is registered as **`/sw.js`** with scope `/`.
    -   If your source file is at `/assets/js/sw.js`, either copy it to root during deploy or map a route so `/sw.js` resolves to that file.
-   `_headers` and `_redirects` are honored on Cloudflare Pages.

### Netlify / Vercel / Any static host

-   Upload the repo as‑is.
-   Apply **security headers** (see section below).
-   Keep `/_redirects` for SPA routing (`/*  /index.html  200`).

### Apache / Nginx

-   Mirror the headers via `.htaccess` (Apache) or server config (Nginx).
-   Ensure Service Worker scope covers `/` and that `/sw.js` resolves.

---

## 🗂️ Directory Structure

```
/
├─ index.html
├─ manifest.webmanifest
├─ _headers
├─ _redirects
├─ robots.txt
├─ sitemap.xml
├─ sitemap-index.xml
├─ ads.txt
├─ humans.txt
├─ consent-base.js
├─ CODE_OF_CONDUCT.md
├─ CONTRIBUTING.md
├─ LICENSE
├─ README.md
├─ .well-known/
│  └─ security.txt
├─ assets/
│  ├─ css/
│  │  ├─ app.css
│  │  ├─ chrome.css
│  │  ├─ language.css
│  │  ├─ pages.css
│  │  └─ theme.css
│  ├─ images/
│  │  └─ icon.svg
│  ├─ i18n/
│  │  ├─ en.json
│  │  └─ id.json
│  ├─ js/
│  │  ├─ app.js
│  │  ├─ header.js
│  │  ├─ footer.js
│  │  ├─ language.js
│  │  ├─ pages.js
│  │  ├─ theme.js
│  │  └─ sw.js
│  ├─ json/
│  │  ├─ languages.json
│  │  └─ settings.json
│  └─ plugin/
│     ├─ prismjs/
│     ├─ htmlotimage.js
│     └─ jspdf.js
└─ pages/
   ├─ 404.html
   ├─ offline.html
   ├─ contact.html
   ├─ cookies.html
   ├─ privacy.html
   ├─ terms.html
   ├─ head-snippets.html
   ├─ index.html
   └─ ad-unit-example.html
```

---

## ⚙️ How It Works

-   **Detection pipeline**

    1. Code fence → ```lang, 2) file extension, 3) shebang, 4) signature regex, 5) loose JSON check, 6) keyword scoring.  
       If AUTO out‑scores the selected language by **≥ 2**, it overrides to **AUTO** for accuracy.

-   **Prism Autoloader**  
    `Prism.plugins.autoloader.languages_path = "/assets/plugin/prismjs/package/components/"`  
    Components are fetched on‑demand; only languages you use are loaded.

-   **Clipboard**

    -   **Copy** → plain text.
    -   **Copy Word** → clones `<pre>`, inlines styles so Word/Docs keep colors & fonts.

-   **Export**

    -   **PNG** via `html-to-image` (2x pixel ratio).
    -   **PDF** via `jsPDF` (fits page, A4 portrait by default).

-   **State & Settings**  
    User preferences (theme, wrap, line numbers, last language, locale) persist via `localStorage`.

---

## 🔗 Share Snapshot

> **Optional module (forward‑looking).**  
> When enabled, TRHC serializes the editor state (language, theme, flags, code) into a URL fragment (hash) or query string so you can share a permalink. If the toolbar does not show “Share / Copy Link”, this module isn’t bundled in your build yet.

---

## ⌨️ Keyboard Shortcuts

_Current in UI:_

-   `Ctrl/Cmd + L` — Toggle line numbers
-   `Ctrl/Cmd + W` — Toggle line wrap
-   `Ctrl/Cmd + .` — Focus language switcher

_Planned:_

-   `Ctrl/Cmd + C` — Copy (plain)
-   `Ctrl/Cmd + Shift + C` — Copy Word
-   `Ctrl/Cmd + P` — Print
-   `Ctrl/Cmd + Shift + E` — Export dialog

---

## 🎛️ Options & Preferences

-   **Theme**: Light / Dark (syncs Prism theme file).
-   **Line Numbers**: on/off.
-   **Line Wrap**: on/off.
-   **Language**: AUTO or specific language (searchable).
-   **Locale**: `id` / `en`.
-   **Export**: DPI (PNG), paper size (PDF) — where available.

---

## 🖨️ Export & Print

-   **PNG**: high‑resolution export for slides or docs.
-   **PDF**: single‑page fit with margins.
-   **Print**: CSS print stylesheet ensures clean output (no chrome UI).
-   If export fails, verify vendor files in `assets/plugin/` are available or switch to CDN.

---

## 📲 PWA & Caching

-   **Service Worker**

    -   **HTML**: _network‑first_ with offline fallback → `/pages/offline.html`.
    -   **Static assets**: **cache‑first** with background revalidation.
    -   **Prism components**: **network‑first** + LRU limit (default **200** entries).
    -   Bump `VERSION` to invalidate caches on release.

-   **Scope**  
    Register as `navigator.serviceWorker.register("/sw.js")`.  
    If the file lives at `/assets/js/sw.js`, copy/map to `/sw.js` so scope is `/`.

-   **Icons**
    -   Manifest includes SVG; for iOS add **PNG** icons + **apple‑touch‑icon** for best results.
    -   Recommended: `192x192`, `512x512` PNG and `/assets/icons/apple-touch-icon.png`.

---

## 🌍 I18N

-   Dictionaries live in `/assets/i18n/{id,en}.json`.
-   Add a new language by creating `xx.json`, then `setUiLang("xx")` on init.
-   UI labels are normalized so “Copy Word”, “PNG”, “PDF” are consistent.

---

## 🛡️ Security Headers (Recommended)

Example **CSP** (adjust if you host vendors on a CDN):

```
Content-Security-Policy:
  default-src 'self';
  img-src 'self' blob: data:;
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

Also recommended:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: public, max-age=31536000, immutable
```

> On Cloudflare Pages/Netlify, set via **\_headers** file.

---

## 🛠️ Development

-   **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`
-   **Formatting**: 2‑space indent, semantic HTML, ARIA where relevant.
-   **Perf**: lazy‑load heavy vendor libs; keep first paint minimal.
-   **CI/CD**: optional GitHub Actions to push to Cloudflare Pages.

---

## 🐞 Troubleshooting

-   **SW not active** → must be `http(s)://`, not `file://`.
-   **Copy Word has no colors** → allow rich clipboard; confirm `contenteditable` copy path.
-   **Not highlighted** → check Prism component fetched in Network; ensure language exists.
-   **PNG/PDF fails** → ensure `htmlotimage.js` & `jspdf.js` are present or allowed by CSP.
-   **iOS A2HS icon missing** → add PNG icons + `apple-touch-icon`.

---

## 🤝 Contributing

1. **Fork** → `git checkout -b feat/awesome-improvements`
2. **Commit** → `git commit -m "feat: improve export quality"`
3. **Push** → `git push origin feat/awesome-improvements`
4. **PR** → open a Pull Request

---

## 📜 Code of Conduct

This project follows the **Contributor Covenant**. Please see `CODE_OF_CONDUCT.md`.

---

## 🏆 Credits

-   **PrismJS** (MIT) — syntax highlighting
-   **html-to-image** — DOM → PNG
-   **jsPDF** — client‑side PDF generation

---

## 👤 Author

**Andika Rusli (TenRusl)**  
**Site**: https://tenrusl-highlightcode.pages.dev
**GitHub**: https://github.com/kakrusliandika/TenRusl-HighlightCode

---

## 🗺️ Roadmap

-   [ ] **Share Snapshot** (permalink with serialized state)
-   [ ] **Batch Export** (multi‑snippet → single PDF)
-   [ ] More Prism theme options (beyond Okaidia/Solarized Light)
-   [ ] Keyboard shortcuts for copy/export
-   [ ] Custom themes via CSS variables
-   [ ] Optional CDN mode (zero vendor in repo; SRI‑pinned)

---

## 📄 License

**MIT** — feel free to use, modify, and redistribute. See `LICENSE`.
