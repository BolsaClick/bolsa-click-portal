import Link from 'next/link'
import { prisma } from '@/app/lib/prisma'
import { isExpired } from '@/app/lib/review-tokens'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Confirmar avaliação | Bolsa Click',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ token?: string }>
}

async function consumeToken(token: string) {
  const record = await prisma.reviewVerificationToken.findUnique({
    where: { token },
    include: {
      review: {
        include: { institution: { select: { name: true, slug: true } } },
      },
    },
  })

  if (!record) return { status: 'invalid' as const }

  const institutionName = record.review.institution.name
  const institutionSlug = record.review.institution.slug

  if (record.usedAt) {
    return { status: 'already' as const, institutionName, institutionSlug }
  }

  if (isExpired(record.expiresAt)) {
    return { status: 'expired' as const, institutionName, institutionSlug }
  }

  await prisma.$transaction([
    prisma.review.update({
      where: { id: record.reviewId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    }),
    prisma.reviewVerificationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  return { status: 'ok' as const, institutionName, institutionSlug }
}

export default async function VerificarAvaliacaoPage({ searchParams }: Props) {
  const { token } = await searchParams

  let result: Awaited<ReturnType<typeof consumeToken>> | null = null
  if (token) result = await consumeToken(token)

  let title: string
  let body: string
  let cta: { href: string; label: string } | null = null

  if (!token || result?.status === 'invalid') {
    title = 'Link inválido'
    body = 'O link de confirmação não existe ou já foi usado. Tente reenviar a avaliação.'
  } else if (result?.status === 'expired') {
    title = 'Link expirado'
    body = 'O link tem validade de 24 horas. Envie uma nova avaliação para receber outro link de confirmação.'
    cta = result.institutionSlug
      ? { href: `${SITE_URL}/faculdades/${result.institutionSlug}`, label: `Voltar para ${result.institutionName}` }
      : null
  } else if (result?.status === 'already') {
    title = 'Email já confirmado'
    body = `Sua avaliação da ${result.institutionName} já estava confirmada. Ela aparece no site assim que passar pela moderação.`
    cta = { href: `${SITE_URL}/faculdades/${result.institutionSlug}`, label: `Ver ${result.institutionName}` }
  } else if (result?.status === 'ok') {
    title = 'Email confirmado'
    body = `Sua avaliação da ${result.institutionName} foi confirmada. Em breve ela passa pela moderação e aparece no site (só rejeitamos spam/abuso — opiniões negativas são bem-vindas).`
    cta = { href: `${SITE_URL}/faculdades/${result.institutionSlug}`, label: `Voltar para ${result.institutionName}` }
  } else {
    title = 'Erro'
    body = 'Não foi possível processar o link.'
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-paper py-16">
      <div className="max-w-xl mx-auto px-4 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-4">
          {title}
        </h1>
        <p className="text-lg text-ink-700 mb-6">{body}</p>
        {cta && (
          <Link
            href={cta.href}
            className="inline-block px-5 py-2.5 bg-bolsa-secondary text-white font-medium rounded-md hover:opacity-90"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </main>
  )
}
