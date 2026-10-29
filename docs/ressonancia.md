# Ressonância: spike de viabilidade (fase 1)

Teste feito em 28/10/2026 com um protótipo descartável fora do repositório. Nenhum arquivo do app mudou. Os casos convertidos, o protótipo e as capturas ficaram fora do repo (ver o fim deste documento).

Resultado: dá para mostrar casos reais de RM lombar no navegador, com a segmentação por cima e o clique devolvendo a estrutura. O maior arquivo tem 10,0 MiB, abaixo do limite de 25 MiB do Cloudflare Pages.

## Fontes e licenças

- **SPIDER** (Zenodo, registro 10159290, publicado em 20/11/2023): https://zenodo.org/records/10159290, DOI https://doi.org/10.5281/zenodo.10159290. A API do registro traz `"license": {"id": "cc-by-4.0"}`. Arquivos: `images.zip` (3,7 GB), `masks.zip` (58 MB), `overview.csv` e `radiological_gradings.csv`. O md5 dos dois CSV confere com o do Zenodo.
- **Artigo**: van der Graaf JW et al. Lumbar spine segmentation in MR images: a dataset and a public benchmark. Sci Data 11, 264 (2024). https://www.nature.com/articles/s41597-024-03090-w. Trecho: "The complete dataset can be found at https://doi.org/10.5281/zenodo.10159290 and is available under the CC-BY 4.0 license".
- **Desafio**: https://spider.grand-challenge.org/data/. Trecho: "The dataset is published under a CC-BY 4.0 licence: https://creativecommons.org/licenses/by/4.0/legalcode".
- O Zenodo pede para citar o DOI do dataset e também o artigo. A CC BY 4.0 exige crédito, link da licença e aviso de que houve mudanças. Aqui as mudanças foram recorte, reamostragem e conversão para NIfTI. Sugestão de crédito no modo: "Imagens: SPIDER (van der Graaf et al., Sci Data 2024; doi:10.5281/zenodo.10159290), CC BY 4.0, recortadas e convertidas."
- **NiiVue**: licença BSD-2-Clause. Fonte: arquivo LICENSE em https://github.com/niivue/niivue ("BSD 2-Clause License, Copyright (c) 2021, Niivue") e campo `license` do `package.json` da versão 0.69.0.

Acesso arquivo por arquivo: o Zenodo responde 206 a pedidos com Range em `https://zenodo.org/api/records/10159290/files/images.zip/content`. Com o pacote python `remotezip` se lê o índice do zip e só os membros pedidos. As 13 séries do teste, com as máscaras, deram 108 MB, baixados em menos de 1 minuto por lote. O zip inteiro não foi baixado.

## Formato dos dados

- MHA (MetaImage). A imagem e a máscara têm o mesmo nome em pastas diferentes (`images/45_t2.mha`, `masks/45_t2.mha`), na mesma grade.
- Só sagital. O artigo diz "up to three sagittal MRI series which were either T1-weighted or T2-weighted (regular resolution, or high resolution generated using a SPACE sequence)". No `overview.csv` há 196 séries T1, 210 T2 e 41 T2 SPACE.
- Resolução segundo o desafio: T1 e T2 "ranged from 3.3 x 0.33 x 0.33 mm to 4.8 x 0.90 x 0.90 mm"; SPACE "0.90 x 0.47 x 0.47 mm".
- A orientação dos voxels muda entre séries (LPS com cortes no eixo x, ou PIR). O NIfTI guarda a matriz, e a NiiVue posiciona sozinha.
- Imagem em int16 ou uint16. Máscara em int16 com valores até 209, que cabem em uint8.
- Os parâmetros DICOM do `overview.csv` nem sempre conferem: `45_t2` aparece com os do SPACE (0,9 mm), mas o cabeçalho do MHA dá 3,3 mm. Vale o cabeçalho.

Arquivo de graduações (`radiological_gradings.csv`, 1520 linhas, 218 pacientes). Colunas: `Patient, IVD label, Modic, UP endplate, LOW endplate, Spondylolisthesis, Disc herniation, Disc narrowing, Disc bulging, Pfirrman grade`. Modic vai de 0 a 3 e Pfirrmann de 1 a 5; As outras colunas são 0 ou 1. A graduação é por disco, feita por um radiologista musculoesquelético. `IVD label` n corresponde ao disco 200+n da máscara, contado de baixo para cima (1 é em geral L5-S1). Em 6 pacientes (35, 55, 57, 64, 98, 118) o número de níveis graduados difere do número de discos de alguma série; Melhor evitá-los.

## Casos escolhidos

| Caso | Papel | Séries | Graduação (de baixo para cima) | Por quê |
|---|---|---|---|---|
| 237 | (a) quase normal | T1, T2 (1,5 T, Philips Ingenia, 4,4 mm) | 6 níveis, todos Pfirrmann 1, sem nenhum outro achado | Três pacientes com T1 e T2 passaram no filtro (Pfirrmann até 2 e nenhum achado); O 237 é o único com Pfirrmann 1 em tudo |
| 45 | (b) hérnia | T1, T2 (3,3 mm), T2 SPACE (0,9 mm) (1,5 T, Siemens Avanto, mulher de 45 anos) | L5-S1: hérnia, estreitamento, alteração de placa, Pfirrmann 3; L4-L5 e L2-L3: abaulamento; Demais Pfirrmann 2 a 3 | Entre 43 pacientes com hérnia em L4-L5 ou L5-S1, é um dos 4 com SPACE, e o SPACE é o que dá um axial legível |
| 10 | (c) degeneração multinível | T1, T2 (3 T, Siemens Skyra, 4,4 mm, 0,31 a 0,36 mm no plano) | Modic 2, estreitamento e alteração de placa nos 7 níveis; Hérnia em L4-L5 e L3-L4; Pfirrmann 5 em L4-L5, L3-L4 e T12-L1 | Entre os 12 candidatos com mais achados (Modic e estreitamento em 2 níveis ou mais), é o de 3 T com melhor resolução no plano |

Alternativa para (b) só com sagital: o caso 12, com hérnia isolada em L4-L5 (Pfirrmann 4) e os outros discos em Pfirrmann 2. No corte sagital mediano a hérnia do 45 não salta aos olhos; Um radiologista deve escolher o corte que a mostra melhor.

## Conversão e tamanhos

Conversão com SimpleITK 2.5.6, para NIfTI `.nii.gz` com gzip nível 9. Imagem em int16 e máscara em uint8, as duas na mesma grade.

- Recorte: caixa da máscara mais 15 mm de margem. Na direção cabeça-pé a margem é de 45 mm, para manter o sacro na imagem, já que o SPIDER não segmenta o sacro. Nenhum corte sagital adquirido foi descartado.
- Reamostragem: no caso 10, o plano passou de 0,31 a 0,36 mm para 0,5 mm. No SPACE do 45, de 0,47 mm para 0,75 mm, mantendo 0,9 mm entre cortes. Os outros arquivos não foram reamostrados.
- Gravar a imagem em uint8 reduz só 25 a 40% e perde a janela livre; Não foi usado.

| Arquivo | MiB | Grade (voxels) | MHA original (MB) |
|---|---|---|---|
| spider237/237_t1.nii.gz | 3,02 | 18 x 254 x 534 | 6,1 |
| spider237/237_t2.nii.gz | 1,95 | 18 x 203 x 433 | 3,7 |
| spider45/45_t1.nii.gz | 2,47 | 249 x 493 x 17 | 4,9 |
| spider45/45_t2.nii.gz | 2,43 | 249 x 493 x 17 | 4,6 |
| spider45/45_t2_SPACE.nii.gz | 10,02 | 196 x 386 x 120 | 41,6 |
| spider10/10_t1.nii.gz | 3,77 | 15 x 288 x 560 | 14,9 |
| spider10/10_t2.nii.gz | 3,77 | 15 x 289 x 560 | 11,5 |
| 7 máscaras (`*_mask.nii.gz`) | 0,02 a 0,08 cada | igual à imagem | 0,1 a 0,6 |

O total dá 27,7 MiB em 14 arquivos; Sem o SPACE, 17,7 MiB. A máscara do T1 e a do T2 do caso 45 são o mesmo arquivo, porque as duas séries têm a mesma grade.

## Mapa de rótulos

Pelo desafio: "the lowest lumbar vertebra, which is usually L5 but can also be L4 or L6, is assigned the label 1 [...] the lowest IVD assigned the label 201 [...] The spinal canal is assigned the label 100". O artigo avisa: "this label should not be interpreted as an anatomical label". Os três casos têm o mesmo número de vértebras e de discos. A vértebra 1 fica logo acima do disco que apoia no sacro, como esperado se for L5. Uma vértebra de transição só se descarta com a coluna inteira.

| Valor | Estrutura (se 1 = L5) | Chave no 3D (`src/app.js`) |
|---|---|---|
| 1, 2, 3, 4, 5 | vértebras L5, L4, L3, L2, L1 | `L5` ... `L1` |
| 6, 7 (8, 9 se houver) | T12, T11 (T10, T9) | `T12`, `T11` ... |
| 100 | canal vertebral (conteúdo do canal) | `dura` (a confirmar) |
| 201, 202, 203, 204, 205 | discos L5-S1, L4-L5, L3-L4, L2-L3, L1-L2 | `disc.L5-S1` ... `disc.L1-L2` |
| 206, 207 | discos T12-L1, T11-T12 | `disc.T12-L1`, `disc.T11-T12` |

O sacro não tem rótulo. A máscara da vértebra inclui o arco posterior (lâminas, facetas e processos), o que se vê no axial.

## Visualizador

NiiVue 0.69.0, publicada em 20/05/2026; As 1.0.0-rc mais recentes são pré-lançamento e têm poucos dias. Arquivo usado: `https://cdn.jsdelivr.net/npm/@niivue/niivue@0.69.0/dist/niivue.umd.js` com `integrity="sha384-Oyof6MyzZMH1tvMLLYFRQLWZtk9Y/WbiL3wkdXzwaCS82xRXXy9U+kRrkDDAVq6E"`. O hash foi calculado do pacote npm e é igual ao do arquivo do jsDelivr. É um UMD sem dependências que cria a global `niivue`, com 2,28 MB (cerca de 0,8 MB com gzip). Entra como `<script>` comum, igual ao three e ao supabase-js no `build.py`, sem bundler. Precisa de WebGL2.

No protótipo, uma única instância usa `setCustomLayout` com uma vista sagital (tipo 2) e uma axial (tipo 0). As duas compartilham a mira, então ficam sincronizadas. A máscara entra como segundo volume com `opacity: 0.4` e cores por rótulo (`setColormapLabel`).

Defeito encontrado na 0.69.0: o shader das camadas (comentário "issue1139") arredonda qualquer valor acima do mínimo da tabela para pelo menos 2/256 dela. Com rótulos de 0 a 209 (210 entradas), o fundo 0 pinta com a cor do rótulo 1. Duas formas de contornar: pôr na tabela uma entrada transparente em -2 (usada e conferida por leitura de pixels) ou renumerar os discos para valores até 127 na conversão.

## Axial

O SPIDER só tem sagital, então todo axial é reconstruído.

- Com T1 e T2 comuns (3,3 a 4,8 mm entre cortes), cada corte sagital vira uma faixa de 3,3 a 4,8 mm no axial. O contorno do disco sai em degraus e borrado, sem detalhe de recesso ou forame. Serve só para orientação (`b_t2_1440.png`).
- Com o T2 SPACE (0,9 mm; 41 das 447 séries), o axial sai nítido: disco, saco dural, facetas e musculatura aparecem bem (`b_space_1440.png`).
- O axial é perpendicular ao eixo do aparelho, não inclinado ao longo do disco como no axial adquirido. Em L5-S1 o corte pega parte da placa de L5.

## Clique na imagem e destaque no 3D

```js
nv.onLocationChange = d => {
  const v = Math.round(d.values[1].value); // valor da máscara sob a mira (volume 1)
  const s = estrutura(v);                  // tabela acima: { nome, chave }
  if (s) focusKey(s.chave);                // mesma chave que a régua e os rótulos usam
};
```

O clique move a mira, e o axial acompanha. Teste no caso 45, com T2, SPACE e T1, a 1440 px com mouse e a 390 px com toque: L4-L5, L5-S1 e o corpo de L4 devolveram 202, 201 e 2.

Detalhes do toque na NiiVue:
- O toque é lido 1 ms depois do `touchstart`, o que funciona com um dedo de verdade.
- Dois toques em menos de 500 ms ou um toque de 1 s reiniciam o contraste.
- O canvas chama `preventDefault` no toque, então a página não rola com o dedo em cima do visualizador.

O caminho inverso (do 3D para a RM: levar a mira até a estrutura) não foi testado. A ideia é guardar o centro em mm de cada rótulo na conversão e usar `nv.scene.crosshairPos = nv.mm2frac(mm)`.

## Medidas

Medido em Chromium headless com SwiftShader (WebGL2 por software), servidor local, caso 45. São números grosseiros.

| Cenário | Pronto em | Heap JS | Chromium (RSS a mais por aba) |
|---|---|---|---|
| T2 + máscara, 1440 px | 0,55 a 0,62 s | 44 a 57 MB | 340 a 370 MB |
| T2 + máscara, 390 px | 0,35 a 0,42 s | 30 a 43 MB | 210 a 220 MB |
| SPACE + máscara | 0,9 a 3 s | 65 a 130 MB | 255 a 380 MB |
| 390 px a 10 Mbit/s (40 ms), T2 | 2,6 s | | |
| 390 px a 10 Mbit/s (40 ms), SPACE | 10,8 s | | |

Com o SwiftShader, as texturas da GPU contam como memória de CPU, então o RSS exagera em relação a um celular. Nada foi medido em aparelho real.

## Recomendação para a implementação

- **Arquivos**: `<série>.nii.gz` e `<série>_mask.nii.gz` por caso. Na implementação ficaram só em `dist/rm/` (ver Implementação).
- **Dados do modo**: lista de casos, rótulos, nomes, chaves do 3D e graduações num `src/rm.js`, juntado ao HTML como o `content.js`.
- **NiiVue**: carregar o script com integridade só ao entrar no modo Ressonância, para não somar 0,8 MB a toda aula.
- **Celular**: abrir com T2 e máscara (2,4 MiB no caso 45). Baixar T1 e SPACE só quando pedidos. O `fetch` é da mesma origem e leva o cookie `sb`, que o middleware exige. Os arquivos não mudam, então podem ter cache longo.
- **Crédito**: mostrar no modo o texto da licença CC BY 4.0 citado acima.

## Riscos e perguntas abertas

1. Nível anatômico: o rótulo 1 não é sempre L5. O artigo cita vértebra de transição em 35,5% da população e sexta lombar em 6,6%. Um radiologista precisa conferir cada caso antes de nomear os níveis.
2. Tamanho do repositório: os 28 MiB entram em `src/` e de novo em `dist/`, que também é versionado. Isso dá cerca de 56 MiB por versão dos casos no git. Decidir se o T1 e o SPACE entram na fase 1.
3. O contorno do defeito de cores depende da NiiVue 0.69.0. É preciso manter a versão fixa e retestar ao atualizar. Vale abrir um issue no projeto.
4. Toque: o visualizador prende a rolagem, e o toque duplo ou longo mexe no contraste. Fica para a decisão de interface.
5. Não foi testado no Cloudflare: o `.nii.gz` passando pelo middleware e o Content-Type ou Content-Encoding que o Pages manda. A NiiVue reconhece gzip pelos bytes iniciais, então os dois casos devem funcionar.
6. Memória em celular fraco e WebGL2 em navegadores antigos: não medidos.
7. No caso 45 a hérnia é graduada, mas discreta no corte mediano. Um especialista deve escolher o corte e o texto.

## Implementação (fase 2)

O modo Ressonância está na aula, ao lado de Anatomia, Doenças e Procedimentos.

- **Arquivos**: só em `dist/rm/<caso>/` (237, 45 e 10), sem cópia em `src/`, para o git não guardar os casos duas vezes. O `build.py` não apaga nada em `dist/rm/`. O T1 do caso 45 usa a máscara do T2 (`45_t2_mask.nii.gz`), porque as duas séries têm a mesma grade; O arquivo `45_t1_mask` não foi copiado.
- **Dados**: `src/rm.js` traz os casos, as séries, a graduação do SPIDER de cada disco, o centro em mm dos rótulos usados pelos passos e o texto dos 21 passos (8, 7 e 6), escrito pelas regras de `docs/estilo-ressonancia.md`. A marca de visto continua sendo `<caso>.<índice do passo>`. O `build.py` junta o arquivo ao HTML da aula e ao do painel do administrador.
- **NiiVue**: o `<script>` da 0.69.0 com integridade só entra na página ao abrir o modo. Para os testes, a mesma versão está nas dependências de desenvolvimento (`@niivue/niivue` 0.69.0); O hash do pacote npm confere com o do `<script>`.
- **Cores**: a tabela de rótulos e a entrada transparente em -2 seguem iguais ao protótipo.
- **Toque**: `doubleTouchTimeout: 0` e `longTouchTimeout: 2e9` desligam o reinício de contraste por toque duplo ou longo (Infinity viraria 0 no `setTimeout`). O visualizador continua prendendo a rolagem sob o dedo; No celular ele tem altura fixa (56% da tela) e a página rola pelo texto abaixo dele.
- **3D**: o mesmo canvas, renderizador e cena do modo Anatomia. No modo Ressonância a seção do 3D vira um encarte de 200 x 214 px no canto do visualizador (CSS `.stage.rm .view`), e o `ResizeObserver` que já existia ajusta o renderizador. A estrutura clicada fica acesa com a mesma seleção (`S.sel`) do modo Anatomia, sem mover a câmera do encarte.
- **Axial**: a imagem usa interpolação linear e a máscara, vizinho mais próximo (a 0.69.0 tem um ajuste só para as duas camadas, então `updateInterpolation` é trocado para a camada 1). O axial é aproximado para cerca de 70 mm de largura, no meio do caminho entre o disco L4-L5 e o canal do caso; Nos outros recortes, que já têm 56 a 79 mm de largura, quase nada muda. Com 3,3 a 4,4 mm entre cortes, o axial continua borrado, e o texto ensina o axial no SPACE.
- **T1 e T2 lado a lado**: não há dois quadros simultâneos. O passo troca para o T1 e os botões T1 e T2 alternam o mesmo corte; Dois quadros pediriam uma segunda instância da NiiVue.

### Conferência da numeração das vértebras

Em cada caso, no corte sagital mediano do T2, contei a partir do sacro: o osso logo abaixo do disco 201 tem a forma do sacro (segmentos sacrais e inclinação do promontório), e a vértebra 1 da máscara é a primeira acima do disco 201. Nos três casos a numeração confere com 1 = L5, 201 = L5-S1, e nenhum mapa de rótulos foi mudado.

| Caso | Vértebras e discos na máscara | Resultado |
|---|---|---|
| 237 | 1 a 6 e 201 a 206 (L5 a T12, L5-S1 a T12-L1) | Confere. Disco 201 claro e alto, apoiado no sacro |
| 45 | 1 a 7 e 201 a 207 (L5 a T11, L5-S1 a T11-T12), igual no T2 e no SPACE | Confere |
| 10 | 1 a 7 e 201 a 207 (L5 a T11, L5-S1 a T11-T12) | Confere. Disco 201 escuro e baixo, apoiado no sacro |

O recorte não mostra a coluna inteira nem as costelas, então uma vértebra de transição (sacralização de L5 ou lombarização de S1) não se descarta só com estas imagens. Um radiologista deve confirmar os níveis antes de a aula ir para os alunos.

## Fase 2: casos novos (dados)

Preparado em 29/10/2026. Só dados: seis casos novos do SPIDER em `dist/rm/<caso>/`, ainda fora do `src/rm.js`. Nenhum arquivo de código mudou.

Critério, a pedido do Gustavo: todo caso novo tem T2 SPACE (0,9 mm), para o axial sair nítido, e também T1 e T2 comuns. Um caso sem SPACE só entraria se nenhum caso com SPACE tivesse o achado; Não foi preciso. Dos 36 pacientes graduados com SPACE, 35 são de 1,5 T (Siemens Avanto_fit); Os seis escolhidos também. Os 6 pacientes com níveis divergentes (35, 55, 57, 64, 98, 118) ficaram de fora.

O SPIDER gradua placa terminal e nódulo de Schmorl juntos. Trecho do artigo: "Upper and lower endplate changes/Schmorl nodes (binary)".

### Casos

| Caso | Achado-chave | Nível (rótulo) | Por quê |
|---|---|---|---|
| 5 | quase normal; substitui o 237 na aula de base | todos | Três pacientes com SPACE não têm achado além de abaulamento: 5, 41 e 141. Só o 5 tem também T1 e T2 comuns. Pfirrmann 2 em todos os discos e abaulamento nos 3 de baixo. O 41 e o 141 têm Pfirrmann 1 em tudo, mas só o SPACE (o 141 é de 3 T) |
| 200 | listese | L5-S1 (201) | Listese isolada: L5-S1 é o único nível alterado (Pfirrmann 5, Modic 2, estreitamento, abaulamento) e os outros 6 discos estão em Pfirrmann 2, sem achados. É o de menos achados entre os 9 com SPACE e listese em L5-S1 ou L4-L5. No sagital, L5 está deslocada para a frente sobre o sacro |
| 136 | nódulos de Schmorl | T12-L1 (206), T11-T12 (207), L1-L2 (205) | Alteração de placa em 5 níveis. Em 205, 206 e 207 ela é o único achado: sem Modic, estreitamento, hérnia nem abaulamento, e com Pfirrmann 3. No SPACE os nódulos são entalhes nítidos das placas, o maior em T12-L1. O 239 (achado parecido, Pfirrmann 2) foi convertido para comparar e descartado: os nódulos são menores |
| 81 | disco preto e colapsado (Pfirrmann 5) | L4-L5 (202) | L4-L5 com Pfirrmann 5, estreitamento grave e Modic 2. L5-S1 em Pfirrmann 4 com estreitamento e os outros 5 discos em Pfirrmann 2. O 200 também tem Pfirrmann 5, mas ficou para a listese |
| 50 | Modic 1 | L2-L3 (204) | É o único paciente com SPACE e Modic 1. Tem Modic 2 em L4-L5, L1-L2 e T12-L1, então os dois tipos aparecem no mesmo exame: no tipo 1 a medula perto da placa fica escura no T1 e clara no T2, e no tipo 2 fica clara no T1. Caso carregado: todos os discos em Pfirrmann 3 a 4, hérnia e listese em L4-L5, e a coluna curva para o lado (o centro dos corpos anda 27 mm de L5 a T11; escoliose ou paciente inclinado no aparelho) |
| 142 | hérnia em L4-L5 | L4-L5 (202) | Nível diferente do caso 45. Entre os 7 com SPACE e hérnia fora de L5-S1, é o único sem Modic. O 107 tem menos níveis alterados, mas em L4-L5 a hérnia dele vem com Pfirrmann 5, Modic 2 e listese; O 209 tem o SPACE de outro aparelho. No 142 a hérnia vem com listese no mesmo nível, e o axial do SPACE mostra o saco dural apertado. Nenhum caso com SPACE tem hérnia isolada em L4-L5; Os que têm (por exemplo 12, 67, 168 e 174) não têm SPACE |

### Graduação por nível

De baixo para cima. P é o grau de Pfirrmann; "placa" é alteração de placa ou nódulo de Schmorl (sup. e inf. são as colunas `UP endplate` e `LOW endplate`).

- **5**: L5-S1 P2, abaulamento; L4-L5 P2, abaulamento; L3-L4 P2, abaulamento; L2-L3, L1-L2, T12-L1 e T11-T12 P2.
- **200**: L5-S1 P5, Modic 2, listese, estreitamento, abaulamento; L4-L5 a T11-T12 P2, sem achados.
- **136**: L5-S1 P4, estreitamento, abaulamento; L4-L5 P3, abaulamento; L3-L4 P3, placa sup. e inf., abaulamento; L2-L3 P3, Modic 2, placa sup. e inf., abaulamento; L1-L2, T12-L1 e T11-T12 P3, placa sup. e inf.
- **81**: L5-S1 P4, estreitamento, abaulamento; L4-L5 P5, Modic 2, placa sup. e inf., estreitamento, abaulamento; L3-L4 a T11-T12 P2, sem achados.
- **50**: L5-S1 P4; L4-L5 P4, Modic 2, placa sup. e inf., listese, hérnia, estreitamento, abaulamento; L3-L4 P4, placa sup. e inf., abaulamento; L2-L3 P4, **Modic 1**, placa sup. e inf., estreitamento, abaulamento; L1-L2 e T12-L1 P4, Modic 2, placa sup. e inf., abaulamento; T11-T12 P4, placa sup. e inf., abaulamento; T10-T11 P3.
- **142**: L5-S1 P4; L4-L5 P4, placa sup., listese, hérnia; L3-L4 P4, abaulamento; L2-L3 P4, placa sup. e inf., estreitamento, abaulamento; L1-L2 P4, placa sup. e inf., abaulamento; T12-L1 P3; T11-T12 P3, placa inf.

No formato `g` do `src/rm.js` (`[Modic, placa superior, placa inferior, listese, hérnia, estreitamento, abaulamento, Pfirrmann]`, um disco por linha, de baixo para cima):

```js
const g5 = [[0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 1, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
const g200 = [[2, 0, 0, 1, 0, 1, 1, 5], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
const g136 = [[0, 0, 0, 0, 0, 1, 1, 4], [0, 0, 0, 0, 0, 0, 1, 3], [0, 1, 1, 0, 0, 0, 1, 3], [2, 1, 1, 0, 0, 0, 1, 3], [0, 1, 1, 0, 0, 0, 0, 3], [0, 1, 1, 0, 0, 0, 0, 3], [0, 1, 1, 0, 0, 0, 0, 3]];
const g81 = [[0, 0, 0, 0, 0, 1, 1, 4], [2, 1, 1, 0, 0, 1, 1, 5], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2], [0, 0, 0, 0, 0, 0, 0, 2]];
const g50 = [[0, 0, 0, 0, 0, 0, 0, 4], [2, 1, 1, 1, 1, 1, 1, 4], [0, 1, 1, 0, 0, 0, 1, 4], [1, 1, 1, 0, 0, 1, 1, 4], [2, 1, 1, 0, 0, 0, 1, 4], [2, 1, 1, 0, 0, 0, 1, 4], [0, 1, 1, 0, 0, 0, 1, 4], [0, 0, 0, 0, 0, 0, 0, 3]];
const g142 = [[0, 0, 0, 0, 0, 0, 0, 4], [0, 1, 0, 1, 1, 0, 0, 4], [0, 0, 0, 0, 0, 0, 1, 4], [0, 1, 1, 0, 0, 1, 1, 4], [0, 1, 1, 0, 0, 0, 1, 4], [0, 0, 0, 0, 0, 0, 0, 3], [0, 0, 1, 0, 0, 0, 0, 3]];
```

### Conferência da numeração

Mesmo método da fase 1: no T2 sagital mediano, conto a partir do sacro. Nos seis casos o osso logo abaixo do disco 201 é o sacro, com os segmentos sacrais e o promontório, e a vértebra 1 é a primeira acima do disco 201. A numeração confere com 1 = L5 e 201 = L5-S1 em todos.

| Caso | Vértebras e discos na máscara | Resultado |
|---|---|---|
| 5 | 1 a 7, 201 a 207 (L5 a T11) | Confere |
| 200 | 1 a 7, 201 a 207 | Confere. L5 deslizada para a frente sobre S1. O disco rudimentar S1-S2 é bem formado, então não dá para descartar S1 lombarizada só com este recorte |
| 136 | 1 a 6, 201 a 207 (a vértebra 7 não está na máscara; o disco 207 fica no topo do recorte) | Confere |
| 81 | 1 a 7, 201 a 207 | Confere |
| 50 | 1 a 8, 201 a 208 (L5 a T10) | Confere. Disco 201 em cunha, apoiado no sacro |
| 142 | 1 a 7, 201 a 207 | Confere |

Como na fase 1, o recorte não mostra a coluna inteira nem as costelas: uma vértebra de transição não se descarta. Um radiologista deve confirmar os níveis.

### Conversão e tamanhos

Mesmo pipeline e mesmo script (`convert.py`): recorte pela caixa da máscara com 45 mm na direção cabeça-pé, imagem em int16 e máscara em uint8, gzip nível 9. T1 e T2 sem reamostragem. SPACE de 0,47 mm para 0,75 mm no plano, mantendo 0,9 mm entre cortes, como no 45. Os mesmos nomes dos casos anteriores. Quando a máscara do T1 é byte a byte igual à do T2 (5, 200, 136 e 142), só há `<caso>_t2_mask.nii.gz`, e o T1 usa essa máscara, como no 45. No 81 e no 50 as máscaras diferem (no 50 até a grade: 30 x 273 x 364 no T1 e 30 x 275 x 366 no T2), então há também `<caso>_t1_mask.nii.gz`.

| Caso | T2 | T1 | SPACE (grade) | Máscaras | Total (MiB) |
|---|---|---|---|---|---|
| 5 | 2,00 | 1,97 | 8,36 (192 x 386 x 120) | 0,11 | 12,4 |
| 200 | 1,98 | 1,94 | 11,60 (120 x 179 x 361) | 0,09 | 15,6 |
| 136 | 2,55 | 2,61 | 10,61 (211 x 389 x 120) | 0,13 | 15,9 |
| 81 | 2,63 | 2,66 | 10,56 (130 x 155 x 372) | 0,14 | 16,0 |
| 50 | 2,69 | 2,78 | 10,31 (211 x 400 x 120) | 0,19 | 16,0 |
| 142 | 3,49 | 3,53 | 13,79 (108 x 204 x 402) | 0,13 | 21,0 |

Os MHA originais têm de 4 a 6 MB (T1, T2) e de 33 a 41 MB (SPACE). Os seis casos somam 96,9 MiB em 32 arquivos, 65,2 MiB deles de SPACE. Com os três casos da fase 1, `dist/rm` passa de 27,7 para 124,5 MiB. O maior arquivo é `142_t2_SPACE.nii.gz`, com 13,8 MiB, abaixo dos 25 MiB do Pages, mas cinco SPACE passam de 10 MB. Como `dist/` é versionado, cada versão dos casos soma quase 100 MiB ao git.

### Posições dos rótulos (`at`)

São os centros em mm (RAS) da máscara do T2, como no `src/rm.js`, calculados com nibabel pelo mesmo método (o script reproduz o `at` do caso 45). No mesmo caso, os centros do T2 e do SPACE diferem até 3 mm. Nas 12 capturas abaixo, a mira posta no `at` caiu no rótulo pedido no T2, no SPACE e no T1.

```js
// 5: base (L4-L5 e L5-S1 normais)
at: { 1: [-4.1, -11.4, -52.3], 2: [-6.6, -14.2, -16.9], 100: [-5.0, -41.6, 38.8], 201: [-5.3, -6.0, -71.3], 202: [-5.8, -4.3, -34.4], 203: [-6.6, -9.5, 3.3] }
// 200: listese em L5-S1 (201); vértebra 1 = L5 que deslizou
at: { 1: [-10.0, -12.6, 31.0], 2: [-10.9, -8.4, 65.9], 100: [-12.3, -38.2, 120.0], 201: [-9.3, -11.6, 14.9], 202: [-9.1, 1.2, 46.2], 203: [-10.5, -0.6, 85.1] }
// 136: Schmorl em 205, 206 (o mais nítido) e 207
at: { 1: [2.9, 18.2, -43.7], 2: [1.6, 16.2, -9.2], 5: [1.3, -21.5, 93.3], 6: [1.6, -32.6, 124.8], 100: [1.7, -24.6, 61.8], 201: [3.1, 29.4, -63.4], 202: [2.2, 30.4, -25.9], 203: [0.9, 24.6, 12.7], 205: [2.0, -4.1, 82.0], 206: [1.3, -16.1, 114.1], 207: [2.9, -28.6, 144.0] }
// 81: Pfirrmann 5 em L4-L5 (202)
at: { 1: [4.1, -11.1, 11.1], 2: [5.1, -8.2, 39.8], 100: [1.1, -26.1, 108.0], 201: [1.9, -8.6, -8.0], 202: [3.9, -1.1, 24.2], 203: [5.5, 2.2, 59.1] }
// 50: Modic 1 em L2-L3 (204), Modic 2 em 202, 205 e 206; coluna curva para o lado, então cada passo centra no próprio rótulo
at: { 1: [-6.4, -12.2, 4.1], 2: [-9.0, -4.6, 36.7], 3: [2.1, -11.8, 68.8], 4: [12.5, -21.8, 98.3], 5: [17.1, -35.1, 129.1], 100: [7.2, -46.5, 91.8], 201: [-7.7, -7.0, -16.0], 202: [-12.7, 2.8, 19.6], 203: [-4.5, 3.7, 55.0], 204: [11.5, -3.6, 86.3], 205: [16.6, -16.6, 119.0], 206: [20.1, -32.3, 149.3] }
// 142: hérnia e listese em L4-L5 (202)
at: { 1: [20.4, -3.9, -47.5], 2: [21.3, 12.9, -18.2], 100: [17.7, -23.9, 35.3], 201: [19.8, -0.3, -66.5], 202: [20.7, 17.3, -37.8], 203: [21.6, 26.1, -0.5] }
```

No 50, o sagital que passa por L2-L3 (x = 11,5 mm) não mostra L5-S1 (x = -7,7 mm), por causa da curva lateral. No 136, os nódulos aparecem bem no sagital que passa pelo centro do disco 206.

### Capturas

Ficam em `/tmp/claude-0/-home-user-aula-coluna-3d/3798958d-74ac-5d1d-b223-b01b1d5553a8/scratchpad/rm2/`. São do protótipo da fase 1 (`proto/index.html`), lendo os arquivos novos, em 1440 x 900, com a mira no `at` do achado. Cada uma tem uma versão com máscara e outra sem (`_nomask`): `5_t2_L4L5`, `5_space_L4L5`, `200_t2_listese_L5S1`, `200_space_listese_L5S1`, `136_t2_schmorl_T12L1`, `136_space_schmorl_T12L1`, `81_t2_pfirrmann5_L4L5`, `81_space_pfirrmann5_L4L5`, `50_t2_modic1_L2L3`, `50_t1_modic1_L2L3`, `142_t2_hernia_L4L5`, `142_space_hernia_L4L5`. As prévias e os recortes ampliados usados na escolha estão em `rm2/prev/`. Os scripts novos estão em `scripts/`: `pick2.py` (seleção), `centers.py` (`at`), `shoot2.js` (capturas), e `sagprev.py`, `zoomlv.py` e `lzoom.py` (prévias).

### O que o SPIDER não tem

- **Vácuo discal**: não é graduado. Para "disco muito escuro" o caso é o 81 (Pfirrmann 5).
- **Modic 1**: só 4 discos em 3 pacientes (50, 154 e 68). Só o 50 tem SPACE.
- **Modic 3**: 7 discos em 6 pacientes; Só o 78 tem SPACE (L5-S1, com hérnia e Pfirrmann 5). Não foi convertido.
- **Schmorl separado de outras alterações de placa**: não existe; A coluna é a mesma.
- **Hérnia isolada fora de L5-S1 com SPACE**: nenhuma. O 209 tem hérnia em L4-L5, mas o SPACE dele vem de outro aparelho (1,5 T) que o T1 e o T2 (3 T), e foi evitado.
- **SPACE em 3 T**: só o 141, que não tem T1 nem T2 comuns.

### RSNA LumbarDISC: axial nativo

Atualização de 29/10/2026: o acesso veio depois, por um link pré-assinado. Os casos estão na seção "RSNA: casos com axial nativo".

O dataset RSNA-LSDD (agora LumbarDISC) tem axial T2 adquirido, não reconstruído. Para baixar 2 ou 3 estudos sem o login do Gustavo, foram testadas três vias, e as três pedem conta:

- **Bucket AWS** `lumbar-spine-degenerative-classification` (us-west-2): o registro do AWS Open Data o marca como "Controlled Access", via MIRA. Pedidos sem credencial, de listagem ou de arquivo, voltam 403.
- **MIRA**, dataset 6 (https://imaging.rsna.org/dataset/6): a página é pública, mas a API redireciona para `/login`, e o download fica atrás de "Request Data".
- **Kaggle**, competição `rsna-2024-lumbar-spine-degenerative-classification`: a API de download de arquivo responde 401 sem token.

Então a comparação do axial nativo com a reconstrução do SPIDER não foi feita. O caminho mais curto é o Kaggle, porque baixa arquivo por arquivo (`kaggle competitions download -c rsna-2024-lumbar-spine-degenerative-classification -f train_images/<estudo>/<série>/<n>.dcm`), sem o zip inteiro. O Gustavo precisa:

1. Entrar no kaggle.com, abrir a aba Rules da competição (https://www.kaggle.com/competitions/rsna-2024-lumbar-spine-degenerative-classification/rules) e aceitar as regras.
2. Em Settings, seção API, clicar em "Create New Token". Isso baixa um `kaggle.json` com o usuário e a chave.
3. Pôr os dois valores nas configurações do ambiente da nuvem (menu do ambiente na barra de título da sessão, Editar), em Network secrets ou como variáveis de ambiente, com os nomes `KAGGLE_USERNAME` e `KAGGLE_KEY`. Uma sessão nova já os lê. A chave não deve ir pelo chat.

Se a competição não aceitar mais inscrição, a via é o MIRA: entrar, pedir o dataset 6 e aceitar os termos. Não se sabe se o MIRA dá acesso arquivo por arquivo ou só ao zip inteiro.

Crédito: a página do MIRA dá o DOI 10.1148/dataset.lsdd.2025. O artigo é Richards TJ et al., The RSNA Lumbar Degenerative Imaging Spine Classification (LumbarDISC) Dataset, Radiol Artif Intell 2026;8(2):e250480, doi:10.1148/ryai.250480. O texto de licença do registro AWS cita, por erro de cópia, o dataset de mamografia RSNA-SMBC.

## RSNA: casos com axial nativo

Feito em 29/10/2026. Três estudos do RSNA-LSDD (LumbarDISC) com axial T2 adquirido, não reconstruído, convertidos para NIfTI em `dist/rm/rsna-<estudo>/`. Nenhum arquivo de `src/` ou `tests/` mudou.

Crédito a mostrar: "RSNA Lumbar Spine Degenerative Classification Dataset (RSNA-LSDD / LumbarDISC), Radiological Society of North America", DOI https://doi.org/10.1148/dataset.lsdd.2025.

### Acesso e conteúdo do zip

- O acesso foi por um link pré-assinado do S3 para `rsna-2024-lsdd.zip`, válido por 7 dias a partir de 29/10/2026 19:03 UTC, que aceita Range (resposta 206). O link é uma credencial: fica só na pasta de rascunho da sessão, nunca no repositório. Com `remotezip` se lê o índice do zip e só os membros pedidos. Foram baixados os 3 CSV de rótulos (5,2 MiB), o cabeçalho de 3.265 DICOM (uns 25 KB cada, por Range, descomprimindo só o começo), 171 DICOM de prévia (40,5 MiB) e as 9 séries escolhidas (263 DICOM, 35,1 MiB). O zip inteiro não foi baixado.
- O zip tem 155.596 membros, com 35,3 GB descomprimidos (29,8 GB comprimidos). Tudo fica sob `rsna-2024-lumbar-spine-degenerative-classification/`:
  - `train.csv`: 1975 estudos. Colunas `study_id` e 25 graduações, de `spinal_canal_stenosis_l1_l2` a `right_subarticular_stenosis_l5_s1`, com os valores `Normal/Mild`, `Moderate` e `Severe`.
  - `train_series_descriptions.csv`: colunas `study_id, series_id, series_description`. São 1980 séries `Sagittal T1`, 1974 `Sagittal T2/STIR` e 2340 `Axial T2`.
  - `train_label_coordinates.csv`: 48.692 linhas com `study_id, series_id, instance_number, condition, level, x, y`. O canal é marcado no sagital T2, os forames no sagital T1 e os recessos subarticulares no axial. O nível vem escrito como `L4/L5`.
  - `train_images/<study_id>/<series_id>/<instance>.dcm`: 147.218 DICOM.
  - `test_images/` (1 estudo, 97 DICOM), `test_series_descriptions.csv` e `sample_submission.csv`.
- O zip não tem arquivo de licença nem de termos, só os 5 CSV e os DICOM. Vale a decisão já tomada: uso não comercial, com compartilhamento permitido mediante citação, conforme o texto de licença da RSNA em github.com/RSNA/AI-Challenge-Data.
- Os DICOM estão em RLE sem perda, com 12 bits e `PatientPosition` HFS. Sobram poucas tags: geometria, UIDs, `PatientID`, `ContentDate` e janela. `SeriesDescription` vem vazio, e não há TE, TR nem TI. Por isso, T2 e STIR só se distinguem olhando a imagem: no T2 a gordura é clara, no STIR é escura.

### Escolha

O filtro nos CSV pegou estudos com exatamente uma série de cada tipo, graduação completa e pontos do axial em L4/L5 e L5/S1. Sobraram 214 estudos para o papel (a), tudo normal/leve, 179 para o (b), canal grave em L4-L5, e 224 para o (c), subarticular ou forame grave de um lado só em L4-L5 ou L5-S1, com o outro lado e o canal normais/leves no nível. Entre os que têm axial com 35 imagens ou mais, 38 tiveram os cabeçalhos lidos, para ver os blocos, e 16 ganharam prévias dos sagitais e dos axiais nos níveis marcados. Ficaram de fora os de sagital STIR (113758629 e 1502243484 para o papel a; 4646740 e 200354973 para o b).

| Estudo | Papel | Séries (sag T1 / sag T2 / axial T2) | Por quê |
|---|---|---|---|
| 491250714 | (a) tudo normal/leve | 3006601672 / 4212608450 / 613508131 | O sagital é T2, não STIR. O axial é uma pilha só, de L1 ao sacro (50 cortes de 0,56 mm no plano). Em L4-L5 o canal é amplo, e em L5-S1 as raízes de S1 aparecem nítidas. Ponto fraco: o sagital T1 tem 256 x 256 (1,0 mm). |
| 1435972903 | (b) canal grave em L4-L5 | 3246798172 / 655221258 / 1587054823 | O sagital é T2, e o axial é uma pilha só (61 cortes, 0,56 mm). Em L4-L5 o saco dural vira um trevo com as raízes agrupadas, e em L5-S1 o canal é normal, então o contraste está no mesmo exame. L4-L5 também tem subarticular esquerdo grave e forames moderados; o resto é normal/leve. |
| 3489738948 | (c) subarticular direito grave em L4-L5 | 2587818987 / 4120337982 / 3186939889 | É o único achado do exame: os outros 24 itens são normais/leves. O sagital é T2 com 640 x 640 (0,47 mm). O axial vem em dois blocos e serve de exemplo de bloco oblíquo. |

Graduação completa (`train.csv`):

| Estudo | Nível | Canal | Forame E | Forame D | Subarticular E | Subarticular D |
|---|---|---|---|---|---|---|
| 491250714 | L1-L2 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 491250714 | L2-L3 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 491250714 | L3-L4 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 491250714 | L4-L5 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 491250714 | L5-S1 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 1435972903 | L1-L2 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 1435972903 | L2-L3 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 1435972903 | L3-L4 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 1435972903 | L4-L5 | **grave** | **moderada** | **moderada** | **grave** | normal/leve |
| 1435972903 | L5-S1 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 3489738948 | L1-L2 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 3489738948 | L2-L3 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 3489738948 | L3-L4 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |
| 3489738948 | L4-L5 | normal/leve | normal/leve | normal/leve | normal/leve | **grave** |
| 3489738948 | L5-S1 | normal/leve | normal/leve | normal/leve | normal/leve | normal/leve |

### Conversão, blocos e tamanhos

O script `rsna/scripts/dcm2nii.py`, na pasta de rascunho, lê cada série com pydicom e a separa em blocos de mesma `ImageOrientationPatient` e passo regular ao longo da normal. Ele confere essas duas condições, ordena os cortes pela normal e monta o NIfTI só com a geometria (`ImagePositionPatient`, `ImageOrientationPatient`, `PixelSpacing` e o passo medido entre posições). A imagem fica em int16 e é gravada pelo SimpleITK com gzip nível 9. Não há reamostragem nem recorte.

- **Blocos do axial.** Em 491250714 e 1435972903 o axial é um bloco só, inclinado 1,2° e 1,7° em relação ao eixo do aparelho: é um axial reto, não paralelo ao disco. Em 3489738948 são dois blocos de 23 imagens. O das instâncias 1 a 23 é reto (0°) e tem os pontos de L1/L2 e L2/L3. O das instâncias 24 a 46 é inclinado 12° e cobre de L3-L4 a L5-S1, com os pontos desses três níveis. Só o segundo foi mantido, como `ax_t2.nii.gz`. Como um bloco só cobre L4-L5 e L5-S1, ele não foi dividido em `ax_t2_l45` e `ax_t2_l5s1`. Não é um bloco por disco, e sim um bloco inclinado para os discos de baixo.
- **Orientação.** O axial fica em LPS e os sagitais em PIR (códigos do nibabel), com qform igual ao sform e código 1. A NiiVue posiciona sozinha.
- **Metadados.** Nos cabeçalhos, `descrip`, `aux_file`, `intent_name` e `db_name` estão vazios e não há extensões. Nenhum identificador dos DICOM (`PatientID`, UIDs, `ContentDate`) aparece nos bytes descomprimidos de nenhum arquivo. O nome da pasta leva o `study_id`, que é o identificador público do dataset.
- **Origem deslocada.** Os três arquivos de cada estudo foram transladados juntos, para que o ponto (0, 0, 0) do mundo caia no canal em L4-L5: o meio dos dois pontos subarticulares de L4/L5 no axial. A geometria entre as séries não muda. Motivo: no modo padrão (`isSliceMM: false`), a NiiVue converte mm em voxel com uma matriz sem obliquidade, ancorada no (0, 0, 0) do mundo (`frac2mmOrtho`, em `calculateOblique`). O erro cresce com a distância à origem vezes o seno da obliquidade. Nas coordenadas do aparelho, o 3489738948 fica em z ≈ -540 mm, e o sagital sincronizado caía 2 cortes (uns 10 mm) fora da linha média. Com o deslocamento, a diferença entre o modo padrão e o sform exato, nos pontos de L4-L5 e L5-S1, ficou em até 1,8 mm nos volumes quase ortogonais. No bloco axial de 12° do 3489738948 ela chega a 6,5 mm, quase toda no sentido anteroposterior dentro do corte; o corte escolhido erra menos de 1 mm. Para centrar exato nesse bloco há duas saídas: usar o `ijk` abaixo ou ligar `isSliceMM: true`, que porém refaz o axial nos eixos do aparelho e perde o plano nativo. A escolha fica para a implementação.

| Arquivo | Matriz | Voxel (mm) | 491250714 | 1435972903 | 3489738948 |
|---|---|---|---|---|---|
| `sag_t1.nii.gz` | 256x256x15 / 384x408x23 / 384x384x15 | 1,02x1,02x4,4 / 0,68x0,68x4,4 / 0,78x0,78x4,8 | 0,85 MiB | 3,79 MiB | 1,78 MiB |
| `sag_t2.nii.gz` | 384x384x15 / 384x408x23 / 640x640x15 | 0,68x0,68x4,4 / 0,68x0,68x4,4 / 0,47x0,47x4,8 | 1,89 MiB | 3,83 MiB | 5,38 MiB |
| `ax_t2.nii.gz` | 320x320x50 / 320x320x61 / 320x320x23 | 0,56x0,56x4,4 / 0,56x0,56x4,4 / 0,63x0,63x4,4 | 5,09 MiB | 7,28 MiB | 2,19 MiB |

As colunas de matriz e voxel seguem a ordem 491250714 / 1435972903 / 3489738948. Todos os arquivos ficam abaixo de 10 MiB, com 33 MiB no total.

### Pontos dos radiologistas no NIfTI

Cada ponto (série, instância, x, y) vira LPS = `ImagePositionPatient` + x · espaçamento entre colunas · cosseno da linha + y · espaçamento entre linhas · cosseno da coluna. Depois se soma o deslocamento do estudo e se passa para RAS, que é o que a NiiVue usa em `mm2frac`. O `ijk` é o voxel no arquivo: i é a coluna (x do CSV), j é a linha (y do CSV) e k é o índice do corte no NIfTI, que não é o número da instância. O script confere que cada ponto volta, pelo SimpleITK, ao pixel e ao corte marcados.

O axial não tem ponto de canal. Para centrar no canal, use o meio dos dois subarticulares do nível, que as linhas "canal (meio dos subart.)" já trazem; em L4-L5 esse meio é (0, 0, 0) por construção. Os dois lados nem sempre estão no mesmo corte: no 1435972903, em L4/L5, ficam nas instâncias 43 e 44.

```
// rsna-491250714: origem = scanner (LPS) + [-28.5, -68.2, 33.2] mm
ax_t2   canal (meio dos subart.) L4/L5  ras [   0.0,    0.0,    0.1]
ax_t2   canal (meio dos subart.) L5/S1  ras [   0.4,  -12.8,  -31.0]
ax_t2   subart. D  L1/L2  ras [  11.1,   -4.9,  105.4]  ijk [143.9, 185.9, 38]
ax_t2   subart. D  L2/L3  ras [  13.0,   -0.6,   70.2]  ijk [139.7, 179.2, 30]
ax_t2   subart. D  L3/L4  ras [   8.8,    3.8,   30.8]  ijk [146.4, 172.6, 21]
ax_t2   subart. D  L4/L5  ras [  11.5,    0.4,   -0.1]  ijk [140.8, 179.5, 14]
ax_t2   subart. D  L5/S1  ras [  12.3,  -12.1,  -31.1]  ijk [138.7, 202.6, 7]
ax_t2   subart. E  L1/L2  ras [ -11.8,   -4.0,  105.7]  ijk [184.6, 184.4, 38]
ax_t2   subart. E  L2/L3  ras [ -11.6,    0.1,   66.2]  ijk [183.5, 178.1, 29]
ax_t2   subart. E  L3/L4  ras [ -11.7,    4.2,   31.0]  ijk [182.9, 171.7, 21]
ax_t2   subart. E  L4/L5  ras [ -11.5,   -0.4,    0.2]  ijk [181.7, 180.9, 14]
ax_t2   subart. E  L5/S1  ras [ -11.6,  -13.5,  -30.9]  ijk [181.2, 205.1, 7]
sag_t1  forame D   L1/L2  ras [  19.6,   -4.5,  106.4]  ijk [138.8, 55.4, 11]
sag_t1  forame D   L2/L3  ras [  18.7,    0.8,   72.4]  ijk [133.6, 88.9, 11]
sag_t1  forame D   L3/L4  ras [  22.2,    6.9,   36.6]  ijk [127.6, 124.1, 12]
sag_t1  forame D   L4/L5  ras [  21.4,    7.8,    4.0]  ijk [126.7, 156.2, 12]
sag_t1  forame D   L5/S1  ras [  25.1,    0.1,  -24.3]  ijk [134.3, 184.0, 13]
sag_t1  forame E   L1/L2  ras [ -15.6,   -2.8,  108.6]  ijk [137.1, 54.2, 3]
sag_t1  forame E   L2/L3  ras [ -16.4,    3.2,   75.3]  ijk [131.3, 86.9, 3]
sag_t1  forame E   L3/L4  ras [ -17.2,    5.1,   43.7]  ijk [129.3, 118.1, 3]
sag_t1  forame E   L4/L5  ras [ -18.1,    6.3,    8.5]  ijk [128.1, 152.7, 3]
sag_t1  forame E   L5/S1  ras [ -18.8,    0.8,  -21.6]  ijk [133.6, 182.4, 3]
sag_t2  canal      L1/L2  ras [   1.9,   -4.9,  102.9]  ijk [208.8, 88.9, 7]
sag_t2  canal      L2/L3  ras [   1.0,    0.3,   68.7]  ijk [201.2, 139.5, 7]
sag_t2  canal      L3/L4  ras [   0.2,    2.1,   34.9]  ijk [198.4, 189.4, 7]
sag_t2  canal      L4/L5  ras [  -0.7,   -4.0,    1.6]  ijk [207.4, 238.6, 7]
sag_t2  canal      L5/S1  ras [  -1.3,  -18.5,  -24.2]  ijk [228.9, 276.7, 7]
```

```
// rsna-1435972903: origem = scanner (LPS) + [-2.7, -51.3, 15.6] mm
ax_t2   canal (meio dos subart.) L4/L5  ras [   0.0,   -0.1,   -0.0]
ax_t2   canal (meio dos subart.) L5/S1  ras [   3.6,   -3.4,  -35.3]
ax_t2   subart. D  L1/L2  ras [  10.1,   -8.4,  112.0]  ijk [145.1, 182.9, 43]
ax_t2   subart. D  L2/L3  ras [  10.2,   -1.3,   77.0]  ijk [145.1, 172.0, 35]
ax_t2   subart. D  L3/L4  ras [   9.1,    2.4,   37.5]  ijk [147.4, 167.4, 26]
ax_t2   subart. D  L4/L5  ras [   7.7,    0.1,    2.2]  ijk [150.3, 173.1, 18]
ax_t2   subart. D  L5/S1  ras [  13.9,   -3.1,  -37.4]  ijk [140.0, 181.1, 9]
ax_t2   subart. E  L1/L2  ras [  -7.7,  -10.8,  111.9]  ijk [177.0, 186.3, 43]
ax_t2   subart. E  L2/L3  ras [  -8.3,   -3.5,   76.9]  ijk [178.1, 175.2, 35]
ax_t2   subart. E  L3/L4  ras [  -7.2,    0.3,   37.4]  ijk [176.4, 170.3, 26]
ax_t2   subart. E  L4/L5  ras [  -7.7,   -0.2,   -2.3]  ijk [177.8, 173.2, 17]
ax_t2   subart. E  L5/S1  ras [  -6.8,   -3.6,  -33.2]  ijk [176.7, 180.9, 10]
sag_t1  forame D   L1/L2  ras [  24.0,  -10.3,  121.5]  ijk [234.6, 106.0, 16]
sag_t1  forame D   L2/L3  ras [  23.8,   -0.8,   87.1]  ijk [220.5, 156.9, 16]
sag_t1  forame D   L3/L4  ras [  28.0,    8.5,   42.6]  ijk [207.3, 222.6, 17]
sag_t1  forame D   L4/L5  ras [  28.4,    6.9,   11.9]  ijk [209.6, 267.9, 17]
sag_t1  forame D   L5/S1  ras [  28.5,   10.6,  -26.2]  ijk [204.1, 324.2, 17]
sag_t1  forame E   L1/L2  ras [ -15.3,  -16.2,  126.3]  ijk [239.8, 98.5, 7]
sag_t1  forame E   L2/L3  ras [ -15.7,   -3.8,   85.6]  ijk [221.5, 158.6, 7]
sag_t1  forame E   L3/L4  ras [ -15.9,    3.6,   50.8]  ijk [210.5, 209.9, 7]
sag_t1  forame E   L4/L5  ras [ -15.5,    3.2,   12.6]  ijk [211.2, 266.3, 7]
sag_t1  forame E   L5/S1  ras [ -15.3,    5.2,  -21.1]  ijk [208.3, 316.1, 7]
sag_t2  canal      L1/L2  ras [   6.6,  -13.7,  117.4]  ijk [238.1, 111.9, 12]
sag_t2  canal      L2/L3  ras [   6.5,   -5.5,   78.7]  ijk [226.0, 169.0, 12]
sag_t2  canal      L3/L4  ras [   6.5,   -0.8,   42.0]  ijk [219.0, 223.2, 12]
sag_t2  canal      L4/L5  ras [   7.0,   -3.1,    4.6]  ijk [222.5, 278.5, 12]
sag_t2  canal      L5/S1  ras [   7.5,   -6.9,  -28.9]  ijk [228.2, 327.9, 12]
```

```
// rsna-3489738948: origem = scanner (LPS) + [-3.0, -67.7, 541.8] mm
ax_t2   canal (meio dos subart.) L4/L5  ras [   0.0,    0.1,   -0.1]
ax_t2   canal (meio dos subart.) L5/S1  ras [  -3.5,   -3.9,  -28.4]
ax_t2   subart. D  L3/L4  ras [   8.8,    3.5,   32.8]  ijk [146.1, 187.0, 19]
ax_t2   subart. D  L4/L5  ras [   9.3,    0.8,   -2.6]  ijk [144.4, 179.7, 11]
ax_t2   subart. D  L5/S1  ras [   6.4,   -5.0,  -28.3]  ijk [148.4, 180.2, 5]
ax_t2   subart. E  L3/L4  ras [  -9.2,    0.9,   33.7]  ijk [174.9, 191.5, 19]
ax_t2   subart. E  L4/L5  ras [  -9.3,   -0.7,    2.5]  ijk [174.2, 183.7, 12]
ax_t2   subart. E  L5/S1  ras [ -13.3,   -2.7,  -28.5]  ijk [180.0, 176.6, 5]
sag_t1  forame D   L1/L2  ras [  16.4,  -12.7,  113.0]  ijk [216.9, 99.5, 10]
sag_t1  forame D   L2/L3  ras [  15.6,   -8.0,   79.0]  ijk [210.9, 142.9, 10]
sag_t1  forame D   L3/L4  ras [  14.9,   -0.9,   43.5]  ijk [201.9, 188.3, 10]
sag_t1  forame D   L4/L5  ras [  18.9,    3.6,    8.7]  ijk [196.1, 232.8, 11]
sag_t1  forame D   L5/S1  ras [  18.3,    0.5,  -22.6]  ijk [200.0, 272.9, 11]
sag_t1  forame E   L1/L2  ras [  -7.6,  -11.1,  114.0]  ijk [214.7, 98.8, 5]
sag_t1  forame E   L2/L3  ras [ -13.2,   -4.7,   78.6]  ijk [206.6, 144.2, 4]
sag_t1  forame E   L3/L4  ras [ -13.9,   -0.1,   42.7]  ijk [200.7, 190.1, 4]
sag_t1  forame E   L4/L5  ras [ -14.6,    2.8,   10.8]  ijk [197.0, 231.0, 4]
sag_t1  forame E   L5/S1  ras [ -20.1,    2.3,  -23.6]  ijk [197.5, 275.1, 3]
sag_t2  canal      L1/L2  ras [   1.8,  -11.8,  106.6]  ijk [359.6, 179.9, 7]
sag_t2  canal      L2/L3  ras [   1.1,   -8.0,   70.9]  ijk [351.5, 256.2, 7]
sag_t2  canal      L3/L4  ras [   0.3,   -4.2,   34.1]  ijk [343.4, 334.7, 7]
sag_t2  canal      L4/L5  ras [  -0.4,   -4.8,    0.5]  ijk [344.5, 406.4, 7]
sag_t2  canal      L5/S1  ras [  -1.0,  -12.9,  -28.2]  ijk [361.9, 467.6, 7]
```

### Visualização e convenção radiológica

O protótipo `proto/rsna.html`, na pasta de rascunho, põe lado a lado duas instâncias da NiiVue 0.69.0, uma por volume, com as miras sincronizadas em mm por `syncWith`. Uma instância só com `setCustomLayout`, como na fase 1, não serve aqui: o sagital e o axial são volumes diferentes, e a NiiVue reamostra o segundo volume na grade do primeiro. O `syncWith` só propaga quando o canvas tem foco (`sync()` confere `:focus`), por isso nas capturas a mira foi posta nas duas instâncias por script.

- **Convenção radiológica.** É a opção `isRadiologicalConvention: true` no construtor (ou `nv.setRadiologicalConvention(true)`). O padrão é `false`, a convenção neurológica, com a esquerda do paciente à esquerda de quem olha. Medido no 3489738948 em L4-L5: com `false`, o ponto subarticular direito fica a 54,6% da largura do quadro e o esquerdo a 45,4%. Com `true` a ordem se inverte (direito a 45,4%, esquerdo a 54,6%), e a esquerda do paciente fica à direita de quem olha.
- **O que mais a opção muda.** Ela vira também o coronal (mesma medida) e troca as letras R/L nas bordas. O sagital não muda: o quadro saiu idêntico byte a byte. O render 3D também não, porque no código ela só vale para vistas 2D com `axCorSag < 2`. O sagital continua com o nariz para a direita (anterior à direita, "P" à esquerda). A vista habitual da radiologia, com o anterior à esquerda, é outra opção: `sagittalNoseLeft: true`.

As capturas estão em `/tmp/claude-0/-home-user-aula-coluna-3d/3798958d-74ac-5d1d-b223-b01b1d5553a8/scratchpad/rm3/`, em 1440 x 900 e na convenção radiológica:

- `<estudo>_L4L5.png` e `<estudo>_L5S1.png`: sagital T2 sincronizado com o axial nativo, para cada um dos três estudos;
- `<estudo>_vs_spider45_L4L5.png`: o axial nativo em L4-L5 ao lado do axial reconstruído do SPIDER 45 T2 SPACE, centrado no disco L4-L5 (rótulo 202);
- `conv_rad0.png` e `conv_rad1.png`: o 3489738948 em L4-L5 nas convenções neurológica e radiológica.

Comparação: o axial nativo mostra recessos, facetas e raízes com nitidez. O axial reconstruído do SPACE (0,9 mm) sai mais borrado e com campo lateral menor. Os scripts ficam em `rsna/scripts/` (`listzip.py`, `fetch.py`, `headscan.py`, `geom.py`, `pick.py`, `prevlist.py`, `montage.py`, `axzoom.py`, `dcm2nii.py`, `jobs.py`, `lmkmd.py`) e em `scripts/` (`shoot_rsna.js`, `orthocheck.js`). Os pontos em JSON estão em `rsna/landmarks.json`.

## Onde ficou o material do spike (fora do repo)

Pasta de rascunho da sessão `/tmp/claude-0/-home-user-aula-coluna-3d/3798958d-74ac-5d1d-b223-b01b1d5553a8/scratchpad/`:
- `cases/`: os 14 arquivos `.nii.gz`;
- `proto/index.html`: o protótipo;
- `rm1/`: as capturas e `metrics.json`;
- `scripts/`: os scripts de seleção, download por Range, conversão e captura (`pick.py`, `fetch.py`, `convert.py`, `shoot.js`).
