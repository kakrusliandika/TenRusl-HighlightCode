# TenRusli Highlight Code (TRHC) — Multi-Language Code Highlighter

> A lightweight, fast, and secure **PWA** highlighter. **Copy with colors to Word/Google Docs without breaking formatting**, export **PNG/PDF**, **offline-first** with a Service Worker, **auto-detect** language + **PrismJS autoloader**.

![Status](https://img.shields.io/badge/PWA-Ready-8b5cf6)
![Prism](https://img.shields.io/badge/PrismJS-1.30.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20Prism%20%7C%20SW-111)
![Stars](https://img.shields.io/github/stars/kakrusliandika/TenRusl-HighlightCode?style=social)
![Forks](https://img.shields.io/github/forks/kakrusliandika/TenRusl-HighlightCode?style=social)

---

## Table of Contents

-   [Key Features](#key-features)
-   [Quick Demo](#quick-demo)
-   [Directory Structure](#directory-structure)
-   [Run Locally](#run-locally)
-   [Install (Open Source)](#install-open-source)
-   [Docker (Optional)](#docker-optional)
-   [Important Configuration](#important-configuration)
-   [PWA & Caching](#pwa--caching)
-   [I18N](#i18n)
-   [Security & Recommended Headers](#security--recommended-headers)
-   [Customization](#customization)
-   [Troubleshooting](#troubleshooting)
-   [Deployment](#deployment)
-   [Contributing](#contributing)
-   [Credits](#credits)
-   [Roadmap (forward-looking)](#roadmap-forward-looking)
-   [License](#license)
-   [English (Short)](#-english-short)

---

## ✨ Key Features

-   **Auto-detect language** from code content, file extension, code fence (` ```lang `), or shebang  
    → falls back to multi-language keyword scoring.  
    → _Auto-override_ to **AUTO** if a new detection beats the manual choice by **≥ 2 points**.
-   **PrismJS self-hosted** (v1.30.0) + **Autoloader**  
    → loads language components **on-demand** from `/assets/prismjs/package/components/`.
-   **Copy (Word/Docs)** with colors and **plain copy**.
-   **Export PNG/PDF** (via `html-to-image` & `jsPDF`) + ready-to-use **Print**.
-   **PWA**: offline-first, **Service Worker** with distinct strategies for:
    -   **CORE** (precache),
    -   **RUNTIME** (cache-first / stale-while-revalidate),
    -   **COMPONENTS** (Prism languages; network-first, capped at **200** entries).
-   **UI/UX**:
    -   **Dark/Light** themes (synced with Prism).
    -   **Line Numbers**, **Wrap lines**.
    -   **Language chooser** with search + language **badges** (_JS, TS, PY, GO_, etc.).
    -   **I18N**: **ID/EN** (easy to add more).
    -   **A11y**: ARIA roles, toolbar, dialog/popover, live region status.

---

## 🚀 Quick Demo

1. **Paste** or **drop** a code file into the left panel.
2. Choose a language (or keep **AUTO**).
3. Use **Copy** / **Copy Word** / **PNG** / **PDF** / **Print** from the Preview toolbar.
4. PWA is ready to **Install** (Add to Home Screen).

---

## 🗂️ Directory Structure

```
/
├─ index.html
├─ manifest.webmanifest
├─ ads.txt
├─ robots.txt
├─ sitemap.xml
├─ sitemap-index.xml
├─ CODE_OF_CONDUCT.md
├─ CONTRIBUTING.md
├─ LICENSE
├─ README.md
├─ humans.txt
├─ consent-base.js
├─ googleFClG-yRowubCICDyQFjDm65cnX4tk4WYcmDA0EXmRQQ.html
├─ _headers
├─ _redirects
├─ .well-known/
│  └─ security.txt
├─ assets/
│  ├─ index.html
│  ├─ css/
│  │  ├─ app.css
│  │  ├─ chrome.css
│  │  ├─ language.css
│  │  ├─ pages.css
│  │  ├─ theme.css
│  │  └─ index.html
│  ├─ i18n/
│  │  ├─ en.json
│  │  ├─ id.json
│  │  ├─ pages.json
│  │  └─ index.html
│  ├─ images/
│  │  ├─ icon.svg
│  │  └─ index.html
│  ├─ js/
│  │  ├─ app.js
│  │  ├─ footer-pages.js
│  │  ├─ footer.js
│  │  ├─ header-pages.js
│  │  ├─ header.js
│  │  ├─ index.html
│  │  ├─ language-pages.js
│  │  ├─ language.js
│  │  ├─ pages.js
│  │  ├─ sw.js
│  │  └─ theme.js
│  ├─ json/
│  │  ├─ index.html
│  │  ├─ languages.json
│  │  └─ settings.json
│  └─ plugin/
│     ├─ fontawesome/
│     ├─ prismjs/
│     ├─ htmlotimage.js        # vendor (html-to-image)
│     ├─ index.html
│     └─ jspdf.js              # vendor (jsPDF UMD)
├─ pages/
│  ├─ 404.html
│  ├─ ad-unit-example.html
│  ├─ contact.html
│  ├─ cookies.html
│  ├─ head-snippets.html
│  ├─ index-injection-example.html
│  ├─ index.html
│  ├─ offline.html
│  ├─ privacy.html
│  └─ terms.html

```

---

## 🔧 Run Locally

> **No build step required.** Because a Service Worker is used, serve over **HTTP** (not `file://`).

Pick any static server:

```bash
# Node (serve)
npx serve . -p 5173

# Python
python -m http.server 5173

# Bun
bunx serve . -p 5173
```

Then open `http://localhost:5173`.

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

## 🐳 Docker (Optional)

Serve the static site via **nginx** in a container:

```bash
# from repo root
docker run --rm -it -p 5173:80 -v "$PWD":/usr/share/nginx/html:ro nginx:alpine
# open http://localhost:5173
```

> Ensure `sw.js` stays at the repository root so the Service Worker scope covers `/`.

---

## 🧩 Important Configuration

### Theme & Prism

-   Theme toggle switches `<html class="light">` **and** swaps `link#prism-theme`:
    -   Dark → `prism-okaidia.min.css`
    -   Light → `prism-solarizedlight.min.css`

### Prism Autoloader

-   `Prism.plugins.autoloader.languages_path = "/assets/prismjs/package/components/"`
-   Place additional languages (e.g., `prism-elixir.min.js`) in **components** to autoload.

### Language Auto-Detect

Heuristic order:

1. Code fence → ` ```lang `
2. File extension (on drag & drop)
3. Shebang (e.g., `#!/usr/bin/env python`)
4. Signature regex (e.g., `package main`, `def`, `class`, `<html>`, etc.)
5. Loose JSON detector
6. **Keyword scoring** across languages (best/top2)  
   → If the user selects a language manually but AUTO leads by **≥ 2** (`AUTO_OVERRIDE_GAP`), revert to **AUTO** for accuracy.

### Copy to Word/Docs

-   `Copy` → plain text.
-   `Copy Word` → clones `<pre>` (removes line-numbers gutter), **inlines styles** (colors/fonts) so output **doesn’t break** in Word/Docs.

### Export PNG/PDF

-   PNG: `html-to-image.toBlob(pre, { pixelRatio: 2 })`
-   PDF: render to PNG, fit to A4 (24pt margins), `jsPDF.addImage(...)`.

---

## 🌐 PWA & Caching

`sw.js` uses three caches:

-   **CORE_CACHE**: `PRECACHE` (HTML/CSS/JS/manifest/icon + Prism themes).
-   **RUNTIME_CACHE**:
    -   **navigate**: _network-then-cache_ (fallback to `/index.html` offline).
    -   **asset** (same-origin scripts/styles/fonts/images): **cache-first**.
    -   **others**: **stale-while-revalidate**.
-   **COMPONENTS_CACHE**: Prism components `networkFirstWithLimit` (max **200** entries) + `enforceLimit`.

> Bump `VERSION` for cache busting when releasing.

---

## 🌍 I18N

-   Dictionaries: `/assets/i18n/id.json`, `/assets/i18n/en.json`.
-   Add a new language → create `xx.json`, call `setUiLang("xx")`.
-   Some labels are normalized (e.g., “Copy Word”, “PNG”, “PDF”) for consistency.

---

## 🛡️ Security & Recommended Headers

Example **CSP** (adjust vendor domains if `htmlotimage.js/jsPDF` locations change):

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

Also add:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: public, max-age=31536000, immutable
```

> On Cloudflare Pages/Netlify, set via **Response headers** or an `_headers` file.

---

## 💰 Monetization & Consent

-   **AdSense**: enable Auto Ads in `<head>` and use in-page units where appropriate.
-   **Publisher ID**: `ca-pub-3735882384148563`
-   **consent**: Implement Google **Consent Mode v2** with a Google-certified CMP for EEA/UK/CH.

**Head include (Auto Ads):**

```html
<script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3735882384148563"
    crossorigin="anonymous"
></script>
```

## 🛠️ Customization

-   **Add Languages**: drop Prism **.min.js** files into `assets/prismjs/package/components/` and (optionally) list them in `assets/languages.json` for the menu.
-   **Prism Themes**: swap files in `assets/prismjs/package/themes/` and update `THEMES` in `assets/app.js`.
-   **Component Limit**: tweak `COMPONENTS_MAX` in `sw.js` (default 200).
-   **Auto-override**: adjust `AUTO_OVERRIDE_GAP` (default 2) in `assets/app.js`.

---

## 🧪 Troubleshooting

-   **Service Worker inactive** → access via `http(s)://`, not `file://`.
-   **Copy Word not colored** → check clipboard permissions and don’t block the rich clipboard.
-   **Language not highlighted** → ensure the Prism component exists; check Network (autoloader fetches `.min.js`).
-   **PNG/PDF fails** → verify `htmlotimage.js` & `jspdf.js` are loaded (check Console).

---

## 📦 Deployment

### Cloudflare Pages (recommended)

-   **Build command**: _(leave empty)_
-   **Output dir**: `/` (root)
-   Ensure `sw.js` is at project **root** (registered via `navigator.serviceWorker.register("/sw.js")`).

### Netlify / Vercel / Other static hosts

-   Upload the directory exactly as structured above.
-   Apply the security headers from the **Security** section.

---

## 🤝 Contributing

Contributions are welcome!

1. **Fork** the repo and create your branch: `git checkout -b feat/your-feature`
2. **Commit** your changes: `git commit -m "feat: add amazing feature"`
3. **Push** to the branch: `git push origin feat/your-feature`
4. **Open a Pull Request**

Please follow conventional commits (`feat:`, `fix:`, `docs:`, etc.) and keep PRs focused. If you plan a big change, open an **issue** first to discuss.

---

## 📚 Credits

-   **PrismJS** (MIT) — Syntax highlighting.
-   **html-to-image** — Render DOM to PNG.
-   **jsPDF** — Client-side PDF generation.

---

## 🛣️ Roadmap (forward-looking)

-   [ ] More Prism theme options (beyond Okaidia/Solarized Light).
-   [ ] **Batch Export** (multi-snippet into a single PDF).
-   [ ] **Share** (permalink with serialized state).
-   [ ] **Keyboard shortcuts** (copy/copy-word/export).
-   [ ] Support **custom themes** via CSS Vars.

---

## 📄 License

**MIT** — feel free to use, modify, and redistribute.  
(See `LICENSE` if added to the repo.)

---

## 🇬🇧 English (Short)

**TRHC** is a lightweight **PWA** code highlighter powered by **self-hosted PrismJS**. It auto-detects languages, lets you **copy with colors** to **Word/Google Docs**, and **export PNG/PDF**—all **offline-first**.

-   Auto language detection (fences, extension, shebang, signatures, keyword scoring; auto-override gap = 2).
-   Prism **autoloader** (components loaded on demand).
-   Copy (plain / rich for Word/Docs), Export (PNG/PDF), Print.
-   Light/Dark theme, line numbers, wrap, searchable language menu.
-   ID/EN i18n, accessible UI, SW caching with component LRU.

**Run locally**: `npx serve .` → open `http://localhost:5173`.  
**Deploy**: any static host (Cloudflare Pages recommended).  
**Customize**: drop new Prism components into `/assets/prismjs/package/components/` and list them in `assets/languages.json`.

---

**Repo**: https://github.com/kakrusliandika/TenRusl-HighlightCode  
**Author**: Andika Rusli - TenRusl
