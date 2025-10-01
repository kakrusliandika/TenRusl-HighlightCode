/* =========================================================
   TRHC language.js — App (index) bilingual EN/ID
   - Loads /assets/i18n/{en,id}.json with LS caching
   - First-run auto-detect: LS -> meta/var country -> navigator -> timezone
   - Persists to LS 'trhc.uiLang' so pages follow too
   - Updates text via [data-i18n] + placeholders/titles
   - Exposes window.TRI18N
   ======================================================= */
(function () {
    "use strict";

    const LS_LANG = "trhc.uiLang";
    const LS_DICT = (lang) => `trhc.i18n.${lang}`;
    const SUPPORTED = ["en", "id"];
    const uiBadge = document.getElementById("uiLangBadge");

    // ---- Fallback minimal (offline first boot) ----
    const FALLBACK = {
        en: {
            uiLang: "UI",
            theme: "Theme",
            codeLang: "Language",
            lineNumbers: "Line numbers",
            wrapLines: "Wrap lines",
            editor: "Editor",
            preview: "Preview",
            paste: "Paste",
            clear: "Clear",
            copy: "Copy",
            copyRich: "Copy Word",
            exportPNG: "PNG",
            exportPDF: "PDF",
            print: "Print",
            dropHint: "Drag & drop source files (safe, offline)",
            placeholder: "// Paste your code here or drop a file…",
            copied: "Copied.",
            copiedRich: "Copied with colors (Word/Docs).",
            privacy: "Privacy",
            terms: "Terms",
            cookies: "Cookies",
        },
        id: {
            uiLang: "UI",
            theme: "Tema",
            codeLang: "Bahasa",
            lineNumbers: "Nomor baris",
            wrapLines: "Bungkus baris",
            editor: "Pengubah",
            preview: "Pratinjau",
            paste: "Tempel",
            clear: "Bersihkan",
            copy: "Salin",
            copyRich: "Salin Word",
            exportPNG: "PNG",
            exportPDF: "PDF",
            print: "Cetak",
            dropHint: "Seret & jatuhkan file kode (aman, offline)",
            placeholder: "// Tempel kode Anda di sini atau seret file…",
            copied: "Tersalin.",
            copiedRich: "Tersalin dengan warna (Word/Docs).",
            privacy: "Privasi",
            terms: "Ketentuan",
            cookies: "Cookie",
        },
    };

    let dict = FALLBACK.en;

    const clamp = (x) => (SUPPORTED.includes(String(x).toLowerCase()) ? String(x).toLowerCase() : "en");

    function t(key) {
        return dict[key] || key;
    }

    async function loadDict(lang) {
        // 1) LS cache
        const cached = localStorage.getItem(LS_DICT(lang));
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch {}
        }
        // 2) fetch
        const url = `/assets/i18n/${lang}.json`;
        try {
            const res = await fetch(url, { cache: "no-cache", credentials: "same-origin" });
            if (!res.ok) throw new Error("i18n fetch fail");
            const json = await res.json();
            localStorage.setItem(LS_DICT(lang), JSON.stringify(json));
            return json;
        } catch {
            return FALLBACK[lang] || FALLBACK.en;
        }
    }

    // ---------- First-run auto-detect ----------
    function detectInitialLang() {
        // a) user-set
        const fromLS = localStorage.getItem(LS_LANG);
        if (fromLS) return clamp(fromLS);

        // b) server/edge hint (optional): meta[name="trhc-country"] or window.__TRHC_COUNTRY
        const metaCountry = document.querySelector('meta[name="trhc-country"]')?.getAttribute("content");
        const hinted = (window.__TRHC_COUNTRY || metaCountry || "").toUpperCase();
        if (hinted === "ID") return "id";

        // c) navigator languages
        const langs = (navigator.languages || [navigator.language || "en"]).map((x) => String(x).toLowerCase());
        if (langs.some((x) => x.startsWith("id"))) return "id";

        // d) TZ heuristic
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (/^Asia\/(Jakarta|Makassar|Jayapura)$/i.test(tz)) return "id";

        // e) default
        return "en";
    }

    function setTitles() {
        const map = [
            ["btnUiLang", "uiLang"],
            ["btnTheme", "theme"],
            ["btnLineNumbers", "lineNumbers"],
            ["btnWrap", "wrapLines"],
            ["btnPaste", "paste"],
            ["btnClear", "clear"],
            ["btnCopy", "copy"],
            ["btnCopyRich", "copyRich"],
            ["btnExportPNG", "exportPNG"],
            ["btnExportPDF", "exportPDF"],
            ["btnPrint", "print"],
        ];
        map.forEach(([id, key]) => {
            const el = document.getElementById(id);
            if (!el) return;
            const txt = t(key);
            el.title = txt;
            el.setAttribute("aria-label", txt);
        });
    }

    function setAdHocLabels() {
        const pngLabel = document.querySelector("#btnExportPNG .label");
        if (pngLabel) pngLabel.textContent = t("exportPNG");
        const pdfLabel = document.querySelector("#btnExportPDF .label");
        if (pdfLabel) pdfLabel.textContent = t("exportPDF");
    }

    function applyTexts() {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const k = el.getAttribute("data-i18n");
            el.textContent = t(k);
        });
        const input = document.getElementById("input");
        if (input && dict.placeholder) input.placeholder = dict.placeholder;

        setTitles();
        setAdHocLabels();
    }

    async function setUiLang(lang) {
        const next = clamp(lang);
        dict = await loadDict(next);
        localStorage.setItem(LS_LANG, next);
        document.documentElement.lang = next === "id" ? "id" : "en";
        if (uiBadge) uiBadge.textContent = next.toUpperCase();
        applyTexts();

        // Inform other scripts/pages (for open pages with same origin)
        document.dispatchEvent(new CustomEvent("trhc:i18nUpdated", { detail: { lang: next } }));
    }

    async function init() {
        const initial = detectInitialLang();
        await setUiLang(initial);
    }

    document.addEventListener("DOMContentLoaded", init);

    window.TRI18N = {
        setUiLang,
        toggleUiLang: () => setUiLang((localStorage.getItem(LS_LANG) || "en") === "en" ? "id" : "en"),
        t,
    };
})();
