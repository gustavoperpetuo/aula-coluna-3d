# Aula 3D da coluna vertebral

Aula interativa de anatomia e doenças da coluna, do básico ao nível de especialista. Um único modelo 3D procedural (Three.js r128) serve às duas partes: 8 capítulos de anatomia com 30 passos e testes, e 18 doenças mostradas no próprio modelo, com alternância entre normal e doente, cortes sagital e axial e régua de níveis.

## Estrutura

- `src/head.html`: CSS e marcação da aula.
- `src/home.html`: hub das aulas, publicado na raiz do site.
- `src/entrar.html` e `src/entrar.js`: página de login (`/entrar`), a única pública.
- `src/admin.html` e `src/admin.js`: painel do administrador (`/admin`), com quem entrou e o que cada pessoa viu; os dados vêm da RPC `painel_admin()` do Supabase, que recusa quem não está na tabela `admins`. O hub mostra o link Administração quando `eh_admin()` responde sim.
- `src/auth.js`: cliente do Supabase, cookie da sessão, primeiro nome e botão Sair; incluído na aula, no hub e no login.
- `functions/_middleware.js`: fecha o site; `functions/api/pergunta.js`: tira-dúvidas; `functions/api/transcrever.js`: voz do tira-dúvidas.
- `src/geo.js`: geometria procedural da coluna (`buildSpine(mods)`); as doenças entram como modificações (`mods`).
- `src/content.js`: capítulos, passos, testes, fichas das estruturas e notas por nível.
- `src/disease.js`: as 18 doenças, com texto, fontes citadas e configuração da cena.
- `src/rm.js`: modo Ressonância, com 3 casos reais de RM lombar do SPIDER (CC BY 4.0), a graduação de cada disco e os 18 passos.
- `dist/rm/<caso>/`: as séries e máscaras dos casos em NIfTI (`.nii.gz`), só em `dist/` (não há cópia em `src/`); O `build.py` não mexe nelas. Ficam fechadas pelo middleware como o resto do site. Origem, conversão e conferência dos níveis em `docs/ressonancia.md`.
- `src/app.js`: interface, câmera, cortes, rótulos, régua e testes.
- `build.py`: junta tudo em `dist/coluna-vertebral.html`, um arquivo único que abre direto no navegador, e gera o hub em `dist/index.html`, o login em `dist/entrar.html` e o painel em `dist/admin.html`. Escreve doctype, `meta charset` e `meta viewport`; falha se encontrar travessão.
- `tests/`: testes automáticos em Playwright.
  - `smoke.js`: desktop, celular, falha do 3D, modo Ressonância (lista de casos, imagem na tela, clique num disco com o nome e o 3D aceso, teste certo e errado, toque e quadro único em 390 px) e login simulado (nome e Sair na aula e no hub, soma do progresso com limpeza em outro aparelho e navegador compartilhado, token no tira-dúvidas, microfone com gravação simulada).
  - `admin.js`: painel do administrador com as RPCs simuladas (linhas e totais X de N, aviso de acesso restrito, link no hub só para o administrador).
  - `regua.js`: régua e desfazer seleção.
  - `ligamentos.js`: falha se corpo vertebral, sacro ou disco atravessar o LLA ou o LLP, na coluna normal e em todas as doenças.
  - `fechadas.js`: falha se alguma peça sólida tiver borda aberta, em todas as doenças, ou se duas partes da mesma peça correrem quase coladas na coluna normal; as duas coisas viram fenda na tela.
  - `maiusculas.js`: falha se algum texto exibido, na aula ou no hub, tiver minúscula depois de ponto ou de ponto e vírgula.
  - `pergunta.mjs`: função do tira-dúvidas sem rede (token, limite diário, validação, resposta e erro da API simulados).
  - `transcrever.mjs`: função da voz sem rede, com o binding AI simulado (texto, áudio acima de 2 MB, sem binding, erro do modelo).
  - `middleware.mjs`: middleware sem rede, com tokens assinados por um par de chaves local (sem cookie, expirado, assinatura, emissor e audiência errados, válido, JWKS fora do ar).
  - `cortes.js`: confere que nenhuma lesão some ao trocar de corte.
- `docs/`: retrospectiva do projeto e relatório da ressonância.

## Publicação

Site no Cloudflare Pages, ligado ao GitHub: hub em https://aula-coluna-3d.pages.dev/ e aula em https://aula-coluna-3d.pages.dev/coluna-vertebral. Todo push na `main` publica em cerca de 1 minuto; outros branches ganham prévia em `https://<branch-com-hifens>.aula-coluna-3d.pages.dev`. Build no Cloudflare: `python3 build.py`, saída `dist`. O `dist/` também vai versionado, então qualquer mudança em `src/` ou `build.py` sai com o `dist/` regerado no mesmo commit.

## Uso

    python3 build.py          # gera dist/coluna-vertebral.html e dist/index.html
    npm install               # three 0.128.0, supabase-js 2.117.3, niivue 0.69.0 e playwright 1.56.1, só para os testes
    npm test

O Playwright fica fixo em 1.56.1 porque usa o Chromium 1194, já instalado nas sessões do Claude Code na nuvem. Numa máquina sem esse Chromium, rodar antes `npx playwright install chromium`. O `cortes.js` é lento; para mudanças pequenas bastam `node tests/smoke.js` e `node tests/regua.js`.

Abra `dist/coluna-vertebral.html` no navegador. O arquivo carrega o Three.js e o supabase-js por CDN; aberto direto, sem o middleware, a aula funciona sem login e o progresso fica só no navegador. Os testes também abrem `dist/` direto.

## Como o código funciona

- Desenho sob demanda: `invalidate()` marca a cena como suja e o laço só renderiza nesse caso ou com destaque pulsando. Código novo que mude a cena, os rótulos ou algo sobre o 3D chama `invalidate()` (ou `applyVisuals()`, que já chama).
- Cache de modelos: o modelo normal e o da última doença ficam guardados, e alternar entre eles não remonta a geometria. Nada muta o modelo depois de montado, exceto `anchors` (Denis).
- `mergeGeoms` (`src/geo.js`) gera geometria indexada.
- Chaves de rótulo: chave de nível (C1 a L5, `sacrum`, `coccyx`) seleciona a vértebra inteira, igual à régua; chave de parte (`disc.L4-L5`, `C7.sp`) seleciona só a parte; `cam:<nível>` só leva a câmera, para conceitos como curvaturas e ápices.
- Layout no desktop (acima de 900 px): trilha à esquerda com Anatomia/Doenças e capítulos (`placeNav()` os devolve ao topo e ao painel no celular), recolhível pelo botão « com estado salvo; camadas e cortes sempre abertos no topo do 3D; divisória arrastável entre 3D e texto. Preferências ficam em `localStorage`, chave `coluna3d.v1`.
- O título da aula leva ao hub.
- Ressonância (`src/rm.js`, `RM_CASES`): a NiiVue 0.69.0 entra por `<script>` com integridade só ao abrir o modo; O 3D vira um encarte no canto do visualizador, com o mesmo canvas e a mesma cena. Passos vistos em `rmSeen` (`<caso>.<passo>`), somados e limpos como as outras listas.
- Procedimentos (`src/proc.js`, `PROC`) usam o fluxo das doenças com outros campos de texto. Peças por `mods` em `buildSpine`: `needles` (`{ to, from }` ou `{ to, via, len }`, calibre `g`; ponto é âncora como `'L1.ped.L'` ou `[quadro, x, y, z]` no referencial de uma vértebra ou disco), `contrast`, `mbranch`, `rf`, `cement`, `cage`, `screws` (hastes automáticas) e `facetectomy`.

## Regras de conteúdo

- Todo número clínico tem fonte citada no texto.
- Sem travessões (o build falha se encontrar um).
- Depois de ponto e de ponto e vírgula, maiúscula.
- Fundo claro, fonte de leitura (Source Sans 3), pouca caixa alta.

## Login

O site inteiro exige login com Google. `functions/_middleware.js` roda antes de cada pedido e só deixa passar sem sessão `/entrar`, a imagem da coluna que o login mostra e os ícones; o resto (HTML, imagens, `/api/*`) precisa do token de acesso do Supabase no cookie `sb`, que `src/auth.js` mantém igual à sessão, inclusive quando o token é renovado. O middleware confere a assinatura ES256 com a chave pública do projeto (`https://ugvqhjyeekyufxuyvozc.supabase.co/auth/v1/.well-known/jwks.json`, guardada 10 minutos), a validade, a audiência `authenticated` e o emissor. Sem token válido, página vai para `/entrar` e o resto recebe 401. Se a JWKS não puder ser lida, página recebe um aviso curto em HTML e API recebe JSON, ambos com 503. A aula e o hub mostram o primeiro nome e o botão Sair.

Só entram e-mails destes domínios: renovamedical.com.br, medic.com.br, rellif.com.br, dnabio.com.br, neuropharma.com.br, salvadormedical.com.br, neosurgical.com.br e allivia.com.br. A lista fica na tabela `dominios_permitidos` do Supabase, e o gatilho `checar_dominio` em `auth.users` recusa o cadastro de qualquer outro. O Supabase não repassa o texto do gatilho: volta para `/entrar` com `error_description=Database error saving new user`, e a página mostra "Use o e-mail de uma das empresas do grupo.". Login cancelado no Google (`error=access_denied`) mostra "Login cancelado."; outro erro mostra uma mensagem curta com o código.

Progresso: depois do login, e a cada mudança com 1,5 s de atraso, a aula lê a linha da pessoa em `progresso`, soma com o `localStorage` e grava a soma. Marcas de visto são unidas, cada uma com a hora em que foi feita (`em`); em cada teste fica o resultado com mais acertos. O botão de limpar progresso grava a hora em `zeradoEm`, e na soma uma marca anterior ao último limpar de qualquer aparelho não volta. Se outra conta entrar no mesmo navegador, o progresso local da anterior não soma. Sem rede, tudo segue no navegador.

Tira-dúvidas: botão "Dúvida?" para quem está logado. A função manda o token para `registrar_pergunta` no Supabase, que confere a pessoa e aplica o limite de 30 perguntas por dia (429 acima disso); a resposta traz quantas restam, mostradas no campo da pergunta. Único segredo na Cloudflare (Settings, Variables and Secrets): `ANTHROPIC_API_KEY`. O antigo `SENHA_DUVIDAS` pode ser apagado.

Voz no tira-dúvidas: o botão do microfone grava até 60 s, o navegador converte para WAV 16 kHz mono e manda para `functions/api/transcrever.js`, que passa o áudio ao Whisper (`@cf/openai/whisper-large-v3-turbo`) do Workers AI pelo binding `AI` do projeto no Pages (produção e prévia). O texto entra no campo da pergunta, sem enviar. Custa cerca de 47 neurons por minuto de áudio, dentro da cota grátis de 10.000 neurons por dia da conta inteira (uns 210 minutos). Sem o binding, a função responde 503.

Configuração que precisa existir no painel do Supabase:

- Authentication, Sign In / Providers: Google ligado, com Client ID e Secret do Google Cloud (no Google Cloud, URI de redirecionamento autorizado `https://ugvqhjyeekyufxuyvozc.supabase.co/auth/v1/callback`); Email desligado.
- Authentication, URL Configuration: Site URL `https://aula-coluna-3d.pages.dev`; Redirect URLs `https://aula-coluna-3d.pages.dev/entrar` e, para as prévias, `https://*.aula-coluna-3d.pages.dev/entrar`.

## Pendências

- Números ainda sem fonte aberta: ressonância após cerca de 6 semanas na hérnia; listese degenerativa em mulheres acima de 50 anos; corte ASAS de início antes dos 45 anos; preservar metade da faceta; Kishimoto (área das placas); Stoney (idade acima de 65).
- Capítulo de técnicas e implantes (TLIF, PLIF, ALIF, XLIF, OLIF, cages, parafusos); escopo a definir.
- `tests/cortes.js` ainda só relata as lesões que somem nos cortes; falta virar asserção.
