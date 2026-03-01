const CACHE_NAME = 'dantewada-edu-v1';
const SHELL_ASSETS = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './manifest.json',
    './scholarship.html',
    './notices.html',
    './teachers.html',
    './gallery.html',
    './feedback.html',
    './map.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install: cache shell assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)).catch(console.error)
    );
    self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        ))
    );
    self.clients.claim();
});

// Fetch: cache-first for assets, network-first for API
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API calls → network first, fallback to cache
    if (url.pathname.startsWith('/api') || url.hostname.includes('onrender.com')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Static assets → cache first
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }))
    );
});
