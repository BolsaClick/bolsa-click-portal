/**
 * Normaliza um nome de curso pra uma chave de matching estável — usada tanto
 * no util server-side que monta o mapa nome→slug (featured-course-slugs.ts,
 * lê do Prisma) quanto no client (SearchResultsView) que casa o nome vindo da
 * API de busca (Tartarus/Athena) contra esse mapa. Fica num módulo sem Prisma
 * pra poder ser importado em client component sem puxar código de servidor.
 *
 * Maiúsculas + remove acento (NFD) + remove sufixo de grau (" - Bacharelado"
 * etc, presente no fullName/apiCourseName mas não necessariamente no nome que
 * a API de busca retorna) + trim.
 */
export function normalizeCourseNameKey(name: string): string {
  return name
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ - (BACHARELADO|LICENCIATURA|TECNOLOGO)$/, '')
    .trim()
}
