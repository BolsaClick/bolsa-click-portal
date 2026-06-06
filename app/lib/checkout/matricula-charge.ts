import type { OfferDetails } from '@/app/lib/api/get-offer-details'

/**
 * Modalidades que cobram a matrícula no checkout (graduação ATHENAS).
 * Presencial fica de fora — não cobramos no portal.
 */
const CHARGEABLE_MODALITIES = new Set(['EAD', 'SEMIPRESENCIAL'])

/** Fonte da oferta que habilita cobrança da matrícula no portal. */
const CHARGEABLE_SOURCE = 'ATHENAS'

export interface MatriculaCharge {
  /** true quando a oferta deve cobrar a matrícula no checkout transparente. */
  chargeable: boolean
  /**
   * Valor a cobrar em centavos. Matrícula (subscriptionValue) quando > 0;
   * caso contrário cai na 1ª mensalidade (montlyFeeTo). Só é relevante quando
   * `chargeable` é true.
   *
   * Obs.: `subscriptionValue`/`montlyFeeTo` vêm em REAIS da oferta (o catálogo
   * trabalha em reais — ver `formatCurrency`/eventos de analytics); aqui
   * convertemos para centavos, que é o que o Elysium/gateways esperam.
   */
  amountInCents: number
}

/**
 * Decide se uma oferta deve cobrar a matrícula no checkout e quanto.
 *
 * Regra (definida com o negócio):
 *  - Cobra quando: graduação + modalidade EAD/semipresencial + fonte ATHENAS.
 *  - Presencial e ofertas não-ATHENAS continuam sem cobrança (inscrição direta).
 *  - Valor = matrícula (`subscriptionValue`); se vier 0/nulo, cobra a 1ª
 *    mensalidade (`montlyFeeTo`). Oferta elegível sempre tem cobrança.
 */
export function getMatriculaCharge(
  offerDetails: Pick<
    OfferDetails,
    'academicLevel' | 'modality' | 'dmhSource' | 'subscriptionValue' | 'montlyFeeTo'
  > | null | undefined
): MatriculaCharge {
  if (!offerDetails) {
    return { chargeable: false, amountInCents: 0 }
  }

  const academicLevel = (offerDetails.academicLevel ?? '').trim().toUpperCase()
  const modality = (offerDetails.modality ?? '').trim().toUpperCase()
  const source = (offerDetails.dmhSource?.source ?? '').trim().toUpperCase()

  const chargeable =
    academicLevel === 'GRADUACAO' &&
    CHARGEABLE_MODALITIES.has(modality) &&
    source === CHARGEABLE_SOURCE

  if (!chargeable) {
    return { chargeable: false, amountInCents: 0 }
  }

  const subscriptionValue = offerDetails.subscriptionValue || 0
  const monthlyFee = offerDetails.montlyFeeTo || 0
  // Valores da oferta estão em reais → converter para centavos.
  const amountInReais = subscriptionValue > 0 ? subscriptionValue : monthlyFee
  const amountInCents = Math.round(amountInReais * 100)

  return { chargeable: true, amountInCents }
}
