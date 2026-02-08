// Capitais estaduais brasileiras + Campinas para SEO programático
export interface BrazilianCity {
  name: string
  state: string
  slug: string
}

// Função para converter texto em slug de URL
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// 27 capitais + Campinas
export const BRAZILIAN_CITIES: BrazilianCity[] = [
  { name: 'São Paulo', state: 'SP', slug: slugify('São Paulo') },
  { name: 'Rio de Janeiro', state: 'RJ', slug: slugify('Rio de Janeiro') },
  { name: 'Belo Horizonte', state: 'MG', slug: slugify('Belo Horizonte') },
  { name: 'Curitiba', state: 'PR', slug: slugify('Curitiba') },
  { name: 'Porto Alegre', state: 'RS', slug: slugify('Porto Alegre') },
  { name: 'Brasília', state: 'DF', slug: slugify('Brasília') },
  { name: 'Salvador', state: 'BA', slug: slugify('Salvador') },
  { name: 'Recife', state: 'PE', slug: slugify('Recife') },
  { name: 'Fortaleza', state: 'CE', slug: slugify('Fortaleza') },
  { name: 'Goiânia', state: 'GO', slug: slugify('Goiânia') },
  { name: 'Manaus', state: 'AM', slug: slugify('Manaus') },
  { name: 'Belém', state: 'PA', slug: slugify('Belém') },
  { name: 'Campinas', state: 'SP', slug: slugify('Campinas') },
  { name: 'São Luís', state: 'MA', slug: slugify('São Luís') },
  { name: 'Maceió', state: 'AL', slug: slugify('Maceió') },
  { name: 'Campo Grande', state: 'MS', slug: slugify('Campo Grande') },
  { name: 'Cuiabá', state: 'MT', slug: slugify('Cuiabá') },
  { name: 'João Pessoa', state: 'PB', slug: slugify('João Pessoa') },
  { name: 'Natal', state: 'RN', slug: slugify('Natal') },
  { name: 'Teresina', state: 'PI', slug: slugify('Teresina') },
  { name: 'Aracaju', state: 'SE', slug: slugify('Aracaju') },
  { name: 'Florianópolis', state: 'SC', slug: slugify('Florianópolis') },
  { name: 'Vitória', state: 'ES', slug: slugify('Vitória') },
  { name: 'Porto Velho', state: 'RO', slug: slugify('Porto Velho') },
  { name: 'Macapá', state: 'AP', slug: slugify('Macapá') },
  { name: 'Rio Branco', state: 'AC', slug: slugify('Rio Branco') },
  { name: 'Boa Vista', state: 'RR', slug: slugify('Boa Vista') },
  { name: 'Palmas', state: 'TO', slug: slugify('Palmas') },
]

// Lookup por slug
export function getCityBySlug(slug: string): BrazilianCity | undefined {
  return BRAZILIAN_CITIES.find(city => city.slug === slug)
}

// Todos os slugs de cidade
export function getAllCitySlugs(): string[] {
  return BRAZILIAN_CITIES.map(city => city.slug)
}
