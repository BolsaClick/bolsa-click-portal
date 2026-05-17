import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { isExpired } from '@/app/lib/review-tokens'
import { ResponderForm } from './ResponderForm'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

export const metadata: Metadata = {
  title: 'Responder avaliação',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ token: string }>
}

export default async function ResponderReviewPage({ params }: Props) {
  const { token } = await params

  const record = await prisma.institutionResponseToken.findUnique({
    where: { token },
    include: {
      review: {
        select: {
          id: true,
          authorName: true,
          rating: true,
          recommends: true,
          body: true,
          response: true,
          createdAt: true,
          institution: { select: { name: true, slug: true } },
        },
      },
    },
  })

  if (!record) {
    notFound()
  }

  if (record.usedAt) {
    return (
      <Notice
        title="Link já utilizado"
        body={`Este link de resposta já foi usado. Sua resposta para a avaliação da ${record.review.institution.name} já está publicada.`}
        cta={{
          href: `${SITE_URL}/faculdades/${record.review.institution.slug}`,
          label: `Ver página da ${record.review.institution.name}`,
        }}
      />
    )
  }

  if (isExpired(record.expiresAt)) {
    return (
      <Notice
        title="Link expirado"
        body="O link de resposta vale por 7 dias. Solicite um novo link pelo botão de resposta na própria página da faculdade."
        cta={{
          href: `${SITE_URL}/faculdades/${record.review.institution.slug}`,
          label: `Voltar para ${record.review.institution.name}`,
        }}
      />
    )
  }

  if (record.review.response) {
    return (
      <Notice
        title="Avaliação já respondida"
        body={`Já existe uma resposta publicada para essa avaliação. Para editar ou enviar outra, fale com o time do Bolsa Click.`}
        cta={{
          href: `${SITE_URL}/faculdades/${record.review.institution.slug}`,
          label: `Ver página da ${record.review.institution.name}`,
        }}
      />
    )
  }

  return (
    <main className="min-h-[60vh] bg-paper py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-3">
          Responder avaliação da {record.review.institution.name}
        </h1>
        <p className="text-ink-700 mb-6">
          Sua resposta aparecerá publicamente abaixo da avaliação, com a marca
          &quot;Resposta da {record.review.institution.name}&quot;. Seja factual e construtivo —
          uma boa resposta a uma crítica negativa converte mais que esconder a crítica.
        </p>

        <article className="bg-white border border-hairline rounded-md p-5 mb-6">
          <div className="font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 mb-2">
            Avaliação original · {record.review.authorName} ·{' '}
            {new Date(record.review.createdAt).toLocaleDateString('pt-BR')} ·{' '}
            {record.review.rating}/5 · {record.review.recommends ? 'recomenda' : 'não recomenda'}
          </div>
          <p className="text-ink-800 leading-relaxed whitespace-pre-wrap">
            {record.review.body}
          </p>
        </article>

        <ResponderForm reviewId={record.review.id} token={token} />
      </div>
    </main>
  )
}

function Notice({
  title,
  body,
  cta,
}: {
  title: string
  body: string
  cta?: { href: string; label: string }
}) {
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
