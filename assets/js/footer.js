/* =========================================================
   footer.js — FINAL (HOME / .app-footer)
   - Bind existing .app-footer (no inject) — jika ada
   - Inject .app-footer — jika belum ada
   - i18n labels OK (tanpa [object Object])
     • Prioritas: TRI18N.t(key) → PagesI18N.t(key) → PagesI18N.t('nav.'+key)
   - Dynamic year (#year)
   - TRStatus helper (auto-clear 2.2s)
   ======================================================= */
(() => {
    "use strict";

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    function t(key, fallback) {
        const tri18n = window.TRI18N && typeof window.TRI18N.t === "function" ? window.TRI18N.t : null;
        const pgi18n = window.PagesI18N && typeof window.PagesI18N.t === "function" ? window.PagesI18N.t : null;

        let out = tri18n ? tri18n(key) : null;
        if (out == null && pgi18n) out = pgi18n(key);
        if (out == null && pgi18n && !key.includes(".")) out = pgi18n(`nav.${key}`);

        return out ?? (fallback || key);
    }

    function applyI18N(scope) {
        $$("[data-i18n]", scope).forEach((el) => {
            const key = el.getAttribute("data-i18n");
            const label = el.querySelector(".label");
            const text = t(key, label ? label.textContent : el.textContent);
            if (label) label.textContent = text;
            else el.textContent = text;
        });
    }

    function setYear(scope) {
        const yearEl = $("#year", scope);
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    function injectFooter() {
        // jangan injeksi kalau sudah ada
        const existing = $(".app-footer");
        if (existing) return existing;

        const f = document.createElement("footer");
        f.className = "app-footer";
        f.innerHTML = `
      <div class="left">
        <div id="status" role="status" aria-live="polite"></div>
        <div class="muted">
          © <span id="year"></span> TenRusl Highlight Code <span class="dot"> • </span> Powered by
          <span class="badge">PrismJS</span>
        </div>
      </div>

      <div class="right">
        <a href="/pages/privacy.html" class="icon-btn" data-i18n="privacy" title="Privacy">
          <i class="fa-solid fa-shield icon" aria-hidden="true"></i>
          <span class="label">Privacy</span>
        </a>
        <a href="/pages/terms.html" class="icon-btn" data-i18n="terms" title="Terms">
          <i class="fa-solid fa-scale-balanced icon" aria-hidden="true"></i>
          <span class="label">Terms</span>
        </a>
        <a href="/pages/cookies.html" class="icon-btn" data-i18n="cookies" title="Cookies">
          <i class="fa-solid fa-cookie-bite icon" aria-hidden="true"></i>
          <span class="label">Cookies</span>
        </a>
        <a
          href="https://github.com/kakrusliandika/TenRusl-HighlightCode"
          target="_blank" rel="noopener"
          class="icon-btn"
          title="GitHub"
        >
          <i class="fa-brands fa-github icon" aria-hidden="true"></i>
          <span class="label">GitHub</span>
        </a>
      </div>`;
        document.body.appendChild(f);
        return f;
    }

    function bindFooter() {
        const f = $(".app-footer") || injectFooter();
        if (!f) return;
        setYear(f);
        applyI18N(f);
    }

    // re-translate saat bahasa diubah
    document.addEventListener("trhc:i18nUpdated", () => {
        const f = $(".app-footer");
        if (f) applyI18N(f);
    });

    // boot
    function boot() {
        bindFooter();
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

    // helper status bar
    window.TRStatus = window.TRStatus || {
        set(msg) {
            const f = $(".app-footer");
            if (!f) return;
            const el = $("#status", f);
            if (!el) return;
            el.textContent = msg || "";
            if (msg) {
                setTimeout(() => {
                    if (el.textContent === msg) el.textContent = "";
                }, 2200);
            }
        },
    };
})();
