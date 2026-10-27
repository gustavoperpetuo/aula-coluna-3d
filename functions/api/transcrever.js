// Voz do tira-dúvidas: Cloudflare Pages Function em /api/transcrever. O login já passou por functions/_middleware.js.
// O navegador manda o áudio cru (WAV 16 kHz mono, convertido em src/app.js) e o Whisper do Workers AI responde pelo binding AI.
const MAX = 2 * 1024 * 1024; // uns 65 s de WAV 16 kHz mono; o navegador para em 60 s
const GRANDE = 'Áudio longo demais. Grave até 60 segundos.';
const SUPABASE = 'https://ugvqhjyeekyufxuyvozc.supabase.co', CHAVE_PUBLICA = 'sb_publishable_FbgScRDcBuqkEt77OKKnpQ_Rb_K07Xq';
const VOCABULARIO = 'Coluna vertebral, hérnia de disco, L4-L5, forame, radiculopatia, estenose, facetária, Modic, Pfirrmann.';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestPost({ request, env }) {
  if (!env.AI) return json({ erro: 'Transcrição indisponível agora.' }, 503);
  if (+request.headers.get('content-length') > MAX) return json({ erro: GRANDE }, 413);
  const audio = new Uint8Array(await request.arrayBuffer());
  if (audio.length > MAX) return json({ erro: GRANDE }, 413); // content-length pode faltar ou mentir
  if (!audio.length) return json({ erro: 'Áudio vazio. Grave de novo.' }, 400);
  // nível RMS do WAV 16 bits (cabeçalho de 44 bytes): microfone mudo ou errado chega como silêncio, e o Whisper devolve texto vazio
  const dv = new DataView(audio.buffer, audio.byteOffset, audio.byteLength), amostras = Math.max(0, (audio.length - 44) >> 1);
  let soma = 0; for (let i = 0; i < amostras; i++) { const x = dv.getInt16(44 + i * 2, true); soma += x * x; }
  const nivel = amostras ? Math.round(Math.sqrt(soma / amostras)) : 0;
  if (nivel < 20) return json({ erro: 'O microfone não captou som. Confira qual microfone o navegador está usando.', nivel }, 422);
  // a cota gratuita do Whisper é da conta inteira: registrar_audio soma os segundos do dia por pessoa (WAV 16 kHz mono = 32 kB/s) e barra acima de 10 min
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ erro: 'Sessão expirada. Recarregue a página.' }, 401);
  try {
    const r = await fetch(SUPABASE + '/rest/v1/rpc/registrar_audio', { method: 'POST', headers: { apikey: CHAVE_PUBLICA, authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: JSON.stringify({ segundos: Math.ceil(audio.length / 32000) }) });
    const d = await r.json().catch(() => null);
    if (r.status === 401 || r.status === 403) return json({ erro: 'Sessão expirada. Recarregue a página.' }, 401);
    if (!r.ok) return d && /^Limite/.test(d.message) ? json({ erro: d.message }, 429) : json({ erro: 'Falha ao registrar o áudio (' + r.status + ').' }, 502);
  } catch {
    return json({ erro: 'Falha ao registrar o áudio.' }, 502);
  }
  // o modelo pede o áudio em base64 (schema de whisper-large-v3-turbo); em pedaços para não estourar a pilha
  let bin = '';
  for (let i = 0; i < audio.length; i += 0x8000) bin += String.fromCharCode(...audio.subarray(i, i + 0x8000));
  try {
    const r = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio: btoa(bin), language: 'pt', vad_filter: true, initial_prompt: VOCABULARIO });
    const texto = String((r && r.text) || '').trim();
    return json(texto ? { texto } : { erro: 'Não entendi o áudio (nível ' + nivel + '). Fale mais perto do microfone e tente de novo.', nivel });
  } catch {
    return json({ erro: 'Falha ao transcrever. Tente de novo.' }, 502);
  }
}
