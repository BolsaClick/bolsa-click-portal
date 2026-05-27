import { cache } from 'react'
import { prisma } from '@/app/lib/prisma'

interface LocalDemandBlockProps {
  featuredCourseId: string
  courseName: string
  cityName: string
  cityState: string
  localOfferCount: number
  localMinPrice: number | null
}

interface NationalDemandStats {
  citiesWithOffers: number
  citiesScanned: number
  medianMinPrice: number | null
  topCityCount: number
}

// Lê a agregação do cache CityCourseOfferCache pro curso. Cacheado por React
// pra dedupe entre múltiplos renders no mesmo request.
const getNationalDemand = cache(async (featuredCourseId: string): Promise<NationalDemandStats | null> => {
  try {
    const rows = await prisma.cityCourseOfferCache.findMany({
      where: { featuredCourseId },
      select: { offerCount: true, minPrice: true },
    })
    if (rows.length === 0) return null

    const withOffers = rows.filter((r) => r.offerCount > 0)
    const prices = withOffers
      .map((r) => r.minPrice)
      .filter((p): p is number => p != null && p > 0)
      .sort((a, b) => a - b)
    const median = prices.length
      ? prices[Math.floor(prices.length / 2)]
      : null

    return {
      citiesWithOffers: withOffers.length,
      citiesScanned: rows.length,
      medianMinPrice: median,
      topCityCount: Math.max(...rows.map((r) => r.offerCount)),
    }
  } catch (err) {
    console.error('[LocalDemandBlock] erro Prisma:', err)
    return null
  }
})

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default async function LocalDemandBlock({
  featuredCourseId,
  courseName,
  cityName,
  cityState,
  localOfferCount,
  localMinPrice,
}: LocalDemandBlockProps) {
  const national = await getNationalDemand(featuredCourseId)

  // Sem cache ainda populado → não emite. O bloco só agrega valor quando
  // tem o comparativo nacional.
  if (!national || national.citiesScanned === 0) return null

  const localPercentile =
    national.topCityCount > 0
      ? Math.round((localOfferCount / national.topCityCount) * 100)
      : 0
  const cityIsHub = localOfferCount >= Math.max(2, national.topCityCount * 0.5)

  return (
    <section
      className="bg-white py-12 md:py-16 border-t border-hairline"
      data-speakable="local-demand"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Disponibilidade de bolsa — {courseName} em {cityName}
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              snapshot atual
            </span>
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border-y border-hairline">
            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-2">
                Em {cityName}
              </dt>
              <dd className="font-display num-tabular text-2xl text-ink-900 leading-none">
                {localOfferCount > 0 ? `${localOfferCount}+` : '—'}
              </dd>
              <dd className="font-mono text-[11px] text-ink-500 mt-1">
                ofertas com bolsa
              </dd>
            </div>

            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-2">
                A partir de
              </dt>
              <dd className="font-display num-tabular text-2xl text-ink-900 leading-none">
                {localMinPrice
                  ? <>R$ {formatBRL(localMinPrice)}</>
                  : '—'}
              </dd>
              <dd className="font-mono text-[11px] text-ink-500 mt-1">
                /mês com bolsa
              </dd>
            </div>

            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-2">
                No Brasil
              </dt>
              <dd className="font-display num-tabular text-2xl text-ink-900 leading-none">
                {national.citiesWithOffers}
              </dd>
              <dd className="font-mono text-[11px] text-ink-500 mt-1">
                cidades com oferta
              </dd>
            </div>

            <div className="bg-white px-5 py-5">
              <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-2">
                Mediana nacional
              </dt>
              <dd className="font-display num-tabular text-2xl text-ink-900 leading-none">
                {national.medianMinPrice
                  ? <>R$ {formatBRL(national.medianMinPrice)}</>
                  : '—'}
              </dd>
              <dd className="font-mono text-[11px] text-ink-500 mt-1">
                preço c/ bolsa
              </dd>
            </div>
          </dl>

          {(cityIsHub || localOfferCount === 0) && (
            <p className="text-ink-700 leading-relaxed text-[14px] mt-6 max-w-3xl">
              {cityIsHub
                ? `${cityName} é um dos hubs do Bolsa Click pra ${courseName} — concentra ${localPercentile}% da oferta máxima nacional observada no snapshot atual. A presença de polos físicos e a disponibilidade de bolsas tende a ser maior em comparação a cidades menores do mesmo estado.`
                : `No momento, ${cityName} aparece com baixa oferta presencial pra ${courseName}. A modalidade EAD continua amplamente disponível e é a alternativa mais usada por estudantes locais — você cursa de qualquer cidade do Brasil com diploma reconhecido pelo MEC.`}
            </p>
          )}

          <p className="font-mono text-[11px] tracking-wide text-ink-500 mt-4">
            Snapshot extraído da API de catálogo das faculdades parceiras.
            Atualizado semanalmente. {cityState && `Cobertura validada em ${national.citiesScanned} municípios brasileiros.`}
          </p>
        </div>
      </div>
    </section>
  )
}
