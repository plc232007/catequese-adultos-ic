// Marca o item ativo no nav conforme a página atual
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

  if (!toggle || !links || !overlay) return;

  function abrirMenu() {
    toggle.classList.add('open');
    links.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function fecharMenu() {
    toggle.classList.remove('open');
    links.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    toggle.classList.contains('open') ? fecharMenu() : abrirMenu();
  });

  // fecha ao clicar no overlay
  overlay.addEventListener('click', fecharMenu);

  // fecha ao clicar em um link
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', fecharMenu);
  });

  // fecha com Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharMenu();
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