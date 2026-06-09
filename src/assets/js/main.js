// ─── NAV ATIVO ───
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (
      (page === 'index.html' || page === '' || page === '/') && href === 'index.html' ||
      page === href
    ) {
      a.classList.add('active');
    }
  });
})();

// ─── NAV SCROLL STATE ───
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
})();

// ─── MENU HAMBURGUER ───
(function () {
  const toggle  = document.getElementById('nav-toggle');
  const links   = document.getElementById('nav-links');
  const overlay = document.getElementById('nav-overlay');
  if (!toggle || !links) return;

  function fecharMenu() {
    toggle.classList.remove('open');
    links.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function abrirMenu() {
    toggle.classList.add('open');
    links.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.contains('open') ? fecharMenu() : abrirMenu();
  });
  if (overlay) overlay.addEventListener('click', fecharMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharMenu(); });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href && !href.startsWith('#')) {
        document.body.style.overflow = '';
        window.location.href = href;
        return;
      }
      fecharMenu();
    });
  });
})();

// ─── SCROLL SUAVE ───
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const nav = document.querySelector('nav');
  const top = target.getBoundingClientRect().top + window.pageYOffset - (nav?.offsetHeight ?? 0) - 16;
  window.scrollTo({ top, behavior: 'smooth' });
});

// ─── YOUTUBE SOB DEMANDA (facade → player só no clique) ───
(function () {
  const lites = document.querySelectorAll('.yt-lite');
  if (!lites.length) return;
  lites.forEach(el => {
    el.addEventListener('click', function () {
      if (el.dataset.loaded) return;
      el.dataset.loaded = '1';
      const id = el.dataset.id;
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = el.dataset.title || 'Vídeo do YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      el.appendChild(iframe);
    }, { once: true });
  });
})();

// ─── REVEAL ON SCROLL ───
// Só esconde elementos DEPOIS de marcar tudo — nunca deixa nada invisível sem observer ativo
(function () {
  if (!window.IntersectionObserver) return;

  // 1. Aplica stagger indexes
  document.querySelectorAll('.stagger').forEach(parent => {
    [...parent.children].forEach((child, i) => child.style.setProperty('--i', i));
  });

  // 2. Marca elementos para animar
  document.querySelectorAll('.section-divider').forEach(d => d.classList.add('reveal'));

  [
    ['.sobre-cards',   '.sobre-card'],
    ['.material-grid', '.material-item'],
    ['.avisos-grid',   '.aviso-card'],
    ['.upcoming-grid', '.upcoming-card'],
    ['.timeline',      '.timeline-item'],
  ].forEach(([parent, child]) => {
    const p = document.querySelector(parent);
    if (!p) return;
    p.classList.add('stagger');
    p.querySelectorAll(child).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--i', i);
    });
  });

  document.querySelectorAll('.prayer-card, .encontro-card, .saint-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = i * 70 + 'ms';
  });

  const bl = document.querySelector('.bento-image-col');
  const br = document.querySelector('.bento-text-col');
  if (bl) bl.classList.add('reveal-left');
  if (br) br.classList.add('reveal-right');

  document.querySelectorAll('.quote, .bento-quote').forEach(el => el.classList.add('reveal'));

  // 3. SÓ AGORA ativa o CSS que esconde os elementos
  document.documentElement.classList.add('js-ready');

  // 4. Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  // Elementos já visíveis na viewport → revelar imediatamente
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });
})();