import Link from 'next/link'
import { MapPin, Clock3, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/utils/fomartCurrency'
import { getPriceAnchor } from '@/app/lib/utils/price-anchor'

/**
 * Item de oferta pronto pra exibição no grid — já resolvido a partir de
 * `Course` (getInstitutionCourses/normalizeAthenaOffer) + catálogo
 * (FeaturedCourse, pro tipo de grau e o slug de "ver detalhes").
 *
 * Só carrega o que a Athena de fato devolve — ver comentário em
 * app/lib/api/athena-offers.ts (AthenaOffer). Nada de "24x" (parcelamento) ou
 * "mensalidade grátis": não são campos normalizados hoje (CLAUDE.md proíbe
 * inventar número).
 */
export interface OfferCardData {
  id: string
  name: string
  /** BACHARELADO/LICENCIATURA/TECNOLOGO — do catálogo (FeaturedCourse), quando casa por nome. */
  courseType?: 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO' | null
  academicLevel?: string
  modality?: string
  shift?: string
  durationMonths?: number
  minPrice: number
  maxPrice?: number
  unitName?: string
  unitCity?: string
  unitState?: string
  /** Slug do FeaturedCourse — link "Ver detalhes do curso" pra /lp/{partner}/{slug}. */
  slug?: string
  // Passthrough pro checkout Estácio quando não há slug (ver buildEstacioCheckoutHref).
  offerId?: string
  brand?: string
  unitAddress?: string
  unitDistrict?: string
  unitPostalCode?: string
  codFormaIngressoOferta?: number
  priceForma2?: number
  priceForma3?: number
  /**
   * Fonte da oferta (mesmo discriminador de `Course.source`, ver
   * app/interface/course.ts). 'YDUQS' = Estácio (trilho por inscrição direta,
   * /checkout/estacio). Ausente/'TARTARUS' = Cogna — trilho do checkout pago
   * da campanha (/lp/{partner}/checkout, ver buildCampaignCheckoutHref).
   */
  source?: 'YDUQS' | 'TARTARUS'
  /** Course.id (groupId) — só ofertas Cogna, exigido por getOfferDetails. */
  groupId?: string
  /** Só ofertas Cogna — exigido por getOfferDetails junto com groupId. */
  unitId?: string
}

const COURSE_TYPE_LABEL: Record<string, string> = {
  BACHARELADO: 'Bacharelado',
  LICENCIATURA: 'Licenciatura',
  TECNOLOGO: 'Tecnólogo',
}

const ACADEMIC_LEVEL_LABEL: Record<string, string> = {
  GRADUACAO: 'graduação',
  POS_GRADUACAO: 'pós-graduação',
  CURSO_TECNICO: 'técnico',
}

const MODALITY_LABEL: Record<string, string> = {
  EAD: 'EaD',
  VIRTUAL: 'EaD',
  PRESENCIAL: 'Presencial',
  SEMIPRESENCIAL: 'Semipresencial',
}

const SHIFT_LABEL: Record<string, string> = {
  VIRTUAL: 'Virtual',
  NOTURNO: 'Noturno',
  MATUTINO: 'Matutino',
  VESPERTINO: 'Vespertino',
  INTEGRAL: 'Integral',
}

function metadataLine(o: OfferCardData): string {
  const parts: string[] = []
  const typeLabel = o.courseType ? COURSE_TYPE_LABEL[o.courseType] : undefined
  const levelLabel = o.academicLevel ? ACADEMIC_LEVEL_LABEL[o.academicLevel] : undefined
  if (typeLabel && levelLabel) parts.push(`${typeLabel} (${levelLabel})`)
  else if (typeLabel) parts.push(typeLabel)
  else if (levelLabel) parts.push(levelLabel.charAt(0).toUpperCase() + levelLabel.slice(1))

  const modalityLabel = o.modality ? MODALITY_LABEL[o.modality.toUpperCase()] : undefined
  if (modalityLabel) parts.push(modalityLabel)

  if (typeof o.durationMonths === 'number' && o.durationMonths > 0) {
    parts.push(`${o.durationMonths} meses`)
  }

  const shiftLabel = o.shift ? SHIFT_LABEL[o.shift.toUpperCase()] : undefined
  if (shiftLabel) parts.push(shiftLabel)

  return parts.join(' • ')
}

function locationLabel(o: OfferCardData): string | null {
  const modalityKey = o.modality?.toUpperCase()
  if (modalityKey === 'EAD' || modalityKey === 'VIRTUAL') return '100% online'
  if (o.unitName && o.unitCity) return `${o.unitName} — ${o.unitCity}${o.unitState ? `/${o.unitState}` : ''}`
  if (o.unitCity) return `${o.unitCity}${o.unitState ? `/${o.unitState}` : ''}`
  return null
}

/** Mesmo contrato de query params que /checkout/estacio lê (ver EstacioCheckoutClient). */
export function buildEstacioCheckoutHref(o: OfferCardData): string {
  const params = new URLSearchParams()
  if (o.offerId) params.set('offerId', o.offerId)
  if (o.name) params.set('courseName', o.name)
  if (o.brand) params.set('brand', o.brand)
  if (o.modality) params.set('modality', o.modality)
  if (o.minPrice) params.set('price', String(o.minPrice))
  if (o.unitCity) params.set('city', o.unitCity)
  if (o.unitState) params.set('state', o.unitState)
  if (o.academicLevel) params.set('academicLevel', o.academicLevel)
  if (o.unitAddress) params.set('unitAddress', o.unitAddress)
  if (o.unitDistrict) params.set('unitDistrict', o.unitDistrict)
  if (o.unitPostalCode) params.set('unitPostalCode', o.unitPostalCode)
  // Forma de ingresso da linha de catálogo: o checkout deriva dela quais
  // opções pode oferecer sem cair em MS004 na YDUQS.
  if (o.codFormaIngressoOferta !== undefined)
    params.set('codFormaIngressoOferta', String(o.codFormaIngressoOferta))
  if (o.priceForma2) params.set('priceForma2', String(o.priceForma2))
  if (o.priceForma3) params.set('priceForma3', String(o.priceForma3))
  if (typeof o.maxPrice === 'number') params.set('maxPrice', String(o.maxPrice))
  if (typeof o.durationMonths === 'number') params.set('durationInMonths', String(o.durationMonths))
  return `/checkout/estacio?${params.toString()}`
}

/**
 * Checkout pago da campanha (Cogna/Anhanguera): mesmo contrato de
 * groupId/unitId/modality/shift que /checkout/matricula usa pra buscar a
 * oferta (getOfferDetails) — ver app/lp/[partner]/checkout/page.tsx.
 */
export function buildCampaignCheckoutHref(o: OfferCardData, partner: string): string {
  const params = new URLSearchParams()
  if (o.groupId) params.set('groupId', o.groupId)
  if (o.unitId) params.set('unitId', o.unitId)
  if (o.modality) params.set('modality', o.modality)
  if (o.shift) params.set('shift', o.shift)
  if (o.name) params.set('courseName', o.name)
  if (o.brand) params.set('brand', o.brand)
  if (o.minPrice) params.set('price', String(o.minPrice))
  if (o.unitCity) params.set('city', o.unitCity)
  if (o.unitState) params.set('state', o.unitState)
  if (o.academicLevel) params.set('academicLevel', o.academicLevel)
  if (typeof o.durationMonths === 'number') params.set('durationInMonths', String(o.durationMonths))
  return `/lp/${partner}/checkout?${params.toString()}`
}

/** true quando o card tem o mínimo pra ir direto pro checkout pago da campanha. */
function isCampaignReady(o: OfferCardData): boolean {
  return o.source !== 'YDUQS' && !!o.groupId && !!o.unitId && !!o.modality
}

interface OfferCardProps {
  offer: OfferCardData
  partner: string
  brandColor: string
}

export function OfferCard({ offer, partner, brandColor }: OfferCardProps) {
  const anchor = getPriceAnchor({
    from: offer.maxPrice,
    to: offer.minPrice,
    durationMonths: offer.durationMonths,
  })
  const meta = metadataLine(offer)
  const location = locationLabel(offer)
  const campaignReady = isCampaignReady(offer)
  // Estácio (YDUQS) segue o trilho de detalhe/inscrição direta que já existia.
  // Cogna (TARTARUS/ausente) com dados suficientes vai direto pro checkout
  // pago da campanha — sem passo de "detalhes" no meio, pra não perder o
  // clique antes da cobrança de R$ 58,90.
  const detailsHref =
    offer.source === 'YDUQS'
      ? offer.slug
        ? `/lp/${partner}/${offer.slug}`
        : buildEstacioCheckoutHref(offer)
      : campaignReady
        ? buildCampaignCheckoutHref(offer, partner)
        : offer.slug
          ? `/lp/${partner}/${offer.slug}`
          : `/lp/${partner}`

  return (
    <li className="bg-white border border-hairline rounded-2xl p-5 flex flex-col gap-3 hover:shadow-[0_20px_45px_-32px_rgba(11,31,60,0.35)] transition-shadow">
      <h3 className="font-display text-lg text-ink-900 leading-snug">{offer.name}</h3>

      {meta && (
        <p className="text-[12px] text-ink-500 leading-relaxed">{meta}</p>
      )}

      <div className="mt-1">
        {anchor && (
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] text-ink-300 line-through num-tabular">
              De {formatCurrency(offer.maxPrice as number)}
            </span>
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-white text-[10px] font-bold tracking-wide"
              style={{ backgroundColor: brandColor }}
            >
              −{anchor.discountPct}% OFF
            </span>
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] text-ink-500 font-mono uppercase tracking-wide mr-1">Por</span>
          <span className="font-display num-tabular text-[26px] font-bold text-ink-900 leading-none">
            {formatCurrency(offer.minPrice)}
          </span>
          <span className="text-[11px] text-ink-500">/mês</span>
        </div>
        {anchor?.totalSavings != null && (
          <p className="text-[11px] text-emerald-600 mt-1">
            Economize {formatCurrency(anchor.totalSavings)} até o fim do curso
          </p>
        )}
      </div>

      {location && (
        <p className="inline-flex items-start gap-1.5 text-[12px] text-ink-500">
          <MapPin size={13} className="shrink-0 mt-0.5" />
          {location}
        </p>
      )}

      <Link
        href={detailsHref}
        className="mt-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-white text-[13px] font-semibold hover:opacity-90"
        style={{ backgroundColor: brandColor }}
      >
        {campaignReady ? (
          <>
            <CreditCard size={13} />
            Garantir minha vaga
          </>
        ) : (
          <>
            <Clock3 size={13} />
            Ver detalhes do curso
          </>
        )}
      </Link>
    </li>
  )
}
