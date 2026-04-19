// ── iVolt Power Solutions — Service Worker v5 ────────────────────────────────
// Upload this file to the SAME folder as index.html in your GitHub Pages repo.
// It must be at the same path level, e.g.:
//   your-repo/index.html
//   your-repo/sw.js        ← this file
// ─────────────────────────────────────────────────────────────────────────────

var CACHE = 'ivolt-v5';

// Build the manifest dynamically using the SW's own scope as start_url
function buildManifest(scope) {
  return JSON.stringify({
    name: 'iVolt Power Solutions',
    short_name: 'iVolt',
    description: 'Nigeria power equipment portal — shop, market data, electricity bills, installer marketplace',
    start_url: scope,
    scope: scope,
    display: 'standalone',
    background_color: '#0a0d14',
    theme_color: '#2563eb',
    orientation: 'any',
    icons: [
      {
        src: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20192%20192%27%3E%3Crect%20width%3D%27192%27%20height%3D%27192%27%20fill%3D%27%230a0d14%27%20rx%3D%2724%27%2F%3E%3Cpolygon%20points%3D%27120%2C10%2050%2C100%2090%2C100%2055%2C190%20170%2C80%20125%2C80%20160%2C10%27%20fill%3D%27%232563eb%27%2F%3E%3C%2Fsvg%3E',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%20512%20512%27%3E%3Crect%20width%3D%27512%27%20height%3D%27512%27%20fill%3D%27%230a0d14%27%20rx%3D%2760%27%2F%3E%3Cpolygon%20points%3D%27320%2C20%20120%2C270%20240%2C270%20140%2C510%20460%2C200%20330%2C200%20430%2C20%27%20fill%3D%27%232563eb%27%2F%3E%3C%2Fsvg%3E',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }
    ],
    categories: ['shopping', 'utilities', 'business'],
    shortcuts: [
      { name: 'Shop',        url: scope + '#shop',        description: 'Browse power equipment' },
      { name: 'Electricity', url: scope + '#electricity', description: 'Pay electricity bill'   },
      { name: 'Plans',       url: scope + '#pricing',     description: 'Subscribe to premium'   }
    ]
  });
}

// ── Install: cache the page ───────────────────────────────────────────────────
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll([self.registration.scope]); })
      .then(function() { return self.skipWaiting(); })
  );
});

// ── Activate: clear old caches ────────────────────────────────────────────────
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys.filter(function(k) { return k !== CACHE; })
              .map(function(k)   { return caches.delete(k); })
        );
      })
      .then(function() { return self.clients.claim(); })
  );
});

// ── Fetch: serve manifest inline, cache-fallback for everything else ──────────
self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);

  // Serve the web manifest from memory (no file needed on server)
  if (url.pathname.endsWith('/manifest.webmanifest')) {
    e.respondWith(
      new Response(buildManifest(self.registration.scope), {
        headers: {
          'Content-Type':  'application/manifest+json',
          'Cache-Control': 'no-cache'
        }
      })
    );
    return;
  }

  // All other GET requests: network-first, cache fallback (offline support)
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .catch(function() { return caches.match(e.request); })
  );
});
