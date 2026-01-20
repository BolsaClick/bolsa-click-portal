export interface Schedule {
  day: string
  startHour: string
  endHour: string
}

export interface Course {
  id: number | string
  logo?: string
  name: string
  currentPrice?: string
  unitCity?: string
  city?: string
  unitDistrict?: string
  unitNumber?: string
  modality: string
  unitState?: string
  uf?: string
  minPrice: number
  maxPrice?: number
  classShift?: string
  shiftOptions?: string[]
  schedules?: Schedule[]
  brand: string
  unitAddress?: string
  unitPostalCode?: string
  academicLevel?: string
  academicDegree?: string
  duration?: number
  unitId?: string
  unitName?: string
  unit?: string
  businessKey?: string
  commercialModality?: string
  submodality?: string | null
}
