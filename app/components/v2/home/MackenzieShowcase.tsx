import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { CourseOffer } from '../course-offer'
import CourseShelf from './CourseShelf'

/**
 * Destaque da Mackenzie na home: faixa com a marca, três fatos verificados e
 * a prateleira das especializações de pós EAD.
 *
 * Copy SEM promessa de bolsa: as ofertas da Mackenzie não têm desconto hoje
 * (0% medido em InstitutionMaxDiscountCache). Por isso o CTA do card não é
 * "Garantir bolsa" e o card mostra o parcelamento cheio, sem "-X%".
 * Fatos e fontes: comentário do registro `mackenzie` em
 * prisma/seed-institutions.ts (CI 5 em 2023, origem em 1870).
 */
const FACTS = ['Nota máxima no MEC (CI 5)', 'Tradição desde 1870', '100% online, 12 meses'] as const

export default function MackenzieShowcase({ offers }: { offers: CourseOffer[] }) {
  // Sem oferta, não há o que destacar — melhor sumir do que mostrar faixa vazia.
  if (offers.length === 0) return null

  return (
    <section aria-label="Pós-graduação Mackenzie" className="bg-paper pt-6">
      <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-[#DA0118]/15 bg-white">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[#DA0118]" />
          <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <Image
                src="/assets/logo-mackenzie.png"
                alt="Logo da Universidade Presbiteriana Mackenzie"
                width={72}
                height={60}
                className="h-14 w-auto shrink-0 object-contain sm:h-16"
              />
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#DA0118]">
                  Novidade no Bolsa Click
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink-900 sm:text-3xl">
                  Pós-graduação Mackenzie
                </h2>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-700">
                  {FACTS.map((fact) => (
                    <li key={fact} className="flex items-center gap-1.5">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#DA0118]" />
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href="/faculdades/mackenzie"
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 self-start rounded-xl border border-[#DA0118] px-4 text-[14px] font-bold text-[#DA0118] transition-colors hover:bg-[#DA0118] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA0118] focus-visible:ring-offset-2 md:self-center"
            >
              Ver todas as especializações
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <CourseShelf
        headingId="shelf-mackenzie"
        title="Especializações Mackenzie"
        subtitle="Preço real da instituição, parcelado — veja o valor antes de se inscrever."
        offers={offers}
        ctaLabel="Quero me inscrever"
      />
    </section>
  )
}
