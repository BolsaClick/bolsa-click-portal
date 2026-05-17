export type CourseTypeKey =
  | 'BACHARELADO'
  | 'LICENCIATURA'
  | 'TECNOLOGO'
  | 'ESPECIALIZACAO'
  | 'MBA'

export const COURSE_TYPE_LABEL: Record<CourseTypeKey, string> = {
  BACHARELADO: 'Bacharelado',
  LICENCIATURA: 'Licenciatura',
  TECNOLOGO: 'Tecnólogo',
  ESPECIALIZACAO: 'Especialização',
  MBA: 'MBA',
}

export function courseTypeLabel(type: string): string {
  return COURSE_TYPE_LABEL[type as CourseTypeKey] ?? type
}
