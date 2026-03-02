// Works on both web (localStorage) and Android APK (Capacitor Preferences)
const isCapacitor = window.Capacitor !== undefined;

let Preferences = null;

async function getPreferences() {
  if (!isCapacitor) return null;
  try {
    const { Preferences: P } = await import('@capacitor/preferences');
    return P;
  } catch { return null; }
}

export async function storageSet(key, value) {
  try {
    const val = JSON.stringify(value);
    localStorage.setItem(key, val);
    const P = await getPreferences();
    if (P) await P.set({ key, value: val });
  } catch (e) {
    console.error("Storage set error:", e);
  }
}

export async function storageGet(key) {
  try {
    const P = await getPreferences();
    if (P) {
      const { value } = await P.get({ key });
      if (value) return JSON.parse(value);
    }
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  } catch (e) {
    return null;
  }
}

export async function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    const P = await getPreferences();
    if (P) await P.remove({ key });
  } catch {}
}
