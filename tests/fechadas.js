// Toda peça sólida precisa ser fechada e com volume positivo: borda solta vira fenda na tela e anel oco na tampa do corte. Só cascas marcadas (shell) ficam de fora.
// Inclui as variantes da hérnia (posição x forma), escolhidas pelos botões do cartão.
// 1) Conta, por posição de vértice, quantos triângulos usam cada aresta; aresta com contagem ímpar é borda aberta.
const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1200,height:800}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*supabase-js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 await p.goto('http://local.test/'); await p.waitForTimeout(2500);
 const bad=await p.evaluate(async()=>{
  const sp=__spine, out=new Set(), q=1e4;
  const HV=['central','pl','foram','extra'].flatMap(z=>['prot','ext','seq'].map(m=>'hernia.'+z+'.'+m));
  for(const id of [null,...DZ.map(d=>d.id),...PROC.map(d=>d.id),...HV]){
   if(id){const [d,z,m]=id.split('.'); sp.openDz(d); if(z){document.querySelector(`[data-hv="morph.${m}"]`).click(); document.querySelector(`[data-hv="zone.${z}"]`).click();} await new Promise(r=>setTimeout(r,300));}
   for(const m of sp.model.meshes){
    if(m.userData.shell) continue;
    const pos=m.geometry.attributes.position, idx=m.geometry.index, ids=new Map(), E=new Map(); let nid=0;
    // mesmo vértice com erro de arredondamento pode cair na célula vizinha: procura nas 27 em volta
    const vid=i=>{const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),cx=Math.floor(x*q),cy=Math.floor(y*q),cz=Math.floor(z*q);
     for(let a=-1;a<2;a++)for(let b2=-1;b2<2;b2++)for(let c=-1;c<2;c++){const L=ids.get((cx+a)+','+(cy+b2)+','+(cz+c)); if(L) for(const [px,py,pz,id] of L) if(Math.abs(px-x)+Math.abs(py-y)+Math.abs(pz-z)<1e-5) return id;}
     const k=cx+','+cy+','+cz; if(!ids.has(k)) ids.set(k,[]); const id=nid++; ids.get(k).push([x,y,z,id]); return id;};
    const n=idx?idx.count:pos.count; let vol=0; const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3();
    for(let t=0;t<n;t+=3){A.fromBufferAttribute(pos,idx?idx.getX(t):t); B.fromBufferAttribute(pos,idx?idx.getX(t+1):t+1); C.fromBufferAttribute(pos,idx?idx.getX(t+2):t+2); vol+=A.dot(B.cross(C));}
    if(vol<=0) out.add((id||'normal')+' '+m.userData.key+' volume '+(vol/6).toFixed(4));
    for(let t=0;t<n;t+=3){const v=[0,1,2].map(j=>vid(idx?idx.getX(t+j):t+j)); if(v[0]===v[1]||v[1]===v[2]||v[0]===v[2]) continue;
     for(let j=0;j<3;j++){const a=v[j],c=v[(j+1)%3],k=a<c?a+'_'+c:c+'_'+a; E.set(k,(E.get(k)||0)+1);}}
    let open=0; E.forEach(c=>{if(c%2) open++;});
    if(open) out.add((id||'normal')+' '+m.userData.key+' '+open);
   }
  }
  // 2) dentro de uma mesma malha, peças (componentes conexos) cuja superfície corre quase colada à de outra, em paralelo:
  // a diferença de facetas faz uma vazar pela outra e aparece como fenda ou borda serrilhada. Só coluna normal, por tempo.
  sp.goStep(0); await new Promise(r=>setTimeout(r,300));
  const T=new THREE.Triangle(), cp=new THREE.Vector3(), bc=new THREE.Vector3(), nB=new THREE.Vector3(), EPS=0.015;
  for(const m of sp.model.meshes){
   const g=m.geometry, P=g.attributes.position, I=g.index; if(!I) continue;
   const par=new Int32Array(P.count).map((_,i)=>i), f=i=>{while(par[i]!==i) i=par[i]=par[par[i]]; return i;};
   for(let t=0;t<I.count;t+=3){const a=f(I.getX(t)); par[f(I.getX(t+1))]=a; par[f(I.getX(t+2))]=a;}
   const comp=new Map(); for(let t=0;t<I.count;t+=3){const k=f(I.getX(t)); if(!comp.has(k)) comp.set(k,{tris:[],verts:new Set(),box:new THREE.Box3()}); const C=comp.get(k); C.tris.push(t); for(let j=0;j<3;j++) C.verts.add(I.getX(t+j));}
   const cs=[...comp.values()]; if(cs.length<2) continue;
   const V=i=>new THREE.Vector3().fromBufferAttribute(P,i);
   cs.forEach(C=>{C.verts.forEach(i=>C.box.expandByPoint(V(i))); C.box.expandByScalar(EPS);});
   for(const A of cs) for(const B of cs){ if(A===B||!A.box.intersectsBox(B.box)) continue; let near=0;
    A.verts.forEach(i=>{const v=V(i); if(!B.box.containsPoint(v)) return; const nA=new THREE.Vector3().fromBufferAttribute(g.attributes.normal,i); let d=1e9, par2=false;
     for(const t of B.tris){T.set(V(I.getX(t)),V(I.getX(t+1)),V(I.getX(t+2))); T.closestPointToPoint(v,cp); const dd=cp.distanceTo(v); if(dd<d){d=dd; T.getBarycoord(cp,bc); T.getNormal(nB); par2=Math.min(bc.x,bc.y,bc.z)>1e-3&&Math.abs(nB.dot(nA))>0.9;} if(d<1e-4) break;}
     if(par2&&d>1e-4&&d<EPS) near++;});
    if(near>=6) out.add('normal '+m.userData.key+' quase coladas '+near);}
  }
  return [...out];});
 console.log(bad.length?'FALHA: peça aberta, volume negativo ou superfícies quase coladas':'ok: peças sólidas fechadas, com volume positivo e sem superfícies quase coladas', JSON.stringify(bad.slice(0,20)), errs);
 await b.close();
 if(bad.length||errs.length) process.exit(1);
})();
