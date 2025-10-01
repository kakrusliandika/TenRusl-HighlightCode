/* app.js — language popover, autodetect, Prism render, copy/export/print */
(() => {
    "use strict";

    const COMPONENTS_PATH = "/assets/plugin/prismjs/package/components/";
    const VENDOR_HTML2IMG = "/assets/plugin/htmlotimage.js";
    const VENDOR_JSPDF = "/assets/plugin/jspdf.js";

    const els = {
        btnLangMenu: document.getElementById("btnLangMenu"),
        langPopover: document.getElementById("langPopover"),
        btnLangClose: document.getElementById("btnLangClose"),
        langSearch: document.getElementById("langSearch"),
        langList: document.getElementById("langList"),
        langBadge: document.getElementById("langBadge"),

        btnLineNumbers: document.getElementById("btnLineNumbers"),
        btnWrap: document.getElementById("btnWrap"),
        input: document.getElementById("input"),
        pre: document.getElementById("pre"),
        code: document.getElementById("code"),
        btnPaste: document.getElementById("btnPaste"),
        btnClear: document.getElementById("btnClear"),
        btnCopy: document.getElementById("btnCopy"),
        btnCopyRich: document.getElementById("btnCopyRich"),
        btnExportPNG: document.getElementById("btnExportPNG"),
        btnExportPDF: document.getElementById("btnExportPDF"),
        btnPrint: document.getElementById("btnPrint"),
        dropZone: document.getElementById("dropZone"),
    };

    const store = {
        get(k, d) {
            try {
                return JSON.parse(localStorage.getItem(k)) ?? d;
            } catch {
                return d;
            }
        },
        set(k, v) {
            localStorage.setItem(k, JSON.stringify(v));
        },
    };

    function toast(msg) {
        window.TRStatus && TRStatus.set(msg);
    }

    function loadScriptOnce(url) {
        return new Promise((res, rej) => {
            const exists = Array.from(document.scripts).some((s) => s.src && (s.src === url || s.src.endsWith(url)));
            if (exists) return res();
            const s = document.createElement("script");
            s.src = url;
            s.defer = true;
            s.onload = () => res();
            s.onerror = () => rej(new Error("script: " + url));
            document.head.appendChild(s);
        });
    }

    /* ===== Prism autoloader ===== */
    function configureAutoloader() {
        if (window.Prism && Prism.plugins && Prism.plugins.autoloader) {
            Prism.plugins.autoloader.languages_path = COMPONENTS_PATH;
            Prism.plugins.autoloader.use_minified = true;
        }
    }

    /* ===== Code languages list ===== */
    const LANGS = [
        { prism: "javascript", label: "JavaScript" },
        { prism: "typescript", label: "TypeScript" },
        { prism: "python", label: "Python" },
        { prism: "go", label: "Go" },
        { prism: "java", label: "Java" },
        { prism: "php", label: "PHP" },
        { prism: "c", label: "C" },
        { prism: "cpp", label: "C++" },
        { prism: "csharp", label: "C#" },
        { prism: "rust", label: "Rust" },
        { prism: "bash", label: "Bash" },
        { prism: "sql", label: "SQL" },
        { prism: "json", label: "JSON" },
        { prism: "yaml", label: "YAML" },
        { prism: "markup", label: "HTML" },
        { prism: "css", label: "CSS" },
        { prism: "jsx", label: "JSX" },
        { prism: "tsx", label: "TSX" },
        { prism: "kotlin", label: "Kotlin" },
        { prism: "swift", label: "Swift" },
        { prism: "powershell", label: "PowerShell" },
        { prism: "graphql", label: "GraphQL" },
        { prism: "docker", label: "Dockerfile" },
        { prism: "nginx", label: "Nginx conf" },
        { prism: "apacheconf", label: "Apache conf" },
        { prism: "protobuf", label: "Protobuf" },
        { prism: "ini", label: "INI" },
        { prism: "toml", label: "TOML" },
        { prism: "markdown", label: "Markdown" },
        { prism: "scss", label: "SCSS" },
        { prism: "less", label: "LESS" },
    ];

    function badgeFor(lang) {
        const map = {
            javascript: "JS",
            typescript: "TS",
            python: "PY",
            go: "GO",
            java: "JAVA",
            php: "PHP",
            c: "C",
            cpp: "C++",
            csharp: "C#",
            rust: "RS",
            bash: "SH",
            sql: "SQL",
            json: "JSON",
            yaml: "YAML",
            markup: "HTML",
            css: "CSS",
            jsx: "JSX",
            tsx: "TSX",
            kotlin: "KT",
            swift: "SW",
            powershell: "PS",
            graphql: "GQL",
            docker: "DOCK",
            nginx: "NGX",
            apacheconf: "APCH",
            protobuf: "PROTO",
            ini: "INI",
            toml: "TOML",
            markdown: "MD",
            scss: "SCSS",
            less: "LESS",
        };
        return map[lang] || (lang ? String(lang).toUpperCase().slice(0, 4) : "AUTO");
    }

    /* ===== Popover ===== */
    const LS_CODE_LANG = "trhc.codeLang"; // 'auto' or prism id
    let selectedLang = store.get(LS_CODE_LANG, "auto");

    function renderLangList(filter) {
        const q = (filter || "").trim().toLowerCase();
        const items = LANGS.filter((x) => !q || (x.label + " " + x.prism).toLowerCase().includes(q));

        let html = `<button type="button" class="lang-item" role="option" tabindex="0" data-lang="auto" ${
            selectedLang === "auto" ? 'data-active="true"' : ""
        }>
      <span class="lang-badge">AUTO</span><span class="lang-label">Auto (Detect)</span></button>`;

        items.forEach((x) => {
            const active = selectedLang !== "auto" && x.prism === selectedLang ? 'data-active="true"' : "";
            html += `<button type="button" class="lang-item" role="option" tabindex="0" data-lang="${
                x.prism
            }" ${active}>
                <span class="lang-badge">${badgeFor(x.prism)}</span>
                <span class="lang-label">${x.label}</span></button>`;
        });

        els.langList.innerHTML = html;
    }

    let outsideHandler = null;
    function openLangPopover() {
        renderLangList("");
        els.langPopover.hidden = false;
        els.btnLangMenu.setAttribute("aria-expanded", "true");
        els.langSearch.value = "";
        els.langSearch.focus();
        outsideHandler = (e) => {
            const inside = e.target.closest && e.target.closest("#langPopover");
            if (!inside && e.target !== els.btnLangMenu) closeLangPopover();
        };
        document.addEventListener("pointerdown", outsideHandler);
    }
    function closeLangPopover() {
        els.langPopover.hidden = true;
        els.btnLangMenu.setAttribute("aria-expanded", "false");
        if (outsideHandler) {
            document.removeEventListener("pointerdown", outsideHandler);
            outsideHandler = null;
        }
    }

    /* ===== Autodetect ===== */
    const fenceAlias = {
        html: "markup",
        xml: "markup",
        shell: "bash",
        sh: "bash",
        zsh: "bash",
        "c++": "cpp",
        cpp: "cpp",
        "c#": "csharp",
        cs: "csharp",
        golang: "go",
        yml: "yaml",
        ts: "typescript",
        tsx: "tsx",
        jsx: "jsx",
        ps1: "powershell",
        pwsh: "powershell",
        gql: "graphql",
        proto: "protobuf",
        dockerfile: "docker",
        objectivec: "objectivec",
        objc: "objectivec",
    };

    const extMap = {
        js: "javascript",
        mjs: "javascript",
        cjs: "javascript",
        ts: "typescript",
        jsx: "jsx",
        tsx: "tsx",
        py: "python",
        go: "go",
        java: "java",
        php: "php",
        rb: "ruby",
        rs: "rust",
        c: "c",
        h: "c",
        cpp: "cpp",
        hpp: "cpp",
        cc: "cpp",
        cs: "csharp",
        css: "css",
        scss: "scss",
        less: "less",
        html: "markup",
        htm: "markup",
        xml: "markup",
        json: "json",
        yml: "yaml",
        yaml: "yaml",
        sh: "bash",
        bash: "bash",
        zsh: "bash",
        md: "markdown",
        markdown: "markdown",
        sql: "sql",
        toml: "toml",
        ini: "ini",
        ps1: "powershell",
        gql: "graphql",
        proto: "protobuf",
        dockerfile: "docker",
        nginx: "nginx",
        conf: "apacheconf",
    };

    const signatures = [
        { lang: "php", re: /<\?php|->|::/ },
        { lang: "python", re: /^\s*def\s+|^\s*class\s+|:\s*$/m },
        { lang: "go", re: /\bpackage\s+main\b|\bfunc\s+main\(/ },
        { lang: "java", re: /\bclass\s+\w+\s*{|public\s+static\s+void\s+main/ },
        { lang: "csharp", re: /\busing\s+System\b|namespace\s+\w+/ },
        { lang: "rust", re: /\bfn\s+main\s*\(|\blet\s+mut\b/ },
        { lang: "bash", re: /^#!.*\b(sh|bash|zsh)\b|^\s*#!/m },
        { lang: "javascript", re: /\b(import|export)\s+|=>|document\.|console\./ },
        { lang: "typescript", re: /\binterface\s+\w+|:\s*\w+(\[\])?\s*(=|;|\))/ },
        { lang: "sql", re: /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bCREATE\s+TABLE\b/i },
        { lang: "markup", re: /<\/?[a-z!][\s\S]*>/i },
        { lang: "css", re: /{\s*[^}]*:\s*[^}]*;?\s*}/ },
    ];

    const candidates = {
        javascript: ["function", "const ", "let ", "=>", "console.", "document.", ";"],
        typescript: ["interface ", "type ", "implements", ": ", " as ", "enum ", "readonly "],
        python: ["def ", "import ", " from ", " self", "elif", "None", ":\n", "print("],
        go: ["package ", "func ", "import ", " fmt.", " := ", " defer ", " go "],
        java: ["public ", " class ", " void ", " new ", " System.out", " static "],
        csharp: ["using ", "namespace ", " class ", " void ", " new ", " Console.", "public "],
        cpp: ["#include", "std::", "cout", "::", "->", "template"],
        c: ["#include", "printf", "scanf", "->", "sizeof", "typedef"],
        rust: ["fn ", "let mut", "println!", "::", "use ", "impl "],
        php: ["<?php", " echo ", "->", "$", " function "],
        bash: ["#!/", " echo ", " fi", " done", " for ", " do ", " then ", "${", '"$'],
        sql: ["SELECT ", "INSERT ", "UPDATE ", "CREATE ", "FROM ", " WHERE "],
        json: ["{", "}", '":"', '": '],
        yaml: [":\n", "- ", "---\n"],
        markdown: ["# ", "```", "- ", "* ", "> "],
        css: ["{", "}", ";", "@media", "@import"],
    };

    function scoreLang(code, lang) {
        const list = candidates[lang] || [];
        let s = 0;
        for (let i = 0; i < list.length; i++) {
            const kw = list[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const re = new RegExp(kw, "gi");
            const m = code.match(re);
            if (m) s += m.length;
        }
        return s;
    }

    function detectLanguage(raw, filename) {
        const code = (raw || "").slice(0, 8000);
        const name = filename || "";

        const mf = code.match(/```([a-z0-9_#+.-]+)\s*[\r\n]/i);
        if (mf) {
            const hint = mf[1].toLowerCase();
            return fenceAlias[hint] || hint;
        }

        if (name.includes(".")) {
            const ext = name.split(".").pop().toLowerCase();
            if (extMap[ext]) return extMap[ext];
        }

        if (/^#!.*\bpython\b/m.test(code)) return "python";
        if (/^#!.*\bnode\b/m.test(code)) return "javascript";
        if (/^#!.*\b(sh|bash|zsh)\b/m.test(code)) return "bash";

        for (let i = 0; i < signatures.length; i++) if (signatures[i].re.test(code)) return signatures[i].lang;

        if (/^\s*[\{\[]/.test(code) && !/\b(function|class|import|export|def|package)\b/.test(code)) {
            const colons = (code.match(/:\s*/g) || []).length;
            const semis = (code.match(/;/g) || []).length;
            if (colons >= 2 && semis < 3) return "json";
        }

        let best = "javascript",
            bestScore = -1;
        const langs = Object.keys(candidates);
        for (let j = 0; j < langs.length; j++) {
            const L = langs[j];
            const s = scoreLang(code, L);
            if (s > bestScore) {
                bestScore = s;
                best = L;
            }
        }
        return best;
    }

    /* ===== Render ===== */
    let detectedLang = "javascript";
    function updateBadge(lang) {
        els.langBadge.textContent = badgeFor(lang || "javascript");
    }

    function setPreCodeLang(effective) {
        els.code.className = "language-" + effective;
        const ln = els.pre.classList.contains("line-numbers");
        const wp = els.pre.classList.contains("wrap");
        els.pre.className = (
            "language-" +
            effective +
            " " +
            (ln ? "line-numbers " : "") +
            (wp ? "wrap " : "") +
            "match-braces"
        ).trim();
    }

    function prismRender() {
        configureAutoloader();
        try {
            Prism && Prism.highlightElement(els.code);
        } catch {}
    }

    function render(filename) {
        const code = els.input.value || "";
        const fname = filename || "";

        if (selectedLang === "auto") detectedLang = detectLanguage(code, fname);
        const effective = selectedLang === "auto" ? detectedLang : selectedLang;

        setPreCodeLang(effective);
        els.code.textContent = code;
        updateBadge(effective);
        prismRender();
    }
    function renderImmediate(filename) {
        requestAnimationFrame(() => render(filename || ""));
    }

    /* ===== Copy / Export ===== */
    function inlineStyles(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
        const allow = { SPAN: true, CODE: true, PRE: true };
        let node;
        while ((node = walker.nextNode())) {
            const el = node;
            if (!allow[el.tagName]) continue;
            const cs = getComputedStyle(el);
            el.style.color = cs.color;
            el.style.backgroundColor = cs.backgroundColor;
            el.style.fontFamily = cs.fontFamily;
            el.style.fontSize = cs.fontSize;
            el.style.fontWeight = cs.fontWeight;
            el.style.fontStyle = cs.fontStyle;
            el.style.textDecoration = cs.textDecoration;
            el.style.whiteSpace = cs.whiteSpace;
        }
        return root;
    }

    function copyPlain() {
        return navigator.clipboard.writeText(els.code.textContent || "").then(() => {
            const msg = (window.TRI18N && TRI18N.t("copied")) || "Copied";
            toast(msg);
        });
    }
    function copyRich() {
        const tmp = els.pre.cloneNode(true);
        const gut = tmp.querySelector(".line-numbers-rows");
        if (gut) gut.remove();
        tmp.classList.remove("line-numbers");
        inlineStyles(tmp);
        const dt = new DataTransfer();
        dt.setData("text/html", tmp.outerHTML);
        dt.setData("text/plain", els.code.textContent || "");
        return navigator.clipboard.write(dt).then(() => toast("Copied for Word"));
    }

    function exportPNG() {
        return loadScriptOnce(VENDOR_HTML2IMG)
            .then(() => {
                const toBlob = window.htmlToImage?.toBlob;
                if (!toBlob) throw new Error("html-to-image missing");
                return toBlob(els.pre, { pixelRatio: 2 });
            })
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "trhc-" + (selectedLang === "auto" ? detectedLang : selectedLang) + ".png";
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(() => toast("PNG failed"));
    }

    function exportPDF() {
        return loadScriptOnce(VENDOR_HTML2IMG)
            .then(() => loadScriptOnce(VENDOR_JSPDF))
            .then(() => {
                const toPng = window.htmlToImage?.toPng;
                const jsPDF = window.jspdf?.jsPDF;
                if (!toPng || !jsPDF) throw new Error("vendor missing");
                return toPng(els.pre, { pixelRatio: 2 }).then((dataUrl) => {
                    const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
                    const pageW = pdf.internal.pageSize.getWidth();
                    const pageH = pdf.internal.pageSize.getHeight();
                    const m = 24,
                        maxW = pageW - m * 2,
                        maxH = pageH - m * 2;
                    const img = new Image();
                    return new Promise((ok) => {
                        img.onload = function () {
                            let w = img.naturalWidth,
                                h = img.naturalHeight;
                            const s = Math.min(maxW / w, maxH / h, 1);
                            w *= s;
                            h *= s;
                            pdf.addImage(dataUrl, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h);
                            pdf.save("trhc-" + (selectedLang === "auto" ? detectedLang : selectedLang) + ".pdf");
                            ok();
                        };
                        img.src = dataUrl;
                    });
                });
            })
            .catch(() => toast("PDF failed"));
    }

    /* ===== Toggles / State ===== */
    function setLineNumbers(on) {
        els.pre.classList.toggle("line-numbers", !!on);
        store.set("lineNumbers", !!on);
    }
    function setWrap(on) {
        els.pre.classList.toggle("wrap", !!on);
        store.set("wrapLines", !!on);
    }

    function restoreState() {
        setLineNumbers(store.get("lineNumbers", true));
        setWrap(store.get("wrapLines", true));
        if (els.input) els.input.value = store.get("content", "");
        selectedLang = store.get(LS_CODE_LANG, "auto");
        updateBadge(selectedLang === "auto" ? "javascript" : selectedLang);
    }

    /* ===== Bindings ===== */
    function bind() {
        // Popover
        if (els.btnLangMenu)
            els.btnLangMenu.addEventListener("click", () =>
                els.langPopover.hidden ? openLangPopover() : closeLangPopover()
            );
        if (els.btnLangClose) els.btnLangClose.addEventListener("click", closeLangPopover);
        if (els.langSearch) els.langSearch.addEventListener("input", (e) => renderLangList(e.target.value));
        if (els.langList)
            els.langList.addEventListener("click", (e) => {
                const btn = e.target.closest && e.target.closest("button[data-lang]");
                if (!btn) return;
                selectedLang = btn.getAttribute("data-lang");
                store.set(LS_CODE_LANG, selectedLang);
                closeLangPopover();
                renderImmediate("");
            });

        // switches
        if (els.btnLineNumbers)
            els.btnLineNumbers.addEventListener("click", () => {
                const on = !(els.btnLineNumbers.getAttribute("aria-checked") === "true");
                els.btnLineNumbers.setAttribute("aria-checked", String(on));
                setLineNumbers(on);
                renderImmediate("");
            });
        if (els.btnWrap)
            els.btnWrap.addEventListener("click", () => {
                const on = !(els.btnWrap.getAttribute("aria-checked") === "true");
                els.btnWrap.setAttribute("aria-checked", String(on));
                setWrap(on);
                renderImmediate("");
            });

        // input
        if (els.input) {
            els.input.addEventListener("input", () => {
                store.set("content", els.input.value);
                renderImmediate("");
            });
            els.input.addEventListener("compositionend", () => renderImmediate(""));
            els.input.addEventListener("keyup", () => renderImmediate(""));
            els.input.addEventListener("paste", () => setTimeout(() => renderImmediate(""), 0));
        }

        // actions
        if (els.btnPaste)
            els.btnPaste.addEventListener("click", () => {
                navigator.clipboard
                    .readText()
                    .then((txt) => {
                        els.input.value = txt;
                        store.set("content", txt);
                        renderImmediate("");
                    })
                    .catch(() => toast("Clipboard not allowed"));
            });
        if (els.btnClear)
            els.btnClear.addEventListener("click", () => {
                els.input.value = "";
                store.set("content", "");
                renderImmediate("");
            });
        if (els.btnCopy) els.btnCopy.addEventListener("click", copyPlain);
        if (els.btnCopyRich) els.btnCopyRich.addEventListener("click", copyRich);
        if (els.btnExportPNG) els.btnExportPNG.addEventListener("click", exportPNG);
        if (els.btnExportPDF) els.btnExportPDF.addEventListener("click", exportPDF);
        if (els.btnPrint) els.btnPrint.addEventListener("click", () => window.print());

        // drag & drop
        if (els.dropZone) {
            ["dragenter", "dragover"].forEach((ev) =>
                els.dropZone.addEventListener(ev, (e) => {
                    e.preventDefault();
                    els.dropZone.classList.add("drag");
                })
            );
            ["dragleave", "drop"].forEach((ev) =>
                els.dropZone.addEventListener(ev, (e) => {
                    e.preventDefault();
                    els.dropZone.classList.remove("drag");
                })
            );
            els.dropZone.addEventListener("drop", (e) => {
                const f = e.dataTransfer?.files?.[0];
                if (!f) return;
                f.text().then((text) => {
                    els.input.value = text;
                    store.set("content", text);
                    renderImmediate(f.name);
                });
            });
        }
    }

    function main() {
        configureAutoloader();
        restoreState();
        if (els.input && !els.input.value) {
            els.input.value = 'console.log("Hello TRHC!");';
            store.set("content", els.input.value);
        }
        renderImmediate("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        bind();
        main();
    });
})();
