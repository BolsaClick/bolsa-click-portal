'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Mascot from '@/app/components/v2/mascot/Mascot'
import PaymentLinkCard from '@/app/checkout/matricula/sucesso/PaymentLinkCard'

interface Props {
  partner: string
  partnerName: string
}

/**
 * Tela de sucesso do checkout pago da campanha. Não mostra PIX/cartão de
 * novo — o pagamento de R$ 58,90 já foi confirmado antes de chegar aqui (ver
 * confirm-campaign.ts). Quando a inscrição tem id, reaproveita o mesmo
 * PaymentLinkCard do checkout principal (passo 7 — link de pagamento da
 * Cogna) como PRÓXIMO passo: a mensalidade do curso, que é cobrada
 * separadamente pela instituição, nunca confundida com a taxa já paga aqui.
 */
export default function CampaignSuccessClient({ partner, partnerName }: Props) {
  const searchParams = useSearchParams()
  const course = searchParams.get('course')
  const inscriptionId = searchParams.get('inscriptionId')

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12 md:py-16">
      <div className="rounded-2xl border border-hairline bg-white p-6 text-center md:p-8">
        <Mascot pose="comemorando" size={120} alt="Bob, o mascote do Bolsa Click, comemorando" className="mx-auto mb-4" />
        <h1 className="font-display text-2xl font-semibold text-ink-900">Pagamento confirmado</h1>
        <p className="mt-2 text-sm text-ink-700">
          Sua taxa de garantia de vaga foi paga e sua inscrição{course ? ` em ${course}` : ''} na {partnerName} foi
          registrada.
        </p>
      </div>

      {inscriptionId ? (
        <div className="mt-6">
          <p className="mb-3 text-center text-[13px] text-ink-500">
            Próximo passo: a mensalidade do curso é paga direto para a {partnerName}.
          </p>
          <PaymentLinkCard inscriptionId={inscriptionId} />
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
          Sua inscrição está sendo processada. Nosso time envia os próximos passos por WhatsApp e e-mail.
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href={`/lp/${partner}`} className="text-[13px] text-ink-500 hover:text-ink-900 hover:underline">
          Voltar para {partnerName}
        </Link>
      </div>
    </div>
  )
}
