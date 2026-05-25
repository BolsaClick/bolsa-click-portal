# Resposta à auditoria SEO externa — maio/2026

Documento de referência para responder ao relatório de auditoria SEO recebido. Cruza ponto a ponto cada reclamação com a realidade observável no codebase (filepaths concretos).

**TL;DR**: ~90% do que o relatório aponta como "falta" já está implementado. Listamos abaixo cada item, o status real e a evidência. Os 4 gaps reais sobrantes (com plano de execução) estão na seção final.

---

## Tabela auditoria reversa

| # | Reclamação do relatório | Status | Realidade | Evidência |
|---|---|---|---|---|
| 1 | "Falta blog/SEO orgânico" | ✅ Implementado | Blog completo com 20 posts arquétipo via Prisma+IA. Índice em `/blog`, post em `/blog/[slug]`, filtros por categoria em `/blog/categoria/[slug]`. | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/blog/categoria/[slug]/page.tsx`, `scripts/seed-blog-posts.ts`, modelo `BlogPost` no Prisma |
| 2 | "Schema markup insuficiente" | ✅ Implementado | `WebSite` + `SearchAction`, `EducationalOrganization` (mais específico que `LocalBusiness` para o nosso contexto), `ItemList` da navegação, `Course`, `AggregateRating`, `Article`, `FAQPage`, `BreadcrumbList`, `BlogPosting`. | `app/layout.tsx:128-242`, `app/cursos/[slug]/page.tsx`, `app/lib/seo/schema-helpers.ts`, `app/(default)/programas/page.tsx`, `app/(default)/page.tsx` |
| 3 | "URLs sujas tipo `/curso/resultado?c=X`" | ✅ Resolvido em paralelo | Rotas clean dominantes desde a refatoração: `/cursos/[slug]`, `/cursos/[slug]/[city]`, `/cursos/modalidade/[modality]`, `/graduacao`, `/pos-graduacao`, `/bolsas-de-estudo[/city]`, `/faculdades/[slug]/[city]`. A rota legacy `/curso/resultado` continua viva apenas como motor de busca interno (autocomplete) e já está `Disallow` no robots.txt. | `app/cursos/[slug]/page.tsx`, `app/cursos/[slug]/[city]/page.tsx`, `app/comparar/[pair]/page.tsx`, `app/robots.ts:12` |
| 4 | "Falta páginas de cidade otimizadas" | ✅ Implementado | Páginas curso×cidade existem com **quality gate**: só são indexáveis quando há ≥2 ofertas locais OU trend score ≥60. Abaixo do gate ficam `noindex,follow` + canonical para evitar thin-content. | `app/lib/seo/city-page-gate.ts` (`MIN_OFFERS_TO_INDEX=2`, `MIN_TREND_SCORE=60`), `app/cursos/[slug]/[city]/page.tsx`, `app/bolsas-de-estudo/[city]/page.tsx` |
| 5 | "Falta páginas comparativas (X vs Y)" | ✅ Implementado | `/comparar/[slug-a]-vs-[slug-b]` com tabela `BrandStats` (offerCount, courseCount, cityCount, avgPrice, minPrice). ISR 24h. URLs incluídas no sitemap (até 1000 pares). | `app/comparar/[pair]/page.tsx`, `app/sitemap/[id]/route.ts` |
| 6 | "Falta FAQ" | ✅ Implementado | FAQPage schema em home, `/programas`, `/sem-enem`, `/sisu`, `/prouni`, `/teste-vocacional`, e dinâmico em `/cursos/[slug]` via `buildCityFaqItems()`. | `app/(default)/page.tsx`, `app/(default)/programas/page.tsx`, `app/cursos/[slug]/_components/CourseSeoSections.tsx` |
| 7 | "Falta testimoniais/reviews" | ✅ Implementado | Componente `CourseReviewsBlock` + modelo Prisma `Review` (status PENDING/APPROVED/REJECTED). Schema `AggregateRating` emitido em `/cursos/[slug]` quando há ≥3 reviews aprovados. Bloco visual de depoimentos no pillar `/bolsas-de-estudo`. | `app/cursos/[slug]/_components/CourseReviewsBlock.tsx`, `app/bolsas-de-estudo/DepoimentosSection.tsx` |
| 8 | "Cookie banner causa CLS" | 🟡 A medir | Banner usa `position: fixed` (fora do fluxo do layout), o que normalmente não dispara CLS. Commit recente (`e48c7a9 fix(cwv)`) já endereçou CLS crítico em mobile. Vamos validar com Lighthouse antes de mexer. | `app/components/organisms/CookieConsent/CookieBanner.tsx:23` |
| 9 | "Falta páginas de curso (administração, direito, enfermagem)" | ✅ Implementado | Existem `/cursos/[slug]` para todos os 908 cursos do catálogo (expansão concluída em 2026-05-17). Conteúdo editorial completo: descrição, áreas de atuação, salário médio, mercado de trabalho, FAQ dinâmico, reviews. | `app/cursos/[slug]/page.tsx`, `app/cursos/[slug]/_components/` |

## Capacidades adicionais não solicitadas pelo relatório, mas já implantadas

| Capacidade | Onde |
|---|---|
| **llms.txt dinâmico** com 9 citation-ready facts (fonte oficial + data) e allowlist de crawlers IA (GPTBot, ClaudeBot, PerplexityBot etc.) | `app/llms.txt/route.ts` |
| **IndexNow** (ping Bing/Yandex/Naver) | `app/lib/indexnow.ts`, `app/api/indexnow/route.ts` |
| **RSL 1.0** (Really Simple Licensing) para crawlers de IA | `public/rsl.xml` |
| **Sitemap segmentado** em 5 submapas (estático+cidades, cursos, curso×cidade, faculdades+comparativas, blog+help+vocacional) com chunking de 45k URLs | `app/sitemap.xml/route.ts`, `app/sitemap/[id]/route.ts` |
| **Pillar `/bolsas-de-estudo`** com Article schema, calendário 2026, comparador inline, programas (ProUni/FIES/Permanência/ENCCEJA), trust badges, FAQs | `app/bolsas-de-estudo/page.tsx` |
| **Robots whitelist de 14 AI crawlers** | `app/robots.ts` |
| **Rotas teste-vocacional** com perfis RIASEC | `app/teste-vocacional/`, `app/teste-vocacional/perfil/[tipo]` |
| **Central de ajuda estruturada** | `app/central-de-ajuda/[category]/[slug]/page.tsx` |

## Gaps reais identificados (fora do relatório do gestor)

### Gap A — Sitelink Search Box aponta para rota Disallowed
`app/layout.tsx:139` declara `SearchAction.urlTemplate = "/curso/resultado?q=..."` mas `app/robots.ts:12` faz `Disallow: /curso/resultado`. Google lê o schema mas não consegue resolver a rota.

**Fix**: trocar para `/cursos?q={search_term_string}`.

### Gap B — IndexNow existe mas não auto-dispara em publish
Os endpoints admin de blog (`app/api/admin/blog/posts/route.ts`) e help-center não chamam `submitToIndexNow` após criar/atualizar conteúdo. URL nova só chega no Bing/Yandex em ciclo natural de crawl.

**Fix**: hook `void submitToIndexNow([url])` após `prisma.blogPost.create` quando `publishedAt && isActive`.

### Gap C — Falta `/faq` dedicada como pillar GEO
Há FAQs inline em várias páginas, mas não existe uma página `/faq` consolidada que sirva de hub. Para LLMs (ChatGPT, Perplexity, AI Overviews), uma página única com 20-30 perguntas top maximiza chance de citação.

**Fix**: criar `app/faq/page.tsx` com `FAQPage` schema + 20-30 itens (como funciona, segurança, valor, ProUni, FIES, EAD, presencial, sem ENEM, devolução). Padrão GEO: resposta direta nos primeiros 40-60 palavras.

### Gap D — CLS do cookie banner (a medir, não fix preventivo)
Banner é `position: fixed`, em teoria não causa CLS. Commit `e48c7a9` recente atacou CLS crítico em mobile. Antes de mexer, rodar Lighthouse:
```
lighthouse https://www.bolsaclick.com.br --only-categories=performance --form-factor=mobile --view
```
Se CLS > 0.1 e banner contribuir → adicionar `contain: layout`. Se CLS já bom → relatar ao gestor que o ponto não procede.

## O que NÃO vamos fazer (justificado)

| Sugestão do relatório | Por quê não |
|---|---|
| Adicionar schema `LocalBusiness` | Já temos `EducationalOrganization`, que é o tipo mais específico para nosso contexto (ed-tech). Adicionar `LocalBusiness` confundiria o tipo da entidade. |
| Redirect 301 `/curso/resultado?c=X` → `/cursos/{slug}` | Rota legacy é usada por 20+ componentes (autocomplete, header, graduação, filtros). Migração coordenada é projeto separado, fora deste sprint. A rota já é `Disallow` no robots, então não indexa lixo. |
| "Criar mais 10 posts de blog" | Plano de expansão atual contempla 80 posts cluster para hitting "bolsas de estudo" até 2026-11-22. Crescer agora sem plano de cluster gera canibalização. |
| "Criar mais landing pages de curso" | Já existem para todos os 908 cursos do catálogo (expansão 2026-05-17). Cobertura 100%. |
| "Comparar Anhanguera vs Unopar" diretamente | CLAUDE.md proíbe citar concorrentes pelo nome em conteúdo público (Anhanguera é parceiro, Unopar é parceiro — ok, mas avaliar se vale o conteúdo). Já temos `/comparar/[a]-vs-[b]` para cursos. Vale considerar `/comparar/faculdades/[a]-vs-[b]` em sprint futuro. |
