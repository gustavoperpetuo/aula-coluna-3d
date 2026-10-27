"""Junta os arquivos de src/ num único HTML autocontido em dist/coluna-vertebral.html."""
from pathlib import Path
root = Path(__file__).parent
src = root / 'src'
head = (src / 'head.html').read_text(encoding='utf-8')
geo = (src / 'geo.js').read_text(encoding='utf-8')
js = ''.join((src / f).read_text(encoding='utf-8') + '\n' for f in ['content.js', 'disease.js', 'proc.js', 'app.js'])
# doctype, charset e viewport: sem eles o navegador abre em modo de compatibilidade,
# troca os acentos quando o servidor não manda charset e o celular recebe o layout de desktop
doc = ('<!doctype html>\n<html lang="pt-BR">\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<link rel="icon" type="image/png" sizes="32x32" href="/icone-32.png">\n'
       '<link rel="apple-touch-icon" href="/icone-180.png">\n')
# login: supabase-js 2.117.3 pelo jsDelivr, byte a byte igual a node_modules/@supabase/supabase-js (hash calculado de lá);
# src/auth.js cria o cliente e mantém o cookie que functions/_middleware.js confere
auth = ('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js" integrity="sha384-BWcjm9OdFth9TbhCxZPdm+gAOUMAzQy9nmTs12ioXdCcbVnJaPMn+fMUoQCLt60R" crossorigin="anonymous"></script>\n'
        '<script>\n' + (src / 'auth.js').read_text(encoding='utf-8') + '</script>\n')
out = (doc + head
       # integridade: o navegador recusa o script se o CDN entregar outro conteúdo. Os dois vêm do pacote npm
       # three@0.128.0 pelo jsDelivr, byte a byte igual a node_modules/three (hashes calculados de lá)
       + '\n<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js" integrity="sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu" crossorigin="anonymous"></script>'
       + '\n<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js" integrity="sha384-wagZhIFgY4hD+7awjQjR4e2E294y6J2HSnd8eTNc15ZubTeQeVRZwhQJ+W6hnBsf" crossorigin="anonymous"></script>'
       + '\n' + auth + '<script>\n' + geo + '</script>\n<script>\n' + js + '</script>\n')
(root / 'dist').mkdir(exist_ok=True)
assert '—' not in out and '–' not in out, 'travessão encontrado'
(root / 'dist' / 'coluna-vertebral.html').write_text(out, encoding='utf-8')
print(len(out), 'bytes')
# hub das aulas na raiz do site
home = doc + (src / 'home.html').read_text(encoding='utf-8') + auth  # auth: cookie da sessão, nome e Sair
assert '—' not in home and '–' not in home, 'travessão encontrado na home'
(root / 'dist' / 'index.html').write_text(home, encoding='utf-8')
# página de login, pública
entrar = doc + (src / 'entrar.html').read_text(encoding='utf-8') + auth + '<script>\n' + (src / 'entrar.js').read_text(encoding='utf-8') + '</script>\n'
assert '—' not in entrar and '–' not in entrar, 'travessão encontrado no login'
(root / 'dist' / 'entrar.html').write_text(entrar, encoding='utf-8')
# política de privacidade, pública (o Google exige a URL para publicar o app OAuth)
(root / 'dist' / 'privacidade.html').write_text(doc + (src / 'privacidade.html').read_text(encoding='utf-8'), encoding='utf-8')
for f in ('coluna-lateral.webp', 'coluna-deitada.webp', 'icone-32.png', 'icone-180.png'): (root / 'dist' / f).write_bytes((src / f).read_bytes())
print(len(home), 'bytes (home)')
