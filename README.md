# TenRusli Highlight Code (TRHC) — Multi‑Language Code Highlighter

> PWA highlighter ringan, cepat, dan aman. **Copy berwarna ke Word/Google Docs tanpa rusak format**, ekspor **PNG/PDF**, **offline‑first** dengan Service Worker, **auto‑detect** bahasa + **PrismJS autoloader**.

![Status](https://img.shields.io/badge/PWA-Ready-8b5cf6)
![Prism](https://img.shields.io/badge/PrismJS-1.30.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20Prism%20%7C%20SW-111)

---

## Daftar Isi

-   [Fitur Utama](#fitur-utama)
-   [Demo Cepat](#demo-cepat)
-   [Struktur Direktori](#struktur-direktori)
-   [Jalankan Lokal](#jalankan-lokal)
-   [Konfigurasi Penting](#konfigurasi-penting)
-   [PWA & Caching](#pwa--caching)
-   [I18N](#i18n)
-   [Keamanan & Header](#keamanan--header-yang-disarankan)
-   [Kustomisasi](#kustomisasi)
-   [Troubleshooting](#troubleshooting)
-   [Deployment](#deployment)
-   [Kredit](#kredit)
-   [Roadmap](#roadmap-pandangan-ke-depan)
-   [Lisensi](#lisensi)
-   [English (Short)](#-english-short)

---

## ✨ Fitur Utama

-   **Auto‑detect bahasa** dari isi kode, ekstensi file, _code fence_ (```lang), atau _shebang_  
    → fallback ke keyword‑scoring multi‑bahasa.  
    → _Auto override_ ke **AUTO** jika deteksi baru unggul ≥ **2 poin** dari pilihan manual.
-   **PrismJS self‑host** (v1.30.0) + **Autoloader**  
    → muat komponen bahasa **on‑demand** dari `/assets/prismjs/package/components/`.
-   **Copy (Word/Docs)** berwarna dan **copy biasa** (plain text).
-   **Export PNG/PDF** (via `html-to-image` & `jsPDF`) + **Print** siap pakai.
-   **PWA**: offline‑first, **Service Worker** dengan strategi cache berbeda untuk:
    -   **CORE** (precache),
    -   **RUNTIME** (cache‑first / stale‑while‑revalidate),
    -   **COMPONENTS** Prism (network‑first + limit **200** entri).
-   **UI/UX**:
    -   Tema **Gelap/Terang** (sinkron dengan tema Prism).
    -   **Line Numbers**, **Wrap lines**.
    -   **Language chooser** dengan pencarian + **badge** bahasa (_JS, TS, PY, GO_, dll).
    -   **I18N**: **ID/EN** (mudah tambah bahasa baru).
    -   **A11y**: ARIA roles, _toolbar_, _dialog/popover_, _status live region_.

---

## 🚀 Demo Cepat

1. **Tempel** atau **drop** file kode ke panel kiri.
2. Pilih bahasa (atau biarkan **AUTO**).
3. **Copy** / **Copy Word** / **PNG** / **PDF** / **Print** dari toolbar _Preview_.
4. PWA siap **Install** (Add to Home Screen).

---

## 🗂️ Struktur Direktori

```
/
├─ index.html
├─ sw.js
├─ manifest.webmanifest
└─ assets/
   ├─ styles.css
   ├─ app.js
   ├─ icon.svg
   ├─ languages.json
   ├─ i18n/
   │  ├─ en.json
   │  └─ id.json
   ├─ htmlotimage.js        # vendor (html-to-image)
   ├─ jspdf.js              # vendor (jsPDF UMD)
   └─ prismjs/
      └─ package/
         ├─ prism.js
         ├─ themes/
         │  ├─ prism-okaidia.min.css
         │  └─ prism-solarizedlight.min.css
         ├─ plugins/
         │  ├─ line-numbers/
         │  └─ match-braces/
         └─ components/     # autoloader target (bhs .min.js)
```

---

## 🔧 Jalankan Lokal

> **Tanpa build**. Karena ada Service Worker, jalankan di **HTTP** (bukan `file://`).

Pilih salah satu server statis:

```bash
# Node (serve)
npx serve . -p 5173

# Python
python -m http.server 5173

# Bun
bunx serve . -p 5173
```

Lalu buka `http://localhost:5173`.

---

## 🧩 Konfigurasi Penting

### Tema & Prism

-   Toggle tema mem‑switch `<html class="light">` **dan** mengganti `link#prism-theme`
    -   Dark → `prism-okaidia.min.css`
    -   Light → `prism-solarizedlight.min.css`

### Autoloader Prism

-   `Prism.plugins.autoloader.languages_path = "/assets/prismjs/package/components/"`
-   Letakkan bahasa tambahan (mis. `prism-elixir.min.js`) ke folder **components** agar autoload.

### Auto‑Detect Bahasa

Urutan heuristik:

1. _Code fence_ → ```lang
2. Ekstensi file (saat _drag & drop_)
3. _Shebang_ (e.g. `#!/usr/bin/env python`)
4. Tanda tangan regex (e.g. `package main`, `def`, `class`, `<html>`, dll)
5. _Loose JSON_ detector
6. **Keyword‑scoring** multi‑bahasa (best/top2)  
   → Jika user memilih bahasa manual namun skor AUTO unggul ≥ **2** (`AUTO_OVERRIDE_GAP`), sistem kembali ke **AUTO** demi akurasi.

### Copy ke Word/Docs

-   `Copy` → teks polos.
-   `Copy Word` → klon `<pre>` (hilangkan _line‑numbers gutter_), **inline style** semua warna/font agar **tidak rusak** di Word/Docs.

### Ekspor PNG/PDF

-   PNG: `html-to-image.toBlob(pre, { pixelRatio: 2 })`
-   PDF: render ke PNG, _fit_ ke A4 margin 24pt, `jsPDF.addImage(...)`.

---

## 🌐 PWA & Caching

`sw.js` menggunakan tiga cache:

-   **CORE_CACHE**: `PRECACHE` (HTML/CSS/JS/manifest/icon + tema Prism).
-   **RUNTIME_CACHE**:
    -   **navigate**: _network‑then‑cache_ (fallback ke `/index.html` saat offline).
    -   **asset** (script/style/font/image origin sama): **cache‑first**.
    -   **lainnya**: **stale‑while‑revalidate**.
-   **COMPONENTS_CACHE**: Prism components `networkFirstWithLimit` (max **200** entri) + `enforceLimit`.

> Ubah `VERSION` untuk _cache busting_ saat rilis baru.

---

## 🌍 I18N

-   File kamus: `/assets/i18n/id.json`, `/assets/i18n/en.json`.
-   Tambah bahasa baru → buat `xx.json`, panggil `setUiLang("xx")`.
-   Beberapa label di‑normalize (mis. “Copy Word”, “PNG”, “PDF”) agar konsisten.

---

## 🛡️ Keamanan & Header yang Disarankan

Contoh **CSP** (sesuaikan domain vendor jika mengubah lokasi `htmlotimage.js/jsPDF`):

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

Tambahkan juga:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cache-Control: public, max-age=31536000, immutable
```

> Di Cloudflare Pages/Netlify, atur via _Response headers_ atau file `_headers`.

---

## 🛠️ Kustomisasi

-   **Tambah Bahasa**: masukkan file Prism **.min.js** ke `assets/prismjs/package/components/` dan (opsional) daftar di `assets/languages.json` (untuk tampil di menu).
-   **Tema Prism**: ganti file pada `assets/prismjs/package/themes/` dan perbarui `THEMES` di `assets/app.js`.
-   **Batas Komponen**: ubah `COMPONENTS_MAX` di `sw.js` (default 200).
-   **Auto‑override**: ubah `AUTO_OVERRIDE_GAP` (default 2) di `assets/app.js`.

---

## 🧪 Troubleshooting

-   **Service Worker tidak aktif** → akses via `http(s)://`, bukan `file://`.
-   **Copy Word tidak berwarna** → cek izin clipboard & jangan blokir _rich clipboard_.
-   **Bahasa tidak ter‑highlight** → pastikan komponen Prism tersedia; lihat Network (autoloader ambil `.min.js`).
-   **PNG/PDF gagal** → pastikan `htmlotimage.js` & `jspdf.js` termuat (cek Console).

---

## 📦 Deployment

### Cloudflare Pages (disarankan)

-   **Build command**: _(kosongkan)_
-   **Output dir**: `/` (root)
-   Pastikan `sw.js` berada di **root** karena didaftarkan via `navigator.serviceWorker.register("/sw.js")`.

### Netlify / Vercel / Static hosting lainnya

-   Unggah seluruh direktori sebagaimana struktur di atas.
-   Atur header keamanan seperti bagian **Keamanan**.

---

## 📚 Kredit

-   **PrismJS** (MIT) — Syntax highlighting.
-   **html-to-image** — Render DOM ke PNG.
-   **jsPDF** — Generasi PDF sisi klien.

---

## 🛣️ Roadmap (pandangan ke depan)

-   [ ] Opsi tema Prism lebih banyak (di luar Okaidia/Solarized Light).
-   [ ] **Batch Export** (multi‑snippet ke satu PDF).
-   [ ] **Share** (permalink dengan _state_ terserialisasi).
-   [ ] **Keyboard shortcuts** (copy/copy‑word/export).
-   [ ] Dukungan **tema custom** berbasis CSS Vars.

---

## 📄 Lisensi

**MIT** — silakan gunakan, modifikasi, dan distribusikan dengan bebas.  
(Lihat `LICENSE` jika ditambahkan pada repo.)

---

## 🇬🇧 English (Short)

**TRHC** is a lightweight **PWA** code highlighter powered by **PrismJS (self‑host)**. It auto‑detects languages, lets you **copy with colors** to **Word/Google Docs**, and **export PNG/PDF**—all **offline‑first**.

-   Auto language detection (fences, extension, shebang, signatures, keyword scoring; auto‑override gap = 2).
-   Prism **autoloader** (components loaded on demand).
-   Copy (plain / rich for Word/Docs), Export (PNG/PDF), Print.
-   Light/Dark theme, line numbers, wrap, searchable language menu.
-   ID/EN i18n, accessible UI, SW caching with component LRU.

**Run locally**: `npx serve .` → open `http://localhost:5173`.  
**Deploy**: any static host (Cloudflare Pages recommended).  
**Customize**: drop new Prism components into `/assets/prismjs/package/components/` and list them in `assets/languages.json`.

---

**Repo**: https://github.com/kakrusliandika/TenRusl-HighlightCode  
**Author**: TenRusli (TRHC)
