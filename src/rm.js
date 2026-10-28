/* ================= Ressonância: 3 casos reais do SPIDER ================= */
// Imagens: van der Graaf JW et al., Lumbar spine segmentation in MR images: a dataset and a public benchmark, Sci Data 11, 264 (2024);
// doi:10.5281/zenodo.10159290; CC BY 4.0. Recorte, reamostragem e conversão para NIfTI em docs/ressonancia.md; arquivos em dist/rm/<caso>/.
// Máscara, de baixo para cima: 1 a 9 vértebras (1 = L5, conferido na imagem nos 3 casos, contando a partir do sacro), 100 canal, 201 em diante discos (201 = L5-S1).
// g: radiological_gradings.csv do SPIDER, um disco por linha de baixo para cima (IVD label 1 = rótulo 201):
//    [Modic, placa superior, placa inferior, listese, hérnia, estreitamento, abaulamento, Pfirrmann]
// at: centro de cada rótulo em mm (RAS), da máscara do T2; o passo põe a mira nesse ponto (o axial passa por ele).
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
        { t: 'Como ler o sagital T2', at: 203, p: [
          'Este é um corte sagital: a coluna lombar vista de lado, com a cabeça para cima e a frente do corpo à direita da imagem. A linha vermelha horizontal marca a altura do corte mostrado no quadro Axial.',
          'No T2, o que tem muita água fica claro: o líquor em volta das raízes e o núcleo do disco saudável. Osso cortical, ligamentos e anel fibroso ficam escuros. A gordura também fica clara nas sequências T2 rápidas usadas na coluna.',
          'No T1 a água fica escura: líquor e disco perdem o brilho, e a gordura fica clara, inclusive a da medula óssea dos corpos vertebrais. Por isso o T2 mostra bem o líquor e o disco, e o T1 mostra bem a medula óssea.',
          'Clique em qualquer ponto da imagem. O nome da estrutura aparece no painel e ela acende no modelo 3D.'] },
        { t: 'Corpos vertebrais e discos', at: 202, p: [
          'Os corpos vertebrais são os blocos na frente do canal, e entre eles ficam os discos. A contagem começa de baixo: o primeiro disco acima do sacro é L5-S1, e a vértebra logo acima dele é L5.',
          'O SPIDER não segmenta o sacro, por isso ele fica sem cor. Uma vértebra de transição só se descarta vendo a coluna inteira, que este recorte não mostra.',
          'Disco saudável no T2: núcleo claro e homogêneo, anel escuro em volta e altura preservada. É o grau 1 da escala de Pfirrmann, que vai de 1 a 5 (Pfirrmann et al., Spine 2001).',
          'Neste caso o radiologista do SPIDER graduou 6 discos, de L5-S1 a T12-L1, todos em Pfirrmann 1, sem hérnia, abaulamento, estreitamento, alteração de placa terminal, Modic ou listese.'] },
        { t: 'Canal, cauda equina e cone medular', at: 100, p: [
          'Atrás dos corpos vertebrais fica o canal vertebral, claro no T2 por causa do líquor. Na máscara, o rótulo do canal cobre todo o conteúdo do saco dural.',
          'Dentro do líquor, as raízes da cauda equina aparecem como fios escuros que descem em direção aos forames. Acima delas a medula termina no cone medular, que no adulto costuma ficar perto de L1-L2. Procure a ponta da medula no alto do recorte.',
          'Clique no canal: no 3D acende o saco dural, que envolve a cauda equina.'] },
        { t: 'T1 e T2 no mesmo corte', seq: 't1', at: 202, p: [
          'O visualizador passou para o T1 do mesmo exame, no mesmo nível. Alterne T1 e T2 nos botões do topo para comparar o mesmo corte.',
          'No T1 o líquor fica escuro e perde o contraste com as raízes. A medula óssea dos corpos vertebrais, rica em gordura, fica clara. O disco fica cinza nas duas sequências, mas só no T2 o núcleo hidratado se destaca.',
          'A gordura epidural e a do subcutâneo ficam claras no T1, o que ajuda a ver o contorno do saco dural e a gordura em volta das raízes nos forames.'] },
        { t: 'Leitura axial em L4-L5', at: 202, p: [
          'A linha vermelha está no disco L4-L5, e o quadro Axial mostra esse nível. No axial a frente do corpo fica em cima e o canal embaixo, com as articulações facetárias dos dois lados.',
          'Este axial é reconstruído a partir dos cortes sagitais. Neste exame eles têm 4,4 mm de espessura, então a imagem sai em degraus e serve para orientação: disco, saco dural e facetas.',
          'O corte é perpendicular ao eixo do aparelho, e não inclinado ao longo do disco como o axial adquirido no exame. Clique acima ou abaixo no sagital para mover a linha e percorrer o nível.'] },
        { t: 'Teste: o disco L4-L5', at: 203, test: { ok: [202], hint: 'Conte os discos de baixo para cima a partir do sacro: L5-S1 é o primeiro e L4-L5 é o segundo.' }, p: [
          'Clique no disco L4-L5, no sagital ou no axial. A resposta aparece logo abaixo.'] }
      ]
    },
    {
      id: '45', name: 'Caso 2, hérnia L5-S1', g: c2g,
      seqs: { t2: ['45_t2', '45_t2_mask'], t1: ['45_t1', '45_t2_mask'], space: ['45_t2_SPACE', '45_t2_SPACE_mask'] },
      at: { 1: [25.6, 0.2, -74.6], 2: [25.6, -0.2, -38.7], 100: [24.0, -33.6, 30.5], 201: [25.9, 3.6, -93.4], 202: [25.6, 9.9, -57.8], 203: [25.9, 5.6, -18.7] },
      steps: [
        { t: 'O mesmo roteiro em outro paciente', at: 203, p: [
          'Mesmo corte sagital T2, em aparelho de 1,5 T. Este exame tem também um T2 de alta resolução (sequência SPACE), com cortes de 0,9 mm em vez de 3,3 mm, o que permite um axial nítido.',
          'Graduação do SPIDER, de baixo para cima: L5-S1 com hérnia, estreitamento, alteração das placas terminais superior e inferior e Pfirrmann 3. L4-L5 e L2-L3 com abaulamento e Pfirrmann 3. L3-L4 em Pfirrmann 3. L1-L2, T12-L1 e T11-T12 em Pfirrmann 2. Nenhum nível com Modic ou listese.'] },
        { t: 'Discos em Pfirrmann 2 e 3', at: 203, p: [
          'Compare o brilho dos discos. Em Pfirrmann 2 o disco ainda é claro e o núcleo se distingue do anel, às vezes com uma faixa escura horizontal. Em Pfirrmann 3 o disco fica cinza, a separação entre núcleo e anel não é nítida e a altura é normal ou pouco reduzida (Pfirrmann et al., Spine 2001).',
          'Aqui os discos de L5-S1 a L2-L3 foram graduados em Pfirrmann 3, e os de L1-L2 para cima em Pfirrmann 2.',
          'Abaulamento é o disco que passa da borda dos corpos vertebrais de forma difusa. Neste caso ele foi graduado em L4-L5 e L2-L3.'] },
        { t: 'Hérnia em L5-S1', at: 201, p: [
          'A linha vermelha está no disco L5-S1, o último acima do sacro. Neste nível o radiologista graduou hérnia, estreitamento, alteração das placas terminais superior e inferior e Pfirrmann 3.',
          'No corte do meio a hérnia é discreta. Clique no quadro Axial à direita ou à esquerda do saco dural: o sagital passa para esse lado e mostra o disco fora da linha média.',
          'Abaixo do disco fica o sacro, sem cor porque o SPIDER não o segmenta.'] },
        { t: 'Axial em L5-S1 no T2 de alta resolução', seq: 'space', at: 201, p: [
          'O visualizador passou para o T2 de alta resolução. Com cortes de 0,9 mm o axial reconstruído fica nítido: disco, saco dural, facetas e musculatura.',
          'O axial é perpendicular ao eixo do aparelho. Em L5-S1 o disco é inclinado, então o corte pega parte da placa terminal de L5 e não o disco inteiro de uma vez. Clique acima ou abaixo no sagital para percorrer o disco.',
          'Esta série tem cerca de 10 MB e pode demorar a abrir no celular.'] },
        { t: 'T1 no mesmo caso', seq: 't1', at: 201, p: [
          'O radiologista graduou Modic 0 em todos os níveis deste caso, inclusive em L5-S1, onde marcou alteração das placas terminais.',
          'Modic é a mudança de sinal da medula óssea junto à placa terminal, que se lê comparando T1 e T2 (Modic et al., Radiology 1988). O caso 3 mostra um exemplo.',
          'Alterne T1 e T2: no T1 o disco e o líquor ficam escuros e quase se confundem, e no T2 o líquor volta a contrastar com o disco.'] },
        { t: 'Teste: o disco com hérnia', at: 203, test: { ok: rmDiscs(c2g, 'hern'), hint: 'Só um nível deste caso foi graduado com hérnia, o mesmo com estreitamento e alteração das placas terminais.' }, p: [
          'Clique no disco com hérnia, no sagital ou no axial. A resposta aparece logo abaixo.'] }
      ]
    },
    {
      id: '10', name: 'Caso 3, degeneração em vários níveis', g: c3g,
      seqs: { t2: ['10_t2', '10_t2_mask'], t1: ['10_t1', '10_t1_mask'] },
      at: { 1: [-18.0, -32.1, 1.8], 2: [-18.7, -26.9, 32.4], 100: [-19.6, -65.2, 89.5], 201: [-17.0, -31.2, -18.1], 202: [-19.6, -18.1, 14.6], 203: [-16.8, -19.8, 48.6] },
      steps: [
        { t: 'Degeneração em vários níveis', at: 203, p: [
          'Exame em aparelho de 3 T, com 7 discos graduados, de L5-S1 a T11-T12. Todos têm estreitamento, alteração das placas terminais e Modic tipo 2.',
          'L4-L5 e L3-L4 têm hérnia graduada. Os outros níveis, exceto T11-T12, têm abaulamento.',
          'Compare com o caso 1: aqui os discos perderam o brilho no T2 e parte da altura.'] },
        { t: 'Pfirrmann nível a nível', at: 202, p: [
          'Graduação neste caso: Pfirrmann 5 em L4-L5, L3-L4 e T12-L1, Pfirrmann 4 em L1-L2 e Pfirrmann 3 em L5-S1, L2-L3 e T11-T12.',
          'Pfirrmann 4: disco cinza escuro, sem separação entre núcleo e anel, altura normal a moderadamente reduzida. Pfirrmann 5: disco preto e espaço discal colapsado (Pfirrmann et al., Spine 2001).',
          'Clique nos discos e compare a cor e a altura de cada nível com a graduação.'] },
        { t: 'Modic tipo 2', seq: 't1', at: 202, p: [
          'Modic é a mudança de sinal da medula óssea do corpo vertebral junto à placa terminal (Modic et al., Radiology 1988). Tipo 1: escuro no T1 e claro no T2, por edema. Tipo 2: claro no T1 e claro ou igual no T2, por gordura. Tipo 3: escuro nos dois, por esclerose.',
          'O visualizador está no T1. Neste caso o radiologista graduou Modic 2 nos 7 níveis: procure faixas claras nos corpos vertebrais, junto às placas acima e abaixo dos discos.',
          'Alterne para o T2: no tipo 2 as mesmas faixas ficam claras ou iguais ao resto do osso. No tipo 1 elas seriam escuras no T1.'] },
        { t: 'Estreitamento e hérnia', at: 203, p: [
          'Os 7 discos foram graduados com estreitamento: o espaço entre os corpos vertebrais ficou mais baixo. Compare a altura deles com a dos discos do caso 1.',
          'L4-L5 e L3-L4 têm hérnia graduada. No sagital, procure o disco que avança para trás, em direção ao saco dural.',
          'Clique no quadro Axial à direita e à esquerda do canal para trocar o corte sagital e ver o disco fora da linha média.'] },
        { t: 'Axial em L4-L5', at: 202, p: [
          'A linha vermelha está em L4-L5, nível graduado com hérnia, estreitamento, alteração das placas terminais, Modic 2 e Pfirrmann 5.',
          'Neste exame os cortes sagitais têm 4,4 mm, então o axial sai em degraus e serve para orientação. Compare o contorno de trás do disco e o espaço do saco dural com o caso 1 no mesmo nível.'] },
        { t: 'Teste: um disco com Modic', at: 100, test: { ok: rmDiscs(c3g, 'modic'), hint: 'Modic é graduado por disco, nas placas terminais acima e abaixo dele.' }, p: [
          'Clique num disco com Modic, no sagital ou no axial. A resposta aparece logo abaixo.'] }
      ]
    }
  ];
})();
