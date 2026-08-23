const CACHE_NAME = 'ostendo-v1'
const CORE_ASSETS = ['/dashboard']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Try to cache core assets, but don't fail installation if it fails
        return cache.addAll(CORE_ASSETS).catch((err) => {
          console.warn('Failed to cache core assets during install:', err)
        })
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Don't handle non-GET requests
  if (request.method !== 'GET') return

  // Don't handle requests from different origins
  if (url.origin !== location.origin) return

  // Don't cache API routes, manifest, or service worker itself
  if (
    url.pathname.startsWith('/api/') || 
    url.pathname === '/manifest.json' || 
    url.pathname === '/sw.js'
  ) {
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put('/dashboard', copy)).catch(() => {})
          }
          return response
        })
        .catch(() => {
          // Fallback to cached dashboard if offline
          return caches.match('/dashboard').then((cached) => {
            if (cached) return cached
            // Return a basic offline page response
            return new Response('Offline - please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            })
          })
        })
    )
    return
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request)
        .then((response) => {
          // Cache static assets if successful
          if (
            response.ok &&
            (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons/'))
          ) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
          }
          return response
        })
        .catch(() => {
          // Return empty response for failed static assets
          return new Response('', { status: 404, statusText: 'Not Found' })
        })
    })
  )
})
