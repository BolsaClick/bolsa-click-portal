import { tartarus } from "./axios"

interface MostSearchedResponse {
  total: number
  data: Array<{
    id: string
    name: string
    provider: string
    brand: {
      id: string
      name: string
      logo: string
    }
    unit: {
      id: string
      name: string
      address: string
      location: {
        lat: number
        lon: number
      }
    }
    academicLevel: string
    academicDegree: string
    modality: string
    submodality: string
    duration: number
    prices: {
      withDiscount: number
      withoutDiscount: number
      enrollment: number
    }
    schedules: Array<unknown>
    shiftOptions: string[]
    businessKey: string
    dmhSource?: {
      accountTeachingInstitution?: {
        address?: {
          mailingCity?: string
          mailingState?: string
          mailingPostalCode?: string
        }
      }
    }
  }>
  source: string
}

// Mapear dados da API most-searched para o formato esperado pelo componente
function mapMostSearchedToCourse(offer: MostSearchedResponse['data'][0]) {
  // Extrair cidade e estado do unit ou dmhSource
  let city = ''
  let state = ''
  
  if (offer.dmhSource?.accountTeachingInstitution?.address) {
    city = offer.dmhSource.accountTeachingInstitution.address.mailingCity || ''
    state = offer.dmhSource.accountTeachingInstitution.address.mailingState || ''
  }
  
  // Fallback: tentar extrair do nome da unidade (formato: "CIDADE/ESTADO - NOME")
  if (!city || !state) {
    const unitParts = offer.unit.name.split('/')
    if (unitParts.length >= 2) {
      city = unitParts[0]?.trim() || ''
      const statePart = unitParts[1]?.split('-')[0]?.trim() || ''
      state = statePart || ''
    }
  }

  // Mapear schedules se necessário
  let mappedSchedules: Array<{ day: string; startHour: string; endHour: string }> = []
  if (offer.schedules && Array.isArray(offer.schedules)) {
    mappedSchedules = offer.schedules.flatMap((schedule: unknown) => {
      // Se schedule for array de dias da semana
      if (Array.isArray(schedule)) {
        return schedule.map((day: string) => ({
          day: day,
          startHour: '',
          endHour: ''
        }))
      }
      // Se já estiver no formato correto
      if (typeof schedule === 'object' && schedule !== null && 'day' in schedule) {
        const scheduleObj = schedule as { day: string; startHour?: string; endHour?: string }
        return [{
          day: scheduleObj.day,
          startHour: scheduleObj.startHour || '',
          endHour: scheduleObj.endHour || ''
        }]
      }
      return []
    })
  }

  return {
    id: offer.id,
    name: offer.name,
    brand: offer.brand.name,
    logo: offer.brand.logo,
    academicLevel: offer.academicLevel,
    academicDegree: offer.academicDegree,
    modality: offer.modality,
    commercialModality: offer.modality,
    submodality: offer.submodality,
    duration: offer.duration,
    minPrice: offer.prices.withDiscount,
    maxPrice: offer.prices.withoutDiscount,
    unitId: offer.unit.id,
    unitName: offer.unit.name,
    unitAddress: offer.unit.address,
    city: city,
    uf: state,
    unitCity: city,
    unitState: state,
    unitPostalCode: offer.dmhSource?.accountTeachingInstitution?.address?.mailingPostalCode || '',
    shiftOptions: offer.shiftOptions || [],
    schedules: mappedSchedules,
    businessKey: offer.businessKey,
  }
}

export async function getMostSearchedCourses(city: string) {
  try {
    const response = await tartarus.get<MostSearchedResponse>('/offers/most-searched', {
      params: {
        city: city.trim()
      }
    })

    // Mapear os dados para o formato esperado
    const mappedData = response.data.data.map(mapMostSearchedToCourse)

    return {
      totalItems: response.data.total,
      totalPages: 1,
      data: mappedData
    }
  } catch (error) {
    console.error('Erro ao buscar cursos mais buscados:', error)
    throw error
  }
}

