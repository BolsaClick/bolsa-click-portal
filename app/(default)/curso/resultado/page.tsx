import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchResultClient from './SearchResultClient'

export const dynamic = 'force-dynamic'

// Estados brasileiros válidos
const ESTADOS_BRASIL = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
])

function capitalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (match) => match.toUpperCase())
}

function removeCourseSuffix(name: string) {
  return name
    .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
    .trim()
}

function extractCourseSuffix(name: string): string | null {
  const match = name.match(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i)
  return match ? match[1] : null
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const curso = typeof params.c === 'string' ? params.c : ''
  const cursoNomeCompleto = typeof params.cn === 'string' ? params.cn : ''
  const cidade = typeof params.cidade === 'string' ? params.cidade : ''
  const estado = typeof params.estado === 'string' ? params.estado : ''
  const modalidade = typeof params.modalidade === 'string' ? params.modalidade : 'EAD'
  const nivel = typeof params.nivel === 'string' ? params.nivel : 'GRADUACAO'

  // Normalizar parâmetros: se 'c' contém sufixo mas 'cn' não existe, extrair o sufixo
  const courseNameClean = curso ? removeCourseSuffix(curso) : ''
  let finalCn = cursoNomeCompleto || ''
  
  // Se o curso tem sufixo no parâmetro 'c' mas não temos 'cn', extrair o sufixo
  if (curso && !finalCn && nivel === 'GRADUACAO') {
    const suffix = extractCourseSuffix(curso)
    if (suffix) {
      finalCn = suffix
    }
  }

  const courseName = courseNameClean ? capitalizeText(courseNameClean) : ''
  const modalidadeFormatted = capitalizeText(modalidade === 'EAD' ? 'A Distância' : modalidade)
  const locationText = cidade && estado ? ` em ${cidade} - ${estado}` : ''
  
  // Determinar o tipo de curso baseado no nível
  const courseType = nivel === 'POS_GRADUACAO' ? 'Pós-graduação' : 
                     nivel === 'TECNICO' ? 'Técnico' : 
                     'Graduação'

  // Verificar se há curso selecionado (cidade/estado sozinhos não contam como filtro para o título)
  // Quando não há curso, sempre mostrar "Buscar cursos" mesmo que tenha cidade/estado (geolocalização automática)
  const hasCourseSelected = courseName && courseName.trim().length > 0

  // Verificar se é um estado brasileiro válido (se estado foi informado)
  // URLs com estados inválidos (como CA, TX, NY) não devem ser indexadas
  const isValidBrazilianState = !estado || ESTADOS_BRASIL.has(estado.toUpperCase())

  // Determinar se a página deve ser indexada:
  // - Deve ter um curso selecionado (páginas genéricas não são indexadas)
  // - Se tiver estado, deve ser brasileiro
  const shouldIndex = hasCourseSelected && isValidBrazilianState
  
  // Se não houver curso selecionado, usar título genérico "Buscar cursos"
  // Nota: O layout principal adiciona " | Bolsa Click" automaticamente via template
  const title = hasCourseSelected
    ? `Bolsa de Estudo em ${courseName} - Faculdades ${modalidadeFormatted}${locationText} com até 80% de Desconto`
    : 'Bolsa de Estudo em Faculdades | Buscar Cursos'

  const description = hasCourseSelected
    ? `Encontre bolsa de estudo em ${courseName} (${modalidadeFormatted})${locationText}. Desconto em faculdade de até 80% nas principais instituições do Brasil. Compare preços e garanta sua bolsa. Cadastre-se grátis!`
    : 'Busque e compare bolsas de estudo em faculdades de todo Brasil. Desconto em faculdade de até 80% para graduação, pós-graduação e cursos técnicos. Mais de 30.000 faculdades parceiras. Cadastre-se grátis!'

  // Construir URL canônica auto-referencial e normalizada
  // Normalização: sempre usar 'c' limpo e 'cn' separado (se aplicável)
  // Isso garante consistência e evita duplicação de conteúdo
  const canonicalParams = new URLSearchParams()
  
  // Ordem alfabética para consistência: c, cn, cidade, estado, modalidade, nivel
  if (courseNameClean && courseNameClean.trim()) {
    canonicalParams.set('c', courseNameClean.trim())
  }
  
  // Incluir 'cn' apenas se existir e for graduação (pós-graduação não usa sufixo)
  if (finalCn && finalCn.trim() && nivel === 'GRADUACAO') {
    canonicalParams.set('cn', finalCn.trim())
  }
  
  if (cidade && cidade.trim()) {
    canonicalParams.set('cidade', cidade.trim())
  }
  if (estado && estado.trim()) {
    canonicalParams.set('estado', estado.trim())
  }
  
  // Sempre incluir modalidade e nivel (valores padrão se não especificados)
  canonicalParams.set('modalidade', modalidade)
  canonicalParams.set('nivel', nivel)
  
  // URL canônica auto-referencial: sempre aponta para a própria página com www
  // Normalizada para evitar múltiplas URLs apontando para o mesmo conteúdo
  const canonicalUrl = `https://www.bolsaclick.com.br/curso/resultado?${canonicalParams.toString()}`

  const keywords = [
    courseName && `bolsa de estudo ${courseName}`,
    courseName && `bolsa de estudos ${courseName}`,
    courseName && `desconto em faculdade ${courseName}`,
    courseName && `bolsa faculdade ${courseName}`,
    courseName && `${courseName} com bolsa`,
    `bolsa de estudo ${courseType.toLowerCase()}`,
    `bolsa de estudos ${courseType.toLowerCase()}`,
    `desconto em faculdade ${courseType.toLowerCase()}`,
    cidade && `bolsa de estudo ${cidade}`,
    cidade && `desconto em faculdade ${cidade}`,
    cidade && `faculdade em ${cidade}`,
    estado && `bolsa de estudo ${estado}`,
    estado && `cursos em ${estado}`,
    modalidadeFormatted && `${courseType.toLowerCase()} ${modalidadeFormatted.toLowerCase()}`,
    'bolsa de estudo',
    'bolsa de estudos',
    'bolsas de estudo',
    'desconto em faculdade',
    'desconto faculdade',
    'bolsa faculdade',
    'faculdade com bolsa',
    'faculdades com desconto',
    'educação superior',
    'Bolsa Click',
  ].filter(Boolean) as string[]

  // Construir BreadcrumbList schema
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.bolsaclick.com.br',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: courseType, // Graduação, Pós-graduação, etc
      item: `https://www.bolsaclick.com.br/${nivel === 'GRADUACAO' ? 'graduacao' : nivel === 'POS_GRADUACAO' ? 'pos-graduacao' : 'cursos'}`,
    },
  ]

  // Adicionar curso como terceiro item se selecionado
  if (hasCourseSelected) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: courseName,
      item: canonicalUrl,
    })
  }

  return {
    title,
    description,
    // Só indexar páginas com curso selecionado e estado brasileiro válido
    robots: shouldIndex ? 'index, follow' : 'noindex, nofollow',
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bolsaclick',
      title,
      description,
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      }),
    },
  }
}

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Carregando cursos...</div>}>
      <SearchResultClient />
    </Suspense>
  )
}