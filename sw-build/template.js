'{{imports}}';

const MINUTE = 60; // seconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

workbox.core.skipWaiting();
workbox.core.clientsClaim();

workbox.precaching.precacheAndRoute('{{precache}}', {}); // content will be injected here

// navigation route (any navigation request to any part of the scope of the service worker)
workbox.routing.registerNavigationRoute(
  workbox.precaching.getCacheKeyForURL('./index.html'),
  {
    blacklist: [
      /^\/_/,
      /\/[^\/]+\.[^\/]+$/,
      /\/api\//, // avoid responding to /api, because it should be outside of the scope of that service worker
    ],
  },
);

// routing recipes
// see: https://developers.google.com/web/tools/workbox/guides/common-recipes
// images
workbox.routing.registerRoute(
  /(?:^https?:\/\/cdn\.rcsb\.org\/images\/).*?\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.cacheableResponse.Plugin({ statuses: [0, 200] }),
      new workbox.expiration.Plugin({
        maxEntries: 100,
        maxAgeSeconds: 40 * DAY,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// static assets (usually, just fonts then, since images are handled before)
workbox.routing.registerRoute(
  /\/static\//,
  new workbox.strategies.CacheFirst({
    cacheName: 'static',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 30,
        maxAgeSeconds: 10 * WEEK,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// api calls (except for main trajectory file)
workbox.routing.registerRoute(
  /\/api\/rest\/(.(?!\.bin$))+$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api-calls',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 100,
        maxAgeSeconds: 40 * DAY,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);
