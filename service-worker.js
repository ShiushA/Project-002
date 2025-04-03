// Service Worker for PWA functionality

const CACHE_NAME = "expense-tracker-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/transactions.html",
  "/reports.html",
  "/css/style.css",
  "/js/app.js",
  "/js/charts.js",
  "/js/dashboard.js",
  "/js/transactions.js",
  "/js/reports.js",
  "/manifest.json",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "/assets/icons/favicon.ico",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Fetch event - serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API requests or dynamic content
          if (!event.request.url.includes("/api/")) {
            cache.put(event.request, responseToCache)
          }
        })

        return response
      })
    }),
  )
})

// Handle offline functionality
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html")
      }),
    )
  }
})

