import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/app/lib/prisma'
import { isPartner, institutionSlugFor } from '../../../_shared/partners'
import CampaignSuccessClient from './CampaignSuccessClient'

export const metadata: Metadata = {
  title: 'Inscrição confirmada',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CampaignCheckoutSuccessPage({
  params,
}: {
  params: Promise<{ partner: string }>
}) {
  const { partner } = await params
  if (!isPartner(partner)) notFound()

  const inst = await prisma.institution.findUnique({ where: { slug: institutionSlugFor(partner) } })
  if (!inst) notFound()

  return (
    <Suspense fallback={<div className="pb-10 pt-24 text-center text-gray-500">Carregando...</div>}>
      <CampaignSuccessClient partner={partner} partnerName={inst.name} />
    </Suspense>
  )
}
