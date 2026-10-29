/* ================= Aplicação ================= */
(function () {
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQ = matchMedia('(max-width: 900px)');
  const view = $('#view'), canvas = $('#gl'), live = $('#live');
  const say = t => { live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); };

  /* ---------- estado e progresso (independem do 3D) ---------- */
  const store = (() => { try { return JSON.parse(localStorage.getItem('coluna3d.v1') || '{}'); } catch (e) { return {}; } })();
  // cópia na conta (tabela progresso): cada gravação, com atraso, lê a da conta, soma com a local e grava a soma (sync, mais abaixo);
  // nunca grava por cima sem ler, senão apagaria o progresso de outro aparelho
  const LISTAS = ['seen', 'dzSeen', 'procSeen', 'rmSeen'];
  let contaId = null, pushT = 0;
  const push = (ms = 1500) => { if (!contaId) return; clearTimeout(pushT); pushT = setTimeout(() => sync(contaId), ms); };
  const keep = () => { marca(); try { localStorage.setItem('coluna3d.v1', JSON.stringify(store)); } catch (e) { } };
  const save = () => { keep(); push(); };
  store.seen = store.seen || []; store.dzSeen = store.dzSeen || []; store.procSeen = store.procSeen || []; store.rmSeen = store.rmSeen || []; store.quiz = store.quiz || {};
  // passos de ressonância numa lista só (src/rm.js); a marca de visto é '<trilha>.<k>' (RM_IDS), que não muda quando a ordem muda
  const RM_STEPS = RM_TRACKS.flatMap(t => t.steps.map((st, i) => ({ t, i, st, id: t.id + '.' + st.k, ex: RM_EXAMS[st.ex] })));
  // marcas antigas de ressonância ('<caso>.<índice>', do 237 e dos casos numerados) somem ao abrir e na soma com a conta, e a contagem nunca passa de N
  const vale = (k, v) => k !== 'rmSeen' || RM_IDS.includes(v);
  store.rmSeen = store.rmSeen.filter(v => vale('rmSeen', v));
  const S = { mode: 'anat', step: Math.min(store.step || 0, ALL_STEPS.length - 1), rmStep: Math.max(0, RM_STEPS.findIndex(r => r.id === store.rmStep)), dz: null, dzOn: true, layers: {}, ghost: false, focus: null, hot: new Set(), tint: false, clip: null, labelsOn: true, sel: null, hide: [], focusIdx: [], axLevel: 'L4-L5', cfg: null, hv: { zone: 'pl', morph: 'ext' } };

  /* ---------- 3D: tudo aqui pode falhar sem derrubar a aula ---------- */
  let has3D = false, renderer, scene, camera, controls, model = null, V3, deg = Math.PI / 180;
  function fail3D(msg) {
    $('#loading').hidden = true;
    const f = document.createElement('div'); f.className = 'fail';
    f.innerHTML = `<div><p>${msg} A aula em texto continua no painel.</p><button class="btn" id="retry">Tentar de novo</button></div>`;
    view.appendChild(f); $('#retry').onclick = () => location.reload();
    ['#ttog', '#ruler', '#hint', '#explore'].forEach(s => { const e = $(s); if (e) e.hidden = true; });
  }
  try {
    if (!window.THREE || !THREE.OrbitControls || typeof buildSpine !== 'function') throw new Error('lib');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    if (!renderer.getContext()) throw new Error('webgl');
    has3D = true;
  } catch (e) {
    fail3D(e.message === 'lib' ? 'O modelo 3D não carregou (sem conexão com a biblioteca 3D).' : 'O modelo 3D não abriu neste navegador (WebGL desativado).');
  }

  let KIND, TINT, C, getMat, hotMats = [];
  // o laço só redesenha quando algo mudou (dirty) ou quando há destaque pulsando (pulse)
  let dirty = 2, pulse = false;
  function invalidate() { dirty = 2; }
  if (has3D) {
    V3 = THREE.Vector3;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.3, 700);
    scene.add(camera);
    scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x7d7262, 0.36));
    const key = new THREE.DirectionalLight(0xfffaf2, 0.9); key.position.set(-0.7, 0.85, 0.75); camera.add(key); key.target.position.set(0, 0, -1); camera.add(key.target);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.38); fill.position.set(0.9, -0.15, 0.5); camera.add(fill); fill.target.position.set(0, 0, -1); camera.add(fill.target);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.09; controls.minDistance = 4; controls.maxDistance = 240; controls.rotateSpeed = 0.75; controls.zoomSpeed = 0.9;
    controls.enabled = !mobileQ.matches;

    /* materiais: corte neutro claro; vermelho fica reservado para doença */
    KIND = {
      bone: { c: '#E6D7BA', r: .62, cut: '#F0E8D8', L: 'bone', g: 1 }, boneHyp: { c: '#DDC48D', r: .7, cut: '#EADCBC', L: 'bone', g: 1 }, boneHot: { c: '#E9DDC5', r: .7, cut: '#F0E8D8', L: 'bone', g: 1 },
      rib: { c: '#E6DAC2', r: .7, cut: '#F0E8D8', L: 'rib', g: 1 }, hole: { c: '#6E5A49', r: .9, L: 'bone', g: 1 }, ctx: { c: '#E6D7BA', r: .8, op: .17, L: 'bone', noCut: 1 },
      osteo: { c: '#E3D0A3', r: .68, cut: '#EADBB8', L: 'bone', g: 1 },
      disc: { c: '#C9DFEA', r: .45, cut: '#EEF4F7', L: 'disc', order: -2 }, discDeg: { c: '#BDAE90', r: .6, cut: '#C9BEA6', L: 'disc', order: -2 }, discInf: { c: '#D98E5C', r: .6, cut: '#E2A57A', L: 'disc', order: -2 },
      lamA: { c: '#BFD6E2', r: .5, cut: '#D7E7EF', L: 'disc', flat: 1, under: 1, order: -1 }, lamB: { c: '#D2E4EC', r: .5, cut: '#C3DAE6', L: 'disc', flat: 1, under: 1, order: -1 },
      nucleus: { c: '#5B9ACB', r: .28, cut: '#6CA7D3', L: 'disc', flat: 1 }, nucDeg: { c: '#8F8C7E', r: .6, cut: '#9C988A', L: 'disc', flat: 1 }, herniation: { c: '#4F8FC4', r: .3, cut: '#5C9BCB', L: 'path' },
      lig: { c: '#F4F2EB', r: .42, cut: '#E8E3D7', L: 'lig' }, opll: { c: '#E2D0A3', r: .65, cut: '#D7B98A', L: 'lig' },
      flavum: { c: '#C98A2C', r: .5, cut: '#B97A22', L: 'lig' }, flavumHyp: { c: '#AE6A17', r: .5, cut: '#9C5E12', L: 'lig' },
      capsule: { c: '#EEE4CF', r: .5, op: .55, L: 'lig', noCut: 1 }, capsuleHyp: { c: '#E7CC93', r: .5, op: .78, L: 'lig', noCut: 1 }, nuchal: { c: '#F1EBDC', r: .5, op: .3, L: 'lig', noCut: 1 },
      cord: { c: '#F2E3C4', r: .55, cut: '#E6CDA0', L: 'neuro' }, cordLesion: { c: '#E04E36', r: .5, op: .82, L: 'path', noCut: 1 },
      dura: { c: '#B4ACD6', r: .4, op: .24, L: 'neuro', noCut: 1 }, root: { c: '#EBC229', r: .5, cut: '#D2A21A', L: 'neuro' }, drg: { c: '#DDA61B', r: .5, cut: '#C98F12', L: 'neuro' },
      artery: { c: '#C9403F', r: .36, cut: '#8E2626', L: 'vessel' }, vein: { c: '#3F63AA', r: .36, cut: '#2B4A88', L: 'vessel' },
      lesion: { c: '#C8361F', r: .5, L: 'path' }, tumor: { c: '#7D2236', r: .55, cut: '#6C1B2C', L: 'path' }, abscess: { c: '#E2903A', r: .4, op: .6, L: 'path', noCut: 1 },
      // procedimentos: instrumento e o que entra no paciente ficam sempre visíveis, como as lesões; m é o metalness
      metal: { c: '#D3D8DD', r: .3, m: .25, cut: '#E4E7EA', L: 'path' }, needleTip: { c: '#E35A3E', r: .4, cut: '#E88F7B', L: 'path' },
      contrast: { c: '#2F6FD6', r: .35, op: .5, L: 'path', noCut: 1 }, rfLesion: { c: '#F08A24', r: .5, op: .55, L: 'path', noCut: 1 },
      cement: { c: '#D5D9D6', r: .75, cut: '#AEB4B2', L: 'path' }, cage: { c: '#5F7184', r: .45, cut: '#8496A8', L: 'path' },
      mbranch: { c: '#EBC229', r: .5, cut: '#D2A21A', L: 'neuro' }, ganglion: { c: '#DDA61B', r: .5, cut: '#C98F12', L: 'neuro' },
      // dentro do disco o corte cobre o que é transparente: contraste e lesão térmica intradiscais são opacos e ganham tampa própria
      dye: { c: '#2F6FD6', r: .35, cut: '#3B7BE0', L: 'path' }, heat: { c: '#E8771E', r: .45, cut: '#F08A24', L: 'path' },
      implant: { c: '#8C97A4', r: .3, m: .3, cut: '#A3ADB8', L: 'path' }, poly: { c: '#F4F3EE', r: .4, cut: '#FFFFFF', L: 'path' },
      // núcleo vaporizado pelo laser e gás no disco: opacos, pelo mesmo motivo do contraste intradiscal
      burn: { c: '#4A2C1C', r: .85, cut: '#3A2216', L: 'path' }, gas: { c: '#EEF6FA', r: .3, cut: '#FFFFFF', L: 'path' },
      cyst: { c: '#8A2D3B', r: .5, op: .4, L: 'path', noCut: 1 }, sclero: { c: '#9B3FA0', r: .4, op: .6, L: 'path', noCut: 1 },
      scar: { c: '#B9A08F', r: .8, op: .8, L: 'path', noCut: 1 }, modic: { c: '#D8A548', r: .6, op: .35, L: 'path', noCut: 1 }
    };
    TINT = { C: '#C9D8E8', T: '#D3E2C8', L: '#EBD3A6', S: '#E6C8BE' };
    C = h => new THREE.Color(h).convertSRGBToLinear();
    const cache = {};
    getMat = function (kind, variant) {
      const id = kind + '|' + variant; if (cache[id]) return cache[id];
      const K = KIND[kind] || KIND.bone;
      let color = K.c, op = K.op ?? 1;
      if (variant[0] === 't') color = TINT[variant[1]] || K.c;
      const m = new THREE.MeshStandardMaterial({ color: C(color), roughness: K.r ?? .6, metalness: K.m ?? 0, side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
      let cut = K.cut || K.c, useCut = !K.noCut;
      if (variant === 'f') { m.transparent = true; m.opacity = Math.min(op, .055); m.depthWrite = false; m.side = THREE.FrontSide; useCut = false; }
      if (variant === 'g') { m.transparent = true; m.opacity = .13; m.depthWrite = false; m.side = THREE.FrontSide; useCut = false; }
      if (variant === 'h') { m.color = C('#E35A3E'); m.emissive = C('#9A2313'); m.emissiveIntensity = .4; m.transparent = false; m.opacity = 1; m.depthWrite = true; cut = '#E88F7B'; useCut = true; hotMats.push(m); }
      if (variant === 's') { m.color = C('#2FA8AB'); m.emissive = C('#0A5E62'); m.emissiveIntensity = .45; m.roughness = .45; m.transparent = false; m.opacity = 1; m.depthWrite = true; cut = '#8FD3D5'; useCut = true; }
      if (variant === 'd') { m.color = C(K.c).lerp(C('#4A5552'), .5); m.transparent = true; m.opacity = Math.min(op, .22); m.depthWrite = false; m.side = THREE.FrontSide; useCut = false; }
      // lamelas são o fundo do corte do disco: desenhadas depois do anel e sem gravar profundidade, núcleo e canal da hérnia ficam por cima
      if (K.under && variant === 'n') m.depthWrite = false;
      if (useCut) {
        const cc = new THREE.Color(cut);
        // flat: camadas de dentro do disco, que só aparecem pelo corte; cor chapada nas duas faces para o corte parecer maciço
        const test = K.flat ? '' : 'if(!gl_FrontFacing) ';
        m.onBeforeCompile = sh => { sh.uniforms.cutColor = { value: cc }; sh.fragmentShader = 'uniform vec3 cutColor;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + test + 'gl_FragColor.rgb = cutColor;'); };
        m.customProgramCacheKey = () => K.flat ? 'cutflat' : 'cut';
      }
      return cache[id] = m;
    };
  }

  // guarda o modelo normal e o da última doença: alternar Normal e Com a doença não remonta a geometria
  const models = new Map();
  function rebuild(mods) {
    if (!has3D) return;
    const k = mods && Object.keys(mods).length ? mods : null;
    if (model) scene.remove(model.root);
    model = models.get(k);
    if (!model) {
      models.forEach((x, key) => { if (key !== null) { x.meshes.forEach(m => m.geometry.dispose()); models.delete(key); } });
      model = buildSpine(mods || {}); models.set(k, model);
      model.root.updateMatrixWorld(true);
      model.meshes.forEach(m => { const b = new THREE.Box3().setFromObject(m); const c = []; for (let i = 0; i < 8; i++) c.push(new V3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z)); m.userData.corners = c; });
    }
    scene.add(model.root); invalidate();
  }
  const plane = has3D ? new THREE.Plane() : null;
  const slabOut = m => { const c = m.userData.corners; if (!c) return false; let mn = 1e9; c.forEach(p => mn = Math.min(mn, plane.distanceToPoint(p))); return mn > 1.4; };

  /* ---------- visual ---------- */
  const lvlAlias = n => { if (!n) return n; if (/^S\d/.test(n)) return 'S'; if (/^Co/.test(n)) return 'Co'; if (n === 'C8') return 'C7'; return n; };
  function inFocus(u) {
    if (!S.focus) return true;
    const L = u.level; if (!L) { if (u.u0 === undefined) return true; return S.focusIdx.some(i => i >= u.u0 && i <= u.u1); }
    if (L.includes('-')) { const [a, b] = L.split('-').map(lvlAlias); return S.focus.has(a) && S.focus.has(b); }
    return S.focus.has(lvlAlias(L));
  }
  const isHot = u => !!u.hot || S.hot.has(u.key);
  /* tampa do corte: cada vértebra é feita de peças sobrepostas, e o corte mostrava as faces internas de todas.
     Por grupo (camada de desenho = profundidade de aninhamento + cor de corte), o stencil marca onde o plano está
     dentro do volume e um plano sólido na cor de corte cobre essa área. Grupos de dentro (núcleo) vêm por último. */
  // nervos por último e, em destaque, num vermelho mais escuro: a raiz comprimida passa por dentro da hérnia
  // cimento, cage e metal ficam por cima do osso e do disco onde estão
  const CAP_RANK = { disc: 1, discDeg: 1, discInf: 1, lamA: 2, lamB: 3, nucleus: 4, nucDeg: 4, herniation: 5, cord: 6, root: 6, drg: 6, cement: 5, cage: 5, metal: 6, needleTip: 6, mbranch: 6, ganglion: 6, dye: 5, heat: 5, implant: 6, poly: 6, burn: 5, gas: 5 };
  // no mesmo nível, destaque e seleção por cima: senão a ordem de criação dos grupos decidia se a faceta quente cobria a lâmina ou o contrário
  const capGroups = new Map(); // 'rank|cor' -> { layer, rank, pri, mat }
  function capLayer(m, u, K, variant) {
    m.layers.set(0);
    if (!S.clip || u.shell || !(variant === 'n' || variant === 'h' || variant === 's' || variant[0] === 't') || (K.noCut && variant !== 'h' && variant !== 's') || ((K.op ?? 1) < 1 && variant !== 'h' && variant !== 's')) return;
    const c = u.corners; let lo = 1e9, hi = -1e9; c.forEach(p => { const d = plane.distanceToPoint(p); lo = Math.min(lo, d); hi = Math.max(hi, d); });
    if (lo > 0 || hi < 0) return; // a caixa não cruza o plano: não há tampa
    const color = variant === 'h' ? (K.L === 'neuro' ? '#C9503A' : '#E88F7B') : variant === 's' ? '#8FD3D5' : K.cut || K.c, rank = CAP_RANK[u.kind] || 0, k = rank + '|' + color;
    let g = capGroups.get(k);
    if (!g) { if (capGroups.size >= 30) return; g = { layer: capGroups.size + 1, rank, pri: variant === 'h' || variant === 's' ? 1 : 0, mat: new THREE.MeshBasicMaterial({ color: C(color), side: THREE.DoubleSide, depthWrite: false, stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc }) }; capGroups.set(k, g); }
    m.layers.enable(g.layer); g.used = true;
  }
  let LBL = [];
  function applyVisuals() {
    if (!model) return;
    invalidate(); pulse = false; capGroups.forEach(g => g.used = false);
    model.meshes.forEach(m => {
      const u = m.userData, K = KIND[u.kind] || KIND.bone;
      let vis = K.L === 'path' ? true : !!S.layers[K.L];
      if (vis && S.hide.length && S.hide.some(p => u.key.startsWith(p))) vis = false;
      if (vis && S.clip && S.clip.startsWith('ax:') && slabOut(m)) vis = false;
      m.visible = vis; if (!vis) return;
      let variant = 'n';
      const selOn = S.sel && S.sel.size;
      if (selOn) variant = S.sel.has(m) ? 's' : (inFocus(u) ? 'd' : 'f');
      else if (isHot(u)) variant = 'h';
      else if (!inFocus(u)) variant = 'f';
      else if (S.ghost && (K.g || u.g)) variant = 'g';
      else if (S.tint && u.kind === 'bone' && u.region && TINT[u.region]) variant = 't' + u.region;
      m.material = getMat(u.kind, variant);
      m.renderOrder = variant === 's' ? 1 : (variant === 'f' || variant === 'g' || variant === 'd' || (K.op ?? 1) < 1) ? 2 : variant === 'n' ? (K.order || 0) : 0;
      capLayer(m, u, K, variant);
      u.variant = variant; if (variant === 'h') pulse = true;
    });
    view.classList.toggle('dim', !!(S.sel && S.sel.size));
    LBL.forEach(L => L.el.classList.toggle('sel', !!(S.sel && S.sel.size && L.meshes.some(m => S.sel.has(m)))));
  }

  /* ---------- corte ---------- */
  // estruturas que o corte precisa manter: lesões; sem lesão, as estruturas em destaque do passo
  function cutTargets() {
    let t = model.meshes.filter(m => S.hot.has(m.userData.key) || (KIND[m.userData.kind] || {}).L === 'path');
    if (!t.length) t = model.meshes.filter(m => { const u = m.userData, K = KIND[u.kind] || KIND.bone; return isHot(u) && !!S.layers[K.L]; });
    return t;
  }
  const BX = has3D ? new THREE.Box3() : null;
  const boxOf = m => { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); m.updateMatrixWorld(); return BX.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); };
  // corte sagital: o plano passa pela lesão mais à esquerda do paciente (+x), para nenhuma lesão sumir.
  // Pares esquerdo/direito: basta manter o lado direito, a menos que o passo peça o corte lateral (sag: 'lat').
  function sagX() {
    let t = cutTargets();
    if (!(S.cfg && S.cfg.sag === 'lat')) { const keys = new Set(t.map(m => m.userData.key)); t = t.filter(m => { const k = m.userData.key; return !(k.endsWith('.L') && keys.has(k.slice(0, -2) + '.R')); }); }
    let x0 = 0;
    t.forEach(m => { const b = boxOf(m); const cx = (b.min.x + b.max.x) / 2; x0 = Math.max(x0, Math.min(cx, b.min.x + 1.2)); });
    // fora da linha média e do meio das placas de fratura (0,06 de espessura): plano em cima de vértices ou faces serrilha
    return x0 + 0.011;
  }
  // corte axial: o nível com mais lesões; sem nível declarado, a vértebra mais perto da lesão
  function focusLevel() {
    const t = cutTargets(); if (!t.length) return null;
    const cnt = {}; t.forEach(m => { const L = m.userData.level; if (L && (LV[L] || model.anchors.has('ax.' + L))) cnt[L] = (cnt[L] || 0) + 1; });
    const ks = Object.keys(cnt);
    if (ks.length) {
      const top = Math.max(...ks.map(k => cnt[k])), tied = ks.filter(k => cnt[k] === top);
      const idx = k => { const a = k.split('-')[0]; return model.KI[a] ?? model.KI[a + '1'] ?? 0; };
      tied.sort((a, b) => idx(a) - idx(b));
      const L = tied[Math.floor((tied.length - 1) / 2)];
      let at = t.filter(m => m.userData.level === L && (KIND[m.userData.kind] || {}).L === 'path'); if (!at.length) at = t.filter(m => m.userData.level === L); const c = new V3(); at.forEach(m => c.add(boxOf(m).getCenter(new V3()))); c.multiplyScalar(1 / at.length);
      S.axPt = c; S.axPtLvl = L;
      return L;
    }
    const c = boxOf(t[0]).getCenter(new V3()); let best = null, bd = 1e9;
    Object.keys(model.F).forEach(n => { if (!LV[n] || !model.F[n].p) return; const d = model.F[n].p.distanceTo(c); if (d < bd) { bd = d; best = n; } });
    return best;
  }
  function setClip(c) {
    if (!has3D) return;
    S.clip = c || null;
    if (!c) { renderer.clippingPlanes = []; }
    else if (c === 'sag') { S.sagX = sagX(); plane.set(new V3(-1, 0, 0), S.sagX); renderer.clippingPlanes = [plane]; }
    else {
      const lvl = c.slice(3); S.axLevel = lvl;
      const s = model.spineAt(model.KI[lvl]);
      const up = new V3(0, 1, 0).applyQuaternion(s.q);
      // no disco, o plano sai do meio exato: lá ficam vértices do anel, do equador do núcleo e do eixo da hérnia, e o corte serrilha
      const pt = s.p.clone(); if (!lvl.includes('-') && LV[lvl]) pt.addScaledVector(up, LV[lvl].h * 0.14); else pt.addScaledVector(up, -0.03);
      if (S.axPt && S.axPtLvl === lvl) pt.copy(S.axPt).addScaledVector(up, -0.15);
      plane.setFromNormalAndCoplanarPoint(up, pt); renderer.clippingPlanes = [plane];
    }
    syncTools(); applyVisuals();
  }
  function axTarget(l) { if (model.anchors.has('ax.' + l)) return 'ax.' + l; return l + '.canal'; }

  /* ---------- colunas de Denis ---------- */
  let overlay = null;
  const DENIS = { 'denis.a': '#2F73B5', 'denis.m': '#C98410', 'denis.p': '#B5432B' };
  function setDenis(on) {
    if (!has3D) return;
    invalidate();
    if (overlay) { scene.remove(overlay); overlay.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); overlay = null; }
    if (!on) return;
    overlay = new THREE.Group();
    const fr = model.F.L1, l = LV.L1, D = l.D, H = 7.4;
    const parts = [['denis.a', -D / 6, D / 2 + 0.35], ['denis.m', -D / 2 - 0.25, -D / 6], ['denis.p', -D / 2 - 4.6, -D / 2 - 0.25]];
    parts.forEach(([k, z0, z1]) => {
      const g = new THREE.BoxGeometry(6.5, H, z1 - z0); g.translate(0, 0.2, (z0 + z1) / 2);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: C(DENIS[k]), transparent: true, opacity: .4, depthWrite: false, side: THREE.DoubleSide }));
      m.position.copy(fr.p); m.quaternion.copy(fr.q); m.renderOrder = 4; overlay.add(m);
      model.anchors.set(k, new V3(0, H * 0.36, (z0 + z1) / 2).applyQuaternion(fr.q).add(fr.p));
    });
    scene.add(overlay);
  }

  /* ---------- rótulos ---------- */
  const labelsEl = $('#labels'), linesEl = $('#lines'), toolsBox = $('#tools'), ttog = $('#ttog');
  // rótulo de conceito (curvatura, ápice): chave 'cam:<nível>' só leva a câmera, sem selecionar
  const camOnly = key => key.startsWith('cam:') ? key.slice(4) : null;
  function resolvePos(key) {
    if (!model) return null;
    if (camOnly(key)) key = camOnly(key);
    if (model.anchors.has(key)) return model.anchors.get(key).clone();
    const ms = model.reg.get(key);
    if (ms && ms.length) { const b = new THREE.Box3(); ms.forEach(m => b.expandByObject(m)); return b.getCenter(new V3()); }
    return null;
  }
  function setLabels(list) {
    LBL.forEach(L => L.el.remove()); LBL = []; invalidate();
    if (!has3D) return;
    (list || []).forEach(([key, text]) => {
      const el = document.createElement('button'); el.className = 'lbl'; el.type = 'button'; el.textContent = text; el.tabIndex = -1;
      const base = camOnly(key) || key;
      if (S.hot.has(base) || S.hot.has(base + '.body')) el.classList.add('hot');
      if (DENIS[key]) { el.style.borderColor = DENIS[key]; el.style.color = DENIS[key]; }
      el.addEventListener('click', ev => { ev.stopPropagation(); focusKey(key, text); });
      labelsEl.appendChild(el);
      LBL.push({ el, key, pos: resolvePos(key), meshes: model.reg.get(aliasKey(base)) || [], bw: 0, bh: 0, col: DENIS[key] });
    });
  }
  let tmp;
  function updateLabels() {
    const w = view.clientWidth, h = view.clientHeight; const placed = []; let svg = '';
    const vr = view.getBoundingClientRect();
    // no desktop as ferramentas ficam sempre abertas no topo: os rótulos começam abaixo delas
    let topLim = mobileQ.matches ? (view.classList.contains('full') ? 72 : 8) : toolsBox.getBoundingClientRect().bottom - vr.top + 8;
    const botLim = mobileQ.matches ? 60 : 40;
    LBL.forEach(L => {
      let ok = S.labelsOn && L.pos;
      if (ok) { tmp.copy(L.pos).project(camera); ok = tmp.z < 1 && Math.abs(tmp.x) < 1.02 && Math.abs(tmp.y) < 1.02; }
      let P = L.pos;
      if (ok && renderer.clippingPlanes.length) { const dd = plane.distanceToPoint(L.pos); if (dd < -0.15) { if (S.clip !== 'sag' && dd > -3.5) { P = L.pos.clone().addScaledVector(plane.normal, -dd + 0.05); } else ok = false; } }
      if (ok && P !== L.pos) { tmp.copy(P).project(camera); ok = tmp.z < 1 && Math.abs(tmp.x) < 1.02 && Math.abs(tmp.y) < 1.02; }
      if (ok && L.meshes.length && L.meshes.every(m => !m.visible)) ok = false;
      if (!ok) { L.el.hidden = true; return; }
      L.el.hidden = false;
      if (!L.bw) { L.bw = L.el.offsetWidth; L.bh = L.el.offsetHeight; }
      const x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h, bw = L.bw, bh = L.bh;
      const left = x > w * 0.56;
      let lx = left ? x - 22 - bw : x + 22, ly = y - bh / 2 - 12;
      for (const k of [0, 1, -1, 2, -2, 3, -3, 4]) {
        const yy = ly + k * (bh + 5);
        const hit = placed.some(r => lx < r[0] + r[2] + 4 && lx + bw + 4 > r[0] && yy < r[1] + r[3] + 3 && yy + bh + 3 > r[1]);
        if (!hit) { ly = yy; break; }
      }
      lx = Math.max(4, Math.min(w - bw - (mobileQ.matches ? 8 : 64), lx)); ly = Math.max(topLim, Math.min(h - bh - botLim, ly));
      placed.push([lx, ly, bw, bh]);
      L.el.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px)`;
      const ex = left ? lx + bw : lx, ey = ly + bh / 2;
      const col = L.el.classList.contains('sel') ? 'var(--sel)' : L.col || (L.el.classList.contains('hot') ? 'var(--path)' : 'var(--ink-2)');
      svg += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" style="stroke:${col}" stroke-width="1"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#fff" style="stroke:${col}" stroke-width="1.5"/>`;
    });
    linesEl.innerHTML = svg;
  }

  /* ---------- câmera ---------- */
  let tween = null;
  function resolveTarget(t) {
    if (t instanceof V3) return t.clone();
    if (t === 'center') return model.anchors.get('center').clone();
    return resolvePos(t) || model.anchors.get('center').clone();
  }
  function sph(p, t) { const d = new V3().subVectors(p, t); const r = d.length(); return { r, az: Math.atan2(d.x, d.z), el: Math.asin(Math.max(-1, Math.min(1, d.y / r))) }; }
  function flyTo(cam, dur = 1100) {
    if (!has3D) return;
    const T = resolveTarget(cam.t);
    const end = { r: cam.d, az: cam.az * deg, el: cam.el * deg };
    if (reduce || dur === 0) { controls.target.copy(T); placeCam(T, end); return; }
    const start = sph(camera.position, controls.target);
    let daz = end.az - start.az; while (daz > Math.PI) daz -= 2 * Math.PI; while (daz < -Math.PI) daz += 2 * Math.PI;
    // t0 é marcado no primeiro quadro: o horário do quadro pode ser anterior a performance.now() depois de uma montagem
    // longa, e um progresso negativo jogava a câmera para trás (ou para NaN)
    tween = { t0: null, dur, T0: controls.target.clone(), T1: T, s0: start, daz, end };
  }
  function placeCam(T, s) { camera.position.set(T.x + s.r * Math.sin(s.az) * Math.cos(s.el), T.y + s.r * Math.sin(s.el), T.z + s.r * Math.cos(s.az) * Math.cos(s.el)); camera.lookAt(T); }
  function stepTween(now) {
    if (tween.t0 === null) tween.t0 = now;
    const k = Math.min(1, Math.max(0, (now - tween.t0) / tween.dur)), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const T = tween.T0.clone().lerp(tween.T1, e);
    const lr = Math.log(tween.s0.r) + (Math.log(tween.end.r) - Math.log(tween.s0.r)) * e;
    placeCam(T, { r: Math.exp(lr), az: tween.s0.az + tween.daz * e, el: tween.s0.el + (tween.end.el - tween.s0.el) * e });
    controls.target.copy(T);
    if (k >= 1) tween = null;
  }
  if (has3D) { tmp = new V3(); controls.addEventListener('start', () => { tween = null; }); }

  /* ---------- ferramentas (Camadas e cortes) ---------- */
  const LAYERS = [['bone', 'Ossos', '#D8C8A6'], ['disc', 'Discos', '#7FB0D6'], ['lig', 'Ligamentos', '#C98A2C'], ['neuro', 'Medula e nervos', '#EBC229'], ['vessel', 'Vasos', '#C9403F'], ['rib', 'Costelas', '#CDBFA4']];
  const layersEl = $('#layers'), toolsEl = $('#viewtools');
  LAYERS.forEach(([k, name, col]) => {
    const b = document.createElement('button'); b.className = 'chip'; b.dataset.layer = k; b.innerHTML = `<i class="sw" style="background:${col}" aria-hidden="true"></i>${name}`;
    b.addEventListener('click', () => { S.layers[k] = !S.layers[k]; applyVisuals(); syncTools(); });
    layersEl.appendChild(b);
  });
  const TOOLS = [['ghost', 'Ossos transparentes'], ['sag', 'Corte sagital'], ['ax', 'Corte axial'], ['labels', 'Rótulos'], ['reset', 'Voltar à vista do passo']];
  TOOLS.forEach(([k, name]) => {
    const b = document.createElement('button'); b.className = 'chip'; b.dataset.tool = k; b.textContent = name;
    b.addEventListener('click', () => {
      if (k === 'ghost') { S.ghost = !S.ghost; applyVisuals(); }
      if (k === 'sag') { const on = S.clip !== 'sag'; setClip(on ? 'sag' : null); if (on) { const s = sph(camera.position, controls.target); const tg = cutTargets(); let t = controls.target.clone(), d = s.r; if (tg.length) { t = new V3(); tg.forEach(m => t.add(boxOf(m).getCenter(new V3()))); t.multiplyScalar(1 / tg.length); d = Math.max(16, Math.min(s.r, 40)); } flyTo({ t: t.setX(S.sagX || 0), az: 90, el: 4, d }, 800); if ((S.sagX || 0) > 0.3) say('Corte sagital fora da linha média, passando pela lesão.'); } }
      if (k === 'ax') { const on = !(S.clip && S.clip.startsWith('ax:')); if (on && !S.axUser && !(S.cfg && S.cfg.clip && S.cfg.clip.startsWith('ax:'))) { S.axPt = null; const f = (S.cfg && S.cfg.ax) || focusLevel(); if (f) S.axLevel = f; } setClip(on ? 'ax:' + S.axLevel : null); if (on) flyTo({ t: axTarget(S.axLevel), az: 0, el: -78, d: 24 }, 900); }
      if (k === 'labels') S.labelsOn = !S.labelsOn;
      if (k === 'reset' && S.cfg) applyConfig(S.cfg, true, true);
      syncTools();
    });
    toolsEl.appendChild(b);
  });
  const lvsel = document.createElement('select'); lvsel.className = 'lvsel'; lvsel.id = 'lvsel'; lvsel.setAttribute('aria-label', 'Ir para um nível');
  function syncTools() {
    layersEl.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', !!S.layers[b.dataset.layer]));
    toolsEl.querySelectorAll('.chip').forEach(b => {
      const k = b.dataset.tool; let on = false;
      if (k === 'ghost') on = S.ghost; if (k === 'sag') on = S.clip === 'sag'; if (k === 'ax') on = !!(S.clip && S.clip.startsWith('ax:')); if (k === 'labels') on = S.labelsOn;
      if (k === 'ax') b.textContent = 'Corte axial ' + S.axLevel;
      if (k !== 'reset') b.setAttribute('aria-pressed', on);
    });
  }
  function setTools(open) {
    toolsBox.classList.toggle('open', open); ttog.setAttribute('aria-expanded', open);
    store.tools = open; save();
  }
  ttog.addEventListener('click', () => setTools(!toolsBox.classList.contains('open')));

  /* ---------- régua de níveis ---------- */
  const RULER = []; ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'].forEach(n => RULER.push([n, 'C'])); for (let i = 1; i <= 12; i++) RULER.push(['T' + i, 'T']); for (let i = 1; i <= 5; i++) RULER.push(['L' + i, 'L']); RULER.push(['S', 'S'], ['Co', 'S']);
  const RC = { C: '#5B87B5', T: '#6E9B62', L: '#C79A3B', S: '#B9786D' };
  const RNAME = { C: 'Cervical', T: 'Torácica', L: 'Lombar', S: 'Sacral' };
  const rulerEl = $('#ruler');
  lvsel.innerHTML = '<option value="">Ir para nível…</option>' + RULER.map(([n]) => `<option value="${n}">${n === 'S' ? 'Sacro' : n === 'Co' ? 'Cóccix' : n}</option>`).join('');
  lvsel.addEventListener('change', () => { if (lvsel.value) goLevel(lvsel.value); });
  layersEl.parentNode.appendChild(lvsel);
  RULER.forEach(([n, r], i) => {
    const b = document.createElement('button'); b.textContent = n; b.style.setProperty('--rc', RC[r]); b.dataset.lv = n;
    b.setAttribute('aria-label', n === 'S' ? 'Sacro' : n === 'Co' ? 'Cóccix' : 'Vértebra ' + n); b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener('click', () => goLevel(n)); rulerEl.appendChild(b);
  });
  rulerEl.addEventListener('keydown', e => {
    const bs = [...rulerEl.querySelectorAll('button')].filter(b => !b.hidden); const i = bs.indexOf(document.activeElement); if (i < 0) return;
    let j = i;
    if (e.key === 'ArrowDown') j = Math.min(bs.length - 1, i + 1); else if (e.key === 'ArrowUp') j = Math.max(0, i - 1);
    else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = bs.length - 1; else return;
    e.preventDefault(); e.stopPropagation(); bs[i].tabIndex = -1; bs[j].tabIndex = 0; bs[j].focus();
  });
  function setRulerLevels(list) {
    const bs = [...rulerEl.querySelectorAll('button')];
    bs.forEach(b => { b.hidden = !!list && !list.includes(b.dataset.lv); b.tabIndex = -1; });
    const firstVis = bs.find(b => !b.hidden); if (firstVis) firstVis.tabIndex = 0;
    rulerEl.classList.toggle('short', !!list);
    const P = S.mode === 'proc';
    rulerEl.setAttribute('aria-label', list ? 'Níveis envolvidos ' + (P ? 'neste procedimento' : 'nesta doença') : 'Ir para um nível da coluna');
    const opts = RULER.filter(([n]) => !list || list.includes(n));
    lvsel.innerHTML = `<option value="">${list ? (P ? 'Níveis deste procedimento…' : 'Níveis desta doença…') : 'Ir para nível…'}</option>` + opts.map(([n]) => `<option value="${n}">${n === 'S' ? 'Sacro' : n === 'Co' ? 'Cóccix' : n}</option>`).join('');
  }
  function clearRuler() { rulerEl.querySelectorAll('button').forEach(b => b.classList.remove('on')); lvsel.value = ''; }
  function goLevel(n) {
    if (!has3D) return;
    if (S.selKey === 'lv:' + n && !infoEl.hidden) { closeCard(); say('Seleção desfeita.'); return; }
    rulerEl.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.lv === n));
    const s = sph(camera.position, controls.target);
    const t = n === 'S' ? 'sacrum' : n === 'Co' ? 'coccyx' : n;
    flyTo({ t, az: s.az / deg, el: Math.max(-10, Math.min(40, s.el / deg)), d: n[0] === 'C' ? 16 : n[0] === 'T' ? 20 : 24 }, 800);
    const lvKey = n === 'S' ? 'S' : n === 'Co' ? 'Co' : n;
    S.sel = new Set(model.meshes.filter(m => lvlAlias(m.userData.level) === lvKey && (KIND[m.userData.kind] || {}).L === 'bone'));
    if (LV[n]) { S.axLevel = n; S.axUser = true; S.axPt = null; if (S.clip && S.clip.startsWith('ax:')) { setClip('ax:' + n); flyTo({ t: axTarget(n), az: 0, el: -78, d: n[0] === 'C' ? 16 : 24 }, 800); } }
    applyVisuals(); syncTools();
    const l = LV[n], name = n === 'S' ? 'Sacro' : n === 'Co' ? 'Cóccix' : 'Vértebra ' + n;
    let html = `<h3>${name}</h3><div class="meta">Região ${RNAME[l ? l.r : 'S'].toLowerCase()}</div><p>${LEVEL_NOTES[n] || ''}</p>`;
    if (l && n !== 'C1') {
      const mm = x => Math.round(x * 10);
      html += `<ul><li>Corpo: altura ${mm(l.h)} mm, largura ${mm(l.W)} mm, profundidade ${mm(l.D)} mm</li><li>Canal: ${mm(l.cw)} × ${mm(l.ca)} mm (transverso × AP)</li>`;
      if (l.r === 'C') { const k = +n.slice(1); html += `<li>Raiz que sai acima: C${k}; Abaixo: C${k + 1}</li>`; }
      else { const k = +n.slice(1); const nx = l.r === 'T' ? (k === 12 ? 'L1' : 'T' + (k + 1)) : (k === 5 ? 'S1' : 'L' + (k + 1)); html += `<li>Raiz que sai abaixo: ${n} (forame ${n}-${nx})</li>`; }
      html += `</ul><div class="note">Medidas médias de adulto usadas no modelo, aproximadas.</div>`;
    }
    showCard(html); S.selKey = 'lv:' + n; say(name + ' selecionada.');
  }

  /* ---------- cartão / seleção ---------- */
  const infoEl = $('#info'), hintEl = $('#hint');
  infoEl.setAttribute('role', 'region'); infoEl.setAttribute('aria-label', 'Estrutura selecionada');
  function closeCard() { infoEl.hidden = true; hintEl.hidden = false; S.sel = null; S.selKey = null; clearRuler(); applyVisuals(); }
  function showCard(html, actions) {
    infoEl.innerHTML = `<button class="x" aria-label="Fechar">×</button>` + html + (actions ? `<div class="acts">${actions}</div>` : '');
    infoEl.hidden = false; hintEl.hidden = true;
    infoEl.querySelector('.x').onclick = closeCard;
  }
  const SIDE = { L: 'lado esquerdo', R: 'lado direito' };
  function describe(m) {
    const u = m.userData; const inf = INFO[u.info] || [u.info, ''];
    let title = inf[0], text = inf[1], meta = '';
    const side = /\.(L|R)$/.test(u.key) ? u.key.slice(-1) : null;
    if (u.kind === 'root' || u.kind === 'drg') {
      title = (u.kind === 'root' ? 'Raiz ' : 'Gânglio da raiz dorsal ') + u.nerve;
      text = (u.kind === 'drg' ? INFO.drg[1] + ' ' : '') + rootExit(u.nerve) + (ROOTFN[u.nerve] ? ' ' + ROOTFN[u.nerve] : '');
      meta = SIDE[u.side] || '';
    } else if (u.level && !['disc', 'discDeg', 'discInf', 'lamA', 'lamB', 'nucleus', 'nucDeg', 'lig', 'flavum', 'flavumHyp', 'capsule', 'capsuleHyp'].includes(u.kind) && /^(C|T|L)\d/.test(u.level)) {
      meta = `${u.level}, ${(RNAME[u.level[0]] || '').toLowerCase()}${side ? ', ' + SIDE[side] : ''}`;
    } else if (u.level) { meta = u.level + (side ? ', ' + SIDE[side] : ''); }
    else if (side) meta = SIDE[side];
    return { title, text, meta };
  }
  function frameMeshes(ms) {
    const b = new THREE.Box3(); ms.forEach(x => b.expandByObject(x));
    const c = b.getCenter(new V3()), size = b.getSize(new V3()).length();
    const dir = new V3().subVectors(c, model.anchors.get('center')); dir.y = 0;
    const s = sph(camera.position, controls.target);
    const az = dir.lengthSq() > 4 ? Math.atan2(dir.x, dir.z) / deg : s.az / deg;
    flyTo({ t: c, az, el: 12, d: Math.max(8, size * 2.2) }, 800);
  }
  function showInfo(m) {
    if (S.selKey === m.userData.key && !infoEl.hidden) { closeCard(); say('Seleção desfeita.'); return; }
    const d = describe(m), ms = model.reg.get(m.userData.key) || [m];
    S.selKey = m.userData.key;
    S.sel = new Set(ms); applyVisuals();
    showCard(`<h3>${d.title}</h3>${d.meta ? `<div class="meta">${d.meta}</div>` : ''}<p>${d.text}</p>`, `<button class="btn sm" id="ci-zoom">Ver de perto</button>`);
    $('#ci-zoom').onclick = () => frameMeshes(ms);
    say(d.title + (d.meta ? ', ' + d.meta : '') + '. ' + d.text);
  }
  const ALIAS = { conus: 'cord', cervEnl: 'cord', lumbEnl: 'cord', 'cord.T': 'cord', medulla: 'cord', cauda: 'dura', duraEnd: 'dura', promontory: 'S1.body', 'ala.L': 'sacrum', EOP: 'occ', 'aorta.L': 'aorta', 'aorta.bif': 'aorta', 'aorta.arch': 'aorta', plexus: 'plex.ant.L', bvv: 'bvv.L2', ALL: 'ALL.L3', 'ALL.C': 'ALL.C5', PLL: 'PLL.L3', 'PLL.C': 'PLL.C4', psa: 'psa.L' };
  function aliasKey(key) {
    if (model.reg.has(key)) return key;
    if (ALIAS[key]) return ALIAS[key];
    let m;
    if ((m = key.match(/^va\.V\d\.(L|R)$/))) return 'va.' + m[1];
    if ((m = key.match(/^rootIn\.(.+)$/))) return 'root.' + m[1];
    if ((m = key.match(/^cvj\.(\d+)\.(L|R)$/))) return `rib.${m[1]}.${m[2]}`;
    if (/^sf\./.test(key)) return 'sacrum';
    if ((m = key.match(/^(C|T|L)\d+\.(endplate|canal)$/))) return key.split('.')[0] + '.body';
    if (/^(C|T|L)\d+$/.test(key)) return key + '.body';
    return key;
  }
  // chave que nomeia uma vértebra inteira (ou sacro/cóccix): mesmo nível da régua
  const levelOf = key => /^(C[1-7]|T([1-9]|1[0-2])|L[1-5])$/.test(key) ? key : key === 'sacrum' ? 'S' : key === 'coccyx' ? 'Co' : null;
  function focusKey(key, text) {
    if (!has3D) return;
    if (camOnly(key)) {
      const p = resolvePos(key);
      if (p) { const s = sph(camera.position, controls.target); flyTo({ t: p, az: s.az / deg, el: s.el / deg, d: Math.min(s.r, 22) }, 800); }
      if (!infoEl.hidden) closeCard();
      say(text); return;
    }
    const lv = levelOf(key); if (lv) { goLevel(lv); return; }
    const ms = model.reg.get(aliasKey(key));
    if (ms && ms.length) showInfo(ms[0]);
    else if (S.selKey === 'txt:' + key && !infoEl.hidden) closeCard();
    else { showCard(`<h3>${esc(text)}</h3>`); S.selKey = 'txt:' + key; say(text); }
  }
  if (has3D) {
    const ray = new THREE.Raycaster(); const pd = { x: 0, y: 0, t: 0 };
    canvas.addEventListener('pointerdown', e => { pd.x = e.clientX; pd.y = e.clientY; pd.t = performance.now(); });
    canvas.addEventListener('pointerup', e => {
      if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 6 || performance.now() - pd.t > 600) return;
      const r = canvas.getBoundingClientRect();
      ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera);
      const cand = model.meshes.filter(m => m.visible && m.userData.variant !== 'f' && m.userData.kind !== 'dura' && m.userData.kind !== 'ctx');
      const hits = ray.intersectObjects(cand, false).filter(h => !renderer.clippingPlanes.length || plane.distanceToPoint(h.point) >= -0.02);
      let hit = hits[0];
      if (S.ghost && hit && (KIND[hit.object.userData.kind] || {}).g) { const nb = hits.find(h => !(KIND[h.object.userData.kind] || {}).g); if (nb) hit = nb; }
      if (hit) showInfo(hit.object);
      else if (!infoEl.hidden) closeCard();
    });
  }

  /* ---------- celular: explorar em 3D sob demanda ---------- */
  function setFull(on) {
    view.classList.toggle('full', on);
    if (has3D) controls.enabled = on || !mobileQ.matches;
    document.body.style.overflow = on ? 'hidden' : '';
    if (on) $('#done3d').focus(); else $('#explore').focus();
  }
  $('#explore').addEventListener('click', () => setFull(true));
  $('#done3d').addEventListener('click', () => setFull(false));
  mobileQ.addEventListener && mobileQ.addEventListener('change', () => { if (!mobileQ.matches) view.classList.remove('full'); if (has3D) controls.enabled = !mobileQ.matches || view.classList.contains('full'); });

  /* ---------- aplicar um passo ou doença ---------- */
  function applyConfig(cfg, fly = true, keepLabels = false) {
    S.cfg = cfg;
    if (!has3D) return;
    S.layers = {}; (cfg.show || 'bone disc').split(' ').forEach(k => S.layers[k] = true);
    S.ghost = !!cfg.ghost; S.tint = !!cfg.tint; S.hide = cfg.hide || [];
    S.focus = cfg.focus ? new Set(cfg.focus) : null;
    S.focusIdx = []; (cfg.focus || []).forEach(n => { const KI = model.KI; if (n === 'S') S.focusIdx.push(KI.S1, KI.S2, KI.S3, KI.S4, KI.S5); else if (n === 'Co') S.focusIdx.push(KI.Co1, KI.Co2, KI.Co3, KI.Co4); else if (n === 'Occ') S.focusIdx.push(0); else if (KI[n] !== undefined) S.focusIdx.push(KI[n]); });
    S.hot = new Set(cfg.hot || []);
    S.sel = null; S.selKey = null; infoEl.hidden = true; hintEl.hidden = false; clearRuler();
    setRulerLevels(S.mode !== 'anat' && S.dz && cfg.levels ? cfg.levels : null);
    S.axUser = false; S.axPt = null;
    if (cfg.clip && cfg.clip.startsWith('ax:')) S.axLevel = cfg.clip.slice(3);
    // o botão já mostra o nível que o clique vai usar (o mesmo cálculo do clique), não o último usado
    // ax: nível do corte axial da barra quando o passo não abre cortado (sem ele, o nível com mais lesões)
    else { const f = cfg.ax || focusLevel(); if (f) S.axLevel = f; }
    setClip(cfg.clip || null);
    setDenis(cfg.extra === 'denis');
    applyVisuals();
    setLabels(cfg.labels);
    syncTools();
    if (fly && cfg.cam) flyTo(cfg.cam);
  }

  /* ---------- painel ---------- */
  const chapEl = $('#chap'), chapWrap = $('#chapwrap'), scrollEl = $('#scroll'), navEl = $('#nav');
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const LOCATE = mobileQ.matches ? 'Toque para localizar no 3D' : 'Clique para localizar no 3D';
  function edgeFade() { const l = chapEl.scrollLeft > 4, r = chapEl.scrollLeft + chapEl.clientWidth < chapEl.scrollWidth - 4; chapWrap.classList.toggle('more-l', l); chapWrap.classList.toggle('more-r', r); }
  chapEl.addEventListener('scroll', edgeFade, { passive: true });
  function chapterDone(ch) { return ALL_STEPS.every((s, i) => s.ch !== ch || store.seen.includes(i)); }
  /* ---------- trilha à esquerda (desktop): Anatomia/Doenças e os capítulos saem do topo e do painel ---------- */
  const rail = $('#rail'), railH = $('#railh'), modeSeg = $('#m-anat').parentNode, brand = $('.brand');
  function placeNav() {
    if (mobileQ.matches) { brand.after(modeSeg); $('#panel').prepend(chapWrap); }
    else { rail.prepend(modeSeg); railH.parentNode.after(chapWrap); }
  }
  placeNav();
  const railX = $('#railx');
  function setRail(open) {
    $('.stage').classList.toggle('railoff', !open);
    railX.textContent = open ? '\u00ab' : '\u00bb';
    railX.title = open ? 'Recolher o índice' : 'Abrir o índice';
    railX.setAttribute('aria-label', railX.title); railX.setAttribute('aria-expanded', open);
  }
  setRail(!store.railOff);
  mobileQ.addEventListener && mobileQ.addEventListener('change', placeNav);
  function renderChapters() {
    railH.textContent = S.mode === 'anat' ? 'Capítulos' : S.mode === 'proc' ? 'Grupos de procedimentos' : S.mode === 'rm' ? 'Trilhas' : 'Grupos de doenças';
    if (S.mode === 'rm') {
      // as duas partes (RM_GROUPS) com as trilhas; a trilha aberta se abre nos passos (os nomes das partes e a lista de passos só aparecem na trilha do desktop)
      const cur = RM_STEPS[S.rmStep];
      chapEl.innerHTML = RM_GROUPS.map((g, gi) => `<p class="rmgrp">${esc(g)}</p>` + RM_TRACKS.filter(t => t.g === gi).map(t => `<button data-rk="${RM_STEPS.findIndex(r => r.t === t)}" aria-current="${cur.t === t}" class="${RM_STEPS.every(r => r.t !== t || store.rmSeen.includes(r.id)) ? 'done' : ''}">${esc(t.name)}</button>`
        + (cur.t === t ? `<div class="rmsteps">${RM_STEPS.map((r, k) => r.t === t ? `<button data-rk="${k}" aria-current="${k === S.rmStep ? 'step' : 'false'}" class="${store.rmSeen.includes(r.id) ? 'done' : ''}"><b>${r.i + 1}</b>${esc(r.st.t)}</button>` : '').join('')}</div>` : '')).join('')).join('');
      chapEl.querySelectorAll('button').forEach(b => b.onclick = () => goRm(+b.dataset.rk, true));
    } else if (S.mode === 'anat') {
      chapEl.innerHTML = CHAPTERS.map((c, i) => `<button data-ch="${i}" aria-current="${ALL_STEPS[S.step].ch === i ? 'step' : 'false'}" class="${chapterDone(i) ? 'done' : ''}"><b>${i + 1}</b>${c}</button>`).join('');
      chapEl.querySelectorAll('button').forEach(b => b.onclick = () => goStep(ALL_STEPS.findIndex(s => s.ch === +b.dataset.ch), true));
    } else {
      // só os grupos que têm itens (a lista de procedimentos ainda é parcial)
      const L = items();
      chapEl.innerHTML = cats().map((c, i) => L.some(d => d.cat === i) ? `<button data-c="${i}" aria-current="${S.dz && L.find(d => d.id === S.dz).cat === i ? 'step' : 'false'}">${c}</button>` : '').join('');
      chapEl.querySelectorAll('button').forEach(b => b.onclick = () => { if (S.dz) closeDz(); const t = scrollEl.querySelector(`[data-cat="${b.dataset.c}"]`); if (t) { t.scrollIntoView({ block: 'start' }); t.focus({ preventScroll: true }); } });
    }
    const cur = chapEl.querySelector('[aria-current="step"], [aria-current="true"]');
    if (cur) { const l = cur.offsetLeft - chapEl.offsetLeft, r = l + cur.offsetWidth; if (l < chapEl.scrollLeft || r > chapEl.scrollLeft + chapEl.clientWidth) chapEl.scrollLeft = l - 24; }
    requestAnimationFrame(edgeFade);
  }
  function setNav(html, focusId) {
    const had = document.activeElement && document.activeElement.id;
    navEl.innerHTML = html;
    const want = focusId || (['prev', 'next', 'first'].includes(had) ? had : null);
    if (want) { const el = $('#' + want); if (el && !el.disabled) el.focus(); else { const n = $('#next'); if (n) n.focus(); } }
  }
  function focusTitle() { const h = scrollEl.querySelector('h2'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  function bindSee() {
    scrollEl.querySelectorAll('.see button').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (has3D && !levelOf(k) && !camOnly(k)) { const p = resolvePos(k); if (p) { const s = sph(camera.position, controls.target); flyTo({ t: p, az: s.az / deg, el: s.el / deg, d: Math.min(s.r, 22) }, 800); } }
      focusKey(k, b.textContent);
      if (mobileQ.matches) view.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });
  }
  const seeHtml = labels => labels && labels.length ? `<div class="see"><div class="h">${LOCATE}</div><div class="row">${labels.map(([k, t]) => `<button data-k="${k}">${esc(t)}</button>`).join('')}</div></div>` : '';

  function renderStep(fromKey) {
    const st = ALL_STEPS[S.step];
    if (!store.seen.includes(S.step)) store.seen.push(S.step);
    store.step = S.step; save(); progress();
    renderChapters();
    const inCh = ALL_STEPS.filter(s => s.ch === st.ch), pos = inCh.indexOf(st) + 1;
    let h = `<div class="eyebrow">Capítulo ${st.ch + 1} de ${CHAPTERS.length}: ${CHAPTERS[st.ch]}, passo ${pos} de ${inCh.length}</div><h2>${esc(st.title)}</h2>`;
    if (st.quiz !== undefined) {
      h += `<p>Três perguntas para fixar o capítulo. A resposta aparece ao escolher.</p>` + quizHtml(QUIZ[st.quiz], 'q' + st.quiz);
    } else {
      if (st.how) h += `<p class="how"><b>Como usar.</b> ${esc(st.how.replace(/^Como usar: /, '').replace(/^./, c => c.toUpperCase()))}</p>`;
      h += st.body.map(p => `<p>${esc(p)}</p>`).join('');
      if (st.extra === 'wilke') h += wilkeHtml();
      h += `<aside class="pro"><div class="h">Para o especialista</div><p>${esc(st.pro)}</p></aside>`;
      h += seeHtml(st.labels);
    }
    scrollEl.innerHTML = h; scrollEl.scrollTop = 0;
    bindQuiz('q' + st.quiz, st.quiz);
    bindSee();
    const last = S.step === ALL_STEPS.length - 1;
    setNav(`<button class="btn" id="prev" ${S.step === 0 ? 'disabled' : ''}>Anterior</button><button class="btn primary" id="next">${last ? 'Ir para doenças' : 'Próximo'}</button>`);
    $('#prev').onclick = () => goStep(S.step - 1);
    $('#next').onclick = () => last ? setMode('dz', true) : goStep(S.step + 1);
    if (st.quiz === undefined) applyConfig(st);
    else { const prevCfg = [...ALL_STEPS.slice(0, S.step)].reverse().find(s => s.ch === st.ch && s.quiz === undefined); if (prevCfg) applyConfig(prevCfg); }
    if (fromKey) focusTitle();
    say(`Capítulo ${st.ch + 1}, ${CHAPTERS[st.ch]}. ${st.title}.`);
  }
  function goStep(i, moveFocus) {
    if (i < 0 || i >= ALL_STEPS.length) return;
    if (S.mode !== 'anat') { S.mode = 'anat'; S.dz = null; syncMode(); rebuild({}); }
    S.step = i; renderStep(moveFocus);
  }
  function wilkeHtml() {
    const rows = [['Deitado de costas', 0.10], ['Deitado de lado', 0.12], ['Sentado sem encosto', 0.46], ['Em pé relaxado', 0.50], ['Em pé, tronco inclinado', 1.10], ['20 kg junto ao corpo', 1.10], ['20 kg com joelhos fletidos', 1.70], ['20 kg com o tronco fletido', 2.30]];
    return `<div class="bars">${rows.map(([t, v]) => `<div class="r"><span>${t}</span><span class="t" aria-hidden="true"><i style="width:${(v / 2.3 * 100).toFixed(0)}%"></i></span><span class="v">${v.toFixed(2).replace('.', ',')} MPa</span></div>`).join('')}<div class="note">Pressão intradiscal em L4-L5, um voluntário, Wilke et al., Spine 1999.</div></div>`;
  }
  function order(n, seed) { let t = seed >>> 0; const rnd = () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const seedOf = (id, qi) => String(id + ':' + qi).split('').reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  function quizHtml(qs, id) {
    const saved = store.quiz[id] || {};
    return `<div class="quiz" data-id="${id}">` + qs.map((q, qi) => {
      const ord = order(q[1].length, seedOf(id, qi)); const ans = saved[qi];
      return `<div class="q" data-qi="${qi}" role="group" aria-labelledby="${id}-q${qi}"><div class="qt" id="${id}-q${qi}">${qi + 1}. ${esc(q[0])}</div><div class="opts">${ord.map(oi => {
        let cls = ''; if (ans !== undefined) { if (oi === q[2]) cls = 'ok'; else if (oi === ans) cls = 'no'; }
        return `<button data-oi="${oi}" class="${cls}" ${ans !== undefined ? 'disabled' : ''}>${esc(q[1][oi])}</button>`;
      }).join('')}</div>${ans !== undefined ? `<div class="ex">${ans === q[2] ? 'Certo. ' : 'Não. '}${esc(q[3])}</div>` : ''}</div>`;
    }).join('') + `<div class="qfoot"><div class="score" id="score-${id}"></div><button class="btn sm" id="redo-${id}" hidden>Refazer o teste</button></div></div>`;
  }
  function bindQuiz(id, qset) {
    const qs = qset === 'dz' ? DZ_QUIZ : QUIZ[qset]; if (!qs) return;
    const redo = $('#redo-' + id);
    const upd = () => {
      const s = store.quiz[id] || {}; const n = Object.keys(s).length; const ok = Object.entries(s).filter(([i, a]) => qs[i][2] === a).length;
      const el = $('#score-' + id); if (el) el.textContent = n ? `${ok} de ${qs.length} certas` + (n < qs.length ? `, faltam ${qs.length - n}` : '') : '';
      if (redo) redo.hidden = !n;
    };
    if (redo) redo.onclick = () => {
      delete store.quiz[id]; save();
      const wrap = scrollEl.querySelector(`.quiz[data-id="${id}"]`);
      wrap.outerHTML = quizHtml(qs, id); bindQuiz(id, qset);
      const f = scrollEl.querySelector(`.quiz[data-id="${id}"] .opts button`); if (f) f.focus();
      say('Teste reiniciado.');
    };
    scrollEl.querySelectorAll(`.quiz[data-id="${id}"] .q`).forEach(qe => {
      const qi = +qe.dataset.qi;
      qe.querySelectorAll('.opts button').forEach(b => b.onclick = () => {
        store.quiz[id] = store.quiz[id] || {}; store.quiz[id][qi] = +b.dataset.oi; save();
        const q = qs[qi];
        qe.querySelectorAll('.opts button').forEach(x => { x.disabled = true; const oi = +x.dataset.oi; if (oi === q[2]) x.classList.add('ok'); else if (oi === +b.dataset.oi) x.classList.add('no'); });
        const msg = (+b.dataset.oi === q[2] ? 'Certo. ' : 'Não. ') + q[3];
        const ex = document.createElement('div'); ex.className = 'ex'; ex.textContent = msg; qe.appendChild(ex);
        ex.tabIndex = -1; ex.focus({ preventScroll: true });
        say(msg); upd();
      });
    });
    upd();
  }

  /* ---------- doenças ---------- */
  const NEUTRAL = /^(hernia|osteo|tumor|epi|frag|synd|dish|abscess|erosion|schmorl|myelo|crack)/;
  function neutralLabels(d) {
    if (!has3D) return [];
    return (d.labels || []).filter(([k]) => !NEUTRAL.test(k)).map(([k]) => {
      const ms = model.reg.get(aliasKey(k)); if (!ms || !ms.length) return null;
      const x = describe(ms[0]); return [k, x.title + (x.meta ? ', ' + x.meta.split(',')[0] : '')];
    }).filter(Boolean);
  }
  // procedimentos reaproveitam o fluxo das doenças (lista, ficha, régua, rótulos); só os campos de texto mudam
  function items() { return S.mode === 'proc' ? PROC : DZ; }
  // hérnia: posição e forma escolhidas no cartão (d.hv); o padrão (posterolateral, extrusão) é a própria doença.
  // memo: a mesma escolha devolve o mesmo objeto, e alternar Normal e Com a doença não remonta o modelo
  const hvMemo = new Map();
  function dzCfg(d) {
    const { zone: z, morph: m } = S.hv;
    if (!d.hv || z === 'pl' && m === 'ext') return d;
    if (!hvMemo.has(z + m)) {
      const Z = d.hv.zone[z], M = d.hv.morph[m];
      hvMemo.set(z + m, Object.assign({}, d, {
        mods: { disc: { 'L4-L5': { ...d.mods.disc['L4-L5'], hern: { zone: z, morph: m } } }, hotRoots: Z.roots, pinch: Z.f ? [{ at: 'L4-L5', f: m === 'prot' ? (1 + Z.f) / 2 : Z.f, w: 0.4, off: m === 'seq' ? 0.45 : 0, what: 'dura' }] : [], ...(Z.hug && { rootHug: Z.hug }) },
        labels: [['hernia', M.name + ' ' + Z.adj], ...Z.labels],
        // fragmento que desce atrás de L5: o corte axial do disco esconde a migração, o sagital pela hérnia mostra disco e fragmento juntos
        ...(m === 'seq' && Z.down && { clip: 'sag', cam: { t: 'hernia', az: 90, el: 4, d: 18 } })
      }));
    }
    return hvMemo.get(z + m);
  }
  function cats() { return S.mode === 'proc' ? PROC_CATS : DZ_CATS; }
  function closeDz() { S.dz = null; rebuild({}); applyConfig({ cam: { t: 'center', az: 30, el: 8, d: 120 }, show: 'bone disc' }); renderDz(); }
  function renderDz(moveFocus) {
    renderChapters(); progress();
    const P = S.mode === 'proc', L = items(), seen = P ? store.procSeen : store.dzSeen;
    if (!S.dz) {
      let h;
      if (P) h = `<h2>Procedimentos</h2><p>Cada procedimento mostra no mesmo modelo a agulha ou o instrumento e o que entra no paciente.</p>`;
      else {
        const allSeen = DZ.every(d => store.dzSeen.includes(d.id)) && ALL_STEPS.every((s, i) => store.seen.includes(i));
        h = `<h2>Doenças da coluna</h2>`;
        if (allSeen) h += `<div class="donebox"><p><strong>Você passou pelas ${ALL_STEPS.length} etapas de anatomia e pelas ${DZ.length} doenças.</strong> Feche com o teste final no fim da lista e, depois, revise os capítulos que tiveram erros.</p></div>`;
        h += `<p>Cada doença altera o mesmo modelo no ponto onde ela acontece. Use Normal e Com a doença para comparar.</p>`;
      }
      cats().forEach((c, i) => {
        const its = L.filter(d => d.cat === i); if (!its.length) return;
        h += `<h3 class="dzcat" data-cat="${i}" tabindex="-1">${c}</h3><div class="dzlist">` + its.map(d => `<button class="dzi ${seen.includes(d.id) ? 'seen' : ''}" data-id="${d.id}"><span>${esc(d.name)}</span><em>${esc(d.lv)}</em></button>`).join('') + `</div>`;
      });
      if (!P) {
        h += `<h3 class="dzcat">Teste final de patologia</h3>` + quizHtml(DZ_QUIZ, 'dz');
        h += `<details class="others"><summary>Outras condições para conhecer</summary><dl>${DZ_OTHERS.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('')}</dl></details>`;
      }
      scrollEl.innerHTML = h; scrollEl.scrollTop = 0;
      scrollEl.querySelectorAll('.dzi').forEach(b => b.onclick = () => openDz(b.dataset.id, true));
      if (!P) bindQuiz('dz', 'dz');
      setNav(P ? `<button class="btn" id="toanat">Voltar às doenças</button><button class="btn primary" id="first">Começar pelo primeiro</button>`
        : `<button class="btn" id="toanat">Voltar à anatomia</button><button class="btn primary" id="first">Começar pela primeira</button>`);
      $('#toanat').onclick = () => setMode(P ? 'dz' : 'anat', true);
      $('#first').onclick = () => openDz(L[0].id, true);
      if (moveFocus) focusTitle();
      return;
    }
    const d = L.find(x => x.id === S.dz), i = L.indexOf(d);
    let h = `<button class="back" id="back">← ${P ? 'Todos os procedimentos' : 'Todas as doenças'}</button><div class="eyebrow">${cats()[d.cat]}, ${i + 1} de ${L.length}</div><h2>${esc(d.name)}</h2><div class="lvtag">${esc(d.lv)}</div>`;
    // procedimento não tem versão "normal" para comparar: sem a alternância
    // caixa curta e igual em todos: deixa claro que cada procedimento tem o seu paciente e a sua região
    if (P) h += `<dl class="quando"><dt>Indicado para</dt><dd>${esc(d.ind)}</dd><dt>Região da coluna</dt><dd>${esc(d.regiao)}</dd><dt>Não indicado quando</dt><dd>${esc(d.nao)}</dd></dl>`;
    const cfg = dzCfg(d);
    if (!P) h += `<div class="dzbar"><div class="seg" role="group" aria-label="Comparar no 3D"><button id="t-n" aria-pressed="${!S.dzOn}">Normal</button><button id="t-d" class="dz" aria-pressed="${S.dzOn}">Com a doença</button></div>`
      + (d.hv && S.dzOn ? `<div class="hvar">` + [['zone', 'Posição'], ['morph', 'Forma']].map(([g, t]) => `<div class="hvt">${t}</div><div class="seg ${g}" role="group" aria-label="${t} da hérnia">`
        + Object.entries(d.hv[g]).map(([k, o]) => `<button data-hv="${g}.${k}" aria-pressed="${S.hv[g] === k}">${o.name}</button>`).join('') + `</div>`).join('')
        + `<p class="hvcap">${esc(d.hv.zone[S.hv.zone].cap + ' ' + d.hv.morph[S.hv.morph].cap)}</p></div>` : '') + `</div>`;
    (P ? [['Anatomia-alvo', d.alvo], ['Técnica e imagem', d.tec], ['O que se injeta ou faz', d.inj], ['Complicações', d.risco], ['Evidência', d.evid]]
      : [['O que é', d.what], ['Por que acontece', d.why], ['Sintomas', d.sx], ['Diagnóstico', d.dx], ['Tratamento', d.tx]]).forEach(([t, x]) => h += `<div class="sec"><h3>${t}</h3><p>${esc(x)}</p></div>`);
    h += `<aside class="pro"><div class="h">Para o especialista</div><p>${esc(d.pro)}</p></aside>`;
    h += seeHtml(P || S.dzOn ? cfg.labels : neutralLabels(cfg));
    scrollEl.innerHTML = h; scrollEl.scrollTop = 0;
    $('#back').onclick = () => { closeDz(); focusTitle(); };
    if (!P) {
      // no celular o 3D fica acima do cartão: depois de trocar o modelo, rola até ele; o foco fica no botão, sem puxar a página de volta
      const keep = sel => { scrollEl.querySelector(sel).focus({ preventScroll: true }); if (mobileQ.matches) view.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); };
      $('#t-n').onclick = () => { if (!S.dzOn) return; S.dzOn = false; rebuild({}); applyConfig(Object.assign({}, cfg, { hot: [], labels: neutralLabels(cfg) }), false); renderDz(); keep('#t-n'); say('Mostrando a coluna normal.'); };
      $('#t-d').onclick = () => { if (S.dzOn) return; S.dzOn = true; rebuild(cfg.mods); applyConfig(cfg, false); renderDz(); keep('#t-d'); say('Mostrando ' + d.name + '.'); };
      // variante da hérnia: remonta o modelo e volta a câmera à vista da variante (corte axial; sagital no sequestro que desce)
      scrollEl.querySelectorAll('[data-hv]').forEach(b => b.onclick = () => {
        const [g, k] = b.dataset.hv.split('.'); if (S.hv[g] === k) return;
        S.hv[g] = k; const c = dzCfg(d); rebuild(c.mods); applyConfig(c); renderDz();
        keep(`[data-hv="${g}.${k}"]`); say(c.labels[0][1] + '.');
      });
    }
    bindSee();
    const lastDz = i === L.length - 1;
    setNav(`<button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>Anterior</button><button class="btn primary" id="next">${lastDz ? (P ? 'Concluir' : 'Concluir e ir ao teste final') : P ? 'Próximo' : 'Próxima'}</button>`);
    $('#prev').onclick = () => openDz(L[i - 1].id);
    $('#next').onclick = () => { if (lastDz) { closeDz(); const q = scrollEl.querySelector('.quiz[data-id="dz"]'); if (q) { q.scrollIntoView({ block: 'start' }); const f = q.querySelector('button:not(:disabled)'); if (f) f.focus({ preventScroll: true }); } } else openDz(L[i + 1].id); };
    if (moveFocus) focusTitle();
  }

  /* ---------- ressonância: trilhas em exames do SPIDER e da RSNA (src/rm.js) na NiiVue, que só carrega ao entrar no modo ---------- */
  const rmView = $('#rmview'), rmCv = $('#rmgl'), rmAxCv = $('#rmaxgl'), rmBar = $('#rmbar'), rmTag = $('#rmtag'), rmMsg = $('#rmmsg');
  // nv: sagital, e no SPIDER também o axial montado, com a mesma mira. nvAx: o axial adquirido da RSNA, num segundo canvas (#rmax),
  // porque numa instância só a NiiVue reamostraria o axial na grade do sagital.
  // seq: série pedida; loaded: '<exame>/<série>' no sagital; axLoaded: exame no axial da RSNA; goto: { ex, mm } para a mira; pick: o que foi clicado; res: resposta no passo de teste
  const RM = { nv: null, nvAx: null, ready: null, axReady: null, q: Promise.resolve(), loaded: '', axLoaded: '', seq: 't2', goto: null, mask: false, names: false, pane: 'sag', pick: null, res: null };
  const rmEx = () => RM_STEPS[S.rmStep].ex;
  // só os exames da RSNA têm axial próprio, e nenhum deles tem máscara (no lugar dela, os pontos dos radiologistas)
  const rmRsna = ex => !!ex.ax;
  const RM_V = ['L5', 'L4', 'L3', 'L2', 'L1', 'T12', 'T11', 'T10', 'T9'];
  // rótulo da máscara -> nome e chave do 3D (as mesmas chaves de focusKey e da régua); f: nome feminino
  function rmName(v) {
    if (v >= 1 && v <= 9) return { nome: 'Vértebra ' + RM_V[v - 1], key: RM_V[v - 1], f: 1 };
    if (v === 100) return { nome: 'Canal vertebral', key: 'dura' };
    if (v > 200 && v < 210) { const n = v - 201, d = RM_V[n] + '-' + (n ? RM_V[n - 1] : 'S1'); return { nome: 'Disco ' + d, key: 'disc.' + d }; }
    return null;
  }
  // pontos da RSNA (src/rm.js, at): 'canal.L4-L5' -> 'Canal central, L4-L5'
  const RM_LM = { canal: 'Canal central', meio: 'Canal central', subD: 'Recesso lateral direito', subE: 'Recesso lateral esquerdo' };
  const rmLmName = id => RM_LM[id.split('.')[0]] + ', ' + id.split('.')[1];
  // frase de ensino do ponto, nos passos que não são teste; no recesso desce a raiz da vértebra de baixo (L5-S1: S1)
  const rmLmDica = id => id.startsWith('sub') ? 'Por aqui passa a raiz que desce. Neste nível, a raiz de ' + id.split('-')[1] + '.' : 'Aqui fica o saco dural, com o líquor claro e as raízes como pontos escuros.';
  const RM_TOL = 6; // mm: o clique vale para o ponto marcado a até esta distância, no plano do quadro clicado
  // ponto marcado mais perto do clique, no plano do quadro e a até um corte dele; null se nenhum está a até RM_TOL
  function rmLm(ex, nv, d) {
    const v = nv.volumes[0], f = nv.mm2frac(d.mm, 0, true), th = nv === RM.nvAx ? 2 : 0; // eixo entre os cortes: z no axial, x no sagital
    let best = null, bd = RM_TOL;
    for (const id in ex.at) {
      const g = nv.mm2frac(ex.at[id], 0, true), dv = [0, 1, 2].map(i => (g[i] - f[i]) * v.dimsRAS[i + 1]);
      if (Math.abs(dv[th]) > 1) continue;
      const mm = Math.hypot(...[0, 1, 2].filter(i => i !== th).map(i => dv[i] * v.pixDimsRAS[i + 1]));
      if (mm <= bd) { bd = mm; best = id; }
    }
    return best;
  }
  // shortcut: entrada -2 transparente na tabela de cores. A NiiVue 0.69.0 (shader das camadas, comentário 'issue1139') arredonda todo valor
  // acima do mínimo para pelo menos 2/256 da tabela, e o fundo 0 pintava com a cor do rótulo 1. Tirar se a NiiVue corrigir; retestar ao trocar de versão
  const RM_LUT = (() => {
    const I = [-2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 100, 201, 202, 203, 204, 205, 206, 207, 208, 209], L = { I, R: [], G: [], B: [], A: [], labels: I.map(v => (rmName(v) || { nome: '' }).nome) };
    // discos azuis, corpos alternando quente e roxo, canal amarelo (as cores do protótipo do spike)
    I.forEach(v => { const c = v <= 0 ? [0, 0, 0, 0] : v === 100 ? [255, 220, 0, 255] : v > 200 ? [0, 200, 255, 255] : v % 2 ? [255, 120, 60, 255] : [200, 70, 200, 255]; ['R', 'G', 'B', 'A'].forEach((k, i) => L[k].push(c[i])); });
    return L;
  })();
  const RM_SEQ = [['t2', 'T2'], ['t1', 'T1'], ['space', 'T2 alta resolução']];
  // contornos no axial montado com 1/4 da opacidade do sagital (0,4 vira 0,1): a 0,4 a cor cobria o saco dural e as raízes
  const RM_AXA = 0.25;
  // o 3D enquadra a lombar de lado, com a frente à direita como no sagital da NiiVue
  const RM_CFG = { cam: { t: 'L4', az: -90, el: 4, d: 40 }, show: 'bone disc' };
  // toque duplo ou longo reiniciava o contraste: toque duplo nunca (0 ms) e toque longo acima de qualquer toque (Infinity viraria 0 no setTimeout).
  // Convenção radiológica: no axial a esquerda do paciente fica à direita da tela, como nos exames; o sagital não muda
  const RM_OPTS = { fontColor: [1, 1, 1, 1], fontMinPx: 20, backColor: [12 / 255, 13 / 255, 16 / 255, 1], show3Dcrosshair: false, isColorbar: false, dragAndDropEnabled: false, loadingText: '', doubleTouchTimeout: 0, longTouchTimeout: 2e9, isNearestInterpolation: false, isRadiologicalConvention: true };
  // letras de orientação brancas com contorno escuro: a NiiVue 0.69.0 não tem opção de contorno, então todo texto sem cor própria sai antes em preto, 2 px para cada lado
  function rmOutline(nv) {
    const dt = nv.drawText.bind(nv);
    nv.drawText = (xy, s, sc = 1, c = null) => {
      if (!c) { const k = 2 * (nv.uiData.dpr || 1); [[-k, 0], [k, 0], [0, -k], [0, k]].forEach(([x, y]) => dt([xy[0] + x, xy[1] + y], s, sc, [0, 0, 0, 1])); }
      dt(xy, s, sc, c);
    };
  }
  function rmInit() {
    return RM.ready || (RM.ready = new Promise((ok, no) => {
      const s = document.createElement('script'); s.src = RM_NIIVUE.src; s.integrity = RM_NIIVUE.sri; s.crossOrigin = 'anonymous';
      s.onload = ok; s.onerror = () => { s.remove(); no(new Error('lib')); }; document.head.appendChild(s);
    }).then(async () => {
      const nv = new niivue.Niivue(RM_OPTS);
      await nv.attachToCanvas(rmCv); rmOutline(nv);
      // imagem linear e máscara (camada 1) no vizinho mais próximo, para a cor de um rótulo não vazar no outro; a NiiVue 0.69.0 só tem um ajuste para as duas
      const interp = nv.updateInterpolation.bind(nv);
      nv.updateInterpolation = (layer, force) => { if (!layer) return interp(layer, force); nv.opts.isNearestInterpolation = true; interp(layer); nv.opts.isNearestInterpolation = false; };
      // axial montado (SPIDER) aproximado, com cerca de 70 mm de largura, no meio do caminho entre o disco L4-L5 e o canal do exame (o centro do recorte fica atrás demais no SPACE),
      // e com os contornos mais fracos. O zoom e a opacidade da NiiVue valem para todos os quadros, então só o axial troca na hora de desenhar
      const draw2D = nv.draw2D.bind(nv);
      nv.draw2D = (ltwh, axCorSag, mm, wh) => {
        nv.overlayAlphaShader = axCorSag === 0 ? RM_AXA : 1; // uniforme lido a cada quadro em draw2DMain
        if (axCorSag !== 0 || rmRsna(rmEx())) return draw2D(ltwh, axCorSag, mm, wh);
        const { at } = rmEx(), sc = nv.scene, keep = sc.pan2Dxyzmm;
        sc.pan2Dxyzmm = rmPan(nv, [0, 1].map(i => (at[100][i] + at[202][i]) / 2), 70);
        try { return draw2D(ltwh, axCorSag, mm, wh); } finally { sc.pan2Dxyzmm = keep; }
      };
      nv.onLocationChange = d => rmPicked(d, nv); RM.nv = nv; rmLayout(); return nv;
    }).catch(e => { RM.ready = null; throw e; }));
  }
  // zoom do axial: cerca de w mm de largura, com o centro do quadro no ponto c (mm). Medido na 0.69.0: o centro do quadro é ((mn+mx)/2 - pan)/zoom,
  // com mn e mx do campo em voxels; a conta da versão anterior, c * (1 - zoom), só acertava quando o campo já estava centrado em c
  function rmPan(nv, c, w) {
    const e = nv.screenFieldOfViewExtendedVox(0), z = Math.max(1, nv.screenFieldOfViewExtendedMM(0).fovMM[0] / w);
    return [(e.mnMM[0] + e.mxMM[0]) / 2 - c[0] * z, (e.mnMM[1] + e.mxMM[1]) / 2 - c[1] * z, 0, z];
  }
  // segunda instância, só para o axial da RSNA; criada no primeiro exame da RSNA
  function rmAxInit() {
    return RM.axReady || (RM.axReady = rmInit().then(async () => {
      const a = new niivue.Niivue(RM_OPTS);
      await a.attachToCanvas(rmAxCv); rmOutline(a);
      a.onLocationChange = d => rmPicked(d, a); RM.nvAx = a; rmLayout(); return a;
    }).catch(e => { RM.axReady = null; throw e; }));
  }
  // mira num ponto em mm. mm2frac com o sform (true) é exato também no bloco axial inclinado do 3489738948, onde o padrão erra até 6,5 mm;
  // fora do volume (o axial da RSNA não cobre a coluna toda) a mira fica no corte da borda
  function rmAim(nv, mm) { nv.scene.crosshairPos = Float32Array.from(nv.mm2frac(mm, 0, true), f => Math.min(1, Math.max(0, f))); nv.drawScene(); }
  // leva a tela ao estado pedido (exame, série, mira); em fila, para cliques rápidos nunca misturarem duas cargas
  function rmShow() {
    RM.q = RM.q.then(rmApply).catch(() => { RM.loaded = RM.axLoaded = ''; rmMsg.textContent = 'As imagens não abriram. Confira a conexão e se o navegador tem WebGL2. O texto do passo continua no painel.'; });
    return RM.q;
  }
  async function rmApply() {
    if (S.mode !== 'rm') return;
    const id = RM_STEPS[S.rmStep].st.ex, ex = rmEx(), seq = ex.seqs[RM.seq] ? RM.seq : 't2', want = id + '/' + seq, base = 'rm/' + ex.dir + '/';
    if (RM.loaded !== want || (ex.ax && RM.axLoaded !== id)) rmMsg.textContent = 'Carregando as imagens…';
    const nv = await rmInit();
    if (RM.loaded !== want) {
      // troca de série no mesmo exame: a mira fica no mesmo ponto
      const keep = !RM.goto && RM.loaded.split('/')[0] === id ? { ex: id, mm: Array.from(nv.frac2mm(nv.scene.crosshairPos, 0, true)).slice(0, 3) } : null;
      const [img, mask] = ex.seqs[seq];
      RM.loaded = '';
      await nv.loadVolumes([{ url: base + img + '.nii.gz' }].concat(mask ? [{ url: base + mask + '.nii.gz', opacity: RM.mask ? 0.4 : 0 }] : []));
      if (mask) { nv.volumes[1].setColormapLabel(RM_LUT); nv.updateGLVolume(); }
      RM.loaded = want;
      if (keep) RM.goto = keep;
    }
    if (ex.ax && RM.axLoaded !== id) {
      const a = await rmAxInit();
      RM.axLoaded = '';
      await a.loadVolumes([{ url: base + ex.ax + '.nii.gz' }]);
      // axial com cerca de 90 mm de largura em volta do canal em L4-L5, que é a origem do estudo (docs/ressonancia.md, Origem deslocada)
      a.scene.pan2Dxyzmm = rmPan(a, [0, 0], 90);
      RM.axLoaded = id;
    }
    rmMsg.textContent = '';
    // a mira de outro exame espera a carga dele (uma carga anterior na fila não a consome)
    if (RM.goto && RM.goto.ex === id && RM.loaded === want) { rmAim(nv, RM.goto.mm); if (ex.ax) rmAim(RM.nvAx, RM.goto.mm); RM.goto = null; }
  }
  // desktop: sagital e axial lado a lado, a mesma mira nos dois; celular: um quadro por vez.
  // RSNA: o canvas principal só mostra o sagital e o axial fica no canvas de cima (#rmax), no lugar do quadro axial
  // SPIDER: o axial montado (borrado) só aparece no passo que o usa (st.axial); na RSNA o axial é adquirido e aparece sempre
  function rmLayout() {
    const one = mobileQ.matches, rs = rmRsna(rmEx()), ax = rs || !!RM_STEPS[S.rmStep].st.axial;
    rmView.classList.toggle('ax', one && ax && RM.pane === 'ax'); rmView.classList.toggle('rsna', rs); rmView.classList.toggle('noax', !ax);
    // t: faixa no alto para o nome do quadro não cobrir a imagem; o axial fica no alto para o encarte do 3D caber embaixo
    const t = Math.min(0.1, 26 / Math.max(1, rmCv.clientHeight)), ta = Math.min(0.1, 26 / Math.max(1, rmAxCv.clientHeight)), sag = { sliceType: 2, position: [0, t, 0.6, 1 - t] };
    if (RM.nv) RM.nv.setCustomLayout(one || !ax ? [{ sliceType: one && ax && !rs && RM.pane === 'ax' ? 0 : 2, position: [0, t, 1, 1 - t] }] : rs ? [sag] : [sag, { sliceType: 0, position: [0.6, t, 0.4, 0.62 - t] }]);
    if (RM.nvAx) RM.nvAx.setCustomLayout([{ sliceType: 0, position: [0, ta, 1, 1 - ta] }]);
  }
  mobileQ.addEventListener && mobileQ.addEventListener('change', rmLayout);
  // estrutura clicada acesa no 3D, como a seleção do modo Anatomia; a câmera do encarte não se mexe
  function rmSel(key) {
    if (!model) return;
    const lv = key && levelOf(key), ms = !key ? [] : lv ? model.meshes.filter(m => lvlAlias(m.userData.level) === lv && (KIND[m.userData.kind] || {}).L === 'bone') : model.reg.get(aliasKey(key)) || [];
    S.layers = { bone: true, disc: true }; ms.forEach(m => { S.layers[(KIND[m.userData.kind] || KIND.bone).L] = true; });
    S.sel = ms.length ? new Set(ms) : null; S.selKey = key || null; applyVisuals();
  }
  function rmPicked(d, nv) {
    const ex = rmEx(), { st } = RM_STEPS[S.rmStep];
    if (rmRsna(ex)) {
      // o outro quadro vai ao ponto clicado: o syncWith da NiiVue só propaga com o canvas em foco
      const o = nv === RM.nv ? RM.nvAx : RM.nv; if (o && o.volumes.length) rmAim(o, d.mm);
      // fora do teste, só o clique perto de um ponto marcado abre a caixa, com a frase de ensino
      const id = rmLm(ex, nv, d); RM.pick = st.test ? { nome: id ? rmLmName(id) : 'Fora do ponto marcado', lm: id } : id && { nome: rmLmName(id), lm: id, dica: rmLmDica(id) }; rmSel(null);
      if (st.test) RM.res = id || '';
    } else {
      const v = d.values && d.values[1] ? Math.round(d.values[1].value) : 0;
      RM.pick = rmName(v); rmSel(RM.pick && RM.pick.key);
      // test.sag: só o sagital responde (o axial montado mostra o disco do corte da linha); clique no axial apaga a resposta
      if (st.test) RM.res = st.test.sag && d.axCorSag === 0 ? null : v;
    }
    rmPanel(true);
  }
  // graduação do SPIDER de um disco do exame, para a resposta do teste
  // base: trilha Exame normal, que ainda não ensinou o Pfirrmann (vem na trilha Discopatia degenerativa)
  function rmGrade(ex, v, base) {
    const r = v > 200 && ex.g[v - 201]; if (!r) return '';
    const t = []; if (r[RM_G.modic]) t.push('Modic ' + r[RM_G.modic]);
    [['list', 'listese'], ['hern', 'hérnia'], ['narrow', 'estreitamento'], ['bulge', 'abaulamento']].forEach(([k, n]) => { if (r[RM_G[k]]) t.push(n); });
    if (r[RM_G.up] || r[RM_G.low]) t.push('alteração das placas ou nódulo de Schmorl');
    return ' Graduação do SPIDER neste disco: ' + (base ? 'disco normal' + (t.length ? ', com ' + t.join(', ') : '') : ['Pfirrmann ' + r[RM_G.pf]].concat(t).join(', ')) + '.';
  }
  function rmPanel(announce) {
    const box = $('#rmpick'), res = $('#rmres'), p = RM.pick, { st, t } = RM_STEPS[S.rmStep], ex = rmEx(), rs = rmRsna(ex); if (!box) return;
    box.hidden = !p;
    const lit = has3D && p && p.key; // só os rótulos do SPIDER têm estrutura no 3D
    if (p) {
      box.innerHTML = `<p>Você clicou: <strong>${esc(p.nome)}</strong>.${p.dica ? ' ' + esc(p.dica) : ''}${lit ? (p.f ? ' Ela aparece acesa no 3D.' : ' Ele aparece aceso no 3D.') : ''}</p>${lit ? '<button class="btn link" id="rmopen" type="button">Abrir no 3D grande</button>' : ''}`;
      if (lit) $('#rmopen').onclick = rmOpen3D;
    }
    let msg = p ? 'Você clicou: ' + p.nome + '.' + (p.dica ? ' ' + p.dica : '') : '';
    if (res) {
      res.hidden = RM.res === null;
      if (RM.res !== null) {
        const ok = st.test.ok.includes(RM.res), fora = !p || (rs && !p.lm);
        res.className = 'rmres ' + (ok ? 'ok' : 'no');
        res.textContent = ok ? 'Certo. ' + p.nome + '.' + (rs ? ' Graduação da RSNA neste ponto: ' + (ex.gr[RM.res] || 'normal ou leve') + '.' : rmGrade(ex, RM.res, t.id === 'base'))
          : (fora ? (rs ? 'Não. O clique ficou fora dos pontos marcados pelo radiologista. ' : 'Não. Esse ponto fica fora das estruturas marcadas. ') : 'Não. ' + p.nome + ' não é a resposta. ') + st.test.hint;
        msg = res.textContent;
      }
    }
    if (announce && msg) say(msg);
    // caixa abaixo da dobra do painel: rola até ela no clique
    if (announce) { const el = p ? box : res && !res.hidden && res; if (el) el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); }
  }
  // Abrir no 3D grande: modo Anatomia com a mesma estrutura selecionada e a câmera nela
  function rmOpen3D() {
    const p = RM.pick; setMode('anat'); if (!p || !has3D) return;
    focusKey(p.key, p.nome);
    if (!levelOf(p.key)) { const ms = model.reg.get(aliasKey(p.key)) || []; ms.forEach(m => { S.layers[(KIND[m.userData.kind] || KIND.bone).L] = true; }); applyVisuals(); syncTools(); if (ms.length) frameMeshes(ms); }
    if (mobileQ.matches) view.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }
  // nome sob o cursor (ou sob o dedo) com Nomes ligado; só no SPIDER, que tem máscara
  function rmTagAt(e) {
    const nv = RM.nv;
    if (!RM.names || !nv || nv.volumes.length < 2) { rmTag.hidden = true; return; }
    const r = rmCv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, k = nv.uiData.dpr || 1, f = nv.canvasPos2frac([x * k, y * k]);
    // valor da máscara como a NiiVue lê em onLocationChange (mm -> voxel da própria máscara); frac2vox falha no segundo volume
    const m = nv.volumes[1], h = f[0] >= 0 && m.mm2vox(nv.frac2mm(f)), s = h && rmName(Math.round(m.getValue(h[0], h[1], h[2])));
    rmTag.hidden = !s; if (!s) return;
    rmTag.textContent = s.nome;
    rmTag.style.transform = `translate(${Math.max(4, Math.min(x + 14, r.width - rmTag.offsetWidth - 4)).toFixed(0)}px,${Math.max(4, y - 30).toFixed(0)}px)`;
  }
  rmCv.addEventListener('pointermove', rmTagAt); rmCv.addEventListener('pointerdown', rmTagAt);
  rmCv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') rmTag.hidden = true; });
  function rmBarRender() {
    const ex = rmEx(), chip = (k, t, on) => `<button class="chip" type="button" data-rm="${k}" aria-pressed="${on}">${t}</button>`;
    // RSNA: sem máscara, então sem Contornos e Nomes
    rmBar.innerHTML = `<div class="group" role="group" aria-label="Sequência">${RM_SEQ.filter(([k]) => ex.seqs[k]).map(([k, t]) => chip(k, t, RM.seq === k)).join('')}</div>`
      + (rmRsna(ex) ? '' : `<div class="group" role="group" aria-label="Sobre a imagem">${chip('mask', 'Contornos', RM.mask)}${chip('names', 'Nomes', RM.names)}</div>`)
      + `<div class="seg rmpane" role="group" aria-label="Plano">${[['sag', 'Sagital'], ['ax', 'Axial']].map(([k, t]) => `<button type="button" data-pane="${k}" aria-pressed="${RM.pane === k}">${t}</button>`).join('')}</div>`;
    rmBar.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => {
      const k = b.dataset.rm;
      if (k === 'mask') { RM.mask = !RM.mask; if (RM.nv && RM.nv.volumes[1]) RM.nv.setOpacity(1, RM.mask ? 0.4 : 0); }
      else if (k === 'names') { RM.names = !RM.names; if (!RM.names) rmTag.hidden = true; }
      else { RM.seq = k; rmShow(); }
      rmBarRender(); rmBar.querySelector(`[data-rm="${k}"]`).focus();
    });
    rmBar.querySelectorAll('[data-pane]').forEach(b => b.onclick = () => { RM.pane = b.dataset.pane; rmLayout(); rmBarRender(); rmBar.querySelector(`[data-pane="${RM.pane}"]`).focus(); });
  }
  // contexto do tira-dúvidas neste modo: trilha, título e texto do passo e o que foi clicado
  function rmCtx() {
    const { t, st } = RM_STEPS[S.rmStep];
    return `Ressonância, trilha ${t.name}. Passo: ${st.t}. ${st.p.map(x => x.replace(/^- /, '').replace(/\*\*/g, '')).join(' ')}` + (RM.pick ? ` Estrutura clicada na imagem: ${RM.pick.nome}.` : '');
  }
  // parágrafos do passo (docs/estilo-ressonancia.md): '- ' vira item, itens seguidos numa lista só, **x** negrito; escapa antes da marcação
  function rmHtml(ps) {
    let h = '', ul = false;
    for (const x of ps) {
      const li = x.startsWith('- '), t = esc(li ? x.slice(2) : x).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      if (li !== ul) { h += li ? '<ul class="rml">' : '</ul>'; ul = li; }
      h += li ? `<li>${t}</li>` : `<p>${t}</p>`;
    }
    return h + (ul ? '</ul>' : '');
  }
  // link de volta: ['dz', id da doença] ou ['anat', título do passo de Anatomia]
  const rmVer = ([m, k]) => m === 'dz' ? { txt: 'Rever em Doenças: ' + DZ.find(d => d.id === k).name, go: () => openDz(k, true) }
    : { txt: 'Rever em Anatomia: ' + k, go: () => goStep(ALL_STEPS.findIndex(s => s.title === k), true) };
  function renderRm(moveFocus) {
    const R = RM_STEPS[S.rmStep], { t, i, st, ex } = R, ver = st.ver || t.ver;
    if (!store.rmSeen.includes(R.id)) store.rmSeen.push(R.id);
    store.rmStep = R.id; save(); progress(); renderChapters(); rmBarRender();
    let h = `<div class="eyebrow">${esc(t.name)}, passo ${i + 1} de ${t.steps.length}</div><h2>${esc(st.t)}</h2>` + rmHtml(st.p);
    if (ver) h += `<button class="btn link rmver" id="rmver" type="button">${esc(rmVer(ver).txt)}</button>`;
    if (st.test) h += `<div class="rmres" id="rmres" hidden></div>`;
    h += `<div class="rmpick" id="rmpick" hidden></div>`;
    if (has3D) h += `<button class="btn rm3d" id="rm3d" type="button">Ver no 3D</button>`;
    h += `<p class="rmcred">${esc(RM_CRED[rmRsna(ex) ? 'rsna' : 'spider'])}</p>`;
    scrollEl.innerHTML = h; scrollEl.scrollTop = 0;
    // celular: o 3D em tela cheia, com a lombar inteira na tela em pé (mais longe que no encarte) e a estrutura clicada acesa
    if (ver) $('#rmver').onclick = rmVer(ver).go;
    if (has3D) $('#rm3d').onclick = () => { setFull(true); flyTo(Object.assign({}, RM_CFG.cam, { d: 80 }), 0); };
    rmPanel();
    const last = S.rmStep === RM_STEPS.length - 1;
    setNav(`<button class="btn" id="prev" ${S.rmStep === 0 ? 'disabled' : ''}>Anterior</button><button class="btn primary" id="next" ${last ? 'disabled' : ''}>Próximo</button>`);
    $('#prev').onclick = () => goRm(S.rmStep - 1);
    $('#next').onclick = () => goRm(S.rmStep + 1);
    if (moveFocus) focusTitle();
    say(`${t.name}. ${st.t}.`);
  }
  // passo novo: série e mira do passo; exame novo apaga o que foi clicado
  // Contornos começam desligados, para ver o brilho real; st.contornos os liga nos passos de dar nome ou contar
  function rmStep() {
    const { st, ex } = RM_STEPS[S.rmStep]; RM.mask = !!st.contornos; if (RM.nv && RM.nv.volumes[1]) RM.nv.setOpacity(1, RM.mask ? 0.4 : 0);
    RM.seq = st.seq || 't2'; RM.goto = { ex: st.ex, mm: ex.at[st.at] }; RM.res = null; rmLayout(); rmShow();
  }
  function goRm(k, moveFocus) {
    if (k < 0 || k >= RM_STEPS.length) return;
    RM.pick = null; rmSel(null); // passo novo abre com a caixa Você clicou vazia
    S.rmStep = k;
    if (S.mode !== 'rm') return setMode('rm', moveFocus);
    rmStep(); renderRm(moveFocus);
  }
  // abre doença ou procedimento (ids não se repetem entre DZ e PROC)
  function openDz(id, moveFocus) {
    const m = PROC.some(x => x.id === id) ? 'proc' : 'dz', d = (m === 'proc' ? PROC : DZ).find(x => x.id === id), seen = m === 'proc' ? store.procSeen : store.dzSeen;
    S.dz = id; S.dzOn = true; S.hv = { zone: 'pl', morph: 'ext' };
    if (S.mode !== m) { S.mode = m; syncMode(); }
    if (!seen.includes(id)) { seen.push(id); save(); }
    rebuild(d.mods); applyConfig(d); renderDz(moveFocus);
    say(d.name + '.');
  }
  function syncMode() {
    ['anat', 'dz', 'proc', 'rm'].forEach(k => $('#m-' + k).setAttribute('aria-pressed', S.mode === k));
    // ressonância: o visualizador ocupa o lugar do 3D, que vira encarte (CSS de .stage.rm)
    const rm = S.mode === 'rm'; $('.stage').classList.toggle('rm', rm); rmView.hidden = !rm; if (!rm) rmTag.hidden = true;
  }
  function setMode(m, moveFocus) {
    S.mode = m; syncMode(); S.dz = null; rebuild({});
    if (m === 'anat') renderStep(moveFocus);
    else if (m === 'rm') { applyConfig(RM_CFG); rmSel(RM.pick && RM.pick.key); rmStep(); renderRm(moveFocus); }
    else { applyConfig({ cam: { t: 'center', az: 30, el: 8, d: 120 }, show: 'bone disc' }); renderDz(moveFocus); }
  }
  $('#m-anat').onclick = () => S.mode !== 'anat' && setMode('anat');
  $('#m-dz').onclick = () => S.mode !== 'dz' && setMode('dz');
  $('#m-proc').onclick = () => S.mode !== 'proc' && setMode('proc');
  $('#m-rm').onclick = () => S.mode !== 'rm' && setMode('rm');
  function rerender() { if (S.mode === 'anat') renderStep(); else if (S.mode === 'rm') renderRm(); else renderDz(); }
  function progress() {
    const a = store.seen.length, d = store.dzSeen.length, r = store.rmSeen.length, tot = ALL_STEPS.length + DZ.length + RM_STEPS.length;
    $('#progtxt').textContent = `Visto: anatomia ${a} de ${ALL_STEPS.length}, doenças ${d} de ${DZ.length}, ressonância ${r} de ${RM_STEPS.length}`;
    $('#progbar').style.transform = `scaleX(${((a + d + r) / tot).toFixed(3)})`;
  }
  let closeAsk = () => false;
  // tira-dúvidas: aparece com a sessão; o servidor confere o token e o limite diário (functions/api/pergunta.js)
  {
    const ask = $('#ask'), out = $('#askout'), inp = $('#askq'), btn = ask.querySelector('[type=submit]'), mic = $('#askmic'), fab = $('#askfab'), win = $('#askwin');
    const line = (t, cls) => { const p = document.createElement('p'); if (cls) p.className = cls; p.textContent = t; out.appendChild(p); out.scrollTop = out.scrollHeight; return p; };
    const bearer = async () => { const { data } = await SB.auth.getSession(); return 'Bearer ' + (data.session ? data.session.access_token : ''); }; // getSession renova o token se precisar
    let rec = null; const parar = () => rec && rec.state === 'recording' && rec.stop(); // fechar a janela também solta o microfone
    const show = on => { if (!on) parar(); win.hidden = !on; fab.hidden = on; fab.setAttribute('aria-expanded', on); (on ? inp : fab).focus(); };
    closeAsk = () => !win.hidden && (show(false), true);
    if (SB) SB.auth.onAuthStateChange((ev, s) => { if (s && win.hidden) fab.hidden = false; });
    fab.onclick = () => show(true); $('#askx').onclick = () => show(false);
    // a janela é ancorada embaixo à direita, então a alça fica no canto de cima à esquerda: puxar para cima e para a esquerda aumenta
    const grip = $('#askgrip'), size = (w, h) => {
      const r = win.getBoundingClientRect();
      win.style.width = Math.max(300, Math.min(w, innerWidth - 32)) + 'px'; win.style.height = Math.max(260, Math.min(h, innerHeight - 120)) + 'px'; win.style.maxHeight = 'none';
      if (win.style.left) place(r.right - win.offsetWidth, r.bottom - win.offsetHeight); // já movida: mantém o canto de baixo à direita no lugar
    };
    // arrastar pelo cabeçalho troca a âncora de baixo/direita para esquerda/topo, sempre dentro da tela
    const place = (x, y) => Object.assign(win.style, { left: Math.max(0, Math.min(x, innerWidth - win.offsetWidth)) + 'px', top: Math.max(0, Math.min(y, innerHeight - win.offsetHeight)) + 'px', right: 'auto', bottom: 'auto' });
    const hd = win.querySelector('.askhd');
    hd.onpointerdown = e => { if (mobileQ.matches || e.target.closest('button')) return; e.preventDefault(); hd.setPointerCapture(e.pointerId); const r = win.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top; hd.onpointermove = m => place(m.clientX - dx, m.clientY - dy); hd.onpointerup = () => hd.onpointermove = null; };
    grip.onpointerdown = e => { e.preventDefault(); grip.setPointerCapture(e.pointerId); const x = e.clientX, y = e.clientY, w = win.offsetWidth, h = win.offsetHeight; grip.onpointermove = m => size(w + x - m.clientX, h + y - m.clientY); grip.onpointerup = () => grip.onpointermove = null; };
    grip.onkeydown = e => { const d = { ArrowLeft: [24, 0], ArrowRight: [-24, 0], ArrowUp: [0, 24], ArrowDown: [0, -24] }[e.key]; if (d) { e.preventDefault(); size(win.offsetWidth + d[0], win.offsetHeight + d[1]); } };
    ask.onsubmit = async e => {
      e.preventDefault(); const pergunta = inp.value.trim(); if (!pergunta || btn.disabled) return;
      btn.disabled = true; inp.value = ''; line(pergunta, 'q'); const ans = line('Pensando…');
      try {
        const r = await fetch('/api/pergunta', { method: 'POST', headers: { 'content-type': 'application/json', authorization: await bearer() }, body: JSON.stringify({ pergunta, contexto: S.mode === 'rm' ? rmCtx() : scrollEl.innerText }) });
        const d = await r.json().catch(() => ({ erro: 'Resposta inválida (' + r.status + ').' }));
        // só **negrito** e tópicos com "- " viram formatação; o resto passa escapado
        ans.innerHTML = esc(d.texto || d.erro || 'Sem resposta.').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^- /gm, '• ');
        if (typeof d.restantes === 'number') inp.placeholder = `Sua dúvida (${d.restantes === 1 ? 'resta 1' : 'restam ' + d.restantes} hoje)`;
      } catch (err) { ans.textContent = 'Sem conexão com o servidor.'; }
      out.scrollTop = out.scrollHeight; btn.disabled = false;
    };
    // voz (functions/api/transcrever.js): grava até 60 s e põe o texto no campo, sem enviar, para a pessoa revisar antes.
    // Captura o PCM direto do microfone (Web Audio); o caminho MediaRecorder + decodeAudioData chegava mudo ao servidor no Chrome do Mac
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      mic.hidden = false;
      mic.onclick = async () => {
        if (rec) return parar();
        let stream;
        mic.disabled = true; // enquanto o navegador pede a permissão, um segundo toque abriria outro microfone
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (err) {
          return line({ NotAllowedError: 'Permissão do microfone negada. Libere o microfone nas configurações do navegador.', NotFoundError: 'Nenhum microfone encontrado neste aparelho.' }[err.name] || 'Não foi possível usar o microfone.');
        } finally { mic.disabled = false; }
        // taxa nativa do aparelho: fixar 16 kHz aqui quebra no Firefox (fonte e contexto com taxas diferentes); a reamostragem fica em wav()
        const ctx = new AC(), fonte = ctx.createMediaStreamSource(stream), proc = ctx.createScriptProcessor(4096, 1, 1), partes = [];
        proc.onaudioprocess = e => partes.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        fonte.connect(proc); proc.connect(ctx.destination); // sem ligar ao destino o Chrome não chama onaudioprocess; a saída fica muda
        await ctx.resume(); // criado depois do await da permissão, o contexto pode nascer suspenso
        const t0 = Date.now(), dica = inp.placeholder;
        const relogio = () => { const s = Math.floor((Date.now() - t0) / 1000); inp.placeholder = `Gravando… ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (s >= 60) parar(); };
        let tique;
        rec = {
          state: 'recording', stop: async () => {
            rec = null; clearInterval(tique); proc.disconnect(); fonte.disconnect(); stream.getTracks().forEach(t => t.stop());
            const taxa = ctx.sampleRate; ctx.close();
            // silêncio exato já no navegador: o microfone escolhido está desligado (ex.: o do MacBook com a tampa fechada); nem chama o servidor
            let pico = 0; for (const p of partes) for (let i = 0; i < p.length; i++) pico = Math.max(pico, Math.abs(p[i]));
            if (pico < 0.002) {
              const f = stream.getAudioTracks()[0] || {};
              mic.setAttribute('aria-pressed', 'false'); inp.placeholder = dica; inp.focus();
              return line(`O microfone ${f.label ? '"' + f.label + '" ' : ''}não captou som. Escolha outro no cadeado ao lado do endereço do site ou nas configurações de microfone do navegador.`);
            }
            mic.setAttribute('aria-pressed', 'false'); mic.disabled = true; inp.placeholder = 'Transcrevendo…';
            try {
              const r = await fetch('/api/transcrever', { method: 'POST', headers: { 'content-type': 'audio/wav', authorization: await bearer() }, body: wav(partes, taxa) });
              const d = await r.json().catch(() => ({ erro: 'Resposta inválida (' + r.status + ').' }));
              if (d.texto) inp.value = (inp.value.trim() + ' ' + d.texto).trim(); else line(d.erro || 'Não entendi o áudio. Tente de novo.');
            } catch (err) { line(err instanceof TypeError ? 'Sem conexão com o servidor.' : 'Não consegui ler o áudio gravado. Tente de novo.'); }
            inp.placeholder = dica; mic.disabled = false; inp.focus();
          }
        };
        mic.setAttribute('aria-pressed', 'true'); relogio(); tique = setInterval(relogio, 250);
      };
    }
    // WAV 16 kHz mono 16 bits, o formato dos exemplos do Workers AI; reamostra por interpolação linear da taxa do aparelho
    function wav(partes, taxa) {
      const tot = partes.reduce((n, p) => n + p.length, 0), x = new Float32Array(tot); let k = 0;
      for (const p of partes) { x.set(p, k); k += p.length; }
      const n = Math.floor(tot * 16000 / taxa), v = new DataView(new ArrayBuffer(44 + n * 2));
      let o = 0; const str = t => { for (const c of t) v.setUint8(o++, c.charCodeAt(0)); }, u32 = y => { v.setUint32(o, y, true); o += 4; }, u16 = y => { v.setUint16(o, y, true); o += 2; };
      str('RIFF'); u32(36 + n * 2); str('WAVEfmt '); u32(16); u16(1); u16(1); u32(16000); u32(32000); u16(2); u16(16); str('data'); u32(n * 2);
      for (let i = 0; i < n; i++) {
        const t = i * taxa / 16000, j = Math.floor(t), f = t - j, y = (x[j] || 0) * (1 - f) + (x[j + 1] || 0) * f;
        v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, y)) * 0x7fff, true);
      }
      return new Blob([v], { type: 'audio/wav' });
    }
  }
  $('#progreset').onclick = () => {
    if (!confirm('Limpar o progresso? As marcas de visto e concluído somem; o resultado do teste final continua.')) return;
    LISTAS.forEach(k => { store[k] = []; }); store.em = {}; store.zeradoEm = Date.now(); save(); push(0); // a conta fica sabendo já; zeradoEm impede que outro aparelho traga as marcas de volta
    rerender(); // renderDz e renderRm já chamam progress() e renderChapters()
  };

  /* ---------- progresso na conta (sem sessão ou sem rede, tudo segue no localStorage; nome e Sair ficam em src/auth.js) ---------- */
  // hora de cada marca de visto (store.em) e do último "limpar progresso" (store.zeradoEm), para a soma entre aparelhos;
  // marcas de antes desta versão ficam com hora 0
  function marca() {
    const t = store.em ? Date.now() : 0; store.em = store.em || {};
    LISTAS.forEach(k => store[k].forEach(v => { if (!((k + ':' + v) in store.em)) store.em[k + ':' + v] = t; }));
  }
  // teste: fica o resultado com mais acertos; empate, o com mais respostas; empate, o deste aparelho
  const quizVal = (id, a) => { const qs = (id === 'dz' ? DZ_QUIZ : QUIZ[id.slice(1)]) || []; return Object.entries(a).filter(([i, o]) => qs[i] && qs[i][2] === o).length * 100 + Object.keys(a).length; };
  // marcas unidas, menos as anteriores ao último "limpar progresso" do outro lado
  function merge(r) {
    const el = store.em || {}, er = r.em || {}, zl = store.zeradoEm || 0, zr = r.zeradoEm || 0, em = {};
    LISTAS.forEach(k => {
      const loc = store[k].filter(v => (el[k + ':' + v] || 0) >= zr), rem = (Array.isArray(r[k]) ? r[k] : []).filter(v => (er[k + ':' + v] || 0) >= zl);
      store[k] = [...new Set([...loc, ...rem])].filter(v => vale(k, v));
      store[k].forEach(v => { const c = k + ':' + v; em[c] = Math.max(el[c] || 0, er[c] || 0); });
    });
    store.em = em; store.zeradoEm = Math.max(zl, zr);
    Object.entries(r.quiz || {}).forEach(([id, a]) => { if (a && typeof a === 'object' && quizVal(id, a) > quizVal(id, store.quiz[id] || {})) store.quiz[id] = a; });
  }
  let lendo = false;
  async function sync(id) {
    if (lendo) return push(); // uma leitura por vez
    lendo = true;
    try {
      const { data, error } = await SB.from('progresso').select('dados').maybeSingle();
      if (error) return; // sem rede ou erro: tenta de novo na próxima gravação ou renovação do token
      const visto = () => JSON.stringify([store.seen, store.dzSeen, store.procSeen, store.rmSeen, store.quiz]), antes = visto();
      // outra pessoa entrou neste navegador: o progresso local era da anterior e não soma nesta conta
      if (store.conta && store.conta !== id) { LISTAS.forEach(k => { store[k] = []; }); store.quiz = {}; store.em = {}; store.zeradoEm = 0; }
      if (data && data.dados) merge(data.dados);
      store.conta = contaId = id; keep();
      await SB.from('progresso').upsert({ user_id: id, dados: store, atualizado: new Date().toISOString() });
      if (visto() !== antes) rerender();
    } catch (e) { } finally { lendo = false; }
  }
  // fora do callback: o supabase-js pede para não chamar o cliente dentro dele
  if (SB) SB.auth.onAuthStateChange((ev, s) => { if (s && !contaId) setTimeout(() => sync(s.user.id)); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (closeAsk()) return; if (view.classList.contains('full')) setFull(false); else if (!infoEl.hidden) closeCard(); return; }
    const t = e.target, free = t === document.body || t === canvas || (t.closest && t.closest('.nav'));
    if (!free || S.mode !== 'anat') return;
    if (e.key === 'ArrowRight') goStep(S.step + 1);
    if (e.key === 'ArrowLeft') goStep(S.step - 1);
  });

  /* ---------- divisória entre o 3D e o texto (o ResizeObserver do laço ajusta o 3D) ---------- */
  const stage = $('.stage'), split = $('#split'), PW = 430;
  let pw = PW;
  function setPw(w) {
    const max = Math.max(320, stage.clientWidth - 360 - rail.offsetWidth);
    pw = Math.round(Math.min(max, Math.max(320, w)));
    stage.style.setProperty('--pw', pw + 'px');
    split.setAttribute('aria-valuenow', pw); split.setAttribute('aria-valuemax', max);
  }
  const keepPw = () => { store.pw = pw; save(); };
  split.onpointerdown = e => {
    if (e.button !== 0) return;
    e.preventDefault(); split.setPointerCapture(e.pointerId);
    split.classList.add('drag'); document.body.classList.add('resizing');
    split.onpointermove = ev => setPw(stage.getBoundingClientRect().right - ev.clientX);
    split.onpointerup = split.onpointercancel = () => {
      split.onpointermove = split.onpointerup = split.onpointercancel = null;
      split.classList.remove('drag'); document.body.classList.remove('resizing'); keepPw();
    };
  };
  split.ondblclick = () => { setPw(PW); keepPw(); };
  split.onkeydown = e => {
    const d = { ArrowLeft: 40, ArrowRight: -40 }[e.key];
    if (d) { e.preventDefault(); setPw(pw + d); keepPw(); }
  };
  railX.onclick = () => { store.railOff = !store.railOff; save(); setRail(!store.railOff); setPw(store.pw || PW); };
  addEventListener('resize', () => setPw(store.pw || PW));
  setPw(store.pw || PW);

  /* ---------- laço ---------- */
  if (has3D) {
    function resize() { const w = view.clientWidth, h = view.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); LBL.forEach(L => L.bw = 0); invalidate(); }
    new ResizeObserver(resize).observe(view);
    const stBack = new THREE.MeshBasicMaterial({ side: THREE.BackSide, colorWrite: false, depthWrite: false, depthTest: false, stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.IncrementWrapStencilOp, stencilZFail: THREE.IncrementWrapStencilOp, stencilFail: THREE.IncrementWrapStencilOp });
    const stFront = stBack.clone(); stFront.side = THREE.FrontSide; stFront.stencilZPass = stFront.stencilZFail = stFront.stencilFail = THREE.DecrementWrapStencilOp;
    const capScene = new THREE.Scene(), capMesh = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000)); capScene.add(capMesh);
    function renderCaps() {
      const groups = [...capGroups.values()].filter(g => g.used).sort((a, b) => a.rank - b.rank || a.pri - b.pri); if (!groups.length) return;
      const planes = renderer.clippingPlanes, ac = renderer.autoClear; renderer.autoClear = false;
      capMesh.position.copy(plane.coplanarPoint(new V3())); capMesh.lookAt(capMesh.position.clone().add(plane.normal)); capMesh.updateMatrixWorld();
      groups.forEach(g => {
        renderer.clearStencil(); renderer.clippingPlanes = planes; camera.layers.set(g.layer);
        scene.overrideMaterial = stBack; renderer.render(scene, camera);
        scene.overrideMaterial = stFront; renderer.render(scene, camera);
        scene.overrideMaterial = null; camera.layers.set(0); renderer.clippingPlanes = [];
        capMesh.material = g.mat; renderer.render(capScene, camera);
      });
      renderer.clippingPlanes = planes; renderer.autoClear = ac; camera.layers.set(0);
    }
    let visibleView = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { visibleView = es[0].isIntersecting; invalidate(); }).observe(view);
    // qualquer interação pode mudar rótulos, camadas ou o limite do painel de ferramentas
    ['pointerdown', 'pointerup', 'click', 'keydown', 'wheel'].forEach(ev => addEventListener(ev, invalidate, { capture: true, passive: true }));
    const frame = t => {
      requestAnimationFrame(frame);
      if (!visibleView && !tween) return;
      if (tween) { stepTween(t); dirty = 2; }
      if (controls.update()) dirty = 2;
      if (!dirty && !(pulse && !reduce)) return;
      const k = reduce ? .4 : .3 + .2 * Math.sin(t / 280);
      hotMats.forEach(m => m.emissiveIntensity = k);
      renderer.render(scene, camera);
      if (renderer.clippingPlanes.length) renderCaps();
      if (dirty) { updateLabels(); dirty--; }
    };
    rebuild({});
    resize();
    const first = ALL_STEPS[S.step].cam || STEPS[0].cam;
    const T = resolveTarget(first.t); controls.target.copy(T); placeCam(T, { r: first.d, az: first.az * deg, el: first.el * deg });
    requestAnimationFrame(frame);
    $('#loading').hidden = true;
  }
  if (store.tools) setTools(true);
  if (location.hash === '#doencas') setMode('dz'); else renderStep();
  window.__spine = { S, RM, RM_STEPS, goRm, get model() { return model; }, get plane() { return plane; }, get renderer() { return renderer; }, KIND, slabOut, goStep, openDz, setMode, camera, controls, setFull };
})();
