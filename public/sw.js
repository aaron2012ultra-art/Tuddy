// Tuddy Mobile Service Worker for Native Device Push Notifications & Offline Caching
const CACHE_NAME = "tuddy-app-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle native push event from server or local trigger
self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Tuddy - Tu compañero de estudio", body: event.data.text() };
    }
  }

  const title = data.title || "Tuddy Notificación";
  const options = {
    body: data.body || "¡Tienes una nueva actualización en Tuddy!",
    icon: data.icon || "/assets/tuddy-icon-192.png",
    badge: data.badge || "/assets/tuddy-badge-96.png",
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: "/" },
    tag: data.tag || "tuddy-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// When user taps/clicks the notification on their mobile phone notification tray
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
