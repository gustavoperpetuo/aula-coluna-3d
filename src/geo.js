/* ============ Geometria procedural da coluna (unidades: cm) ============
   Eixos: y para cima, +z anterior, +x esquerda do paciente. */
const V3 = THREE.Vector3;
const deg = Math.PI / 180;
const v = (x, y, z) => new V3(x, y, z);

/* ---------- utilidades de malha ---------- */
function centroid(pts) { const c = new V3(); pts.forEach(p => c.add(p)); return c.multiplyScalar(1 / pts.length); }

function loft(rings, capS = true, capE = true, insetS = 0, insetE = 0, strip = false) {
  const R = rings.length, N = rings[0].length;
  const pos = [], idx = [];
  rings.forEach(r => r.forEach(p => pos.push(p.x, p.y, p.z)));
  let rm = Math.min(Math.floor(R / 2), R - 2);
  const a = rings[rm][0], b = rings[rm][1], c = rings[rm + 1][0];
  const n = new V3().subVectors(b, a).cross(new V3().subVectors(c, a));
  const out = new V3().subVectors(a, centroid(rings[rm]));
  const flip = n.dot(out) < 0;
  for (let r = 0; r < R - 1; r++) for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, A = r * N + i, B = r * N + j, C = (r + 1) * N + i, D = (r + 1) * N + j;
    if (!flip) idx.push(A, B, C, B, D, C); else idx.push(A, C, B, B, C, D);
  }
  const cap = (ri, nb, inset) => {
    const ring = rings[ri], cc = centroid(ring), cn = centroid(rings[nb]);
    const dir = new V3().subVectors(cc, cn); const len = dir.length() || 1; dir.divideScalar(len);
    const center = cc.clone().addScaledVector(dir, -inset);
    const base = pos.length / 3;
    ring.forEach(p => pos.push(p.x, p.y, p.z));
    const ci = pos.length / 3; pos.push(center.x, center.y, center.z);
    const t0 = new V3().subVectors(ring[0], center).cross(new V3().subVectors(ring[1], center));
    // faixa curva: o centro cai fora dela e o leque se sobrepõe (listras no corte), então a tampa liga borda de dentro e de fora, no sentido das paredes
    const f = strip ? (ri === 0) !== flip : t0.dot(dir) < 0;
    if (strip) for (let i = 0; i < N / 2 - 1; i++) { const a = base + i, b = base + i + 1, c = base + N - 2 - i, d = base + N - 1 - i; if (!f) idx.push(a, b, d, b, c, d); else idx.push(a, d, b, b, d, c); }
    else for (let i = 0; i < N; i++) { const j = (i + 1) % N; if (!f) idx.push(ci, base + i, base + j); else idx.push(ci, base + j, base + i); }
  };
  if (capS) cap(0, 1, insetS);
  if (capE) cap(R - 1, R - 2, insetE);
  // o teste pelo centroide do anel erra em faixas curvas (LLA): malha fechada com volume negativo tem as normais para dentro
  if (capS && capE) {
    let vol = 0;
    for (let t = 0; t < idx.length; t += 3) { const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]].map(k => new V3(pos[3 * k], pos[3 * k + 1], pos[3 * k + 2])); vol += a.dot(b.cross(c)); }
    if (vol < 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/* junta malhas mantendo o índice: mesmos triângulos e normais, cerca de um terço dos vértices */
function mergeGeoms(list) {
  const arr = list.filter(Boolean); arr.forEach(g => { if (!g.attributes.normal) g.computeVertexNormals(); });
  let tot = 0, ti = 0; arr.forEach(g => { tot += g.attributes.position.count; ti += g.index ? g.index.count : g.attributes.position.count; });
  const P = new Float32Array(tot * 3), Nn = new Float32Array(tot * 3), I = new (tot > 65535 ? Uint32Array : Uint16Array)(ti); let o = 0, oi = 0;
  arr.forEach(g => {
    const n = g.attributes.position.count;
    P.set(g.attributes.position.array, o * 3); Nn.set(g.attributes.normal.array, o * 3);
    if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) I[oi++] = a[i] + o; }
    else for (let i = 0; i < n; i++) I[oi++] = o + i;
    o += n;
  });
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(P, 3)); m.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); m.setIndex(new THREE.BufferAttribute(I, 1));
  return m;
}

/* bastão (cápsula) entre a e b; f achata a seção na direção 'side' */
function rod(a, b, r, o = {}) {
  const r2 = o.r2 ?? r, f = o.f ?? 1, seg = o.seg ?? 14;
  const dir = new V3().subVectors(b, a); const len = dir.length(); dir.normalize();
  let side = o.side ? o.side.clone() : new V3().crossVectors(dir, v(0, 1, 0));
  if (side.lengthSq() < 1e-6) side = v(1, 0, 0);
  side.addScaledVector(dir, -side.dot(dir)).normalize();
  const third = new V3().crossVectors(side, dir).normalize();
  const M = new THREE.Matrix4().makeBasis(side, dir, third);
  const S = new THREE.Matrix4().makeScale(f, 1, 1);
  const parts = [], caps = o.caps !== false;
  // sem pontas, o cilindro se fecha sozinho; a tampa do corte precisa de peça fechada
  const cyl = new THREE.CylinderGeometry(r2, r, len, seg, 1, caps);
  cyl.applyMatrix4(S); cyl.applyMatrix4(M);
  cyl.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); parts.push(cyl);
  if (caps) {
    /* pontas: calota tangente ao cone, começando exatamente na boca do cilindro (mesmos vértices).
       Esfera inteira no extremo saía para fora do cone que afina e virava fenda; tampa do cilindro por dentro dela vazava pelas facetas. */
    const be = Math.atan2(r - r2, len), hs = Math.max(3, Math.ceil(seg / 4));
    [[a, r, -1], [b, r2, 1]].forEach(([p, rr, e]) => {
      const R = rr / Math.cos(be), c = p.clone().addScaledVector(dir, -rr * Math.tan(be));
      const s = e > 0 ? new THREE.SphereGeometry(R, seg, hs, Math.PI / 2, Math.PI * 2, 0, Math.PI / 2 - be)
        : new THREE.SphereGeometry(R, seg, hs, Math.PI / 2, Math.PI * 2, Math.PI / 2 - be, Math.PI / 2 + be);
      s.applyMatrix4(S); s.applyMatrix4(M); s.translate(c.x, c.y, c.z); parts.push(s);
    });
  }
  return mergeGeoms(parts);
}

function ellip(c, rx, ry, rz, seg = 16, q) {
  const g = new THREE.SphereGeometry(1, seg, Math.max(8, seg * 0.6 | 0));
  g.scale(rx, ry, rz); if (q) g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q)); g.translate(c.x, c.y, c.z); return g;
}

/* placa grossa a partir de 4 cantos (quadrilátero) */
function quadSlab(p1, p2, p3, p4, th) {
  const n = new V3().subVectors(p3, p1).cross(new V3().subVectors(p4, p2)).normalize().multiplyScalar(th / 2);
  const P = [p1, p2, p3, p4].map(p => p.clone().add(n)), Q = [p1, p2, p3, p4].map(p => p.clone().sub(n));
  return loft([P, Q], true, true);
}

/* tubo ao longo de pontos, com raio variável e transporte paralelo */
function tube(points, rFn, o = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const n = o.n ?? Math.max(12, Math.round(curve.getLength() * (o.density ?? 2.2)));
  const N = o.N ?? 10;
  const pts = curve.getSpacedPoints(n);
  const T = pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)]; return new V3().subVectors(b, a).normalize(); });
  let nrm = o.up ? o.up.clone() : v(0, 1, 0);
  if (Math.abs(nrm.dot(T[0])) > 0.95) nrm = v(1, 0, 0);
  nrm.addScaledVector(T[0], -nrm.dot(T[0])).normalize();
  const rings = [];
  for (let i = 0; i <= n; i++) {
    if (i > 0) { const q = new THREE.Quaternion().setFromUnitVectors(T[i - 1], T[i]); nrm.applyQuaternion(q); nrm.addScaledVector(T[i], -nrm.dot(T[i])).normalize(); }
    let ax = nrm;
    if (o.upFn) { const u = o.upFn(i / n).clone(); u.addScaledVector(T[i], -u.dot(T[i])); if (u.lengthSq() > 1e-6) ax = u.normalize(); }
    const az = new V3().crossVectors(T[i], ax).normalize();
    const r = rFn(i / n); const rz = o.flat ? r * o.flat : r;
    const ring = [];
    for (let k = 0; k < N; k++) { const th = 2 * Math.PI * k / N; ring.push(pts[i].clone().addScaledVector(ax, Math.cos(th) * r).addScaledVector(az, Math.sin(th) * rz)); }
    rings.push(ring);
  }
  return loft(rings, o.caps !== false, o.caps !== false);
}

/* ---------- dados anatômicos (médias aproximadas de adulto, cm) ---------- */
function makeLevels() {
  const L = [];
  const C = [['C1', 1.0, 2.0, 1.0, 2.8, 1.9], ['C2', 1.6, 1.7, 1.5, 2.3, 1.6], ['C3', 1.4, 1.7, 1.5, 2.4, 1.5], ['C4', 1.4, 1.8, 1.55, 2.45, 1.45],
  ['C5', 1.4, 1.9, 1.6, 2.5, 1.45], ['C6', 1.45, 2.1, 1.65, 2.5, 1.45], ['C7', 1.5, 2.3, 1.7, 2.4, 1.45]];
  C.forEach(([n, h, W, D, cw, ca]) => L.push({ n, r: 'C', h, W, D, cw, ca }));
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    L.push({ n: 'T' + (i + 1), r: 'T', h: 1.65 + 0.75 * t, W: 2.6 + 1.4 * t * t * 0.6 + 0.55 * t, D: 1.75 + 1.25 * t, cw: 1.62 + 0.42 * Math.abs(t - 0.45) * 1.8 * (t > 0.45 ? 0.8 : 0.5), ca: 1.5 + 0.12 * t });
  }
  [['L1', 2.5, 4.2, 3.0, 2.2, 1.8], ['L2', 2.6, 4.4, 3.2, 2.3, 1.8], ['L3', 2.7, 4.6, 3.3, 2.4, 1.75], ['L4', 2.7, 4.8, 3.4, 2.5, 1.7], ['L5', 2.6, 5.0, 3.4, 2.7, 1.7]]
    .forEach(([n, h, W, D, cw, ca]) => L.push({ n, r: 'L', h, W, D, cw, ca }));
  L.forEach((o, i) => {
    o.i = i;
    if (o.r === 'C') { o.pw = 0.5; o.ph = 0.6; o.pl = 0.5; }
    else if (o.r === 'T') { const k = +o.n.slice(1); o.pw = k >= 4 && k <= 7 ? 0.45 : 0.5 + 0.05 * Math.abs(k - 5.5); o.ph = 0.9 + 0.05 * k; o.pl = 0.8; }
    else { const k = +o.n.slice(1); o.pw = 0.8 + 0.17 * (k - 1); o.ph = 1.45; o.pl = 1.0; }
    o.px = o.cw / 2 + o.pw / 2;
  });
  return L;
}
const LEVELS = makeLevels();
const LV = Object.fromEntries(LEVELS.map(l => [l.n, l]));

/* disco abaixo de cada vértebra móvel (nome 'C2-C3'), espessura e ângulo sagital base (graus, + = cifose) */
const DISCS = {};
(function () {
  const t = { C: 0.5 };
  for (let i = 1; i < 24; i++) {
    const up = LEVELS[i], lo = LEVELS[i + 1];
    const name = up.n + '-' + (lo ? lo.n : 'S1');
    let th, ang;
    if (up.r === 'C') { th = up.n === 'C7' ? 0.45 : 0.5; ang = { C2: -5, C3: -6, C4: -6, C5: -5, C6: -4, C7: 0 }[up.n]; }
    else if (up.r === 'T') { const k = +up.n.slice(1); th = k === 12 ? 0.8 : 0.4 + 0.03 * k; ang = [2.5, 3.5, 4.5, 5, 5, 5, 4.5, 4, 3, 2, 1, -1][k - 1]; }
    else { const k = +up.n.slice(1); th = [0.9, 1.0, 1.1, 1.2, 1.1][k - 1]; ang = [-4, -7, -10, -12, -15][k - 1]; }
    DISCS[name] = { name, up: up.n, lo: lo ? lo.n : 'S1', th, ang };
  }
})();
const BASE_WEDGE = { L5: -5, L4: -2 };
const SACRAL_SLOPE = 40;

/* contorno do corpo vertebral (seção axial) */
function bodyOutline(reg, W, D, N = 40) {
  const n = reg === 'C' ? 3.0 : reg === 'T' ? 2.25 : 2.6;
  const conc = reg === 'C' ? 0.05 : reg === 'T' ? 0.15 : 0.13;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const t = 2 * Math.PI * i / N, s = Math.sin(t), c = Math.cos(t);
    let x = W / 2 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    let z = D / 2 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    if (z < 0) z += conc * D * Math.exp(-Math.pow(x / (0.32 * W), 2)) * (-z / (D / 2));
    if (reg === 'T' && z > 0) x *= 1 - 0.16 * (z / (D / 2));
    pts.push([x, z]);
  }
  return pts;
}
function postMidZ(reg, D) { const conc = reg === 'C' ? 0.05 : reg === 'T' ? 0.15 : 0.13; return -D / 2 + conc * D; }

/* ---------- construção ---------- */
// folga dos ligamentos por amostra, entre montagens: cada doença altera poucos níveis, e o resto repete o cálculo
// shortcut: cresce com cada doença aberta (milhares de números no total), sem limite; limpar se passar a ter centenas de modelos
const LIG_CACHE = new Map();
function buildSpine(mods = {}) {
  const root = new THREE.Group();
  const reg = new Map(); const anchors = new Map(); const meshes = [];
  const add = (geo, kind, key, info, extra = {}) => {
    const m = new THREE.Mesh(geo, null);
    m.userData = Object.assign({ kind, key, info: info || kind, base: kind }, extra);
    if (!reg.has(key)) reg.set(key, []); reg.get(key).push(m);
    meshes.push(m); root.add(m); return m;
  };
  const md = (k, n, d) => (mods[k] && mods[k][n] !== undefined) ? mods[k][n] : d;
  const discMod = n => (mods.disc && mods.disc[n]) || {};

  /* ---- quadros (frames) de baixo para cima ---- */
  const F = {}; // name -> {p,q,h,D,W,...}
  const qS1 = new THREE.Quaternion().setFromEuler(new THREE.Euler(SACRAL_SLOPE * deg, 0, 0));
  let p = v(0, 0, 0), q = qS1.clone();
  const discKF = {};
  const relQ = (sag, cor, ax) => new THREE.Quaternion().setFromEuler(new THREE.Euler(sag * deg, ax * deg, cor * deg, 'YXZ'));
  const cor = mods.cor || {}, axr = mods.axial || {};
  const tiltAt = (o, n) => o[n] || 0;
  for (let k = 23; k >= 1; k--) {
    const U = LEVELS[k];
    const lowName = k === 23 ? 'S1' : LEVELS[k + 1].n;
    const dn = U.n + '-' + lowName;
    const DD = DISCS[dn], dm = discMod(dn);
    const th = DD.th * (dm.h ?? 1);
    const sag = DD.ang + ((mods.sag && mods.sag[dn]) || 0);
    const corRel = tiltAt(cor, U.n) - tiltAt(cor, lowName);
    const axRel = tiltAt(axr, U.n) - tiltAt(axr, lowName);
    const R = relQ(sag, corRel, axRel);
    const half = new THREE.Quaternion().slerp(R, 0.5);
    const qd = q.clone().multiply(half);
    const upd = v(0, 1, 0).applyQuaternion(qd);
    const qU = q.clone().multiply(R);
    const crush = md('crush', U.n, 1), h = U.h * crush;
    const slip = md('slip', U.n, 0);
    const bottomU = p.clone().addScaledVector(upd, th).add(v(0, 0, slip).applyQuaternion(q));
    const center = bottomU.clone().addScaledVector(v(0, 1, 0).applyQuaternion(qU), h / 2);
    const w = (BASE_WEDGE[U.n] || 0) + md('wedge', U.n, 0);
    const Dw = U.D * md('widen', U.n, 1);
    F[U.n] = { p: center, q: qU, h, w, Dw, lv: U, thBelow: th };
    discKF[dn] = { p: p.clone().add(bottomU).multiplyScalar(0.5), q: qd, th, dn };
    p = center.clone().add(v(0, h / 2 - (Dw / 2) * Math.tan(w * deg), 0).applyQuaternion(qU));
    q = qU.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), w * deg));
    F[U.n].qTop = q.clone(); F[U.n].pTop = p.clone();
  }
  LEVELS.forEach((l, i) => { if (i >= 1 && i <= 23) { const below = i === 23 ? 'L5-S1' : l.n + '-' + LEVELS[i + 1].n; F[l.n].thBelow = discKF[below].th; const above = i >= 2 ? LEVELS[i - 1].n + '-' + l.n : null; F[l.n].thAbove = above ? discKF[above].th : 0.6; } });
  // C1 e occipital
  {
    const C2 = F.C2; const dens = mods.dens;
    const off = v(0, C2.h / 2 + 0.78, 0.15 + (dens ? -0.3 : 0));
    const pC1 = C2.p.clone().add(off.applyQuaternion(C2.q));
    const qC1 = C2.q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), (dens ? 4 : -3) * deg));
    F.C1 = { p: pC1, q: qC1, h: 1.0, w: 0, Dw: 1.0, lv: LV.C1, thBelow: 0, thAbove: 0 };
    const pO = pC1.clone().add(v(0, 1.2, 0).applyQuaternion(qC1));
    const qO = qC1.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -6 * deg));
    F.Occ = { p: pO, q: qO };
  }
  // sacro e cóccix (para baixo)
  const SL = [2.7, 2.3, 2.0, 1.6, 1.3], SR = [-10, -14, -16, -18, -16];
  const SB = []; // fronteiras: {p,q}
  {
    let pp = v(0, 0, 0), qq = qS1.clone(); SB.push({ p: pp.clone(), q: qq.clone() });
    for (let j = 0; j < 5; j++) {
      const up = v(0, 1, 0).applyQuaternion(qq);
      const c = pp.clone().addScaledVector(up, -SL[j] / 2);
      F['S' + (j + 1)] = { p: c, q: qq.clone(), h: SL[j] };
      pp = pp.clone().addScaledVector(up, -SL[j]);
      const qn = qq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), SR[j] * deg));
      SB.push({ p: pp.clone(), q: qq.clone().slerp(qn, 0.5) });
      qq = qn;
    }
    const CL = [0.95, 0.8, 0.65, 0.55];
    for (let j = 0; j < 4; j++) {
      const up = v(0, 1, 0).applyQuaternion(qq);
      pp = pp.clone().addScaledVector(up, -0.15);
      const c = pp.clone().addScaledVector(up, -CL[j] / 2);
      F['Co' + (j + 1)] = { p: c, q: qq.clone(), h: CL[j] };
      pp = pp.clone().addScaledVector(up, -CL[j]);
      qq = qq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -10 * deg));
    }
  }
  const Msh = (fr) => new THREE.Matrix4().compose(fr.p, fr.q, v(1, 1, 1));
  const toW = (fr, x, y, z) => v(x, y, z).applyMatrix4(Msh(fr));

  /* ---- keyframes contínuos ao longo da coluna ---- */
  const SD = [ // sacrais: W corpo, D corpo, cw, ca
    [4.9, 3.3, 2.6, 1.2], [3.8, 2.7, 2.0, 1.0], [3.0, 2.1, 1.6, 0.8], [2.3, 1.7, 1.2, 0.6], [1.7, 1.3, 0.9, 0.45]];
  const KF = []; const KI = {};
  const pushKF = (name, o) => { KI[name] = KF.length; KF.push(Object.assign({ name }, o)); };
  pushKF('Occ', { p: F.Occ.p, q: F.Occ.q, W: 2.0, D: 1.0, cw: 3.0, ca: 2.0, zc: -1.45, reg: 'C', ant: 0.5, post: -0.5, type: 'v' });
  pushKF('C1', { p: F.C1.p, q: F.C1.q, W: 2.0, D: 1.0, cw: 2.8, ca: 1.9, zc: -1.45, reg: 'C', ant: 0.6, post: -0.5, type: 'v' });
  for (let i = 1; i < 24; i++) {
    const l = LEVELS[i], fr = F[l.n];
    const Wv = l.W * md('widen', l.n, 1), Dv = fr.Dw;
    pushKF(l.n, { p: fr.p, q: fr.q, W: Wv, D: Dv, cw: l.cw * md('widen', l.n, 1), ca: l.ca, zc: -Dv / 2 - l.ca / 2, reg: l.r, ant: 0.93 * Dv / 2, post: postMidZ(l.r, Dv), type: 'v' });
    const lo = i === 23 ? null : LEVELS[i + 1];
    const dn = l.n + '-' + (lo ? lo.n : 'S1'); const dk = discKF[dn];
    // vértebra de baixo com o alargamento da doença (fratura em explosão), igual à de cima
    const W2 = lo ? lo.W * md('widen', lo.n, 1) : 4.9, D2 = lo ? F[lo.n].Dw : 3.3, cw2 = lo ? lo.cw * md('widen', lo.n, 1) : 2.6, ca2 = lo ? lo.ca : 1.3;
    const aw = (Wv + W2) / 2, ad = (Dv + D2) / 2;
    pushKF(dn, { p: dk.p, q: dk.q, W: aw, D: ad, cw: (l.cw * md('widen', l.n, 1) + cw2) / 2, ca: (l.ca + ca2) / 2, zc: -ad / 2 - (l.ca + ca2) / 4, reg: l.r, ant: 1.05 * ad / 2, post: -0.47 * ad, type: 'd' });
  }
  for (let j = 0; j < 5; j++) { const [W, D, cw, ca] = SD[j]; const fr = F['S' + (j + 1)]; pushKF('S' + (j + 1), { p: fr.p, q: fr.q, W, D, cw, ca, zc: -D / 2 - ca / 2, reg: 'S', ant: D / 2, post: -D / 2, type: 's' }); }
  for (let j = 1; j <= 4; j++) { const fr = F['Co' + j]; pushKF('Co' + j, { p: fr.p, q: fr.q, W: 1, D: 1, cw: 0.3, ca: 0.2, zc: -0.6, reg: 'S', ant: 0.5, post: -0.5, type: 'c' }); }
  const kcurve = new THREE.CatmullRomCurve3(KF.map(k => k.p), false, 'catmullrom', 0.5);
  const NK = KF.length;
  const spineAt = (u) => {
    u = Math.max(0, Math.min(NK - 1, u));
    const i = Math.min(NK - 2, Math.floor(u)), f = u - i, A = KF[i], B = KF[i + 1];
    const L = (a, b) => a + (b - a) * f;
    return { p: kcurve.getPoint(u / (NK - 1)), q: A.q.clone().slerp(B.q, f), W: L(A.W, B.W), D: L(A.D, B.D), cw: L(A.cw, B.cw), ca: L(A.ca, B.ca), zc: L(A.zc, B.zc), ant: L(A.ant, B.ant), post: L(A.post, B.post), reg: f < 0.5 ? A.reg : B.reg, A, B, f, i };
  };
  const SP = (u, x, y, z) => { const s = typeof u === 'string' ? spineAt(KI[u]) : spineAt(u); return s.p.clone().add(v(x, y, z).applyQuaternion(s.q)); };
  const SPf = (u, fn) => { const s = typeof u === 'string' ? spineAt(KI[u]) : spineAt(u); const [x, y, z] = fn(s); return s.p.clone().add(v(x, y, z).applyQuaternion(s.q)); };

  /* ---- vértebras ---- */
  const VP = {}; // pontos locais úteis por vértebra
  const rings = {}; // anéis de placa terminal em coordenadas de mundo
  for (let i = 0; i < 24; i++) {
    const l = LEVELS[i], fr = F[l.n];
    const g = new THREE.Group(); g.position.copy(fr.p); g.quaternion.copy(fr.q); root.add(g);
    const part = (geo, kind, key, info) => { const m = add(geo, kind, key, info, { level: l.n, region: l.r }); g.add(m); return m; };
    const S = [1, -1]; const sd = s => s > 0 ? 'L' : 'R';
    const h = fr.h, widen = md('widen', l.n, 1), W = l.W * widen, D = fr.Dw, w = fr.w;
    const dA = fr.thAbove ?? 0.6, dB = fr.thBelow ?? 0.6;
    const P = VP[l.n] = { h, W, D };
    if (l.n === 'C1') { buildC1(part, l, P, S, sd); continue; }
    // corpo
    const N = 40, ol = bodyOutline(l.r, W, D, N);
    const lev = [[-h / 2, 0.955], [-h / 2 + 0.06, 1.0], [-h / 2 + Math.min(0.2, h * 0.1), 0.985], [-h / 4, 0.93], [0, 0.905], [h / 4, 0.93], [h / 2 - Math.min(0.2, h * 0.1), 0.985], [h / 2 - 0.06, 1.0], [h / 2, 0.955]];
    const rr = lev.map(([y, s]) => ol.map(([x, z]) => { const xx = x * s, zz = z * s; const wy = -(zz + D / 2) * Math.tan(w * deg) * ((y + h / 2) / h); return v(xx, y + wy, zz); }));
    part(loft(rr, true, true, 0.08, 0.08), 'bone', l.n + '.body', 'body');
    const M = Msh(fr);
    rings[l.n] = { bot: rr[0].map(p => p.clone().applyMatrix4(M)), top: rr[rr.length - 1].map(p => p.clone().applyMatrix4(M)) };
    anchors.set(l.n + '.endplate', toW(fr, 0, h / 2 - (D / 2) * Math.tan(w * deg), 0.15));
    anchors.set(l.n + '.canal', toW(fr, 0, 0, -D / 2 - l.ca / 2));
    anchors.set(l.n, fr.p.clone());
    if (l.r === 'C') buildCervical(part, l, P, S, sd, h, W, D, dA, dB, fr, toW);
    else if (l.r === 'T') buildThoracic(part, l, P, S, sd, h, W, D, dA, dB);
    else buildLumbar(part, l, P, S, sd, h, W, D, dA, dB);
    // âncoras de forame (abaixo da vértebra, exceto cervical que é acima)
    S.forEach(s => {
      if (P.sap) anchors.set(`facet.${l.n}.${sd(s)}`, toW(fr, P.sap[sd(s)].top.x, P.sap[sd(s)].top.y - 0.2, P.sap[sd(s)].top.z));
    });
  }

  function buildC1(part, l, P, S, sd) {
    // anel do atlas em torno do eixo do dente (z=0)
    const ring = [];
    const nn = 48; const cz = -0.9, ax = 1.55, az = 1.85;
    for (let k = 0; k <= nn; k++) { const t = 2 * Math.PI * k / nn; ring.push(v(ax * Math.sin(t), 0.02 * Math.cos(t), cz + az * Math.cos(t))); }
    const arcPts = (t0, t1, m) => { const a = []; for (let k = 0; k <= m; k++) { const t = t0 + (t1 - t0) * k / m; a.push(v(ax * Math.sin(t), 0, cz + az * Math.cos(t))); } return a; };
    part(tube(arcPts(-0.95, 0.95, 16), t => 0.3 + 0.12 * Math.pow(Math.abs(t - 0.5) * 2, 2), { flat: 1.35, upFn: () => v(0, 1, 0), caps: true }), 'bone', 'C1.ant', 'c1ant');
    part(tube(arcPts(Math.PI - 1.05, Math.PI + 1.05, 18), t => 0.27 + 0.1 * Math.pow(Math.abs(t - 0.5) * 2, 2), { flat: 1.5, upFn: () => v(0, 1, 0) }), 'bone', 'C1.post', 'c1post');
    part(ellip(v(0, 0, cz + az + 0.22), 0.32, 0.38, 0.25), 'bone', 'C1.at', 'c1ant');
    part(ellip(v(0, -0.05, cz - az - 0.2), 0.3, 0.32, 0.28), 'bone', 'C1.post', 'c1post');
    S.forEach(s => {
      part(ellip(v(s * 1.42, 0.02, -0.45), 0.62, 0.72, 0.9), 'bone', 'C1.lm.' + sd(s), 'c1lm');
      part(rod(v(s * 1.75, 0.08, -0.5), v(s * 3.55, 0.12, -0.55), 0.32, { r2: 0.38, f: 0.7 }), 'bone', 'C1.tp.' + sd(s), 'tp');
      const tor = new THREE.TorusGeometry(0.34, 0.15, 8, 20); tor.rotateX(Math.PI / 2); tor.translate(s * 2.55, 0.12, -0.5);
      part(tor, 'bone', 'C1.tf.' + sd(s), 'tforamen');
      anchors.set('C1.tf.' + sd(s), toW(F.C1, s * 2.55, 0.12, -0.5));
    });
    P.post = v(0, -0.05, cz - az - 0.45); P.tfx = 2.55; P.tfz = -0.5;
    anchors.set('C1', F.C1.p.clone());
    anchors.set('C1.canal', toW(F.C1, 0, 0, -1.45));
  }

  function buildCervical(part, l, P, S, sd, h, W, D, dA, dB, fr) {
    const isC2 = l.n === 'C2', isC7 = l.n === 'C7';
    const lmx = l.cw / 2 + 0.42, lmz = -D / 2 - 0.62;
    P.sap = {}; P.iap = {};
    S.forEach(s => {
      const side = sd(s);
      // pedículo (convergente)
      part(rod(v(s * W * 0.36, 0.05, -D / 2 + 0.3), v(s * (lmx - 0.15), 0.0, lmz + 0.25), 0.27, { f: 1.2 }), 'bone', `${l.n}.ped.${side}`, 'pedicle');
      // massa lateral inclinada (facetas ~45°)
      const top = v(s * lmx, h / 2 + dA * 0.55, lmz + 0.22), bot = v(s * lmx, -h / 2 - dB * 0.5, lmz - 0.3);
      if (isC2) top.set(s * (lmx - 0.1), h / 2 - 0.1, lmz + 0.3);
      part(rod(bot, top, 0.48, { f: 1.05, side: v(1, 0, 0) }), 'bone', `${l.n}.lm.${side}`, 'latmass');
      P.sap[side] = { top }; P.iap[side] = { bot };
      // lâmina
      part(rod(v(s * (lmx - 0.1), -0.05, lmz - 0.35), v(s * 0.05, -0.28 * h, -D / 2 - l.ca - 0.25), 0.5, { f: 0.42 }), 'bone', `${l.n}.lam.${side}`, 'lamina');
      // processo transverso com forame transverso
      const fx = W / 2 + 0.6 + (isC2 ? 0.0 : 0.05), fz = -D / 2 + 0.2;
      const tor = new THREE.TorusGeometry(0.3, 0.13, 8, 18); tor.rotateX(Math.PI / 2); tor.translate(s * fx, -0.02, fz);
      part(tor, 'bone', `${l.n}.tf.${side}`, 'tforamen');
      anchors.set(`${l.n}.tf.${side}`, toW(fr, s * fx, -0.02, fz));
      if (!isC2) {
        part(rod(v(s * (W / 2 - 0.1), 0.0, 0.05), v(s * (fx + 0.55), -0.12, fz + 0.32), 0.16, { r2: 0.24 }), 'bone', `${l.n}.tp.${side}`, 'tp');
        part(rod(v(s * (lmx + 0.2), -0.05, lmz + 0.1), v(s * (fx + 0.55), -0.12, fz - 0.42), 0.16, { r2: 0.22 }), 'bone', `${l.n}.tp.${side}`, 'tp');
        part(rod(v(s * (fx + 0.5), -0.12, fz + 0.34), v(s * (fx + 0.5), -0.12, fz - 0.45), 0.13, { r2: 0.13 }), 'bone', `${l.n}.tp.${side}`, 'tp');
        // unciforme
        part(rod(v(s * (W / 2 - 0.22), h / 2 - 0.08, -0.12), v(s * (W / 2 - 0.12), h / 2 + 0.25, -0.18), 0.17, { r2: 0.1 }), 'bone', `${l.n}.unc.${side}`, 'uncinate');
      } else {
        part(rod(v(s * (W / 2 - 0.05), -0.1, -0.1), v(s * (fx + 0.35), -0.2, fz - 0.1), 0.2, { r2: 0.22 }), 'bone', `${l.n}.tp.${side}`, 'tp');
        // facetas superiores largas de C2
        part(ellip(v(s * 0.95, h / 2 - 0.05, -0.35), 0.55, 0.2, 0.62), 'bone', `${l.n}.sap.${side}`, 'sap');
      }
      P.tfx = fx; P.tfz = fz;
    });
    // espinhoso
    const root_ = v(0, -0.28 * h, -D / 2 - l.ca - 0.35);
    let tip;
    if (isC7) tip = v(0, -0.28 * h - 0.9, root_.z - 2.4);
    else if (isC2) tip = v(0, -0.28 * h - 0.25, root_.z - 1.8);
    else tip = v(0, -0.28 * h - 0.55, root_.z - 1.25);
    const sr = isC7 ? 0.35 : isC2 ? 0.48 : 0.28;
    const sg = [rod(root_, tip, sr, { r2: sr * 0.8, f: 0.6 })];
    if (!isC7) [1, -1].forEach(s => sg.push(ellip(tip.clone().add(v(s * 0.28, -0.05, -0.05)), 0.24, 0.26, 0.26)));
    else sg.push(ellip(tip.clone().add(v(0, -0.05, -0.1)), 0.45, 0.4, 0.38));
    part(mergeGeoms(sg), 'bone', `${l.n}.sp`, 'spinous');
    P.spRoot = root_; P.spTip = tip; P.spR = sr;
    P.lam = { y: -0.28 * h, z: -D / 2 - l.ca - 0.25, r: 0.5 };
    if (isC2) {
      const dbase = v(0, h / 2 - 0.15, 0.15), dtip = v(0, h / 2 + 1.45, 0.15);
      if (mods.dens) {
        // fratura tipo II: dente separado e desviado para trás
        const q = new THREE.Quaternion().setFromAxisAngle(v(1, 0, 0), -9 * deg);
        const b2 = v(0, h / 2 + 0.12, -0.12), t2 = b2.clone().add(v(0, 1.35, 0).applyQuaternion(q));
        part(rod(b2, t2, 0.49, { r2: 0.38 }), 'bone', 'C2.dens', 'dens');
        part(rod(v(0, h / 2 - 0.25, 0.15), v(0, h / 2 - 0.05, 0.15), 0.48, { r2: 0.47 }), 'bone', 'C2.body', 'body');
        part(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 20).translate(0, h / 2 + 0.03, 0.05), 'lesion', 'crack.C2', 'fxline');
        anchors.set('C2.dens', toW(fr, 0, h / 2 + 0.8, 0.0));
      } else {
        part(rod(dbase, dtip, 0.5, { r2: 0.38 }), 'bone', 'C2.dens', 'dens');
        anchors.set('C2.dens', toW(fr, 0, h / 2 + 0.8, 0.15));
      }
    }
  }

  function buildThoracic(part, l, P, S, sd, h, W, D, dA, dB) {
    const k = +l.n.slice(1);
    const py = 0.12 * h, zP = -D / 2 - l.pl;
    P.sap = {}; P.iap = {}; P.tpTip = {};
    S.forEach(s => {
      const side = sd(s), px = l.px;
      part(rod(v(s * px, py, -D / 2 + 0.3), v(s * px, py, zP), l.pw / 2 + 0.05, { f: (l.pw / 2 + 0.05) / (l.ph / 2), side: v(1, 0, 0) }), 'bone', `${l.n}.ped.${side}`, 'pedicle');
      // lâmina
      const lamA = v(s * (px - 0.05), -0.1 * h, zP - 0.25), lamB = v(s * 0.06, -0.32 * h, -D / 2 - l.ca - 0.3);
      part(rod(lamA, lamB, 0.72, { f: 0.42 }), 'bone', `${l.n}.lam.${side}`, 'lamina');
      // processo transverso (posterolateral e para cima)
      const tl = k <= 10 ? 2.25 - 0.06 * k : 1.3;
      const tpA = v(s * (px + 0.05), py + 0.05, zP + 0.05), tpB = v(s * (px + tl), py + 0.35, zP - 0.9);
      part(rod(tpA, tpB, 0.36, { r2: 0.42, f: 0.85 }), 'bone', `${l.n}.tp.${side}`, 'tp');
      P.tpTip[side] = tpB;
      // facetas no plano coronal
      const sapB = v(s * (px - 0.05), py + 0.25 * h, zP - 0.15), sapT = v(s * (px - 0.05), h / 2 + dA * 0.85, zP - 0.2);
      part(rod(sapB, sapT, 0.4, { f: 0.5, side: v(0, 0, 1) }), 'bone', `${l.n}.sap.${side}`, 'sap');
      const iapT = v(s * (px - 0.1), -0.25 * h, zP - 0.62), iapB = v(s * (px - 0.1), -h / 2 - dB * 0.8, zP - 0.62);
      part(rod(iapT, iapB, 0.38, { f: 0.5, side: v(0, 0, 1) }), 'bone', `${l.n}.iap.${side}`, 'iap');
      P.sap[side] = { top: sapT }; P.iap[side] = { bot: iapB };
      P.tpA = tpA;
    });
    P.lam = { y: -0.32 * h, z: -D / 2 - l.ca - 0.3, r: 0.72 };
    // espinhoso longo e inclinado
    const ang = k <= 4 ? 40 : k <= 9 ? 62 : 30;
    const len = k <= 9 ? 3.0 : 2.5;
    const root_ = v(0, -0.32 * h - 0.1, -D / 2 - l.ca - 0.5);
    const tip = root_.clone().add(v(0, -Math.sin(ang * deg) * len, -Math.cos(ang * deg) * len));
    part(mergeGeoms([rod(root_, tip, 0.42, { r2: 0.28, f: 0.55 }), ellip(tip, 0.32, 0.36, 0.3)]), 'bone', `${l.n}.sp`, 'spinous');
    P.spRoot = root_; P.spTip = tip; P.spR = 0.4;
  }

  function buildLumbar(part, l, P, S, sd, h, W, D, dA, dB) {
    const k = +l.n.slice(1);
    const py = 0.12 * h, zP = -D / 2 - l.pl;
    P.sap = {}; P.iap = {}; P.tpTip = {};
    const fh = mods.facet || {};
    S.forEach(s => {
      const side = sd(s), px = l.px;
      part(rod(v(s * px, py, -D / 2 + 0.35), v(s * px, py, zP), l.pw / 2 + 0.08, { f: (l.pw / 2 + 0.08) / (l.ph / 2), side: v(1, 0, 0) }), 'bone', `${l.n}.ped.${side}`, 'pedicle');
      // lâmina alta (sobreposta como telha)
      const lamA = v(s * (px - 0.1), -0.12 * h - 0.2, zP - 0.35), lamB = v(s * 0.07, -0.26 * h - 0.3, -D / 2 - l.ca - 0.35);
      part(rod(lamA, lamB, 1.05, { f: 0.3 }), 'bone', `${l.n}.lam.${side}`, 'lamina');
      // processo transverso
      const tl = [1.8, 2.15, 2.45, 2.15, 1.75][k - 1];
      const tpA = v(s * (px + 0.05), py, zP + 0.3), tpB = v(s * (px + tl), py - 0.05, zP + 0.2 + (k === 5 ? 0.2 : 0));
      part(rod(tpA, tpB, k === 5 ? 0.52 : 0.4, { r2: k === 5 ? 0.38 : 0.28, f: 0.45 }), 'bone', `${l.n}.tp.${side}`, 'tp');
      P.tpTip[side] = tpB;
      // processos articulares (facetas quase sagitais)
      const up = l.n + '-' + (k === 5 ? 'S1' : 'L' + (k + 1)); const upAbove = (k === 1 ? 'T12' : 'L' + (k - 1)) + '-' + l.n;
      const fsA = fh[upAbove] || 1, fsB = fh[up] || 1;
      const sapB = v(s * (px + 0.3), py + 0.2 * h, zP - 0.1), sapT = v(s * (px + 0.4), h / 2 + dA * 0.9, zP - 0.25);
      part(rod(sapB, sapT, 0.55 * fsA, { f: 0.48, side: v(1, 0, 0.35) }), fsA > 1 ? 'boneHyp' : 'bone', `${l.n}.sap.${side}`, 'sap');
      part(ellip(v(s * (px + 0.55), py + 0.4 * h, zP - 0.65), 0.32, 0.35, 0.3), 'bone', `${l.n}.mam.${side}`, 'mamm');
      const iapT = v(s * (px - 0.15), -0.3 * h, zP - 0.7), iapB = v(s * (px - 0.05), -h / 2 - dB * 0.85, zP - 0.62);
      part(rod(iapT, iapB, 0.5 * fsB, { f: 0.48, side: v(1, 0, -0.35) }), fsB > 1 ? 'boneHyp' : 'bone', `${l.n}.iap.${side}`, 'iap');
      // pars interarticularis
      const parsA = v(s * (px + 0.05), -0.02 * h, zP - 0.2), parsB = v(s * (px - 0.1), -0.3 * h, zP - 0.65);
      if (mods.pars && mods.pars.includes(l.n)) {
        const mid = parsA.clone().lerp(parsB, 0.5);
        part(rod(parsA, parsA.clone().lerp(parsB, 0.36), 0.4), 'bone', `${l.n}.pars.${side}`, 'pars');
        part(rod(parsB.clone().lerp(parsA, 0.36), parsB, 0.4), 'bone', `${l.n}.pars.${side}`, 'pars');
        const cr = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 16);
        const qq = new THREE.Quaternion().setFromUnitVectors(v(0, 1, 0), new V3().subVectors(parsB, parsA).normalize());
        cr.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(qq)); cr.translate(mid.x, mid.y, mid.z);
        part(cr, 'lesion', `crack.${l.n}.${side}`, 'parsdefect');
      } else part(rod(parsA, parsB, 0.42), 'bone', `${l.n}.pars.${side}`, 'pars');
      P.sap[side] = { top: sapT }; P.iap[side] = { bot: iapB };
    });
    P.lam = { y: -0.26 * h - 0.3, z: -D / 2 - l.ca - 0.35, r: 1.05 };
    // espinhoso em machadinha
    const root_ = v(0, -0.26 * h - 0.4, -D / 2 - l.ca - 0.55);
    const tip = root_.clone().add(v(0, -0.35, -2.7 + (k === 5 ? 0.6 : 0)));
    part(mergeGeoms([rod(root_, tip, 0.95, { r2: 0.85, f: 0.33 }), ellip(tip, 0.38, 0.7, 0.35)]), 'bone', `${l.n}.sp`, 'spinous');
    P.spRoot = root_; P.spTip = tip; P.spR = 0.9;
  }

  /* ---- sacro ---- */
  {
    const Wt = [10.6, 10.0, 7.6, 5.6, 4.0, 2.6], T = [4.8, 4.6, 3.8, 3.0, 2.3, 1.6], za = [1.65, 1.45, 1.15, 0.95, 0.75, 0.6];
    const N = 44; const rr = [], LR = [];
    const frontZ = (j, x) => { const f = LR[j].filter(p => p[2] > 0).sort((a, b) => a[0] - b[0]); for (let i = 0; i < f.length - 1; i++) if (x >= f[i][0] && x <= f[i + 1][0]) { const t = (x - f[i][0]) / (f[i + 1][0] - f[i][0] || 1); return f[i][1] + (f[i + 1][1] - f[i][1]) * t; } return f[0][1]; };
    for (let j = 0; j < 6; j++) {
      const bw = SD[Math.min(j, 4)][0] / 2, ring = [], loc = [];
      for (let i = 0; i < N; i++) {
        const t = 2 * Math.PI * i / N, s = Math.sin(t), c = Math.cos(t);
        const x = Wt[j] / 2 * Math.sign(s) * Math.pow(Math.abs(s), 2 / 2.6);
        const zc = za[j] - T[j] / 2;
        let z = T[j] / 2 * Math.sign(c) * Math.pow(Math.abs(c), 2 / 2.3);
        const lat = Math.max(0, (Math.abs(x) - bw) / Math.max(0.1, Wt[j] / 2 - bw));
        if (c > 0) z *= 1 - 0.45 * lat; else z *= 1 - 0.25 * lat;
        let y = 0;
        if (j === 0) y = -0.8 * Math.min(1, Math.max(0, (Math.abs(x) - 2.3) / 1.2)) - 0.25;
        ring.push(toW(SB[j], x, y, zc + z)); loc.push([x, zc + z, c]);
      }
      rr.push(ring); LR.push(loc);
    }
    add(loft(rr, true, true), 'bone', 'sacrum', 'sacrum', { level: 'S', region: 'S' });
    // corpo de S1 (platô)
    const g = new THREE.Group(); g.position.copy(SB[0].p); g.quaternion.copy(SB[0].q); root.add(g);
    const ol = bodyOutline('L', 4.9, 3.3, 40);
    const lev = [[-1.3, 0.97], [-0.4, 0.99], [-0.06, 1.0], [0, 0.96]];
    const r2 = lev.map(([y, s]) => ol.map(([x, z]) => v(x * s, y, z * s)));
    const sb = add(loft(r2, true, true, 0, 0.08), 'bone', 'S1.body', 'body', { level: 'S', region: 'S' }); g.add(sb);
    const M0 = Msh(SB[0]);
    rings.S1 = { top: r2[r2.length - 1].map(p => p.clone().applyMatrix4(M0)) };
    anchors.set('promontory', toW(SB[0], 0, -0.1, 1.7));
    anchors.set('ala.L', toW(SB[0], 4.0, -0.9, 0.2));
    anchors.set('S1.endplate', toW(SB[0], 0, 0, 0.2));
    // processos articulares superiores de S1
    [1, -1].forEach(s => {
      const side = s > 0 ? 'L' : 'R';
      const fs = (mods.facet || {})['L5-S1'] || 1;
      const m = add(rod(v(s * 2.35, -0.4, -2.55), v(s * 2.5, 1.05, -2.75), 0.55 * fs, { f: 0.62, side: v(1, 0, 0.35) }), fs > 1 ? 'boneHyp' : 'bone', 'S1.sap.' + side, 'sap', { level: 'S', region: 'S' }); g.add(m);
    });
    VP.S1 = { sap: { L: { top: v(2.5, 1.05, -2.75) }, R: { top: v(-2.5, 1.05, -2.75) } }, lam: { y: -0.6, z: -3.0, r: 0.6 }, spRoot: v(0, -0.8, -3.1), spTip: v(0, -1.2, -3.6), spR: 0.4 };
    // forames sacrais anteriores e crista
    const SF = {}; const fx = [2.05, 1.8, 1.5, 1.2];
    const hole = [];
    for (let j = 1; j <= 4; j++) {
      [1, -1].forEach(s => {
        const side = s > 0 ? 'L' : 'R';
        const fzz = frontZ(j, s * fx[j - 1]);
        const c = toW(SB[j], s * fx[j - 1], 0, fzz - 0.13);
        hole.push(ellip(c, 0.42 - 0.05 * j, 0.36 - 0.04 * j, 0.16, 14, SB[j].q));
        SF[j + '.' + side] = c;
        anchors.set(`sf.${j}.${side}`, c);
      });
      const crest = toW(SB[j], 0, 0.6, za[j] - T[j] + 0.05);
      add(ellip(crest, 0.32, 0.6, 0.3, 12, SB[j].q), 'bone', 'sacrum', 'sacrum', { level: 'S', region: 'S' });
    }
    add(mergeGeoms(hole), 'hole', 'sacrum', 'sforamen', { level: 'S', region: 'S' });
    VP.SF = SF;
    anchors.set('hiatus', toW(SB[5], 0, 0.6, -0.6));
    anchors.set('sacrum', toW(SB[2], 0, 0, 0.2));
    // cóccix
    const CW = [2.2, 1.6, 1.2, 0.8];
    for (let j = 1; j <= 4; j++) add(ellip(F['Co' + j].p, CW[j - 1] / 2, F['Co' + j].h / 2, 0.5 - 0.06 * j, 14, F['Co' + j].q), 'bone', 'coccyx', 'coccyx', { level: 'Co', region: 'S' });
    anchors.set('coccyx', F.Co2.p.clone());
  }

  /* ---- occipital (contexto) ---- */
  {
    const fo = F.Occ; const N = 40; const rs = [];
    const spec = [[1.45, 1.7, 0, -1.2], [3.4, 3.4, 0.55, -1.6], [5.0, 4.9, 1.8, -2.3], [5.8, 5.6, 3.6, -3.0]];
    spec.forEach(([rx, rz, y, cz]) => { const r = []; for (let i = 0; i < N; i++) { const t = 2 * Math.PI * i / N; r.push(toW(fo, rx * Math.sin(t), y + (rz > 3 ? 0.9 * Math.cos(t) : 0) + (Math.cos(t) > 0 ? Math.cos(t) * y * 0.6 : 0), cz + rz * Math.cos(t))); } rs.push(r); });
    add(loft(rs, false, false), 'ctx', 'occ', 'occ', { level: 'Occ', region: 'C', shell: 1 }); // casca aberta: o forame magno é um furo
    [1, -1].forEach(s => add(ellip(toW(fo, s * 1.3, -0.3, -0.55), 0.48, 0.34, 0.85, 14, fo.q), 'ctx', 'occ.cond.' + (s > 0 ? 'L' : 'R'), 'occ', { level: 'Occ', region: 'C' }));
    anchors.set('occ', toW(fo, 0, 1.6, -3.4));
    anchors.set('EOP', toW(fo, 0, 3.0, -5.8));
  }

  /* ---- discos ---- */
  const discRings = (dn) => {
    const DD = DISCS[dn];
    const lower = DD.lo === 'S1' ? rings.S1.top : rings[DD.lo].top;
    const upper = rings[DD.up].bot;
    return { lower, upper };
  };
  Object.keys(DISCS).forEach(dn => {
    const DD = DISCS[dn], dm = discMod(dn), kf = KF[KI[dn]];
    const { lower, upper } = discRings(dn);
    const cA = centroid(lower), cB = centroid(upper);
    const bulge = 0.04 + (dm.bulge || 0);
    const R = [];
    const herni = dm.hern;
    for (let k = 0; k <= 4; k++) {
      const t = k / 4, c = cA.clone().lerp(cB, t), r = [];
      for (let i = 0; i < lower.length; i++) {
        const pnt = lower[i].clone().lerp(upper[i], t); const rad = new V3().subVectors(pnt, c);
        pnt.addScaledVector(rad, bulge * Math.sin(Math.PI * t) * (k === 0 || k === 4 ? 0 : 1));
        r.push(pnt);
      }
      R.push(r);
    }
    // tampas do disco 0,02 para dentro: coladas na placa terminal, as duas superfícies disputam o pixel e o corte pontilha
    const ax = new V3().subVectors(cB, cA).normalize();
    R[0] = R[0].map(pp => pp.clone().addScaledVector(ax, 0.02)); R[4] = R[4].map(pp => pp.clone().addScaledVector(ax, -0.02));
    const kind = dm.state === 'degen' ? 'discDeg' : dm.state === 'infect' ? 'discInf' : 'disc';
    add(loft(R, true, true), kind, 'disc.' + dn, 'annulus', { level: dn, region: LV[DD.up].r, cut: true });
    // lamelas internas (aparecem no corte)
    [0.8, 0.62].forEach((sc, li) => {
      const R2 = R.map((r, k) => { const c = centroid(r); return r.map(pp => c.clone().lerp(pp, sc)); });
      // encolhe verticalmente para não vazar das placas
      const R3 = [R2[0].map((p, i) => p.clone().lerp(R2[1][i], 0.25)), R2[1], R2[2], R2[3], R2[4].map((p, i) => p.clone().lerp(R2[3][i], 0.25))];
      add(loft(R3, true, true), li === 0 ? 'lamA' : 'lamB', 'disc.' + dn, 'annulus', { level: dn, region: LV[DD.up].r });
    });
    const qd = kf.q, th = kf.p.distanceTo(cA) * 2;
    const nucC = kf.p.clone().add(v(0, 0, -0.08 * kf.D).applyQuaternion(qd));
    const ns = dm.state === 'degen' ? 0.6 : 1;
    add(ellip(nucC, 0.27 * kf.W * ns, Math.max(0.12, 0.34 * DD.th * (dm.h ?? 1)), 0.25 * kf.D * ns, 18, qd), dm.state === 'degen' ? 'nucDeg' : 'nucleus', 'nuc.' + dn, 'nucleus', { level: dn, region: LV[DD.up].r });
    anchors.set('disc.' + dn, kf.p.clone().add(v(0, 0, kf.D * 0.45).applyQuaternion(qd)));
    anchors.set('nuc.' + dn, nucC);
    anchors.set('ax.' + dn, kf.p.clone().add(v(0, 0, -kf.D * 0.62).applyQuaternion(qd)));
    // hérnia
    if (herni) {
      const s = herni.side || 0, sz = herni.size || 1;
      const c = kf.p.clone().add(v(s * 0.3 * kf.cw, 0, kf.post - 0.32 * sz).applyQuaternion(qd));
      add(ellip(c, (s ? 0.5 : 0.95) * sz, 0.42 + 0.15 * sz, 0.4 * sz, 18, qd), 'herniation', 'hernia', 'hernia', { level: dn });
      add(rod(nucC, c, 0.2 * sz, { r2: 0.28 * sz }), 'nucleus', 'hernia.tract', 'hernia', { level: dn });
      anchors.set('hernia', c);
    }
    // osteófitos
    const os = (mods.osteo || {})[dn];
    if (os) {
      const spikes = [];
      [[lower, cA, 1], [upper, cB, -1]].forEach(([ring, c, dir]) => {
        const ax = new V3().subVectors(cB, cA).normalize().multiplyScalar(dir);
        ring.forEach((pp, i) => {
          if (i % 3) return;
          const rad = new V3().subVectors(pp, c); const ang = Math.atan2(rad.clone().applyQuaternion(qd.clone().invert()).x, rad.clone().applyQuaternion(qd.clone().invert()).z);
          const post = Math.abs(ang) > 2.2;
          if (post && !os.post) return;
          const L = (0.18 + 0.14 * ((i * 7) % 5) / 5) * (os.size || 1);
          const tip = pp.clone().addScaledVector(rad.normalize(), L).addScaledVector(ax, L * 0.7);
          spikes.push(rod(pp.clone().addScaledVector(ax, -0.1), tip, 0.16 * (os.size || 1), { r2: 0.03, seg: 8 }));
        });
      });
      add(mergeGeoms(spikes), 'osteo', 'osteo.' + dn, 'osteophyte', { level: dn });
    }
  });

  /* ---- ligamentos ---- */
  // LLA e LLP em segmentos por vértebra
  const bandRing = (s, which, hw, th, gap) => {
    const pts = [], K = 7;
    if (which === 'ant') {
      const a = Math.asin(Math.min(0.98, hw / (s.W / 2)));
      for (let k = 0; k <= K; k++) { const ph = -a + 2 * a * k / K; pts.push([s.W / 2 * Math.sin(ph) * 1.02, (s.ant + gap) * Math.cos(ph)]); }
      const outer = pts.map(([x, z]) => [x * (1 + th / s.W), z + th]).reverse();
      return pts.concat(outer);
    } else {
      for (let k = 0; k <= K; k++) { const x = -hw + 2 * hw * k / K; pts.push([x, s.post - gap - 0.02 * Math.pow(x / hw, 2)]); }
      const outer = pts.map(([x, z]) => [x, z - th]).reverse();
      return pts.concat(outer);
    }
  };
  // corpos e discos que o LLA e o LLP cobrem: a faixa nunca pode ficar dentro deles (listese, cunha, abaulamento)
  const ligRay = new THREE.Raycaster(), rayMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  // o canal sacral não é oco no modelo (o sacro é um bloco): o LLP corre dentro dele por construção, então só o LLA testa o sacro
  const ligTargets = (u0, u1, which) => meshes.filter(m => {
    const k = m.userData.key;
    if (!(which === 'ant' ? /^((C|T|L|S)\d+\.body|sacrum|disc\.)/ : /^((C|T|L|S)\d+\.body|disc\.)/).test(k) || !['bone', 'disc', 'discDeg', 'discInf'].includes(m.userData.kind)) return false;
    const n = k === 'sacrum' ? 'S1' : k.startsWith('disc.') ? k.slice(5) : k.split('.')[0];
    m.userData.ku = KI[n]; return KI[n] !== undefined && KI[n] >= u0 - 1.5 && KI[n] <= u1 + 1.5;
  });
  // quanto a faixa precisa sair para ficar fora do osso contínuo a partir do centro: raios só nas bordas e no meio
  // (os 8 pontos custavam ~0,35 s por montagem); o anel inteiro sai pelo maior valor, o que nunca empurra de menos nesses três
  const bandNeed = (s, ring, which, targets) => {
    const K = ring.length / 2;
    return Math.max(...[0, K >> 1, K - 1].map(i => ring[i]).map(([xi, zi]) => {
      const o = which === 'ant' ? v(0, 0, 0) : v(xi, 0, 0), dl = v(xi, 0, zi).sub(o); const cur = dl.length(); dl.normalize();
      ligRay.set(s.p.clone().add(o.clone().applyQuaternion(s.q)), dl.clone().applyQuaternion(s.q)); ligRay.far = cur + 3;
      const hits = ligRay.intersectObjects(targets, false);
      // blocos de osso/disco separados por vão maior que 0,6; só conta o bloco que começa antes de 0,5 além da faixa
      // (o que começa mais longe é outra estrutura, como a lâmina atrás do canal sacral)
      let need = 0;
      for (let j = 0; j < hits.length;) {
        const a = hits[j].distance; let b = a; j++;
        while (j < hits.length && hits[j].distance - b < 0.6) b = hits[j++].distance;
        if (a < cur + 0.5) need = Math.max(need, b + 0.08 - cur);
      }
      return need;
    }));
  };
  const ligSeg = (which, u0, u1, key, hwFn, th, kind = 'lig', info) => {
    const targets = ligTargets(u0, u1, which), S = [];
    root.updateMatrixWorld(true); targets.forEach(m => m.material = rayMat);
    // a cada 0,2 e só com os corpos/discos vizinhos da amostra: com 0,1 e todos os alvos do segmento a montagem levava ~1 s
    // chave: geometria dos alvos e sua posição relativa à amostra (o que fica acima de um nível alterado só se desloca
    // em bloco, então continua igual); amostra com a mesma chave reaproveita o resultado
    // discos são montados em coordenadas do mundo: o referencial deles é o quadro do disco, não a matriz da malha
    const frameOf = m => m.userData.fr || (m.userData.fr = m.userData.key.startsWith('disc.') ? new THREE.Matrix4().compose(discKF[m.userData.key.slice(5)].p, discKF[m.userData.key.slice(5)].q, new V3(1, 1, 1)) : m.matrixWorld);
    const geo = m => m.userData.gh ?? (m.userData.gh = (() => {
      const a = m.geometry.attributes.position.array, t = new THREE.Matrix4().copy(frameOf(m)).invert().multiply(m.matrixWorld), p = new V3(); let h = a.length;
      for (let i = 0; i < a.length; i += 3) { p.set(a[i], a[i + 1], a[i + 2]).applyMatrix4(t); h = (h * 31 + Math.round(p.x * 997 + p.y * 991 + p.z * 983)) | 0; }
      return h;
    })());
    const fx = a => a.map(x => x.toFixed(3)).join(','), inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
    for (let u = u0; u <= u1 + 1e-6; u += 0.2) {
      const s = spineAt(u), hw = hwFn(s, u), ring = bandRing(s, which, hw, th, 0.04), tg = targets.filter(m => Math.abs(m.userData.ku - u) <= 1.05);
      inv.compose(s.p, s.q, new V3(1, 1, 1)).invert();
      const ck = [which, hw.toFixed(4), th, fx([s.W, s.ant, s.post]), ...tg.map(m => geo(m) + ':' + fx(rel.multiplyMatrices(inv, frameOf(m)).elements))].join('|');
      let need = LIG_CACHE.get(ck); if (need === undefined) LIG_CACHE.set(ck, need = bandNeed(s, ring, which, tg));
      S.push({ s, ring, need });
    }
    // a quina do corpo pode cair entre duas amostras: cada amostra herda o maior empurrão das vizinhas
    const rr = S.map(({ s, ring }, i) => {
      const K = ring.length / 2, n = Math.max(...[i - 1, i, i + 1].filter(t => t >= 0 && t < S.length).map(t => S[t].need));
      return ring.map(([x, z], j) => {
        const k = j < K ? j : 2 * K - 1 - j, [xi, zi] = ring[k];
        const dl = (which === 'ant' ? v(xi, 0, zi) : v(0, 0, zi)).normalize();
        return s.p.clone().add(v(x + dl.x * n, 0, z + dl.z * n).applyQuaternion(s.q));
      });
    });
    targets.forEach(m => m.material = null);
    if (rr.length < 2) return;
    const lvl = key.split('.')[1];
    // fechado, pelo mesmo motivo do cilindro; o corte agora é tampado, então as tampas coincidentes no meio do disco não aparecem
    add(loft(rr, true, true, 0, 0, true), kind, key, info || which, { level: lvl, region: LV[lvl] ? LV[lvl].r : 'S' });
  };
  // largura por região, interpolada entre as duas pontas do trecho: antes saltava no meio do disco C7-T1 e T12-L1
  const byReg = (s, f) => f(s.A.reg) + (f(s.B.reg) - f(s.A.reg)) * s.f;
  const allHW = s => byReg(s, r => r === 'C' ? 0.55 : r === 'T' ? 0.9 : 1.45);
  const pllHW = (s, u) => {
    const fr = u - Math.floor(u); const isD = s.A.type === 'd' ? 1 - fr : s.B.type === 'd' ? fr : 0;
    const base = byReg(s, r => r === 'C' ? 0.65 : r === 'T' ? 0.45 : 0.32), flare = byReg(s, r => r === 'L' ? 0.95 : r === 'T' ? 0.65 : 0.8);
    return base + (flare - base) * Math.pow(Math.max(0, isD), 2);
  };
  const opll = mods.opll || [];
  for (let i = 1; i < 24; i++) {
    const n = LEVELS[i].n, u = KI[n];
    const u0 = Math.max(KI.C2, u - 1), u1 = u + 1;
    ligSeg('ant', u0, u1, 'ALL.' + n, allHW, 0.14, 'lig', 'ALL');
    if (opll.includes(n)) ligSeg('post', u0, u1, 'PLL.' + n, pllHW, 0.55, 'opll', 'opll');
    else ligSeg('post', u0, u1, 'PLL.' + n, pllHW, 0.1, 'lig', 'PLL');
  }
  ligSeg('ant', KI.L5 + 1, KI.S1 + 0.3, 'ALL.S1', allHW, 0.14, 'lig', 'ALL');
  ligSeg('post', KI.L5 + 1, KI.S2, 'PLL.S1', pllHW, 0.1, 'lig', 'PLL');
  anchors.set('ALL', SP('L3', 0, 0, LV.L3.D / 2 * 0.93 + 0.2));
  anchors.set('ALL.C', SP('C5', 0, 0, LV.C5.D / 2 + 0.15));
  anchors.set('PLL', SP('L2-L3', 0, 0, -0.47 * LV.L3.D - 0.12));
  anchors.set('PLL.C', SP('C4', 0, 0, postMidZ('C', LV.C4.D) - 0.12));
  // membrana tectória
  {
    const pts = [SP('C2', 0, -0.3, postMidZ('C', LV.C2.D) - 0.1), toW(F.C2, 0, F.C2.h / 2 + 0.9, -0.42), toW(F.C1, 0, 0.9, -0.5), toW(F.Occ, 0, 0.6, 0.3), toW(F.Occ, 0, 1.6, 0.9)];
    add(tube(pts, () => 0.5, { flat: 0.16, N: 10, upFn: () => v(1, 0, 0).applyQuaternion(F.C1.q) }), 'lig', 'tect', 'tect', { level: 'C2', region: 'C' });
    anchors.set('tect', toW(F.C1, 0, 0.9, -0.55));
  }
  // ligamento transverso do atlas e alares
  {
    const z0 = 0.15 + (mods.dens ? -0.3 : 0);
    const pts = [toW(F.C1, 1.05, 0.0, -0.25), toW(F.C1, 0.55, 0.0, -0.6), toW(F.C1, 0, 0.0, -0.75), toW(F.C1, -0.55, 0.0, -0.6), toW(F.C1, -1.05, 0.0, -0.25)];
    add(tube(pts, () => 0.22, { flat: 1.6, N: 10, upFn: () => v(0, 1, 0).applyQuaternion(F.C1.q) }), 'lig', 'TAL', 'TAL', { level: 'C1', region: 'C' });
    anchors.set('TAL', toW(F.C1, 0, 0.0, -0.8));
    const dt = mods.dens ? toW(F.C2, 0, F.C2.h / 2 + 1.25, -0.25) : toW(F.C2, 0, F.C2.h / 2 + 1.3, 0.15);
    [1, -1].forEach(s => {
      add(tube([dt, toW(F.Occ, s * 0.7, -0.2, -0.25), toW(F.Occ, s * 1.15, -0.25, -0.5)], () => 0.13, { N: 8 }), 'lig', 'alar.' + (s > 0 ? 'L' : 'R'), 'alar', { level: 'C1', region: 'C' });
    });
    anchors.set('alar.L', toW(F.Occ, 0.7, -0.2, -0.3));
  }
  // amarelo, interespinhoso, intertransversário, cápsulas
  const pairs = [];
  for (let i = 1; i < 24; i++) pairs.push([LEVELS[i].n, i === 23 ? 'S1' : LEVELS[i + 1].n]);
  const frOf = n => n === 'S1' ? SB[0] : F[n];
  const flav = mods.flavum || {};
  pairs.forEach(([un, ln]) => {
    const dn = un + '-' + ln;
    const PU = VP[un], PL = VP[ln]; if (!PU || !PL || !PU.lam) return;
    const fU = frOf(un), fL = frOf(ln);
    const lu = LV[un], ll = LV[ln] || { px: 2.1, cw: 2.6, r: 'S' };
    const thick = flav[dn] || 1;
    [1, -1].forEach(s => {
      const side = s > 0 ? 'L' : 'R';
      const xl = s * (lu.cw / 2 - 0.05), xlL = s * ((ll.cw || 2.6) / 2 - 0.05);
      const inU = 0.25 + 0.1 * (thick - 1), inL = 0.25 + 0.1 * (thick - 1);
      const a = toW(fU, xl * 0.95, PU.lam.y - PU.lam.r * 0.55, PU.lam.z + 0.55 + 0.12 * (thick - 1));
      const b = toW(fU, s * 0.08, PU.lam.y - PU.lam.r * 0.75, PU.lam.z + 0.35 + 0.12 * (thick - 1));
      const c = toW(fL, s * 0.08, PL.lam.y + PL.lam.r * 0.65, PL.lam.z + 0.3 + 0.12 * (thick - 1));
      const d = toW(fL, xlL * 0.95, PL.lam.y + PL.lam.r * 0.45, PL.lam.z + 0.5 + 0.12 * (thick - 1));
      add(quadSlab(a, b, c, d, 0.32 * thick), thick > 1.2 ? 'flavumHyp' : 'flavum', `flav.${dn}.${side}`, 'flavum', { level: dn, region: lu.r });
      anchors.set(`flav.${dn}.${side}`, a.clone().lerp(c, 0.5));
      // cápsula facetária
      const fs = ((mods.facet || {})[dn]) || 1;
      if (PU.iap && PU.iap[side] && PL.sap && PL.sap[side]) {
        const A = toW(fU, PU.iap[side].bot.x, PU.iap[side].bot.y, PU.iap[side].bot.z), B = toW(fL, PL.sap[side].top.x, PL.sap[side].top.y, PL.sap[side].top.z);
        const mid = A.clone().lerp(B, 0.5); const rad = (lu.r === 'C' ? 0.6 : lu.r === 'T' ? 0.55 : 0.7) * fs;
        add(ellip(mid, rad, rad * 1.25, rad, 14, fU.q), fs > 1.2 ? 'capsuleHyp' : 'capsule', `cap.${dn}.${side}`, 'capsule', { level: dn, region: lu.r });
        anchors.set(`cap.${dn}.${side}`, mid);
        anchors.set(`foramen.${dn}.${side}`, toW(fU, s * (lu.px + 0.1), -fU.h / 2 - (fU.thBelow || 0.6) * 0.2, -LV[un].D / 2 - 0.35));
      }
      // intertransversário
      if (PU.tpTip && PL.tpTip && PU.tpTip[side] && PL.tpTip[side]) {
        add(rod(toW(fU, PU.tpTip[side].x * 0.92, PU.tpTip[side].y, PU.tpTip[side].z), toW(fL, PL.tpTip[side].x * 0.92, PL.tpTip[side].y, PL.tpTip[side].z), 0.12, { f: 2.2, seg: 8 }), 'lig', `itl.${dn}.${side}`, 'itl', { level: dn, region: lu.r });
      }
    });
    // interespinhoso
    if (PU.spRoot && PL.spRoot && (lu.r !== 'T' || +un.slice(1) >= 10)) {
      const a = toW(fU, 0, PU.spRoot.y - PU.spR * 0.7, PU.spRoot.z), b = toW(fU, 0, PU.spTip.y - PU.spR * 0.6, PU.spTip.z + 0.2);
      const c = toW(fL, 0, PL.spTip.y + PL.spR * 0.6, PL.spTip.z + 0.2), d = toW(fL, 0, PL.spRoot.y + PL.spR * 0.7, PL.spRoot.z);
      add(quadSlab(a, b, c, d, 0.28), mods.ossify ? 'osteo' : 'lig', `isp.${dn}`, 'isp', { level: dn, region: lu.r });
      anchors.set(`isp.${dn}`, a.clone().lerp(c, 0.5));
    }
  });
  // supraespinhoso (C7 ao sacro) e nucal
  {
    const tips = [];
    for (let i = 6; i < 24; i++) { const n = LEVELS[i].n, P = VP[n]; tips.push(toW(F[n], 0, P.spTip.y, P.spTip.z - P.spR * 0.75)); }
    tips.push(toW(SB[1], 0, 0.3, -3.1));
    add(tube(tips, () => 0.17, { N: 8, density: 1.6 }), mods.ossify ? 'osteo' : 'lig', 'SSL', 'SSL', { level: null, region: 'L' });
    anchors.set('SSL', toW(F.L2, 0, VP.L2.spTip.y, VP.L2.spTip.z - 0.8));
    const att = [toW(F.C1, 0, -0.05, -3.0)]; for (let i = 1; i <= 5; i++) { const n = LEVELS[i].n, P = VP[n]; att.push(toW(F[n], 0, P.spTip.y, P.spTip.z - 0.2)); }
    const c7 = tips[0], eop = anchors.get('EOP');
    att.unshift(toW(F.Occ, 0, 1.3, -3.6));
    const M = att.length; const strips = [];
    for (let k = 0; k < M - 1; k++) {
      const f0 = k / (M - 1), f1 = (k + 1) / (M - 1);
      strips.push(quadSlab(att[k], eop.clone().lerp(c7, f0), eop.clone().lerp(c7, f1), att[k + 1], 0.12));
    }
    strips.push(quadSlab(att[M - 1], eop.clone().lerp(c7, 1), c7, toW(F.C6, 0, VP.C6.spTip.y, VP.C6.spTip.z - 0.2), 0.12));
    add(mergeGeoms(strips), 'nuchal', 'nuchal', 'nuchal', { level: null, region: 'C' });
    anchors.set('nuchal', eop.clone().lerp(c7, 0.45).lerp(att[3], 0.3));
  }

  /* ---- costelas ---- */
  const AXR = [5.5, 8, 10, 11.5, 12.5, 13, 13.5, 13.5, 13, 12.5, 10.5, 8.5], AZR = [4, 5.5, 6.5, 7.5, 8, 8.5, 9, 9, 9, 9, 9, 9];
  for (let k = 1; k <= 12; k++) {
    const n = 'T' + k, fr = F[n], P = VP[n], l = LV[n];
    [1, -1].forEach(s => {
      const side = s > 0 ? 'L' : 'R';
      const head = toW(fr, s * l.W / 2 * 0.82, fr.h / 2 - 0.1, -l.D * 0.22);
      const tt = P.tpTip[side]; const tub = toW(fr, tt.x + s * 0.1, tt.y - 0.2, tt.z + 0.45);
      const ax = AXR[k - 1], az = AZR[k - 1], zc = l.D / 2 + 0.3;
      const pts = [head, toW(fr, s * (l.W / 2 + 0.7), fr.h / 2 - 0.12, -l.D / 2 - 0.15), tub];
      const end = k === 12 ? 132 : k === 11 ? 105 : 78;
      for (let a = 150; a >= end; a -= 12) {
        const th = a * deg; const yy = tt.y - 0.3 - (180 - a) * 0.055 * (k > 10 ? 0.6 : 1);
        pts.push(toW(fr, s * ax * Math.sin(th), yy, zc + az * Math.cos(th) * (a > 140 ? 1.0 : 1)));
      }
      add(tube(pts, t => 0.42 - 0.08 * t, { N: 10, flat: 0.55, upFn: () => v(0, 1, 0).applyQuaternion(fr.q), density: 1.6 }), 'rib', `rib.${k}.${side}`, 'rib', { level: n, region: 'T' });
      anchors.set(`rib.${k}.${side}`, head.clone().lerp(tub, 0.5));
      anchors.set(`cvj.${k}.${side}`, head);
    });
  }

  /* ---- medula, dura, raízes ---- */
  const uConus = KI['L1-L2'] + 0.25;
  const pinch = (u, what) => {
    let f = 1;
    (mods.pinch || []).forEach(pc => { if (pc.what && pc.what !== what && pc.what !== 'all') return; const u0 = typeof pc.at === 'string' ? KI[pc.at] + (pc.off || 0) : pc.at; const g = Math.exp(-Math.pow((u - u0) / (pc.w || 0.45), 2)); f *= 1 - (1 - pc.f) * g; });
    return f;
  };
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const cordR = (u) => {
    let rx = 0.62, rz = 0.42;
    rx = 0.78 - 0.16 * sm(0.2, 2.2, u); rz = 0.56 - 0.14 * sm(0.2, 2.2, u);
    const ce = Math.exp(-Math.pow((u - KI.C6) / 3.2, 2)); rx += 0.1 * ce; rz += 0.03 * ce;
    const th = sm(KI.T1, KI.T3, u) * (1 - sm(KI.T9, KI.T11, u)); rx -= 0.22 * th; rz -= 0.06 * th;
    const le = Math.exp(-Math.pow((u - KI.T12) / 2.4, 2)); rx += 0.1 * le; rz += 0.05 * le;
    const con = sm(KI.L1 - 0.6, uConus, u); rx *= 1 - 0.93 * con; rz *= 1 - 0.9 * con;
    const pf = pinch(u, 'cord'); return [rx * Math.max(0.55, pf) , rz * pf];
  };
  P_cord: {
    const smp = [];
    const top = SP(0, 0, 2.6, -1.3);
    for (let u = 0; u <= uConus + 1e-6; u += 0.12) {
      const s = spineAt(u); const [rx, rz] = cordR(u);
      smp.push({ p: s.p.clone().add(v(0, 0, s.zc).applyQuaternion(s.q)), ax: v(1, 0, 0).applyQuaternion(s.q), az: v(0, 0, 1).applyQuaternion(s.q), rx, rz });
    }
    const s0 = spineAt(0);
    smp.unshift({ p: top, ax: v(1, 0, 0).applyQuaternion(s0.q), az: v(0, 0, 1).applyQuaternion(s0.q), rx: 0.85, rz: 0.65 });
    const rr = smp.map(o => { const r = []; for (let k = 0; k < 16; k++) { const t = 2 * Math.PI * k / 16; r.push(o.p.clone().addScaledVector(o.ax, Math.cos(t) * Math.max(0.02, o.rx)).addScaledVector(o.az, Math.sin(t) * Math.max(0.02, o.rz))); } return r; });
    add(loft(rr, true, true), 'cord', 'cord', 'cord', { level: null, region: null });
    const cp = u => SP(u, 0, 0, spineAt(u).zc);
    anchors.set('cord', cp(KI.C5)); anchors.set('cervEnl', cp(KI.C6)); anchors.set('lumbEnl', cp(KI.T12)); anchors.set('conus', cp(uConus - 0.3)); anchors.set('cord.T', cp(KI.T6));
    anchors.set('medulla', top);
  }
  const cordSurf = (u, x, z) => { const s = spineAt(u); const [rx, rz] = cordR(u); return s.p.clone().add(v(x * rx, 0, s.zc + z * rz).applyQuaternion(s.q)); };
  // dura
  {
    const uEnd = KI.S2 + 0.1; const rr = [];
    for (let u = 0; u <= uEnd + 1e-6; u += 0.15) {
      const s = spineAt(u); const pf = pinch(u, 'dura');
      let rx = s.cw / 2 * 0.8, rz = s.ca / 2 * 0.86;
      const close = 1 - sm(uEnd - 1.0, uEnd, u) * 0.9;
      rx *= close * (0.4 + 0.6 * pf); rz *= close * pf;
      const r = []; const c = s.p.clone().add(v(0, 0, s.zc + (1 - pf) * 0.25).applyQuaternion(s.q));
      for (let k = 0; k < 20; k++) { const t = 2 * Math.PI * k / 20; r.push(c.clone().add(v(Math.cos(t) * rx, 0, Math.sin(t) * rz).applyQuaternion(s.q))); }
      rr.push(r);
    }
    const s0 = spineAt(0); const top = []; for (let k = 0; k < 20; k++) { const t = 2 * Math.PI * k / 20; top.push(SP(0, 1.5 * Math.cos(t), 0.6, -1.25 + 1.7 * Math.sin(t))); }
    rr.unshift(top);
    add(loft(rr, false, true), 'dura', 'dura', 'dura', { level: null, region: null, shell: 1 }); // bainha aberta em cima, onde entra no crânio
    anchors.set('dura', SP('L3', LV.L3.cw / 2 * 0.8, 0, -LV.L3.D / 2 - LV.L3.ca / 2));
    anchors.set('duraEnd', SP(uEnd - 0.4, 0, 0, spineAt(uEnd - 0.4).zc));
    anchors.set('cauda', SP('L3-L4', 0, 0, spineAt(KI['L3-L4']).zc - 0.1));
  }
  // raízes nervosas
  const NERVES = [];
  ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'].forEach((n, i) => NERVES.push({ n, reg: 'C', rank: i }));
  for (let k = 1; k <= 12; k++) NERVES.push({ n: 'T' + k, reg: 'T' });
  for (let k = 1; k <= 5; k++) NERVES.push({ n: 'L' + k, reg: 'L', rank: k - 1 });
  for (let k = 1; k <= 5; k++) NERVES.push({ n: 'S' + k, reg: 'S', rank: 4 + k });
  NERVES.push({ n: 'Co1', reg: 'S', rank: 10 });
  // origem no cordão (segmentos medulares acima das vértebras)
  const segU = {};
  const lin = (arr, a, b) => arr.forEach((n, i) => segU[n] = a + (b - a) * (i + 0.5) / arr.length);
  lin(['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'], 0.6, KI.T1 - 0.6);
  lin(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'], KI.T1 - 0.6, KI.T10);
  lin(['L1', 'L2', 'L3', 'L4', 'L5'], KI.T10, KI.T12 + 0.4);
  lin(['S1', 'S2', 'S3', 'S4', 'S5', 'Co1'], KI.T12 + 0.4, uConus - 0.15);
  const hot = new Set(mods.hotRoots || []);
  NERVES.forEach(nv => {
    [1, -1].forEach(s => {
      const side = s > 0 ? 'L' : 'R';
      const key = `root.${nv.n}.${side}`;
      let fr, fl, e1, e2, uExit;
      const n = nv.n;
      if (n === 'C1') { fl = toW(F.C1, s * 1.2, 0.55, -2.1); e1 = toW(F.C1, s * 2.0, 0.8, -2.5); e2 = toW(F.C1, s * 2.8, 0.6, -2.4); uExit = KI.C1 - 0.4; }
      else if (n === 'C2') { fl = toW(F.C2, s * 1.25, F.C2.h / 2 + 0.3, -1.45); e1 = toW(F.C2, s * 2.1, F.C2.h / 2, -2.0); e2 = toW(F.C2, s * 2.9, F.C2.h / 2 - 0.5, -2.0); uExit = KI.C2 - 0.6; }
      else if (nv.reg === 'C') {
        const vn = n === 'C8' ? 'T1' : n; const f = F[vn], l = LV[vn], P = VP[vn];
        const dA = f.thAbove; const tfx = n === 'C8' ? l.W / 2 + 0.6 : P.tfx, tfz = n === 'C8' ? -l.D / 2 + 0.2 : P.tfz;
        fl = toW(f, s * (l.cw / 2 + 0.35), f.h / 2 + dA * 0.5, -l.D / 2 - 0.25);
        e1 = toW(f, s * (tfx + 0.2), f.h / 2 - 0.05, tfz - 0.5);
        e2 = toW(f, s * (tfx + 2.0), f.h / 2 - 1.4, tfz + 1.0);
        uExit = KI[vn] - 1;
      } else if (nv.reg === 'T' || nv.reg === 'L') {
        const f = F[n], l = LV[n];
        fl = toW(f, s * (l.px + 0.15), -0.3 * f.h, -l.D / 2 - 0.3);
        if (nv.reg === 'T') { e1 = toW(f, s * (l.px + 1.4), -0.5 * f.h, -l.D / 2 - 0.5); e2 = toW(f, s * (l.px + 3.4), -0.62 * f.h, -l.D / 2 - 0.1); }
        else { e1 = toW(f, s * (l.px + 1.5), -0.55 * f.h - 0.4, -l.D / 2 + 0.2); e2 = toW(f, s * (l.px + 2.8), -f.h - 1.6, -l.D / 2 + 1.6); }
        uExit = KI[n] + 0.35;
      } else {
        const j = +n.slice(1);
        if (n !== 'Co1' && j <= 4) { const c = VP.SF[j + '.' + side]; const qq = SB[j].q; fl = c.clone().add(v(0, 0, -0.9).applyQuaternion(qq)); e1 = c.clone().add(v(s * 0.4, -0.5, 1.2).applyQuaternion(qq)); e2 = c.clone().add(v(s * 1.4, -2.0, 2.6).applyQuaternion(qq)); uExit = KI['S' + j] + 0.5; }
        else { fl = toW(SB[5], s * 0.35, 0.3, -0.8); e1 = toW(SB[5], s * 0.7, -0.5, -0.9); e2 = toW(SB[5], s * 1.0, -1.3, -0.6); uExit = KI.S5 - 0.3; }
      }
      const pts = [];
      const u0 = segU[n];
      pts.push(cordSurf(u0, s * 0.92, 0.1));
      if (nv.reg === 'L' || nv.reg === 'S') {
        const rk = nv.rank;
        for (let u = u0 + 0.8; u < uExit - 0.7; u += 0.5) {
          const s_ = spineAt(u); const ramp = sm(uExit - 3.0, uExit - 0.7, u);
          const pf = 0.35 + 0.65 * pinch(u, 'dura');
          const xm = s_.cw / 2 * (0.6 - 0.045 * rk) * pf, zm = -s_.ca / 2 * (0.05 + 0.045 * rk) * pf;
          const xr = s_.cw / 2 * 0.78 * (0.5 + 0.5 * pf), zr = s_.ca * 0.18 * pf;
          pts.push(s_.p.clone().add(v(s * (xm + (xr - xm) * ramp), 0, s_.zc + (1 - pf) * 0.25 + zm + (zr - zm) * ramp).applyQuaternion(s_.q)));
        }
      } else {
        const s_ = spineAt((u0 + uExit) / 2); pts.push(s_.p.clone().add(v(s * s_.cw / 2 * 0.74, 0, s_.zc + 0.05).applyQuaternion(s_.q)));
      }
      pts.push(fl, e1, e2);
      const r = nv.reg === 'C' ? 0.15 : nv.reg === 'T' ? 0.1 : nv.reg === 'L' ? 0.17 + 0.015 * nv.rank : n === 'S1' ? 0.2 : n === 'S2' ? 0.15 : n === 'Co1' ? 0.05 : 0.1 - 0.015 * (+n.slice(1) - 3);
      const rIn = Math.min(r, nv.reg === 'C' ? 0.08 : nv.reg === 'T' ? 0.05 : 0.065);
      let Ltot = 0, Lf = 0; for (let i = 1; i < pts.length; i++) { const dl = pts[i].distanceTo(pts[i - 1]); Ltot += dl; if (i <= pts.length - 3) Lf += dl; }
      const tf = Lf / Ltot;
      const rFn = t => t < tf - 0.04 ? rIn : t < tf + 0.04 ? rIn + (r - rIn) * (t - tf + 0.04) / 0.08 : r;
      const isHot = hot.has(n) || hot.has(n + '.' + side) || hot.has('*cauda') && (nv.reg === 'L' || nv.reg === 'S');
      add(tube(pts, rFn, { N: 7, density: 2.2 }), 'root', key, 'root', { level: n, nerve: n, side, region: nv.reg, hot: isHot });
      // gânglio
      const gq = new THREE.Quaternion().setFromUnitVectors(v(0, 1, 0), new V3().subVectors(e1, fl).normalize());
      const gc = fl.clone().lerp(e1, 0.35);
      add(ellip(gc, r * 1.9, r * 3.2, r * 1.9, 12, gq), 'drg', `drg.${n}.${side}`, 'drg', { level: n, nerve: n, side, region: nv.reg, hot: isHot });
      anchors.set(key, fl.clone().lerp(e1, 0.6)); anchors.set(`drg.${n}.${side}`, gc);
      anchors.set(`rootIn.${n}.${side}`, pts[Math.max(1, pts.length - 4)]);
    });
  });
  // filamento terminal
  {
    const pts = [SP(uConus, 0, 0, spineAt(uConus).zc)];
    for (let u = uConus + 1; u < KI.S2; u += 1.5) pts.push(SP(u, 0, 0, spineAt(u).zc - 0.15));
    pts.push(toW(SB[4], 0, 0, -0.9), toW(SB[5], 0, -0.4, -0.6), F.Co1.p.clone().add(v(0, 0, -0.5).applyQuaternion(F.Co1.q)));
    add(tube(pts, () => 0.045, { N: 6 }), 'cord', 'filum', 'filum', { level: null });
    anchors.set('filum', SP(KI.S1, 0, 0, spineAt(KI.S1).zc - 0.15));
  }

  /* ---- vasos ---- */
  const VS = (key, kind, pts, rFn, info, extra = {}) => { const m = add(tube(pts, rFn, { N: 12, density: 1.4 }), kind, key, info, Object.assign({ level: null }, extra)); return m; };
  const aoX = { T5: 2.0, T6: 2.0, T7: 1.9, T8: 1.7, T9: 1.5, T10: 1.3, T11: 1.0, T12: 0.8, L1: 0.7, L2: 0.65, L3: 0.55, L4: 0.4 };
  const aoP = n => SPf(n, s => [aoX[n], 0, s.D / 2 + 1.25]);
  const archTop = SPf('T3', s => [-0.1, 1.2, s.D / 2 + 3.4]);
  {
    const pts = [SPf('T6', s => [-1.3, 0, s.D / 2 + 7.2]), SPf('T4', s => [-1.1, 0.6, s.D / 2 + 6.3]), archTop, SPf('T4', s => [1.4, 0.4, s.D / 2 + 1.9]), aoP('T5'), aoP('T6'), aoP('T8'), aoP('T10'), aoP('T12'), aoP('L1'), aoP('L2'), aoP('L3'), SPf('L4', s => [0.35, -0.2, s.D / 2 + 1.25])];
    VS('aorta', 'artery', pts, t => 1.45 - 0.55 * Math.min(1, t * 1.1), 'aorta');
    anchors.set('aorta', aoP('T8')); anchors.set('aorta.L', aoP('L2')); anchors.set('aorta.arch', archTop);
    const B = pts[pts.length - 1].clone();
    anchors.set('aorta.bif', B);
    const lowC = SPf('L5', s => [0, -1.5, s.D / 2 + 1.6]);
    const up = v(0, 1, 0);
    [1, -1].forEach(s => {
      const side = s > 0 ? 'L' : 'R';
      const c1 = B.clone().add(v(s * 0.6, -0.8, 0.1)), c2 = lowC.clone().add(v(s * 2.6, -1.0, 0.2)), c3 = lowC.clone().add(v(s * 4.0, -4.2, 0.6));
      VS('cia.' + side, 'artery', [B.clone().add(v(0, 0.3, 0)), c1, c2, c3], () => 0.55, 'cia');
      VS('eia.' + side, 'artery', [c3, c3.clone().add(v(s * 1.0, -2.2, 1.4)), c3.clone().add(v(s * 1.8, -5.5, 3.6))], () => 0.45, 'eia');
      VS('iia.' + side, 'artery', [c3, c3.clone().add(v(-s * 0.3, -1.6, -1.2)), c3.clone().add(v(-s * 0.8, -3.6, -2.0))], () => 0.38, 'iia');
      anchors.set('cia.' + side, c2);
    });
    // ramos do arco
    const bctEnd = SPf('T1', s => [-1.9, 1.6, s.D / 2 + 3.2]);
    VS('bct', 'artery', [archTop.clone().add(v(-0.8, 0.5, 0.6)), SPf('T2', s => [-1.4, 0.8, s.D / 2 + 3.6]), bctEnd], () => 0.6, 'bct');
    const scaR = [bctEnd, SPf('T1', s => [-3.6, 1.6, s.D / 2 + 2.3]), SPf('T1', s => [-5.8, 0.6, s.D / 2 + 1.6]), SPf('T2', s => [-7.8, -0.4, s.D / 2 + 1.8])];
    const scaL = [archTop.clone().add(v(1.0, 0.4, -0.5)), SPf('T2', s => [1.8, 1.0, s.D / 2 + 2.2]), SPf('T1', s => [3.6, 1.5, s.D / 2 + 2.1]), SPf('T1', s => [5.8, 0.6, s.D / 2 + 1.6]), SPf('T2', s => [7.8, -0.4, s.D / 2 + 1.8])];
    VS('sca.R', 'artery', scaR, () => 0.45, 'sca'); VS('sca.L', 'artery', scaL, () => 0.45, 'sca');
    VS('cca.R', 'artery', [bctEnd, SPf('C7', s => [-2.3, 0, s.D / 2 + 2.6]), SPf('C5', s => [-2.4, 0, s.D / 2 + 2.3]), SPf('C3', s => [-2.4, 0, s.D / 2 + 2.3])], () => 0.4, 'cca');
    VS('cca.L', 'artery', [archTop.clone().add(v(0.3, 0.6, 0.1)), SPf('T1', s => [1.6, 1.2, s.D / 2 + 3.0]), SPf('C7', s => [2.3, 0, s.D / 2 + 2.6]), SPf('C5', s => [2.4, 0, s.D / 2 + 2.3]), SPf('C3', s => [2.4, 0, s.D / 2 + 2.3])], () => 0.4, 'cca');
    anchors.set('cca.L', SPf('C5', s => [2.4, 0, s.D / 2 + 2.3]));
    // artérias vertebrais
    [1, -1].forEach(s => {
      const side = s > 0 ? 'L' : 'R';
      const o = SPf('T1', q => [s * 2.9, 1.25, q.D / 2 + 1.9]);
      const pts = [o, SPf('C7', q => [s * (LV.C7.W / 2 + 0.75), 0, q.D / 2 * 0.2 + 0.7])];
      ['C6', 'C5', 'C4', 'C3', 'C2'].forEach(n => pts.push(anchors.get(`${n}.tf.${side}`)));
      pts.push(anchors.get(`C1.tf.${side}`));
      pts.push(toW(F.C1, s * 2.55, 0.5, -1.4), toW(F.C1, s * 1.75, 0.55, -2.5), toW(F.C1, s * 0.95, 0.85, -2.4), toW(F.Occ, s * 0.75, 0.5, -1.0), toW(F.Occ, s * 0.35, 1.5, 0.1), toW(F.Occ, s * 0.05, 2.2, 0.55));
      VS('va.' + side, 'artery', pts, () => 0.21, 'va');
      anchors.set('va.V1.' + side, o.clone().lerp(pts[1], 0.5)); anchors.set('va.V2.' + side, anchors.get(`C4.tf.${side}`)); anchors.set('va.V3.' + side, toW(F.C1, s * 1.75, 0.55, -2.5)); anchors.set('va.V4.' + side, toW(F.Occ, s * 0.5, 1.0, -0.5));
    });
    VS('basilar', 'artery', [toW(F.Occ, 0, 2.15, 0.55), toW(F.Occ, 0, 3.6, 0.85), toW(F.Occ, 0, 5.2, 1.0)], () => 0.22, 'basilar');
    anchors.set('basilar', toW(F.Occ, 0, 3.6, 0.85));
    // segmentares
    const segLv = ['T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'L1', 'L2', 'L3', 'L4'];
    segLv.forEach(n => {
      const l = LV[n], f = F[n];
      const ax = aoX[n] ?? 1.9;
      [1, -1].forEach(s => {
        const side = s > 0 ? 'L' : 'R';
        const pts = [toW(f, ax - s * 0.3, -0.05, l.D / 2 + 0.6)];
        if (s < 0) pts.push(toW(f, 0, 0, l.D / 2 * 0.93 + 0.12));
        pts.push(toW(f, s * l.W / 2 * 0.78, 0, l.D / 2 * 0.62), toW(f, s * l.W / 2 * 0.98, 0, 0.0), toW(f, s * l.W / 2 * 0.86, -0.05, -l.D / 2 * 0.55),
          toW(f, s * (l.px + 0.55), -0.25 * f.h, -l.D / 2 - 0.15));
        if (l.r === 'T') pts.push(toW(f, s * (l.px + 2.2), -0.42 * f.h, -l.D / 2 - 0.55), toW(f, s * (l.px + 4.2), -0.58 * f.h, -l.D / 2 - 0.1));
        else pts.push(toW(f, s * (l.px + 2.0), -0.35 * f.h, -l.D / 2 + 0.2), toW(f, s * (l.px + 3.6), -0.5 * f.h, -l.D / 2 + 0.6));
        VS(`seg.${n}.${side}`, 'artery', pts, () => 0.13, 'seg', { level: n });
        anchors.set(`seg.${n}.${side}`, toW(f, s * l.W / 2 * 0.98, 0, 0.0));
      });
    });
    // espinhais anterior e posteriores, Adamkiewicz
    const asa = [], psa = [[], []];
    for (let u = 0.3; u <= uConus + 0.05; u += 0.5) { asa.push(cordSurf(u, 0, 1.08)); psa[0].push(cordSurf(u, 0.45, -1.06)); psa[1].push(cordSurf(u, -0.45, -1.06)); }
    VS('asa', 'artery', asa, () => 0.05, 'asa'); VS('psa.L', 'artery', psa[0], () => 0.04, 'psa'); VS('psa.R', 'artery', psa[1], () => 0.04, 'psa');
    anchors.set('asa', cordSurf(KI.T7, 0, 1.08)); anchors.set('psa', cordSurf(KI.T7, 0.45, -1.06));
    const lT = LV.T10, fT = F.T10;
    const ad = [toW(fT, lT.px + 0.55, -0.25 * fT.h, -lT.D / 2 - 0.15), toW(fT, lT.cw / 2 * 0.7, -0.15 * fT.h, -lT.D / 2 - 0.45), cordSurf(KI.T10 - 0.6, 0.5, 1.15), cordSurf(KI.T9 - 0.2, 0.18, 1.2), cordSurf(KI.T9 - 0.55, 0.05, 1.15), cordSurf(KI.T9 + 0.2, 0, 1.1), cordSurf(KI.T10, 0, 1.08)];
    VS('adamk', 'artery', ad, () => 0.07, 'adamk', { level: 'T10' });
    anchors.set('adamk', cordSurf(KI.T9 - 0.4, 0.1, 1.2));
  }
  // veias
  {
    const ivX = { L5: -1.3, L4: -1.7, L3: -1.95, L2: -2.05, L1: -2.05, T12: -2.0 };
    const conf = SPf('L5', s => [-1.2, -0.3, s.D / 2 + 1.25]);
    const pts = [conf, SPf('L4', s => [-1.7, 0, s.D / 2 + 1.35]), SPf('L3', s => [-1.95, 0, s.D / 2 + 1.45]), SPf('L2', s => [-2.05, 0, s.D / 2 + 1.6]), SPf('L1', s => [-2.05, 0, s.D / 2 + 1.85]), SPf('T12', s => [-2.0, 0, s.D / 2 + 2.4]), SPf('T11', s => [-1.8, 0, s.D / 2 + 3.4]), SPf('T10', s => [-1.4, 0.3, s.D / 2 + 5.2]), SPf('T9', s => [-1.0, 0.6, s.D / 2 + 7.4])];
    VS('ivc', 'vein', pts, () => 1.05, 'ivc');
    anchors.set('ivc', SPf('L2', s => [-2.05, 0, s.D / 2 + 1.6]));
    const lowC = SPf('L5', s => [0, -1.5, s.D / 2 + 1.6]);
    VS('civ.R', 'vein', [conf, conf.clone().add(v(-1.2, -1.4, 0.0)), lowC.clone().add(v(-2.5, -1.6, -0.6)), lowC.clone().add(v(-3.6, -4.4, -0.2))], () => 0.62, 'civ');
    VS('civ.L', 'vein', [conf, SPf('L5', s => [0.6, -0.7, s.D / 2 + 0.75]), SPf('L5', s => [2.4, -1.4, s.D / 2 + 0.75]), lowC.clone().add(v(3.6, -4.4, -0.2))], () => 0.6, 'civ');
    anchors.set('civ.L', SPf('L5', s => [0.9, -0.8, s.D / 2 + 0.75]));
    const az = [SPf('L1', s => [-1.1, 0, s.D / 2 + 0.35])];
    ['T12', 'T11', 'T10', 'T9', 'T8', 'T7', 'T6', 'T5'].forEach(n => az.push(SPf(n, s => [-1.15, 0, s.D / 2 + 0.45])));
    az.push(SPf('T4', s => [-1.0, 0.4, s.D / 2 + 1.6]), SPf('T4', s => [-0.9, 1.2, s.D / 2 + 3.3]), SPf('T3', s => [-1.3, 0.6, s.D / 2 + 4.9]));
    VS('azygos', 'vein', az, () => 0.38, 'azygos');
    anchors.set('azygos', SPf('T7', s => [-1.15, 0, s.D / 2 + 0.45]));
    const hz = [SPf('L1', s => [1.0, 0, s.D / 2 + 0.2]), SPf('T12', s => [1.05, 0, s.D / 2 + 0.22]), SPf('T11', s => [1.05, 0, s.D / 2 + 0.24]), SPf('T10', s => [0.95, 0, s.D / 2 + 0.25]), SPf('T9', s => [0.2, -0.2, s.D / 2 + 0.3]), SPf('T9', s => [-0.9, 0.3, s.D / 2 + 0.42])];
    VS('hemiaz', 'vein', hz, () => 0.26, 'hemiaz');
    anchors.set('hemiaz', SPf('T11', s => [1.05, 0, s.D / 2 + 0.24]));
    // plexo vertebral interno (Batson)
    const pl = [[], []], pp = [[], []];
    for (let u = KI.C2; u <= KI.S1 + 0.01; u += 0.5) {
      const s = spineAt(u);
      [1, -1].forEach((sg, i) => {
        pl[i].push(s.p.clone().add(v(sg * s.cw * 0.3, 0, s.post - 0.2).applyQuaternion(s.q)));
        pp[i].push(s.p.clone().add(v(sg * s.cw * 0.2, 0, s.zc - s.ca / 2 + 0.16).applyQuaternion(s.q)));
      });
    }
    VS('plex.ant.L', 'vein', pl[0], () => 0.075, 'plexus'); VS('plex.ant.R', 'vein', pl[1], () => 0.075, 'plexus');
    VS('plex.post.L', 'vein', pp[0], () => 0.06, 'plexus'); VS('plex.post.R', 'vein', pp[1], () => 0.06, 'plexus');
    for (let i = 2; i < 24; i++) {
      const n = LEVELS[i].n, s = spineAt(KI[n]);
      const a = s.p.clone().add(v(s.cw * 0.3, 0, s.post - 0.2).applyQuaternion(s.q)), b = s.p.clone().add(v(-s.cw * 0.3, 0, s.post - 0.2).applyQuaternion(s.q)), c = s.p.clone().add(v(0, 0, s.post - 0.14).applyQuaternion(s.q)), d = s.p.clone().add(v(0, 0, s.post + 0.75).applyQuaternion(s.q));
      VS(`plex.rung.${n}`, 'vein', [a, c, b], () => 0.06, 'plexus', { level: n });
      VS(`bvv.${n}`, 'vein', [c, d], () => 0.07, 'bvv', { level: n });
    }
    anchors.set('plexus', SPf('L2', s => [s.cw * 0.3, 0, s.post - 0.2]));
    anchors.set('bvv', SPf('L2', s => [0, 0, s.post + 0.4]));
  }

  /* ---- lesões e achados específicos ---- */
  if (mods.synd) {
    const g = [];
    Object.keys(DISCS).forEach(dn => {
      if (DISCS[dn].up === 'C2') return;
      const { lower, upper } = discRings(dn);
      [0, 5, 35, 9, 31, 3, 37].forEach(i => { const a = lower[i], b = upper[i]; const ca = centroid(lower), cb = centroid(upper); const o1 = new V3().subVectors(a, ca).normalize().multiplyScalar(0.12), o2 = new V3().subVectors(b, cb).normalize().multiplyScalar(0.12); g.push(rod(a.clone().add(o1), b.clone().add(o2), 0.13, { seg: 8 })); });
    });
    add(mergeGeoms(g), 'osteo', 'synd', 'synd', { level: null });
    anchors.set('synd', SPf('L2-L3', s => [s.W / 2 * 0.55, 0, s.D / 2 * 0.9]));
  }
  if (mods.dish) {
    const pts = []; for (let u = KI.T4; u <= KI.T12 + 0.01; u += 0.5) { const s = spineAt(u); pts.push(s.p.clone().add(v(-s.W / 2 * 0.62, 0, s.D / 2 * 0.72 + 0.2).applyQuaternion(s.q))); }
    add(tube(pts, t => 0.42 + 0.2 * Math.abs(Math.sin(t * Math.PI * 8.5)), { N: 12 }), 'osteo', 'dish', 'dish', { level: null });
    anchors.set('dish', SPf('T8', s => [-s.W / 2 * 0.62, 0, s.D / 2 * 0.72 + 0.4]));
  }
  (mods.lesions || []).forEach((L_, i) => {
    const f = F[L_.v]; const c = toW(f, L_.x || 0, L_.y || 0, L_.z || 0);
    add(ellip(c, L_.r, L_.r * (L_.ry || 0.9), L_.r, 16, f.q), L_.kind || 'tumor', L_.key || ('tumor.' + L_.v), L_.info || 'tumor', { level: L_.v });
    anchors.set(L_.key || ('tumor.' + L_.v), c);
  });
  if (mods.schmorl) mods.schmorl.forEach(n => { const f = F[n]; [1, -1].forEach(s => add(ellip(toW(f, 0.2 * s, s * (f.h / 2 - 0.3), -0.1), 0.35, 0.28, 0.35, 12, f.q), 'tumor', 'schmorl.' + n, 'schmorl', { level: n })); anchors.set('schmorl.' + n, toW(f, 0.2, f.h / 2 - 0.3, -0.1)); });
  if (mods.burst) {
    const n = mods.burst, f = F[n], l = LV[n];
    const frag = toW(f, 0, f.h * 0.22, -fr_post(l, f) - 0.25);
    add(mergeGeoms([ellip(frag, 0.75, 0.42, 0.38, 14, f.q)]), 'boneHot', 'frag', 'frag', { level: n });
    anchors.set('frag', frag);
    [-0.8, 0.9].forEach((x, i) => add(new THREE.BoxGeometry(0.06, f.h * 1.05, l.D * 1.1).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(f.q)).translate(...toW(f, x, 0, 0).toArray()), 'lesion', 'crack.' + n, 'fxline', { level: n }));
  }
  function fr_post(l, f) { return f.Dw / 2 * 0.8; }
  if (mods.abscess) {
    const a = mods.abscess; const f = F[a.v];
    add(ellip(toW(f, a.x, a.y || 0, a.z || 0), a.rx, a.ry, a.rz, 18, f.q), 'abscess', 'abscess', 'abscess', { level: a.v });
    anchors.set('abscess', toW(f, a.x, a.y || 0, a.z || 0));
  }
  if (mods.myeloLesion) {
    const u0 = KI[mods.myeloLesion]; const smp = [];
    for (let u = u0 - 0.6; u <= u0 + 0.6; u += 0.1) { const s = spineAt(u); const [rx, rz] = cordR(u); smp.push({ c: s.p.clone().add(v(0, 0, s.zc).applyQuaternion(s.q)), q: s.q, rx: rx * 0.6, rz: rz * 0.75 }); }
    const rr = smp.map(o => { const r = []; for (let k = 0; k < 12; k++) { const t = 2 * Math.PI * k / 12; r.push(o.c.clone().add(v(Math.cos(t) * o.rx * 1.75, 0, Math.sin(t) * o.rz * 1.35).applyQuaternion(o.q))); } return r; });
    add(loft(rr, true, true), 'cordLesion', 'myelo.lesion', 'myelolesion', { level: null });
    anchors.set('myelo.lesion', SP(u0, 0, 0, spineAt(u0).zc));
  }
  if (mods.erosion) mods.erosion.forEach(([n, s]) => { const f = F[n], l = LV[n]; const c = toW(f, 0, s * (f.h / 2 - 0.2), 0); add(ellip(c, l.W * 0.36, 0.3, l.D * 0.34, 16, f.q), 'tumor', 'erosion.' + n, 'erosion', { level: n }); anchors.set('erosion.' + n, c); });

  // âncora de centros e metadados
  anchors.set('center', SP(KI.T10, 0, 0, 0));
  const kfy = KF.map(k => k.p.y);
  meshes.forEach(m => {
    if (m.userData.level) return;
    m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox;
    let u0 = 1e9, u1 = -1e9; kfy.forEach((y, i) => { if (y >= b.min.y - 0.6 && y <= b.max.y + 0.6) { u0 = Math.min(u0, i); u1 = Math.max(u1, i); } });
    if (u0 <= u1) { m.userData.u0 = u0; m.userData.u1 = u1; }
  });
  return { root, reg, anchors, meshes, F, KI, spineAt, SP };
}
