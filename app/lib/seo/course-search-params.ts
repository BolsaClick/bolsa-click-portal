/**
 * Normalização de nome de curso pra `/curso/resultado` (busca por query
 * string: `?c=...&cn=...`). Extraído de `page.tsx` — usado lá E pela imagem
 * OG da rota (`app/api/og/resultado/route.tsx`), que lê a mesma query mas
 * não pode importar de dentro de um Server Component de página com
 * `searchParams` (a convenção `opengraph-image.tsx` só recebe `params` de
 * segmento dinâmico, nunca query string — daí a Route Handler dedicada).
 * Mesma função pura em ambos os lugares = mesmo texto mostrado no
 * título/description da página e no card de compartilhamento.
 */
export function capitalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (match) => match.toUpperCase())
}

export function removeCourseSuffix(name: string) {
  return name
    .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
    .trim()
}

export function extractCourseSuffix(name: string): string | null {
  const match = name.match(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i)
  return match ? match[1] : null
}
