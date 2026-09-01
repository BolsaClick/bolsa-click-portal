import { Metadata } from 'next'
import CursosProfissionalizantesClient from './CursosProfissionalizantesClient'
import { getVitrine } from '@/app/lib/api/get-vitrine'
import { ogImageObject } from '@/app/lib/seo/schema-image'

export const revalidate = 600

// Card gerado por código (opengraph-image.tsx nesta pasta). Antes desta rota
// a página não declarava `openGraph.images` nenhuma — herdava o fallback
// estático do layout raiz. Agora tem card próprio e ImageObject no schema.
const OG_CARD_URL = 'https://www.bolsaclick.com.br/cursos-profissionalizantes/opengraph-image'

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Cursos Profissionalizantes com Bolsa de Estudo',
  description:
    'Descubra cursos profissionalizantes com foco pratico e bolsas de estudo em diferentes areas para acelerar sua entrada no mercado de trabalho.',
  url: 'https://www.bolsaclick.com.br/cursos-profissionalizantes',
  image: ogImageObject(OG_CARD_URL, 'Cursos profissionalizantes com bolsa de estudo — Bolsa Click'),
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
    images: [
      {
        url: OG_CARD_URL,
        width: 1200,
        height: 630,
        alt: 'Cursos Profissionalizantes com Bolsa de Estudo - Bolsa Click',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bolsaclick',
    title: 'Cursos Profissionalizantes com Bolsa de Estudo',
    description:
      'Busque cursos profissionalizantes com foco pratico e desconto para acelerar sua carreira.',
    images: [OG_CARD_URL],
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
