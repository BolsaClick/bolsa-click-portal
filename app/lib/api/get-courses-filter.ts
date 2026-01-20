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
  const hasCourseName = courseName && courseName.trim() && courseName.trim().length > 0
  
  if (!hasCourseName) {
    if (city && city.trim()) {
      try {
        const mostSearched = await getMostSearchedCourses(city)
        
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
        
        // Aplicar paginação
        const startIndex = (page - 1) * size
        const endIndex = startIndex + size
        const paginatedData = filteredData.slice(startIndex, endIndex)
        
        return {
          totalItems: filteredData.length,
          totalPages: Math.ceil(filteredData.length / size),
          data: paginatedData
        }
      } catch (error) {
        console.error('Erro ao buscar cursos mais buscados:', error)
        // Se der erro, retornar array vazio em vez de fazer fallback
        // para evitar mostrar resultados indesejados
        return {
          totalItems: 0,
          totalPages: 0,
          data: []
        }
      }
    } else {
      // Se não houver cidade, retornar vazio
      return {
        totalItems: 0,
        totalPages: 0,
        data: []
      }
    }
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
  return response.data
}