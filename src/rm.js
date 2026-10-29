/* ================= Ressonância: 3 casos reais do SPIDER ================= */
// Imagens: van der Graaf JW et al., Lumbar spine segmentation in MR images: a dataset and a public benchmark, Sci Data 11, 264 (2024);
// doi:10.5281/zenodo.10159290; CC BY 4.0. Recorte, reamostragem e conversão para NIfTI em docs/ressonancia.md; arquivos em dist/rm/<caso>/.
// Máscara, de baixo para cima: 1 a 9 vértebras (1 = L5, conferido na imagem nos 3 casos, contando a partir do sacro), 100 canal, 201 em diante discos (201 = L5-S1).
// g: radiological_gradings.csv do SPIDER, um disco por linha de baixo para cima (IVD label 1 = rótulo 201):
//    [Modic, placa superior, placa inferior, listese, hérnia, estreitamento, abaulamento, Pfirrmann]
// at: centro de cada rótulo em mm (RAS), da máscara do T2; o passo põe a mira nesse ponto (o axial passa por ele).
// Passos: t título, at rótulo da mira, seq série (t2 se faltar), ver ['dz', id] ou ['anat', título do passo] para o link de volta,
// p parágrafos no formato de docs/estilo-ressonancia.md ('- ' item de lista, **negrito**). A marca de visto é '<caso>.<índice do passo>'.
const RM_NIIVUE = { src: 'https://cdn.jsdelivr.net/npm/@niivue/niivue@0.69.0/dist/niivue.umd.js', sri: 'sha384-Oyof6MyzZMH1tvMLLYFRQLWZtk9Y/WbiL3wkdXzwaCS82xRXXy9U+kRrkDDAVq6E' };
const RM_G = { modic: 0, hern: 4, narrow: 5, bulge: 6, pf: 7 };
// discos (rótulos) em que a coluna da graduação é maior que zero
const rmDiscs = (g, col) => g.map((r, i) => r[RM_G[col]] > 0 ? 201 + i : 0).filter(Boolean);
const RM_CASES = (() => {
  const c1g = [[0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1]];
  const c2g = [[0, 1, 1, 0, 1, 1, 0, 3], [0, 0, 0, 0, 0, 0, 1, 3], [0, 0, 0, 0, 0, 0, 0, 3], [0, 0, 0, 0, 0, 0, 1, 3], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
  const c3g = [[2, 1, 1, 0, 0, 1, 1, 3], [2, 1, 1, 0, 1, 1, 0, 5], [2, 1, 1, 0, 1, 1, 0, 5], [2, 1, 1, 0, 0, 1, 1, 3], [2, 1, 1, 0, 0, 1, 1, 4], [2, 1, 1, 0, 0, 1, 1, 5], [2, 1, 1, 0, 0, 1, 0, 3]];
  return [
    {
      id: '237', name: 'Caso 1, coluna lombar sem alterações', g: c1g,
      seqs: { t2: ['237_t2', '237_t2_mask'], t1: ['237_t1', '237_t1_mask'] },
      at: { 1: [1.9, -52.4, -31.0], 2: [1.0, -46.1, 2.4], 100: [0.8, -72.2, 43.6], 201: [2.5, -54.1, -50.6], 202: [1.6, -39.6, -16.2], 203: [0.3, -37.1, 20.2] },
      steps: [
        { t: 'Como a ressonância forma a imagem', at: 203, ver: ['anat', 'Tudo em um corte: sagital mediano'], p: [
          'Olhe o quadro Sagital, à esquerda. É a coluna lombar de um paciente real, de perfil, como o corte sagital mediano que você viu no 3D.',
          'Esta coluna é praticamente normal: o radiologista não marcou nenhuma alteração nos discos. Ela serve de referência para os outros casos.',
          'A ressonância não usa raio X. O aparelho é um ímã forte, que alinha o hidrogênio do corpo. Quase todo esse hidrogênio está na água e na gordura.',
          'Depois o aparelho manda ondas de rádio. Os tecidos devolvem um sinal, e o computador monta a imagem com ele.',
          '**Sinal** é o brilho de cada ponto da imagem. Sinal forte fica claro, e sinal fraco fica escuro. O laudo usa duas palavras para isso:',
          '- **Hipersinal:** mais claro que o tecido de referência.',
          '- **Hipossinal:** mais escuro que o tecido de referência.',
          '"Disco com hipossinal" quer dizer disco mais escuro que o normal.',
          'Na próxima ressonância, procure primeiro o que está claro e o que está escuro, antes de dar nome às estruturas.'] },
        { t: 'Orientação no sagital', at: 203, ver: ['anat', 'Planos e termos de orientação'], p: [
          'Ache as letras cinza na borda do quadro Sagital: uma no alto e outra à esquerda.',
          'Elas dizem onde fica cada lado do paciente, com os termos que você viu em Anatomia, Planos e termos de orientação:',
          '- **S:** superior, a cabeça. O lado oposto é I, inferior.',
          '- **P:** posterior, as costas. O lado oposto é A, anterior, a frente.',
          '- **R e L:** direita e esquerda do paciente, do inglês right e left. Aparecem no axial.',
          'Aqui o S está no alto e o P à esquerda. As costas ficam à esquerda e a frente à direita, como no 3D ao lado.',
          'Muitos exames mostram o sagital ao contrário, com a frente à esquerda. Por isso a **orientação** se confere pelas letras, nunca de cabeça.',
          'Na próxima ressonância, procure as letras da borda antes de qualquer outra coisa.'] },
        { t: 'T1 e T2', seq: 't1', at: 202, p: [
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
        { t: 'Contar as vértebras', at: 201, ver: ['anat', 'Sacro e cóccix'], p: [
          'Clique no primeiro disco acima do sacro, o osso grande e sem cor na parte de baixo.',
          'As cores são os Contornos, que você liga e desliga no alto. Foram feitas pelo banco de imagens deste curso (SPIDER), que não marca o sacro.',
          'Para dar nome aos níveis, **conte de baixo para cima**, a partir do sacro:',
          '- **L5-S1:** o primeiro disco acima do sacro.',
          '- **L5:** a vértebra logo acima dele.',
          '- **Depois:** L4-L5, L4, L3-L4, e assim por diante.',
          'Contar de cima não funciona aqui, porque o exame não mostra a coluna inteira.',
          'Uma vértebra de transição, como uma L5 presa ao sacro ou uma S1 solta, muda a contagem. Ela só se descarta vendo a coluna inteira.',
          'Na próxima ressonância, procure o sacro e conte os discos a partir dele.'] },
        { t: 'Corpo vertebral e disco normais', at: 202, ver: ['anat', 'Disco intervertebral'], p: [
          'Clique no disco L4-L5 e depois no corpo de L4, logo acima dele.',
          'Em Anatomia você viu o corpo vertebral e o disco com núcleo e anel. No T2 eles ficam assim:',
          '- **Corpo vertebral:** um bloco cinza com a borda fina e escura, que é o osso cortical.',
          '- **Placas terminais:** a borda de cima e a de baixo do corpo, lisas.',
          '- **Núcleo do disco:** hipersinal, claro, no meio do disco.',
          '- **Anel fibroso:** hipossinal, escuro, em volta do núcleo.',
          'Compare a altura dos discos. Aqui nenhum perdeu altura, e o radiologista graduou os 6 discos como **normais**.',
          'Na próxima ressonância, procure em cada disco o núcleo claro no T2 e compare a altura com a dos vizinhos.'] },
        { t: 'Canal, cone medular e cauda equina', at: 100, ver: ['anat', 'Cone medular e cauda equina'], p: [
          'Clique na faixa clara atrás dos corpos vertebrais. No 3D acende o saco dural.',
          'É o **canal vertebral**, que você viu em Anatomia. No T2 o líquor tem hipersinal, por isso o canal fica claro.',
          '- **Raízes da cauda equina:** fios escuros que descem dentro do líquor.',
          '- **Cone medular:** a ponta da medula, cinza, no alto da imagem. No adulto fica perto de L1-L2.',
          'Troque para o T1: o líquor escurece e as raízes quase somem. Por isso o canal se lê no T2.',
          'Na próxima ressonância, procure onde a medula termina e se as raízes descem soltas no líquor.'] },
        { t: 'O corte axial', at: 202, ver: ['anat', 'Tudo em um corte: L4-L5'], p: [
          'Clique no sagital um pouco acima e um pouco abaixo do disco L4-L5. Veja a linha vermelha e o quadro Axial mudarem juntos. Depois toque em Contornos para tirar as cores.',
          'O **axial** é a fatia transversal que você viu em Anatomia, Tudo em um corte: L4-L5. A linha vermelha do sagital escolhe a altura dessa fatia.',
          'No axial, o A no alto marca a frente. O L à esquerda marca o lado esquerdo do paciente. No 3D e na maioria dos exames o esquerdo fica à direita da tela, então confira as letras.',
          'Na altura do disco, da frente para trás:',
          '- **Disco:** a mancha oval na frente.',
          '- **Saco dural:** o líquor claro logo atrás do disco.',
          '- **Facetas:** as articulações atrás, uma de cada lado.',
          'Este exame só tem cortes sagitais de 4,4 mm. O axial é montado a partir deles e sai borrado, em degraus. Use só para se orientar. No Caso 2 você vê um axial nítido.',
          'Na próxima ressonância, procure no sagital a linha que marca a altura do axial.'] },
        { t: 'Teste: o disco L4-L5', at: 203, test: { ok: [202], hint: 'Conte os discos de baixo para cima a partir do sacro: L5-S1 é o primeiro e L4-L5 é o segundo.' }, p: [
          'Clique no disco L4-L5, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure o sacro e conte de baixo para cima.'] }
      ]
    },
    {
      id: '45', name: 'Caso 2, hérnia L5-S1', g: c2g,
      seqs: { t2: ['45_t2', '45_t2_mask'], t1: ['45_t1', '45_t2_mask'], space: ['45_t2_SPACE', '45_t2_SPACE_mask'] },
      at: { 1: [25.6, 0.2, -74.6], 2: [25.6, -0.2, -38.7], 100: [24.0, -33.6, 30.5], 201: [25.9, 3.6, -93.4], 202: [25.6, 9.9, -57.8], 203: [25.9, 5.6, -18.7] },
      steps: [
        { t: 'Disco que perde água: Pfirrmann', at: 203, ver: ['dz', 'ddd'], p: [
          'Clique em cada disco no T2, de baixo para cima, e compare o brilho deles.',
          'Em Doenças, Discopatia degenerativa, você viu o núcleo perder água. No T2 isso aparece como perda de brilho: o disco escurece.',
          'O radiologista gradua isso com a **escala de Pfirrmann**, de 1 a 5 (Pfirrmann et al., Spine 2001). Ela olha o brilho no T2, a separação entre núcleo e anel e a altura. Os três primeiros graus:',
          '- **Grau 1:** claro e uniforme, núcleo e anel bem separados, altura normal. São os discos do Caso 1.',
          '- **Grau 2:** ainda claro, mas não uniforme, às vezes com uma faixa escura no meio. Núcleo e anel separados, altura normal.',
          '- **Grau 3:** cinza. A separação entre núcleo e anel fica pouco nítida. Altura normal ou pouco menor.',
          'Neste caso:',
          '- **L5-S1, L4-L5, L3-L4 e L2-L3:** Pfirrmann 3.',
          '- **L1-L2, T12-L1 e T11-T12:** Pfirrmann 2.',
          'Os graus 4 e 5 aparecem no Caso 3.',
          'Na próxima ressonância, procure no T2 o disco mais escuro que os vizinhos.'] },
        { t: 'Abaulamento e hérnia', at: 202, ver: ['dz', 'hernia'], p: [
          'Clique no disco L4-L5 e olhe a borda de trás dele.',
          'Em Doenças, Hérnia de disco lombar, você viu a hérnia e suas formas. A ressonância mostra também o **abaulamento**, que é outra coisa. A diferença está na extensão (Fardon, Spine J 2014):',
          '- **Abaulamento:** o disco passa um pouco da borda das vértebras em mais de um quarto da volta dele.',
          '- **Hérnia:** o material do disco sai num ponto, em menos de um quarto da volta.',
          'No sagital, o abaulamento aparece como a borda de trás do disco um pouco além da linha dos corpos vertebrais. Como ele vai em volta do disco, o axial mostra melhor.',
          'Neste caso:',
          '- **L4-L5:** abaulamento.',
          '- **L2-L3:** abaulamento.',
          '- **L5-S1:** hérnia, no próximo passo.',
          'Na próxima ressonância, procure se o disco sai por igual ou num ponto só.'] },
        { t: 'A hérnia L5-S1 no sagital', at: 201, ver: ['dz', 'hernia'], p: [
          'Clique no disco L5-S1, o último acima do sacro.',
          'É a mesma doença que você viu no 3D. No T2 o material do disco é cinza e avança para trás, em direção ao líquor claro do saco dural. Esse avanço é a **hérnia**.',
          'No corte do meio esta hérnia é discreta. Clique no quadro Axial à direita ou à esquerda do saco dural: o sagital passa para aquele lado.',
          '- **L5-S1:** hérnia, Pfirrmann 3. Os outros achados deste nível vêm no passo 6.',
          'Na próxima ressonância, procure a hérnia também nos cortes sagitais dos lados, não só no do meio.'] },
        { t: 'O axial nítido: T2 de alta resolução', seq: 'space', at: 203, ver: ['anat', 'Tudo em um corte: L4-L5'], p: [
          'O quadro abriu no T2 alta resolução, no disco L3-L4. Toque em Contornos para tirar as cores e olhe o Axial.',
          'Esta série se chama **SPACE**: um T2 feito em cortes de 0,9 mm, contra 3,3 mm do T2 comum deste exame. Com cortes finos, o axial montado sai nítido.',
          'É o corte que você viu em Anatomia, Tudo em um corte: L4-L5. Na altura do disco, da frente para trás:',
          '- **Disco:** a mancha oval cinza na frente.',
          '- **Saco dural:** o círculo claro de líquor atrás do disco.',
          '- **Raízes:** pontos escuros dentro do saco dural e nos cantos dele.',
          '- **Facetas:** as articulações atrás, uma de cada lado.',
          '- **Músculos:** as massas cinza atrás e dos lados.',
          'Esta série tem cerca de 10 MB e pode demorar a abrir no celular.',
          'Na próxima ressonância, procure esses itens no axial de cada disco, sempre na mesma ordem.'] },
        { t: 'A hérnia no axial', seq: 'space', at: 201, ver: ['dz', 'hernia'], p: [
          'Clique no disco L5-S1 no sagital. Depois clique um pouco acima e um pouco abaixo para percorrer o disco no Axial.',
          'Compare com o L3-L4 do passo anterior. Procure o ponto em que a borda de trás do disco avança para o canal. Veja de que lado está essa **hérnia** e se ela encosta no saco dural ou numa raiz.',
          'O axial aqui é reto, e o disco L5-S1 é inclinado. Um corte só pega parte do disco e parte do osso de L5, por isso percorra o disco acima e abaixo.',
          'Na próxima ressonância, procure a hérnia no axial e diga o lado e o que ela toca.'] },
        { t: 'Placas terminais e disco mais baixo', at: 201, ver: ['anat', 'Corpo vertebral'], p: [
          'Clique no disco L5-S1 e compare a altura dele com a do L4-L5, logo acima.',
          'Dois achados novos aparecem neste nível:',
          '- **Estreitamento:** o disco ficou mais baixo. O laudo também chama de redução do espaço discal.',
          '- **Alteração das placas terminais:** a borda do osso que encosta no disco, que você viu em Anatomia, Corpo vertebral, deixa de ser lisa.',
          'Neste caso:',
          '- **L5-S1:** estreitamento e alteração das duas placas, a de baixo de L5 e a de cima do sacro.',
          'Nenhum nível deste caso tem Modic. O Caso 3 mostra como ele aparece.',
          'Na próxima ressonância, procure a altura de cada disco e a borda das placas acima e abaixo dele.'] },
        { t: 'Teste: o disco com hérnia', at: 203, test: { ok: rmDiscs(c2g, 'hern'), hint: 'Só um nível deste caso foi graduado com hérnia, o mesmo com estreitamento e alteração das placas terminais.' }, p: [
          'Clique no disco com hérnia, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure a hérnia no sagital e confirme no axial.'] }
      ]
    },
    {
      id: '10', name: 'Caso 3, degeneração em vários níveis', g: c3g,
      seqs: { t2: ['10_t2', '10_t2_mask'], t1: ['10_t1', '10_t1_mask'] },
      at: { 1: [-18.0, -32.1, 1.8], 2: [-18.7, -26.9, 32.4], 100: [-19.6, -65.2, 89.5], 201: [-17.0, -31.2, -18.1], 202: [-19.6, -18.1, 14.6], 203: [-16.8, -19.8, 48.6] },
      steps: [
        { t: 'Medula óssea e placas no T1', seq: 't1', at: 202, ver: ['anat', 'Corpo vertebral'], p: [
          'O quadro abriu no T1. Clique no corpo de L4 e olhe a faixa de osso logo acima e logo abaixo do disco L4-L5.',
          'Este é outro paciente, com desgaste em vários níveis.',
          'Em Anatomia você viu que o corpo vertebral tem medula óssea por dentro e placas terminais em cima e embaixo. No T1, a **medula óssea** do adulto tem gordura e fica clara.',
          'No normal, o corpo inteiro tem o mesmo brilho, como no Caso 1. Faixas de outro brilho junto às placas são uma alteração da medula, assunto do próximo passo.',
          'Na próxima ressonância, procure no T1 se cada corpo vertebral tem o mesmo brilho de cima a baixo.'] },
        { t: 'Modic no T1 e no T2', seq: 't1', at: 202, ver: ['dz', 'ddd'], p: [
          'Olhe no T1 as faixas junto às placas, acima e abaixo dos discos. Depois toque em T2 e compare.',
          'Em Doenças, Discopatia degenerativa, você viu as alterações de **Modic**: a medula junto à placa vira edema, gordura ou esclerose. A ressonância separa os três tipos pelo sinal (Modic et al., Radiology 1988):',
          '- **Tipo 1, edema:** hipossinal no T1, hipersinal no T2.',
          '- **Tipo 2, gordura:** hipersinal no T1, isossinal ou hipersinal no T2.',
          '- **Tipo 3, esclerose:** hipossinal no T1 e no T2.',
          'Isossinal quer dizer o mesmo brilho do osso em volta.',
          'A regra vem do passo T1 e T2. Edema é água, escura no T1 e clara no T2. Gordura é clara no T1. Esclerose é osso denso, escuro nos dois.',
          'Na próxima ressonância, procure faixas junto às placas e compare o T1 com o T2 para dar o tipo.'] },
        { t: 'Modic 2 neste caso', seq: 't1', at: 202, p: [
          'Clique no corpo de L4 e no de L5, junto ao disco L4-L5. Depois alterne T1 e T2.',
          'Neste caso o radiologista graduou **Modic 2** em todos os níveis. As faixas junto às placas ficam claras no T1, como gordura. No T2 ficam claras ou iguais ao resto do osso.',
          '- **L5-S1 a T11-T12:** Modic 2 nos 7 níveis.',
          'Se fosse tipo 1, as mesmas faixas ficariam escuras no T1.',
          'Na próxima ressonância, procure faixas claras no T1 junto às placas e confirme o tipo no T2.'] },
        { t: 'Pfirrmann 4 e 5', at: 202, ver: ['dz', 'ddd'], p: [
          'Clique no disco L4-L5 e depois no L5-S1, logo abaixo. Compare o brilho e a altura dos dois.',
          'No Caso 2 você viu os graus 1 a 3 de **Pfirrmann**. Os dois últimos (Pfirrmann et al., Spine 2001):',
          '- **Grau 4:** cinza escuro a preto, sem separação entre núcleo e anel. Altura normal ou moderadamente menor.',
          '- **Grau 5:** preto, com o espaço do disco colapsado.',
          'Neste caso:',
          '- **L4-L5, L3-L4 e T12-L1:** Pfirrmann 5.',
          '- **L1-L2:** Pfirrmann 4.',
          '- **L5-S1, L2-L3 e T11-T12:** Pfirrmann 3.',
          'Na próxima ressonância, procure o disco preto e baixo: é o grau mais avançado.'] },
        { t: 'Vários níveis, um por linha', at: 203, p: [
          'Clique em cada disco, de baixo para cima, e confira com a lista.',
          'Com **desgaste em vários níveis**, o laudo descreve um nível por linha. Com o que você já aprendeu, dá para ler esta lista inteira:',
          '- **L5-S1:** abaulamento, estreitamento, Pfirrmann 3.',
          '- **L4-L5:** hérnia, estreitamento, Pfirrmann 5.',
          '- **L3-L4:** hérnia, estreitamento, Pfirrmann 5.',
          '- **L2-L3:** abaulamento, estreitamento, Pfirrmann 3.',
          '- **L1-L2:** abaulamento, estreitamento, Pfirrmann 4.',
          '- **T12-L1:** abaulamento, estreitamento, Pfirrmann 5.',
          '- **T11-T12:** estreitamento, Pfirrmann 3.',
          'Todos os níveis têm também alteração das placas terminais e Modic 2. Nenhum tem listese.',
          'Este exame não tem o T2 de alta resolução. O axial é montado a partir de cortes sagitais de 4,4 mm e sai borrado: use só para achar o nível, não para ver detalhe.',
          'Na próxima ressonância, procure ler nível a nível, de baixo para cima, sem pular nenhum.'] },
        { t: 'Teste: um disco com Modic', at: 100, test: { ok: rmDiscs(c3g, 'modic'), hint: 'Modic é graduado por disco, nas placas terminais acima e abaixo dele.' }, p: [
          'Clique num disco com Modic, no sagital ou no axial. A resposta aparece logo abaixo.',
          'Na próxima ressonância, procure o Modic no T1 e confirme o tipo no T2.'] }
      ]
    }
  ];
})();
