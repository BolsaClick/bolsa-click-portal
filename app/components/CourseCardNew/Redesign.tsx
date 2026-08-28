import { Course } from "@/app/interface/course"
import { hasInstallmentPlan } from '@/app/components/v2/course-offer'
import { titleCasePtBr } from "@/app/lib/utils/title-case"
import { useFavorites } from "@/app/lib/hooks/useFavorites"
import { usePostHogTracking } from "@/app/lib/hooks/usePostHogTracking"
import { useCourseSelection } from "@/app/lib/hooks/useCourseSelection"
import { courseNeedsShiftSelection, resolveCourseModality, buildCourseCheckoutDestination } from "@/app/lib/checkout/course-destination"
import { getPriceAnchor } from "@/app/lib/utils/price-anchor"
import { brandMecKey } from "@/app/lib/utils/brand"
import { formatCurrency } from "@/utils/fomartCurrency"
import { Building2, Clock, Heart, MapPin, Star, Users, Lock, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface CourseCardProps {
  course: Course
  courseName: string
  /** Slug de /cursos/[slug] quando o curso tem página de detalhe enriquecida (FeaturedCourse). */
  detailSlug?: string
  /** Marca (chave slugificada via brandMecKey) → nota MEC (1-5). Sem o dado, o selo não aparece. */
  mecRatings?: Record<string, number>
}

const CourseCardRedesign: React.FC<CourseCardProps> = ({
  course,
  courseName,
  detailSlug,
  mecRatings,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { trackEvent } = usePostHogTracking()
  const { selectCourse } = useCourseSelection('resultado')
  const [selectedShift, setSelectedShift] = useState<string>('')
  const [justFavorited, setJustFavorited] = useState(false)

  const courseModality = resolveCourseModality(course)

  const needsShiftSelection = () => courseNeedsShiftSelection(course)

  // Destino + tracking vêm do hook compartilhado (useCourseSelection) — mesma
  // fonte de verdade do card original e das landings de SEO.
  const handleClick = async () => {
    await selectCourse(course, {
      selectedShift,
      extraProps: { design_version: 'redesign_v2' },
    })
  }

  const destination = buildCourseCheckoutDestination(course, selectedShift)
  const shiftBlocked = needsShiftSelection() && !selectedShift

  const renderUniversityImage = (universityName: string) => {
    const n = (universityName || '').toLowerCase()
    // UNAES é a marca que a Cogna usa em todo o catálogo profissionalizante
    // (COSMOS) — 2.000 ofertas, país inteiro. Faz parte da família Anhanguera
    // e não tem logo próprio no repositório, então usa o da Anhanguera
    // (decisão do Rodrigo, 2026-08-20). Vem ANTES do teste de 'anhanguera'
    // só por clareza de leitura; as duas strings não colidem.
    if (n.includes('unaes')) return '/assets/logo-anhanguera-bolsa-click.svg'
    if (n.includes('anhanguera')) return '/assets/logo-anhanguera-bolsa-click.svg'
    if (n.includes('unopar')) return '/assets/logo-unopar.svg'
    if (n.includes('pitagoras') || n.includes('pitágoras')) return '/assets/logo-pitagoras.svg'
    if (n.includes('unime')) return '/assets/logo-unime-p.png'
    if (n.includes('estacio') || n.includes('estácio')) return '/estacio-logo.png'
    if (n.includes('wyden')) return '/assets/wyden.svg'
    if (n.includes('ibmec')) return '/assets/logo-ibmec.svg'
    // UNIC, como a UNAES, é da família Anhanguera e não tem logo próprio
    // aqui (decisão do Rodrigo, 2026-08-20). Fica por ÚLTIMO de propósito:
    // 'unic' é curto e casaria dentro de nomes de outras marcas se viesse
    // antes — as marcas YDUQS chegam como nome completo da unidade.
    if (n.includes('unic')) return '/assets/logo-anhanguera-bolsa-click.svg'
    return '/assets/logo-bolsa-click-rosa.png'
  }

  const priceAnchor = getPriceAnchor({
    from: course.maxPrice,
    to: course.minPrice,
    durationMonths: course.durationInMonths ?? course.duration,
  })
  const hasDiscount = priceAnchor !== null
  // Nota MEC real da instituição (Institution.mecRating, 1-5) — course.mecScore
  // fica como fallback (campo do tipo, mas hoje nunca populado por nenhuma
  // fonte); sem dado em nenhum dos dois, undefined e o selo não aparece.
  const mecRating = course.mecScore ?? mecRatings?.[brandMecKey(course.brand)]

  return (
    <article
      onClick={(e) => {
        // Card inteiro clicável → mesma ação do "Inscreva-se". Igual ao card
        // original: o corpo parecia clicável mas não fazia nada (maior foco de
        // rageclick e de saída do site). Ignora cliques em controles internos.
        if (
          (e.target as HTMLElement).closest(
            'button, a, select, input, label, [role="button"]',
          )
        ) {
          return
        }
        void handleClick()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          void handleClick()
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-ink-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(11,31,60,0.12)] hover:-translate-y-0.5">

      {/* TOPO: desconto calculado exclusivamente com preços retornados pela API */}
      {hasDiscount && (
        <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
          <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{priceAnchor?.discountPct}%
          </span>
          <span className="text-xs text-emerald-700 font-medium">
            Desconto real na mensalidade
          </span>
        </div>
      )}

      {/* HEADER: Logo + Favoritar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="h-6 flex items-center">
          <Image
            src={renderUniversityImage(course.brand || '')}
            alt={course.brand || ''}
            width={140}
            height={24}
            className="h-6 w-auto object-contain"
            priority
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.72 }}
          onClick={() => {
            const wasFavorite = isFavorite(course)
            toggleFavorite(course)
            if (!wasFavorite) {
              setJustFavorited(true)
              setTimeout(() => setJustFavorited(false), 700)
            }
            trackEvent(wasFavorite ? 'course_unfavorited' : 'course_favorited', {
              course_id: course.id,
              design_version: 'redesign_v2',
            })
          }}
          className="relative p-1.5 hover:bg-ink-100/50 rounded-full transition-colors"
        >
          <motion.div
            animate={isFavorite(course)
              ? { scale: [1, 1.45, 0.9, 1], rotate: [0, -15, 8, 0] }
              : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Heart
              size={17}
              className={isFavorite(course) ? 'fill-bolsa-secondary text-bolsa-secondary' : 'text-ink-300'}
              style={{ transition: 'fill 0.2s, color 0.2s' }}
            />
          </motion.div>
          <AnimatePresence>
            {justFavorited && [0, 1, 2, 3].map(i => {
              const angle = (i / 4) * Math.PI * 2
              const x = Math.cos(angle) * 18
              const y = Math.sin(angle) * 18
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 1, x, y }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-bolsa-secondary pointer-events-none"
                  style={{ top: '50%', left: '50%', marginTop: -3, marginLeft: -3 }}
                />
              )
            })}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* NOME DO CURSO */}
      <h3 className="px-5 pb-3 text-[15px] font-bold text-ink-900 leading-snug line-clamp-2">
        {courseName || course.name}
      </h3>

      {/* Link secundário pra quem ainda está em dúvida — não compete com o
          CTA principal, só dá saída pra grade/carreira/FAQ do curso. Só
          aparece quando há página enriquecida (FeaturedCourse). */}
      {detailSlug && (
        <Link
          href={`/cursos/${detailSlug}`}
          prefetch={false}
          onClick={(e) => {
            e.stopPropagation()
            trackEvent('course_details_clicked', {
              course_name: course.name,
              brand: course.brand,
              detail_slug: detailSlug,
              design_version: 'redesign_v2',
            })
          }}
          className="px-5 pb-3 block w-fit text-[12px] text-bolsa-primary hover:underline"
        >
          Ver detalhes do curso
        </Link>
      )}

      {/* SOCIAL PROOF: MEC + alunos */}
      <div className="px-5 pb-4 flex items-center gap-4">
        {typeof mecRating === 'number' && (
          <div className="flex items-center gap-1" title={`Nota MEC: ${mecRating} de 5`}>
            <Star size={13} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-bold text-ink-900">{mecRating.toFixed(1)}</span>
            <span className="text-xs text-ink-500">MEC</span>
          </div>
        )}
        {course.enrolledCount && (
          <div className="flex items-center gap-1.5 text-ink-500">
            <Users size={13} strokeWidth={2} />
            <span className="text-xs">
              {course.enrolledCount >= 1000
                ? `${(course.enrolledCount / 1000).toFixed(course.enrolledCount >= 10000 ? 0 : 1)}k formados`
                : `${course.enrolledCount} formados`}
            </span>
          </div>
        )}
      </div>

      {/* DETALHES: modalidade, duração, cidade */}
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center gap-2 text-ink-500 text-[13px]">
          <Building2 size={13} className="flex-shrink-0" />
          <span>{courseModality}</span>
        </div>
        {course.durationInMonths && (
          <div className="flex items-center gap-2 text-ink-500 text-[13px]">
            <Clock size={13} className="flex-shrink-0" />
            <span>{course.durationInMonths} meses</span>
          </div>
        )}
        {(course.unitAddress || course.city) && (
          <div className="flex items-start gap-2 text-ink-500 text-[13px]">
            <MapPin size={13} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {course.unitAddress ? (
                <>
                  {titleCasePtBr(course.unitAddress)}
                  {course.unitDistrict && ` — ${titleCasePtBr(course.unitDistrict)}`}
                  {(course.unitCity || course.city) && ` — ${titleCasePtBr(course.unitCity || course.city)}`}
                </>
              ) : (
                course.city
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* RODAPÉ: preço + CTA */}
      <div className="px-5 pb-5 pt-4 border-t border-ink-100">
        {/* Comparativo usa apenas os preços real e cheio retornados pela API */}
        {priceAnchor && (
          <div className="mb-1.5">
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <span>
                De{' '}
                <span className="line-through decoration-ink-300">
                  {formatCurrency(course.maxPrice!)}
                </span>
              </span>
              <span className="rounded-full bg-rose-50 px-2 py-0.5 font-bold text-bolsa-secondary">
                -{priceAnchor.discountPct}%
              </span>
            </div>
            {priceAnchor.totalSavings !== null && (
              <p className="mt-0.5 text-[11px] text-emerald-600">
                Economize {formatCurrency(priceAnchor.totalSavings)} até o fim do curso
              </p>
            )}
          </div>
        )}

        {/* Preço atual */}
        <div className="mb-4">
          <p className="text-[11px] text-ink-500 uppercase tracking-widest font-medium mb-1">
            {hasInstallmentPlan(course)
              ? 'até'
              : 'a partir de'}
          </p>
          <p className="text-2xl font-black text-bolsa-primary leading-none">
            {hasInstallmentPlan(course) ? (
              <span>{course.totalInstallment}x {course.minInstallmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            ) : (
              <span>
                {(course.minPrice ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                <span className="text-sm font-semibold text-ink-500">/mês</span>
              </span>
            )}
          </p>
        </div>

        {/* CTA — cor do site: bolsa-secondary */}
        <a
          href={destination.href}
          onClick={(e) => {
            if (shiftBlocked) {
              e.preventDefault()
              return
            }
            void handleClick()
          }}
          aria-disabled={shiftBlocked || undefined}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
            shiftBlocked
              ? 'bg-ink-100 text-ink-500 cursor-not-allowed pointer-events-none'
              : 'bg-bolsa-secondary hover:brightness-95 text-white active:scale-[.98] shadow-sm'
          }`}
        >
          <Lock size={15} strokeWidth={2.5} />
          {shiftBlocked ? 'Selecione o turno' : 'Garantir Bolsa'}
        </a>

        {/* Trunfo universal: diferente de agregadores concorrentes, não
            cobramos taxa de inscrição/pré-matrícula em nenhum trilho (ver
            app/lib/checkout/matricula-charge.ts e EstacioCheckoutClient). */}
        <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-ink-400">
          <ShieldCheck size={12} className="flex-shrink-0" />
          Sem taxa de inscrição
        </p>

        {/* Seletor de turno */}
        {needsShiftSelection() && course.shiftOptions && (
          <select
            value={selectedShift}
            onChange={(e) => {
              setSelectedShift(e.target.value)
              trackEvent('course_shift_selected', {
                course_id: course.id,
                selected_shift: e.target.value,
                design_version: 'redesign_v2',
              })
            }}
            className="w-full mt-2.5 p-2.5 border border-ink-100 rounded-xl text-sm bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-bolsa-secondary/40"
          >
            <option value="" disabled>Selecione o turno</option>
            {course.shiftOptions.map((shift) => (
              <option key={shift} value={shift}>
                {shift === 'MATUTINO' ? 'Manhã' :
                 shift === 'VESPERTINO' ? 'Tarde' :
                 shift === 'NOTURNO' ? 'Noite' :
                 shift === 'INTEGRAL' ? 'Integral' :
                 shift}
              </option>
            ))}
          </select>
        )}
      </div>
    </article>
  )
}

export default CourseCardRedesign
