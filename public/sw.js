const CACHE = 'barco-v1'
const OFFLINE = '/offline'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([OFFLINE, '/manifest.json'])).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  // Only intercept same-origin navigation requests
  if (e.request.mode === 'navigate' && e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE))
    )
  }
})
