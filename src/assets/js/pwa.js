/* ================================================================
   pwa.js — Service Worker + Pílula/Modal de instalação + Offline
   ================================================================ */

/* ─── RESET DE CACHE AUTOMÁTICO ───
   Se a versão local do usuário não bate com a esperada, limpa caches
   e service workers, e recarrega para garantir conteúdo fresco. */
const APP_VERSION = '8';
(function () {
  try {
    const last = localStorage.getItem('ic-app-version');
    if (last && last !== APP_VERSION) {
      const limpar = async () => {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(r => r.unregister()));
        }
        localStorage.setItem('ic-app-version', APP_VERSION);
        location.reload();
      };
      limpar();
      return;
    }
    localStorage.setItem('ic-app-version', APP_VERSION);
  } catch (e) { /* ignora */ }
})();

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

function jaInstalado() {
  return isStandalone() || localStorage.getItem('ic-installed') === '1';
}

/* ─── SERVICE WORKER ─── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        /* Verifica atualizações a cada 30 min */
        setInterval(() => reg.update(), 30 * 60 * 1000);
      })
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

/* ─── INSTALL: PÍLULA + MODAL ─── */
let deferredPrompt = null;

function mostrarPilula() {
  if (jaInstalado()) return;
  if (!isMobile()) return;
  if (sessionStorage.getItem('install-skipped')) return;
  const pill = document.getElementById('install-pill');
  pill?.removeAttribute('hidden');
}

function esconderPilula() {
  document.getElementById('install-pill')?.setAttribute('hidden', '');
}

function abrirModal() {
  const modal = document.getElementById('install-modal');
  const iosBox = document.getElementById('install-ios');
  const confirmBt = document.getElementById('install-confirm');
  if (!modal) return;

  /* Decide qual conteúdo mostrar */
  if (deferredPrompt) {
    /* Android Chrome: botão nativo de instalação */
    iosBox?.setAttribute('hidden', '');
    confirmBt?.removeAttribute('hidden');
  } else if (isIOS()) {
    /* iOS Safari: instruções manuais */
    iosBox?.removeAttribute('hidden');
    confirmBt?.setAttribute('hidden', '');
  } else {
    /* Sem suporte detectado — mostra instruções iOS como genérico */
    iosBox?.removeAttribute('hidden');
    confirmBt?.setAttribute('hidden', '');
  }

  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('install-modal')?.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

/* Escuta o evento do Chrome quando a PWA é instalável */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  mostrarPilula();
});

document.addEventListener('DOMContentLoaded', () => {
  const pill      = document.getElementById('install-pill');
  const modal     = document.getElementById('install-modal');
  const confirmBt = document.getElementById('install-confirm');
  const closeBt   = document.getElementById('install-modal-close');
  const skipBt    = document.getElementById('install-skip');

  /* Pílula → abre modal */
  pill?.addEventListener('click', abrirModal);

  /* Fechar modal */
  closeBt?.addEventListener('click', fecharModal);
  modal?.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', fecharModal);
  });

  /* Esc fecha modal */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') fecharModal();
  });

  /* "Não agora" — esconde pílula nesta sessão */
  skipBt?.addEventListener('click', () => {
    sessionStorage.setItem('install-skipped', '1');
    esconderPilula();
    fecharModal();
  });

  /* Botão "Instalar agora" (Android) */
  confirmBt?.addEventListener('click', async () => {
    if (!deferredPrompt) {
      fecharModal();
      return;
    }
    fecharModal();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('ic-installed', '1');
      esconderPilula();
    }
    deferredPrompt = null;
  });

  /* App instalado */
  window.addEventListener('appinstalled', () => {
    localStorage.setItem('ic-installed', '1');
    esconderPilula();
    fecharModal();
    deferredPrompt = null;
  });

  /* Sempre tenta mostrar a pílula no mobile (após pequeno delay para o carregamento terminar) */
  setTimeout(mostrarPilula, 1200);
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
