# CRM Notealy — estágio por comportamento

Objetivo: o estágio do contato no CRM (Notealy) reflete **o que a pessoa fez no
produto**, não só o ponto de entrada. Foco no estágio que hoje não existe:
**"abandonou checkout"** — alta intenção, não converteu — que é o público de
retargeting.

## Como o CRM funciona hoje

- CRM = **Notealy**. Estágio = **tag** (`upsertNotealyContact({ ..., tagId })`,
  casa por telefone→email→CPF). Ver `app/lib/api/notealy.ts`.
- Tags aplicadas em **pontos de entrada** e **conversão**:

| Momento | Onde | Tag |
|---|---|---|
| Preencheu form de lead | `app/api/leads/route.ts` | `NOTEALY_TAG_LEAD` |
| Fez teste vocacional | `app/api/teste-vocacional/submit` | `NOTEALY_TAG_TESTE_VOCACIONAL` |
| Usou simulador | `app/api/simulador` | `NOTEALY_TAG_SIMULADOR` |
| Landing ingressa | `app/api/ingressa` | `NOTEALY_TAG_INGRESSA` |
| Enviou inscrição | `app/api/leads/confirm-inscription` | `NOTEALY_TAG_INSCRITO` |
| Matrícula paga | checkout confirm | `NOTEALY_TAG_MATRICULADO` |

**O que falta:** o estágio de **intenção sem conclusão** — quem chegou fundo no
funil e parou. Ninguém taggeia isso hoje.

## O estágio novo: `abandonou_checkout`

Definição comportamental (fonte = PostHog): **validou CPF no checkout** (ou, após
o PR #59, `checkout_identified`) **e não** atingiu página de sucesso, em 14 dias.

- Materializado na **cohort PostHog `419066`** ("Abandonou checkout — identificado,
  não converteu (14d)"). É recalculada sozinha.
- Nova tag no CRM: **`NOTEALY_TAG_ABANDONO`** (adicionar ao env).

## Mapa completo comportamento → tag

```
Ponto de entrada (form/teste/simulador)          → lead / teste_vocacional / ...
Chegou ao checkout e se identificou, SEM concluir → abandonou_checkout   ← NOVO
Enviou inscrição                                  → inscrito
Matrícula paga                                    → matriculado
```

Precedência: `matriculado > inscrito > abandonou_checkout > lead/entrada`. Um
contato nunca deve regredir (só avança).

## Mecanismo de sync (a construir, com aprovação)

Um job agendado (padrão dos `scripts/`, ex.: `export-disparo-reativacao.ts`):

1. Lê os membros da cohort `419066` via PostHog (usa `POSTHOG_KEY_USER`).
2. Para cada contato com email/telefone, faz **upsert no Notealy** com a tag
   `abandonou_checkout`.
3. Exporta a lista de retargeting (WhatsApp) — importável na ferramenta de disparo.

Modo **dry-run** por padrão (só conta + exporta); `--apply` grava no CRM. **Não
envia mensagens** — o disparo é decisão à parte, com opt-out ("responda SAIR").

## Dependências

- **PR #59 (tracking) em produção:** hoje a identificação (email/telefone no
  PostHog) só acontece após inscrição concluída. Com o #59, `checkout_identified`
  grava o contato **no momento do CPF** → os abandonadores deixam de ser anônimos
  e ficam retargetáveis. Sem isso, a cohort captura o comportamento mas a maioria
  não tem email/telefone no PostHog.
- **`NOTEALY_TAG_ABANDONO`** no env.
- **Canal de retargeting:** WhatsApp (export CSV, já usado) e/ou email via template
  Notealy (`sendNotealyEmail`).

## Privacidade / LGPD

- Processa dados pessoais (nome/email/telefone) de contatos reais → exige base
  legal e opt-out. As mensagens incluem "responda SAIR".
- Nada de PII em logs além do necessário; o CSV fica em diretório temporário.
- O disparo real só com aprovação explícita do responsável.
