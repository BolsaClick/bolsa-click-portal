import { NextRequest, NextResponse } from 'next/server'
import { resolvePaymentLinkCached } from '@/app/lib/api/cogna-payment-link'
import { upsertCandidato } from '@/app/lib/api/attio'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Gera o link de pagamento da Cogna para uma inscrição recém-criada.
 *
 * Existe como rota de servidor por dois motivos:
 *  1. A listagem de inscrições do parceiro devolve dados pessoais de TODAS as
 *     inscrições (205 mil no total) — nada disso pode passar pelo browser. Aqui
 *     entra só o id da própria inscrição e sai só a URL de pagamento.
 *  2. É o ponto certo para gravar `business_key` e `link_pagamento` no CRM, que
 *     é o que alimenta a régua de recuperação de quem não paga.
 *
 * A tela de sucesso chama isto de forma não-bloqueante: o `businessKey` é
 * gerado pela Cogna DEPOIS da criação da inscrição, então uma fatia das
 * chamadas volta `pending` e precisa ser repetida.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const inscriptionId = body?.inscriptionId
    const cpf = typeof body?.cpf === 'string' ? body.cpf : undefined

    // Só dígitos: o id vem da resposta de criação da Cogna e é sempre numérico.
    // Barra tentativa de usar esta rota para varrer inscrições alheias.
    if (!inscriptionId || !/^\d+$/.test(String(inscriptionId))) {
      return NextResponse.json({ error: 'inscriptionId inválido' }, { status: 400 })
    }

    const result = await resolvePaymentLinkCached(inscriptionId, cpf)

    if (result.status === 'ok') {
      // CRM best-effort: nunca deixar o candidato sem link por causa do Attio.
      // O telefone vem do próprio parceiro, então é o mesmo que identifica o
      // candidato no CRM (a chave lá é o telefone).
      const phone = result.personalData?.phone
      if (phone) {
        try {
          // `paymentUrl` fica DE FORA de propósito para a Cogna.
          //
          // O `checkoutUrl` expira em ~30 minutos ("sua sessão expira em
          // 29:54" na própria tela; links gerados há 1h respondem
          // `400 Link expirado ou inválido`). Gravá-lo no CRM faria a régua de
          // recuperação mandar, horas depois, um link morto — pior do que não
          // mandar nada, porque o candidato clica e vê erro.
          //
          // O que persiste é a `businessKey`: com ela o link é REGERADO na hora
          // do disparo. Para Estácio/YDUQS o `link_pagamento` continua válido,
          // porque lá a URL não expira assim.
          await upsertCandidato({
            phone: String(phone),
            name: result.personalData?.name ?? '',
            email: result.personalData?.email,
            cpf: result.personalData?.cpf,
            inscriptionId,
            businessKey: result.businessKey,
          })
        } catch (attioError) {
          console.error('⚠️ Attio (link de pagamento) falhou:', attioError)
        }
      }

      return NextResponse.json({
        status: 'ok',
        checkoutUrl: result.checkoutUrl,
        checkoutId: result.checkoutId,
      })
    }

    if (result.status === 'already_paid') {
      return NextResponse.json({ status: 'already_paid' })
    }

    if (result.status === 'pending') {
      // 202: a inscrição existe, a chave de cobrança ainda não. O cliente
      // repete; não é erro e não deve virar ruído no error tracking.
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    return NextResponse.json({ status: 'error', message: result.message }, { status: 502 })
  } catch (error) {
    console.error('❌ payment-link falhou:', error)
    return NextResponse.json({ status: 'error', message: 'Erro interno' }, { status: 500 })
  }
}
