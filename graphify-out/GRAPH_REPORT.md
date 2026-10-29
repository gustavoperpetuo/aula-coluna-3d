# Graph Report - aula-coluna-3d  (2026-10-29)

## Corpus Check
- 32 files · ~105,933 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 291 nodes · 487 edges · 23 communities (16 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ded38207`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- geo.js
- applyConfig
- proc.js
- playwright
- package.json
- Aula 3D da coluna vertebral
- Retrospectiva: aula 3D da coluna (12/10/2026)
- app.js
- content.js
- middleware.mjs
- disease.js
- pergunta.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- transcrever.mjs
- Ressonância: spike de viabilidade (fase 1)
- rm.js
- rmBarRender
- Como escrever a Ressonância

## God Nodes (most connected - your core abstractions)
1. `renderDz()` - 20 edges
2. `buildSpine()` - 18 edges
3. `applyConfig()` - 15 edges
4. `Ressonância: spike de viabilidade (fase 1)` - 15 edges
5. `renderStep()` - 13 edges
6. `renderRm()` - 13 edges
7. `applyVisuals()` - 12 edges
8. `focusKey()` - 12 edges
9. `renderChapters()` - 11 edges
10. `setMode()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Como o código funciona` --references--> `placeNav()`  [INFERRED]
  README.md → src/app.js
- `Como o código funciona` --references--> `invalidate()`  [INFERRED]
  README.md → src/app.js
- `Como o código funciona` --references--> `applyVisuals()`  [INFERRED]
  README.md → src/app.js
- `Como o código funciona` --references--> `mergeGeoms()`  [INFERRED]
  README.md → src/geo.js
- `Como o código funciona` --references--> `buildSpine()`  [INFERRED]
  README.md → src/geo.js

## Import Cycles
- None detected.

## Communities (23 total, 7 thin omitted)

### Community 0 - "geo.js"
Cohesion: 0.20
Nodes (22): Como o código funciona, BASE_WEDGE, bodyOutline(), buildSpine(), buildC1(), buildCervical(), buildLumbar(), buildThoracic() (+14 more)

### Community 1 - "applyConfig"
Cohesion: 0.09
Nodes (38): aliasKey(), applyVisuals(), axTarget(), bindSee(), capLayer(), closeCard(), cutTargets(), describe() (+30 more)

### Community 3 - "playwright"
Cohesion: 0.06
Nodes (24): playwright, { chromium }, ctx, ESPERADO, fs, PESSOAS, SESSAO, vm (+16 more)

### Community 4 - "package.json"
Cohesion: 0.11
Nodes (17): dependencies, @anthropic-ai/sdk, description, devDependencies, @niivue/niivue, playwright, @supabase/supabase-js, three (+9 more)

### Community 5 - "Aula 3D da coluna vertebral"
Cohesion: 0.25
Nodes (7): Aula 3D da coluna vertebral, Estrutura, Login, Pendências, Publicação, Regras de conteúdo, Uso

### Community 6 - "Retrospectiva: aula 3D da coluna (12/10/2026)"
Cohesion: 0.22
Nodes (8): Ações, Começar, Continuar, Parar, Pendências da última rodada, Resultado, Retrospectiva: aula 3D da coluna (12/10/2026), Temas

### Community 7 - "app.js"
Cohesion: 0.12
Nodes (33): applyConfig(), bindQuiz(), cats(), chapterDone(), clearRuler(), closeDz(), dzCfg(), edgeFade() (+25 more)

### Community 8 - "content.js"
Cohesion: 0.22
Nodes (7): ALL_STEPS, CHAPTERS, INFO, LEVEL_NOTES, QUIZ, ROOTFN, STEPS

### Community 9 - "middleware.mjs"
Cohesion: 0.16
Nodes (16): ../functions/_middleware.js?sem-jwks, ABERTO, b64(), chaves(), json(), lerJson(), onRequest(), pagina() (+8 more)

### Community 10 - "disease.js"
Cohesion: 0.40
Nodes (4): DZ, DZ_CATS, DZ_OTHERS, DZ_QUIZ

### Community 11 - "pergunta.mjs"
Cohesion: 0.23
Nodes (8): json(), onRequestPost(), @anthropic-ai/sdk, claudeOk(), env, falhas, resposta(), supabase()

### Community 17 - "transcrever.mjs"
Cohesion: 0.20
Nodes (7): json(), onRequestPost(), cota, falhas, grande, ok, som

### Community 18 - "Ressonância: spike de viabilidade (fase 1)"
Cohesion: 0.08
Nodes (24): Axial, Capturas, Casos, Casos escolhidos, Clique na imagem e destaque no 3D, Conferência da numeração, Conferência da numeração das vértebras, Conversão e tamanhos (+16 more)

### Community 19 - "rm.js"
Cohesion: 0.50
Nodes (4): RM_CASES, RM_G, RM_NIIVUE, rmDiscs()

### Community 20 - "rmBarRender"
Cohesion: 0.50
Nodes (5): rmApply(), rmBarRender(), rmInit(), rmLayout(), rmShow()

### Community 22 - "Como escrever a Ressonância"
Cohesion: 0.50
Nodes (3): Como escrever a Ressonância, Formato no código (src/rm.js), Regras

## Knowledge Gaps
- **3 isolated node(s):** `@niivue/niivue`, `@supabase/supabase-js`, `three`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 144 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Como o código funciona` connect `geo.js` to `applyConfig`, `Aula 3D da coluna vertebral`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `@niivue/niivue`, `@supabase/supabase-js`, `three` to the rest of the system?**
  _3 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `applyConfig` be split into smaller, more focused modules?**
  _Cohesion score 0.0935374149659864 - nodes in this community are weakly interconnected._
- **Why does `playwright` connect `playwright` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `playwright` be split into smaller, more focused modules?**
  _Cohesion score 0.06072874493927125 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11742424242424243 - nodes in this community are weakly interconnected._