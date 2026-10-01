/**
 * Interruptor geral de pagamentos do site.
 *
 * Decisão do Rodrigo (2026-10-01, urgente): tirar do ar TODA cobrança e toda
 * tela de pagamento — taxa da plataforma (Cogna e Estácio), taxa da campanha
 * ingressa e os links/PIX de pagamento da instituição. As inscrições seguem
 * sem cobrança, pelos trilhos diretos que já existiam antes das taxas.
 *
 * Constante (e não env var) de propósito: precisa valer igual no servidor e
 * no cliente, sem depender de `NEXT_PUBLIC_` nem de redeploy de config.
 *
 * ROLLBACK: reverter o PR que introduziu este arquivo (ou trocar para `false`).
 */
export const PAYMENTS_DISABLED = true

/** Resposta padrão das rotas de cobrança enquanto o interruptor está ligado. */
export const PAYMENTS_DISABLED_MESSAGE =
  'Pagamentos estão temporariamente desativados no Bolsa Click.'
