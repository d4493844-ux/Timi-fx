// Wake Lock - prevents screen/CPU sleep
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('WakeLock acquired');
      wakeLock.addEventListener('release', () => {
        console.log('WakeLock released, re-acquiring...');
        setTimeout(requestWakeLock, 1000);
      });
    }
  } catch (err) {
    console.log('WakeLock error:', err);
  }
}

// Re-acquire on visibility change
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    requestWakeLock();
  }
});

requestWakeLock();
