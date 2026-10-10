# Descoberta de cidades e renovação do cache curso×cidade

Estado em 2026-10-10. Decisões do CEO registradas aqui para não se perderem
entre tarefas.

## Ordem combinada

1. **Consertar a fila do precompute** (`scripts/precompute-city-offers.ts`):
   fila por par, SLA por camada, motivo de falha gravado por rodada. Feito
   nesta branch.
2. **Medir os ~30% de falha da Cogna** com a primeira rodada agendada depois
   do merge. Ler com `npx tsx --env-file=.env scripts/precompute-run-report.ts`.
   - 429 em massa → estamos no teto da conta Cogna. A resposta é **reduzir
     volume**, não otimizar fila.
   - Timeout, 5xx ou 200-vazio → dá para ajustar concorrência, retry e lote.
3. **Proposta B** (lista de cidades via `cogna/courses/locations`).
4. **Proposta A** (índice de cidades no sweep do tartarus-bff).

Até lá: **nenhuma varredura nacional contra a Tartarus.**

## Por que tanto cuidado com a Tartarus

O antifraude da Cogna bloqueia a conta e o bloqueio escala. Em 10/10, duas
chamadas de busca nacional sem cidade tomaram 429: primeiro "bloqueado por
1 segundo", na seguinte "bloqueado por 55 minutos". Em 08/10 o mesmo antifraude
derrubou a prateleira "Mais procurados" da home.

Contexto de volume: a rodada semanal do precompute faz ~45 mil buscas Cogna em
4h40, cerca de 160 por minuto, sustentadas. É o maior consumidor da conta,
muito acima de qualquer varredura manual.

Regra: concorrência 1, pausa de vários segundos, parar no primeiro não-200,
**sem retry**. 429 → parar e avisar o CEO.

## Proposta B: lista de municípios com oferta Cogna

`GET cogna/courses/locations` (Tartarus) → `GET /v1/offers/locations` (Cogna).
Sem `search`, devolve a lista de cidades com oferta, paginada de 100 em 100
(o BFF pagina sozinho em `getAllLocations`). Para ~1.000 cidades, são umas 10
chamadas.

Responde o item 2 da tarefa 5: reconciliar `BRAZILIAN_CITIES`. Não diz quais
cursos cada cidade tem; isso o precompute mede por par.

**Condições aprovadas:**
- só depois do PR da fila mergeado;
- madrugada, fora de domingo (domingo é a rodada semanal);
- 1 chamada a cada 10 s, parar no primeiro não-200, sem retry;
- 429 → parar e avisar, sem esperar para tentar de novo.

Atenção ao chamar `cogna/courses/locations` sem `search`: o BFF pagina
**sozinho**, sem pausa entre páginas. Ou o BFF ganha pausa ali primeiro, ou a
chamada passa `search` e `page` explícitos, uma página por vez, do nosso lado.

## Proposta A: índice de cidades no sweep das 3h do tartarus-bff

Aprovada em mérito, **não agora**: é outro repo, com deploy separado.

O cron diário `syncFeaturedCourses` (tartarus-bff,
`src/modules/offers/featured-courses.service.ts`) já pagina **o catálogo
nacional inteiro**: `/offers/search` sem cidade, `size=200`, nos 3 níveis e
mais profissionalizante, com 400 ms entre páginas. Toda oferta passa ali com o
polo no campo `unit` ("CIDADE/UF - …"). Hoje ele guarda só a melhor oferta por
curso e **descarta o resto**.

Proposta: acumular no mesmo laço, por curso, nível e modalidade, o conjunto de
(cidade, UF) com contagem de ofertas; gravar numa chave nova do Redis e expor
num GET para o portal. **Zero chamada a mais à Cogna.**

Cuidados:
- herdar a guarda "varredura abortada não grava" (parcial descartada, cache
  anterior preservado). Índice parcial seria o mesmo bug que a guarda evita na
  vitrine;
- o parse de `unit` (`"VILHENA/RO - I(3985)U"`) precisa casar com o slug da
  rota (`slugify` em `app/lib/constants/brazilian-cities.ts`). O slug não pode
  divergir do slug real da rota.

## Suspeita aberta: teto de 2.000 resultados

A busca exploratória do CEO (Administração, EAD, sem cidade) voltou com
`totalItems = 2.000` exatos. Número redondo demais. Se for teto de resultados
da API por consulta:
- o sweep das 3h também vê só uma fatia, e a vitrine "Mais procurados" está
  incompleta (achado à parte, sério);
- a Proposta A herdaria o mesmo teto. Seria preciso particionar o sweep (por
  UF, por exemplo) para enxergar tudo.

Confirmação sem chamada nova: a linha `[featured-cron] Sync concluido: N ofertas
varridas em P paginas` no log do tartarus-bff (Railway), ou os dados que o CEO
salvou da varredura de 10/10.

## Bug latente já corrigido: "lacuna = época 0"

Na fila antiga, um par sem linha no cache valia como fetchedAt = 0 e jogava o
curso para a frente de tudo. Inativo em 10/10 (grade 477×160 completa), mas
morderia exatamente quando a lista de cidades crescer: 477 × N lacunas, todas
na frente. Na fila nova, lacuna entra com urgência de 75% do SLA (ver
`scripts/precompute-city-offers-queue.ts`).

## Números de referência (10/10)

- Sitemap: 12.220 URLs. Curso×cidade (`sitemap/2`): 10.242, sendo 126 cursos ×
  159 cidades.
- Cache: 477 cursos × 160 cidades = 76.320 linhas.
  - Camada 1 (177 cursos com página de cidade): 28.320 linhas, 9.874 com mais
    de 14 dias, a mais velha com 36,9 dias.
  - Camada 2 (300 cursos): 48.000 linhas, 11.031 com mais de 14 dias.
- Rodada de 04/10: ≥44.921 pares processados em 280 min (truncada). Cogna OK
  em 31.364, ou seja, ~30% de falha.
- Para nenhuma linha passar de 14 dias com rodada semanal: 38.160 pares com a
  Cogna OK por rodada.
