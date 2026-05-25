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
