const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 await p.goto('http://local.test/'); await p.waitForTimeout(2500);
 const r=await p.evaluate(async()=>{
  const w=ms=>new Promise(r=>setTimeout(r,ms)); const X=__spine; const V=new THREE.Vector3();
  const targets=()=>X.model.meshes.filter(m=>m.visible&&(((X.KIND[m.userData.kind]||{}).L==='path')||m.userData.variant==='h'));
  const kept=m=>{ if(!m.visible) return false; const pl=X.renderer.clippingPlanes; if(!pl.length) return true; const g=m.geometry.attributes.position; m.updateMatrixWorld(); for(let i=0;i<g.count;i+=3){V.fromBufferAttribute(g,i).applyMatrix4(m.matrixWorld); if(X.plane.distanceToPoint(V)>=0) return true;} return false; };
  const tool=k=>document.querySelector(`[data-tool=${k}]`).click();
  const check=(label)=>{ const t=targets(); const lost=[...new Set(t.filter(m=>!kept(m)).map(m=>m.userData.key))]; const keptK=[...new Set(t.filter(kept).map(m=>m.userData.key))]; return {label, n:t.length, lost, kept:keptK.length}; };
  const res=[];
  for(const d of [...DZ,...PROC]){ X.openDz(d.id); await w(250);
    const base=X.S.clip; 
    // sagittal on
    if(X.S.clip!=='sag'){ tool('sag'); await w(150);} const sg=check(d.id+' sag x='+(X.S.sagX||0).toFixed(2)+(d.clip==='sag'?' [cfg]':''));
    tool('sag'); await w(100); // off (or toggled)
    if(X.S.clip==='sag'){tool('sag'); await w(100);}
    if(!(X.S.clip&&X.S.clip.startsWith('ax:'))){ tool('ax'); await w(150);} const ax=check(d.id+' ax '+X.S.axLevel);
    res.push(sg,ax);
  }
  X.setMode('anat'); await w(200);
  for(let i=0;i<ALL_STEPS.length;i++){ if(ALL_STEPS[i].quiz!==undefined) continue; X.goStep(i); await w(150);
    if(X.S.clip!=='sag'){ tool('sag'); await w(100);} const sg=check('step'+i+' sag x='+(X.S.sagX||0).toFixed(2)+(ALL_STEPS[i].clip==='sag'?' [cfg]':'')); if(X.S.clip==='sag'){tool('sag'); await w(80);}
    if(!(X.S.clip&&X.S.clip.startsWith('ax:'))){ tool('ax'); await w(100);} const ax=check('step'+i+' ax '+X.S.axLevel);
    res.push(sg,ax);
  }
  return res.filter(x=>x.n&&(x.lost.length||/x=[1-9]|x=0\.[1-9]/.test(x.label))).map(x=>({l:x.label,n:x.n,k:x.kept,lost:x.lost.slice(0,6)}));
 });
 console.log(JSON.stringify(r,null,0).replace(/\},\{/g,'},\n{'),errs);
 await b.close();
 // perdas conhecidas e aceitas ficam em cortes.esperado.json (a posição x do plano não conta); qualquer mudança falha
 const got=r.map(x=>({l:x.l.replace(/ x=[\d.]+/,''),lost:x.lost})), f=__dirname+'/cortes.esperado.json';
 if(process.argv[2]==='--gravar'){fs.writeFileSync(f,JSON.stringify(got,null,1)); console.log('gravado'); return;}
 if(errs.length||JSON.stringify(got)!==JSON.stringify(JSON.parse(fs.readFileSync(f,'utf8')))){console.log('FALHA: perdas nos cortes mudaram (compare com tests/cortes.esperado.json)',errs); process.exit(1);}
 console.log('ok');})();
