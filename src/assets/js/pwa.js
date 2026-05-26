/* ================================================================
   pwa.js — Service Worker + Install Prompt (Android + iOS) + Offline
   ================================================================ */

/* ─── DETECÇÃO DE PLATAFORMA ─── */
function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

function isMobile() {
  return window.innerWidth <= 640 || /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/* ─── SERVICE WORKER ─── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(() => {})
      .catch(() => {});
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

/* ─── INSTALL PROMPT — Android + iOS ─── */
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  exibirInstallPrompt();
});

function naoExibirSeJaInstalado() {
  if (isStandalone()) return true;
  if (localStorage.getItem('ic-installed') === '1') return true;
  return false;
}

function exibirInstallPrompt() {
  if (naoExibirSeJaInstalado()) return;
  if (!isMobile()) return;

  /* Se já foi dispensado nesta sessão, mostra apenas o FAB */
  if (sessionStorage.getItem('ip-dismissed')) {
    exibirFab();
    return;
  }

  setTimeout(() => {
    const prompt    = document.getElementById('install-prompt');
    const iosBox    = document.getElementById('install-ios');
    const confirmBt = document.getElementById('install-confirm');
    if (!prompt) return;

    if (isIOS() && !deferredPrompt) {
      /* iOS Safari: mostra instruções manuais */
      iosBox?.removeAttribute('hidden');
      confirmBt?.setAttribute('hidden', '');
    } else if (deferredPrompt) {
      /* Android / Chrome: mostra botão de instalar nativo */
      iosBox?.setAttribute('hidden', '');
      confirmBt?.removeAttribute('hidden');
    } else {
      /* Sem suporte detectável — esconde tudo */
      return;
    }

    prompt.removeAttribute('hidden');
  }, 2200);
}

function exibirFab() {
  const fab = document.getElementById('install-fab');
  if (!fab) return;
  if (naoExibirSeJaInstalado()) return;
  if (!isMobile()) return;
  /* Só mostra FAB se há algo a instalar (iOS sempre tem, Android só com deferredPrompt) */
  if (!isIOS() && !deferredPrompt) return;
  fab.removeAttribute('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const prompt    = document.getElementById('install-prompt');
  const confirmBt = document.getElementById('install-confirm');
  const dismissBt = document.getElementById('install-dismiss');
  const fab       = document.getElementById('install-fab');

  /* Botão "Instalar agora" — Android/Chrome */
  confirmBt?.addEventListener('click', async () => {
    if (!deferredPrompt) {
      prompt?.setAttribute('hidden', '');
      return;
    }
    prompt?.setAttribute('hidden', '');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('ic-installed', '1');
      fab?.setAttribute('hidden', '');
    } else {
      sessionStorage.setItem('ip-dismissed', '1');
      exibirFab();
    }
    deferredPrompt = null;
  });

  /* Botão de fechar (×) */
  dismissBt?.addEventListener('click', () => {
    prompt?.setAttribute('hidden', '');
    sessionStorage.setItem('ip-dismissed', '1');
    exibirFab();
  });

  /* FAB — reabre o prompt */
  fab?.addEventListener('click', () => {
    fab.setAttribute('hidden', '');
    sessionStorage.removeItem('ip-dismissed');
    exibirInstallPrompt();
  });

  /* App foi instalado */
  window.addEventListener('appinstalled', () => {
    localStorage.setItem('ic-installed', '1');
    prompt?.setAttribute('hidden', '');
    fab?.setAttribute('hidden', '');
    deferredPrompt = null;
  });

  /* iOS Safari não dispara beforeinstallprompt — então força exibição aqui */
  if (isIOS() && !isStandalone()) {
    exibirInstallPrompt();
  }
});

/* ─── INDICADOR OFFLINE ─── */
(function () {
  let toast = null;

  function mostrar() {
    if (toast) return;
    toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.textContent = '📡 Sem conexão — conteúdo salvo disponível';
    document.body.appendChild(toast);
  }

  function esconder() {
    if (!toast) return;
    toast.remove();
    toast = null;
  }

  window.addEventListener('offline', mostrar);
  window.addEventListener('online',  esconder);
  if (!navigator.onLine) mostrar();
})();
