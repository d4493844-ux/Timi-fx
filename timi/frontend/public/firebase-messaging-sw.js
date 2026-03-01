importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC6RoPfNmRh5T-udeT8rCeIAaqEhJc5j1A",
  authDomain: "timi-fx.firebaseapp.com",
  projectId: "timi-fx",
  storageBucket: "timi-fx.firebasestorage.app",
  messagingSenderId: "956121751754",
  appId: "1:956121751754:web:456e1e70f4145e37a69433",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("TIMI background message:", payload);
  const title = payload.notification?.title || "TIMI Trade Alert";
  const body  = payload.notification?.body  || "";
  self.registration.showNotification(title, {
    body,
    icon: "/logo192.png",
    badge: "/logo192.png",
    tag: "timi-trade",
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: "open",    title: "Open TIMI" },
      { action: "dismiss", title: "Dismiss"   },
    ],
    data: payload.data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action !== "dismiss") clients.openWindow("/");
});
