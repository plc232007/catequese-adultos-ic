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
    toggle.setAttribute('aria-expanded', 'false');
  }

  function abrirMenu() {
    toggle.classList.add('open');
    links.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
  }

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', links.id || 'nav-links');

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.contains('open') ? fecharMenu() : abrirMenu();
  });

  if (overlay) overlay.addEventListener('click', fecharMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharMenu();
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function() {
      const href = this.getAttribute('href');
      if (href && !href.startsWith('#')) {
        fecharMenu();
      } else {
        fecharMenu();
      }
    });
  });
})();

// ─── SCROLL SUAVE para âncoras ───
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const nav = document.querySelector('nav');
  const top = target.getBoundingClientRect().top + window.pageYOffset - (nav?.offsetHeight ?? 0) - 12;
  window.scrollTo({ top, behavior: 'smooth' });
});

// ─── PROGRESSO DE LEITURA E VOLTAR AO TOPO ───
(function () {
  const bar = document.createElement('span');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  const backTop = document.createElement('button');
  backTop.className = 'back-to-top';
  backTop.type = 'button';
  backTop.setAttribute('aria-label', 'Voltar ao topo');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);

  function updateScrollUi() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
    backTop.classList.toggle('is-visible', window.scrollY > 520);
  }

  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', updateScrollUi, { passive: true });
  window.addEventListener('resize', updateScrollUi);
  updateScrollUi();
})();

// ─── REVELAÇÃO LEVE DOS BLOCOS ───
(function () {
  const selectors = '.sobre-card, .timeline-item, .material-item, .aviso-card, .saint-card, .encontro-card, .prayer-card, .mat-item';
  const elements = document.querySelectorAll(selectors);
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  elements.forEach((el, index) => {
    el.classList.add('js-reveal');
    el.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    observer.observe(el);
  });
})();

// ─── CRONOGRAMA DINÂMICO ───
(function () {
  const items = Array.from(document.querySelectorAll('.timeline-item[data-date]'));
  if (!items.length) return;

  const now = new Date();
  const meetings = items.map(item => ({ item, date: new Date(item.dataset.date) }));
  const past = meetings.filter(meeting => meeting.date < now);
  const next = meetings.find(meeting => meeting.date >= now);
  const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

  meetings.forEach(meeting => {
    if (meeting.date < now) meeting.item.classList.add('is-past');
  });

  if (next) {
    next.item.classList.add('is-next');
    document.getElementById('next-meeting-title').textContent = next.item.querySelector('h3')?.textContent || 'Próximo encontro';
    document.getElementById('next-meeting-detail').textContent = `${formatter.format(next.date)} · Sala 204`;
  } else {
    document.getElementById('next-meeting-title').textContent = 'Etapa divulgada concluída';
    document.getElementById('next-meeting-detail').textContent = 'Novos encontros podem ser adicionados ao cronograma quando forem confirmados.';
  }

  const percent = Math.round((past.length / meetings.length) * 100);
  document.getElementById('agenda-progress-text').textContent = `${past.length}/${meetings.length} encontros realizados`;
  document.getElementById('agenda-progress-bar').style.width = `${percent}%`;
})();

// ─── YOUTUBE SOB DEMANDA: EVITA CARREGAR PLAYER PESADO ANTES DO CLIQUE ───
(function () {
  document.querySelectorAll('.video-wrapper[data-video-id]').forEach(wrapper => {
    const button = wrapper.querySelector('.video-load');
    if (!button) return;

    button.addEventListener('click', () => {
      const videoId = wrapper.dataset.videoId;
      const title = wrapper.dataset.videoTitle || 'Vídeo do YouTube';
      if (!videoId) return;

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
      iframe.title = title;
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;

      wrapper.textContent = '';
      wrapper.appendChild(iframe);
      wrapper.classList.add('is-loaded');
    });
  });
})();

// ─── IMAGENS OPCIONAIS: EVITA ESPAÇOS QUEBRADOS EM GALERIAS FUTURAS ───
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    if (img.classList.contains('foto-thumb')) img.remove();
  }, { once: true });
});
