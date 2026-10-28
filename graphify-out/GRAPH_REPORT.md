# Graph Report - aula-coluna-3d  (2026-10-28)

## Corpus Check
- 29 files · ~92,463 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 234 nodes · 393 edges · 22 communities (15 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7bc883c7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- geo.js
- app.js
- proc.js
- playwright
- package.json
- Aula 3D da coluna vertebral
- Retrospectiva: aula 3D da coluna (12/10/2026)
- renderDz
- content.js
- middleware.mjs
- disease.js
- pergunta.mjs
- CLAUDE.md
- .claude/CLAUDE.md
- transcrever.mjs
- app.js
- applyConfig
- rebuild

## God Nodes (most connected - your core abstractions)
1. `renderDz()` - 20 edges
2. `buildSpine()` - 18 edges
3. `applyConfig()` - 15 edges
4. `renderStep()` - 13 edges
5. `focusKey()` - 11 edges
6. `applyVisuals()` - 10 edges
7. `goLevel()` - 10 edges
8. `../functions/_middleware.js?sem-jwks` - 9 edges
9. `flyTo()` - 9 edges
10. `renderChapters()` - 9 edges

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

## Communities (22 total, 7 thin omitted)

### Community 0 - "geo.js"
Cohesion: 0.20
Nodes (22): Como o código funciona, BASE_WEDGE, bodyOutline(), buildSpine(), buildC1(), buildCervical(), buildLumbar(), buildThoracic() (+14 more)

### Community 1 - "app.js"
Cohesion: 0.26
Nodes (16): aliasKey(), axTarget(), bindSee(), closeCard(), describe(), flyTo(), focusKey(), frameMeshes() (+8 more)

### Community 3 - "playwright"
Cohesion: 0.07
Nodes (24): playwright, { chromium }, ctx, ESPERADO, fs, PESSOAS, SESSAO, vm (+16 more)

### Community 4 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, @anthropic-ai/sdk, description, devDependencies, playwright, @supabase/supabase-js, three, name (+7 more)

### Community 5 - "Aula 3D da coluna vertebral"
Cohesion: 0.25
Nodes (7): Aula 3D da coluna vertebral, Estrutura, Login, Pendências, Publicação, Regras de conteúdo, Uso

### Community 6 - "Retrospectiva: aula 3D da coluna (12/10/2026)"
Cohesion: 0.22
Nodes (8): Ações, Começar, Continuar, Parar, Pendências da última rodada, Resultado, Retrospectiva: aula 3D da coluna (12/10/2026), Temas

### Community 7 - "renderDz"
Cohesion: 0.18
Nodes (18): bindQuiz(), cats(), chapterDone(), closeDz(), dzCfg(), edgeFade(), focusTitle(), items() (+10 more)

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

### Community 18 - "app.js"
Cohesion: 0.13
Nodes (9): applyVisuals(), capLayer(), inFocus(), invalidate(), placeCam(), placeNav(), resize(), setDenis() (+1 more)

### Community 19 - "applyConfig"
Cohesion: 0.28
Nodes (9): applyConfig(), clearRuler(), cutTargets(), focusLevel(), plane(), sagX(), setClip(), setRulerLevels() (+1 more)

### Community 20 - "rebuild"
Cohesion: 0.47
Nodes (6): goStep(), model(), openDz(), rebuild(), setMode(), syncMode()

## Knowledge Gaps
- **2 isolated node(s):** `@supabase/supabase-js`, `three`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 112 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Como o código funciona` connect `geo.js` to `app.js`, `Aula 3D da coluna vertebral`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `@supabase/supabase-js`, `three` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `playwright` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Why does `playwright` connect `playwright` to `package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._