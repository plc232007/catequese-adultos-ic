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
.env.local                                 ← GEMINI_API_KEY (fora do git)
cronograma-credo.md  cronograma-santos.md   ← planejamento do conteúdo (não vão pro site)
api/
  aquino.mjs           ← função da Vercel que conversa com o Gemini
  aquino-contexto.mjs  ← o que o Aquino sabe sobre a turma
src/assets/
  css/styles.css  css/app.css  css/aquino.css
  js/main.js      js/pwa.js    js/aquino.js
  img/  img/santos/  img/icons/  pdf/
```

### Páginas
- `index.html` — Hero, faixa do santo da turma, Sobre, Cronograma dinâmico, Material, Avisos, São Bento
- `santos.html` — Cards dos santos, um por semana (13 hoje), empilhados do mais recente ao mais antigo
- `conteudos.html` — Material dos encontros (18 hoje): PDFs no Google Drive, YouTube sob demanda, fotos com lightbox
- `oracoes.html` — Orações em cards expansíveis, cada uma com versão PT/LA e abas de acesso rápido

Todas as 4 páginas carregam o mesmo nav, bottom nav, pílula e modal de instalação — ao mexer em qualquer um desses blocos, replique nas quatro. O Aquino é a exceção: o `aquino.js` cria o próprio markup, então as páginas só têm o `<link>` do CSS e o `<script>`.

## Camadas de CSS (a ordem importa)

1. `src/assets/css/styles.css` (~800 linhas) — variáveis, reset, nav, hero, cards, footer, componentes globais
2. `src/assets/css/aquino.css` (~380 linhas) — o bonequinho do Aquino e a janela de conversa. Camada isolada: nada aqui é usado por outra parte do site
3. `src/assets/css/app.css` (~500 linhas) — camada PWA/mobile: bottom nav (≤640px), pílula/modal de instalação, toast offline, abas de orações (`.oracao-tabs`). **Contém `opacity: 1 !important` em `.js-reveal`** como rede de segurança: sem isso, um SW com JS velho em cache deixaria os cards invisíveis para sempre.
4. **`<style>` inline em cada página** — cada HTML tem um bloco `<style>` grande no `<head>` com os estilos exclusivos daquela página (santos ~480 linhas, conteudos ~435, oracoes ~424, index ~169). Estilos de `.saint-card`, `.encontro-card`, `.prayer-card`, `.lightbox` etc. moram lá, **não** em `styles.css`. Antes de criar um estilo novo, procure no `<style>` da própria página.

## JavaScript

- `src/assets/js/main.js` — nav ativo, menu hamburguer, scroll suave, barra de progresso + botão voltar ao topo, revelação via `IntersectionObserver` (`.js-reveal` → `.is-visible`), cronograma dinâmico, parallax das imagens dos santos, YouTube sob demanda, remoção de `.foto-thumb` quebrada.
- `src/assets/js/pwa.js` — registro do SW, reset de cache por versão, bottom nav ativo, pílula/modal de instalação (prompt nativo no Android, instruções no iOS), toast offline.
- **Scripts inline no fim de duas páginas:** `conteudos.html` (lightbox — `abrirLightbox`/`fecharLightbox`) e `oracoes.html` (`togglePrayer`, `setLang` PT/LA, abas `.oracao-tab`). São chamados por `onclick` no HTML.

- `src/assets/js/aquino.js` — o assistente de dúvidas. Cria sozinho o bonequinho e a janela de conversa e pendura no `<body>`; nenhum markup dele mora nos HTML. Fala só com `/api/aquino`.

Carregamento em todas as páginas: `<script src="src/assets/js/main.js" defer>`, `<script src="/src/assets/js/pwa.js" defer>` e `<script src="/src/assets/js/aquino.js" defer>`.

## Service Worker (`sw.js`)

Estratégia **stale-while-revalidate**: serve do cache imediatamente e revalida em background. Ignora requests de outra origem (YouTube, Google Fonts). Navegação sem rede e sem cache cai no `/index.html`.

O array `PRECACHE` lista páginas e assets um a um — **ao adicionar uma página nova, uma imagem de santo ou um PDF, inclua na lista**, senão o arquivo não fica disponível offline. Os PDFs ficam em `src/assets/pdf/`.

### ⚠️ Versionamento de cache — ponto crítico

Ao fazer deploy com mudanças significativas, **duas constantes devem ser incrementadas juntas**:

| Arquivo | Constante | Valor atual |
|---|---|---|
| `sw.js` | `const CACHE` | `'ic-2026-v11'` |
| `src/assets/js/pwa.js` | `const APP_VERSION` | `'11'` |

Trocar só uma causa inconsistência: o SW antigo pode continuar ativo enquanto o JS espera outra versão. O `pwa.js` compara `APP_VERSION` com o `localStorage` do usuário e, se diferirem, apaga todos os caches, desregistra os SWs e recarrega a página.

Isso é ainda mais importante porque o `vercel.json` marca CSS/JS/imagens como `immutable, max-age=31536000` — só os HTML revalidam. Sem bumpar a versão, o usuário fica com o CSS/JS velho.

## O Aquino (assistente de dúvidas)

Bonequinho de Santo Tomás de Aquino no canto inferior esquerdo das quatro páginas.
Clicou, abre uma janela de conversa; a resposta vem do **Gemini**, pela chave gratuita
do Google AI Studio.

```
navegador → POST /api/aquino → api/aquino.mjs → generativelanguage.googleapis.com
                                              → stream de volta
```

A `GEMINI_API_KEY` só existe dentro da função. O navegador nunca a vê, e o front não
sabe nem qual modelo está sendo usado.

Usa o endpoint clássico `:streamGenerateContent`, que é **sem estado**: cada pergunta
manda o histórico inteiro e o Google não guarda a conversa. Existe também a Interactions
API, mais nova, que por padrão guarda a conversa no servidor deles (`store=true`) — não
é o que queremos para um site de catequese.

**Onde fica a chave:** gere em https://aistudio.google.com/apikey. Depois, `.env.local`
na raiz (ignorado pelo git) para rodar local, e Vercel → Settings → Environment
Variables → `GEMINI_API_KEY` (marcada como *Sensitive*) para produção. Sem a variável, a
função devolve 503 e o Aquino avisa que não foi configurado — o resto do site continua
funcionando normalmente.

**Trocar de modelo:** a constante `MODELO` no topo de `api/aquino.mjs`. A lista que a sua
chave enxerga sai em `GET https://generativelanguage.googleapis.com/v1beta/models`.
Hoje: `gemini-3.5-flash` — e **não** o 3.8, que é mais novo: no plano gratuito os modelos
da moda têm pouca prioridade, e em seis chamadas seguidas o 3.8-flash devolveu 503
"high demand" cinco vezes, enquanto o 3.5-flash respondeu inteiro em quatro. Vale
retestar de vez em quando.

**`thinkingLevel: 'low'`** é obrigatório na prática. O padrão do Gemini 3.x é `medium`:
sem baixar, a primeira palavra demora quase 40 segundos e o raciocínio consome o
`maxOutputTokens`, cortando a resposta no meio. Com `low`, a resposta começa em 3 a 5
segundos. O campo é aninhado — `generationConfig.thinkingConfig.thinkingLevel` —, e o
raciocínio conta no `maxOutputTokens`, por isso ele está em 1400 para 2 a 3 parágrafos.

**Quando o plano gratuito falha:** 503 "high demand" acontece bastante. A função tenta
até três vezes com uma pausa curta e, se ainda assim não vier, devolve 429 com a mesma
mensagem amigável. Se a conexão cair no meio da resposta (stream que acaba sem
`finishReason`), a função manda um `\u0000` no fim e o front avisa que foi interrompida
em vez de guardar meia frase como se fosse a resposta.

**Formato:** no Gemini as regras vão em `systemInstruction`, separado das mensagens, e o
papel do assistente chama-se `model` — não `assistant`. O texto de cada pedaço do stream
está em `candidates[0].content.parts[].text`, e um pedaço pode trazer mais de um `part`.

### ⚠️ Por que o contexto é partido em dois
O texto de sistema é reenviado a cada pergunta. Mandar tudo sempre deixa a resposta
lenta e faz o modelo divagar sobre assunto que ninguém perguntou. Por isso
`api/aquino-contexto.mjs` tem duas partes:

- `INDICE` (~690 tokens) — vai em toda pergunta: turma, lista dos encontros, santos, orações
- `ENCONTROS` — o resumo detalhado de cada encontro, e `detalhesRelevantes()` junta no
  máximo dois, só quando a pergunta cita o número ou uma palavra-chave do tema

O teto do plano gratuito é por conta e aparece em https://aistudio.google.com/rate-limit.
`hoje()` injeta a data corrente em São Paulo — sem isso o Aquino chuta qual foi o
último encontro e inventa datas.

### Rodar local
`python3 -m http.server` **não** executa a função. Use `vercel dev` na raiz, que sobe o
site e a `/api` juntos e lê o `.env.local`. Sem a CLI da Vercel, o site estático continua
abrindo normalmente — só o Aquino não responde.

### Ao mexer
- Encontro novo em `conteudos.html` → linha nova no `INDICE` **e** item novo em `ENCONTROS`
- O bonequinho é SVG inline dentro do `aquino.js` (função `figura()`), não é imagem
- No mobile ele sobe para cima da pílula de instalação via `body:has(.install-pill:not([hidden]))`
- `aquino.css` e `aquino.js` estão no `PRECACHE`; mudou qualquer um deles, bumpe a versão de cache

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
Duplicar o último `.encontro-card` e atualizar `data-encontro`, **`data-modulo`**, `.encontro-num`, `.encontro-modulo`, `<h3>`, `.encontro-meta`, `.encontro-resumo` e a grade de materiais. O comentário-guia acima do Encontro 1 lista os tipos de material disponíveis. Todos os 18 encontros já estão preenchidos; a classe `.pendente`/`.pendente-msg` sobrevive só no CSS, para cards ainda não realizados. **Ao criar um encontro novo, acrescente-o também em `api/aquino-contexto.mjs`** — o Aquino não lê o HTML.

Vídeo do YouTube: `<div class="video-wrapper" data-video-id="ID" data-video-title="...">` com um `<button class="video-load">` dentro — o `main.js` cria o iframe (`youtube-nocookie`) só no clique. **A miniatura `<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg">` e o `aria-label` do botão têm que usar o mesmo ID** — trocar só o `data-video-id` faz o card mostrar a imagem de um vídeo e abrir outro. Fotos: `.fotos-row` com `<img class="foto-thumb" onclick="abrirLightbox(...)">`.

### Menu de módulos (`conteudos.html`)
A página tem um menu que filtra os encontros por módulo do Catecismo. Cada card declara `data-modulo` e cada botão do menu declara `data-filtro`; os valores válidos são **`credo`, `mandamentos`, `sacramentos`, `pai-nosso` e `outros`**, mais o `todos` que mostra tudo na ordem sequencial (padrão).

Pontos a saber ao mexer:
- O selo `.encontro-modulo` no cabeçalho do card é texto fixo — mantenha-o coerente com o `data-modulo`
- A contagem de cada botão é calculada em tempo de execução a partir do DOM, então não precisa ser atualizada na mão
- Módulo sem nenhum encontro mostra o bloco `#modulo-vazio` ("ainda não chegamos aqui") em vez de uma lista em branco
- O filtro aceita deep link: `conteudos.html#sacramentos` já abre filtrado; hash desconhecida cai em `todos`
- CSS no `<style>` da página e JS no `<script>` do rodapé, junto do lightbox — **de propósito**, para não tocar em `main.js` e evitar bump de versão de cache

Hoje: Credo tem 12 encontros (2–13), Mandamentos tem 3 (16–18), Outros tem 3 (1, 14 e 15), e Sacramentos e Pai Nosso ainda estão vazios.

### Novo santo semanal (`santos.html`)
Duplicar o primeiro `.saint-card`, atualizar `data-semana`, `.saint-week-badge`, nome, textos e imagem, e inseri-lo **no topo** da lista — os cards ficam em ordem decrescente de semana. A imagem vai em `src/assets/img/santos/` e precisa entrar no `PRECACHE` do `sw.js`.

Duas ressalvas sobre o estado atual: o comentário-guia dentro do arquivo fala em mover o card antigo para `.upcoming-grid`, mas esse padrão foi abandonado — `.upcoming-grid`/`.upcoming-card` existem só no CSS, sem markup. (A duplicidade antiga de `data-semana="1"` já foi corrigida: hoje as semanas vão de 1 a 13, sem repetição.)

### Cronograma (`index.html`)
Cada `.timeline-item` usa `data-date` em ISO completo com fuso (`data-date="2026-08-12T20:00:00-03:00"`) e `data-semestre` (`"1"` ou `"2"`). O `main.js` usa isso para marcar `.is-past`/`.is-next`/`.is-oculto` e para preencher elementos que **precisam existir na página**: `#next-meeting-title`, `#next-meeting-detail`, `#agenda-progress-text`, `#agenda-progress-bar` e o cartão do hero (`#hero-proximo` + `#hero-proximo-quando` + `#hero-proximo-titulo`). O local ("Sala 204") está hardcoded no `main.js`.

### ⚠️ Divulgação semanal automática
**Todos os encontros do semestre já ficam no HTML**, mas só aparecem quando chega a vez de cada um: um encontro entra no cronograma na **quinta-feira da semana anterior** (`data - 6 dias`, à meia-noite). Quem não foi divulgado recebe `.is-oculto` e some da página.

Isso significa que **não se edita o cronograma toda semana** — a regra é de data e roda no navegador de quem acessa. Ao planejar um semestre novo, insira todos os encontros de uma vez.

Estados que o `main.js` cobre, e que valem testar ao mexer nessa lógica:
- Encontro acontecendo agora (até 2h depois do início) → "Acontecendo agora"
- Hoje / amanhã → texto por extenso em vez da data
- **Janela entre o fim do encontro e a quinta** → "Próximo encontro a divulgar"; sem esse caso o painel anunciaria "Semestre concluído" por engano toda quarta à noite
- Semestre terminado → "Semestre concluído" e cartão do hero escondido

O progresso conta o semestre do próximo encontro, incluindo os ainda não divulgados (o total do semestre é público pelo PDF).

### Planejamento
`cronograma-credo.md` e `cronograma-santos.md` são as fontes de verdade dos temas e santos por data. Consulte-os antes de criar encontros ou santos novos; eles não são publicados no site.

## Observação

O `README.md` está desatualizado (descreve 3 páginas, sem `oracoes.html` nem PWA). Prefira este arquivo; se mexer no README, alinhe os dois.
