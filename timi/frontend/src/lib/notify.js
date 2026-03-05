import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

let notifId = 1;
let channelCreated = false;

export async function setupNotificationChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: "timi_trades",
      name: "TIMI Trade Alerts",
      importance: 5,
      vibration: true,
      sound: "default",
      lights: true,
      lightColor: "#00ff9d",
      visibility: 1,
    });
    channelCreated = true;
    console.log("✅ Channel created");
  } catch(e) { console.error("Channel error:", e); }
}

export async function requestNotificationPermission() {
  if (!Capacitor.isNativePlatform()) {
    const p = await Notification.requestPermission();
    return p === "granted";
  }
  try {
    // Check current permission first
    const { display } = await LocalNotifications.checkPermissions();
    console.log("Current permission:", display);
    if (display === "granted") return true;
    const result = await LocalNotifications.requestPermissions();
    console.log("Permission result:", JSON.stringify(result));
    return result.display === "granted";
  } catch(e) {
    console.error("Permission error:", e);
    return false;
  }
}

export async function sendNotification(title, body, data = {}) {
  // Always fire in-app toast
  window.dispatchEvent(new CustomEvent("timi-notification", {
    detail: { title, body, type: data.type || "info" }
  }));

  if (!Capacitor.isNativePlatform()) {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/logo192.png" });
    }
    return;
  }

  try {
    if (!channelCreated) await setupNotificationChannel();
    const id = notifId++;
    console.log("📱 Scheduling notification id:", id, title);
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title,
        body,
        channelId: "timi_trades",
        smallIcon: "ic_launcher",
        iconColor: "#00ff9d",
        sound: "default",
        ongoing: false,
        autoCancel: true,
        extra: data,
      }]
    });
    console.log("✅ Notification scheduled:", id);
  } catch(e) {
    console.error("❌ Notification failed:", e.message, e);
  }
}

export async function sendTestNotification() {
  console.log("🧪 sendTestNotification called, isNative:", Capacitor.isNativePlatform());
  await setupNotificationChannel();
  const perm = await requestNotificationPermission();
  console.log("🧪 Permission granted:", perm);
  await sendNotification("🤖 TIMI Active!", "Notifications are working!", { type: "info" });
}
