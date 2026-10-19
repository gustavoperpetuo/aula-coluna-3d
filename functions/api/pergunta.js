// Tira-dúvidas da aula: Cloudflare Pages Function em /api/pergunta. A chave da API fica só aqui, como segredo do projeto.
// Segredos no painel da Cloudflare: ANTHROPIC_API_KEY e SENHA_DUVIDAS (shortcut: senha única, só para teste; trocar por limite por pessoa antes de abrir ao público).
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = 'Você é monitor de uma aula interativa de anatomia e doenças da coluna vertebral, para estudantes e profissionais de saúde. ' +
  'Responda em português do Brasil, em até 6 frases, com base no trecho da aula enviado e em conhecimento médico estabelecido. ' +
  'Se a pergunta fugir da coluna, diga isso em uma frase. Não indique conduta para um paciente específico. Texto corrido, sem markdown.';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestPost({ request, env }) {
  if (!env.SENHA_DUVIDAS || request.headers.get('x-senha') !== env.SENHA_DUVIDAS) return json({ erro: 'Sem acesso.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ erro: 'Pedido inválido.' }, 400); }
  const pergunta = String(body.pergunta || '').trim().slice(0, 1000), contexto = String(body.contexto || '').slice(0, 8000);
  if (!pergunta) return json({ erro: 'Escreva a pergunta.' }, 400);
  try {
    const r = await new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }).beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages: [{ role: 'user', content: `Trecho da aula na tela:\n${contexto}\n\nPergunta: ${pergunta}` }],
    });
    if (r.stop_reason === 'refusal') return json({ erro: 'Não consegui responder a essa pergunta.' });
    const texto = r.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
    return json(texto ? { texto } : { erro: 'Resposta vazia. Tente de novo.' });
  } catch (e) {
    return json({ erro: 'Falha ao consultar o Claude (' + (e.status || 'rede') + ').' }, 502);
  }
}
