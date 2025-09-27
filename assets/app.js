/* TenRusli Highlight Code – app.js (stable) */
(() => {
    "use strict";

    /* ========= Config ========= */
    const THEMES = {
        dark: "/assets/prismjs/package/themes/prism-okaidia.min.css",
        light: "/assets/prismjs/package/themes/prism-solarizedlight.min.css",
    };
    const COMPONENTS_PATH = "/assets/prismjs/package/components/";
    const VENDOR_HTML2IMG = "/assets/htmlotimage.js";
    const VENDOR_JSPDF = "/assets/jspdf.js";
    const AUTO_OVERRIDE_GAP = 2;

    /* ========= DOM ========= */
    const els = {
        prismTheme: document.getElementById("prism-theme"),
        uiLangBadge: document.getElementById("uiLangBadge"),
        btnUiLang: document.getElementById("btnUiLang"),
        btnTheme: document.getElementById("btnTheme"),
        btnLangMenu: document.getElementById("btnLangMenu"),
        langBadge: document.getElementById("langBadge"),
        langPopover: document.getElementById("langPopover"),
        btnLangClose: document.getElementById("btnLangClose"),
        langSearch: document.getElementById("langSearch"),
        langList: document.getElementById("langList"),
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
        status: document.getElementById("status"),
        year: document.getElementById("year"),
    };
    if (els.year) els.year.textContent = new Date().getFullYear();

    /* ========= Store ========= */
    const store = {
        get: function (k, d) {
            try {
                return JSON.parse(localStorage.getItem(k)) ?? d;
            } catch (e) {
                return d;
            }
        },
        set: function (k, v) {
            localStorage.setItem(k, JSON.stringify(v));
        },
    };

    /* ========= Utils ========= */
    function toast(msg) {
        els.status.textContent = msg || "";
        if (msg) {
            setTimeout(function () {
                if (els.status.textContent === msg) els.status.textContent = "";
            }, 2200);
        }
    }

    function loadJSON(url) {
        return fetch(url, { cache: "no-cache" }).then(function (r) {
            if (!r.ok) throw new Error("load: " + url);
            return r.json();
        });
    }

    function loadScriptOnce(url) {
        return new Promise(function (res, rej) {
            var exists = Array.prototype.some.call(document.scripts, function (s) {
                return s.src && (s.src === url || s.src.endsWith(url));
            });
            if (exists) return res();
            var s = document.createElement("script");
            s.src = url;
            s.defer = true;
            s.onload = function () {
                res();
            };
            s.onerror = function () {
                rej(new Error("script: " + url));
            };
            document.head.appendChild(s);
        });
    }

    /* ========= Prism Language Loader (NEW) ========= */
    async function ensurePrismLanguage(lang) {
        if (!lang || lang === "none" || lang === "auto") return;
        configureAutoloader();

        // Sudah ada?
        if (window.Prism && Prism.languages && Prism.languages[lang]) return;

        // Programmatic load jika tersedia
        const al = Prism?.plugins?.autoloader;
        const loadFn = al && typeof al.loadLanguages === "function" ? al.loadLanguages : null;

        if (loadFn) {
            await new Promise((resolve) => {
                try {
                    loadFn.call(al, [lang], resolve);
                    // Guard timeout bila callback tidak terpanggil
                    setTimeout(resolve, 1000);
                } catch {
                    resolve();
                }
            });
        } else {
            // Trigger autoloader via dummy highlight + polling singkat
            const dummy = document.createElement("code");
            dummy.className = "language-" + lang;
            dummy.textContent = "";
            document.body.appendChild(dummy);
            try {
                Prism.highlightElement(dummy);
            } catch {}
            document.body.removeChild(dummy);

            await new Promise((resolve) => {
                const t0 = performance.now();
                const iv = setInterval(() => {
                    if (Prism.languages[lang] || performance.now() - t0 > 1000) {
                        clearInterval(iv);
                        resolve();
                    }
                }, 40);
            });
        }
    }

    /* ========= I18N ========= */
    var i18n = {
        t: function (k) {
            return k;
        },
    };

    function setUiLang(lang) {
        return loadJSON("/assets/i18n/" + lang + ".json")
            .catch(function () {
                return {};
            })
            .then(function (dict) {
                // override label sesuai permintaan
                if (!dict.copyRich) dict.copyRich = "Copy Word";
                dict.exportPNG = "PNG";
                dict.exportPDF = "PDF";
                i18n = {
                    t: function (k) {
                        return dict[k] || k;
                    },
                };
                document.querySelectorAll("[data-i18n]").forEach(function (el) {
                    var key = el.getAttribute("data-i18n");
                    el.textContent = i18n.t(key);
                });
                if (els.input) {
                    var ph = i18n.t("placeholder");
                    if (ph) els.input.placeholder = ph;
                }
                if (els.uiLangBadge) els.uiLangBadge.textContent = lang.toUpperCase();
                store.set("uiLang", lang);
            });
    }

    /* ========= Theme ========= */
    function setTheme(mode) {
        var light = mode === "light";
        document.documentElement.classList.toggle("light", light);
        if (els.prismTheme) els.prismTheme.href = light ? THEMES.light : THEMES.dark;
        store.set("theme", mode);
    }
    function toggleTheme() {
        var next = store.get("theme", "dark") === "dark" ? "light" : "dark";
        setTheme(next);
    }

    /* ========= Prism Autoloader ========= */
    function configureAutoloader() {
        if (window.Prism && Prism.plugins && Prism.plugins.autoloader) {
            Prism.plugins.autoloader.languages_path = COMPONENTS_PATH;
            Prism.plugins.autoloader.use_minified = true;
        }
    }

    /* ========= Languages & State ========= */
    var languages = [];
    var selectedLang = "auto"; // 'auto' | explicit prism id
    var detectedLang = "javascript";
    var lastCodeHash = 0;

    function currentLang() {
        return selectedLang === "auto" ? detectedLang : selectedLang;
    }

    function badgeFor(lang) {
        var map = {
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
            ruby: "RB",
        };
        return map[lang] || (lang ? String(lang).toUpperCase().slice(0, 4) : "AUTO");
    }

    function updateBadge() {
        if (els.langBadge) els.langBadge.textContent = badgeFor(currentLang());
    }

    var FAVORITES = (function () {
        var arr = [
            "javascript",
            "typescript",
            "python",
            "go",
            "java",
            "php",
            "c",
            "cpp",
            "csharp",
            "rust",
            "bash",
            "sql",
            "json",
            "yaml",
            "markup",
            "css",
            "jsx",
            "tsx",
        ];
        var s = {};
        arr.forEach(function (x) {
            s[x] = true;
        });
        return s;
    })();

    function renderLangList(filter) {
        var q = (filter || "").trim().toLowerCase();
        var items = (languages || []).filter(function (x) {
            var hay = (x.label + " " + x.prism + " " + x.id).toLowerCase();
            return !q || hay.indexOf(q) !== -1;
        });

        var autoActive = selectedLang === "auto" ? ' data-active="true"' : "";
        var html = "";
        html +=
            '<button type="button" class="lang-item" role="option" tabindex="0" data-lang="auto"' + autoActive + ">";
        html += '<span class="lang-badge">AUTO</span><span class="lang-label">Auto (Detect)</span></button>';

        var favs = [],
            rest = [];
        items.forEach(function (x) {
            if (FAVORITES[x.prism]) favs.push(x);
            else rest.push(x);
        });

        function btnHtml(x) {
            var active = selectedLang !== "auto" && x.prism === selectedLang ? ' data-active="true"' : "";
            var s =
                '<button type="button" class="lang-item" role="option" tabindex="0" data-lang="' +
                x.prism +
                '"' +
                active +
                ">";
            s += '<span class="lang-badge">' + badgeFor(x.prism) + "</span>";
            s += '<span class="lang-label">' + x.label + "</span></button>";
            return s;
        }

        favs.forEach(function (x) {
            html += btnHtml(x);
        });
        rest.forEach(function (x) {
            html += btnHtml(x);
        });

        if (els.langList) els.langList.innerHTML = html;
    }

    /* ========= Popover ========= */
    var outsideHandler = null;

    function openLangPopover() {
        renderLangList("");
        if (els.langPopover) els.langPopover.hidden = false;
        if (els.btnLangMenu) els.btnLangMenu.setAttribute("aria-expanded", "true");
        if (els.langSearch) {
            els.langSearch.value = "";
            els.langSearch.focus();
        }
        outsideHandler = function (e) {
            var inside = e.target.closest ? e.target.closest("#langPopover") : null;
            if (!inside && e.target !== els.btnLangMenu) closeLangPopover();
        };
        document.addEventListener("pointerdown", outsideHandler);
    }

    function closeLangPopover() {
        if (els.langPopover) els.langPopover.hidden = true;
        if (els.btnLangMenu) els.btnLangMenu.setAttribute("aria-expanded", "false");
        if (outsideHandler) {
            document.removeEventListener("pointerdown", outsideHandler);
            outsideHandler = null;
        }
    }

    /* ========= Universal Auto-Detector ========= */

    var fenceAlias = {
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

    var extMap = {
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

    var signatures = [
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
        { lang: "powershell", re: /^\s*(Get-|Set-|New-|Write-)[A-Za-z]+/m },
        { lang: "graphql", re: /\b(query|mutation|schema|type)\b\s*{?/ },
        { lang: "docker", re: /^\s*(FROM|RUN|COPY|CMD|ENTRYPOINT|EXPOSE)\b/m },
        { lang: "nginx", re: /\bserver\s*\{|\blocation\s+\/|\blisten\s+\d+/ },
        { lang: "apacheconf", re: /^<Directory\b|^\s*Require\s+/m },
        { lang: "protobuf", re: /^\s*syntax\s*=\s*"proto[23]";/m },
        { lang: "kotlin", re: /\bfun\s+\w+\(|\bdata\s+class\b/ },
        { lang: "swift", re: /\bimport\s+\w+|\bfunc\s+\w+\(/ },
        { lang: "ruby", re: /\bdef\s+\w+|end\b|puts\s+/ },
    ];

    var candidates = {
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
        ruby: ["def ", " end", " puts", " class ", " module "],
        swift: ["import ", " let ", " var ", " func ", "print("],
        kotlin: ["fun ", " val ", " var ", " data class ", "println("],
        bash: ["#!/", " echo ", " fi", " done", " for ", " do ", " then ", "${", '"$'],
        sql: ["SELECT ", "INSERT ", "UPDATE ", "CREATE ", "FROM ", " WHERE "],
        json: ["{", "}", '":"', '": '],
        yaml: [":\n", "- ", "---\n"],
        markdown: ["# ", "```", "- ", "* ", "> "],
        css: ["{", "}", ";", "@media", "@import"],
        scss: ["@mixin", "@include", "$", "&", "#{"],
        less: ["@", " .", " {", "}"],
        graphql: ["query ", "mutation ", "schema ", "type "],
        docker: ["FROM ", "RUN ", "COPY ", "CMD ", "ENTRYPOINT", "EXPOSE "],
        nginx: ["server {", "location ", "listen "],
        apacheconf: ["<Directory", "AllowOverride", "Require "],
        powershell: ["Write-Host", "Get-", "Set-", "New-", "$env:"],
        protobuf: ['syntax = "proto', "message ", "repeated ", "enum "],
        ini: ["[", "]", "="],
        toml: ["[", "]", "=", '"'],
        xml: ["<?xml", "</", "<"],
    };

    function scoreLang(code, lang) {
        var list = candidates[lang] || [];
        var s = 0;
        for (var i = 0; i < list.length; i++) {
            var kw = list[i];
            var esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            var re = new RegExp(esc, "gi");
            var m = code.match(re);
            if (m) s += m.length;
        }
        return s;
    }

    function detectLanguage(raw, filename) {
        var code = (raw || "").slice(0, 8000);
        var name = filename || "";

        // code fence anywhere: ```lang
        var mFence = code.match(/```([a-z0-9_#+.-]+)\s*[\r\n]/i);
        if (mFence) {
            var hint = mFence[1].toLowerCase();
            var mapped = fenceAlias[hint] || hint;
            return mapped;
        }

        // ext by filename
        var ext = "";
        if (name.indexOf(".") !== -1) {
            var parts = name.split(".");
            ext = (parts[parts.length - 1] || "").toLowerCase();
        }
        if (extMap[ext]) return extMap[ext];

        // shebang
        if (/^#!.*\bpython\b/m.test(code)) return "python";
        if (/^#!.*\bnode\b/m.test(code)) return "javascript";
        if (/^#!.*\b(sh|bash|zsh)\b/m.test(code)) return "bash";
        if (/^#!.*\bpwsh\b/m.test(code)) return "powershell";

        // signatures
        for (var i = 0; i < signatures.length; i++) {
            if (signatures[i].re.test(code)) return signatures[i].lang;
        }

        // JSON loose
        if (/^\s*[\{\[]/.test(code) && !/\b(function|class|import|export|def|package)\b/.test(code)) {
            var colons = (code.match(/:\s*/g) || []).length;
            var semis = (code.match(/;/g) || []).length;
            if (colons >= 2 && semis < 3) return "json";
        }

        // keyword scoring
        var best = "javascript";
        var bestScore = -1;
        var langs = Object.keys(candidates);
        for (var j = 0; j < langs.length; j++) {
            var L = langs[j];
            var s = scoreLang(code, L);
            if (s > bestScore) {
                bestScore = s;
                best = L;
            }
        }
        return best;
    }

    function bestTwoScores(code) {
        var top = { lang: null, score: -1 };
        var second = { lang: null, score: -1 };
        var langs = Object.keys(candidates);
        for (var i = 0; i < langs.length; i++) {
            var L = langs[i];
            var s = scoreLang(code, L);
            if (s > top.score) {
                second = top;
                top = { lang: L, score: s };
            } else if (s > second.score) {
                second = { lang: L, score: s };
            }
        }
        return { top: top, second: second };
    }

    /* ========= Rendering ========= */
    function updateCodeElement(lang, code) {
        var eff = lang === "auto" ? detectedLang : lang;
        els.code.className = "language-" + eff;
        var ln = els.pre.classList.contains("line-numbers");
        var wp = els.pre.classList.contains("wrap");
        els.pre.className = (
            "language-" +
            eff +
            " " +
            (ln ? "line-numbers " : "") +
            (wp ? "wrap " : "") +
            "match-braces"
        ).trim();
        els.code.textContent = code;
        updateBadge();
        if (els.langPopover && !els.langPopover.hidden) renderLangList(els.langSearch ? els.langSearch.value : "");
        store.set("codeLang", selectedLang);
    }

    function prismRender() {
        configureAutoloader();
        try {
            if (window.Prism) Prism.highlightElement(els.code);
        } catch (e) {
            /* ignore */
        }
    }

    function fastHash(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) {
            h = (h * 31 + s.charCodeAt(i)) | 0;
        }
        return h;
    }

    function render(filename) {
        var code = els.input.value || "";
        var hash = fastHash(code);
        var fname = filename || "";

        if (hash !== lastCodeHash) {
            var autoCandidate = detectLanguage(code, fname);
            if (selectedLang !== "auto") {
                var two = bestTwoScores(code);
                var curScore = scoreLang(code, selectedLang);
                if (two.top.lang && two.top.score - curScore >= AUTO_OVERRIDE_GAP) {
                    selectedLang = "auto";
                    toast("Auto: " + autoCandidate.toUpperCase());
                }
            }
            detectedLang = autoCandidate;
            lastCodeHash = hash;
        }
        updateCodeElement(selectedLang, code);
        prismRender();
    }

    function renderImmediate(filename) {
        requestAnimationFrame(function () {
            render(filename || "");
        });
    }

    /* ========= Copy / Export / Print ========= */
    function inlineStyles(root) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
        var allow = { SPAN: true, CODE: true, PRE: true };
        var node;
        while ((node = walker.nextNode())) {
            var el = node;
            if (!allow[el.tagName]) continue;
            var cs = getComputedStyle(el);
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
        return navigator.clipboard.writeText(els.code.textContent || "").then(function () {
            toast(i18n.t("copied"));
        });
    }

    function copyRich() {
        var tmp = els.pre.cloneNode(true);
        var gut = tmp.querySelector(".line-numbers-rows");
        if (gut) gut.remove();
        tmp.classList.remove("line-numbers");
        inlineStyles(tmp);
        var dt = new DataTransfer();
        dt.setData("text/html", tmp.outerHTML);
        dt.setData("text/plain", els.code.textContent || "");
        return navigator.clipboard.write(dt).then(function () {
            toast("Copied for Word");
        });
    }

    function exportPNG() {
        return loadScriptOnce(VENDOR_HTML2IMG)
            .then(function () {
                var toBlob = window.htmlToImage && window.htmlToImage.toBlob ? window.htmlToImage.toBlob : null;
                if (!toBlob) throw new Error("html-to-image not found");
                return toBlob(els.pre, { pixelRatio: 2 });
            })
            .then(function (blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.href = url;
                a.download = "trhc-" + currentLang() + ".png";
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(function () {
                toast("PNG gagal");
            });
    }

    function exportPDF() {
        return loadScriptOnce(VENDOR_HTML2IMG)
            .then(function () {
                return loadScriptOnce(VENDOR_JSPDF);
            })
            .then(function () {
                var toPng = window.htmlToImage && window.htmlToImage.toPng ? window.htmlToImage.toPng : null;
                var jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
                if (!toPng || !jsPDF) throw new Error("vendor not ready");
                return toPng(els.pre, { pixelRatio: 2 }).then(function (dataUrl) {
                    var pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
                    var pageW = pdf.internal.pageSize.getWidth();
                    var pageH = pdf.internal.pageSize.getHeight();
                    var m = 24;
                    var maxW = pageW - m * 2;
                    var maxH = pageH - m * 2;
                    var img = new Image();
                    return new Promise(function (ok) {
                        img.onload = function () {
                            var w = img.naturalWidth;
                            var h = img.naturalHeight;
                            var s = Math.min(maxW / w, maxH / h, 1);
                            w *= s;
                            h *= s;
                            pdf.addImage(dataUrl, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h);
                            pdf.save("trhc-" + currentLang() + ".pdf");
                            ok();
                        };
                        img.src = dataUrl;
                    });
                });
            })
            .catch(function () {
                toast("PDF gagal");
            });
    }

    /* ========= Init ========= */
    function setLineNumbers(on) {
        els.pre.classList.toggle("line-numbers", !!on);
        store.set("lineNumbers", !!on);
    }
    function setWrap(on) {
        els.pre.classList.toggle("wrap", !!on);
        store.set("wrapLines", !!on);
    }

    function bindEvents() {
        // Theme / UI lang
        if (els.btnTheme)
            els.btnTheme.addEventListener("click", function () {
                toggleTheme();
                renderImmediate("");
            });
        if (els.btnUiLang)
            els.btnUiLang.addEventListener("click", function () {
                var next = store.get("uiLang", "id") === "id" ? "en" : "id";
                setUiLang(next);
            });

        // Popover language
        if (els.btnLangMenu)
            els.btnLangMenu.addEventListener("click", function () {
                if (els.langPopover && els.langPopover.hidden) openLangPopover();
                else closeLangPopover();
            });
        if (els.btnLangClose) els.btnLangClose.addEventListener("click", closeLangPopover);
        if (els.langSearch)
            els.langSearch.addEventListener("input", function (e) {
                renderLangList(e.target.value);
            });
        if (els.langList)
            els.langList.addEventListener("click", function (e) {
                var btn = e.target.closest ? e.target.closest("button[data-lang]") : null;
                if (!btn) return;
                selectedLang = btn.getAttribute("data-lang");
                updateBadge();
                closeLangPopover();
                renderImmediate("");
            });

        // Switches
        if (els.btnLineNumbers)
            els.btnLineNumbers.addEventListener("click", function () {
                var on = !(els.btnLineNumbers.getAttribute("aria-checked") === "true");
                els.btnLineNumbers.setAttribute("aria-checked", String(on));
                setLineNumbers(on);
                renderImmediate("");
            });
        if (els.btnWrap)
            els.btnWrap.addEventListener("click", function () {
                var on = !(els.btnWrap.getAttribute("aria-checked") === "true");
                els.btnWrap.setAttribute("aria-checked", String(on));
                setWrap(on);
                renderImmediate("");
            });

        // Text input → render (autodetect)
        if (els.input) {
            els.input.addEventListener("input", function () {
                store.set("content", els.input.value);
                renderImmediate("");
            });
            els.input.addEventListener("compositionend", function () {
                renderImmediate("");
            });
            els.input.addEventListener("keyup", function () {
                renderImmediate("");
            });
            els.input.addEventListener("paste", function () {
                setTimeout(function () {
                    renderImmediate("");
                }, 0);
            });
        }

        // Paste/Clear buttons
        if (els.btnPaste)
            els.btnPaste.addEventListener("click", function () {
                navigator.clipboard
                    .readText()
                    .then(function (txt) {
                        els.input.value = txt;
                        store.set("content", txt);
                        renderImmediate("");
                    })
                    .catch(function () {
                        toast("Clipboard tidak diizinkan");
                    });
            });
        if (els.btnClear)
            els.btnClear.addEventListener("click", function () {
                els.input.value = "";
                store.set("content", "");
                renderImmediate("");
            });

        // Copy / PNG / PDF / Print
        if (els.btnCopy) els.btnCopy.addEventListener("click", copyPlain);
        if (els.btnCopyRich) els.btnCopyRich.addEventListener("click", copyRich);
        if (els.btnExportPNG) els.btnExportPNG.addEventListener("click", exportPNG);
        if (els.btnExportPDF) els.btnExportPDF.addEventListener("click", exportPDF);
        if (els.btnPrint)
            els.btnPrint.addEventListener("click", function () {
                window.print();
            });

        // Drag & Drop
        if (els.dropZone) {
            ["dragenter", "dragover"].forEach(function (ev) {
                els.dropZone.addEventListener(ev, function (e) {
                    e.preventDefault();
                    els.dropZone.classList.add("drag");
                });
            });
            ["dragleave", "drop"].forEach(function (ev) {
                els.dropZone.addEventListener(ev, function (e) {
                    e.preventDefault();
                    els.dropZone.classList.remove("drag");
                });
            });
            els.dropZone.addEventListener("drop", function (e) {
                var files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
                var f = files && files[0] ? files[0] : null;
                if (!f) return;
                f.text().then(function (text) {
                    els.input.value = text;
                    store.set("content", text);
                    renderImmediate(f.name);
                });
            });
        }

        // SW
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(function () {
                /* ignore */
            });
        }
    }

    function restoreState() {
        setTheme(store.get("theme", "dark"));
        setLineNumbers(store.get("lineNumbers", true));
        setWrap(store.get("wrapLines", true));
        if (els.input) els.input.value = store.get("content", "");
        selectedLang = store.get("codeLang", "auto");
        updateBadge();
    }

    function main() {
        setUiLang(store.get("uiLang", "id"))
            .then(function () {
                return loadJSON("/assets/languages.json").catch(function () {
                    return { languages: [] };
                });
            })
            .then(function (cfg) {
                languages = cfg.languages || [];
                restoreState();
                if (els.input && !els.input.value) {
                    els.input.value = 'console.log("Hello TRHC!");';
                    store.set("content", els.input.value);
                }
                configureAutoloader();
                renderImmediate("");
            });
    }

    /* ========= Boot ========= */
    document.documentElement.classList.remove("no-js");
    bindEvents();
    main();
})();
