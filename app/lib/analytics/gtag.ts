type DataLayerObject = Record<string, unknown>

function getDataLayer(): DataLayerObject[] | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & { dataLayer?: DataLayerObject[] }
  w.dataLayer = w.dataLayer ?? []
  return w.dataLayer
}

// Eventos do schema GA4 ecommerce. Antes de cada um, o Google recomenda
// `dataLayer.push({ ecommerce: null })` para limpar o objeto ecommerce do
// evento anterior (senão o GTM faz merge e vaza items/value entre eventos).
const ECOMMERCE_EVENTS = new Set([
  'view_item',
  'view_item_list',
  'select_item',
  'add_to_cart',
  'begin_checkout',
  'add_payment_info',
  'add_shipping_info',
  'purchase',
  'refund',
  'generate_lead',
])

/**
 * Push genérico no dataLayer do GTM, no schema padrão GA4 ecommerce — assim
 * GTM/GA4/Google Ads consomem os eventos sem tag/trigger custom por evento.
 *
 * Sem consent check próprio de propósito: o GTM (GTM-P556C53J) só é injetado
 * quando o usuário aceita marketing (ver AnalyticsScripts), então pushes num
 * dataLayer sem GTM carregado são inertes — nada é enviado ao Google. Isso
 * também preserva a fila: se o consentimento chegar depois, o GTM processa
 * os pushes anteriores ao carregar (comportamento padrão do container).
 */
export function pushDataLayerEvent(
  event: string,
  params?: Record<string, unknown>,
): void {
  const dataLayer = getDataLayer()
  if (!dataLayer) return
  try {
    if (ECOMMERCE_EVENTS.has(event)) {
      dataLayer.push({ ecommerce: null })
    }
    dataLayer.push({ event, ...params })
  } catch {
    // dataLayer corrompido por script third-party — mantém o app rodando.
  }
}
