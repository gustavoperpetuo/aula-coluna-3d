// Tira-dúvidas da aula: Cloudflare Pages Function em /api/pergunta. A chave da API fica só aqui, como segredo do projeto (ANTHROPIC_API_KEY).
// Quem pergunta manda o token do login (Authorization: Bearer); registrar_pergunta no Supabase valida o token e aplica o limite diário por pessoa.
import Anthropic from '@anthropic-ai/sdk';

const SUPABASE = 'https://ugvqhjyeekyufxuyvozc.supabase.co', CHAVE_PUBLICA = 'sb_publishable_FbgScRDcBuqkEt77OKKnpQ_Rb_K07Xq';

const SYSTEM = 'Monitor de uma aula de anatomia, doenças e procedimentos da coluna vertebral. Responda em português do Brasil, direto e didático. ' +
  'Estrutura: a resposta numa frase; depois, se ajudar a entender, até 4 tópicos curtos, cada um numa linha começando com "- ". ' +
  'Use **negrito** nas palavras e frases mais importantes. Nenhuma outra formatação (sem títulos, tabelas ou listas numeradas). ' +
  'Sem introdução, sem repetir a pergunta, sem fechamento. Use o trecho da aula como base. Fora da coluna, diga em uma frase. Sem conduta para paciente específico.';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ erro: 'Servidor sem ANTHROPIC_API_KEY configurada.' }, 503);
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ erro: 'Sessão expirada. Recarregue a página.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ erro: 'Pedido inválido.' }, 400); }
  const pergunta = String(body.pergunta || '').trim().slice(0, 1000), contexto = String(body.contexto || '').slice(0, 8000);
  if (!pergunta) return json({ erro: 'Escreva a pergunta.' }, 400);
  // conta a pergunta de hoje e devolve quantas restam; acima do limite a função levanta 'Limite de 30 perguntas por dia atingido.'
  let restantes;
  try {
    const r = await fetch(SUPABASE + '/rest/v1/rpc/registrar_pergunta', { method: 'POST', headers: { apikey: CHAVE_PUBLICA, authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: '{}' });
    const d = await r.json().catch(() => null);
    if (r.status === 401 || r.status === 403) return json({ erro: 'Sessão expirada. Recarregue a página.' }, 401);
    if (!r.ok) return d && /^Limite/.test(d.message) ? json({ erro: d.message }, 429) : json({ erro: 'Falha ao registrar a pergunta (' + r.status + ').' }, 502);
    restantes = d;
  } catch { return json({ erro: 'Falha ao registrar a pergunta (rede).' }, 502); }
  try {
    const r = await new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }).beta.messages.create({
      model: 'claude-sonnet-5-5',
      max_tokens: 4000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: `Trecho da aula na tela:\n${contexto}\n\nPergunta: ${pergunta}` }],
    });
    if (r.stop_reason === 'refusal') return json({ erro: 'Não consegui responder a essa pergunta.' });
    const texto = r.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return json(texto ? { texto, restantes } : { erro: 'Resposta vazia. Tente de novo.' });
  } catch (e) {
    return json({ erro: 'Falha ao consultar o Claude (' + (e.status || 'rede') + ').' }, 502);
  }
}
