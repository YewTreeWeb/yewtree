importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

  // Cache origins googleapis.com.
  workbox.routing.registerRoute(
    /.*(?:googleapis)\.com/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'googleapis',
    })
  );

  // Cache the Google Fonts stylesheets with a stale while revalidate strategy.
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.googleapis\.com/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'google-fonts-stylesheets',
    })
  );

  // Cache the Google Fonts webfont files with a cache first strategy for 1 year.
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    workbox.strategies.cacheFirst({
      cacheName: 'google-fonts-webfonts',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  // Cache the Cloudinary files with a cache first strategy for 1 week.
  workbox.routing.registerRoute(
    // Cache the CDN
    /^https:\/\/res\.cloudinary\.com/,
    // Use the cache if it's available
    workbox.strategies.cacheFirst({
      // Use a custom cache name
      cacheName: 'cloudinary-cache',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.Plugin({
          // Cache for a maximum of a week
          maxAgeSeconds: 7 * 24 * 60 * 60,
        }),
      ],
    })
  );

  // Cache instant pages
  workbox.routing.registerRoute(
    '//instant.page/1.1.0',
    workbox.strategies.cacheFirst({
      cacheName: 'instant-pages',
      plugins: [
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.Plugin({
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  // Worker has updated and waiting to install message.
  self.addEventListener('message', (event) => {
    if (!event.data) {
      return;
    }

    switch (event.data) {
      case 'skipWaiting':
        self.skipWaiting();
        break;
      default:
        // NOOP
        break;
    }
  });

  // Enable Google Analytics for offline mode.
  workbox.googleAnalytics.initialize();

} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

// The most verbose - displays all logs.
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.debug);

// Shows logs, warnings and errors.
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.log);

// Show warnings and errors.
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.warn);

// Show *just* errors
workbox.core.setLogLevel(workbox.core.LOG_LEVELS.error);
