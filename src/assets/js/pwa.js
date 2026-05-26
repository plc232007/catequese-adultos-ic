/* ================================================================
   pwa.js — Registro do Service Worker + Install Prompt + Offline
   ================================================================ */

/* ─── SERVICE WORKER ─── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => { /* registrado */ })
      .catch(() => { /* falha silenciosa */ });
  });
}

/* ─── BOTTOM NAV: destaca item da página atual ─── */
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html': 'home',
    '': 'home',
    'conteudos.html': 'encontros',
    'santos.html': 'santos',
    'oracoes.html': 'oracoes',
  };
  const active = map[page] || 'home';
  document.querySelectorAll('.bnav-item[data-nav]').forEach(item => {
    if (item.dataset.nav === active) {
      item.classList.add('active');
      item.setAttribute('aria-current', 'page');
    }
  });
})();

/* ─── INSTALL PROMPT ─── */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  /* Só mostra se não foi dispensado nesta sessão */
  if (!sessionStorage.getItem('ip-dismissed')) {
    setTimeout(() => {
      const el = document.getElementById('install-prompt');
      if (el) el.removeAttribute('hidden');
    }, 3000);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const prompt   = document.getElementById('install-prompt');
  const confirm  = document.getElementById('install-confirm');
  const dismiss  = document.getElementById('install-dismiss');

  if (!prompt) return;

  confirm?.addEventListener('click', async () => {
    prompt.setAttribute('hidden', '');
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  dismiss?.addEventListener('click', () => {
    prompt.setAttribute('hidden', '');
    sessionStorage.setItem('ip-dismissed', '1');
  });

  window.addEventListener('appinstalled', () => {
    prompt.setAttribute('hidden', '');
    deferredPrompt = null;
  });
});

/* ─── INDICADOR OFFLINE ─── */
(function () {
  let toast = null;

  function mostrarOffline() {
    if (toast) return;
    toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.textContent = '📡 Sem conexão — conteúdo salvo disponível';
    document.body.appendChild(toast);
  }

  function esconderOffline() {
    if (!toast) return;
    toast.remove();
    toast = null;
  }

  window.addEventListener('offline', mostrarOffline);
  window.addEventListener('online', esconderOffline);

  if (!navigator.onLine) mostrarOffline();
})();
