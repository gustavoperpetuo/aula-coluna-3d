"""Junta os arquivos de src/ num único HTML autocontido em dist/coluna-vertebral.html."""
from pathlib import Path
root = Path(__file__).parent
src = root / 'src'
head = (src / 'head.html').read_text(encoding='utf-8')
geo = (src / 'geo.js').read_text(encoding='utf-8')
js = ''.join((src / f).read_text(encoding='utf-8') + '\n' for f in ['content.js', 'disease.js', 'app.js'])
# doctype, charset e viewport: sem eles o navegador abre em modo de compatibilidade,
# troca os acentos quando o servidor não manda charset e o celular recebe o layout de desktop
doc = ('<!doctype html>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n')
out = (doc + head
       + '\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
       + '\n<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>'
       + '\n<script>\n' + geo + '</script>\n<script>\n' + js + '</script>\n')
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'coluna-vertebral.html').write_text(out, encoding='utf-8')
assert '—' not in out and '–' not in out, 'travessão encontrado'
print(len(out), 'bytes')
