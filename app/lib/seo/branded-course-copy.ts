import { seoSite, type SiteKey } from './site-config'

export type CourseCopySource = {
  name: string
  fullName?: string | null
  description: string
  longDescription: string
  city?: string
  state?: string
  offerCount?: number
  minPrice?: number
}

export type BrandedCourseCopy = {
  title: string
  metaDescription: string
  heading: string
  introduction: string
  schemaDescription: string
  isDistinct: boolean
}

function compact(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

export function buildBrandedCourseCopy(
  source: CourseCopySource,
  site: SiteKey = seoSite.key,
): BrandedCourseCopy {
  const location = source.city ? ` em ${source.city}${source.state ? `/${source.state}` : ''}` : ''
  const price = source.minPrice && source.minPrice > 0
    ? ` com mensalidades a partir de R$ ${source.minPrice.toFixed(0)}`
    : ''

  if (site === 'bolsamais') {
    const intro = `Planeje sua formação em ${source.name}${location}. Confira modalidades, valores e opções disponíveis antes de escolher a alternativa mais adequada ao seu momento.`
    return {
      title: compact(`${source.name}${location}: bolsas e mensalidades`, 58),
      metaDescription: compact(`Compare bolsas para ${source.name}${location}${price}. Veja opções disponíveis e avance na sua escolha de formação.`, 155),
      heading: `Bolsas para ${source.name}${location}`,
      introduction: intro,
      schemaDescription: compact(`${intro} ${source.description}`, 300),
      isDistinct: true,
    }
  }

  return {
    title: compact(`${source.name}${location} com bolsa de estudo`, 58),
    metaDescription: compact(`${source.description}${price}`, 155),
    heading: `${source.fullName || source.name}${location}`,
    introduction: source.longDescription,
    schemaDescription: source.longDescription,
    isDistinct: site !== 'bolsaclick',
  }
}

export function canIndexBrandedCopy(copy: BrandedCourseCopy): boolean {
  return seoSite.key !== 'bolsamais' || copy.isDistinct
}
