const CACHE_NAME = 'mdev-v3';
const STATIC_ASSETS = [
    '/',
    '/logo.png',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET and API requests
    if (request.method !== 'GET') return;
    if (request.url.includes('/api/') || request.url.includes('onrender.com')) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful responses for static assets
                if (response.ok && (request.url.match(/\.(js|css|png|jpg|svg|woff2?)$/) || request.url.endsWith('/'))) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(request).then((cached) => {
                    if (cached) return cached;
                    // For navigation requests, return cached index
                    if (request.mode === 'navigate') {
                        return caches.match('/');
                    }
                });
            })
    );
});
