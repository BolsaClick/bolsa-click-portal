/**
 * Regra de cobrança da campanha ingressa.digital (Cogna/Anhanguera e demais
 * marcas Cogna do domínio) — usada SÓ em app/lp/**.
 *
 * Irmã de `matricula-charge.ts` (portal principal bolsaclick.com.br), mas com
 * uma regra bem mais simples: valor FIXO, independente de oferta, modalidade
 * ou fonte. Decisão do CEO (2026-08-26): R$ 58,90 (5890 centavos), cobrados
 * ANTES da inscrição na Cogna, pra toda oferta vendida pela campanha.
 *
 * NUNCA reaproveitar esta constante no portal principal — lá quem decide é
 * `getMatriculaCharge` (matricula-charge.ts), com regra própria (graduação
 * EAD/semi + fonte ATHENAS) e hoje desativada por decisão de negócio.
 */
const CAMPAIGN_CHARGE_DEFAULT_CENTS = 5890

/**
 * Valor cobrado, em CENTAVOS. Default R$ 58,90; `CAMPAIGN_CHARGE_CENTS`
 * sobrescreve pra campanha que negocie outro valor, sem deploy.
 *
 * ATENÇÃO: env var SEM `NEXT_PUBLIC_` — só existe no servidor. NÃO importar
 * este módulo em componente client: lá `process.env` não tem a variável, a tela
 * mostraria o default e o servidor cobraria outro valor. A tela recebe o valor
 * por prop, a partir do server component (`app/lp/[partner]/checkout/page.tsx`).
 * Mesma disciplina de `taxa-cogna.ts` e `taxa-estacio.ts`.
 */
export const CAMPAIGN_CHARGE_AMOUNT_CENTS: number = (() => {
  const bruto = Number(process.env.CAMPAIGN_CHARGE_CENTS)
  // Valor inválido (vazio, texto, 0 ou negativo) cai no default: cobrança de
  // R$ 0,00 passaria batido no gateway e inscreveria todo mundo de graça.
  if (!Number.isFinite(bruto) || bruto <= 0) return CAMPAIGN_CHARGE_DEFAULT_CENTS
  return Math.round(bruto)
})()

/** Descrição da cobrança mostrada no gateway (Asaas/AbacatePay) e no extrato. */
export function campaignChargeDescription(courseName?: string | null): string {
  return courseName
    ? `Taxa de garantia de vaga — ${courseName}`
    : 'Taxa de garantia de vaga — Bolsa Click'
}
