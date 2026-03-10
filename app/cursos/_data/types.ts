// Tipos para os cursos em destaque (do banco de dados)
export interface FeaturedCourseData {
  id: string
  slug: string
  apiCourseName: string
  name: string
  fullName: string
  type: 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO'
  nivel: 'GRADUACAO' | 'POS_GRADUACAO'
  description: string
  longDescription: string
  duration: string
  areas: string[]
  skills: string[]
  careerPaths: string[]
  averageSalary: string
  marketDemand: 'ALTA' | 'MEDIA' | 'BAIXA'
  imageUrl: string
  imageAlt?: string | null
  keywords: string[]
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipo parcial para listagem (sem todos os campos)
export interface FeaturedCourseListItem {
  id: string
  slug: string
  name: string
  fullName: string
  apiCourseName: string
  type: 'BACHARELADO' | 'LICENCIATURA' | 'TECNOLOGO'
  nivel: 'GRADUACAO' | 'POS_GRADUACAO'
  description: string
  duration: string
  averageSalary: string
  marketDemand: 'ALTA' | 'MEDIA' | 'BAIXA'
  imageUrl: string
  areas: string[]
}
