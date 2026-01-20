import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchResultClient from './SearchResultClient'

export const dynamic = 'force-dynamic'

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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const curso = typeof params.c === 'string' ? params.c : ''
  const cidade = typeof params.cidade === 'string' ? params.cidade : ''
  const estado = typeof params.estado === 'string' ? params.estado : ''
  const modalidade = typeof params.modalidade === 'string' ? params.modalidade : 'EAD'
  const nivel = typeof params.nivel === 'string' ? params.nivel : 'GRADUACAO'

  const courseNameClean = curso ? removeCourseSuffix(curso) : ''
  const courseName = courseNameClean ? capitalizeText(courseNameClean) : ''
  const modalidadeFormatted = capitalizeText(modalidade === 'EAD' ? 'A Distância' : modalidade)
  const locationText = cidade && estado ? ` em ${cidade} - ${estado}` : ''
  
  // Determinar o tipo de curso baseado no nível
  const courseType = nivel === 'POS_GRADUACAO' ? 'Pós-graduação' : 
                     nivel === 'TECNICO' ? 'Técnico' : 
                     'Graduação'

  const title = courseName
    ? `${courseType} em ${courseName} - ${modalidadeFormatted}${locationText} com até 80% de desconto | Bolsa Click`
    : cidade && estado
      ? `Cursos de ${courseType} ${modalidadeFormatted}${locationText} com até 80% de desconto | Bolsa Click`
      : `Cursos de ${courseType} ${modalidadeFormatted} com até 80% de desconto | Bolsa Click`

  const description = courseName
    ? `Compare bolsas para ${courseType.toLowerCase()} em ${courseName} (${modalidadeFormatted})${locationText}. Encontre as melhores ofertas com até 80% de desconto nas principais faculdades do Brasil. Cadastre-se grátis e economize!`
    : cidade && estado
      ? `Encontre bolsas de estudo de ${courseType.toLowerCase()} ${modalidadeFormatted}${locationText} com até 80% de desconto. Compare preços, modalidades e condições de pagamento nas melhores faculdades. Cadastre-se grátis!`
      : `Encontre bolsas de estudo de ${courseType.toLowerCase()} ${modalidadeFormatted} com até 80% de desconto nas melhores faculdades do Brasil. Compare preços e economize na sua mensalidade. Cadastre-se grátis!`

  const canonicalParams = new URLSearchParams()
  if (courseNameClean) canonicalParams.set('c', courseNameClean)
  if (cidade) canonicalParams.set('cidade', cidade)
  if (estado) canonicalParams.set('estado', estado)
  canonicalParams.set('modalidade', modalidade)
  canonicalParams.set('nivel', nivel)
  
  const canonicalUrl = `https://www.bolsaclick.com.br/curso/resultado?${canonicalParams.toString()}`

  const keywords = [
    courseName && `${courseName} com bolsa`,
    courseName && `bolsa de estudo ${courseName}`,
    modalidadeFormatted && `graduação ${modalidadeFormatted.toLowerCase()}`,
    cidade && `faculdade em ${cidade}`,
    estado && `cursos em ${estado}`,
    'bolsas de estudo',
    'educação superior',
    'Bolsa Click',
  ].filter(Boolean) as string[]

  return {
    title,
    description,
    robots: 'index, follow',
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
  }
}

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Carregando cursos...</div>}>
      <SearchResultClient />
    </Suspense>
  )
}