/* ================= Login ================= */
(function () {
  const btn = document.getElementById('google'), erro = document.getElementById('erro');
  const falha = t => { erro.textContent = t; erro.hidden = false; };
  // o Supabase volta para esta página com os tokens no hash ou com error/error_description (e-mail fora dos domínios do grupo é recusado no cadastro)
  const p = new URLSearchParams(location.search.slice(1) + '&' + location.hash.slice(1));
  // volta: a página que o middleware recusou; fica na aba para sobreviver à ida ao Google
  const volta = p.get('volta'), guarda = (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { } };
  if (volta) guarda('volta', volta);
  // o Supabase não repassa o texto do gatilho checar_dominio ("Cadastro só com e-mail das empresas do grupo."): devolve o genérico
  // "Database error saving new user"; como o único gatilho em auth.users é o de domínio, os dois textos valem como recusa de domínio
  const codigo = p.get('error_code') || p.get('error');
  if (codigo || p.get('error_description')) falha(
    /Cadastro só com e-mail|Database error saving new user/i.test(p.get('error_description') || '') ? 'Use o e-mail de uma das empresas do grupo.'
      : p.get('error') === 'access_denied' ? 'Login cancelado.'
      : 'Não foi possível entrar. Código: ' + (codigo || 'desconhecido') + '.');
  if (!SB) { falha('Sem conexão com o serviço de login. Tente de novo em instantes.'); btn.disabled = true; return; }
  btn.onclick = () => { guarda('entrou', null); SB.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/entrar' } }); };
  if (!erro.hidden) return; // com erro na URL fica aqui, mesmo que reste uma sessão antiga
  SB.auth.onAuthStateChange((ev, s) => {
    if (!s) return;
    let v = '/', t = 0;
    try { v = sessionStorage.getItem('volta') || '/'; t = +sessionStorage.getItem('entrou') || 0; } catch (e) { }
    // trava contra laço: se o servidor recusar o token recém-entregue, o middleware devolve para cá em segundos e a página fica parada
    if (Date.now() - t < 10000) return;
    guarda('entrou', Date.now()); guarda('volta', null);
    location.replace(/^\/(?![\/\\]|entrar)/.test(v) ? v : '/'); // só caminhos do próprio site
  });
})();
