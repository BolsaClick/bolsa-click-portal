/**
 * Normaliza um nome de curso pra uma chave de matching estável — usada tanto
 * no util server-side que monta o mapa nome→slug (featured-course-slugs.ts,
 * lê do Prisma) quanto no client (SearchResultsView) que casa o nome vindo da
 * API de busca (Tartarus/Athena) contra esse mapa. Fica num módulo sem Prisma
 * pra poder ser importado em client component sem puxar código de servidor.
 *
 * Maiúsculas + remove acento (NFD) + remove sufixo de grau (" - Bacharelado"
 * etc, presente no fullName/apiCourseName mas não necessariamente no nome que
 * a API de busca retorna) + pontuação e espaço repetido viram um espaço só.
 *
 * O sufixo aceita qualquer espaçamento em volta do hífen porque o catálogo
 * da Cogna não é consistente: "Cibersegurança -Tecnólogo" e "Inteligência de
 * Mercado e Análise de Dados -  Tecnólogo" existem assim (medido em
 * 10/09/2026). E a pontuação some porque o mesmo curso aparece como
 * "Bilíngue - LIBRAS/LP" num lado e "Bilíngue-LIBRAS-LP" no outro.
 */
export function normalizeCourseNameKey(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s*-\s*(BACHARELADO|LICENCIATURA|TECNOLOGO)\s*$/, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

/**
 * Só as ofertas do MESMO curso que foi pesquisado por nome.
 *
 * Nenhuma das duas fontes de oferta casa o nome exato: o Tartarus casa por
 * PREFIXO (`courseName=Psicologia` traz "Psicopedagogia - Bacharelado") e a
 * Athena por SUBSTRING, ordenando pelo menor preço (`courseName=Pedagogia` na
 * Estácio devolve só PSICOPEDAGOGIA — as 100 primeiras, medido em 10/09/2026).
 * Quem calcula "a partir de R$ X" sobre a lista crua pega o preço de outro
 * curso: /cursos/psicologia-bacharelado (presencial, ~R$ 399) chegou a exibir
 * R$ 115 de uma Psicopedagogia EAD.
 *
 * Igualdade da chave normalizada nos DOIS lados — normalizar só um faz o
 * confronto deixar de valer. Conter não basta: "Administração" aceitaria
 * "Administração Pública", que é outro curso.
 */
export function filterSameCourse<T extends object>(
  offers: T[],
  courseName: string | null | undefined,
): T[] {
  const expected = normalizeCourseNameKey(courseName || '')
  if (!expected) return offers
  return offers.filter((o) => {
    const name = (o as { name?: unknown }).name
    return typeof name === 'string' && normalizeCourseNameKey(name) === expected
  })
}
