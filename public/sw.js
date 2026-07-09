const CACHE_NAME = 'kedaiaa-pos-v13';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

// Install event - Cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Cache-first or Network-first fallback
self.addEventListener('fetch', (event) => {
  // Hanya proses request GET dari origin yang sama dan abaikan modul dev Vite
  if (
    event.request.method !== 'GET' || 
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes('/@id/') ||
    event.request.url.includes('/@vite/') ||
    event.request.url.includes('/node_modules/') ||
    event.request.url.includes('hot-update')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Hanya cache respon sukses (status 200 atau 304) bertipe basic/cors
        if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 304)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(err => {
              console.warn('Gagal menyimpan cache:', err);
            });
          }).catch(err => {
            console.warn('Gagal membuka cache:', err);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.error('Fetch error:', err);
        // Fallback offline support if network fails
        return caches.match('/');
      });
    })
  );
});
