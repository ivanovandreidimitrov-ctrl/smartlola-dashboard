// SmartLola SW — Final deregister + clear all caches
// This version deregisters itself and clears ALL caches on both install and activate
// to ensure no stale cached status.json or app.js remains on mobile browsers

self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))),
      self.registration.unregister(),
    ]).then(() => {
      console.log('SW deregistered + all caches cleared — clean state');
      return self.clients.claim();
    })
  );
});

// Pass-through: never intercept fetch
self.addEventListener('fetch', e => {
  return;
});