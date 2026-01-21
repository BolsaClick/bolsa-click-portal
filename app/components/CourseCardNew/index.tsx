/* eslint-disable @typescript-eslint/no-explicit-any */
import { Course, Schedule } from "@/app/interface/course"
import { motion } from "framer-motion"
import { Building2, Clock, Heart, MapPin, Star } from "lucide-react"
import Image from "next/image"
import { useFavorites } from "@/app/lib/hooks/useFavorites"
import { useState } from "react"
import { toast } from "sonner"
import { usePostHogTracking } from "@/app/lib/hooks/usePostHogTracking"

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
  const { isFavorite, toggleFavorite } = useFavorites()
  const { trackEvent } = usePostHogTracking()
  
  // Estado para seleção de turno
  const [selectedShift, setSelectedShift] = useState<string>('')

  // Obter modalidade do curso (não precisa selecionar)
  const courseModality = course.modality?.toUpperCase() || course.commercialModality?.toUpperCase() || ''

  // Verificar se precisa mostrar seletor de turno (não virtual e tem opções)
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

    // Mostrar se tiver múltiplos turnos disponíveis
    const hasMultipleShifts = course.shiftOptions && course.shiftOptions.length > 1
    
    // Ou se for presencial/semipresencial e tiver turnos
    const isPresential = courseModality === 'PRESENCIAL' || courseModality === 'SEMIPRESENCIAL'
    const hasShifts = course.shiftOptions && course.shiftOptions.length > 0
    
    return (hasMultipleShifts || (isPresential && hasShifts))
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

    // Construir URL com parâmetros essenciais para compartilhamento
    const params = new URLSearchParams()
    
    // Parâmetros obrigatórios: groupId (course.id), unitId, modality, shift
    if (course.id) params.set('groupId', String(course.id))
    if (course.unitId) params.set('unitId', course.unitId)
    
    const finalModality = courseModality || course.modality || course.commercialModality || ''
    if (finalModality) params.set('modality', finalModality)
    
    // Usar turno selecionado, ou classShift, ou o único turno disponível
    const finalShift = selectedShift || course.classShift || (course.shiftOptions && course.shiftOptions.length === 1 ? course.shiftOptions[0] : '')
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

    // Redirecionar para checkout com params na URL
    if (isPos) {
      window.location.href = `/pos/checkout?${params.toString()}`
    } else {
      window.location.href = `/checkout/matricula?${params.toString()}`
    }
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

  // Função para converter dias da semana de inglês para português
  const translateDay = (day: string): string => {
    const daysMap: Record<string, string> = {
      'MONDAY': 'Segunda',
      'TUESDAY': 'Terça',
      'WEDNESDAY': 'Quarta',
      'THURSDAY': 'Quinta',
      'FRIDAY': 'Sexta',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo',
    };
    return daysMap[day.toUpperCase()] || day;
  };

  // Função para determinar o turno baseado em shiftOptions
  const getShiftLabel = (shiftOptions?: string[]): string => {
    if (!shiftOptions || shiftOptions.length === 0) return '';
    
    const shifts = shiftOptions.map(s => s.toUpperCase());
    
    if (shifts.includes('INTEGRAL')) return 'Integral';
    if (shifts.includes('MATUTINO') && shifts.includes('NOTURNO')) return 'Manhã e Noite';
    if (shifts.includes('MATUTINO')) return 'Manhã';
    if (shifts.includes('VESPERTINO')) return 'Tarde';
    if (shifts.includes('NOTURNO')) return 'Noite';
    // Ao invés de retornar 'Virtual', retornar o valor real do shift
    if (shifts.includes('VIRTUAL')) {
      // Retornar o primeiro shift que for VIRTUAL ou o valor original
      const virtualShift = shiftOptions.find(s => s.toUpperCase() === 'VIRTUAL');
      return virtualShift || shiftOptions[0];
    }
    
    return shiftOptions.join(', ');
  };

  // Função para formatar os horários dos dias
  const formatSchedules = (schedules?: Schedule[]): string => {
    if (!schedules || schedules.length === 0) return '';
    
    const groupedByTime = schedules.reduce((acc: Record<string, string[]>, schedule) => {
      const timeKey = `${schedule.startHour}-${schedule.endHour}`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(translateDay(schedule.day));
      return acc;
    }, {});

    return Object.entries(groupedByTime)
      .map(([time, days]) => {
        const [start, end] = time.split('-');
        return `${days.join(', ')}: ${start} às ${end}`;
      })
      .join(' | ');
  };

  const renderUniversityImage = (universityName: string) => {
    switch (universityName.toLowerCase()) {
      case 'anhanguera':
        return '/assets/logo-anhanguera-bolsa-click.svg'

      case 'unopar':
        return '/assets/logo-unopar.svg'
      case 'ampli':
        return '/assets/ampli-logo.png'
      case 'pitagoras':
        return '/assets/logo-pitagoras.svg'

      default:
        return '/assets/logo-bolsa-click-green-dark.svg'
    }
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
      "url": typeof window !== 'undefined' ? window.location.href : ""
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
      <motion.article
        key={course.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`bg-white rounded-xl shadow-card hover:shadow-hover transition-all duration-300 flex flex-col h-full ${viewMode === "list" ? "p-6" : ""
          }`}
        itemScope
        itemType="https://schema.org/Course"
      >
        <div className="relative p-6 flex flex-col flex-1">
          <div className="space-y-4 flex flex-col flex-1">
            {/* Dados principais */}
            <header>
              <div className="w-full flex justify-between items-center">
                <div className="w-full justify-start flex">
                  <Image
                    src={renderUniversityImage(course.brand || '')}
                    alt={`Logo da faculdade ${course.brand}`}
                    width={70}
                    height={30}
                    title={`Faculdade ${course.brand}`}
                    className="hover:opacity-55 transition-all duration-150"
                  />
                </div>
                <div className="w-full justify-end flex">
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
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Heart
                      size={20}
                      className={
                        isFavorite(course)
                          ? "text-red-500 fill-red-500"
                          : "text-neutral-400"
                      }
                    />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg text-neutral-900" itemProp="name">
                {courseParsed.name || course.name}
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                {course.academicDegree && (
                  <p className="text-neutral-600 text-sm" itemProp="educationalCredentialAwarded">
                    {course.academicDegree === 'BACHARELADO' ? 'Bacharelado' :
                     course.academicDegree === 'LICENCIATURA' ? 'Licenciatura' :
                     course.academicDegree === 'TECNOLOGO' ? 'Tecnólogo' :
                     course.academicDegree === 'ESPECIALISTA' ? 'Especialista' :
                     course.academicDegree}
                  </p>
                )}
                {course.academicLevel && (
                  <>
                    {course.academicDegree && <span className="text-neutral-400">•</span>}
                    <p className="text-neutral-600 text-sm">
                      {course.academicLevel === 'GRADUACAO' ? 'Graduação' :
                       course.academicLevel === 'POS_GRADUACAO' ? 'Pós-graduação' :
                       course.academicLevel === 'TECNICO' ? 'Técnico' :
                       course.academicLevel}
                    </p>
                  </>
                )}
                {!course.academicDegree && (
                  <p className="text-neutral-600 text-sm" itemProp="educationalCredentialAwarded">
                    {courseParsed.type}
                  </p>
                )}
              </div>
              <p className="text-neutral-600 text-sm" itemScope itemProp="provider" itemType="https://schema.org/CollegeOrUniversity">
                <span itemProp="name">{capitalizeFirstLetter(course.brand || '')}</span>
              </p>
              {course.unitName && (
                <p className="text-neutral-600 text-sm">
                  Campus: {capitalizeFirstLetter(course.unitName)}
                </p>
              )}
              {!course.unitName && course.unitDistrict && (
                <p className="text-neutral-600 text-sm">
                  Campus: {capitalizeFirstLetter(course.unitDistrict)}
                </p>
              )}
            </header>

            {/* Detalhes rápidos */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Star size={18} className="text-yellow-400 mr-1" fill="#FACC15" />
                <span className="font-medium">4.8</span>
              </div>
              <div className="flex items-center text-neutral-600">
                <Building2 size={18} className="mr-1" />
                <span itemProp="courseMode">
                  {course.commercialModality || course.modality}
                  {course.submodality === 'HIBRIDO_FLEX' && !course.commercialModality && (
                    <span className="ml-1 text-xs text-emerald-600 font-medium">
                      (com aulas práticas)
                    </span>
                  )}
                </span>
              </div>
              {/* Seletor de turno inline (se necessário) ou exibição estática */}
              {needsShiftSelection() && course.shiftOptions && course.shiftOptions.length > 0 ? (
                <div className="flex items-center text-neutral-600">
                  <Clock size={18} className="mr-1 flex-shrink-0" />
                  <select
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
                    className="bg-transparent border-b border-dashed border-neutral-400 hover:border-emerald-500 focus:border-emerald-500 outline-none text-neutral-600 cursor-pointer px-1 py-0 min-w-[120px] text-sm transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="" disabled>Selecione</option>
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
                </div>
              ) : (
                <>
                  {/* Priorizar classShift quando disponível (valor real do shift) */}
                  {course.classShift ? (
                    <div className="flex items-center text-neutral-600">
                      <Clock size={18} className="mr-1" />
                      <span>{course.classShift}</span>
                    </div>
                  ) : (
                    <>
                      {(course.shiftOptions && course.shiftOptions.length > 0) && (
                        <div className="flex items-center text-neutral-600">
                          <Clock size={18} className="mr-1" />
                          <span>{getShiftLabel(course.shiftOptions)}</span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              {course.city && (
                <div className="flex items-center text-neutral-600">
                  <MapPin size={18} className="mr-1" />
                  <span>{capitalizeFirstLetter(course.city)}</span>
                </div>
              )}
            </div>

            {/* Horários dos dias da semana (quando disponível) */}
            {course.schedules && course.schedules.length > 0 && (
              <div className="text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                <div className="font-medium mb-1">Horários:</div>
                <div>{formatSchedules(course.schedules)}</div>
              </div>
            )}

            {/* Preço e Botão */}
            <div className="border-t border-neutral-100 pt-4 mt-auto" itemProp="hasCourseInstance" itemScope itemType="https://schema.org/CourseInstance">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-sm text-neutral-600">Por:</span>
                  <div className="text-emerald-500 text-2xl font-bold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                    <span itemProp="price">
                      {(course.minPrice / 1).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>
              </div>


              {/* Botão */}
              <button
                onClick={handleClick}
                disabled={needsShiftSelection() && !selectedShift}
                title={
                  needsShiftSelection() && !selectedShift
                    ? "Selecione o turno" 
                    : "Avançar para matrícula"
                }
                aria-label="Avançar para matrícula"
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 mb-4 ${
                  needsShiftSelection() && !selectedShift
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {needsShiftSelection() && !selectedShift ? (
                  'Selecione o turno'
                ) : (
                  'Quero essa bolsa'
                )}
              </button>

              {/* Localização */}
              <div className="flex items-start text-sm text-neutral-600">
                <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <p 
                  className="truncate overflow-hidden text-ellipsis whitespace-nowrap" 
                  title={
                    course.unitAddress 
                      ? `${capitalizeFirstLetter(course.unitAddress)}${course.unitNumber ? `, ${course.unitNumber}` : ''}${course.unitCity || course.city ? ` - ${course.unitCity || course.city}` : ''}${course.unitState || course.uf ? ` - ${course.unitState || course.uf}` : ''}${course.unitPostalCode ? ` - CEP: ${course.unitPostalCode}` : ''}`
                      : course.unit
                        ? `${course.unit}${course.unitPostalCode ? ` - CEP: ${course.unitPostalCode}` : ''}`
                        : `${course.unitCity || course.city || ''}${course.unitCity || course.city ? ' - ' : ''}${course.unitState || course.uf || ''}${course.unitPostalCode ? ` - CEP: ${course.unitPostalCode}` : ''}`
                  }
                >
                  {course.unitAddress ? (
                    <>
                      {capitalizeFirstLetter(course.unitAddress)}
                      {course.unitNumber && `, ${course.unitNumber}`}
                      {course.unitCity || course.city ? ` - ${course.unitCity || course.city}` : ''}
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
        </div>
      </motion.article>
    </>
  );
}

export default CourseCardNew;