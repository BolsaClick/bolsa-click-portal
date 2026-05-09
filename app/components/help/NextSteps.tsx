import Link from 'next/link'

interface NextStep {
  title: string
  description: string
  href: string
}

interface NextStepsProps {
  steps: NextStep[]
}

export function NextSteps({ steps }: NextStepsProps) {
  return (
    <aside className="not-prose my-10">
      <div className="flex items-baseline justify-between hairline-b pb-3 mb-4">
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
          Próximos passos
        </span>
        <span className="font-mono num-tabular text-[11px] text-ink-500">
          ({String(steps.length).padStart(2, '0')})
        </span>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline rounded-2xl overflow-hidden">
        {steps.map((step, index) => (
          <li key={index} className="bg-white">
            <Link
              href={step.href}
              className="group flex items-start gap-4 h-full px-5 py-5 transition-colors duration-200 hover:bg-paper-warm"
            >
              <span className="font-display num-tabular text-3xl text-ink-100 leading-none flex-shrink-0 group-hover:text-bolsa-secondary/70 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg text-ink-900 leading-snug mb-1 group-hover:italic transition-all duration-200">
                  {step.title}
                </span>
                <span className="block text-[13px] text-ink-500 leading-relaxed">
                  {step.description}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-ink-300 group-hover:text-bolsa-secondary group-hover:translate-x-1 transition-all duration-300 mt-1 flex-shrink-0"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  )
}
