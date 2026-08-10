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

// Assinatura compatível com o `identifyUser` do usePostHogTracking.
type IdentifyFn = (
  userId: string,
  properties?: Record<string, string | number | boolean | null | undefined>,
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
 * Etapa 2 — o contato ficou identificável (email/telefone/CPF capturados).
 * Emite o evento com flags (nunca o valor cru) E, quando os setters são
 * passados, promove a pessoa de anônima para identificada — é isto que
 * habilita o retargeting de quem NÃO converteu.
 *
 * Com `cpf` + `identify`, o distinct_id passa a ser o CPF (só dígitos) já
 * NESTE ponto do funil, e não apenas no sucesso da inscrição. A diferença é
 * exatamente o buraco que cegou o time: quem falhava na Cogna nunca chegava ao
 * identify e ficava preso a um distinct_id de device — evento de falha sem
 * nome, sem CPF, impossível de reconciliar com o parceiro.
 *
 * O CPF é o mesmo id usado server-side (confirm-inscription /
 * inscription-failed), então browser e servidor colapsam na MESMA person.
 */
export function trackCheckoutIdentified(
  track: TrackFn,
  ctx: CheckoutContext & { email?: string; phone?: string; name?: string; cpf?: string },
  setPersonProperties?: SetPersonPropsFn,
  identify?: IdentifyFn,
): void {
  const hasEmail = !!ctx.email && ctx.email.includes('@')
  const hasPhone = !!ctx.phone && ctx.phone.replace(/\D/g, '').length >= 10
  const cpfDigits = (ctx.cpf || '').replace(/\D/g, '')
  const hasCpf = cpfDigits.length === 11

  track('checkout_identified', {
    ...baseProps(ctx),
    has_email: hasEmail,
    has_phone: hasPhone,
    has_cpf: hasCpf,
  })

  const personProps = {
    cpf: hasCpf ? cpfDigits : undefined,
    email: hasEmail ? ctx.email : undefined,
    phone: hasPhone ? ctx.phone!.replace(/\D/g, '') : undefined,
    name: ctx.name || undefined,
  }

  // identify já grava as person properties na mesma chamada — chamar os dois
  // duplicaria o $set sem ganho.
  if (identify && hasCpf) {
    identify(cpfDigits, personProps)
  } else if (setPersonProperties && (hasEmail || hasPhone)) {
    setPersonProperties(personProps)
  }
}

/**
 * Reporta ao servidor uma inscrição RECUSADA pelo parceiro.
 *
 * Existe porque o equivalente client-side (`checkout_inscription_failed`) só
 * dispara sob consentimento de cookie — que quase ninguém dá no checkout. Sem
 * este caminho server-to-server, a recusa do parceiro era invisível: sobrava
 * só o re-submit no log, sem quem tentou nem por quê.
 *
 * Best-effort e não-bloqueante por construção: telemetria nunca pode derrubar
 * o checkout, e o endpoint sempre responde 200.
 */
export function reportInscriptionFailure(payload: {
  flow: CheckoutFlow
  cpf?: string
  name?: string
  email?: string
  phone?: string
  courseName?: string
  courseId?: string | number
  brand?: string
  modalidade?: string
  city?: string
  source?: string
  errorMessage?: string
  errorStatus?: number
  errorBody?: string
  cognaKnownError?: boolean
}): void {
  // Sem CPF não há a quem amarrar a falha — evita request inútil.
  if (!payload.cpf || payload.cpf.replace(/\D/g, '').length !== 11) return

  void fetch('/api/leads/inscription-failed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((e) => console.error('Report de falha de inscrição não enviado:', e))
}

/** Etapa 3 — a inscrição foi enviada/criada (qualquer fluxo). */
export function trackCheckoutSubmitted(track: TrackFn, ctx: CheckoutContext): void {
  track('checkout_submitted', baseProps(ctx))
}

/** Etapa 4 — conversão final: página de sucesso de qualquer fluxo (sinal confiável). */
export function trackEnrollmentConverted(
  track: TrackFn,
  ctx: CheckoutContext & { value?: number; transactionId?: string },
): void {
  track('enrollment_converted', {
    ...baseProps(ctx),
    value: ctx.value,
    // Mesmo id do Purchase Meta/GA4 — permite cruzar a conversão entre vendors
    // e casa com o enrollment_paid_confirmed server-side.
    transaction_id: ctx.transactionId,
  })
}
