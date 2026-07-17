import Link from 'next/link'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import type { Course } from '@/app/interface/course'

interface Props {
  /** Slug do primeiro curso a comparar. Default: 'administracao'. */
  cursoA?: { slug: string; nome: string; query: string }
  /** Slug do segundo curso a comparar. Default: 'pedagogia'. */
  cursoB?: { slug: string; nome: string; query: string }
  /** Quantas ofertas por coluna. Default 3. */
  perCurso?: number
}

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function modalityLabel(m: string) {
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

async function getTopOffers(query: string, take: number): Promise<Course[]> {
  try {
    const res = await getShowFiltersCourses(
      query,
      undefined,
      undefined,
      'EAD',
      'GRADUACAO',
      1,
      Math.max(take * 3, 10),
    )
    const list = (res?.data ?? []) as Course[]
    return list
      .filter(c => (c.minPrice ?? 0) > 0)
      .sort((a, b) => (a.minPrice ?? 0) - (b.minPrice ?? 0))
      .slice(0, take)
  } catch (err) {
    console.error('ComparadorCursos — falha na API tartarus:', err)
    return []
  }
}

function OfferList({ offers, slug }: { offers: Course[]; slug: string }) {
  if (offers.length === 0) {
    return (
      <p className="text-ink-500 text-sm leading-relaxed">
        Ofertas em atualização. Veja outras opções de bolsa{' '}
        <Link
          href={`/cursos/${slug}`}
          className="underline decoration-1 underline-offset-4"
        >
          na página completa do curso
        </Link>
        .
      </p>
    )
  }

  return (
    <ul className="space-y-px bg-hairline">
      {offers.map((o, i) => {
        const min = o.minPrice || 0
        const max = o.maxPrice
        const pct = discountPct(min, max)
        const cityLabel = o.unitCity || o.city || '—'
        const stateLabel = o.unitState || o.uf || ''
        return (
          <li
            key={`${o.id}-${i}`}
            className="bg-paper p-4 grid grid-cols-[1fr_auto] gap-3 items-baseline"
          >
            <div>
              <p className="font-display text-ink-900 text-base leading-tight">
                {o.brand || '—'}
              </p>
              <p className="text-ink-500 text-xs mt-1">
                {modalityLabel(o.modality)}
                {cityLabel !== '—' ? ` · ${cityLabel}${stateLabel ? `/${stateLabel}` : ''}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display num-tabular text-lg text-ink-900">
                R$ {formatBRL(min)}
              </p>
              {pct && (
                <p className="font-mono text-[10px] tracking-wider uppercase text-bolsa-secondary num-tabular">
                  {pct}% off
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default async function ComparadorCursos({
  cursoA = { slug: 'administracao', nome: 'Administração', query: 'administracao' },
  cursoB = { slug: 'pedagogia', nome: 'Pedagogia', query: 'pedagogia' },
  perCurso = 3,
}: Props = {}) {
  const [offersA, offersB] = await Promise.all([
    getTopOffers(cursoA.query, perCurso),
    getTopOffers(cursoB.query, perCurso),
  ])

  // Se ambas as APIs falharem, degrada silenciosamente.
  if (offersA.length === 0 && offersB.length === 0) return null

  return (
    <section
      id="comparador-cursos"
      className="bg-white py-12 md:py-16 border-b border-hairline"
      data-speakable="comparador"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 max-w-3xl">
            Compare cursos EAD com bolsa lado a lado
          </h2>
          <span className="font-mono num-tabular text-[11px] text-ink-500 shrink-0">(02)</span>
        </div>

        <p className="text-ink-700 leading-relaxed mb-8 max-w-3xl">
          Mensalidade real com bolsa nas faculdades parceiras, mostrando as ofertas mais
          econômicas hoje. Use como referência pra decidir entre dois cursos populares antes
          de escolher modalidade e cidade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <div className="hairline-b pb-2 mb-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl text-ink-900">{cursoA.nome} EAD</h3>
              <span className="font-mono text-[10px] tracking-wider uppercase text-ink-500">
                {offersA.length} {offersA.length === 1 ? 'oferta' : 'ofertas'}
              </span>
            </div>
            <OfferList offers={offersA} slug={cursoA.slug} />
            {offersA.length > 0 && (
              <Link
                href={`/cursos/${cursoA.slug}`}
                className="block mt-4 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-900 underline decoration-1 underline-offset-4 hover:text-ink-700"
              >
                Ver todas as ofertas de {cursoA.nome} →
              </Link>
            )}
          </div>

          <div>
            <div className="hairline-b pb-2 mb-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl text-ink-900">{cursoB.nome} EAD</h3>
              <span className="font-mono text-[10px] tracking-wider uppercase text-ink-500">
                {offersB.length} {offersB.length === 1 ? 'oferta' : 'ofertas'}
              </span>
            </div>
            <OfferList offers={offersB} slug={cursoB.slug} />
            {offersB.length > 0 && (
              <Link
                href={`/cursos/${cursoB.slug}`}
                className="block mt-4 font-mono text-[11px] tracking-[0.18em] uppercase text-ink-900 underline decoration-1 underline-offset-4 hover:text-ink-700"
              >
                Ver todas as ofertas de {cursoB.nome} →
              </Link>
            )}
          </div>
        </div>

        <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 mt-8">
          Preços vindos do catálogo Bolsa Click em tempo real · valores podem variar por turma e
          campanha vigente.
        </p>
      </div>
    </section>
  )
}
