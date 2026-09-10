import type { OfferDetails } from '@/app/lib/api/get-offer-details'

/**
 * Modalidades que cobram a taxa da plataforma no checkout (graduação
 * ATHENAS). Decisão do negócio, 2026-09-10: PRESENCIAL entrou junto de
 * EAD/SEMIPRESENCIAL — valor unitário baixo (R$ 19,90), mas o cálculo é por
 * volume ("se tivermos 1k de matrículas fica bom"), e volume só existe
 * cobrando todo mundo, não só quem é EAD.
 *
 * Só muda O GATE (`chargeable`). O valor cobrado nunca sai daqui — é sempre
 * `TAXA_MATRICULA_COGNA_CENTAVOS` (taxa-cogna.ts), fixo no servidor. Ver o
 * aviso no `amountInCents` abaixo.
 */
const CHARGEABLE_MODALITIES = new Set(['EAD', 'SEMIPRESENCIAL', 'PRESENCIAL'])

/**
 * Níveis acadêmicos que cobram a taxa da plataforma. Decisão do negócio,
 * 2026-09-10: pós-graduação e curso profissionalizante entraram junto de
 * graduação — volume mensal de checkout_viewed é baixo pra ambos hoje
 * (pós ~3-19/mês crescendo, profissionalizante ~0-5/mês), decisão direta do
 * Rodrigo mesmo assim, não recomendação técnica.
 *
 * Confirmado antes de codar: pós/profissionalizante usam o MESMO vocabulário
 * de modalidade (EAD/SEMIPRESENCIAL/PRESENCIAL) que graduação — testado
 * contra a API real da Tartarus, não presumido.
 */
const CHARGEABLE_ACADEMIC_LEVELS = new Set(['GRADUACAO', 'POS_GRADUACAO', 'CURSO_PROFISSIONALIZANTE'])

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
 * Decide se uma oferta deve cobrar a taxa da plataforma no checkout.
 *
 * Regra (definida com o negócio, atualizada 2026-09-10):
 *  - Cobra quando: nível acadêmico em graduação/pós-graduação/curso
 *    profissionalizante + modalidade EAD/semipresencial/presencial + fonte
 *    ATHENAS. Ofertas não-ATHENAS continuam sem cobrança (inscrição direta)
 *    — não temos taxa fixa configurada pra elas.
 *  - Pra pós/profissionalizante, essa taxa (R$ 19,90) é cobrança DIFERENTE
 *    da mensalidade real do curso: a mensalidade continua sendo cobrada pela
 *    Cogna via o mesmo mecanismo de payment-link (PaymentLinkCard) que já
 *    existe pra graduação, embutido em iframe pra esses dois níveis
 *    (EMBEDDABLE_HOSTS em PaymentLinkCard.tsx) — não é uma terceira UI.
 *  - `amountInCents` aqui é só INFORMATIVO (preço da oferta, pra telas que
 *    ainda usem esse número pra exibir algo). NUNCA é o valor cobrado — quem
 *    cobra é `TAXA_MATRICULA_COGNA_CENTAVOS`, fixo no servidor, independente
 *    do preço do curso. Ver o aviso em `taxa-cogna.ts`.
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
    CHARGEABLE_ACADEMIC_LEVELS.has(academicLevel) &&
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
