/* =========================================================
   TenRusli Pages UI — pages.js (no deps)
   - Theme toggle (persist + meta theme-color)
   - Header/Footer inject + mobile nav
   - Consent banner (Consent Mode v2 bridge)
   - External link hardening
   - Code: copy buttons
   - Tabs, Accordion
   - Modal (focus trap)
   - Toasts
   - Table sort (text/number/date)
   - Reveal on scroll
   - SW register (scope '/')
   =======================================================*/
(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    /* ---------- THEME ---------- */
    const THEME_KEY = "tr-theme";
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const getTheme = () => localStorage.getItem(THEME_KEY) || (prefersDark ? "dark" : "light");
    const ensureMetaTheme = () => {
        let m = $('meta[name="theme-color"]');
        if (!m) {
            m = document.createElement("meta");
            m.name = "theme-color";
            document.head.appendChild(m);
        }
        return m;
    };
    const applyTheme = (t) => {
        document.documentElement.dataset.theme = t;
        ensureMetaTheme().setAttribute("content", t === "dark" ? "#0b1020" : "#ffffff");
        const btn = $(".theme-toggle");
        if (btn) {
            btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
            btn.innerHTML =
                t === "dark"
                    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.64 13A9 9 0 1111 2.36 7 7 0 1021.64 13z"/></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.76 4.84l-1.8-1.79L4 3 5.84 4.76l.92.92zM1 13h3v-2H1zm10 10h2v-3h-2zM20 13h3v-2h-3zM17.66 19.07l.92.92L20 19l-1.79-1.8-.55.55zM11 1h2V-2h-2zM3.34 19.07L5.2 17.2l-.55-.55L3 18.79zM12 6a6 6 0 100 12 6 6 0 000-12z"/></svg>';
        }
    };
    const setTheme = (t) => {
        localStorage.setItem(THEME_KEY, t);
        applyTheme(t);
    };
    const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");

    /* ---------- HEADER / FOOTER ---------- */
    function injectChrome() {
        // Header
        if (!$(".site-header")) {
            const header = document.createElement("header");
            header.className = "site-header";
            header.innerHTML = `
        <a class="sr-only" href="#main">Skip to content</a>
        <div class="header-inner">
          <a class="brand" href="/"><span class="logo"></span><span>TenRusli <span style="opacity:.8">Highlight Code</span></span></a>
          <button class="nav-toggle" aria-label="Toggle navigation" title="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
          </button>
          <nav class="nav" aria-label="Primary">
            <a href="/" data-path="/">Home</a>
            <a href="/pages/contact.html" data-path="/pages/contact.html">Contact</a>
            <a href="/pages/privacy.html" data-path="/pages/privacy.html">Privacy</a>
            <a href="/pages/terms.html" data-path="/pages/terms.html">Terms</a>
            <a href="/pages/cookies.html" data-path="/pages/cookies.html">Cookies</a>
            <button class="theme-toggle" title="Toggle theme" aria-label="Toggle theme"></button>
          </nav>
        </div>`;
            document.body.prepend(header);
        }
        // Footer
        if (!$(".site-footer")) {
            const f = document.createElement("footer");
            f.className = "site-footer";
            f.innerHTML = `<div class="inner">© ${new Date().getFullYear()} TenRusli • <span class="badge">PWA</span> <span class="badge">Edge-first</span> • <a href="/pages/contact.html">Support</a></div>`;
            document.body.appendChild(f);
        }

        // Active nav
        const path = location.pathname.replace(/\/+$/, "") || "/";
        $$(".nav a[data-path]").forEach((a) => a.classList.toggle("active", a.getAttribute("data-path") === path));

        // Mobile nav
        const nav = $(".nav");
        $(".nav-toggle")?.addEventListener("click", () => nav?.classList.toggle("open"));
        document.addEventListener("click", (e) => {
            if (!nav?.classList.contains("open")) return;
            if (!e.target.closest(".nav") && !e.target.closest(".nav-toggle")) nav.classList.remove("open");
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") nav?.classList.remove("open");
        });

        // Header shadow on scroll
        const hdr = $(".site-header");
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((en) => hdr.classList.toggle("scrolled", !en.isIntersecting));
            },
            { rootMargin: "-80px 0px 0px 0px" }
        );
        const sentinel = document.createElement("div");
        sentinel.style.position = "absolute";
        sentinel.style.top = "0";
        sentinel.style.height = "1px";
        sentinel.style.width = "1px";
        document.body.prepend(sentinel);
        io.observe(sentinel);

        // Theme handlers
        $(".theme-toggle")?.addEventListener("click", toggleTheme);
    }

    /* ---------- CONSENT BANNER ---------- */
    function consentBanner() {
        if (localStorage.getItem("tr-consent")) return;
        const banner = document.createElement("div");
        banner.id = "consent-banner";
        banner.innerHTML = `
      <div class="wrap card">
        <div><strong>Cookies & Privacy</strong> — We use cookies for analytics and ads (if consented). You can change this later.</div>
        <div class="actions">
          <button class="btn btn-ghost" data-act="reject">Reject</button>
          <button class="btn" data-act="customize">Customize</button>
          <button class="btn btn-primary" data-act="accept">Accept</button>
        </div>
      </div>`;
        document.body.appendChild(banner);
        banner.style.display = "block";
        banner.addEventListener("click", (ev) => {
            const b = ev.target.closest("button");
            if (!b) return;
            const act = b.dataset.act;
            const set = (v) => {
                localStorage.setItem("tr-consent", JSON.stringify({ ...v, ts: Date.now() }));
                banner.remove();
            };
            if (act === "accept") {
                set({ ads: true, analytics: true });
                typeof window.updateConsent === "function" && window.updateConsent();
                toast("Preferences saved. Thanks!", "success");
            } else if (act === "reject") {
                set({ ads: false, analytics: false });
                typeof window.updateConsent === "function" &&
                    window.updateConsent({
                        ad_storage: "denied",
                        ad_user_data: "denied",
                        ad_personalization: "denied",
                        analytics_storage: "denied",
                    });
                toast("Only essential cookies will be used.", "warn");
            } else if (act === "customize") {
                modal.open({
                    title: "Cookie Preferences",
                    body: `<div class="grid">
                   <label class="field"><span class="label">Analytics</span>
                     <input type="checkbox" class="switch" id="pref-analytics" checked></label>
                   <label class="field"><span class="label">Personalized Ads</span>
                     <input type="checkbox" class="switch" id="pref-ads" checked></label>
                 </div>`,
                    actions: [
                        { label: "Cancel", ghost: true },
                        {
                            label: "Save",
                            primary: true,
                            onClick: () => {
                                const a = $("#pref-analytics")?.checked;
                                const p = $("#pref-ads")?.checked;
                                localStorage.setItem(
                                    "tr-consent",
                                    JSON.stringify({ analytics: !!a, ads: !!p, ts: Date.now() })
                                );
                                typeof window.updateConsent === "function" &&
                                    window.updateConsent({
                                        analytics_storage: a ? "granted" : "denied",
                                        ad_storage: p ? "granted" : "denied",
                                        ad_user_data: p ? "granted" : "denied",
                                        ad_personalization: p ? "granted" : "denied",
                                    });
                                banner.remove();
                                toast("Preferences updated.", "success");
                            },
                        },
                    ],
                });
            }
        });
    }

    /* ---------- EXTERNAL LINKS ---------- */
    function hardenLinks() {
        const origin = location.origin;
        $$('a[href^="http"]').forEach((a) => {
            if (!a.href.startsWith(origin)) {
                a.rel = "noopener noreferrer";
                a.target = "_blank";
            }
        });
    }

    /* ---------- CODE COPY ---------- */
    function enhanceCode() {
        $$("pre > code").forEach((code) => {
            const pre = code.parentElement;
            if (pre.querySelector(".copy-btn")) return;
            const btn = document.createElement("button");
            btn.className = "btn btn-sm copy-btn";
            btn.type = "button";
            btn.textContent = "Copy";
            btn.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(code.innerText);
                    btn.textContent = "Copied!";
                    setTimeout(() => (btn.textContent = "Copy"), 1400);
                } catch {
                    btn.textContent = "Error";
                }
            });
            pre.appendChild(btn);
        });
    }

    /* ---------- TABS ---------- */
    function initTabs() {
        $$(".tabs").forEach((group) => {
            const tabs = $$(".tab", group);
            const panels = $$(".tab-panel", group);
            tabs.forEach((t, i) => {
                t.setAttribute("role", "tab");
                t.setAttribute("aria-controls", `panel-${i}`);
                panels[i]?.setAttribute("role", "tabpanel");
                panels[i]?.setAttribute("id", `panel-${i}`);
                t.addEventListener("click", () => {
                    tabs.forEach((x, j) => {
                        x.setAttribute("aria-selected", String(j === i));
                    });
                    panels.forEach((p, j) => p.classList.toggle("active", j === i));
                });
            });
            // default select first
            if (tabs.length) {
                tabs[0].setAttribute("aria-selected", "true");
                panels[0]?.classList.add("active");
            }
        });
    }

    /* ---------- ACCORDION ---------- */
    function initAccordion() {
        $$(".accordion .item .head").forEach((head) => {
            head.addEventListener("click", () => {
                const item = head.closest(".item");
                item.toggleAttribute("open");
            });
        });
    }

    /* ---------- MODAL (focus trap) ---------- */
    const modal = (() => {
        let backdrop, modalEl, lastFocus;
        function ensure() {
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.className = "modal-backdrop";
                backdrop.innerHTML = `
          <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="modal-head">
              <h3 id="modal-title" style="margin:0">Modal</h3>
              <button class="btn btn-icon" data-close aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 5l12.6 12.6-1.4 1.4L5 6.4 6.4 5zM5 17.6 17.6 5l1.4 1.4L6.4 19 5 17.6z"/></svg>
              </button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-foot"></div>
          </div>`;
                document.body.appendChild(backdrop);
                modalEl = $(".modal", backdrop);
                backdrop.addEventListener("click", (e) => {
                    if (e.target === backdrop) close();
                });
                backdrop.addEventListener("keydown", (e) => {
                    if (e.key === "Escape") close();
                });
                $(".modal [data-close]", backdrop).addEventListener("click", close);
            }
        }
        function trap() {
            const focusables = $$(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                modalEl
            ).filter((el) => !el.hasAttribute("disabled"));
            function loop(e) {
                if (e.key !== "Tab" || !focusables.length) return;
                const first = focusables[0],
                    last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
            modalEl.addEventListener("keydown", loop);
            setTimeout(() => focusables[0]?.focus(), 30);
        }
        function open({ title = "Modal", body = "", actions = [] } = {}) {
            ensure();
            lastFocus = document.activeElement;
            $("#modal-title", modalEl).textContent = title;
            $(".modal-body", modalEl).innerHTML = body;
            const foot = $(".modal-foot", modalEl);
            foot.innerHTML = "";
            actions.forEach((a) => {
                const b = document.createElement("button");
                b.className = "btn" + (a.primary ? " btn-primary" : a.ghost ? " btn-ghost" : "");
                b.textContent = a.label || "OK";
                b.addEventListener("click", () => {
                    a.onClick?.();
                    if (!a.preventClose) close();
                });
                foot.appendChild(b);
            });
            backdrop.classList.add("open");
            trap();
        }
        function close() {
            backdrop?.classList.remove("open");
            lastFocus?.focus();
        }
        return { open, close };
    })();

    /* ---------- TOASTS ---------- */
    function toast(msg, type = "info", ms = 3000) {
        let wrap = $(".toast-wrap");
        if (!wrap) {
            wrap = document.createElement("div");
            wrap.className = "toast-wrap";
            document.body.appendChild(wrap);
        }
        const t = document.createElement("div");
        t.className = `toast ${type}`;
        t.setAttribute("role", "status");
        t.setAttribute("aria-live", "polite");
        t.textContent = msg;
        wrap.appendChild(t);
        setTimeout(() => t.remove(), ms);
    }

    /* ---------- TABLE SORT ---------- */
    function initTableSort() {
        $$("th[data-sort]").forEach((th) => {
            th.addEventListener("click", () => {
                const table = th.closest("table");
                const idx = Array.from(th.parentNode.children).indexOf(th);
                const type = th.dataset.sort || "text";
                const dir = th.classList.contains("asc") ? "desc" : "asc";
                $$("th[data-sort]", table).forEach((x) => x.classList.remove("asc", "desc"));
                th.classList.add(dir);
                const tbody = table.tBodies[0];
                const rows = Array.from(tbody.rows);
                const parse = (v) => {
                    if (type === "number") return parseFloat(v.replace(/[^\d.-]/g, "")) || 0;
                    if (type === "date") return Date.parse(v) || 0;
                    return v.toString().toLowerCase();
                };
                rows.sort((a, b) => {
                    const av = parse(a.cells[idx]?.innerText || "");
                    const bv = parse(b.cells[idx]?.innerText || "");
                    return dir === "asc" ? (av > bv ? 1 : av < bv ? -1 : 0) : av < bv ? 1 : av > bv ? -1 : 0;
                });
                rows.forEach((r) => tbody.appendChild(r));
            });
        });
    }

    /* ---------- REVEAL ON SCROLL ---------- */
    function reveal() {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("reveal-in");
                        obs.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        $$(".reveal").forEach((el) => obs.observe(el));
    }

    /* ---------- SW REGISTER ---------- */
    function registerSW() {
        if (!("serviceWorker" in navigator)) return;
        navigator.serviceWorker.register("/assets/js/sw.js", { scope: "/" }).catch(() => {});
    }

    /* ---------- INIT ---------- */
    applyTheme(getTheme());
    injectChrome();
    hardenLinks();
    enhanceCode();
    initTabs();
    initAccordion();
    initTableSort();
    reveal();
    consentBanner();
    registerSW();

    // Expose minimal API
    window.TenRusliUI = { toggleTheme, setTheme, toast, modal };
})();
