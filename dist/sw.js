const CACHE_NAME = 'superapp-cache';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/superapp/',
        '/superapp/index.html',
      ]);
    })
  );
});
