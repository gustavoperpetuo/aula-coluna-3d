// Painel do administrador (dist/admin.html) e o link dele no hub, com sessão simulada e as RPCs do Supabase respondidas daqui
const { chromium } = require('playwright');
const fs=require('fs'), vm=require('vm');
// totais e gabarito do teste final tirados das listas da aula, rodadas aqui fora da página
const ctx={}; vm.createContext(ctx);
vm.runInContext(['content.js','disease.js','proc.js'].map(f=>fs.readFileSync(__dirname+'/../src/'+f,'utf8')).join('\n')+';this.T={a:ALL_STEPS.length,d:DZ.length,p:PROC.length,q:DZ_QUIZ}',ctx);
const {a:NA,d:ND,p:NP,q:Q}=ctx.T;
const SESSAO={access_token:'a.b.c',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'r',user:{id:'u1',aud:'authenticated',email:'gustavo@renovamedical.com.br',user_metadata:{full_name:'Gustavo Perpetuo'}}};
const H=36e5, iso=ms=>new Date(Date.now()-ms).toISOString();
const PESSOAS=[
 {email:'fernanda.lima@renovamedical.com.br',nome:'Fernanda Lima',primeiro_acesso:iso(20*24*H),ultimo_acesso:iso(2*H),progresso_em:iso(H),perguntas_total:14,perguntas_hoje:3,voz_segundos_total:95,
  progresso:{seen:[0,1,2,3,4,5,6,7,8,9,10,11],dzSeen:['ddd','hernia','sten'],procSeen:['tfesi'],quiz:{q0:{0:0,1:0,2:0},dz:Object.fromEntries(Q.map((q,i)=>[i,q[2]]))},step:11,zeradoEm:0,railOff:false,pw:430,conta:'u2'}},
 {email:'ricardo.souza@allivia.com.br',nome:'Ricardo Souza',primeiro_acesso:iso(30*24*H),ultimo_acesso:iso(10*24*H),progresso_em:iso(3*24*H),perguntas_total:2,perguntas_hoje:1,voz_segundos_total:0,
  progresso:{seen:[0,1,2],quiz:{dz:{0:Q[0][2],1:(Q[1][2]+1)%Q[1][1].length,2:Q[2][2]}},step:2,conta:'u3'}},
 {email:'paula.mendes@renovamedical.com.br',nome:'Paula Mendes',primeiro_acesso:'2026-10-01T15:30:00Z',ultimo_acesso:iso(12*24*H),progresso_em:null,perguntas_total:0,perguntas_hoje:0,voz_segundos_total:0,progresso:null},
];
// o que a página tem de mostrar em cada linha, da coluna Anatomia vista em diante (teste final no formato de bindQuiz() em src/app.js)
const ESPERADO=[
 [`12 de ${NA}`,`3 de ${ND}`,`1 de ${NP}`,`${Q.length} de ${Q.length} certas`,'14','3','1,6 min'],
 [`3 de ${NA}`,`0 de ${ND}`,`0 de ${NP}`,`2 de ${Q.length} certas, faltam ${Q.length-3}`,'2','1','0,0 min'],
 [`0 de ${NA}`,`0 de ${ND}`,`0 de ${NP}`,'Não fez','0','0','0,0 min'],
];
const RX=/[.;]\s+[a-zà-öø-ÿ]/g; // a mesma regra de tests/maiusculas.js
async function abre(b,W,url,{painel,admin}){
 const p=await b.newPage({viewport:{width:W,height:W<500?844:900},hasTouch:W<500,isMobile:W<500});
 p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message)); p.on('console',m=>{if(m.type()==='error'&&!/Failed to load|fonts/.test(m.text()))p.errs.push(m.text())});
 await p.route(/jsdelivr.*supabase-js/,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../node_modules/@supabase/supabase-js/dist/umd/supabase.js'),contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}));
 await p.route(/fonts\./,r=>r.abort());
 await p.addInitScript(s=>localStorage.setItem('sb-ugvqhjyeekyufxuyvozc-auth-token',JSON.stringify(s)),SESSAO);
 const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
 const rpc=(nome,res)=>p.route(new RegExp('supabase\\.co/rest/v1/rpc/'+nome),r=>r.request().method()==='OPTIONS'?r.fulfill({status:204,headers:cors}):r.fulfill({status:res.status||200,contentType:'application/json',headers:cors,body:JSON.stringify(res.body)}));
 if(painel) await rpc('painel_admin',painel);
 await rpc('eh_admin',{body:!!admin});
 for(const [u,f] of [['admin','admin.html'],['hub','index.html']]) await p.route('http://local.test/'+u,r=>r.fulfill({body:fs.readFileSync(__dirname+'/../dist/'+f,'utf8'),contentType:'text/html'}));
 await p.goto('http://local.test/'+url); await p.waitForTimeout(800); return p;}
(async()=>{
 const b=await chromium.launch(), bad=[];
 const shot=(p,n)=>p.screenshot({path:__dirname+'/out/admin_'+n+'.png',fullPage:true});
 const maius=async(p,onde)=>{const t=await p.evaluate(()=>document.body.innerText); for(const m of t.matchAll(RX)) bad.push(onde+': minúscula depois de ponto: ...'+t.slice(Math.max(0,m.index-20),m.index+20)+'...');};
 // 1. tabela com as linhas simuladas, na ordem da RPC, e os totais X de N
 for(const W of [1440,390]){
  const p=await abre(b,W,'admin',{painel:{body:PESSOAS}});
  const v=await p.evaluate(()=>({
   linhas:[...document.querySelectorAll('#linhas tr')].map(tr=>[...tr.children].map(c=>c.innerText.trim())),
   resumo:['r-pessoas','r-ativas','r-hoje'].map(id=>document.getElementById(id).textContent),
   th:document.querySelectorAll('thead th[scope=col]').length+'|'+document.querySelectorAll('tbody th[scope=row]').length+'|'+!!document.querySelector('table caption'),
   lateral:document.documentElement.scrollWidth<=innerWidth, cabe:document.querySelector('#tabela').scrollWidth<=document.querySelector('#tabela').clientWidth, margem:getComputedStyle(document.querySelector('main')).paddingLeft}));
  const L=v.linhas;
  if(L.length!==3) bad.push(W+': linhas '+L.length);
  L.forEach((c,i)=>{const e=PESSOAS[i]; if(c[0]!==e.nome+'\n'+e.email||c[1]!==e.email.split('@')[1]||JSON.stringify(c.slice(4))!==JSON.stringify(ESPERADO[i])||!/^\d\d\/\d\d\/\d{4}, \d\d:\d\d$/.test(c[3])) bad.push(W+': linha '+i+' '+JSON.stringify(c));});
  if(L[2]&&L[2][2]!=='01/10/2026, 12:30') bad.push(W+': primeiro acesso fora do horário de Brasília: '+L[2][2]);
  if(v.resumo.join()!=='3,2,4') bad.push(W+': resumo '+v.resumo);
  if(v.th!=='11|3|true') bad.push(W+': semântica da tabela '+v.th);
  if(!v.lateral) bad.push(W+': rolagem lateral na página');
  if(W>500&&!v.cabe) bad.push('tabela não cabe em 1440 px'); // no celular ela rola dentro da caixa
  if(W<500&&v.margem!=='16px') bad.push('margem no celular '+v.margem);
  await maius(p,'painel '+W); await shot(p,W<500?'m':'d');
  if(p.errs.length) bad.push(W+': erros '+p.errs); await p.close();
 }
 // 2. quem não é administrador: a RPC recusa e a página só mostra o aviso e o caminho de volta
 for(const W of [1440,390]){
  const p=await abre(b,W,'admin',{painel:{status:400,body:{code:'P0001',details:null,hint:null,message:'Acesso restrito.'}}});
  const r=await p.evaluate(()=>({txt:document.querySelector('#estado').innerText,href:document.querySelector('#estado a')?.getAttribute('href'),tabela:document.querySelector('#tabela').hidden&&document.querySelector('#resumo').hidden}));
  if(r.txt!=='Página restrita ao administrador. Voltar ao início'||r.href!=='/'||!r.tabela) bad.push(W+': restrito '+JSON.stringify(r));
  await maius(p,'restrito '+W); await shot(p,'restrito_'+(W<500?'m':'d'));
  if(p.errs.length) bad.push(W+': erros restrito '+p.errs); await p.close();
 }
 // 3. link no hub só para o administrador, sem rolagem lateral em 390 px
 for(const admin of [true,false]){
  const p=await abre(b,390,'hub',{admin});
  const h=await p.evaluate(()=>{const a=document.querySelector('#admin');return {vis:!!a.offsetParent,href:a.getAttribute('href'),cabe:document.documentElement.scrollWidth<=innerWidth}});
  if(h.vis!==admin||h.href!=='/admin'||!h.cabe) bad.push('hub (admin '+admin+'): '+JSON.stringify(h));
  if(admin) await shot(p,'hub_m');
  if(p.errs.length) bad.push('erros hub '+p.errs); await p.close();
 }
 await b.close();
 if(bad.length){console.log('FALHA:',bad.join('; ')); process.exit(1);} console.log('ok');})();
