'use client'

/**
 * Id anônimo e ESTÁVEL do visitante da landing, guardado no localStorage.
 *
 * Existe por causa de um problema concreto do funil: o espelho server-side de
 * `checkout_viewed` (/api/ingressa/view) não tem identidade — é pré-formulário.
 * Se o servidor inventar um id por requisição, cada visita vira uma "pessoa"
 * nova no PostHog e o funil `viewed → identified → submitted` NUNCA conecta:
 * vira um contador de visitas, não um funil. E o número de pessoas explode.
 *
 * Com um id estável por navegador, a visita e o envio do formulário pertencem
 * ao mesmo visitante. No envio, o servidor emite `$identify` amarrando este id
 * anônimo ao telefone (`$anon_distinct_id`), que é o mecanismo do PostHog pra
 * fundir os dois — então a conversão visita→lead passa a ser calculável.
 *
 * Não é PII e não depende de consentimento de analytics: é um identificador
 * técnico de primeira parte, sem dado pessoal.
 */

const KEY = 'ingressa_vid'

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function getVisitorId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const existing = window.localStorage.getItem(KEY)
    if (existing) return existing
    const fresh = uuid()
    window.localStorage.setItem(KEY, fresh)
    return fresh
  } catch {
    // Modo anônimo / storage bloqueado: sem id estável. O servidor cai no
    // fallback e a visita ainda é contada — só não entra no funil por pessoa.
    return undefined
  }
}
