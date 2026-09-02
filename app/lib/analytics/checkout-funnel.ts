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
  // Identificador ESTÁVEL do checkout/mecanismo que disparou o evento (ex:
  // 'cogna_matricula', 'estacio_checkout', 'ingressa_lead_form'). Existe
  // porque `flow` sozinho não basta: mais de um checkout/página pode
  // compartilhar o mesmo `flow` ('matricula' cobre tanto o checkout Cogna
  // quanto o lead form do ingressa para marcas não-Estácio), contaminando
  // qualquer número de funil calculado por `flow` — foi o que saiu errado num
  // relatório de abandono de checkout. `checkout_flow` é o dado que resolve
  // isso — cada chamador deve passar um valor próprio e nunca reaproveitar o
  // de outro arquivo.
  checkoutFlow?: string
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
    checkout_flow: ctx.checkoutFlow,
    academic_level: ctx.academicLevel ? normalizeAcademicLevel(ctx.academicLevel) : undefined,
    brand: ctx.brand,
    modality: ctx.modality,
    course_id: ctx.courseId,
    course_name: ctx.courseName,
    offer_id: ctx.offerId,
    source: ctx.source,
  }
}

// Observabilidade de falhas silenciosas do checkout — muita sessão perdida
// não clica em NADA, sinal de trava silenciosa, não desistência. Catches que
// caíam só em console.error (ou nem isso) ficavam invisíveis pro PostHog;
// `trackCheckoutError` é o ponto único que os arquivos do checkout (Cogna,
// Estácio, payment-link, lead form do ingressa) usam pra emitir `checkout_error`
// com o MESMO `track`/`onEvent` que cada arquivo já usa — nunca `window.posthog`
// direto, que já se provou `undefined` em produção.
//
// `step` deve ser um nome curto e estável (ex: 'cpf_validation').
//
// Regra de privacidade: a mensagem de erro pode ecoar CPF/e-mail/telefone (ex:
// validação que devolve o valor digitado) — sanitiza antes de mandar.
export function sanitizeCheckoutErrorMessage(message: string): string {
  return message
    // e-mail
    .replace(/[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/g, '[email]')
    // CPF, com ou sem máscara
    .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '[cpf]')
    // telefone/celular, com ou sem máscara
    .replace(/\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/g, '[telefone]')
    // qualquer sequência longa de dígitos residual (CEP, RG, etc.)
    .replace(/\d{5,}/g, '[numero]')
    .slice(0, 300)
}

/**
 * Dispara `checkout_error` no MESMO `track` (ou `onEvent`, mesma assinatura)
 * que o arquivo chamador já usa. Nunca deixa a telemetria derrubar o
 * checkout: qualquer falha aqui dentro é engolida.
 */
export function trackCheckoutError(track: TrackFn, step: string, error: unknown): void {
  try {
    const rawMessage = error instanceof Error ? error.message : String(error)
    track('checkout_error', {
      step,
      error_message: sanitizeCheckoutErrorMessage(rawMessage),
      error_name: error instanceof Error ? error.name : undefined,
    })
  } catch {
    // Telemetria nunca pode derrubar o checkout.
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
