// Função do tira-dúvidas sem rede: token do login, limite diário, validação e leitura da resposta, com o Supabase e a API do Claude simulados.
import { onRequestPost } from '../functions/api/pergunta.js';
const env = { ANTHROPIC_API_KEY: 'k' }, falhas = [];
const req = (body, token = 'tok') => ({ request: new Request('http://x/api/pergunta', { method: 'POST', headers: { ...(token && { authorization: 'Bearer ' + token }), 'content-type': 'application/json' }, body }), env });
const eq = (nome, a, b) => { if (a !== b) falhas.push(`${nome}: ${a} != ${b}`); };
const resposta = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'request-id': 'r' } });
const claudeOk = () => resposta({ id: 'm', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: 'O LLA corre na frente dos corpos.' }], usage: { input_tokens: 1, output_tokens: 1 } });
let enviado, rpc, supabase = () => resposta(29), claude = claudeOk;
globalThis.fetch = async (url, init) => {
  if (String(url).endsWith('/rest/v1/rpc/registrar_pergunta')) { rpc = init; return supabase(); }
  enviado = JSON.parse(init.body); return claude();
};
eq('sem token', (await onRequestPost(req('{"pergunta":"a"}', ''))).status, 401);
eq('sem chave no servidor', (await onRequestPost({ ...req('{"pergunta":"a"}'), env: {} })).status, 503);
eq('json inválido', (await onRequestPost(req('{'))).status, 400);
eq('pergunta vazia', (await onRequestPost(req('{"pergunta":"  "}'))).status, 400);
eq('pedido inválido não conta no limite', rpc, undefined);
const ok = await onRequestPost(req(JSON.stringify({ pergunta: 'O que é o LLA?', contexto: 'Ligamentos' })));
const okJson = await ok.json();
eq('sucesso', ok.status, 200); eq('texto', okJson.texto, 'O LLA corre na frente dos corpos.'); eq('restantes', okJson.restantes, 29);
eq('token vai ao Supabase', rpc.headers.authorization, 'Bearer tok'); eq('chave publicável', rpc.headers.apikey.startsWith('sb_publishable_'), true);
eq('modelo', enviado.model, 'claude-sonnet-5-5'); eq('fallback', enviado.fallbacks, 'default');
eq('contexto vai junto', enviado.messages[0].content.includes('Ligamentos'), true);
enviado = undefined;
supabase = () => resposta({ code: 'PGRST301', message: 'JWT expired' }, 401);
eq('token inválido', (await onRequestPost(req('{"pergunta":"a"}', 'velho'))).status, 401);
supabase = () => resposta({ code: 'P0001', details: null, hint: null, message: 'Limite de 30 perguntas por dia atingido.' }, 400);
const lim = await onRequestPost(req('{"pergunta":"a"}'));
eq('limite', lim.status, 429); eq('mensagem do limite', (await lim.json()).erro, 'Limite de 30 perguntas por dia atingido.');
supabase = () => resposta({ message: 'x' }, 500);
eq('erro do Supabase vira 502', (await onRequestPost(req('{"pergunta":"a"}'))).status, 502);
supabase = () => { throw new TypeError('fetch failed'); };
eq('Supabase fora do ar vira 502', (await onRequestPost(req('{"pergunta":"a"}'))).status, 502);
eq('sem login válido o Claude não é chamado', enviado, undefined);
supabase = () => resposta(3);
claude = () => resposta({ type: 'error', error: { type: 'authentication_error', message: 'x' } }, 401);
eq('erro da API vira 502', (await onRequestPost(req('{"pergunta":"a"}'))).status, 502);
console.log(falhas.length ? 'FALHA: ' + falhas.join('; ') : 'ok: tira-dúvidas');
if (falhas.length) process.exit(1);
