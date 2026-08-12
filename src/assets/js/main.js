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

// ─── CRONOGRAMA DINÂMICO E DIVULGAÇÃO SEMANAL ───
/* Todos os encontros do semestre já ficam no HTML, mas só aparecem na
   página quando chega a vez de cada um: na quinta-feira divulga-se o
   encontro da quarta seguinte. Como a regra é de data, o site se
   atualiza sozinho — não é preciso editar nada toda semana.
   Também é daqui que sai o cartão de próximo encontro do hero. */
(function () {
  const items = Array.from(document.querySelectorAll('.timeline-item[data-date]'));
  if (!items.length) return;

  const DURACAO = 2 * 60 * 60 * 1000; /* o encontro dura 2h */
  const agora = new Date();

  /* Quinta-feira da semana anterior, à meia-noite: a partir daí o
     encontro da quarta seguinte passa a aparecer no cronograma. */
  function divulgadoEm(data) {
    const d = new Date(data);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const encontros = items.map(item => ({
    item,
    data: new Date(item.dataset.date),
    semestre: item.dataset.semestre || '1',
  }));

  const divulgados = [];
  encontros.forEach(e => {
    const visivel = agora >= divulgadoEm(e.data);
    e.item.classList.toggle('is-oculto', !visivel);
    e.item.classList.toggle('is-past', visivel && agora >= +e.data + DURACAO);
    if (visivel) divulgados.push(e);
  });

  const emCurso = divulgados.find(e => agora >= e.data && agora < +e.data + DURACAO);
  const proximo = emCurso || divulgados.find(e => e.data > agora);
  /* Existe encontro à frente que ainda não foi divulgado? */
  const aDivulgar = !proximo && encontros.some(e => e.data > agora);

  /* Progresso do semestre em curso, contando também os encontros que
     ainda não foram divulgados — o total do semestre é conhecido. */
  const refer = proximo || divulgados[divulgados.length - 1] || encontros[0];
  const doSemestre = encontros.filter(e => e.semestre === refer.semestre);
  const realizados = doSemestre.filter(e => agora >= +e.data + DURACAO).length;

  function porExtenso(data) {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const dia = new Date(data); dia.setHours(0, 0, 0, 0);
    const faltam = Math.round((dia - hoje) / 86400000);
    const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(data);
    if (faltam === 0) return `Hoje, às ${hora}`;
    if (faltam === 1) return `Amanhã, às ${hora}`;
    const quando = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(data);
    return `${quando.charAt(0).toUpperCase()}${quando.slice(1)}, às ${hora}`;
  }

  function temaDe(encontro) {
    const texto = encontro.item.querySelector('h3')?.textContent.trim() || 'Próximo encontro';
    const partes = texto.split('—');
    return (partes.length > 1 ? partes.slice(1).join('—') : texto).trim();
  }

  /* Painel acima da timeline */
  const titulo = document.getElementById('next-meeting-title');
  const detalhe = document.getElementById('next-meeting-detail');

  if (proximo) {
    proximo.item.classList.add('is-next');
    if (titulo) titulo.textContent = proximo.item.querySelector('h3')?.textContent || 'Próximo encontro';
    if (detalhe) {
      detalhe.textContent = emCurso
        ? 'Acontecendo agora · Sala 204'
        : `${porExtenso(proximo.data)} · Sala 204`;
    }
  } else if (aDivulgar) {
    /* Janela entre o fim do encontro e a quinta-feira: o próximo já existe,
       só ainda não chegou a vez de divulgá-lo. */
    if (titulo) titulo.textContent = 'Próximo encontro a divulgar';
    if (detalhe) detalhe.textContent = 'O encontro da semana que vem entra no cronograma na quinta-feira.';
  } else {
    if (titulo) titulo.textContent = 'Semestre concluído';
    if (detalhe) detalhe.textContent = 'Novos encontros aparecem aqui assim que forem confirmados.';
  }

  const texto = document.getElementById('agenda-progress-text');
  const barra = document.getElementById('agenda-progress-bar');
  if (texto) texto.textContent = `${realizados}/${doSemestre.length} encontros realizados`;
  if (barra) barra.style.width = `${Math.round((realizados / doSemestre.length) * 100)}%`;

  /* Cartão do hero */
  const cartao = document.getElementById('hero-proximo');
  const quando = document.getElementById('hero-proximo-quando');
  const tema = document.getElementById('hero-proximo-titulo');

  if (cartao && proximo) {
    if (quando) quando.textContent = emCurso ? 'Acontecendo agora' : porExtenso(proximo.data);
    if (tema) tema.textContent = temaDe(proximo);
    cartao.hidden = false;
  } else if (cartao && aDivulgar) {
    if (quando) quando.textContent = 'Em breve';
    if (tema) tema.textContent = 'O encontro da próxima semana é divulgado na quinta-feira.';
    cartao.hidden = false;
  }
})();

// ─── MOVIMENTO DAS IMAGENS DOS SANTOS ───
(function () {
  const saintImages = Array.from(document.querySelectorAll('.saint-image-col'));
  const canAnimate = saintImages.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canAnimate) return;

  let ticking = false;

  function updateScrollParallax() {
    ticking = false;
    const viewportCenter = window.innerHeight / 2;

    saintImages.forEach(col => {
      const rect = col.getBoundingClientRect();
      const colCenter = rect.top + rect.height / 2;
      const distance = (viewportCenter - colCenter) / viewportCenter;
      const clamped = Math.max(-1, Math.min(1, distance));
      col.style.setProperty('--saint-scroll-y', `${(clamped * 14).toFixed(2)}px`);
    });
  }

  function requestParallaxTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollParallax);
  }

  saintImages.forEach(col => {
    col.addEventListener('pointermove', event => {
      const rect = col.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      col.style.setProperty('--saint-pointer-x', `${(x * 16).toFixed(2)}px`);
      col.style.setProperty('--saint-pointer-y', `${(y * 12).toFixed(2)}px`);
      col.style.setProperty('--saint-tilt-x', `${(-y * 4).toFixed(2)}deg`);
      col.style.setProperty('--saint-tilt-y', `${(x * 5).toFixed(2)}deg`);
      col.style.setProperty('--saint-light-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      col.style.setProperty('--saint-light-y', `${((y + 0.5) * 100).toFixed(1)}%`);
    }, { passive: true });

    col.addEventListener('pointerleave', () => {
      col.style.setProperty('--saint-pointer-x', '0px');
      col.style.setProperty('--saint-pointer-y', '0px');
      col.style.setProperty('--saint-tilt-x', '0deg');
      col.style.setProperty('--saint-tilt-y', '0deg');
      col.style.setProperty('--saint-light-x', '50%');
      col.style.setProperty('--saint-light-y', '35%');
    });
  });

  window.addEventListener('scroll', requestParallaxTick, { passive: true });
  window.addEventListener('resize', requestParallaxTick);
  requestParallaxTick();
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
