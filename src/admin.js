/* ================= Painel do administrador ================= */
// public.painel_admin() recusa quem não está em public.admins ('Acesso restrito.'); a página só mostra o que vier.
// Totais e teste final com as mesmas listas e contas da aula (src/app.js: progress() e bindQuiz()).
(function () {
  const $ = id => document.getElementById(id), estado = $('estado');
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const quando = t => t ? new Date(t).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : '';
  const visto = (lista, total) => `${Array.isArray(lista) ? lista.length : 0} de ${total}`;
  // como bindQuiz() mostra "X de N certas, faltam Y" para o teste final (store.quiz.dz)
  const teste = a => {
    const s = a || {}, n = Object.keys(s).length, ok = Object.entries(s).filter(([i, o]) => DZ_QUIZ[i] && DZ_QUIZ[i][2] === o).length;
    return n ? `${ok} de ${DZ_QUIZ.length} certas` + (n < DZ_QUIZ.length ? `, faltam ${DZ_QUIZ.length - n}` : '') : 'Não fez';
  };
  // passos de ressonância (src/rm.js); marcas antigas, de antes das trilhas, não contam, como em src/app.js
  const rmVisto = l => visto(Array.isArray(l) ? l.filter(v => RM_IDS.includes(v)) : [], RM_IDS.length);
  const falha = html => { estado.innerHTML = html; };
  if (!SB) return falha('Não foi possível carregar os dados. Recarregue a página.');
  SB.rpc('painel_admin').then(({ data, error }) => {
    if (error) return falha(error.message === 'Acesso restrito.' ? 'Página restrita ao administrador. <a href="/">Voltar ao início</a>' : 'Não foi possível carregar os dados. Recarregue a página.');
    const L = data || [], semana = Date.now() - 7 * 864e5;
    // ativa: entrou ou mexeu no progresso nos últimos 7 dias (o último acesso do Supabase só muda a cada login)
    $('r-pessoas').textContent = L.length;
    $('r-ativas').textContent = L.filter(r => Math.max(Date.parse(r.ultimo_acesso) || 0, Date.parse(r.progresso_em) || 0) > semana).length;
    $('r-hoje').textContent = L.reduce((t, r) => t + (r.perguntas_hoje || 0), 0);
    $('linhas').innerHTML = L.map(r => {
      const p = r.progresso || {}, email = r.email || '';
      return `<tr><th scope="row">${esc(r.nome || email)}${r.nome ? `<span>${esc(email)}</span>` : ''}</th><td>${esc(email.split('@')[1])}</td>`
        + `<td class="w">${quando(r.primeiro_acesso)}</td><td class="w">${quando(r.ultimo_acesso)}</td>`
        + `<td>${visto(p.seen, ALL_STEPS.length)}</td><td>${visto(p.dzSeen, DZ.length)}</td><td>${visto(p.procSeen, PROC.length)}</td><td>${rmVisto(p.rmSeen)}</td>`
        + `<td class="w">${teste((p.quiz || {}).dz)}</td><td>${r.perguntas_total || 0}</td><td>${r.perguntas_hoje || 0}</td>`
        + `<td>${((r.voz_segundos_total || 0) / 60).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} min</td></tr>`;
    }).join('');
    estado.textContent = L.length ? 'Quem entrou no Atlas da Coluna e o que cada pessoa já viu.' : 'Ninguém entrou ainda.';
    $('resumo').hidden = false; $('tabela').hidden = !L.length;
  });
})();
