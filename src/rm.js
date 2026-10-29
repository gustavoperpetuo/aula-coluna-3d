/* ================= Ressonância: trilha de base e trilhas por doença, em exames reais do SPIDER e da RSNA ================= */
// SPIDER: van der Graaf JW et al., Lumbar spine segmentation in MR images: a dataset and a public benchmark, Sci Data 11, 264 (2024);
// doi:10.5281/zenodo.10159290; CC BY 4.0. Só sagital (o axial é montado), com máscara: 1 a 9 vértebras (1 = L5, conferido na imagem
// contando a partir do sacro), 100 canal, 201 em diante discos (201 = L5-S1).
// RSNA: RSNA Lumbar Spine Degenerative Classification Dataset (LumbarDISC), doi:10.1148/dataset.lsdd.2025. Sagital T1 e T2 e axial T2
// adquirido, sem máscara; em vez dela, os pontos marcados pelos radiologistas. Conversão, casos e pontos em docs/ressonancia.md; arquivos em dist/rm/<dir>/.
// g: radiological_gradings.csv do SPIDER, um disco por linha de baixo para cima (IVD label 1 = rótulo 201):
//    [Modic, placa superior, placa inferior, listese, hérnia, estreitamento, abaulamento, Pfirrmann]; Placa é "endplate changes/Schmorl nodes".
// at: ponto em mm (RAS) onde o passo põe a mira. SPIDER: centro de cada rótulo da máscara do T2. RSNA: canal.<nível> é o ponto do canal no
//    sagital T2, subD e subE os recessos (subarticulares) direito e esquerdo no axial, meio o meio dos dois recessos (o canal no axial);
//    A origem de cada estudo foi deslocada para o canal em L4-L5. gr: graduação da RSNA (train.csv) dos pontos que não são normais ou leves.
// Passos: k id curto (a marca de visto é '<trilha>.<k>', estável), t título, ex exame, seq série (t2 se faltar), at ponto da mira,
// ver ['dz', id] ou ['anat', título do passo de Anatomia] (sem ver vale o da trilha), test { ok: rótulos ou pontos certos, hint },
// p parágrafos no formato de docs/estilo-ressonancia.md ('- ' item de lista, **negrito**).
const RM_NIIVUE = { src: 'https://cdn.jsdelivr.net/npm/@niivue/niivue@0.69.0/dist/niivue.umd.js', sri: 'sha384-Oyof6MyzZMH1tvMLLYFRQLWZtk9Y/WbiL3wkdXzwaCS82xRXXy9U+kRrkDDAVq6E' };
const RM_G = { modic: 0, up: 1, low: 2, list: 3, hern: 4, narrow: 5, bulge: 6, pf: 7 };
// discos (rótulos) em que a coluna da graduação é maior que zero, ou igual a v
const rmDiscs = (g, col, v) => g.map((r, i) => (v === undefined ? r[RM_G[col]] > 0 : r[RM_G[col]] === v) ? 201 + i : 0).filter(Boolean);
const RM_GROUPS = ['Como ler a ressonância', 'Doenças na ressonância'];
const RM_CRED = {
  spider: 'Imagens: SPIDER, CC BY 4.0 (van der Graaf et al., Sci Data 2024).',
  rsna: 'Imagens: RSNA Lumbar Spine Degenerative Classification Dataset (LumbarDISC), Radiological Society of North America, doi 10.1148/dataset.lsdd.2025.'
};
const [RM_EXAMS, RM_TRACKS] = (() => {
  const g5 = [[0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
  const g45 = [[0, 1, 1, 0, 1, 1, 0, 3], [0, 0, 0, 0, 0, 0, 1, 3], [0, 0, 0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 0, 1, 3], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
  const g10 = [[2, 1, 1, 0, 0, 1, 1, 3], [2, 1, 1, 0, 1, 1, 0, 5], [2, 1, 1, 0, 1, 1, 0, 5], [2, 1, 1, 0, 0, 1, 1, 3], [2, 1, 1, 0, 0, 1, 1, 4], [2, 1, 1, 0, 0, 1, 1, 5], [2, 1, 1, 0, 0, 1, 0, 3]];
  const g200 = [[2, 0, 0, 1, 0, 1, 1, 5], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
  const g136 = [[0, 0, 0, 0, 0, 1, 1, 4], [0, 0, 0, 0, 0, 0, 1, 3], [0, 1, 1, 0, 0, 0, 1, 3], [2, 1, 1, 0, 0, 0, 1, 3], [0, 1, 1, 0, 0, 0, 0, 3], [0, 1, 1, 0, 0, 0, 0, 3], [0, 1, 1, 0, 0, 0, 0, 3]];
  const g81 = [[0, 0, 0, 0, 0, 1, 1, 4], [2, 1, 1, 0, 0, 1, 1, 5], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
  const g50 = [[0, 0, 0, 0, 0, 0, 0, 4], [2, 1, 1, 1, 1, 1, 1, 4], [0, 1, 1, 0, 0, 0, 1, 4], [1, 1, 1, 0, 0, 1, 1, 4], [2, 1, 1, 0, 0, 0, 1, 4], [2, 1, 1, 0, 0, 0, 1, 4], [0, 1, 1, 0, 0, 0, 1, 4], [0, 0, 0, 0, 0, 0, 0, 3]];
  const g142 = [[0, 0, 0, 0, 0, 0, 0, 4], [0, 1, 0, 1, 1, 0, 0, 4], [0, 0, 0, 0, 0, 0, 1, 4], [0, 1, 1, 0, 0, 1, 1, 4], [0, 1, 1, 0, 0, 0, 1, 4], [0, 0, 0, 0, 0, 0, 0, 3], [0, 0, 1, 0, 0, 0, 0, 3]];
  // SPIDER: t1m, o T1 tem máscara própria (senão usa a do T2, mesma grade); space, tem o T2 SPACE
  const sp = (n, t1m, space, g, at) => ({ dir: '' + n, g, at, seqs: Object.assign({ t2: [n + '_t2', n + '_t2_mask'], t1: [n + '_t1', n + (t1m ? '_t1' : '_t2') + '_mask'] }, space && { space: [n + '_t2_SPACE', n + '_t2_SPACE_mask'] }) });
  const rs = (n, at, gr) => ({ dir: 'rsna-' + n, ax: 'ax_t2', seqs: { t2: ['sag_t2'], t1: ['sag_t1'] }, at, gr });
  const E = {
    spider5: sp(5, 0, 1, g5, { 1: [-4.1, -11.4, -52.3], 2: [-6.6, -14.2, -16.9], 100: [-5.0, -41.6, 38.8], 201: [-5.3, -6.0, -71.3], 202: [-5.8, -4.3, -34.4], 203: [-6.6, -9.5, 3.3] }),
    spider45: sp(45, 0, 1, g45, { 1: [25.6, 0.2, -74.6], 2: [25.6, -0.2, -38.7], 100: [24.0, -33.6, 30.5], 201: [25.9, 3.6, -93.4], 202: [25.6, 9.9, -57.8], 203: [25.9, 5.6, -18.7] }),
    spider10: sp(10, 1, 0, g10, { 1: [-18.0, -32.1, 1.8], 2: [-18.7, -26.9, 32.4], 100: [-19.6, -65.2, 89.5], 201: [-17.0, -31.2, -18.1], 202: [-19.6, -18.1, 14.6], 203: [-16.8, -19.8, 48.6] }),
    spider81: sp(81, 1, 1, g81, { 1: [4.1, -11.1, 11.1], 2: [5.1, -8.2, 39.8], 100: [1.1, -26.1, 108.0], 201: [1.9, -8.6, -8.0], 202: [3.9, -1.1, 24.2], 203: [5.5, 2.2, 59.1] }),
    // coluna curva para o lado: cada passo centra no próprio rótulo
    spider50: sp(50, 1, 1, g50, { 1: [-6.4, -12.2, 4.1], 2: [-9.0, -4.6, 36.7], 3: [2.1, -11.8, 68.8], 4: [12.5, -21.8, 98.3], 5: [17.1, -35.1, 129.1], 100: [7.2, -46.5, 91.8], 201: [-7.7, -7.0, -16.0], 202: [-12.7, 2.8, 19.6], 203: [-4.5, 3.7, 55.0], 204: [11.5, -3.6, 86.3], 205: [16.6, -16.6, 119.0], 206: [20.1, -32.3, 149.3] }),
    spider142: sp(142, 0, 1, g142, { 1: [20.4, -3.9, -47.5], 2: [21.3, 12.9, -18.2], 100: [17.7, -23.9, 35.3], 201: [19.8, -0.3, -66.5], 202: [20.7, 17.3, -37.8], 203: [21.6, 26.1, -0.5] }),
    spider200: sp(200, 0, 1, g200, { 1: [-10.0, -12.6, 31.0], 2: [-10.9, -8.4, 65.9], 100: [-12.3, -38.2, 120.0], 201: [-9.3, -11.6, 14.9], 202: [-9.1, 1.2, 46.2], 203: [-10.5, -0.6, 85.1] }),
    spider136: sp(136, 0, 1, g136, { 1: [2.9, 18.2, -43.7], 2: [1.6, 16.2, -9.2], 5: [1.3, -21.5, 93.3], 6: [1.6, -32.6, 124.8], 100: [1.7, -24.6, 61.8], 201: [3.1, 29.4, -63.4], 202: [2.2, 30.4, -25.9], 203: [0.9, 24.6, 12.7], 205: [2.0, -4.1, 82.0], 206: [1.3, -16.1, 114.1], 207: [2.9, -28.6, 144.0] }),
    rsna491250714: rs(491250714, {
      'meio.L4-L5': [0.0, 0.0, 0.1], 'meio.L5-S1': [0.4, -12.8, -31.0],
      'subD.L1-L2': [11.1, -4.9, 105.4], 'subD.L2-L3': [13.0, -0.6, 70.2], 'subD.L3-L4': [8.8, 3.8, 30.8], 'subD.L4-L5': [11.5, 0.4, -0.1], 'subD.L5-S1': [12.3, -12.1, -31.1],
      'subE.L1-L2': [-11.8, -4.0, 105.7], 'subE.L2-L3': [-11.6, 0.1, 66.2], 'subE.L3-L4': [-11.7, 4.2, 31.0], 'subE.L4-L5': [-11.5, -0.4, 0.2], 'subE.L5-S1': [-11.6, -13.5, -30.9],
      'canal.L1-L2': [1.9, -4.9, 102.9], 'canal.L2-L3': [1.0, 0.3, 68.7], 'canal.L3-L4': [0.2, 2.1, 34.9], 'canal.L4-L5': [-0.7, -4.0, 1.6], 'canal.L5-S1': [-1.3, -18.5, -24.2]
    }, {}),
    rsna1435972903: rs(1435972903, {
      'meio.L4-L5': [0.0, -0.1, 0.0], 'meio.L5-S1': [3.6, -3.4, -35.3],
      'subD.L1-L2': [10.1, -8.4, 112.0], 'subD.L2-L3': [10.2, -1.3, 77.0], 'subD.L3-L4': [9.1, 2.4, 37.5], 'subD.L4-L5': [7.7, 0.1, 2.2], 'subD.L5-S1': [13.9, -3.1, -37.4],
      'subE.L1-L2': [-7.7, -10.8, 111.9], 'subE.L2-L3': [-8.3, -3.5, 76.9], 'subE.L3-L4': [-7.2, 0.3, 37.4], 'subE.L4-L5': [-7.7, -0.2, -2.3], 'subE.L5-S1': [-6.8, -3.6, -33.2],
      'canal.L1-L2': [6.6, -13.7, 117.4], 'canal.L2-L3': [6.5, -5.5, 78.7], 'canal.L3-L4': [6.5, -0.8, 42.0], 'canal.L4-L5': [7.0, -3.1, 4.6], 'canal.L5-S1': [7.5, -6.9, -28.9]
    }, { 'canal.L4-L5': 'estenose grave', 'meio.L4-L5': 'estenose grave', 'subE.L4-L5': 'estenose grave' }),
    // axial em bloco inclinado 12°, de L3-L4 a L5-S1 (o bloco reto de cima não foi convertido)
    rsna3489738948: rs(3489738948, {
      'meio.L4-L5': [0.0, 0.1, -0.1], 'meio.L5-S1': [-3.5, -3.9, -28.4],
      'subD.L3-L4': [8.8, 3.5, 32.8], 'subD.L4-L5': [9.3, 0.8, -2.6], 'subD.L5-S1': [6.4, -5.0, -28.3],
      'subE.L3-L4': [-9.2, 0.9, 33.7], 'subE.L4-L5': [-9.3, -0.7, 2.5], 'subE.L5-S1': [-13.3, -2.7, -28.5],
      'canal.L1-L2': [1.8, -11.8, 106.6], 'canal.L2-L3': [1.1, -8.0, 70.9], 'canal.L3-L4': [0.3, -4.2, 34.1], 'canal.L4-L5': [-0.4, -4.8, 0.5], 'canal.L5-S1': [-1.0, -12.9, -28.2]
    }, { 'subD.L4-L5': 'estenose grave' })
  };
  const dz = id => ({ name: DZ.find(d => d.id === id).name, ver: ['dz', id] });
  const T = [
    {
      id: 'base', g: 0, name: 'Exame normal', steps: [
        { k: 'sinal', t: 'Como a ressonância forma a imagem', ex: 'spider5', at: 203, ver: ['anat', 'Tudo em um corte: sagital mediano'], p: [
          'Olhe o quadro Sagital, à esquerda. É a coluna lombar de um paciente real, de perfil, como o corte sagital mediano que você viu no 3D.',
          'Esta coluna é quase normal. O radiologista não marcou hérnia, disco mais baixo nem alteração das vértebras. Ela serve de referência para as outras trilhas.',
          'A ressonância não usa raio X. O aparelho é um ímã forte, que alinha o hidrogênio do corpo. Quase todo esse hidrogênio está na água e na gordura.',
          'Depois o aparelho manda ondas de rádio. Os tecidos devolvem um sinal, e o computador monta a imagem com ele.',
          '**Sinal** é o brilho de cada ponto da imagem. Sinal forte fica claro, e sinal fraco fica escuro. O laudo usa duas palavras para isso:',
          '- **Hipersinal:** mais claro que o tecido de referência.',
          '- **Hipossinal:** mais escuro que o tecido de referência.',
          '"Disco com hipossinal" quer dizer disco mais escuro que o normal.',
          'Na próxima ressonância, procure primeiro o que está claro e o que está escuro, antes de dar nome às estruturas.'] },
        { k: 'orient', t: 'Orientação no sagital', ex: 'spider5', at: 203, ver: ['anat', 'Planos e termos de orientação'], p: [
          'Ache as letras cinza na borda do quadro Sagital: uma no alto e outra à esquerda.',
          'Elas dizem onde fica cada lado do paciente, com os termos que você viu em Anatomia, no passo "Planos e termos de orientação":',
          '- **S:** superior, a cabeça. O lado oposto é I, inferior.',
          '- **P:** posterior, as costas. O lado oposto é A, anterior, a frente.',
          '- **R e L:** direita e esquerda do paciente, do inglês right e left. Aparecem no axial.',
          'Aqui o S está no alto e o P à esquerda. As costas ficam à esquerda e a frente à direita, como no 3D ao lado.',
          'Muitos exames mostram o sagital ao contrário, com a frente à esquerda. Por isso a **orientação** se confere pelas letras, nunca de cabeça.',
          'Na próxima ressonância, procure as letras da borda antes de qualquer outra coisa.'] },
        { k: 't1t2', t: 'T1 e T2', ex: 'spider5', seq: 't1', at: 202, p: [
          'O quadro abriu no T1. Toque em T2, no alto da imagem, e depois volte ao T1. Repare no líquor, a faixa atrás dos discos.',
          '**T1 e T2** são dois jeitos de ajustar as ondas de rádio. Cada um deixa claros tecidos diferentes, e o exame da coluna traz os dois.',
          '- **Líquor e outras águas:** hipossinal no T1, hipersinal no T2.',
          '- **Gordura:** hipersinal no T1. No T2 usado na coluna, também fica clara.',
          '- **Disco normal:** cinza no T1. No T2 o núcleo, cheio de água, fica claro.',
          '- **Medula óssea:** o miolo da vértebra, clara no T1 por causa da gordura.',
          '- **Osso cortical e ligamentos:** escuros nos dois.',
          'Para saber qual está na tela, olhe o líquor. Escuro é T1, claro é T2.',
          'O T2 mostra a água: disco, líquor e edema. O T1 mostra a gordura e a medula óssea.',
          'Na próxima ressonância, procure o líquor primeiro para saber se está no T1 ou no T2.'] },
        { k: 'contar', t: 'Contar as vértebras', ex: 'spider5', at: 201, ver: ['anat', 'Sacro e cóccix'], p: [
          'Clique no primeiro disco acima do sacro, o osso grande e sem cor na parte de baixo.',
          'As cores são os Contornos, que você liga e desliga no alto. Foram feitas pelo banco de imagens SPIDER, que não marca o sacro.',
          'Para dar nome aos níveis, **conte de baixo para cima**, a partir do sacro:',
          '- **L5-S1:** o primeiro disco acima do sacro.',
          '- **L5:** a vértebra logo acima dele.',
          '- **Depois:** L4-L5, L4, L3-L4, e assim por diante.',
          'Contar de cima não funciona aqui, porque o exame não mostra a coluna inteira.',
          'Uma vértebra de transição, como uma L5 presa ao sacro ou uma S1 solta, muda a contagem. Ela só se descarta vendo a coluna inteira.',
          'Na próxima ressonância, procure o sacro e conte os discos a partir dele.'] },
        { k: 'disco', t: 'Corpo vertebral e disco normais', ex: 'spider5', at: 202, ver: ['anat', 'Disco intervertebral'], p: [
          'Clique no disco L4-L5 e depois no corpo de L4, logo acima dele.',
          'Em Anatomia você viu o corpo vertebral e o disco com núcleo e anel. No T2 eles ficam assim:',
          '- **Corpo vertebral:** um bloco cinza com a borda fina e escura, que é o osso cortical.',
          '- **Placas terminais:** a borda de cima e a de baixo do corpo, lisas.',
          '- **Núcleo do disco:** hipersinal, claro, no meio do disco.',
          '- **Anel fibroso:** hipossinal, escuro, em volta do núcleo.',
          'Compare a altura dos discos. Aqui o radiologista não marcou nenhum disco mais baixo, e o núcleo de todos continua claro no T2.',
          'Ele marcou só um abaulamento nos três discos de baixo, que a trilha Hérnia de disco lombar explica.',
          'Na próxima ressonância, procure em cada disco o núcleo claro no T2 e compare a altura com a dos vizinhos.'] },
        { k: 'canal', t: 'Canal, cone medular e cauda equina', ex: 'spider5', at: 100, ver: ['anat', 'Cone medular e cauda equina'], p: [
          'Clique na faixa clara atrás dos corpos vertebrais. No 3D acende o saco dural.',
          'É o **canal vertebral**, que você viu em Anatomia. No T2 o líquor tem hipersinal, por isso o canal fica claro.',
          '- **Raízes da cauda equina:** fios escuros que descem dentro do líquor.',
          '- **Cone medular:** a ponta da medula, cinza, no alto da imagem. No adulto fica perto de L1-L2.',
          'Troque para o T1: o líquor escurece e as raízes quase somem. Por isso o canal se lê no T2.',
          'Na próxima ressonância, procure onde a medula termina e se as raízes descem soltas no líquor.'] },
        { k: 'axial', t: 'O corte axial', ex: 'rsna491250714', at: 'meio.L4-L5', ver: ['anat', 'Tudo em um corte: L4-L5'], p: [
          'Clique no sagital um pouco acima e um pouco abaixo do disco L4-L5. Veja a linha vermelha e o quadro Axial mudarem juntos.',
          'Este é outro paciente, de outro banco de imagens. Nele o radiologista graduou o canal, os recessos e os forames como normais ou leves em todos os níveis.',
          'Este exame tem cortes axiais feitos pelo aparelho, nítidos, mas não tem as cores dos Contornos.',
          'O **axial** é a fatia transversal que você viu em Anatomia, no passo "Tudo em um corte: L4-L5". A linha vermelha do sagital marca a altura dessa fatia.',
          'No axial, a esquerda do paciente aparece à direita da tela, como nos exames de verdade. O R à esquerda da tela marca o lado direito do paciente, e o A no alto marca a frente.',
          'Na altura do disco, da frente para trás:',
          '- **Disco:** a mancha oval cinza na frente.',
          '- **Saco dural:** o líquor claro logo atrás do disco, com as raízes como pontos escuros.',
          '- **Facetas:** as articulações atrás, uma de cada lado.',
          'Na próxima ressonância, procure no sagital a linha que marca a altura do axial.'] },
        { k: 'raiz', t: 'Raízes no axial', ex: 'rsna491250714', at: 'meio.L5-S1', ver: ['anat', 'Qual raiz a hérnia comprime'], p: [
          'O axial abriu no disco L5-S1. Procure um ponto escuro de cada lado, logo atrás do disco e na frente das facetas. Clique em cada um.',
          'São as **raízes de S1**, que você viu em Anatomia, no passo "Qual raiz a hérnia comprime". Elas descem no recesso lateral, o canto do canal entre o disco e a faceta.',
          'No T2 a raiz é escura, e o líquor e a gordura em volta dela são claros. Por isso a raiz se destaca.',
          'Em vez dos Contornos, este exame traz pontos marcados pelo radiologista, como o recesso de cada lado em cada disco. Ao clicar perto de um deles, a caixa abaixo mostra o nome.',
          'Na próxima ressonância, procure as raízes nos dois recessos e compare um lado com o outro.'] },
        { k: 'teste', t: 'Teste: o disco L4-L5', ex: 'spider5', at: 203, test: { ok: [202], hint: 'Conte os discos de baixo para cima a partir do sacro: L5-S1 é o primeiro e L4-L5 é o segundo.' }, p: [
          'Clique no disco L4-L5, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure o sacro e conte de baixo para cima.'] }
      ]
    },
    {
      id: 'ddd', g: 1, ...dz('ddd'), steps: [
        { k: 'pf13', t: 'Disco que perde água: Pfirrmann 1 a 3', ex: 'spider45', at: 203, p: [
          'Clique em cada disco no T2, de baixo para cima, e compare o brilho deles.',
          'Em Doenças, Discopatia degenerativa, você viu no 3D o núcleo perder água e o disco baixar. No T2 a perda de água aparece como perda de brilho: o disco escurece.',
          'O radiologista gradua isso com a **escala de Pfirrmann**, de 1 a 5 (Pfirrmann et al., Spine 2001). Ela olha o brilho no T2, a separação entre núcleo e anel e a altura. Os três primeiros graus:',
          '- **Grau 1:** claro e uniforme, núcleo e anel bem separados, altura normal.',
          '- **Grau 2:** ainda claro, mas não uniforme, às vezes com uma faixa escura no meio. Núcleo e anel separados, altura normal. São os discos do Exame normal.',
          '- **Grau 3:** cinza. A separação entre núcleo e anel fica pouco nítida. Altura normal ou pouco menor.',
          'Neste exame:',
          '- **L5-S1, L4-L5, L3-L4 e L2-L3:** Pfirrmann 3.',
          '- **L1-L2, T12-L1 e T11-T12:** Pfirrmann 2.',
          'Na próxima ressonância, procure no T2 o disco mais escuro que os vizinhos.'] },
        { k: 'pf45', t: 'Pfirrmann 4 e 5', ex: 'spider81', at: 202, p: [
          'Clique no disco L4-L5 e depois no L5-S1, logo abaixo. Compare o brilho e a altura dos dois com os discos de cima.',
          'Este é outro paciente. Os dois últimos graus de **Pfirrmann** (Pfirrmann et al., Spine 2001):',
          '- **Grau 4:** cinza escuro a preto, sem separação entre núcleo e anel. Altura normal ou moderadamente menor.',
          '- **Grau 5:** preto, com o espaço do disco colapsado.',
          'Neste exame:',
          '- **L4-L5:** Pfirrmann 5.',
          '- **L5-S1:** Pfirrmann 4.',
          '- **L3-L4 a T11-T12:** Pfirrmann 2.',
          'Na próxima ressonância, procure o disco preto e baixo: é o grau mais avançado.'] },
        { k: 'altura', t: 'Disco mais baixo e placas terminais', ex: 'spider81', at: 202, ver: ['anat', 'Corpo vertebral'], p: [
          'Clique no disco L4-L5 e compare a altura dele com a do L3-L4, logo acima.',
          'O disco que perde água também baixa, como no 3D. O laudo descreve dois achados junto com o Pfirrmann:',
          '- **Estreitamento:** o disco ficou mais baixo. O laudo também chama de redução do espaço discal.',
          '- **Alteração das placas terminais:** a borda do osso que encosta no disco deixa de ser lisa (visto em Anatomia, no passo "Corpo vertebral").',
          'Neste exame:',
          '- **L4-L5:** estreitamento e alteração das duas placas, a de baixo de L4 e a de cima de L5.',
          '- **L5-S1:** estreitamento, sem alteração das placas.',
          'O L4-L5 tem também Modic 2, assunto da trilha seguinte.',
          'Na próxima ressonância, procure a altura de cada disco e a borda das placas acima e abaixo dele.'] },
        { k: 'teste', t: 'Teste: o disco Pfirrmann 5', ex: 'spider81', at: 203, test: { ok: rmDiscs(g81, 'pf', 5), hint: 'O grau 5 é o disco preto e colapsado. Compare a altura de cada disco com a dos vizinhos.' }, p: [
          'Clique no disco com Pfirrmann 5, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure o disco preto e baixo e dê o nível contando a partir do sacro.'] }
      ]
    },
    {
      // Doenças não tem item próprio para Modic: ele é ensinado em Discopatia degenerativa, para onde a trilha volta
      id: 'modic', g: 1, name: 'Discopatia degenerativa: Modic', ver: ['dz', 'ddd'], steps: [
        { k: 'medula', t: 'Medula óssea no T1', ex: 'spider10', seq: 't1', at: 202, ver: ['anat', 'Corpo vertebral'], p: [
          'O quadro abriu no T1. Toque em Contornos para tirar as cores. Depois clique no corpo de L4 e olhe a faixa de osso logo acima e logo abaixo do disco L4-L5.',
          'Em Doenças, Discopatia degenerativa, você leu que a medula óssea junto às placas muda: são as alterações de Modic. Antes delas, veja a medula no T1.',
          'Em Anatomia você viu que o corpo vertebral tem medula óssea por dentro. No T1, a **medula óssea** do adulto tem gordura e fica clara.',
          'No normal, o corpo inteiro tem o mesmo brilho, como no Exame normal. Faixas de outro brilho junto às placas são uma alteração da medula, assunto do próximo passo.',
          'Na próxima ressonância, procure no T1 se cada corpo vertebral tem o mesmo brilho de cima a baixo.'] },
        { k: 'tipos', t: 'Modic no T1 e no T2', ex: 'spider10', seq: 't1', at: 202, p: [
          'Olhe no T1 as faixas junto às placas, acima e abaixo dos discos. Depois toque em T2 e compare.',
          'Nas alterações de **Modic**, a medula junto à placa vira edema, gordura ou esclerose. A ressonância separa os três tipos pelo sinal (Modic et al., Radiology 1988):',
          '- **Tipo 1, edema:** hipossinal no T1, hipersinal no T2.',
          '- **Tipo 2, gordura:** hipersinal no T1, isossinal ou hipersinal no T2.',
          '- **Tipo 3, esclerose:** hipossinal no T1 e no T2.',
          'Isossinal quer dizer o mesmo brilho do osso em volta.',
          'A regra vem do passo T1 e T2, no Exame normal. Edema é água, escura no T1 e clara no T2. Gordura é clara no T1. Esclerose é osso denso, escuro nos dois.',
          'Na próxima ressonância, procure faixas junto às placas e compare o T1 com o T2 para dar o tipo.'] },
        { k: 'tipo2', t: 'Modic 2: claro no T1', ex: 'spider10', seq: 't1', at: 202, p: [
          'Clique no corpo de L4 e no de L5, junto ao disco L4-L5. Depois alterne T1 e T2.',
          'Neste exame o radiologista graduou **Modic 2** em todos os níveis. As faixas junto às placas ficam claras no T1, como gordura. No T2 ficam claras ou iguais ao resto do osso.',
          '- **L5-S1 a T11-T12:** Modic 2 nos 7 níveis.',
          'Na próxima ressonância, procure faixas claras no T1 junto às placas e confirme o tipo no T2.'] },
        { k: 'tipo1', t: 'Modic 1 ao lado do Modic 2', ex: 'spider50', seq: 't1', at: 204, p: [
          'O quadro abriu no T1, no disco L2-L3. Com os Contornos desligados, olhe as placas acima e abaixo dele. Depois clique no disco L1-L2, logo acima, e compare. Por fim toque em T2.',
          'Este é outro paciente, com os dois tipos no mesmo exame:',
          '- **L2-L3:** Modic 1. A medula junto às placas fica escura no T1 e clara no T2, como edema.',
          '- **L1-L2 e T12-L1:** Modic 2. A medula junto às placas fica clara no T1, como gordura.',
          '- **L4-L5:** Modic 2.',
          'Neste exame a coluna se desvia para o lado. Por isso o corte sagital que passa por L2-L3 não mostra L5-S1.',
          'Na próxima ressonância, procure no T1 se a faixa junto à placa é clara ou escura. Clara é gordura; Escura pede o T2.'] },
        { k: 'teste', t: 'Teste: o disco com Modic 1', ex: 'spider50', seq: 't1', at: 205, test: { ok: rmDiscs(g50, 'modic', 1), hint: 'No Modic 1 a faixa junto às placas é escura no T1 e clara no T2. Compare cada disco nas duas sequências.' }, p: [
          'Clique no disco com Modic 1, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure o Modic no T1 e confirme o tipo no T2.'] }
      ]
    },
    {
      id: 'hernia', g: 1, ...dz('hernia'), steps: [
        { k: 'abaul', t: 'Abaulamento e hérnia', ex: 'spider45', at: 202, p: [
          'Clique no disco L4-L5 e olhe a borda de trás dele.',
          'Em Doenças, Hérnia de disco lombar, você viu no 3D a hérnia e suas formas. A ressonância mostra também o **abaulamento**, que é outra coisa. A diferença está na extensão (Fardon, Spine J 2014):',
          '- **Abaulamento:** o disco passa um pouco da borda das vértebras em mais de um quarto da volta dele.',
          '- **Hérnia:** o material do disco sai num ponto, em menos de um quarto da volta.',
          'No sagital, o abaulamento aparece como a borda de trás do disco um pouco além da linha dos corpos vertebrais. Como ele vai em volta do disco, o axial mostra melhor.',
          'Neste exame:',
          '- **L4-L5:** abaulamento.',
          '- **L2-L3:** abaulamento.',
          '- **L5-S1:** hérnia, no próximo passo.',
          'Na próxima ressonância, procure se o disco sai por igual ou num ponto só.'] },
        { k: 'sag', t: 'A hérnia L5-S1 no sagital', ex: 'spider45', at: 201, p: [
          'Clique no disco L5-S1, o último acima do sacro.',
          'A hérnia que você viu no 3D aparece assim no T2: o material do disco é cinza e avança para trás, em direção ao líquor claro do saco dural. Esse avanço é a **hérnia**.',
          'No corte do meio esta hérnia é discreta. Clique no quadro Axial à direita ou à esquerda do saco dural: o sagital passa para aquele lado.',
          '- **L5-S1:** hérnia, estreitamento, alteração das placas, Pfirrmann 3.',
          'Na próxima ressonância, procure a hérnia também nos cortes sagitais dos lados, não só no do meio.'] },
        { k: 'axial', t: 'A hérnia no axial: T2 de alta resolução', ex: 'spider45', seq: 'space', at: 201, p: [
          'O quadro abriu no T2 alta resolução. Clique no disco L5-S1 no sagital. Depois clique um pouco acima e um pouco abaixo para percorrer o disco no Axial.',
          'Este banco de imagens só tem cortes sagitais. O axial é montado a partir deles.',
          'Esta série se chama **SPACE**: um T2 feito em cortes de 0,9 mm, contra 3,3 mm do T2 comum deste exame. Com cortes finos, o axial montado sai nítido.',
          'Procure o ponto em que a borda de trás do disco avança para o canal. Veja de que lado está a hérnia e se ela encosta no saco dural ou numa raiz. Lembre que a esquerda do paciente fica à direita da tela.',
          'O axial montado é reto, e o disco L5-S1 é inclinado. Um corte só pega parte do disco e parte do osso de L5, por isso percorra o disco acima e abaixo.',
          'Esta série tem cerca de 10 MB e pode demorar a abrir no celular.',
          'Na próxima ressonância, procure a hérnia no axial e diga o lado e o que ela toca.'] },
        { k: 'l45', t: 'Hérnia L4-L5 em outro paciente', ex: 'spider142', seq: 'space', at: 202, p: [
          'O quadro abriu no T2 alta resolução de outro paciente, no disco L4-L5. Clique um pouco acima e um pouco abaixo do disco para percorrê-lo no Axial.',
          'Aqui a **hérnia** está em L4-L5, o nível que você viu no 3D. No axial, o disco avança para o canal e o saco dural fica apertado.',
          '- **L4-L5:** hérnia, listese, alteração da placa acima do disco, Pfirrmann 4.',
          'A listese aparece na trilha Espondilolistese degenerativa.',
          'Na próxima ressonância, procure no axial quanto do saco dural a hérnia ocupa.'] },
        { k: 'teste', t: 'Teste: o disco com hérnia', ex: 'spider142', at: 203, test: { ok: rmDiscs(g142, 'hern'), hint: 'Só um nível deste exame foi graduado com hérnia. Procure o disco que avança para o saco dural e confira o nível contando a partir do sacro.' }, p: [
          'Clique no disco com hérnia, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure a hérnia no sagital e confirme no axial.'] }
      ]
    },
    {
      // Doenças não tem item próprio para o recesso lateral: os passos dele ficam aqui
      id: 'sten', g: 1, ...dz('sten'), steps: [
        { k: 'sag', t: 'O canal apertado no sagital', ex: 'rsna1435972903', at: 'canal.L4-L5', p: [
          'Siga no sagital a faixa clara de líquor atrás dos discos, de cima para baixo, até o disco L4-L5. Depois siga até o L5-S1.',
          'Em Doenças, Estenose do canal lombar, você viu no 3D o disco, as facetas e o ligamento amarelo apertarem o saco dural. No T2 o líquor é claro, então o canal estreito aparece como uma faixa clara que afina.',
          'A mira está no ponto que o radiologista marcou no canal em L4-L5. Neste exame:',
          '- **L4-L5:** estenose grave do canal.',
          '- **L5-S1:** canal normal ou com estenose leve.',
          'Na próxima ressonância, procure no sagital o nível em que a faixa clara do líquor afina.'] },
        { k: 'axial', t: 'O saco dural no axial', ex: 'rsna1435972903', at: 'meio.L4-L5', p: [
          'O axial abriu no disco L4-L5. Clique no sagital no disco L5-S1 para comparar, e depois volte ao L4-L5.',
          'Em L5-S1 o saco dural é redondo, com as raízes soltas no líquor claro.',
          'Em L4-L5 ele fica pequeno, em forma de trevo, e as raízes se juntam. Quase não sobra líquor entre elas. Essa é a **estenose central** no axial.',
          'Em Doenças você viu que o laudo gradua a estenose pela área do saco dural ou pela forma dele (Schizas).',
          'Na próxima ressonância, procure em cada disco se ainda sobra líquor claro entre as raízes.'] },
        { k: 'recesso', t: 'O recesso lateral apertado', ex: 'rsna1435972903', at: 'subE.L4-L5', ver: ['anat', 'Qual raiz a hérnia comprime'], p: [
          'A mira está no recesso lateral esquerdo do disco L4-L5, à direita da tela. Compare com o recesso direito, do outro lado.',
          'O **recesso lateral** é o canto do canal entre o disco e a faceta, que você viu em Anatomia, no passo "Qual raiz a hérnia comprime". A raiz que desce passa por ele.',
          'No recesso apertado, a raiz perde o líquor e a gordura claros em volta dela.',
          'Neste exame:',
          '- **L4-L5:** canal com estenose grave, recesso esquerdo com estenose grave, recesso direito normal ou leve.',
          'Na próxima ressonância, procure os dois recessos de cada disco e compare um lado com o outro.'] },
        { k: 'direito', t: 'Recesso lateral em outro paciente', ex: 'rsna3489738948', at: 'subD.L4-L5', p: [
          'O axial abriu no disco L4-L5 de outro paciente, com a mira no recesso direito, à esquerda da tela. Compare com o recesso esquerdo.',
          'Aqui o **recesso direito** apertado é o único achado. O canal central e o recesso esquerdo estão normais ou leves.',
          '- **L4-L5:** recesso direito com estenose grave.',
          '- **Demais níveis:** normais ou leves.',
          'Os axiais deste exame foram feitos inclinados, acompanhando os discos de baixo, como em muitos exames. Eles cobrem só de L3-L4 a L5-S1.',
          'Na próxima ressonância, procure em cada recesso se a raiz ainda tem líquor claro em volta.'] },
        { k: 'teste', t: 'Teste: o recesso apertado', ex: 'rsna3489738948', at: 'meio.L4-L5', test: { ok: ['subD.L4-L5'], hint: 'No axial, a direita do paciente fica à esquerda da tela. Compare os dois recessos do disco L4-L5.' }, p: [
          'Clique no axial, no recesso lateral com estenose grave. Vale como certo um clique a até 6 mm do ponto que o radiologista marcou. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure os dois recessos de cada disco e diga qual lado aperta.'] }
      ]
    },
    {
      id: 'dspondy', g: 1, ...dz('dspondy'), steps: [
        { k: 'degrau', t: 'O degrau no sagital', ex: 'spider200', at: 201, p: [
          'Siga com os olhos a borda de trás dos corpos vertebrais, de cima para baixo, até o sacro.',
          'Em Doenças, Espondilolistese degenerativa, você viu no 3D uma vértebra escorregar para a frente sobre a de baixo. No sagital isso vira um **degrau** na linha dos corpos.',
          'Neste exame o degrau fica entre L5 e o sacro: L5 está para a frente.',
          'Na próxima ressonância, procure se a borda de trás dos corpos forma uma linha contínua.'] },
        { k: 'nivel', t: 'O disco do nível que escorregou', ex: 'spider200', at: 201, p: [
          'Clique no disco L5-S1 e compare com o L4-L5, logo acima.',
          'Em Doenças você viu que a listese degenerativa vem do desgaste do disco e das facetas. Aqui o disco L5-S1 mostra o **desgaste** que as outras trilhas ensinaram:',
          '- **L5-S1:** listese, Pfirrmann 5, Modic 2, estreitamento, abaulamento.',
          '- **L4-L5 a T11-T12:** Pfirrmann 2, sem outros achados.',
          'O banco de imagens não diz o tipo de listese. Em L5-S1 ela também pode ser ístmica, que você viu em Doenças, em "Espondilólise e listese ístmica".',
          'Na próxima ressonância, procure no nível do degrau o disco, as placas e o Modic.'] },
        { k: 'l45', t: 'Listese em L4-L5', ex: 'spider142', at: 202, p: [
          'Clique no disco L4-L5. Siga a borda de trás de L4 e a de L5.',
          'Este é o paciente da hérnia L4-L5. Ele também tem **listese** nesse nível, o mais comum na listese degenerativa, como você viu em Doenças.',
          '- **L4-L5:** listese, hérnia, alteração da placa acima do disco, Pfirrmann 4.',
          'Na próxima ressonância, procure a listese primeiro em L4-L5, o nível mais comum.'] },
        { k: 'teste', t: 'Teste: o nível da listese', ex: 'spider200', at: 203, test: { ok: rmDiscs(g200, 'list'), hint: 'Procure o degrau na borda de trás dos corpos e clique no disco desse nível.' }, p: [
          'Clique no disco do nível com listese, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure o degrau e dê o nível pelo disco logo abaixo da vértebra que escorregou.'] }
      ]
    },
    {
      // Doenças não tem item próprio: o nódulo aparece no 3D da Cifose de Scheuermann, com uma linha de explicação no cartão do rótulo
      id: 'schmorl', g: 1, name: 'Nódulo de Schmorl', ver: ['dz', 'scheuer'], steps: [
        { k: 'entalhe', t: 'O nódulo no sagital', ex: 'spider136', seq: 'space', at: 206, p: [
          'O quadro abriu no T2 alta resolução, no disco T12-L1. Toque em Contornos para tirar as cores e olhe a placa de cima e a de baixo desse disco.',
          'Em Doenças, Cifose de Scheuermann, o 3D marca o **nódulo de Schmorl**: material do disco que atravessa a placa terminal e entra no corpo vertebral.',
          'No sagital ele aparece como um entalhe na placa. O disco entra no osso, e a borda da placa deixa de ser uma linha reta.',
          'Neste exame o maior está em T12-L1.',
          'Na próxima ressonância, procure entalhes nas placas, acima e abaixo de cada disco.'] },
        { k: 'laudo', t: 'Placa e nódulo no mesmo item', ex: 'spider136', seq: 'space', at: 205, p: [
          'Clique nos discos L1-L2, T12-L1 e T11-T12 e olhe as placas de cada um.',
          'O banco de imagens junta num item só a alteração das placas e o nódulo de Schmorl. Nestes três discos, esse é o único achado:',
          '- **L1-L2:** alteração das placas, Pfirrmann 3.',
          '- **T12-L1:** alteração das placas, Pfirrmann 3.',
          '- **T11-T12:** alteração das placas, Pfirrmann 3.',
          'Neles não há Modic, estreitamento, hérnia nem abaulamento.',
          'Na próxima ressonância, procure se o entalhe vem sozinho ou junto com Modic e disco mais baixo.'] },
        { k: 'teste', t: 'Teste: um disco com nódulo', ex: 'spider136', at: 202, test: { ok: g136.map((r, i) => (r[RM_G.up] || r[RM_G.low]) && !r.slice(3, 7).some(Boolean) && !r[RM_G.modic] ? 201 + i : 0).filter(Boolean), hint: 'Os nódulos deste exame ficam nos discos do alto, perto de T12. Procure o entalhe na placa.' }, p: [
          'Clique num disco com nódulo de Schmorl nas placas, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure entalhes nas placas de todos os discos, não só nos de baixo.'] }
      ]
    }
  ];
  return [E, T];
})();
// marcas de visto válidas, na ordem da aula (o painel do administrador conta com elas)
const RM_IDS = RM_TRACKS.flatMap(t => t.steps.map(s => t.id + '.' + s.k));
