import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { withAdminAuth, isAuthError } from '@/app/lib/middleware/admin-auth'
import { pickNextOffer, SemOfertaRealError } from '@/app/lib/social/rotation'
import {
  buildCtaUrl,
  buildOfferCaption,
  buildOfferSlides,
  OFFER_HASHTAGS,
  OfferAcimaDoTetoError,
} from '@/app/lib/social/slides'

/**
 * Fila de publicação social.
 *
 * GET  /api/admin/social/posts        lista a fila (filtro por status/formato)
 * POST /api/admin/social/posts        gera a próxima peça em DRAFT
 *
 * Usa a permissão `blog` de propósito, e não uma permissão `social` nova: as
 * claims de permissão vivem no Firebase, e inventar um nome aqui deixaria a
 * tela invisível pra todo mundo até alguém reemitir as claims de cada admin.
 * É conteúdo editorial, mesma gente que mexe no blog.
 */

const STATUS_VALIDOS = ['DRAFT', 'APPROVED', 'PUBLISHED', 'FAILED'] as const
type StatusValido = (typeof STATUS_VALIDOS)[number]

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request, ['blog'])
  if (isAuthError(auth)) return auth

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') ?? '12', 10) || 12))

  const where =
    status && (STATUS_VALIDOS as readonly string[]).includes(status)
      ? { status: status as StatusValido }
      : {}

  try {
    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where,
        orderBy: [{ scheduledFor: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.socialPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[admin social] listagem falhou:', error)
    return NextResponse.json({ error: 'Falha ao listar a fila' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request, ['blog'])
  if (isAuthError(auth)) return auth

  let body: { scheduledFor?: string } = {}
  try {
    body = await request.json()
  } catch {
    // Corpo vazio é uso legítimo: "gere a próxima peça, sem data ainda".
  }

  try {
    const { offer, sourceRef, lastUsedAt, totalDisponiveis } = await pickNextOffer()
    const slides = buildOfferSlides(offer)

    // Data só pro UTM — a campanha identifica a semana em que a peça nasceu.
    const isoDate = new Date().toISOString().slice(0, 10)
    const ctaUrl = buildCtaUrl(offer, 'oferta', isoDate)

    const post = await prisma.socialPost.create({
      data: {
        platform: 'INSTAGRAM',
        format: 'OFERTA',
        status: 'DRAFT',
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        slides: slides as unknown as object[],
        caption: buildOfferCaption(offer, ctaUrl),
        hashtags: OFFER_HASHTAGS,
        ctaUrl,
        altText: `Carrossel com a oferta de ${offer.course} em ${offer.city}-${offer.uf} pela ${offer.institution}.`,
        sourceRef,
        createdBy: auth.uid,
      },
    })

    return NextResponse.json({
      post,
      rotacao: {
        sourceRef,
        slotUsadoPelaUltimaVezEm: lastUsedAt,
        totalDisponiveis,
      },
    })
  } catch (error) {
    // Sem oferta real o certo é NÃO criar rascunho nenhum: um DRAFT com preço
    // inventado é pior que uma fila vazia, porque parece aprovável.
    if (error instanceof SemOfertaRealError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    if (error instanceof OfferAcimaDoTetoError) {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }
    console.error('[admin social] geração falhou:', error)
    return NextResponse.json({ error: 'Falha ao gerar a peça' }, { status: 500 })
  }
}
