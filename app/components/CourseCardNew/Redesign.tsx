import { Course } from "@/app/interface/course"
import { postSearch } from "@/app/lib/api/post-search"
import { useFavorites } from "@/app/lib/hooks/useFavorites"
import { usePostHogTracking } from "@/app/lib/hooks/usePostHogTracking"
import { trackFbqDual } from "@/app/lib/analytics/fbq"
import { trackTikTok } from "@/app/lib/analytics/ttq"
import { Building2, Clock, Heart, MapPin, Star, Users, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

interface CourseCardProps {
  course: Course
  courseName: string
}

const CourseCardRedesign: React.FC<CourseCardProps> = ({
  course,
  courseName,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { trackEvent } = usePostHogTracking()
  const [selectedShift, setSelectedShift] = useState<string>('')
  const [justFavorited, setJustFavorited] = useState(false)

  const courseModality = course.modality?.toUpperCase() || course.commercialModality?.toUpperCase() || ''

  const needsShiftSelection = () => {
    if (!course.businessKey || !course.unitId) return false
    const isVirtual = course.shiftOptions?.some(s => s.toUpperCase() === 'VIRTUAL') ||
      course.classShift?.toUpperCase() === 'VIRTUAL'
    if (isVirtual) return false
    const hasMultipleShifts = course.shiftOptions && course.shiftOptions.length > 1
    return hasMultipleShifts
  }

  const handleClick = async () => {
    if (needsShiftSelection() && !selectedShift) {
      toast.error('Por favor, selecione o turno')
      trackEvent('course_card_click_blocked', {
        reason: 'shift_not_selected',
        course_id: course.id,
        course_name: course.name,
        design_version: 'redesign_v2',
      })
      return
    }

    if (course.source === 'YDUQS') {
      trackEvent('course_selected', {
        course_id: course.id,
        course_name: course.name,
        course_brand: course.brand,
        academic_level: course.academicLevel,
        modality: courseModality,
        price: course.minPrice,
        city: course.city,
        state: course.uf || course.unitState,
        source: 'YDUQS',
        design_version: 'redesign_v2',
      })

      const params = new URLSearchParams()
      if (course.offerId) params.set('offerId', course.offerId)
      if (course.name) params.set('courseName', course.name)
      if (course.brand) params.set('brand', course.brand)
      const athenaModality = courseModality || course.modality || course.commercialModality || ''
      if (athenaModality) params.set('modality', athenaModality)
      if (course.minPrice) params.set('price', String(course.minPrice))
      if (course.city) params.set('city', course.city)
      const athenaState = course.uf || course.unitState || ''
      if (athenaState) params.set('state', athenaState)
      if (course.academicLevel) params.set('academicLevel', course.academicLevel)

      localStorage.setItem('selectedCourse', JSON.stringify(course))
      window.location.href = `/checkout/estacio?${params.toString()}`
      return
    }

    if (course.id && course.unitId) {
      try {
        await postSearch(String(course.id), course.unitId, course)
      } catch (error) {
        console.error('Erro ao enviar dados para search:', error)
      }
    }

    const params = new URLSearchParams()
    if (course.id) params.set('groupId', String(course.id))
    if (course.unitId) params.set('unitId', course.unitId)
    const finalModality = courseModality || course.modality || course.commercialModality || ''
    if (finalModality) params.set('modality', finalModality)
    const singleShift = course.shiftOptions && course.shiftOptions.length === 1 ? course.shiftOptions[0] : null
    const finalShift = selectedShift || course.classShift || singleShift || ''
    if (finalShift) params.set('shift', finalShift)

    trackEvent('course_selected', {
      course_id: course.id,
      course_name: course.name,
      course_brand: course.brand,
      design_version: 'redesign_v2',
      price: course.minPrice,
    })

    void trackFbqDual('ViewContent', {
      content_name: course.name,
      content_type: 'product',
      content_ids: course.id ? [String(course.id)] : undefined,
      value: course.minPrice || 0,
      currency: 'BRL',
    })

    trackTikTok('ViewContent', {
      content_id: course.id,
      content_name: course.name,
      content_type: 'product',
      value: course.minPrice || 0,
      currency: 'BRL',
    })

    window.location.href = `/checkout/matricula?${params.toString()}`
  }

  const renderUniversityImage = (universityName: string) => {
    const n = (universityName || '').toLowerCase()
    if (n.includes('anhanguera')) return '/assets/logo-anhanguera-bolsa-click.svg'
    if (n.includes('unopar')) return '/assets/logo-unopar.svg'
    if (n.includes('ampli')) return '/assets/ampli-logo.png'
    if (n.includes('pitagoras') || n.includes('pitágoras')) return '/assets/logo-pitagoras.svg'
    if (n.includes('unime')) return '/assets/logo-unime-p.png'
    if (n.includes('estacio') || n.includes('estácio')) return '/estacio-logo.png'
    if (n.includes('wyden')) return '/assets/wyden.svg'
    return '/assets/logo-bolsa-click-rosa.png'
  }

  const originalPrice = course.minPrice && course.discount
    ? Math.round(course.minPrice / (1 - course.discount / 100))
    : null

  const savings = originalPrice && course.minPrice
    ? Math.round(originalPrice - course.minPrice)
    : 0

  const hasDiscount = typeof course.discount === 'number' && course.discount >= 30
  const hasLowSpots = typeof course.availableSpots === 'number' && course.availableSpots > 0 && course.availableSpots < 10

  // Rotação determinística por courseId: varia qual sinal de urgência mostrar
  // Par → mostra desconto se tiver; ímpar → mostra vagas se tiver
  const courseIdNum = typeof course.id === 'number' ? course.id : parseInt(String(course.id || 0), 10)
  const preferDiscount = courseIdNum % 2 === 0
  const urgencyType = hasDiscount && (preferDiscount || !hasLowSpots)
    ? 'discount'
    : hasLowSpots && (!preferDiscount || !hasDiscount)
    ? 'spots'
    : hasDiscount
    ? 'discount'
    : hasLowSpots
    ? 'spots'
    : null

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden flex flex-col h-full border border-ink-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(11,31,60,0.12)] hover:-translate-y-0.5">

      {/* TOPO: urgência — uma única faixa, estilo varia pelo tipo */}
      {urgencyType === 'discount' && (
        <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
          <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {course.discount}% OFF
          </span>
          <span className="text-xs text-emerald-700 font-medium">
            Economize R$&nbsp;{savings.toLocaleString('pt-BR')}
          </span>
        </div>
      )}
      {urgencyType === 'spots' && (
        <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <span className="text-xs text-amber-700 font-semibold">
            ⚠ Apenas {course.availableSpots} vagas restantes
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

      {/* SOCIAL PROOF: MEC + alunos */}
      <div className="px-5 pb-4 flex items-center gap-4">
        {course.mecScore && (
          <div className="flex items-center gap-1">
            <Star size={13} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-bold text-ink-900">{course.mecScore.toFixed(1)}</span>
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
        {course.city && (
          <div className="flex items-center gap-2 text-ink-500 text-[13px]">
            <MapPin size={13} className="flex-shrink-0" />
            <span>{course.city}</span>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* RODAPÉ: preço + CTA */}
      <div className="px-5 pb-5 pt-4 border-t border-ink-100">
        {/* Preço riscado — só renderiza se há desconto E preço original calculado */}
        {hasDiscount && originalPrice && originalPrice > 0 && (
          <p className="text-xs text-ink-300 line-through mb-0.5">
            R$ {originalPrice.toLocaleString('pt-BR')}
          </p>
        )}

        {/* Preço atual */}
        <div className="mb-4">
          <p className="text-[11px] text-ink-500 uppercase tracking-widest font-medium mb-1">
            {course.academicLevel === 'POS_GRADUACAO' &&
            typeof course.totalInstallment === 'number' &&
            typeof course.minInstallmentValue === 'number'
              ? 'até'
              : 'a partir de'}
          </p>
          <p className="text-2xl font-black text-bolsa-primary leading-none">
            {course.academicLevel === 'POS_GRADUACAO' &&
            typeof course.totalInstallment === 'number' &&
            typeof course.minInstallmentValue === 'number' ? (
              <span>{course.totalInstallment}x {course.minInstallmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            ) : (
              <span>{(course.minPrice ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            )}
          </p>
        </div>

        {/* CTA — cor do site: bolsa-secondary */}
        <button
          onClick={handleClick}
          disabled={needsShiftSelection() && !selectedShift}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
            needsShiftSelection() && !selectedShift
              ? 'bg-ink-100 text-ink-500 cursor-not-allowed'
              : 'bg-bolsa-secondary hover:brightness-95 text-white active:scale-[.98] shadow-sm'
          }`}
        >
          <Lock size={15} strokeWidth={2.5} />
          {needsShiftSelection() && !selectedShift ? 'Selecione o turno' : 'Garantir Bolsa'}
        </button>

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
