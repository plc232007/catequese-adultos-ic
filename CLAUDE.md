# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o projeto

Site estático da turma de **Iniciação Cristã de Adultos (IC) 2026** da Paróquia São José. Sem framework, sem build, sem banco de dados — HTML, CSS e JS puro. Hospedado no Vercel.

## Como rodar localmente

Não há build. Basta servir os arquivos com um servidor HTTP local (necessário para o Service Worker funcionar):

```bash
python3 -m http.server 8080
# ou
npx serve .
```

Abrir direto como `file://` não funciona para PWA/Service Worker.

Não há testes automatizados, linter nem script de build.

## Arquitetura

### Páginas
- `index.html` — Início (hero, cronograma dinâmico, São Bento, avisos)
- `santos.html` — Santo da semana + grade de próximas semanas
- `conteudos.html` — Material dos encontros (PDF, YouTube, fotos com lightbox)
- `oracoes.html` — Orações com abas de navegação

### CSS (duas camadas, ordem importa)
1. `src/assets/css/styles.css` — Estilos globais, variáveis CSS, componentes
2. `src/assets/css/app.css` — Camada PWA/mobile: bottom nav (≤640px), install pill/modal, offline toast, abas de orações. **Importante:** contém `opacity: 1 !important` em `.js-reveal` como rede de segurança contra SW stale que deixaria cards invisíveis.

### JavaScript
- `src/assets/js/main.js` — Nav ativo, menu hamburguer, scroll suave, barra de progresso, revelação via `IntersectionObserver` (`.js-reveal` → `.is-visible`), cronograma dinâmico com `data-date`, parallax das imagens dos santos, YouTube sob demanda.
- `src/assets/js/pwa.js` — Registro do Service Worker, reset de cache por versão, bottom nav ativo, install pill/modal (Android nativo + instruções iOS), indicador offline.

### Service Worker (`sw.js`)
Estratégia **stale-while-revalidate**: serve do cache imediatamente e atualiza em background. Pré-cacheia todas as páginas e assets estáticos.

### ⚠️ Versionamento de cache — ponto crítico
Ao fazer deploy com mudanças significativas, **duas constantes devem ser atualizadas juntas**:

| Arquivo | Constante |
|---|---|
| `sw.js` | `const CACHE = 'ic-2026-v5'` |
| `src/assets/js/pwa.js` | `const APP_VERSION = '5'` |

Trocar só um deles causa inconsistência: o SW antigo pode ficar ativo enquanto o JS novo espera uma versão diferente.

## Identidade visual (variáveis CSS)

| Variável | Valor | Uso |
|---|---|---|
| `--gold` | `#C6A55A` | Acentos, bordas, badges |
| `--gold-soft` | `#D6B873` | Hover, variações suaves |
| `--cream-main` | `#F3EFE7` | Fundo principal |
| `--white-soft` | `#FAF8F3` | Fundo alternado |
| `--dark` | `#1C1610` | Nav, headers de cards, rodapé |
| `--text` | `#2E2A26` | Texto principal |
| `--text-soft` | `#5E554C` | Texto secundário |

**Fontes:** `Playfair Display` (títulos) e `Lato` (corpo), ambas via Google Fonts.

## Breakpoint mobile

`640px` é o único breakpoint crítico. Abaixo dele:
- Nav hamburguer é **escondido** e substituído pelo **bottom nav** fixo (`.bottom-nav` em `app.css`)
- `body` recebe `padding-bottom` para não sobrepor o bottom nav
- Grids colapsam para coluna única

## Adicionar conteúdo

### Novo encontro (`conteudos.html`)
Remover a classe `pendente` do card e substituir `.pendente-msg` pelo `.encontro-body` completo (copiar do Encontro 1 como modelo).

### Novo santo semanal (`santos.html`)
1. Duplicar `.saint-card`, atualizar dados
2. Mover o card anterior para `.upcoming-grid` como `.upcoming-card`

### Cronograma (`index.html`)
Cada `.timeline-item` usa `data-date="YYYY-MM-DDTHH:mm"` para o JS calcular passado/próximo automaticamente.
