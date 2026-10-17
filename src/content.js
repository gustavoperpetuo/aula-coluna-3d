/* ================= Conteúdo da aula ================= */
const CHAPTERS = ['Visão geral', 'A vértebra típica', 'Regiões', 'Disco e articulações', 'Ligamentos', 'Medula e nervos', 'Vasos', 'Síntese'];

const STEPS = [
  /* 1. Visão geral */
  {
    ch: 0, title: 'A coluna inteira',
    how: 'Como usar: o texto guia a aula e o modelo ao lado acompanha cada passo. Gire e aproxime o 3D, clique ou toque numa estrutura para ver o nome, use os links "Localizar no 3D" no fim de cada passo e a régua de níveis (C1 a Co) para ir direto a uma vértebra. As ferramentas no topo do modelo (no celular, o botão "Camadas e cortes") ligam e desligam ossos, discos, ligamentos, nervos e vasos e abrem os cortes.',
    body: ['A coluna tem em geral 33 vértebras em cinco regiões: 7 cervicais (C1 a C7), 12 torácicas (T1 a T12), 5 lombares (L1 a L5), 5 sacrais fundidas no sacro e 3 a 5 coccígeas fundidas no cóccix. As 24 vértebras acima do sacro são móveis e se ligam por 23 discos, do C2-C3 ao L5-S1. Entre o crânio e C1, e entre C1 e C2, não há disco.',
      'Ela tem três funções: sustentar o tronco e passar a carga para a pelve, permitir movimento e proteger a medula e as raízes. Quase toda doença da coluna é a falha de uma delas: dor mecânica, deformidade ou instabilidade, e compressão neural.'],
    pro: 'Vértebras e discos crescem de cima para baixo porque a carga aumenta. A placa terminal de L4 tem cerca de 15 cm², quatro a cinco vezes a de C5, perto de 3,4 cm² (média em homens, Kishimoto, J Orthop Res 2016). A lombar carrega mais peso e se move mais, e por isso concentra a maior parte das doenças degenerativas.',
    cam: { t: 'center', az: 32, el: 8, d: 158 }, show: 'bone disc rib', tint: true,
    labels: [['C1', 'C1 atlas'], ['C7', 'C7'], ['T1', 'T1'], ['T12', 'T12'], ['L1', 'L1'], ['L5', 'L5'], ['sacrum', 'Sacro'], ['coccyx', 'Cóccix']]
  },
  {
    ch: 0, title: 'Curvaturas e alinhamento sagital',
    body: ['De lado, a coluna desenha quatro curvas. Lordose cervical (convexa para frente, de C2 a C7), cifose torácica (convexa para trás, de T4 a T12), lordose lombar (de L1 a S1) e cifose sacral. A lordose cervical varia muito entre pessoas sem sintomas, com média perto de 13° (Guo, J Orthop Surg Res 2018), e um pescoço retificado nem sempre é doença. A cifose torácica fica em geral entre 20° e 45°, e a lordose lombar entre 40° e 70°, acompanhando a incidência pélvica. As curvas funcionam como mola e mantêm a cabeça sobre a pelve com pouco gasto muscular.',
      'A forma da pelve determina quanta lordose a pessoa precisa. A incidência pélvica (IP) é um ângulo anatômico que não muda depois do crescimento, em média perto de 52°. Ela é a soma de dois ângulos que mudam com a postura: a inclinação sacral (IS), ângulo do platô de S1 com a horizontal, e a versão pélvica (VP), que mede quanto a pelve está girada para trás (IP = VP + IS). Quem tem IP alta precisa de mais lordose lombar.'],
    pro: 'Na classificação SRS-Schwab (Schwab, Spine 2012), o alinhamento é considerado normal com IP menos lordose lombar abaixo de 10°, versão pélvica abaixo de 20° e eixo vertical sagital (SVA) abaixo de 4 cm. O SVA é a distância horizontal entre um fio de prumo que desce do centro de C7 e o canto de trás do platô de S1. Na cirurgia de deformidade, aceita-se como meta SVA abaixo de 5 cm, perto do limiar a partir do qual a incapacidade aumenta. Uma artrodese que ignora a IP tende a gerar dor e desgaste do segmento vizinho.',
    cam: { t: 'center', az: 90, el: 2, d: 150 }, show: 'bone disc',
    labels: [['cam:C4', 'Lordose cervical'], ['cam:T7', 'Cifose torácica'], ['cam:L3', 'Lordose lombar'], ['cam:sacrum', 'Cifose sacral'], ['S1.endplate', 'Platô de S1 (inclinação sacral)']]
  },
  {
    ch: 0, title: 'Planos e termos de orientação',
    body: ['Anterior ou ventral é para frente; Posterior ou dorsal, para trás. Cranial é para cima, caudal para baixo. Medial é perto da linha média; Lateral, longe dela. Três planos de imagem: sagital (o perfil, como a ressonância de lado), coronal (de frente) e axial (a fatia transversal, como olhar a vértebra de cima).',
      'O 3D aqui está em corte sagital: metade direita da coluna, vista de dentro. Em "Camadas e cortes", no canto do modelo, você alterna entre corte sagital e axial a qualquer momento.'],
    pro: 'Laudos usam o nível do disco (L4-L5) para hérnia e estenose e o nível da vértebra (L1) para fratura e tumor. Ler os dois sem confundir é o primeiro passo para conversar com um cirurgião de coluna.',
    cam: { t: 'L1', az: 90, el: 4, d: 70 }, show: 'bone disc lig neuro', clip: 'sag',
    labels: [['L1.body', 'Corpo de L1'], ['disc.L2-L3', 'Disco L2-L3'], ['lumbEnl', 'Medula'], ['L2.sp', 'Espinhoso de L2 (posterior)'], ['ALL', 'LLA (anterior)']]
  },
  /* 2. A vértebra típica */
  {
    ch: 1, title: 'Corpo vertebral',
    body: ['O corpo é o cilindro anterior que carrega o peso. Por fora há uma casca fina de osso cortical; Por dentro, osso trabecular com medula vermelha, organizado em traves verticais e horizontais. Em cima e embaixo ficam as placas terminais, que fazem a interface com o disco.',
      'A borda das placas forma o anel apofisário, mais denso, onde se prendem as fibras externas do disco. É dali que nascem os osteófitos na degeneração.'],
    pro: 'O osso trabecular é o primeiro a perder massa na osteoporose. Daí a fratura osteoporótica típica ser do corpo, em cunha, e o parafuso pedicular perder fixação em osso porótico, o que leva a cimentar o parafuso ou usar implantes expansíveis.',
    cam: { t: 'L4', az: 38, el: 14, d: 26 }, show: 'bone', focus: ['L4'],
    labels: [['L4.body', 'Corpo vertebral'], ['L4.endplate', 'Placa terminal superior'], ['L4.ped.L', 'Pedículo'], ['L4.sp', 'Processo espinhoso']]
  },
  {
    ch: 1, title: 'Arco neural: pedículos e lâminas',
    body: ['Atrás do corpo nasce o arco neural. Os pedículos são duas colunas curtas que ligam o corpo ao arco; As lâminas são as placas que fecham o arco por trás. Corpo, pedículos e lâminas cercam o forame vertebral. Empilhados, os forames formam o canal vertebral.',
      'O pedículo é a parte mais resistente da vértebra e a ponte entre a coluna anterior e a posterior. Ele sai da metade superior do corpo, o que deixa embaixo dele o espaço do forame intervertebral.'],
    pro: 'O parafuso pedicular atravessa o pedículo até o corpo. Larguras aproximadas: 8 a 9 mm em L1, até 15 a 18 mm em L5; Na torácica média (T4 a T6), 4 a 5 mm, o que limita o diâmetro do parafuso. A convergência medial cresce de cerca de 10° em L1 para 25° a 30° em L5. Há grande variação individual, por isso o planejamento usa tomografia.',
    cam: { t: 'L4', az: 160, el: 52, d: 24 }, show: 'bone', focus: ['L4'],
    labels: [['L4.ped.L', 'Pedículo'], ['L4.lam.L', 'Lâmina'], ['L4.canal', 'Forame vertebral'], ['L4.body', 'Corpo']]
  },
  {
    ch: 1, title: 'Processos: alavancas e articulações',
    body: ['Do arco saem sete processos. O espinhoso, que se palpa nas costas, e os dois transversos servem de alavanca para músculos e ligamentos. Os outros quatro são articulares: dois superiores e dois inferiores. O articular inferior de uma vértebra encaixa no superior da vértebra de baixo e forma a articulação facetária (zigoapofisária), uma articulação sinovial verdadeira.',
      'Na lombar existem ainda o processo mamilar, no articular superior, onde se prende o multífido, o principal estabilizador profundo, e o acessório, na base do transverso, onde se prende parte do longuíssimo.'],
    pro: 'A parte do arco entre o articular superior e o inferior é a pars interarticularis. É estreita e sofre fratura por estresse em hiperextensão repetida: a espondilólise, base da espondilolistese ístmica de L5.',
    cam: { t: 'L4', az: 128, el: 14, d: 30 }, show: 'bone', focus: ['L3', 'L4', 'L5'],
    labels: [['L4.sp', 'Espinhoso'], ['L4.tp.L', 'Transverso'], ['L4.sap.L', 'Articular superior'], ['L4.iap.L', 'Articular inferior'], ['L4.pars.L', 'Pars interarticularis'], ['L4.mam.L', 'Mamilar']]
  },
  {
    ch: 1, title: 'Forames: por onde passam medula e nervos',
    body: ['O forame vertebral é o buraco central de cada vértebra. O forame intervertebral (ou de conjugação) é a janela lateral entre duas vértebras. Seus limites: pedículo de cima e de baixo, disco e corpo na frente, faceta e ligamento amarelo atrás. Por ele saem a raiz e seu gânglio, e entram artérias e veias.',
      'As paredes do forame são disco, faceta e ligamento. As mesmas três estruturas formam o recesso lateral, o canto do canal logo antes do forame. Qualquer uma que cresça (hérnia, artrose, ligamento espesso) aperta a raiz ali ou no forame, e esse é o mecanismo da maior parte das ciatalgias.'],
    pro: 'Canal lombar: diâmetro anteroposterior abaixo de 12 mm caracteriza estenose relativa e abaixo de 10 mm, absoluta. Canal cervical: o normal fica perto de 17 mm; Abaixo de 13 mm é estenose relativa e abaixo de 10 mm, absoluta (Wheeless, Textbook of Orthopaedics).',
    cam: { t: 'L4', az: 92, el: 6, d: 30 }, show: 'bone disc neuro', focus: ['L3', 'L4', 'L5'],
    labels: [['foramen.L4-L5.L', 'Forame intervertebral L4-L5'], ['root.L4.L', 'Raiz L4 saindo'], ['drg.L4.L', 'Gânglio da raiz dorsal'], ['L5.ped.L', 'Pedículo de L5'], ['disc.L4-L5', 'Disco']]
  },
  /* 3. Regiões */
  {
    ch: 2, title: 'C1 e C2: a junção craniovertebral',
    body: ['C1 (atlas) não tem corpo: é um anel com arco anterior, arco posterior e duas massas laterais que recebem os côndilos do occipital. A articulação occipito-C1 faz o movimento de "sim". C2 (áxis) tem o dente, ou odontoide, um pino que sobe dentro do anel de C1 e fica preso pelo ligamento transverso. C1 gira em torno do dente: é o movimento de "não".',
      'Cerca de metade da rotação do pescoço acontece entre C1 e C2.'],
    pro: 'Regra dos terços de Steel: no nível de C1, o canal é ocupado um terço pelo dente, um terço pela medula e um terço é espaço livre. Essa reserva permite algum deslocamento sem lesão medular. O intervalo atlanto-dental normal no adulto é de até 3 mm.',
    cam: { t: 'C1', az: 30, el: 38, d: 17 }, show: 'bone lig vessel', focus: ['C1', 'C2', 'Occ'], hide: ['cca', 'plex', 'nuchal', 'bvv'],
    labels: [['C1.ant', 'Arco anterior de C1'], ['C1.post', 'Arco posterior'], ['C1.lm.L', 'Massa lateral'], ['C2.dens', 'Dente de C2'], ['TAL', 'Ligamento transverso'], ['va.V3.L', 'Artéria vertebral']]
  },
  {
    ch: 2, title: 'Cervical subaxial: C3 a C7',
    body: ['Corpos pequenos e largos, com processos unciformes nas bordas laterais de cima que formam as articulações uncovertebrais (de Luschka). Os transversos têm o forame transverso, por onde sobe a artéria vertebral de C6 a C1. Os espinhosos são curtos e bífidos, exceto C7, longo e palpável na base do pescoço (vértebra proeminente).',
      'As facetas ficam inclinadas cerca de 45° em relação ao plano horizontal. Isso permite flexão, extensão, inclinação e rotação combinadas: é a região mais móvel.'],
    pro: 'Osteófitos uncovertebrais na frente e facetários atrás estreitam o forame e são a causa clássica de radiculopatia cervical. C5-C6 e C6-C7 são os níveis mais afetados. A raiz cervical sai acima da vértebra de mesmo número: hérnia C5-C6 comprime a raiz C6.',
    cam: { t: 'C5', az: 42, el: 12, d: 26 }, show: 'bone disc vessel', focus: ['C3', 'C4', 'C5', 'C6', 'C7'], hide: ['cca', 'bct', 'sca', 'plex', 'bvv'],
    labels: [['C5.unc.L', 'Processo unciforme'], ['C5.tf.L', 'Forame transverso'], ['C4.lm.L', 'Massa lateral (facetas)'], ['C7.sp', 'C7 proeminente'], ['va.V2.L', 'Artéria vertebral']]
  },
  {
    ch: 2, title: 'Torácica e costelas',
    body: ['Corpos em forma de coração, com fóveas para a cabeça das costelas, e transversos com fóvea para o tubérculo costal. Cada costela típica se apoia em dois corpos e no disco entre eles, além do transverso. Essa armação deixa a torácica rígida: é a região que menos se move.',
      'Os espinhosos são longos e inclinados para baixo como telhas. O canal é estreito e redondo, com pouca folga para a medula.'],
    pro: 'As facetas no plano coronal permitiriam rotação, mas as costelas a limitam. Pedículo fino, canal estreito e irrigação medular mais pobre entre T4 e T9 tornam as lesões aqui mais graves e os parafusos mais delicados.',
    cam: { t: 'T7', az: 132, el: 16, d: 52 }, show: 'bone disc rib', focus: ['T5', 'T6', 'T7', 'T8', 'T9'],
    labels: [['cvj.7.L', 'Articulação costovertebral'], ['T7.tp.L', 'Transverso (costotransversária)'], ['T6.sp', 'Espinhoso em telha'], ['rib.7.L', 'Costela 7']]
  },
  {
    ch: 2, title: 'Lombar',
    body: ['Os maiores corpos, em forma de rim, feitos para carga. Pedículos grossos, transversos finos e longos (o de L3 é o maior) e espinhosos largos em forma de machadinha. As facetas ficam quase no plano sagital: muita flexão e extensão, pouca rotação.',
      'L5 é mais alto na frente do que atrás, o que ajuda a formar a lordose lombossacral. L4-L5 e L5-S1 suportam mais carga e mais movimento e concentram hérnias, degeneração e espondilolistese.'],
    pro: 'Cada segmento lombar faz em média 12° a 18° de flexo-extensão, um pouco mais em L4-L5 e L5-S1 (Pearcy, Spine 1984; Dvorak, Spine 1991), e só 1° a 2° de rotação para cada lado. Rotação forçada sob carga, travada pelas facetas, é transferida para o anel do disco.',
    cam: { t: 'L3', az: 36, el: 12, d: 40 }, show: 'bone disc', focus: ['L1', 'L2', 'L3', 'L4', 'L5'],
    labels: [['L3.tp.L', 'Transverso de L3'], ['L4.sp', 'Espinhoso em machadinha'], ['L5.body', 'L5 em cunha'], ['L2.body', 'Corpo em rim']]
  },
  {
    ch: 2, title: 'Sacro e cóccix',
    body: ['Cinco vértebras fundidas formam o sacro, encaixado entre os ilíacos pelas articulações sacroilíacas. A borda anterior do platô de S1 é o promontório; Ao lado de S1 ficam as asas sacrais. Quatro pares de forames anteriores dão saída às raízes S1 a S4. Embaixo ficam o hiato sacral e o cóccix.',
      'O platô de S1 é inclinado para frente. Essa inclinação sacral é a base sobre a qual toda a lordose se constrói.'],
    pro: 'A asa e o pedículo de S1 recebem os parafusos da base de uma artrodese lombar. Em fusões longas a base é reforçada com fixação no ilíaco (parafusos S2-alar-ilíacos), porque S1 sozinho tende a soltar.',
    cam: { t: 'sacrum', az: 24, el: 18, d: 30 }, show: 'bone disc neuro', focus: ['L5', 'S', 'Co'],
    labels: [['promontory', 'Promontório'], ['ala.L', 'Asa sacral'], ['sf.2.L', 'Forame sacral anterior'], ['root.S1.L', 'Raiz S1'], ['coccyx', 'Cóccix']]
  },
  /* 4. Disco e articulações */
  {
    ch: 3, title: 'Disco intervertebral',
    body: ['Três partes. O núcleo pulposo é um gel central rico em proteoglicanos e água (80% a 88% no jovem) que distribui a pressão em todas as direções. O anel fibroso tem 15 a 25 lamelas concêntricas de colágeno, com fibras inclinadas cerca de 30° em relação ao plano do disco e direção alternada a cada lamela, como um pneu radial. As placas terminais cartilaginosas fazem a ligação com o osso.',
      'O disco é a maior estrutura sem vasos do corpo. Recebe nutrientes por difusão pelas placas terminais, e só o terço externo do anel tem nervos. Quando a nutrição falha, o núcleo desidrata e a degeneração começa.',
      'O corte axial do modelo é visto dos pés do paciente, como na ressonância: a frente fica para cima e o lado esquerdo do paciente aparece à direita da tela.'],
    pro: 'Na ressonância em T2, disco saudável é claro (água) e o degenerado fica escuro, o "disco preto", graduado de I a V por Pfirrmann. Fissuras no anel posterior são a porta de saída da hérnia.',
    cam: { t: 'ax.L4-L5', az: 0, el: -78, d: 21 }, show: 'bone disc lig neuro vessel', clip: 'ax:L4-L5',
    labels: [['nuc.L4-L5', 'Núcleo pulposo'], ['disc.L4-L5', 'Anel fibroso'], ['PLL', 'LLP'], ['aorta.bif', 'Bifurcação da aorta']]
  },
  {
    ch: 3, title: 'Articulações facetárias',
    body: ['Cada nível tem três articulações: o disco na frente e duas facetas atrás, o complexo triarticular. As facetas são sinoviais, com cartilagem, cápsula e líquido, e guiam o movimento. A orientação muda por região: cerca de 45° na cervical, quase verticais e coronais na torácica, verticais e voltadas para o plano sagital na lombar.',
      'Em pé, as facetas lombares carregam algo entre 3% e 25% da carga axial. Com o disco degenerado e baixo essa fatia sobe, e a artrose facetária aparece.'],
    pro: 'Cada faceta é inervada pelo ramo medial do ramo dorsal do mesmo nível e do nível de cima. É esse nervo que se bloqueia para diagnóstico e se ablaciona por radiofrequência no tratamento da dor facetária.',
    cam: { t: 'L4', az: 145, el: 24, d: 28 }, show: 'bone lig', focus: ['L3', 'L4', 'L5'],
    labels: [['cap.L4-L5.L', 'Cápsula facetária L4-L5'], ['L5.sap.L', 'Articular superior de L5'], ['L4.iap.L', 'Articular inferior de L4'], ['cap.L3-L4.L', 'Faceta L3-L4']]
  },
  {
    ch: 3, title: 'Unidade funcional e cargas',
    body: ['A unidade funcional, ou segmento de movimento, é o menor bloco que se comporta como a coluna: duas vértebras, o disco entre elas, as duas facetas e os ligamentos. É a unidade com que a cirurgia trabalha: uma artrodese L4-L5 trava uma unidade funcional.',
      'A pressão dentro do disco L4-L5 muda muito com a postura. As medidas abaixo vêm de um sensor implantado em um voluntário (Wilke, 1999). Neste estudo, sentar relaxado não aumentou a pressão em relação a ficar em pé, ao contrário das medidas antigas de Nachemson; O que a eleva é fletir o tronco, sentado ou em pé, e carregar peso longe do corpo.'],
    pro: 'Ao fundir um segmento, movimento e carga migram para os vizinhos. A degeneração do segmento adjacente é uma das principais causas de reoperação a longo prazo e motiva as técnicas que preservam movimento, como a prótese de disco.',
    cam: { t: 'disc.L4-L5', az: 55, el: 10, d: 24 }, show: 'bone disc lig', focus: ['L4', 'L5'], extra: 'wilke',
    labels: [['L4', 'L4'], ['disc.L4-L5', 'Disco'], ['L5', 'L5'], ['cap.L4-L5.L', 'Facetas']]
  },
  /* 5. Ligamentos */
  {
    ch: 4, title: 'Longitudinais anterior e posterior',
    body: ['O ligamento longitudinal anterior (LLA) corre na frente dos corpos, do occipital ao sacro. É largo e forte e limita a extensão. O ligamento longitudinal posterior (LLP) corre dentro do canal, atrás dos corpos, de C2 ao sacro; Acima continua como membrana tectória. É mais fino e limita a flexão.',
      'Na lombar o LLP é estreito sobre os corpos e se alarga sobre os discos, mas deixa descobertas as laterais posteriores do disco.'],
    pro: 'É por isso que a maioria das hérnias lombares é posterolateral (paracentral): o núcleo sai onde o LLP não reforça o anel. Na cervical, a ossificação do LLP (OPLL) é causa importante de mielopatia.',
    cam: { t: 'L2', az: 112, el: 18, d: 30 }, show: 'bone disc lig', ghost: true, focus: ['L1', 'L2', 'L3', 'L4'],
    labels: [['ALL', 'LLA'], ['PLL', 'LLP (alarga no disco)'], ['disc.L2-L3', 'Disco']]
  },
  {
    ch: 4, title: 'Ligamento amarelo',
    body: ['Une as lâminas de vértebras vizinhas e forma a parede de trás do canal. É amarelo porque é rico em elastina (cerca de 80%). Fica tensionado mesmo em repouso, o que impede que dobre para dentro do canal quando a coluna se estende.',
      'Com a degeneração perde elasticidade, engrossa e passa a dobrar para dentro na extensão. É um dos três componentes da estenose lombar, junto com o abaulamento do disco e a hipertrofia das facetas.'],
    pro: 'Espessura normal na lombar perto de 3 a 4 mm; Acima de 4 mm costuma ser considerada hipertrofia. Na descompressão cirúrgica, ressecar o amarelo é o passo que libera o saco dural.',
    cam: { t: 'ax.L4-L5', az: 0, el: -78, d: 19 }, show: 'bone disc lig neuro', clip: 'ax:L4-L5',
    labels: [['flav.L4-L5.L', 'Amarelo, lado esquerdo'], ['flav.L4-L5.R', 'Amarelo, lado direito'], ['cauda', 'Saco dural'], ['cap.L4-L5.L', 'Faceta'], ['nuc.L4-L5', 'Disco']]
  },
  {
    ch: 4, title: 'Complexo ligamentar posterior',
    body: ['O supraespinhoso, sobre a ponta dos espinhosos, o interespinhoso, entre eles, o ligamento amarelo e as cápsulas facetárias formam o complexo ligamentar posterior (CLP). Ele trabalha como uma banda de tensão que resiste à flexão. No pescoço, o supraespinhoso se expande no ligamento nucal, uma lâmina que vai de C7 ao occipital.',
      'Os intertransversários unem os transversos e limitam a inclinação lateral.'],
    pro: 'Nas fraturas toracolombares, a integridade do CLP é um dos três critérios do escore TLICS. CLP rompido indica instabilidade e costuma levar à fixação cirúrgica.',
    cam: { t: 'L2', az: 150, el: 10, d: 44 }, show: 'bone lig', focus: ['T12', 'L1', 'L2', 'L3', 'L4', 'L5'],
    labels: [['SSL', 'Supraespinhoso'], ['isp.L3-L4', 'Interespinhoso'], ['flav.L2-L3.L', 'Amarelo'], ['itl.L2-L3.L', 'Intertransversário'], ['cap.L1-L2.L', 'Cápsula facetária']]
  },
  {
    ch: 4, title: 'Ligamentos craniovertebrais',
    body: ['O ligamento transverso do atlas passa atrás do dente e o prende contra o arco anterior de C1. Os ligamentos alares vão da ponta do dente aos côndilos occipitais e limitam a rotação. A membrana tectória continua o LLP até o clivo. O ligamento nucal ancora a musculatura posterior do pescoço.',
      'Na artrite reumatoide, a inflamação sinovial pode afrouxar o ligamento transverso e causar instabilidade C1-C2.'],
    pro: 'Intervalo atlanto-dental acima de 3 mm no adulto (5 mm na criança) sugere lesão ou frouxidão do ligamento transverso. A fixação C1-C2 com parafusos na massa lateral de C1 e no pedículo de C2 (técnica de Harms) é a cirurgia padrão para essa instabilidade.',
    cam: { t: 'C1', az: 150, el: 42, d: 18 }, show: 'bone lig', ghost: true, focus: ['C1', 'C2', 'C3', 'Occ'],
    labels: [['TAL', 'Ligamento transverso'], ['alar.L', 'Ligamento alar'], ['tect', 'Membrana tectória'], ['C2.dens', 'Dente'], ['nuchal', 'Ligamento nucal']]
  },
  {
    ch: 4, title: 'As três colunas de Denis',
    body: ['Modelo de 1983 para pensar estabilidade no trauma. Coluna anterior: LLA e os dois terços anteriores do corpo e do disco. Coluna média: o terço posterior do corpo e do disco e o LLP. Coluna posterior: pedículos, facetas, lâminas, espinhosos e o complexo ligamentar posterior.',
      'Lesão de uma coluna costuma ser estável, como a fratura em cunha simples. Lesão de duas ou três colunas tende a ser instável, como a fratura explosão com lesão posterior ou a fratura-luxação.'],
    pro: 'Hoje se usam a classificação AO Spine e o TLICS, mas o raciocínio de Denis continua sendo a forma mais rápida de ler uma tomografia de trauma.',
    cam: { t: 'L1', az: 90, el: 4, d: 30 }, show: 'bone disc lig neuro', clip: 'sag', extra: 'denis',
    labels: [['denis.a', 'Anterior'], ['denis.m', 'Média'], ['denis.p', 'Posterior']]
  },
  /* 6. Medula e nervos */
  {
    ch: 5, title: 'Medula espinhal e meninges',
    body: ['A medula sai do crânio pelo forame magno, continuação do bulbo, e desce pelo canal. Mede cerca de 45 cm no homem adulto e 42 a 43 cm na mulher. Tem dois alargamentos: o cervical, nos segmentos medulares C4 a T1, de onde sai o plexo braquial, e o lombossacral, nos segmentos L2 a S3, que ficam na altura das vértebras T9 a T12, de onde saem os nervos das pernas.',
      'Três meninges envolvem a medula. A dura-máter é o tubo externo resistente (o saco dural); A aracnoide fica colada por dentro; A pia-máter adere à medula. Entre aracnoide e pia circula o líquor. Fora da dura fica o espaço epidural, com gordura e o plexo venoso.'],
    pro: 'Os ligamentos denticulados, extensões laterais da pia, prendem a medula à dura por 18 a 20 expansões de cada lado (Ceylan, Acta Neurochir 2012) e a mantêm centrada no canal. São seccionados em algumas cirurgias intradurais para rodar a medula com segurança.',
    cam: { t: 'cord.T', az: 120, el: 6, d: 110 }, show: 'bone neuro', ghost: true,
    labels: [['cervEnl', 'Alargamento cervical'], ['cord.T', 'Medula torácica'], ['lumbEnl', 'Alargamento lombossacral'], ['dura', 'Dura-máter (saco dural)'], ['medulla', 'Bulbo']]
  },
  {
    ch: 5, title: 'Cone medular e cauda equina',
    body: ['A medula termina no cone medular, na altura do disco L1-L2 no adulto, porque a coluna cresce mais que ela durante a gestação. No recém-nascido a termo o cone já costuma estar nesse nível: acima de L2 em 92% dos bebês num estudo com ultrassom (Arch Dis Child Fetal Neonatal Ed 1997). Cone abaixo do disco L2-L3 no bebê a termo é anormal e sugere medula presa (BMUS, diretriz de ultrassom da coluna neonatal). Abaixo, as raízes lombares e sacrais descem soltas no saco dural até seus forames: é a cauda equina. O saco dural termina em S2; O filamento terminal segue até o cóccix.',
      'Por isso a punção lombar é feita em L3-L4 ou L4-L5. Abaixo do cone a agulha afasta raízes que flutuam no líquor, sem risco de lesar a medula. A linha que une as cristas ilíacas (linha de Tuffier) passa com mais frequência por L4, mas só em 40% a 44% das pessoas; O nível real varia e pode ficar um acima ou abaixo (Chowdhury, J Spine Surg 2018).'],
    pro: 'O neurônio motor superior desce do cérebro pela medula; O inferior sai da medula até o músculo. Lesão acima do cone atinge o superior: espasticidade e reflexos vivos. Lesão da cauda equina atinge o inferior: flacidez e reflexos abolidos. A síndrome da cauda equina é emergência cirúrgica.',
    cam: { t: 'L3', az: 130, el: 10, d: 52 }, show: 'bone neuro', ghost: true, focus: ['T12', 'L1', 'L2', 'L3', 'L4', 'L5', 'S', 'Co'],
    labels: [['conus', 'Cone medular (L1-L2)'], ['cauda', 'Cauda equina'], ['duraEnd', 'Fim do saco dural (S2)'], ['filum', 'Filamento terminal'], ['drg.L3.L', 'Gânglio L3']]
  },
  {
    ch: 5, title: '31 pares de nervos e a regra da numeração',
    body: ['São 8 cervicais, 12 torácicos, 5 lombares, 5 sacrais e 1 coccígeo. Cada nervo nasce de uma raiz anterior, motora, e de uma posterior, sensitiva, que tem o gânglio da raiz dorsal dentro do forame.',
      'Regra de saída: na cervical, a raiz sai acima da vértebra de mesmo número (C6 sai entre C5 e C6). Como há 8 nervos cervicais e 7 vértebras, C8 sai entre C7 e T1. Daí para baixo a raiz sai abaixo da vértebra de mesmo número (L4 sai entre L4 e L5).'],
    pro: 'Como a medula é mais curta que a coluna, cada segmento medular fica acima da vértebra de mesmo nome; Os segmentos sacrais estão no cone, na altura de L1. Uma fratura de T12 pode lesar segmentos lombares e sacrais da medula.',
    cam: { t: 'C7', az: 70, el: 8, d: 34 }, show: 'bone neuro', ghost: true, focus: ['C4', 'C5', 'C6', 'C7', 'T1', 'T2'],
    labels: [['root.C6.L', 'C6 (entre C5 e C6)'], ['root.C7.L', 'C7 (entre C6 e C7)'], ['root.C8.L', 'C8 (entre C7 e T1)'], ['root.T1.L', 'T1 (entre T1 e T2)'], ['C7.body', 'Vértebra C7']]
  },
  {
    ch: 5, title: 'Qual raiz a hérnia comprime',
    body: ['No forame lombar, a raiz que sai (a do mesmo número da vértebra de cima) passa alta, logo abaixo do pedículo, longe do disco. A raiz que vai sair no nível de baixo, a transeunte, cruza o disco por dentro do canal, no recesso lateral, o canto do canal entre o disco e a faceta, logo antes do forame.',
      'Resultado: a hérnia posterolateral L4-L5, a mais comum, comprime a raiz L5. Hérnia foraminal ou extraforaminal no mesmo disco comprime a L4. Hérnia central grande pode pegar várias raízes da cauda equina.'],
    pro: 'Mapa clínico. L4: fraqueza do quadríceps, reflexo patelar diminuído, dor na face medial da perna. L5: fraqueza para levantar o hálux e o pé, dormência no dorso do pé, sem reflexo confiável. S1: fraqueza da flexão plantar, reflexo aquileu diminuído, dor na lateral e na planta do pé.',
    cam: { t: 'L4', az: 150, el: 20, d: 26 }, show: 'bone disc neuro', ghost: true, focus: ['L4', 'L5', 'S'], hot: ['root.L4.L', 'root.L5.L', 'drg.L4.L', 'drg.L5.L'],
    labels: [['root.L4.L', 'L4: sai no forame L4-L5'], ['rootIn.L5.L', 'L5: cruza o disco L4-L5'], ['disc.L4-L5', 'Disco L4-L5']]
  },
  /* 7. Vasos */
  {
    ch: 6, title: 'Aorta e veia cava',
    body: ['A aorta desce à esquerda e à frente dos corpos torácicos, passa pelo diafragma em T12 e corre na frente da lombar até se dividir nas ilíacas comuns, em geral na altura de L4. A veia cava inferior fica à direita e se forma em L5, pela união das ilíacas comuns.',
      'A veia ilíaca comum esquerda cruza a frente de L5 por trás da artéria ilíaca comum direita.'],
    pro: 'Na via anterior (ALIF), L5-S1 é abordado entre os vasos, abaixo da bifurcação. Em L4-L5 é preciso afastar a veia ilíaca comum esquerda e muitas vezes ligar a veia iliolombar. É o passo de maior risco de sangramento dessa cirurgia.',
    cam: { t: 'L2', az: 14, el: 6, d: 64 }, show: 'bone disc vessel',
    labels: [['aorta.L', 'Aorta abdominal'], ['ivc', 'Veia cava inferior'], ['aorta.bif', 'Bifurcação (L4)'], ['civ.L', 'Veia ilíaca comum esquerda'], ['cia.R', 'Artéria ilíaca comum direita'], ['azygos', 'Ázigos']]
  },
  {
    ch: 6, title: 'Segmentares e artéria de Adamkiewicz',
    body: ['Em cada nível, um par de artérias segmentares (intercostais posteriores no tórax, lombares no abdome) sai da parte de trás da aorta, abraça a cintura do corpo vertebral e dá ramos que entram pelo forame para irrigar osso, raízes e medula.',
      'A medula recebe uma artéria espinhal anterior, que irriga os dois terços anteriores, e duas posteriores, para o terço posterior, reforçadas por radiculomedulares, artérias que entram com as raízes e chegam até a medula. A maior delas é a de Adamkiewicz: entra entre T9 e T12 em cerca de 75% das pessoas, em geral pela esquerda (cerca de 3 em cada 4), e faz uma curva em grampo de cabelo.'],
    pro: 'Ligar segmentares na cirurgia de coluna ou da aorta pode comprometer a irrigação da medula toracolombar. A espinhal anterior irriga os tratos motores: sua oclusão dá paraplegia e perda de dor e temperatura abaixo da lesão, com tato fino, vibração e posição preservados (síndrome da artéria espinhal anterior).',
    cam: { t: 'T10', az: 82, el: 8, d: 30 }, show: 'bone neuro vessel', ghost: true, hide: ['ivc', 'civ', 'azygos', 'hemiaz', 'plex', 'bvv'], focus: ['T8', 'T9', 'T10', 'T11', 'T12'],
    labels: [['seg.T10.L', 'Artéria segmentar T10'], ['adamk', 'Adamkiewicz'], ['asa', 'Espinhal anterior'], ['aorta', 'Aorta']]
  },
  {
    ch: 6, title: 'Artérias vertebrais',
    body: ['Nascem das subclávias e entram no forame transverso de C6 (segmento V1). Sobem pelos forames de C6 a C2 (V2). Passam pelo forame de C1 e contornam seu arco posterior (V3). Entram no crânio pelo forame magno (V4) e se unem na base da ponte, formando a artéria basilar.',
      'Irrigam tronco cerebral e cerebelo e dão origem à artéria espinhal anterior. Na frente do pescoço, as carótidas ficam anteriores e laterais aos corpos.'],
    pro: 'Em cerca de 90% das pessoas a vertebral entra em C6; No restante, em C5 ou C7. Na fixação C1-C2 e na via anterior cervical dissecada lateral demais, a lesão da vertebral é a complicação temida. Por isso o trajeto é estudado em angiotomografia antes.',
    cam: { t: 'C3', az: 38, el: 10, d: 34 }, show: 'bone vessel', focus: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'T1', 'Occ'],
    labels: [['va.V1.L', 'V1'], ['va.V2.L', 'V2 (forames transversos)'], ['va.V3.L', 'V3 (sobre C1)'], ['basilar', 'Basilar'], ['cca.L', 'Carótida comum']]
  },
  {
    ch: 6, title: 'Plexo venoso de Batson',
    body: ['Veias sem válvulas formam um plexo ao redor e dentro do canal. O plexo vertebral interno fica no espaço epidural e se liga às veias do tórax, do abdome, da pelve e aos seios venosos do crânio. Sem válvulas, o sangue corre para qualquer lado conforme a pressão abdominal. A veia basivertebral drena o corpo vertebral para esse plexo.',
      'A ázigos sobe à direita dos corpos torácicos e recebe as intercostais; A hemiázigos faz o mesmo à esquerda.'],
    pro: 'O plexo de Batson explica por que próstata, mama, pulmão e rim mandam tantas metástases para a coluna, e por que o sangramento epidural é o principal da cirurgia posterior. Posicionar o paciente em prona com o abdome livre reduz a pressão no plexo.',
    cam: { t: 'L2', az: 125, el: 22, d: 24 }, show: 'bone vessel', ghost: true, focus: ['L1', 'L2', 'L3'], hide: ['aorta', 'cia', 'eia', 'iia', 'seg', 'asa', 'psa', 'adamk'],
    labels: [['plexus', 'Plexo vertebral interno'], ['bvv', 'Veia basivertebral'], ['ivc', 'Veia cava'], ['hemiaz', 'Hemiázigos']]
  },
  /* 8. Síntese */
  {
    ch: 7, title: 'Tudo em um corte: L4-L5',
    body: ['Este é o corte da ressonância axial. De frente para trás: a bifurcação da aorta (ou já as ilíacas comuns) e a veia cava; Disco com anel e núcleo; LLP; Saco dural com as raízes da cauda equina; As raízes no recesso lateral; Facetas e cápsulas; Ligamento amarelo; Lâminas e espinhoso. O músculo psoas, ao lado dos corpos, e os paravertebrais, atrás, não estão modelados.',
      'Treine assim: para cada estrutura, pergunte o que acontece se ela crescer, romper ou ceder. Quase todas as doenças da próxima parte são respostas a essa pergunta.'],
    pro: 'Ao ler uma ressonância lombar, siga sempre a mesma ordem: alinhamento, corpos e placas, discos, canal central, recessos laterais, forames, facetas e partes moles posteriores. A ordem fixa evita perder achados.',
    cam: { t: 'ax.L4-L5', az: 0, el: -76, d: 30 }, show: 'bone disc lig neuro vessel', clip: 'ax:L4-L5',
    labels: [['aorta.bif', 'Bifurcação da aorta'], ['ivc', 'Cava'], ['nuc.L4-L5', 'Núcleo'], ['cauda', 'Saco dural'], ['flav.L4-L5.L', 'Amarelo'], ['cap.L4-L5.R', 'Faceta'], ['L4.sp', 'Espinhoso']]
  },
  {
    ch: 7, title: 'Tudo em um corte: sagital mediano',
    body: ['No perfil aparecem corpos e discos alternados, o LLA na frente, o LLP atrás dos corpos, o canal com a medula até o cone em L1-L2 e a cauda equina abaixo, o ligamento amarelo e os espinhosos. Note como o canal muda: largo na cervical alta, estreito na torácica, largo de novo na lombar.',
      'Agora gire, aproxime e selecione as estruturas. A régua de níveis leva a qualquer vértebra e mostra medidas e raízes daquele nível; No celular ela fica em "Camadas e cortes".'],
    pro: 'Os cortes sagital e axial bastam para ler a maior parte dos exames de coluna. O próximo passo é a parte de doenças, onde o mesmo modelo mostra cada alteração no lugar onde ela acontece.',
    cam: { t: 'center', az: 90, el: 2, d: 150 }, show: 'bone disc lig neuro vessel', clip: 'sag',
    labels: [['cord.T', 'Medula'], ['conus', 'Cone'], ['cauda', 'Cauda equina'], ['ALL', 'LLA'], ['ivc', 'Veia cava'], ['C2.dens', 'Dente de C2']]
  }
];

/* insere os testes ao fim de cada capítulo */
const QUIZ = {
  0: [
    ['Quantos discos intervertebrais existem?', ['23', '24', '25', '33'], 0, 'Do C2-C3 ao L5-S1. Não há disco entre occipital e C1 nem entre C1 e C2.'],
    ['Qual parâmetro não muda após o crescimento e define quanta lordose a pessoa precisa?', ['Incidência pélvica', 'Versão pélvica', 'Inclinação sacral', 'SVA'], 0, 'IP = VP + IS. A IP é fixa; VP e IS mudam com a postura e a compensação.'],
    ['Um laudo diz "hérnia em L4-L5". A que se refere?', ['Ao disco entre L4 e L5', 'À vértebra L4', 'À raiz L4', 'À vértebra L5'], 0, 'Hérnia e estenose são descritas pelo nível do disco.']
  ],
  1: [
    ['Onde fica o pedículo em relação ao corpo vertebral?', ['Na metade superior', 'Na metade inferior', 'No centro', 'Depende do nível'], 0, 'Por isso o forame intervertebral fica abaixo do pedículo.'],
    ['A espondilólise é uma fratura de qual estrutura?', ['Pars interarticularis', 'Pedículo', 'Processo transverso', 'Corpo vertebral'], 0, 'Fratura por estresse da pars, quase sempre em L5.'],
    ['O que forma a parede posterior do forame intervertebral?', ['Faceta e ligamento amarelo', 'Ligamento longitudinal anterior', 'Corpo vertebral', 'Processo espinhoso'], 0, 'Na frente ficam disco e corpo; Em cima e embaixo, os pedículos.']
  ],
  2: [
    ['Em que forame transverso a artéria vertebral entra na maioria das pessoas?', ['C6', 'C7', 'C5', 'C1'], 0, 'Cerca de 90% entram em C6.'],
    ['Por que a coluna lombar roda pouco?', ['As facetas estão quase no plano sagital', 'As costelas travam', 'Os discos são finos', 'Os pedículos são grossos'], 0, 'Facetas sagitais permitem flexo-extensão e bloqueiam rotação.'],
    ['Cerca de metade da rotação cervical acontece em:', ['C1-C2', 'Occipito-C1', 'C5-C6', 'C7-T1'], 0, 'C1 gira em torno do dente de C2.']
  ],
  3: [
    ['Como o disco adulto recebe nutrientes?', ['Por difusão pelas placas terminais', 'Por artérias dentro do núcleo', 'Pelo LLP', 'Pelo líquor'], 0, 'É a maior estrutura avascular do corpo.'],
    ['Em qual situação a pressão no disco L4-L5 é maior?', ['Levantando 20 kg com o tronco fletido', 'Sentado relaxado', 'Em pé relaxado', 'Deitado de costas'], 0, 'Cerca de 2,3 MPa contra 0,5 MPa em pé (Wilke, 1999).'],
    ['Qual nervo inerva a faceta e é alvo da radiofrequência?', ['Ramo medial do ramo dorsal', 'Nervo sinuvertebral', 'Ramo ventral', 'Nervo ciático'], 0, 'Cada faceta recebe o ramo medial do mesmo nível e do nível de cima.']
  ],
  4: [
    ['Por que a maior parte das hérnias lombares é posterolateral?', ['O LLP é estreito e não cobre as laterais posteriores do disco', 'O LLA não alcança a parte posterior do disco', 'O ligamento amarelo empurra o núcleo para os lados', 'As facetas protegem só o centro do disco'], 0, 'O núcleo sai onde o anel não tem reforço.'],
    ['Qual ligamento tem mais elastina?', ['Amarelo', 'LLA', 'LLP', 'Supraespinhoso'], 0, 'Cerca de 80% de elastina, por isso a cor.'],
    ['Na classificação de Denis, o LLP pertence a qual coluna?', ['Média', 'Anterior', 'Posterior', 'Nenhuma'], 0, 'Coluna média: terço posterior do corpo e do disco e o LLP.']
  ],
  5: [
    ['Em que nível a medula costuma terminar no adulto?', ['L1-L2', 'T12', 'L4-L5', 'S2'], 0, 'O saco dural é que termina em S2.'],
    ['Hérnia posterolateral L4-L5 comprime tipicamente qual raiz?', ['L5', 'L4', 'S1', 'L3'], 0, 'A raiz transeunte; A L4 já saiu alta no forame.'],
    ['Hérnia C5-C6 comprime qual raiz?', ['C6', 'C5', 'C7', 'C8'], 0, 'Na cervical a raiz sai acima da vértebra de mesmo número.']
  ],
  6: [
    ['Onde a aorta costuma se bifurcar?', ['L4', 'T12', 'L2', 'S1'], 0, 'Referência para a via anterior lombar.'],
    ['A artéria de Adamkiewicz geralmente entra:', ['Entre T9 e T12, pela esquerda', 'Em C6, pela direita', 'Em L5, dos dois lados', 'Em T4, pela direita'], 0, 'Cerca de 75% entre T9 e T12, a maioria à esquerda.'],
    ['Por que o plexo de Batson favorece metástases na coluna?', ['Não tem válvulas', 'Tem fluxo muito rápido', 'Passa dentro do disco', 'Liga-se à aorta'], 0, 'O fluxo inverte com a pressão abdominal e leva células tumorais da pelve e do tórax.']
  ]
};
const ALL_STEPS = [];
STEPS.forEach((s, i) => { ALL_STEPS.push(s); const nx = STEPS[i + 1]; if (QUIZ[s.ch] && (!nx || nx.ch !== s.ch)) ALL_STEPS.push({ ch: s.ch, quiz: s.ch, title: 'Teste do capítulo', cam: null }); });

/* ---------- textos das estruturas (ao tocar) ---------- */
const INFO = {
  body: ['Corpo vertebral', 'Suporta a carga axial. Casca cortical fina com osso trabecular por dentro; Placas terminais em cima e embaixo fazem a interface com o disco.'],
  pedicle: ['Pedículo', 'Liga o corpo ao arco posterior. É a parte mais resistente da vértebra e o trajeto do parafuso pedicular. Sai da metade superior do corpo.'],
  lamina: ['Lâmina', 'Placa que fecha o arco por trás e forma o teto do canal. É removida na laminectomia para descomprimir.'],
  spinous: ['Processo espinhoso', 'Alavanca para os extensores e ancoragem dos ligamentos supra e interespinhoso. É o que se palpa nas costas.'],
  tp: ['Processo transverso', 'Alavanca lateral para músculos e ligamentos. Na torácica articula com a costela; Na cervical contém o forame transverso.'],
  sap: ['Processo articular superior', 'Metade inferior da articulação facetária: recebe o processo articular inferior da vértebra de cima.'],
  iap: ['Processo articular inferior', 'Metade superior da articulação facetária: apoia-se no articular superior da vértebra de baixo.'],
  pars: ['Pars interarticularis', 'Istmo entre os processos articulares superior e inferior. Local da espondilólise (fratura por estresse).'],
  mamm: ['Processo mamilar', 'Saliência no articular superior lombar; Inserção do multífido. Referência para o ponto de entrada do parafuso pedicular.'],
  latmass: ['Massa lateral', 'Pilar articular cervical com as facetas inclinadas cerca de 45°. Recebe parafusos de massa lateral na fixação posterior.'],
  uncinate: ['Processo unciforme', 'Lábio lateral superior do corpo cervical; Forma a articulação uncovertebral (Luschka). Osteófitos aqui estreitam o forame.'],
  tforamen: ['Forame transverso', 'Canal no transverso cervical por onde passam artéria e veia vertebrais, de C6 a C1.'],
  dens: ['Dente do áxis (odontoide)', 'Pino de C2 em torno do qual C1 gira. Preso pelo ligamento transverso; Tem irrigação pobre na base, por isso a fratura tipo II consolida mal.'],
  c1ant: ['Arco anterior do atlas', 'Articula com a frente do dente. O intervalo entre eles (atlanto-dental) é de até 3 mm no adulto.'],
  c1post: ['Arco posterior do atlas', 'Tem um sulco por onde passa a artéria vertebral (segmento V3).'],
  c1lm: ['Massa lateral do atlas', 'Recebe os côndilos occipitais em cima e apoia-se em C2 embaixo. Ponto de fixação dos parafusos de C1.'],
  rib: ['Costela', 'A cabeça articula com dois corpos e o disco entre eles; O tubérculo, com o processo transverso.'],
  sacrum: ['Sacro', 'Cinco vértebras fundidas. Transmite a carga da coluna para a pelve pelas articulações sacroilíacas.'],
  sforamen: ['Forames sacrais', 'Saída das raízes S1 a S4 pela frente do sacro (e dos ramos dorsais por trás).'],
  coccyx: ['Cóccix', 'Três a cinco segmentos fundidos; Inserção do assoalho pélvico.'],
  occ: ['Osso occipital (base do crânio)', 'O forame magno dá passagem ao bulbo e às artérias vertebrais. Os côndilos articulam com C1.'],
  annulus: ['Anel fibroso', '15 a 25 lamelas de colágeno com fibras em direções alternadas. Só o terço externo tem nervos. Fissuras aqui permitem a hérnia.'],
  nucleus: ['Núcleo pulposo', 'Gel de proteoglicanos e água que distribui a pressão. Desidrata com a degeneração.'],
  ALL: ['Ligamento longitudinal anterior', 'Faixa larga e forte na frente dos corpos, do occipital ao sacro. Limita a extensão.'],
  PLL: ['Ligamento longitudinal posterior', 'Dentro do canal, atrás dos corpos. Estreito sobre os corpos e mais largo nos discos. Limita a flexão.'],
  flavum: ['Ligamento amarelo', 'Une as lâminas; Cerca de 80% de elastina. Hipertrofia e dobra na degeneração, contribuindo para a estenose.'],
  isp: ['Ligamento interespinhoso', 'Entre os espinhosos. Parte do complexo ligamentar posterior; Resiste à flexão.'],
  SSL: ['Ligamento supraespinhoso', 'Cordão sobre a ponta dos espinhosos, de C7 até L4 ou L5 na maioria das pessoas. No pescoço continua como ligamento nucal.'],
  nuchal: ['Ligamento nucal', 'Lâmina fibrosa de C7 à protuberância occipital externa. Ancora os músculos da nuca.'],
  itl: ['Ligamento intertransversário', 'Une transversos vizinhos e limita a inclinação lateral.'],
  capsule: ['Cápsula facetária', 'Envolve a articulação facetária sinovial. Inervada pelo ramo medial do ramo dorsal.'],
  TAL: ['Ligamento transverso do atlas', 'Prende o dente contra o arco anterior de C1. Sua ruptura gera instabilidade C1-C2.'],
  alar: ['Ligamento alar', 'Do dente ao côndilo occipital. Limita a rotação da cabeça.'],
  tect: ['Membrana tectória', 'Continuação do LLP de C2 até o clivo, cobrindo o dente por trás.'],
  cord: ['Medula espinhal', 'Do forame magno até o cone em L1-L2. Substância cinzenta central em H, tratos longos ao redor. Alargamentos cervical e lombossacral.'],
  dura: ['Dura-máter (saco dural)', 'Tubo fibroso que envolve medula, raízes e líquor. Termina em S2.'],
  root: ['Raiz nervosa', ''],
  drg: ['Gânglio da raiz dorsal', 'Corpos dos neurônios sensitivos, dentro do forame. Muito sensível à compressão e à inflamação.'],
  filum: ['Filamento terminal', 'Fio de pia-máter do cone ao cóccix. Quando curto e espesso, causa medula presa.'],
  aorta: ['Aorta', 'Desce à esquerda e na frente dos corpos; Divide-se nas ilíacas comuns em geral em L4.'],
  ivc: ['Veia cava inferior', 'À direita da aorta; Forma-se em L5 pela união das ilíacas comuns.'],
  cia: ['Artéria ilíaca comum', 'Ramo terminal da aorta. Afastada na via anterior de L5-S1.'],
  civ: ['Veia ilíaca comum', 'A esquerda cruza a frente de L5 por trás da artéria ilíaca comum direita. Ponto de risco na ALIF.'],
  eia: ['Artéria ilíaca externa', 'Segue para a perna como artéria femoral.'],
  iia: ['Artéria ilíaca interna', 'Irriga a pelve.'],
  azygos: ['Veia ázigos', 'Sobe à direita dos corpos torácicos e drena as intercostais para a veia cava superior.'],
  hemiaz: ['Veia hemiázigos', 'Equivalente à esquerda; Cruza atrás da aorta para a ázigos.'],
  seg: ['Artéria segmentar', 'Sai da aorta, contorna a cintura do corpo e dá ramos espinhais pelo forame.'],
  adamk: ['Artéria de Adamkiewicz', 'Principal artéria radiculomedular da medula toracolombar. Entra entre T9 e T12, em geral à esquerda; Curva em grampo de cabelo.'],
  asa: ['Artéria espinhal anterior', 'Irriga os dois terços anteriores da medula, incluindo os tratos motores.'],
  psa: ['Artéria espinhal posterior', 'Duas, irrigam o terço posterior da medula (colunas dorsais).'],
  va: ['Artéria vertebral', 'Da subclávia ao forame transverso de C6, sobe até C1, contorna o arco posterior e entra pelo forame magno.'],
  basilar: ['Artéria basilar', 'União das duas vertebrais; Irriga tronco cerebral e cerebelo.'],
  cca: ['Artéria carótida comum', 'Anterolateral aos corpos cervicais, dentro da bainha carotídea. Na via anterior cervical a dissecção passa medial a ela.'],
  sca: ['Artéria subclávia', 'Origem das artérias vertebrais.'],
  bct: ['Tronco braquiocefálico', 'Primeiro ramo do arco aórtico; Dá a subclávia e a carótida direitas.'],
  plexus: ['Plexo venoso vertebral interno (Batson)', 'Veias sem válvulas no espaço epidural. Via de metástases e fonte de sangramento cirúrgico.'],
  bvv: ['Veia basivertebral', 'Drena o corpo vertebral para o plexo interno pela parede posterior do corpo.'],
  hernia: ['Hérnia de disco', 'Núcleo que escapou por uma fissura do anel e ocupa o canal ou o forame.'],
  osteophyte: ['Osteófito', 'Bico ósseo nas margens do corpo, resposta à instabilidade e à degeneração.'],
  synd: ['Sindesmófito', 'Ossificação fina e vertical do anel do disco, típica da espondilite anquilosante.'],
  dish: ['Ossificação do DISH', 'Ponte óssea espessa e contínua na face anterolateral direita da torácica.'],
  opll: ['LLP ossificado (OPLL)', 'Ligamento transformado em osso que estreita o canal e comprime a medula.'],
  frag: ['Fragmento retropulsado', 'Parte do muro posterior do corpo empurrada para dentro do canal.'],
  fxline: ['Traço de fratura', 'Linha onde o osso se rompeu; Na tomografia aparece como um traço escuro no osso.'],
  parsdefect: ['Defeito da pars (espondilólise)', 'Falha óssea na pars que separa lâmina, espinhoso e articulares inferiores do resto da vértebra (corpo, pedículos e articulares superiores).'],
  tumor: ['Lesão tumoral', 'Metástase destruindo o osso trabecular do corpo.'],
  schmorl: ['Nódulo de Schmorl', 'Herniação do disco através da placa terminal para dentro do corpo.'],
  erosion: ['Erosão da placa terminal', 'Destruição da placa pela infecção, de um lado e do outro do disco.'],
  abscess: ['Abscesso', 'Coleção de pus; Na lombar costuma correr pelo músculo psoas.'],
  myelolesion: ['Sofrimento medular', 'Área da medula com edema ou gliose, vista como hipersinal em T2.']
};
const ROOTFN = {
  C3: 'Junto com C4 e C5 forma o nervo frênico (diafragma).', C4: 'Ombro; Contribui para o frênico.', C5: 'Deltoide e bíceps; Reflexo bicipital; Face lateral do braço.', C6: 'Extensores do punho e bíceps; Reflexo braquiorradial; Polegar e indicador.',
  C7: 'Tríceps e flexores do punho; Reflexo tricipital; Dedo médio.', C8: 'Flexores dos dedos; Anelar e mínimo.', T1: 'Músculos intrínsecos da mão; Face medial do cotovelo e do braço.', T4: 'Dermátomo da linha do mamilo.', T10: 'Dermátomo da linha do umbigo.',
  L1: 'Região inguinal.', L2: 'Flexão do quadril; Face anterior da coxa.', L3: 'Quadríceps e adutores; Face anterior e medial da coxa.', L4: 'Quadríceps e tibial anterior; Reflexo patelar; Face medial da perna.',
  L5: 'Extensor longo do hálux e glúteo médio; Dorso do pé.', S1: 'Gastrocnêmio e glúteo máximo; Reflexo aquileu; Borda lateral e planta do pé.', S2: 'Bexiga, esfíncteres e função sexual; Períneo (com S3 e S4).', S3: 'Bexiga, esfíncteres e função sexual; Períneo.', S4: 'Esfíncter anal e bexiga; Região perianal.'
};
function rootExit(n) {
  if (n === 'C1') return 'Sai entre o occipital e C1.';
  if (n === 'C8') return 'Sai entre C7 e T1.';
  if (n === 'Co1') return 'Sai pelo hiato sacral.';
  const r = n[0], k = +n.slice(1);
  if (r === 'C') return `Sai acima de ${n}, no forame C${k - 1}-${n}.`;
  if (r === 'T') return `Sai abaixo de ${n}, no forame ${n}-${k === 12 ? 'L1' : 'T' + (k + 1)}.`;
  if (r === 'L') return `Sai abaixo de ${n}, no forame ${n}-${k === 5 ? 'S1' : 'L' + (k + 1)}.`;
  return k <= 4 ? `Sai pelo forame sacral anterior ${n}.` : 'Sai pelo hiato sacral.';
}

/* ---------- régua de níveis ---------- */
const LEVEL_NOTES = {
  C1: 'Atlas: anel sem corpo; Gira em torno do dente de C2.', C2: 'Áxis: dente (odontoide). Espinhoso grande e bífido, referência na palpação.', C3: 'Corpo pequeno com processos unciformes.',
  C4: 'Raiz C4 sai acima (C3-C4); Com C3 e C5 forma o frênico.', C5: 'C5-C6 é o nível mais acometido por espondilose; Junto com C6-C7, concentra as hérnias cervicais.', C6: 'A artéria vertebral entra no forame transverso de C6 em cerca de 90%. Tubérculo carotídeo (Chassaignac).',
  C7: 'Vértebra proeminente: espinhoso longo, não bífido. A vertebral costuma passar na frente do transverso, não dentro.', T1: 'Primeira costela. Raiz C8 sai acima, T1 abaixo.', T4: 'Altura do arco aórtico e da carina. Pedículos mais finos da coluna (T4 a T6).',
  T10: 'Adamkiewicz entra com mais frequência entre T9 e T12.', T11: 'Costelas 11 e 12 são flutuantes.', T12: 'Junção toracolombar: facetas mudam de coronais para sagitais. Local mais comum de fraturas.',
  L1: 'O cone medular termina na altura do disco L1-L2.', L2: 'Abaixo daqui só cauda equina no canal.', L3: 'Processo transverso mais longo (o de L5 é o mais grosso).', L4: 'Bifurcação da aorta e linha de Tuffier (cristas ilíacas).',
  L5: 'Corpo em cunha (mais alto na frente). Local da espondilólise.', S: 'Sacro: base da coluna; Platô de S1 inclinado cerca de 40°.', Co: 'Cóccix: inserção do assoalho pélvico.'
};
