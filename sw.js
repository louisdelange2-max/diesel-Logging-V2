const CACHE_NAME = 'diesel-V2.1';
const APP_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon_192.png',
  './icon_512.png',
  './sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    try {
      const response = await fetch(event.request);
      if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
        const responseClone = response.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, responseClone);
      }
      return response;
    } catch (error) {
      return cached || caches.match('./index.html');
    }
  })());
});
