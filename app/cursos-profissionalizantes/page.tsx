import { Metadata } from 'next'
import CursosProfissionalizantesClient from './CursosProfissionalizantesClient'
import { getVitrine } from '@/app/lib/api/get-vitrine'

export const revalidate = 600

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cursos Profissionalizantes com Bolsa de Estudo',
  description:
    'Descubra cursos profissionalizantes com foco pratico e bolsas de estudo em diferentes areas para acelerar sua entrada no mercado de trabalho.',
  url: 'https://www.bolsaclick.com.br/cursos-profissionalizantes',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bolsaclick.com.br',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Cursos Profissionalizantes',
        item: 'https://www.bolsaclick.com.br/cursos-profissionalizantes',
      },
    ],
  },
}

export const metadata: Metadata = {
  title: 'Cursos Profissionalizantes com Bolsa de Estudo',
  description:
    'Encontre cursos profissionalizantes com bolsa de estudo e desconto em diferentes modalidades. Compare opcoes e inicie sua qualificacao profissional.',
  keywords: [
    'cursos profissionalizantes',
    'bolsa curso profissionalizante',
    'curso profissionalizante com desconto',
    'qualificacao profissional',
    'curso tecnico profissionalizante',
    'curso para mercado de trabalho',
    'bolsa click',
  ],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/cursos-profissionalizantes',
  },
  openGraph: {
    title: 'Cursos Profissionalizantes com Bolsa de Estudo',
    description:
      'Busque cursos profissionalizantes com foco pratico e desconto para acelerar sua carreira.',
    url: 'https://www.bolsaclick.com.br/cursos-profissionalizantes',
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default async function Page() {
  const offers = await getVitrine({
    levels: ['CURSO_PROFISSIONALIZANTE'],
    perLevel: 6,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <CursosProfissionalizantesClient offers={offers} />
    </>
  )
}
