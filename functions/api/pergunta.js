// Tira-dúvidas da aula: Cloudflare Pages Function em /api/pergunta. A chave da API fica só aqui, como segredo do projeto.
// Segredos no painel da Cloudflare: ANTHROPIC_API_KEY e SENHA_DUVIDAS (shortcut: senha única, só para teste; trocar por limite por pessoa antes de abrir ao público).
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = 'Monitor de uma aula de anatomia e doenças da coluna vertebral. Responda em português do Brasil, direto e didático. ' +
  'Estrutura: a resposta numa frase; depois, se ajudar a entender, até 4 tópicos curtos, cada um numa linha começando com "- ". ' +
  'Use **negrito** nas palavras e frases mais importantes. Nenhuma outra formatação (sem títulos, tabelas ou listas numeradas). ' +
  'Sem introdução, sem repetir a pergunta, sem fechamento. Use o trecho da aula como base. Fora da coluna, diga em uma frase. Sem conduta para paciente específico.';

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export async function onRequestPost({ request, env }) {
  // mensagens distintas para saber se o segredo não chegou ao deploy ou se a senha digitada não confere
  if (!env.SENHA_DUVIDAS || !env.ANTHROPIC_API_KEY) return json({ erro: 'Servidor sem ' + (env.SENHA_DUVIDAS ? 'ANTHROPIC_API_KEY' : 'SENHA_DUVIDAS') + ' configurada.' }, 503);
  if ((request.headers.get('x-senha') || '').trim() !== env.SENHA_DUVIDAS.trim()) return json({ erro: 'Senha não confere.' }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ erro: 'Pedido inválido.' }, 400); }
  const pergunta = String(body.pergunta || '').trim().slice(0, 1000), contexto = String(body.contexto || '').slice(0, 8000);
  if (!pergunta) return json({ erro: 'Escreva a pergunta.' }, 400);
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
    return json(texto ? { texto } : { erro: 'Resposta vazia. Tente de novo.' });
  } catch (e) {
    return json({ erro: 'Falha ao consultar o Claude (' + (e.status || 'rede') + ').' }, 502);
  }
}
