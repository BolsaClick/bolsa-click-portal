/**
 * Nível acadêmico que a marca vende no Bolsa Click — guia a busca de ofertas,
 * a copy e os links de /faculdades/[slug].
 *
 * Graduação quando a marca tem graduação (todas as parceiras até set/2026);
 * senão, o primeiro nível cadastrado. Existe porque a Mackenzie entrou só com
 * pós EAD: com graduação fixa, a página buscava ofertas de graduação (zero),
 * dizia "ofertas de graduação sem desconto" e linkava a busca de graduação.
 * Decisão guiada pelo dado (`academicLevels` do seed), sem exceção por slug.
 */
export function primaryAcademicLevel(academicLevels: string[]): {
  level: string
  label: string
} {
  const level = academicLevels.includes('GRADUACAO')
    ? 'GRADUACAO'
    : (academicLevels[0] ?? 'GRADUACAO')
  return { level, label: level === 'GRADUACAO' ? 'graduação' : 'pós-graduação' }
}
