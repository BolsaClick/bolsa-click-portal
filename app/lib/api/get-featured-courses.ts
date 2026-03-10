import { tartarus } from "./axios"

interface FeaturedOffer {
  groupId: string
  courseName: string
  academicLevel: string
  academicDegree: string
  modality: string
  shiftOptions: string[]
  priceWithDiscount: number
  priceWithoutDiscount: number
  enrollmentPrice: number
  easyPayAvailable: boolean
  durationInMonths: number
  scheduleOptions: unknown[]
  source: string
  brand: {
    id: string
    name: string
    logo: string
  }
  unit: string
  unitId: string
  unitAddress: string
  unitLocation: {
    lat: number
    lon: number
  }
  schedules: Array<{
    day: string
    startHour: string
    endHour: string
    sequence: number
  }>
  poleType: string
  commercialModality: string
  businessKey: string
}

interface FeaturedResponse {
  data: FeaturedOffer[]
  total: number
}

function mapFeaturedToCourse(offer: FeaturedOffer) {
  // Extrair cidade e estado do campo unit (formato: "CIDADE/UF")
  let city = ''
  let state = ''

  if (offer.unit) {
    const parts = offer.unit.split('/')
    if (parts.length >= 2) {
      city = parts[0]?.trim() || ''
      state = parts[1]?.trim() || ''
    }
  }

  const mappedSchedules = (offer.schedules || []).map((s) => ({
    day: s.day,
    startHour: s.startHour || '',
    endHour: s.endHour || '',
  }))

  return {
    id: offer.groupId,
    name: offer.courseName,
    brand: offer.brand.name,
    logo: offer.brand.logo,
    academicLevel: offer.academicLevel,
    academicDegree: offer.academicDegree,
    modality: offer.modality,
    commercialModality: offer.commercialModality,
    duration: offer.durationInMonths,
    minPrice: offer.priceWithDiscount,
    maxPrice: offer.priceWithoutDiscount,
    unitId: offer.unitId,
    unitName: offer.unit,
    unitAddress: offer.unitAddress,
    city: city,
    uf: state,
    unitCity: city,
    unitState: state,
    shiftOptions: offer.shiftOptions || [],
    schedules: mappedSchedules,
    businessKey: offer.businessKey,
  }
}

export async function getFeaturedCourses() {
  try {
    const response = await tartarus.get<FeaturedResponse>('/offers/featured')

    const mappedData = response.data.data.map(mapFeaturedToCourse)

    return {
      totalItems: response.data.total,
      totalPages: 1,
      data: mappedData,
    }
  } catch (error) {
    console.error('Erro ao buscar cursos em destaque:', error)
    throw error
  }
}
