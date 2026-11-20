// Change this number whenever you upload new files, so the app refreshes.
const VERSION = "v1";
const CACHE = "for-my-babi-" + VERSION;

const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./content.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // add each file on its own so one missing file doesn't break the install
      Promise.all(CORE.map((url) => cache.add(url).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Songs are big, so always load them from the network (never cache)
  if (url.pathname.includes("/music/") || /\.(mp3|m4a|ogg|wav)$/i.test(url.pathname)) return;

  // Pages and code: network first, so new updates show up; cache is the offline backup
  const isCode = req.mode === "navigate" || /\.(html|css|js|json)$/i.test(url.pathname);

  if (isCode && url.origin === location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Photos, fonts and everything else: cache first, then network
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === "opaque")) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached)
    )
  );
});