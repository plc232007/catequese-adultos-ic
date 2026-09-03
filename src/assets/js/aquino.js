/* ═══════════════════════════════════════════════════════════════
   AQUINO — assistente de dúvidas da turma
   ═══════════════════════════════════════════════════════════════
   Este arquivo cria sozinho o bonequinho e a janela de conversa e os
   pendura no <body>. Por isso os quatro HTML só precisam do <link>
   do aquino.css e do <script> daqui — não há markup para replicar.

   A conversa vai para /api/aquino (api/aquino.mjs), que é quem fala
   com o Gemini. A chave da API nunca chega até este arquivo.

   O histórico vive no sessionStorage: some quando a aba fecha.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const ROTA = '/api/aquino';
  const CHAVE_HISTORICO = 'aquino-conversa';
  const CHAVE_BOLHA = 'aquino-bolha-vista';
  const MAX_CARACTERES = 1000;
  const MAX_MENSAGENS = 12;

  const SUGESTOES = [
    'O que vimos no último encontro?',
    'O que é a graça?',
    'Explica o 3º Mandamento',
  ];

  const SAUDACAO =
    'A paz de Cristo! Sou o **Aquino**, e estou aqui para ajudar com as suas ' +
    'dúvidas sobre a fé e sobre o que estudamos na turma. O que você quer saber?';

  /* O bonequinho: Santo Tomás de Aquino em hábito dominicano, com o sol
     no peito — o atributo pelo qual ele é reconhecido — e o livro. */
  function figura() {
    return `
      <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
        <defs>
          <clipPath id="aq-corte"><circle cx="32" cy="32" r="32"/></clipPath>
        </defs>
        <g clip-path="url(#aq-corte)">
          <circle cx="32" cy="32" r="32" fill="#F3EFE7"/>
          <circle cx="32" cy="30" r="26" fill="#EDE6D9"/>

          <!-- capa preta dominicana -->
          <path d="M32 32.4c-9.4 0-17 5.9-17 13.8V64h34V46.2c0-7.9-7.6-13.8-17-13.8Z" fill="#1C1610"/>
          <!-- escapulário creme -->
          <path d="M32 32.4c-2.5 0-4.9.4-7 1.1L32 64l7-30.5a25 25 0 0 0-7-1.1Z" fill="#F7F4ED"/>
          <!-- gola -->
          <path d="M25 33.5a11.4 11.4 0 0 0 14 0l-2.2-1.6a13.6 13.6 0 0 1-9.6 0Z" fill="#12100C"/>

          <!-- sol de São Tomás -->
          <g stroke="#C6A55A" stroke-width="1.4" stroke-linecap="round">
            <path d="M32 40.6v-2.3M32 51.6v-2.3M27.4 45.8h-2.3M38.9 45.8h-2.3
                     M28.7 42.5l-1.6-1.6M36.9 50.7l-1.6-1.6M35.3 42.5l1.6-1.6M27.1 50.7l1.6-1.6"/>
          </g>
          <circle cx="32" cy="45.8" r="3.3" fill="#C6A55A"/>

          <!-- cabeça -->
          <circle cx="32" cy="21.4" r="11.2" fill="#EDD3B6"/>
          <!-- tonsura: aro de cabelo contornando a cabeça, alto raspado -->
          <path d="M21.5 25.2A11.2 11.2 0 1 1 42.5 25.2L39.9 24.3A8.4 8.4 0 1 0 24.1 24.3Z"
                fill="#54432F"/>
          <!-- olhos e sorriso -->
          <circle cx="27.9" cy="21.6" r="1.4" fill="#1C1610"/>
          <circle cx="36.1" cy="21.6" r="1.4" fill="#1C1610"/>
          <path d="M29 26.1a4.2 4.2 0 0 0 6 0" stroke="#1C1610" stroke-width="1.5"
                stroke-linecap="round" fill="none"/>

          <!-- livro -->
          <g transform="rotate(-9 14 48)">
            <rect x="7.6" y="43.4" width="12.8" height="9.6" rx="1.5" fill="#FAF8F3"
                  stroke="#C6A55A" stroke-width="1.4"/>
            <path d="M14 43.7v9" stroke="#C6A55A" stroke-width="1.2"/>
          </g>
        </g>
      </svg>`;
  }

  function icone(caminho) {
    return `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${caminho}</svg>`;
  }
  const IC_FECHAR = '<path d="M6 6l12 12M18 6L6 18"/>';
  const IC_LIMPAR = '<path d="M4 7h16M9.5 7V5.4A1.4 1.4 0 0 1 10.9 4h2.2a1.4 1.4 0 0 1 1.4 1.4V7M6.4 7l.9 11.4A1.7 1.7 0 0 0 9 20h6a1.7 1.7 0 0 0 1.7-1.6L17.6 7"/>';
  const IC_ENVIAR = '<path d="M4.4 11.9 19.6 4.8 14 20l-3-6.3-6.6-1.8Z"/>';

  /* ─── Estado ─── */
  let historico = [];
  let ocupado = false;
  let elos = {};

  function carregarHistorico() {
    try {
      const bruto = sessionStorage.getItem(CHAVE_HISTORICO);
      const lido = bruto ? JSON.parse(bruto) : [];
      if (Array.isArray(lido)) historico = lido.slice(-MAX_MENSAGENS);
    } catch { historico = []; }
  }

  function salvarHistorico() {
    try {
      sessionStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico.slice(-MAX_MENSAGENS)));
    } catch { /* aba anônima ou armazenamento cheio: segue sem salvar */ }
  }

  /* ─── Texto → HTML seguro ───
     A resposta do modelo é texto de fora: escapamos tudo primeiro e só
     depois soltamos o negrito e as quebras de parágrafo. Nunca innerHTML cru. */
  function paraHtml(texto) {
    const escapado = texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const comMarcas = escapado
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');

    return comMarcas
      .split(/\n{2,}/)
      .map(bloco => `<p>${bloco.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  /* ─── Desenho das mensagens ─── */
  function bolha(papel, texto) {
    const div = document.createElement('div');
    div.className = 'aquino-msg aquino-msg--' + papel;
    div.innerHTML = paraHtml(texto);
    elos.mensagens.appendChild(div);
    rolarAteOFim();
    return div;
  }

  function bolhaErro(texto) {
    const div = document.createElement('div');
    div.className = 'aquino-msg aquino-msg--erro';
    div.textContent = texto;
    elos.mensagens.appendChild(div);
    rolarAteOFim();
  }

  function rolarAteOFim() {
    elos.mensagens.scrollTop = elos.mensagens.scrollHeight;
  }

  function redesenhar() {
    elos.mensagens.innerHTML = '';
    if (historico.length === 0) {
      bolha('aquino', SAUDACAO);
      elos.sugestoes.hidden = false;
    } else {
      historico.forEach(m => bolha(m.role === 'user' ? 'aluno' : 'aquino', m.content));
      elos.sugestoes.hidden = true;
    }
  }

  /* ─── Conversa ─── */
  async function perguntar(texto) {
    const pergunta = texto.trim().slice(0, MAX_CARACTERES);
    if (!pergunta || ocupado) return;

    ocupado = true;
    elos.enviar.disabled = true;
    elos.sugestoes.hidden = true;

    historico.push({ role: 'user', content: pergunta });
    salvarHistorico();
    bolha('aluno', pergunta);

    const resposta = document.createElement('div');
    resposta.className = 'aquino-msg aquino-msg--aquino';
    resposta.innerHTML = '<span class="aquino-pensando"><i></i><i></i><i></i></span>';
    elos.mensagens.appendChild(resposta);
    rolarAteOFim();

    let acumulado = '';

    try {
      const req = await fetch(ROTA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historico.slice(-MAX_MENSAGENS) }),
      });

      if (!req.ok) {
        resposta.remove();
        if (req.status === 429) {
          const espera = Number(req.headers.get('retry-after')) || 30;
          bolhaErro(`O Aquino está muito procurado agora. Tente de novo em ${espera} segundos.`);
        } else if (req.status === 503) {
          bolhaErro('O Aquino ainda não foi configurado neste ambiente.');
        } else {
          bolhaErro('O Aquino teve um problema para responder. Tente de novo daqui a pouco.');
        }
        historico.pop();
        salvarHistorico();
        return;
      }

      resposta.innerHTML = '';
      resposta.classList.add('is-escrevendo');

      const leitor = req.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await leitor.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        resposta.innerHTML = paraHtml(acumulado);
        rolarAteOFim();
      }

      resposta.classList.remove('is-escrevendo');

      /* NUL no fim = a função avisou que o stream caiu no meio */
      const cortada = acumulado.endsWith('\u0000');
      if (cortada) acumulado = acumulado.slice(0, -1);

      if (acumulado.trim()) {
        resposta.innerHTML = paraHtml(acumulado);
        historico.push({ role: 'assistant', content: acumulado.trim() });
        salvarHistorico();
        if (cortada) bolhaErro('A resposta foi interrompida no meio. Pergunte de novo?');
      } else {
        resposta.remove();
        bolhaErro('O Aquino não conseguiu responder dessa vez. Pergunte de novo?');
        historico.pop();
        salvarHistorico();
      }
    } catch {
      resposta.remove();
      bolhaErro(
        navigator.onLine
          ? 'Não consegui falar com o Aquino agora. Tente de novo daqui a pouco.'
          : 'Você está sem internet — o Aquino precisa de conexão para responder.'
      );
      historico.pop();
      salvarHistorico();
    } finally {
      ocupado = false;
      elos.enviar.disabled = false;
      elos.campo.focus();
    }
  }

  /* ─── Abrir e fechar ─── */
  function abrir() {
    if (!navigator.onLine) return;
    elos.modal.removeAttribute('hidden');
    document.body.classList.add('aquino-aberto');
    esconderBolha();
    rolarAteOFim();
    setTimeout(() => elos.campo.focus(), 60);
  }

  function fechar() {
    elos.modal.setAttribute('hidden', '');
    document.body.classList.remove('aquino-aberto');
    elos.fab.focus();
  }

  function limpar() {
    historico = [];
    salvarHistorico();
    redesenhar();
    elos.campo.focus();
  }

  function esconderBolha() {
    elos.bolha.classList.remove('is-visible');
    try { sessionStorage.setItem(CHAVE_BOLHA, '1'); } catch { /* sem storage, tudo bem */ }
  }

  /* ─── Montagem ─── */
  function montar() {
    const fab = document.createElement('button');
    fab.className = 'aquino-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir o Aquino, assistente de dúvidas');
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML =
      '<span class="aquino-fab__bolha" aria-hidden="true">Tire suas dúvidas</span>' +
      '<span class="aquino-fab__figura">' + figura() + '</span>';

    const modal = document.createElement('div');
    modal.className = 'aquino-modal';
    modal.id = 'aquino-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Conversa com o Aquino');
    modal.innerHTML = `
      <div class="aquino-modal__backdrop" data-aquino-fechar></div>
      <div class="aquino-janela">
        <header class="aquino-cabecalho">
          <span class="aquino-cabecalho__figura" aria-hidden="true">${figura()}</span>
          <div class="aquino-cabecalho__texto">
            <h2>Aquino</h2>
            <p>Assistente de dúvidas da turma</p>
          </div>
          <button class="aquino-icone-bt" type="button" data-aquino-limpar
                  title="Limpar conversa" aria-label="Limpar conversa">${icone(IC_LIMPAR)}</button>
          <button class="aquino-icone-bt" type="button" data-aquino-fechar
                  title="Fechar" aria-label="Fechar">${icone(IC_FECHAR)}</button>
        </header>

        <div class="aquino-mensagens" role="log" aria-live="polite" aria-relevant="additions"></div>

        <div class="aquino-sugestoes">
          ${SUGESTOES.map(s => `<button type="button">${s}</button>`).join('')}
        </div>

        <form class="aquino-form">
          <textarea rows="1" maxlength="${MAX_CARACTERES}" placeholder="Pergunte ao Aquino…"
                    aria-label="Sua pergunta"></textarea>
          <button class="aquino-enviar" type="submit" aria-label="Enviar pergunta">${icone(IC_ENVIAR)}</button>
        </form>

        <p class="aquino-aviso">
          O Aquino pode errar. Em caso de dúvida, fale com o catequista ou com o Pe.
        </p>
      </div>`;

    document.body.append(fab, modal);

    elos = {
      fab,
      modal,
      bolha: fab.querySelector('.aquino-fab__bolha'),
      mensagens: modal.querySelector('.aquino-mensagens'),
      sugestoes: modal.querySelector('.aquino-sugestoes'),
      form: modal.querySelector('.aquino-form'),
      campo: modal.querySelector('textarea'),
      enviar: modal.querySelector('.aquino-enviar'),
    };
  }

  function ligarEventos() {
    elos.fab.addEventListener('click', abrir);

    elos.modal.querySelectorAll('[data-aquino-fechar]').forEach(el => {
      el.addEventListener('click', fechar);
    });
    elos.modal.querySelector('[data-aquino-limpar]').addEventListener('click', limpar);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !elos.modal.hidden) fechar();
    });

    elos.sugestoes.querySelectorAll('button').forEach(bt => {
      bt.addEventListener('click', () => perguntar(bt.textContent));
    });

    elos.form.addEventListener('submit', e => {
      e.preventDefault();
      const texto = elos.campo.value;
      elos.campo.value = '';
      elos.campo.style.height = '';
      perguntar(texto);
    });

    /* Enter envia, Shift+Enter quebra linha */
    elos.campo.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elos.form.requestSubmit();
      }
    });

    /* O campo cresce com o texto, até o teto do CSS */
    elos.campo.addEventListener('input', () => {
      elos.campo.style.height = 'auto';
      elos.campo.style.height = elos.campo.scrollHeight + 'px';
    });

    const verConexao = () => {
      elos.fab.classList.toggle('is-offline', !navigator.onLine);
      elos.fab.setAttribute(
        'aria-label',
        navigator.onLine
          ? 'Abrir o Aquino, assistente de dúvidas'
          : 'O Aquino precisa de internet'
      );
      if (!navigator.onLine && !elos.modal.hidden) fechar();
    };
    window.addEventListener('online', verConexao);
    window.addEventListener('offline', verConexao);
    verConexao();
  }

  function iniciar() {
    montar();
    carregarHistorico();
    redesenhar();
    ligarEventos();

    /* Balãozinho de convite uma vez por sessão */
    let jaViu = true;
    try { jaViu = sessionStorage.getItem(CHAVE_BOLHA) === '1'; } catch { /* sem storage */ }
    if (!jaViu && navigator.onLine) {
      setTimeout(() => elos.bolha.classList.add('is-visible'), 2200);
      setTimeout(esconderBolha, 9000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
