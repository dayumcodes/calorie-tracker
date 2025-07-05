// Service Worker for Calorie Tracker Push Notifications
const CACHE_NAME = 'calorie-tracker-v1';
const NOTIFICATION_TITLE = 'Calorie Tracker Reminder';

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/manifest.json'
      ]);
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Time to log your meals!',
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'log_meal',
          title: 'Log Meal',
          icon: '/favicon/favicon-32x32.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon/favicon-32x32.png'
        }
      ],
      requireInteraction: true,
      tag: 'calorie-reminder-' + Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(NOTIFICATION_TITLE, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'log_meal') {
    event.waitUntil(
      clients.openWindow('/log-food/manual')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle background sync logic here
  console.log('Background sync triggered');
}

// Fetch event for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 