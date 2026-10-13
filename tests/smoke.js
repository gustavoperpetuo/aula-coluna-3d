const { chromium } = require('playwright');
const fs=require('fs');
async function page(b,W,H,block){
 const p=await b.newPage({viewport:{width:W,height:H},hasTouch:W<500,isMobile:W<500});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|fonts/.test(m.text()))errs.push(m.text())});
 if(block) await p.route(/cdnjs.*three.min.js|jsdelivr/,r=>r.abort()); else {
 await p.route(/cdnjs.*three.min.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript'}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript'}));}
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}</style></head><body>'+html+'</body></html>',contentType:'text/html'}));
 await p.goto('http://local.test/'); await p.waitForTimeout(2500); p.errs=errs; return p;}
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const shot=async(p,name)=>{await p.waitForTimeout(1700); await p.screenshot({path:__dirname+'/out/v_'+name+'.png',timeout:120000});};
 // desktop
 let p=await page(b,1440,900);
 await shot(p,'d0');
 const denis=await p.evaluate(()=>{const i=ALL_STEPS.findIndex(s=>s.extra==='denis'); __spine.goStep(i); return i;}); await shot(p,'d1');
 await p.evaluate(()=>{__spine.goStep(ALL_STEPS.findIndex(s=>s.title==='Ligamento amarelo')); document.querySelector('#ttog').click();}); await shot(p,'d2');
 await p.evaluate(()=>{__spine.goStep(6); setTimeout(()=>document.querySelector('.see button').click(),1200)}); await p.waitForTimeout(800); await shot(p,'d3');
 await p.evaluate(()=>__spine.openDz('hernia')); await shot(p,'d4');
 await p.evaluate(()=>document.querySelector('#t-n').click()); await shot(p,'d5');
 // keyboard checks
 const kb=await p.evaluate(()=>{__spine.goStep(1); return 1;});
 await p.waitForTimeout(500); await p.focus('#next'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
 const afterNext=await p.evaluate(()=>document.activeElement.id+'|'+__spine.S.step);
 await p.evaluate(()=>document.activeElement.blur()); 
 let stops=[]; for(let i=0;i<14;i++){await p.keyboard.press('Tab'); stops.push(await p.evaluate(()=>{const e=document.activeElement;return (e.id||e.className||e.tagName)+':'+(e.textContent||'').trim().slice(0,18)}));}
 console.log('denis idx',denis,'afterNext',afterNext); console.log('tabs',stops.join(' | '));
 console.log('desk errs',p.errs);
 await p.close();
 // mobile
 p=await page(b,390,844);
 await shot(p,'m0');
 await p.evaluate(()=>{window.scrollTo(0,0); __spine.setFull(true)}); await shot(p,'m1');
 await p.evaluate(()=>{__spine.setFull(false); __spine.openDz('sten')}); await shot(p,'m2');
 const tgt=await p.evaluate(()=>[...document.querySelectorAll('button,select,summary')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,(e.id||e.className)+':'+e.textContent.trim().slice(0,12)]}).filter(([w,h])=>h<36||w<36).slice(0,20));
 console.log('small targets',JSON.stringify(tgt)); console.log('mob errs',p.errs);
 await p.close();
 // failure
 p=await page(b,1440,900,true); await shot(p,'f0'); console.log('fail errs',p.errs, await p.evaluate(()=>document.querySelector('#scroll').innerText.slice(0,60)));
 await b.close();})();
