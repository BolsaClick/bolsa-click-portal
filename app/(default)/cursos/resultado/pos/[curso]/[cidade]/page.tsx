import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import SearchResultPos from './SearchResultPos'

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()

  const courseName = decodeURIComponent(cookieStore.get('courseName')?.value || '')
  const city = decodeURIComponent(cookieStore.get('city')?.value || '')
  const state = decodeURIComponent(cookieStore.get('state')?.value || '')

  const capitalizeSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .replace(/(^\\w|\\b\\w)/g, (match) => match.toUpperCase());
  }

  const location = city && state ? ` em ${city} - ${state}` : ''

  const title = courseName
    ? `Pós-graduação em ${courseName}${location} com até 80% de desconto | Bolsa Click`
    : 'Pós-graduação com até 80% de desconto em todo o Brasil | Bolsa Click'

  const description = courseName
    ? `Descubra as melhores ofertas de bolsas para pós-graduação em ${courseName}${location}. Compare preços e economize até 80%.`
    : 'Compare bolsas de pós-graduação com até 80% de desconto nas melhores instituições do Brasil.'

  const canonicalUrl = `https://www.bolsaclick.com.br/resultado/pos/${capitalizeSlug(courseName)}/${city}`

  return {
    title,
    description,
    robots: 'index, follow',
    keywords: [
      `pós-graduação ${courseName}`,
      `bolsa de estudo ${courseName}`,
      `pos ${city}`,
      `${courseName} ${city} ${state}`,
      'pós-graduação ead',
      'bolsa click',
    ],
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
    <Suspense fallback={<div className="p-6 text-center text-neutral-500">Carregando ofertas de pós-graduação...</div>}>
      <SearchResultPos />
    </Suspense>
  )
}
