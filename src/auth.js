/* ================= Sessão (Supabase) ================= */
// functions/_middleware.js só libera o site com o token de acesso no cookie sb; aqui o cookie acompanha a sessão, inclusive na renovação.
// Nas páginas com #conta (aula e hub) mostra o primeiro nome e liga o Sair.
// Sem o supabase-js (CDN fora do ar) SB fica null e a aula segue só com o localStorage.
var SB = null;
try {
  SB = supabase.createClient('https://ugvqhjyeekyufxuyvozc.supabase.co', 'sb_publishable_FbgScRDcBuqkEt77OKKnpQ_Rb_K07Xq');
  SB.auth.onAuthStateChange((ev, s) => {
    document.cookie = 'sb=' + (s ? s.access_token + '; Max-Age=' + Math.max(0, s.expires_at - Math.floor(Date.now() / 1000)) : '; Max-Age=0') + '; Path=/; SameSite=Lax; Secure';
    const conta = document.getElementById('conta');
    if (!s || !conta) return;
    const m = s.user.user_metadata || {}, quem = document.getElementById('quem');
    quem.textContent = String(m.full_name || m.name || '').split(' ')[0] || s.user.email; quem.title = s.user.email || '';
    conta.hidden = false;
    document.getElementById('sair').onclick = () => SB.auth.signOut({ scope: 'local' }).finally(() => location.replace('/entrar'));
  });
} catch (e) { SB = null; }
