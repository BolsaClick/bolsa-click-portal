# Matriz de intenção de busca — "bolsas de estudo"

Auditoria de cobertura por **intenção de busca** do head term **"bolsas de estudo"**, derivada dos dados do AnswerThePublic (ATP) — volume 22.2K/mês (alto), CPC US$ 1.18 (médio).

- **Objetivo**: chegar à página 1 em "bolsas de estudo" (meta 2026-11-22) priorizando otimização do que já existe em vez de criar conteúdo duplicado (canibalização/thin content = risco de penalty).
- **Escopo**: só o head term "bolsas de estudo" e suas variações de cauda (perguntas, preposições, comparações, modificadores).
- **Última revisão**: 2026-06-08.

## Eixos de classificação

- **Intenção**: `INFO` (informacional) · `COM` (comercial-investigativa) · `TRX` (transacional) · `NAV` (navegacional).
- **Fulfillment**: `SIM` (atendemos: graduação/pós/profissionalizante EAD/presencial via parceiras + ProUni/FIES) · `NÃO` (exterior, Portugal, K-12, programas de terceiros).
- **Cobertura**: `COVERED` · `PARTIAL` · `GAP` · `SKIP`.
- **Ação**: `nenhuma` · `otimizar` (título/H2/FAQ/interlink) · `post novo` · `skip`.

## Regra de fulfillment (decisão 2026-06-08)

Pular o que não atendemos: **exterior, Portugal, ensino fundamental/médio (K-12) e bolsas de terceiros** (ENAC, ENAI, Santander, OEI, Salesiano, Suíça, etc.). Esses representam ~90% do volume "alfabético/números" do ATP, mas sem fulfillment não convertem e ainda trazem risco de marca de terceiro (CLAUDE.md).

## Matriz

| Query (ATP) | Vol. aprox. | Intenção | Fulfillment | Cobertura | Página atual | Ação |
|---|---|---|---|---|---|---|
| bolsas de estudo | 22.2K | TRX/INFO | SIM | COVERED | `/bolsas-de-estudo` (pillar) | nenhuma |
| o que são / o que é bolsa de estudo | 20–30 | INFO | SIM | COVERED | pillar — `FAQ_ITEMS[0]` + `data-speakable="answer"` | nenhuma (frase definicional já presente) |
| como conseguir bolsa de estudo | 1.0K | INFO | SIM | COVERED | pillar HowTo `PASSOS` + guia `como-conseguir-bolsa-de-estudo-de-50-ou-mais` | otimizar (interlink) |
| como conseguir bolsa para faculdade | 390 | INFO | SIM | COVERED | pillar + cluster | nenhuma |
| como funciona / como ganhar bolsa em faculdades | — | INFO | SIM | COVERED | pillar "Como funcionam as bolsas" | nenhuma |
| como concorrer a uma bolsa de estudo | — | INFO | SIM | PARTIAL | pillar seção ProUni | **otimizar** (alinhar phrasing em H2/FAQ) |
| onde conseguir bolsa de estudo | 40 | TRX | SIM | PARTIAL | marketplace embutido na pillar (`<Filter/>`) | **otimizar** (novo H2 "Onde conseguir" + interlink pro widget) |
| bolsas de estudo para faculdade | 2.4K | TRX | SIM | COVERED | site inteiro / pillar | nenhuma |
| bolsas de estudo para psicologia | — | COM | SIM | COVERED | spokes `mensalidade-de-psicologia-com-bolsa`, `psicologia-curitiba-bolsas-mec` | nenhuma |
| bolsas de estudo para medicina | — | INFO | NÃO (sem bolsa própria) | PARTIAL | só via seção ProUni da pillar | **opcional**: post informacional honesto (rota ProUni/FIES + nota de corte real), sem prometer bolsa própria |
| bolsa de estudo sem ENEM | — | INFO | SIM | COVERED | guia `bolsa-de-estudo-sem-enem` + `bolsa-sem-prouni` | nenhuma |
| bolsa de estudo 100% / 50% vs 100% | — | INFO/COM | SIM | COVERED | guias `bolsa-de-estudo-de-100`, `bolsa-de-50-ou-100` | nenhuma |
| bolsa de estudo EAD / EAD vs presencial | — | COM | SIM | COVERED | pillar seção EAD + rankings | nenhuma |
| bolsa de estudo para pós-graduação | — | COM | SIM | COVERED | guia `bolsa-de-estudo-para-pos-graduacao` | nenhuma |
| bolsa de estudo baixa renda / 1ª/2ª graduação | — | INFO | SIM | COVERED | guias dedicados no cluster | nenhuma |
| bolsa de estudo golpe / confiável / e-MEC | — | INFO | SIM | COVERED | pillar "Cuidados" + guias `bolsa-de-estudo-golpe`, `verificar-faculdade-e-mec` | nenhuma |
| bolsas de estudo sp / santa catarina (geo) | — | TRX | SIM | COVERED | `/bolsas-de-estudo/[city]` | nenhuma |
| bolsas de estudo 2026 (ano) | — | INFO/TRX | SIM | COVERED | pillar (freshness 2026) | nenhuma |
| bolsas de estudo no exterior / em portugal | — | INFO | **NÃO** | SKIP | — | skip |
| bolsas de estudo para ensino fundamental/médio | 1.6K | INFO | **NÃO** (K-12) | SKIP | — | skip |
| bolsas de estudo enac / enai / santander / oei / salesiano / suíça | 3.6K+1.0K+720+… | NAV | **NÃO** (terceiros) | SKIP | — | skip (risco de marca de terceiro) |

## Resultado prático

O head term "bolsas de estudo" está **~90% coberto** pelo cluster atual **ou fora do nosso fulfillment**. O backlog de gaps reais é curto e de alta confiança:

| # | Gap | Tipo | Ação | Onde |
|---|---|---|---|---|
| 1 | "onde conseguir bolsa de estudo" | TRX | otimização on-page (H2 + interlink pro widget) | `app/bolsas-de-estudo/page.tsx` |
| 2 | "como concorrer a uma bolsa" (phrasing) | INFO | otimização (H2/FAQ) | pillar |
| 3 | "bolsas de estudo para medicina" | INFO | **opcional** — post honesto rota ProUni/FIES | `scripts/seed-cluster-spokes.mjs` |

## Notas editoriais (CLAUDE.md)

- Nenhum conteúdo novo cita concorrentes/terceiros; comparações só em termos genéricos ("plataformas agregadoras").
- Preços/% de bolsa/nota MEC só do catálogo first-party — nunca inventados.
- Abertura GEO: responder a query nos primeiros 40-60 palavras.

## Sistematização futura (fora de escopo)

Para rastrear esta matriz ao longo do tempo, o modelo `SeoTrendsEntry` (`matchStatus` GAP/PARTIAL/COVERED, `priorityScore`) + `app/lib/seo/gap-matcher.ts` + dashboard `/admin/seo/trends` já existem. Bastaria adicionar um campo de `intent` e ingerir os termos do ATP — não feito aqui (escopo = plano de conteúdo).
