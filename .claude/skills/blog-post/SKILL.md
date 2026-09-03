---
name: blog-post
description: Escreve e publica um post no blog do Bolsa Click (SEO/GEO), de ponta a ponta. DNA, tema, escrita, humanização, validação e publicação direta via API. Uso PONTUAL/situacional (newsjacking, mudança regulatória, urgência do dia), não substitui a cadência regular do Hermes. Invocação manual apenas, sem cron.
---

# /blog-post

Escreve e publica UM post no blog do Bolsa Click, do zero até o ar, numa
única execução. **Uso pontual/situacional**: newsjacking, resposta a
mudança regulatória (ex.: nova regra do Prouni/FIES), post de urgência
decidido no dia. **Não é a cadência regular do blog**. Isso é trabalho do
Hermes (agente externo, publica via esta mesma API). Esta skill não tem
cron/schedule. Só roda quando um humano decide explicitamente publicar
algo agora.

## Antes de rodar: pré-requisitos de ambiente

- `AGENT_BLOG_API_KEY` disponível no ambiente (mesma chave que o Hermes usa
  pra publicar, ver `app/lib/middleware/agent-auth.ts`). Sem ela, pare e
  peça pro operador configurar.
- Acesso de rede ao domínio de produção (`https://www.bolsaclick.com.br`).
  Esta skill publica DIRETO em produção. Não existe staging pro blog.
- Repo local com `docs/DNA.md` e `docs/blog-example-post.html` presentes
  (infra desta mesma skill). Se não existirem, pare e reporte: algo está
  desalinhado.

**Aviso**: o Passo 7 desta skill publica de verdade, sem pedir confirmação
extra e sem PR. Isso é intencional (decisão do CEO): a skill já reúne
validação suficiente nos passos anteriores pra isso ser seguro. Se algo
parecer errado em qualquer passo, PARE e reporte em vez de seguir.

## Passo 1: ler o DNA e as skills de apoio

Leia **o `docs/DNA.md` inteiro** (não resuma, não pule seções). É a fonte
de verdade de tom, keywords, pilares de conteúdo e, principalmente, os
guardrails obrigatórios (proibição de concorrentes, anti-alucinação,
fontes permitidas). Esses guardrails são independentes do `CLAUDE.md` do
repo. Não assuma que "já sabe": releia sempre, porque este é um pipeline
separado do Hermes e não há herança automática de contexto entre eles.

Se existirem, leia também `.claude/skills/seo-geo/SKILL.md` e
`.claude/skills/humanizer/SKILL.md`. Vão ser usadas nos Passos 3 e 4.

## Passo 2: escolher o tema

1. Confirme com quem pediu a publicação qual é o motivo pontual (o gatilho
   de newsjacking/urgência/mudança regulatória). Não invente um tema por
   conta própria sem esse contexto: esta skill não é pra preencher
   calendário editorial.
2. Consulte os posts já publicados pra não repetir tema:
   ```
   GET https://www.bolsaclick.com.br/api/agents/blog/posts?limit=100
   Header: X-Agent-Key: <AGENT_BLOG_API_KEY>
   ```
   (pagina com `?page=2` etc. se precisar ver mais que os 100 mais
   recentes). Se o tema pontual já foi coberto recentemente, ou avise que
   vai ser uma atualização de um post existente (não crie slug duplicado
   sem necessidade), ou ajuste o ângulo.
3. Consulte as categorias ativas pra escolher `categoryIds` reais. Nunca
   invente uma categoria nova sem necessidade; só crie via
   `POST /api/agents/blog/categories` se genuinamente não existir nenhuma
   que sirva:
   ```
   GET https://www.bolsaclick.com.br/api/agents/blog/categories
   Header: X-Agent-Key: <AGENT_BLOG_API_KEY>
   ```
4. Defina: keyword primária, título (≤65 caracteres, pergunta ou "como
   fazer"), slug (curto, minúsculo, sem acento), meta description
   (140-160 caracteres), categoria(s), autor (uma persona real de
   `app/lib/blog/editorial-team.ts`, ver seção "Autoria" do DNA.md).

## Passo 3: escrever

Escreva o corpo do artigo (campo `content`, HTML) copiando o padrão de
marcação e voz de `docs/blog-example-post.html`. Mesmas tags (`p`, `h2`
com `id`, `h3`, `ul`/`ol`/`li`, `strong`, `blockquote`), mesmo tom.

- `publishedAt` = data de hoje (ISO).
- 900-1500 palavras.
- Siga TODAS as regras de SEO do DNA.md (abertura GEO respondendo a query
  em 40-60 palavras, 1 keyword primária em título+description+1º
  parágrafo+1 H2, lista numerada ou passo a passo, internal linking pra
  rotas reais do site).
- Links internos: só pra rotas que você confirmou que existem (`/blog/*`
  de posts reais consultados no Passo 2, `/curso/resultado`,
  `/bolsas-de-estudo`, `/graduacao`, `/pos-graduacao`,
  `/cursos-profissionalizantes`, `/carreiras`, `/central-de-ajuda`,
  `/simulador-de-bolsa`). Nunca invente um slug de post pra linkar.
- Se o tema exigir preço, percentual de bolsa ou nota MEC de uma
  instituição específica, isso **tem que vir de dado real** (catálogo
  first-party via API/DB deste repo, ou fonte da whitelist do DNA.md).
  Nunca invente o número. Sem dado real disponível, fale em termos
  genéricos já validados (6 redes parceiras, 280+ cidades, desconto até o
  teto de `DISCOUNT_CEILING_PCT` — conferir o valor atual em
  `app/lib/copy/claims.ts`, nunca hardcodear o número aqui).

## Passo 4: humanizar

Aplique `.claude/skills/humanizer/SKILL.md` se existir; senão, aplique
manualmente:

- Eliminar travessão (— ou –) em qualquer parte do texto.
- Eliminar linguagem de IA: "no cenário atual", "vale ressaltar", "em
  suma", "mergulhe", "desbloqueie", "eleve", "é importante notar que" e
  variantes.
- Eliminar paralelismo negativo forçado ("não é só X, é Y").
- Reduzir voz passiva excessiva.
- Variar tamanho de frase (evitar sequência de frases todas do mesmo
  tamanho/estrutura).
- Releia o texto inteiro depois de aplicar essas correções. Confirme que
  ainda soa natural, não robótico ao contrário (correções em excesso
  também soam artificiais).

## Passo 5: registrar

Nada a fazer manualmente aqui. Neste repo, "registro" é a própria chamada
`POST /api/agents/blog/posts` do Passo 7. A página `/blog` e `/blog/slug`
já consultam o banco direto (`prisma.blogPost.findMany/findUnique`), então
qualquer post criado pela API já aparece automaticamente, sem editar
código nenhum. Se você (agente) sentir vontade de criar um arquivo/rota
nova pro post, PARE: isso duplicaria a infra existente, não é o padrão
deste repo.

## Passo 6: validar

Antes de publicar, confira (sem rodar `npm run build`: não existe chunk
por post neste sistema, o build do Next não valida conteúdo de blog):

- [ ] Keyword primária presente em título, meta description, 1º parágrafo
      e pelo menos 1 H2.
- [ ] Título ≤65 caracteres; meta description 140-160 caracteres.
- [ ] Zero travessão (— ou –) no texto inteiro.
- [ ] Zero linguagem de IA da lista do Passo 4.
- [ ] Zero dado numérico específico de instituição sem lastro em dado
      real (releia cada preço/percentual/nota citados).
- [ ] Zero menção a concorrente (Quero Bolsa, EducaMais Brasil, Vai de
      Bolsa, Bolsa Universitária, qualquer agregador similar).
- [ ] Links internos apontam pra rotas reais (confirmadas no Passo 2/3).
- [ ] `slug` não colide com um post existente (reconfira via
      `GET /api/agents/blog/posts?slug=<slug>`. A API também rejeita com
      409 se colidir, mas é melhor pegar antes).
- [ ] `author` bate exatamente com uma persona de
      `app/lib/blog/editorial-team.ts`.
- [ ] Contagem de palavras entre 900 e 1500.

Se qualquer item falhar e você não conseguir corrigir com confiança, **NÃO
publique**. Vá pro Passo 7 no modo "não entregar" (pare e reporte o que
falhou, sem chamar o POST).

## Passo 7: entregar

Se passou na validação, publique DIRETO, sem PR, sem pedir confirmação
extra (decisão travada pelo CEO):

```
POST https://www.bolsaclick.com.br/api/agents/blog/posts
Header: X-Agent-Key: <AGENT_BLOG_API_KEY>
Header: Content-Type: application/json
Body: {
  "slug": "...",
  "title": "...",
  "excerpt": "...",
  "content": "<html>...",
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["...", "..."],
  "author": "<persona do editorial-team.ts>",
  "categoryIds": ["<id real de /categories>"],
  "tags": ["...", "..."],
  "isActive": true,
  "featured": false,
  "publishedAt": "<hoje em ISO>"
}
```

Depois do 201, confirme que subiu de verdade:

```
GET https://www.bolsaclick.com.br/api/agents/blog/posts?slug=<slug>
```

**Nota sobre "commit direto"**: o guia genérico desta skill (documentado
em `docs/DNA.md`) descreve a entrega como um `git commit` de arquivos de
conteúdo. Neste repo isso não se aplica literalmente: o conteúdo do post
vive no Postgres (`BlogPost.content`), não em arquivo versionado. **O
POST acima É o "commit direto"**: publica em produção imediatamente, sem
PR, sem gate de aprovação humana antes da ação em si, mesmo espírito da
regra original (nenhuma revisão bloqueia a publicação quando a skill roda
manualmente), só que a ação irreversível é uma chamada de API, não um
`git push`. Não há nenhum arquivo de código pra commitar neste passo. Se
você (agente) achar que precisa rodar `git add`/`git commit` aqui, pare:
provavelmente confundiu o trabalho de infra desta skill (que segue PR
normal) com a execução da skill em si (que não toca em git nenhuma vez).

Se o passo anterior (Passo 6) falhou e não foi corrigido: **NÃO chame o
POST**. Pare e reporte exatamente o que impediu a publicação.

### Resumo final (sempre reportar, publicado ou não)

- Tema e gatilho (newsjacking/regulatório/urgência) que motivou o post
- Keyword primária
- Slug
- Contagem de palavras
- Se publicou: `id` do post retornado pela API + URL final
  (`https://www.bolsaclick.com.br/blog/<slug>`)
- Se NÃO publicou: o que falhou na validação e por quê
