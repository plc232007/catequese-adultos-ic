// Ajusta o scroll para âncoras (#sobre, #cronograma...) considerando o nav fixo
document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;

  const id = link.getAttribute("href");
  const target = document.querySelector(id);
  if (!target) return;

  e.preventDefault();

  const nav = document.querySelector("nav");
  const navHeight = nav ? nav.offsetHeight : 0;
  const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;

  window.scrollTo({ top, behavior: "smooth" });
});