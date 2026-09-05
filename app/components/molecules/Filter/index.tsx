/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash.debounce'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ComboBox } from '../ComboBox'
import { useRouter } from 'next/navigation'
import { getShowCourses } from '@/app/lib/api/get-courses'
import { getLocalities } from '@/app/lib/api/get-localites'
import { ModalitySelect } from '../../atoms/ModalitySelect'
import { GraduationCap, MapPin } from 'lucide-react'
import { useGeoLocation } from '@/app/context/GeoLocationContext'
import { brazilCityStateOrNull, isForbiddenGeoCity } from '@/app/lib/geo/brazil-location'
import { ACADEMIC_LEVEL } from '@/app/lib/academic-level'
import { useLastSearch } from '@/app/lib/personalization/hooks'
import { HERO_CONTAINER_CLASS } from '@/app/lib/layout/hero-container'

type FormValues = {
  modalidade: 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'
  course: { name: string; id: string; slug: string } | string
  city: { state: string; city: string } | string
  levels: 'graduacao' | 'pos' | 'profissionalizante'
}

const educationLevels: { levels: FormValues['levels']; label: string }[] = [
  { levels: 'graduacao', label: 'Graduação' },
  { levels: 'pos', label: 'Pós-graduação' },
  { levels: 'profissionalizante', label: 'Profissionalizante' }
]
interface FilterProps {
  /**
   * Renderiza o título do card como `h1` em vez de `h2`.
   *
   * Existe porque este componente aparece em DUAS páginas: a home (onde ele é
   * o topo da dobra e precisa carregar o único h1) e /bolsas-de-estudo (que
   * tem h1 próprio). Promover o heading direto criaria h1 duplicado lá.
   * Default `false` — quem não passa nada continua com h2, como sempre foi.
   */
  asPageHeading?: boolean
}

const Filter = ({ asPageHeading = false }: FilterProps) => {
  const Heading = asPageHeading ? 'h1' : 'h2'
  const navigate = useRouter()
  const { city: geoCity, state: geoState } = useGeoLocation()
  const { saveSearch } = useLastSearch()
  const [searchCity, setSearchCity] = useState('')
  const [courseError, setCourseError] = useState('')
  const [cityError, setCityError] = useState('')
  const [activeTab, setActiveTab] = useState<FormValues['levels']>(() => {
    if (typeof window !== 'undefined') {
      const savedLevel = localStorage.getItem('selectedLevel')
      if (savedLevel === 'tecnico') {
        return 'profissionalizante'
      }
      if (savedLevel === 'graduacao' || savedLevel === 'pos' || savedLevel === 'profissionalizante') {
        return savedLevel
      }
      return 'graduacao'
    }
    return 'graduacao'
  })

  const academicLevelMap: Record<FormValues['levels'], string> = {
    graduacao: ACADEMIC_LEVEL.GRADUACAO,
    pos: ACADEMIC_LEVEL.POS_GRADUACAO,
    profissionalizante: ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE,
  }

  // Adia o prefetch da lista de cursos pra DEPOIS da hidratação (idle), pra a
  // chamada à API não competir com o boot JS no main thread em mobile. Se o
  // usuário interagir antes do idle, dispara na hora (handleLevelChange).
  const [coursesReady, setCoursesReady] = useState(false)
  useEffect(() => {
    const win = window as typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
    }
    if (typeof win.requestIdleCallback === 'function') {
      win.requestIdleCallback(() => setCoursesReady(true), { timeout: 2500 })
    } else {
      const t = setTimeout(() => setCoursesReady(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const handleLevelChange = (level: FormValues['levels']) => {
    setCoursesReady(true)
    setActiveTab(level)
    localStorage.setItem('selectedLevel', level)
    setValue('levels', level)

    setValue('course', { id: '', name: '', slug: '' })
    setCourseError('')
  }
  const { control, handleSubmit, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      modalidade: 'EAD',
      levels: activeTab,
      course: { name: '', id: '', slug: '' },
      city: { state: '', city: '' },
    },
  })

  // Preencher cidade/estado só com localização brasileira. Nunca escrever
  // Washington/DC (IP de datacenter) no ComboBox nem na query string — e não
  // sobrescrever o que a pessoa já digitou (ex.: BH sem UF).
  useEffect(() => {
    const allowed = brazilCityStateOrNull(geoCity, geoState)
    if (!allowed) return

    const current = getValues('city')
    const alreadyChosen =
      typeof current === 'object' &&
      current &&
      brazilCityStateOrNull(current.city, current.state)
    if (alreadyChosen) return
    if (typeof current === 'string' && current.trim()) return

    setValue('city', { city: allowed.city, state: allowed.state })
  }, [geoCity, geoState, setValue, getValues])

  const { data: graduationCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.graduacao),
    queryKey: ['courses', 'graduacao'],
    enabled: coursesReady && activeTab === 'graduacao',
  })

  const { data: postCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.pos),
    queryKey: ['courses', 'pos'],
    enabled: coursesReady && activeTab === 'pos',
  })

  const { data: profissionalizanteCourses } = useQuery({
    queryFn: () => getShowCourses(academicLevelMap.profissionalizante),
    queryKey: ['courses', 'profissionalizante'],
    enabled: coursesReady && activeTab === 'profissionalizante',
  })

  const { data: responseCity } = useQuery({
    queryKey: ['cities', searchCity],
    queryFn: () => getLocalities(searchCity),
    enabled: !!searchCity,
  })
  const cityOptions =
    responseCity?.data?.map((city: any) => ({
      state: city.state,
      city: city.city,
    })) || []

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");


  const rawCourses = activeTab === 'graduacao'
    ? graduationCourses
    : activeTab === 'pos'
      ? postCourses
      : activeTab === 'profissionalizante'
        ? profissionalizanteCourses
        : []

  const courseOptions =
    rawCourses?.map((course: any) => ({
      id: course.id,
      name: course.name,
      slug: course.slug || slugify(course.name.replace(/ - (Bacharelado|Tecn[oó]logo)$/, '')),
    })) || []

  const removeCourseSuffix = (name: string) => {
    return name
      .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
      .trim()
  }

  // Verificar se o curso tem sufixo (Bacharelado, Licenciatura, Tecnólogo)
  const hasCourseSuffix = (name: string): boolean => {
    return / - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i.test(name)
  }

  // Extrair apenas o sufixo do curso (Bacharelado, Licenciatura, Tecnólogo)
  const extractCourseSuffix = (name: string): string => {
    const match = name.match(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i)
    return match ? match[1] : ''
  }

  const normalizeOptionText = (value: string) =>
    value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  // Converter valores do ModalitySelect para o formato esperado
  const convertModalityToAPI = (value: string): FormValues['modalidade'] => {
    const lower = value.toLowerCase()
    if (lower === 'distancia') return 'EAD'
    if (lower === 'presencial') return 'PRESENCIAL'
    if (lower === 'semipresencial') return 'SEMIPRESENCIAL'
    return value.toUpperCase() as FormValues['modalidade']
  }

  // Converter valores da API para o formato do ModalitySelect
  const convertModalityFromAPI = (value: string): string => {
    const upper = value.toUpperCase()
    if (upper === 'EAD') return 'distancia'
    if (upper === 'PRESENCIAL') return 'presencial'
    if (upper === 'SEMIPRESENCIAL') return 'semipresencial'
    return value.toLowerCase()
  }

  const onSubmit = (data: FormValues) => {
    const typedCourse = typeof data.course === 'string' ? data.course.trim() : ''
    let selectedCourse = typeof data.course === 'object'
      ? data.course
      : { id: '', name: '', slug: '' }

    if (!selectedCourse.name && typedCourse) {
      const normalizedInput = normalizeOptionText(typedCourse)
      const exactMatch = courseOptions.find(
        (option) =>
          normalizeOptionText(option.name) === normalizedInput ||
          normalizeOptionText(removeCourseSuffix(option.name)) === normalizedInput,
      )
      if (exactMatch) {
        selectedCourse = exactMatch
        setValue('course', exactMatch)
      }
    }

    if (typedCourse && !selectedCourse.name) {
      setCourseError('Selecione um curso da lista')
      return
    }

    let selectedCity =
      typeof data.city === 'object'
        ? brazilCityStateOrNull(data.city.city, data.city.state)
        : null

    if (typeof data.city === 'string' && data.city.trim()) {
      if (isForbiddenGeoCity(data.city)) {
        // ComboBox still showing "Washington - DC" as typed text — drop it.
        setValue('city', { city: '', state: '' })
        selectedCity = null
      } else {
        const typed = normalizeOptionText(data.city)
        const match = cityOptions.find((option: { city: string; state: string }) => {
          const full = normalizeOptionText(`${option.city} - ${option.state}`)
          const name = normalizeOptionText(option.city)
          return full === typed || name === typed
        })
        selectedCity = match ? brazilCityStateOrNull(match.city, match.state) : null
        if (!selectedCity) {
          setCityError('Selecione uma cidade da lista')
          return
        }
      }
    } else if (typeof data.city === 'object' && (data.city.city || data.city.state) && !selectedCity) {
      // Geo/ComboBox leaked DC/US — drop it instead of sending cidade=Washington.
      setValue('city', { city: '', state: '' })
      selectedCity = null
    }

    setCourseError('')
    setCityError('')

    const city = selectedCity?.city ?? ''
    const state = selectedCity?.state ?? ''
    const courseNameClean = selectedCourse.name ? removeCourseSuffix(selectedCourse.name) : ''

    // Construir URL com parâmetros - 'c' sempre primeiro se existir
    const params: string[] = [];
    
    // Só adiciona o parâmetro 'c' se o curso estiver preenchido (sem sufixos para SEO)
    if (courseNameClean && courseNameClean.trim()) {
      params.push(`c=${encodeURIComponent(courseNameClean)}`);
    }
    
    // Adicionar apenas o sufixo do curso (Bacharelado, Licenciatura, Tecnólogo) no cn
    // Só adiciona cn se o curso tiver sufixo
    if (selectedCourse.name && selectedCourse.name.trim() && hasCourseSuffix(selectedCourse.name)) {
      const suffix = extractCourseSuffix(selectedCourse.name)
      if (suffix) {
        params.push(`cn=${encodeURIComponent(suffix)}`);
      }
    }
    
    // Cidade é opcional (EAD / busca nacional). Nunca escrever DC/US.
    if (city && state) {
      params.push(`cidade=${encodeURIComponent(city)}`);
      params.push(`estado=${encodeURIComponent(state)}`);
    }
    
    // Garantir que a modalidade está no formato correto (EAD, PRESENCIAL, SEMIPRESENCIAL)
    const modalidadeFormatada = convertModalityToAPI(data.modalidade)
    params.push(`modalidade=${encodeURIComponent(modalidadeFormatada)}`);
    
    // Adicionar nível acadêmico para diferenciar graduação, pós e profissionalizante
    const nivel = academicLevelMap[activeTab]
    params.push(`nivel=${nivel}`);

    // Salvar última busca pra personalização (gated por consent)
    saveSearch({
      course: courseNameClean || undefined,
      city: city || undefined,
      state: state || undefined,
      modality: modalidadeFormatada,
      level: nivel,
    })

    navigate.push(`/curso/resultado?${params.join('&')}`);
  }

  const handleCityChange = debounce((value) => {
    setSearchCity(value)
  }, 300)

  // Abas de nível: texto normal (não mais caixa alta em `font-mono`), ativa
  // em azul-marinho com sublinhado; uma hairline única corre por baixo de
  // todas, de ponta a ponta do card.
  const renderLevelTabs = () => (
    <div className="border-b border-hairline">
      <div className="flex gap-3 sm:gap-8 overflow-x-auto px-5 sm:px-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {educationLevels.map((level) => {
          const isActive = activeTab === level.levels
          return (
            <button
              key={level.levels}
              className={`relative shrink-0 whitespace-nowrap py-3.5 sm:py-4 text-[12px] sm:text-[15px] font-medium transition-colors
                ${isActive ? 'text-bolsa-primary' : 'text-ink-500 hover:text-bolsa-primary'}`}
              onClick={() => handleLevelChange(level.levels)}
              type="button"
            >
              {level.label}
              <span
                className={`absolute -bottom-px left-0 right-0 h-[2px] bg-bolsa-primary transition-transform duration-300 origin-center ${
                  isActive ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )



  const showModality = activeTab === 'graduacao'

  // A partir de `md` o botão é o QUARTO elemento da linha dos campos
  // (curso / cidade / modalidade / buscar), não mais um bloco solto embaixo.
  // No mobile essa linha não cabe: volta a empilhar, com o botão em largura
  // total no fim — daí o grid de uma coluna como base.
  const fieldsGridClass = showModality
    ? 'md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,9.5rem)_auto]'
    : 'md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto]'

  const renderSearchForm = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={`grid grid-cols-1 gap-3 md:items-start ${fieldsGridClass}`}>
        <div className="w-full">
          <ComboBox
            key={`course-${activeTab}`}
            control={control}
            name="course"
            options={courseOptions}
            icon={<GraduationCap size={20} />}
            placeholder="Digite o curso"
            error={courseError}
            onInputChange={() => {
              if (courseError) setCourseError('')
            }}
          />
        </div>

        <div className="w-full">
          <ComboBox
            control={control}
            name="city"
            options={cityOptions}
            placeholder="Digite uma cidade"
            icon={<MapPin size={20} />}
            error={cityError}
            onInputChange={(inputValue) => {
              handleCityChange(inputValue)
              if (cityError) setCityError('')
            }}
          />
        </div>
        {showModality && (
          <div className="w-full">
            <ModalitySelect
              value={convertModalityFromAPI(watch('modalidade'))}
              onChange={(value) => setValue('modalidade', convertModalityToAPI(value))}
              variant="default"
            />
          </div>
        )}

        {/* `md:h-[50px]` casa com a altura dos campos (py-3 + borda), pra o
            botão terminar exatamente na mesma linha de base que eles. */}
        <button
          type="submit"
          className="group inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-bolsa-secondary px-7 py-3.5 text-[15px] font-bold text-white transition-colors duration-300 hover:bg-bolsa-secondary/90 md:h-[50px] md:w-auto md:py-0"
        >
          Buscar bolsas
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </form>
  )

  // Mesmo container do banner da dobra — ver `HERO_CONTAINER_CLASS`. As bordas
  // laterais do card TÊM que bater com as do banner (decisão do CEO, 09/2026):
  // as duas peças leem como um bloco só.
  return (
    <div className={`${HERO_CONTAINER_CLASS} z-40 relative`}>
      <div className="w-full bg-white border border-hairline rounded-2xl shadow-[0_30px_60px_-30px_rgba(11,31,60,0.18)]">
        {/* Cabeçalho CLARO: era um bloco `bg-bolsa-primary` cheio, com
            sobrancelha "BUSCA DE BOLSAS" e um parágrafo de duas linhas.
            Trocado em 09/2026 pela referência aprovada — branco, integrado ao
            resto do card, sem faixa de cor. O que sobreviveu do bloco antigo
            é o disco vermelho com o capelo, agora à esquerda do título.

            O `Heading` continua sendo o h1 da home quando `asPageHeading` é
            true (ver a prop): é a página que disputa "bolsas de estudo". */}
        <div className="px-5 sm:px-6 md:px-8 pt-6 md:pt-8 pb-5 md:pb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="inline-flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-bolsa-secondary text-white">
              <GraduationCap size={22} />
            </span>
            <div className="min-w-0">
              <Heading className="font-display text-[20px] md:text-[28px] leading-tight font-semibold text-bolsa-primary">
                Encontre sua bolsa de estudos
              </Heading>
              <p className="mt-1 text-ink-500 text-[13px] md:text-[15px] leading-snug">
                Compare cursos e descontos em segundos.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs e form */}
        <div className="bg-white rounded-b-2xl">
          {renderLevelTabs()}
          <div className="px-5 sm:px-6 md:px-8 py-5 md:py-6">
            {renderSearchForm()}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Filter
