const CACHE = "timi-v1";
const ASSETS = ["/", "/static/js/bundle.js", "/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request)).catch(() => caches.match("/"))
  );
});

self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "TIMI Alert", {
      body: data.body || "New trading signal detected",
      icon: "/logo192.png",
      badge: "/logo192.png",
      vibrate: [200, 100, 200],
      data: data,
      actions: [
        { action: "view", title: "View Trade" },
        { action: "dismiss", title: "Dismiss" }
      ]
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  if (e.action === "view") {
    e.waitUntil(clients.openWindow("/"));
  }
});
