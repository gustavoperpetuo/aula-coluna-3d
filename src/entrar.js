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
  /* botão do Google na própria página: o Google mostra o endereço do site, não o do Supabase, e o Supabase só recebe o token.
     Se o script do Google não carregar, fica o botão acima (fluxo por redirecionamento). */
  window.onGoogleLibraryLoad = async () => {
    if (!crypto.subtle) return; // fora de https (testes locais) fica o botão por redirecionamento
    const cru = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
    const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(cru));
    google.accounts.id.initialize({
      client_id: '921714836663-pbtkcien4pdpcqqj4dfsiv1ntm6k5cah.apps.googleusercontent.com',
      nonce: [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join(''),
      callback: async r => {
        guarda('entrou', null); erro.hidden = true;
        const { error } = await SB.auth.signInWithIdToken({ provider: 'google', token: r.credential, nonce: cru });
        if (error) falha(/Cadastro só com e-mail|Database error saving new user/i.test(error.message) ? 'Use o e-mail de uma das empresas do grupo.'
          : 'Não foi possível entrar. Código: ' + (error.code || error.status || 'desconhecido') + '.');
      }
    });
    google.accounts.id.renderButton(document.getElementById('gbtn'), { theme: 'filled_blue', size: 'large', text: 'signin_with', shape: 'rectangular', locale: 'pt-BR' });
  };
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
