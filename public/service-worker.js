//create variables for different caching possibilities depending on situations
const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

//specify files in public folder that are to be installed to cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/styles.css",
        "/index.js",
        "/images/icons/icon-192x192.png",
        "/images/icons/icon-512x512.png",
      ]);
    })
  );
  console.log("Install");
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
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

  // use cache in all other scenario to optimize performance
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // if the request made is not in cache, make a network request and then cache
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
