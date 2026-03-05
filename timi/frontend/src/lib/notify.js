import { Capacitor } from "@capacitor/core";

let notifId = 100;
let LocalNotifs = null;

async function getPlugin() {
  if (LocalNotifs) return LocalNotifs;
  try {
    const mod = await import("@capacitor/local-notifications");
    LocalNotifs = mod.LocalNotifications;
    return LocalNotifs;
  } catch(e) {
    console.error("LocalNotifications plugin error:", e);
    return null;
  }
}

export async function setupNotificationChannel() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const plugin = await getPlugin();
    if (!plugin) return;
    await plugin.createChannel({
      id: "timi_trades",
      name: "TIMI Trade Alerts",
      importance: 5,
      vibration: true,
      sound: "default",
      lights: true,
    });
    console.log("✅ Notification channel created");
  } catch(e) { console.error("Channel error:", e); }
}

export async function requestNotificationPermission() {
  try {
    if (Capacitor.isNativePlatform()) {
      const plugin = await getPlugin();
      if (!plugin) return false;
      const perm = await plugin.requestPermissions();
      console.log("📱 Notification permission:", JSON.stringify(perm));
      return perm.display === "granted";
    } else {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }
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

  try {
    if (Capacitor.isNativePlatform()) {
      const plugin = await getPlugin();
      if (!plugin) return;
      const id = notifId++;
      await plugin.schedule({
        notifications: [{
          id,
          title,
          body,
          channelId: "timi_trades",
          smallIcon: "ic_launcher",
          sound: "default",
          extra: data,
        }]
      });
      console.log("📱 Native notification sent:", title, "id:", id);
    } else {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo192.png",
          tag: data.type || "timi",
          requireInteraction: false,
        });
      }
    }
  } catch(e) { console.error("Send notification error:", e); }
}

export async function sendTestNotification() {
  await setupNotificationChannel();
  await sendNotification("🤖 TIMI Active!", "Bot is running. Notifications working!", { type: "info" });
}
