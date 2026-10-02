import { normalizeCourseNameKey } from '@/app/lib/utils/course-name-key'
import type { Course } from '@/app/interface/course'

/** Quantas alternativas cabem no bloco "disponível em outras modalidades". */
const MAX_ALTERNATIVES = 6

type OfferLike = Course & { commercialModality?: string | null }

/**
 * Alternativas pra quando a busca exata volta 0: MESMO CURSO em outra
 * modalidade. Nunca outro curso.
 *
 * Psicologia em graduação não tem oferta EAD (estágio supervisionado e
 * laboratório), então essa busca volta 0 sempre e o fallback refaz a consulta
 * sem a modalidade. Só que a busca do Tartarus casa por PREFIXO:
 * `courseName=Psicologia` devolve "Psicopedagogia - Bacharelado" — medido em
 * 09/09/2026, no Rio os 8 resultados Cogna eram TODOS psicopedagogia. Quem
 * procurava psicologia via psicopedagogia oferecida como saída: é outra
 * profissão, outra formação, outro conselho profissional.
 *
 * Por isso a identidade do curso é conferida AQUI, na volta, comparando a
 * chave normalizada dos DOIS lados (maiúscula, sem acento, sem sufixo de
 * grau) — normalizar só um lado faz o confronto deixar de valer.
 *
 * Igualdade estrita de propósito: conter não basta, senão "Administração"
 * aceitaria "Administração Pública", que também é outro curso. Quando nada
 * casa, o bloco fica vazio e a página cai no estado que sugere trocar cidade
 * ou curso — dizer "não temos" é melhor que empurrar a formação errada.
 */
export function dedupeFallback(
  list: { data?: Course[] } | undefined,
  /** Modalidade que o usuário já buscou e voltou 0 — não é alternativa. */
  blockedModality: string,
  /** Chave normalizada do curso buscado; alternativa que não for ele é descartada. */
  expectedCourseKey: string,
): Course[] {
  const items = (list?.data || []) as OfferLike[]
  const blocked = blockedModality.toUpperCase()
  const seen = new Set<string>()

  return items
    .filter((c) => {
      if (expectedCourseKey && normalizeCourseNameKey(c.name || '') !== expectedCourseKey) {
        return false
      }

      // As DUAS modalidades precisam ser checadas: as ofertas EAD da Cogna vêm
      // `modality: EAD` com `commercialModality: SEMIPRESENCIAL`, e conferir só
      // a comercial deixava voltar justamente a EAD que ele acabou de descartar.
      const commercial = (c.commercialModality || c.modality || '').toUpperCase()
      const raw = (c.modality || '').toUpperCase()
      if (blocked && (commercial === blocked || raw === blocked)) return false

      const key = `${c.id ?? ''}-${commercial}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_ALTERNATIVES)
}
