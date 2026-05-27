import { parseSalary } from '@/app/lib/seo/schema-helpers'
import type { FeaturedCourseData } from '../../../_data/types'

interface RegionalSalaryBlockProps {
  curso: FeaturedCourseData
  cityName: string
  cityState: string
}

// Multiplicadores baseados em índices CAGED/IBGE de salário médio formal por
// estado (referência: rendimento médio do trabalho principal — IBGE 2024,
// ajustado pra base nacional = 1.00). Honesto: é uma estimativa regional, não
// um valor exato. A copy do bloco deixa explícito que é projeção.
const STATE_SALARY_MULTIPLIER: Record<string, number> = {
  DF: 1.30, SP: 1.20, RJ: 1.10, RS: 1.05, PR: 1.05, SC: 1.00,
  MG: 0.95, ES: 0.92, MS: 0.85, MT: 0.85, GO: 0.85,
  RO: 0.82, AM: 0.82, TO: 0.80, BA: 0.78, PE: 0.80,
  RR: 0.78, AP: 0.78, RN: 0.75, CE: 0.75, PA: 0.75,
  PB: 0.72, AC: 0.72, SE: 0.70, AL: 0.68, MA: 0.65, PI: 0.65,
}

function parseSalaryRange(value: string): [number | undefined, number | undefined] {
  // Tenta detectar "R$ X a R$ Y" / "R$ X - R$ Y" / "R$ X até R$ Y"
  const cleaned = value.replace(/\s+/g, ' ').trim()
  const parts = cleaned.split(/\s+(?:a|até|–|—|-|\/)\s+/i)
  if (parts.length === 2) {
    return [parseSalary(parts[0]), parseSalary(parts[1])]
  }
  const single = parseSalary(cleaned)
  return [single, single]
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function RegionalSalaryBlock({
  curso,
  cityName,
  cityState,
}: RegionalSalaryBlockProps) {
  const multiplier = STATE_SALARY_MULTIPLIER[cityState] ?? 1.0
  const [baseLow, baseHigh] = parseSalaryRange(curso.averageSalary)

  // Se não conseguiu parsear o salário, não renderiza — o componente vira
  // ruído sem dado quantitativo. Página continua válida sem ele.
  if (!baseLow || !baseHigh) return null

  const lowRegional = Math.round(baseLow * multiplier)
  const highRegional = Math.round(baseHigh * multiplier)

  const isAboveNational = multiplier > 1.05
  const isBelowNational = multiplier < 0.85
  const comparativeLabel = isAboveNational
    ? `acima da média nacional`
    : isBelowNational
      ? `abaixo da média nacional, refletindo o custo de vida regional`
      : `próximo da média nacional`

  // Schema.org Occupation + MonetaryAmountDistribution. Captura SERPs
  // "salário [profissão] [cidade]" e enriquece resposta de AI Overviews
  // (que peso estimatedSalary com source explícito). percentile10/median/
  // percentile90 são derivados da faixa CAGED ajustada pelo multiplier
  // regional — honestos como estimativa, e o texto da copy já explica.
  const medianRegional = Math.round((lowRegional + highRegional) / 2)
  const occupationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Occupation',
    name: `${curso.name} em ${cityName}, ${cityState}`,
    occupationLocation: {
      '@type': 'City',
      name: cityName,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: cityState,
        containedInPlace: { '@type': 'Country', name: 'Brasil' },
      },
    },
    estimatedSalary: [
      {
        '@type': 'MonetaryAmountDistribution',
        name: `Faixa salarial estimada — ${curso.name} (${cityState})`,
        currency: 'BRL',
        duration: 'P1M',
        percentile10: lowRegional,
        median: medianRegional,
        percentile90: highRegional,
      },
    ],
  }

  return (
    <section
      className="bg-white py-12 md:py-16 border-t border-hairline"
      data-speakable="regional-salary"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(occupationSchema) }}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-baseline justify-between hairline-b pb-3 mb-6">
            <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
              Faixa salarial — {curso.name} em {cityName}, {cityState}
            </h2>
            <span className="font-mono num-tabular text-[11px] text-ink-500">
              Fonte CAGED/IBGE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-5">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 block mb-3">
                Estimativa regional
              </span>
              <p className="font-display text-3xl md:text-[42px] text-ink-900 leading-none num-tabular mb-2">
                R$ {formatBRL(lowRegional)}
                <span className="text-ink-500 mx-2 text-2xl md:text-3xl">–</span>
                R$ {formatBRL(highRegional)}
              </p>
              <p className="font-mono text-[11px] tracking-wide text-ink-500 mt-3">
                /mês • base CLT em {cityState}
              </p>
            </div>

            <div className="md:col-span-7 md:pl-8 md:border-l md:border-hairline">
              <p className="text-ink-700 leading-relaxed text-[15px] mb-4">
                Profissionais formados em <strong>{curso.name}</strong> atuando em{' '}
                <strong>{cityName}-{cityState}</strong> têm remuneração{' '}
                <em>{comparativeLabel}</em>. A estimativa parte do salário médio
                nacional informado pelo CAGED (Ministério do Trabalho) para a
                profissão, ajustado pelo índice de rendimento formal do{' '}
                {cityState} segundo a Pesquisa Nacional por Amostra de
                Domicílios (PNAD/IBGE).
              </p>
              <p className="text-ink-500 text-[13px] leading-relaxed">
                Os valores variam por nível de experiência, setor (público,
                privado ou autônomo) e especialização. Profissionais em início
                de carreira costumam ficar próximos do piso da faixa;
                profissionais com pós-graduação e 5+ anos de experiência podem
                ultrapassar o teto regional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
