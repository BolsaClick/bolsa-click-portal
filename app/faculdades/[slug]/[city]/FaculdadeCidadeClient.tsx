'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Institution } from '@prisma/client'
import type { Course } from '@/app/interface/course'

interface UnitInfo {
  unitName: string
  unitAddress?: string
  modality: string
}

interface Props {
  institution: Institution
  cityName: string
  cityState: string
  offers: Course[]
  units: UnitInfo[]
  otherCities: { name: string; state: string; slug: string }[]
  fromFallback: boolean
}

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const modalityLabel = (m: string) => {
  const upper = (m || '').toUpperCase()
  if (upper === 'EAD') return 'EAD'
  if (upper === 'SEMIPRESENCIAL') return 'Semipresencial'
  if (upper === 'PRESENCIAL') return 'Presencial'
  return m || '—'
}

function discountPct(min: number, max?: number) {
  if (!max || max <= min) return null
  // floor: o % exibido nunca é maior que o desconto real (transparência)
  return Math.floor(((max - min) / max) * 100)
}

export default function FaculdadeCidadeClient({
  institution,
  cityName,
  cityState,
  offers,
  units,
  otherCities,
  fromFallback,
}: Props) {
  const prices = offers.map((o) => o.minPrice || 0).filter((p) => p > 0)
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0

  const logoSrc = institution.logoUrl.startsWith('http') ? institution.logoUrl : institution.logoUrl
  const heroImg = institution.imageUrl

  return (
    <main className="bg-paper">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] uppercase text-ink-500 flex-wrap">
            <li><Link href="/" className="hover:text-ink-900">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/faculdades" className="hover:text-ink-900">Faculdades</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/faculdades/${institution.slug}`} className="hover:text-ink-900">{institution.name}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink-900">{cityName}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-hairline">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-hairline bg-white">
                  <Image
                    src={logoSrc}
                    alt={`${institution.name} logo`}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>
                <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
                  Faculdade {institution.name} · {cityName}/{cityState}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-ink-900 leading-[1.05] tracking-tight">
                {institution.name} em {cityName}
              </h1>
              <p className="mt-5 text-lg md:text-xl text-ink-700 max-w-3xl leading-relaxed">
                {fromFallback
                  ? `Veja como funciona a ${institution.name} em ${cityName}-${cityState} e como conseguir bolsa de estudo de até 80%.`
                  : `${offers.length} ${offers.length === 1 ? 'curso disponível' : 'cursos disponíveis'} na ${institution.name} em ${cityName}-${cityState}, com bolsa de até 80% pelo Bolsa Click. ${units.length > 0 ? `${units.length} ${units.length === 1 ? 'polo' : 'polos'} físicos identificados.` : 'Cursos presenciais, EAD e semipresenciais.'}`}
              </p>

              {!fromFallback && (
                <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-hairline border border-hairline max-w-3xl">
                  <div className="bg-white px-4 py-3">
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Cursos</dt>
                    <dd className="mt-1 font-display num-tabular text-xl text-ink-900">{offers.length}</dd>
                  </div>
                  <div className="bg-white px-4 py-3">
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Polos</dt>
                    <dd className="mt-1 font-display num-tabular text-xl text-ink-900">{units.length}</dd>
                  </div>
                  <div className="bg-white px-4 py-3">
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">A partir de</dt>
                    <dd className="mt-1 font-display num-tabular text-xl text-ink-900">{lowPrice > 0 ? `R$ ${formatBRL(lowPrice)}` : '—'}</dd>
                  </div>
                  <div className="bg-white px-4 py-3">
                    <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">Bolsa até</dt>
                    <dd className="mt-1 font-display num-tabular text-xl text-bolsa-secondary">80%</dd>
                  </div>
                </dl>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/curso/resultado?brand=${encodeURIComponent(institution.name)}&city=${encodeURIComponent(cityName)}`}
                  className="inline-flex items-center gap-2 border border-ink-900 bg-ink-900 px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-white hover:bg-bolsa-secondary hover:border-bolsa-secondary transition-colors"
                >
                  Ver bolsas {institution.name} {cityName} →
                </Link>
                <Link
                  href={`/faculdades/${institution.slug}`}
                  className="inline-flex items-center gap-2 border border-ink-900 bg-white px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-900 hover:bg-paper transition-colors"
                >
                  Sobre a {institution.name}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-hairline bg-paper">
                <Image
                  src={heroImg}
                  alt={institution.imageAlt || `${institution.name} em ${cityName}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabela de cursos disponíveis */}
      {!fromFallback && offers.length > 0 && (
        <section className="bg-white border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  Cursos {institution.name} em {cityName}
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(offers.length).padStart(2, '0')})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <caption className="sr-only">
                    Cursos oferecidos pela {institution.name} em {cityName}, com modalidade, polo, mensalidade com bolsa e desconto.
                  </caption>
                  <thead>
                    <tr className="border-b border-hairline">
                      <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Curso</th>
                      <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Modalidade</th>
                      <th scope="col" className="text-left py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Polo</th>
                      <th scope="col" className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Mensalidade c/ bolsa</th>
                      <th scope="col" className="text-right py-3 px-3 font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">Desconto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.slice(0, 24).map((o, i) => {
                      const min = o.minPrice || 0
                      const max = o.maxPrice
                      const pct = discountPct(min, max)
                      return (
                        <tr key={`${o.id}-${i}`} className="border-b border-hairline/60 hover:bg-paper">
                          <td className="py-3 px-3 text-ink-900">{o.name || '—'}</td>
                          <td className="py-3 px-3 text-ink-700">{modalityLabel(o.modality)}</td>
                          <td className="py-3 px-3 text-ink-700">{o.unitName || o.unit || '—'}</td>
                          <td className="py-3 px-3 text-right num-tabular text-ink-900">
                            {min > 0 ? `R$ ${formatBRL(min)}` : '—'}
                          </td>
                          <td className="py-3 px-3 text-right num-tabular text-bolsa-secondary">
                            {pct ? `${pct}%` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {offers.length > 24 && (
                <p className="mt-4 font-mono text-[11px] text-ink-500">
                  Mostrando 24 de {offers.length} cursos. Veja a lista completa após inscrição.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Polos físicos */}
      {!fromFallback && units.length > 0 && (
        <section className="bg-paper border-b border-hairline py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  Polos {institution.name} em {cityName}
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(units.length).padStart(2, '0')})
                </span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
                {units.map((u, i) => (
                  <li key={i} className="bg-white px-5 py-5">
                    <p className="font-display text-lg text-ink-900">{u.unitName}</p>
                    {u.unitAddress && (
                      <p className="mt-2 text-sm text-ink-700">{u.unitAddress}</p>
                    )}
                    <span className="mt-2 inline-flex items-center font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500">
                      {modalityLabel(u.modality)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* FAQ visível */}
      <section className="bg-white border-b border-hairline py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl text-ink-900 mb-8">
            Perguntas frequentes sobre {institution.name} em {cityName}
          </h2>
          <div className="divide-y divide-hairline border-y border-hairline">
            {[
              {
                q: `Quais cursos a ${institution.name} oferece em ${cityName}?`,
                a: fromFallback
                  ? `A ${institution.name} oferece cursos de graduação e pós-graduação nas modalidades presencial, EAD e semipresencial. Consulte o catálogo completo no Bolsa Click pra encontrar o curso ideal pra você.`
                  : `A ${institution.name} oferece ${offers.length} cursos em ${cityName} pelo Bolsa Click. Principais cursos disponíveis: ${offers.slice(0, 8).map((o) => o.name).join(', ')}.`,
              },
              {
                q: `Quanto custa a ${institution.name} em ${cityName}?`,
                a: lowPrice > 0
                  ? `As mensalidades começam em R$ ${formatBRL(lowPrice)} com bolsa pelo Bolsa Click, com descontos de até 80%. O valor varia conforme o curso e a modalidade escolhida.`
                  : `As mensalidades variam por curso e modalidade. Pelo Bolsa Click, você consegue bolsa de até 80% em qualquer curso disponível na ${institution.name}.`,
              },
              {
                q: `A ${institution.name} em ${cityName} é EAD ou presencial?`,
                a: `A ${institution.name} em ${cityName} tem cursos em diferentes modalidades — presencial em polos físicos, EAD com encontros virtuais, e semipresencial combinando os dois.${units.length > 0 ? ` Atualmente identificamos ${units.length} ${units.length === 1 ? 'polo' : 'polos'} físicos na cidade.` : ''}`,
              },
              {
                q: `Como me inscrever na ${institution.name} em ${cityName}?`,
                a: `A inscrição é totalmente gratuita pelo Bolsa Click. Escolha o curso, compare as ofertas disponíveis, garanta sua bolsa de até 80% e faça matrícula direto pelo site, sem custo de processo seletivo.`,
              },
            ].map((item, i) => (
              <details key={i} className="group py-5">
                <summary className="flex items-baseline justify-between cursor-pointer list-none gap-6">
                  <h3 className="font-display text-lg md:text-xl text-ink-900 group-open:italic">{item.q}</h3>
                  <span className="font-mono text-xs text-ink-500 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-ink-700 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Outras cidades */}
      {otherCities.length > 0 && (
        <section className="bg-paper py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
                <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
                  {institution.name} em outras cidades
                </h2>
                <span className="font-mono num-tabular text-[11px] text-ink-500">
                  ({String(otherCities.length).padStart(2, '0')})
                </span>
              </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-hairline">
                {otherCities.map((c) => (
                  <li key={c.slug} className="bg-white">
                    <Link
                      href={`/faculdades/${institution.slug}/${c.slug}`}
                      className="block px-4 py-3 transition-colors hover:bg-paper-warm"
                    >
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500">
                        {c.state}
                      </span>
                      <span className="block font-display text-base text-ink-900">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
