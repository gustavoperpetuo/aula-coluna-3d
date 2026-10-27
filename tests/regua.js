const { chromium } = require('playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*supabase-js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 await p.goto('http://local.test/'); await p.waitForTimeout(2500);
 const r=await p.evaluate(async()=>{
  const w=ms=>new Promise(r=>setTimeout(r,ms)); const info=()=>document.querySelector('#info').hidden?'closed':'open';
  const vis=()=>[...document.querySelectorAll('#ruler button')].filter(b=>!b.hidden).map(b=>b.dataset.lv).join(',');
  const out={};
  out.anat=vis().split(',').length;
  __spine.openDz('hernia'); await w(300); out.hernia=vis();
  const L4=document.querySelector('#ruler button[data-lv=L4]'); L4.click(); await w(200); out.c1=info(); L4.click(); await w(200); out.c2=info();
  const s=document.querySelector('.see button'); s.click(); await w(200); out.s1=info(); s.click(); await w(200); out.s2=info();
  document.querySelector('#t-n').click(); await w(300); out.normal=vis();
  document.querySelector('#back').click(); await w(300); out.list=vis().split(',').length;
  __spine.openDz('mets'); await w(300); out.mets=vis(); out.sel=[...document.querySelectorAll('#lvsel option')].map(o=>o.textContent).join('|');
  return out;});
 console.log(JSON.stringify(r),errs);
 const want={anat:26,hernia:'L4,L5,S',c1:'open',c2:'closed',s1:'open',s2:'closed',normal:'L4,L5,S',list:26,mets:'T7,T10,L2',sel:'Níveis desta doença…|T7|T10|L2'};
 const bad=Object.keys(want).filter(k=>r[k]!==want[k]);
 if(bad.length||errs.length){console.log('FALHA:',bad.map(k=>k+'='+r[k]+' (esperado '+want[k]+')').join('; '),errs); await b.close(); process.exit(1);}
 await p.screenshot({path:__dirname+'/out/v_r.png',timeout:120000});
 await b.close();})();
