export type InstitutionType = 'PRIVADA' | 'PUBLICA_FEDERAL' | 'PUBLICA_ESTADUAL'

export interface InstitutionData {
  id: string
  slug: string
  name: string
  shortName: string
  fullName: string
  description: string
  longDescription: string
  founded: number | null
  type: InstitutionType
  campusCount: number | null
  studentCount: string | null
  coursesOffered: number | null
  headquartersCity: string | null
  headquartersState: string | null
  mecRating: number | null
  emecLink: string | null
  modalities: string[]
  academicLevels: string[]
  highlights: string[]
  logoUrl: string
  imageUrl: string
  imageAlt: string | null
  keywords: string[]
  metaTitle: string | null
  metaDescription: string | null
  isActive: boolean
  order: number
}

export interface InstitutionListItem {
  id: string
  slug: string
  name: string
  shortName: string
  fullName: string
  description: string
  logoUrl: string
  headquartersCity: string | null
  headquartersState: string | null
  mecRating: number | null
  modalities: string[]
  campusCount: number | null
  studentCount: string | null
}
