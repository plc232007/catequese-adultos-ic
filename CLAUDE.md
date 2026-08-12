# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o projeto

Site estático (PWA) da turma de **Iniciação Cristã de Adultos (IC) 2026** da Paróquia São José. Sem framework, sem build, sem banco de dados — HTML, CSS e JS puro. Hospedado no Vercel.

## Commits — regra obrigatória

Os commits deste repositório são sempre do autor humano (Pedro Leite Campos). **Nenhum commit pode fazer referência a IA, a assistentes ou a geração automática.** Isso vale para tudo que fica registrado no git:

- **Não** incluir `Co-Authored-By: Claude` (nem qualquer outro co-autor de IA) no rodapé da mensagem
- **Não** incluir `🤖 Generated with Claude Code`, links para claude.com/claude-code ou similares
- **Não** mencionar Claude, Claude Code, IA, LLM ou "gerado por" no título, no corpo ou em descrições de PR
- O mesmo se aplica a mensagens de merge, tags e descrições de pull request

Escreva a mensagem como se fosse escrita pelo próprio Pedro: em português, no estilo já usado no histórico (`feat: 14º encontro — Encíclica Magnifica Humanitas`). Esta regra tem precedência sobre qualquer padrão de rodapé automático.

## Como rodar localmente

Não há build. Servir os arquivos com um servidor HTTP local (necessário para o Service Worker funcionar):

```bash
python3 -m http.server 8080
# ou
npx serve .
```

Abrir direto como `file://` não funciona para PWA/Service Worker. Vários caminhos são absolutos (`/sw.js`, `/src/assets/js/pwa.js`), então o site precisa ser servido da raiz.

Não há testes automatizados, linter nem script de build. A verificação é manual: abrir as 4 páginas, testar no mobile (≤640px) e conferir o Service Worker no DevTools → Application.

## Estrutura

```
index.html  santos.html  conteudos.html  oracoes.html
sw.js  manifest.json  vercel.json
cronograma-credo.md  cronograma-santos.md   ← planejamento do conteúdo (não vão pro site)
src/assets/
  css/styles.css  css/app.css
  js/main.js      js/pwa.js
  img/  img/santos/  img/icons/
```

### Páginas
- `index.html` — Hero, faixa do santo da turma, Sobre, Cronograma dinâmico, Material, Avisos, São Bento
- `santos.html` — Cards dos santos, um por semana (13 hoje), empilhados do mais recente ao mais antigo
- `conteudos.html` — Material dos encontros (14 hoje): PDFs no Google Drive, YouTube sob demanda, fotos com lightbox
- `oracoes.html` — Orações em cards expansíveis, cada uma com versão PT/LA e abas de acesso rápido

Todas as 4 páginas carregam o mesmo nav, bottom nav, pílula e modal de instalação — ao mexer em qualquer um desses blocos, replique nas quatro.

## Camadas de CSS (a ordem importa)

1. `src/assets/css/styles.css` (~800 linhas) — variáveis, reset, nav, hero, cards, footer, componentes globais
2. `src/assets/css/app.css` (~500 linhas) — camada PWA/mobile: bottom nav (≤640px), pílula/modal de instalação, toast offline, abas de orações (`.oracao-tabs`). **Contém `opacity: 1 !important` em `.js-reveal`** como rede de segurança: sem isso, um SW com JS velho em cache deixaria os cards invisíveis para sempre.
3. **`<style>` inline em cada página** — cada HTML tem um bloco `<style>` grande no `<head>` com os estilos exclusivos daquela página (santos ~480 linhas, conteudos ~435, oracoes ~424, index ~169). Estilos de `.saint-card`, `.encontro-card`, `.prayer-card`, `.lightbox` etc. moram lá, **não** em `styles.css`. Antes de criar um estilo novo, procure no `<style>` da própria página.

## JavaScript

- `src/assets/js/main.js` — nav ativo, menu hamburguer, scroll suave, barra de progresso + botão voltar ao topo, revelação via `IntersectionObserver` (`.js-reveal` → `.is-visible`), cronograma dinâmico, parallax das imagens dos santos, YouTube sob demanda, remoção de `.foto-thumb` quebrada.
- `src/assets/js/pwa.js` — registro do SW, reset de cache por versão, bottom nav ativo, pílula/modal de instalação (prompt nativo no Android, instruções no iOS), toast offline.
- **Scripts inline no fim de duas páginas:** `conteudos.html` (lightbox — `abrirLightbox`/`fecharLightbox`) e `oracoes.html` (`togglePrayer`, `setLang` PT/LA, abas `.oracao-tab`). São chamados por `onclick` no HTML.

Carregamento em todas as páginas: `<script src="src/assets/js/main.js" defer>` e `<script src="/src/assets/js/pwa.js" defer>`.

## Service Worker (`sw.js`)

Estratégia **stale-while-revalidate**: serve do cache imediatamente e revalida em background. Ignora requests de outra origem (YouTube, Google Fonts). Navegação sem rede e sem cache cai no `/index.html`.

O array `PRECACHE` lista páginas e assets um a um — **ao adicionar uma página nova ou uma imagem de santo, inclua na lista**, senão ela não fica disponível offline.

### ⚠️ Versionamento de cache — ponto crítico

Ao fazer deploy com mudanças significativas, **duas constantes devem ser incrementadas juntas**:

| Arquivo | Constante | Valor atual |
|---|---|---|
| `sw.js` | `const CACHE` | `'ic-2026-v6'` |
| `src/assets/js/pwa.js` | `const APP_VERSION` | `'6'` |

Trocar só uma causa inconsistência: o SW antigo pode continuar ativo enquanto o JS espera outra versão. O `pwa.js` compara `APP_VERSION` com o `localStorage` do usuário e, se diferirem, apaga todos os caches, desregistra os SWs e recarrega a página.

Isso é ainda mais importante porque o `vercel.json` marca CSS/JS/imagens como `immutable, max-age=31536000` — só os HTML revalidam. Sem bumpar a versão, o usuário fica com o CSS/JS velho.

## Identidade visual (variáveis em `styles.css`)

| Variável | Valor | Uso |
|---|---|---|
| `--gold` | `#C6A55A` | Acentos, bordas, badges |
| `--gold-soft` | `#D6B873` | Hover, variações suaves |
| `--cream-main` | `#F3EFE7` | Fundo principal |
| `--cream-soft` | `#E9E3D8` | Fundo alternado / divisórias |
| `--white-soft` | `#FAF8F3` | Fundo de cards e seções claras |
| `--dark` | `#1C1610` | Nav, headers de cards, rodapé |
| `--text` | `#2E2A26` | Texto principal |
| `--text-soft` | `#5E554C` | Texto secundário |

Existem aliases legados que ainda aparecem no código: `--cream`, `--gold-light`, `--blue-dark`, `--text-light`. São `var()` para os de cima — use os nomes canônicos em código novo.

**Fontes:** `Playfair Display` (títulos) e `Lato` (corpo), via Google Fonts.

## Breakpoint mobile

`640px` é o único breakpoint crítico. Abaixo dele:
- O nav hamburguer é **escondido** e substituído pelo **bottom nav** fixo (`.bottom-nav`, em `app.css`)
- `body` recebe `padding-bottom` para não ficar atrás do bottom nav
- Grids colapsam para coluna única

## Adicionar conteúdo

### Novo encontro (`conteudos.html`)
Duplicar o último `.encontro-card` e atualizar `data-encontro`, `.encontro-num`, `<h3>`, `.encontro-meta`, `.encontro-resumo` e a grade de materiais. O comentário-guia acima do Encontro 1 lista os tipos de material disponíveis. Todos os 14 encontros já estão preenchidos; a classe `.pendente`/`.pendente-msg` sobrevive só no CSS, para cards ainda não realizados.

Vídeo do YouTube: `<div class="video-wrapper" data-video-id="ID" data-video-title="...">` com um `<button class="video-load">` dentro — o `main.js` cria o iframe (`youtube-nocookie`) só no clique. Fotos: `.fotos-row` com `<img class="foto-thumb" onclick="abrirLightbox(...)">`.

### Novo santo semanal (`santos.html`)
Duplicar o primeiro `.saint-card`, atualizar `data-semana`, `.saint-week-badge`, nome, textos e imagem, e inseri-lo **no topo** da lista — os cards ficam em ordem decrescente de semana. A imagem vai em `src/assets/img/santos/` e precisa entrar no `PRECACHE` do `sw.js`.

Duas ressalvas sobre o estado atual: o comentário-guia dentro do arquivo fala em mover o card antigo para `.upcoming-grid`, mas esse padrão foi abandonado — `.upcoming-grid`/`.upcoming-card` existem só no CSS, sem markup. E há dois cards com `data-semana="1"` (Santo Tomás e São Bento); o segundo deveria ser `2`.

### Cronograma (`index.html`)
Cada `.timeline-item` usa `data-date` em ISO completo com fuso: `data-date="2026-03-04T20:00:00-03:00"`. O `main.js` usa isso para marcar `.is-past`/`.is-next` e para preencher quatro elementos que **precisam existir na página**: `#next-meeting-title`, `#next-meeting-detail`, `#agenda-progress-text`, `#agenda-progress-bar`. O local ("Sala 204") está hardcoded no `main.js`.

### Planejamento
`cronograma-credo.md` e `cronograma-santos.md` são as fontes de verdade dos temas e santos por data. Consulte-os antes de criar encontros ou santos novos; eles não são publicados no site.

## Observação

O `README.md` está desatualizado (descreve 3 páginas, sem `oracoes.html` nem PWA). Prefira este arquivo; se mexer no README, alinhe os dois.
