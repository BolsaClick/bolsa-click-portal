import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { isPartner, brandColorFor, institutionSlugFor } from '../../_shared/partners'
import { CAMPAIGN_CHARGE_AMOUNT_CENTS } from '@/app/lib/checkout/campaign-charge'
import CampaignCheckoutClient from './CampaignCheckoutClient'

export const metadata: Metadata = {
  title: 'Finalizar inscrição',
  robots: { index: false, follow: false },
}

// Sem isso a página seria prerenderizada estaticamente no build — mesmo
// motivo de app/checkout/estacio/page.tsx.
export const dynamic = 'force-dynamic'

/**
 * Checkout pago da campanha ingressa.digital (Cogna/Anhanguera e demais
 * marcas Cogna do domínio, SÓ app/lp/**): cobra R$ 58,90 (PIX/cartão) ANTES
 * de criar a inscrição — ver app/lib/checkout/confirm-campaign.ts.
 */
export default async function CampaignCheckoutPage({
  params,
}: {
  params: Promise<{ partner: string }>
}) {
  const { partner } = await params
  if (!isPartner(partner)) notFound()

  const inst = await prisma.institution.findUnique({ where: { slug: institutionSlugFor(partner) } })
  if (!inst || !inst.isActive) notFound()

  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      {/* O valor desce daqui (server) pra tela nunca exibir um número
          diferente do que o servidor cobra — ver campaign-charge.ts. */}
      <CampaignCheckoutClient
        partner={partner}
        partnerName={inst.name}
        brandColor={brandColorFor(partner)}
        amountInCents={CAMPAIGN_CHARGE_AMOUNT_CENTS}
      />
    </Suspense>
  )
}
