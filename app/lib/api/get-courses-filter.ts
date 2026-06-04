import { tartarus } from "./axios"
import { getMostSearchedCourses } from "./get-most-searched-courses"
import { normalizeAcademicLevel } from "../academic-level"
import { normalizeBrand } from "../utils/brand"

interface Course {
  modality?: string
  commercialModality?: string
  uf?: string
  unitState?: string
  academicLevel?: string
  academicDegree?: string
  [key: string]: unknown
}

interface CourseWithPrices {
  minPrice?: number
  maxPrice?: number
  prices?: {
    withDiscount?: number
    withoutDiscount?: number
  }
  [key: string]: unknown
}

/**
 * Busca curso+cidade pública: mescla a fonte Tartarus (Cogna) com as ofertas
 * Estácio (via Athena), na mesma lista. As ofertas Athena entram apenas na
 * página 1 (a paginação client-side roda sobre o array combinado); falha da
 * Athena não derruba a busca Tartarus (Promise.allSettled).
 */
export async function getShowFiltersCourses(
  courseName?: string,
  city?: string,
  state?: string,
  modality?: string,
  academicLevelInput: string = 'GRADUACAO',
  page: number = 1,
  size: number = 10
) {
  const academicLevel = normalizeAcademicLevel(academicLevelInput)

  const [tartarusResult, athenaResult] = await Promise.allSettled([
    getTartarusFilteredCourses(courseName, city, state, modality, academicLevel, page, size),
    // Athena só na primeira página, pra não repetir as mesmas ofertas em páginas seguintes.
    page === 1
      ? fetchAthenaOffers({ courseName, city, state, modality, academicLevel })
      : Promise.resolve([] as CourseWithPrices[]),
  ])

  const tartarus =
    tartarusResult.status === 'fulfilled'
      ? tartarusResult.value
      : { data: [] as CourseWithPrices[], totalItems: 0, totalPages: 0 }
  let athenaOffers =
    athenaResult.status === 'fulfilled' ? athenaResult.value : []

  if (athenaResult.status === 'rejected') {
    console.error('Erro ao mesclar ofertas Athena:', athenaResult.reason)
  }

  // Modo descoberta (sem curso): deduplicar ofertas Athena por nome de curso —
  // evita dezenas de polos do mesmo curso ("PEDAGOGIA" repetido) na vitrine.
  // Com curso específico, mantemos todas as unidades.
  const hasCourseName = !!(courseName && courseName.trim())
  if (!hasCourseName && athenaOffers.length > 0) {
    const seenNames = new Set<string>()
    athenaOffers = athenaOffers.filter((o) => {
      const key = String((o as { name?: string }).name ?? '').trim().toUpperCase()
      if (!key) return true
      if (seenNames.has(key)) return false
      seenNames.add(key)
      return true
    })
  }

  const tartarusData: CourseWithPrices[] = Array.isArray(tartarus?.data)
    ? tartarus.data
    : Array.isArray(tartarus)
      ? (tartarus as CourseWithPrices[])
      : []

  if (athenaOffers.length === 0) {
    return tartarus
  }

  // Round-robin POR MARCA: 1 oferta de cada instituição por vez (Anhanguera,
  // Pitágoras, Estácio, Unopar, …) pra máxima variedade na 1ª página, em vez de
  // uma marca dominar. Agrupa Cogna + Estácio por marca normalizada e rotaciona.
  const buckets = new Map<string, CourseWithPrices[]>()
  const brandOrder: string[] = []
  for (const offer of [...tartarusData, ...athenaOffers]) {
    const key = normalizeBrand((offer as { brand?: string }).brand) || '—'
    if (!buckets.has(key)) {
      buckets.set(key, [])
      brandOrder.push(key)
    }
    buckets.get(key)!.push(offer)
  }
  const merged: CourseWithPrices[] = []
  let pushedSomething = true
  while (pushedSomething) {
    pushedSomething = false
    for (const key of brandOrder) {
      const arr = buckets.get(key)!
      if (arr.length > 0) {
        merged.push(arr.shift()!)
        pushedSomething = true
      }
    }
  }

  const baseTotalItems =
    typeof (tartarus as { totalItems?: number })?.totalItems === 'number'
      ? (tartarus as { totalItems: number }).totalItems
      : tartarusData.length
  const totalItems = baseTotalItems + athenaOffers.length

  return {
    ...(typeof tartarus === 'object' && !Array.isArray(tartarus) ? tartarus : {}),
    data: merged,
    totalItems,
    totalPages: Math.ceil(totalItems / Math.max(size, 1)),
  }
}

/**
 * Busca as ofertas Estácio no nosso route handler (/api/athena-offers), que
 * server-side chama a Athena. Retorna já normalizado como `Course` (source YDUQS).
 * Degradação graciosa: qualquer falha → [].
 */
async function fetchAthenaOffers(params: {
  courseName?: string
  city?: string
  state?: string
  modality?: string
  academicLevel?: string
}): Promise<CourseWithPrices[]> {
  // Só roda no browser (fetch relativo). Em SSR/prefetch, pular.
  if (typeof window === 'undefined') return []

  try {
    const qs = new URLSearchParams()
    if (params.courseName?.trim()) qs.set('courseName', params.courseName.trim())
    if (params.city?.trim()) qs.set('city', params.city.trim())
    if (params.state?.trim()) qs.set('state', params.state.trim())
    if (params.modality?.trim()) qs.set('modality', params.modality.trim())
    if (params.academicLevel?.trim()) qs.set('academicLevel', params.academicLevel.trim())

    const res = await fetch(`/api/athena-offers?${qs.toString()}`)
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data) ? (json.data as CourseWithPrices[]) : []
  } catch (error) {
    console.error('Erro ao buscar ofertas Athena no portal:', error)
    return []
  }
}

async function getTartarusFilteredCourses(
  courseName: string | undefined,
  city: string | undefined,
  state: string | undefined,
  modality: string | undefined,
  academicLevel: string,
  page: number = 1,
  size: number = 10
) {

  // Se NÃO houver courseName (undefined, null, string vazia ou só espaços), usar a API de cursos mais buscados
  // Exceto para pós-graduação: o endpoint /offers/most-searched pode não retornar POS; usar sempre cogna/courses/search
  const hasCourseName = courseName && courseName.trim() && courseName.trim().length > 0
  const isPosGraduation = academicLevel === 'POS_GRADUACAO'

  if (!hasCourseName && !isPosGraduation) {
    if (city && city.trim()) {
      try {
        const mostSearched = await getMostSearchedCourses(city)

        // Se o most-searched vier vazio, fazer fallback para a API de busca normal
        if (!mostSearched.data || mostSearched.data.length === 0 || mostSearched.totalItems === 0) {
          // Continuar para a busca normal abaixo
        } else {
          // Filtrar por modalidade se fornecida
          let filteredData = mostSearched.data
          if (modality && modality.trim()) {
            const modalityUpper = modality.toUpperCase()
            filteredData = filteredData.filter((course: Course) => {
              const courseModality = (course.modality || course.commercialModality || '').toUpperCase()
              return courseModality === modalityUpper
            })
          }

          // Filtrar por estado se fornecido
          if (state && state.trim()) {
            filteredData = filteredData.filter((course: Course) => {
              return (course.uf || course.unitState || '').toUpperCase() === state.toUpperCase()
            })
          }

          // Filtrar por academicLevel se fornecido
          // Para profissionalizante, considerar também academicDegree === 'PROFISSIONALIZANTE'
          // (algumas ofertas vêm marcadas só pelo degree com academicLevel em outro valor)
          if (academicLevel) {
            const isProfissionalizante = academicLevel === 'CURSO_PROFISSIONALIZANTE'
            filteredData = filteredData.filter((course: Course) => {
              const courseLevel = (course.academicLevel || '').toUpperCase()
              if (courseLevel === academicLevel) return true
              if (isProfissionalizante && (course.academicDegree || '').toUpperCase() === 'PROFISSIONALIZANTE') {
                return true
              }
              return false
            })
          }

          // Se não houver resultados após filtrar, fazer fallback para a API de busca normal
          if (filteredData.length === 0) {
            // Continuar para a busca normal abaixo
          } else {
            // Aplicar paginação
            const startIndex = (page - 1) * size
            const endIndex = startIndex + size
            const paginatedData = filteredData.slice(startIndex, endIndex)

            return {
              totalItems: filteredData.length,
              totalPages: Math.ceil(filteredData.length / size),
              data: paginatedData
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar cursos mais buscados:', error)
        // Se der erro, fazer fallback para a API de busca normal
        // Continuar para a busca normal abaixo
      }
    }
    // Se não houver cidade ou não houver resultados no most-searched, fazer fallback para a API de busca normal
    // Continuar para a busca normal abaixo
  }

  // Busca normal (comportamento atual quando há courseName ou erro na most-searched)
  const params: Record<string, string | number | string[]> = {
    page,
    size: Math.min(size, 50), // Limitar a 50 itens por página
    academicLevel: [academicLevel], // GRADUACAO, POS_GRADUACAO, CURSO_TECNICO, TECNICO, CURSO_LIVRE ou CURSO_PROFISSIONALIZANTE
  }

  // Só adiciona courseName se vier da URL
  if (courseName && courseName.trim()) {
    params.courseName = courseName.trim()
  }

  // Só adiciona city se vier da URL
  if (city && city.trim()) {
    params.city = city.trim()
  }

  // Só adiciona state se vier da URL
  if (state && state.trim()) {
    params.state = state.trim()
  }

  // Só adiciona modality se vier da URL (converte para array)
  if (modality && modality.trim()) {
    // Normalizar modalidade para o formato da API
    const modalityUpper = modality.toUpperCase()
    if (['EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'].includes(modalityUpper)) {
      params.modality = [modalityUpper]
    }
  }

  // Serializador customizado para remover colchetes dos arrays
  const paramsSerializer = (params: Record<string, string | number | string[]>) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Para arrays, adicionar múltiplos parâmetros com o mesmo nome (sem colchetes)
        value.forEach((item) => {
          searchParams.append(key, String(item))
        })
      } else if (value !== null && value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    
    return searchParams.toString()
  }

  const response = await tartarus.get('cogna/courses/search', { 
    params,
    paramsSerializer
  })
  
  // Mapear os dados para garantir que minPrice e maxPrice estejam presentes
  // A API pode retornar os preços em diferentes formatos (prices.withDiscount, prices.withoutDiscount, etc)
  if (response.data && response.data.data && Array.isArray(response.data.data)) {
    const mappedData = response.data.data.map((course: CourseWithPrices) => {
      // Se já tiver minPrice e maxPrice, manter como está
      if (course.minPrice !== undefined && course.maxPrice !== undefined) {
        return course
      }
      
      // Tentar extrair de prices.withDiscount e prices.withoutDiscount
      if (course.prices) {
        return {
          ...course,
          minPrice: course.prices.withDiscount ?? course.minPrice ?? 0,
          maxPrice: course.prices.withoutDiscount ?? course.maxPrice ?? 0,
        }
      }
      
      // Se não tiver prices, manter os valores existentes ou usar 0
      return {
        ...course,
        minPrice: course.minPrice ?? 0,
        maxPrice: course.maxPrice ?? 0,
      }
    })
    
    return {
      ...response.data,
      data: mappedData
    }
  }
  
  return response.data
}