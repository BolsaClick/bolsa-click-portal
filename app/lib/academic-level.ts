export const ACADEMIC_LEVEL = {
  GRADUACAO: 'GRADUACAO',
  POS_GRADUACAO: 'POS_GRADUACAO',
  CURSO_TECNICO: 'CURSO_TECNICO',
  TECNICO: 'TECNICO',
  CURSO_LIVRE: 'CURSO_LIVRE',
  CURSO_PROFISSIONALIZANTE: 'CURSO_PROFISSIONALIZANTE',
} as const

export type AcademicLevel = (typeof ACADEMIC_LEVEL)[keyof typeof ACADEMIC_LEVEL]

const LEGACY_PROFISSIONALIZANTE_ALIASES = new Set([
  'CURSOS_PROFISSIONALIZANTES',
  'cursos_profissionalizantes',
])

export function normalizeAcademicLevel(input: string | null | undefined): AcademicLevel {
  if (!input) return ACADEMIC_LEVEL.GRADUACAO
  if (LEGACY_PROFISSIONALIZANTE_ALIASES.has(input)) {
    return ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE
  }
  const upper = input.toUpperCase()
  if (upper in ACADEMIC_LEVEL) {
    return upper as AcademicLevel
  }
  return ACADEMIC_LEVEL.GRADUACAO
}

export function getAcademicLevelLabel(
  level: string | null | undefined,
  degree?: string | null,
): string {
  if (degree && degree.toUpperCase() === 'PROFISSIONALIZANTE') {
    return 'Profissionalizante'
  }
  switch (level) {
    case ACADEMIC_LEVEL.GRADUACAO:
      return 'Graduação'
    case ACADEMIC_LEVEL.POS_GRADUACAO:
      return 'Pós-graduação'
    case ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE:
    case 'CURSOS_PROFISSIONALIZANTES':
    case 'cursos_profissionalizantes':
      return 'Profissionalizante'
    case ACADEMIC_LEVEL.CURSO_TECNICO:
    case ACADEMIC_LEVEL.TECNICO:
      return 'Técnico'
    case ACADEMIC_LEVEL.CURSO_LIVRE:
      return 'Livre'
    default:
      return level ?? ''
  }
}

export function isProfissionalizanteLevel(level: string | null | undefined): boolean {
  if (!level) return false
  return (
    level === ACADEMIC_LEVEL.CURSO_PROFISSIONALIZANTE ||
    LEGACY_PROFISSIONALIZANTE_ALIASES.has(level)
  )
}
