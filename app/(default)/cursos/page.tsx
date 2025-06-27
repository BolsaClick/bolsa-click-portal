import CoursesClient from './CoursesClient'
import { Metadata } from 'next'
import { Suspense } from 'react'

type Params = {
  modalidade: string
  curso: string
  cidade: string
}
export async function generateMetadata({ params, searchParams }: {
  params: Params,
  searchParams?: { courseName?: string, city?: string, state?: string }
}): Promise<Metadata> {
  const modalidade = decodeURIComponent(params.modalidade)
  const curso = decodeURIComponent(params.curso)
  const cidade = decodeURIComponent(params.cidade)

  const courseName = searchParams?.courseName
    ? decodeURIComponent(searchParams.courseName)
    : curso.replaceAll('-', ' ')

  const city = searchParams?.city
    ? decodeURIComponent(searchParams.city)
    : cidade.replaceAll('-', ' ')

  const state = searchParams?.state ? ` - ${decodeURIComponent(searchParams.state)}` : ''

  const title = `Curso de ${courseName} (${modalidade}) com até 80% de desconto em ${city}${state}`
  const description = `Encontre bolsas de estudo para o curso de ${courseName} na modalidade ${modalidade}, com até 80% de desconto em ${city}${state}.`

  return {
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: `https://www.bolsaclick.com.br/cursos/resultado/${modalidade}/${curso}/${cidade}`,
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
