import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Sparkles, ArrowRight, Award } from 'lucide-react'
import { prisma } from '@/app/lib/prisma'
import { TOP_CURSOS } from '@/app/cursos/_data/cursos'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

const TIPO_TO_SLUG: Record<string, string> = {
  R: 'realista', I: 'investigativo', A: 'artistico',
  S: 'social', E: 'empreendedor', C: 'convencional',
}

type Props = { params: Promise<{ shareToken: string }> }

interface SharedProfile {
  hollandCode: string
  primary: { code: string; name: string; short?: string; description?: string }
  secondary: { code: string; name: string; short?: string }
  tertiary: { code: string; name: string; short?: string }
  intelligences?: Array<{ code: string; name: string; short?: string }>
  recommendations: Array<{ courseSlug: string; matchPercent: number; reasoning: string }>
}

async function getShared(shareToken: string) {
  return prisma.vocationalTestResult.findUnique({
    where: { shareToken },
    select: { hollandCode: true, profileData: true, createdAt: true },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareToken } = await params
  const record = await getShared(shareToken)
  if (!record) {
    return { title: 'Resultado não encontrado', robots: { index: false, follow: false } }
  }

  const profile = record.profileData as unknown as SharedProfile
  const url = `${SITE_URL}/teste-vocacional/resultado/${shareToken}`

  return {
    title: `Perfil vocacional ${record.hollandCode}: ${profile.primary.name}`,
    description: `Resultado de teste vocacional do Bolsa Click: Holland Code ${record.hollandCode} (${profile.primary.name}). Veja os 3 cursos recomendados pra esse perfil.`,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: {
      title: `Perfil vocacional: ${record.hollandCode}`,
      description: `${profile.primary.name} — ${profile.primary.description ?? 'Resultado de teste vocacional'}`,
      url,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Perfil vocacional: ${record.hollandCode}`,
      description: `${profile.primary.name} — Bolsa Click`,
    },
  }
}

export default async function SharedResultPage({ params }: Props) {
  const { shareToken } = await params
  const record = await getShared(shareToken)
  if (!record) notFound()

  const profile = record.profileData as unknown as SharedProfile

  // Increment fire-and-forget — não bloqueia render
  prisma.vocationalTestResult
    .update({
      where: { shareToken },
      data: { viewCount: { increment: 1 } },
    })
    .catch(err => console.error('Falha ao incrementar viewCount:', err))

  const tipoSlug = TIPO_TO_SLUG[profile.primary.code] ?? 'social'

  return (
    <>
      <header className="bg-paper border-b border-hairline py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3 inline-flex items-center gap-1.5">
            <Award size={11} className="text-bolsa-secondary" />
            Resultado compartilhado · Teste Vocacional Bolsa Click
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-ink-900 leading-tight mb-3">
            Perfil vocacional: <span className="text-bolsa-secondary">{record.hollandCode}</span>
          </h1>
          <p className="text-lg md:text-xl text-ink-700 max-w-3xl">
            <strong>{profile.primary.name}</strong>
            {profile.secondary && (
              <span className="text-ink-500"> · {profile.secondary.name} · {profile.tertiary?.name}</span>
            )}
          </p>
          {profile.primary.description && (
            <p className="text-ink-700 mt-3 max-w-2xl text-base leading-relaxed">
              {profile.primary.description}
            </p>
          )}
        </div>
      </header>

      {profile.intelligences && profile.intelligences.length > 0 && (
        <section className="bg-white py-8 md:py-10 border-b border-hairline">
          <div className="container mx-auto px-4 max-w-4xl">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-3">
              Inteligências dominantes (Gardner)
            </p>
            <ul className="flex flex-wrap gap-2">
              {profile.intelligences.map(i => (
                <li
                  key={i.code}
                  className="px-2.5 py-1 text-xs font-mono uppercase tracking-wider text-ink-900 bg-paper border border-hairline rounded"
                >
                  {i.name}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="bg-white py-10 md:py-14 border-b border-hairline">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-6">
            <Sparkles className="mx-auto text-bolsa-secondary mb-3" size={28} />
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-2">
              3 cursos recomendados pra esse perfil
            </h2>
          </div>
          <ul className="space-y-3 md:space-y-4">
            {profile.recommendations.map((r, i) => {
              const curso = TOP_CURSOS.find(c => c.slug === r.courseSlug)
              const name = curso?.apiCourseName ?? r.courseSlug
              return (
                <li key={r.courseSlug}>
                  <Link
                    href={`/cursos/${r.courseSlug}`}
                    className="group block bg-white border border-hairline rounded-lg p-4 md:p-5 hover:border-bolsa-secondary transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-2">
                      <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                        Recomendação {i + 1}
                      </p>
                      <div className="shrink-0 px-2 py-0.5 bg-bolsa-secondary/10 text-bolsa-secondary font-mono text-[11px] md:text-xs font-semibold rounded">
                        {r.matchPercent}% match
                      </div>
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-semibold text-ink-900 group-hover:text-bolsa-secondary leading-tight mb-2">
                      {name}
                    </h3>
                    {curso?.description && (
                      <p className="text-ink-500 text-xs mb-2">{curso.description}</p>
                    )}
                    <p className="text-ink-800 leading-relaxed text-sm">{r.reasoning}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-bolsa-secondary text-sm font-medium">
                      Ver bolsas disponíveis <ArrowRight size={14} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="bg-paper py-12 md:py-16 border-t border-hairline">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <Sparkles className="mx-auto text-bolsa-secondary mb-3" size={28} />
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">
            Faça SEU teste vocacional agora
          </h2>
          <p className="text-ink-700 mb-6 text-sm md:text-base max-w-xl mx-auto">
            Esse resultado é de outra pessoa. Descubra seu próprio Holland Code em 5
            minutos, grátis, sem CPF, baseado em metodologia validada cientificamente.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/teste-vocacional"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
            >
              <Sparkles size={14} /> Fazer meu teste
            </Link>
            <Link
              href={`/teste-vocacional/perfil/${tipoSlug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-bolsa-secondary text-bolsa-secondary text-sm font-medium rounded-md hover:bg-paper"
            >
              Saiba mais sobre perfil {profile.primary.name}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
