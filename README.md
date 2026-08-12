# ✝ Catequese — Adultos IC · Paróquia São José

Site estático da turma de **Iniciação Cristã de Adultos (IC) 2026** da Paróquia São José.
HTML, CSS e JavaScript puro — sem framework, sem build, sem banco de dados. Funciona como **PWA**: dá para instalar no celular e navegar offline.

---

## Rodar localmente

Não há build nem dependências. Como o site usa Service Worker, ele precisa ser servido por HTTP (abrir como `file://` não funciona):

```bash
python3 -m http.server 8080
# ou
npx serve .
```

Depois é só abrir `http://localhost:8080`. Vários caminhos são absolutos (`/sw.js`, `/src/assets/js/pwa.js`), então sirva sempre a partir da raiz do projeto.

---

## Estrutura de arquivos

```
catequese-adultos-ic/
├── index.html               ← Início
├── santos.html              ← Santos semana a semana
├── conteudos.html           ← Conteúdo dos encontros
├── oracoes.html             ← Orações (PT / Latim)
├── sw.js                    ← Service Worker (cache offline)
├── manifest.json            ← Manifesto da PWA (ícones, nome, atalhos)
├── vercel.json              ← Cabeçalhos de cache da hospedagem
├── cronograma-credo.md      ← Planejamento dos temas do Credo
├── cronograma-santos.md     ← Planejamento dos santos por data
├── README.md                ← Este arquivo
├── CLAUDE.md                ← Notas técnicas de manutenção
└── src/assets/
    ├── css/
    │   ├── styles.css       ← Estilos globais (nav, hero, cards, rodapé)
    │   └── app.css          ← Camada PWA/mobile (bottom nav, instalação, offline)
    ├── js/
    │   ├── main.js          ← Nav, scroll, cronograma dinâmico, YouTube sob demanda
    │   └── pwa.js           ← Service Worker, instalação, aviso de offline
    └── img/
        ├── fundo.jpg               ← Fundo do hero (todas as páginas)
        ├── sao-bento.jpg           ← São Bento (index.html)
        ├── icons/                  ← Ícones da PWA (192, 512, maskable, SVG)
        └── santos/                 ← Imagens dos santos
```

> **Atenção:** boa parte do CSS de cada página está num bloco `<style>` dentro do próprio HTML — `.saint-card`, `.encontro-card`, `.prayer-card` e `.lightbox` ficam lá, não em `styles.css`. Ao procurar um estilo, olhe primeiro o `<head>` da página.

---

## Páginas

### `index.html` — Início

| Seção | Descrição |
|---|---|
| **Hero** | Imagem de fundo, título, subtítulo e trecho do *Veni Creator Spiritus* |
| **Faixa dourada** | Santo de devoção da turma (São Bento) |
| **Sobre** | Explicação da catequese + citação de Bento XVI + 4 cards (Estudo, Oração, Sacramentos, Comunidade) |
| **Cronograma** | Timeline dos encontros; marca sozinha o que já passou e qual é o próximo |
| **Material** | Itens que os catequizandos devem trazer |
| **Avisos** | Comunicados e lembretes |
| **São Bento** | Seção do santo da turma: imagem, biografia, citação e tags |
| **Rodapé** | Paróquia, ano, frase e créditos |

### `santos.html` — Santos

Um card por semana, empilhados **do mais recente para o mais antigo** (13 hoje). Cada card traz imagem, nome, epíteto, dia da festa, biografia, citação e tags.

### `conteudos.html` — Encontros

Um card por encontro (14 hoje), com número, título, data, horário, local, resumo e a grade de materiais. Fotos abrem em lightbox (fecha com clique fora ou `Esc`).

Materiais suportados: 📄 PDF via Google Drive · 🔗 link externo · 🎥 vídeo do YouTube · 🖼️ fotos com lightbox.

### `oracoes.html` — Orações

Cards expansíveis, cada oração com versão em **português e latim** alternáveis, e abas fixas no topo para pular direto para uma oração.

---

## Como atualizar o site

### Adicionar um novo encontro (`conteudos.html`)

Duplique o último `.encontro-card` e atualize — repare no **`data-modulo`**, que é o que faz o encontro aparecer no módulo certo do menu:

```html
<div class="encontro-card" data-encontro="15" data-modulo="sacramentos">
  <div class="encontro-header">
    <div class="encontro-num">15</div>
    <div class="encontro-header-info">
      <p class="encontro-modulo">Sacramentos</p>
      <h3>Título do encontro</h3>
      <div class="encontro-meta">
        <span>📅 <strong>17 Jun 2026</strong></span>
        <span>🕗 <strong>20h – 22h</strong></span>
      </div>
    </div>
  </div>
  <div class="encontro-body">
    <p class="encontro-resumo">Resumo do que foi visto…</p>
    <!-- materiais aqui -->
  </div>
</div>
```

Existe também a variação `.encontro-card.pendente` (card esmaecido com `.pendente-msg`) para um encontro que ainda não aconteceu — hoje ela só existe no CSS, sem nenhum card usando.

### O menu de módulos

No topo da página há um menu para escolher o que estudar, seguindo os pilares do Catecismo:

| Módulo | `data-modulo` | Situação |
|---|---|---|
| Todos os encontros | — | Mostra tudo na ordem, é o padrão |
| Credo | `credo` | 12 encontros (2 ao 13) |
| Os 10 Mandamentos | `mandamentos` | Ainda sem encontros |
| Os Sacramentos | `sacramentos` | Ainda sem encontros |
| O Pai Nosso | `pai-nosso` | Ainda sem encontros |
| Outros | `outros` | 2 encontros (1 e 14) |

Para pôr um encontro num módulo basta o `data-modulo` no card e o selo `.encontro-modulo` no cabeçalho. **A contagem de cada botão se atualiza sozinha** — não precisa mexer em número nenhum.

Módulo que ainda não tem encontro nenhum mostra um aviso de "ainda não chegamos aqui" em vez de uma página vazia. E dá para mandar o link já filtrado: `conteudos.html#credo`, `#sacramentos`, `#pai-nosso` e assim por diante.

### Adicionar PDF de um encontro

1. No Google Drive: botão direito no arquivo → **Compartilhar** → **"Qualquer pessoa com o link pode ver"**
2. Copie o link e cole no `href`:

```html
<a class="mat-item" href="COLE_O_LINK_AQUI" target="_blank" rel="noopener">
```

### Adicionar vídeo do YouTube

O player só é criado quando o aluno clica (evita carregar vários iframes pesados). Basta informar o **ID do vídeo** — a parte depois de `?v=`:

```html
<div class="video-wrapper" data-video-id="dQw4w9WgXcQ" data-video-title="Título do vídeo">
  <button class="video-load">▶ Assistir</button>
</div>
```

O `main.js` monta o iframe (via `youtube-nocookie`) no clique.

### Adicionar fotos de um encontro

1. Crie a pasta `src/assets/img/encontros/encontro-15/` e coloque as fotos (JPG ou PNG)
2. Aponte os `src`:

```html
<img class="foto-thumb" src="src/assets/img/encontros/encontro-15/foto-01.jpg"
     alt="Foto do 15º encontro" onclick="abrirLightbox(this.src)">
```

> A pasta `src/assets/img/encontros/` **ainda não existe** no repositório, mas os encontros 1 e 2 já apontam para fotos dentro dela. Como o `main.js` remove automaticamente `.foto-thumb` que não carrega, essas fotos simplesmente não aparecem no site — nada quebra. Ao subir as fotos de verdade, elas passam a aparecer sozinhas.

### Adicionar um novo santo semanal (`santos.html`)

1. Duplique o **primeiro** `.saint-card` e coloque a cópia no topo da lista (a ordem é decrescente)
2. Atualize `data-semana`, o badge `.saint-week-badge`, nome, epíteto, festa, biografia, citação, tags e a imagem
3. Se a imagem for local, adicione o caminho ao `PRECACHE` do `sw.js` para funcionar offline

> O comentário dentro do arquivo manda mover o card antigo para `.upcoming-grid` — esse padrão foi abandonado. `.upcoming-grid` e `.upcoming-card` sobrevivem só no CSS, sem nenhum uso no HTML.

### Imagens dos santos

Hoje 4 santos usam imagem local (`src/assets/img/santos/`) e 9 usam URL do Wikimedia Commons. **Imagens remotas não ficam disponíveis offline** — o Service Worker ignora requisições de outros domínios de propósito. Para o site funcionar bem sem internet, o ideal é baixar a imagem, salvar em `src/assets/img/santos/` e incluí-la no `PRECACHE` do `sw.js`.

### Atualizar o cronograma (`index.html`)

Cada item da timeline precisa do atributo `data-date` em **formato ISO completo, com o fuso `-03:00`** — é ele que faz o JS marcar o que já passou, destacar o próximo encontro e calcular a barra de progresso:

```html
<div class="timeline-item" data-date="2026-06-17T20:00:00-03:00">
  <div class="timeline-date">
    <div class="day">17</div>
    <div class="month">Jun</div>
  </div>
  <div class="timeline-info">
    <h3>15º Encontro — Título do Tema</h3>
    <p>Local: Sala 204 · Horário: 20h</p>
  </div>
</div>
```

O painel acima da timeline (próximo encontro + progresso) é preenchido pelo `main.js` e depende dos IDs `#next-meeting-title`, `#next-meeting-detail`, `#agenda-progress-text` e `#agenda-progress-bar` — não remova nenhum deles.

### Atualizar o santo de devoção (`index.html`)

Três lugares: a **faixa dourada** abaixo do hero, a **seção São Bento** (imagem, biografia, citação e tags) e o texto do **rodapé**.

### Planejamento do conteúdo

`cronograma-credo.md` e `cronograma-santos.md` têm os temas e santos previstos por data. Use-os como referência antes de criar encontros ou santos novos — eles não são publicados no site.

---

## ⚠️ Antes de publicar: subir a versão do cache

O site guarda tudo em cache para funcionar offline, e a hospedagem serve CSS/JS/imagens com validade de um ano. Por isso, **toda vez que houver mudança relevante, duas constantes precisam ser incrementadas juntas**:

| Arquivo | Constante | Valor atual |
|---|---|---|
| `sw.js` | `const CACHE` | `'ic-2026-v6'` |
| `src/assets/js/pwa.js` | `const APP_VERSION` | `'6'` |

Se só uma for alterada, alguns usuários ficam com uma mistura de arquivos novos e antigos. Ao subir as duas, o `pwa.js` percebe a diferença, limpa os caches do aparelho e recarrega a página com o conteúdo novo.

Adicionou uma **página nova** ou uma **imagem local**? Inclua também no array `PRECACHE` do `sw.js`, senão ela não fica disponível offline.

---

## Hospedagem

O site está no **Vercel**, com os cabeçalhos de cache definidos em `vercel.json` (`sw.js` nunca é cacheado, HTML sempre revalida, assets ficam um ano). Por ser 100% estático, também roda em GitHub Pages ou Netlify — mas aí o `vercel.json` é ignorado e o cuidado com a versão do cache fica ainda mais importante.

---

## Identidade visual

| Variável CSS | Valor | Uso |
|---|---|---|
| `--gold` | `#C6A55A` | Acentos, bordas, badges |
| `--gold-soft` | `#D6B873` | Hover, variações suaves do dourado |
| `--cream-main` | `#F3EFE7` | Fundo principal |
| `--cream-soft` | `#E9E3D8` | Fundo alternado, divisórias |
| `--white-soft` | `#FAF8F3` | Fundo de cards e seções claras |
| `--dark` | `#1C1610` | Nav, headers de cards, rodapé |
| `--text` | `#2E2A26` | Texto principal |
| `--text-soft` | `#5E554C` | Texto secundário |

**Tipografia:** `Playfair Display` nos títulos e `Lato` no corpo, ambas via Google Fonts.

---

## Observações técnicas

- O `main.js` marca sozinho o item ativo do nav (topo) e o `pwa.js` faz o mesmo no bottom nav do celular
- Abaixo de **640px** o menu hamburguer some e entra o **bottom nav** fixo; os grids viram coluna única
- No celular aparece a pílula **"Instalar este app"**: no Android abre o instalador nativo, no iPhone mostra as instruções do Safari
- Sem internet, um aviso discreto aparece no rodapé da tela e o conteúdo já visitado continua acessível
- As animações respeitam `prefers-reduced-motion`
- PDFs e links externos abrem em nova aba (`target="_blank" rel="noopener"`)
- Detalhes de arquitetura e armadilhas de manutenção estão no `CLAUDE.md`

---

*Catequese — Adultos IC · Paróquia São José · 2026*
