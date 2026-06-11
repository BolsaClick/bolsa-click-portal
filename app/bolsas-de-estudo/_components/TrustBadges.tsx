import { getStaticTrustData } from '@/app/lib/trust'

const currentYear = new Date().getFullYear()

export default function TrustBadges() {
  const { foundingYear, partnerBrandNames, partnerGroupLabel } = getStaticTrustData()
  const yearsOperating = Math.max(1, currentYear - foundingYear)

  return (
    <section
      aria-label="Sinais de confiança"
      className="bg-paper border-b border-hairline py-6 md:py-8"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-hairline">
          <li className="bg-paper px-5 py-4">
            <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-1">
              Reconhecimento oficial
            </span>
            <p className="text-sm text-ink-700 leading-snug">
              Faculdades parceiras{' '}
              <strong className="text-ink-900">reconhecidas pelo MEC</strong> —
              consulte em{' '}
              <a
                href="https://emec.mec.gov.br"
                rel="nofollow noopener"
                target="_blank"
                className="underline decoration-1 underline-offset-4"
              >
                e-mec.mec.gov.br
              </a>
            </p>
          </li>
          <li className="bg-paper px-5 py-4">
            <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-1">
              Parceiros institucionais
            </span>
            <p className="text-sm text-ink-700 leading-snug">
              <strong className="text-ink-900">{partnerBrandNames.join(', ')}</strong>
              {' '}— marcas dos {partnerGroupLabel}
            </p>
          </li>
          <li className="bg-paper px-5 py-4">
            <span className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 mb-1">
              Operação
            </span>
            <p className="text-sm text-ink-700 leading-snug">
              Plataforma operando desde{' '}
              <strong className="text-ink-900">{foundingYear}</strong>
              {yearsOperating > 1 && ` (${yearsOperating} anos)`}
            </p>
          </li>
        </ul>
      </div>
    </section>
  )
}
