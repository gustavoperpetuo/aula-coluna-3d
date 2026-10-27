// Fecha o site inteiro: sem sessão do Supabase só passam a página de login e os ícones dela.
// O token de acesso chega no cookie sb (src/auth.js o mantém em dia, inclusive na renovação) ou no Authorization: Bearer.
// Assinatura ES256 conferida com a JWKS pública do projeto (sem segredo na Cloudflare), mais validade, audiência e emissor.
const SUPABASE = 'https://ugvqhjyeekyufxuyvozc.supabase.co', EMISSOR = SUPABASE + '/auth/v1';
const ABERTO = new Set(['/entrar', '/entrar.html', '/icone-32.png', '/icone-180.png']);

let jwks = null, lidaEm = 0;
async function chaves(forcar) {
  // cache de 10 min; a chave nova de uma rotação força nova leitura, no máximo uma por minuto
  const idade = Date.now() - lidaEm;
  if (jwks && idade < 600e3 && !(forcar && idade > 60e3)) return jwks;
  const r = await fetch(EMISSOR + '/.well-known/jwks.json');
  if (!r.ok) throw new Error('JWKS ' + r.status);
  jwks = (await r.json()).keys || []; lidaEm = Date.now();
  return jwks;
}

const b64 = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
const lerJson = s => JSON.parse(new TextDecoder().decode(b64(s)));

// devolve as claims do token válido ou null; só lança se a JWKS não puder ser lida
export async function verificar(token) {
  let h, p, assinatura, cab, claims;
  try { [h, p, assinatura] = token.split('.'); cab = lerJson(h); claims = lerJson(p); } catch { return null; }
  if (cab.alg !== 'ES256' || !assinatura) return null;
  let jwk = (await chaves()).find(k => k.kid === cab.kid);
  if (!jwk) jwk = (await chaves(true)).find(k => k.kid === cab.kid);
  if (!jwk || jwk.kty !== 'EC') return null;
  try {
    const chave = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    if (!await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, chave, b64(assinatura), new TextEncoder().encode(h + '.' + p))) return null;
  } catch { return null; }
  const agora = Date.now() / 1000;
  if (!(claims.exp > agora) || (claims.nbf && claims.nbf > agora + 60)) return null;
  if (![].concat(claims.aud).includes('authenticated') || claims.iss !== EMISSOR) return null;
  return claims;
}

// JSON como o de /api/pergunta, para o tira-dúvidas mostrar a mensagem
const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
const INDISPONIVEL = 'Login indisponível agora. Tente de novo em alguns minutos.';
const pagina = t => new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Aulas de coluna</title><p style="font:18px/1.5 system-ui,sans-serif;color:#18221F;max-width:28em;margin:20vh auto 0;padding:0 16px">${t}</p></html>`, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (ABERTO.has(url.pathname)) return next();
  const html = (request.headers.get('accept') || '').includes('text/html');
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || (/(?:^|;\s*)sb=([^;]+)/.exec(request.headers.get('cookie') || '') || [])[1];
  let ok = false;
  try { ok = !!token && !!await verificar(token); } catch { return html ? pagina(INDISPONIVEL) : json({ erro: INDISPONIVEL }, 503); }
  if (ok) return next();
  if (html) return Response.redirect(url.origin + '/entrar?volta=' + encodeURIComponent(url.pathname + url.search), 302);
  return json({ erro: 'Sessão expirada. Recarregue a página.' }, 401);
}
