import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            "AIzaSyC6RoPfNmRh5T-udeT8rCeIAaqEhJc5j1A",
  authDomain:        "timi-fx.firebaseapp.com",
  projectId:         "timi-fx",
  storageBucket:     "timi-fx.firebasestorage.app",
  messagingSenderId: "956121751754",
  appId:             "1:956121751754:web:456e1e70f4145e37a69433",
};

const VAPID = "BBW2FR9WKrnNW_8tFeYXCf0ZALOfdAyJ_b8RNrQ1y_yAncJF6-M5sEAmRRiwneawQndchaTrfjx0hMP6D7mtBK8";

export async function requestPushPermission(supabaseClient) {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;
    const supported = await isSupported();
    if (!supported) return null;
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const sw = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, { vapidKey: VAPID, serviceWorkerRegistration: sw });
    if (token && supabaseClient) {
      await supabaseClient.from("bot_config").update({ fcm_token: token }).eq("active", true);
      localStorage.setItem("timi_fcm_token", token);
    }
    onMessage(messaging, (payload) => {
      window.dispatchEvent(new CustomEvent("timi-notification", {
        detail: { title: payload.notification?.title || "TIMI", body: payload.notification?.body || "", type: "trade" }
      }));
    });
    return token;
  } catch (e) {
    console.error("Firebase error:", e);
    return null;
  }
}

export function listenForMessages(onNotification) {
  window.addEventListener("timi-notification", (e) => onNotification?.(e.detail));
}
