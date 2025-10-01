/* TRHC – Service Worker (Prism self-host 1.30.0) */
const VERSION = "v1.30.0-trhc-3";
const CORE_CACHE = `trhc-core-${VERSION}`;
const RUNTIME_CACHE = `trhc-runtime-${VERSION}`;
const COMPONENTS_CACHE = `trhc-components-${VERSION}`;
const COMPONENTS_MAX = 200;

// (Opsional) halaman offline kustom, jika ada
const OFFLINE_URL = "/pages/offline.html";

const PRECACHE = [
    // Shell
    "/",
    "/index.html",
    "/manifest.webmanifest",

    // CSS (split)
    "/assets/css/theme.css",
    "/assets/css/language.css",
    "/assets/css/header.css",
    "/assets/css/footer.css",
    "/assets/css/app.css",

    // JS (split)
    "/assets/js/theme.js",
    "/assets/js/language.js",
    "/assets/js/header.js",
    "/assets/js/footer.js",
    "/assets/js/app.js",

    // Icons/Images
    "/assets/images/icon.svg",
    "/assets/icons/apple-touch-icon.png",

    // (Opsional) offline page
    "/pages/offline.html",

    // Vendor export
    "/assets/plugin/htmlotimage.js",
    "/assets/plugin/jspdf.js",

    // Prism core & plugins
    "/assets/plugin/prismjs/package/prism.js",
    "/assets/plugin/prismjs/package/plugins/line-numbers/prism-line-numbers.min.js",
    "/assets/plugin/prismjs/package/plugins/line-numbers/prism-line-numbers.min.css",
    "/assets/plugin/prismjs/package/plugins/match-braces/prism-match-braces.min.js",
    "/assets/plugin/prismjs/package/plugins/match-braces/prism-match-braces.css",
    "/assets/plugin/prismjs/package/plugins/autoloader/prism-autoloader.min.js",

    // Prism themes (sinkron dengan theme.js)
    "/assets/plugin/prismjs/package/themes/prism-okaidia.min.css",
    "/assets/plugin/prismjs/package/themes/prism-solarizedlight.min.css",
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches
            .open(CORE_CACHE)
            .then((c) => c.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(
                keys
                    .filter((k) => ![CORE_CACHE, RUNTIME_CACHE, COMPONENTS_CACHE].includes(k))
                    .map((k) => caches.delete(k))
            );
            await self.clients.claim();
        })()
    );
});

self.addEventListener("fetch", (e) => {
    const req = e.request;
    if (req.method !== "GET") return;

    const url = new URL(req.url);
    const same = url.origin === self.location.origin;

    const isNav =
        req.mode === "navigate" || (req.destination === "" && req.headers.get("accept")?.includes("text/html"));

    const isComp = same && url.pathname.startsWith("/assets/plugin/prismjs/package/components/");

    // Prism components (autoloader) — network-first + batasi entri cache
    if (isComp) {
        e.respondWith(networkFirstWithLimit(COMPONENTS_CACHE, req, COMPONENTS_MAX));
        return;
    }

    // Navigasi halaman
    if (isNav) {
        e.respondWith(
            (async () => {
                try {
                    const net = await fetch(req);
                    (await caches.open(RUNTIME_CACHE)).put(req, net.clone());
                    return net;
                } catch {
                    // Fallback ke offline page jika ada, kalau tidak ke index.html
                    return (
                        (await caches.match(OFFLINE_URL)) ||
                        (await caches.match("/index.html")) ||
                        new Response("Offline", { status: 503 })
                    );
                }
            })()
        );
        return;
    }

    // Asset same-origin (script/style/font/image): cache-first
    if (same && ["script", "style", "font", "image"].includes(req.destination)) {
        e.respondWith(cacheFirst(RUNTIME_CACHE, req));
        return;
    }

    // Lainnya (termasuk CDN Font Awesome): stale-while-revalidate
    e.respondWith(staleWhileRevalidate(RUNTIME_CACHE, req));
});

/* Helpers */
async function cacheFirst(cacheName, request) {
    const cached = await caches.match(request, { ignoreVary: true });
    if (cached) return cached;
    const net = await fetch(request);
    if (net && net.ok) (await caches.open(cacheName)).put(request, net.clone());
    return net;
}

async function staleWhileRevalidate(cacheName, request) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request, { ignoreVary: true });
    const fetching = fetch(request)
        .then((net) => {
            if (net && net.ok) cache.put(request, net.clone());
            return net;
        })
        .catch(() => null);
    return cached || (await fetching) || new Response("", { status: 504, statusText: "offline" });
}

async function networkFirstWithLimit(cacheName, request, maxEntries) {
    const cache = await caches.open(cacheName);
    try {
        const net = await fetch(request);
        if (net && net.ok) {
            await cache.put(request, net.clone());
            await enforceLimit(cache, maxEntries);
        }
        return net;
    } catch {
        const cached = await cache.match(request, { ignoreVary: true });
        return cached || new Response("", { status: 504, statusText: "offline" });
    }
}

async function enforceLimit(cache, max) {
    const keys = await cache.keys();
    if (keys.length <= max) return;
    const remove = keys.length - max;
    for (let i = 0; i < remove; i++) await cache.delete(keys[i]);
}
