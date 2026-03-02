// Firebase Push Notifications
let messaging = null;

export async function requestPushPermission(supabaseClient) {
  try {
    if (!("Notification" in window)) return null;
    if (!("serviceWorker" in navigator)) return null;

    const { initializeApp, getApps } = await import("firebase/app");
    const { getMessaging, getToken, onMessage, isSupported } = await import("firebase/messaging");

    const supported = await isSupported();
    if (!supported) return null;

    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FB_API_KEY || "",
      authDomain: process.env.REACT_APP_FB_AUTH_DOMAIN || "",
      projectId: process.env.REACT_APP_FB_PROJECT_ID || "",
      storageBucket: process.env.REACT_APP_FB_STORAGE_BUCKET || "",
      messagingSenderId: process.env.REACT_APP_FB_SENDER_ID || "",
      appId: process.env.REACT_APP_FB_APP_ID || "",
    };

    if (!firebaseConfig.apiKey) return null;

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const sw = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FB_VAPID_KEY || "",
      serviceWorkerRegistration: sw,
    });

    if (token && supabaseClient) {
      await supabaseClient.from("bot_config").update({ fcm_token: token }).eq("active", true);
      localStorage.setItem("timi_fcm_token", token);
    }

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "TIMI";
      const body = payload.notification?.body || "";
      window.dispatchEvent(new CustomEvent("timi-notification", {
        detail: { title, body, type: "trade" }
      }));
    });

    return token;
  } catch (e) {
    console.error("Firebase error:", e);
    return null;
  }
}

export function listenForMessages(onNotification) {
  window.addEventListener("timi-notification", (e) => {
    onNotification?.(e.detail);
  });
}
