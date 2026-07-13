import { permanentRedirect } from 'next/navigation'

// Rota LEGADA. O padrão canônico das páginas faculdade×cidade é
// `/faculdades/[slug]/em/[city]` (é o que o sitemap emite e o que os links
// internos usam). Esta rota antiga `/faculdades/[slug]/[city]` existia em
// paralelo, servindo o mesmo conteúdo em outra URL — conteúdo duplicado. Agora
// ela apenas redireciona (308 permanente) pro padrão `/em/`, consolidando o
// sinal num único canônico.

type Props = {
  params: Promise<{ slug: string; city: string }>
}

// force-dynamic: sem isto o Next prerenderiza a rota e o redirect sai como
// meta-refresh (HTTP 200), sinal fraco de SEO. Dinâmico → HTTP 308 de verdade.
export const dynamic = 'force-dynamic'

export default async function LegacyFaculdadeCidadeRedirect({ params }: Props) {
  const { slug, city } = await params
  permanentRedirect(`/faculdades/${slug}/em/${city}`)
}
