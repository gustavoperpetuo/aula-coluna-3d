# Graph Report - aula-coluna-3d  (2026-10-27)

## Corpus Check
- 21 files · ~80,917 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 176 nodes · 319 edges · 13 communities (9 shown, 4 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6843379d`
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
- app.js
- content.js
- disease.js
- CLAUDE.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `renderDz()` - 18 edges
2. `buildSpine()` - 18 edges
3. `applyConfig()` - 15 edges
4. `renderStep()` - 12 edges
5. `focusKey()` - 11 edges
6. `applyVisuals()` - 10 edges
7. `goLevel()` - 10 edges
8. `flyTo()` - 9 edges
9. `renderChapters()` - 9 edges
10. `rebuild()` - 8 edges

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

## Communities (13 total, 4 thin omitted)

### Community 0 - "geo.js"
Cohesion: 0.20
Nodes (22): Como o código funciona, BASE_WEDGE, bodyOutline(), buildSpine(), buildC1(), buildCervical(), buildLumbar(), buildThoracic() (+14 more)

### Community 1 - "app.js"
Cohesion: 0.15
Nodes (25): aliasKey(), applyVisuals(), axTarget(), bindSee(), capLayer(), clearRuler(), closeCard(), describe() (+17 more)

### Community 3 - "playwright"
Cohesion: 0.11
Nodes (14): playwright, { chromium }, fs, { chromium }, fs, { chromium }, fs, { chromium } (+6 more)

### Community 4 - "package.json"
Cohesion: 0.09
Nodes (18): json(), onRequestPost(), dependencies, @anthropic-ai/sdk, description, devDependencies, playwright, three (+10 more)

### Community 5 - "Aula 3D da coluna vertebral"
Cohesion: 0.25
Nodes (7): Aula 3D da coluna vertebral, Estrutura, Pendências, Publicação, Regras de conteúdo, Tira-dúvidas (teste), Uso

### Community 6 - "Retrospectiva: aula 3D da coluna (12/10/2026)"
Cohesion: 0.22
Nodes (8): Ações, Começar, Continuar, Parar, Pendências da última rodada, Resultado, Retrospectiva: aula 3D da coluna (12/10/2026), Temas

### Community 7 - "app.js"
Cohesion: 0.12
Nodes (30): applyConfig(), bindQuiz(), cats(), chapterDone(), closeDz(), cutTargets(), edgeFade(), focusLevel() (+22 more)

### Community 8 - "content.js"
Cohesion: 0.22
Nodes (7): ALL_STEPS, CHAPTERS, INFO, LEVEL_NOTES, QUIZ, ROOTFN, STEPS

### Community 10 - "disease.js"
Cohesion: 0.40
Nodes (4): DZ, DZ_CATS, DZ_OTHERS, DZ_QUIZ

## Knowledge Gaps
- **1 isolated node(s):** `three`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 79 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Como o código funciona` connect `geo.js` to `app.js`, `Aula 3D da coluna vertebral`, `app.js`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **What connects `three` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14666666666666667 - nodes in this community are weakly interconnected._
- **Why does `applyVisuals()` connect `app.js` to `geo.js`, `app.js`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `playwright` be split into smaller, more focused modules?**
  _Cohesion score 0.1067193675889328 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09486166007905138 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11875843454790823 - nodes in this community are weakly interconnected._