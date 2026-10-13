/* ================= PROTÓTIPO DESCARTÁVEL (branch prototype/layout-controles) =================
   Pergunta: onde cada controle deve ficar para a aula ser mais fácil de usar?
   Quatro arranjos na mesma página, trocados por ?variant= e pela barra flutuante embaixo.
   Só reposiciona elementos que a aula já tem; comportamento e dados são os reais. Só desktop (> 900 px).
   Nunca vai para a main: a decisão escolhida é reescrita direito no código da aula. */
(function () {
  const V = {
    A: 'Atual',
    B: 'Controles no modelo',
    C: 'Trilha à esquerda',
    D: 'Leitura primeiro'
  };
  const keys = Object.keys(V);
  const cur = (new URLSearchParams(location.search).get('variant') || 'A').toUpperCase();
  const v = V[cur] ? cur : 'A';
  const $ = s => document.querySelector(s);

  const css = `
  @media (min-width: 901px) {
    /* B: tudo que mexe no modelo fica sobre o modelo */
    body.pv-B .ttog, body.pv-B .hint { display: none; }
    body.pv-B .tools { display: flex !important; top: auto; bottom: 14px; left: 50%; right: auto; transform: translateX(-50%); flex-wrap: wrap; justify-content: center; width: max-content; max-width: calc(100% - 90px); }
    body.pv-B .tools .group { flex-wrap: nowrap; box-shadow: 0 2px 8px rgba(20,40,40,.12); }
    body.pv-B .info { bottom: 74px; }
    body.pv-B .pv-top { position: absolute; z-index: 3; left: 12px; right: 64px; top: 12px; display: flex; gap: 10px; align-items: flex-start; flex-wrap: wrap; pointer-events: none; }
    body.pv-B .pv-top > * { pointer-events: auto; }
    body.pv-B .pv-top .see { margin: 0; background: rgba(255,255,255,.95); border: 1px solid var(--line); border-radius: 8px; padding: 4px 12px 2px; }
    body.pv-B .pv-top .see .h { font-size: 12.5px; margin: 0; }
    body.pv-B .pv-top .see .row { gap: 0 14px; }
    body.pv-B .pv-top .see button { padding: 3px 0 5px; min-height: 30px; font-size: 15px; }
    body.pv-B .pv-top .dzbar { margin: 0; }
    body.pv-B .pv-top .dzbar .seg { background: rgba(255,255,255,.95); box-shadow: 0 2px 8px rgba(20,40,40,.12); }
    body.pv-B .pv-top .dzbar .seg button { font-size: 16px; padding: 8px 16px; }

    /* C: trilha de navegação à esquerda, ferramentas sempre abertas no topo do 3D */
    body.pv-C .stage { grid-template-columns: 232px minmax(0, 1fr) 0 var(--pw, 430px); grid-template-areas: "rail view split panel"; }
    body.pv-C .pv-rail { grid-area: rail; display: flex; background: var(--panel); border-right: 1px solid var(--line); overflow-y: auto; padding: 16px 12px; flex-direction: column; gap: 16px; min-height: 0; }
    body.pv-C .pv-rail .seg { display: flex; }
    body.pv-C .pv-rail .seg button { flex: 1; }
    body.pv-C .pv-rail .chapwrap { border: 0; }
    body.pv-C .pv-rail .chapwrap::before, body.pv-C .pv-rail .chapwrap::after { display: none; }
    body.pv-C .pv-rail .chap { flex-direction: column; overflow: visible; padding: 0; gap: 2px; }
    body.pv-C .pv-rail .chap button { border-radius: 7px; border-color: transparent; justify-content: flex-start; text-align: left; padding: 8px 10px; min-height: 40px; font-size: 15px; white-space: normal; }
    body.pv-C .pv-rail .chap button:hover { background: var(--paper); }
    body.pv-C .pv-rail .h { font-size: 12.5px; font-weight: 600; color: var(--ink-3); margin: 0 0 6px 10px; }
    body.pv-C .top .seg { display: none; }
    body.pv-C .ttog { display: none; }
    body.pv-C .tools { display: flex !important; top: 12px; }

    /* D: texto à esquerda, links de localizar fixos no topo do texto, ferramentas em coluna */
    body.pv-D .stage { grid-template-columns: var(--pw, 430px) 0 minmax(0, 1fr); grid-template-areas: "panel split view"; }
    body.pv-D .panel { border-left: 0; border-right: 1px solid var(--line); }
    body.pv-D .pv-sticky { flex: 0 0 auto; border-bottom: 1px solid var(--line); padding: 8px 22px 6px; background: var(--accent-soft); }
    body.pv-D .pv-sticky:empty { display: none; }
    body.pv-D .pv-sticky .see { margin: 0; }
    body.pv-D .pv-sticky .see .h { color: var(--accent); font-weight: 600; font-size: 13px; }
    body.pv-D .pv-sticky .see button { padding: 4px 0; min-height: 32px; }
    body.pv-D .ttog, body.pv-D .hint { display: none; }
    body.pv-D .tools { display: flex !important; flex-direction: column; flex-wrap: nowrap; left: 12px; right: auto; top: 12px; width: 178px; }
    body.pv-D .tools .group { flex-direction: column; align-items: stretch; }
    body.pv-D .tools .chip { justify-content: flex-start; }
    body.pv-D .tools .lvsel { display: none !important; }
    body.pv-D .info { left: 204px; bottom: 16px; }
  }
  .pv-rail { display: none; }
  .pv-bar { position: fixed; z-index: 99; left: 50%; top: 8px; transform: translateX(-50%); display: flex; align-items: center; gap: 4px; background: #111; color: #fff; border-radius: 999px; padding: 5px; box-shadow: 0 6px 24px rgba(0,0,0,.35); font: 600 14px/1 system-ui, sans-serif; }
  .pv-bar button { border: 0; background: #2a2a2a; color: #fff; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 16px; }
  .pv-bar button:hover { background: #444; }
  .pv-bar span { padding: 0 12px; white-space: nowrap; }
  .pv-bar small { opacity: .6; font-weight: 400; margin-left: 6px; }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  document.body.classList.add('pv-' + v);

  const view = $('#view'), panel = $('#panel'), scroll = $('#scroll'), stage = $('.stage');
  // destino dos blocos que a aula redesenha a cada passo (.see = localizar no 3D, .dzbar = Normal/Com a doença)
  let slotSee = null, slotDz = null;
  if (v === 'B') { const top = document.createElement('div'); top.className = 'pv-top'; view.appendChild(top); slotSee = slotDz = top; }
  if (v === 'C') {
    const rail = document.createElement('nav'); rail.className = 'pv-rail'; rail.setAttribute('aria-label', 'Navegação da aula');
    const h = document.createElement('div'); h.className = 'h'; h.textContent = 'Capítulos';
    rail.append($('.top .seg').cloneNode(true), h, $('#chapwrap'));
    // o seletor clonado repassa o clique para o original, que guarda o comportamento da aula
    rail.querySelectorAll('.seg button').forEach(b => { const id = b.id; b.removeAttribute('id'); b.onclick = () => document.getElementById(id).click(); });
    const sync = () => rail.querySelectorAll('.seg button').forEach((b, i) => b.setAttribute('aria-pressed', $('.top .seg').children[i].getAttribute('aria-pressed')));
    new MutationObserver(sync).observe($('.top .seg'), { attributes: true, subtree: true }); sync();
    stage.prepend(rail);
    new MutationObserver(() => { h.textContent = $('#m-dz').getAttribute('aria-pressed') === 'true' ? 'Grupos de doenças' : 'Capítulos'; }).observe($('#m-dz'), { attributes: true });
  }
  if (v === 'D') {
    const sticky = document.createElement('div'); sticky.className = 'pv-sticky'; panel.insertBefore(sticky, scroll); slotSee = sticky;
    // com o painel à esquerda, a divisória mede a partir da borda esquerda
    const split = $('#split');
    split.addEventListener('pointerdown', e => {
      if (e.button !== 0) return; e.stopImmediatePropagation();
      split.setPointerCapture(e.pointerId); document.body.classList.add('resizing');
      const mv = ev => { const l = stage.getBoundingClientRect().left; stage.style.setProperty('--pw', Math.max(320, Math.min(stage.clientWidth - 360, ev.clientX - l)) + 'px'); };
      const up = () => { split.removeEventListener('pointermove', mv); split.removeEventListener('pointerup', up); document.body.classList.remove('resizing'); };
      split.addEventListener('pointermove', mv); split.addEventListener('pointerup', up);
    }, true);
  }
  // só reage quando a aula desenha conteúdo novo; tirar o bloco do texto também é uma mutação e não pode apagá-lo
  const relocate = () => {
    if (slotSee) { slotSee.querySelectorAll('.see').forEach(n => n.remove()); const s = scroll.querySelector('.see'); if (s) slotSee.appendChild(s); }
    if (slotDz) { slotDz.querySelectorAll('.dzbar').forEach(n => n.remove()); const d = scroll.querySelector('.dzbar'); if (d) slotDz.prepend(d); }
  };
  if (slotSee || slotDz) { new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) relocate(); }).observe(scroll, { childList: true }); relocate(); }

  // barra flutuante do protótipo
  const bar = document.createElement('div'); bar.className = 'pv-bar';
  const go = d => { const i = (keys.indexOf(v) + d + keys.length) % keys.length; const u = new URL(location.href); u.searchParams.set('variant', keys[i]); location.href = u.toString(); };
  bar.innerHTML = `<button type="button" aria-label="Variante anterior">←</button><span>${v}: ${V[v]}<small>Alt + ← →</small></span><button type="button" aria-label="Próxima variante">→</button>`;
  bar.children[0].onclick = () => go(-1); bar.children[2].onclick = () => go(1);
  document.body.appendChild(bar);
  // a aula já usa ← → para trocar de passo; o protótipo usa Alt + setas
  addEventListener('keydown', e => {
    if (!e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    if (e.target.closest && e.target.closest('input,textarea,[contenteditable]')) return;
    e.preventDefault(); e.stopPropagation(); go(e.key === 'ArrowRight' ? 1 : -1);
  }, true);
})();
