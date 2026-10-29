const { chromium } = require('playwright');
const fs=require('fs');
// login simulado: sessão do Supabase no localStorage (o supabase-js não vai à rede enquanto o token vale) e a tabela progresso respondida daqui
const SESSAO={access_token:'a.b.c',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r',user:{id:'u1',aud:'authenticated',email:'gustavo@salvadormedical.com.br',user_metadata:{full_name:'Gustavo Perpetuo'}}};
async function logado(p,{remoto,local}){
 p.gravado=[]; p.perguntas=[]; p.voz=[];
 // microfone simulado: getUserMedia devolve uma faixa de verdade, um tom de 440 Hz do Web Audio, e marca quando ela é solta
 await p.addInitScript(()=>{
  const faixa={parada:false}; window.__faixa=faixa;
  Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{const c=new AudioContext(),o=c.createOscillator(),d=c.createMediaStreamDestination(); o.connect(d); o.start(); await c.resume(); const tr=d.stream.getTracks()[0],st=tr.stop.bind(tr); tr.stop=()=>{faixa.parada=true; st()}; return d.stream;}}});
 });
 await p.addInitScript(([s,l])=>{if(!sessionStorage.getItem('saiu')&&!sessionStorage.getItem('ja')){sessionStorage.setItem('ja','1'); localStorage.setItem('sb-ugvqhjyeekyufxuyvozc-auth-token',JSON.stringify(s)); localStorage.setItem('coluna3d.v1',JSON.stringify(l));}},[SESSAO,local]);
 const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
 await p.route(/supabase\.co\/rest\/v1\/progresso/,r=>{const q=r.request(); if(q.method()==='POST') p.gravado.push(q.postDataJSON()); r.fulfill({status:q.method()==='GET'?200:201,contentType:'application/json',headers:cors,body:q.method()==='GET'?JSON.stringify([{dados:remoto}]):''});});
 await p.route(/supabase\.co\/auth\/v1\/logout/,r=>r.fulfill({status:204,headers:cors}));
 await p.route(/supabase\.co\/rest\/v1\/rpc\/eh_admin/,r=>r.fulfill({contentType:'application/json',headers:cors,body:'false'})); // link do painel no hub: tests/admin.js
 await p.route('http://local.test/api/transcrever',r=>{const q=r.request(); p.voz.push({h:q.headers(),b:q.postDataBuffer()}); r.fulfill({contentType:'application/json',body:JSON.stringify({texto:'Onde fica o forame?'})});});
 await p.route('http://local.test/api/pergunta',r=>{p.perguntas.push(r.request().headers()); r.fulfill({contentType:'application/json',body:JSON.stringify({texto:'Certo.',restantes:29})});});
 await p.route('http://local.test/entrar',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist/entrar.html','utf8'),contentType:'text/html'}));
 await p.route('http://local.test/hub',r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist/index.html','utf8'),contentType:'text/html'}));
}
// ressonância: posição na tela (px CSS) de um ponto em mm, no quadro pedido (0 axial, 2 sagital), no canvas principal ou no do axial da RSNA (ax).
// shortcut: busca em grade com canvasPos2frac (frac2canvasPosWithTile devolve null perto da borda de baixo); só para o teste
const rmXY=(p,mm,st,ax)=>p.evaluate(([mm,st,ax])=>{const nv=ax?__spine.RM.nvAx:__spine.RM.nv,f=nv.mm2frac(mm,0,true),s=nv.screenSlices.find(t=>t.axCorSag===st),[l0,tp,w0,h]=s.leftTopWidthHeight,l=Math.min(l0,l0+w0),w=Math.abs(w0),ax2=st===2?[1,2]:[0,1];
 let best=null,bd=1e9; for(let y=tp;y<tp+h;y+=2)for(let x=l;x<l+w;x+=2){const g=nv.canvasPos2frac([x,y]); if(g[0]<0)continue; const d=Math.hypot(g[ax2[0]]-f[ax2[0]],g[ax2[1]]-f[ax2[1]]); if(d<bd){bd=d;best=[x,y];}}
 const r=nv.canvas.getBoundingClientRect(),k=nv.uiData.dpr||devicePixelRatio; return best&&{x:r.left+best[0]/k,y:r.top+best[1]/k};},[mm,st,!!ax]);
// pixels da imagem: lidos logo depois de desenhar, antes de o navegador compor o quadro (o WebGL não guarda o buffer)
const rmPixels=p=>p.evaluate(()=>{const nv=__spine.RM.nv,gl=nv.gl; nv.drawScene(); const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,px=new Uint8Array(w*h*4); gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,px); let n=0; for(let i=0;i<px.length;i+=16)if(px[i]+px[i+1]+px[i+2]>120)n++; return n/(px.length/16);});
const rmPronto=(p,want)=>p.waitForFunction(w=>__spine.RM.loaded===w,want,{timeout:60000});
async function page(b,W,H,block,conta){
 const p=await b.newPage({viewport:{width:W,height:H},hasTouch:W<500,isMobile:W<500});
 const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|fonts/.test(m.text()))errs.push(m.text())});
 if(block) await p.route(/jsdelivr/,r=>r.abort()); else {
 await p.route(/three\.min\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/build/three.min.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*OrbitControls.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/three/examples/js/controls/OrbitControls.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/jsdelivr.*supabase-js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 // NiiVue: o mesmo arquivo do jsDelivr, do pacote npm fixo em 0.69.0 (a integridade do <script> confere o hash); casos de dist/rm/
 await p.route(/jsdelivr.*niivue\.umd\.js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@niivue/niivue/dist/niivue.umd.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/local\.test\/rm\//,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist'+new URL(r.request().url()).pathname),contentType:'application/octet-stream'}));}
 await p.route(/fonts\./,r=>r.abort());
 const html=fs.readFileSync(__dirname+'/../dist/coluna-vertebral.html','utf8');
 await p.route('http://local.test/',r=>r.fulfill({body:html,contentType:'text/html'}));
 if(conta) await logado(p,conta);
 await p.goto('http://local.test/'); await p.waitForTimeout(2500); p.errs=errs; return p;}
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
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
 // ressonância no desktop: botão do modo, as duas partes com as trilhas, passos, imagem na tela, arquivos e links de volta,
 // teste do SPIDER (clique num disco: nome, painel e 3D) e teste da RSNA (ponto do radiologista, os dois quadros juntos, convenção radiológica)
 p=await page(b,1440,900);
 // partes dentro da trilha: grade 2 por 2 em 232 px, uma por linha em 196 px. A largura do texto só se mede com a Source Sans 3,
 // que o teste não baixa; com ela, e com a fonte do sistema em 13 px, Procedimentos cabe na meia linha de 232 px (medido à parte)
 const cabeModos=cols=>p.evaluate(cols=>{const bs=[...document.querySelectorAll('.modes button')].map(e=>e.getBoundingClientRect()),s=document.querySelector('.modes').getBoundingClientRect(); return bs.every(r=>r.left>=s.left&&r.right<=s.right+0.5)&&new Set(bs.map(r=>r.top)).size===4/cols;},cols);
 if(!await cabeModos(2)) bad.push('as 4 partes não cabem na trilha em 1440');
 await p.click('#m-rm'); await rmPronto(p,'spider5/t2');
 // Contornos começam desligados em todo passo; Contar as vértebras (contornos: true) os liga, e o passo seguinte volta a desligar
 const cont=async id=>{if(id) await p.evaluate(id=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id===id)),id); await p.waitForTimeout(200); return p.evaluate(()=>__spine.RM.mask+'|'+document.querySelector('[data-rm="mask"]').getAttribute('aria-pressed')+'|'+__spine.RM.nv.volumes[1].opacity);};
 const cs=[await cont(),await cont('base.contar'),await cont('base.disco'),await cont('base.sinal')];
 if(cs.join()!=='false|false|0,true|true|0.4,false|false|0,false|false|0'||await p.evaluate(()=>__spine.RM_STEPS.filter(r=>r.st.contornos).map(r=>r.id).join())!=='base.contar') bad.push('ressonância, Contornos por passo: '+cs.join());
 // axial montado do SPIDER só nos passos com axial: true; sem ele, o sagital fica no meio do quadro inteiro, e o canvas não guarda tamanho velho.
 // Todo teste do SPIDER responde só no sagital, e nenhum texto pede o axial no teste
 const lay=async id=>{await p.evaluate(id=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id===id)),id); await rmPronto(p,'spider5/t2'); await p.waitForTimeout(200);
  return p.evaluate(()=>{const nv=__spine.RM.nv,c=nv.canvas,k=nv.uiData.dpr||1,s=nv.screenSlices,g=s.find(x=>x.axCorSag===2).leftTopWidthHeight;
   return {t:s.map(x=>x.axCorSag).join(),cap:getComputedStyle(document.querySelector('#cap-ax')).display,meio:Math.round((g[0]+g[2]/2)/c.width*100),tam:c.width===Math.round(c.clientWidth*k)&&c.height===Math.round(c.clientHeight*k)};});};
 const ly=[await lay('base.disco'),await lay('base.teste'),await lay('base.sinal')];
 const semSag=await p.evaluate(()=>__spine.RM_STEPS.filter(r=>r.st.test&&!r.ex.ax&&!r.st.test.sag).map(r=>r.id).concat(__spine.RM_STEPS.filter(r=>r.st.p.some(x=>/no sagital ou no axial/.test(x))).map(r=>r.id)));
 if([ly[0],ly[2]].some(l=>l.t!=='2'||l.cap!=='none'||!(l.meio>45&&l.meio<55)||!l.tam)||ly[1].t!=='2,0'||ly[1].cap==='none'||!(ly[1].meio<35)||!ly[1].tam||semSag.length) bad.push('ressonância, axial por passo: '+JSON.stringify({ly,semSag}));
 const r0=await p.evaluate(()=>({on:document.querySelector('#m-rm').getAttribute('aria-pressed'),grupos:[...document.querySelectorAll('#chap .rmgrp')].filter(e=>e.offsetParent).map(e=>e.textContent),trilhas:[...document.querySelectorAll('#chap > button')].map(e=>e.textContent),passos:[...document.querySelectorAll('#chap .rmsteps button')].filter(e=>e.offsetParent).length,h:document.querySelector('#railh').textContent,ey:document.querySelector('.eyebrow').textContent,cred:document.querySelector('.rmcred').textContent,lib:document.querySelectorAll('script[src*="niivue@0.69.0"][integrity^="sha384-"]').length,inset:(r=>[Math.round(r.width),Math.round(r.height)])(document.querySelector('#view').getBoundingClientRect()),
  // trilha com o id de uma doença tem o nome dela em Doenças
  nomes:RM_TRACKS.filter(t=>DZ.some(d=>d.id===t.id)).map(t=>t.name===DZ.find(d=>d.id===t.id).name?t.id:'X'+t.id).join()}));
 console.log('rm',JSON.stringify(r0));
 if(r0.on!=='true'||r0.grupos.join('|')!=='Como ler a ressonância|Doenças na ressonância'||r0.trilhas.join('|')!=='Exame normal|Discopatia degenerativa|Discopatia degenerativa: Modic|Hérnia de disco lombar|Estenose do canal lombar|Espondilolistese degenerativa|Nódulo de Schmorl'||r0.nomes!=='ddd,hernia,sten,dspondy'||r0.passos!==9||r0.h!=='Trilhas'||r0.ey!=='Exame normal, passo 1 de 9') bad.push('ressonância, lista: '+JSON.stringify(r0));
 if(r0.lib!==1||r0.inset.join()!=='200,214'||!/SPIDER, CC BY 4\.0/.test(r0.cred)) bad.push('ressonância, NiiVue, encarte ou crédito: '+JSON.stringify(r0));
 const px=await rmPixels(p); if(!(px>0.05)) bad.push('ressonância sem imagem: '+px);
 // todo arquivo de todo exame existe em dist/rm, e todo passo acha o exame, o ponto da mira e as respostas do teste
 const arq=await p.evaluate(()=>({f:Object.values(RM_EXAMS).flatMap(e=>Object.values(e.seqs).flat().concat(e.ax||[]).map(f=>'rm/'+e.dir+'/'+f+'.nii.gz')),
  sem:__spine.RM_STEPS.filter(r=>!r.ex||!r.ex.at[r.st.at]||(r.st.test&&!r.st.test.ok.length)||(r.st.test&&r.ex.ax&&r.st.test.ok.some(k=>!r.ex.at[k]))).map(r=>r.id),n:__spine.RM_STEPS.length,ids:RM_IDS.length,unicos:new Set(RM_IDS).size}));
 const falta=[...new Set(arq.f)].filter(f=>!fs.existsSync(__dirname+'/../dist/'+f));
 if(falta.length||arq.sem.length||arq.n!==arq.ids||arq.ids!==arq.unicos||fs.existsSync(__dirname+'/../dist/rm/237')) bad.push('ressonância, exames: '+JSON.stringify({falta,sem:arq.sem,n:arq.n,ids:arq.ids,unicos:arq.unicos}));
 await p.click('#next'); await p.waitForTimeout(200);
 if(await p.evaluate(()=>document.querySelector('.eyebrow').textContent+'|'+document.querySelector('#chap .rmsteps [aria-current="step"]').textContent)!=='Exame normal, passo 2 de 9|2Orientação no sagital') bad.push('ressonância: Próximo não andou');
 await p.click('#chap > button:nth-of-type(2)'); await rmPronto(p,'spider45/t2');
 if(!await p.evaluate(()=>document.querySelector('.eyebrow').textContent==='Discopatia degenerativa, passo 1 de 4'&&!!document.querySelector('[data-rm="space"]'))) bad.push('ressonância: trilha da discopatia não abriu com o T2 alta resolução');
 // texto do passo: '- ' vira lista e **x** negrito, sem marcação crua na tela; todo link de volta acha a doença ou o passo de Anatomia
 const fmt=await p.evaluate(()=>({li:document.querySelectorAll('.scroll ul.rml li').length,b:document.querySelectorAll('.scroll ul.rml li strong').length,cru:/\*\*|^- /m.test(document.querySelector('.scroll').innerText),ver:document.querySelector('#rmver')&&document.querySelector('#rmver').textContent,
  quebrado:__spine.RM_STEPS.filter(r=>{const v=r.st.ver||r.t.ver; return v&&!(v[0]==='dz'?DZ.some(d=>d.id===v[1]):ALL_STEPS.some(s=>s.title===v[1]));}).map(r=>r.id)}));
 if(fmt.li<5||fmt.b!==fmt.li||fmt.cru||fmt.ver!=='Rever em Doenças: Discopatia degenerativa'||fmt.quebrado.length) bad.push('ressonância, formato do texto: '+JSON.stringify(fmt));
 await p.click('#rmver'); await p.waitForTimeout(200);
 if(!await p.evaluate(()=>__spine.S.mode==='dz'&&__spine.S.dz==='ddd')) bad.push('ressonância: link de volta não abriu a doença');
 await p.click('#m-rm'); await rmPronto(p,'spider45/t2');
 // teste da RSNA: recesso direito em L4-L5 no axial adquirido. Certo a até 6 mm do ponto do radiologista, errado no outro recesso e fora dos pontos;
 // o sagital vai junto ao ponto clicado, e no axial a direita do paciente fica à esquerda da tela
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='sten.teste'))); await rmPronto(p,'rsna3489738948/t2'); await p.waitForFunction(()=>__spine.RM.axLoaded==='rsna3489738948'&&!document.querySelector('#rmmsg').textContent,null,{timeout:60000}); await p.waitForTimeout(300);
 const at=await p.evaluate(()=>RM_EXAMS.rsna3489738948.at), sub=async(id,dx=0)=>{const xy=await rmXY(p,at[id],0,true); await p.mouse.click(xy.x+dx,xy.y); await p.waitForTimeout(300);
  return p.evaluate(()=>({box:document.querySelector('#rmpick').innerText,res:document.querySelector('#rmres').className+'|'+document.querySelector('#rmres').innerText,sag:Array.from(__spine.RM.nv.frac2mm(__spine.RM.nv.scene.crosshairPos,0,true)).slice(0,3),ax:Array.from(__spine.RM.nvAx.frac2mm(__spine.RM.nvAx.scene.crosshairPos,0,true)).slice(0,3)}));};
 const lado=await p.evaluate(()=>({rad:__spine.RM.nv.opts.isRadiologicalConvention&&__spine.RM.nvAx.opts.isRadiologicalConvention,mask:!!document.querySelector('[data-rm="mask"],[data-rm="names"]'),cred:document.querySelector('.rmcred').textContent,ax:getComputedStyle(document.querySelector('#rmax')).display}));
 const xD=(await rmXY(p,at['subD.L4-L5'],0,true)).x, xE=(await rmXY(p,at['subE.L4-L5'],0,true)).x;
 const s1=await sub('subD.L4-L5',3), s2=await sub('subE.L4-L5'), s3=await sub('subD.L4-L5',-60);
 console.log('rm rsna',JSON.stringify({lado,xD,xE,s1,s2,s3}));
 if(!lado.rad||!(xD<xE)||lado.mask||lado.ax!=='block'||!/^Imagens: RSNA Lumbar Spine Degenerative Classification Dataset \(LumbarDISC\), Radiological Society of North America, doi 10\.1148\/dataset\.lsdd\.2025\.$/.test(lado.cred)) bad.push('ressonância RSNA, convenção, Contornos ou crédito: '+JSON.stringify(lado)+' '+xD+' '+xE);
 if(!/^Você clicou: Recesso lateral direito, L4-L5\.$/.test(s1.box)||!/^rmres ok\|Certo\. Recesso lateral direito, L4-L5\. Graduação da RSNA neste ponto: estenose grave\.$/.test(s1.res)||s1.sag.some((v,i)=>Math.abs(v-s1.ax[i])>0.5)||Math.hypot(...s1.ax.map((v,i)=>v-at['subD.L4-L5'][i]))>6) bad.push('ressonância RSNA, clique certo: '+JSON.stringify(s1));
 if(!/^rmres no\|Não\. Recesso lateral esquerdo, L4-L5 não é a resposta\./.test(s2.res)) bad.push('ressonância RSNA, clique errado: '+JSON.stringify(s2));
 if(!/^Você clicou: Fora do ponto marcado\.$/.test(s3.box)||!/^rmres no\|Não\. O clique ficou fora dos pontos marcados pelo radiologista\./.test(s3.res)) bad.push('ressonância RSNA, clique fora: '+JSON.stringify(s3));
 // teste do SPIDER: disco L4-L5 do exame normal, rótulo 202, caixa Você clicou e o disco aceso no 3D; o axial montado também em convenção radiológica
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.teste'))); await rmPronto(p,'spider5/t2'); await p.waitForTimeout(300);
 const clica=async(lbl)=>{const mm=await p.evaluate(l=>RM_EXAMS.spider5.at[l],lbl),xy=await rmXY(p,mm,2); await p.mouse.click(xy.x,xy.y); await p.waitForTimeout(300);
  return p.evaluate(()=>({v:__spine.RM.res,key:__spine.RM.pick&&__spine.RM.pick.key,box:document.querySelector('#rmpick').innerText,res:document.querySelector('#rmres').className+'|'+document.querySelector('#rmres').innerText,sel:__spine.S.sel?[...new Set([...__spine.S.sel].map(m=>m.userData.key))].join():'',ax:getComputedStyle(document.querySelector('#rmax')).display,rad:__spine.RM.nv.opts.isRadiologicalConvention}));};
 const k1=await clica(202), k2=await clica(201);
 console.log('rm cliques',JSON.stringify([k1,k2]));
 if(k1.v!==202||k1.key!=='disc.L4-L5'||!/^Você clicou: Disco L4-L5\. Ele aparece aceso no 3D\./.test(k1.box)||k1.sel!=='disc.L4-L5'||!/^rmres ok\|Certo\. Disco L4-L5\./.test(k1.res)||k1.ax!=='none'||!k1.rad) bad.push('ressonância, clique certo: '+JSON.stringify(k1));
 if(k2.v!==201||k2.sel!=='disc.L5-S1'||!/^rmres no\|Não\. Disco L5-S1 não é a resposta\./.test(k2.res)) bad.push('ressonância, clique errado: '+JSON.stringify(k2));
 // Abrir no 3D grande: Anatomia com o mesmo disco selecionado
 await p.click('#rmopen'); await p.waitForTimeout(300);
 const big=await p.evaluate(()=>({m:__spine.S.mode,k:__spine.S.selKey,card:!document.querySelector('#info').hidden,inset:document.querySelector('#view').getBoundingClientRect().width>400}));
 if(big.m!=='anat'||big.k!=='disc.L5-S1'||!big.card||!big.inset) bad.push('Abrir no 3D grande: '+JSON.stringify(big));
 // teste da trilha de base: só o sagital responde (clique no axial montado apaga a resposta) e a resposta certa não cita o Pfirrmann
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.teste'))); await rmPronto(p,'spider5/t2'); await p.waitForTimeout(300);
 const j1=await clica(202), xa=await rmXY(p,await p.evaluate(()=>RM_EXAMS.spider5.at[202]),0); await p.mouse.click(xa.x,xa.y); await p.waitForTimeout(300);
 const j2=await p.evaluate(()=>({v:__spine.RM.res,hid:document.querySelector('#rmres').hidden,txt:document.querySelector('.scroll').innerText}));
 if(!/^rmres ok\|Certo\. Disco L4-L5\. Graduação do SPIDER neste disco: disco normal, com abaulamento\.$/.test(j1.res)||/Pfirrmann/.test(j1.res)||j2.v!==null||!j2.hid||/no axial\. A resposta|ou no axial/.test(j2.txt)) bad.push('ressonância, teste só no sagital: '+JSON.stringify([j1,j2]));
 // passo novo abre com a caixa Você clicou vazia e nada aceso no 3D
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.canal'))); await p.waitForTimeout(200);
 const limpa=await p.evaluate(()=>({hid:document.querySelector('#rmpick').hidden,pick:__spine.RM.pick,sel:__spine.S.sel}));
 if(!limpa.hid||limpa.pick||limpa.sel) bad.push('ressonância, caixa não limpou no passo novo: '+JSON.stringify(limpa));
 // RSNA fora do teste: sem 'Fora do ponto marcado'; perto do recesso, nome e frase de ensino; longe dos pontos, caixa oculta
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.raiz'))); await rmPronto(p,'rsna491250714/t2'); await p.waitForFunction(()=>__spine.RM.axLoaded==='rsna491250714'&&!document.querySelector('#rmmsg').textContent,null,{timeout:60000}); await p.waitForTimeout(300);
 const at8=await p.evaluate(()=>RM_EXAMS.rsna491250714.at), ens=async(id,dx=0)=>{const xy=await rmXY(p,at8[id],0,true); await p.mouse.click(xy.x+dx,xy.y); await p.waitForTimeout(300); return p.evaluate(()=>({hid:document.querySelector('#rmpick').hidden,box:document.querySelector('#rmpick').innerText,res:!!document.querySelector('#rmres')}));};
 const e1=await ens('subD.L5-S1'), e2=await ens('subD.L5-S1',-60);
 if(e1.hid||e1.box!=='Você clicou: Recesso lateral direito, L5-S1. Por aqui passa a raiz que desce. Neste nível, a raiz de S1.'||e1.res||!e2.hid||/Fora do ponto marcado/.test(await p.evaluate(()=>document.body.innerText))) bad.push('ressonância RSNA fora do teste: '+JSON.stringify([e1,e2]));
 await p.evaluate(()=>{__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.teste')); __spine.setMode('anat');}); // volta ao estado de antes (Anatomia, passo do teste)
 await p.setViewportSize({width:1000,height:800}); await p.waitForTimeout(200); if(!await cabeModos(1)) bad.push('as 4 partes não cabem na trilha em 1000');
 console.log('rm errs',p.errs); if(p.errs.length) bad.push('erros na ressonância (desktop)');
 await p.close();
 // mobile
 p=await page(b,390,844);
 await shot(p,'m0');
 await p.evaluate(()=>{window.scrollTo(0,0); __spine.setFull(true)}); await shot(p,'m1');
 await p.evaluate(()=>{__spine.setFull(false); __spine.openDz('sten')}); await shot(p,'m2');
 await p.evaluate(()=>{window.scrollTo(0,0); __spine.openDz('tfesi')}); await shot(p,'m3');
 // a barra Anatomia/Doenças/Procedimentos tem de caber na largura do celular, sem rolagem lateral
 const fits=await p.evaluate(()=>['#m-proc','#m-rm'].every(s=>document.querySelector(s).getBoundingClientRect().right<=innerWidth)&&document.documentElement.scrollWidth<=innerWidth); if(!fits) bad.push('barra de partes não cabe em 390 px');
 // ressonância no celular: um quadro por vez, toque num disco (o dedo fica 80 ms, como um toque de verdade) e nada de rolagem lateral
 await p.evaluate(()=>window.scrollTo(0,0)); await p.click('#m-rm'); await rmPronto(p,'spider5/t2');
 const cdp=await p.context().newCDPSession(p), tap=async xy=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:xy.x,y:xy.y}]}); await p.waitForTimeout(80); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await p.waitForTimeout(600);};
 await tap(await rmXY(p,await p.evaluate(()=>RM_EXAMS.spider5.at[202]),2));
 const m390=await p.evaluate(()=>({k:__spine.RM.pick&&__spine.RM.pick.key,tiles:__spine.RM.nv.screenSlices.length,lat:document.documentElement.scrollWidth<=innerWidth,inset:getComputedStyle(document.querySelector('#view')).display,ver:!!document.querySelector('#rm3d').offsetParent,altura:Math.round(document.querySelector('.rmcv').getBoundingClientRect().height)}));
 // passo sem axial (o primeiro): sem o botão Axial; no teste da trilha de base, com axial, o botão troca o quadro
 const semAx390=await p.evaluate(()=>!document.querySelector('[data-pane="ax"]').offsetParent); if(!semAx390) bad.push('ressonância em 390: botão Axial num passo sem axial');
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.teste'))); await p.waitForTimeout(300);
 await p.click('[data-pane="ax"]'); await p.waitForTimeout(300);
 const a390=await p.evaluate(()=>({t:__spine.RM.nv.screenSlices.map(s=>s.axCorSag).join(),lat:document.documentElement.scrollWidth<=innerWidth}));
 // RSNA no celular: com Axial, o canvas do axial cobre o quadro inteiro; com Sagital, some
 await p.evaluate(()=>__spine.goRm(__spine.RM_STEPS.findIndex(r=>r.id==='base.axial'))); await rmPronto(p,'rsna491250714/t2'); await p.waitForFunction(()=>__spine.RM.axLoaded==='rsna491250714',null,{timeout:60000}); await p.waitForTimeout(300);
 const rax=()=>p.evaluate(()=>{const a=document.querySelector('#rmax').getBoundingClientRect(),c=document.querySelector('.rmcv').getBoundingClientRect();return {vis:getComputedStyle(document.querySelector('#rmax')).visibility,cobre:Math.round(a.width)===Math.round(c.width)&&Math.round(a.height)===Math.round(c.height),lat:document.documentElement.scrollWidth<=innerWidth}});
 const r390a=await rax(); await p.click('[data-pane="sag"]'); await p.waitForTimeout(300); const r390s=await rax();
 console.log('rm 390',JSON.stringify(m390),JSON.stringify(a390),JSON.stringify([r390a,r390s]));
 if(m390.k!=='disc.L4-L5'||m390.tiles!==1||!m390.lat||m390.inset!=='none'||!m390.ver||m390.altura>0.7*844) bad.push('ressonância em 390: '+JSON.stringify(m390));
 if(a390.t!=='0'||!a390.lat) bad.push('ressonância em 390, axial: '+JSON.stringify(a390));
 if(r390a.vis!=='visible'||!r390a.cobre||!r390a.lat||r390s.vis!=='hidden'||!r390s.lat) bad.push('ressonância em 390, RSNA: '+JSON.stringify([r390a,r390s]));
 const tgt=await p.evaluate(()=>[...document.querySelectorAll('button,select,summary')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,(e.id||e.className)+':'+e.textContent.trim().slice(0,12)]}).filter(([w,h])=>h<36||w<36).slice(0,20));
 console.log('small targets',JSON.stringify(tgt)); console.log('mob errs',p.errs); if(p.errs.length) bad.push('erros no celular');
 await p.close();
 // failure
 p=await page(b,1440,900,true); await shot(p,'f0'); const txt=await p.evaluate(()=>document.querySelector('#scroll').innerText.slice(0,60)); console.log('fail errs',p.errs,txt);
 // sem a biblioteca 3D a aula em texto tem de continuar
 if(!/Capítulo 1/.test(txt)||!await p.evaluate(()=>!!document.querySelector('.fail'))) bad.push('aula sem 3D não abriu');
 // com login: nome e Sair cabem em 390 px, o progresso da conta soma ao local e volta para a conta, o tira-dúvidas manda o token.
 // Outro aparelho limpou o progresso em T: as marcas locais anteriores a T (9 e sten) não voltam, a posterior (5) fica
 // marcas antigas de ressonância ('237.3', '10.2'), de antes das trilhas, somem dos dois lados
 const T=Date.now()-60000, emR=Object.fromEntries(['seen:0','seen:1','seen:2','seen:3','dzSeen:hernia'].map(k=>[k,T+500]));
 p=await page(b,390,844,false,{remoto:{seen:[0,1,2,3],dzSeen:['hernia'],rmSeen:['hernia.sag','237.3'],quiz:{dz:{0:0}},zeradoEm:T,em:{...emR,'rmSeen:hernia.sag':T+500,'rmSeen:237.3':T+500}},local:{conta:'u1',seen:[9,5],dzSeen:['sten'],rmSeen:['modic.tipos','modic.tipo1','10.2'],em:{'seen:9':T-1000,'seen:5':T+1000,'dzSeen:sten':T-1000,'rmSeen:modic.tipos':T-1000,'rmSeen:modic.tipo1':T+1000,'rmSeen:10.2':T+1000}}});
 await p.waitForTimeout(1200);
 const visto=()=>p.evaluate(()=>{const l=JSON.parse(localStorage.getItem('coluna3d.v1'));return {seen:l.seen.sort((a,b)=>a-b).join(),dz:l.dzSeen.join(),rm:(l.rmSeen||[]).sort().join(),quiz:JSON.stringify(l.quiz),z:l.zeradoEm,txt:document.querySelector('#progtxt').textContent}});
 const conta=await p.evaluate(()=>{const q=document.querySelector('#quem'),s=document.querySelector('#sair').getBoundingClientRect();return {nome:q.textContent,email:q.title,cabe:s.right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth,linha:s.top<document.querySelector('#m-anat').getBoundingClientRect().top,fab:!document.querySelector('#askfab').hidden}}), va=await visto();
 console.log('conta',JSON.stringify(conta),JSON.stringify(va),'gravado',JSON.stringify(p.gravado.at(-1)));
 if(conta.nome!=='Gustavo'||conta.email!==SESSAO.user.email) bad.push('nome no topo: '+conta.nome);
 if(!conta.cabe||!conta.linha) bad.push('conta não cabe na linha do título em 390 px');
 if(va.seen!=='0,1,2,3,5'||va.dz!=='hernia'||va.rm!=='hernia.sag,modic.tipo1'||va.quiz!==JSON.stringify({dz:{0:0}})||va.z!==T||!/anatomia 5 de/.test(va.txt)||!/ressonância 2 de \d+$/.test(va.txt)) bad.push('soma com limpar de outro aparelho: '+JSON.stringify(va));
 const g=p.gravado.at(-1); if(!g||g.user_id!=='u1'||g.dados.seen.length!==5||g.dados.rmSeen.sort().join()!=='hernia.sag,modic.tipo1'||g.dados.zeradoEm!==T) bad.push('progresso não voltou para a conta');
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
 const v0=p.voz[0]||{h:{}}, wv=v0.b&&{riff:v0.b.toString('latin1',0,4),canais:v0.b.readUInt16LE(22),taxa:v0.b.readUInt32LE(24),bytes:v0.b.length,rms:Math.round(Math.sqrt(Array.from({length:(v0.b.length-44)>>1},(_,i)=>v0.b.readInt16LE(44+i*2)**2).reduce((a,b)=>a+b,0)/Math.max(1,(v0.b.length-44)>>1)))};
 console.log('voz',JSON.stringify({m0,m1,m2,m3,wv}));
 if(!m0.vis||m0.w<44||m0.h<44||m0.label!=='Gravar pergunta por voz'||m1!=='askmic') bad.push('microfone: '+JSON.stringify(m0)+' foco '+m1);
 if(m2.pressed!=='true'||!/^Gravando… 0:0\d$/.test(m2.ph)) bad.push('gravando: '+JSON.stringify(m2));
 if(m3.val!=='Dúvida: Onde fica o forame?'||m3.pressed!=='false'||m3.ph!=='Sua dúvida (restam 29 hoje)'||!m3.solto||m3.foco!=='askq') bad.push('voz: '+JSON.stringify(m3));
 if(v0.h.authorization!=='Bearer a.b.c'||v0.h['content-type']!=='audio/wav'||!wv||wv.riff!=='RIFF'||wv.canais!==1||wv.taxa!==16000||wv.bytes<44+3200||wv.rms<1000) bad.push('voz enviada: '+JSON.stringify(wv)+' '+v0.h.authorization);
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
