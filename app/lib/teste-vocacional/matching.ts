// Algoritmo determinístico de match:
// 1. Soma pesos das respostas Likert pra calcular score por dimensão RIASEC + Gardner
// 2. Top 3 RIASEC = Holland Code (primary/secondary/tertiary)
// 3. Top 2-3 Gardner = inteligências dominantes
// 4. Pra cada curso do catálogo, calcula score = afinidade RIASEC + afinidade Gardner
// 5. Retorna top N cursos ordenados por score

import { QUESTIONS } from './questions'
import {
  COURSE_PROFILES,
  type RiasecType,
  type GardnerIntelligence,
  type CourseProfile,
} from './methodology-profiles'

export interface LikertAnswers {
  // id da pergunta → 1..5
  [questionId: number]: number
}

export interface UserProfile {
  riasecScores: Record<RiasecType, number>
  gardnerScores: Record<GardnerIntelligence, number>
  hollandCode: string                            // ex: "SIA"
  primary: RiasecType
  secondary: RiasecType
  tertiary: RiasecType
  topIntelligences: GardnerIntelligence[]       // 2-3 maiores
}

const RIASEC_KEYS: RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C']
const GARDNER_KEYS: GardnerIntelligence[] = [
  'linguistica', 'logico-matematica', 'espacial', 'musical',
  'corporal-cinestesica', 'interpessoal', 'intrapessoal', 'naturalista',
]

export function computeUserProfile(answers: LikertAnswers): UserProfile {
  const riasecScores: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  const gardnerScores: Record<GardnerIntelligence, number> = {
    linguistica: 0, 'logico-matematica': 0, espacial: 0, musical: 0,
    'corporal-cinestesica': 0, interpessoal: 0, intrapessoal: 0, naturalista: 0,
  }

  for (const q of QUESTIONS) {
    const rawAnswer = answers[q.id]
    if (typeof rawAnswer !== 'number') continue
    // Normaliza Likert 1-5 pra range -2..+2 (3 = neutro)
    const intensity = Math.max(-2, Math.min(2, rawAnswer - 3))
    if (intensity === 0) continue

    for (const [k, w] of Object.entries(q.riasecWeights)) {
      riasecScores[k as RiasecType] += intensity * (w ?? 0)
    }
    for (const [k, w] of Object.entries(q.gardnerWeights)) {
      gardnerScores[k as GardnerIntelligence] += intensity * (w ?? 0)
    }
  }

  const riasecRanked = [...RIASEC_KEYS].sort((a, b) => riasecScores[b] - riasecScores[a])
  const [primary, secondary, tertiary] = [riasecRanked[0], riasecRanked[1], riasecRanked[2]]

  const gardnerRanked = [...GARDNER_KEYS]
    .sort((a, b) => gardnerScores[b] - gardnerScores[a])
    .filter(k => gardnerScores[k] > 0)
  const topIntelligences = gardnerRanked.slice(0, 3)

  return {
    riasecScores,
    gardnerScores,
    hollandCode: `${primary}${secondary}${tertiary}`,
    primary, secondary, tertiary,
    topIntelligences: topIntelligences.length > 0 ? topIntelligences : gardnerRanked.length > 0 ? gardnerRanked : [GARDNER_KEYS[0]],
  }
}

export interface CourseMatch {
  slug: string
  score: number          // 0-100
}

// Afinidade Holland: primary do user combinando com primary do curso = peso máximo
const RIASEC_AFFINITY_WEIGHTS = { primary: 3, secondary: 2, tertiary: 1 } as const

function scoreCourseRiasec(profile: UserProfile, course: CourseProfile): number {
  const userOrder: RiasecType[] = [profile.primary, profile.secondary, profile.tertiary]
  const courseOrder: RiasecType[] = [
    course.riasec.primary,
    course.riasec.secondary,
    course.riasec.tertiary,
  ]
  let score = 0
  // Score por matches posicionais (primary/secondary/tertiary)
  for (let i = 0; i < 3; i++) {
    const weight = i === 0 ? RIASEC_AFFINITY_WEIGHTS.primary
                : i === 1 ? RIASEC_AFFINITY_WEIGHTS.secondary
                : RIASEC_AFFINITY_WEIGHTS.tertiary
    if (userOrder[i] === courseOrder[i]) score += weight * 2          // exact position
    else if (courseOrder.includes(userOrder[i])) score += weight       // present, mas em outra posição
  }
  return score
}

function scoreCourseGardner(profile: UserProfile, course: CourseProfile): number {
  let score = 0
  for (const intel of course.gardner) {
    if (profile.topIntelligences.includes(intel)) {
      score += 2
    } else if (profile.gardnerScores[intel] > 0) {
      score += 1
    }
  }
  return score
}

export function matchCourses(profile: UserProfile): CourseMatch[] {
  const results: CourseMatch[] = []
  // Normaliza pra 0-100
  const maxRiasecScore = RIASEC_AFFINITY_WEIGHTS.primary * 2 + RIASEC_AFFINITY_WEIGHTS.secondary * 2 + RIASEC_AFFINITY_WEIGHTS.tertiary * 2
  const maxGardnerScore = 6  // 3 inteligências × 2 pontos máx
  const maxTotal = maxRiasecScore + maxGardnerScore

  for (const [slug, course] of Object.entries(COURSE_PROFILES)) {
    const riasecScore = scoreCourseRiasec(profile, course)
    const gardnerScore = scoreCourseGardner(profile, course)
    const raw = riasecScore + gardnerScore
    const score = Math.round((raw / maxTotal) * 100)
    results.push({ slug, score })
  }

  return results.sort((a, b) => b.score - a.score)
}
