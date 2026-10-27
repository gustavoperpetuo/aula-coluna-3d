const { chromium } = require('playwright');
const fs=require('fs');
// login simulado: sessão do Supabase no localStorage (o supabase-js não vai à rede enquanto o token vale) e a tabela progresso respondida daqui
const SESSAO={access_token:'a.b.c',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r',user:{id:'u1',aud:'authenticated',email:'gustavo@salvadormedical.com.br',user_metadata:{full_name:'Gustavo Perpetuo'}}};
async function logado(p,{remoto,local}){
 p.gravado=[]; p.perguntas=[]; p.voz=[];
 // microfone simulado: getUserMedia devolve uma faixa falsa e o MediaRecorder entrega, ao parar, 0,5 s de WAV 44,1 kHz estéreo
 await p.addInitScript(()=>{
  const faixa={parada:false,stop(){this.parada=true}}; window.__faixa=faixa;
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>({getTracks:()=>[faixa]})}});
  window.MediaRecorder=class{start(){this.state='recording'} stop(){this.state='inactive';
   const n=22050,v=new DataView(new ArrayBuffer(44+n*4)); let o=0; const s=t=>{for(const c of t)v.setUint8(o++,c.charCodeAt(0))},u32=x=>{v.setUint32(o,x,true);o+=4},u16=x=>{v.setUint16(o,x,true);o+=2};
   s('RIFF');u32(36+n*4);s('WAVEfmt ');u32(16);u16(1);u16(2);u32(44100);u32(176400);u16(4);u16(16);s('data');u32(n*4);
   for(let i=0;i<n*2;i++)v.setInt16(44+i*2,Math.sin(i/20)*8000,true);
   this.ondataavailable({data:new Blob([v],{type:'audio/wav'})}); this.onstop();}};
 });
 await p.addInitScript(([s,l])=>{if(!sessionStorage.getItem('saiu')&&!sessionStorage.getItem('ja')){sessionStorage.setItem('ja','1'); localStorage.setItem('sb-ugvqhjyeekyufxuyvozc-auth-token',JSON.stringify(s)); localStorage.setItem('coluna3d.v1',JSON.stringify(l));}},[SESSAO,local]);
 const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
 await p.route(/supabase\.co\/rest\/v1\/progresso/,r=>{const q=r.request(); if(q.method()==='POST') p.gravado.push(q.postDataJSON()); r.fulfill({status:q.method()==='GET'?200:201,contentType:'application/json',headers:cors,body:q.method()==='GET'?JSON.stringify([{dados:remoto}]):''});});
 await p.route(/supabase\.co\/auth\/v1\/logout/,r=>r.fulfill({status:204,headers:cors}));
 await p.route('http://local.test/api/transcrever',r=>{const q=r.request(); p.voz.push({h:q.headers(),b:q.postDataBuffer()}); r.fulfill({contentType:'application/json',body:JSON.stringify({texto:'Onde fica o forame?'})});});
 await p.route('http://local.test/api/pergunta',r=>{p.perguntas.push(r.request().headers()); r.fulfill({contentType:'application/json',body:JSON.stringify({texto:'Certo.',restantes:29})});});
 await p.route('http://local.test/entrar',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist/entrar.html','utf8'),contentType:'text/html'}));
 await p.route('http://local.test/hub',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist/index.html','utf8'),contentType:'text/html'}));
}
async function page(b,W,H,block,conta){
 const p=await b.newPage({viewport:{width:W,height:H},hasTouch:W<500,isMobile:W<500});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|fonts/.test(m.text()))errs.push(m.text())});
 if(block) await p.route(/jsdelivr/,r=>r.abort()); else {
 await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*supabase-js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));}
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 if(conta) await logado(p,conta);
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
 await p.evaluate(()=>__spine.openDz('tlif')); await shot(p,'d6');
 // keyboard checks
 const kb=await p.evaluate(()=>{__spine.goStep(1); return 1;});
 await p.waitForTimeout(500); await p.focus('#next'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
 const afterNext=await p.evaluate(()=>document.activeElement.id+'|'+__spine.S.step);
 await p.evaluate(()=>document.activeElement.blur()); 
 let stops=[]; for(let i=0;i<14;i++){await p.keyboard.press('Tab'); stops.push(await p.evaluate(()=>{const e=document.activeElement;return (e.id||e.className||e.tagName)+':'+(e.textContent||'').trim().slice(0,18)}));}
 console.log('denis idx',denis,'afterNext',afterNext); console.log('tabs',stops.join(' | '));
 console.log('desk errs',p.errs); const bad=[]; if(p.errs.length) bad.push('erros no desktop'); if(afterNext!=='next|2') bad.push('Próximo pelo teclado: '+afterNext);
 // sem getUserMedia (aqui, origem sem HTTPS) o microfone não aparece
 if(!await p.evaluate(()=>document.querySelector('#askmic').hidden)) bad.push('microfone aparece sem getUserMedia');
 await p.close();
 // mobile
 p=await page(b,390,844);
 await shot(p,'m0');
 await p.evaluate(()=>{window.scrollTo(0,0); __spine.setFull(true)}); await shot(p,'m1');
 await p.evaluate(()=>{__spine.setFull(false); __spine.openDz('sten')}); await shot(p,'m2');
 await p.evaluate(()=>{window.scrollTo(0,0); __spine.openDz('tfesi')}); await shot(p,'m3');
 // a barra Anatomia/Doenças/Procedimentos tem de caber na largura do celular, sem rolagem lateral
 const fits=await p.evaluate(()=>document.querySelector('#m-proc').getBoundingClientRect().right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth); if(!fits) bad.push('barra de partes não cabe em 390 px');
 const tgt=await p.evaluate(()=>[...document.querySelectorAll('button,select,summary')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,(e.id||e.className)+':'+e.textContent.trim().slice(0,12)]}).filter(([w,h])=>h<36||w<36).slice(0,20));
 console.log('small targets',JSON.stringify(tgt)); console.log('mob errs',p.errs); if(p.errs.length) bad.push('erros no celular');
 await p.close();
 // failure
 p=await page(b,1440,900,true); await shot(p,'f0'); const txt=await p.evaluate(()=>document.querySelector('#scroll').innerText.slice(0,60)); console.log('fail errs',p.errs,txt);
 // sem a biblioteca 3D a aula em texto tem de continuar
 if(!/Capítulo 1/.test(txt)||!await p.evaluate(()=>!!document.querySelector('.fail'))) bad.push('aula sem 3D não abriu');
 // com login: nome e Sair cabem em 390 px, o progresso da conta soma ao local e volta para a conta, o tira-dúvidas manda o token.
 // Outro aparelho limpou o progresso em T: as marcas locais anteriores a T (9 e sten) não voltam, a posterior (5) fica
 const T=Date.now()-60000, emR=Object.fromEntries(['seen:0','seen:1','seen:2','seen:3','dzSeen:hernia'].map(k=>[k,T+500]));
 p=await page(b,390,844,false,{remoto:{seen:[0,1,2,3],dzSeen:['hernia'],quiz:{dz:{0:0}},zeradoEm:T,em:emR},local:{conta:'u1',seen:[9,5],dzSeen:['sten'],em:{'seen:9':T-1000,'seen:5':T+1000,'dzSeen:sten':T-1000}}});
 await p.waitForTimeout(1200);
 const visto=()=>p.evaluate(()=>{const l=JSON.parse(localStorage.getItem('coluna3d.v1'));return {seen:l.seen.sort((a,b)=>a-b).join(),dz:l.dzSeen.join(),quiz:JSON.stringify(l.quiz),z:l.zeradoEm,txt:document.querySelector('#progtxt').textContent}});
 const conta=await p.evaluate(()=>{const q=document.querySelector('#quem'),s=document.querySelector('#sair').getBoundingClientRect();return {nome:q.textContent,email:q.title,cabe:s.right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth,linha:s.top<document.querySelector('#m-anat').getBoundingClientRect().top,fab:!document.querySelector('#askfab').hidden}}), va=await visto();
 console.log('conta',JSON.stringify(conta),JSON.stringify(va),'gravado',JSON.stringify(p.gravado.at(-1)));
 if(conta.nome!=='Gustavo'||conta.email!==SESSAO.user.email) bad.push('nome no topo: '+conta.nome);
 if(!conta.cabe||!conta.linha) bad.push('conta não cabe na linha do título em 390 px');
 if(va.seen!=='0,1,2,3,5'||va.dz!=='hernia'||va.quiz!==JSON.stringify({dz:{0:0}})||va.z!==T||!/anatomia 5 de/.test(va.txt)) bad.push('soma com limpar de outro aparelho: '+JSON.stringify(va));
 const g=p.gravado.at(-1); if(!g||g.user_id!=='u1'||g.dados.seen.length!==5||g.dados.zeradoEm!==T) bad.push('progresso não voltou para a conta');
 if(!conta.fab) bad.push('tira-dúvidas sem botão com login');
 await p.evaluate(()=>{document.querySelector('#askfab').click(); document.querySelector('#askq').value='O que é?'; document.querySelector('#ask').requestSubmit();}); await p.waitForTimeout(600);
 const pq=p.perguntas[0]||{}, ph=await p.evaluate(()=>document.querySelector('#askq').placeholder);
 if(pq.authorization!=='Bearer a.b.c'||'x-senha' in pq||ph!=='Sua dúvida (restam 29 hoje)') bad.push('tira-dúvidas: '+pq.authorization+' | '+ph);
 // voz: microfone com 44 px e alcançável pelo Tab; gravar e parar manda WAV 16 kHz mono com o token, soma o texto ao campo, solta o microfone e não envia a pergunta
 const m0=await p.evaluate(()=>{const m=document.querySelector('#askmic'),r=m.getBoundingClientRect(),q=document.querySelector('#askq'); q.value='Dúvida:'; q.focus(); return {vis:!m.hidden&&!!m.offsetParent,w:r.width,h:r.height,label:m.getAttribute('aria-label')}});
 await p.keyboard.press('Tab'); const m1=await p.evaluate(()=>document.activeElement.id);
 await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 const m2=await p.evaluate(()=>({pressed:document.querySelector('#askmic').getAttribute('aria-pressed'),ph:document.querySelector('#askq').placeholder}));
 await p.evaluate(()=>document.querySelector('#askmic').click()); await p.waitForTimeout(800);
 const m3=await p.evaluate(()=>({val:document.querySelector('#askq').value,pressed:document.querySelector('#askmic').getAttribute('aria-pressed'),ph:document.querySelector('#askq').placeholder,solto:window.__faixa.parada,foco:document.activeElement.id}));
 const v0=p.voz[0]||{h:{}}, wv=v0.b&&{riff:v0.b.toString('latin1',0,4),canais:v0.b.readUInt16LE(22),taxa:v0.b.readUInt32LE(24),bytes:v0.b.length};
 console.log('voz',JSON.stringify({m0,m1,m2,m3,wv}));
 if(!m0.vis||m0.w<44||m0.h<44||m0.label!=='Gravar pergunta por voz'||m1!=='askmic') bad.push('microfone: '+JSON.stringify(m0)+' foco '+m1);
 if(m2.pressed!=='true'||!/^Gravando… 0:0\d$/.test(m2.ph)) bad.push('gravando: '+JSON.stringify(m2));
 if(m3.val!=='Dúvida: Onde fica o forame?'||m3.pressed!=='false'||m3.ph!=='Sua dúvida (restam 29 hoje)'||!m3.solto||m3.foco!=='askq') bad.push('voz: '+JSON.stringify(m3));
 if(v0.h.authorization!=='Bearer a.b.c'||v0.h['content-type']!=='audio/wav'||!wv||wv.riff!=='RIFF'||wv.canais!==1||wv.taxa!==16000||wv.bytes!==44+16000) bad.push('voz enviada: '+JSON.stringify(wv)+' '+v0.h.authorization);
 if(p.perguntas.length!==1) bad.push('a voz enviou a pergunta sozinha');
 // hub: nome e Sair no canto, sem rolagem lateral em 390 px
 await p.goto('http://local.test/hub'); await p.waitForTimeout(800);
 const hub=await p.evaluate(()=>({nome:document.querySelector('#quem').textContent,cabe:document.querySelector('#sair').getBoundingClientRect().right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth,acima:document.querySelector('#sair').getBoundingClientRect().bottom<=document.querySelector('h1').getBoundingClientRect().top}));
 if(hub.nome!=='Gustavo'||!hub.cabe||!hub.acima) bad.push('hub: '+JSON.stringify(hub));
 await p.evaluate(()=>{sessionStorage.setItem('saiu','1'); document.querySelector('#sair').click();}); await p.waitForURL('http://local.test/entrar'); await p.waitForTimeout(800);
 if(await p.evaluate(()=>!!localStorage.getItem('sb-ugvqhjyeekyufxuyvozc-auth-token')||document.querySelector('#google').disabled)) bad.push('Sair não limpou a sessão');
 console.log('conta errs',p.errs); if(p.errs.length) bad.push('erros com login');
 await p.close();
 // este aparelho limpou em T e a conta ainda tem marcas de antes (0 e 1): não voltam; a de depois (2) fica
 p=await page(b,1440,900,false,{remoto:{seen:[0,1,2],em:{'seen:0':T-5000,'seen:1':T-5000,'seen:2':T+2000}},local:{conta:'u1',zeradoEm:T,seen:[7],em:{'seen:7':T+1000}}});
 await p.waitForTimeout(1200); const vb=await visto(); if(vb.seen!=='0,2,7'||vb.z!==T) bad.push('soma com limpar deste aparelho: '+JSON.stringify(vb)); // 0 volta por ser o passo aberto
 if(p.errs.length) bad.push('erros com login (desktop)'); await p.close();
 // navegador compartilhado: o progresso local é de outra conta e não soma nesta
 p=await page(b,1440,900,false,{remoto:{seen:[0,1,2,3],dzSeen:['hernia']},local:{conta:'outra',seen:[9],dzSeen:['sten']}});
 await p.waitForTimeout(1200); const vc=await visto(); if(vc.seen!=='0,1,2,3'||vc.dz!=='hernia') bad.push('navegador compartilhado: '+JSON.stringify(vc));
 console.log('soma',JSON.stringify(vb),JSON.stringify(vc)); await p.close();
 await b.close();
 if(bad.length){console.log('FALHA:',bad.join('; ')); process.exit(1);} console.log('ok');})();
