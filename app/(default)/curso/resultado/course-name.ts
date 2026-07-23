/**
 * Nome do curso pro backend: junta o nome limpo (`c`) com o sufixo de grau
 * (`cn` — Bacharelado/Licenciatura/Tecnólogo). Usado tanto no fetch server-side
 * quanto no shell client-side (tracking), por isso vive isolado — sem 'use client'.
 */
export function buildCourseNameForAPI(curso: string, cursoNomeCompleto: string): string | undefined {
  if (cursoNomeCompleto && curso) return `${curso} - ${cursoNomeCompleto}`
  return cursoNomeCompleto || curso || undefined
}
