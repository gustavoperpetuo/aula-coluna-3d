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
- **Dados**: `src/rm.js` traz os casos, as séries, a graduação do SPIDER de cada disco, o centro em mm dos rótulos usados pelos passos e o texto dos 18 passos. O `build.py` junta o arquivo ao HTML da aula e ao do painel do administrador.
- **NiiVue**: o `<script>` da 0.69.0 com integridade só entra na página ao abrir o modo. Para os testes, a mesma versão está nas dependências de desenvolvimento (`@niivue/niivue` 0.69.0); O hash do pacote npm confere com o do `<script>`.
- **Cores**: a tabela de rótulos e a entrada transparente em -2 seguem iguais ao protótipo.
- **Toque**: `doubleTouchTimeout: 0` e `longTouchTimeout: 2e9` desligam o reinício de contraste por toque duplo ou longo (Infinity viraria 0 no `setTimeout`). O visualizador continua prendendo a rolagem sob o dedo; No celular ele tem altura fixa (56% da tela) e a página rola pelo texto abaixo dele.
- **3D**: o mesmo canvas, renderizador e cena do modo Anatomia. No modo Ressonância a seção do 3D vira um encarte de 200 x 214 px no canto do visualizador (CSS `.stage.rm .view`), e o `ResizeObserver` que já existia ajusta o renderizador. A estrutura clicada fica acesa com a mesma seleção (`S.sel`) do modo Anatomia, sem mover a câmera do encarte.
- **T1 e T2 lado a lado**: não há dois quadros simultâneos. O passo troca para o T1 e os botões T1 e T2 alternam o mesmo corte; Dois quadros pediriam uma segunda instância da NiiVue.

### Conferência da numeração das vértebras

Em cada caso, no corte sagital mediano do T2, contei a partir do sacro: o osso logo abaixo do disco 201 tem a forma do sacro (segmentos sacrais e inclinação do promontório), e a vértebra 1 da máscara é a primeira acima do disco 201. Nos três casos a numeração confere com 1 = L5, 201 = L5-S1, e nenhum mapa de rótulos foi mudado.

| Caso | Vértebras e discos na máscara | Resultado |
|---|---|---|
| 237 | 1 a 6 e 201 a 206 (L5 a T12, L5-S1 a T12-L1) | Confere. Disco 201 claro e alto, apoiado no sacro |
| 45 | 1 a 7 e 201 a 207 (L5 a T11, L5-S1 a T11-T12), igual no T2 e no SPACE | Confere |
| 10 | 1 a 7 e 201 a 207 (L5 a T11, L5-S1 a T11-T12) | Confere. Disco 201 escuro e baixo, apoiado no sacro |

O recorte não mostra a coluna inteira nem as costelas, então uma vértebra de transição (sacralização de L5 ou lombarização de S1) não se descarta só com estas imagens. Um radiologista deve confirmar os níveis antes de a aula ir para os alunos.

## Onde ficou o material do spike (fora do repo)

Pasta de rascunho da sessão `/tmp/claude-0/-home-user-aula-coluna-3d/3798958d-74ac-5d1d-b223-b01b1d5553a8/scratchpad/`:
- `cases/`: os 14 arquivos `.nii.gz`;
- `proto/index.html`: o protótipo;
- `rm1/`: as capturas e `metrics.json`;
- `scripts/`: os scripts de seleção, download por Range, conversão e captura (`pick.py`, `fetch.py`, `convert.py`, `shoot.js`).
