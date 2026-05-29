import type { Course } from '@/app/interface/course'

interface NearbyInstitutionsBlockProps {
  cityName: string
  cityState: string
  courseName: string
  offers: Course[]
  fromFallback: boolean
}

// Mapa de brand (slug interno) pra label de exibição.
const BRAND_LABEL: Record<string, string> = {
  anhanguera: 'Anhanguera',
  unopar: 'Unopar',
  pitagoras: 'Pitágoras',
  unime: 'Unime',
  ampli: 'Ampli',
  fama: 'FAMA',
  fapan: 'Fapan',
  uniderp: 'Uniderp',
}

function brandLabel(brand: string | undefined): string {
  if (!brand) return 'Faculdade parceira'
  return BRAND_LABEL[brand.toLowerCase()] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
}

interface CampusEntry {
  unitId?: string
  unitName: string
  brand: string
  address: string
  streetAddress?: string
  district?: string
  postalCode?: string
}

function extractCampuses(offers: Course[]): CampusEntry[] {
  // Dedup por unitId quando disponível, senão por nome+brand+endereço.
  const seen = new Map<string, CampusEntry>()
  for (const o of offers) {
    const unitName = (o.unitName || o.unit || '').trim()
    const brand = (o.brand || '').trim()
    if (!unitName) continue

    const streetParts = [
      o.unitAddress,
      o.unitNumber && `nº ${o.unitNumber}`,
    ].filter((x): x is string => Boolean(x && String(x).trim()))
    const streetAddress = streetParts.join(', ')
    const district = o.unitDistrict?.trim() || undefined
    const postalCode = o.unitPostalCode?.trim() || undefined

    const address = [streetAddress, district].filter(Boolean).join(', ')
    const key = o.unitId || `${brand}|${unitName}|${address}`
    if (!seen.has(key)) {
      seen.set(key, {
        unitId: o.unitId,
        unitName,
        brand,
        address,
        streetAddress: streetAddress || undefined,
        district,
        postalCode,
      })
    }
  }
  return Array.from(seen.values()).slice(0, 12)
}

export default function NearbyInstitutionsBlock({
  cityName,
  cityState,
  courseName,
  offers,
  fromFallback,
}: NearbyInstitutionsBlockProps) {
  // Em fallback nacional, as ofertas não representam polos locais — não emite.
  if (fromFallback || !offers.length) return null

  const campuses = extractCampuses(offers)
  if (campuses.length === 0) return null

  // Schema.org ItemList de EducationalOrganization (sub-orgs das brands
  // parceiras). Permite que Google AIO/AI Overviews liguem cada polo ao
  // brand parent (Anhanguera/Unopar/etc) e à cidade. Sem schema, a lista
  // ranqueia só como texto. Posição é a ordem visual exibida.
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Polos físicos com ${courseName} em ${cityName}-${cityState}`,
    numberOfItems: campuses.length,
    itemListElement: campuses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'EducationalOrganization',
        name: c.unitName,
        ...(c.brand && {
          parentOrganization: {
            '@type': 'EducationalOrganization',
            name: brandLabel(c.brand),
          },
        }),
        address: {
          '@type': 'PostalAddress',
          ...(c.streetAddress && { streetAddress: c.streetAddress }),
          ...(c.district && { addressLocality: `${c.district}, ${cityName}` }),
          ...(!c.district && { addressLocality: cityName }),
          addressRegion: cityState,
          ...(c.postalCode && { postalCode: c.postalCode }),
          addressCountry: 'BR',
        },
      },
    })),
  }

  return (
    <section
      className="bg-paper py-12 md:py-16 border-t border-hairline"
      data-speakable="nearby-institutions"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Polos físicos de faculdades parceiras em {cityName}
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              ({String(campuses.length).padStart(2, '0')})
            </span>
          </div>

          <p className="text-ink-700 text-[14px] leading-relaxed mb-6 max-w-3xl">
            Estas são unidades físicas em <strong>{cityName}-{cityState}</strong>{' '}
            onde faculdades parceiras do Bolsa Click oferecem {courseName} (presencial e
            semipresencial) ou cursos EAD via polo de apoio. Endereços extraídos
            do cadastro vigente das instituições parceiras.
          </p>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border-y border-hairline">
            {campuses.map((c, i) => (
              <li key={c.unitId ?? i} className="bg-white px-5 py-4">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 block mb-1">
                  {brandLabel(c.brand)}
                </span>
                <p className="font-display text-base text-ink-900 leading-tight mb-1">
                  {c.unitName}
                </p>
                {c.address && (
                  <p className="text-ink-700 text-[13px] leading-snug">
                    {c.address}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <p className="font-mono text-[11px] tracking-wide text-ink-500 mt-4">
            Disponibilidade de turno e modalidade varia por polo. Confirme na
            inscrição.
          </p>
        </div>
      </div>
    </section>
  )
}
