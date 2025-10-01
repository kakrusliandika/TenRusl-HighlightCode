/* =========================================================
   TRHC footer.js — Home only (.app-footer)
   - Dynamic year (#year)
   - i18n sync for footer links (Privacy/Terms/Cookies)
     • primary: TRI18N (home)
     • fallback: PagesI18N.nav.* (jika tersedia)
   - TRStatus helper (status bar with auto-clear)
   ======================================================= */
(() => {
    "use strict";

    const FOOT_SEL = ".app-footer";

    // ---- year ----
    function setYear() {
        const foot = document.querySelector(FOOT_SEL);
        if (!foot) return;
        const y = foot.querySelector("#year");
        if (y) y.textContent = new Date().getFullYear();
    }

    // ---- i18n helpers (Home first, fallback to Pages dict) ----
    function tri18n(key) {
        try {
            return window.TRI18N?.t?.(key) ?? null;
        } catch {
            return null;
        }
    }
    function pagesI18n(key) {
        try {
            return window.PagesI18N?.t?.(key) ?? null;
        } catch {
            return null;
        }
    }
    function translateFooter() {
        const foot = document.querySelector(FOOT_SEL);
        if (!foot) return;

        foot.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            const label = el.querySelector(":scope > .label");

            // 1) coba TRI18N (home)
            let txt = tri18n(key);

            // 2) fallback ke pages.json => nav.{key} (mis. privacy -> nav.privacy)
            if (!txt && !key.includes(".")) {
                txt = pagesI18n(`nav.${key}`);
            }

            if (txt) {
                if (label) label.textContent = txt;
                else el.textContent = txt;
            }
        });
    }

    // ---- public status helper ----
    window.TRStatus = {
        set(msg) {
            const foot = document.querySelector(FOOT_SEL);
            if (!foot) return;
            const el = foot.querySelector("#status");
            if (!el) return;
            el.textContent = msg || "";
            if (msg) {
                setTimeout(() => {
                    if (el.textContent === msg) el.textContent = "";
                }, 2200);
            }
        },
    };

    // ---- boot ----
    function boot() {
        setYear();
        translateFooter();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

    // re-translate saat bahasa diubah dari header
    document.addEventListener("trhc:i18nUpdated", translateFooter);
})();
