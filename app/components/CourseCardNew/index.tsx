/* eslint-disable @typescript-eslint/no-explicit-any */
import { Course } from "@/app/interface/course"
import { postSearch } from "@/app/lib/api/post-search"
import { useFavorites } from "@/app/lib/hooks/useFavorites"
import { usePostHogTracking } from "@/app/lib/hooks/usePostHogTracking"
import { trackFbqDual } from "@/app/lib/analytics/fbq"
import { pushDataLayerEvent } from "@/app/lib/analytics/gtag"
import { trackTikTok } from "@/app/lib/analytics/ttq"
import { getAcademicLevelLabel } from "@/app/lib/academic-level"
import { Building2, Clock, Heart, MapPin } from "lucide-react"
import Image from "next/image"
import { useState, useMemo } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { useFeatureFlags } from "@/app/lib/hooks/usePostHogFeatureFlags"
import CourseCardRedesign from "./Redesign"

interface CourseCardProps {
  course: Course
  setFormData?: (name: string, value: any) => void
  courseName: string
  triggerSubmit?: () => void
  viewMode: 'grid' | 'list';
  isPos?: boolean
}

type CourseInfo = {
  name: string;
  type: 'Bacharelado' | 'Tecnólogo';
}


const CourseCardNew: React.FC<CourseCardProps> = ({
  course,
  viewMode,
  courseName,
  isPos
}) => {
  const { featureFlags, isFeatureFlagLoading } = useFeatureFlags()
  const useRedesign = useMemo(
    () => !isFeatureFlagLoading && featureFlags['course_card_redesign_v2'] === true,
    [featureFlags, isFeatureFlagLoading]
  )

  // Se feature flag está ativa, usar novo design
  if (useRedesign) {
    return <CourseCardRedesign course={course} courseName={courseName} />
  }

  // Caso contrário, manter design original
  return <CourseCardOriginal course={course} viewMode={viewMode} courseName={courseName} isPos={isPos} />
}

// Renomear componente original
const CourseCardOriginal: React.FC<CourseCardProps> = ({
  course,
  viewMode,
  courseName,
  isPos
}) => {
  const { isFavorite, toggleFavorite } = useFavorites()
  const pathname = usePathname()
  const { trackEvent } = usePostHogTracking()

  // Estado para seleção de turno
  const [selectedShift, setSelectedShift] = useState<string>('')

  // Obter modalidade do curso (não precisa selecionar)
  const courseModality = course.modality?.toUpperCase() || course.commercialModality?.toUpperCase() || ''

  // Verificar se precisa mostrar seletor de turno (não virtual e tem múltiplas opções)
  const needsShiftSelection = () => {
    // Só mostrar se tiver businessKey e unitId
    if (!course.businessKey || !course.unitId) {
      return false
    }

    // Não mostrar se for virtual
    const isVirtual = course.shiftOptions?.some(s => s.toUpperCase() === 'VIRTUAL') ||
      course.classShift?.toUpperCase() === 'VIRTUAL'
    if (isVirtual) {
      return false
    }

    // Só mostrar seletor se tiver MÚLTIPLOS turnos (mais de 1)
    // Se tiver apenas 1 turno, não mostrar seletor, usar automaticamente
    const hasMultipleShifts = course.shiftOptions && course.shiftOptions.length > 1

    return hasMultipleShifts
  }

  const handleClick = async () => {
    // Se precisa selecionar turno mas ainda não selecionou
    if (needsShiftSelection() && !selectedShift) {
      toast.error('Por favor, selecione o turno')
      trackEvent('course_card_click_blocked', {
        reason: 'shift_not_selected',
        course_id: course.id,
        course_name: course.name,
        course_brand: course.brand,
        modality: courseModality,
        view_mode: viewMode,
      })
      return
    }

    // Trilho YDUQS (Estácio via Athena): checkout por inscrição (não passa pelo /checkout/matricula).
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
        view_mode: viewMode,
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
      // Endereço da unidade — opcional, pro checkout mostrar onde fica
      // (relevante pra presencial/semipresencial).
      if (course.unitAddress) params.set('unitAddress', course.unitAddress)
      if (course.unitDistrict) params.set('unitDistrict', course.unitDistrict)
      if (course.unitPostalCode) params.set('unitPostalCode', course.unitPostalCode)
      // Preço por forma de ingresso (2/3) — opcional, ver Course.priceForma2/3.
      if (course.priceForma2) params.set('priceForma2', String(course.priceForma2))
      if (course.priceForma3) params.set('priceForma3', String(course.priceForma3))

      localStorage.setItem('selectedCourse', JSON.stringify(course))
      window.location.href = `/checkout/estacio?${params.toString()}`
      return
    }

    // Enviar dados para o endpoint de search antes de redirecionar
    if (course.id && course.unitId) {
      try {
        await postSearch(
          String(course.id),
          course.unitId,
          course
        )
        // Não mostrar toast de sucesso para não atrapalhar o fluxo
        // O erro já é logado internamente na função postSearch
      } catch (error) {
        // Erro já foi tratado dentro de postSearch, apenas continuar o fluxo
        console.error('Erro ao enviar dados para search:', error)
      }
    }

    // Construir URL com parâmetros essenciais para compartilhamento
    const params = new URLSearchParams()

    // Parâmetros obrigatórios: groupId (course.id), unitId, modality, shift
    if (course.id) params.set('groupId', String(course.id))
    if (course.unitId) params.set('unitId', course.unitId)

    const finalModality = courseModality || course.modality || course.commercialModality || ''
    if (finalModality) params.set('modality', finalModality)

    // Usar turno selecionado, ou classShift, ou o único turno disponível (quando há apenas 1 opção)
    const singleShift = course.shiftOptions && course.shiftOptions.length === 1 ? course.shiftOptions[0] : null
    const finalShift = selectedShift || course.classShift || singleShift || ''
    if (finalShift) params.set('shift', finalShift)

    // Track course selection
    trackEvent('course_selected', {
      course_id: course.id,
      course_name: course.name,
      course_brand: course.brand,
      academic_level: course.academicLevel,
      modality: finalModality,
      shift: finalShift,
      price: course.minPrice,
      city: course.city,
      state: course.uf || course.unitState,
      unit_id: course.unitId,
      is_pos: isPos,
      view_mode: viewMode,
      is_favorite: isFavorite(course),
    })

    // Facebook Pixel + Conversions API - ViewContent (curso selecionado)
    void trackFbqDual('ViewContent', {
      content_name: course.name,
      content_type: 'product',
      content_ids: course.id ? [String(course.id)] : undefined,
      value: course.minPrice || 0,
      currency: 'BRL',
    })

    // GA4 ecommerce (dataLayer/GTM) - select_item, paridade com o ViewContent acima.
    pushDataLayerEvent('select_item', {
      ecommerce: {
        currency: 'BRL',
        value: course.minPrice || 0,
        items: [
          {
            item_id: course.id ? String(course.id) : undefined,
            item_name: course.name,
            item_brand: course.brand,
          },
        ],
      },
    })

    // TikTok Pixel - ViewContent
    trackTikTok('ViewContent', {
      content_id: course.id,
      content_name: course.name,
      content_type: 'product',
      value: course.minPrice || 0,
      currency: 'BRL',
    })

    // Redirecionar para checkout (pós e graduação usam a mesma página de matrícula)
    window.location.href = `/checkout/matricula?${params.toString()}`
  }

  const capitalizeFirstLetter = (text: string) => {
    if (!text) return ''
    return text
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const parseCourseName = (name?: string): CourseInfo => {
    if (!name || typeof name !== 'string') {
      return {
        name: '',
        type: 'Bacharelado',
      };
    }

    const lower = name.toLowerCase();

    if (lower.includes(' - bacharelado')) {
      return {
        name: name.replace(/ - Bacharelado$/i, '').trim(),
        type: 'Bacharelado',
      };
    }

    if (lower.includes(' - tecnólogo') || lower.includes(' - tecnologo')) {
      return {
        name: name.replace(/ - Tecn[oó]logo$/i, '').trim(),
        type: 'Tecnólogo',
      };
    }

    return {
      name: name.trim(),
      type: 'Bacharelado',
    };
  };


  const courseParsed = parseCourseName(courseName || course.name);
  const hasDiscount = Boolean(
    course.minPrice > 0 &&
    typeof course.maxPrice === 'number' &&
    course.maxPrice > course.minPrice
  )
  const discountPercentage = hasDiscount
    ? Math.floor((1 - course.minPrice / course.maxPrice!) * 100)
    : 0

  // Função para determinar o turno baseado em shiftOptions
  const getShiftLabel = (shiftOptions?: string[]): string => {
    if (!shiftOptions || shiftOptions.length === 0) return '';

    const shifts = shiftOptions.map(s => s.toUpperCase());

    if (shifts.includes('INTEGRAL')) return 'Integral';
    if (shifts.includes('MATUTINO') && shifts.includes('NOTURNO')) return 'Manhã e Noite';
    if (shifts.includes('MATUTINO')) return 'Manhã';
    if (shifts.includes('VESPERTINO')) return 'Tarde';
    if (shifts.includes('NOTURNO')) return 'Noite';
    if (shifts.includes('VIRTUAL')) return 'Virtual';

    return shiftOptions.join(', ');
  };

  const renderUniversityImage = (universityName: string) => {
    // Match por substring: marcas YDUQS vêm como nome completo (ex.: "UNIVERSIDADE ESTÁCIO DE SÁ").
    const n = (universityName || '').toLowerCase()
    if (n.includes('anhanguera')) return '/assets/logo-anhanguera-bolsa-click.svg'
    if (n.includes('unopar')) return '/assets/logo-unopar.svg'
    if (n.includes('pitagoras') || n.includes('pitágoras')) return '/assets/logo-pitagoras.svg'
    if (n.includes('unime')) return '/assets/logo-unime-p.png'
    if (n.includes('estacio') || n.includes('estácio')) return '/estacio-logo.png'
    if (n.includes('wyden')) return '/assets/wyden.svg'
    return '/assets/logo-bolsa-click-rosa.png'
  }

  // Schema.org JSON-LD para SEO
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": courseParsed.name || course.name,
    "description": `${courseParsed.name || course.name} - ${course.commercialModality || course.modality} em ${course.city || ''}${course.uf ? `, ${course.uf}` : ''}. ${course.academicDegree ? `${course.academicDegree}` : courseParsed.type}`,
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": course.brand || "Faculdade"
    },
    "educationalCredentialAwarded": course.academicDegree || courseParsed.type,
    "courseMode": course.commercialModality || course.modality,
    "offers": {
      "@type": "Offer",
      "price": course.minPrice || 0,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "url": `https://www.bolsaclick.com.br${pathname}`
    },
    ...(course.city && {
      "location": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": course.city,
          "addressRegion": course.uf || course.unitState || "",
          ...(course.unitAddress && { "streetAddress": course.unitAddress }),
          ...(course.unitPostalCode && { "postalCode": course.unitPostalCode })
        }
      }
    })
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <article
        onClick={(e) => {
          // Card inteiro clicável → mesma ação do "Inscreva-se". O corpo do card
          // parecia clicável (hover levanta/sombra) mas não fazia nada: era o
          // maior foco de rageclick do site (/curso/resultado, 18 em 14d) e o
          // maior ponto de saída. Ignora cliques em controles internos
          // (favoritar, seletor de turno, botão) pra não conflitar com eles.
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
        className={`group cursor-pointer bg-white rounded-xl shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full animate-fade-in ${viewMode === "list" ? "p-6" : ""
          }`}
        itemScope
        itemType="https://schema.org/Course"
      >
        <div className="relative p-5 flex flex-col flex-1">
          {/* Topo: logo + favoritar */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-8 items-center">
              <Image
                src={renderUniversityImage(course.brand || '')}
                alt={`Logo da faculdade ${course.brand}`}
                width={70}
                height={28}
                title={`Faculdade ${course.brand}`}
                className="h-7 w-auto object-contain transition-opacity duration-150 group-hover:opacity-80"
              />
            </div>
            <button
              title="Favoritar curso"
              aria-label="Favoritar curso"
              onClick={() => {
                const wasFavorite = isFavorite(course)
                toggleFavorite(course)
                trackEvent(wasFavorite ? 'course_unfavorited' : 'course_favorited', {
                  course_id: course.id,
                  course_name: course.name,
                  course_brand: course.brand,
                  academic_level: course.academicLevel,
                  modality: courseModality,
                  price: course.minPrice,
                  city: course.city,
                  view_mode: viewMode,
                })
              }}
              className="-mr-1 -mt-1 flex-shrink-0 rounded-full p-2 text-neutral-400 transition-colors duration-300 hover:bg-neutral-50"
            >
              <Heart
                size={20}
                className={isFavorite(course) ? "text-red-500 fill-red-500" : ""}
              />
            </button>
          </div>

          {/* Título — 2 linhas reservadas para alinhar os cards */}
          <h3
            className="mt-3 min-h-[2.75rem] font-bold text-[17px] leading-snug text-neutral-900 line-clamp-2"
            itemProp="name"
          >
            {courseParsed.name || course.name}
          </h3>

          {/* Grau • nível */}
          <div className="mt-1 flex min-h-[1.25rem] flex-wrap items-center gap-x-1.5 text-sm text-neutral-500">
            {course.academicDegree && (
              <span itemProp="educationalCredentialAwarded">
                {course.academicDegree === 'BACHARELADO' ? 'Bacharelado' :
                  course.academicDegree === 'LICENCIATURA' ? 'Licenciatura' :
                    course.academicDegree === 'TECNOLOGO' ? 'Tecnólogo' :
                      course.academicDegree === 'ESPECIALISTA' ? 'Especialista' :
                        course.academicDegree}
              </span>
            )}
            {(course.academicLevel || course.academicDegree === 'PROFISSIONALIZANTE') && (
              <>
                {course.academicDegree && <span className="text-neutral-300">•</span>}
                <span>{getAcademicLevelLabel(course.academicLevel, course.academicDegree)}</span>
              </>
            )}
            {!course.academicDegree && (
              <span itemProp="educationalCredentialAwarded">{courseParsed.type}</span>
            )}
          </div>

          {/* Marca + campus — 2 linhas reservadas */}
          <div className="mt-1 min-h-[2.5rem] text-sm">
            <p
              className="font-medium text-neutral-700 line-clamp-1"
              itemScope
              itemProp="provider"
              itemType="https://schema.org/CollegeOrUniversity"
            >
              <span itemProp="name">{capitalizeFirstLetter(course.brand || '')}</span>
            </p>
            {(course.unitName || course.unitDistrict) && (
              <p className="text-neutral-500 line-clamp-1">
                Campus: {capitalizeFirstLetter(course.unitName || course.unitDistrict || '')}
              </p>
            )}
          </div>

          {/* Chips: modalidade, turno, duração */}
          <div className="mt-3 flex min-h-[2rem] flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
              itemProp="courseMode"
            >
              <Building2 size={13} />
              {course.commercialModality || course.modality}
            </span>

            {course.submodality === 'HIBRIDO_FLEX' && !course.commercialModality && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                com aulas práticas
              </span>
            )}

            {/* Turno: seletor inline (se necessário) ou chip estático */}
            {needsShiftSelection() && course.shiftOptions && course.shiftOptions.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                <Clock size={13} className="flex-shrink-0" />
                <select
                  aria-label="Selecione o turno"
                  value={selectedShift}
                  onChange={(e) => {
                    setSelectedShift(e.target.value)
                    trackEvent('course_shift_selected', {
                      course_id: course.id,
                      course_name: course.name,
                      selected_shift: e.target.value,
                      available_shifts: course.shiftOptions?.join(', ') || '',
                      modality: courseModality,
                    })
                  }}
                  className="cursor-pointer bg-transparent text-xs font-medium text-neutral-700 outline-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="" disabled>Turno</option>
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
              </span>
            ) : (
              <>
                {(course.shiftOptions && course.shiftOptions.length > 0) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    <Clock size={13} />
                    {getShiftLabel(course.shiftOptions)}
                  </span>
                )}
                {course.classShift && !course.shiftOptions && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                    <Clock size={13} />
                    {course.classShift}
                  </span>
                )}
              </>
            )}

            {(typeof course.durationInMonths === 'number' && course.durationInMonths > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                {course.durationInMonths} {course.durationInMonths === 1 ? 'mês' : 'meses'}
              </span>
            )}
          </div>

          {/* Preço + Botão + endereço — fixado no rodapé do card */}
          <div
            className="mt-auto border-t border-neutral-100 pt-4"
            itemProp="hasCourseInstance"
            itemScope
            itemType="https://schema.org/CourseInstance"
          >
            {hasDiscount && (
              <div className="mb-1.5 flex items-center gap-2 text-xs text-neutral-500">
                <span>
                  De{' '}
                  <span className="line-through decoration-neutral-400">
                    {course.maxPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-bolsa-secondary">
                  -{discountPercentage}%
                </span>
              </div>
            )}
            <div className="mb-3">
              <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                {course.academicLevel === 'POS_GRADUACAO' &&
                  typeof course.totalInstallment === 'number' &&
                  typeof course.minInstallmentValue === 'number'
                  ? 'Até'
                  : 'A partir de'}
              </span>
              <span
                className="mt-0.5 block text-[26px] font-bold leading-none text-emerald-500"
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                {course.academicLevel === 'POS_GRADUACAO' &&
                  typeof course.totalInstallment === 'number' &&
                  typeof course.minInstallmentValue === 'number' ? (
                  <span itemProp="price">
                    {course.totalInstallment}x de{' '}
                    {course.minInstallmentValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                ) : (
                  <span itemProp="price">
                    {(course.minPrice / 1).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}<span className="text-sm font-semibold text-neutral-500">/mês</span>
                  </span>
                )}
              </span>
            </div>

            <button
              onClick={handleClick}
              disabled={needsShiftSelection() && !selectedShift}
              title={
                needsShiftSelection() && !selectedShift
                  ? "Selecione o turno"
                  : "Avançar para matrícula"
              }
              aria-label="Avançar para matrícula"
              className={`w-full rounded-lg py-3 px-4 font-semibold transition-all duration-300 ${needsShiftSelection() && !selectedShift
                  ? 'cursor-not-allowed bg-gray-300 text-white'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg'
                }`}
            >
              {needsShiftSelection() && !selectedShift ? 'Selecione o turno' : 'Inscreva-se'}
            </button>

            <div className="mt-3 flex items-center text-xs text-neutral-400">
              <MapPin size={14} className="mr-1.5 flex-shrink-0" />
              <p
                className="truncate"
                title={
                  course.unitAddress
                    ? `${capitalizeFirstLetter(course.unitAddress)}${course.unitNumber ? `, ${course.unitNumber}` : ''}${course.unitDistrict ? ` - ${capitalizeFirstLetter(course.unitDistrict)}` : ''}${course.unitCity || course.city ? ` - ${capitalizeFirstLetter(course.unitCity || course.city || '')}` : ''}${course.unitState || course.uf ? ` - ${course.unitState || course.uf}` : ''}${course.unitPostalCode ? ` - CEP: ${course.unitPostalCode}` : ''}`
                    : course.unit
                      ? `${course.unit}${course.unitPostalCode ? ` - CEP: ${course.unitPostalCode}` : ''}`
                      : `${course.unitCity || course.city || ''}${course.unitCity || course.city ? ' - ' : ''}${course.unitState || course.uf || ''}${course.unitPostalCode ? ` - CEP: ${course.unitPostalCode}` : ''}`
                }
              >
                {course.unitAddress ? (
                  <>
                    {capitalizeFirstLetter(course.unitAddress)}
                    {course.unitNumber && `, ${course.unitNumber}`}
                    {course.unitDistrict && ` - ${capitalizeFirstLetter(course.unitDistrict)}`}
                    {course.unitCity || course.city ? ` - ${capitalizeFirstLetter(course.unitCity || course.city || '')}` : ''}
                    {course.unitState || course.uf ? ` - ${course.unitState || course.uf}` : ''}
                    {course.unitPostalCode && ` - CEP: ${course.unitPostalCode}`}
                  </>
                ) : course.unit ? (
                  <>
                    {course.unit}
                    {course.unitPostalCode && ` - CEP: ${course.unitPostalCode}`}
                  </>
                ) : (
                  <>
                    {course.unitCity || course.city || ''}
                    {course.unitCity || course.city ? ' - ' : ''}
                    {course.unitState || course.uf || ''}
                    {course.unitPostalCode && ` - CEP: ${course.unitPostalCode}`}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export default CourseCardNew
export { CourseCardOriginal, CourseCardRedesign }
