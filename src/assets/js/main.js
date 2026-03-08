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

// Scroll suave para âncoras (caso necessário em páginas futuras)
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