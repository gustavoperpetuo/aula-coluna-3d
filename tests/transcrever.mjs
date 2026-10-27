// Voz do tira-dúvidas sem rede: o binding AI do Workers AI simulado.
import { onRequestPost } from '../functions/api/transcrever.js';
const falhas = [], eq = (nome, a, b) => { if (a !== b) falhas.push(`${nome}: ${a} != ${b}`); };
const req = (body, ai, token = 'tk') => ({ request: new Request('http://x/api/transcrever', { method: 'POST', headers: { 'content-type': 'audio/wav', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body }), env: ai ? { AI: ai } : {} });
// Supabase simulado: registrar_audio responde conforme `cota`
let cota = { status: 200, body: 500 }, rpc;
globalThis.fetch = async (url, o) => { rpc = { url, o }; return new Response(JSON.stringify(cota.body), { status: cota.status }); };
let pedido;
// WAV fictício: 44 bytes de cabeçalho e amostras com amplitude `a`
const wavDe = (n, a) => { const b = new Uint8Array(44 + n * 2), d = new DataView(b.buffer); for (let i = 0; i < n; i++) d.setInt16(44 + i * 2, i % 2 ? a : -a, true); return b; };
const ok = { run: async (modelo, entrada) => { pedido = { modelo, entrada }; return { text: ' Onde fica o forame? ' }; } };

const som = wavDe(100, 1000);
const r = await onRequestPost(req(som, ok));
eq('sucesso', r.status, 200); eq('texto', (await r.json()).texto, 'Onde fica o forame?');
eq('modelo', pedido.modelo, '@cf/openai/whisper-large-v3-turbo');
eq('áudio em base64', pedido.entrada.audio, Buffer.from(som).toString('base64')); eq('português', pedido.entrada.language, 'pt'); eq('vad', pedido.entrada.vad_filter, true);
// base64 em pedaços igual ao de uma vez só, num áudio maior que um pedaço
const grande = new Uint8Array(100000).map((_, i) => i * 7);
await onRequestPost(req(grande, ok)); eq('base64 em pedaços', pedido.entrada.audio, Buffer.from(grande).toString('base64'));
pedido = undefined;
const big = await onRequestPost(req(new Uint8Array(2 * 1024 * 1024 + 1), ok));
eq('acima de 2 MB', big.status, 413); eq('mensagem do limite', /60 segundos/.test((await big.json()).erro), true); eq('acima do limite não chama o modelo', pedido, undefined);
eq('vazio', (await onRequestPost(req(new Uint8Array(0), ok))).status, 400);
eq('rpc de áudio', /registrar_audio$/.test(rpc.url), true); eq('token repassado', rpc.o.headers.authorization, 'Bearer tk');
eq('segundos estimados', JSON.parse(rpc.o.body).segundos, 4); // 100000 bytes / 32000 por segundo
eq('sem token', (await onRequestPost(req(som, ok, null))).status, 401);
cota = { status: 400, body: { message: 'Limite de 10 minutos de voz por dia atingido.' } }; pedido = undefined;
const lim = await onRequestPost(req(som, ok));
eq('acima da cota', lim.status, 429); eq('cota não chama o modelo', pedido, undefined); eq('mensagem da cota', /10 minutos/.test((await lim.json()).erro), true);
cota = { status: 401, body: {} }; eq('token recusado', (await onRequestPost(req(som, ok))).status, 401);
cota = { status: 200, body: 500 };
const sem = await onRequestPost(req(som, null));
eq('sem binding', sem.status, 503); eq('mensagem sem binding', (await sem.json()).erro, 'Transcrição indisponível agora.');
const erro = await onRequestPost(req(som, { run: async () => { throw new Error('3010: invalid audio'); } }));
eq('erro do modelo', erro.status, 502); eq('mensagem do erro', typeof (await erro.json()).erro, 'string');
pedido = undefined;
const mudo = await onRequestPost(req(wavDe(1000, 3), ok));
eq('silêncio', mudo.status, 422); eq('silêncio não chama o modelo', pedido, undefined); eq('mensagem do silêncio', /microfone/.test((await mudo.json()).erro), true);
const vazio = await onRequestPost(req(som, { run: async () => ({ text: '  ' }) }));
eq('texto vazio vira erro', /Não entendi/.test((await vazio.json()).erro), true);
console.log(falhas.length ? 'FALHA: ' + falhas.join('; ') : 'ok: transcrição');
if (falhas.length) process.exit(1);
