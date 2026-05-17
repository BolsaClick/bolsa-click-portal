/**
 * Title case em português, respeitando stopwords comuns
 * (preposições, artigos, conjunções) — elas ficam minúsculas
 * exceto quando são a primeira palavra.
 *
 * Exemplos:
 *   "eletricista"                       → "Eletricista"
 *   "auxiliar de recursos humanos"      → "Auxiliar de Recursos Humanos"
 *   "administracao - bacharelado"       → "Administracao - Bacharelado"
 *   "marketing e vendas"                → "Marketing e Vendas"
 */

const STOPWORDS = new Set([
  'a', 'as', 'o', 'os',
  'de', 'da', 'do', 'das', 'dos',
  'e',
  'em', 'no', 'na', 'nos', 'nas',
  'com',
  'para',
  'por',
])

function capitalize(word: string): string {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function titleCasePtBr(input: string | null | undefined): string {
  if (!input) return ''
  const lower = input.toLowerCase().trim()
  if (!lower) return ''

  // Quebramos por espaço mas preservamos tudo (incluindo "-" como token).
  const tokens = lower.split(/(\s+)/)
  let firstWordSeen = false

  return tokens
    .map((token) => {
      // Espaços ficam como estão.
      if (/^\s+$/.test(token)) return token
      // Token não-alfabético (ex.: "-", "/", "·") fica como está.
      if (!/[a-zà-ÿ]/i.test(token)) return token

      if (!firstWordSeen) {
        firstWordSeen = true
        return capitalize(token)
      }
      if (STOPWORDS.has(token)) return token
      return capitalize(token)
    })
    .join('')
}
