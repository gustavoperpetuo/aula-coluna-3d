/* ================= Doenças ================= */
const DZ_CATS = ['Degenerativas', 'Deformidades', 'Trauma e osso frágil', 'Inflamatórias', 'Infecção e tumor', 'Emergência neurológica'];
const DZ = [
  {
    id: 'ddd', levels: ['L3', 'L4', 'L5', 'S'], cat: 0, name: 'Discopatia degenerativa', lv: 'L4-L5 e L5-S1',
    mods: { disc: { 'L4-L5': { h: 0.5, state: 'degen', bulge: 0.06 }, 'L5-S1': { h: 0.45, state: 'degen', bulge: 0.06 }, 'L3-L4': { h: 0.8 } }, osteo: { 'L4-L5': { size: 1 }, 'L5-S1': { size: 1.1 }, 'L3-L4': { size: 0.6 } } },
    cam: { t: 'L4', az: 75, el: 8, d: 34 }, show: 'bone disc', focus: ['L2', 'L3', 'L4', 'L5', 'S'], clip: 'sag', hot: ['disc.L4-L5', 'disc.L5-S1', 'nuc.L4-L5', 'nuc.L5-S1', 'osteo.L4-L5', 'osteo.L5-S1'],
    labels: [['disc.L4-L5', 'Disco baixo e desidratado'], ['osteo.L5-S1', 'Osteófitos'], ['disc.L3-L4', 'Disco ainda preservado']],
    what: 'Envelhecimento do disco acelerado por genética, carga e tabagismo. O núcleo perde proteoglicanos e água, o anel fissura, o disco baixa e as bordas dos corpos formam osteófitos.',
    why: 'Disco mais baixo afrouxa ligamentos, sobrecarrega as facetas e estreita os forames. A degeneração segue uma cascata (Kirkaldy-Willis): disfunção, instabilidade e, por fim, reestabilização com osteófitos.',
    sx: 'Dor lombar mecânica, pior sentado e ao fletir. Muita gente tem degeneração na imagem sem dor: em pessoas sem sintomas, cerca de 37% aos 20 anos e 96% aos 80 anos (Brinjikji, AJNR 2015).',
    dx: 'Ressonância: disco escuro em T2 (graduação de Pfirrmann) e alterações de Modic nas placas (tipo 1 edema, 2 gordura, 3 esclerose). A radiografia mostra perda de altura e osteófitos.',
    tx: 'A base é exercício, fisioterapia e controle da dor. Cirurgia para dor só discogênica é exceção e controversa: artrodese intersomática (cage e parafusos pediculares) ou prótese de disco em casos selecionados.',
    pro: 'Imagem sozinha não indica cirurgia. A pergunta é sempre se o achado explica a queixa daquele paciente.'
  },
  {
    id: 'hernia', levels: ['L4', 'L5', 'S'], cat: 0, name: 'Hérnia de disco lombar', lv: 'L4-L5 e L5-S1',
    mods: { disc: { 'L4-L5': { hern: { side: 1, size: 1 }, h: 0.85 } }, hotRoots: ['L5.L'], pinch: [{ at: 'L4-L5', f: 0.75, w: 0.4, what: 'dura' }] },
    cam: { t: 'ax.L4-L5', az: 0, el: -78, d: 18 }, show: 'bone disc lig neuro', clip: 'ax:L4-L5', hot: ['hernia'],
    labels: [['hernia', 'Extrusão posterolateral'], ['rootIn.L5.L', 'Raiz L5 comprimida'], ['cauda', 'Saco dural'], ['nuc.L4-L5', 'Núcleo']],
    what: 'Deslocamento do núcleo pulposo por uma fissura do anel, além dos limites do disco. Protrusão (base larga), extrusão (cúpula maior que a base) ou sequestro (fragmento solto).',
    why: 'Cerca de 90% ocorrem em L4-L5 e L5-S1, na posição posterolateral, onde o LLP não cobre o anel. Comprime a raiz transeunte (L5 numa hérnia L4-L5) por efeito mecânico e por inflamação química do material do núcleo.',
    sx: 'Dor irradiada para a perna no trajeto da raiz (ciática), mais forte que a dor lombar; formigamento; fraqueza no grupo muscular da raiz. Teste de elevação da perna estendida (Lasègue) positivo entre 30° e 70°.',
    dx: 'Clínico. Ressonância quando há déficit motor, dor que não cede após cerca de 6 semanas ou sinais de alerta.',
    tx: 'A grande maioria melhora sem cirurgia em 6 a 12 semanas; extrusões e sequestros costumam ser reabsorvidos. Microdiscectomia se dor incapacitante persistente, déficit motor progressivo ou cauda equina. Recidiva em torno de 5% a 15%.',
    pro: 'Na cervical a lógica é a mesma, com a raiz de mesmo número da vértebra de baixo. O tratamento cirúrgico típico é a discectomia anterior com fusão (ACDF, com cage e placa) ou a prótese de disco cervical.'
  },
  {
    id: 'sten', levels: ['L3', 'L4', 'L5'], cat: 0, name: 'Estenose do canal lombar', lv: 'L4-L5, L3-L4',
    mods: { flavum: { 'L4-L5': 2.6, 'L3-L4': 1.8 }, facet: { 'L4-L5': 1.4, 'L3-L4': 1.2 }, disc: { 'L4-L5': { bulge: 0.12, h: 0.75, state: 'degen' }, 'L3-L4': { bulge: 0.08 } }, pinch: [{ at: 'L4-L5', f: 0.42, w: 0.6, what: 'dura' }, { at: 'L3-L4', f: 0.72, w: 0.5, what: 'dura' }] },
    cam: { t: 'ax.L4-L5', az: 0, el: -78, d: 18 }, show: 'bone disc lig neuro', clip: 'ax:L4-L5', hot: ['flav.L4-L5.L', 'flav.L4-L5.R', 'cap.L4-L5.L', 'cap.L4-L5.R'],
    labels: [['flav.L4-L5.L', 'Amarelo espesso'], ['cap.L4-L5.R', 'Faceta hipertrófica'], ['cauda', 'Saco dural estreitado'], ['disc.L4-L5', 'Disco abaulado']],
    what: 'Estreitamento do canal central, do recesso lateral ou do forame, que comprime a cauda equina ou as raízes.',
    why: 'Tríade degenerativa: disco abaulado na frente, facetas hipertróficas dos lados e ligamento amarelo espesso e dobrado atrás. Mais comum em L4-L5, depois L3-L4. A extensão piora (o amarelo dobra para dentro) e a flexão alivia.',
    sx: 'Claudicação neurogênica: dor, peso ou dormência nas pernas ao andar ou ficar em pé, que melhora ao sentar ou inclinar o tronco (sinal do carrinho de supermercado). Na claudicação vascular, parar de andar alivia mesmo em pé.',
    dx: 'Ressonância: área do saco dural abaixo de cerca de 100 mm² (relativa) e de 75 mm² (absoluta); graduação morfológica de Schizas (A a D).',
    tx: 'Fisioterapia com ênfase em flexão, analgesia, infiltração epidural. Descompressão cirúrgica (laminotomia ou laminectomia) quando a limitação para andar pesa; no estudo SPORT (Weinstein, NEJM 2008), muitos pacientes trocaram de grupo. Comparando os grupos sorteados, a cirurgia só foi melhor na dor. Comparando pelo tratamento que cada um fez de fato, foi melhor em todos os desfechos principais. Artrodese associada se houver instabilidade ou listese.',
    pro: 'Na descompressão, preservar pelo menos metade de cada faceta e a pars evita instabilidade criada pela própria cirurgia.'
  },
  {
    id: 'facet', sag: 'lat', levels: ['L4', 'L5', 'S'], cat: 0, name: 'Artrose facetária', lv: 'L4-L5 e L5-S1',
    mods: { facet: { 'L4-L5': 1.7, 'L5-S1': 1.5 }, disc: { 'L4-L5': { h: 0.75, state: 'degen' }, 'L5-S1': { h: 0.7, state: 'degen' } } },
    cam: { t: 'L5', az: 150, el: 22, d: 28 }, show: 'bone disc lig', focus: ['L3', 'L4', 'L5', 'S'], hot: ['cap.L4-L5.L', 'cap.L4-L5.R', 'cap.L5-S1.L', 'cap.L5-S1.R'],
    labels: [['cap.L4-L5.L', 'Faceta L4-L5 com artrose'], ['cap.L5-S1.L', 'Faceta L5-S1'], ['L4.sp', 'Espinhoso de L4']],
    what: 'Osteoartrite das articulações facetárias: perda de cartilagem, osteófitos, cápsula espessa e às vezes cisto sinovial.',
    why: 'Costuma seguir a degeneração do disco: com o disco baixo, as facetas passam a carregar mais peso. Mais frequente em L4-L5 e L5-S1.',
    sx: 'Dor lombar que piora em extensão e rotação; pode irradiar para nádega e coxa sem seguir um dermátomo; rigidez matinal curta.',
    dx: 'Tomografia mostra melhor a artrose óssea; ressonância mostra derrame e cistos. A faceta como fonte da dor é confirmada por bloqueio do ramo medial com anestésico.',
    tx: 'Exercício e analgesia; denervação por radiofrequência do ramo medial após bloqueio positivo. Facetas grandes contribuem para a estenose e entram na descompressão.',
    pro: 'Cisto sinovial facetário comprime a raiz como uma hérnia. Quando há listese associada, a artrodese reduz a recidiva do cisto.'
  },
  {
    id: 'dspondy', levels: ['L3', 'L4', 'L5'], cat: 0, name: 'Espondilolistese degenerativa', lv: 'L4-L5',
    mods: { slip: { L4: 0.7 }, disc: { 'L4-L5': { h: 0.7, state: 'degen' } }, facet: { 'L4-L5': 1.4 }, flavum: { 'L4-L5': 1.8 }, pinch: [{ at: 'L4-L5', f: 0.55, w: 0.5, what: 'dura' }] },
    cam: { t: 'L4', az: 90, el: 4, d: 32 }, show: 'bone disc lig neuro', clip: 'sag', focus: ['L2', 'L3', 'L4', 'L5', 'S'], hot: ['L4.body', 'disc.L4-L5'],
    labels: [['L4.body', 'L4 deslizou para frente'], ['L5.body', 'L5'], ['cauda', 'Canal estreitado']],
    what: 'Escorregamento de uma vértebra sobre a de baixo com o arco posterior intacto, por degeneração do disco e das facetas.',
    why: 'Típica em L4-L5, em mulheres acima de 50 anos. Facetas mais sagitais e degeneradas deixam L4 deslizar para frente; como o arco vai junto, o canal estreita.',
    sx: 'Igual à estenose: claudicação neurogênica, dor lombar, às vezes dor na raiz L5.',
    dx: 'Radiografia em pé com flexão e extensão. Graduação de Meyerding: I até 25%, II 25% a 50%, III 50% a 75%, IV 75% a 100%, V acima de 100% (espondiloptose). Movimento acima de 3 a 4 mm entre flexão e extensão indica instabilidade.',
    tx: 'Conservador de início. Cirurgia: descompressão, em geral com artrodese por parafusos pediculares e muitas vezes cage intersomático colocado por trás (TLIF, pelo forame, ou PLIF, dos dois lados do canal).',
    pro: 'Os estudos divergem sobre fundir sempre. O SLIP (Ghogawala, NEJM 2016) mostrou ganho pequeno, mas clinicamente relevante, na qualidade de vida física com a fusão (+5,7 pontos), sem diferença no ODI (índice de incapacidade de Oswestry) e com menos reoperação (14% contra 34%). O estudo sueco (Försth, NEJM 2016) não encontrou benefício em adicionar fusão à descompressão, nem nos pacientes com espondilolistese degenerativa. A decisão pesa instabilidade dinâmica, alinhamento e dor lombar.'
  },
  {
    id: 'myelo', levels: ['C4', 'C5', 'C6', 'C7'], cat: 0, name: 'Mielopatia cervical espondilótica', lv: 'C5-C6 e C6-C7',
    mods: { sag: { 'C2-C3': 4, 'C3-C4': 5, 'C4-C5': 6, 'C5-C6': 6, 'C6-C7': 4 }, disc: { 'C5-C6': { h: 0.55, state: 'degen', bulge: 0.1 }, 'C6-C7': { h: 0.6, state: 'degen', bulge: 0.08 } }, osteo: { 'C5-C6': { size: 0.9, post: true }, 'C6-C7': { size: 0.8, post: true } }, flavum: { 'C5-C6': 1.8 }, pinch: [{ at: 'C5-C6', f: 0.55, w: 0.45, what: 'all' }, { at: 'C6-C7', f: 0.72, w: 0.4, what: 'all' }], myeloLesion: 'C5-C6' },
    cam: { t: 'C5', az: 90, el: 4, d: 28 }, show: 'bone disc lig neuro', clip: 'sag', focus: ['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'T1'], hot: ['osteo.C5-C6', 'osteo.C6-C7', 'myelo.lesion'],
    labels: [['osteo.C5-C6', 'Disco-osteófito'], ['myelo.lesion', 'Medula comprimida'], ['flav.C5-C6.R', 'Amarelo dobrado'], ['C2', 'Lordose perdida']],
    what: 'Compressão crônica da medula cervical por degeneração: complexos disco-osteófito na frente, ligamento amarelo dobrado atrás, às vezes sobre um canal congenitamente estreito.',
    why: 'Mais comum em C5-C6 e C6-C7, acima dos 55 anos. Compressão estática somada ao movimento repetido lesa tratos longos e substância cinzenta. É a causa mais comum de disfunção medular no adulto.',
    sx: 'Mãos desajeitadas (abotoar, escrever), desequilíbrio ao andar, sinal de Hoffmann, reflexos vivos, Babinski, choque ao fletir o pescoço (Lhermitte). Piora em degraus e raramente melhora sozinha.',
    dx: 'Ressonância: medula comprimida; hipersinal em T2 indica lesão. Índice de Torg-Pavlov (canal dividido pelo corpo vertebral na radiografia de perfil) abaixo de 0,8 sugere canal estreito. Gravidade pela escala mJOA (pontuação de função de mãos, marcha e bexiga).',
    tx: 'Moderada e grave: cirurgia descompressiva. Via anterior (ACDF, discectomia anterior com fusão, ou corpectomia com cage e placa) para 1 a 3 níveis e cifose; via posterior (laminoplastia, ou laminectomia com parafusos de massa lateral) para muitos níveis com lordose preservada.',
    pro: 'Nos casos leves, observação estruturada é aceitável, com cirurgia se piorar. O objetivo é parar a progressão; recuperar o que já foi perdido é incerto.'
  },
  {
    id: 'opll', levels: ['C3', 'C4', 'C5', 'C6', 'C7'], cat: 0, name: 'Ossificação do LLP (OPLL)', lv: 'C4 a C6',
    mods: { opll: ['C3', 'C4', 'C5', 'C6'], pinch: [{ at: 'C4-C5', f: 0.6, w: 1.3, what: 'all' }] },
    cam: { t: 'C4', az: 90, el: 4, d: 26 }, show: 'bone disc lig neuro', clip: 'sag', focus: ['C2', 'C3', 'C4', 'C5', 'C6', 'C7'], hot: ['PLL.C3', 'PLL.C4', 'PLL.C5', 'PLL.C6'],
    labels: [['PLL.C', 'LLP ossificado'], ['cord', 'Medula'], ['C4.body', 'C4']],
    what: 'O LLP vira osso, engrossa e comprime a medula por trás dos corpos.',
    why: 'Bem mais frequente em asiáticos orientais (cerca de 2% a 4% no Japão); associa-se ao DISH e ao diabetes. Predomina de C4 a C6. Tipos: contínuo, segmentar, misto e circunscrito.',
    sx: 'Mielopatia progressiva. Um trauma leve pode precipitar lesão medular aguda, porque o canal já está estreito.',
    dx: 'Tomografia mostra a placa óssea atrás dos corpos; ressonância avalia a medula. A linha K (de C2 a C7) orienta a via: se a ossificação passa da linha, a descompressão só por trás tende a falhar.',
    tx: 'Descompressão anterior (corpectomia e artrodese) ou posterior (laminoplastia, ou laminectomia e artrodese) conforme linha K, extensão e ocupação do canal.',
    pro: 'A dura pode estar ossificada junto. Na via anterior, fístula liquórica é complicação conhecida.'
  },
  {
    id: 'scolio', levels: ['T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'L1', 'L2', 'L3', 'L4'], cat: 1, name: 'Escoliose idiopática do adolescente', lv: 'Torácica direita',
    mods: { cor: { T12: 14, T11: 9, T10: 2, T9: -6, T8: -12, T7: -17, T6: -20, T5: -21, T4: -18, T3: -12, T2: -6, T1: -3, L1: 16, L2: 12, L3: 4, L4: -4, L5: -4 }, axial: { T5: -5, T6: -10, T7: -16, T8: -20, T9: -18, T10: -12, T11: -6, T12: 0, L1: 5, L2: 9, L3: 8, L4: 4 } },
    cam: { t: 'center', az: 180, el: 6, d: 112 }, show: 'bone disc rib', hot: [],
    labels: [['T8', 'Ápice torácico'], ['rib.8.R', 'Giba costal (lado convexo)'], ['L2', 'Curva lombar compensatória']],
    what: 'Curvatura lateral de 10° ou mais (ângulo de Cobb) com rotação das vértebras, sem causa identificada, que aparece no estirão de crescimento.',
    why: 'Prevalência de 2% a 3%. Curvas que chegam a precisar de tratamento são cerca de 10 vezes mais comuns em meninas. O padrão mais comum é torácico com convexidade à direita. As vértebras rodam para o lado convexo, levam as costelas para trás e formam a giba.',
    sx: 'Ombros e cintura assimétricos, giba costal ao inclinar o tronco. Em geral sem dor; dor intensa ou alteração neurológica pedem investigação de causa secundária.',
    dx: 'Teste de Adams com escoliômetro (7° ou mais indica radiografia); radiografia panorâmica em pé para o Cobb; maturidade pelo sinal de Risser.',
    tx: 'Abaixo de 25°: observar. De 25° a 40° em quem ainda cresce: colete (no estudo BrAIST, Weinstein, NEJM 2013, 72% de sucesso com colete contra 48% sem, contando o tratamento que cada um fez de fato; comparando os grupos sorteados, 75% contra 42%, em curvas de 20° a 40°). Acima de 45° a 50°: artrodese posterior com parafusos pediculares e hastes, com correção e derrotação.',
    pro: 'Curvas torácicas acima de 50° tendem a progredir na vida adulta, perto de 1° por ano. Por isso esse é o limiar cirúrgico usual.'
  },
  {
    id: 'scheuer', levels: ['T6', 'T7', 'T8', 'T9', 'T10'], cat: 1, name: 'Cifose de Scheuermann', lv: 'T7 a T9',
    mods: { sag: { 'T5-T6': 2, 'T6-T7': 3, 'T7-T8': 3, 'T8-T9': 3, 'T9-T10': 2 }, wedge: { T7: 7, T8: 8, T9: 6 }, schmorl: ['T7', 'T8', 'T9'] },
    cam: { t: 'T8', az: 90, el: 4, d: 52 }, show: 'bone disc', clip: 'sag', hot: ['T7.body', 'T8.body', 'T9.body'],
    labels: [['T8.body', 'Vértebras em cunha'], ['schmorl.T8', 'Nódulo de Schmorl'], ['T4', 'Cifose aumentada']],
    what: 'Hipercifose torácica rígida do adolescente por crescimento irregular das placas terminais, com vértebras em cunha.',
    why: 'Critério de Sorensen: 3 ou mais vértebras vizinhas com cunha de 5° ou mais. Cifose acima de 45°, nódulos de Schmorl e placas irregulares. Mais comum em meninos.',
    sx: 'Postura curvada que não corrige ao endireitar, dor torácica, encurtamento dos isquiotibiais.',
    dx: 'Radiografia de perfil em pé, medindo de T4 a T12 e as cunhas.',
    tx: 'Exercício; colete em quem ainda cresce. Cirurgia para cifose acima de 70° a 75° com dor ou deformidade: artrodese posterior com osteotomias de Ponte (ressecção das facetas e do ligamento amarelo em vários níveis).',
    pro: 'A cifose postural corrige em hiperextensão; a de Scheuermann não. Esse teste simples separa as duas.'
  },
  {
    id: 'isthmic', sag: 'lat', levels: ['L4', 'L5', 'S'], cat: 1, name: 'Espondilólise e listese ístmica', lv: 'L5-S1',
    mods: { pars: ['L5'], slip: { L5: 1.25 }, disc: { 'L5-S1': { h: 0.6, state: 'degen' } }, hotRoots: ['L5'] },
    cam: { t: 'L5', az: 96, el: 8, d: 24 }, show: 'bone disc neuro', focus: ['L3', 'L4', 'L5', 'S'], hot: ['crack.L5.L', 'crack.L5.R', 'L5.body'],
    labels: [['crack.L5.L', 'Defeito da pars'], ['L5.body', 'L5 escorregou (grau II)'], ['root.L5.L', 'Raiz L5 no forame']],
    what: 'Defeito (fratura por estresse) da pars interarticularis, quase sempre em L5. Se o corpo desliza para frente, vira espondilolistese ístmica.',
    why: 'Hiperextensão repetida (ginástica, saltos, balé, futebol americano) sobrecarrega a pars. Prevalência na população perto de 6%. Com o arco solto, L5 escorrega sobre S1 e o forame L5-S1 estreita.',
    sx: 'Dor lombar no adolescente atleta, pior em extensão. Com listese, dor na raiz L5 (que sai no forame L5-S1) e isquiotibiais encurtados.',
    dx: 'Radiografia oblíqua (o "colar no cachorro escocês"), tomografia para o defeito, ressonância para edema da pars na fase aguda.',
    tx: 'Afastamento do esporte e órtese na fase aguda; a pars pode consolidar. Reparo direto da pars em jovens sem listese. Artrodese L5-S1 com parafusos pediculares e cage quando há listese com dor ou déficit.',
    pro: 'Na ístmica o canal central fica até mais largo, porque o arco fica para trás; a compressão é foraminal, da raiz L5. Na degenerativa é o contrário: o arco vai junto e aperta o canal.'
  },
  {
    id: 'osteofx', levels: ['T11', 'T12', 'L1', 'L2'], cat: 2, name: 'Fratura osteoporótica por compressão', lv: 'T12-L1',
    mods: { wedge: { L1: 15 }, crush: { L1: 0.88 } },
    cam: { t: 'L1', az: 88, el: 6, d: 34 }, show: 'bone disc', focus: ['T10', 'T11', 'T12', 'L1', 'L2', 'L3'], hot: ['L1.body'],
    labels: [['L1.body', 'L1 em cunha'], ['T12', 'Cifose local']],
    what: 'Fratura do corpo vertebral por baixa energia (tossir, levantar peso, queda da própria altura) em osso osteoporótico.',
    why: 'É a fratura osteoporótica mais comum. Predomina na junção toracolombar (T12-L1) e na torácica média. A parede anterior cede, o corpo fica em cunha e a cifose aumenta.',
    sx: 'Dor súbita e localizada, pior em pé. Cerca de dois terços a três quartos passam sem diagnóstico (Fink, J Bone Miner Res 2005). Fraturas múltiplas trazem perda de altura e corcunda progressiva.',
    dx: 'Radiografia com graduação de Genant, 1993 (leve 20% a 25%, moderada 25% a 40%, grave acima de 40% de perda de altura); ressonância com edema na sequência STIR (que realça líquido) mostra se é recente; densitometria.',
    tx: 'Analgesia, órtese, mobilização precoce e, sempre, tratamento da osteoporose (bisfosfonato, denosumabe, teriparatida ou romosozumabe). Vertebroplastia ou cifoplastia com cimento para dor persistente em casos selecionados.',
    pro: 'Depois de uma fratura vertebral, cerca de 1 em cada 5 pacientes tem nova fratura vertebral no ano seguinte (19% em 1 ano; Lindsay, JAMA 2001). Em fixações de osso porótico, cimentar os parafusos aumenta a ancoragem.'
  },
  {
    id: 'burst', levels: ['T12', 'L1', 'L2'], cat: 2, name: 'Fratura explosão (burst)', lv: 'L1',
    mods: { burst: 'L1', crush: { L1: 0.68 }, widen: { L1: 1.14 }, wedge: { L1: 6 }, pinch: [{ at: 'L1', f: 0.5, w: 0.5, what: 'all' }] },
    cam: { t: 'L1', az: 90, el: 4, d: 30 }, show: 'bone disc lig neuro', clip: 'sag', focus: ['T11', 'T12', 'L1', 'L2', 'L3'], hot: ['L1.body', 'frag'],
    labels: [['frag', 'Fragmento no canal'], ['L1.body', 'Corpo de L1 cominuído'], ['conus', 'Cone medular']],
    what: 'Fratura por compressão axial de alta energia (queda de altura, acidente) que rompe as colunas anterior e média e empurra fragmentos do muro posterior para dentro do canal.',
    why: 'Mais comum entre T11 e L2, onde a torácica rígida encontra a lombar móvel. O fragmento retropulsado comprime cone ou cauda equina; a distância entre os pedículos aumenta.',
    sx: 'Dor intensa após trauma; déficit neurológico variável, de nenhum a paraplegia.',
    dx: 'Tomografia para o osso e a ocupação do canal; ressonância para o complexo ligamentar posterior e a medula. Classificação AO Spine (A3 incompleta, A4 completa) e TLICS (5 ou mais indica cirurgia, 3 ou menos, conservador).',
    tx: 'Sem déficit e com CLP íntegro, muitas tratam com órtese ou só mobilização. Com déficit ou instabilidade: fixação posterior com parafusos pediculares, às vezes corpectomia anterior com cage expansível.',
    pro: 'TLICS soma morfologia (compressão 1, explosão 2, translação 3, distração 4), estado neurológico (raiz 2, medula ou cone completo 2, incompleto 3, cauda equina 3) e CLP (íntegro 0, indeterminado 2, rompido 3).'
  },
  {
    id: 'dens', levels: ['C1', 'C2', 'C3'], cat: 2, name: 'Fratura do odontoide', lv: 'C2',
    mods: { dens: 'II' },
    cam: { t: 'C1', az: 72, el: 8, d: 21 }, show: 'bone lig neuro', clip: 'sag', focus: ['C1', 'C2', 'C3', 'Occ'], hot: ['C2.dens', 'crack.C2'],
    labels: [['C2.dens', 'Dente fraturado na base (tipo II)'], ['C1.ant', 'C1 acompanha o dente'], ['cord', 'Medula']],
    what: 'Fratura do dente de C2. É a fratura cervical mais comum no idoso, muitas vezes por queda da própria altura.',
    why: 'Anderson e D\'Alonzo: tipo I (ponta, avulsão dos alares, estável); tipo II (base do dente, a mais comum e a que mais deixa de consolidar, por irrigação pobre); tipo III (desce para o corpo de C2, consolida bem).',
    sx: 'Dor cervical alta após queda, sensação de cabeça instável. Déficit neurológico é incomum porque o canal em C1-C2 é amplo (regra dos terços).',
    dx: 'Tomografia de coluna cervical em todo idoso com queda e dor no pescoço.',
    tx: 'Tipo III: colar rígido. Tipo II: parafuso anterior no dente ou artrodese posterior C1-C2 (técnicas de Harms ou Magerl), conforme idade, desvio e traço; em idosos frágeis aceita-se colar e consolidação fibrosa.',
    pro: 'Fatores de risco para não consolidar no tipo II tratado com halo (Koivikko, J Bone Joint Surg Br 2004, 69 pacientes): espaço na fratura acima de 1 mm, desvio posterior acima de 5 mm, tratamento iniciado depois de 4 dias e novo desvio posterior acima de 2 mm. Nessa série a idade não pesou, mas outras apontam idade acima de 65 anos (Stoney, 1998) e cominuição da base.'
  },
  {
    id: 'as', cat: 3, name: 'Espondilite anquilosante', lv: 'Sacroilíacas e coluna toda',
    mods: { synd: true, ossify: true, sag: { 'L4-L5': 5, 'L3-L4': 4, 'L2-L3': 3, 'L5-S1': 4, 'T6-T7': 2, 'T7-T8': 2, 'T8-T9': 2 } },
    cam: { t: 'L1', az: 40, el: 6, d: 60 }, show: 'bone disc lig', hot: ['synd'],
    labels: [['synd', 'Sindesmófitos (coluna em bambu)'], ['SSL', 'Ligamentos posteriores ossificados'], ['T7', 'Cifose aumentada']],
    what: 'Doença inflamatória crônica (espondiloartrite axial) que começa nas sacroilíacas e sobe pela coluna, ossificando as inserções de ligamentos e o anel do disco.',
    why: 'Ligada ao HLA-B27, presente em cerca de 90% dos pacientes brancos com espondilite. A dor inflamatória costuma começar antes dos 40 anos, e os critérios ASAS de espondiloartrite axial usam início antes dos 45. É mais comum em homens. Sindesmófitos finos e verticais unem os corpos: a coluna em bambu. Facetas e ligamentos posteriores também se fundem.',
    sx: 'Dor lombar inflamatória: começo insidioso, rigidez matinal acima de 30 minutos (critérios de Berlim, Rudwaleit 2006), melhora com exercício e não com repouso, acorda na segunda metade da noite. Uveíte e entesites.',
    dx: 'Ressonância das sacroilíacas (edema ósseo) e radiografia; HLA-B27 e PCR (proteína C reativa) apoiam.',
    tx: 'Anti-inflamatórios e exercício; biológicos (anti-TNF, anti-IL-17) quando ativa. Osteotomia de subtração pedicular para cifose grave em que o paciente não consegue olhar para frente.',
    pro: 'Coluna rígida quebra como osso longo: trauma leve gera fratura instável, muitas vezes pelo disco e invisível na radiografia. Todo paciente com espondilite e dor após trauma faz tomografia da coluna inteira, e a fixação é longa.'
  },
  {
    id: 'dish', levels: ['T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], cat: 3, name: 'DISH (hiperostose difusa)', lv: 'Torácica, à direita',
    mods: { dish: true },
    cam: { t: 'T8', az: -38, el: 6, d: 46 }, show: 'bone disc vessel', hide: ['ivc', 'civ', 'cia', 'eia', 'iia', 'sca', 'cca', 'bct', 'seg', 'plex', 'bvv', 'va', 'basilar', 'hemiaz', 'adamk', 'asa', 'psa'], focus: ['T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'L1'], hot: ['dish'],
    labels: [['dish', 'Ossificação contínua à direita'], ['aorta', 'Aorta à esquerda'], ['disc.T7-T8', 'Disco preservado']],
    what: 'Ossificação que escorre pela face anterolateral de 4 ou mais vértebras seguidas, com discos e sacroilíacas preservados (critérios de Resnick).',
    why: 'Idosos, mais homens, associada a obesidade, diabetes e síndrome metabólica. Na torácica predomina à direita: a pulsação da aorta, à esquerda, inibe a ossificação.',
    sx: 'Rigidez e dor leve. Na cervical, osteófitos anteriores grandes podem causar dificuldade para engolir.',
    dx: 'Radiografia ou tomografia com a ponte óssea e espaço discal preservado. Na espondilite os sindesmófitos são finos e a sacroilíaca funde.',
    tx: 'Sintomático; ressecção de osteófitos cervicais se a disfagia for importante.',
    pro: 'Como na espondilite, a coluna rígida fratura com trauma leve e de forma instável.'
  },
  {
    id: 'discitis', levels: ['L1', 'L2', 'L3', 'L4'], cat: 4, name: 'Espondilodiscite (infecção)', lv: 'L2-L3',
    mods: { disc: { 'L2-L3': { h: 0.35, state: 'infect' } }, erosion: [['L2', -1], ['L3', 1]], abscess: { v: 'L3', x: 3.0, y: 0.8, z: 0.2, rx: 1.3, ry: 3.0, rz: 1.3 } },
    cam: { t: 'L3', az: 62, el: 8, d: 32 }, show: 'bone disc', ghost: true, focus: ['L1', 'L2', 'L3', 'L4'], hot: ['disc.L2-L3', 'nuc.L2-L3', 'erosion.L2', 'erosion.L3'],
    labels: [['disc.L2-L3', 'Disco destruído'], ['erosion.L3', 'Placas erodidas'], ['abscess', 'Abscesso do psoas']],
    what: 'Infecção do disco e dos corpos vizinhos, em geral por via sanguínea.',
    why: 'No adulto a bactéria chega pelas arteríolas junto às placas terminais, destrói as placas e depois o disco, que não tem defesa vascular. Staphylococcus aureus é o agente mais comum; a lombar é a região mais atingida. Fatores: diabetes, imunossupressão, drogas injetáveis, procedimentos.',
    sx: 'Dor lombar progressiva, contínua e noturna; febre só em cerca de 35% a 60% dos casos. Pode haver abscesso epidural com déficit neurológico.',
    dx: 'Ressonância com contraste é o exame de escolha; PCR e VHS (marcadores de inflamação no sangue) elevados; hemoculturas e biópsia guiada antes do antibiótico se o paciente estiver estável.',
    tx: 'Antibiótico dirigido por cerca de 6 semanas (o ensaio de Bernard, Lancet 2015, mostrou 6 semanas tão eficazes quanto 12: cura de 90,9% contra 90,8%, com poucos casos de abscesso ou MRSA, o estafilococo resistente). Cirurgia para déficit, abscesso, instabilidade ou falha clínica, com desbridamento e fixação.',
    pro: 'Infecção destrói o disco; tumor costuma poupá-lo. Na tuberculose (mal de Pott) o disco resiste mais tempo, a doença corre sob o LLA e forma grandes abscessos frios com giba torácica.'
  },
  {
    id: 'mets', levels: ['T7', 'T10', 'L2'], cat: 4, name: 'Metástase vertebral', lv: 'Torácica (cerca de 70%)',
    mods: { lesions: [{ v: 'T7', x: 0.3, y: 0.1, z: 0.2, r: 0.7 }, { v: 'T10', x: -0.2, y: 0, z: -0.1, r: 1.0 }, { v: 'L2', x: 0.9, y: 0.3, z: -0.5, r: 0.8, key: 'tumor.L2' }, { v: 'T10', x: 0.0, y: 0.1, z: -1.65, r: 0.55, ry: 1.3, key: 'epi.T10', info: 'tumor' }], wedge: { T10: 9 }, crush: { T10: 0.9 }, pinch: [{ at: 'T10', f: 0.6, w: 0.5, what: 'all' }] },
    cam: { t: 'T10', az: 128, el: 14, d: 50 }, show: 'bone disc neuro', ghost: true, focus: ['T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'L1', 'L2', 'L3'], hot: ['tumor.T7', 'tumor.T10', 'tumor.L2', 'epi.T10'],
    labels: [['tumor.T10', 'Fratura patológica'], ['epi.T10', 'Extensão epidural'], ['tumor.L2', 'Lesão no pedículo'], ['tumor.T7', 'Lesão no corpo']],
    what: 'Tumor de outro órgão implantado no osso da coluna. É o tumor mais comum da coluna, muito mais que os primários.',
    why: 'Chega à medula vermelha do corpo vertebral pelas artérias ou pelo plexo de Batson. Primários mais comuns: mama, próstata, pulmão, rim e tireoide, além do mieloma. A torácica é a região mais afetada. Destrói corpo e pedículo, pode fraturar e invadir o canal.',
    sx: 'Dor contínua e noturna que não melhora com repouso; em quem tem câncer, dor nova na coluna é metástase até prova em contrário. Compressão medular: fraqueza, nível sensitivo, alteração de esfíncteres.',
    dx: 'Ressonância da coluna inteira; tomografia para estabilidade; biópsia se o primário é desconhecido. Na radiografia, o pedículo apagado dá o sinal da coruja piscando.',
    tx: 'Decisão pela estrutura NOMS (neurológico, oncológico, mecânico, sistêmico). Radioterapia convencional ou estereotáxica; cirurgia para instabilidade (escore SINS de Fisher, Spine 2010: 13 a 18 instável, 7 a 12 indeterminado) ou compressão medular. Patchell (Lancet 2005): cirurgia com radioterapia manteve mais pacientes andando que radioterapia isolada (84% contra 57%), por mais tempo (mediana de 122 contra 13 dias).',
    pro: 'A cirurgia de separação retira o tumor que encosta na medula, deixando 2 a 3 mm de folga, e fixa com parafusos pediculares, abertos ou percutâneos, para permitir radioterapia estereotáxica em dose alta.'
  },
  {
    id: 'cauda', levels: ['L3', 'L4', 'L5', 'S'], cat: 5, name: 'Síndrome da cauda equina', lv: 'L4-L5 ou L5-S1',
    mods: { disc: { 'L4-L5': { hern: { side: 0, size: 2.0 }, h: 0.85 } }, pinch: [{ at: 'L4-L5', f: 0.3, w: 0.45, what: 'dura' }], hotRoots: ['*cauda'] },
    cam: { t: 'L4', az: 90, el: 4, d: 30 }, show: 'bone disc lig neuro', clip: 'sag', focus: ['L2', 'L3', 'L4', 'L5', 'S', 'Co'], hot: ['hernia'],
    labels: [['hernia', 'Hérnia central volumosa'], ['cauda', 'Raízes da cauda equina'], ['disc.L4-L5', 'L4-L5']],
    what: 'Compressão de várias raízes da cauda equina ao mesmo tempo, abaixo do cone medular. É emergência.',
    why: 'A causa mais comum é uma hérnia central volumosa em L4-L5 ou L5-S1; também tumor, hematoma, abscesso e fratura.',
    sx: 'Anestesia em sela (períneo, nádegas, face interna das coxas), retenção urinária (depois incontinência por transbordamento), alteração intestinal e sexual, ciática dos dois lados, fraqueza nas pernas.',
    dx: 'Ressonância imediata. Resíduo urinário após urinar acima de cerca de 200 mL reforça a suspeita. Esse corte vem de estudos clínicos, não de diretriz formal, e um resíduo menor torna a síndrome menos provável sem excluí-la.',
    tx: 'Descompressão cirúrgica urgente. Na metanálise de Ahn (Spine 2000, 322 pacientes), operar em até 48 horas deu resultados melhores, e operar em menos de 24 horas não trouxe ganho adicional. Na prática, opera-se assim que possível, sobretudo antes da retenção completa.',
    pro: 'A síndrome incompleta, ainda com controle urinário, é a fase em que operar ainda preserva a função da bexiga. Explicar os sinais de alerta a todo paciente com ciática faz parte do tratamento.'
  }
];
const DZ_OTHERS = [
  ['Lesão medular traumática', 'Classificada pela escala ASIA (A completa a E normal); fratura-luxação e trauma cervical são as causas principais.'],
  ['Artrite reumatoide cervical', 'Instabilidade C1-C2 e invaginação basilar por destruição ligamentar.'],
  ['Hemangioma vertebral', 'Tumor benigno mais comum da coluna, em geral achado de exame; trabéculas verticais grossas.'],
  ['Mieloma múltiplo', 'Lesões líticas difusas e fraturas; frequentemente a primeira manifestação é dor lombar.'],
  ['Tumores intradurais', 'Meningioma e schwannoma fora da medula; ependimoma e astrocitoma dentro dela.'],
  ['Malformação de Chiari e siringomielia', 'Tonsilas cerebelares abaixo do forame magno; cavidade de líquor dentro da medula.'],
  ['Medula presa e espinha bífida', 'Filamento terminal curto ou falha de fechamento do arco posterior; alterações neurológicas e urinárias.'],
  ['Fratura de Chance', 'Flexão-distração (cinto abdominal) que rompe a coluna de trás para frente; associada a lesão abdominal.'],
  ['Doença do segmento adjacente', 'Degeneração do nível vizinho a uma artrodese, causa comum de reoperação.'],
  ['Deformidade do adulto e desequilíbrio sagital', 'Perda de lordose com tronco projetado para frente; tratada com osteotomias e artrodeses longas.']
];
const DZ_QUIZ = [
  ['Idoso com dor e peso nas pernas ao andar, que alivia ao sentar e inclinar o tronco. Hipótese principal:', ['Estenose do canal lombar', 'Hérnia de disco aguda', 'Claudicação vascular', 'Espondilite anquilosante'], 0, 'Claudicação neurogênica: a flexão abre o canal.'],
  ['Na ressonância, o que ajuda a separar infecção de tumor?', ['A infecção destrói o disco; o tumor costuma poupá-lo', 'O tumor destrói o disco; a infecção costuma poupá-lo', 'Os dois destroem o disco do mesmo jeito', 'Os dois poupam o disco e só atingem o corpo'], 0, 'Espondilodiscite atinge disco e placas dos dois lados.'],
  ['Na espondilolistese ístmica L5-S1, qual raiz costuma estar comprimida?', ['L5', 'S1', 'L4', 'S2'], 0, 'L5 sai pelo forame L5-S1, estreitado pelo escorregamento.'],
  ['O que define escoliose?', ['Curva lateral de 10° ou mais (Cobb) com rotação', 'Curva lateral de 5° ou mais (Cobb), sem rotação', 'Cifose torácica acima de 45° (Cobb)', 'Diferença de altura dos ombros acima de 2 cm'], 0, 'Abaixo de 10° chama-se assimetria espinhal.'],
  ['Qual sinal exige ressonância imediata?', ['Anestesia em sela com retenção urinária', 'Dor lombar que piora ao ficar sentado', 'Rigidez matinal de 15 minutos ao acordar', 'Dor muscular no dia seguinte à academia'], 0, 'Suspeita de síndrome da cauda equina.']
];
