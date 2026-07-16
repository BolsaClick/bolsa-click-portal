# GEO Analysis — bolsaclick.com.br
_Análise em 2026-05-25 | Foco: pillar `/bolsas-de-estudo` + cluster de 19 posts novos_

## GEO Readiness Score: **78/100**

| Plataforma | Score | Comentário |
|---|---|---|
| **Google AI Overviews** | 85/100 | Forte: schema rico, SSR, FAQ ampla, GEO direct-answer no topo. Falta: dateModified visível, Article schema com author |
| **ChatGPT (web search)** | 75/100 | Forte: llms.txt completo, robots permite OAI-SearchBot. Falta: sinal Wikipedia, mentions Reddit/YouTube |
| **Perplexity** | 72/100 | Forte: llms.txt + ClaudeBot permitido. Falta: presença Reddit (46.7% das citações Perplexity vêm de Reddit) |
| **Bing Copilot** | 80/100 | Cobertura padrão Bing OK; Bingbot já permitido |

---

## Baseline forte (mantém)

- ✅ **Robots.txt**: 14 AI crawlers explicitamente permitidos (GPTBot, OAI-SearchBot, ClaudeBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, CCBot, Bytespider, Applebot-Extended, Meta-ExternalAgent/Fetcher, cohere-ai, Diffbot) — `app/robots.ts`
- ✅ **llms.txt dinâmico**: route handler em `app/llms.txt/route.ts` puxa cursos/faculdades/posts do Prisma em runtime (cache 1h). Inclui "Dados importantes para citação" — formato ideal pra extração LLM
- ✅ **Schema sitewide**: WebSite, EducationalOrganization (com sameAs Instagram/Facebook/LinkedIn), ItemList nav, EducationalOccupationalProgram
- ✅ **Schema pillar**: BreadcrumbList, ItemList (cidades), WebSite, FAQPage (18 Q&A), HowTo (6 passos)
- ✅ **GEO direct-answer**: primeiros 60 palavras da pillar respondem direto a query. `data-speakable="answer"` marcado
- ✅ **SSR**: Next.js App Router com `revalidate=86400` na pillar — conteúdo é HTML-puro pra crawlers que não executam JS
- ✅ **Cluster topical**: 19 posts cobrindo Prouni/Fies/SISU/perfis/modalidades, todos com BlogPosting schema + FAQPage condicional

---

## Top 5 quick wins (implementando agora)

1. **dateModified visível + Article schema na pillar** — sinal de freshness pra Google AIO (alto impacto)
2. **`data-speakable` em mais blocos citáveis** (Tipos, Programas, Passos) — passage extraction LLM
3. **Twitter/X em sameAs** (Organization schema) — entity disambiguation
4. **Citações de fontes inline** (mec.gov.br, FNDE, INEP) — authority signal
5. **Reformatar TIPOS_BOLSA + PROGRAMAS em padrão definitional** ("X é...") — citability optimization

## Médio prazo (não bloqueia hoje)

6. **YouTube channel + sameAs** — correlação mais forte com AI citations (~0.737) segundo Ahrefs dez/2025
7. **Reddit AMA / r/brasilfaculdade presence** — 46.7% das citações Perplexity
8. **Wikipedia / Wikidata entry** — boost forte em ChatGPT (47.9% das citações)
9. **RSL 1.0 license file** — padrão emergente dez/2025

## Alto impacto (longo prazo)

10. **Original research / Estudo Bolsa Click** — `/estudos/panorama-bolsa-2026` já existe; expandir com dados próprios anuais
11. **Person schema pra autores** quando começarmos a ter autores reais (não "Equipe Bolsa Click" genérico)

---

## Passage-level citability — análise das seções da pillar

| Seção | Words estim. | Citável (134-167w) | Padrão |
|---|---|---|---|
| GEO direct-answer | 55 | ⚠️ curto | ✅ pergunta-resposta |
| Como funcionam | 130 | ✅ ideal | ✅ definitional |
| Tipos de bolsa (cada card) | 60-70 | ⚠️ curto | Pode reforçar com "X é..." |
| Tabela comparativa | tabular | ✅ tabela = forte sinal | ✅ Q&A ready |
| ProUni section | 350 | ⚠️ longo | Quebrar em sub-blocks de 150 |
| FIES section | 280 | ⚠️ longo | Quebrar em sub-blocks de 150 |
| FAQ items (cada um) | 70-95 | ⚠️ médio | ✅ formato Q&A puro |

## Conclusão

A pillar está em **boa forma estrutural** mas falta polish editorial pra maximizar passage extraction. Os 5 quick wins abaixo já elevam o score pra ~85/100. Wikipedia/Reddit/YouTube ficam pra trilha de brand-building paralela ao roadmap principal de 6 meses.

---
---

# UPDATE 2026-05-28 — Análise site-wide (objetivo: ser fonte #1 nas IAs)

> A análise de 25/mai acima continua válida **para o on-site da pillar**. Esta atualização amplia o
> escopo pro site inteiro + presença off-site, com dados coletados ao vivo. **Correção de rumo
> importante:** o que a análise anterior tratou como "trilha de brand-building paralela" (Wikipedia/
> Reddit/YouTube) **não é paralelo — é o gargalo** pra meta de "top 1". Documento interno; não publicar;
> conteúdo derivado segue a regra de não citar concorrentes (CLAUDE.md).

## GEO Readiness Score (site-wide): 66/100

O on-site é dos melhores que existem (técnica resolvida). O score cai porque, **pra ser citado como #1
numa query comercial competitiva, a IA precisa de fontes de terceiros que confirmem a entidade — e
hoje há zero.** Você não "ganha o argumento" sozinho contra plataformas com 14 anos de rastro.

| Critério (peso) | Score | Leitura |
|---|---|---|
| Citability (25%) | 70 | Resposta direta + FAQ ajudam; faltam blocos auto-contidos de 134-167 palavras (já mapeado em 25/mai). |
| Estrutura (20%) | 80 | H1→H2→H3, headings-pergunta, FAQ, comparador. |
| Multi-modal (15%) | 60 | Imagens + comparador; faltam tabelas de dados citáveis e vídeo. |
| **Autoridade & marca (20%)** | **25** | **Gargalo.** Zero Wikipedia/Reddit/YouTube/imprensa/Reclame Aqui. |
| Acessibilidade técnica (20%) | 95 | SSR, todos os AI crawlers liberados, llms.txt dinâmico. |

### Por plataforma (revisado pra baixo vs 25/mai, pondo peso no off-site)
- **Google AIO 60** (era 85): on-site forte, mas **travado pela indexação fraca no Google** (ver `plans/...` roadmap 2M, Frente A). Sem indexar, não entra em AIO.
- **ChatGPT 45** (era 75): já traz tráfego, mas trava sem Wikipedia (47,9% das citações) / Reddit (11,3%).
- **Perplexity 35** (era 72): Perplexity cita Reddit ~46,7% — presença zero = quase invisível.

## Evidência ao vivo (2026-05-28)
- "Bolsa Click é confiável / vale a pena / como funciona" → **só retorna o próprio site**. Nenhuma fonte de terceiros.
- "Bolsa Click wikipedia/youtube/linkedin" e marca + Reddit/Reclame Aqui → **nada**.
- Concorrentes estabelecidos têm página "é confiável" ranqueada, prêmio Reclame Aqui, matéria patrocinada em portal regional, narrativa de histórico. **É isso que a IA lê e cita.**
- Base: Ahrefs (dez/2025, 75k marcas) — menções de marca correlacionam **~3× mais** com visibilidade em IA do que backlinks.

## Inconsistência factual (corrigir já)
Home diz **"até 80%"**; central de ajuda (`/central-de-ajuda/primeiros-passos/bolsa-parcial-integral`) diz **"até 95%"**. Fontes que se contradizem perdem confiança das IAs. Padronizar o número-âncora em todo o site.

## Top 5 de maior impacto (delta vs 25/mai)
1. **Corpus "é confiável / como funciona / é seguro"** — páginas próprias respondendo de frente as queries de confiança (que as IAs respondem), com `Organization` schema + dados verificáveis. (ALTÍSSIMO)
2. **Earned media / presença de terceiros** — em ordem de viabilidade: Reclame Aqui (reivindicar) → YouTube (correlação mais forte) → imprensa via dado proprietário → LinkedIn → Reddit (genuíno, não spam) → Wikipedia/Wikidata (só após notabilidade). (ALTÍSSIMO, fora do código)
3. **Blocos citáveis de 134-167 palavras** — aplicar no `seed-blog-posts.ts` e revisão das pillars (já mapeado em 25/mai, executar). (ALTO)
4. **Pesquisa original** — expandir `/estudos/panorama-bolsa-2026` com dado proprietário (catálogo 908 cursos × preço × cidade × MEC). Citation magnet + alimenta imprensa. (ALTO)
5. **Padronizar fatos-âncora + autoria real** (`Person` schema, não "Equipe Bolsa Click") + `Organization.sameAs` apontando pros perfis novos. (MÉDIO)

## Nota de schema
A pillar usa **HowTo** (linha 20 acima). HowTo foi **deprecado como rich result do Google (set/2023)** — não prejudica, mas não gera mais resultado rico; mantê-lo só vale pelo benefício de leitura por IA, não por Google.

## Quick wins (semana)
1. Padronizar desconto-âncora (80% vs 95%) site-wide.
2. `ChatGPT-User` explícito no `app/robots.ts`.
3. Reivindicar Reclame Aqui + página LinkedIn da empresa.
4. `Organization.sameAs` com os perfis assim que criados.

## Verificação
- Perguntar a ChatGPT/Perplexity "qual site pra bolsa sem ENEM?" e checar se Bolsa Click aparece (baseline: não).
- PostHog: `$pageview` por `$referring_domain` filtrando `chatgpt.com`/`perplexity.ai`/`gemini.google.com`, mensal.
- Brand SERP "Bolsa Click é confiável" passar a ter resultados próprios + terceiros.

---

# UPDATE 2026-07-16 — Auditoria GEO e precisão factual

## GEO Readiness Score: 71/100

O avanço técnico e estrutural desde maio é consistente: o site está mais fácil de rastrear, interpretar
e citar. A autoridade externa, porém, continua sendo o limitador do score geral e da probabilidade de o
Bolsa Click aparecer como fonte principal em respostas de IA.

| Critério | Score | Leitura |
|---|---:|---|
| Citability | 72 | Respostas diretas, fontes oficiais e fatos-âncora consistentes melhoram a extração; ainda há espaço para mais evidência proprietária citável. |
| Structural | 90 | Pillar, spokes, FAQs, schemas e links internos formam um cluster claro e navegável. |
| Multi-Modal | 55 | O conteúdo textual está forte, mas vídeo e outros ativos multimodais próprios seguem limitados. |
| Authority | 40 | Houve progresso nos sinais de entidade, porém a confirmação independente da marca ainda é insuficiente. |
| Technical | 95 | SSR, regras para crawlers de IA, sitemap coerente e prerender das cidades prioritárias deixam a base técnica madura. |

## Progresso desde maio

- `ChatGPT-User` está explicitamente permitido no `robots.txt`.
- `Organization.sameAs` está preenchido com perfis oficiais.
- O perfil do Reclame Aqui está linkado como sinal de confiança de terceiros.
- A autoria editorial usa uma `Person` real, em vez de uma equipe genérica.

## Gargalo atual: autoridade off-site

O principal gargalo permanece fora do código. A correlação reportada entre presença no YouTube e
visibilidade em respostas de IA é de **0,737**; o Reddit aparece em **46,7%** das citações do
Perplexity; e a Wikipedia aparece em **47,9%** das citações do ChatGPT. Esses canais não devem ser
tratados como simples distribuição: são fontes independentes que ajudam os modelos a confirmar a
entidade e suas afirmações.

## Correções deste ciclo

1. **Precisão do `llms.txt`:** redes parceiras corrigidas para 6, com Wyden incluída no grupo YDUQS, e total de cidades derivado de `BRAZILIAN_CITIES.length`.
2. **Fontes reutilizáveis:** bloco `Fontes consultadas` extraído para componente compartilhado, preservando a estrutura visual e semântica existente.
3. **Autoridade temática:** páginas de ProUni e FIES passaram a citar fontes oficiais do MEC, Planalto e FNDE.
4. **Openers citáveis:** aberturas de ProUni e FIES reescritas em 40–60 palavras, com resposta direta e dados oficiais verificáveis.
5. **Sitemap coerente:** o sub-sitemap de cidades passou a listar somente páginas com oferta, eliminando o conflito entre URLs publicadas e páginas `noindex`.
6. **Pillar → spokes dinâmico:** guias publicados do cluster de bolsas passaram a alimentar dinamicamente os links internos da pillar, com fallback estático seguro.
7. **Prerender prioritário:** capitais e maiores cidades passaram a ser geradas estaticamente, reduzindo o TTFB frio nas páginas de maior demanda.

## Próxima alavanca

A próxima evolução relevante depende menos de novos ajustes técnicos e mais de um programa contínuo
de autoridade: conteúdo útil em vídeo, participação genuína em comunidades, pesquisa proprietária
que gere imprensa e construção gradual de notabilidade enciclopédica. O objetivo é criar fontes
externas confiáveis que confirmem — e não apenas repitam — os fatos publicados pelo Bolsa Click.
