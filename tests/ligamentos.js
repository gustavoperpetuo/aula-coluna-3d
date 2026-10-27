// LLA e LLP nunca podem ser atravessados por corpo vertebral (S1 incluído), sacro (só o LLA) ou disco, na coluna normal, em todas as doenças e procedimentos
// e nas variantes da hérnia (posição x forma).
// Raios a cada 0,02 do eixo da coluna (C2 a S1), do centro para fora; falha se osso ou disco ocupar a espessura da faixa.
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
 const res=await p.evaluate(async()=>{
  const sp=__spine, w=ms=>new Promise(r=>setTimeout(r,ms)), out=[];
  const HV=['central','pl','foram','extra'].flatMap(z=>['prot','ext','seq'].map(m=>'hernia.'+z+'.'+m));
  for(const id of [null,...DZ.map(d=>d.id),...PROC.map(d=>d.id),...HV]){
   if(id){const [d,z,m]=id.split('.'); sp.openDz(d); if(z){document.querySelector(`[data-hv="morph.${m}"]`).click(); document.querySelector(`[data-hv="zone.${z}"]`).click();} await w(300);}
   const M=sp.model; M.root.updateMatrixWorld(true);
   const bodies=M.meshes.filter(m=>/^((C|T|L|S)\d+\.body|sacrum|disc\.)/.test(m.userData.key)&&['bone','disc','discDeg','discInf'].includes(m.userData.kind));
   const ligs=M.meshes.filter(m=>/^(ALL|PLL)\./.test(m.userData.key));
   const saved=new Map(); [...bodies,...ligs].forEach(m=>{saved.set(m,m.material); m.material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});});
   const ray=new THREE.Raycaster(); let worst=0, where='';
   for(let u=M.KI.C2; u<=M.KI.S1; u+=0.02){
    const s=M.spineAt(u), dirs=[];
    for(const ph of [-0.5,-0.25,0,0.25,0.5]) dirs.push(['ALL',new THREE.Vector3(),new THREE.Vector3(Math.sin(ph),0,Math.cos(ph))]);
    for(const x of [-0.2,0,0.2]) dirs.push(['PLL',new THREE.Vector3(x,0,0),new THREE.Vector3(0,0,-1)]);
    for(const [L,o,d] of dirs){
     ray.set(s.p.clone().add(o.applyQuaternion(s.q)),d.applyQuaternion(s.q)); ray.far=8;
     const lh=ray.intersectObjects(ligs.filter(m=>m.userData.key.startsWith(L)),false); if(!lh.length) continue;
     // o canal sacral não é oco no modelo: o LLP corre dentro do bloco do sacro por construção
     const bh=ray.intersectObjects(L==='PLL'?bodies.filter(m=>m.userData.key!=='sacrum'):bodies,false), l0=lh[0].distance, l1=lh.length>1?lh[1].distance:l0+0.1;
     // blocos de osso/disco separados por vão maior que 0,6; mede quanto cada bloco ocupa da espessura da faixa
     for(let a=0;a<bh.length;){const st=bh[a].distance, o2=bh[a].object; let en=st; a++; while(a<bh.length&&bh[a].distance-en<0.6) en=bh[a++].distance;
      const ov=Math.min(en,l1)-Math.max(st,l0); if(ov>worst){worst=ov; where=L+' u='+u.toFixed(2)+' '+o2.userData.key;}}
    }
   }
   saved.forEach((mat,m)=>m.material=mat);
   out.push([id||'normal',+worst.toFixed(3),where]);
  }
  return out;});
 const bad=res.filter(([,wv])=>wv>0.01);
 console.log(bad.length?'FALHA: osso ou disco dentro do LLA/LLP':'ok: nenhum osso ou disco dentro do LLA/LLP', JSON.stringify(bad.length?bad:res.map(r=>r[0]+' '+r[1])), errs);
 await b.close();
 if(bad.length||errs.length) process.exit(1);
})();
