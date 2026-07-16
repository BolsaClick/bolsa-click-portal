# Auditoria completa de SEO — bolsaclick.com.br (2026-07-16)

Auditoria multi-agente (7 especialistas + GEO reaproveitado da auditoria de 15/jul). Todas as notas vêm de amostragem real em produção, com evidências por URL. Pós-deploy dos quick wins do ciclo 2026-07-16 (sitemap, spokes, llms.txt, fontes oficiais).

## SEO Health Score: **74/100**

| Dimensão | Nota | Peso | Contribuição |
|---|---|---|---|
| Técnico | 79 | 22% | 17,4 |
| Conteúdo | 61 | 23% | 14,0 |
| On-page | 87 | 20% | 17,4 |
| Schema | 61 | 10% | 6,1 |
| Performance | 78 | 10% | 7,8 |
| AI/GEO | 71 | 10% | 7,1 |
| Imagens | 85 | 5% | 4,3 |
| **Total** | | | **74,1** |

Dimensões complementares (não ponderadas): **Cluster 58/100** · **SXO 79/100** · **Autoridade/backlinks ~15-20/100 (dados insuficientes — configurar Moz grátis)**.

Leitura executiva: o on-site é forte (on-page 87, técnico 79, SSR impecável, schema rico demais até). Os três buracos: (1) **conteúdo programático em escala** (curso×cidade duplicado, cidades vazias indexáveis), (2) **arquitetura interna competindo consigo mesma** (home vs pillar; canibalização entre posts; hubs sem links), (3) **autoridade off-site ~zero** (nenhum backlink de âncora verificado).

## CRITICAL (corrigir imediatamente)

1. **177 soft-404 no sitemap** — `/teste-vocacional/{curso}` retorna 200 + "Curso não encontrado" + **duas meta robots conflitantes** (`index` E `noindex` no mesmo HTML). Fix: corrigir resolução de slug OU 404 real + retirar do sitemap 4; investigar meta robots duplicada (layout vs página).
2. **Freshness fabricada nas 4 landings de programa** — `/prouni /fies /sisu /enem` com `datePublished: 2024-01-15` e `dateModified: 2026-05-15` idênticos e hardcoded, autor Organization genérico, sem byline visível. São as páginas YMYL mais buscadas do site. Fix: dateModified real por página + Person da equipe editorial + "Atualizado em" visível (padrão da pillar).
3. **Cidades com 0 ofertas ainda indexáveis** — `/bolsas-de-estudo/campo-grande` e `/rio-branco` com ~150-180 palavras únicas e zero estoque (amostra colhida possivelmente antes do cache girar pós-deploy do sitemap novo — **verificar** se o filtro de ofertas do deploy de hoje já as removeu; se sim, falta só o noindex condicional na página).

## HIGH (1 semana)

4. **Home × pillar canibalizando o head term** — títulos quase idênticos ("Bolsas de Estudo... até 80%") e a **pillar fora do menu principal** (só footer). O `site:` mostra a home ganhando da página construída para rankear. Fix: diferenciar o title da home (ângulo marca/redes) + colocar `/bolsas-de-estudo` na navegação primária.
5. **Hubs de programa com 0 links para o blog** — /prouni /fies /sisu /enem /faculdade-ead não linkam nenhum post; 68 dos 92 posts órfãos do hub. Fix: bloco "guias relacionados" por cluster em cada hub (linkagem por tema, não inflar a pillar).
6. **5 canibalizações confirmadas por SERP** — Prouni (página vs 2 posts), FIES (3 URLs diluídas, nenhuma rankeia), Anhanguera (5 URLs), "faculdade reconhecida MEC" (4 posts), "bolsa sem ENEM" (5 posts). Fix: consolidar/301 conforme mapa do relatório de cluster **antes** de criar conteúdo novo.
7. **Schemas deprecados em produção** — `HowTo` (pillar + páginas de faculdade; morto desde set/2023) e `Occupation.estimatedSalary` (**replicado nas ~6.591 curso×cidade**; morto desde jun/2025, e com salário R$7.500 contradizendo os R$3.718 do texto — viola anti-hallucination). `Event` de ano inteiro (risco de ação manual). Fix: remover os três padrões.
8. **Curso×cidade: bloco "Sobre o curso" 100% idêntico entre cidades** + risco doorway em cidades de 1 oferta. Fix: localizar o bloco (a lógica de salário por UF já existe — reaproveitar) + noindex condicional abaixo de piso de ofertas.
9. **Títulos com ano velho** ("2024"/"2025" em posts atualizados em 2026). Fix: varredura regex nos ~500 slugs do sitemap 4 + sincronizar com pipeline do Hermes.
10. **Backlink real do anhangueracursos.com.br** — hoje a referência é só JSON-LD (não passa autoridade). Fix interno de dev: link `<a>` real no rodapé/institucional. Maior ROI de link disponível.

## MEDIUM (1 mês)

- CSP eternamente em report-only → promover a enforcing após burn-in.
- DOM da pillar: 2.958 elementos / 718KB HTML (529 `<li>` de catálogo) → paginar/virtualizar; risco de INP.
- JS vendor ~330KB gzip em toda página (Firebase Auth global, PostHog, lucide) → dynamic import por rota.
- Redirect http+non-www em 2 hops → colapsar em 1 no edge.
- `@id` inconsistente da Organization entre templates (dois nomes para o mesmo nó) + publisher sem @id no blog.
- Preços como string nos schemas → Number.
- `sameAs` do e-MEC com URLs provavelmente inválidas (padrão de deep-link inexistente no e-MEC) → apontar para a busca oficial.
- Meta description do simulador (214 chars) e title (84 chars) → encurtar.
- Módulo "sem ENEM/EAD" enterrado (H2 #8/#18 de 28) → subir + âncora/jump-nav; avaliar página dedicada `/bolsas-de-estudo/ead` (SERP do modificador premia página single-purpose).
- Bios de autores sem verificação externa (LinkedIn/registro) → 1 link auditável por autor.
- Logo Estácio em PNG de 116KB fora do otimizador → next/image ou SVG.
- Cloudflare `cf-cache-status: DYNAMIC` em tudo → Cache Rule respeitando s-maxage.

## LOW

- FAQ curso×cidade quase todo template → 1 pergunta local quando houver dado.
- Fonte CAGED sem link/metodologia nas curso×cidade.
- Query-string da pillar sem noindex de segurança (canonical cobre hoje).
- Landings de programa com ~800-950 palavras líquidas → aprofundar casos-limite.

## Autoridade (o teto do ranking)

Zero backlinks de âncora verificados; Common Crawl abaixo do limiar de ranking. Top oportunidades: (1) link real do anhangueracursos (interno), (2) pauta de dados first-party para imprensa educacional, (3) programa trimestral de dados catálogo×CAGED/IBGE, (4) páginas de polo dos parceiros, (5) DCEs/centros acadêmicos, (6) Reclame Aqui, (7) grupos de pauta de jornalistas. Wikipedia só após imprensa. **Configurar Moz API grátis para medir de verdade.**

## Gaps de conteúdo (pós-consolidação das canibalizações)

Nota de corte Prouni por curso · Medicina (bolsa/mensalidade) · Cotas Prouni · Trancamento sem perder bolsa · Financiamento privado (alternativa ao FIES) · 2ª chamada Prouni · Bolsa PCD · Nota de corte + simulador integrado · Bolsa para mães · Renovação de bolsa institucional.

---
*Gerado pelo ciclo de auditoria multi-agente de 2026-07-16. Evidências brutas por agente no scratchpad da sessão. Próxima auditoria: comparar contra este baseline.*
