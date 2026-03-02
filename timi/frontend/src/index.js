import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><ErrorBoundary><App /></ErrorBoundary></React.StrictMode>);

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('SW registered:', reg.scope);
        window.__swRegistration = reg;
      })
      .catch(err => console.log('SW failed:', err));
  });
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission);
  });
}

// Global notification helper
window.timiNotify = (title, body, type = 'info') => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      tag: 'timi-' + type
    });
  }
};
