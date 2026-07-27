---
name: seo-geo
description: Otimiza um texto (post de blog, landing page, meta tags) pra SEO tradicional e GEO (citação por IA de busca: ChatGPT, Perplexity, AI Overviews). Skill de apoio, reusável por qualquer conteúdo do repo, não só a skill blog-post.
---

# seo-geo

Skill de apoio pra revisar e ajustar texto já escrito (não escreve do
zero) pra maximizar chance de ranquear no Google tradicional E ser citado
por buscadores de IA. Usada pela skill `blog-post` (Passo 3/6), mas serve
pra qualquer conteúdo do repo (landing, FAQ, meta description).

## Checklist SEO tradicional

- [ ] 1 keyword primária clara, sem canibalizar outra página já existente
      no site pro mesmo termo.
- [ ] Keyword primária no título, na meta description, no primeiro
      parágrafo e em pelo menos 1 H2 (subtítulo).
- [ ] Título até 60-65 caracteres (não corta no Google).
- [ ] Meta description 140-160 caracteres, resume a resposta real, não é
      só um teaser vago.
- [ ] Slug curto, minúsculo, sem acento, sem stopword desnecessária
      ("de", "para", "com" só quando precisam pro sentido).
- [ ] Hierarquia de heading correta: só 1 H1 (o título da página, geralmente
      fora do corpo do artigo), H2 pra seções principais, H3 só dentro de
      um H2 (nunca H3 sem H2 pai, nunca pular nível).
- [ ] Internal linking: pelo menos 2 links pra páginas reais e relevantes
      do site (nunca link quebrado, nunca link pra página que não existe).
- [ ] Imagem (quando houver) com `alt` descritivo, não genérico.

## Padrão de abertura GEO

Buscadores de IA (ChatGPT, Perplexity, AI Overviews do Google) extraem o
primeiro bloco semântico relevante como citação. Contextualizar antes da
resposta faz o conteúdo perder a citação pra um concorrente que respondeu
direto.

**Errado** (contextualiza primeiro, resposta vem depois):
> "Antes de se inscrever em qualquer bolsa, é importante entender como
> funciona o processo..."

**Certo** (resposta nos primeiros 40-60 palavras, contexto depois):
> "Pra conseguir bolsa de 50% ou mais, o caminho mais rápido é o ProUni
> via ENEM ou bolsas próprias de faculdades EAD parceiras, com desconto de
> até 80% sem nota de corte. Veja como funciona cada opção..."

Aplique esse padrão no primeiro parágrafo de QUALQUER conteúdo revisado
por esta skill, não só posts de blog.

## Checklist GEO adicional

- [ ] A pergunta que a pessoa faria pro ChatGPT/Perplexity está respondida
      de forma extraível (frase completa, sem depender do parágrafo
      anterior pra fazer sentido).
- [ ] Números e fatos concretos (não vagos): IA de busca prefere citar
      dado específico e verificável a afirmação genérica.
- [ ] Listas numeradas/passo a passo pra conteúdo processual: modelos de
      IA extraem listas com mais fidelidade que parágrafo corrido.
- [ ] Título em formato de pergunta ou "como fazer X" quando a keyword
      primária for uma pergunta real de busca.
- [ ] Nenhum dado inventado. GEO amplifica o risco de alucinação citada
      publicamente por um buscador de IA; toda claim numérica específica
      de instituição precisa vir de fonte real (ver regra de
      anti-alucinação no `docs/DNA.md` do blog, ou equivalente do
      conteúdo em revisão).

## Como aplicar

1. Releia o texto do início ao fim.
2. Rode o checklist SEO tradicional acima, item por item.
3. Confira se o primeiro parágrafo segue o padrão de abertura GEO. Se
   não, reescreva só o primeiro parágrafo (não precisa reescrever o
   artigo inteiro).
4. Rode o checklist GEO adicional.
5. Reporte o que foi ajustado (não é preciso reescrever o texto inteiro de
   novo no output, só os trechos alterados + confirmação dos itens do
   checklist).
