/* ================================================================
   Service Worker — IC 2026 · Paróquia São José
   Estratégia: Cache-first com atualização em background (SWR)
   ================================================================ */

const CACHE = 'ic-2026-v4';

const PRECACHE = [
  '/',
  '/index.html',
  '/santos.html',
  '/conteudos.html',
  '/oracoes.html',
  '/manifest.json',
  '/src/assets/css/styles.css',
  '/src/assets/css/app.css',
  '/src/assets/js/main.js',
  '/src/assets/js/pwa.js',
  '/src/assets/img/fundo.jpg',
  '/src/assets/img/sao-bento.jpg',
  '/src/assets/img/santos/santo-tomas-aquino.jpg',
  '/src/assets/img/santos/sao-bento.webp',
  '/src/assets/img/santos/sao-jose.jpg',
  '/src/assets/img/santos/sao-pedro.jpg',
  '/src/assets/img/icons/icon.svg',
  '/src/assets/img/icons/icon-maskable.svg',
  '/src/assets/img/icons/icon-192.png',
  '/src/assets/img/icons/icon-512.png',
  '/src/assets/img/icons/icon-maskable-512.png',
];

/* ── INSTALL: pré-cacheamento ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Pré-cache parcial:', err))
  );
});

/* ── ACTIVATE: limpa caches antigos ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: stale-while-revalidate para tudo ── */
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* Ignorar requests externos (YouTube, Google Fonts etc.) */
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(request);

      /* Atualiza em background (stale-while-revalidate) */
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.ok && response.type !== 'opaque') {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      if (cached) {
        /* Serve do cache imediatamente, atualiza em background */
        networkFetch; /* fire-and-forget */
        return cached;
      }

      /* Sem cache: aguarda a rede */
      const fresh = await networkFetch;
      if (fresh) return fresh;

      /* Fallback offline: serve index.html para navegações */
      if (request.mode === 'navigate') {
        const fallback = await cache.match('/index.html');
        if (fallback) return fallback;
      }

      return new Response('Sem conexão e sem conteúdo salvo.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })
  );
});
