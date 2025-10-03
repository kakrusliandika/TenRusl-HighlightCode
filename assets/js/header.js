/* =========================================================
   header.js — inject header (if missing) + bind theme/lang
   NOTE: load this BEFORE app.js
   ======================================================= */
(() => {
    "use strict";

    document.documentElement.classList.remove("no-js");

    // --- inject markup kalau .app-header belum ada (untuk pages) ---
    function ensureHeader() {
        if (document.querySelector(".app-header")) return;
        const header = document.createElement("header");
        header.className = "app-header";
        header.innerHTML = `
      <div class="brand">
        <img src="/assets/images/icon.svg" width="28" height="28" alt="TRHC" />
        <strong>
          <span class="brand-full">TenRusl Highlight Code</span>
          <span class="brand-abbr">TRHC</span>
        </strong>
        <span class="badge">PWA</span>
      </div>

      <nav class="controls" aria-label="Toolbar">
        <!-- UI Language -->
        <button id="btnUiLang" class="icon-btn" type="button" title="Toggle UI Language" aria-label="Toggle UI Language">
          <i class="fa-solid fa-globe icon" aria-hidden="true"></i>
          <span id="uiLangBadge" class="badge-mini">EN</span>
        </button>

        <!-- Theme -->
        <button id="btnTheme" class="icon-btn" type="button" title="Toggle Theme" aria-label="Toggle Theme" style="position: relative">
          <i class="fa-solid fa-sun icon icon-sun" aria-hidden="true"></i>
          <i class="fa-solid fa-moon icon icon-moon" aria-hidden="true"></i>
        </button>

        <!-- Code language popover trigger -->
        <button id="btnLangMenu" class="icon-btn" type="button" title="Choose Code Language" aria-haspopup="dialog" aria-expanded="false" aria-controls="langPopover">
          <i class="fa-solid fa-code-compare icon" aria-hidden="true"></i>
          <span id="langBadge" class="badge-mini">JS</span>
        </button>

        <!-- Line numbers -->
        <button id="btnLineNumbers" class="icon-btn ghost" type="button" role="switch" aria-checked="true" title="Toggle line numbers" aria-label="Toggle line numbers">
          <i class="fa-solid fa-list-ol icon" aria-hidden="true"></i>
        </button>

        <!-- Wrap lines -->
        <button id="btnWrap" class="icon-btn ghost" type="button" role="switch" aria-checked="true" title="Toggle wrap lines" aria-label="Toggle wrap lines">
          <i class="fa-solid fa-text-width icon" aria-hidden="true"></i>
        </button>
      </nav>

      <!-- Code language popover -->
      <div id="langPopover" class="popover" role="dialog" aria-modal="false" aria-label="Choose code language" hidden>
        <div class="popover-head">
          <span data-i18n="codeLang">Language</span>
          <button id="btnLangClose" class="icon-btn ghost sm" type="button" title="Close" aria-label="Close language menu">
            <i class="fa-solid fa-xmark icon" aria-hidden="true"></i>
          </button>
        </div>
        <div class="popover-body">
          <input id="langSearch" class="search" type="search" placeholder="Search language…" aria-label="Search language" />
          <div id="langList" class="lang-grid" role="listbox" aria-label="Languages"></div>
        </div>
      </div>
    `;
        document.body.prepend(header);
    }

    // --- badge bahasa helper (agar tetap sinkron walau language.js load duluan) ---
    const LS_LANG = "trhc.uiLang";
    const getUiBadgeText = () => ((localStorage.getItem(LS_LANG) || "en").toLowerCase() === "id" ? "ID" : "EN");
    const updateUiBadge = () => {
        const b = document.getElementById("uiLangBadge");
        if (b) b.textContent = getUiBadgeText();
    };

    // --- bind tombol2 ke API yang sudah ada (theme.js & language.js) ---
    function wire() {
        const btnTheme = document.getElementById("btnTheme");
        const btnUiLang = document.getElementById("btnUiLang");

        if (btnTheme) {
            btnTheme.addEventListener("click", () => {
                // pakai API theme.js
                if (window.TRTheme && typeof TRTheme.toggleTheme === "function") TRTheme.toggleTheme();
            });
        }

        if (btnUiLang) {
            btnUiLang.addEventListener("click", () => {
                // pakai API language.js; fallback LS kalau TRI18N belum ada (aman)
                if (window.TRI18N && typeof TRI18N.toggleUiLang === "function") {
                    TRI18N.toggleUiLang();
                } else {
                    const cur = (localStorage.getItem(LS_LANG) || "en").toLowerCase();
                    localStorage.setItem(LS_LANG, cur === "en" ? "id" : "en");
                    document.dispatchEvent(
                        new CustomEvent("trhc:i18nUpdated", { detail: { lang: localStorage.getItem(LS_LANG) } })
                    );
                }
            });
        }

        // sinkronkan badge saat bahasa diubah dari language.js
        document.addEventListener("trhc:i18nUpdated", updateUiBadge);
        updateUiBadge();
    }

    // Jalankan segera (script defer dieksekusi setelah HTML ter-parse, sebelum DOMContentLoaded)
    ensureHeader();
    wire();
})();
