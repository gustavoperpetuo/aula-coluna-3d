# Como escrever a Ressonância

Público: quem nunca leu uma ressonância e quer aprender. Ensina passo a passo; nunca supõe que a pessoa já sabe.

## Regras

1. Explique o que é novo da ressonância; não repita o que o app já ensinou. Conceitos de imagem aparecem aqui pela primeira vez e são explicados na primeira vez que surgem: como a ressonância forma a imagem, sinal, hipersinal, hipossinal, T1, T2, sequência de alta resolução, como cada estrutura aparece na imagem. Anatomia e doenças já ensinadas nas abas Anatomia e Doenças (vértebras, disco, núcleo e anel, placa terminal, líquor, cone e cauda equina, abaulamento, hérnia e suas formas, listese, Modic, estenose, cortes sagital e axial) não são reexplicadas: o texto diz como elas aparecem na ressonância e, se ajudar, remete à aba onde foram ensinadas ("visto em Doenças, Hérnia de disco"). Antes de supor que algo já foi ensinado, confira em src/content.js e src/disease.js; o que não estiver lá é novo e precisa de explicação.
2. Um conceito novo por passo. O passo só usa o que passos anteriores já ensinaram. Se precisa de algo novo, ensina ali, antes de usar.
3. Ver antes de ler. Cada passo começa com o que fazer na imagem ("Clique no disco L4-L5", "Troque para o T1") e só depois explica o que a pessoa está vendo.
4. Frases curtas, uma ideia por frase. Nada de listas longas separadas por vírgula num parágrafo.
5. Achados em tópicos, um nível por linha: "**L5-S1:** hérnia, disco mais baixo, Pfirrmann 3."
6. Negrito só no termo-chave do passo e no nível em cada tópico.
7. Fecho com o que levar: uma frase final "Na próxima ressonância, procure…".
8. Ordem dos casos: o Caso 1 ensina a base (como a imagem se forma, orientação, T1 e T2, contar vértebras, disco e corpo normais, canal, axial). Os casos seguintes usam essa base e acrescentam uma doença por vez.
9. Fatos clínicos e graduações vêm do SPIDER (valores do caso) ou de fonte citada. Sem números inventados.
10. Regras do site continuam: maiúscula depois de "." e ";", sem travessão, PT-BR.

## Formato no código (src/rm.js)

Cada parágrafo do passo é uma string. Uma string que começa com "- " vira item de lista; itens seguidos formam uma lista. `**texto**` vira negrito. O renderizador escapa o HTML antes de aplicar isso.
