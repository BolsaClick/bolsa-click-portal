import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { sendEmail } from '@/app/lib/email'
import { verifyTurnstile } from '@/app/lib/captcha'
import {
  generateToken,
  expiresAt,
  RESPONSE_TOKEN_TTL_MS,
} from '@/app/lib/review-tokens'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bolsaclick.com.br'

interface RequestBody {
  email: string
  turnstileToken: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = (await request.json().catch(() => ({}))) as Partial<RequestBody>

  if (!data.email || !data.turnstileToken) {
    return NextResponse.json({ error: 'Email e captcha obrigatórios' }, { status: 400 })
  }

  if (!isValidEmail(data.email)) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const captchaOk = await verifyTurnstile(data.turnstileToken, ip ?? undefined)
  if (!captchaOk) {
    return NextResponse.json({ error: 'Verificação anti-spam falhou' }, { status: 400 })
  }

  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      institutionId: true,
      institution: { select: { name: true, slug: true } },
    },
  })

  if (!review || review.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Review não encontrado' }, { status: 404 })
  }

  const email = data.email.toLowerCase().trim()

  const authorized = await prisma.institutionResponderEmail.findUnique({
    where: {
      institutionId_email: {
        institutionId: review.institutionId,
        email,
      },
    },
  })

  // Resposta sempre 200 — não revelar se email está autorizado ou não (evita enumeration).
  // Só envia o magic link se realmente autorizado e ativo.
  if (authorized?.isActive) {
    const token = generateToken()
    await prisma.institutionResponseToken.create({
      data: {
        token,
        reviewId: review.id,
        institutionId: review.institutionId,
        email,
        expiresAt: expiresAt(RESPONSE_TOKEN_TTL_MS),
      },
    })

    const responseUrl = `${SITE_URL}/responder-review/${token}`
    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="font-size: 20px; margin-bottom: 12px;">Responder avaliação no Bolsa Click</h2>
        <p style="color: #444; line-height: 1.5;">Olá,</p>
        <p style="color: #444; line-height: 1.5;">
          Foi solicitada uma resposta institucional para uma avaliação da
          <strong>${review.institution.name}</strong> no Bolsa Click. Como esse email está
          cadastrado como autorizado, você pode acessar o formulário de resposta pelo link abaixo.
        </p>
        <p style="color: #444; line-height: 1.5;">
          O link vale por 7 dias e só pode ser usado uma vez.
        </p>
        <p style="margin: 24px 0;">
          <a href="${responseUrl}" style="display: inline-block; padding: 12px 24px; background: #00a07a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Acessar formulário de resposta</a>
        </p>
        <p style="color: #888; font-size: 13px; line-height: 1.5;">
          Se você não solicitou, pode ignorar este email. Nenhuma resposta foi publicada.
        </p>
      </div>
    `

    await sendEmail({
      to: email,
      subject: `Responder avaliação da ${review.institution.name}`,
      html,
      text: `Acesse o formulário de resposta institucional: ${responseUrl}\n\nLink válido por 7 dias.`,
    })
  }

  return NextResponse.json({
    ok: true,
    message:
      'Se o email estiver cadastrado como autorizado para essa faculdade, um link de resposta foi enviado.',
  })
}
