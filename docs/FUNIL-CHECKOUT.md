# Funil de checkout — queries de acompanhamento

Rodar no PostHog (projeto **Bolsa Click — Todas as Marcas**, id 160050) em
*SQL / HogQL*. Todas as três foram executadas contra dados reais em 2026-09-08.

O eixo de tudo é `checkout_flow`: `estacio_checkout`, `cogna_matricula`,
`ingressa_lead_form`, `checkout_success_page`. Sem ele o funil abre por fluxo e
fecha anônimo — foi exatamente o furo que o PR desta doc corrigiu.

---

## 1. Onde o formulário perde (a query principal)

Conta **pessoas distintas**, não eventos: o degrau é sobre gente, e um mesmo
candidato dispara `checkout_viewed` várias vezes ao trocar de oferta.

```sql
WITH funil AS (
  SELECT
    coalesce(properties.checkout_flow, '(sem fluxo)') AS fluxo,
    uniqExactIf(person_id, event = 'checkout_viewed')                                          AS abriu,
    uniqExactIf(person_id, event = 'checkout_step_completed' AND properties.step_number = 1)   AS passo1,
    uniqExactIf(person_id, event = 'checkout_step_completed' AND properties.step_number = 2)   AS passo2,
    uniqExactIf(person_id, event = 'checkout_identified')                                      AS terminou,
    uniqExactIf(person_id, event = 'checkout_submitted')                                       AS inscreveu,
    uniqExactIf(person_id, event = 'enrollment_converted')                                     AS converteu
  FROM events
  WHERE timestamp >= now() - INTERVAL 7 DAY
  GROUP BY fluxo
)
SELECT
  fluxo, abriu,
  passo1,    round(100 * passo1    / nullIf(abriu,  0), 1) AS pct_ate_p1,
  passo2,    round(100 * passo2    / nullIf(passo1, 0), 1) AS pct_p1_p2,
  terminou,  round(100 * terminou  / nullIf(passo2, 0), 1) AS pct_p2_fim,
  inscreveu, converteu,
             round(100 * converteu / nullIf(abriu,  0), 2) AS pct_total
FROM funil
ORDER BY abriu DESC
```

### O que cada passo significa

| Coluna | Estácio | Cogna |
|---|---|---|
| `abriu` | abriu o checkout | idem |
| `passo1` | nome, CPF, e-mail e telefone válidos | nome, e-mail e CPF validado |
| `passo2` | endereço completo (CEP, rua, número, bairro, cidade, UF) | telefone |
| `terminou` | enviou o formulário inteiro (`checkout_identified`) | idem |
| `inscreveu` | inscrição criada no parceiro | idem |
| `converteu` | página de sucesso | idem |

### Como ler

O maior degrau é o alvo — e cada um pede um remédio diferente:

- **`pct_ate_p1` baixo** → o candidato não passa dos dados pessoais. Suspeitar
  do CPF pedido cedo demais, ou da validação de CPF travando (cruzar com
  `checkout_error` e `cpf_inscription_blocked`).
- **`pct_p1_p2` baixo no Estácio** → o endereço derruba. É o formulário mais
  longo que temos: CEP, rua, número, bairro, cidade, UF, e ainda RG, gênero e
  ano de conclusão. Cruzar com `checkout_error` de `step = 'cep_autofill'`.
- **`pct_p2_fim` baixo** → trava na forma de ingresso / última tela do form.
- **`inscreveu` ≫ `converteu`** → o parceiro está recusando, ou o candidato não
  paga a taxa. Nesse caso o problema não é o formulário: ver
  `checkout_inscription_failed` e o watchdog.

Baseline de 2026-09-08, antes de `checkout_step_completed` existir (era isto que
não dava para abrir): Estácio 26 abriram → 4 terminaram (15%) → 2 inscreveram.
Cogna 49 → 7 (14%) → 4.

**Atenção ao volume.** O checkout recebe ~5-10 pessoas/dia por fluxo. Com 7
dias, uma diferença de 1 pessoa move o percentual em vários pontos. Antes de
concluir qualquer coisa de um número que mudou, confira o denominador — e para
comparar duas semanas, prefira 14 ou 28 dias.

---

## 2. A instrumentação chegou? (rodar logo após o deploy)

Enquanto `checkout_step_completed` não estiver em produção, `passo1`/`passo2`
saem **zerados** na query acima — e o editor avisa que o evento não existe na
taxonomia. Isso é o esperado, e serve de verificação de deploy: as colunas
saírem de zero é a prova de que a instrumentação subiu.

```sql
SELECT
  toDate(timestamp) AS dia,
  properties.checkout_flow AS fluxo,
  properties.step_name AS passo,
  count()                AS eventos,
  uniqExact(person_id)   AS pessoas
FROM events
WHERE event = 'checkout_step_completed'
  AND timestamp >= now() - INTERVAL 3 DAY
GROUP BY dia, fluxo, passo
ORDER BY dia DESC, fluxo, passo
```

`eventos` deve ficar **próximo** de `pessoas`. Se `eventos` for muito maior, a
trava de emissão única (`useRef`) não está segurando e o passo conta mais de uma
vez por candidato — o número fica inflado justamente no degrau que se quer medir.

---

## 3. Saúde do rastreio — nenhum evento pode chegar sem fluxo

```sql
SELECT
  toDate(timestamp) AS dia,
  event,
  countIf(isNotNull(properties.checkout_flow)) AS com_fluxo,
  countIf(isNull(properties.checkout_flow))    AS sem_fluxo
FROM events
WHERE timestamp >= now() - INTERVAL 7 DAY
  AND event IN (
    'checkout_viewed', 'checkout_step_completed', 'checkout_identified',
    'checkout_submitted', 'enrollment_converted', 'checkout_error'
  )
GROUP BY dia, event
ORDER BY event, dia
```

**`sem_fluxo` tem que ser zero** em todos os dias posteriores ao deploy. Qualquer
valor acima de zero é um chamador novo que esqueceu de passar `checkoutFlow` —
e um evento sem fluxo é invisível para o funil, não aparece como erro em lugar
nenhum.

Quebrar **por dia** é obrigatório, não estético: é o que separa "resíduo
histórico anterior ao deploy" de "bug ativo". Em 2026-09-08, 51
`checkout_viewed` sem fluxo pareciam bug e eram só eventos pré-deploy, enquanto
os de `enrollment_converted` pareciam a mesma coisa e eram reais.

---

## Antes de confiar em qualquer número

`checkout_flow` **não** é o mesmo que `flow`. `flow` é grosso (`matricula`
cobre o checkout Cogna e o lead form do ingressa); `checkout_flow` é o
identificador estável de cada checkout. Agrupar por `flow` mistura superfícies
diferentes — já produziu um relatório de abandono errado.

Ver `app/lib/analytics/checkout-funnel.ts` para o contrato dos eventos.
