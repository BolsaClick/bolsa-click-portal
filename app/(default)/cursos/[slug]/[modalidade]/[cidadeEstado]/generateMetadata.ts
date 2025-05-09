import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string; modalidade: string; cidadeEstado: string }
}): Promise<Metadata> {
  const [cityRaw, state] = params.cidadeEstado.split('-')
  const city = decodeURIComponent(cityRaw)
  const courseName = decodeURIComponent(params.slug).replace(/-/g, ' ')
  const modalidade = decodeURIComponent(params.modalidade)

  const title = `Curso de ${courseName} (${modalidade}) com bolsas em ${city} - ${state}`
  const description = `Encontre descontos de até 80% para o curso de ${courseName} na modalidade ${modalidade} em ${city} - ${state}.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.bolsaclick.com.br/cursos/${params.slug}/${params.modalidade}/${params.cidadeEstado}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.bolsaclick.com.br/cursos/${params.slug}/${params.modalidade}/${params.cidadeEstado}`,
      siteName: 'Bolsa Click',
      type: 'website',
    },
  }
}
