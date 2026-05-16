// Top 100 municípios brasileiros para SEO programático.
// Cobre as 27 capitais (garantindo presença em todos os estados) + os maiores
// municípios não-capitais por população (IBGE 2022). A ordem aqui é a ordem
// usada no internal linking como "destaque" (top primeiro).
export interface BrazilianCity {
  name: string
  state: string
  slug: string
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const RAW_CITIES: Array<[string, string]> = [
  // Capitais e maiores municípios por população (IBGE)
  ['São Paulo', 'SP'],
  ['Rio de Janeiro', 'RJ'],
  ['Brasília', 'DF'],
  ['Fortaleza', 'CE'],
  ['Salvador', 'BA'],
  ['Belo Horizonte', 'MG'],
  ['Manaus', 'AM'],
  ['Curitiba', 'PR'],
  ['Recife', 'PE'],
  ['Goiânia', 'GO'],
  ['Belém', 'PA'],
  ['Porto Alegre', 'RS'],
  ['Guarulhos', 'SP'],
  ['Campinas', 'SP'],
  ['São Luís', 'MA'],
  ['São Gonçalo', 'RJ'],
  ['Maceió', 'AL'],
  ['Duque de Caxias', 'RJ'],
  ['Campo Grande', 'MS'],
  ['Natal', 'RN'],
  ['Teresina', 'PI'],
  ['São Bernardo do Campo', 'SP'],
  ['Nova Iguaçu', 'RJ'],
  ['João Pessoa', 'PB'],
  ['Santo André', 'SP'],
  ['Osasco', 'SP'],
  ['Jaboatão dos Guararapes', 'PE'],
  ['São José dos Campos', 'SP'],
  ['Ribeirão Preto', 'SP'],
  ['Uberlândia', 'MG'],
  ['Sorocaba', 'SP'],
  ['Contagem', 'MG'],
  ['Aracaju', 'SE'],
  ['Feira de Santana', 'BA'],
  ['Cuiabá', 'MT'],
  ['Joinville', 'SC'],
  ['Juiz de Fora', 'MG'],
  ['Londrina', 'PR'],
  ['Aparecida de Goiânia', 'GO'],
  ['Ananindeua', 'PA'],
  ['Florianópolis', 'SC'],
  ['Niterói', 'RJ'],
  ['Serra', 'ES'],
  ['Belford Roxo', 'RJ'],
  ['Campos dos Goytacazes', 'RJ'],
  ['Caxias do Sul', 'RS'],
  ['Vila Velha', 'ES'],
  ['São João de Meriti', 'RJ'],
  ['Mauá', 'SP'],
  ['Carapicuíba', 'SP'],
  ['Mogi das Cruzes', 'SP'],
  ['Santos', 'SP'],
  ['Diadema', 'SP'],
  ['Olinda', 'PE'],
  ['Betim', 'MG'],
  ['Maringá', 'PR'],
  ['Jundiaí', 'SP'],
  ['Caucaia', 'CE'],
  ['Anápolis', 'GO'],
  ['Piracicaba', 'SP'],
  ['Itaquaquecetuba', 'SP'],
  ['Vitória', 'ES'],
  ['Montes Claros', 'MG'],
  ['São José do Rio Preto', 'SP'],
  ['Cariacica', 'ES'],
  ['Caruaru', 'PE'],
  ['Pelotas', 'RS'],
  ['Bauru', 'SP'],
  ['Canoas', 'RS'],
  ['Blumenau', 'SC'],
  ['Suzano', 'SP'],
  ['Vitória da Conquista', 'BA'],
  ['Ribeirão das Neves', 'MG'],
  ['Franca', 'SP'],
  ['Petrolina', 'PE'],
  ['Ponta Grossa', 'PR'],
  ['Paulista', 'PE'],
  ['Camaçari', 'BA'],
  ['Petrópolis', 'RJ'],
  ['Uberaba', 'MG'],
  ['Cascavel', 'PR'],
  ['Praia Grande', 'SP'],
  ['Taubaté', 'SP'],
  ['Limeira', 'SP'],
  ['Santa Maria', 'RS'],
  ['Gravataí', 'RS'],
  ['Mossoró', 'RN'],
  ['Volta Redonda', 'RJ'],
  ['Sumaré', 'SP'],
  ['Várzea Grande', 'MT'],
  ['Imperatriz', 'MA'],
  ['Foz do Iguaçu', 'PR'],
  ['São Vicente', 'SP'],
  ['Embu das Artes', 'SP'],
  ['Hortolândia', 'SP'],
  ['Marília', 'SP'],
  ['Indaiatuba', 'SP'],
  // Capitais de menor porte (incluídas para garantir cobertura de todos os 27 estados)
  ['Porto Velho', 'RO'],
  ['Macapá', 'AP'],
  ['Rio Branco', 'AC'],
  ['Boa Vista', 'RR'],
  ['Palmas', 'TO'],
]

export const BRAZILIAN_CITIES: BrazilianCity[] = RAW_CITIES.map(([name, state]) => ({
  name,
  state,
  slug: slugify(name),
}))

export function getCityBySlug(slug: string): BrazilianCity | undefined {
  return BRAZILIAN_CITIES.find(city => city.slug === slug)
}

export function getAllCitySlugs(): string[] {
  return BRAZILIAN_CITIES.map(city => city.slug)
}

// Subset usado em internal linking quando 100 cards seria excessivo no UI.
export function getTopCities(limit: number = 30): BrazilianCity[] {
  return BRAZILIAN_CITIES.slice(0, limit)
}
