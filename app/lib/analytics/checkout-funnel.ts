// Esquema UNIFICADO do funil de checkout.
//
// Um vocabulário único de eventos para TODOS os fluxos de checkout
// (matrícula graduação, matrícula pós/profissionalizante e Estácio). Hoje cada
// fluxo emite eventos de conversão diferentes — `marketplace_inscription_created`,
// `checkout_inscription_submitted`, `enrollment_completed`,
// `estacio_enrollment_created` — o que torna o funil impossível de medir
// ponta-a-ponta (a conversão de graduação, em especial, é quase invisível:
// 1 disparo em 90 dias).
//
// Estes eventos são emitidos ALÉM dos legados (que alimentam GTM/Pixel/Utmify),
// nunca em substituição. Funil:
//
//   checkout_viewed → checkout_identified → checkout_submitted → enrollment_converted
//
// Regra de privacidade: o valor cru de email/telefone NUNCA vai como propriedade
// do evento — só flags `has_email`/`has_phone`. O email/telefone reais são
// gravados como person properties (identificação) para habilitar retargeting.

export type CheckoutFlow = 'matricula' | 'estacio'

// Assinatura compatível com o `trackEvent` do usePostHogTracking.
type TrackFn = (
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
) => void

type SetPersonPropsFn = (
  properties: Record<string, string | number | boolean | null | undefined>,
) => void

/** Normaliza o nível acadêmico bruto da oferta para um valor estável de análise. */
export function normalizeAcademicLevel(level?: string): string {
  const raw = (level || '').toUpperCase()
  if (raw.includes('POS')) return 'pos_graduacao'
  if (raw.includes('PROFIS')) return 'profissionalizante'
  if (raw.includes('GRADUACAO')) return 'graduacao'
  return raw ? raw.toLowerCase() : 'desconhecido'
}

export interface CheckoutContext {
  flow: CheckoutFlow
  academicLevel?: string
  brand?: string
  modality?: string
  courseId?: string | number
  courseName?: string
  offerId?: string | number
  source?: string
}

function baseProps(
  ctx: CheckoutContext,
): Record<string, string | number | boolean | null | undefined> {
  return {
    flow: ctx.flow,
    academic_level: ctx.academicLevel ? normalizeAcademicLevel(ctx.academicLevel) : undefined,
    brand: ctx.brand,
    modality: ctx.modality,
    course_id: ctx.courseId,
    course_name: ctx.courseName,
    offer_id: ctx.offerId,
    source: ctx.source,
  }
}

/** Etapa 1 — o checkout foi aberto (qualquer fluxo). */
export function trackCheckoutViewed(track: TrackFn, ctx: CheckoutContext): void {
  track('checkout_viewed', baseProps(ctx))
}

/**
 * Etapa 2 — o contato ficou identificável (email/telefone capturados).
 * Emite o evento com flags (nunca o valor cru) E, quando um setter é passado,
 * grava email/telefone/nome como person properties — é isto que tira a pessoa
 * do anonimato e habilita o retargeting de quem NÃO converteu.
 */
export function trackCheckoutIdentified(
  track: TrackFn,
  ctx: CheckoutContext & { email?: string; phone?: string; name?: string },
  setPersonProperties?: SetPersonPropsFn,
): void {
  const hasEmail = !!ctx.email && ctx.email.includes('@')
  const hasPhone = !!ctx.phone && ctx.phone.replace(/\D/g, '').length >= 10
  track('checkout_identified', {
    ...baseProps(ctx),
    has_email: hasEmail,
    has_phone: hasPhone,
  })
  if (setPersonProperties && (hasEmail || hasPhone)) {
    setPersonProperties({
      email: hasEmail ? ctx.email : undefined,
      phone: hasPhone ? ctx.phone!.replace(/\D/g, '') : undefined,
      name: ctx.name || undefined,
    })
  }
}

/** Etapa 3 — a inscrição foi enviada/criada (qualquer fluxo). */
export function trackCheckoutSubmitted(track: TrackFn, ctx: CheckoutContext): void {
  track('checkout_submitted', baseProps(ctx))
}

/** Etapa 4 — conversão final: página de sucesso de qualquer fluxo (sinal confiável). */
export function trackEnrollmentConverted(
  track: TrackFn,
  ctx: CheckoutContext & { value?: number },
): void {
  track('enrollment_converted', {
    ...baseProps(ctx),
    value: ctx.value,
  })
}
