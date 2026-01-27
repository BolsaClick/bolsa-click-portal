import { tartarus } from './axios'
import { Course } from '@/app/interface/course'

interface SearchRequest {
  courseId: string
  unitId: string
  courseData: {
    id: string
    name: string
    provider: string
    brand: {
      id?: string
      name: string
      logo?: string
      [key: string]: unknown
    }
    unit: {
      id: string
      name?: string
      address?: string
      city?: string
      state?: string
      postalCode?: string
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}

interface SearchResponse {
  success?: boolean
  message?: string
  [key: string]: unknown
}

/**
 * Transforma o objeto Course em courseData com estrutura esperada pela API
 */
function buildCourseData(course: Course): SearchRequest['courseData'] {
  return {
    id: String(course.id),
    name: course.name,
    provider: 'COGNA',
    brand: {
      id: course.businessKey,
      name: course.brand,
      logo: course.logo,
    },
    unit: {
      id: course.unitId || '',
      name: course.unitName || course.unit,
      address: course.unitAddress,
      city: course.unitCity || course.city,
      state: course.unitState || course.uf,
      postalCode: course.unitPostalCode,
    },
    // Incluir todos os outros campos do course
    modality: course.modality || course.commercialModality,
    academicLevel: course.academicLevel,
    academicDegree: course.academicDegree,
    minPrice: course.minPrice,
    maxPrice: course.maxPrice,
    duration: course.duration,
    classShift: course.classShift,
    shiftOptions: course.shiftOptions,
    schedules: course.schedules,
    businessKey: course.businessKey,
    commercialModality: course.commercialModality,
    submodality: course.submodality,
  }
}

/**
 * Envia dados do curso selecionado para o endpoint de busca
 * @param courseId - ID do curso
 * @param unitId - ID da unidade
 * @param course - Objeto Course completo
 * @returns Resposta da API
 */
export async function postSearch(
  courseId: string,
  unitId: string,
  course: Course
): Promise<SearchResponse> {
  try {
    const courseData = buildCourseData(course)
    
    const response = await tartarus.post<SearchResponse>(
      '/courses/search',
      {
        courseId,
        unitId,
        courseData,
      }
    )

    return response.data
  } catch (error: unknown) {
    console.error('Erro ao enviar dados para search:', error)
    // Não lançar erro para não bloquear o fluxo do usuário
    // Apenas logar o erro
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
