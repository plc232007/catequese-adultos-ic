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

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharMenu();
  });

  // links de página: deixa o browser navegar normalmente, só limpa o estado
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // se for link de página (não âncora), navega diretamente
      if (href && !href.startsWith('#')) {
        document.body.style.overflow = '';
        window.location.href = href;
        return;
      }
      // âncora: só fecha o menu
      fecharMenu();
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