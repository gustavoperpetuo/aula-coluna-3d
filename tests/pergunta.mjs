// Função do tira-dúvidas sem rede: senha, validação e leitura da resposta, com o fetch da API simulado.
import { onRequestPost } from '../functions/api/pergunta.js';
const env = { SENHA_DUVIDAS: 's3', ANTHROPIC_API_KEY: 'k' }, falhas = [];
const req = (body, senha = 's3') => ({ request: new Request('http://x/api/pergunta', { method: 'POST', headers: { 'x-senha': senha, 'content-type': 'application/json' }, body }), env });
const eq = (nome, a, b) => { if (a !== b) falhas.push(`${nome}: ${a} != ${b}`); };
let enviado;
globalThis.fetch = async (url, init) => { enviado = JSON.parse(init.body); return new Response(JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: 'O LLA corre na frente dos corpos.' }], usage: { input_tokens: 1, output_tokens: 1 } }), { status: 200, headers: { 'content-type': 'application/json', 'request-id': 'r' } }); };
eq('senha errada', (await onRequestPost(req('{"pergunta":"a"}', 'x'))).status, 401);
eq('sem senha no servidor', (await onRequestPost({ ...req('{"pergunta":"a"}'), env: {} })).status, 401);
eq('json inválido', (await onRequestPost(req('{'))).status, 400);
eq('pergunta vazia', (await onRequestPost(req('{"pergunta":"  "}'))).status, 400);
const ok = await onRequestPost(req(JSON.stringify({ pergunta: 'O que é o LLA?', contexto: 'Ligamentos' })));
eq('sucesso', ok.status, 200); eq('texto', (await ok.json()).texto, 'O LLA corre na frente dos corpos.');
eq('modelo', enviado.model, 'claude-sonnet-5-5'); eq('fallback', enviado.fallbacks, 'default');
eq('contexto vai junto', enviado.messages[0].content.includes('Ligamentos'), true);
globalThis.fetch = async () => new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'x' } }), { status: 401, headers: { 'content-type': 'application/json' } });
eq('erro da API vira 502', (await onRequestPost(req('{"pergunta":"a"}'))).status, 502);
console.log(falhas.length ? 'FALHA: ' + falhas.join('; ') : 'ok: tira-dúvidas');
if (falhas.length) process.exit(1);
