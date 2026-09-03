/* ═══════════════════════════════════════════════════════════════
   O QUE O AQUINO SABE SOBRE A TURMA
   ═══════════════════════════════════════════════════════════════
   ⚠️  AO CRIAR UM ENCONTRO NOVO em conteudos.html, acrescente uma
   linha no ÍNDICE e um item em ENCONTROS. Santo novo em santos.html
   entra na lista do índice. Se esquecer, o Aquino continua
   respondendo, mas dirá que ainda não chegamos naquele tema.

   POR QUE ESTÁ PARTIDO EM DOIS: o plano gratuito da Groq dá 8.000
   tokens por minuto para a turma inteira, e o texto do sistema é
   reenviado a cada pergunta. Então mandamos sempre o índice curto e,
   só quando a pergunta fala de um encontro específico, juntamos o
   resumo daquele encontro. Ver detalhesRelevantes() no fim do arquivo.

   Fontes: conteudos.html, index.html (cronograma), santos.html,
   oracoes.html, cronograma-credo.md e cronograma-santos.md.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Sempre enviado ─── */
export const INDICE = `
A TURMA
Iniciação Cristã de Adultos (IC) 2026, Paróquia São José. Encontros às
quartas, 20h às 22h, Sala 204. Catequista: Pedro Leite Campos.
No 1º semestre a turma estudou o Credo. No 2º estuda os Dez Mandamentos e,
a partir de outubro, os Sacramentos.
Lema: "Ignoratio Scripturarum ignoratio Christi est" — o desconhecimento das
Escrituras é desconhecimento de Cristo (São Jerônimo).

ENCONTROS JÁ REALIZADOS
Encontro 1 · 04/03/2026 · Apresentação: Prólogo do Catecismo
Encontro 2 · 11/03/2026 · O que significa "crer"?
Encontro 3 · 18/03/2026 · Deus Pai, Criador Todo-Poderoso
Encontro 4 · 25/03/2026 · Jesus Cristo, Filho Único e Senhor
Encontro 5 · 08/04/2026 · A Semana Santa e a Encarnação
Encontro 6 · 15/04/2026 · O Nascimento: nascido da Virgem Maria
Encontro 7 · 22/04/2026 · A Paixão: sofrimento, cruz e morte
Encontro 8 · 29/04/2026 · A Descida aos mortos
Encontro 9 · 06/05/2026 · A Ressurreição ao terceiro dia
Encontro 10 · 13/05/2026 · A Ascensão e o Juízo Final
Encontro 11 · 20/05/2026 · O Espírito Santo e a Igreja Católica
Encontro 12 · 27/05/2026 · Comunhão dos Santos e a Vida Eterna
Encontro 13 · 03/06/2026 · Nossa Senhora na Doutrina (Mariologia)
Encontro 14 · 10/06/2026 · A Encíclica Magnifica Humanitas: IA e dignidade humana
Encontro 15 · 12/08/2026 · Retomada do semestre: Kahoot de revisão
Encontro 16 · 19/08/2026 · O homem, a liberdade e a lei
Encontro 17 · 26/08/2026 · A Deus somente adorarás (1º Mandamento)
Encontro 18 · 02/09/2026 · O Santo Nome de Deus e o Dia do Senhor (2º e 3º Mandamentos)

AINDA POR VIR (planejado, o tema pode mudar)
09/09 Não matarás (5º) · 16/09 Castidade e matrimônio (6º e 9º) ·
23/09 Não furtarás (7º) · 30/09 A verdade e o desapego (8º e 10º) ·
07/10 Do Decálogo às Bem-aventuranças · 14/10 O que é um sacramento ·
21/10 Batismo · 28/10 Confirmação · 04/11 Eucaristia ·
11/11 Penitência e Unção dos Enfermos · 18/11 Ordem e Matrimônio ·
25/11 Encerramento do semestre

SANTOS DA SEMANA (página Santos)
1 Santo Tomás de Aquino (padroeiro deste assistente) · 2 São Bento de Núrsia
(santo da turma) · 3 São José (padroeiro da paróquia) · 4 São Pedro ·
5 São Paulo · 6 Santo André · 7 São Tiago Menor · 8 Santa Teresinha do
Menino Jesus · 9 São Josemaría Escrivá · 10 Santo Agostinho ·
11 Santa Gemma Galgani · 12 São João Paulo II · 13 São Carlo Acutis

ORAÇÕES DO SITE (cada uma em português e latim)
Vinde, Espírito Santo · Pai Nosso · Ave Maria · Inspirai, Senhor, as nossas ações

O SITE
Quatro páginas: Início (cronograma e avisos), Encontros (material de cada
aula, filtrável por módulo), Santos e Orações. O cronograma completo do 2º
semestre está em PDF no começo da página Início.
`.trim();

/* ─── Enviado só quando a pergunta toca no encontro ─── */
export const ENCONTROS = [
  { n: 1, data: '04/03/2026', titulo: 'Apresentação — Prólogo do Catecismo',
    chaves: ['prologo', 'apresentacao', 'primeiro encontro'],
    resumo: 'Nos apresentamos como turma e conhecemos a proposta da Catequese. Refletimos sobre a finalidade do ser humano e como isso nos leva ao Catecismo da Igreja Católica e à sua Doutrina.' },

  { n: 2, data: '11/03/2026', titulo: 'O que significa "crer"?',
    chaves: ['crer', 'fe', 'razao', 'cinco vias', 'primeira via', 'revelacao'],
    resumo: 'O homem é capaz de Deus, pois traz no coração um desejo de verdade e pode reconhecê-Lo também pela razão, como ensina a primeira via de Santo Tomás. Deus se revela por amor na história da salvação, plenamente em Jesus Cristo, e a resposta do homem a essa revelação é a fé: confiar em Deus, aderir à sua verdade e entregar-se a Ele com inteligência e vontade.' },

  { n: 3, data: '18/03/2026', titulo: 'Deus Pai, Criador Todo-Poderoso',
    chaves: ['criador', 'criacao', 'deus pai', 'trindade', 'todo-poderoso'],
    resumo: 'Existe um só Deus, Pai todo-poderoso, que cria o céu e a terra por amor. Refletimos sobre a Santíssima Trindade, a criação como obra das três Pessoas divinas e o sentido de chamar Deus de "Pai".' },

  { n: 4, data: '25/03/2026', titulo: 'Jesus Cristo, Filho Único e Senhor',
    chaves: ['jesus cristo', 'filho unico', 'senhor', 'messias', 'ungido'],
    resumo: 'O significado dos seus nomes: "Jesus" (Deus salva), "Cristo" (o Ungido, o Messias), "Filho Único" e "Senhor". A Igreja confessa que Ele é verdadeiro Deus e verdadeiro homem.' },

  { n: 5, data: '08/04/2026', titulo: 'A Semana Santa e a Encarnação',
    chaves: ['encarnacao', 'semana santa', 'triduo', 'verbo se fez carne'],
    resumo: 'Depois do Tríduo Pascal, retomamos o Credo contemplando a Encarnação: "E o Verbo se fez carne." O Filho de Deus assume a nossa humanidade pela ação do Espírito Santo no seio da Virgem Maria, para a nossa salvação.' },

  { n: 6, data: '15/04/2026', titulo: 'O Nascimento: nascido da Virgem Maria',
    chaves: ['nascimento', 'natal', 'virgem maria', 'maternidade divina'],
    resumo: 'A maternidade divina e a virgindade de Maria, e o nascimento de Jesus, que revela Deus feito menino, próximo dos pequenos e dos pobres.' },

  { n: 7, data: '22/04/2026', titulo: 'A Paixão: sofrimento, cruz e morte',
    chaves: ['paixao', 'cruz', 'crucificado', 'pilatos', 'sofrimento'],
    resumo: 'Jesus "padeceu sob Pôncio Pilatos" — em tempo e lugar reais —, foi crucificado, morto e sepultado, oferecendo-se em sacrifício por amor para nos reconciliar com o Pai.' },

  { n: 8, data: '29/04/2026', titulo: 'A Descida aos mortos',
    chaves: ['descida', 'mansao dos mortos', 'mortos'],
    resumo: 'Jesus, verdadeiramente morto, desce ao reino dos mortos para anunciar a salvação aos justos que o aguardavam, abrindo-lhes as portas do Céu.' },

  { n: 9, data: '06/05/2026', titulo: 'A Ressurreição ao terceiro dia',
    chaves: ['ressurreicao', 'terceiro dia', 'tumulo vazio', 'pascoa'],
    resumo: 'A verdade culminante da fé: Cristo vence a morte e o pecado. O túmulo vazio, as aparições do Ressuscitado e o que a Páscoa significa para nós.' },

  { n: 10, data: '13/05/2026', titulo: 'A Ascensão e o Juízo Final',
    chaves: ['ascensao', 'juizo final', 'juizo', 'vinda gloriosa'],
    resumo: 'A Ascensão é a entrada de Cristo na glória, e a sua vinda gloriosa nos remete ao Juízo final e à esperança cristã.' },

  { n: 11, data: '20/05/2026', titulo: 'O Espírito Santo e a Igreja Católica',
    chaves: ['espirito santo', 'igreja catolica', 'notas da igreja', 'apostolica'],
    resumo: 'A terceira Pessoa da Trindade, que dá vida à Igreja, e as quatro notas da Igreja: una, santa, católica e apostólica.' },

  { n: 12, data: '27/05/2026', titulo: 'Comunhão dos Santos e a Vida Eterna',
    chaves: ['comunhao dos santos', 'vida eterna', 'purgatorio', 'remissao', 'novissimos'],
    resumo: 'Somos um só Corpo com os santos do Céu, as almas do purgatório e os fiéis na terra. A remissão dos pecados, a ressurreição da carne e a vida eterna.' },

  { n: 13, data: '03/06/2026', titulo: 'Nossa Senhora na Doutrina (Mariologia)',
    chaves: ['nossa senhora', 'mariologia', 'maria', 'dogmas marianos', 'imaculada', 'assuncao'],
    resumo: 'O papel de Nossa Senhora na fé católica e os quatro dogmas marianos: Mãe de Deus, sempre Virgem, Imaculada Conceição e Assunção.' },

  { n: 14, data: '10/06/2026', titulo: 'A Encíclica Magnifica Humanitas — IA e dignidade humana',
    chaves: ['magnifica humanitas', 'enciclica', 'inteligencia artificial', 'leao xiv', 'dignidade'],
    resumo: 'Encontro especial sobre a primeira encíclica do Papa Leão XIV (15/05/2026), sobre a salvaguarda da pessoa humana na era da Inteligência Artificial, à luz da Doutrina Social da Igreja e da dignidade do ser humano criado à imagem de Deus.' },

  { n: 15, data: '12/08/2026', titulo: 'Retomada do semestre — Kahoot de revisão',
    chaves: ['kahoot', 'retomada', 'revisao', 'volta das ferias'],
    resumo: 'Voltamos das férias com um Kahoot de revisão do primeiro semestre e a apresentação do cronograma do segundo, que leva aos Dez Mandamentos e aos Sacramentos.' },

  { n: 16, data: '19/08/2026', titulo: 'O homem, a liberdade e a lei',
    chaves: ['liberdade', 'lei', 'consciencia', 'lei natural', 'imagem e semelhanca', 'marcos 1'],
    resumo: 'Antes dos Mandamentos um a um, olhamos para quem os recebe: o homem, criado à imagem e semelhança de Deus, livre e por isso responsável. A consciência, que aprova ou acusa por dentro e precisa ser formada; a lei de Deus não como amarra, mas como caminho que protege a liberdade. Lemos o primeiro capítulo do Evangelho de São Marcos, que abre com "convertei-vos e crede no Evangelho".' },

  { n: 17, data: '26/08/2026', titulo: 'A Deus somente adorarás (1º Mandamento)',
    chaves: ['adorar', 'primeiro mandamento', '1o mandamento', 'horoscopo', 'signos', 'superticao', 'supersticao', 'adivinhacao', 'idolatria'],
    resumo: 'Dar a Deus o lugar que é só d\'Ele, acima de tudo. Adorar não é só o momento da oração, mas uma vida de fé, esperança e caridade — e o que na prática disputa esse primeiro lugar no coração. Falamos de horóscopo, signos, adivinhação e superstição.' },

  { n: 18, data: '02/09/2026', titulo: 'O Santo Nome de Deus e o Dia do Senhor (2º e 3º Mandamentos)',
    chaves: ['nome de deus', 'segundo mandamento', '2o mandamento', 'terceiro mandamento', '3o mandamento', 'domingo', 'dia do senhor', 'missa', 'sabado', 'marcos 2', 'juramento', 'praga'],
    resumo: 'O segundo pede respeito pelo Nome de Deus, invocado com reverência na oração e na bênção, e não como praga, piada ou juramento leviano. O terceiro nos dá o domingo — a Páscoa de cada semana, o dia da Ressurreição —, com a Missa no centro e o descanso que devolve tempo a Deus, à família e a quem precisa de nós. Lemos o segundo capítulo de São Marcos, onde Jesus perdoa o paralítico e ensina que "o sábado foi feito para o homem, e não o homem para o sábado".' },
];

/* Tira acentos e pontuação, para comparar "consciência" com "consciencia" */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

/* Devolve o resumo dos encontros que a conversa parece estar tocando —
   no máximo dois, para não estourar o limite de tokens por minuto.
   Casa por número ("encontro 16", "16º encontro") e por palavra-chave. */
export function detalhesRelevantes(textoDaConversa) {
  const texto = normalizar(textoDaConversa);
  const achados = new Map();

  for (const m of texto.matchAll(/encontro\s+(\d{1,2})|(\d{1,2})\s*(?:o|a|º|ª)?\s*encontro/g)) {
    const n = Number(m[1] ?? m[2]);
    const e = ENCONTROS.find(x => x.n === n);
    if (e) achados.set(e.n, e);
  }

  for (const e of ENCONTROS) {
    if (achados.size >= 2) break;
    const alvos = [normalizar(e.titulo), ...e.chaves.map(normalizar)];
    if (alvos.some(a => a.length > 3 && texto.includes(a))) achados.set(e.n, e);
  }

  const escolhidos = [...achados.values()].slice(0, 2);
  if (escolhidos.length === 0) return '';

  return '\nDETALHE DOS ENCONTROS QUE A PERGUNTA MENCIONA\n' +
    escolhidos.map(e => `${e.n} — ${e.data} — ${e.titulo}\n${e.resumo}`).join('\n\n');
}

/* A data de hoje, em São Paulo — sem isso o Aquino chuta o que é
   "o último encontro" e inventa datas. */
export function hoje() {
  const agora = new Date();
  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });
  return `HOJE É ${fmt.format(agora)}. Use esta data para saber qual foi o
último encontro e qual é o próximo. Nunca deduza uma data: copie exatamente
a que está na lista acima.`;
}
