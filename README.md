# Aula 3D da coluna vertebral

Aula interativa de anatomia e doenças da coluna, do básico ao nível de especialista. Um único modelo 3D procedural (Three.js r128) serve às duas partes: 8 capítulos de anatomia com 30 passos e testes, e 18 doenças mostradas no próprio modelo, com alternância entre normal e doente, cortes sagital e axial e régua de níveis.

## Estrutura

- `src/head.html`: CSS e marcação da aula.
- `src/home.html`: hub das aulas, publicado na raiz do site.
- `src/geo.js`: geometria procedural da coluna (`buildSpine(mods)`); as doenças entram como modificações (`mods`).
- `src/content.js`: capítulos, passos, testes, fichas das estruturas e notas por nível.
- `src/disease.js`: as 18 doenças, com texto, fontes citadas e configuração da cena.
- `src/app.js`: interface, câmera, cortes, rótulos, régua e testes.
- `build.py`: junta tudo em `dist/coluna-vertebral.html`, um arquivo único que abre direto no navegador, e gera o hub em `dist/index.html`. Escreve doctype, `meta charset` e `meta viewport`; falha se encontrar travessão.
- `tests/`: testes automáticos em Playwright.
  - `smoke.js`: desktop, celular e falha do 3D.
  - `regua.js`: régua e desfazer seleção.
  - `ligamentos.js`: falha se corpo vertebral, sacro ou disco atravessar o LLA ou o LLP, na coluna normal e em todas as doenças.
  - `cortes.js`: confere que nenhuma lesão some ao trocar de corte.
- `docs/`: retrospectiva do projeto.

## Publicação

Site no Cloudflare Pages, ligado ao GitHub: hub em https://aula-coluna-3d.pages.dev/ e aula em https://aula-coluna-3d.pages.dev/coluna-vertebral. Todo push na `main` publica em cerca de 1 minuto; outros branches ganham prévia em `https://<branch-com-hifens>.aula-coluna-3d.pages.dev`. Build no Cloudflare: `python3 build.py`, saída `dist`. O `dist/` também vai versionado, então qualquer mudança em `src/` ou `build.py` sai com o `dist/` regerado no mesmo commit.

## Uso

    python3 build.py          # gera dist/coluna-vertebral.html e dist/index.html
    npm install               # three 0.128.0 e playwright 1.56.1, só para os testes
    npm test

O Playwright fica fixo em 1.56.1 porque usa o Chromium 1194, já instalado nas sessões do Claude Code na nuvem. Numa máquina sem esse Chromium, rodar antes `npx playwright install chromium`. O `cortes.js` é lento; para mudanças pequenas bastam `node tests/smoke.js` e `node tests/regua.js`.

Abra `dist/coluna-vertebral.html` no navegador. O arquivo carrega o Three.js por CDN.

## Como o código funciona

- Desenho sob demanda: `invalidate()` marca a cena como suja e o laço só renderiza nesse caso ou com destaque pulsando. Código novo que mude a cena, os rótulos ou algo sobre o 3D chama `invalidate()` (ou `applyVisuals()`, que já chama).
- Cache de modelos: o modelo normal e o da última doença ficam guardados, e alternar entre eles não remonta a geometria. Nada muta o modelo depois de montado, exceto `anchors` (Denis).
- `mergeGeoms` (`src/geo.js`) gera geometria indexada.
- Chaves de rótulo: chave de nível (C1 a L5, `sacrum`, `coccyx`) seleciona a vértebra inteira, igual à régua; chave de parte (`disc.L4-L5`, `C7.sp`) seleciona só a parte; `cam:<nível>` só leva a câmera, para conceitos como curvaturas e ápices.
- Layout no desktop (acima de 900 px): trilha à esquerda com Anatomia/Doenças e capítulos (`placeNav()` os devolve ao topo e ao painel no celular), recolhível pelo botão « com estado salvo; camadas e cortes sempre abertos no topo do 3D; divisória arrastável entre 3D e texto. Preferências ficam em `localStorage`, chave `coluna3d.v1`.
- O título da aula leva ao hub.

## Regras de conteúdo

- Todo número clínico tem fonte citada no texto.
- Sem travessões (o build falha se encontrar um).
- Depois de ponto, maiúscula; depois de ponto e vírgula, minúscula.
- Fundo claro, fonte de leitura (Source Sans 3), pouca caixa alta.

## Pendências

- Números ainda sem fonte aberta: ressonância após cerca de 6 semanas na hérnia; listese degenerativa em mulheres acima de 50 anos; corte ASAS de início antes dos 45 anos; preservar metade da faceta; Kishimoto (área das placas); Stoney (idade acima de 65).
- Capítulo de técnicas e implantes (TLIF, PLIF, ALIF, XLIF, OLIF, cages, parafusos); escopo a definir.
- `tests/cortes.js` ainda só relata as lesões que somem nos cortes; falta virar asserção.
- Site aberto ao público; Cloudflare Access ainda não configurado.
