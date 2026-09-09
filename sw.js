/* ================================================================
   Service Worker — IC 2026 · Paróquia São José
   HTML: rede primeiro. Recursos: cache com atualização em background.
   ================================================================ */

const CACHE = 'ic-2026-v14';

const PRECACHE = [
  '/',
  '/index.html',
  '/santos.html',
  '/conteudos.html',
  '/oracoes.html',
  '/manifest.json',
  '/src/assets/css/styles.css?v=13',
  '/src/assets/css/app.css?v=13',
  '/src/assets/css/aquino.css?v=13',
  '/src/assets/js/main.js?v=13',
  '/src/assets/js/pwa.js?v=13',
  '/src/assets/js/aquino.js?v=13',
  '/src/assets/pdf/cronograma-catequese-2026-2.pdf',
  '/src/assets/img/fundo.jpg',
  '/src/assets/img/sao-bento.jpg',
  '/src/assets/img/santos/santo-tomas-aquino.jpg',
  '/src/assets/img/santos/sao-bento.webp',
  '/src/assets/img/santos/sao-jose.jpg',
  '/src/assets/img/santos/sao-pedro.jpg',
  '/src/assets/img/icons/icon.svg?v=7',
  '/src/assets/img/icons/icon-maskable.svg?v=7',
  '/src/assets/img/icons/icon-192.png?v=7',
  '/src/assets/img/icons/icon-512.png?v=7',
  '/src/assets/img/icons/icon-maskable-512.png?v=7',
];

/* ── INSTALL: pré-cacheamento ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' }))))
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

/* ── FETCH: páginas atuais online e conteúdo salvo offline ── */
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* Ignorar requests externos (YouTube, Google Fonts etc.) */
  if (url.origin !== self.location.origin) return;

  /* A conversa com o Aquino nunca passa pelo cache — hoje ela é POST e já
     cairia fora daqui, mas a guarda vale para qualquer rota /api/ futura */
  if (url.pathname.startsWith('/api/')) return;

  // O HTML aponta para CSS/JS versionados; busque a página atual quando online.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(new Request(request, { cache: 'no-cache' }));
        if (response.ok) {
          await cache.put(request, response.clone());
          return response;
        }
        const saved = await cache.match(request);
        return saved || response;
      } catch {
        return await cache.match(request)
          || await cache.match('/index.html')
          || new Response('Sem conexão e sem conteúdo salvo.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
      }
    })());
    return;
  }

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

      return new Response('Sem conexão e sem conteúdo salvo.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })
  );
});
