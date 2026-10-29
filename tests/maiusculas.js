// Regra do dono: no texto exibido, depois de "." ou ";" e espaço, a palavra seguinte começa com maiúscula.
const { chromium } = require('playwright');
const fs=require('fs');
const RX=/[.;]\s+[a-zà-öø-ÿ]/g;
// exceções: abreviação cujo ponto não fecha frase, ou termo técnico que se escreve com minúscula
const OK=[];
const hits=(txt,where)=>{const out=[];for(const m of txt.matchAll(RX)){const ctx=txt.slice(Math.max(0,m.index-30),m.index+30).replace(/\s+/g,' ');if(!OK.some(r=>r.test(txt.slice(Math.max(0,m.index-12),m.index+20))))out.push(where+': ...'+ctx+'...');}return out;};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*supabase-js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*niivue\.umd\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@niivue/niivue/dist/niivue.umd.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/local\.test\/rm\//,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist'+new URL(r.request().url()).pathname),contentType:'application/octet-stream'}));
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 await p.goto('http://local.test/'); await p.waitForTimeout(2500);
 const texts=await p.evaluate(async()=>{
  const w=ms=>new Promise(r=>setTimeout(r,ms)); const out=[];
  const walk=(v,k)=>{if(typeof v==='string')out.push([k,v]);else if(Array.isArray(v))v.forEach((x,i)=>walk(x,k+'['+i+']'));else if(v&&typeof v==='object'&&!v.isVector3)for(const [kk,x] of Object.entries(v))walk(x,k+'.'+kk);};
  walk({CHAPTERS,STEPS,QUIZ,ALL_STEPS,INFO,ROOTFN,LEVEL_NOTES,DZ_CATS,DZ,DZ_OTHERS,DZ_QUIZ,PROC_CATS,PROC,RM_GROUPS,RM_CRED,RM_TRACKS},'dados');
  const dom=where=>{out.push([where,document.body.innerText]);document.querySelectorAll('[title],[aria-label],[alt],[placeholder]').forEach(e=>['title','aria-label','alt','placeholder'].forEach(a=>e.hasAttribute(a)&&out.push([where+' @'+a,e.getAttribute(a)])));};
  const ruler=async where=>{for(const bt of document.querySelectorAll('#ruler button')){if(bt.hidden)continue;bt.click();await w(30);dom(where+' régua '+bt.dataset.lv);}};
  for(let i=0;i<ALL_STEPS.length;i++){__spine.goStep(i);await w(30);dom('passo '+i);}
  await ruler('anatomia');
  for(const d of DZ){__spine.openDz(d.id);await w(30);dom('doença '+d.id);document.querySelector('#t-n').click();await w(30);dom('doença '+d.id+' normal');}
  __spine.setMode('dz');await w(30);dom('lista de doenças');
  for(const d of PROC){__spine.openDz(d.id);await w(30);dom('procedimento '+d.id);}
  __spine.setMode('proc');await w(30);dom('lista de procedimentos');
  // ressonância: cada passo, e a resposta do teste (certa, errada e fora) como aparece depois do clique.
  // SPIDER: valor da máscara sob a mira; RSNA: ponto clicado no axial (certo, outro ponto marcado e longe de todos)
  for(let k=0;k<__spine.RM_STEPS.length;k++){__spine.goRm(k);await w(30);dom('ressonância '+k);const R=__spine.RM_STEPS[k],st=R.st;if(st.test){await __spine.RM.q;
   if(R.ex.ax){const a=__spine.RM.nvAx,outro=Object.keys(R.ex.at).find(id=>!st.test.ok.includes(id)&&!id.startsWith('meio'));for(const mm of [R.ex.at[st.test.ok[0]],R.ex.at[outro],[90,90,0]]){a.onLocationChange({mm});await w(30);dom('ressonância '+k+' clique '+mm);}}
   else for(const v of [st.test.ok[0],100,0]){__spine.RM.nv.onLocationChange({values:[{value:0},{value:v}]});await w(30);dom('ressonância '+k+' clique '+v);}}}
  return out;});
 const bad=[...new Set(texts.flatMap(([k,v])=>hits(v,k)))];
 const home=fs.readFileSync(__dirname+'/../dist/index.html','utf8').replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g,'');
 const homeTxt=home.replace(/<[^>]*\s(title|aria-label|alt|placeholder)="([^"]*)"[^>]*>/g,' $2 ').replace(/<[^>]+>/g,' ');
 bad.push(...hits(homeTxt,'dist/index.html'));
 // o mesmo trecho aparece em vários estados; agrupa pelo contexto
 const uniq=new Map(); bad.forEach(s=>{const c=s.slice(s.indexOf(': ...')+2);if(!uniq.has(c))uniq.set(c,s);});
 console.log(texts.length,'textos;',uniq.size,'ocorrências',errs);
 await b.close();
 if(uniq.size||errs.length){console.log('FALHA: minúscula depois de "." ou ";"\n'+[...uniq.values()].join('\n'),errs);process.exit(1);}
})();
