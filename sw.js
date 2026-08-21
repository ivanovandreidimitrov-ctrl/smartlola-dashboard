// SmartLola SW — Auto-deregister for clean refresh
const CACHE_NAME = 'smartlola-v13';

self.addEventListener('install', e => {
  // Clear all caches on install
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', e => {
  // Unregister this SW so browser fetches everything fresh
  e.waitUntil(
    self.registration.unregister().then(() => {
      console.log('SW unregistered — clean state');
      return self.clients.claim();
    })
  );
});

// Pass-through: don't intercept any fetch requests
self.addEventListener('fetch', e => {
  return;
});