const CACHE_NAME = "habit-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/supabase.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install event: cache files
self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: Caching files");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: clean old caches
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Service Worker: Removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event: serve cached files if offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request)
          .catch(() => {
            // Optional: fallback page
            if (event.request.mode === "navigate") {
              return caches.match("/index.html");
            }
          });
      })
  );
});
