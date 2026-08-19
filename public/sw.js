/**
 * Secret Agent / GIA — Push Notification Service Worker
 *
 * Handles incoming web push events from the mission-watcher edge function
 * and displays them as OS-level notifications.
 *
 * Registered in src/lib/pushNotifications.ts via:
 *   navigator.serviceWorker.register('/sw.js')
 */

const CACHE_NAME = 'secret-agent-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push event ───────────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Secret Agent Alert', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || '🔔 Secret Agent Alert';
  const tag =
    data.tag && data.tag !== 'secret-agent-alert'
      ? data.tag
      : `secret-agent-${Date.now()}`;

  const options = {
    body: data.body || 'Your agent has new intelligence.',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag,
    renotify: true,
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'view', title: 'View Mission' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, options);
      await updateAppBadge();
    })()
  );
});

// ─── Notification click ───────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const open = event.action !== 'dismiss';
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      await updateAppBadge();
      if (!open) return;

      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'MISSION_ALERT', url });
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(url);
      }
    })()
  );
});

async function updateAppBadge() {
  if (!self.registration.setAppBadge) return;
  const list = await self.registration.getNotifications();
  if (list.length > 0) {
    await self.registration.setAppBadge(list.length);
  } else if (self.registration.clearAppBadge) {
    await self.registration.clearAppBadge();
  }
}

// ─── Push subscription change ─────────────────────────────────────────────────
// Fires when the browser invalidates a push subscription (e.g. after browser restart)

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    // Re-registration is handled in src/lib/pushNotifications.ts
    // This event just signals the app to re-subscribe
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      clients.forEach((client) =>
        client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' })
      );
    })
  );
});
