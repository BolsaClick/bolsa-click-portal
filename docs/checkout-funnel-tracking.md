# Funil de checkout unificado — tracking

Contexto: os fluxos de checkout emitiam **eventos de conversão diferentes**, então
o funil não era mensurável ponta-a-ponta. A conversão de graduação, em especial,
tinha um sinal frágil: o evento de conversão do ramo de graduação quase não
dispara, enquanto a página de sucesso é atingida — ou seja, conversões reais não
geravam um sinal consistente e comparável entre fluxos.

Esta camada adiciona um **vocabulário único** por cima dos eventos legados (que
seguem alimentando GTM/Pixel/Utmify — nada foi removido).

Fonte: `app/lib/analytics/checkout-funnel.ts`.

## Os 5 eventos

| Evento | Quando dispara | Propriedades-chave |
|---|---|---|
| `checkout_viewed` | Checkout aberto (todos os fluxos) | `flow`, `academic_level`, `brand`, `modality`, `course_id`/`offer_id`, `course_name` |
| `checkout_identified` | Contato preenchido (email/telefone) — matrícula: no CPF validado; Estácio: na inscrição criada | `flow`, `has_email`, `has_phone` (+ grava email/telefone como *person properties*) |
| `checkout_submitted` | Inscrição enviada/criada (todos os ramos) | `flow`, `academic_level`, `course_id`/`offer_id` |
| `enrollment_converted` | Página de sucesso (sinal confiável, todos os fluxos) | `flow`, `academic_level`, `value`, `course_name` |

`flow` ∈ `matricula` | `estacio`. `academic_level` normalizado: `graduacao` \|
`pos_graduacao` \| `profissionalizante`.

## Por que resolve o problema

1. **Funil ponta-a-ponta real:** `checkout_viewed → checkout_identified →
   checkout_submitted → enrollment_converted`, com breakdown por `flow` e
   `academic_level`. Não depende mais de juntar 4 eventos diferentes.
2. **Graduação deixa de ser ponto cego:** `checkout_submitted` (ramo ATHENAS) e
   `enrollment_converted` (página de sucesso) capturam o que
   `marketplace_inscription_created` não capturava.
3. **Retargeting habilitado:** `checkout_identified` grava email/telefone como
   person properties **no momento em que são preenchidos** — inclusive para quem
   valida CPF mas NÃO conclui. Antes, a identificação só acontecia após inscrição
   bem-sucedida, deixando os abandonadores anônimos (não-alcançáveis).

## Privacidade

O valor cru de email/telefone **nunca** vai como propriedade de evento — só as
flags `has_email`/`has_phone`. Email/telefone reais vão apenas como *person
properties* (identificação), consistente com o `identifyUser` que já existia.

## Próximos passos (fora deste PR)

- **Dashboard PostHog:** funil unificado + top páginas + origem de tráfego +
  retenção.
- **Estágio no CRM (Notealy) por comportamento:** mapear
  `checkout_identified`/`submitted`/`converted` → tags (lead/inscrito/matriculado)
  e um estágio "abandonou" para retargeting.
- **Retargeting de abandono** ("por que abandonou seu sonho de faculdade?") para
  o público `checkout_identified` sem `enrollment_converted`.

## Validação

`tsc --noEmit` sem erros; `eslint` sem erros nos arquivos tocados. A verificação
de disparo real (eventos chegando ao PostHog) precisa ser feita percorrendo cada
fluxo de checkout no navegador — pendente de uma sessão manual/e2e.
