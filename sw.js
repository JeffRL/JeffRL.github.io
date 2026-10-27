// Service worker: gives back the saved copy of a file right away,
// then grabs a fresh copy in the background for next time.

const CACHE_NAME = "site-cache";

self.addEventListener("install", function () {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (event) {
  // only handle normal requests for files on this site
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request, { ignoreSearch: true }).then(function (saved) {
        const fresh = fetch(event.request).then(function (response) {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        });

        // keep the background update running even if we answered from the cache
        event.waitUntil(fresh.catch(function () {}));

        if (saved) {
          return saved;
        }
        return fresh;
      });
    })
  );
});
