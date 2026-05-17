# enrich-courses.mjs — Enriquecimento editorial em massa do catálogo

Script standalone que pega o catálogo de cursos da API Tartarus (908 cursos: 124 graduação + 784 pós-graduação), pesquisa dados reais via Claude + web search, e popula a tabela `FeaturedCourse` com conteúdo editorial único em pt-BR.

Construído em 2026-05-17 como parte do plano de cobertura SEO 100% do catálogo (vs 20 cursos editoriais originais).

## Setup (uma vez)

```bash
# 1. Instalar SDK do Anthropic
npm install @anthropic-ai/sdk

# 2. Adicionar a chave no .env
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env

# 3. Aplicar migração de schema (adiciona hasCityPages, enrichedAt, enrichmentNote)
#    Via Railway: faz parte do próximo deploy
#    Local: npx prisma migrate deploy
```

## Uso

```bash
# Smoke test — 1 curso, sem escrever
node --env-file=.env scripts/enrich-courses.mjs --slug=teologia-bacharelado --dry-run

# Primeira leva real — 20 graduações novas
node --env-file=.env scripts/enrich-courses.mjs --grad-only --limit=20

# Continuar — próximas 50
node --env-file=.env scripts/enrich-courses.mjs --grad-only --limit=50

# Pós em batch (rodar em screen/tmux pq demora)
node --env-file=.env scripts/enrich-courses.mjs --pos-only --limit=200 --concurrency=3

# Resumir de onde parou após falha
node --env-file=.env scripts/enrich-courses.mjs --start-after=ultimo-slug-ok --limit=100
```

### Flags disponíveis

| Flag | Default | Descrição |
|---|---|---|
| `--dry-run` | false | Não escreve no DB |
| `--slug=<slug>` | — | Processa só esse curso |
| `--limit=<n>` | 10 | Máx de cursos nesta execução |
| `--concurrency=<n>` | 3 | Requests paralelos |
| `--model=<name>` | `claude-sonnet-4-6` | Override do modelo |
| `--grad-only` | false | Só graduação |
| `--pos-only` | false | Só pós |
| `--force-existing` | false | Re-enriquece cursos já enriquecidos |
| `--start-after=<slug>` | — | Skip até passar deste slug (resume) |

## Custo estimado

Modelo padrão: **claude-sonnet-4-6** ($3/M input, $15/M output)

| Por curso | Volume | Tempo | Custo |
|---|---|---|---|
| ~$0.05–0.10 | 1 curso | ~30–60s | $0.05–0.10 |
| | 20 cursos (smoke) | ~5min | ~$1.50 |
| | 124 grad completos | ~30min | ~$10 |
| | 784 pós completos | ~3h | ~$60 |
| | **888 total** | **~3.5h** | **~$70** |

Prompt cache reduz custo em ~30% nas chamadas após a primeira (system prompt é cacheado por 5min).

## O que o script faz

1. **Pull catálogo**: `GET /api/courses?academicLevel=GRADUACAO` e `POS_GRADUACAO`
2. **Filtra**: cursos já com `enrichedAt IS NOT NULL` são pulados (a menos que `--force-existing`)
3. **Pra cada curso**:
   - Monta prompt com nome + nivel + slug + instrução pra pesquisar Glassdoor/Catho
   - Chama Claude com `web_search` tool habilitado (até 4 buscas)
   - Loop tool_use até `stop_reason: end_turn`
   - Extrai JSON do último bloco de texto (entre ```json ... ```)
   - Valida: campos obrigatórios, faixas (longDescription ≥ 800 chars, description ≤ 200), enum válido, type bate com nivel
   - Upsert na `FeaturedCourse` com `isActive: true` + `enrichedAt`
4. **Resumo final**: contagem de sucessos/falhas + lista de falhas

## Schema do output (Claude → JSON)

```json
{
  "description": "≤160 chars meta description",
  "longDescription": "250–400 palavras pt-BR sem markdown",
  "duration": "ex: '4 anos', '18 a 24 meses'",
  "areas": ["4–8 áreas"],
  "skills": ["4–8 habilidades"],
  "careerPaths": ["4–8 cargos/caminhos"],
  "averageSalary": "R$ X.XXX a R$ XX.XXX",
  "marketDemand": "ALTA|MEDIA|BAIXA",
  "type": "BACHARELADO|LICENCIATURA|TECNOLOGO|ESPECIALIZACAO|MBA",
  "keywords": ["10–15 keywords"]
}
```

## Imagens

O script usa `/assets/og-image-bolsaclick.png` como placeholder pra todos os cursos novos. Pra ter imagens reais por curso (recomendado), rodar separadamente:

```bash
# Pasta scripts/ tem update-course-images.ts e upload-course-images.ts — adaptar pra novos slugs.
```

## Pós-enriquecimento: regras de qualidade

- **Não publique 888 cursos em 1 dia.** Faça em batches de 50–100, espalhe por semanas. Dá tempo do Google descobrir gradualmente e evita spike suspeito.
- **Revise amostras manualmente** (10% dos cursos enriquecidos) antes de aprovar a próxima leva. Procure por:
  - Texto que soa AI ("é importante destacar que…", "vale ressaltar…", "no cenário atual…")
  - Salários sem fonte ou inflados
  - Áreas/skills genéricas demais
- **Não ative `hasCityPages`** para cursos enriquecidos até validar conteúdo + ter inventário real na API:
  ```sql
  UPDATE "FeaturedCourse"
  SET "hasCityPages" = true
  WHERE slug IN ('curso-validado-1', 'curso-validado-2');
  ```

## Monitoramento (GSC)

Após 30 dias de cada batch, checar em `Páginas → Indexação`:
- **Indexada**: meta = > 70% do batch
- **Crawled - currently not indexed**: < 30% (sinal de thin content)
- Se ratio quebrar, **pausar enriquecimento**, revisar prompt do system, talvez aumentar `longDescription` mínimo pra 1500 chars.

## Rollback

Se algum batch ficou ruim, soft-delete sem perder o trabalho:

```sql
-- Tira do site sem apagar do DB
UPDATE "FeaturedCourse" SET "isActive" = false
WHERE "enrichedAt" > '2026-05-17' AND "enrichedAt" < '2026-05-18';

-- Pra re-enriquecer um curso específico do zero
UPDATE "FeaturedCourse" SET "enrichedAt" = NULL WHERE slug = 'curso-ruim';
-- Depois: node --env-file=.env scripts/enrich-courses.mjs --slug=curso-ruim
```

## Saber o que falta enriquecer

```sql
SELECT
  COUNT(*) FILTER (WHERE "enrichedAt" IS NOT NULL) AS enriquecidos,
  COUNT(*) FILTER (WHERE "enrichedAt" IS NULL) AS pendentes,
  COUNT(*) AS total
FROM "FeaturedCourse";
```
