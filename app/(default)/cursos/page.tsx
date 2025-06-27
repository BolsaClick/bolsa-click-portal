import CoursesClient from './CoursesClient'
import { Metadata } from 'next'
import { Suspense } from 'react'
type Params = {
  modalidade: string
  curso: string
  cidade: string
}

type SearchParams = {
  courseName?: string
  city?: string
  state?: string
}

function capitalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (match) => match.toUpperCase())
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params
  searchParams?: SearchParams
}): Promise<Metadata> {
  const rawCourse = decodeURIComponent(searchParams?.courseName || params.curso || '')
  const rawModalidade = decodeURIComponent(params.modalidade || '')
  const city = decodeURIComponent(searchParams?.city || params.cidade || '')
  const state = decodeURIComponent(searchParams?.state || '')

  const courseName = capitalizeText(rawCourse.replace(/ - (Bacharelado|Tecn[oó]logo)$/i, '').trim())
  const modalidade = capitalizeText(rawModalidade)
  const locationText = city && state ? ` em ${city} - ${state}` : ''

  const title = courseName
    ? `Curso de ${courseName} - A ${modalidade}${locationText} com até 80% de desconto | Bolsa Click`
    : 'Cursos com até 80% de desconto | Bolsa Click'

  const description = courseName
    ? `Compare bolsas para o curso de ${courseName} (${modalidade})${locationText} com até 80% de economia.`
    : 'Encontre bolsas de estudo com até 80% de desconto nas melhores faculdades do Brasil.'

  const url = `https://www.bolsaclick.com.br/cursos/resultado/${slugify(modalidade)}/${slugify(rawCourse)}/${slugify(city)}`

  return {
    title,
    description,
    robots: 'index, follow',
    keywords: [
      courseName,
      modalidade,
      city,
      `${courseName} com bolsa`,
      `faculdade em ${city}`,
      'Bolsa Click',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
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
      <CoursesClient />
    </Suspense>
  )
}
