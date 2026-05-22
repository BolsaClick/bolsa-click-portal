// Helpers de conversão pra JSON-LD válido nos schemas Course / Occupation.
// Cada função resolve um erro de validação reportado pelo Schema Markup
// Validator do Google.

import { courseTypeLabel } from '@/app/lib/courseTypeLabel'

/**
 * Constrói a string humana esperada pelo Google em Course.educationalCredentialAwarded.
 * Em vez do enum interno ("BACHARELADO"), retorna "Bacharel em <curso>",
 * "Licenciado em <curso>", "Tecnólogo em <curso>", etc.
 *
 * Refs:
 *   https://developers.google.com/search/docs/appearance/structured-data/course
 */
export function educationalCredentialAwarded(
  courseName: string,
  type: string
): string {
  const map: Record<string, string> = {
    BACHARELADO: 'Bacharel em',
    LICENCIATURA: 'Licenciado em',
    TECNOLOGO: 'Tecnólogo em',
    ESPECIALIZACAO: 'Especialista em',
    MBA: 'MBA em',
  }
  const prefix = map[type] ?? courseTypeLabel(type)
  return `${prefix} ${courseName}`
}

/**
 * Converte duração legível ("4 anos", "6 semestres", "1 ano", "18 meses")
 * pra ISO 8601 Duration esperada por Course.timeToComplete e
 * CourseInstance.courseWorkload (ex: "P4Y", "P3Y", "P1Y6M").
 *
 * Fallback: retorna "P4Y" (graduação típica) quando não consegue parsear.
 */
export function durationToIso8601(duration: string | null | undefined): string {
  if (!duration) return 'P4Y'
  const lower = duration.toLowerCase().trim()
  const match = lower.match(/(\d+(?:[.,]\d+)?)\s*(ano|anos|mes|meses|semestre|semestres)/)
  if (!match) return 'P4Y'

  const value = parseFloat(match[1].replace(',', '.'))
  const unit = match[2]

  if (unit.startsWith('ano')) {
    const wholeYears = Math.floor(value)
    const remainderMonths = Math.round((value - wholeYears) * 12)
    return remainderMonths > 0 ? `P${wholeYears}Y${remainderMonths}M` : `P${wholeYears}Y`
  }
  if (unit.startsWith('semestre')) {
    // 2 semestres = 1 ano; semestre solto vira 6 meses.
    const years = Math.floor(value / 2)
    const halfYear = value % 2 === 1
    if (years === 0) return 'P6M'
    return halfYear ? `P${years}Y6M` : `P${years}Y`
  }
  if (unit.startsWith('mes') || unit.startsWith('mês')) {
    if (value >= 12 && value % 12 === 0) return `P${value / 12}Y`
    return `P${Math.round(value)}M`
  }
  return 'P4Y'
}

/**
 * Parseia strings de salário brasileiras ("R$ 4.500", "R$ 4.500,00",
 * "R$ 4500.00", "4500", "R$ 12.345,67") pra número decimal compatível
 * com MonetaryAmountDistribution.median.
 *
 * Retorna `undefined` quando não consegue parsear — caller deve omitir o
 * campo em vez de emitir 0 (que aparece como "salário R$ 0" no rich result).
 */
export function parseSalary(value: string | number | null | undefined): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value) && value > 0) return value
  if (typeof value !== 'string') return undefined

  // Remove tudo que não é dígito, vírgula ou ponto. Mantém o sinal de decimal.
  const cleaned = value.replace(/[^\d.,]/g, '').trim()
  if (!cleaned) return undefined

  // Heurística pt-BR: se há vírgula, ela é o separador decimal; pontos viram
  // separador de milhar e são removidos. Caso contrário, mantém o ponto como
  // decimal (formato US também aparece em alguns campos).
  let normalized: string
  if (cleaned.includes(',')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    normalized = cleaned
  }

  const num = parseFloat(normalized)
  return Number.isFinite(num) && num > 0 ? num : undefined
}
