import { tartarus } from "./axios"
import { getMostSearchedCourses } from "./get-most-searched-courses"

interface Course {
  modality?: string
  commercialModality?: string
  uf?: string
  unitState?: string
  academicLevel?: string
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

export async function getShowFiltersCourses(
  courseName?: string,
  city?: string,
  state?: string,
  modality?: string,
  academicLevel: string = 'GRADUACAO',
  page: number = 1,
  size: number = 10
) {
  // Se NÃO houver courseName (undefined, null, string vazia ou só espaços), usar a API de cursos mais buscados
  // Exceto para pós-graduação: o endpoint /offers/most-searched pode não retornar POS; usar sempre cogna/courses/search
  const hasCourseName = courseName && courseName.trim() && courseName.trim().length > 0
  const isPosGraduation = academicLevel.toUpperCase() === 'POS_GRADUACAO'

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
          if (academicLevel) {
            filteredData = filteredData.filter((course: Course) => {
              return (course.academicLevel || '').toUpperCase() === academicLevel.toUpperCase()
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
    academicLevel: [academicLevel], // GRADUACAO, POS_GRADUACAO ou TECNICO
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