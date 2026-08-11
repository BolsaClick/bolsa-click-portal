# CRM — estágio por comportamento

> **Status (2026-08-11):** a integração com o CRM anterior (Notealy) foi
> removida do código em favor de uma troca de fornecedor. Este documento
> descreve a **especificação** de estágios, que é independente de fornecedor —
> a fonte dos estágios é o PostHog, não o CRM. Ao plugar o CRM novo, os pontos
> de integração estão listados em "Onde o CRM entra".

Objetivo: o estágio do contato no CRM reflete **o que a pessoa fez no produto**,
não só o ponto de entrada. Foco no estágio que não existe hoje: **"abandonou
checkout"** — alta intenção, não converteu — que é o público de retargeting.

## Onde o CRM entra

Todos os pontos abaixo já persistem o lead (tabela `Lead`) e/ou emitem evento
no PostHog. O que saiu foi só a chamada ao CRM; os call sites seguem marcados
em comentário.

| Momento | Onde | Estágio |
|---|---|---|
| Preencheu form de lead | `app/api/leads/route.ts` | lead |
| Fez teste vocacional | `app/api/teste-vocacional/submit` | teste_vocacional |
| Usou simulador | `app/api/simulador` | simulador |
| Landing ingressa (mídia paga) | `app/api/ingressa` | lead_ingressa |
| Enviou inscrição | `app/api/leads/confirm-inscription` | inscrito |
| **Inscrição recusada pelo parceiro** | `app/api/leads/inscription-failed` | inscricao_recusada |
| Matrícula paga | `app/lib/checkout/confirm-matricula.ts` | matriculado |

`inscricao_recusada` é o estágio mais quente da lista: a pessoa preencheu tudo,
apertou enviar e o parceiro barrou. Hoje ele sobrevive só como person property
no PostHog (`last_enrollment_status = failed`, com `last_enrollment_error`).

## O estágio novo: `abandonou_checkout`

Definição comportamental (fonte = PostHog): **validou CPF no checkout**
(`checkout_identified`) **e não** atingiu página de sucesso, em 14 dias.

Materializado na **cohort PostHog `419066`** ("Abandonou checkout — identificado,
não converteu (14d)"). É recalculada sozinha.

## Mapa completo comportamento → estágio

```
Ponto de entrada (form/teste/simulador/ingressa)   → lead / teste_vocacional / ...
Chegou ao checkout e se identificou, SEM concluir  → abandonou_checkout
Enviou inscrição e o parceiro recusou              → inscricao_recusada
Enviou inscrição                                   → inscrito
Matrícula paga                                     → matriculado
```

Precedência: `matriculado > inscrito > inscricao_recusada > abandonou_checkout >
lead/entrada`. Um contato nunca deve regredir (só avança) — e quem sai de
`inscricao_recusada` para `inscrito` precisa **perder** o estágio anterior, ou
receberá campanha de recuperação já matriculado.

## Mecanismo de sync (a construir, com aprovação)

Um job agendado (padrão dos `scripts/`):

1. Lê os membros da cohort `419066` via PostHog (usa `POSTHOG_KEY_USER`).
2. Para cada contato com email/telefone, faz upsert no CRM com o estágio
   `abandonou_checkout`.
3. Exporta a lista de retargeting (WhatsApp) — importável na ferramenta de disparo.

Modo **dry-run** por padrão (só conta + exporta); `--apply` grava no CRM. **Não
envia mensagens** — o disparo é decisão à parte, com opt-out ("responda SAIR").

## Dependências

- **Tracking em produção:** a identificação (`checkout_identified` com CPF como
  `distinct_id`) grava o contato no momento da validação do CPF → os
  abandonadores deixam de ser anônimos e ficam retargetáveis. Sem isso, a
  cohort captura o comportamento mas a maioria não tem email/telefone.
- **CRM novo definido**, com credenciais e um endpoint de upsert idempotente
  que case por telefone → email → CPF (o casamento por múltiplas chaves é o que
  evita contato duplicado entre estágios).

## Privacidade / LGPD

- Processa dados pessoais (nome/email/telefone) de contatos reais → exige base
  legal e opt-out. As mensagens incluem "responda SAIR".
- Nada de PII em logs além do necessário; o CSV fica em diretório temporário.
- O disparo real só com aprovação explícita do responsável.
