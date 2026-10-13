# Aula 3D da coluna vertebral

Aula interativa de anatomia e doenças da coluna, do básico ao nível de especialista. Um único modelo 3D procedural (Three.js r128) serve às duas partes: 8 capítulos de anatomia com 30 passos e testes, e 18 doenças mostradas no próprio modelo, com alternância entre normal e doente, cortes sagital e axial e régua de níveis.

## Estrutura

- `src/head.html`: CSS e marcação.
- `src/geo.js`: geometria procedural da coluna (`buildSpine(mods)`); as doenças entram como modificações (`mods`).
- `src/content.js`: capítulos, passos, testes, fichas das estruturas e notas por nível.
- `src/disease.js`: as 18 doenças, com texto, fontes citadas e configuração da cena.
- `src/app.js`: interface, câmera, cortes, rótulos, régua e testes.
- `build.py`: junta tudo em `dist/coluna-vertebral.html`, um arquivo único que abre direto no navegador.
- `tests/`: testes automáticos em Playwright.
  - `smoke.js`: desktop, celular e falha do 3D.
  - `regua.js`: régua e desfazer seleção.
  - `cortes.js`: confere que nenhuma lesão some ao trocar de corte.
- `docs/`: retrospectiva do projeto.

## Uso

    python3 build.py          # gera dist/coluna-vertebral.html
    npm install               # three 0.128.0 e playwright, só para os testes
    npx playwright install chromium
    npm test

Abra `dist/coluna-vertebral.html` no navegador. O arquivo carrega o Three.js por CDN.

## Regras de conteúdo

- Todo número clínico tem fonte citada no texto.
- Sem travessões (o build falha se encontrar um).
- Depois de ponto, maiúscula; depois de ponto e vírgula, minúscula.
- Fundo claro, fonte de leitura (Source Sans 3), pouca caixa alta.

## Pendências

- Números ainda sem fonte aberta: ressonância após cerca de 6 semanas na hérnia; listese degenerativa em mulheres acima de 50 anos; corte ASAS de início antes dos 45 anos; preservar metade da faceta; Kishimoto (área das placas); Stoney (idade acima de 65).
- Capítulo de técnicas e implantes (TLIF, PLIF, ALIF, XLIF, OLIF, cages, parafusos).
