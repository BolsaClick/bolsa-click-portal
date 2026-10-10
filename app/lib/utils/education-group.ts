/**
 * Grupo educacional de cada marca parceira, por slug de Institution.
 *
 * Mesma afirmação que o site já publica em
 * app/faculdades/[slug]/_data/brand-content.ts e app/lib/trust.ts — aqui em
 * forma estruturada pra quem precisa decidir pelo dado (ex.: o snippet de
 * /comparar/[pair] responde "Anhanguera e Unopar são a mesma coisa?").
 * Os slugs YDUQS espelham ALL_YDUQS_BRAND_SLUGS em app/lib/api/get-courses-filter.ts.
 *
 * Marca fora do mapa → undefined, e quem consome NÃO afirma grupo nenhum.
 */
export type EducationGroup = 'Cogna' | 'YDUQS'

const GROUP_BY_SLUG: Record<string, EducationGroup> = {
  anhanguera: 'Cogna',
  unopar: 'Cogna',
  pitagoras: 'Cogna',
  unime: 'Cogna',
  estacio: 'YDUQS',
  wyden: 'YDUQS',
  ibmec: 'YDUQS',
}

export function getEducationGroup(slug: string): EducationGroup | undefined {
  return GROUP_BY_SLUG[slug]
}
