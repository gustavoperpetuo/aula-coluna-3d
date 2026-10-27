// Middleware que fecha o site, sem rede: tokens assinados aqui com um par de chaves local e a JWKS servida por um fetch simulado.
import { onRequest } from '../functions/_middleware.js';
const falhas = [], eq = (nome, a, b) => { if (a !== b) falhas.push(`${nome}: ${a} != ${b}`); };
const ISS = 'https://ugvqhjyeekyufxuyvozc.supabase.co/auth/v1', agora = Math.floor(Date.now() / 1000);
const par = () => crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
const chave = await par(), outra = await par();
const jwk = { ...(await crypto.subtle.exportKey('jwk', chave.publicKey)), kid: 'k1', alg: 'ES256', use: 'sig', key_ops: ['verify'] };
let jwksPedidas = 0;
globalThis.fetch = async url => { jwksPedidas++; eq('url da JWKS', String(url), ISS + '/.well-known/jwks.json'); return new Response(JSON.stringify({ keys: [jwk] }), { status: 200 }); };
const b64 = x => Buffer.from(typeof x === 'string' ? x : new Uint8Array(x)).toString('base64url');
async function token(claims = {}, { priv = chave.privateKey, cab = {} } = {}) {
  const h = b64(JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: 'k1', ...cab })), p = b64(JSON.stringify({ sub: 'u1', aud: 'authenticated', iss: ISS, exp: agora + 3600, ...claims }));
  return h + '.' + p + '.' + b64(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, priv, new TextEncoder().encode(h + '.' + p)));
}
// devolve o status; 200 quando o middleware deixa seguir para o site
async function pede(path, { cookie, auth, html = true } = {}) {
  const headers = { accept: html ? 'text/html,application/xhtml+xml' : '*/*' };
  if (cookie) headers.cookie = 'outro=1; sb=' + cookie; if (auth) headers.authorization = 'Bearer ' + auth;
  const r = await onRequest({ request: new Request('https://aula.test' + path, { headers }), next: async () => new Response('site') });
  return r.status === 302 ? '302 ' + r.headers.get('location') : r.status;
}
eq('login é público', await pede('/entrar'), 200);
eq('privacidade é pública', await pede('/privacidade'), 200);
eq('ícone do login é público', await pede('/icone-32.png', { html: false }), 200);
eq('HTML sem cookie vai ao login', await pede('/coluna-vertebral?x=1'), '302 https://aula.test/entrar?volta=%2Fcoluna-vertebral%3Fx%3D1');
eq('imagem do login é pública', await pede('/coluna-deitada.webp', { html: false }), 200);
eq('imagem sem cookie', await pede('/outra.webp', { html: false }), 401);
eq('API sem cookie', await pede('/api/pergunta', { html: false }), 401);
eq('válido no cookie', await pede('/', { cookie: await token() }), 200);
eq('válido no Authorization', await pede('/api/pergunta', { auth: await token(), html: false }), 200);
eq('expirado', await pede('/api/pergunta', { cookie: await token({ exp: agora - 10 }), html: false }), 401);
eq('sem exp', await pede('/api/pergunta', { cookie: await token({ exp: undefined }), html: false }), 401);
eq('assinatura de outra chave', await pede('/api/pergunta', { cookie: await token({}, { priv: outra.privateKey }), html: false }), 401);
eq('emissor errado', await pede('/api/pergunta', { cookie: await token({ iss: 'https://outro.supabase.co/auth/v1' }), html: false }), 401);
eq('audiência errada', await pede('/api/pergunta', { cookie: await token({ aud: 'anon' }), html: false }), 401);
eq('alg trocado', await pede('/api/pergunta', { cookie: await token({}, { cab: { alg: 'HS256' } }), html: false }), 401);
const t = await token(), [h, p] = t.split('.');
eq('payload adulterado', await pede('/api/pergunta', { cookie: h + '.' + b64(JSON.stringify({ sub: 'u2', aud: 'authenticated', iss: ISS, exp: agora + 3600 })) + '.' + t.split('.')[2], html: false }), 401);
eq('sem assinatura', await pede('/api/pergunta', { cookie: h + '.' + p + '.', html: false }), 401);
eq('lixo', await pede('/', { cookie: 'abc' }), '302 https://aula.test/entrar?volta=%2F');
eq('kid desconhecido', await pede('/api/pergunta', { cookie: await token({}, { cab: { kid: 'k9' } }), html: false }), 401);
eq('JWKS em cache, releitura limitada', jwksPedidas, 1);
// JWKS fora do ar: módulo novo (cache vazio); página recebe HTML em PT-BR, API recebe JSON
const { onRequest: semJwks } = await import('../functions/_middleware.js?sem-jwks');
globalThis.fetch = async () => new Response('', { status: 500 });
const pedeSem = html => semJwks({ request: new Request('https://aula.test/', { headers: { accept: html ? 'text/html' : '*/*', cookie: 'sb=' + t } }), next: async () => new Response('site') });
const ph = await pedeSem(true), pa = await pedeSem(false);
eq('JWKS fora: página 503', ph.status, 503); eq('JWKS fora: HTML', ph.headers.get('content-type').startsWith('text/html'), true);
eq('JWKS fora: texto', (await ph.text()).includes('Login indisponível agora. Tente de novo em alguns minutos.'), true);
eq('JWKS fora: API 503', pa.status, 503); eq('JWKS fora: API em JSON', (await pa.json()).erro, 'Login indisponível agora. Tente de novo em alguns minutos.');
console.log(falhas.length ? 'FALHA: ' + falhas.join('; ') : 'ok: middleware');
if (falhas.length) process.exit(1);
