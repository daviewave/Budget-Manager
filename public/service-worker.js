//specify files in public folder that are to be cached
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/style.css",
  "/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

//create variables for different caching possibilities depending on situations
const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

//in the event a static cache is needed
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("fetch", (event) => {
  // make sure requests to other origins as well as get requests are not cached
  if (event.request.url.includes("/api/")) {
    // handles if the user is offline
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }

  // in all other scenarios use this for best performance
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request).then((response) => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});
