import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

let notifId = 1;

// Request permissions on startup
export async function requestNotificationPermission() {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native Android - use local notifications
      const { display } = await LocalNotifications.requestPermissions();
      console.log("📱 Local notification permission:", display);
      return display === "granted";
    } else {
      // Web - use browser notifications
      const perm = await Notification.requestPermission();
      console.log("🌐 Web notification permission:", perm);
      return perm === "granted";
    }
  } catch(e) {
    console.error("Notification permission error:", e);
    return false;
  }
}

// Send notification - works on both APK and web
export async function sendNotification(title, body, data = {}) {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native Android local notification
      await LocalNotifications.schedule({
        notifications: [{
          id: notifId++,
          title,
          body,
          sound: "default",
          smallIcon: "ic_launcher",
          iconColor: "#00ff9d",
          extra: data,
          channelId: "timi_trades",
        }]
      });
      console.log("📱 Local notification sent:", title);
    } else {
      // Web notification
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo192.png",
          badge: "/logo192.png",
          vibrate: [200, 100, 200],
          tag: "timi-trade",
          requireInteraction: false,
          silent: false,
        });
      }
    }
  } catch(e) {
    console.error("Notification error:", e);
  }
}

// Create notification channel for Android
export async function setupNotificationChannel() {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.createChannel({
        id: "timi_trades",
        name: "TIMI Trade Alerts",
        description: "Notifications for trade results and bot status",
        importance: 5, // HIGH
        visibility: 1,
        sound: "default",
        vibration: true,
        lights: true,
        lightColor: "#00ff9d",
      });
      console.log("✅ Notification channel created");
    }
  } catch(e) {
    console.error("Channel error:", e);
  }
}
