import { Preferences } from "@capacitor/preferences";

export async function pSet(key, value) {
  const v = JSON.stringify(value);
  try { await Preferences.set({ key, value: v }); } catch(e) { console.error("pSet error:", e); }
  try { localStorage.setItem(key, v); } catch {}
}

export async function pGet(key, fallback = null) {
  try {
    const { value } = await Preferences.get({ key });
    if (value !== null && value !== undefined) return JSON.parse(value);
  } catch {}
  try {
    const v = localStorage.getItem(key);
    if (v) return JSON.parse(v);
  } catch {}
  return fallback;
}

export function pGetSync(key, fallback = null) {
  try { const v = localStorage.getItem(key); if (v) return JSON.parse(v); } catch {}
  return fallback;
}
