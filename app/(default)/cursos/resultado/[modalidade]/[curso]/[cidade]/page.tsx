import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import SearchResultClient from './SearchResultClient'

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

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()

  const rawCourse = decodeURIComponent(cookieStore.get('courseName')?.value || '')
  const rawModalidade = decodeURIComponent(cookieStore.get('modalidade')?.value || '')
  const city = decodeURIComponent(cookieStore.get('city')?.value || '')
  const state = decodeURIComponent(cookieStore.get('state')?.value || '')

  const courseName = capitalizeText(rawCourse.replace(/ - (Bacharelado|Tecn[oó]logo)$/i, '').trim())
  const modalidade = capitalizeText(rawModalidade)

  const locationText = city && state ? ` em ${city} - ${state}` : ''

  const title = courseName
    ? `Curso de ${courseName} - A ${modalidade}${locationText} com até 80% de desconto | Bolsa Click`
    : 'Cursos com até 80% de desconto | Bolsa Click'

  const description = courseName
    ? `Compare bolsas para o curso de ${courseName} (${modalidade})${locationText} com até 80% de economia.`
    : 'Encontre bolsas de estudo com até 80% de desconto nas melhores faculdades do Brasil.'

  const url = `https://www.bolsaclick.com.br/cursos/resultado/${modalidade}/${slugify(rawCourse)}/${slugify(city)}`

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
      <SearchResultClient />
    </Suspense>
  )
}
