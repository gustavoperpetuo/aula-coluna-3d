# Graph Report - aula-coluna-3d  (2026-10-15)

## Corpus Check
- 16 files · ~42,136 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 148 nodes · 280 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea95eb10`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- geo.js
- app.js
- focusKey
- playwright
- package.json
- Aula 3D da coluna vertebral
- Retrospectiva: aula 3D da coluna (12/10/2026)
- renderDz
- content.js
- applyConfig
- disease.js
- invalidate
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `renderDz()` - 16 edges
2. `buildSpine()` - 16 edges
3. `applyConfig()` - 15 edges
4. `renderStep()` - 12 edges
5. `focusKey()` - 11 edges
6. `goLevel()` - 10 edges
7. `applyVisuals()` - 9 edges
8. `flyTo()` - 9 edges
9. `rebuild()` - 8 edges
10. `v()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Como o código funciona` --references--> `invalidate()`  [INFERRED]
  README.md → src/app.js
- `Como o código funciona` --references--> `applyVisuals()`  [INFERRED]
  README.md → src/app.js
- `Como o código funciona` --references--> `placeNav()`  [INFERRED]
  README.md → src/app.js
- `Como o código funciona` --references--> `mergeGeoms()`  [INFERRED]
  README.md → src/geo.js

## Import Cycles
- None detected.

## Communities (15 total, 3 thin omitted)

### Community 0 - "geo.js"
Cohesion: 0.21
Nodes (20): BASE_WEDGE, bodyOutline(), buildSpine(), buildC1(), buildCervical(), buildLumbar(), buildThoracic(), centroid() (+12 more)

### Community 1 - "app.js"
Cohesion: 0.19
Nodes (5): cutTargets(), focusLevel(), placeCam(), sagX(), stepTween()

### Community 2 - "focusKey"
Cohesion: 0.44
Nodes (9): bindSee(), flyTo(), focusKey(), frameMeshes(), resolvePos(), resolveTarget(), showCard(), showInfo() (+1 more)

### Community 3 - "playwright"
Cohesion: 0.16
Nodes (9): playwright, { chromium }, fs, { chromium }, fs, { chromium }, fs, { chromium } (+1 more)

### Community 4 - "package.json"
Cohesion: 0.17
Nodes (11): description, devDependencies, playwright, three, name, private, scripts, build (+3 more)

### Community 5 - "Aula 3D da coluna vertebral"
Cohesion: 0.22
Nodes (8): Aula 3D da coluna vertebral, Como o código funciona, Estrutura, Pendências, Publicação, Regras de conteúdo, Uso, placeNav()

### Community 6 - "Retrospectiva: aula 3D da coluna (12/10/2026)"
Cohesion: 0.22
Nodes (8): Ações, Começar, Continuar, Parar, Pendências da última rodada, Resultado, Retrospectiva: aula 3D da coluna (12/10/2026), Temas

### Community 7 - "renderDz"
Cohesion: 0.19
Nodes (19): bindQuiz(), chapterDone(), closeDz(), edgeFade(), focusTitle(), goStep(), model(), openDz() (+11 more)

### Community 8 - "content.js"
Cohesion: 0.22
Nodes (7): ALL_STEPS, CHAPTERS, INFO, LEVEL_NOTES, QUIZ, ROOTFN, STEPS

### Community 9 - "applyConfig"
Cohesion: 0.29
Nodes (11): applyConfig(), applyVisuals(), axTarget(), clearRuler(), closeCard(), goLevel(), inFocus(), plane() (+3 more)

### Community 10 - "disease.js"
Cohesion: 0.40
Nodes (4): DZ, DZ_CATS, DZ_OTHERS, DZ_QUIZ

### Community 11 - "invalidate"
Cohesion: 0.29
Nodes (7): aliasKey(), describe(), invalidate(), neutralLabels(), resize(), setDenis(), setLabels()

## Knowledge Gaps
- **1 isolated node(s):** `three`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 64 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Como o código funciona` connect `Aula 3D da coluna vertebral` to `geo.js`, `applyConfig`, `invalidate`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **What connects `three` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Why does `mergeGeoms()` connect `geo.js` to `Aula 3D da coluna vertebral`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `applyVisuals()` connect `applyConfig` to `app.js`, `focusKey`, `invalidate`, `Aula 3D da coluna vertebral`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._