import CoursesClient from './CoursesClient'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const courseName = decodeURIComponent(cookieStore.get('courseName')?.value || '')
  const city = decodeURIComponent(cookieStore.get('city')?.value || '')
  const state = decodeURIComponent(cookieStore.get('state')?.value || '')

  const title = courseName
    ? `Cursos de ${courseName} com até 80% de desconto${city && state ? ` em ${city} - ${state}` : ''}`
    : 'Cursos com até 80% de desconto | Bolsa Click'

  const description = courseName
    ? `Encontre bolsas de até 80% para o curso de ${courseName}${city && state ? ` em ${city} - ${state}` : ''}.`
    : 'Compare bolsas de estudo com até 80% de desconto em faculdades de todo o Brasil.'

  return {
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: 'https://www.bolsaclick.com.br/cursos',
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
